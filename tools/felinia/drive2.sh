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
# 把自己的号码写下来。看门的靠这个号码认人 ——
# 拿 ps 去找命令行里的字，会找到叫它的那口壳（壳里正抄着这个脚本的全文）。
# 实测：看门的因此以为驱动器活着，白站了一个钟头。
PIDFILE=/tmp/cattest/ko/drv.pid
echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT INT TERM
WAVE=${WAVE:-6}
ROUND=${ROUND:-400}
# 只跑哪几段。默认三段都跑，从后往前 —— 先把快做完的推出去。
STAGES=${STAGES:-210}
python3 - "$WAVE" "$ROUND" "$STAGES" <<'PY'
import glob, json, os, subprocess, sys, time
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

def wave():
    """凑一波，六个位子。先给②，再给①，剩下的给⓪。

    一段排空了才走下一段的话，②只剩一批时六个位子空着五个 —— 实测撞上过。
    """
    out, slots = [], WAVE
    for st in ('2', '1', '0'):
        ch = kopipe.CHUNK[st]
        left = missing(st)
        while left and slots > 0:
            out.append((st, left[:ch]))
            left = left[ch:]
            slots -= 1
    return out


def run(plan):
    a = [sys.executable, '-c',
         'import sys; sys.path.insert(0, "tools/felinia"); import kopipe, json;'
         'sys.exit(kopipe.run_mixed(json.loads(sys.argv[1])))',
         json.dumps([[st, [list(x) for x in g]] for st, g in plan])]
    t0 = time.time()
    subprocess.call(a)
    if capped(t0):
        sys.stderr.write('== 配额没了。睡 %d 秒再回来 ==\n' % NAP)
        sys.stderr.flush()
        time.sleep(NAP)
        return False
    return True

stuck = 0
for r in range(ROUND):
    left = {st: missing(st) for st in '012'}
    tot = sum(len(left[st]) for st in STAGES)
    sys.stderr.write('== %d bakwi · left 0:%d 1:%d 2:%d ==\n'
                     % (r + 1, len(left['0']), len(left['1']), len(left['2'])))
    sys.stderr.flush()
    if tot == 0:
        sys.stderr.write('== ALL DONE ==\n')
        break
    before = sum(len(left[st]) for st in STAGES)
    ok = run(wave())
    after = sum(len(missing(st)) for st in STAGES)
    # 配额没了那一次不算数：睡完再照原样试一遍，别急着数它。
    if ok and after >= before:
        stuck += 1
        sys.stderr.write('== 没有前进（第 %d 次）==\n' % stuck)
        if stuck >= 6:
            sys.stderr.write('== 六次都没动。停手 ==\n')
            break
    else:
        stuck = 0
PY
