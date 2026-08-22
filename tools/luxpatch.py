#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 LVX 焊死成唯一主题：全站只有奶油羊皮纸，没有黑夜。

引擎本来就有 `html.lux`（整站反色 + 色相回正 + 暖纸罩），只是当会话级开关用。
这里做四件事：

  1. 开机即 lux，且 luxApply() 无论传什么都只认「开」——彻底没有黑夜这一档
  2. 暖纸罩的颜色对齐菜单的奶油 #f0eadc
  3. 菜单那一屏从全局反色里豁免（再反一次抵消）——马赛克是按真彩烤好的，
     再被全局反一遍就成负片了
  4. 收起 ☀ 按钮与设置里那一行开关：只剩一档，留着是误导
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

A_CSS = "html.lux::after{content:'';position:fixed;inset:0;z-index:2147483647;pointer-events:none;\n  background:#faf7f0;mix-blend-mode:multiply}"

A_FN = """var LUX=0;   /* 白昼是会话级可选项：不落盘，每次打开一律黑夜起步 */
function luxApply(on){
  LUX=on?1:0;
  document.documentElement.classList.toggle('lux',!!on);
  var cb=$('#cfgLux');if(cb)cb.checked=!!on;
  var tg=$('#luxTg');if(tg)tg.textContent=on?'☾':'☀';
}"""

CSS_NEW = """html.lux::after{content:'';position:fixed;inset:0;z-index:2147483647;pointer-events:none;
  background:#f2ece0;mix-blend-mode:multiply}
/* 菜单那一屏不参与全局反色：马赛克是按真彩烤好的，再反一遍就成负片。
   同一条滤镜再上一次，正好抵消。
   只豁免马赛克那一屏。挂上 .gbg（对局时当背景）或 .era（粒子地球）的时候，
   这一层显示的是引擎原来的墨底，再抵消一次就把整块留在黑里——
   对局那一屏于是不是奶油而是暗灰。那两个状态照旧走全局反色。 */
html.lux #menu:not(.gbg):not(.era){filter:invert(1) hue-rotate(180deg)}
/* 只剩奶油一档了，开关收起来 */
#luxTg{display:none!important}"""

FN_NEW = """var LUX=1;   /* 只有奶油一档：开机即白昼，没有黑夜可切 */
function luxApply(){
  LUX=1;
  document.documentElement.classList.add('lux');
  var cb=$('#cfgLux');
  if(cb){cb.checked=true;cb.disabled=true;
    var row=cb.closest&&cb.closest('.sRow,label,div');
    if(row)row.style.display='none';}          /* 设置里那一行也收起 */
}
try{luxApply();}catch(_){}
addEventListener('DOMContentLoaded',function(){try{luxApply();}catch(_){}});"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if 'html.lux #menu{filter' in s:
        sys.exit('主文档里已经焊死奶油主题了，没有重复打。')
    for nm, a in (('CSS', A_CSS), ('luxApply', A_FN)):
        if s.count(a) != 1:
            sys.exit('锚点 %s 不是唯一的（%d 处），停手。' % (nm, s.count(a)))
    s = s.replace(A_CSS, CSS_NEW, 1)
    s = s.replace(A_FN, FN_NEW, 1)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('奶油主题已焊死 · 主文档 %.0f KB' % (os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
