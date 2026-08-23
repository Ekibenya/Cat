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
        # 驱动器一死，它手下那些沙盒就成了没人等的孤儿。
        # 不清掉的话，新驱动器会为同一批再叫一份 —— 两拨人同时写同一个文件，
        # 写到一半互相踩。实测：一份韩语真本原稿就是这么在 git 眼里「不见了」的，
        # 还见过同一个 e03b0 的②同时跑着三份。
        # **只收养沙盒，不许碰别人。**
        # 光按进程名扫会把主会话自己也扫进去 —— 差一点就把自己杀了。
        # 分辨的法子：沙盒的爹一定是那口跑 샌드박스.sh 的壳。
        # 主会话的爹不是，别处叫起来的也不是。
        for c in $(ps -eo pid=,comm= | awk '$2 == "claude" { print $1 }'); do
            pp=$(ps -o ppid= -p "$c" 2>/dev/null | tr -d ' ')
            [ -n "$pp" ] || continue
            tr '\0' ' ' < "/proc/$pp/cmdline" 2>/dev/null \
                | grep -q '샌드박스\.sh' || continue
            kill "$c" 2>/dev/null && echo "== 孤儿 $c 내렸다 ==" >> /tmp/cattest/ko/drv.log
        done
        echo "== $(date -u +%H:%M) 驱动器不在，重新叫起来 ==" >> /tmp/cattest/ko/drv.log
        setsid nohup sh tools/felinia/drive2.sh >> /tmp/cattest/ko/drv.log 2>&1 &
    fi
    # 三段全空了就收工。
    L=$(python3 tools/felinia/kopipe.py plan 2>/dev/null | tr -d ' \n')
    [ "$L" = "0:01:02:0" ] && { echo "== 全做完了 ==" >> /tmp/cattest/ko/drv.log; exit 0; }
    sleep 120
done
