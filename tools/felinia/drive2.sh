#!/bin/sh
# 八十八批，一批七位，每批三段封闭沙盒。
#
# 只准开一头。实测开了两头之后，两边挑中的是同一批活，白打了三个多钟头。
#
# 并发六。四太慢，八会在握手那一步偶发失败。掉下来的那一批由 sbretry.sh 原样再叫。
#
# **撞上用量上限就停手等着。** 实测：最近六十次里有五十一次是「session limit」，
# 那不是并发的毛病，是配额没了。那时候再怎么重叫也只是把日志刷满，
# 上一次就这么空转了三个多钟头。所以见到那句话就睡二十分钟再回来。
#
# 每一段跑完重查一遍还缺什么，缺的重跑。断了可以再开，做完的会跳过。
set -u
cd /home/user/cat
WAVE=${WAVE:-6}
ROUND=${ROUND:-400}
# 只跑哪几段。默认三段都跑，从后往前 —— 先把快做完的推出去。
STAGES=${STAGES:-210}
python3 - "$WAVE" "$ROUND" "$STAGES" <<'PY'
import glob, os, subprocess, sys, time
sys.path.insert(0, 'tools/felinia')
import figgen, kopipe
from roster import ROSTER
WAVE, ROUND = int(sys.argv[1]), int(sys.argv[2])
STAGES = sys.argv[3] if len(sys.argv) > 3 else '210'
jobs = [(e, b) for e in sorted(ROSTER) for b in range(len(figgen.batches(e)))]
LOG = '/tmp/cattest/ko/log'
CAPPED = 'session limit'
NAP = 1200          # 配额没了就睡这么久。二十分钟。

def missing(st):
    out = []
    for e, b in jobs:
        p = kopipe.paths(e, b)
        # ① 做完了的意思是原稿和条目**两样都在**。
        # 出过一次只有条目没有原稿的（沙盒把原稿删了）。只看一样的话
        # 那一批会漏到 ②，而 ② 说原稿不在就地死掉，同一波别的批跟着一起死。
        ko = os.path.exists(p['koms']) and os.path.exists(p['kolore'])
        if st == '0' and not os.path.exists(p['koscene']):
            out.append((e, b))
        elif st == '1' and os.path.exists(p['koscene']) and not ko:
            out.append((e, b))
        elif st == '2' and ko and not os.path.exists(p['zhlore']):
            out.append((e, b))
    return out

def capped(since):
    """刚写下的那些日志里有没有说配额没了。"""
    for p in glob.glob(os.path.join(LOG, '*.jsonl')):
        try:
            if os.path.getmtime(p) < since:
                continue
            with open(p, 'rb') as f:
                f.seek(max(0, os.path.getsize(p) - 4096))
                if CAPPED in f.read().decode('utf-8', 'ignore'):
                    return True
        except OSError:
            continue
    return False

def run(st, grp):
    a = [sys.executable, 'tools/felinia/kopipe.py', st]
    for e, b in grp:
        a += [str(e), str(b)]
    t0 = time.time()
    subprocess.call(a)
    if capped(t0):
        sys.stderr.write('== 配额没了。睡 %d 秒再回来 ==\n' % NAP)
        sys.stderr.flush()
        time.sleep(NAP)
        return False
    return True

for r in range(ROUND):
    left = {st: missing(st) for st in '012'}
    tot = sum(len(left[st]) for st in STAGES)
    sys.stderr.write('== %d bakwi · left 0:%d 1:%d 2:%d ==\n'
                     % (r + 1, len(left['0']), len(left['1']), len(left['2'])))
    sys.stderr.flush()
    if tot == 0:
        sys.stderr.write('== ALL DONE ==\n')
        break
    for st in STAGES:
        grp = missing(st)
        while grp:
            # 一趟塞几批由 kopipe.CHUNK 定：⓪ 五批、② 两批、① 一批。
            # 并排的路数不变，还是 WAVE 个沙盒，只是每个手上多拿几批。
            ok = run(st, grp[:WAVE * kopipe.CHUNK[st]])
            new = missing(st)
            # 配额没了那一次不算数：睡完再照原样试一遍，别急着跳出去。
            if ok and len(new) >= len(grp):
                break
            grp = new
PY
