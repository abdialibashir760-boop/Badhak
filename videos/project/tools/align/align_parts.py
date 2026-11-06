"""Forced-align a long Turkish narration file against the sentence list.
usage: align_parts.py AUDIO OUT.json SCENE_IDS(comma) SCRIPT_JSON"""
import sys, json, re, unicodedata
import numpy as np, soundfile as sf, torch, torchaudio
from torchaudio.pipelines import MMS_FA as bundle
audio_path, out_path, scene_ids, script_path = sys.argv[1], sys.argv[2], sys.argv[3].split(","), sys.argv[4]
script = json.load(open(script_path, encoding="utf8"))["scenes"]

U = "sıfır bir iki üç dört beş altı yedi sekiz dokuz".split()
T = "_ on yirmi otuz kırk elli altmış yetmiş seksen doksan".split()
def num(n):
    if n == 0: return ["sıfır"]
    out = []
    if n >= 1000:
        k = n // 1000; out += ([] if k == 1 else num(k)) + ["bin"]; n %= 1000
    if n >= 100:
        h = n // 100; out += ([] if h == 1 else [U[h]]) + ["yüz"]; n %= 100
    if n >= 10: out.append(T[n // 10]); n %= 10
    if n: out.append(U[n])
    return out
def expand(text):
    text = text.replace("II.", "ikinci").replace("SS", "es es")
    def rep(m):
        w = num(int(m.group(1)))
        suf = m.group(2) or ""
        if suf: w[-1] = w[-1] + suf
        return " ".join(w)
    return re.sub(r"(\d+)(?:['’](\w+))?", rep, text)
FOLD = str.maketrans({"ç":"c","ğ":"g","ı":"i","ö":"o","ş":"s","ü":"u","â":"a","î":"i","û":"u","é":"e"})
def norm_word(w):
    w = w.replace("İ", "i").replace("I", "ı")
    w = w.lower().translate(FOLD)
    w = unicodedata.normalize("NFKD", w)
    return re.sub(r"[^a-z]", "", w)

# sentences & words
sents = []
for sid in scene_ids:
    for i, s in enumerate(script[sid]): sents.append((sid, i, s))
words, owner = [], []
for k, (sid, i, s) in enumerate(sents):
    for w in expand(s).split():
        nw = norm_word(w)
        if nw: words.append(nw); owner.append(k)
print("sentences", len(sents), "words", len(words), flush=True)

# audio -> 16 kHz mono
wav, sr = sf.read(audio_path, dtype="float32")
if wav.ndim > 1: wav = wav.mean(axis=1)
wav = torch.from_numpy(wav)
if sr != 16000: wav = torchaudio.functional.resample(wav, sr, 16000)
dur = len(wav) / 16000
print("audio seconds", round(dur, 1), flush=True)

model = bundle.get_model().eval()
CH, OV = 15.0, 0.6
ems = []
with torch.inference_mode():
    t = 0.0
    while t < dur:
        a = max(0.0, t - OV); b = min(dur, t + CH + OV)
        seg = wav[int(a * 16000):int(b * 16000)][None]
        e, _ = model(seg)
        e = torch.log_softmax(e, dim=-1)[0]          # frames x labels
        fps = e.shape[0] / (b - a)
        lo = int(round((t - a) * fps)); hi = e.shape[0] - int(round((b - min(dur, t + CH)) * fps))
        ems.append(e[lo:hi]); t += CH
        print(f"  chunk {t/dur:.0%}", flush=True)
emission = torch.cat(ems)[None]
n_frames = emission.shape[1]
labels = bundle.get_labels(star=None); dct = {c: i for i, c in enumerate(labels)}
tokens, wbounds = [], []
for w in words:
    ids = [dct[c] for c in w if c in dct]
    wbounds.append((len(tokens), len(tokens) + len(ids))); tokens += ids
targets = torch.tensor([tokens], dtype=torch.int32)
aligned, scores = torchaudio.functional.forced_align(emission, targets, blank=0)
spans = torchaudio.functional.merge_tokens(aligned[0], scores[0].exp())
ratio = dur / n_frames
print("frames", n_frames, "tokens", len(tokens), "spans", len(spans), flush=True)
assert len(spans) == len(tokens), "token/span mismatch"
res = [None] * len(sents)
for (wi, (a, b)) in enumerate(wbounds):
    if a == b: continue
    st = spans[a].start * ratio; en = spans[b - 1].end * ratio
    sc = float(np.mean([s.score for s in spans[a:b]]))
    k = owner[wi]
    if res[k] is None: res[k] = {"start": st, "end": en, "scores": [sc]}
    else: res[k]["end"] = en; res[k]["scores"].append(sc)
out = []
for k, (sid, i, s) in enumerate(sents):
    r = res[k]
    out.append({"scene": sid, "idx": i, "text": s, "start": round(r["start"], 3), "end": round(r["end"], 3), "conf": round(float(np.mean(r["scores"])), 3)})
json.dump({"audio": audio_path, "duration": round(dur, 3), "sentences": out}, open(out_path, "w"), ensure_ascii=False, indent=1)
lowc = [o for o in out if o["conf"] < 0.5]
print("done; low-confidence sentences:", len(lowc))
for o in lowc[:12]: print("  ", o["scene"], o["idx"], o["conf"], o["text"][:60])
