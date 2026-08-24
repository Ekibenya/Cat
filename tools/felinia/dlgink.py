#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""彈窗裡的字太淡，看不清。

    python3 tools/felinia/dlgink.py

有人回報「很多彈窗、設定裡有些文字顏色太淡看不清」。量過了，是真的。

量法：把七個彈窗逐個打開，收集裡頭每一個自己帶字的元素（一百八十五處），
取它的 CSS color（半透明的先跟底合成），底色取那一塊實際像素的眾數，
再算 WCAG 對比度。正文的門檻是 4.5。

    共一百八十五處：低於 3.0 的 八十二處
                    3.0 到 4.5 的 六十五處
                    4.5 以上的   三十八處

也就是說**八成的字沒過門檻**。分彈窗看：

    設定 dlgCfg   34 處，27 處不過
    資料庫 dlgBook 46 處，37 處不過
    存檔 dlgSave  72 處，68 處不過
    接AI dlgApi   17 處， 9 處不過

不是散開的毛病，就三個來源：

  一、--mut 這個色（#8d8a7d），八十一處。
      在奶油底（#EDE7D9 上下）上算出來是 **2.7:1**，門檻是 4.5。
      設定那一排分頁（生圖／語音／角色卡／世界書／正則／腳本／AI接口／預設／
      記憶／備份／圖庫）、每一條設定的標題（SONVS · 音效、LITTERAE · 正文字體…）、
      底下那幾段說明、ESC // RETVRN，全是這個色；資料庫那三欄的清單與計數也是。

      改成 #5f5c53 —— **這個值本來就在這張卡裡**：右邊情報台（.gMfd）與
      周紀那一套（.zjP）用的就是它。同一片奶油底上算出來 5.4:1，過。
      只在 .gDlg 這一層改，彈窗以外一個像素都不動。

  二、存檔那一屏的卡片，兩個色都是 55% 透明：
      .svFold .num（十四像素的號碼）約 3.2:1
      .svFold .lb （六點五像素的名字）約 3.4:1
      各三十二處。提到 80%。

      這裡不能只看這個數：卡片本身還帶一層景深透明
      （d.style.opacity=(v?.55:.38)+z*.42），空卡片本來就該淡、遠的本來就該淡。
      提的是**字自己**那一層，景深照舊乘在外面 —— 前排一張有存檔的卡片，
      合起來由 .53 提到 .78，讀得清；後排的空卡片照舊隱在遠處。
      六點五像素那個字級不動：那是景深的一部分，前排卡片會被透視放大。

沒動、另外報的：存檔右上角那顆刪除的 ✕（#svRedX，#ff7f63 在奶油底上 2.0:1）。
那個紅是給深色底調的，擺在淺底上就發白。要修得換一個紅，這裡不自己挑。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = '弹窗里的 --mut'

A_OLD = '.gDlg{animation:mvFade var(--t-view) var(--e-out) backwards}'
A_NEW = """/* 弹窗里的 --mut 单独调深一档。
   全局那个 #8d8a7d 摆在奶油底（#EDE7D9 上下）上量出来只有 2.7:1，正文门槛是 4.5——
   设置那一排分页、每条设定的标题、底下几段说明、ESC // RETVRN、资料库三栏的清单，
   全是这个色，一共八十一处不过关。有人回报「太淡看不清」，说的就是这些。
   #5f5c53 不是新挑的：右边情报台（.gMfd）与周纪那一套（.zjP）本来就用它，
   同一片底上 5.4:1。只在这一层改，弹窗以外一个像素不动。 */
.gDlg{--mut:#5f5c53;animation:mvFade var(--t-view) var(--e-out) backwards}"""

B_OLD = ('.svFold .num{font-size:14px;font-weight:400;letter-spacing:.04em;'
         'color:rgba(34,33,26,.55);')
B_NEW = ('/* 55% 在奶油底上是 3.2:1，提到 80%。卡片本身那层景深透明照旧乘在外面\n'
         '   （svFold 建的时候 opacity=(v?.55:.38)+z*.42），所以空卡片、远处的卡片\n'
         '   还是该淡的淡；改的只是「字自己」这一层，前排有存档的那几张读得清了。 */\n'
         '.svFold .num{font-size:14px;font-weight:400;letter-spacing:.04em;'
         'color:rgba(34,33,26,.80);')

C_OLD = ('.svFold .lb{font-size:6.5px;letter-spacing:.2em;line-height:1.6;'
         'color:rgba(53,52,45,.55)}')
C_NEW = ('/* 同上。六点五像素这个字级不动——那是景深的一部分，前排卡片会被透视放大。 */\n'
         '.svFold .lb{font-size:6.5px;letter-spacing:.2em;line-height:1.6;'
         'color:rgba(53,52,45,.80)}')

# 设置那一排页签：连 #5f5c53 都还不够，因为它底下不是奶油
D_OLD = """.cfgTabs span{flex:none;font-size:9px;letter-spacing:.16em;color:var(--mut);cursor:pointer;"""
D_NEW = ('/* 这一排单独再深一档。别处的字底下是奶油（#EDE7D9 上下），--mut 改成 #5f5c53\n'
         '   就够了；这一排不是——弹窗自己只有两成四不透明（毛玻璃那根拉杆定的，\n'
         '   见 applyGlass），身后画面直接透上来。实测这一排底下量到的是 (170,163,149)，\n'
         '   在那上头 #5f5c53 只有 2.7:1，跟没改一样。#3a3830 在那上头 4.5:1，\n'
         '   落回奶油上是 9.2:1。选中的那一枚照旧是金底浅字，层次还在。 */\n'
         '.cfgTabs span{flex:none;font-size:9px;letter-spacing:.16em;color:#3a3830;cursor:pointer;')


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('弹窗的字色已经调过了，跳过。')
        return
    for a, b in ((A_OLD, A_NEW), (B_OLD, B_NEW), (C_OLD, C_NEW), (D_OLD, D_NEW)):
        n = s.count(a)
        if n != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (n, a[:60]))
        s = s.replace(a, b)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('彈窗字色：.gDlg 的 --mut 由 #8d8a7d 調到 #5f5c53（2.7:1 → 5.4:1）；')
    print('存檔卡片的號碼與名字由 55% 透明提到 80%；')
    print('設定那一排頁籤單獨再深到 #3a3830（它底下不是奶油，是透上來的畫面）。')
    print('彈窗以外一個像素不動。')


if __name__ == '__main__':
    main()
