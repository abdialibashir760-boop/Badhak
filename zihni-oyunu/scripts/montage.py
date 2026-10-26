"""usage: montage.py out.jpg cols img1 img2 ...  — labelled contact sheet."""
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
tw = 960 if cols <= 2 else 640
th = tw * 9 // 16
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * th), "white")
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 150, 22], fill="black")
    d.text((6, 4), f.split("/")[-1].split(".")[0], fill="white")
    sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
sheet.save(out, quality=88)
