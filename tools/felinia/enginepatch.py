#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FELINIA · 铸局四步 —— 往主文档里加一层，排在纪年页与选局环之间。

原来          菜单 → 剧情线 → 纪年 ANNALES → 选局环 → 入局
加完这一层    菜单 → 剧情线 → 纪年 ANNALES → 择地 → 立身 → 识人 → 此刻 → 铸局 → 入局

接口只动 esEngage() 那一处：纪年选定后，若这一代有资料就走本层；
资料没加载上、或这一代没写，照旧退回选局环——所以坏了也只是回到从前的样子。

铸局那一步不自己写正文。它把玩家选的东西整理成一份「场面事实」，
交给三段闭合流程去写（见 felinia.js 里的 feForge）——玩家看到的只有
「ORACVLVM · 铸局中……」这一条进度，中间那三段一个字也不露。

未接神谕时不走这条路：直接落到引擎原有的程序化开局（gameEnter），
玩家照样能玩，只是那一幕是程序拼的。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
JS   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'felinia.js')
CSS  = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'felinia.css')
HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'felinia.html')

A_CSS  = '#eraSel{position:fixed;inset:0;z-index:46;'
A_DOM  = '<div id="persona">'
A_JS   = 'function esBackToLines(){esClose();lsOpen();}'
A_HOOK = """function esEngage(){
  if(!ES.on)return;
  var d=ES.rows[ES.i];
  try{ERA.sel=null;if(typeof d.ys==='number')ERA.year=d.ys;}catch(_){}
  esClose();rebuildRing(ES.line);menuExit();
}"""
HOOK = """function esEngage(){
  if(!ES.on)return;
  var d=ES.rows[ES.i];
  try{ERA.sel=null;if(typeof d.ys==='number')ERA.year=d.ys;}catch(_){}
  /* 这一代有铸局资料就走 FELINIA 四步；没有（资料没加载上、或这一代没写）
     就照旧退回选局环——本层坏掉最多是回到从前，不会把纪年页堵死。 */
  try{if(typeof feOpen==='function'&&feOpen(d,ES.line))return;}catch(_){}
  esClose();rebuildRing(ES.line);menuExit();
}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if 'id="feWrap"' in s:
        sys.exit('主文档里已经有 FELINIA 铸局层了，没有重复打。')
    for nm, a in (('CSS', A_CSS), ('DOM', A_DOM), ('JS', A_JS), ('esEngage', A_HOOK)):
        if s.count(a) != 1:
            sys.exit('锚点 %s 不是唯一的（%d 处），停手。' % (nm, s.count(a)))
    css = io.open(CSS, encoding='utf-8').read()
    dom = io.open(HTML, encoding='utf-8').read()
    js  = io.open(JS, encoding='utf-8').read()

    s = s.replace(A_CSS, css.rstrip() + '\n' + A_CSS, 1)
    s = s.replace(A_DOM, dom.rstrip() + '\n' + A_DOM, 1)
    s = s.replace(A_HOOK, HOOK, 1)
    s = s.replace(A_JS, A_JS + '\n' + js.rstrip() + '\n', 1)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('FELINIA 铸局层已注入 · 样式 %.0f KB · 结构 %.0f KB · 脚本 %.0f KB · 主文档 %.0f KB'
          % (len(css) / 1024, len(dom) / 1024, len(js) / 1024, os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
