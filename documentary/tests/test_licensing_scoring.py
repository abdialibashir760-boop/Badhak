import unittest

from assetlib import licensing, scoring
from assetlib.models import Candidate, Scene


def cand(**kw):
    base = dict(source="commons", source_id="1", title="t", media_type="image", page_url="https://x/y")
    base.update(kw)
    return Candidate(**base)


class LicensingTests(unittest.TestCase):
    def test_classify(self):
        self.assertEqual(licensing.classify_license("CC0")[0], "clear")
        self.assertEqual(licensing.classify_license("Public domain")[0], "clear")
        self.assertEqual(licensing.classify_license("PD-old-70")[0], "clear")
        st, attr, _ = licensing.classify_license("CC BY 4.0")
        self.assertEqual((st, attr), ("clear", True))
        self.assertEqual(licensing.classify_license("CC BY-SA 3.0")[0], "review")
        self.assertEqual(licensing.classify_license("CC BY-NC 2.0")[0], "blocked")
        self.assertEqual(licensing.classify_license("CC BY-ND 4.0")[0], "blocked")
        self.assertEqual(licensing.classify_license("Fair use")[0], "blocked")
        self.assertEqual(licensing.classify_license("")[0], "review")
        self.assertEqual(licensing.classify_license("some custom terms")[0], "review")

    def test_commons_restrictions_downgrade_clear(self):
        c = licensing.assess(cand(license_name="CC0", extra={"restrictions": "personality"}))
        self.assertEqual(c.license_status, "review")

    def test_commons_non_free_blocked(self):
        self.assertEqual(licensing.assess(cand(license_name="CC0", extra={"non_free": True})).license_status, "blocked")

    def test_loc_rights_not_evaluated_is_review(self):
        c = licensing.assess(cand(source="loc", rights_text='Rights status not evaluated. For general information see "Copyright..."'))
        self.assertEqual(c.license_status, "review")

    def test_loc_no_known_restrictions_clear(self):
        c = licensing.assess(cand(source="loc", rights_text="No known restrictions on publication."))
        self.assertEqual(c.license_status, "clear")

    def test_smithsonian_only_cc0(self):
        self.assertEqual(licensing.assess(cand(source="smithsonian", extra={"usage_access": "CC0"})).license_status, "clear")
        self.assertEqual(licensing.assess(cand(source="smithsonian", extra={"usage_access": "Usage conditions apply"})).license_status, "blocked")

    def test_nasa_third_party_credit_needs_review(self):
        self.assertEqual(licensing.assess(cand(source="nasa", credit_line="NASA/JPL")).license_status, "clear")
        self.assertEqual(licensing.assess(cand(source="nasa", credit_line="ESA/Hubble")).license_status, "review")

    def test_ai_generated_stock_needs_review(self):
        c = licensing.assess(cand(source="pixabay", extra={"ai_generated": True}))
        self.assertEqual(c.license_status, "review")

    def test_missing_page_url_never_clear(self):
        self.assertEqual(licensing.assess(cand(source="pexels", page_url="")).license_status, "review")

    def test_platform_licences_are_not_assumed_identical(self):
        # each stock platform records its own licence name/url
        names = {licensing.assess(cand(source=s)).license_name for s in ("pixabay", "pexels", "unsplash", "coverr")}
        self.assertEqual(len(names), 4)

    def test_monetization_summary_not_yes_when_unconfirmed(self):
        c = licensing.assess(cand(license_name="weird"))
        self.assertEqual(licensing.monetization_summary(c)["youtube_monetization"], "unconfirmed")


class ScoringTests(unittest.TestCase):
    def scene(self, **kw):
        base = dict(id="s", title="x", must=[["lesotho", "maloti"], ["mountain"]], should=["aerial"])
        base.update(kw)
        return Scene.from_dict(base)

    def test_all_groups_match_gives_full_score(self):
        c = scoring.score_relevance(cand(title="Aerial view of Maloti mountain range"), self.scene())
        self.assertGreaterEqual(c.relevance, 1.0)

    def test_generic_clip_does_not_pass_place_specific_scene(self):
        c = scoring.score_relevance(cand(title="mountain at sunrise"), self.scene())
        self.assertEqual(c.relevance, 0.5)

    def test_diacritics_normalised(self):
        s = self.scene(must=[["letseng"]])
        self.assertGreaterEqual(scoring.score_relevance(cand(title="Letšeng diamond mine"), s).relevance, 1.0)

    def test_avoid_terms_penalise(self):
        c = scoring.score_relevance(cand(title="Maloti mountain wedding"), self.scene(avoid=["wedding"]))
        self.assertLess(c.relevance, 1.0)

    def test_period_mismatch_flagged(self):
        s = self.scene(must=[["basutoland"]], year_range=[1860, 1900])
        c = scoring.score_relevance(cand(title="Basutoland street", date="1955"), s)
        self.assertIn("period-mismatch", c.flags)
        self.assertLessEqual(c.relevance, 0.4)

    def test_period_unknown_flagged(self):
        s = self.scene(must=[["basutoland"]], year_range=[1860, 1900])
        c = scoring.score_relevance(cand(title="Basutoland street"), s)
        self.assertIn("period-unverified", c.flags)

    def test_watermark_words_flagged(self):
        c = scoring.score_relevance(cand(title="Maloti mountain shutterstock preview"), self.scene())
        self.assertIn("possible-watermark", c.flags)

    def test_quality_tiers_and_min_height(self):
        v = cand(media_type="video", width=3840, height=2160)
        self.assertEqual(scoring.quality_tier(v), "4K")
        self.assertTrue(scoring.meets_min_height(v, self.scene()))
        low = cand(media_type="video", width=1280, height=720)
        self.assertFalse(scoring.meets_min_height(low, self.scene(min_height=1080)))
        self.assertIsNone(scoring.meets_min_height(cand(), self.scene()))


if __name__ == "__main__":
    unittest.main()
