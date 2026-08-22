# -*- coding: utf-8 -*-
"""封面：黑地金字，秦式高台大殿的剪影 + 一条一丈二尺的链子 + 四丈的刻度。
   没有画师稿，就用几何与排版做一张不像占位的封面。"""
import math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1024, 1434
BG   = (9, 8, 7)
GOLD = (201, 155, 63)
GOLD_HI = (236, 200, 120)
DIM  = (86, 72, 44)
RED  = (150, 40, 32)

F = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def font(sz): return ImageFont.truetype(F, sz)

img = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(img)
rnd = random.Random(2210)

# ── 背景：夯土的横纹与颗粒 ───────────────────────────────
for y in range(0, H, 3):
    a = 10 + int(9 * math.sin(y * .013)) + rnd.randint(-3, 3)
    d.line([(0, y), (W, y)], fill=(BG[0] + a // 3, BG[1] + a // 4, BG[2] + a // 6))
grain = Image.new('L', (W, H))
gp = grain.load()
for i in range(90000):
    gp[rnd.randrange(W), rnd.randrange(H)] = rnd.randrange(40, 110)
img = Image.composite(Image.new('RGB', (W, H), (60, 50, 30)), img,
                      grain.filter(ImageFilter.GaussianBlur(.4)))
d = ImageDraw.Draw(img)

# ── 远处：高台大殿的剪影 ─────────────────────────────────
cx, base = W // 2, 1010
def hall(scale, y0, col):
    hw = 340 * scale
    # 三级夯土台
    for i, (h, w) in enumerate([(70, hw), (62, hw * .88), (54, hw * .76)]):
        yb = y0 - sum([70, 62, 54][:i])
        d.rectangle([cx - w, yb - h, cx + w, yb], fill=col)
    top = y0 - 186
    # 柱列
    for i in range(13):
        x = cx - hw * .70 + i * (hw * 1.40 / 12)
        d.rectangle([x - 5 * scale, top - 130 * scale, x + 5 * scale, top], fill=col)
    ty = top - 130 * scale
    d.rectangle([cx - hw * .80, ty - 22 * scale, cx + hw * .80, ty], fill=col)
    # 四阿顶
    d.polygon([(cx - hw * .92, ty - 22 * scale), (cx + hw * .92, ty - 22 * scale),
               (cx + hw * .20, ty - 150 * scale), (cx - hw * .20, ty - 150 * scale)], fill=col)
    # 正脊两端的兽头
    d.rectangle([cx - hw * .23, ty - 162 * scale, cx - hw * .16, ty - 146 * scale], fill=col)
    d.rectangle([cx + hw * .16, ty - 162 * scale, cx + hw * .23, ty - 146 * scale], fill=col)
    # 阙
    for s in (-1, 1):
        qx = cx + s * hw * 1.22
        d.rectangle([qx - 26 * scale, y0 - 300 * scale, qx + 26 * scale, y0], fill=col)
        d.polygon([(qx - 40 * scale, y0 - 300 * scale), (qx + 40 * scale, y0 - 300 * scale),
                   (qx, y0 - 348 * scale)], fill=col)
hall(1.0, base, (20, 17, 13))
hall(.62, base - 40, (14, 12, 10))

# 地平线
d.line([(0, base), (W, base)], fill=(34, 29, 20), width=2)

# ── 四丈的刻度：底部一条十步的尺 ─────────────────────────
sy = 1180
d.line([(120, sy), (904, sy)], fill=DIM, width=2)
for i in range(11):
    x = 120 + i * (784 / 10.0)
    hgt = 26 if i % 5 == 0 else 14
    d.line([(x, sy - hgt), (x, sy)], fill=GOLD if i in (0, 10) else DIM, width=2)
fs = font(19)
d.text((120, sy + 12), '〇', font=fs, fill=GOLD)
d.text((880, sy + 12), '四丈', font=fs, fill=GOLD)
d.text((452, sy + 12), '十步', font=fs, fill=DIM)

# ── 链子：从右上斜落，九十七环 ───────────────────────────
px, py = 760, 150
for i in range(97):
    t = i / 96.0
    x = 760 - 200 * t + 26 * math.sin(t * 7.1)
    y = 130 + 900 * t * t * .62 + 300 * t
    if y > 1120: break
    r = 7 - 2 * t
    col = GOLD_HI if i % 8 == 0 else GOLD
    d.ellipse([x - r, y - r * 1.5, x + r, y + r * 1.5],
              outline=col, width=2 if t < .6 else 1)
    px, py = x, y

# ── 竖排标题 ────────────────────────────────────────────
ft = font(120)
title = '四丈之内'
ty = 150
for ch in title:
    d.text((100 + 4, ty + 4), ch, font=ft, fill=(0, 0, 0))
    d.text((100, ty), ch, font=ft, fill=GOLD_HI)
    ty += 138

fs2 = font(46)
sy2 = ty + 44
for ch in '猫娘吕雉':
    d.text((112, sy2), ch, font=fs2, fill=GOLD)
    sy2 += 56

# ── 朱印 ────────────────────────────────────────────────
d.rectangle([106, sy2 + 54, 106 + 74, sy2 + 54 + 74], fill=RED)
fseal = font(30)
d.text((114, sy2 + 62), '秦', font=fseal, fill=(238, 226, 200))
d.text((146, sy2 + 62), '政', font=fseal, fill=(238, 226, 200))
d.text((114, sy2 + 96), '吕', font=fseal, fill=(238, 226, 200))
d.text((146, sy2 + 96), '雉', font=fseal, fill=(238, 226, 200))

# ── 右侧竖排的一句话 ────────────────────────────────────
fq = font(30)
line = '她在四丈之内，他就不死'
qy = 210
for ch in line:
    d.text((922, qy), ch, font=fq, fill=(150, 128, 84))
    qy += 38

# ── 页脚 ────────────────────────────────────────────────
fl = font(22)
d.text((100, 1250), 'L V Z H I', font=fl, fill=GOLD)
fl2 = font(20)
d.text((100, 1288), '前 221 — 前 210　·　咸阳', font=fl2, fill=(120, 102, 66))
d.text((100, 1320), '二十开局　·　多视角　·　叙事游戏', font=fl2, fill=(96, 82, 54))

# ── 边框 ────────────────────────────────────────────────
d.rectangle([28, 28, W - 29, H - 29], outline=(58, 48, 30), width=2)
d.rectangle([36, 36, W - 37, H - 37], outline=(30, 25, 16), width=1)

img.save('st/cover.png')
print('cover ok')
