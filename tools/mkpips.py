#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""纪年轴那一排微缩窗的图源（annals/m/）。

轴上四十二格是同时挂着的，不能像顶上那条微缩窗那样滚到哪取到哪 ——
一开页就得四十二张全在。整幅预览（p/）四十二张合起来七点四兆，
拿去填一格三十来像素宽的窗是白烧流量；条子（t/）是竖裁的一条缝，
塞进一个横格里只剩画面正中一竖条，认不出是哪一幕。

所以另烤一套：从整幅预览居中裁成三比二，缩到九十×六十。
轴上一格在宽屏是三十七像素宽、二十来像素高，二倍屏也就七十四×五十出头，
九十×六十铺满还有余；四十二张合计一百多 KB，一次全下也不心疼。
换了 p/ 底下的图就重跑一次。
"""
import io, os, sys

try:
    from PIL import Image
except ImportError:
    sys.exit('要 Pillow：pip install pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'core/res/img/annals/p')
DST  = os.path.join(ROOT, 'core/res/img/annals/m')
W, H = 90, 60


def main():
    if not os.path.isdir(SRC):
        sys.exit('找不到 %s' % SRC)
    os.makedirs(DST, exist_ok=True)
    tot = n = 0
    for f in sorted(os.listdir(SRC)):
        if not f.lower().endswith('.jpg'):
            continue
        im = Image.open(os.path.join(SRC, f)).convert('RGB')
        w, h = im.size
        # 居中裁到三比二：横的削两边，竖的削上下
        if w * H > h * W:
            cw, ch = int(round(h * W / H)), h
        else:
            cw, ch = w, int(round(w * H / W))
        x, y = (w - cw) // 2, (h - ch) // 2
        im = im.crop((x, y, x + cw, y + ch)).resize((W, H), Image.LANCZOS)
        out = os.path.join(DST, f)
        im.save(out, 'JPEG', quality=82, optimize=True)
        tot += os.path.getsize(out)
        n += 1
    print('%d 张 · %d×%d · 合计 %.0f KB' % (n, W, H, tot / 1024.0))


if __name__ == '__main__':
    main()
