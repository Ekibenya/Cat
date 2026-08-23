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
  mosNar = vw < 560;
  var mosNarrow = mosNar;
  var B = mosNarrow ? 13 : MOS_B;
  var TH = mosNarrow ? 1 : 2;        /* 邊框幾格厚。窄螢幕減半 */
  var cols=Math.max(8,Math.floor(vw/B)), rows=Math.max(8,Math.floor(vh/B));
  var bx=(vw-cols*B)/2, by=(vh-rows*B)/2;"""

JS_OLDR = """  for(c=0;c<cols;c++){add(c,0);add(c,1);}
  for(r=2;r<rows-2;r++){add(cols-1,r);add(cols-2,r);}
  for(c=cols-1;c>=0;c--){add(c,rows-1);add(c,rows-2);}
  for(r=rows-3;r>=2;r--){add(0,r);add(1,r);}"""
JS_NEWR = """  var th;
  for(c=0;c<cols;c++){for(th=0;th<TH;th++)add(c,th);}
  for(r=TH;r<rows-TH;r++){for(th=0;th<TH;th++)add(cols-1-th,r);}
  for(c=cols-1;c>=0;c--){for(th=0;th<TH;th++)add(c,rows-1-th);}
  for(r=rows-TH-1;r>=TH;r--){for(th=0;th<TH;th++)add(th,r);}"""

JS_OLD2 = """  var padX=2*B+22, padTop=2*B+18, padBot=2*B+Math.max(96,vh*0.14);"""
JS_NEW2 = """  var padX  = TH*B + (mosNarrow ? 5 : 22);
  var padTop= TH*B + (mosNarrow ? 5 : 18);
  /* 底部留白決定圖擺在哪。窄螢幕的選單是置中的（top:50%），實測第一行落在
     vh 的 0.64 附近；圖放大到一點五倍以後，底下那條南極洲會壓到它
     （360×780 上實測重疊 23 像素）。所以把圖的垂直可用區收到 vh 的 0.62 為止，
     圖就置中在「頂邊到選單」這一段裡，上下都留得開。 */
  var padBot= mosNarrow ? (vh*0.38) : (TH*B + Math.max(96,vh*0.14));"""

JS_OLDS = """  var sc=Math.min(aw/MOS.w, ah/MOS.h);"""
JS_NEWS = """  /* 窄螢幕上按 contain 算，圖撐滿寬也只有 354 像素、佔高兩成，
     吊在紙面中間細細一條。委託人交代圖要夠大、出框也行，所以窄螢幕改成
     按視口寬的一點五倍鋪：左右各溢出約 98 像素，蓋到馬賽克邊框上去。
     圖案在 mosSeq 裡本來就排在邊框之後，畫的時候壓得住，不用另外調層。 */
  var sc = mosNarrow ? (vw*1.5)/MOS.w : Math.min(aw/MOS.w, ah/MOS.h);"""

JS_OLDZ = """var mosCv=$('#mosCv'), mosG=mosCv&&mosCv.getContext('2d');"""
JS_NEWZ = """var mosCv=$('#mosCv'), mosG=mosCv&&mosCv.getContext('2d');
var mosNar=false;                  /* 窄螢幕？mosFit 每次量完視口就更新 */"""

JS_OLDD = """function mosDraw(i,g,p){
  var e=mosSeq[i], D=mosDPR;
  g.save();"""
JS_NEWD = """function mosDraw(i,g,p){
  var e=mosSeq[i], D=mosDPR;
  g.save();
  /* 窄螢幕上圖案放大到出了框，邊框要壓在它上面。
     一開始是把圖案排到 mosSeq 前面去，可是那條序列同時也是飛入的次序
     （mosTick 裡 a=el-i*step），三千多塊圖案先飛，邊框排到最後——實測拍下來
     整圈框還沒出現。所以排序不動，改成圖案一律畫到既有像素底下：
     邊框先落位、圖案後落位卻沉在下面，兩件事就拆開了。
     圖案各塊互不重疊，彼此之間沒有影響。 */
  if(mosNar&&e[0]===1)g.globalCompositeOperation='destination-over';"""

CSS_OLD = """@media (max-width:760px){
  #menu .mItems{flex-direction:column;align-items:center;gap:24px;top:50%}"""
CSS_NEW = """@media (max-width:760px){
  #menu .mItems{flex-direction:column;align-items:center;gap:24px;top:50%}
  /* 選單那四個鈕的字級不動 —— 一度放到 13.5px，委託人說不該放大，還原成 11px。
     頁腳是另一回事：9px 卻比視口還寬（實測 397 > 390），左右兩頭被馬賽克蓋掉，
     那是版面壞了，得收。 */
  #menu .mFoot{font-size:9.5px;letter-spacing:.16em;bottom:20px;
      max-width:88vw;overflow:hidden;text-overflow:ellipsis}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('手機選單已經調過了，跳過。')
        return
    for a, b in ((JS_OLD, JS_NEW), (JS_OLDR, JS_NEWR), (JS_OLD2, JS_NEW2),
                 (JS_OLDS, JS_NEWS), (JS_OLDZ, JS_NEWZ),
                 (JS_OLDD, JS_NEWD), (CSS_OLD, CSS_NEW)):
        n = s.count(a)
        if n != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (n, a[:56]))
        s = s.replace(a, b)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('手機選單：磚 26→13、邊框由兩格改一格、單邊 74→18 像素（19%→4.6%）、'
          '圖案改成按視口寬一點五倍鋪、左右出框且壓在邊框之下；'
          '選單四個鈕的字級不動，頁腳收進視口。桌面不動。')


if __name__ == '__main__':
    main()
