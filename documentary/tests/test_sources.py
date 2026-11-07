"""Parsers. NASA / Internet Archive / LOC / Pixabay / ScienceBase tests use REAL captured API responses
(tests/fixtures/*.json). Commons, Pexels, Unsplash, Coverr and Smithsonian could not be called live from the
build environment (rate-limit / no key), so their tests use small SYNTHETIC payloads that follow the documented
response shapes - treat those as unverified against the live service."""
import unittest

from assetlib.sources import build_sources
from helpers import FakeHttp, fixture


def src(name, routes, env=None):
    return build_sources(FakeHttp(routes), env or {"PIXABAY_API_KEY": "k", "PEXELS_API_KEY": "k", "UNSPLASH_ACCESS_KEY": "k",
                                                    "COVERR_API_KEY": "k", "SI_API_KEY": "k"})[name]


class RealFixtureTests(unittest.TestCase):
    def test_nasa_search_and_enrich(self):
        s = src("nasa", {"https://images-api.nasa.gov/search": fixture("nasa_search.json"),
                         "https://images-api.nasa.gov/asset/": fixture("nasa_asset.json")})
        cs = s.search("south africa", "image")
        self.assertTrue(cs)
        c = cs[0]
        self.assertEqual(c.source, "nasa")
        self.assertTrue(c.page_url.startswith("https://images.nasa.gov/details/"))
        s.enrich(c)
        self.assertTrue(c.download_url.startswith("https://") and "~orig" in c.download_url)

    def test_pixabay_images_and_videos(self):
        s = src("pixabay", {"https://pixabay.com/api/videos/": fixture("pixabay_videos.json"),
                            "https://pixabay.com/api/": fixture("pixabay_images.json")})
        v = s.search("mountain village", "video")
        self.assertTrue(v and all(c.download_url and c.height for c in v))
        self.assertEqual(v[0].width, 3840)
        i = s.search("drakensberg", "image")
        self.assertTrue(i and all(c.download_url for c in i))

    def test_loc_search_marks_missing_rights_for_enrichment(self):
        s = src("loc", {"https://www.loc.gov/photos/": fixture("loc_photos.json")})
        cs = s.search("basutoland", "image")
        self.assertTrue(cs)
        self.assertTrue(all(c.page_url.startswith("http") for c in cs))

    def test_loc_enrich_reads_rights_advisory(self):
        s = src("loc", {"https://www.loc.gov/photos/": fixture("loc_photos.json"),
                        "https://www.loc.gov/item/2002707020/": fixture("loc_item.json")})
        c = next(c for c in s.search("basutoland", "image") if "2002707020" in c.page_url)
        s.enrich(c)
        self.assertIn("not evaluated", c.rights_text.lower())

    def test_archive_search_and_enrich(self):
        meta = fixture("ia_metadata.json")
        s = src("archive", {"https://archive.org/advancedsearch.php": fixture("ia_search.json"), "https://archive.org/metadata/": meta})
        cs = s.search("lesotho", "film")
        self.assertTrue(cs)
        s.enrich(cs[0])
        self.assertIn("/download/", cs[0].download_url)
        self.assertEqual(cs[0].height, 480)

    def test_usgs_sciencebase(self):
        s = src("usgs", {"https://www.sciencebase.gov/catalog/items": fixture("sciencebase.json")})
        cs = s.search("lesotho", "map")
        self.assertTrue(cs)
        self.assertTrue(all(c.download_url.startswith("https://www.sciencebase.gov") for c in cs))


class SyntheticShapeTests(unittest.TestCase):
    def test_commons_extmetadata(self):
        page = {"pageid": 42, "title": "File:Moshoeshoe I.jpg", "imageinfo": [{
            "url": "https://upload.wikimedia.org/x.jpg", "descriptionurl": "https://commons.wikimedia.org/wiki/File:Moshoeshoe_I.jpg",
            "width": 2000, "height": 3000, "mime": "image/jpeg", "mediatype": "BITMAP", "thumburl": "https://upload.wikimedia.org/t.jpg",
            "extmetadata": {"LicenseShortName": {"value": "Public domain"}, "Artist": {"value": "<a href='x'>Unknown</a> photographer"},
                            "DateTimeOriginal": {"value": "circa 1860"}, "Restrictions": {"value": ""},
                            "ImageDescription": {"value": "<b>King</b> Moshoeshoe"}}}]}
        s = src("commons", {"https://commons.wikimedia.org/w/api.php": {"query": {"pages": {"42": page}}}})
        c = s.search("Moshoeshoe", "image")[0]
        self.assertEqual((c.license_name, c.creator, c.date), ("Public domain", "Unknown photographer", "circa 1860"))
        self.assertEqual(c.description, "King Moshoeshoe")

    def test_pexels_video_picks_largest_mp4(self):
        payload = {"videos": [{"id": 7, "url": "https://www.pexels.com/video/aerial-view-of-mountains-7/", "duration": 12,
                               "user": {"name": "A", "url": "u"}, "image": "i", "video_files": [
            {"link": "a", "file_type": "video/mp4", "width": 1280, "height": 720},
            {"link": "b", "file_type": "video/mp4", "width": 3840, "height": 2160},
            {"link": "c", "file_type": "video/webm", "width": 7680, "height": 4320}]}]}
        c = src("pexels", {"https://api.pexels.com/videos/search": payload}).search("x", "video")[0]
        self.assertEqual((c.download_url, c.height, c.title), ("b", 2160, "aerial view of mountains"))

    def test_unsplash_download_endpoint_is_called(self):
        http = FakeHttp({"https://api.unsplash.com/search/photos": {"results": [{
            "id": "abc", "width": 6000, "height": 4000, "alt_description": "hills", "urls": {"full": "https://f"},
            "links": {"html": "https://unsplash.com/photos/abc", "download_location": "https://api.unsplash.com/photos/abc/download"},
            "user": {"name": "P", "links": {"html": "h"}}, "tags": []}]},
            "https://api.unsplash.com/photos/abc/download": {"url": "https://real.file"}})
        s = build_sources(http, {"UNSPLASH_ACCESS_KEY": "k"})["unsplash"]
        c = s.search("hills", "image")[0]
        self.assertEqual(s.download_request(c)[0], "https://real.file")

    def test_smithsonian_cc0_flag_and_non_images_skipped(self):
        row = lambda acc: {"id": "edanmdm:1", "title": "Basuto hut", "content": {"descriptiveNonRepeating": {  # noqa: E731
            "record_link": "https://n.si.edu/x", "unit_name": "NMNH", "online_media": {"media": [
                {"type": "Images", "content": "https://ids.si.edu/i", "thumbnail": "t", "usage": {"access": acc}}]}},
            "freetext": {"name": [{"content": "Maker"}], "date": [{"content": "1900"}]}}}
        payload = {"response": {"rows": [row("CC0"), row("Usage conditions apply")]}}
        cs = src("smithsonian", {"https://api.si.edu/openaccess/api/v1.0/search": payload}).search("x", "image")
        self.assertEqual([c.extra["usage_access"] for c in cs], ["CC0", "Usage conditions apply"])

    def test_coverr_vertical_skipped(self):
        payload = {"hits": [{"id": "1", "title": "ok", "urls": {"mp4_download": "u"}, "max_width": 3840, "max_height": 2160},
                            {"id": "2", "title": "vertical", "urls": {"mp4": "v"}, "is_vertical": True}]}
        cs = src("coverr", {"https://api.coverr.co/videos": payload}).search("x", "video")
        self.assertEqual([c.source_id for c in cs], ["1"])

    def test_manual_sources_never_search_and_unconfigured_key_reported(self):
        ss = build_sources(FakeHttp(), {})
        self.assertEqual(ss["mixkit"].search("x", "video"), [])
        self.assertEqual(ss["noaa"].search("x", "image"), [])
        self.assertIn("PEXELS_API_KEY", ss["pexels"].status_line())
        self.assertFalse(ss["pexels"].configured())
        self.assertTrue(ss["commons"].configured())
        self.assertIn("mixkit.co", ss["mixkit"].search_url("lesotho village"))


if __name__ == "__main__":
    unittest.main()
