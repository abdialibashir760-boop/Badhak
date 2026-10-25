"""Extract the character's head+beanie from the source art and erase the painted face features,
so expressions can be re-drawn as vector overlays in the same style. Writes public/stone/head.png,
public/stone/character.png (full original pose) and prints the head geometry."""
import cv2, numpy as np, json
img = cv2.imread('assets/character-source.jpg')
raw = cv2.imread('assets/mask-raw.png', 0)
H, W = img.shape[:2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
roi = np.zeros((H, W), bool); roi[372:520, 400:640] = True
face = ((s < 85) & (v > 150) & roi).astype(np.uint8) * 255
n, lab, st, cen = cv2.connectedComponentsWithStats(face)
k = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); face = np.where(lab == k, 255, 0).astype(np.uint8)
face = cv2.morphologyEx(face, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
# fill holes (eyes / mouth are inside the face blob)
ff = face.copy(); cnts, _ = cv2.findContours(ff, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
face_fill = np.zeros_like(face); cv2.drawContours(face_fill, cnts, -1, 255, -1)
yellow = ((h > 12) & (h < 30) & (s > 120) & (v > 120) & roi).astype(np.uint8) * 255
yellow = cv2.morphologyEx(yellow, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
core = cv2.bitwise_or(face_fill, yellow)
head = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))   # include ink outline
head = cv2.bitwise_and(head, raw)
# remove the body: cut below the chin line
ys, xs = np.where(face_fill > 0)
chin = ys.max() + 7
head[chin:, :] = 0
# erase features: dark pixels inside the face, refilled with the smooth surrounding skin tone
inner = cv2.erode(face_fill, np.ones((11, 11), np.uint8))
feat = ((v < 165) & (inner > 0)).astype(np.uint8) * 255
feat = cv2.dilate(feat, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
skin = ((face_fill > 0) & (feat == 0) & (inner > 0)).astype(np.float32)
imgf = img.astype(np.float32)
num = cv2.GaussianBlur(imgf * skin[..., None], (0, 0), 9)
den = cv2.GaussianBlur(skin, (0, 0), 9)[..., None] + 1e-4
filled = num / den
clean = img.copy().astype(np.float32)
m3 = (feat > 0)[..., None]
clean = np.where(m3, filled, clean).clip(0, 255).astype(np.uint8)
alpha = cv2.GaussianBlur(head, (3, 3), 0)
rgba = np.dstack([clean, alpha])
x0, x1 = xs.min() - 25, xs.max() + 25
yy, xx = np.where(head > 0)
box = (max(0, xx.min()), max(0, yy.min()), xx.max() + 1, yy.max() + 1)
sprite = rgba[box[1]:box[3], box[0]:box[2]]
cv2.imwrite('public/stone/head.png', sprite)
fcx, fcy = xs.mean(), ys.mean()
geo = dict(w=int(sprite.shape[1]), h=int(sprite.shape[0]), faceCx=float(xs.mean() - box[0]), faceCy=float(ys.mean() - box[1]),
           faceR=float((xs.max() - xs.min()) / 2), faceTop=float(ys.min() - box[1]), faceBottom=float(ys.max() - box[1]),
           faceLeft=float(xs.min() - box[0]), faceRight=float(xs.max() - box[0]), chin=float(chin - box[1]))
json.dump(geo, open('assets/head-geometry.json', 'w'), indent=1)
print(geo)
full = cv2.imread('assets/character-cutout.png', cv2.IMREAD_UNCHANGED)
cv2.imwrite('public/stone/character.png', full)
