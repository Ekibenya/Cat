#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把奶油主题的豁免收窄到马赛克那一屏。

`tools/luxpatch.py` 当初给 `#menu` 整个开了一道豁免（再反一次抵消全局反色），
为的是马赛克按真彩烤好、不能再被翻成负片。可 `#menu` 还有另外两个状态：

  .gbg  对局时它退到背景
  .era  粒子地球（自定义开局选年代那一屏）

这两个状态下它显示的是引擎原来的墨底。豁免一并罩过去，等于把这块留在黑里——
对局那一屏于是不是奶油，是暗灰。收窄到 `:not(.gbg):not(.era)` 就对了。

已经收窄过就什么都不做，好让重打脚本能反复跑。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

OLD = 'html.lux #menu{filter:invert(1) hue-rotate(180deg)}'
NEW = 'html.lux #menu:not(.gbg):not(.era){filter:invert(1) hue-rotate(180deg)}'


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if NEW in s:
        print('豁免早已收窄，跳过。')
        return
    if s.count(OLD) != 1:
        sys.exit('锚点不是唯一的（%d 处），停手。' % s.count(OLD))
    io.open(DOC, 'w', encoding='utf-8').write(s.replace(OLD, NEW, 1))
    print('奶油主题的豁免已收窄到马赛克那一屏 · 主文档 %.0f KB' % (os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
