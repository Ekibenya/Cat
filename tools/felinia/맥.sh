#!/bin/sh
# 这一窗跑得怎么样。加不加并发，看这个数决定，不要凭感觉。
#
#   맥.sh [起点]     起点写成 "2026-08-23 07:27"，不写就看最近两小时
#
# 看三样：做成了几판、撞墙几次、握手掉了几次。
# 撞墙一涨或者握手超过三次，就把 drive2.sh 的 WAVE 退回去。
set -u
LOG=/tmp/cattest/ko/log
SINCE="${1:-2 hours ago}"
ok=0; cap=0; tls=0; etc=0
for f in $(find "$LOG" -name '*.jsonl' -newermt "$SINCE" 2>/dev/null); do
    r=$(tail -c 700 "$f" | grep -o '"result":"[^"]\{0,40\}' | head -1)
    case "$r" in
        *"session limit"*) cap=$((cap + 1)) ;;
        *"Self-signed"*|*"Unable to connect"*) tls=$((tls + 1)) ;;
        '') etc=$((etc + 1)) ;;
        *) ok=$((ok + 1)) ;;
    esac
done
echo "이 창($SINCE 뒤): 성공 $ok · 벽 $cap · 손 놓침 $tls · 미상 $etc"
[ "$cap" -gt 0 ] && echo "  → 벽에 닿았다. WAVE 를 도로 내려라"
[ "$tls" -gt 3 ] && echo "  → 손 놓침이 잦다. WAVE 를 도로 내려라"
exit 0
