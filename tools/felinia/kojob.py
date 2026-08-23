#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把每一批的活儿摊成一份可以直接粘贴的韩文指令。

    python3 tools/felinia/kojob.py

不开沙盒、不分三段、不来回搬文件：一份文件粘进去，对面一次把原稿和六项条目
都写出来，答在回话里。写法与局内 FELKO 跑的那一份**逐字相同**——
同一个模板（ko.json 的 doss）、同一套见本、同一份场面文件，
只是把三个空位在这里先填好：

    {{견본}}   见本八篇      ← ko.json 的 samples
    {{장면}}   这一批的场面   ← st/data-quiet.ko/figures/eNNbM.ko.scene.txt
    {{COUNT}}  这一批几个人   ← 从场面文件里数

写出：npc/지시/eNNbM.txt

场面文件是 ⓪ 译入那一段的成品，纪年十七到二十二已经有了，二十三往后还没有——
所以这里只出得了有场面文件的那些批。缺哪一批，末尾会报。

对面写回来以后：把 [hangmok] 底下那段 JSON 存成 npc/eNNbM.ko.lore.json，
[wongo] 底下那段存成 npc/eNNbM.ko.ms.txt，再跑 konow.py 就装进卡里了。
"""
import glob
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
KO = os.path.join(ROOT, 'core/res/data/felinia/ko.json')
SCENE = os.path.join(ROOT, 'st/data-quiet.ko/figures')
OUT = os.path.join(ROOT, 'npc/지시')

sys.path.insert(0, HERE)
from roster import ROSTER                      # noqa: E402

HAN = re.compile(r'[一-鿿]')
NL = chr(10)


def main():
    ko = json.load(io.open(KO, encoding='utf-8'))
    doss, samples = ko['doss'], ko['samples']
    for slot in ('{{견본}}', '{{장면}}', '{{COUNT}}'):
        if slot not in doss:
            raise SystemExit('模板里没有这个空位：' + slot)
    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    for old in glob.glob(os.path.join(OUT, '*.txt')):
        os.remove(old)

    # 已经有条目的人不用再写。按纪年看：这一代的人全齐了就跳过这一代。
    lore = json.load(io.open(os.path.join(ROOT, 'core/res/data/felinia/lore.json'),
                             encoding='utf-8'))
    done = {}
    for e in lore:
        if e.get('lay') == 'figures':
            done.setdefault(e['era'], set()).add(e['cat'])
    full = set(i for i in ROSTER
               if len(done.get(i, ())) >= len(ROSTER[i]))

    rows, eras, skip = [], set(), set()
    for p in sorted(glob.glob(os.path.join(SCENE, 'e*b*.ko.scene.txt'))):
        b = os.path.basename(p)
        era = int(re.match(r'e(\d+)b', b).group(1))
        if era in full:
            skip.add(era)
            continue
        scene = io.open(p, encoding='utf-8').read()
        m = re.search(r'모두\s*([0-9]+)\s*명', scene)
        if not m:
            raise SystemExit('%s 里数不出这一批几个人' % b)
        n = int(m.group(1))
        t = (doss.replace('{{견본}}', NL * 2 + NL.join(samples) + NL)
                 .replace('{{장면}}', scene)
                 .replace('{{COUNT}}', str(n)))
        # 见本与场面都该是零汉字的。混进汉字就等于把中文语境带回韩语那一段。
        h = HAN.findall(t)
        # 模板自己允许的四个字：它点名要把 [[SAY]] 换成那四个字
        h = [c for c in h if c not in set('原文如是')]
        if h:
            raise SystemExit('%s 的指令里混进了汉字：%s' % (b, ''.join(h[:12])))
        q = os.path.join(OUT, b.replace('.ko.scene.txt', '.txt'))
        io.open(q, 'w', encoding='utf-8').write(t)
        rows.append((era, os.path.basename(q), n, len(t)))
        eras.add(era)

    per = {}
    for era, f, n, ln in rows:
        per.setdefault(era, [0, 0])
        per[era][0] += n
        per[era][1] += 1
    print('写出 %d 份指令，覆盖纪年 %s：'
          % (len(rows), '、'.join(str(e) for e in sorted(eras))))
    for era in sorted(per):
        n, b = per[era]
        want = len(ROSTER[era])
        mark = '' if n == want else '   ← 名册 %d 人，场面里只有 %d 人' % (want, n)
        print('   纪年 %-2d  %d 批 · %d 人%s' % (era, b, n, mark))
    print('   每份 %d 到 %d 字'
          % (min(r[3] for r in rows), max(r[3] for r in rows)))
    if skip:
        print('已经有条目、不用再写的纪年：'
              + '、'.join(str(e) for e in sorted(skip)))
    lack = [e for e in sorted(ROSTER) if e not in eras and e not in skip]
    if lack:
        print('还没有场面文件、出不了指令的纪年：'
              + '、'.join(str(e) for e in lack))
        print('（那一段是 ⓪ 译入的成品。要先有它，才写得出这一份。）')


if __name__ == '__main__':
    main()
