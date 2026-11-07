"""Guards on the Lesotho project data (mirrors the 'tested' content rules in CLAUDE.md for the app)."""
import json
import re
import unittest
from pathlib import Path

from assetlib.models import Scene
from assetlib.report import validate_scenes
from assetlib.sources import build_sources
from helpers import FakeHttp

P = Path(__file__).resolve().parent.parent / "projects" / "lesotho"
DATA = json.loads((P / "scenes.json").read_text("utf-8"))
SCENES = DATA["scenes"]


class LesothoProjectTests(unittest.TestCase):
    def test_scene_definitions_valid(self):
        scenes = [Scene.from_dict(d) for d in SCENES]
        self.assertEqual(validate_scenes(scenes, build_sources(FakeHttp(), {})), [])

    def test_runtime_between_7_and_9_minutes(self):
        words = sum(len(s["narration"].split()) for s in SCENES)
        seconds = words / DATA["pace_words_per_second"] + 0.5 * len(SCENES)
        self.assertGreaterEqual(seconds, 7 * 60)
        self.assertLessEqual(seconds, 9 * 60)

    def test_new_composition_every_3_to_6_seconds(self):
        for s in SCENES:
            span = len(s["narration"].split()) / DATA["pace_words_per_second"] + 0.5
            avg = span / len(s["shots"])
            self.assertTrue(3 <= avg <= 6, f"{s['id']} averages {avg:.1f}s per shot")

    def test_story_structure_has_all_eight_chapters(self):
        self.assertEqual(sorted({s["chapter"] for s in SCENES}), list(range(1, 9)))

    def test_map_scenes_are_built_not_generated(self):
        for s in SCENES:
            if s["asset_mode"] == "build":
                self.assertTrue(s["spec_ref"] and s["map_spec"], s["id"])
                self.assertEqual(s["ai_prompt"], "", f"{s['id']}: maps must not be AI-generated")

    def test_stock_scenes_have_ai_fallback_and_queries(self):
        for s in SCENES:
            if s["asset_mode"] == "stock":
                self.assertTrue(s["queries"] and s["must"], s["id"])
                if s["media_preference"] == "map":
                    self.assertEqual(s["ai_prompt"], "", f"{s['id']}: maps are never AI-generated")
                else:
                    self.assertGreater(len(s["ai_prompt"]), 80, s["id"])

    def test_no_invented_historical_faces_in_prompts(self):
        for s in SCENES:
            if s.get("period", "").startswith(("18", "19", "1830", "1840")) and s["ai_prompt"]:
                self.assertRegex(s["ai_prompt"].lower(), r"no (facial|faces|identifiable)|faceless|no face", s["id"])

    def test_moshoeshoe_portrait_scene_requires_real_photo_or_reports_missing(self):
        s = next(x for x in SCENES if "Moshoeshoe I" == x["title"])
        self.assertIn("moshoeshoe ii", s["avoid"])
        self.assertTrue(s["year_range"])
        self.assertIn("uydurulmaz", s["notes"])

    def test_narration_uses_turkish_diacritics_and_no_ai_claim(self):
        text = " ".join(s["narration"] for s in SCENES)
        self.assertRegex(text, r"[çğıöşüÇĞİÖŞÜ]")
        self.assertNotRegex(text.lower(), r"yapay zek")

    def test_key_dates_present_and_consistent(self):
        text = " ".join(s["narration"] for s in SCENES)
        for needle in ("1824", "1833", "1868", "1869", "1880", "1884", "1910", "4 Ekim 1966", "1986"):
            self.assertIn(needle, text)
        self.assertNotRegex(text, r"1967|1965'te bağımsız")

    def test_geo_verification_record_matches_enclave_claim(self):
        g = json.loads((P / "geo_verification.json").read_text("utf-8"))
        self.assertTrue(g["fully_enclaved"])
        self.assertEqual(set(g["neighbours_by_shared_vertices"]), {"ZAF"})
        self.assertAlmostEqual(g["area_km2_computed"], 30355, delta=30355 * 0.02)

    def test_deliverables_in_sync_with_scenes(self):
        out = P / "deliverables" / "02_seslendirme_zaman_kodlu.md"
        if out.exists():
            md = out.read_text("utf-8")
            for s in SCENES:
                self.assertIn(s["narration"], md, f"{s['id']} narration changed; re-run build_docs.py")


if __name__ == "__main__":
    unittest.main()
