"""Apollo 13 — Turkish narration (same line ids and sound design as the English story).

Voice: Piper `tr_TR-fahrettin-medium` (offline). Pass the .onnx path as the model argument.
`say` uses phonetic respellings where the Turkish voice would mispronounce foreign names
(Lovell -> Lovel, Haise -> Hayz, Swigert -> Svaygırt, Mattingly -> Metingli, Houston -> Hyuston,
Aquarius -> Akuaryus). Distances are given in kilometres (205,000 miles ≈ 330,000 km).
"""
from stories.apollo13 import sound  # noqa: F401  (same cues, keyed by line id)

ID = "apollo13-tr"
SRC_DIR = "apollo13"
TIMELINE_FILE = "timeline.tr.ts"
ENGINE = "piper"
LENGTH_SCALE = 1.1  # >1 = slower
LEAD = 0.5
TAIL = 4.5

# (id, spoken text, on-screen caption, pause after in seconds)
LINES = [
    ("h1", "Dünyadan üç yüz binden fazla kilometre uzakta, üç astronot bir patlama sesi duydu.", "300.000 KM'DEN FAZLA UZAKTA, BİR PATLAMA SESİ DUYDULAR", 0.3),
    ("h2", "Uzay aracı ölüyordu.", "UZAY ARACI ÖLÜYORDU", 0.25),
    ("h3", "Ay'a iniş iptal edildi.", "AY'A İNİŞ İPTAL EDİLDİ", 0.25),
    ("h4", "Artık tek hedef, sağ salim eve dönmekti.", "ARTIK TEK HEDEF SAĞ SALİM EVE DÖNMEKTİ", 0.6),
    ("s1", "Bu, Apollo on üç.", "BU, APOLLO 13", 0.3),
    ("s2", "On bir Nisan bin dokuz yüz yetmişte fırlatıldı.", "11 NİSAN 1970'TE FIRLATILDI", 0.25),
    ("s3", "NASA'nın Ay'a üçüncü iniş görevi olacaktı.", "NASA'NIN AY'A ÜÇÜNCÜ İNİŞ GÖREVİ OLACAKTI", 0.4),
    ("s4", "Mürettebat: Jim Lovel, Fred Hayz ve Jack Svaygırt.", "MÜRETTEBAT: LOVELL, HAISE VE SWIGERT", 0.25),
    ("s5", "Swigert, fırlatmadan sadece birkaç gün önce ekibe katılmıştı.", "SWIGERT, FIRLATMADAN BİRKAÇ GÜN ÖNCE KATILMIŞTI", 0.25),
    ("s6", "Başka bir astronot kızamıkçığa maruz kaldığı için görevden alınmıştı.", "BAŞKA BİR ASTRONOT KIZAMIKÇIĞA MARUZ KALMIŞTI", 0.4),
    ("s7", "İki gün boyunca her şey kusursuz gitti.", "İKİ GÜN BOYUNCA HER ŞEY KUSURSUZ GİTTİ", 0.6),
    ("e1", "Sonra, on üç Nisan'da, bir oksijen tankının içinde hasarlı kablolar kıvılcım çıkardı.", "13 NİSAN'DA OKSİJEN TANKINDA HASARLI KABLOLAR KIVILCIM ÇIKARDI", 0.3),
    ("e2", "Tank patladı.", "TANK PATLADI", 0.4),
    ("e3", "Oksijen uzaya sızmaya başladı.", "OKSİJEN UZAYA SIZMAYA BAŞLADI", 0.35),
    ("e4", "Lovel, görev kontrolü telsizle aradı: Hyuston, bir sorunumuz var.", "“HOUSTON, BİR SORUNUMUZ VAR”", 0.35),
    ("e5", "Uzay aracı enerji kaybediyordu ve oksijen neredeyse bitmişti.", "ENERJİ AZALIYORDU. OKSİJEN NEREDEYSE BİTMİŞTİ", 0.6),
    ("l1", "Bu yüzden mürettebat, kimsenin planlamadığı bir şey yaptı.", "MÜRETTEBAT, KİMSENİN PLANLAMADIĞI BİR ŞEY YAPTI", 0.3),
    ("l2", "Ay modülü Akuaryus'a geçtiler.", "AY MODÜLÜ AQUARIUS'A GEÇTİLER", 0.3),
    ("l3", "O modül, iki kişiyi iki gün hayatta tutmak için yapılmıştı.", "İKİ KİŞİYİ İKİ GÜN YAŞATMAK İÇİN YAPILMIŞTI", 0.3),
    ("l4", "Şimdi ise üç kişiyi dört gün hayatta tutmak zorundaydı.", "ŞİMDİ ÜÇ KİŞİYİ DÖRT GÜN YAŞATMALIYDI", 0.4),
    ("l5", "Enerji tasarrufu için neredeyse her şeyi kapattılar.", "ENERJİ İÇİN NEREDEYSE HER ŞEYİ KAPATTILAR", 0.3),
    ("l6", "Kabin dondurucu derecede soğudu.", "KABİN DONMA NOKTASINA YAKLAŞTI", 0.3),
    ("l7", "Su, sıkı bir şekilde karneye bağlandı.", "SU KARNEYE BAĞLANDI", 0.6),
    ("t1", "Görev kontrolü, Ay'ın çekim gücünü kullanarak aracı Ay'ın çevresinden dolandırıp Dünya'ya doğru yönlendirdi.", "AY'IN ÇEKİM GÜCÜYLE ARACI DÜNYA'YA DOĞRU YÖNLENDİRDİLER", 0.3),
    ("t2", "Ay'ın arka yüzünü dolaştılar.", "AY'IN ARKA YÜZÜNÜ DOLAŞTILAR", 0.3),
    ("t3", "Dünya'dan, insanların şimdiye kadar ulaştığı en uzak noktaya.", "İNSANLARIN ŞİMDİYE KADAR ULAŞTIĞI EN UZAK NOKTA", 0.6),
    ("c1", "Sonra yeni bir tehlike ortaya çıktı: karbondioksit.", "SONRA YENİ BİR TEHLİKE: KARBONDİOKSİT", 0.3),
    ("c2", "Ay modülünün filtreleri dolmaya başlamıştı.", "AY MODÜLÜNÜN FİLTRELERİ DOLUYORDU", 0.3),
    ("c3", "Komuta modülündeki yedek filtreler ise yanlış şekildeydi.", "YEDEK FİLTRELERİN ŞEKLİ UYMUYORDU", 0.35),
    ("c4", "Yerdeki mühendisler, mürettebatın elindeki malzemelerle bir adaptör icat etmek zorundaydı.", "YERDEKİ MÜHENDİSLER BİR ADAPTÖR İCAT ETMEK ZORUNDAYDI", 0.3),
    ("c5", "Bir plastik torba, karton, bir hortum ve tamir bandı.", "PLASTİK TORBA, KARTON, HORTUM VE TAMİR BANDI", 0.35),
    ("c6", "Görev kontrolü adımları telsizden okudu, mürettebat da adaptörü yaptı.", "GÖREV KONTROLÜ ADIMLARI OKUDU. MÜRETTEBAT YAPTI", 0.35),
    ("c7", "İşe yaradı.", "İŞE YARADI", 0.6),
    ("r1", "Bu arada yerdeki ekip, soğumuş komuta modülünü yeniden çalıştıracak bir plan yazdı.", "YER EKİBİ, SOĞUMUŞ KOMUTA MODÜLÜNÜ YENİDEN ÇALIŞTIRACAK BİR PLAN YAZDI", 0.3),
    ("r2", "Görevden alınan astronot Ken Metingli, planı bir simülatörde denedi.", "GÖREVDEN ALINAN KEN MATTINGLY, PLANI SİMÜLATÖRDE DENEDİ", 0.35),
    ("r3", "Atmosfere girmeden önce, mürettebat hasarlı hizmet modülünü bıraktı.", "ATMOSFERE GİRMEDEN ÖNCE HASARLI HİZMET MODÜLÜNÜ BIRAKTILAR", 0.3),
    ("r4", "Bir panelin tamamen uçup gittiğini gördüler.", "BİR PANELİN TAMAMEN UÇUP GİTTİĞİNİ GÖRDÜLER", 0.6),
    ("r5", "Sonra atmosfere giriş başladı ve telsiz sustu.", "SONRA ATMOSFERE GİRİŞ BAŞLADI VE TELSİZ SUSTU", 0.3),
    ("r6", "Sessizlik, kimsenin beklediğinden uzun sürdü.", "SESSİZLİK, BEKLENENDEN UZUN SÜRDÜ", 0.3),
    ("r7", "Görev kontrolü bekledi.", "GÖREV KONTROLÜ BEKLEDİ", 0.5),
    ("r8", "Ve sonunda paraşütler açıldı.", "VE SONUNDA PARAŞÜTLER AÇILDI", 0.6),
    ("r9", "On yedi Nisan'da Apollo on üç, Pasifik Okyanusu'na iniş yaptı.", "17 NİSAN'DA APOLLO 13 PASİFİK'E İNDİ", 0.35),
    ("r10", "Üç astronotun üçü de hayattaydı.", "ÜÇ ASTRONOT DA HAYATTAYDI", 0.4),
    ("r11", "NASA buna başarılı bir başarısızlık dedi.", "NASA BUNA “BAŞARILI BİR BAŞARISIZLIK” DEDİ", 0.5),
    ("r12", "Sıradaki hikâye: su basmış bir mağarada mahsur kalan on üç kişi. Takip et.", "SIRADAKİ: SU BASMIŞ MAĞARADA 13 KİŞİ. TAKİP ET", 0.0),
]
