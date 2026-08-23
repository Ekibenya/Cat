#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""资料库[DB]那一页：左边再加一层大母项，窗口放大。

    python3 tools/felinia/bookui.py

原来是三栏：类目 → 条目 → 正文。类目是按条目自己的 cat 分的，
于是左边那一列排着一百六十八个人、四十一代、三十四个横断门类、
通史、研究册、通则、文字六组——两百五十多行并成一列，翻到底也找不到东西。

这里在最左边再加一栏「大母项」，先选大类再选类目：

    大母项 → 类目 → 条目 → 正文

分法跟世界书自己的层（lay）一致，玩家自写的与请入的角色卡另立一项。
窗口从 680 放到 1080，高度从 58vh 放到 66vh，四栏才排得开。

打过一次就拒绝重打（自检见 GUARD）。
"""
import io
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = 'BOOK_TOPS'

CSS_OLD = ".cxCats{width:118px;flex:none;border-right:1px solid rgba(19,18,13,.14);overflow-y:auto}"
CSS_NEW = (
    ".cxTops{width:176px;flex:none;border-right:1px solid rgba(19,18,13,.14);overflow-y:auto}\n"
    ".cxTop{font-size:11px;letter-spacing:.08em;color:var(--mut);padding:11px 10px;"
    "cursor:pointer;transition:all .15s}\n"
    ".cxTop.on{color:#e9e3d6;background:var(--gold)}\n"
    ".cxTop:not(.on):hover{color:var(--gold-hi)}\n"
    ".cxTop i{float:right;font-style:normal;font-size:9px;letter-spacing:0;opacity:.5}\n"
    ".cxCats{width:146px;flex:none;border-right:1px solid rgba(19,18,13,.14);overflow-y:auto}"
)

REPS = [
    # ── 窗口放大 ──
    ('<div class="gDlg" id="dlgBook">\n'
     '  <div class="box" style="width:min(calc(94vw/var(--ui)),680px)">',
     '<div class="gDlg" id="dlgBook">\n'
     '  <div class="box" style="width:min(calc(94vw/var(--ui)),1160px)">'),
    ('#dlgBook .cxWrap{flex:1 1 auto;min-height:0;max-height:none;height:calc(58vh/var(--ui))}',
     '#dlgBook .cxWrap{flex:1 1 auto;min-height:0;max-height:none;height:calc(66vh/var(--ui))}'),
    # 光把行内 width 放到 1080 没用：.gDlg .box 上有一条
    # max-width:min(94vw/--ui,680px)，把每个弹窗都夹在 680。这一页要自己解开。
    ('#dlgBook .box{max-height:calc(88vh/var(--ui));overflow:hidden;'
     'display:flex;flex-direction:column}',
     '#dlgBook .box{max-width:min(calc(94vw/var(--ui)),1160px);'
     'max-height:calc(88vh/var(--ui));overflow:hidden;'
     'display:flex;flex-direction:column}'),

    # ── 多一栏的骨架与样式 ──
    ('    <div class="cxWrap">\n      <div class="cxCats" id="cxCats"></div>',
     '    <div class="cxWrap">\n      <div class="cxTops" id="cxTops"></div>\n'
     '      <div class="cxCats" id="cxCats"></div>'),
    (CSS_OLD, CSS_NEW),
    ('.cxTab,.cxCat,.cxEnt,.op,#gNarr .op{', '.cxTab,.cxTop,.cxCat,.cxEnt,.op,#gNarr .op{'),
    # 条目栏 194 太窄，纪年那十四条的标题要折两行。窗口宽了，分它一点
    ('.cxEnts{width:194px;', '.cxEnts{width:236px;'),

    # ── 手机上第四栏也要跟着变成横滑的胶囊行 ──
    ('  #dlgBook .cxCats,#dlgBook .cxEnts{',
     '  #dlgBook .cxTops,#dlgBook .cxCats,#dlgBook .cxEnts{'),
    ('  #dlgBook .cxCats::-webkit-scrollbar,#dlgBook .cxEnts::-webkit-scrollbar{display:none}',
     '  #dlgBook .cxTops::-webkit-scrollbar,#dlgBook .cxCats::-webkit-scrollbar,'
     '#dlgBook .cxEnts::-webkit-scrollbar{display:none}'),
    ('  #dlgBook .cxEnts{margin-top:6px}',
     '  #dlgBook .cxCats,#dlgBook .cxEnts{margin-top:6px}'),
    ('  #dlgBook .cxCat,#dlgBook .cxEnt{',
     '  #dlgBook .cxTop,#dlgBook .cxCat,#dlgBook .cxEnt{'),
    ('  #dlgBook .cxCat{font-size:11.5px}',
     '  #dlgBook .cxCat{font-size:11.5px}\n'
     '  #dlgBook .cxTop{font-size:11.5px}\n'
     '  #dlgBook .cxTop i{float:none;margin-left:6px}'),
]

JS_OLD = """var BOOK={side:'luzhi',cat:0,ent:0};
function bookCats(side){
  var lb=CARDS[side].lorebook||[],order=[],map={};
  for(var i=0;i<lb.length;i++){var c=lb[i].cat||'其他';
    if(!map[c]){map[c]=[];order.push(c);}map[c].push(i);}
  return{order:order,map:map};
}"""

JS_NEW = """var BOOK={side:'luzhi',top:0,cat:0,ent:0};
/* 左边那一列原来只有「类目」一层，而类目是按条目自己的 cat 分的：
   一百六十八个人、四十一代、三十四个横断门类、通史、研究册、通则、文字六组，
   两百五十多行并成一列，翻到底也找不到东西。现在先分大母项，再分类目。
   分法跟世界书自己的层（lay）一致；玩家自写的与请入的角色卡另立一项。 */
/* 名字一律用白话：母条目→目录、通则→基本规矩、文字→怎么写、
   纪年→各个时代、横断→专题、通史→世界史、研究册→地区与书目。
   条目自己的 cat 不动，改的只是这一栏显示的名。 */
var BOOK_TOPS=['目录','基本规矩','怎么写','各个时代','专题','世界史','地区与书目'];
/* 人物一栏原来是一整坨：十六代两百多人挤在一个大母项底下，
   点进去中间那一列要翻两百多行。改成按纪年拆开，名字写成「10000BC-人物」。

   年份不从 FE.eras 取 —— FE 关在闭包里，这一段够不着（试过，整栏退成了
   「纪年1-人物」）。改成从世界书自己身上认：本代那几条的分类名就写着年份，
   长这样「前10000年 史前窝群」「850年 阿拔斯时代的商队」，取前头那一截就够。 */
var _BKY={};
function bookYearScan(lb){
  _BKY={};
  for(var i=0;i<lb.length;i++){var e=lb[i];
    if(!e||e.lay!=='world'||!e.era||_BKY[e.era])continue;
    var m=/^(前)?([0-9]+)年/.exec(e.cat||'');
    if(m)_BKY[e.era]=m[1]?(m[2]+'BC'):(m[2]+'AD');}
}
function bookYear(era){
  return _BKY[era]||('纪年'+era);
}
function bookTop(e){
  if(!e)return '其他';
  if(e.custom||e.cat==='自写'||e.cat==='角色卡')return '自己写的';
  if(e.lay==='core')return (e.ord<10)?'目录':'基本规矩';
  if(e.lay==='style')return '怎么写';
  if(e.lay==='figures')return bookYear(e.era)+'-人物';
  if(e.lay==='world'){
    if(e.cat==='通史')return '世界史';
    if(e.cat==='研究册')return '地区与书目';
    return e.era?'各个时代':'专题';
  }
  return '其他';
}
/* 排序用的号。表上有名字的按表；人物按纪年往后排；自己写的与其他垫底。 */
function bookRank(t,e){
  var i=BOOK_TOPS.indexOf(t);
  if(i>=0)return i;
  if(e&&e.lay==='figures')return 100+(e.era||0);
  return (t==='自己写的')?300:301;
}
/* 条目栏里的名字：把跟类目重复的那截前缀去掉。
   「〔前10000年 · 史前窝群〕国家」在「前10000年 史前窝群」这一类下只写「国家」，
   「刑天 · 第一项 · 概要」在「人 · 刑天」这一类下只写「第一项 · 概要」。
   对不上的前缀（同在通史类下的〔卷首〕〔表一〕〔卷一〕）原样留着，那是有用的。 */
function bookLabel(t,c){
  t=String(t==null?'':t);c=String(c==null?'':c);
  var m=/^〔([^〕]*)〕([\s\S]+)$/.exec(t);
  if(m&&c&&c.replace(/[·\s]/g,'')===m[1].replace(/[·\s]/g,''))return m[2];
  var tail=c.split(' · ').pop();
  if(tail&&tail!==c&&t.indexOf(tail+' · ')===0)return t.slice(tail.length+3);
  return t;
}
/* 有些条目是写给引擎看的规矩，不是世界里的事，资料库这一页不该摆给玩家。
   只是不显示——注入照旧，一条也没少发。
     整条不显示：目录（母条目）· 怎么写那四十八条 · 通则里的常错清单 · 母本的取用规矩
     逐行不显示：世界那几层里指点怎么写的行（禁止…、不要…、游戏内用法…）
   人物那一层是整段散文，不逐行滤——滤了会把整条滤空。
   玩家自己写的和请入的角色卡一律照显，不动人家的东西。 */
var BOOK_HIDE={'〔通则〕这个世界不是那样的 · 八条常错':1,
               '〔母本〕两部书的读法与本卡的取用规矩':1};
var BOOK_META=/禁止|不许|不要|不得|玩家|正文|剧情|写成|怎么写|的用法：|钩子|场面里|场面上|游戏内|取用规矩|不是设定|这一条|本条|写这一段|写他们时|写政治时|写任何一代|触发时|一行一件事|条目|世界书|神谕|提示词/;
function bookHide(e){
  if(!e||e.custom)return false;
  if(e.lay==='style')return true;
  if(e.lay==='core'&&e.ord<10)return true;
  return !!BOOK_HIDE[e.title];
}
function bookText(e){
  var t=String((e&&e.content)||'');
  if(!e||e.custom||!e.lay||e.lay==='figures')return t;
  var a=t.split('\\n'),o=[],i;
  for(i=0;i<a.length;i++)if(a[i].trim()&&!BOOK_META.test(a[i]))o.push(a[i]);
  return o.length?o.join('\\n'):t;
}
/* 类目栏的名字：去掉「人 · 」「文字 · 」这两个前缀。
   左边那一栏已经写着是「人物」还是「怎么写」了，每一行再重复一遍是白占地方。
   去的只是显示，条目自己的 cat 不动——酒馆那一边和母条目的门类表还照旧用它。 */
function bookCatLabel(c){
  return String(c==null?'':c).replace(/^(人|文字)\s*·\s*/,'');
}
/* 两层目录：大母项 → 类目 → 条目下标。次序按 BOOK_TOPS，表上没有的排在最后。 */
function bookCats(side){
  var lb=(CARDS[side]&&CARDS[side].lorebook)||[],tops=[],tmap={},i;
  bookYearScan(lb);
  for(i=0;i<lb.length;i++){
    if(bookHide(lb[i]))continue;
    var t=bookTop(lb[i]),c=lb[i].cat||'其他';
    if(!tmap[t]){tmap[t]={order:[],map:{},n:0,r:bookRank(t,lb[i])};tops.push(t);}
    var g=tmap[t];
    if(!g.map[c]){g.map[c]=[];g.order.push(c);}
    g.map[c].push(i);g.n++;
  }
  tops.sort(function(a,b){return tmap[a].r-tmap[b].r;});
  return{tops:tops,tmap:tmap};
}"""

JS_OLD2 = """  var catsEl=$('#cxCats'),entsEl=$('#cxEnts');
  catsEl.innerHTML='';entsEl.innerHTML='';"""
JS_NEW2 = """  var topsEl=$('#cxTops'),catsEl=$('#cxCats'),entsEl=$('#cxEnts');
  if(topsEl)topsEl.innerHTML='';
  catsEl.innerHTML='';entsEl.innerHTML='';"""

JS_OLD3 = """  if(BOOK.cat>=bc.order.length)BOOK.cat=0;
  bc.order.forEach(function(c,ci){
    var d=document.createElement('div');d.className='cxCat'+(ci===BOOK.cat?' on':'');d.textContent=c;
    d.addEventListener('click',function(){BOOK.cat=ci;BOOK.ent=0;bookRender();});
    catsEl.appendChild(d);
  });
  var ids=bc.map[bc.order[BOOK.cat]];"""
JS_NEW3 = """  if(!bc.tops.length){
    $('#cxTtl').textContent='陆之卷';
    $('#cxTxt').textContent='—— 这一卷没有可看的条目。 ——';
    return;
  }
  if(BOOK.top>=bc.tops.length)BOOK.top=0;
  bc.tops.forEach(function(t,ti){
    var g=bc.tmap[t],d=document.createElement('div');
    d.className='cxTop'+(ti===BOOK.top?' on':'');d.textContent=t;
    var b=document.createElement('i');b.textContent=g.n;d.appendChild(b);
    d.addEventListener('click',function(){BOOK.top=ti;BOOK.cat=0;BOOK.ent=0;bookRender();});
    if(topsEl)topsEl.appendChild(d);
  });
  var grp=bc.tmap[bc.tops[BOOK.top]];
  if(BOOK.cat>=grp.order.length)BOOK.cat=0;
  grp.order.forEach(function(c,ci){
    var d=document.createElement('div');d.className='cxCat'+(ci===BOOK.cat?' on':'');
    d.textContent=bookCatLabel(c);
    d.addEventListener('click',function(){BOOK.cat=ci;BOOK.ent=0;bookRender();});
    catsEl.appendChild(d);
  });
  var ids=grp.map[grp.order[BOOK.cat]];"""

JS_OLD3B = "    d.textContent=e.title;"
JS_NEW3B = "    d.textContent=bookLabel(e.title,e.cat);"

JS_OLD3C = "  $('#cxTxt').textContent=cur.content;"
JS_NEW3C = "  $('#cxTxt').textContent=bookText(cur);"

JS_OLD4 = "    ['#cxCats','#cxEnts'].forEach(function(sel){"
JS_NEW4 = "    ['#cxTops','#cxCats','#cxEnts'].forEach(function(sel){"

JS_OLD5 = ("tb.addEventListener('click',function(){BOOK.side=tb.getAttribute('data-side');"
           "BOOK.cat=0;BOOK.ent=0;bookRender();});")
JS_NEW5 = ("tb.addEventListener('click',function(){BOOK.side=tb.getAttribute('data-side');"
           "BOOK.top=0;BOOK.cat=0;BOOK.ent=0;bookRender();});")


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('资料库已经是四栏了，跳过。')
        return
    for a, b in REPS + [(JS_OLD, JS_NEW), (JS_OLD2, JS_NEW2), (JS_OLD3, JS_NEW3),
                        (JS_OLD3B, JS_NEW3B), (JS_OLD3C, JS_NEW3C),
                        (JS_OLD4, JS_NEW4), (JS_OLD5, JS_NEW5)]:
        n = s.count(a)
        if n != 1:
            raise SystemExit('这一段命中 %d 次，不是一次，停手：%s' % (n, a[:60]))
        s = s.replace(a, b)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('资料库改成四栏：大母项 → 类目 → 条目 → 正文；窗口 680→1080，高 58vh→66vh。')


if __name__ == '__main__':
    main()
