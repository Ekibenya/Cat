#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""撤掉片头：打开就是主菜单。

空壳自带一段片头（粒子聚成标题、INTRARE 那一颗按钮、点一下才进菜单）。
这张卡不要它——开页直接落到马赛克菜单。

做法是在主循环的第一帧把 introExit() 提前跑掉，而不是在解析阶段就动手：
introExit 里要 menuEnter()，而 menuEnter 用到的那一串变量（MENU、mosStart、
菜单画布）都在脚本更后面才初始化。等第一帧再动，整份脚本已经跑完了。

顺带把过场的淡出关掉，不然还会闪一下黑。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

A = '  if(INTRO.on)introDraw();'
N = """  /* 片头撤掉了：第一帧直接落到主菜单，那一段一帧都不画。
     要把它请回来，把这一段换回 if(INTRO.on)introDraw(); 就行。 */
  if(INTRO.on&&!INTRO.skipped){
    INTRO.skipped=1;
    try{iOv.style.transition='none';iOv.style.display='none';}catch(_){}
    introExit();                 /* 里面会 menuEnter()，并在 850ms 后把节点摘掉 */
    INTRO.on=false;
  }"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if 'INTRO.skipped' in s:
        print('片头早已撤掉，跳过。')
        return
    if s.count(A) != 1:
        sys.exit('锚点不是唯一的（%d 处），停手。' % s.count(A))
    io.open(DOC, 'w', encoding='utf-8').write(s.replace(A, N, 1))
    print('片头已撤 · 主文档 %.0f KB' % (os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
