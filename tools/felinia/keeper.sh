#!/bin/sh
# 看着驱动器，它没了就再叫起来。
#
# 为什么要这个：实测驱动器死过两次，日志里一句错都没有 —— 只是不见了。
# 一次是配额撞墙之后空转到轮次用完，那个已经修了；
# 另一次是无声地没的。人不在跟前的时候，没人把它扶起来，几个钟头就白过。
#
# setsid 把它挪出这个终端的进程组，省得叫它的那口壳一关它跟着走。
set -u
cd /home/user/cat
PIDFILE=/tmp/cattest/ko/drv.pid
# 认号码，不认命令行里的字。命令行会把叫它的那口壳也一起认进来。
while true; do
    alive=no
    if [ -r "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
        alive=yes
    fi
    if [ "$alive" = "no" ]; then
        echo "== $(date -u +%H:%M) 驱动器不在，重新叫起来 ==" >> /tmp/cattest/ko/drv.log
        setsid nohup sh tools/felinia/drive2.sh >> /tmp/cattest/ko/drv.log 2>&1 &
    fi
    # 三段全空了就收工。
    L=$(python3 tools/felinia/kopipe.py plan 2>/dev/null | tr -d ' \n')
    [ "$L" = "0:01:02:0" ] && { echo "== 全做完了 ==" >> /tmp/cattest/ko/drv.log; exit 0; }
    sleep 120
done
