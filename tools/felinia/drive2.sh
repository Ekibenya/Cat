#!/bin/sh
# 八十八批，一批七位，每批三段封闭沙盒。
#
# 只准开一头。实测开了两头之后，两边挑中的是同一批活，白打了三个多钟头。
#
# 并发九。四太慢；十到十一（两个驱动器同时跑那阵）出过六次握手失败，所以留一格余地。
# 掉下来的那一批由 sbretry.sh 原样再叫。
#
# 加并发**不一定**更快：这一条路上真正的封顶是按钟点重置的用量上限。
# 实测最近两百판里有一百四十二판是撞在那堵墙上的。额度定死的话，
# 并发只改变多快撞墙、然后闲多久，不改变一窗能做多少。
# 之所以还是提到九：量过这一窗（十四판全成、零次撞墙）确实还有余量闲着。
# 退回六的信号有两个 —— 撞墙计数一涨，或者一窗里握手失败超过三次。
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
# **一个就够，多了会互相踩。**
# 实测：一次同时活着三个驱动器，各自发各自的波，同一批的②同时跑着三份，
# 同一个文件两拨人写。起因是 kill 给的 TERM 落在这口 sh 上，
# 而 sh 正在前台等 python，要等它回来才跑 trap —— 于是号码文件先没了，
# 看门的看不到号码就又叫一个。所以这里自己先看一眼，有活的就不进门。
if [ -r "$PIDFILE" ]; then
    OLD=$(cat "$PIDFILE" 2>/dev/null)
    if [ -n "$OLD" ] && [ "$OLD" != "$$" ] && kill -0 "$OLD" 2>/dev/null; then
        echo "== 이미 $OLD 이 돌고 있다. 들어가지 않는다 ==" >&2
        exit 0
    fi
fi
echo $$ > "$PIDFILE"
# 号码文件是共用的，走的时候只许擦掉**自己的**那一笔。
# 实测：旧驱动器退场时把新驱动器的号码一起擦了，看门的看不到号码就又叫一个，
# 于是两个驱动器各发各的波，同一批被做了三遍。
trap '[ "$(cat "$PIDFILE" 2>/dev/null)" = "$$" ] && rm -f "$PIDFILE"' EXIT INT TERM
WAVE=${WAVE:-9}
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
