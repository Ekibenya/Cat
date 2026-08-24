#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""網站圖示：從選單那幅馬賽克裡摳出貓頭與 FELINIA，出成一整套。

    python3 tools/felinia/icons.py

原本 core/res/icon/ 那一套是上一張卡剩下的（favicon.svg 裡的 aria-label 還寫著
ROMA.SYS，畫的是黑底金拱門），跟這個遊戲沒有關係。換成選單那幅馬賽克。

來源是 core/res/img/annals/emblem_t.png（2464×1232），選單上那幅圖案就是它：
世界地圖 ＋ 中間的貓頭 ＋ 底下的 FELINIA。要的只有貓頭與字，地圖得摘掉。

怎麼摘（一個像素都不重畫，只挑磚）：

  一、貓頭。磚是照片小方塊，貓頭那一塊排得密不透風，地圖那一片是散著擺的。
      把 alpha 按 8×8 收成一張密度圖，從貓頭中心（1230,470）灌水，只走密度
      ≥190 的格子，並且切在 y=812 以上（再往下是 FELINIA，會連在一起）。
      灌完只留最大那一塊 —— 那 59 格的碎塊是鬍鬚左邊那撮地圖磚，就是靠這一步掉的。

  二、鬍鬚。鬍鬚是細長的橫條，密度不夠，灌水灌不到。所以在
      x 820..1675、y 650..812 這個框裡另外收一次，只收深的或者鮮的
      （luma<115 或 saturation>0.42）—— 那撮淺又不鮮的地圖磚因此進不來。

  三、FELINIA。在 x 600..1875、y 800..1010 裡收 luma<86 的格子（字是黑磚），
      再丟掉不足 100 格的碎塊 —— 字底下那兩點殘留就是這一步掉的。
      **字裡頭那塊棕色不動**：那是貓的下巴，本來就疊在字上，是原圖的樣子。

摘完把兩塊分開擺：貓頭在上、FELINIA 在下，中間空一口氣（頭高的 9%），
字寬對齊頭寬的 1.02 倍，外圍再留 8% 的邊。底色用 #EDE7D9，跟選單同一片奶油。

出：

    favicon-16 / 32 / 48.png     瀏覽器分頁
    apple-touch-icon.png  180    iOS 加到主畫面
    icon-192.png / icon-512.png  安卓 PWA
    icon-maskable-512.png        安卓自適應圖示（內容收在中間八成，四周留給裁切）

舊的 favicon.svg 與 maskable.svg 一併刪掉：那是拱門，留著只會被優先選用。
向量版不補 —— 這是照片馬賽克，SVG 描不出來，PNG 才是對的格式。
"""
import io
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'core/res/img/annals/emblem_t.png')
OUT = os.path.join(ROOT, 'core/res/icon')
PAPER = (237, 231, 217, 255)          # 選單那片奶油
B = 8                                 # 密度圖一格幾像素


def _luma(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def _sat(c):
    mx, mn = max(c), min(c)
    return 0 if mx == 0 else (mx - mn) / float(mx)


def _comps(cells):
    """八連通分塊，大的排前面。"""
    cs, out = set(cells), []
    while cs:
        seed = cs.pop()
        stack, comp = [seed], [seed]
        while stack:
            x, y = stack.pop()
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    n = (x + dx, y + dy)
                    if n in cs:
                        cs.discard(n)
                        stack.append(n)
                        comp.append(n)
        out.append(comp)
    return sorted(out, key=len, reverse=True)


def _cut(im, cells, W, H, grow, blur, th):
    """把選中的格子放大回原圖尺寸當遮罩，切出那一塊。"""
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    for c in cells:
        d.point(c, 255)
    if grow:
        m = m.filter(ImageFilter.MaxFilter(2 * grow + 1))
    mm = (m.resize(im.size, Image.BILINEAR)
           .filter(ImageFilter.GaussianBlur(blur))
           .point(lambda v: 255 if v > th else 0))
    o = Image.new('RGBA', im.size, (0, 0, 0, 0))
    o.paste(im, (0, 0), mm)
    return o.crop(o.getbbox())


def master():
    im = Image.open(SRC)
    rgb = im.convert('RGB')
    W, H = im.width // B, im.height // B
    al = im.split()[3].resize((W, H), Image.BOX)
    co = rgb.resize((W, H), Image.BOX)
    A, C = al.load(), co.load()
    dens = al.filter(ImageFilter.GaussianBlur(1.2)).load()

    # 一、貓頭：從中心灌水，只走密的，切在 FELINIA 之上
    seen = [[False] * H for _ in range(W)]
    start = (1230 // B, 470 // B)
    seen[start[0]][start[1]] = True
    stack, head = [start], set()
    while stack:
        x, y = stack.pop()
        head.add((x, y))
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < 812 // B and not seen[nx][ny] \
               and dens[nx, ny] >= 190:
                seen[nx][ny] = True
                stack.append((nx, ny))
    # 二、鬍鬚：只收深的或鮮的，把淺又不鮮的地圖磚擋在外面
    for x in range(820 // B, 1676 // B):
        for y in range(650 // B, 812 // B):
            if A[x, y] > 60 and (_luma(C[x, y]) < 115 or _sat(C[x, y]) > 0.42):
                head.add((x, y))
    head = set(_comps(head)[0])            # 只留最大那一塊

    # 三、FELINIA：黑磚，碎塊不要
    ttl = set()
    for x in range(600 // B, 1876 // B):
        for y in range(800 // B, 1010 // B):
            if A[x, y] > 60 and _luma(C[x, y]) < 86:
                ttl.add((x, y))
    ttl = set(p for c in _comps(ttl) if len(c) >= 100 for p in c)

    a = _cut(im, head, W, H, 1, 5, 96)
    b = _cut(im, ttl, W, H, 0, 4, 110)
    bb = b.resize((int(a.width * 1.02),
                   int(b.height * a.width * 1.02 / b.width)), Image.LANCZOS)
    gap = int(a.height * 0.09)
    cw = max(a.width, bb.width)
    ch = a.height + gap + bb.height
    side = int(max(cw, ch) * 1.08)
    sq = Image.new('RGBA', (side, side), PAPER)
    y0 = (side - ch) // 2
    sq.alpha_composite(a, ((side - a.width) // 2, y0))
    sq.alpha_composite(bb, ((side - bb.width) // 2, y0 + a.height + gap))
    return sq.convert('RGB'), (a.size, bb.size, side)


def main():
    sq, info = master()
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
    mk = Image.new('RGB', (512, 512), PAPER[:3])
    mk.paste(sq.resize((inner, inner), Image.LANCZOS),
             ((512 - inner) // 2, (512 - inner) // 2))
    mk.save(os.path.join(OUT, 'icon-maskable-512.png'), optimize=True)
    for old in ('favicon.svg', 'maskable.svg'):
        p = os.path.join(OUT, old)
        if os.path.exists(p):
            os.remove(p)
            print('    刪掉 %s（上一張卡的拱門）' % old)
    print('貓頭 %dx%d ＋ FELINIA %dx%d，母圖 %d 見方。' %
          (info[0][0], info[0][1], info[1][0], info[1][1], info[2]))
    for name, s in plain:
        print('    %-22s %d 見方 · %.1f KB'
              % (name, s, os.path.getsize(os.path.join(OUT, name)) / 1024.0))
    print('    %-22s %d 見方（內容收在中間 78%%）· %.1f KB'
          % ('icon-maskable-512.png', 512,
             os.path.getsize(os.path.join(OUT, 'icon-maskable-512.png')) / 1024.0))


if __name__ == '__main__':
    main()
