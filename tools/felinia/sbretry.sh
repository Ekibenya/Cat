#!/bin/sh
# 샌드박스.sh 를 몇 번이고 다시 부른다.
#
# 왜: 여럿을 한꺼번에 띄우면 이따금 붙는 자리에서 미끄러진다.
#     떨어진 쪽만 그대로 다시 부르면 대개 그다음에 붙는다.
#     사이를 벌려 가며 네 번까지 해 본다.
#
# 쓰는 법: sbretry.sh <열기|잇기> <기록디렉터리> <작업디렉터리> <이름>=<파일> [...]
set -u
SB=/home/user/Korean/skill/scripts/샌드박스.sh
i=1
while [ "$i" -le 4 ]; do
    if sh "$SB" "$@"; then exit 0; fi
    sleep $((5 * i))
    i=$((i + 1))
done
exit 1
