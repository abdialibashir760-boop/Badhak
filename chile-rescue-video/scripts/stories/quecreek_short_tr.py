"""Quecreek mine rescue — SHORT cut, Turkish (Piper `tr_TR-fahrettin-medium`). Same ALIAS map as the English short."""
from stories.quecreek import sound  # noqa: F401
from stories.quecreek_short import ALIAS  # noqa: F401

ID = "quecreek-short-tr"
SRC_DIR = "quecreek"
TIMELINE_FILE = "timeline.short.tr.ts"
ENGINE = "piper"
LENGTH_SCALE = 1.05
LEAD = 0.5
TAIL = 3.5

LINES = [
    ("h1", "Dokuz madenci, yerin yaklaşık yetmiş üç metre altında mahsur kaldı.", "9 MADENCİ YAKLAŞIK 73 METRE ALTINDA MAHSUR KALDI", 0.25),
    ("h2", "Madeni yüz milyonlarca litre su basmıştı.", "MADENİ YÜZ MİLYONLARCA LİTRE SU BASMIŞTI", 0.25),
    ("h4", "Sonra, çok derinlerden, kurtarma ekipleri dokuz vuruş duydu.", "SONRA, DERİNLERDEN 9 VURUŞ DUYULDU", 0.9),
    ("s5", "Yirmi dört Temmuz'da eski, terk edilmiş bir madene açıldılar.", "24 TEMMUZ'DA ESKİ, TERK EDİLMİŞ BİR MADENE AÇILDILAR", 0.3),
    ("f1", "İçeri su doldu.", "İÇERİ SU DOLDU", 0.25),
    ("f2", "Dokuz kişilik ekip dışarı çıkabildi.", "9 KİŞİLİK EKİP DIŞARI ÇIKABİLDİ", 0.25),
    ("f3", "Diğer dokuz kişi mahsur kaldı.", "DİĞER 9 KİŞİ MAHSUR KALDI", 0.4),
    ("d3", "Kurtarma ekipleri dar bir delik açıp aşağıya hava bastı.", "DAR BİR DELİK AÇIP AŞAĞIYA HAVA BASTILAR", 0.4),
    ("p1", "Boruya vurdular. Üç güçlü vuruşla karşılık geldi.", "BORUYA VURDULAR. 3 GÜÇLÜ VURUŞLA KARŞILIK GELDİ", 0.3),
    ("p3", "Sonra dokuz vuruş geldi. Madenci diliyle: burada dokuz kişiyiz.", "9 VURUŞ: “BURADA DOKUZ KİŞİYİZ”", 0.5),
    ("b2", "Yirmi altı Temmuz'da sondaj ucu kırıldı.", "26 TEMMUZ'DA SONDAJ UCU KIRILDI", 0.4),
    ("g2", "Daha büyük bir sondaj, bir kurtarma kafesine yetecek, altmış bir santimlik bir delik açtı.", "DAHA BÜYÜK SONDAJ, KAFESE YETECEK 61 CM'LİK DELİK AÇTI", 0.4),
    ("r2", "Madenciler tek tek yukarı çekildi.", "MADENCİLER TEK TEK YUKARI ÇEKİLDİ", 0.3),
    ("r4", "Su baskınından yaklaşık yetmiş yedi saat sonra, dokuz kişi de sağ çıkmıştı.", "SU BASKININDAN ~77 SAAT SONRA 9 KİŞİ DE SAĞ ÇIKTI", 0.3),
    ("r7", "Sıradaki hikâye: Tayland'daki mağara kurtarması. Takip et.", "SIRADAKİ: TAYLAND MAĞARA KURTARMASI. TAKİP ET", 0.0),
]
