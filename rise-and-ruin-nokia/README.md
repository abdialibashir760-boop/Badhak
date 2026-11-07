# Rise & Ruin — Episode 1: How Nokia Lost the Smartphone War

**Final video:** `How-Nokia-Lost-the-Smartphone-War.mp4` (1920×1080, 30 fps, 9:30 = 9:21 narration + 9 s credits end card; H.264/AAC; kept out of git). Rebuild: `cd video && npm i && ./render_chunks.sh`, then mux with `audio/mix.m4a` (score from `tools/synth_score.py`). Stock clips are gitignored; re-fetch with `tools/pixabay_fetch.py` (ids in `video/src/clips.json` names, e.g. c40054 = Pixabay 40054).

Documentary production package. **Narration is written for you to record; send the audio and the storyboard and edit timeline get re-timed to it.**

| # | File | What it is |
|---|---|---|
| 1 | `01-script.md` | Researched narration, timestamped, 1,457 words (~9:43 at 150 wpm). Every claim carries a fact ID. FACT / INTERPRETATION cues for the editor |
| 2 | `02-storyboard.md` | 50+ shots, each tagged real photo / stock / generated / graphic, plus a table of licensed Commons images |
| 3 | `03-image-prompts.md` | 8 atmosphere/symbol prompts + thumbnail backgrounds, with safety checklist |
| 4 | `04-charts-and-timeline.md` + `charts-data.json` | Seven chart specs and a 22-event timeline, with the underlying data and sources |
| 5 | `05-editing-timeline.md` | Motion language, sound design, master track-by-track timeline |
| 6 | `06-packaging.md` | 3 titles, 3 thumbnails, SEO description, tags, pinned comment |
| 7 | `07-research-and-bibliography.md` | Claim table with confidence ratings, ⚠ items to verify, facts vs interpretations, sources with URLs |
| – | `assets-manifest/` | Candidate Commons images (with licences) and Pixabay footage (IDs, durations, tags) |
| – | `tools/pixabay_fetch.py`, `tools/commons_lookup.py` | Search/download helpers. The key is read from `PIXABAY_API_KEY` and never printed |

## Read this first
1. **Facts are checked against reputable sources, but several come via Wikipedia or trade press, not primary filings.** The ⚠ rows in file 7 are the to-do list before publishing.
2. **Things I could not verify were left out** (a Q3 2010 smartphone figure, a 2012 net-loss figure, full-year 2011 loss — sources disagree). The script says so rather than guessing.
3. **No boardroom conversations are invented.** The only quotes are Elop's leaked memo (via Engadget) and published research.
4. **Visuals:** real photographs for every named phone, person and place; stock footage only where it matches the line; generated images only for atmosphere and symbols. Generated images are *not* generated yet (no credits spent) — prompts are ready.
5. **Gaps:** no licensed photos found for the HTC Dream, Nokia HQ, a Nokia factory, or the 2007 Jobs keynote. The storyboard marks each and falls back to a title card.

## Using the tools
```bash
export PIXABAY_API_KEY=...            # already set in this environment
python3 -I tools/pixabay_fetch.py search "telecom tower antenna"
python3 -I tools/pixabay_fetch.py download 218246 --size large --out assets/stock/
python3 -I tools/commons_lookup.py assets-manifest/commons-candidates.json   # slow: respects Commons rate limits
```
Pixabay returns 403 to Python's default `Python-urllib` User-Agent; the tools send an identifying one.
