#!/usr/bin/env python3
"""Synthesize the narration with Kokoro (Apache-2.0, offline neural TTS), one WAV per sentence, at one constant pace.
Writes audio/voice/sentences.json — the master clock that every shot is timed against."""
import json, os, re, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
d = json.load(open(f'{root}/script/narration.json'))
k = Kokoro(f'{root}/audio/models/kokoro-v1.0.int8.onnx', f'{root}/audio/models/voices-v1.0.bin')
out = f'{root}/audio/voice'; os.makedirs(out, exist_ok=True)
SPEED = 0.93
rows = []
for s in d['sections']:
    parts = [p.strip() for p in re.split(r'(?<=[.?!])\s+', s['text']) if p.strip()]
    for i, text in enumerate(parts):
        sid = f"{s['id']}-{i}"
        audio, sr = k.create(text, voice=d['voice'], speed=SPEED, lang='en-gb')
        # trim leading/trailing near-silence so timings are tight
        a = np.abs(audio); idx = np.where(a > 0.01)[0]
        audio = audio[max(0, idx[0] - int(0.04 * sr)): idx[-1] + int(0.10 * sr)] if len(idx) else audio
        sf.write(f'{out}/{sid}.wav', audio, sr)
        rows.append({'id': sid, 'section': s['id'], 'text': text, 'seconds': round(len(audio) / sr, 3)})
        print(sid, rows[-1]['seconds'], flush=True)
json.dump({'sr': 24000, 'sentences': rows}, open(f'{out}/sentences.json', 'w'), indent=1)
print('total speech', round(sum(r['seconds'] for r in rows), 1), 's')
