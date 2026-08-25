#!/bin/sh
# Cloudflare Pages 的构建步骤：只把站点真正要用的东西拷进 _site/。
#
# 为什么要这一步 —— 仓库里 image/ 有一千多张原始立绘、共约 1.4 GB，
# 站点一个字节都不读（主文档与 sw.js 里搜 /image/ 都是零命中）。
# 不挑出来的话每次部署都要传这 1.4 GB，Vercel 就是这么把额度吃光的。
#
# 面板设置：构建命令 = sh cf-build.sh ，输出目录 = _site
set -e
rm -rf _site
mkdir -p _site

# 站点本体
cp -R core          _site/
cp    sw.js         _site/
cp    manifest.webmanifest _site/
cp    _headers      _site/
cp    _redirects    _site/

# 根网址直接由真实的 index.html 提供。这里只复制构建产物，不移动或改写原入口，
# 深层旧网址仍然可用，页面里的 /core/ 资源路径也保持原样。
cp core/vendor/three/build/chunks/9d717bc0/156a50943028.html _site/index.html

# 不进站点的：image/（未被引用）、tools/ st/ npc/ 손으로/（工作台与素材）、rwserve.py（本地起服务用）
echo "_site 组装完成："
du -sh _site
find _site -type f | wc -l
