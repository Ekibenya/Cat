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
        im = Image.open(os.path.join(SRC, f))
        h = max(1, round(im.height * W / im.width))
        im.convert('RGB').resize((W, h), Image.LANCZOS).save(
            os.path.join(DST, f), 'JPEG', quality=82, optimize=True)
        tot += os.path.getsize(os.path.join(DST, f))
        n += 1
    if n != 42:
        sys.exit('应该是四十二张，实际 %d 张，停手。' % n)
    print('缩图 %d 张 · 合计 %.0f KB' % (n, tot / 1024))


if __name__ == '__main__':
    main()
