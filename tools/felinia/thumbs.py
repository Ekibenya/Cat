#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""图版缩图：纪年页的条子上用不着全图。

四十二张图版原图是 1024×1536 上下，一张解开就是六兆。
纪年页的条子上每一张只有九十二像素宽，却照样把全图解开——
走一遍四十二张，光位图就占两百多兆，而且一直不放。

这里烤一份宽二百四十的缩图放到 t/ 下：条子一律用它，
只有选中那一张在背后解开全图之后才换上去。
"""
import os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC  = os.path.join(ROOT, 'core/res/img/annals')
DST  = os.path.join(SRC, 't')
W    = 240


def main():
    os.makedirs(DST, exist_ok=True)
    n = tot = 0
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.jpg'):
            continue
        im = Image.open(os.path.join(SRC, f)).convert('RGB')
        # 条子是「九十二像素宽、73vh 高」的一条竖缝——纵向要的分辨率跟大图一样，
        # 横向只露出中间很窄的一道。所以缩图不能整图缩小（那样纵向会被拉三倍，
        # 糊得不能看），要按条子的形状竖着裁一条：高度照原样，宽度按最窄的
        # 视口比例留足（0.24 覆盖到六百像素高的窗口），中间取。
        cw = max(1, round(im.height * 0.24))
        if cw < im.width:
            x0 = (im.width - cw) // 2
            im = im.crop((x0, 0, x0 + cw, im.height))
        im.save(os.path.join(DST, f), 'JPEG', quality=86, optimize=True)
        tot += os.path.getsize(os.path.join(DST, f))
        n += 1
    if n != 42:
        sys.exit('应该是四十二张，实际 %d 张，停手。' % n)
    # 马赛克两张源图各烤一份乘过暖纸的（RGB 各乘 t，alpha 原样）。
    # 菜单的暖纸罩已折进颜色里，砖要在源头带上同一层——在这里乘而不是在浏览器里乘，
    # 是因为 <img> 源走的是高质量缩放采样，canvas 源走低质量，砖会发硬。
    T = (0.941, 0.918, 0.863)
    for f in ('emblem.png', 'border.png'):
        im = Image.open(os.path.join(SRC, f)).convert('RGBA')
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                px[x, y] = (int(r*T[0]), int(g*T[1]), int(b*T[2]), a)
        out = os.path.join(SRC, f.replace('.png', '_t.png'))
        im.save(out, 'PNG', optimize=True)
        print('暖纸版 %s · %.0f KB' % (os.path.basename(out), os.path.getsize(out)/1024))
    print('缩图 %d 张 · 合计 %.0f KB' % (n, tot / 1024))


if __name__ == '__main__':
    main()
