#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鑄局失敗時給一顆真的能按的「重鑄」。

    python3 tools/felinia/refail.py

原本兩處失敗訊息都寫著

    ⚠ 铸局失败：… —— 已回退为程序化开局，可在顶栏 ↻ 重演重试

這句話兩頭都不對：

  一、頂欄那顆 ↻ 不存在。同一份文件裡寫著「朗读／重演／回退已挪到每段正文
      底下那排」，而 #gTts,#gRedo,#gBack 三顆是 display:none。玩家照著找，
      找不到。
  二、就算找得到也沒用。重演重跑的是上一回合的正文；鑄局失敗時已經
      loadOpening 回退成程序化開局了，重演只會把那個程序化開局再演一遍，
      不會再走一次 ⓪譯入 → ①集筆 → ②譯出。

改成失敗訊息裡直接掛一顆「↻ 重鑄」，按下去重跑當初那一條路：

    feForge()   裡的失敗  →  再跑一次 feForge()
    gameEnter() 裡的失敗  →  再跑一次 gameEnter(lineOverride)

鈕用這一頁現成的 .eBtn —— 跟紀年那一層「PERGERE 進入該時代」同一顆，
單獨佔一行、置中、帶金邊，一眼看得見；正文裡的小 .op 太不顯眼。不新增樣式。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = 'feFailMsg'

MSG = ("narrAdd('sys','⚠&nbsp;铸局失败：'+esc2(msg)+"
       "'&nbsp;——&nbsp;已回退为程序化开局，可在顶栏&nbsp;↻&nbsp;重演重试',null);")

FN_OLD = "function feForge(){"
FN_NEW = """/* 铸局失败时给一颗真的能按的钮。
   原来那句写着「可在顶栏 ↻ 重演重试」，两头都不对：顶栏那颗 #gRedo 早就
   display:none（重演／回退挪到每段正文底下那排了）；而且重演重跑的是上一回合
   的正文，铸局失败时已经回退成程序化开局，重演只会把那个程序化开局再演一遍，
   不会再走一次 ⓪译入 → ①集笔 → ②译出。所以位置与作用都得改。
   钮用现成的 .eBtn —— 跟纪年那一层「PERGERE 进入该时代」同一颗，
   单独占一行、居中、带金边，一眼看得见；.op 那种正文里的小操作钮太不显眼。 */
function feFailMsg(msg,again){
  var p=narrAdd('sys','⚠&nbsp;铸局失败：'+esc2(msg)
    +'&nbsp;——&nbsp;已回退为程序化开局。'
    +'<span style="display:flex;justify-content:center">'
    +'<span class="eBtn feAgain" style="margin-top:14px;font-size:12px;'
    +'padding:12px 40px 10px;border-color:rgba(154,116,42,.6)">'
    +'↻&nbsp;&nbsp;REFVNDERE&nbsp;&nbsp;·&nbsp;&nbsp;重新铸局</span></span>',null);
  try{
    var b=p.querySelector('.feAgain');
    b.addEventListener('click',function(){
      if(BUSY)return;                 /* 还在跑就别叠第二条链 */
      try{p.remove();}catch(_){}
      again();
    });
  }catch(_){}
  return p;
}
function feForge(){"""

A_OLD = "    if(!alive())return;\n    " + MSG
A_NEW = ("    if(!alive())return;\n"
         "    feFailMsg(msg,function(){feForge();});")

B_OLD = "      if(fGen!==TYPE_GEN)return;\n      " + MSG
B_NEW = ("      if(fGen!==TYPE_GEN)return;\n"
         "      feFailMsg(msg,function(){gameEnter(lineOverride);});")


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('重铸钮已经装过了，跳过。')
        return
    n = s.count(MSG)
    if n != 2:
        raise SystemExit('那句失败提示应该正好两处，实际 %d 处，停手。' % n)
    for a, b in ((FN_OLD, FN_NEW), (A_OLD, A_NEW), (B_OLD, B_NEW)):
        k = s.count(a)
        if k != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (k, a[:56]))
        s = s.replace(a, b)
    if s.count(MSG) != 0:
        raise SystemExit('還有沒換掉的舊提示，停手。')
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('鑄局失敗的兩處提示都換成一顆置中的大鈕「↻ REFVNDERE · 重新铸局」：'
          'feForge 那處重跑 feForge，gameEnter 那處重跑 gameEnter。')


if __name__ == '__main__':
    main()
