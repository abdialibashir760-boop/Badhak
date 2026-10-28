"""Quecreek mine rescue — Turkish narration (same line ids and sound design as the English story).

Voice: Piper `tr_TR-fahrettin-medium` (offline). Pass the .onnx path as the model argument.
Units are metric (240 ft ≈ 73 m, 70 ft ≈ 21 m, 24 in ≈ 61 cm, 22 in ≈ 56 cm). The flood volume is expressed as
"hundreds of millions of litres" (50–150 million US gallons ≈ 190–570 million litres).
"Quecreek" is respelled "Kuikrik" for the voice.
"""
from stories.quecreek import sound  # noqa: F401

ID = "quecreek-tr"
SRC_DIR = "quecreek"
TIMELINE_FILE = "timeline.tr.ts"
ENGINE = "piper"
LENGTH_SCALE = 1.1
LEAD = 0.5
TAIL = 4.5

LINES = [
    ("h1", "Dokuz madenci, yerin yaklaşık yetmiş üç metre altında mahsur kaldı.", "9 MADENCİ YAKLAŞIK 73 METRE ALTINDA MAHSUR KALDI", 0.3),
    ("h2", "Madeni yüz milyonlarca litre su basmıştı.", "MADENİ YÜZ MİLYONLARCA LİTRE SU BASMIŞTI", 0.3),
    ("h3", "Tek umutları bir sondaj makinesiydi ve zaman daralıyordu.", "TEK UMUTLARI BİR SONDAJDI, ZAMAN DARALIYORDU", 0.3),
    ("h4", "Sonra, çok derinlerden, kurtarma ekipleri dokuz vuruş duydu.", "SONRA, DERİNLERDEN 9 VURUŞ DUYULDU", 0.6),
    ("s1", "Bu, Kuikrik madeni kurtarma operasyonu.", "BU, QUECREEK MADENİ KURTARMA OPERASYONU", 0.3),
    ("s2", "Olay, iki bin iki yılının Temmuz ayında, Pensilvanya'nın Somerset ilçesinde yaşandı.", "SOMERSET İLÇESİ, PENSİLVANYA · TEMMUZ 2002", 0.25),
    ("s3", "Yerin altında, dokuzar kişilik iki ekip halinde on sekiz madenci çalışıyordu.", "18 MADENCİ, 9'AR KİŞİLİK İKİ EKİP", 0.3),
    ("s4", "Hemen yanda eski, terk edilmiş bir maden vardı.", "HEMEN YANDA ESKİ, TERK EDİLMİŞ BİR MADEN VARDI", 0.3),
    ("s5", "O gece saat dokuz sularında, o eski madene açıldılar.", "24 TEMMUZ GECESİ, SAAT 21.00 SULARINDA ESKİ MADENE AÇILDILAR", 0.6),
    ("f1", "İçeri su doldu.", "İÇERİ SU DOLDU", 0.35),
    ("f2", "Dokuz kişilik ekip dışarı çıkabildi.", "9 KİŞİLİK EKİP DIŞARI ÇIKABİLDİ", 0.3),
    ("f3", "Diğer dokuz kişi, yetmiş üç metre aşağıda mahsur kaldı.", "DİĞER 9 KİŞİ 73 METRE AŞAĞIDA MAHSUR KALDI", 0.6),
    ("d1", "Kurtarma ekipleri hemen üstlerindeki yüzeye koştu.", "KURTARMA EKİPLERİ ÜSTLERİNDEKİ YÜZEYE KOŞTU", 0.3),
    ("d2", "Bir maden güvenliği uzmanı, eski haritalara bakarak nereye sondaj yapılacağını belirledi.", "MADEN GÜVENLİĞİ UZMANI HARİTALARA BAKARAK YERİ BELİRLEDİ", 0.3),
    ("d3", "Ertesi sabah, yaklaşık yetmiş üç metrelik kayanın içinden sondaj başladı.", "ERTESİ SABAH SONDAJ BAŞLADI", 0.3),
    ("d4", "İlk delik dardı ama içeri hava verebilirdi.", "İLK DELİK DARDI AMA HAVA VEREBİLİRDİ", 0.3),
    ("d5", "Yukarıdan basılan hava, suyu geri tutmaya yardım etti.", "YUKARIDAN BASILAN HAVA SUYU GERİ TUTTU", 0.35),
    ("w1", "Öğlene doğru su, madencilere yaklaşık yirmi bir metre kadar yaklaşmıştı.", "ÖĞLEYE DOĞRU SU, ONLARA 21 METRE YAKLAŞMIŞTI", 0.6),
    ("p1", "Kurtarma ekipleri boruya vurdu.", "KURTARMA EKİPLERİ BORUYA VURDU", 0.3),
    ("p2", "Üç güçlü vuruşla karşılık geldi.", "ÜÇ GÜÇLÜ VURUŞLA KARŞILIK VERİLDİ", 0.35),
    ("p3", "Sonra dokuz vuruş geldi. Madenci diliyle: burada dokuz kişiyiz.", "9 VURUŞ: “BURADA DOKUZ KİŞİYİZ”", 0.6),
    ("b1", "Ama en zor kısım hâlâ önlerindeydi.", "AMA EN ZOR KISIM HÂLÂ ÖNLERİNDEYDİ", 0.3),
    ("b2", "Yirmi altı Temmuz'un erken saatlerinde sondaj ucu kırıldı.", "26 TEMMUZ'UN ERKEN SAATLERİNDE SONDAJ UCU KIRILDI", 0.3),
    ("b3", "Ekipler, kırık ucu çıkarmaya çalışırken ikinci bir delik açmaya başladı.", "EKİPLER KIRIK UCU ÇIKARIRKEN İKİNCİ DELİĞİ AÇMAYA BAŞLADI", 0.3),
    ("b4", "Öğleden sonra uç çıkarıldı ve sondaj yeniden başladı.", "ÖĞLEDEN SONRA UÇ ÇIKTI, SONDAJ YENİDEN BAŞLADI", 0.6),
    ("g1", "Yirmi yedi Temmuz'da daha büyük bir sondaj makinesi sonunda deliği açtı.", "27 TEMMUZ'DA DAHA BÜYÜK BİR SONDAJ DELİĞİ AÇTI", 0.3),
    ("g2", "Altmış bir santim genişliğindeki delik, bir kurtarma kafesine yetecek kadardı.", "61 CM GENİŞLİĞİNDE: BİR KURTARMA KAFESİNE YETECEK KADAR", 0.3),
    ("g3", "Sonra ekipler, dokuz kişinin de hayatta olduğunu duydu.", "SONRA 9 KİŞİNİN DE HAYATTA OLDUĞU DUYULDU", 0.6),
    ("r1", "Yalnızca elli altı santim genişliğinde bir kafes, kuyuya indirildi.", "56 CM GENİŞLİĞİNDE BİR KAFES KUYUYA İNDİRİLDİ", 0.3),
    ("r2", "Madenciler tek tek yukarı çekildi.", "MADENCİLER TEK TEK YUKARI ÇEKİLDİ", 0.35),
    ("r3", "Yirmi sekiz Temmuz'a kadar dokuz kişi de dışarı çıkmıştı.", "28 TEMMUZ'A KADAR 9 KİŞİ DE DIŞARI ÇIKMIŞTI", 0.3),
    ("r4", "Su baskınından yaklaşık yetmiş yedi saat sonra.", "SU BASKININDAN YAKLAŞIK 77 SAAT SONRA", 0.35),
    ("r5", "Dokuzu da sağ kurtuldu.", "9'U DA SAĞ KURTULDU", 0.5),
    ("r6", "Su dolu bir maden, dar bir delik ve bir boruya dokuz vuruş.", "SU DOLU MADEN, DAR BİR DELİK VE BORUYA 9 VURUŞ", 0.5),
    ("r7", "Sıradaki hikâye: Tayland'daki mağara kurtarması. Takip et.", "SIRADAKİ: TAYLAND MAĞARA KURTARMASI. TAKİP ET", 0.0),
]
