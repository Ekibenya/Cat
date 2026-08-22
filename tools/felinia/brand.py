#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把空壳的招牌换成这张卡自己的：APOTHECA → FELINIA，并填掉「空壳」那几处占位。

空壳是从别的卡掏空来的，招牌、片头字母、剧情线名、页签、人物卡的占位文字
都还写着上一张卡的名字。内容注进来了，招牌不换，玩家第一眼看到的还是别人的卡。

只换招牌与占位，不动任何逻辑。代码注释里的「空壳」照旧留着——那是写给作业者看的，
说的就是这份文件本来的来历。

已经换过就什么都不做，好让重打脚本能反复跑。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

# 锚点 · 换成 · 应有几处
PAIRS = [
    ('<title>APOTHECA.SYS</title>', '<title>FELINIA.SYS</title>', 1),
    ('content="APOTHECA.SYS"', 'content="FELINIA.SYS"', 1),
    ('content="一部跑在浏览器里的叙事游戏引擎空壳。"',
     'content="一部横跨上下万年的猫娘世界史。年代 · 地点 · 人由你定。"', 1),
    ('<div class="row"><span class="name">APOTHECA</span></div>',
     '<div class="row"><span class="name">FELINIA</span></div>', 1),
    ('● APOTHECA.SYS&nbsp;&nbsp;|&nbsp;&nbsp;ENGINE SHELL LINKED&nbsp;&nbsp;|&nbsp;&nbsp;<b>—</b> SCENARIOS',
     '● FELINIA.SYS&nbsp;&nbsp;|&nbsp;&nbsp;ANNALES LINKED&nbsp;&nbsp;|&nbsp;&nbsp;<b>XLI</b> TABVLAE', 1),
    ('LINEA&nbsp;NOVA&nbsp;//&nbsp;APOTHECA.SYS&nbsp;&nbsp;·&nbsp;&nbsp;MMXXIX',
     'HISTORIA&nbsp;FELINA&nbsp;//&nbsp;FELINIA.SYS&nbsp;&nbsp;·&nbsp;&nbsp;MCM', 1),
    ('─&nbsp;&nbsp;LINEA&nbsp;NOVA&nbsp;//&nbsp;APOTHECA&nbsp;&nbsp;─',
     '─&nbsp;&nbsp;HISTORIA&nbsp;FELINA&nbsp;//&nbsp;FELINIA&nbsp;&nbsp;─', 1),
    ('<span class="gBrand">LINEA&nbsp;NOVA&nbsp;//&nbsp;APOTHECA.SYS</span>',
     '<span class="gBrand">HISTORIA&nbsp;FELINA&nbsp;//&nbsp;FELINIA.SYS</span>', 1),
    ('<p>（空壳。尚无剧情。）</p>',
     '<p>（这一幕由你在铸局那一步定下。）</p>', 1),
    ('<span class="cxTab on" data-side="luzhi">APOTHECA</span>',
     '<span class="cxTab on" data-side="luzhi">FELINIA</span>', 1),
    ('<span class="ebTab on" data-line="luzhi">APOTHECA&nbsp;·&nbsp;空壳</span>',
     '<span class="ebTab on" data-line="luzhi">FELINIA&nbsp;·&nbsp;猫娘世界史</span>', 1),
    ('LINEA&nbsp;NOVA&nbsp;<i>APOTHECA.SYS</i>',
     'HISTORIA&nbsp;FELINA&nbsp;<i>FELINIA.SYS</i>', 1),
    ('●&nbsp;APOTHECA.SYS&nbsp;·&nbsp;DIRECTORIVM',
     '●&nbsp;FELINIA.SYS&nbsp;·&nbsp;DIRECTORIVM', 1),
    ("var TITLE_CHARS=['A','P','O','T','H'];", "var TITLE_CHARS=['F','E','L','I','N'];", 1),
    ("var LINE_LBL={luzhi:'LINEA·APOTHECA'};", "var LINE_LBL={luzhi:'ANNALES·FELINIA'};", 1),
    ("luzhi:{tag:'APOTHECA',name:'空壳 · 世界未定',sub:'尚无剧情 —— 等待下一张卡',draw:'hall'}};",
     "luzhi:{tag:'FELINIA',name:'猫娘世界史 · 四十一幅图版',"
     "sub:'由初民至一九〇〇年 —— 年代、地点与人由你定',draw:'hall'}};", 1),
    ('<div class="psCard" id="pcRoma"><b>—</b><span>空壳&nbsp;·&nbsp;尚无固定人物</span></div>',
     '<div class="psCard" id="pcRoma"><b>—</b><span>本卡无固定人物&nbsp;·&nbsp;'
     '主角在铸局那一步现立</span></div>', 1),
    ('<div class="psCard" id="pcZhou"><b>—</b><span>空壳&nbsp;·&nbsp;尚无固定人物</span></div>',
     '<div class="psCard" id="pcZhou"><b>—</b><span>世界书里那些人是别人&nbsp;·&nbsp;'
     '不是你的前身</span></div>', 1),
    # 全站只剩奶油一档：手机上的浏览器外框与状态栏也得跟着走，
    # 不然页面是奶油的、顶上那一条还是黑的；黑底半透明的状态栏配奶油纸，字也看不清。
    ('<meta name="theme-color" content="#060606">',
     '<meta name="theme-color" content="#f0eadc">', 1),
    ('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
     '<meta name="apple-mobile-web-app-status-bar-style" content="default">', 1),
]


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if '<title>FELINIA.SYS</title>' in s:
        print('招牌早已换过，跳过。')
        return
    for a, _, cnt in PAIRS:
        if s.count(a) != cnt:
            sys.exit('锚点 %r 该有 %d 处，实际 %d 处，停手。' % (a[:34], cnt, s.count(a)))
    for a, n, cnt in PAIRS:
        s = s.replace(a, n, cnt)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('招牌已换 · 改了 %d 处 · 主文档 %.0f KB' % (len(PAIRS), os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
