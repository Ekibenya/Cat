#!/bin/sh
# Cloudflare Pages 的构建步骤：只把站点真正要用的东西拷进 _site/。
#
# 为什么要这一步 —— 仓库里 image/ 有一千多张原始立绘、共约 1.4 GB，
# 站点一个字节都不读（主文档与 sw.js 里搜 /image/ 都是零命中）。
# 不挑出来的话每次部署都要传这 1.4 GB，Vercel 就是这么把额度吃光的。
#
# 主文档放在 _site/index.html —— 不放回 core/vendor/three/build/chunks/… 那条深路径。
# 那条路径是仓库里的存放位置，不该出现在访客的地址栏里。原先靠 _redirects 把 /
# 指过去，可目标带 .html，会触发 Pages 自带的「去掉扩展名」跳转（308），
# 地址栏当场被改写成深路径。放成根上的 index.html 就没有这一跳，也没得暴露。
#
# 面板设置：构建命令 = sh cf-build.sh ，输出目录 = _site
set -e
rm -rf _site
mkdir -p _site

# 站点本体：core/ 里除 vendor/ 之外的部分（vendor 下只有主文档那一个文件）
mkdir -p _site/core
for d in core/*; do
  [ "$d" = "core/vendor" ] && continue
  cp -R "$d" _site/core/
done

# 主文档进根目录
cp core/vendor/three/build/chunks/9d717bc0/156a50943028.html _site/index.html

cp sw.js         _site/
cp manifest.webmanifest _site/
cp _headers      _site/

# 不进站点的：image/（未被引用）、tools/ st/ npc/ 손으로/（工作台与素材）、
# rwserve.py（本地起服务用）、core/vendor/（主文档的仓库存放位置，已改放到根上）
echo "_site 组装完成："
du -sh _site
find _site -type f | wc -l
