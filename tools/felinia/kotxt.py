#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 npc/ 里等着译的韩语原稿摊成一个 txt。

    python3 tools/felinia/kotxt.py

写出两份：

  npc/번역.txt    全韩语，一个汉字都没有。366 段，每段四部分：
                    第一行  #编号
                    第二行  标题（谁 · 第几项 · 哪一节）
                    第三行  触发词，用 / 隔开，六个
                    第四行起 正文，到空行为止
  npc/이름표.txt  韩语名 = 名册中文名，61 行。带汉字，所以单独一份。

编号是按「纪年小的在前、同代按批次文件名、批内按原次序」排的，
konow.py 用的是同一个次序，所以译回来以后按编号就能一一对上。
"""
import glob
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
NPC = os.path.join(ROOT, 'npc')
NL = chr(10)

sys.path.insert(0, HERE)
from roster import ROSTER                      # noqa: E402

HAN = re.compile(r'[一-鿿]')


def walk():
    """按固定次序把条目摊平：[(编号, 纪年, 韩语名, 条目), …]"""
    files = sorted(glob.glob(os.path.join(NPC, '*.ko.lore.json')),
                   key=lambda p: (int(re.search(r'e(\d+)b', os.path.basename(p)).group(1)),
                                  os.path.basename(p)))
    out, n = [], 0
    for p in files:
        era = int(re.search(r'e(\d+)b', os.path.basename(p)).group(1))
        for e in json.load(io.open(p, encoding='utf-8')):
            n += 1
            out.append((n, era, e['cat'], e))
    return out


def names():
    """韩语名 → 名册中文名。按位置对，与 konow.py 同一套。"""
    pair, eras = [], sorted(set(
        int(re.search(r'e(\d+)b', os.path.basename(p)).group(1))
        for p in glob.glob(os.path.join(NPC, '*.ko.lore.json'))))
    for era in eras:
        seen = []
        for p in sorted(glob.glob(os.path.join(NPC, 'e%02db*.ko.lore.json' % era))):
            for e in json.load(io.open(p, encoding='utf-8')):
                if e['cat'] not in seen:
                    seen.append(e['cat'])
        zh = [f['n'] for f in ROSTER[era]]
        if len(seen) != len(zh):
            raise SystemExit('纪年 %d 对不上：韩语 %d 人，名册 %d 人。停手。'
                             % (era, len(seen), len(zh)))
        pair += list(zip(seen, zh))
    return pair


def main():
    rows = walk()
    if not rows:
        raise SystemExit('npc/ 里没有 .ko.lore.json')
    buf = []
    for n, era, ko, e in rows:
        buf.append('#%d' % n)
        buf.append(e['title'])
        buf.append(' / '.join(e['keys']))
        buf.append(e['content'])
        buf.append('')
    t = NL.join(buf)
    m = HAN.search(t)
    if m:
        raise SystemExit('译稿里出现汉字「%s」，这一份该是全韩语的。停手。' % m.group(0))
    q = os.path.join(NPC, '번역.txt')
    io.open(q, 'w', encoding='utf-8').write(t)

    pair = names()
    r = os.path.join(NPC, '이름표.txt')
    io.open(r, 'w', encoding='utf-8').write(
        NL.join('%s = %s' % (a, b) for a, b in pair) + NL)

    print('번역.txt   %d 段 · %d 字 · %.0f KB · 汉字 0'
          % (len(rows), len(t), os.path.getsize(q) / 1024.0))
    print('이름표.txt %d 人' % len(pair))
    per = {}
    for n, era, ko, e in rows:
        per[era] = per.get(era, 0) + 1
    print('   ' + ' · '.join('纪年%d %d 段' % (k, v) for k, v in sorted(per.items())))


if __name__ == '__main__':
    main()
