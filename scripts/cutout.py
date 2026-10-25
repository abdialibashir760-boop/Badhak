"""Cut the supplied character out of its background with GrabCut (OpenCV).
Usage: python3 scripts/cutout.py  -> writes assets/character-cutout.png (RGBA)"""
import cv2, numpy as np
img = cv2.imread('assets/character-source.jpg')
H, W = img.shape[:2]
mask = np.full((H, W), cv2.GC_BGD, np.uint8)
x0, y0, x1, y1 = 355, 372, 765, 695
mask[y0:y1, x0:x1] = cv2.GC_PR_BGD
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
roi = (slice(y0, y1), slice(x0, x1))
v = hsv[..., 2][roi]; s = hsv[..., 1][roi]; h = hsv[..., 0][roi]
sub = mask[roi]
sub[v < 45] = cv2.GC_PR_FGD                      # ink-black limbs / outlines (probable)
sub[(h > 12) & (h < 30) & (s > 140) & (v > 150)] = cv2.GC_FGD   # yellow beanie
sub[(s < 70) & (v > 170)] = cv2.GC_FGD           # pale face
# cloak: dark grey-brown, low saturation
sub[(s < 90) & (v >= 45) & (v < 120)] = cv2.GC_PR_FGD
bg = np.zeros((1, 65)); fg = np.zeros((1, 65))
cv2.grabCut(img, mask, None, bg, fg, 10, cv2.GC_INIT_WITH_MASK)
m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
# keep the biggest component, close pinholes, soften edge
n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
if n > 1:
    keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); m = np.where(lab == keep, 255, 0).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
cv2.imwrite('assets/mask-raw.png', m)
alpha = cv2.GaussianBlur(m, (3, 3), 0)
rgba = np.dstack([img, alpha])
ys, xs = np.where(m > 0)
rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
cv2.imwrite('assets/character-cutout.png', rgba)
print('cutout', rgba.shape, 'bbox', xs.min(), ys.min(), xs.max(), ys.max())
