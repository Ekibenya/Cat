#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把暖纸罩挪到反色之后——对局那一屏与所有弹窗原本是纯白，不是奶油。

毛病出在滤镜的先后：

    html.lux{filter:invert(1) hue-rotate(180deg)}      ← 挂在根元素上
    html.lux::after{background:#f2ece0;mix-blend-mode:multiply}

`::after` 是 html 的子元素，所以它落在这道滤镜**里面**：先跟画面相乘，再整个反色。
可对局那一屏的底本来就是近黑（#030303），拿一层浅奶油去乘等于没乘——
反过来就是 #FCFCFC，一片纯白。实测：对局屏三成的像素是 #FCFCFC，
设置、世界书、存档、接口四个弹窗更甚，存档那一屏六成七。
菜单与纪年页看着还行，只因为那几层自己又反了一次，是按真彩画的。

罩子挪不到滤镜外面（html 上头没有别的元素了），所以换一种算法，让它隔着滤镜也成立。
把根元素那道滤镜记作 F(x) = M·(1-x)，M 是 hue-rotate(180) 的矩阵（M·M＝单位阵）。
反色前用 screen 叠一层 s，最终得到

    F(screen(c,s)) = M·((1-c)·(1-s))

要它等于奶油 T，解出 s = 1 - M⁻¹T/(1-c)。c 取对局屏的底 #030303，T 取 #f0eadc，
算得 s = #181204。混合模式从 multiply 换成 screen，颜色换成这一个，别的不动。

代价是：按真彩画的那三层（菜单、纪年、铸局）本来不吃这层罩子，现在也要被乘一遍，
底色会从 #F0EADC 掉到 #E2D7BE。所以把它们那几处大面积的底色预先提亮到 #FCFCFC——
按同一条式子回推，正好落回 #F0EADC。其余小面积的描边、金色、文字色偏移不到 3%，
肉眼分不出来，就不动了，免得把已经调好的那几屏搅乱。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

# 锚点 · 换成 · 应有几处
PAIRS = [
    # ① 暖纸罩：颜色换成补色，混合模式换成 screen
    ("""html.lux::after{content:'';position:fixed;inset:0;z-index:2147483647;pointer-events:none;
  background:#f2ece0;mix-blend-mode:multiply}""",
     """/* 暖纸罩。颜色与混合模式是按「隔着根元素那道 invert+hue-rotate」反解出来的：
   F(screen(c,s)) = M·((1-c)·(1-s))，令它等于 #f0eadc，得 s=#181204。
   写成 multiply + #f2ece0 的老写法，作用在反色之前的近黑底上，等于没写——
   对局屏与全部弹窗因此一直是纯白。 */
html.lux::after{content:'';position:fixed;inset:0;z-index:2147483647;pointer-events:none;
  background:#181204;mix-blend-mode:screen}""", 1),

    # ② 三层按真彩画的底色预先提亮：被暖纸乘一遍之后正好落回 #f0eadc
    (':root{--cream:#f0eadc}',
     '/* 这三层自己反过一次，是按真彩画的；暖纸罩会再乘它们一遍，\n'
     '   所以底色预先提亮，乘完正好是 #f0eadc。改暖纸罩就得跟着改这几处。 */\n'
     ':root{--cream:#fcfcfc}', 1),
    ('html.lux #eraSel{background:#f0eadc}', 'html.lux #eraSel{background:#fcfcfc}', 1),
    ('#feWrap{position:fixed;inset:0;z-index:47;display:none;background:#f0eadc;',
     '#feWrap{position:fixed;inset:0;z-index:47;display:none;background:#fcfcfc;', 1),
    # 与底色相接的那几处半透明层：不跟着提亮就会在接缝上显出一道
    ('rgba(240,234,220,', 'rgba(252,252,252,', 12),
]


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if 'background:#181204' in s:
        print('暖纸罩早已挪过，跳过。')
        return
    for a, _, cnt in PAIRS:
        if s.count(a) != cnt:
            sys.exit('锚点 %r 该有 %d 处，实际 %d 处，停手。' % (a[:40], cnt, s.count(a)))
    for a, n, cnt in PAIRS:
        s = s.replace(a, n, cnt)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('暖纸罩已挪到反色之后 · 主文档 %.0f KB' % (os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
