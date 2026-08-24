#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""網站圖示：從選單那幅馬賽克上直接切一塊正方形。

    python3 tools/felinia/icons.py

原本 core/res/icon/ 那一套是上一張卡剩下的（favicon.svg 裡的 aria-label 還寫著
ROMA.SYS，畫的是黑底金拱門），跟這個遊戲沒有關係。換成選單那幅馬賽克。

來源是 core/res/img/annals/emblem_t.png（2464×1232），選單上那幅圖案就是它：
世界地圖 ＋ 中間的貓頭 ＋ 底下的 FELINIA。

**一塊都不摳。** 只做一件事：切一塊正方形。
早先試過把貓頭與字從地圖裡挑出來再重排，結果是貓的下巴被字蓋掉、字的紋理被削薄，
還得一路追著碎磚清。原圖本來就是排好的一幅畫，照著切就是了。

    橫向：以 FELINIA 的中線 x=1242 為心，取滿高的一塊 1232 見方（x 626..1858）
          —— 貓（840..1630）與字（648..1837）都在裡面，兩頭還各留一截地圖
    縱向：0..1232，整幅高度，上下兩條地圖帶都在
    外圍：再加 5% 的邊，免得字與地圖貼著框
    底色：#EDE7D9，跟選單同一片奶油（原圖是透明底）

出：

    favicon-16 / 32 / 48.png     瀏覽器分頁
    apple-touch-icon.png  180    iOS 加到主畫面
    icon-192.png / icon-512.png  安卓 PWA
    icon-maskable-512.png        安卓自適應圖示（內容收在中間八成，四周留給裁切）

舊的 favicon.svg 與 maskable.svg 一併刪掉：那是拱門，留著只會被優先選用。
向量版不補 —— 這是照片馬賽克，SVG 描不出來，PNG 才是對的格式。
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'core/res/img/annals/emblem_t.png')
OUT = os.path.join(ROOT, 'core/res/icon')
PAPER = (237, 231, 217)               # 選單那片奶油
BOX = (626, 0, 1858, 1232)            # 切哪一塊（見上面說明）
EDGE = 0.05                           # 外圍留邊


def master():
    im = Image.open(SRC)
    c = im.crop(BOX)
    pad = int(c.height * EDGE)
    side = c.width + pad * 2
    sq = Image.new('RGBA', (side, side), PAPER + (255,))
    sq.alpha_composite(c, (pad, pad))
    return sq.convert('RGB')


def main():
    sq = master()
    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    plain = [('favicon-16.png', 16), ('favicon-32.png', 32),
             ('favicon-48.png', 48), ('apple-touch-icon.png', 180),
             ('icon-192.png', 192), ('icon-512.png', 512)]
    for name, s in plain:
        sq.resize((s, s), Image.LANCZOS).save(os.path.join(OUT, name),
                                              optimize=True)
    # 自適應圖示：內容收到中間八成，四周留白給各家系統裁
    inner = int(512 * 0.78)
    mk = Image.new('RGB', (512, 512), PAPER)
    mk.paste(sq.resize((inner, inner), Image.LANCZOS),
             ((512 - inner) // 2, (512 - inner) // 2))
    mk.save(os.path.join(OUT, 'icon-maskable-512.png'), optimize=True)
    for old in ('favicon.svg', 'maskable.svg'):
        p = os.path.join(OUT, old)
        if os.path.exists(p):
            os.remove(p)
            print('    刪掉 %s（上一張卡的拱門）' % old)
    print('從 emblem_t.png 切 x %d..%d · y %d..%d，外加 5%% 的邊，母圖 %d 見方。'
          % (BOX[0], BOX[2], BOX[1], BOX[3], sq.width))
    for name, s in plain:
        print('    %-22s %d 見方 · %.1f KB'
              % (name, s, os.path.getsize(os.path.join(OUT, name)) / 1024.0))
    print('    %-22s %d 見方（內容收在中間 78%%）· %.1f KB'
          % ('icon-maskable-512.png', 512,
             os.path.getsize(os.path.join(OUT, 'icon-maskable-512.png')) / 1024.0))


if __name__ == '__main__':
    main()
