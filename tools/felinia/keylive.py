#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检索词是不是活的：每一条的检索词里，至少要有一个真会在正文出现的词。

为什么要单独有这一关：

    运营指针第八节写过 ——「检索词按条目标题来取，那个词正文里不会出现，
    于是一次也不会被勾出来」。实测：八百五十一条里有二十条一次也勾不到，
    全是拿「表十九」「书目」「卷十一」这类文件里的名目当检索词的。
    这些条目写得再好也等于没写，因为它们永远不进上下文。

怎么量：

    拿这张卡自己会吐出来的字做本样 —— 时代事实文、地名、制度名、身份、服装、
    人物姓名与事迹，再加上已经从封闭沙盒回来的人物条目正文。
    人物条目那一块最要紧，它离真正的文体最近。
    一条的检索词里一个都不在本样里，就判它死。

常驻条目（constant）不看这一关：它们不经过检索词那道门。

前端那四十八条只报不判。两个缘故：
  一是那些检索词是封闭沙盒挑的，按规矩这边一个字都不许改；要改也只能回那个
    会话里去重新要，不能在这里动手。
  二是它们说的是场面本身（「一个屋里人多的时候」这一类），本样里没有不等于
    真跑起来勾不到 —— 检索词是拿去对聊天上下文的，那里头有模型自己吐的字，
    本样里没有的话那时候可能就有了。
后端那些是这边自己写的，所以那一半照判不误。

用法
    python3 keylive.py            后端加前端全看
    python3 keylive.py --느슨      只报，不判不合格
"""
import glob
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)

import wb                                       # noqa: E402
from roster import ROSTER                       # noqa: E402
from eras_a import ERAS_A                       # noqa: E402
from eras_b import ERAS_B                       # noqa: E402
from eras_c import ERAS_C                       # noqa: E402
from eras_d import ERAS_D                       # noqa: E402

STYLE = os.path.join(ROOT, 'st/data/style/style.zh.lore.json')
FIGDIR = os.path.join(ROOT, 'st/data/figures')
ALWAYS = ('叙法', '禁止')


def corpus():
    out = []
    for e in ERAS_A + ERAS_B + ERAS_C + ERAS_D:
        out += [e['w'], e['nm'], e['reg']]
        out += list(e['inst']) + list(e['roles']) + list(e['dress'])
        for L in e['locs']:
            out += [L['n'], L['cn'], L['d']]
    for l in ROSTER.values():
        for f in l:
            out += [f['n'], f['kind'], f['fact']]
    n = 0
    for p in sorted(glob.glob(os.path.join(FIGDIR, '*.zh.lore.json'))):
        for x in json.load(io.open(p, encoding='utf-8')):
            out.append(x['content'])
            n += 1
    return '\n'.join(out), n


def main(argv):
    loose = '--느슨' in argv
    big, nfig = corpus()
    rows = [(x['title'], x['keys'], x['src']) for x in wb.load()]
    if os.path.exists(STYLE):
        for x in json.load(io.open(STYLE, encoding='utf-8')):
            if x['cat'] not in ALWAYS:
                rows.append((x['title'], x['keys'], '文字·' + x['cat']))
    dead, soft, weak = [], [], 0
    for t, ks, src in rows:
        hit = sum(1 for k in ks if k in big)
        if hit == 0:
            (soft if src.startswith('文字') else dead).append((src, t, ks))
        elif hit == 1:
            weak += 1
    print('-- 本样 %d 字（内含已回来的人物条目 %d 条）· 看了 %d 条'
          % (len(big), nfig, len(rows)))
    for src, t, ks in dead[:40]:
        print('  틀림  %-8s %-38s %s' % (src, t[:38], ks))
    for src, t, ks in soft[:20]:
        print('  주의  %-8s %-38s %s' % (src, t[:38], ks))
    print('  勾不到的 %d 条（前端只报的 %d 条另计）· 只勾得到一个词的 %d 条'
          % (len(dead), len(soft), weak))
    print('  ' + ('통과' if not dead or loose else '불합격: %d 건' % len(dead)))
    return 1 if (dead and not loose) else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
