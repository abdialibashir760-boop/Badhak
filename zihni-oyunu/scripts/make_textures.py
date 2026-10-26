"""Procedural paper texture + film grain tiles (original, license-free)."""
import numpy as np, os
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(7)
def blur(a, r): return np.asarray(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
# paper: multi-scale noise + faint horizontal fibres, centred on mid-grey so it can be overlaid (multiply-ish)
H, W = 1080, 1920
base = rng.normal(128, 40, (H, W)).clip(0, 255)
fine = blur(base, 0.8)
mid = blur(rng.normal(128, 60, (H // 4, W // 4)).clip(0, 255), 2) 
mid = np.asarray(Image.fromarray(mid.astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32)
large = blur(rng.normal(128, 70, (H // 16, W // 16)).clip(0, 255), 1)
large = np.asarray(Image.fromarray(large.astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32)
fib = blur(rng.normal(128, 90, (H, W // 12)).clip(0, 255), 1)
fib = np.asarray(Image.fromarray(fib.astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32)
p = 128 + (fine - 128) * 0.35 + (mid - 128) * 0.35 + (large - 128) * 0.25 + (fib - 128) * 0.15
Image.fromarray(p.clip(0, 255).astype(np.uint8)).save(os.path.join(ROOT, "public/images/paper.jpg"), quality=88)
# grain tiles
for k in range(6):
    g = rng.normal(128, 55, (512, 512)).clip(0, 255)
    g = blur(g, 0.6)
    Image.fromarray(g.astype(np.uint8)).save(os.path.join(ROOT, f"public/images/grain{k}.png"))
print("textures done")
