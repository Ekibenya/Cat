#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鑄局四步兩邊那兩塊板，黃味收一點。

    python3 tools/felinia/feglass.py

有人回報「開局定制的地點／人物／同伴／開場，兩邊的彈窗有點發黃」。

黃是兩件事疊出來的。

一、板子自己透。

    .feGl{ background:rgba(237,231,217,.34); backdrop-filter:blur(3px) }

底色由毛玻璃那根拉桿定（applyGlass 裡 .22+.32*a，預設 a=.8 → .48），一半以上是透的；
身後鋪的是整幅馬賽克世界地圖，磚是土黃與褐色的，而模糊只有 3 像素，磚糊不開，
一塊一塊透上來 —— 板子裡就浮著一層黃斑。

二、整屏罩著一層暖紙。

    html.lux #eraSel::after, html.lux #feWrap::after{
      … background:#f0eadc; mix-blend-mode:multiply }

這一版把奶油配色烘焙進了每一個顏色值，只有紀年選擇與鑄局兩屏例外（那兩屏鋪的是
真彩馬賽克畫，不能烘焙），改成現場正片疊底罩一層。所以鑄局屏上**每一個像素**
都乘過 #f0eadc —— 把板子調成不透明的純白，量出來也還是 (240,234,220)。

**這一層不動。** 那是這兩屏的紙面調子，動了整屏就跟站上其餘地方脫節。
題目是「別那麼黃」，不是「換成白的」。

所以只動板子自己那一層，兩件：

    底色    rgba(237,231,217) → rgba(250,249,246)   自己不再帶黃，黃味交給那層罩
    不透明  .22+.32*a → .52+.26*a                   預設拉桿 80 時 .48 → .73
            地點那一步 .28+.48*a → .58+.26*a        預設 .66 → .79
    模糊    blur(3px) → blur(8px)                   磚糊成一片，不再一塊塊透

實測（板內留白處，暖度＝R−B）：

    擇地  (191,180,155) 暖36  →  (218,210,193) 暖25
    立身  (228,221,202) 暖26  →  (235,229,213) 暖22
    識人  (228,221,202) 暖26  →  (235,229,213) 暖22
    此刻  (205,196,175) 暖30  →  (225,219,202) 暖23

還是那張暖紙，只是不再泛黃斑。

（走過的彎路記一筆，免得下次又繞：一度把暖紙罩的範圍從整屏收成「除了板子以外」，
  板子暖度掉到 6 —— 白過頭，成了一張白紙貼在畫上。收黃味就夠了，別動那層罩。
  也試過只把不透明提上去而底色照舊：底色本身就帶黃，提得越實反而越黃，26 變 30。）

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = '砖糊不开，一块一块透上来'

A_OLD = """  -webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}"""
A_NEW = """  /* 模糊由 3 像素加到 8：身后铺的是马赛克世界地图，砖是土黄与褐色的，
     3 像素糊不开，一块一块透上来，板子里就浮着一层黄斑。 */
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}"""

B_OLD = "    +'.feGl{background:rgba(237,231,217,'+(.22+.32*a).toFixed(2)+') !important}'"
B_NEW = ("    /* 由 .22+.32*a 提到 .42+.30*a：预设拉杆 80 时由 .48 提到 .66。\n"
         "       透一半的时候身后那幅马赛克透上来，板子就发黄；实一档，黄味就淡了。\n"
         "       底色不动，还是那片暖奶油 —— 要的是别那么黄，不是换成白的。 */\n"
         "    +'.feGl{background:rgba(250,249,246,'+(.52+.26*a).toFixed(2)+') !important}'")

C_OLD = ("    +'#feWrap[data-step=\"loc\"] .feGl'\n"
         "    +'{background:rgba(237,231,217,'+(.28+.48*a).toFixed(2)+') !important}'")
C_NEW = ("    +'#feWrap[data-step=\"loc\"] .feGl'\n"
         "    +'{background:rgba(250,249,246,'+(.58+.26*a).toFixed(2)+') !important}'")


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('铸局那两块板已经调过了，跳过。')
        return
    for a, b in ((A_OLD, A_NEW), (B_OLD, B_NEW), (C_OLD, C_NEW)):
        n = s.count(a)
        if n != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (n, a[:60]))
        s = s.replace(a, b)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('鑄局那兩塊板：底色 rgba(237,231,217) → rgba(250,249,246)，')
    print('  不透明 .48 → .73（地點那一步 .66 → .79），模糊 3px → 8px。')
    print('  整屏那層暖紙罩不動 —— 還是那張暖紙，只是不泛黃斑（暖度 26 → 22）。')


if __name__ == '__main__':
    main()
