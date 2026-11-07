import json
import tempfile
import unittest
from pathlib import Path

from assetlib.http import HttpError, redact
from assetlib.library import Library
from assetlib.models import Scene
from assetlib.pipeline import Pipeline
from assetlib.sources import build_sources
from helpers import FakeHttp, png_bytes

API = "https://commons.wikimedia.org/w/api.php"


def page(pid, title, lic="Public domain", w=3000, h=2000, desc="Lesotho mountain landscape", url=None, extra=None):
    em = {"LicenseShortName": {"value": lic}, "Artist": {"value": "Someone"}, "ImageDescription": {"value": desc},
          "DateTimeOriginal": {"value": "2015"}}
    em.update(extra or {})
    return {"pageid": pid, "title": f"File:{title}", "imageinfo": [{
        "url": url or f"https://upload.example/{pid}.png", "descriptionurl": f"https://commons.wikimedia.org/wiki/File:{pid}",
        "width": w, "height": h, "mime": "image/png", "mediatype": "BITMAP", "extmetadata": em}]}


def scene(**kw):
    base = dict(id="s01", title="Mountains", media_preference="image", sources=["commons"], queries={"*": ["maloti"]},
                must=[["lesotho", "maloti"]], min_height=1080, clips_needed=1)
    base.update(kw)
    return Scene.from_dict(base)


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.lib = Library(Path(self.tmp.name) / "lib")

    def tearDown(self):
        self.tmp.cleanup()

    def pipe(self, pages, files=None):
        http = FakeHttp({API: {"query": {"pages": {str(p["pageid"]): p for p in pages}}} if pages else {}}, files or {})
        return Pipeline(build_sources(http, {}), self.lib, http), http

    def good_files(self, *ids, w=3000, h=2000):
        return {f"https://upload.example/{i}.png": (png_bytes(w, h) + bytes([i]), "image/png") for i in ids}

    def test_fills_scene_downloads_and_writes_sidecar_map(self):
        pipe, http = self.pipe([page(1, "Maloti ridge")], self.good_files(1))
        r = pipe.acquire(scene())
        self.assertEqual(r["status"], "filled")
        m = self.lib.load_map()["scenes"]["s01"]
        self.assertEqual(m["status"], "filled")
        f = self.lib.root / m["assets"][0]["file"]
        self.assertTrue(f.exists() and f.name.startswith("s01_maloti-ridge_commons-1"))
        meta = json.loads(Path(str(f) + ".json").read_text())
        for k in ("original_url", "creator", "title"):
            self.assertTrue(meta["provenance"][k])
        self.assertEqual(meta["license"]["name"], "Public domain")
        self.assertEqual(meta["license"]["youtube_monetization"], "yes")
        self.assertTrue(meta["asset"]["dimensions_verified"])
        self.assertEqual(meta["asset"]["width"], 3000)
        self.assertEqual(self.lib.validate(), [])

    def test_no_results_is_reported_never_substituted(self):
        pipe, http = self.pipe([])
        r = pipe.acquire(scene(ai_prompt="a prompt"))
        self.assertEqual(r["status"], "unfilled")
        m = self.lib.load_map()["scenes"]["s01"]
        self.assertEqual(m["assets"] if "assets" in m else [], [])
        self.assertTrue(m["suggestions"])
        self.assertTrue(m["ai_fallback"]["allowed_as_last_resort"])
        self.assertEqual(http.downloads, [])

    def test_unrelated_asset_is_not_auto_accepted(self):
        pipe, http = self.pipe([page(2, "Eiffel tower", desc="Paris tower at night")], self.good_files(2))
        r = pipe.acquire(scene())
        self.assertNotEqual(r["status"], "filled")
        self.assertEqual(http.downloads, [])

    def test_blocked_license_never_downloaded(self):
        pipe, http = self.pipe([page(3, "Maloti NC", lic="CC BY-NC 4.0")], self.good_files(3))
        r = pipe.acquire(scene())
        self.assertEqual(r["status"], "unfilled")
        self.assertEqual(http.downloads, [])

    def test_unconfirmed_license_goes_to_review_not_download(self):
        pipe, http = self.pipe([page(4, "Maloti SA", lic="CC BY-SA 4.0")], self.good_files(4))
        r = pipe.acquire(scene())
        self.assertEqual(r["status"], "needs_review")
        self.assertEqual(http.downloads, [])

    def test_low_resolution_metadata_rejected(self):
        pipe, http = self.pipe([page(5, "Maloti small", w=800, h=600)], self.good_files(5, w=800, h=600))
        self.assertEqual(pipe.acquire(scene())["status"], "unfilled")
        self.assertEqual(http.downloads, [])

    def test_downloaded_file_smaller_than_advertised_is_discarded(self):
        pipe, http = self.pipe([page(6, "Maloti liar", w=3000, h=2000)], self.good_files(6, w=640, h=480))
        r = pipe.acquire(scene())
        self.assertNotEqual(r["status"], "filled")
        self.assertEqual(list((self.lib.root / "s01").glob("*")) if (self.lib.root / "s01").exists() else [], [])

    def test_html_response_is_not_stored_as_media(self):
        pipe, _ = self.pipe([page(7, "Maloti html")], {"https://upload.example/7.png": (b"<html>login</html>", "text/html")})
        self.assertNotEqual(pipe.acquire(scene())["status"], "filled")
        self.assertEqual(self.lib.validate(), [])

    def test_same_asset_not_reused_in_another_scene(self):
        pipe, http = self.pipe([page(8, "Maloti one")], self.good_files(8))
        self.assertEqual(pipe.acquire(scene())["status"], "filled")
        r = pipe.acquire(scene(id="s02"))
        self.assertEqual(r["status"], "unfilled")
        cand = json.loads((self.lib.root / "candidates" / "s02.json").read_text())
        self.assertIn("already used in scene s01", cand["rejected"][0]["why"])

    def test_identical_bytes_from_another_listing_rejected(self):
        files = self.good_files(9)
        files["https://upload.example/10.png"] = files["https://upload.example/9.png"]
        pipe, _ = self.pipe([page(9, "Maloti a")], files)
        pipe.acquire(scene())
        pipe2, _ = self.pipe([page(10, "Maloti b")], files)
        r = pipe2.acquire(scene(id="s02"))
        self.assertNotEqual(r["status"], "filled")

    def test_dry_run_downloads_nothing(self):
        pipe, http = self.pipe([page(11, "Maloti dry")], self.good_files(11))
        r = pipe.acquire(scene(), download=False)
        self.assertEqual(r["status"], "would-fill")
        self.assertEqual(http.downloads, [])

    def test_source_error_is_logged_not_swallowed(self):
        http = FakeHttp({API: HttpError(429, API)})
        pipe = Pipeline(build_sources(http, {}), self.lib, http)
        pipe.acquire(scene())
        log = self.lib.load_map()["scenes"]["s01"]["search_log"]
        self.assertEqual(log[0]["status"], "error")
        self.assertIn("429", log[0]["error"])

    def test_missing_key_reported_as_skipped(self):
        http = FakeHttp()
        pipe = Pipeline(build_sources(http, {}), self.lib, http)
        pipe.acquire(scene(sources=["pexels"], media_preference="video", queries={"*": ["maloti"]}))
        m = self.lib.load_map()["scenes"]["s01"]
        self.assertEqual(m["search_log"][0]["status"], "skipped")
        self.assertTrue(any("PEXELS_API_KEY" in t for t in m["suggestions"]))

    def test_build_scene_is_not_sourced(self):
        pipe, http = self.pipe([])
        r = pipe.acquire(Scene.from_dict({"id": "m1", "title": "map", "asset_mode": "build", "spec_ref": "M1"}))
        self.assertEqual(r["status"], "build")
        self.assertEqual(http.calls, [])

    def test_historic_scene_rejects_wrong_period(self):
        p = page(12, "Basutoland street", desc="Basutoland street scene")
        p["imageinfo"][0]["extmetadata"]["DateTimeOriginal"] = {"value": "1975"}
        pipe, http = self.pipe([p], self.good_files(12))
        r = pipe.acquire(scene(must=[["basutoland"]], year_range=[1860, 1900], min_height=720))
        self.assertEqual(r["status"], "unfilled")

    def test_historic_without_date_needs_review(self):
        p = page(13, "Basutoland chief", desc="Basutoland chief portrait")
        p["imageinfo"][0]["extmetadata"].pop("DateTimeOriginal")
        pipe, http = self.pipe([p], self.good_files(13))
        r = pipe.acquire(scene(must=[["basutoland"]], year_range=[1860, 1900], min_height=720))
        self.assertEqual(r["status"], "needs_review")


class SecretHandlingTests(unittest.TestCase):
    def test_redact(self):
        self.assertNotIn("SECRET", redact("https://x/api?key=SECRET&q=a"))
        self.assertNotIn("SECRET", redact("https://x/api?q=a&api_key=SECRET"))

    def test_cache_key_ignores_secret(self):
        from assetlib.http import Http
        h = Http(cache_dir=Path("/tmp/none"))
        a = h._cache_path("https://x/api?key=AAA&q=a")
        b = h._cache_path("https://x/api?key=BBB&q=a")
        self.assertEqual(a, b)

    def test_download_url_with_key_is_withheld_from_sidecar(self):
        with tempfile.TemporaryDirectory() as d:
            from assetlib.models import Candidate
            lib = Library(Path(d))
            tmp = Path(d) / "f.png"
            tmp.write_bytes(png_bytes(10, 10))
            c = Candidate(source="pixabay", source_id="1", title="t", media_type="image", page_url="https://p",
                          download_url="https://x/f.png?key=SECRET", creator="c")
            from assetlib import licensing
            licensing.assess(c)
            lib.add_asset("s01", c, tmp, {"content_type": "image/png", "size": 1, "sha256": "ab"}, {}, how="t")
            blob = "".join(p.read_text() for p in Path(d).rglob("*.json"))
            self.assertNotIn("SECRET", blob)


if __name__ == "__main__":
    unittest.main()
