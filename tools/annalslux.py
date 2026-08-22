#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""纪年页（ANNALES）改配浅底。

那一层是按黑底做的：底 rgba(6,6,6,.97)、未选中的图压暗、说明用白块深字、
轨条是 #232320 的暗线。全局奶油主题一反色，它就整片发白发飘。

所以跟菜单同样处理——先把这一层从全局反色里豁免（再反一次抵消），
再给它一套浅底的颜色：底换奶油、未选中的图改成淡出而不是压暗、
说明块改成深墨底浅字、轨条与菱标换成浅底上看得清的暖灰与暗金。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

# 锚点：奶油主题那段的末尾，把浅底覆盖排在它后面
A = "/* 只剩奶油一档了，开关收起来 */\n#luxTg{display:none!important}"

CSS = """/* 只剩奶油一档了，开关收起来 */
#luxTg{display:none!important}
/* ═══════ 纪年页：浅底配色 ═══════
   与菜单同样先从全局反色里豁免，再按浅底重配——不然这一层会被反成负片。 */
html.lux #eraSel{filter:invert(1) hue-rotate(180deg)}
html.lux #eraSel img{filter:none}          /* 层已抵消，图不必再反一次 */
html.lux #eraSel{background:#f0eadc}
html.lux #esReel::before{background:linear-gradient(90deg,#f0eadc 0%,rgba(240,234,220,.7) 45%,rgba(240,234,220,0) 100%)}
html.lux #esReel::after{background:linear-gradient(270deg,#f0eadc 0%,rgba(240,234,220,.7) 45%,rgba(240,234,220,0) 100%)}
/* 未选中的图：浅底上要「淡出」，不是「压暗」 */
html.lux #eraSel .pl{filter:saturate(.35) contrast(.92) brightness(1.06);opacity:.42}
html.lux #eraSel .pl:hover{filter:saturate(.5) contrast(.95) brightness(1.03);opacity:.62}
html.lux #eraSel .pl.on{filter:none;opacity:1}
/* 选中那张的底部压边：改成从奶油色压上来 */
html.lux #eraSel .pl.on::before{background:linear-gradient(0deg,rgba(240,234,220,.94) 0%,rgba(240,234,220,.6) 15%,rgba(240,234,220,0) 40%)}
/* 说明块：深墨底、浅字 */
html.lux #esMission .m-tag .tag{background:#9a742a;color:#f6f1e4}
html.lux #esMission .num{background:#2f2a22;color:#f6f1e4}
html.lux #esMission .ttl span{background:#2f2a22;color:#f6f1e4}
html.lux #esMission .era{color:#8a8170}
/* 纪年轴与页脚：浅底上的暖灰与暗金 */
html.lux #esBands{border-top-color:#cec3ab}
html.lux #esBands div{color:#9a9184;border-right-color:#cec3ab}
html.lux #esBands div:first-child{border-left-color:#cec3ab}
html.lux #esBands div.live{color:#9a742a}
html.lux #esPips::before{background:#cec3ab}
html.lux #eraSel .pip i{background:#c0b59c}
html.lux #eraSel .pip:hover i{background:#9a9184}
html.lux #eraSel .pip.on i{background:#9a742a;box-shadow:0 0 9px rgba(154,116,42,.55)}
html.lux #eraSel .pip b{color:#c0b59c}
html.lux #eraSel .pip.mark b{color:#9a9184}
html.lux #eraSel .pip.on b{color:#9a742a}
html.lux #esFoot{border-top-color:#cec3ab;color:#9a9184;background:rgba(240,234,220,.92)}
html.lux #esFoot .go{color:#4a4237;border-color:rgba(154,116,42,.5);background:rgba(255,255,255,.45)}
html.lux #esFoot .go:hover{color:#1f1a13;border-color:#9a742a}
html.lux #esBrand{color:#9a9184}
html.lux #esBrand b{color:#4a4237}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if 'html.lux #eraSel' in s:
        sys.exit('纪年页的浅底配色已经打过了，没有重复打。')
    if s.count(A) != 1:
        sys.exit('锚点不是唯一的（%d 处），停手。' % s.count(A))
    io.open(DOC, 'w', encoding='utf-8').write(s.replace(A, CSS, 1))
    print('纪年页浅底配色已注入 · 主文档 %.0f KB' % (os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
