#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""先把 npc/ 的韩语原稿原样装进卡，不等译出。

    python3 tools/felinia/konow.py            装
    python3 tools/felinia/konow.py --撤       撤（删掉本工具写的那些文件）

npc/ 里是封闭沙盒 ① 集笔那一段交回来的韩语成品，零汉字。装配链读的是
st/data/figures/ 下的 *.zh.lore.json，看不见 npc/，所以这几代的人一直挂着
pend —— 名字身份事迹在，台词空着。

这里把韩语原稿搬进装配链，落成 e13b0.ko-raw.lore.json 这样的文件名。
名字带 ko-raw 是要一眼看得出：**这一批还没译**，正文是韩语。译出以后
写成同名的 .zh.lore.json，再把 ko-raw 那份删掉就完事。

搬运时改三样，正文一个字不动：

  cat    韩语名 → 名册上的中文名。装配按中文名找人，找不着就还是 pend
  title  改成「中文名 · 第N项 · 小节名」。装配靠标题末尾认「说话的样子」那一条
  keys   头上加一个中文名。不加的话，局内写中文名勾不出这一条

韩语名怎么对上中文名：按位置。沙盒是照名册的次序分批跑的，每一代的人数、
每一批的人数、批内的次序都与名册一一对上（本工具会核，对不上就停）。
装的时候会把六十一对全打出来，自己看一眼。
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
OUT = os.path.join(ROOT, 'st/data/figures')

sys.path.insert(0, HERE)
from roster import ROSTER                      # noqa: E402

HAN = re.compile(r'[一-鿿]')

# 小节名。沙盒那一份用韩语序数起头，按序数认，不按字面认。
SEC = [('첫째', '第一项', '概要'), ('둘째', '第二项', '外貌'), ('셋째', '第三项', '来历'),
       ('넷째', '第四项', '性情'), ('다섯째', '第五项', '关系'),
       ('여섯째', '第六项', '说话的样子')]


def batches(era):
    """这一代的韩语批次：[(文件名, [韩语名…]), …]，批内保序。"""
    out = []
    for p in sorted(glob.glob(os.path.join(NPC, 'e%02db*.ko.lore.json' % era))):
        seen = []
        for e in json.load(io.open(p, encoding='utf-8')):
            if e['cat'] not in seen:
                seen.append(e['cat'])
        out.append((p, seen))
    return out


def sec_of(title):
    for ko, n, cn in SEC:
        if ko in title:
            return n, cn
    raise SystemExit('这一条的标题认不出是第几项：' + title)


def install():
    eras = sorted(int(re.search(r'e(\d+)b', os.path.basename(p)).group(1))
                  for p in glob.glob(os.path.join(NPC, '*.ko.lore.json')))
    eras = sorted(set(eras))
    if not eras:
        raise SystemExit('npc/ 里没有 .ko.lore.json')
    wrote, pairs, total = [], [], 0
    for era in eras:
        bt = batches(era)
        flat = [n for _, s in bt for n in s]
        zh = [f['n'] for f in ROSTER[era]]
        if len(flat) != len(zh):
            raise SystemExit('纪年 %d 对不上：韩语 %d 人，名册 %d 人。停手。'
                             % (era, len(flat), len(zh)))
        m = dict(zip(flat, zh))
        for k, v in zip(flat, zh):
            pairs.append((era, k, v))
        for p, _ in bt:
            src = json.load(io.open(p, encoding='utf-8'))
            out = []
            for e in src:
                cn = m[e['cat']]
                n, sec = sec_of(e['title'])
                ks = [cn] + [k for k in e['keys'] if k != cn]
                out.append({'cat': cn, 'title': '%s · %s · %s' % (cn, n, sec),
                            'keys': ks[:8], 'ko': 1, 'content': e['content']})
            if HAN.search(json.dumps([x['content'] for x in out], ensure_ascii=False)):
                raise SystemExit('%s 的正文里有汉字，这不该是韩语成品。停手。'
                                 % os.path.basename(p))
            q = os.path.join(OUT, os.path.basename(p).replace('.ko.lore.json',
                                                              '.ko-raw.lore.json'))
            io.open(q, 'w', encoding='utf-8').write(
                json.dumps(out, ensure_ascii=False, indent=1))
            wrote.append(q)
            total += len(out)
    print('韩语名 → 名册中文名（%d 位，按位置对的，自己核一眼）：' % len(pairs))
    for era, k, v in pairs:
        print('   %2d  %-16s %s' % (era, k, v))
    print()
    for q in wrote:
        print('    写出 %s' % os.path.relpath(q, ROOT))
    print('共 %d 条，覆盖纪年 %s。正文还是韩语，等译出。'
          % (total, '、'.join(str(e) for e in eras)))
    only = [os.path.basename(p) for p in sorted(glob.glob(os.path.join(NPC, '*.ko.ms.txt')))
            if not os.path.exists(p.replace('.ko.ms.txt', '.ko.lore.json'))]
    if only:
        print('npc/ 里只有对话记录、还没抽成条目的：' + '、'.join(only))


def remove():
    n = 0
    for p in sorted(glob.glob(os.path.join(OUT, '*.ko-raw.lore.json'))):
        os.remove(p)
        n += 1
        print('    删掉 %s' % os.path.relpath(p, ROOT))
    print('撤掉 %d 份韩语原稿。' % n)


if __name__ == '__main__':
    remove() if '--撤' in sys.argv else install()
