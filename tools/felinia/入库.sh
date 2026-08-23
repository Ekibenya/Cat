#!/bin/sh
# 提交一次。提交号只写一个数字，作者写死。
#
# 为什么不直接 git add -A：
#   封闭沙盒还在往这棵树里写字。它写一个文件的时候会先清空再落笔，
#   正好在那一瞬间 git status 就会说这个文件「被删了」。
#   实测：一份韩语真本原稿在那一瞬被记成删除，跟着就提交进去了。
#   所以先看有没有「被删」的已入库文件，有就停手，等它写完再来。
#   真要删东西的时候用 --删得有理 明说。
#
# 用法：入库.sh <数字> [--删得有理]
set -u
cd "$(dirname "$0")/../.."

[ $# -ge 1 ] || { echo "用法：入库.sh <数字> [--删得有理]" >&2; exit 2; }
N="$1"; shift
case "$N" in
    ''|*[!0-9]*) echo "提交号只能是数字：$N" >&2; exit 2 ;;
esac

OKDEL=no
for a in "$@"; do
    [ "$a" = "--删得有理" ] && OKDEL=yes
done

if [ "$OKDEL" = "no" ]; then
    DEL=$(git status --porcelain | grep '^ D\|^D ' || true)
    if [ -n "$DEL" ]; then
        echo "有已入库的文件不见了。多半是沙盒正写到一半：" >&2
        echo "$DEL" >&2
        echo "等它写完再来，或者确认过了再加 --删得有理。" >&2
        exit 1
    fi
fi

git add -A
git -c user.name=Ekibenya -c user.email=ekibenya@outlook.com \
    commit --author="Ekibenya <ekibenya@outlook.com>" -m "$N" -q || exit 1
git log --oneline -1
