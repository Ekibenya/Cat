#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""烤一张择地用的罗马马赛克世界地图：core/res/img/annals/locus.png

    python3 tools/felinia/mapgen.py

与菜单那幅徽记同一套做法，只留地图那一层：
砖是从四十一张插图上随机裁下来的方块，转灰、压窄色域、再乘一枚石料色，
所以整幅的色系是统一的，而每一块的纹理仍然来自不同的画。

投影是等距圆柱，且与菜单那幅完全对齐：
    x = (经度+180)/360 · 宽      y = (90-纬度)/180 · 高
所以纪年资料里的 la/lo 直接就能落到图上，不必再对一次。

海是透明的——底下是奶油纸，和菜单一样。
"""
import io, json, os, random, base64

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC  = os.path.join(ROOT, 'core/res/img/annals')
OUT  = os.path.join(SRC, 'locus.png')
MET  = os.path.join(ROOT, 'core/res/data/felinia/locus.json')
LAND = os.path.join(HERE, 'land.json')

random.seed(19000228)                      # 定死：重烤一次要得到同一幅

# 南北两头裁掉：北纬 84 以北和南纬 56 以南没有一个纪年地点，
# 留着只会把有人住的那一带挤成一条。裁过的边界写进 locus.json，
# 运行时按这个边界换算坐标——两边对不上，标记就会整体偏。
LA_TOP, LA_BOT = 84.0, -56.0
GW, GH, CELL, GAP = 180, 70, 14, 2         # 格数 · 每格边长 · 砖缝
W, H = GW * CELL, GH * CELL
STONE = {'sand': (206, 183, 140), 'ochre': (192, 143, 72),
         'lime': (236, 226, 203), 'terra': (170, 94, 56)}
# 每种石料自己的明暗范围：靠海那一圈要比陆心「亮」，不然轮廓是反的
BAND = {'sand': (120, 196), 'ochre': (118, 190), 'lime': (196, 250), 'terra': (110, 180)}


def load_land():
    d = json.load(io.open(LAND, encoding='utf-8'))
    lb = base64.b64decode(d['land'])
    LW, LH = 400, 200

    def at(lo, la):
        x = min(LW - 1, max(0, int((lo + 180) / 360 * LW)))
        y = min(LH - 1, max(0, int((90 - la) / 180 * LH)))
        i = y * LW + x
        return (lb[i >> 3] >> (i & 7)) & 1
    return at


def pool():
    ims = []
    for n in range(1, 42):
        p = os.path.join(SRC, '%02d.jpg' % n)
        if os.path.exists(p):
            ims.append(Image.open(p).convert('RGB'))
    if not ims:
        raise SystemExit('插图一张也没有：%s' % SRC)
    return ims


def tessera(ims, size, key):
    """一块砖：随机裁一小方 → 转灰 → 压进这种石料的明暗带 → 乘石料色。"""
    im = random.choice(ims)
    s = min(im.size) // random.randint(6, 14)
    x = random.randint(0, im.width - s)
    y = random.randint(0, im.height - s)
    t = im.crop((x, y, x + s, y + s)).resize((size, size), Image.LANCZOS).convert('L')
    # 窄色域：让每块砖内部只剩很浅的明暗起伏，整幅才不会花
    lo, hi = BAND[key]
    t = t.point(lambda v: lo + int(v * (hi - lo) / 255))
    r, g, b = STONE[key]
    px = t.load()
    out = Image.new('RGBA', (size, size))
    op = out.load()
    for j in range(size):
        for i in range(size):
            v = px[i, j] / 255.0
            op[i, j] = (int(r * v), int(g * v), int(b * v), 255)
    return out


def main():
    land = load_land()
    ims = pool()
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    side = CELL - GAP
    n = 0
    span = LA_TOP - LA_BOT
    for gy in range(GH):
        la = LA_TOP - (gy + 0.5) / GH * span
        for gx in range(GW):
            lo = (gx + 0.5) / GW * 360 - 180
            if not land(lo, la):
                continue
            # 靠海的一圈用浅一号的石料，陆心用赭色——远看有轮廓，近看是砖
            edge = not (land(lo - 2.1, la) and land(lo + 2.1, la)
                        and land(lo, la - 2.1) and land(lo, la + 2.1))
            key = 'lime' if edge else ('ochre' if random.random() < .34 else 'sand')
            t = tessera(ims, side, key)
            t = t.rotate(random.uniform(-4, 4), Image.BICUBIC, expand=False)
            canvas.alpha_composite(t, (gx * CELL + GAP // 2 + random.randint(-1, 1),
                                       gy * CELL + GAP // 2 + random.randint(-1, 1)))
            n += 1
    canvas.save(OUT, optimize=True)
    d = os.path.dirname(MET)
    if not os.path.isdir(d):
        os.makedirs(d)
    io.open(MET, 'w', encoding='utf-8').write(json.dumps(
        {'w': W, 'h': H, 'laTop': LA_TOP, 'laBot': LA_BOT, 'cell': CELL},
        ensure_ascii=False, separators=(',', ':')))
    print('择地图已烤 · %d×%d 格 · 砖 %d 块 · %d×%d 像素 · %.0f KB · 纬 %g…%g'
          % (GW, GH, n, W, H, os.path.getsize(OUT) / 1024, LA_TOP, LA_BOT))


if __name__ == '__main__':
    main()
