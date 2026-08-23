#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把指定的批退回到①之前，让它重跑。

什么时候用：检收关报了某一批缺东西（比如外貌那条没写体重）。
指示文补好之后，得让那一批从①重来，不然补的话对它没用。

退回的是①和②的产物：韩语原稿、韩语条目、中文原稿、中文条目。
⓪的场面文件和名表留着 —— 那两样没问题，重译一遍反而多花钱。

用法
    python3 redo.py e03b0 e04b1 ...
    python3 redo.py --검수         按检收关的结果，把没过的批全退回去
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kopipe                                    # noqa: E402


def by_check():
    out = subprocess.run([sys.executable, os.path.join(HERE, 'accept.py')],
                         capture_output=True).stdout.decode('utf-8')
    return [ln.split()[1] for ln in out.splitlines()
            if ln.startswith('떨어짐') and len(ln.split()) > 1
            and ln.split()[1].startswith('e')]


def main(argv):
    tags = by_check() if '--검수' in argv else argv[1:]
    if not tags:
        print('되돌릴 것이 없다')
        return 0
    n = 0
    for t in tags:
        era, bi = int(t[1:3]), int(t[4:])
        p = kopipe.paths(era, bi)
        gone = []
        for k in ('koms', 'kolore', 'zhms', 'zhlore'):
            if os.path.exists(p[k]):
                os.remove(p[k])
                gone.append(k)
        print('되돌렸다 %s : %s' % (t, ' '.join(gone) or '없음'))
        n += 1
    print('되돌린 배 %d 개. 이제 몰이꾼이 ① 부터 다시 돈다.' % n)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
