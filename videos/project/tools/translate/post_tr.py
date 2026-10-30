# Layout fixes that only the Turkish text needs. Run after translate_ts.js.
import re
import os
B=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","src","tr")+os.sep
def patch(f, pairs):
    s=open(B+f).read()
    for a,b in pairs:
        if a not in s: print("!! missing in",f,":",a[:80]); continue
        s=s.replace(a,b,1)
    open(B+f,"w").write(s)
patch("scenes1.tsx",[('<Stamp text="Yanılıyorlar" from={S(8) + 0.2} to={S(9)} size={58} style={{ left: 410, top: 570 }} />','<Stamp text="Yanılıyorlar" from={S(8) + 0.2} to={S(9)} size={56} style={{ left: 380, top: 515 }} />')])
patch("Thumbs.tsx",[
 ('textTransform: "uppercase", textShadow: outline });','textTransform: "uppercase", textShadow: outline, whiteSpace: "nowrap" });'),
 ('''        <div style={word(210, "#fff")}>ASLA</div>
        <div style={word(190, C.gold)}>İŞGAL EDİLMEDİ</div>''','''        <div style={word(200, "#fff")}>ASLA</div>
        <div style={word(165, C.gold)}>İŞGAL</div>
        <div style={word(122, C.gold)}>EDİLMEDİ</div>'''),
 ('<Chip text="NEDEN?" color={C.gold} fg="#000" style={{ left: 44, top: 590, fontSize: 64, padding: "2px 30px" }} />','<Chip text="NEDEN?" color={C.gold} fg="#000" style={{ right: 44, top: 590, fontSize: 64, padding: "2px 30px" }} />'),
 ('''        <div style={word(230, "#fff")}>O</div>
        <div style={word(230, "#fff")}>TAŞ</div>''','''        <div style={word(220, "#fff")}>O TAŞ</div>'''),
 ('<div style={{ ...word(78, C.gold), marginTop: 18 }}>TÜRKİYE\'Yİ</div>\n        <div style={word(78, C.gold)}>SAVAŞ DIŞI TUTTU</div>','<div style={{ ...word(72, C.gold), marginTop: 18 }}>TÜRKİYE\'Yİ</div>\n        <div style={word(72, C.gold)}>SAVAŞ DIŞI TUTTU</div>'),
 ('<div style={word(260, C.red)}>NEDEN OLMADI?</div>','<div style={word(168, C.red)}>NEDEN OLMADI?</div>'),
 ('<div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}>','<div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center" }}>'),
])
