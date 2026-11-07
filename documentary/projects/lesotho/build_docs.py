#!/usr/bin/env python3
"""Render the Turkish deliverables from scenes.json (single source of truth).

    python3 projects/lesotho/build_docs.py          # writes projects/lesotho/deliverables/*
"""
from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "deliverables"
DATA = json.loads((HERE / "scenes.json").read_text("utf-8"))
SCENES = DATA["scenes"]
WPS = DATA.get("pace_words_per_second", 2.3)
PAUSE = 0.5  # seconds of breathing room after each scene

# Telaffuz: ekrandaki yazım korunur, TTS metninde okunuş yazımı kullanılır (uzun olan önce).
PRON = {
    "Thabana Ntlenyana": "Tabana Entlenyana", "Thaba Bosiu": "Taba Bosyu", "KwaZulu-Natal": "Kvazulu Natal",
    "Moshoeshoe": "Moşveşve", "Basutoland": "Basutoland", "Aliwal North": "Eliwal Nors", "Free State": "Fri Steyt",
    "Orange": "Orenç", "Lesotho": "Lesoto", "Basotho": "Basoto", "Mosotho": "Mosoto", "Sesotho": "Sesoto",
    "Lepoqo": "Lepoko", "Difaqane": "Difakane", "Casalis": "Kazalis", "Eugène": "Öjen", "Letšeng": "Letseng",
    "Senqu": "Senku", "Gauteng": "Hauteng", "Caledon": "Kaledon", "Boer": "Bur", "SACU": "Sakü", "SADC": "Es Ey Di Si",
    "Mokorotlo": "Mokorotlo", "Mohokare": "Mohokare", "Maloti": "Maluti", "Katse": "Katse", "Esvatini": "Esvatini",
}


def tts(text: str) -> str:
    for k in sorted(PRON, key=len, reverse=True):
        text = re.sub(rf"\b{re.escape(k)}", PRON[k], text)
    return text


def tc(sec: float, ms: bool = False) -> str:
    sec = max(sec, 0)
    m, s = divmod(sec, 60)
    return f"{int(m):02d}:{s:05.2f}" if ms else f"{int(m):02d}:{int(s):02d}"


def srt_tc(sec: float) -> str:
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}"


# ---- timing -------------------------------------------------------------------------------------
t = 0.0
for s in SCENES:
    words = len(s["narration"].split())
    s["words"] = words
    s["dur"] = round(words / WPS, 2)
    s["t0"], s["t1"] = round(t, 2), round(t + s["dur"], 2)
    s["slot_end"] = round(t + s["dur"] + PAUSE, 2)
    t = s["slot_end"]
TOTAL = t
CHAPTERS: dict[int, str] = {}
for s in SCENES:
    CHAPTERS.setdefault(s["chapter"], s["chapter_title"])


def shot_times(s):
    n = len(s["shots"])
    span = s["slot_end"] - s["t0"]
    step = span / n
    return [(round(s["t0"] + i * step, 2), round(s["t0"] + (i + 1) * step, 2), shot) for i, shot in enumerate(s["shots"])]


def w(name: str, text: str):
    OUT.mkdir(exist_ok=True)
    (OUT / name).write_text(text.rstrip() + "\n", "utf-8")


HEAD = f"**Proje:** {DATA['title']}  \n**Format:** {DATA['format']} · **Tahmini süre:** {tc(TOTAL)} ({TOTAL / 60:.1f} dk) · **Anlatım hızı:** {WPS} kelime/sn\n"

# ---- 01 senaryo ---------------------------------------------------------------------------------
L = ["# 1 · Tam Türkçe senaryo", "", HEAD,
     "> Bu belge `scenes.json`'dan üretilir. Olgusal her iddia `10_kaynakca_dogruluk.md` içinde kaynağıyla ve güven düzeyiyle listelenmiştir.", ""]
for ch, title in CHAPTERS.items():
    L += [f"## Bölüm {ch} — {title}", ""]
    for s in SCENES:
        if s["chapter"] == ch:
            L += [f"**[{s['id']} · {tc(s['t0'])}] {s['title']}**", "", s["narration"], "",
                  f"*Görsel:* {s.get('subject') or s['shots'][0]}", ""]
w("01_senaryo.md", "\n".join(L))

# ---- 02 zaman kodlu seslendirme + srt + tts -------------------------------------------------------
L = ["# 2 · Zaman kodlu seslendirme metni", "", HEAD,
     "Zamanlar kelime sayısından tahmin edilmiştir. **Gerçek ses kaydı alındıktan sonra** `tools` ile ölçülen süreler kullanılmalı ve "
     "kurgu bu sürelere göre kilitlenmelidir (bkz. `06_kurgu_zaman_cizelgesi.md`).", "",
     "| Giriş | Çıkış | Sahne | Sn | Kelime | Anlatım (ekran yazımı) |", "|---|---|---|---|---|---|"]
for s in SCENES:
    L.append(f"| {tc(s['t0'], True)} | {tc(s['t1'], True)} | {s['id']} | {s['dur']:.1f} | {s['words']} | {s['narration']} |")
L += ["", "## Telaffuz notları (TTS / seslendirmen)", "", "| Yazım | Okunuş |", "|---|---|"]
used = {k: v for k, v in PRON.items() if any(re.search(rf"\b{re.escape(k)}", s["narration"]) for s in SCENES) and k != v}
L += [f"| {k} | {v} |" for k, v in sorted(used.items())]
L += ["", "Ses: doğal, orta tempo, sinematik ama yapay dramatik olmayan bir Türkçe anlatıcı. Cümle sonlarında 0,4–0,6 sn nefes payı bırakın."]
w("02_seslendirme_zaman_kodlu.md", "\n".join(L))

srt, n = [], 1
for s in SCENES:
    sentences = [x for x in re.split(r"(?<=[.!?])\s+", s["narration"]) if x]
    tot_w = sum(len(x.split()) for x in sentences) or 1
    cur = s["t0"]
    for x in sentences:
        d = s["dur"] * len(x.split()) / tot_w
        srt.append(f"{n}\n{srt_tc(cur)} --> {srt_tc(cur + d)}\n{x}\n")
        cur += d
        n += 1
w("02_altyazi_tahmini.srt", "\n".join(srt))
w("02_tts_metni.txt", "\n\n".join(f"[{s['id']}] {tts(s['narration'])}" for s in SCENES))

# ---- 03 storyboard ------------------------------------------------------------------------------
L = ["# 3 · Sahne sahne storyboard", "", HEAD,
     "Her plan 3–6 sn hedeflenir; ortalama süreleri aşağıda gösterilmiştir. Arşiv ve harita planlarında bu aralık kuralı gevşetilebilir (bilinçli not düşülmüştür).", ""]
flag_notes = []
for s in SCENES:
    shots = shot_times(s)
    avg = (s["slot_end"] - s["t0"]) / len(shots)
    mark = "" if 3 <= avg <= 6 else "  ⚠"
    if mark:
        flag_notes.append(f"{s['id']}: ortalama plan {avg:.1f} sn")
    kind = "HARİTA/GRAFİK (veriden üretilir)" if s["asset_mode"] == "build" else "gerçek görüntü araması (assetlib), son çare etiketli AI"
    L += [f"## {s['id']} · {s['title']}  _(Bölüm {s['chapter']} — {s['chapter_title']})_", "",
          f"- **Zaman:** {tc(s['t0'], True)} – {tc(s['slot_end'], True)} ({s['slot_end'] - s['t0']:.1f} sn, {len(shots)} plan, ort. {avg:.1f} sn{mark})",
          f"- **Tür:** {kind}",
          f"- **Konu / ortam / dönem / ruh hâli:** {s.get('subject', '—')} / {s.get('environment', '—')} / {s.get('period', '—')} / {s.get('mood', '—')}",
          f"- **Anlatım:** {s['narration']}",
          f"- **Kamera:** {s['camera']}",
          f"- **Ekran yazısı:** {s['onscreen_text'] or '—'}", "", "| Plan | Giriş | Çıkış | Kompozisyon |", "|---|---|---|---|"]
    L += [f"| {i} | {tc(a, True)} | {tc(b, True)} | {desc} |" for i, (a, b, desc) in enumerate(shots, 1)]
    if s.get("notes"):
        L += ["", f"> Not: {s['notes']}"]
    L.append("")
if flag_notes:
    L += ["---", "**3–6 sn aralığı dışında kalan sahneler:** " + "; ".join(flag_notes)]
w("03_storyboard.md", "\n".join(L))

# ---- 04 görsel promptlar ------------------------------------------------------------------------
NEG = ("text, captions, watermark, logo, signature, distorted hands, extra limbs, modern buildings in historical scenes, "
       "wrong country flags, invented faces of real historical people, oversaturated colors, HDR halos, cartoon look")
L = ["# 4 · Sahne başına görsel üretim promptları", "", HEAD, "## Kural sırası (her sahne için)", "",
     "1. **Önce gerçek materyal:** `queries` ve kaynak sırasıyla `assetlib` ile aranır; lisansı ve konumu doğrulanmış gerçek görüntü tercih edilir.",
     "2. **Bulunamazsa raporla:** sahne `unfilled`/`needs_review` kalır, hiçbir ilgisiz klip sessizce konmaz.",
     "3. **Son çare yapay zekâ:** aşağıdaki İngilizce prompt yalnızca bu durumda kullanılır; çıktı *AI-generated* olarak etiketlenir, "
     "gerçek görüntü gibi sunulmaz, gerçekçi sentetik içerik için YouTube'un 'değiştirilmiş/sentetik içerik' beyanı işaretlenir.",
     "4. **Harita sahneleri üretken modelle ÇİZİLMEZ** (yanlış sınır riski): `05_harita_grafik_teknik.md` içindeki veri tabanlı tarifler kullanılır.",
     "5. **Tarihî kişilerin yüzü uydurulmaz;** gerçek arşiv portresi yoksa siluet/gravür tarzı kullanılır.", "",
     f"**Ortak negatif prompt:** `{NEG}`", "", "**Ortak teknik:** 16:9, en az 3840×2160 üret, 1920×1080'e düşür; yavaş kamera hareketi için kenarlarda %12 pay bırak.", ""]
for s in SCENES:
    L += [f"## {s['id']} · {s['title']}", ""]
    if s["asset_mode"] == "build":
        L += [f"*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **{s['spec_ref']}** (`05_harita_grafik_teknik.md`).", ""]
        continue
    qs = {k: v for k, v in s["queries"].items()}
    L += [f"- **Gerçek materyal arama:** " + "; ".join(f"`{k}`: {', '.join(v)}" for k, v in qs.items()),
          f"- **Tercih / kabul edilen tür:** {s['media_preference']} / {', '.join(s.get('accept_types') or [s['media_preference']])} · en az {s['min_height']}p · {s['clips_needed']} klip",
          f"- **Zorunlu eşleşme (metaveri):** " + " ∧ ".join("(" + " ∨ ".join(g) + ")" for g in s["must"]),
          f"- **Kaçınılacak:** {', '.join(s.get('avoid', [])) or '—'}", "",
          "**Son çare yapay zekâ promptu (İngilizce):**", "", f"> {s['ai_prompt']}", ""]
w("04_gorsel_promptlar.md", "\n".join(L))

# ---- 05 harita ve grafik teknik -----------------------------------------------------------------
specs = {}
for s in SCENES:
    if s["asset_mode"] == "build":
        specs.setdefault(s["spec_ref"], []).append(s)
L = ["# 5 · Harita ve grafik animasyonlarının teknik tarifleri", "", HEAD, "## Ortak ilkeler", "",
     "- **Tek doğru kaynak:** Natural Earth 1:10m `admin_0_countries` (kamu malı). Sınırlar elle çizilmez; her render aynı GeoJSON'dan üretilir.",
     "- **Doğrulama:** `python3 -I tools/verify_geography.py <geojson>` — Lesotho'nun tek poligon, tamamı Güney Afrika ile ortak köşeli ve başka komşusu olmayan bir enklav olduğunu hesaplar (sonuç: `geo_verification.json`).",
     "- **Alan farkı notu:** Hesaplanan alan ≈30.143 km², resmî/Factbook değeri 30.355 km² (≈%0,7 fark: genelleştirilmiş çizim + küresel yaklaşım). Anlatımda rakam yuvarlanır ('yaklaşık otuz bin').",
     "- **Sınır uzunluğu:** Kaynaklar arası fark büyük (≈909 km ↔ 1.106 km) ve genelleştirilmiş çizimde ölçüm 785 km çıkar; bu yüzden anlatımda sınır uzunluğu **kullanılmaz**.",
     "- **Teknik yığın önerisi:** Remotion + d3-geo (sabit projeksiyon, deterministik kare üretimi) ya da Python/cartopy → PNG dizisi. 1920×1080, 25 fps, renk: orman yeşili `#1F4D3A`, krem `#F4EEDD`, altın vurgu `#D9A441`, nehir `#4A7FA7`.",
     "- **Hareket:** easing = cubic in-out; çizgi çizimi `stroke-dashoffset`; zoom başına en çok 12 sn; metin 24 px üstü, güvenli alan %5.",
     "- **Etiketleme:** tarihî haritalarda 'şematik' / 'yaklaşık' damgası; belirsiz sınır asla keskin çizgiyle gösterilmez.",
     "- **Uydu dokusu:** NASA Visible Earth/Blue Marble (kamu malı; kaynak kaydı `assetlib register-manual` ile) veya Copernicus Sentinel-2 (atıf).", ""]
for ref, ss in sorted(specs.items()):
    L += [f"## {ref} — " + " / ".join(f"{x['id']} {x['title']}" for x in ss), ""]
    for x in ss:
        L += [f"**{x['id']}** · {tc(x['t0'], True)}–{tc(x['slot_end'], True)} · kamera: {x['camera']}", "",
              f"- Teknik tarif: {x['map_spec']}", "- Planlar: " + " → ".join(x["shots"]), f"- Ses efekti: {x['sfx']}", ""]
w("05_harita_grafik_teknik.md", "\n".join(L))

# ---- 06 kurgu zaman çizelgesi + ses -------------------------------------------------------------
L = ["# 6 · Kurgu zaman çizelgesi ve ses efektleri", "", HEAD, "## Kanal düzeni", "",
     "| Kanal | İçerik |", "|---|---|",
     "| V1 | Ana görsel (klip / harita render) |", "| V2 | Grafik, tarih kartı, ekran yazısı |",
     "| V3 | Film greni, vinyet, hafif ışık sızıntısı (arşiv sahnelerinde) |",
     "| A1 | Seslendirme (−16 LUFS entegre hedef) |", "| A2 | Müzik (anlatımın altında −22 dB, boşlukta −14 dB) |",
     "| A3 | Ortam sesi (rüzgâr, şehir, su) |", "| A4 | Tasarım efektleri (whoosh, tick, hit) |", "",
     "**Müzik yönü:** sade, düşük tempolu orkestral/ambient; Bölüm 1 merak (pad + sub), Bölüm 3–4 dönemsel (çello, davul), "
     "Bölüm 5 umut ama belirsiz, Bölüm 6 ferah (piyano, açık tını), Bölüm 7 ekonomik gerilim, Bölüm 8 çözülen akor. "
     "Müzik **lisanslı/telifsiz ve kaydı tutulmuş** olmalı (aynı `assetlib` metaveri kuralı: kaynak, lisans, URL).", "",
     "**Geçişler:** harita ↔ harita 8 kare çapraz çözülme; bölüm başında 12 kare siyaha dip; arşiv sahnelerine girerken film greni 6 kare artar.", "",
     "## Zaman çizelgesi", "", "| Zaman | Sahne | Ana görsel | Ses efekti / ortam | Ekran yazısı |", "|---|---|---|---|---|"]
for s in SCENES:
    vis = "Harita/grafik render" if s["asset_mode"] == "build" else s["subject"]
    L.append(f"| {tc(s['t0'], True)}–{tc(s['slot_end'], True)} | {s['id']} {s['title']} | {vis} | {s['sfx']} | {s['onscreen_text'] or '—'} |")
L += ["", f"**Toplam:** {tc(TOTAL, True)}. Bölüm sınırları:"]
for ch, title in CHAPTERS.items():
    first = next(x for x in SCENES if x["chapter"] == ch)
    L.append(f"- Bölüm {ch} — {title}: {tc(first['t0'])}")
L += ["", "**Chapter (YouTube bölüm) işaretleri:** " + " · ".join(f"{tc(next(x for x in SCENES if x['chapter'] == c)['t0'])} {t}" for c, t in CHAPTERS.items())]
w("06_kurgu_zaman_cizelgesi.md", "\n".join(L))

print(f"{len(SCENES)} sahne · {sum(s['words'] for s in SCENES)} kelime · toplam {tc(TOTAL)} ({TOTAL / 60:.2f} dk)")
if flag_notes:
    print("3-6 sn dışı:", "; ".join(flag_notes))
