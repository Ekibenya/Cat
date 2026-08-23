#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""手機端的主選單：馬賽克邊框收細，中間的圖與字放大。

    python3 tools/felinia/menufit.py

原本磚塊寫死 26 像素，邊框固定兩格厚，內距又各加 22 / 18 的死數。
桌面 1440 寬時左右邊框各佔 5%，看不出問題；手機 390 寬時各佔 19%，
左右加起來吃掉三成八的寬度，中間那張貓咪圖只剩 242 像素寬（佔寬 62%）。
量過的數：

    視口        邊框(單邊)   圖案寬     佔寬
    1440×960    74px  5%    1292px    90%
    390×844     74px 19%     242px    62%   ← 手機
    360×780     74px 21%     212px    59%

窄螢幕上把磚縮到 15 像素、內距的死數收到 8，邊框單邊降到 38 像素（9.7%），
圖案回到 314 像素寬（佔寬 81%）。桌面一個像素都不動。

選單那三行字手機上是 11px、字距 .42em，又小又散；頁腳 9px 還比視口寬
（實測 x=-3、寬 397 > 390，左右兩頭被馬賽克蓋掉）。一起收。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = 'mosNarrow'

JS_OLD = """  var B=MOS_B, cols=Math.max(8,Math.floor(vw/B)), rows=Math.max(8,Math.floor(vh/B));
  var bx=(vw-cols*B)/2, by=(vh-rows*B)/2;"""
JS_NEW = """  /* 磚原本寫死 26：桌面 1440 寬時單邊邊框佔 5%，手機 390 寬時佔到 19%，
     左右加起來吃掉三成八，中間那張圖只剩 242 像素寬。窄螢幕上磚跟內距一起收。 */
  var mosNarrow = vw < 560;
  var B = mosNarrow ? 15 : MOS_B;
  var cols=Math.max(8,Math.floor(vw/B)), rows=Math.max(8,Math.floor(vh/B));
  var bx=(vw-cols*B)/2, by=(vh-rows*B)/2;"""

JS_OLD2 = """  var padX=2*B+22, padTop=2*B+18, padBot=2*B+Math.max(96,vh*0.14);"""
JS_NEW2 = """  var padX  = 2*B + (mosNarrow ? 8 : 22);
  var padTop= 2*B + (mosNarrow ? 8 : 18);
  var padBot= 2*B + (mosNarrow ? Math.max(56,vh*0.09) : Math.max(96,vh*0.14));"""

CSS_OLD = """@media (max-width:760px){
  #menu .mItems{flex-direction:column;align-items:center;gap:24px;top:50%}"""
CSS_NEW = """@media (max-width:760px){
  #menu .mItems{flex-direction:column;align-items:center;gap:24px;top:50%}
  /* 11px 配 .42em 的字距，在手機上又小又散；頁腳 9px 還比視口寬
     （實測寬 397 > 390，左右兩頭被馬賽克蓋掉）。字放大，字距收緊。 */
  #menu .mItem{font-size:13.5px;letter-spacing:.24em;padding:12px 18px 10px}
  #menu .mFoot{font-size:9.5px;letter-spacing:.16em;bottom:20px;
      max-width:88vw;overflow:hidden;text-overflow:ellipsis}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('手機選單已經調過了，跳過。')
        return
    for a, b in ((JS_OLD, JS_NEW), (JS_OLD2, JS_NEW2), (CSS_OLD, CSS_NEW)):
        n = s.count(a)
        if n != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (n, a[:56]))
        s = s.replace(a, b)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('手機選單：磚 26→15、單邊邊框 74→38 像素（19%→9.7%）、'
          '圖案佔寬 62%→81%；選單字 11→13.5px，頁腳收進視口。桌面不動。')


if __name__ == '__main__':
    main()
