#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鑄局四步兩邊那兩塊板發黃。

    python3 tools/felinia/feglass.py

有人回報「開局定制的地點／人物／同伴／開場，兩邊的彈窗有點發黃」。

查下來不是板子的顏色偏黃，是**底下透上來的東西是黃的**。那兩塊板

    .feGl{ background:rgba(237,231,217,.34); backdrop-filter:blur(3px) }

底色由毛玻璃那根拉桿定（applyGlass 裡 .22+.32*a，預設 a=.8 → **.48**），
也就是說有一半以上是透的；而它們身後鋪的是整幅馬賽克世界地圖，磚是土黃與褐色的。
模糊只有 3 像素，磚糊不開，一塊一塊透上來——板子看上去就是一片黃斑。

（順帶：同一支 applyGlass 裡另一段註解寫過「發黃那一次的病根是 saturate」，
那是情報台那六扇的舊帳，跟這兩塊無關。這兩塊沒有 saturate。）

試過四五種配方逐張截圖比對，結論很直接：只調底色的色相沒有用（暖度 26 只降到 24），
**得讓透上來的地圖少一點、糊一點**。所以三件一起改：

    底色    rgba(237,231,217) → rgba(245,243,238)   往中性挪，不再是那片暖奶油
    不透明  .22+.32*a → .56+.30*a                   預設 a=.8 時 .48 → .80
            地點那一步 .28+.48*a → .62+.30*a        預設 .66 → .86（那一步身後
                                                    連地名標記一起動，本來就要更實）
    模糊    blur(3px) → blur(9px) saturate(85%)     磚糊成一片，彩度再壓一檔

拉桿照舊管用：a=0 時 .56，a=1 時 .86，還是看得見身後的地圖，只是不再一塊塊透。

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
   底色往中性挪、模糊加到 9 像素、彩度再压一档 —— 砖糊成一片，黄就散了。 */
.feGl{position:absolute;inset:0;background:rgba(245,243,238,.62);
  border:1px solid rgba(19,18,13,.20);
  box-shadow:0 14px 34px rgba(242,236,222,.5);
  -webkit-backdrop-filter:blur(9px) saturate(85%);
  backdrop-filter:blur(9px) saturate(85%)}"""

# ── 二、拉桿算出來的那一檔（真正生效的） ──
B_OLD = "    +'.feGl{background:rgba(237,231,217,'+(.22+.32*a).toFixed(2)+') !important}'"
B_NEW = ("    /* 由 .22+.32*a 提到 .56+.30*a：预设拉杆 80 时由 .48 提到 .80。\n"
         "       透一半的时候，身后那幅马赛克一块块透上来，板子就发黄。 */\n"
         "    +'.feGl{background:rgba(245,243,238,'+(.56+.30*a).toFixed(2)+') !important}'")

C_OLD = ("    +'#feWrap[data-step=\"loc\"] .feGl'\n"
         "    +'{background:rgba(237,231,217,'+(.28+.48*a).toFixed(2)+') !important}'")
C_NEW = ("    +'#feWrap[data-step=\"loc\"] .feGl'\n"
         "    +'{background:rgba(245,243,238,'+(.62+.30*a).toFixed(2)+') !important}'")


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
    print('鑄局四步那兩塊板：底色 rgba(237,231,217) → rgba(245,243,238)，')
    print('  不透明 .48 → .80（地點那一步 .66 → .86），模糊 3px → 9px 並壓一檔彩度。')
    print('  毛玻璃那根拉桿照舊管用（a=0 → .56，a=1 → .86）。')


if __name__ == '__main__':
    main()
