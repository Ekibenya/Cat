#!/bin/sh
# 八十八批，一批七位，每批三段封闭沙盒。
# 并发六：八并发时上游偶发握手失败，四太慢。掉下来的那一批由 sbretry.sh 原样再叫。
# 每一段跑完重查一遍还缺什么，缺的重跑。断了可以再开，做完的会跳过。
set -u
cd /home/user/cat
WAVE=${WAVE:-6}
ROUND=${ROUND:-60}
python3 - "$WAVE" "$ROUND" <<'PY'
import subprocess, sys, os
sys.path.insert(0, 'tools/felinia')
import figgen, kopipe
from roster import ROSTER
WAVE, ROUND = int(sys.argv[1]), int(sys.argv[2])
jobs = [(e, b) for e in sorted(ROSTER) for b in range(len(figgen.batches(e)))]

def missing(st):
    out = []
    for e, b in jobs:
        p = kopipe.paths(e, b)
        # ① 이 다 되었다는 것은 원고와 항목이 **둘 다** 있다는 뜻이다.
        # 항목만 있고 원고가 없는 판이 실제로 나왔다(샌드박스가 원고를 지웠다).
        # 한쪽만 보면 그 판이 ② 로 넘어가고, ② 는 원고가 없다며 그 자리에서
        # 통째로 죽는다 — 같은 물결에 실린 다른 판까지 같이 죽는다.
        ko = os.path.exists(p['koms']) and os.path.exists(p['kolore'])
        if st == '0' and not os.path.exists(p['koscene']):
            out.append((e, b))
        elif st == '1' and os.path.exists(p['koscene']) and not ko:
            out.append((e, b))
        elif st == '2' and ko and not os.path.exists(p['zhlore']):
            out.append((e, b))
    return out

def run(st, grp):
    a = [sys.executable, 'tools/felinia/kopipe.py', st]
    for e, b in grp:
        a += [str(e), str(b)]
    subprocess.call(a)

for r in range(ROUND):
    left = {st: missing(st) for st in '012'}
    tot = sum(len(v) for v in left.values())
    sys.stderr.write('== %d bakwi · left 0:%d 1:%d 2:%d ==\n'
                     % (r + 1, len(left['0']), len(left['1']), len(left['2'])))
    sys.stderr.flush()
    if tot == 0:
        sys.stderr.write('== ALL DONE ==\n')
        break
    for st in ('2', '1', '0'):
        grp = missing(st)
        while grp:
            run(st, grp[:WAVE])
            new = missing(st)
            if len(new) >= len(grp):
                break
            grp = new
PY
