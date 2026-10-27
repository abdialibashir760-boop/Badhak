# Channel plan

## 1. Positioning
**Animated, fact-checked true stories of rescues and survival.** Each video is one story, told in about two
and a half minutes, ending on a hook into the next one. Same look, same calm narrator, so a new viewer can tell
in one second it's this channel.

- **Audience:** people who watch survival / disaster / history explainers on Shorts and want the story in order,
  with the *why it worked* (the engineering, the decisions), not just the shock.
- **Promise:** every claim traceable to a source, listed in the description.
- **Voice:** calm, plain, no hype words. Numbers and dates on screen as chips.

## 2. Channel name options (check availability before committing)
I could not check handle availability (research credits ran out), so treat these as candidates. Search each as a
YouTube handle and a trademark before you pick.

1. **Against the Clock Stories** — fits rescues; broad enough for disasters.
2. **Still Alive Files**
3. **The Last Hours (Animated)**
4. **Rescue Minute**
5. **Trapped & Found**
6. **Deep Rescue**
7. **Survivor Blueprints** — leans into the "why it worked" angle
8. **Hours to Hope**

Recommendation: pick the one whose handle is free *and* is easy to say aloud. Avoid names that resemble an
existing channel (the Part 1 reference clip's channel in particular).

## 3. Visual + audio identity (already built)
- 9:16 (1080×1920) for Shorts and 16:9 (1920×1080) for regular uploads, 30 fps, flat vector cutaways, caption in the Shorts-safe middle area, top chip for dates/numbers.
- Narration: Kokoro `am_michael`; ambient drone + story-specific sound effects (`chile-rescue-video/scripts/stories/*.py`).
- Series tag in the top-left (e.g. `APOLLO 13 · 1970`).
- End card: "NEXT STORY" + the next title + FOLLOW.

## 3b. Languages
Apollo 13 exists in English and Turkish (separate uploads, or a second channel/audio track). Turkish uses an offline
Piper voice and was not reviewed by a native speaker: get a review before publishing and consider a human voice-over
for the Turkish channel. Details: `videos/apollo13-tr.md`.

## 4. Production workflow (per story)
1. **Research:** collect 3+ independent sources; write a fact sheet (like `videos/chile-part2-facts.md`). Mark any
   conflict between sources and leave the contested number *out* of the script.
2. **Script:** `chile-rescue-video/scripts/stories/<story>.py` — one line = one caption = one beat (about 45 lines).
   Own wording; never copy another creator's script.
3. **Audio:** `python3 -I scripts/make_audio.py <story> <kokoro.onnx> <voices.bin>` writes the voice, the timeline and an SRT.
4. **Scenes:** `src/<story>/` — scenes are keyed to line ids, so changing the script re-times the picture.
5. **Render + review:** `npm run render`; watch it once with sound; check every number against the fact sheet.
6. **Package:** fill `channel-kit/videos/<story>.md` (title, description, tags, sources, pinned comment).

Realistic throughput once a story is researched: script + audio + scenes is the bulk of the work. Reusing the
scene toolkit (`src/apollo13/art.tsx`, `src/san-jose/*`) shortens each new story, but every story still needs its own
scenes. Do not expect a story a day.

## 5. 90-day calendar
Assumes 3 Shorts/week after launch, then adds a long-form video. Adjust to your real capacity.

**Before launch (week 0):** have 5 videos finished so the channel page looks alive on day one:
Apollo 13, Chile Part 1, Chile Part 2, + 2 new stories (see list). Publish them over the first 10 days.

| Weeks | Output | Goal |
|---|---|---|
| 1–2 | 5–6 Shorts (the launch batch) | Find which story type gets viewed to the end |
| 3–6 | 3 Shorts/week, each with a "next story" hook | Watch **average view duration** and **swipe-away rate** per video; double down on the best story type |
| 5–8 | First long-form (8–12 min): "Full story" cut of a two-part story (Chile Part 1 + 2, expanded with the engineering detail) | Build watch hours; Shorts viewers who want more |
| 9–12 | 3 Shorts + 1 long-form per week | Playlists per series; first community posts (poll: which story next) |

**Story queue** (all well documented; each needs its own fact sheet before scripting):

1. Apollo 13 — *done (needs final review)*
2. Chile 2010, Part 1 — *done (see claims to verify)*
3. Chile 2010, Part 2 — *fact sheet drafted*
4. Tham Luang cave rescue, Thailand 2018 (13 trapped) — promised in the Apollo 13 end card
5. Quecreek mine rescue, Pennsylvania 2002
6. Andes flight disaster, 1972 — handle with care (survivors, cannibalism); decide your editorial line first
7. Aron Ralston, 2003
8. Hudson River landing, 2009
9. Lake Peigneur sinkhole, 1980
10. Kursk submarine, 2000 — many deaths; respectful tone, avoid speculation
11. Sago / other mine disasters — only with strong primary sources and a respectful tone
12. Rotating "what the engineers did" explainers (capsule, drills, scrubbers) as longer follow-ups

## 6. Metrics to check weekly (YouTube Studio)
- **Stayed to watch** / swipe-away rate on Shorts (the first 2 seconds are the hook; Apollo 13's hook is the bang).
- **Average percentage viewed**: aim to beat your own previous video, not an industry number.
- **Subscribers per 1,000 views** — the CTA ("Follow for the next story") is working if this rises.
- Comments asking for corrections: fix the description and pin a correction. Accuracy is the brand.

## 7. Policy guardrails (verify the current wording in YouTube Studio / Help before publishing)
- **Original, non-repetitive content:** YouTube can limit monetization on mass-produced or repetitive uploads.
  Keep each story's script, scenes and facts distinct; don't reuse another channel's script or visuals.
- **Altered or synthetic content disclosure:** the narrator is an AI voice over stylised animation. Check the
  disclosure question in the upload form and answer it honestly; add "AI narration, original animation" to the description.
- **Real people, real deaths:** respectful tone, no invented dialogue presented as fact (quoted lines must be
  sourced, e.g. Urzúa's quote, Lovell's call), no graphic detail.
- **Sources in the description** for every video.
- **Music/SFX:** all audio is generated in this repo (no third-party music), so no Content ID claims expected.
- **Monetization thresholds** change — read the current YouTube Partner Program page rather than relying on
  numbers in this file. Shorts and long-form count differently.

## 8. Research still to do (vidIQ credits refill 2026-10-28 10:29 UTC, ≈ 30 searches)
Run these, in this order, and write the results next to this file:
1. `outliers` — keyword "animated true story rescue survival trapped", long-form, max 200k subs, last 6 months.
2. `outliers` — same keyword, Shorts.
3. `channel_search` — "animated true stories of rescues, disasters and survival", `breakoutChannel: true`.
4. `keyword_research` — "apollo 13", "tham luang cave rescue", "quecreek mine rescue", "chile miners rescue" (volume vs competition).
5. `similar_channels` for the 2–3 best breakout channels → note what they *don't* cover.
Use the results to reorder the story queue and decide the channel name.

## 9. Checklists (these need you / your account)

**Setup**
- [ ] Create the Google/YouTube brand account and channel; pick the name/handle (section 2)
- [ ] Verify the channel (phone) so you can upload videos longer than 15 minutes and custom thumbnails
- [ ] Channel description (2 sentences from section 1), links, contact email
- [ ] Avatar + banner (simple: series tag on dark navy, matches the videos)
- [ ] Default upload settings: category *Education* (or *Entertainment*), made-for-kids = **No**
- [ ] Create playlists: *Space*, *Mine & Cave Rescues*, *Sea & Air* (add more later)

**Per upload**
- [ ] Final watch with sound; every number matches the fact sheet
- [ ] Title (≤ 70 chars, see `videos/*.md`), description with sources, hashtags
- [ ] Upload `captions/<story>.srt` as subtitles
- [ ] Altered/synthetic content question answered
- [ ] Pin the comment from the package; add to the right playlist
- [ ] Schedule (don't all-publish at once)
