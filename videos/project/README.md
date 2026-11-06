# Documentary video project (Remotion)

"The Railway That Kept Turkey Out of WW2" — English and Turkish versions share the same maps, photos and sound.

## Setup
```bash
npm install
```
Remotion downloads its own browser by default; if that is blocked, pass an installed Chromium: `--browser-executable=/path/to/chromium`.

## English
`npx remotion render Docu out/documentary.mp4 --concurrency=4 --crf=27` (about 35 min).

## Turkish
1. Record the narration (see `../turkish/kayit_rehberi.md`) into a folder, one file per scene (`01`, `02` … `13`).
2. `python3 tools/ingest_tr.py /path/to/recordings` — finds each sentence from your pauses, writes `src/timeline_tr.json`, `public/vo_tr.m4a` and `chapters_tr.txt`.
3. `npx remotion render DocuTR out/documentary_tr.mp4 --concurrency=4 --crf=27`.
4. Thumbnails: `npx remotion still ThumbATR out/thumb_A_tr.jpg --image-format=jpeg` (also `ThumbBTR`, `ThumbCTR`).

Until step 2 is run, `DocuTR` uses a silent placeholder and English-length timing, so only use it to check the layout.

### Turkish narration as three long audio files (what was actually used)
When the narration is generated or recorded as a few long files instead of 16 scene files:
1. `python3 -m venv venv && venv/bin/pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cpu soundfile numpy`
2. For each part, forced-align the known script text to the audio (finds every sentence start; uses torchaudio's MMS_FA model, downloaded on first run):
   `venv/bin/python tools/align/align_parts.py part1.wav part1.json 1,2,3,4,5 src/script_tr.json`
   (part 2 = scenes `5B,6,7,8,9`, part 3 = `9B,10,10B,11,12,13`; keep the exact script text and sentence order).
3. `python3 tools/align/assemble_tr.py . . part1.wav part1.json part2.wav part2.json part3.wav part3.json` — writes `src/timeline_tr.json`, `public/vo_tr.m4a`, `chapters_tr.txt` (copy the first two into `src/` and `public/` if you used another output folder).
4. `npx remotion render DocuTR out/documentary_tr.mp4 --concurrency=4 --crf=27`.

## How the Turkish text is produced
`src/tr/*` is generated from the English scene files: `tools/translate/dict_tr.py` holds the English→Turkish strings; run
`python3 tools/translate/make_dict.py && cd src && node ../tools/translate/translate_ts.js tr scenes1.tsx scenes2.tsx scenes3.tsx scenes4.tsx Thumbs.tsx && python3 ../tools/translate/post_tr.py`
after changing any English on-screen text or the dictionary. Narration text is `src/script_tr.json` (sentence-aligned with the English script).

## Notes
- Photos in `public/img` are public-domain or CC0 images from Wikimedia Commons; credits are in `src/credits.json` and `../packaging/image_credits.md`. Six are 500 px because Wikimedia rate-limited downloads.
- `public/vo.m4a` is the English narration (synthetic voice). The music and sound effects are synthesised, no third-party audio.
