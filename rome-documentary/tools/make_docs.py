#!/usr/bin/env python3
"""Generate the written deliverables (script, storyboard, SEO/chapters) from the master timeline."""
import json, os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); TL = json.load(open(f'{R}/audio/timeline.json')); N = json.load(open(f'{R}/script/narration.json'))
mmss = lambda t: f"{int(t//60)}:{int(t%60):02d}"
words = sum(len(s['text'].split()) for s in N['sections'])
# 1 — script
out = [f"# {N['title']} — Narration script\n", f"**Runtime:** {mmss(TL['total'])} · **Words:** {words} · **Voice:** Kokoro `bm_george` (British male, Apache-2.0, generated offline)\n",
       "Timestamps are the exact start of each sentence in the final video. Where the evidence is thin, the narration says so (tradition vs. evidence).\n"]
for s in N['sections']:
    sents = [x for x in TL['sentences'] if x['section'] == s['id']]
    out.append(f"\n## {s['label']}  ·  {mmss(sents[0]['start'])}–{mmss(sents[-1]['end'])}\n")
    out += [f"`{mmss(x['start'])}` {x['text']}\n" for x in sents]
open(f'{R}/docs/SCRIPT.md', 'w').write('\n'.join(out))
# 2 — storyboard
sb = [f"# Storyboard — {len(TL['shots'])} shots, {mmss(TL['total'])}\n", "Kinds: **map** = programmatic parchment map (canvas + per-pixel territory), **art** = original SVG illustration, **card** = typographic/timeline card. Each shot is timed to the narration sentence(s) it illustrates.\n",
      '| # | Time | Dur | Kind | Scene | Transition | Narration | Description | Sound |', '|---|---|---|---|---|---|---|---|---|']
sent = {x['id']: x for x in TL['sentences']}
for s in TL['shots']:
    n = sent[s['from']]['text'] if s['from'] in sent else ''; n = (n[:60] + '…') if len(n) > 60 else n
    sb.append(f"| {s['id']} | {mmss(s['start'])}.{int((s['start']%1)*10)} | {s['dur']:.1f}s | {s['kind']} | `{s['scene']}` | {s.get('tr','cut')} | {n} | {s['note']} | {', '.join(s.get('sfx',[])) or '—'} |")
open(f'{R}/docs/STORYBOARD.md', 'w').write('\n'.join(sb) + '\n')
# 3 — chapters
first = {}
for x in TL['sentences']: first.setdefault(x['section'], x['start'])
ch = [(0, 'Introduction: three continents under one empire')] + [(first[k], v) for k, v in [('beginning', 'The Beginning: a river crossing in Italy'), ('republic', 'The Republic expands: Carthage, Hannibal, Scipio'), ('caesar', 'Julius Caesar and the Rubicon'), ('empire', 'Augustus and the birth of the Empire'), ('legacy', 'Trajan, the legacy, and the modern map')]]
open(f'{R}/docs/CHAPTERS.txt', 'w').write('\n'.join(f"{mmss(t)} {n}" for t, n in ch) + '\n')
print('docs written; words', words)
