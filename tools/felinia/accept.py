#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检收台：把封闭沙盒送回来的中文成品条目逐批过 Korean 的 ingest 关。

这一关不由这边自己写。gates/ingest.py 是那边的公器，这边只负责把
本卡的记法作为选项交过去：

  --len 130-420    实测：三百七十八条里最短一百三十七字，平均二百零八字。
                   母本卡每条平均一百六十五字，所以这个下限没有放水。
  --voice-mark     本卡的对白与情状之间用一个破折号连，有的行两边带空格，
                   有的不带。那是记法的抖动，不是文章的毛病，所以按正则去数。
  --voice-min 1    本卡把一个人的六句以上对白全装在「说话的样子」这一条里，
                   不是分散成三条。六句这个下限仍旧由那边卡着，没有动。

这三个选项都是那边留出来的口子，不是这边改了那边的规矩。改动本身
在那边按运营指针第六节走过了三步：先在已通过的三百七十八条上确认零误报，
再逐条塞进七种违例确认全部响，撤掉之后再确认回零。

文风那一份也在这里过，但选项不同：那一份不是按人分的，是按六组分的，
所以人均对白范本那一关关掉（--voice-min 0），改由本文件另外数一遍：
「往来的话的例子」与「心里话的例子」两组各八条，每条对白不少于六句。

用法
    python3 accept.py            过全部（人物各批 ＋ 文风）
    python3 accept.py e01b0 ...  只过指定的批
"""
import glob
import io
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ZHDIR = os.path.join(ROOT, 'st/data/figures')
GATE = '/home/user/Korean/gates/ingest.py'

OPTS = ['-', '--min', '20', '--len', '130-420',
        '--voice-mark', '」\\s*—', '--voice-min', '1']


STYLE = os.path.join(ROOT, 'st/data/style/style.zh.lore.json')
STYLE_OPTS = ['-', '--min', '40', '--len', '200-900',
              '--voice-mark', '」\\s*—', '--voice-min', '0']
# 这两组是对白范本，一条里要有六句以上。别的四组是散条，不数。
CASE_CATS = ('往来的话的例子', '心里话的例子')
MARK = re.compile('」\\s*—')


def style():
    """文风那一份。先过一遍那边的机器关，再自己数一遍对白。"""
    if not os.path.exists(STYLE):
        print('없다  ' + STYLE)
        return 1
    r = subprocess.run([sys.executable, GATE, STYLE] + STYLE_OPTS,
                       capture_output=True)
    out = r.stdout.decode('utf-8')
    bad = r.returncode != 0
    if bad:
        print('떨어짐 문풍')
        for ln in out.splitlines():
            if '틀림' in ln:
                print('   ' + ln.strip())
    arr = json.load(io.open(STYLE, encoding='utf-8'))
    grp = {}
    for e in arr:
        grp.setdefault(e['cat'], []).append(e)
    for c in CASE_CATS:
        g = grp.get(c, [])
        if len(g) != 8:
            print('   틀림  %s 가 %d 조뿐이다. 여덟이어야 한다' % (c, len(g)))
            bad = True
        for e in g:
            n = len(MARK.findall(e['content']))
            if n < 6:
                print('   틀림  「%s」 대사가 %d 줄뿐이다. 여섯 줄 이상' % (e['title'], n))
                bad = True
    if not bad:
        print('통과  문풍     %s · %d 조 · %d 무리'
              % (out.splitlines()[0][3:], len(arr), len(grp)))
    return 1 if bad else 0


def main(argv):
    tags = argv[1:]
    files = ([os.path.join(ZHDIR, t + '.zh.lore.json') for t in tags] if tags
             else sorted(glob.glob(os.path.join(ZHDIR, '*.zh.lore.json'))))
    ok = bad = 0
    for f in files:
        if not os.path.exists(f):
            print('없다  ' + f)
            bad += 1
            continue
        r = subprocess.run([sys.executable, GATE, f] + OPTS,
                           capture_output=True)
        out = r.stdout.decode('utf-8')
        name = os.path.basename(f).split('.')[0]
        if r.returncode == 0:
            ok += 1
            print('통과  %-8s %s' % (name, out.splitlines()[0][3:]))
        else:
            bad += 1
            print('떨어짐 ' + name)
            for ln in out.splitlines():
                if '틀림' in ln:
                    print('   ' + ln.strip())
    if not tags:
        if style():
            bad += 1
        else:
            ok += 1
    print('-- 통과 %d, 떨어짐 %d' % (ok, bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
