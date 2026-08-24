#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把主文件 <head> 裡那幾條圖示指到新的一套。

    python3 tools/felinia/headicon.py

圖是 tools/felinia/icons.py 出的（選單那幅馬賽克的貓頭＋FELINIA）。這裡只改指向：

  · 刪掉 favicon.svg 那一條。那是上一張卡的拱門，而且 SVG 排在 PNG 前面，
    瀏覽器會優先挑它 —— 不刪的話換了 PNG 也照樣顯示拱門。
  · 分頁圖示補齊 16／32／48 三檔：分頁用 16，Windows 工作列與書籤用 32／48。
  · apple-touch-icon 補上 sizes，iOS 才知道這是 180 那一檔。
  · 每條後面掛 ?v2。圖示是瀏覽器快取得最死的東西之一，檔名沒變就不會重抓；
    掛一個版本號，舊分頁重整就能換過來。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = 'favicon-48.png'

OLD = ('<link rel="icon" type="image/svg+xml" href="/core/res/icon/favicon.svg">\n'
       '<link rel="icon" type="image/png" sizes="32x32" href="/core/res/icon/favicon-32.png">\n'
       '<link rel="apple-touch-icon" href="/core/res/icon/apple-touch-icon.png">')

NEW = ('<link rel="icon" type="image/png" sizes="16x16" href="/core/res/icon/favicon-16.png?v2">\n'
       '<link rel="icon" type="image/png" sizes="32x32" href="/core/res/icon/favicon-32.png?v2">\n'
       '<link rel="icon" type="image/png" sizes="48x48" href="/core/res/icon/favicon-48.png?v2">\n'
       '<link rel="apple-touch-icon" sizes="180x180" href="/core/res/icon/apple-touch-icon.png?v2">')


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('图标那几条已经改过了，跳过。')
        return
    n = s.count(OLD)
    if n != 1:
        raise SystemExit('<head> 裡那三條圖示命中 %d 次，不是一次，停手。' % n)
    s = s.replace(OLD, NEW)
    if 'favicon.svg' in s:
        raise SystemExit('還有 favicon.svg 沒清掉，停手。')
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('<head> 的图标改成新的一套：16／32／48 ＋ apple-touch-icon 180，'
          '各挂 ?v2；旧的 favicon.svg 那一条删掉。')


if __name__ == '__main__':
    main()
