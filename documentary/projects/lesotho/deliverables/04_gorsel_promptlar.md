# 4 · Sahne başına görsel üretim promptları

**Proje:** Haritanın Ötesinde #1 — Güney Afrika'nın İçindeki Bağımsız Ülke: Lesotho  
**Format:** 16:9 1920x1080, 25 fps · **Tahmini süre:** 07:45 (7.8 dk) · **Anlatım hızı:** 2.3 kelime/sn

## Kural sırası (her sahne için)

1. **Önce gerçek materyal:** `queries` ve kaynak sırasıyla `assetlib` ile aranır; lisansı ve konumu doğrulanmış gerçek görüntü tercih edilir.
2. **Bulunamazsa raporla:** sahne `unfilled`/`needs_review` kalır, hiçbir ilgisiz klip sessizce konmaz.
3. **Son çare yapay zekâ:** aşağıdaki İngilizce prompt yalnızca bu durumda kullanılır; çıktı *AI-generated* olarak etiketlenir, gerçek görüntü gibi sunulmaz, gerçekçi sentetik içerik için YouTube'un 'değiştirilmiş/sentetik içerik' beyanı işaretlenir.
4. **Harita sahneleri üretken modelle ÇİZİLMEZ** (yanlış sınır riski): `05_harita_grafik_teknik.md` içindeki veri tabanlı tarifler kullanılır.
5. **Tarihî kişilerin yüzü uydurulmaz;** gerçek arşiv portresi yoksa siluet/gravür tarzı kullanılır.

**Ortak negatif prompt:** `text, captions, watermark, logo, signature, distorted hands, extra limbs, modern buildings in historical scenes, wrong country flags, invented faces of real historical people, oversaturated colors, HDR halos, cartoon look`

**Ortak teknik:** 16:9, en az 3840×2160 üret, 1920×1080'e düşür; yavaş kamera hareketi için kenarlarda %12 pay bırak.

## s01 · Haritada küçük boşluk

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M1** (`05_harita_grafik_teknik.md`).

## s02 · Ana soru

- **Gerçek materyal arama:** `*`: Lesotho mountains sunrise, Maloti mountains aerial, Drakensberg clouds; `commons`: Maloti Mountains Lesotho, Drakensberg escarpment panorama
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 1 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ maloti ∨ maluti ∨ drakensberg ∨ basutoland)
- **Kaçınılacak:** silhouette woman, wedding

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic cinematic aerial view of the Maloti Mountains of Lesotho at dawn, layered ridgelines above a low sea of clouds, warm gold light on basalt escarpments, subtle haze, no people, no text, no buildings, 35mm film look, 16:9, high detail, natural colors.

## s03 · Üç ülke, tamamen çevrili

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M2** (`05_harita_grafik_teknik.md`).

## s04 · Büyüklük ve nüfus

- **Gerçek materyal arama:** `*`: Lesotho aerial highlands, Lesotho valley village aerial, Lesotho landscape; `commons`: Lesotho landscape highlands, Lesotho aerial
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 1 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ maloti ∨ maluti ∨ basutoland) ∧ (landscape ∨ valley ∨ mountain ∨ highland ∨ village ∨ aerial ∨ plateau)
- **Kaçınılacak:** safari, lion

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic aerial drone shot over a high-altitude valley in Lesotho: scattered round thatched-roof houses, terraced fields, a winding dirt track, tawny grassland and dark basalt cliffs, late-afternoon side light, long shadows, no logos, no text, 16:9 cinematic.

## s05 · Tek halk, tek dil

- **Gerçek materyal arama:** `*`: Basotho people, Basotho blanket, Lesotho villagers; `commons`: Basotho people Lesotho, Basotho man blanket
- **Tercih / kabul edilen tür:** image / image, video · en az 1080p · 2 klip
- **Zorunlu eşleşme (metaveri):** (basotho ∨ lesotho ∨ sesotho ∨ mosotho ∨ basutoland)
- **Kaçınılacak:** tourist selfie, dating

**Son çare yapay zekâ promptu (İngilizce):**

> Documentary-style photograph of a Basotho herder in a traditional wool blanket and conical straw hat, standing on a grassy mountain slope in Lesotho, seen from medium distance, soft overcast light, shallow depth of field, respectful composition, no text, 16:9.

## s06 · Büyük kargaşa: Difaqane

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M3** (`05_harita_grafik_teknik.md`).

## s07 · Moshoeshoe I

- **Gerçek materyal arama:** `*`: Moshoeshoe I, Moshoeshoe king Basuto, Moshweshwe Basutoland; `commons`: Moshoeshoe I, Moshweshwe, King Moshoeshoe 1860s
- **Tercih / kabul edilen tür:** image / image · en az 720p · 1 klip
- **Zorunlu eşleşme (metaveri):** (moshoeshoe ∨ moshweshwe ∨ moshesh ∨ moshoeshoe i)
- **Kaçınılacak:** moshoeshoe ii, letsie iii, stadium, airport, school, street

**Son çare yapay zekâ promptu (İngilizce):**

> Engraving-style 19th-century illustration of a faceless silhouette of a Southern African king in a cloak standing on a flat-topped mountain at dusk, cross-hatched lines, sepia ink on aged paper, no facial details, no text, vertical grain, 16:9.

## s08 · Thaba Bosiu kalesi

- **Gerçek materyal arama:** `*`: Thaba Bosiu, Thaba Bosiu Lesotho mountain, Casalis Basutoland mission; `commons`: Thaba Bosiu, Thaba-Bosiu Lesotho
- **Tercih / kabul edilen tür:** image / image, video · en az 1080p · 2 klip
- **Zorunlu eşleşme (metaveri):** (thaba bosiu ∨ thaba-bosiu ∨ thaba bosigo ∨ casalis ∨ morija)
- **Kaçınılacak:** hotel, restaurant

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic wide shot of Thaba Bosiu, a flat-topped sandstone mountain plateau in Lesotho, steep cliffs, golden hour light, grassland foreground, long cast shadows, no people, no signage, no text, 16:9 cinematic.

## s09 · Dağ ve diplomasi

- **Gerçek materyal arama:** `*`: Eugene Casalis, Morija mission Lesotho, Paris Evangelical Missionary Society Basutoland, Moshoeshoe letter; `commons`: Eugène Casalis, Morija Lesotho mission, Moshoeshoe letter
- **Tercih / kabul edilen tür:** image / image, map · en az 720p · 2 klip
- **Zorunlu eşleşme (metaveri):** (casalis ∨ morija ∨ moshoeshoe ∨ moshweshwe ∨ basutoland mission ∨ paris evangelical)
- **Kaçınılacak:** school uniform, church wedding

**Son çare yapay zekâ promptu (İngilizce):**

> Engraving-style 19th-century illustration of a desk with a handwritten letter, quill and ink, lit by a candle, in a simple mission study with a window opening to a flat-topped mountain, cream paper texture, fine line work, no readable text, no faces, 16:9.

## s10 · Yeni komşular: Boer cumhuriyetleri

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M4** (`05_harita_grafik_teknik.md`).

## s11 · Koruma talebi ve Aliwal North

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M5** (`05_harita_grafik_teknik.md`).

## s12 · Kap Kolonisi, Silahlar Savaşı, taç yönetimi

- **Gerçek materyal arama:** `*`: Basutoland 1880, Basuto Gun War, Basutoland horsemen, Basuto warriors; `commons`: Basutoland 19th century, Gun War 1880 Basuto
- **Tercih / kabul edilen tür:** image / image, map · en az 720p · 3 klip
- **Zorunlu eşleşme (metaveri):** (basutoland ∨ basuto ∨ basotho ∨ lesotho)
- **Kaçınılacak:** modern, airport

**Son çare yapay zekâ promptu (İngilizce):**

> 19th-century steel-engraving style illustration of mounted horsemen in blankets crossing a mountain pass in Basutoland, dramatic clouds, fine cross-hatching, sepia and cream paper texture, small figures only with no facial detail, no text, 16:9.

## s13 · 1910 Birlik ve katılım baskısı

- **Gerçek materyal arama:** `*`: Union of South Africa map 1910, Basutoland Bechuanaland Swaziland map, South Africa map 1920s; `commons`: Union of South Africa 1910 map, High Commission Territories map
- **Tercih / kabul edilen tür:** map / map, image · en az 1080p · 1 klip
- **Zorunlu eşleşme (metaveri):** (south africa ∨ union of south africa ∨ basutoland ∨ africa) ∧ (map ∨ atlas ∨ carte ∨ karte)
- **Kaçınılacak:** modern road, satellite

**Son çare yapay zekâ promptu (İngilizce):**

> 

## s14 · 4 Ekim 1966

- **Gerçek materyal arama:** `*`: Basutoland independence 1966, Lesotho independence ceremony, Leabua Jonathan, Moshoeshoe II 1966; `archive`: Lesotho independence, Basutoland; `commons`: Lesotho independence 1966, Moshoeshoe II
- **Tercih / kabul edilen tür:** film / film, image, video · en az 480p · 2 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ basutoland) ∧ (independence ∨ 1966 ∨ ceremony ∨ moshoeshoe ii ∨ jonathan)
- **Kaçınılacak:** 2016, 2021, football

**Son çare yapay zekâ promptu (İngilizce):**

> Black-and-white archival newsreel look, wide shot of a crowd gathered in a dusty open ground with a flagpole during a 1960s independence ceremony in southern Africa, soft film grain, vignette, no readable text, no identifiable faces, 4:3 pillarboxed into 16:9.

## s15 · Egemenlik ne demek?

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M6** (`05_harita_grafik_teknik.md`).

## s16 · Gökyüzündeki Krallık

- **Gerçek materyal arama:** `*`: Lesotho mountains, Maloti Drakensberg escarpment, Drakensberg aerial, Thabana Ntlenyana; `commons`: Maloti Mountains, Thabana Ntlenyana, Drakensberg Lesotho
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 3 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ maloti ∨ maluti ∨ drakensberg ∨ thabana ntlenyana)
- **Kaçınılacak:** hotel, wedding

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic cinematic landscape of the Maloti Mountains in Lesotho, towering basalt escarpment above a deep valley, golden grass, scattered clouds casting shadows, wide-angle 24mm, crisp detail, no people, no buildings, no text, 16:9.

## s17 · İklim ve mevsimler

- **Gerçek materyal arama:** `*`: Lesotho snow, Drakensberg snow, Senqu river Lesotho, Orange River source Lesotho; `commons`: Lesotho snow, Senqu River, Orange River Lesotho
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 2 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ maloti ∨ maluti ∨ drakensberg ∨ senqu ∨ orange river)
- **Kaçınılacak:** ski jump, alps, colorado

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic winter scene in the highlands of Lesotho, snow-dusted grass slopes and frozen streams, a distant herder on a pony as a tiny silhouette, soft blue-hour light, mist in valleys, no text, 16:9 cinematic.

## s18 · Köyler ve geleneksel yaşam

- **Gerçek materyal arama:** `*`: Lesotho village, Basotho hat mokorotlo, Basotho blanket herder, Lesotho rondavel; `commons`: Lesotho village, Mokorotlo, Basotho herder, Basotho hat
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 3 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ basotho ∨ maloti ∨ basutoland ∨ sesotho) ∧ (village ∨ herder ∨ blanket ∨ hat ∨ mokorotlo ∨ rondavel ∨ hut ∨ shepherd ∨ sheep ∨ house)
- **Kaçınılacak:** souvenir shop, wedding

**Son çare yapay zekâ promptu (İngilizce):**

> Documentary photograph of a remote Basotho mountain village at early morning: round stone houses with thatched roofs, smoke from chimneys, a flock of sheep on a slope, a herder wrapped in a patterned wool blanket seen from behind, soft morning mist, natural colors, no text, 16:9.

## s19 · Atlar, patikalar, Sani Geçidi

- **Gerçek materyal arama:** `*`: Sani Pass, Basotho pony, Lesotho horse mountain trail, Sani Pass road Lesotho; `commons`: Sani Pass, Basotho pony, Lesotho horse rider
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 3 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ basotho ∨ sani pass ∨ maloti ∨ drakensberg ∨ basutoland) ∧ (pony ∨ horse ∨ pass ∨ road ∨ trail ∨ rider ∨ 4x4 ∨ track)
- **Kaçınılacak:** racing, rodeo

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic aerial view of a switchback dirt road climbing a steep mountain pass in the Drakensberg near the Lesotho border, a lone 4x4 vehicle, a rider on a pony on a side trail, cliff edges, golden hour, no signage or text, 16:9.

## s20 · Maseru

- **Gerçek materyal arama:** `*`: Maseru, Maseru Lesotho city, Maseru bridge border, Lesotho capital; `commons`: Maseru, Maseru Bridge, Caledon River Maseru, Maseru street
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 2 klip
- **Zorunlu eşleşme (metaveri):** (maseru ∨ lesotho capital)
- **Kaçınılacak:** maseru south, maseru texas

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic street-level view of Maseru, Lesotho: low-rise buildings, a busy street with minibus taxis, pedestrians wearing blankets and jackets, distant flat-topped mountains, clear afternoon light, no readable signs or logos, 16:9.

## s21 · Gümrük, para birimi, ulaşım

- **Gerçek materyal arama:** `*`: Maseru Bridge border post, Lesotho border crossing, Lesotho loti banknote, Lesotho trucks border; `commons`: Maseru Bridge border, Lesotho loti, Lesotho banknote
- **Tercih / kabul edilen tür:** image / image, video · en az 1080p · 2 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ maseru ∨ loti ∨ basutoland) ∧ (border ∨ bridge ∨ banknote ∨ note ∨ coin ∨ truck ∨ customs ∨ post)
- **Kaçınılacak:** counterfeit

**Son çare yapay zekâ promptu (İngilizce):**

> Documentary photograph of a small border post with a bridge over a shallow river, trucks waiting, officials at a booth, mountains in the distance, no readable text or flags that could mislead, neutral light, 16:9.

## s22 · Madenler ve göç işçiliği

- **Gerçek materyal arama:** `*`: Witwatersrand gold mine workers, South Africa gold miners history, Basotho migrant miners, Johannesburg gold mine 1950; `commons`: Gold mine South Africa miners, Witwatersrand mine
- **Tercih / kabul edilen tür:** image / image, film, video · en az 720p · 2 klip
- **Zorunlu eşleşme (metaveri):** (south africa ∨ witwatersrand ∨ johannesburg ∨ transvaal ∨ rand) ∧ (mine ∨ miners ∨ mining ∨ gold ∨ shaft)
- **Kaçınılacak:** tour, restaurant, mining equipment advert

**Son çare yapay zekâ promptu (İngilizce):**

> Black-and-white documentary-style photograph of miners in helmets near a mine shaft headgear in the Witwatersrand, dusty light, grain, small figures with no identifiable faces, mid-20th-century look, no text, 16:9.

## s23 · Su, baraj, elmas, tekstil

- **Gerçek materyal arama:** `*`: Katse Dam, Lesotho Highlands Water Project, Mohale Dam, Letseng diamond mine, Lesotho garment factory; `commons`: Katse Dam, Lesotho Highlands Water Project, Mohale Dam, Letšeng diamond mine
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 3 klip
- **Zorunlu eşleşme (metaveri):** (katse ∨ mohale ∨ lesotho highlands ∨ letseng ∨ lesotho) ∧ (dam ∨ reservoir ∨ water ∨ tunnel ∨ mine ∨ diamond ∨ factory ∨ garment ∨ textile)
- **Kaçınılacak:** hoover dam, three gorges

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic aerial view of a large concrete arch dam in a mountain gorge in Lesotho with a long turquoise reservoir behind it, steep brown hills, clear sky, tiny maintenance vehicles on the crest, no text or logos, 16:9.

## s24 · Bağımsızlık refah garantisi değildir

- **Gerçek materyal arama:** `*`: Lesotho erosion, Lesotho farmland, Lesotho subsistence farming, Lesotho gully erosion; `commons`: Lesotho erosion, Lesotho agriculture, Lesotho maize field
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 2 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ basotho ∨ maloti ∨ basutoland) ∧ (erosion ∨ farm ∨ field ∨ agriculture ∨ maize ∨ crop ∨ gully ∨ pasture ∨ farmer)
- **Kaçınılacak:** tourist, wedding

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic documentary shot of eroded hillsides with deep gullies and small terraced fields in the Lesotho highlands, a distant farmer with an ox, dry golden light, honest and dignified framing, no text, 16:9.

## s25 · Egemenlik ≠ bağımsız etki

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M7** (`05_harita_grafik_teknik.md`).

## s26 · Haritaya dönüş

*Harita/grafik sahnesi — üretken prompt yok.* Teknik tarif: **M1** (`05_harita_grafik_teknik.md`).

## s27 · Son söz

- **Gerçek materyal arama:** `*`: Lesotho sunset, Maloti mountains sunset, Lesotho shepherd sunset, Drakensberg sunset; `commons`: Lesotho sunset, Maloti sunset
- **Tercih / kabul edilen tür:** video / video, image · en az 1080p · 1 klip
- **Zorunlu eşleşme (metaveri):** (lesotho ∨ maloti ∨ maluti ∨ drakensberg ∨ basotho)
- **Kaçınılacak:** wedding, couple

**Son çare yapay zekâ promptu (İngilizce):**

> Photorealistic cinematic sunset over the Maloti Mountains of Lesotho, a tiny silhouetted herder with a flock on a ridge, layered mountain ridgelines in warm orange and violet haze, gentle clouds, no text, 16:9.
