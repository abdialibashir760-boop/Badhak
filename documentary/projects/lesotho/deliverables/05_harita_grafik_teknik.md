# 5 · Harita ve grafik animasyonlarının teknik tarifleri

**Proje:** Haritanın Ötesinde #1 — Güney Afrika'nın İçindeki Bağımsız Ülke: Lesotho  
**Format:** 16:9 1920x1080, 25 fps · **Tahmini süre:** 07:45 (7.8 dk) · **Anlatım hızı:** 2.3 kelime/sn

## Ortak ilkeler

- **Tek doğru kaynak:** Natural Earth 1:10m `admin_0_countries` (kamu malı). Sınırlar elle çizilmez; her render aynı GeoJSON'dan üretilir.
- **Doğrulama:** `python3 -I tools/verify_geography.py <geojson>` — Lesotho'nun tek poligon, tamamı Güney Afrika ile ortak köşeli ve başka komşusu olmayan bir enklav olduğunu hesaplar (sonuç: `geo_verification.json`).
- **Alan farkı notu:** Hesaplanan alan ≈30.143 km², resmî/Factbook değeri 30.355 km² (≈%0,7 fark: genelleştirilmiş çizim + küresel yaklaşım). Anlatımda rakam yuvarlanır ('yaklaşık otuz bin').
- **Sınır uzunluğu:** Kaynaklar arası fark büyük (≈909 km ↔ 1.106 km) ve genelleştirilmiş çizimde ölçüm 785 km çıkar; bu yüzden anlatımda sınır uzunluğu **kullanılmaz**.
- **Teknik yığın önerisi:** Remotion + d3-geo (sabit projeksiyon, deterministik kare üretimi) ya da Python/cartopy → PNG dizisi. 1920×1080, 25 fps, renk: orman yeşili `#1F4D3A`, krem `#F4EEDD`, altın vurgu `#D9A441`, nehir `#4A7FA7`.
- **Hareket:** easing = cubic in-out; çizgi çizimi `stroke-dashoffset`; zoom başına en çok 12 sn; metin 24 px üstü, güvenli alan %5.
- **Etiketleme:** tarihî haritalarda 'şematik' / 'yaklaşık' damgası; belirsiz sınır asla keskin çizgiyle gösterilmez.
- **Uydu dokusu:** NASA Visible Earth/Blue Marble (kamu malı; kaynak kaydı `assetlib register-manual` ile) veya Copernicus Sentinel-2 (atıf).

## M1 — s01 Haritada küçük boşluk / s26 Haritaya dönüş

**s01** · 00:00.00–00:15.28 · kamera: Uydu açısından (≈4000 km) ülke ölçeğine ve ardından Lesotho'ya 12 saniyede ease-in-out zoom.

- Teknik tarif: Natural Earth 1:10m admin-0 + admin-1 (kamu malı). Orthographic → Mercator geçişi yerine sabit Lambert Azimuthal Equal Area (merkez 29°G 28°D). Güney Afrika dolgusu krem tonu, çevre ülkeler soluk. Lesotho sınırı yalnızca Natural Earth verisinden; elle çizim yok. Uydu dokusu: NASA Blue Marble / Visible Earth (kamu malı) ya da Sentinel-2 kompozit (Copernicus, serbest kullanım; atıf gerekir).
- Planlar: Siyah ekrandan uydu görünümüyle Güney Afrika'nın açılışı → Yavaş yakınlaşma: ülke sınırı çizgisi kendini çizer → Doğu iç kesimde küçük bölge beliriyor, çevresi hafif kararır → Lesotho sınırı altın çizgiyle vurgulanır → Bayrak, taç ve para birimi simgeleri sırayla belirir
- Ses efekti: Düşük frekanslı 'sub' yükselişi; çizgi çizilirken ince 'tick' sesi; sonda yumuşak bir 'hit'.

**s26** · 07:12.92–07:33.85 · kamera: s01'in zoom'unun tersi (8 sn).

- Teknik tarif: M1 ile aynı kadraj ve veri; yalnızca katman animasyonu tersine işler.
- Planlar: Açılıştaki harita kadrajına dönüş → Lesotho çevresi parlayarak tamamlanır → Tarihî çizgiler (1869, 1966) ince katmanlar hâlinde belirir → Kadraj geri çekilir
- Ses efekti: Açılıştaki sub sesinin yumuşak tersi, hafif 'resolve' akoru.

## M2 — s03 Üç ülke, tamamen çevrili

**s03** · 00:31.87–00:47.15 · kamera: Düz harita üzerinde yumuşak pan + 2 kesme; kesmelerde 8 kare çapraz çözülme.

- Teknik tarif: Üç ayrı kadraj: (1) Lesotho/Güney Afrika, (2) İtalya ağırlıklı Roma–San Marino, (3) karşılaştırma kartı: üç ülke ölçekli siluet (Lesotho ≈30.355 km², San Marino ≈61 km², Vatikan ≈0,44 km²). Aynı ölçek çubuğu; veri Natural Earth 1:10m. Vatikan/San Marino çok küçük olduğundan büyütülmüş 'lupa' dairesi kullanılır, lupa açıkça etiketlenir.
- Planlar: Afrika haritasında güney ucuna yakınlaşma → Lesotho ve çevreleyen Güney Afrika vurgulanır → Avrupa'ya geçiş: İtalya içinde San Marino ve Vatikan işaretlenir → Üç enklav yan yana, ölçekli karşılaştırma kartı → Tekrar Lesotho'ya dönüş
- Ses efekti: Harita işaretçileri için kısa 'pop' sesleri; geçişlerde hafif 'whoosh'.

## M3 — s06 Büyük kargaşa: Difaqane

**s06** · 01:16.41–01:28.21 · kamera: Sabit kadraj, oklar 3 sn'de çizilir; her ok farklı gecikmeyle.

- Teknik tarif: Yalnızca ŞEMATİK oklar; kesin rota iddiası yoktur ve ekranda 'şematik' yazar. Sınır çizgisi YOK (1820'lerde bugünkü sınırlar yoktu); bugünkü kıyı şeridi ve nehirler ince gri olarak referans verilir. Kaynak: Natural Earth kıyı/nehir katmanları.
- Planlar: Sade, dönem tonunda güney Afrika haritası → Ok animasyonları: toplulukların hareketi (şematik) → Kronolojik şerit 1820'ler; 'tartışmalı' notu belirir
- Ses efekti: Uzaktan davul (çok kısık), ok çizimi sırasında kâğıt sürtme sesi.

## M4 — s10 Yeni komşular: Boer cumhuriyetleri

**s10** · 02:10.57–02:24.98 · kamera: Sabit kadraj, katmanlar sırayla açılır.

- Teknik tarif: Tarihî sınırlar için güvenilir, atıflı tarihî harita verisi gerekir (ör. LOC/Commons'taki tarihî haritaların geo-referanslı hâli). Bulunana kadar yalnızca nehir ve şematik bölge balonları kullanılır; keskin sınır çizgisi ÇİZİLMEZ. 'Bölge yaklaşıktır' notu ekranda kalır.
- Planlar: Dönem haritası: Kap Kolonisi, Natal, Orange Özgür Devleti, Basotho toprakları → Boer göçünün şematik oku → Caledon (Mohokare) Nehri ve verimli ovalar vurgulanır → Çatışma bölgesi için kırmızı hatlı işaret
- Ses efekti: Kâğıt haritaya dokunma sesi, kısık davul darbesi.

## M5 — s11 Koruma talebi ve Aliwal North

**s11** · 02:24.98–02:48.52 · kamera: Yavaş zoom; çizgi çizimi 4 sn; karşılaştırma için çapraz çözülme.

- Teknik tarif: 1869 sınırının kanıta dayalı koordinatı: tarihî sözleşme tanımı + bugünkü Lesotho batı sınırı (Natural Earth). Aralarındaki küçük farklar not edilir; kaynak: akademik/arşiv harita. 'Kaybedilen ovalar' poligonu yalnızca güvenilir bir tarihî harita kaynağından dijitalleştirilir ve ekranda 'yaklaşık' etiketi taşır. Çift doğrulama (iki bağımsız kaynak) olmadan yayımlanmaz.
- Planlar: 1868 kartı: 'İngiliz himayesi' damgası → Eski harita dokusunun üzerinde 1869 çizgisi çizilir → Kaybedilen ovalar şeffaf kırmızı tonla işaretlenir → Bugünkü sınırla karşılaştırma: çizgiler örtüşür → Sonda bugünkü Lesotho silüeti dolgulanır
- Ses efekti: Mühür/damga sesi, kalem çizgisi, hafif yeraltı gümbürtüsü.

## M6 — s15 Egemenlik ne demek?

**s15** · 03:46.11–04:09.22 · kamera: Sabit, ikonlar sırayla 'pop'.

- Teknik tarif: Bayrak: Wikimedia Commons'taki kamu malı SVG (2006 bayrağı) — lisansı doğrulanarak kullanılır. İkonlar: lisanslı açık kaynak ikon seti ya da özgün çizim. Eyalet–ülke karşılaştırması: Free State ile Lesotho'nun yan yana Natural Earth siluetleri.
- Planlar: Lesotho bayrağı sade grafik animasyonla belirir → 'Kendi yasası' ikonu → 'Kendi hükümeti' ikonu → 'BM'de kendi sandalyesi' ikonu → Eyalet haritası ile ülke haritası yan yana — fark kartı
- Ses efekti: Yumuşak 'pop' ve tek davul vuruşu; bayrak kıpırtısı.

## M7 — s25 Egemenlik ≠ bağımsız etki

**s25** · 06:49.81–07:12.92 · kamera: Sabit harita; ok çizimleri 2 sn.

- Teknik tarif: Yalnızca şematik oklar ve metin kartı; arşiv görseli kullanılırsa lisansı ve bağlamı doğrulanmış olmalı. Olay anlatımı: SADC adına Güney Afrika ve Botsvana güçleri; müdahalenin meşruiyeti ve yöntemi tartışmalıdır — ekranda 'tartışmalı' ifadesi kalır.
- Planlar: 1998 tarih kartı → Harita: Lesotho'ya giren iki ok (şematik) → 'Tartışmalı' damgası → Metin kartı: Egemenlik ≠ etkisizlik
- Ses efekti: Düşük 'tension' pad, tek davul darbesi.
