#!/bin/sh
# 把 Korean 那边的 샌드박스.sh 再叫几遍。
#
# 为什么要这一层：
#   一次并发好几个的时候，偶尔会在握手那一步滑一下，整批白丢。
#   把掉下来的那一批原样再叫一遍，多半下一次就接上了。
#   隔开的时间逐次拉长，最多四次。
#
# 用法：sbretry.sh <열기|잇기> <记录目录> <工作目录> <名字>=<提示词文件> [...]
#   第一个词是那边脚本的开关，열기 是新开一个，잇기 是接着上一次那个说。
set -u
SB=/home/user/Korean/skill/scripts/샌드박스.sh
i=1
wait_s=5
while [ "$i" -le 4 ]; do
    if sh "$SB" "$@"; then exit 0; fi
    sleep "$wait_s"
    wait_s=$((wait_s * 2))
    i=$((i + 1))
done
exit 1
