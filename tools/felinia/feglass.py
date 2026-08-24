#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鑄局四步兩邊那兩塊板發黃。

    python3 tools/felinia/feglass.py

有人回報「開局定制的地點／人物／同伴／開場，兩邊的彈窗有點發黃」。

**病根不在板子上，在整屏。** 這一版把奶油配色烘焙進了每一個顏色值，
只有兩屏例外——紀年選擇與鑄局——因為那兩屏鋪的是真彩的馬賽克畫，
不能烘焙，於是改成現場罩一層暖紙：

    html.lux #eraSel::after, html.lux #feWrap::after{
      content:''; position:absolute; inset:0; z-index:2147483647;
      pointer-events:none; background:#f0eadc; mix-blend-mode:multiply }

`#feWrap::after` 蓋的是**整個鑄局屏**，正片疊底，z-index 頂到 2147483647。
板子在它底下，所以板子怎麼調都沒用——實測把 .feGl 調成**不透明的純白**，
螢幕上量出來還是 (240,234,220)，正是 255 乘 #f0eadc 的結果。
前面兩版一直在調 .feGl 的底色與透明度，暖度只從 26 挪到 24，就是這個原因。

（查的過程留一句：這一層 pointer-events:none，document.elementFromPoint 看不見它，
  照著點去查層次會一路查空。是靠「蓋一塊不透明純白上去，量出來卻不是 255」問出來的。）

改法：**罩的範圍由整屏收成「除了板子以外」**。

    #feWrap::after  →  #feBg::after · #feMap::after · #feHead::after · #feFoot::after

畫（#feBg／#feMap）、頂欄、頁腳照舊罩暖紙，紙面調子不變；
板子（#feStage 底下的 #fePanL／#fePanR）不再被乘一遍。實測：

    板內    (234,227,210) 暖24  →  (248,247,243) 暖5
    頂欄    (218,208,185)       →  (219,209,186)      幾乎不動
    地圖磚  (176,161,138)       →  (182,171,156)      略淺一點

順手把板子自己那一層也換掉：底色由那片暖奶油 rgba(237,231,217) 換成 rgba(244,240,231)，
不透明由 .22+.32*a 提到 .58+.24*a（預設拉桿 80 時 .48 → .77），
模糊由 3 像素加到 10 像素並壓一檔彩度——身後的馬賽克磚原本一塊塊透上來，
糊開之後就不會在板子裡留下黃斑。毛玻璃那根拉桿照舊管用（a=0 → .58，a=1 → .82）。

**這個色是回調過的。** 把暖紙罩收掉之後，第一次配的是中性的 rgba(248,247,243)、
不透明 .81，板內量出來 (246,245,240)、暖度 6 —— 委託人說「白過頭了」。
所以底色往回暖一檔、不透明也收一檔，落在暖度十四上下：不再發黃，也還是紙，
不是一張白紙貼在畫上。要再調就動這兩個數，別處不用碰。

紀年選擇那一屏（#eraSel::after）不動：那裡沒有板子，罩整屏是對的。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = '底下透上来的地图'

# ── 一、靜態那一條：底色兜底值與模糊 ──
A_OLD = """.feGl{position:absolute;inset:0;background:rgba(237,231,217,.34);
  border:1px solid rgba(19,18,13,.20);
  box-shadow:0 14px 34px rgba(242,236,222,.5);
  -webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}"""
A_NEW = """/* 这两块板发黄，病根不是板子的颜色，是底下透上来的地图是黄的：底色有一半以上
   是透的（真正生效的那一档在 applyGlass 里），而身后铺的是整幅马赛克世界地图，
   砖是土黄与褐色的；模糊只有 3 像素，砖糊不开，一块一块透上来就成了一片黄斑。
   底色换成几乎中性的纸白、模糊加到 10 像素、彩度再压一档 —— 砖糊成一片，黄就散了。 */
.feGl{position:absolute;inset:0;background:rgba(244,240,231,.66);
  border:1px solid rgba(19,18,13,.20);
  box-shadow:0 14px 34px rgba(242,236,222,.5);
  -webkit-backdrop-filter:blur(10px) saturate(72%);
  backdrop-filter:blur(10px) saturate(72%)}"""

# ── 二、拉桿算出來的那一檔（真正生效的） ──
B_OLD = "    +'.feGl{background:rgba(237,231,217,'+(.22+.32*a).toFixed(2)+') !important}'"
B_NEW = ("    /* 由 .22+.32*a 提到 .58+.24*a：预设拉杆 80 时由 .48 提到 .77。\n"
         "       透一半的时候，身后那幅马赛克一块块透上来，板子就发黄。 */\n"
         "    +'.feGl{background:rgba(244,240,231,'+(.58+.24*a).toFixed(2)+') !important}'")

C_OLD = ("    +'#feWrap[data-step=\"loc\"] .feGl'\n"
         "    +'{background:rgba(237,231,217,'+(.28+.48*a).toFixed(2)+') !important}'")
C_NEW = ("    +'#feWrap[data-step=\"loc\"] .feGl'\n"
         "    +'{background:rgba(244,240,231,'+(.64+.22*a).toFixed(2)+') !important}'")

# ── 三、暖紙罩：由整屏收成「除了板子以外」──
D_OLD = """html.lux #eraSel::after,html.lux #feWrap::after{
  content:'';position:absolute;inset:0;z-index:2147483647;pointer-events:none;
  background:#f0eadc;mix-blend-mode:multiply}"""
D_NEW = """/* 这一罩原来盖的是整个铸局屏（#feWrap::after），正片叠底、z-index 顶到底，
   板子在它底下，怎么调都发黄 —— 实测把板子调成不透明的纯白，量出来还是
   (240,234,220)，正好是 255 乘 #f0eadc。所以罩的范围收一收：
   画（#feBg／#feMap）、顶栏、页脚照旧罩，纸面调子不变；板子（#feStage 底下那两块）
   不再被乘一遍。纪年选择那一屏没有板子，照旧罩整屏。 */
html.lux #eraSel::after,
html.lux #feBg::after,html.lux #feMap::after,
html.lux #feHead::after,html.lux #feFoot::after{
  content:'';position:absolute;inset:0;z-index:2147483647;pointer-events:none;
  background:#f0eadc;mix-blend-mode:multiply}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('铸局那两块板已经调过了，跳过。')
        return
    for a, b in ((A_OLD, A_NEW), (B_OLD, B_NEW), (C_OLD, C_NEW), (D_OLD, D_NEW)):
        n = s.count(a)
        if n != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (n, a[:60]))
        s = s.replace(a, b)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('暖紙罩由整個鑄局屏收成「除了板子以外」：畫、頂欄、頁腳照舊罩，板子不罩。')
    print('  板內實測 (234,227,210) 暖24 → (248,247,243) 暖5；頂欄幾乎不動。')
    print('板子自己那一層：底色 rgba(237,231,217) → rgba(244,240,231)，不透明 .48 → .77，')
    print('  模糊 3px → 10px 並壓一檔彩度。拉桿照舊管用（a=0 → .58，a=1 → .82）。')


if __name__ == '__main__':
    main()
