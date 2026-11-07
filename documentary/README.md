# Documentary asset acquisition system + "Lesotho" film package

Standalone (Python 3.10+, **stdlib only**) — independent of the Next.js app in the repo root.

## Asset system (`assetlib/`)
Official APIs / permitted access only. One scene → search many sources → score licence, relevance, quality → select or **report**. It never substitutes an unrelated asset.

| Source | Access | Notes |
|---|---|---|
| Pixabay, Pexels, Coverr, Unsplash, Smithsonian | API key (`PIXABAY_API_KEY`, `PEXELS_API_KEY`, `COVERR_API_KEY`, `UNSPLASH_ACCESS_KEY`, `SI_API_KEY`) | Missing key ⇒ source reported as skipped. Coverr parser is unverified against a live key. |
| Wikimedia Commons, Library of Congress, Internet Archive/Prelinger, NASA, USGS (ScienceBase) | open APIs | Per-item licence/rights read from the record. |
| Mixkit, NOAA | **manual** (no supported API, no scraping) | Tool prints a search link; a human downloads and runs `register-manual` with the licence they read. |

```
python3 -m assetlib sources                  # what is configured
python3 -m assetlib validate                 # scenes + library integrity
python3 -m assetlib search s08               # look, don't download
python3 -m assetlib acquire s08 [--dry-run]  # search, select, download accepted, write metadata + scene_map
python3 -m assetlib approve s08 commons:123  # human approves a reviewed candidate
python3 -m assetlib register-manual s02 file.mp4 --source mixkit --url ... --creator ... --license ...
python3 -m assetlib report | credits
python3 -m unittest discover -s tests
```
Outputs per project in `library/<project>/`: `<scene>/<descriptive-name>.<ext>` + `.json` sidecar (original URL, creator, licence, attribution, YouTube-monetisation verdict, sha256, verified size, match notes), `scene_map.json`, `candidates/`, `ASSET_REPORT.md`, `CREDITS.md`.

Scene statuses: `filled` · `partial` · `needs_review` (candidate exists but licence/relevance/period unconfirmed) · `unfilled` (with alternatives, human search links and a labelled last-resort AI prompt) · `build` (maps/graphics made from data).

Limits (by design): relevance and watermark screening use **metadata only** — every clip still needs a visual check; licence verdicts are not legal advice; platform defaults never override the per-asset record.

## Lesotho film (`projects/lesotho/`)
`scenes.json` is the single source; `python3 projects/lesotho/build_docs.py` renders `deliverables/01…06`; `07_09_paketleme_seo.md` and `10_kaynakca_dogruluk.md` are hand-written. `tools/verify_geography.py` checks the enclave geometry against Natural Earth.
