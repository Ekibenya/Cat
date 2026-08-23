#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""手機端的鑄局四步：把立繪找回來。

    python3 tools/felinia/fefit.py

桌面版立繪擺在左右兩塊玻璃板之間那道空檔裡（#fePerPortrait 是 left:30%;right:38%）。
手機上兩塊板改成上下疊，中間就沒有空檔了，所以當初直接寫了一條

    @media (max-width:860px){ #fePerPortrait{display:none!important} }

立繪整個關掉。實測紀年二十五「人物」那一步：上板 254、下板 476，加上頭尾剛好
佔滿 844 的螢幕，一條縫都不剩；而立繪的 src 是有的（單角色立繪/猫娘01.png），
只是永遠畫不出來。

窄螢幕上擠不下「表單 + 立繪」，所以不硬擠，改成給一個開關：
底下那條加一顆「立繪 IMAGO」，按下去兩塊板淡到幾乎透明、立繪整屏顯示，
再按一次收回去。換步驟時自動收。桌面完全不動。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = 'feArt'

HTML_OLD = ('<span class="l"><span class="go back" id="feBack">返回<i>ESC</i></span>'
            '<span id="feHint">● FELINIA</span></span>')
HTML_NEW = ('<span class="l"><span class="go back" id="feBack">返回<i>ESC</i></span>'
            '<span class="go" id="feArt">立绘<i>IMAGO</i></span>'
            '<span id="feHint">● FELINIA</span></span>')

CSS_OLD = "  #fePerPortrait{display:none!important}"
CSS_NEW = """  /* 立繪原本在窄螢幕整個關掉（上下兩塊板佔滿螢幕，中間沒有空檔擺）。
     改成平時仍然不佔位，按了底下那顆「立繪」才整屏浮出來，兩塊板同時淡掉。 */
  #feWrap[data-step="per"] #fePerPortrait,
  #feWrap[data-step="soc"] #fePerPortrait{display:flex;left:0;right:0;top:38px;bottom:46px;
      z-index:6;opacity:0;pointer-events:none;transition:opacity .26s}
  #feWrap:not([data-step="per"]):not([data-step="soc"]) #fePerPortrait{display:none}
  #feWrap.artOn #fePerPortrait{opacity:1}
  #feWrap.artOn #fePanL,#feWrap.artOn #fePanR{opacity:.06;pointer-events:none;
      transition:opacity .26s}
  #feWrap.artOn #fePerPortraitCap{font-size:11px;bottom:14px;letter-spacing:.1em}
  #feWrap[data-step="per"] #feFoot #feArt,
  #feWrap[data-step="soc"] #feFoot #feArt{display:inline-block}
  #feWrap.artOn #feArt{color:var(--gold-hi)}"""

CSS2_OLD = "#feWrap[data-step=\"per\"] #fePerPortrait,\n#feWrap[data-step=\"soc\"] #fePerPortrait{display:flex}"
CSS2_NEW = ("#feWrap[data-step=\"per\"] #fePerPortrait,\n"
            "#feWrap[data-step=\"soc\"] #fePerPortrait{display:flex}\n"
            "/* 這顆只在窄螢幕的立身與識人兩步出現，桌面用不著（那裡立繪一直在）。\n"
            "   得寫成 #feFoot #feArt —— 上頭 #feFoot .go 那條是 display:inline-block，\n"
            "   權重壓得過單一個 #feArt，只寫 id 會被蓋回去照樣顯示。 */\n"
            "#feFoot #feArt{display:none}")

JS_OLD = """function feStep(s){
  FE.step=s;
  var w=$('#feWrap');w.setAttribute('data-step',s);"""
JS_NEW = """function feStep(s){
  FE.step=s;
  var w=$('#feWrap');w.setAttribute('data-step',s);
  w.classList.remove('artOn');       /* 換一步就把立繪收回去 */"""

JS2_OLD = "function feClose(){$('#feWrap').classList.remove('on');}"
JS2_NEW = """function feClose(){$('#feWrap').classList.remove('on');}
/* 窄螢幕上立繪平時不佔位，按這顆才整屏浮出來，兩塊板同時淡掉。
   pointerup 跟這一頁其餘的鈕一致（click 在觸控上會慢一拍）。 */
try{$('#feArt').addEventListener('pointerup',function(e){
  e.stopPropagation();$('#feWrap').classList.toggle('artOn');});}catch(_){}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('手機端的立繪開關已經裝過了，跳過。')
        return
    for a, b in ((HTML_OLD, HTML_NEW), (CSS2_OLD, CSS2_NEW), (CSS_OLD, CSS_NEW),
                 (JS_OLD, JS_NEW), (JS2_OLD, JS2_NEW)):
        n = s.count(a)
        if n != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (n, a[:56]))
        s = s.replace(a, b)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('手機端立身／識人兩步多了一顆「立绘 IMAGO」：'
          '按下去兩塊板淡到 .06、立繪整屏，再按收回，換步自動收。桌面不動。')


if __name__ == '__main__':
    main()
