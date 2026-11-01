"""Find where each script line starts in a supplied narration recording (offline speech recognition + text alignment).

Usage:
  python3 -I scripts/align_audio.py <narration.wav> <asr_model_dir> <script.md> <out_align.json>

* <asr_model_dir>: extracted `sherpa-onnx-streaming-zipformer-en-2023-06-26` (GitHub release `k2-fsa/sherpa-onnx`, tag `asr-models`).
* <script.md>: a script file with an `## ENGLISH` table of `| id | say | caption |` rows (see channel-kit/scripts/).
Lines the recording does not contain are listed under "missing" (cover them with story ALIAS entries, or record them).
Then: python3 -I scripts/make_audio.py <story> --supplied <narration.wav> <out_align.json>
Needs: pip install sherpa-onnx numpy
"""
import json, re, sys, difflib, wave
import numpy as np
import sherpa_onnx
raw, model_dir, script, out_json = sys.argv[1:5]
d = model_dir
rec = sherpa_onnx.OnlineRecognizer.from_transducer(
    tokens=f"{d}/tokens.txt",
    encoder=f"{d}/encoder-epoch-99-avg-1-chunk-16-left-128.int8.onnx",
    decoder=f"{d}/decoder-epoch-99-avg-1-chunk-16-left-128.int8.onnx",
    joiner=f"{d}/joiner-epoch-99-avg-1-chunk-16-left-128.int8.onnx",
    num_threads=4, sample_rate=16000, feature_dim=80, decoding_method="greedy_search")
with wave.open(raw) as w:
    sr = w.getframerate(); n = w.getnframes(); x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
dur = len(x) / sr
s = rec.create_stream(); s.accept_waveform(sr, x); s.accept_waveform(sr, np.zeros(int(sr), dtype=np.float32)); s.input_finished()
while rec.is_ready(s): rec.decode_stream(s)
r = rec.get_result_all(s)
# char-level ASR string with a time for every character
achars, atimes = [], []
for tok, ts in zip(r.tokens, r.timestamps):
    for ch in re.sub(r"[^a-z0-9]", "", tok.lower()):
        achars.append(ch); atimes.append(ts)
atext = "".join(achars)
md = open(script).read(); en = md[md.index("## ENGLISH"):md.index("## TÜRKÇE")]
rows = [r_ for r_ in re.findall(r"^\| (\w+) \| (.+?) \| (.+?) \|$", en, re.M) if r_[0] != "id"]
ids = [r_[0] for r_ in rows]; says = [r_[1] for r_ in rows]
stext, soff = "", []
for line in says:
    soff.append(len(stext)); stext += re.sub(r"[^a-z0-9]", "", line.lower())
sm = difflib.SequenceMatcher(None, stext, atext, autojunk=False)
amap = {}
for a, b, size in sm.get_matching_blocks():
    for k in range(size): amap[a + k] = b + k
res = {}
for i, off in enumerate(soff):
    end = soff[i + 1] if i + 1 < len(soff) else len(stext)
    mapped = [amap[j] for j in range(off, end) if j in amap]
    cover = len(mapped) / max(1, end - off)
    if cover >= 0.6:
        res[ids[i]] = {"start": atimes[mapped[0]], "last": atimes[mapped[-1]], "cover": round(cover, 2)}
present = [i for i in ids if i in res]
missing = [i for i in ids if i not in res]
print("ASR chars", len(atext), "of script chars", len(stext), "| present", len(present), "missing", missing)
out = []
for k, id_ in enumerate(present):
    st = max(0.0, res[id_]["start"] - 0.12)
    nxt = res[present[k + 1]]["start"] - 0.12 if k + 1 < len(present) else dur
    out.append({"id": id_, "start": round(st, 3), "end": round(max(st + 0.4, nxt - 0.05), 3), "cover": res[id_]["cover"]})
for o in out:
    sy = says[ids.index(o["id"])]
    print(f'{o["id"]:3} {o["start"]:6.2f} {o["end"]-o["start"]:5.2f}s cov {o["cover"]:.2f}  {sy[:52]}')
json.dump({"duration": dur, "present": out, "missing": missing, "ids": ids, "says": says}, open(out_json, "w"), indent=1)
