#!/bin/sh
# 重打 FELINIA 这一层。
#
#   sh tools/felinia/rebuild.sh [底稿的提交号]
#
# 补丁脚本都带自检：已经打过就拒绝重打（免得打成两层）。所以改了 felinia.js
# 之后不能直接再跑一遍，得先把主文档退回「还没打这一层」的那一版，再从头打。
#
# 底稿默认取 FELINIA 之前的那一次提交。往后再有新的层，把这个默认值往前推。
BASE="${1:-60d7f3f}"
DOC='core/vendor/three/build/chunks/9d717bc0/156a50943028.html'

set -e
cd "$(dirname "$0")/../.."
git show "$BASE:$DOC" > "$DOC"
python3 tools/felinia/enginepatch.py
python3 tools/felinia/herofix.py
python3 tools/felinia/luxfix.py
python3 tools/felinia/brand.py
python3 tools/felinia/qinfix.py
python3 tools/felinia/introskip.py
python3 tools/felinia/creamfix.py
python3 tools/felinia/lean.py
python3 tools/felinia/bookui.py
python3 tools/felinia/menufit.py
python3 tools/felinia/fefit.py
python3 tools/felinia/refail.py
python3 tools/felinia/konow.py
python3 tools/felinia/build.py
python3 tools/felinia/thumbs.py
python3 tools/felinia/cardmeta.py
python3 tools/cardbuild.py
python3 tools/felinia/bake.py
echo '重打完成。'
