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

# ① 豁免收窄到马赛克那一屏
OLD = 'html.lux #menu{filter:invert(1) hue-rotate(180deg)}'
NEW = 'html.lux #menu:not(.gbg):not(.era){filter:invert(1) hue-rotate(180deg)}'

# ② 设置里那一行开关收起来了，说明文字还留着——「主菜单右上角的 ☀/☾ 也能随时切换」，
#    可那颗按钮也早收起来了。把紧跟着的那一段说明一并收掉。
OLD2 = "    var row=cb.closest&&cb.closest('.sRow,label,div');\n    if(row)row.style.display='none';}"
NEW2 = ("    var row=cb.closest&&cb.closest('.sRow,label,div');\n"
        "    if(row){row.style.display='none';\n"
        "      /* 那一行下面还跟着一段说明，讲的是已经不存在的开关，一并收掉 */\n"
        "      var sub=row.nextElementSibling;\n"
        "      if(sub&&sub.className&&String(sub.className).indexOf('sub')>=0)"
        "sub.style.display='none';}}")


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if NEW in s and NEW2 in s:
        print('这两处早已改过，跳过。')
        return
    for nm, a in (('豁免', OLD), ('说明', OLD2)):
        if s.count(a) != 1:
            sys.exit('锚点 %s 不是唯一的（%d 处），停手。' % (nm, s.count(a)))
    s = s.replace(OLD, NEW, 1).replace(OLD2, NEW2, 1)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('豁免已收窄，白昼开关那一段说明也收起来了 · 主文档 %.0f KB'
          % (os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
