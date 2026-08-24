#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""左欄那幾枚縮圖：游標在手掌與箭頭之間來回跳。

    python3 tools/felinia/railhov.py

局內左邊那一疊小窗（绘卷／地图／商店／装备）寫著

    .gArr      {transform:rotateY(17deg)}                       ← 平時
    .gArr:hover{transform:rotateY(9deg) translateX(4px) translateZ(14px)}

外加軌道上一層 perspective:620px、perspective-origin:0% 50%。

於是 hover 這件事會自己把自己拆掉：游標壓上去 → 這一枚轉正、往右挪四像素、
往前推十四像素 → 它從游標底下挪開了 → hover 解除 → 它彈回原位 →
又壓在游標底下 → hover 又成立。0.34 秒一個來回，永遠停不下來。
游標跟著在 pointer 與 default 之間閃。

標籤那一條尤其糟：

    .gArr .t{left:0;bottom:-14px;font-size:9px}

字是掛在盒子**外頭**下面十四像素的一條九像素高的細帶，離變形原點最遠，挪得最多；
而四枚小窗之間的間距是二十像素，所以那幾條字正好落在間距裡——
滑鼠從螢幕左邊掃過去，一路上全在踩這幾條。

實測（1440×960，局內，逐個可點元素做微抖動，數「游標底下那個東西換了幾次」）：

    .t      下緣  ( 43,453)   換 10 次   .t|pointer ↔ .gRail|default
    .shRow  下緣  ( 50,506)   換 10 次   同上
    .bagGrid下緣  ( 51,570)   換  7 次
    .armDet 上緣  ( 51,571)   換  8 次

（.shRow／.bagGrid／.armDet 是小窗裡那份抽屜克隆的類名，位置都在 x≈50，就是這條軌道。）
主選單那一屏同樣掃過，一個都沒有。

改法：命中不再交給 :hover。

    .gArr:hover{…}  →  .gArr.hv{…}

改由軌道自己按**版面座標**判：軌道（.gRail／.g3dRail）本身不隨 hover 變形，
它的框是穩的；每一枚的 offsetLeft/offsetTop/offsetWidth/offsetHeight 是版面值，
transform 動不到。判中了才掛 .hv。這樣一來變形不再回頭影響命中，環就斷了。

進與出都得按版面座標判，只改一頭不夠。第一版把「出」留給軌道的 pointerleave，
最下面那一枚照舊在閃——標籤掛在軌道的框以外，這一枚一變形、指標就算離開了軌道，
清掉 .hv、彈回原位又蓋住指標，環換了個地方長出來。第二版進出都掛在 document 的
pointermove 上，一律按版面座標算。命中區把標籤那十四像素算進去，四周再放兩像素。

只認滑鼠：觸控沒有 hover 這回事，掛上去只會留一枚亮著不滅。

改完同一份掃描（1440×960，局內，一百五十六個可點元素）：

    .t      下緣  ( 43,453)   10 → 2 次（單向換一次，不是來回）
    .shRow  下緣  ( 50,506)   10 → 2 次
    .bagGrid下緣  ( 51,570)    7 → 沒了
    .armDet 上緣  ( 51,571)    8 → 沒了

另外逐枚驗過：正中、下緣、標籤那一條三個位置都亮得起來，抖十下不掉；
指標移開全滅；三枚的點擊照樣把抽屜開起來（#game 的 mapOpen／shopOpen／armOpen 都對）。
先在主選單上動過滑鼠再進局（冷開機那條路）也一樣亮得起來。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = 'railHov'

CSS_OLD = ('.gArr:hover{transform:rotateY(9deg) translateX(4px) '
           'translateZ(14px);color:var(--txt)}')
CSS_NEW = ('/* 这一档原来挂在 :hover 上，可是它自己会把自己拆掉：转正＋往右挪＋往前推\n'
           '   之后，这一枚就从光标底下挪开了，hover 解除、弹回原位、又压在光标底下——\n'
           '   0.34 秒一个来回，光标在手掌与箭头之间一直闪。改成由 railHov 按版面座标判，\n'
           '   判中了挂 .hv。变形因此不再回头影响命中。 */\n'
           '.gArr.hv{transform:rotateY(9deg) translateX(4px) '
           'translateZ(14px);color:var(--txt)}')

JS_OLD = "function touchy(){"
JS_NEW = """/* 左边那一疊小窗的命中：按版面座标自己判，不交给 :hover。
   为什么不能用 :hover，见上面 .gArr.hv 那一段的注释——那是一个自己拆自己的环。

   判定必须**整个**离开变形后的几何，进出都是。
   第一版只把「进」改成版面座标判，「出」还留着 .gRail 的 pointerleave，
   结果最下面那一枚照旧在闪：标签 .gArr .t 是 bottom:-14px 挂在盒子外头的，
   落在轨道的框以外，于是这一枚一变形、指标就算离开了轨道 → pointerleave 清掉 .hv
   → 弹回原位又盖住指标 → 再算进来。环换了个地方长出来。
   所以进与出都挂在 document 的 pointermove 上，一律按版面座标算：
   在任何一枚的版面框里就亮那一枚，都不在就全灭。transform 碰不到 offsetLeft/offsetTop，
   这个判定跟动画完全无关。

   命中区往下多算 16 像素，就是给那条标签留的（四枚之间的间距是 20 像素，
   那几条字正好落在间距里，是这条轨道上最常被扫到的地方）。

   轨道的框只在「一枚都没亮着」的时候重量。理由不是省事，是这两条轨道会挪：
   #game 没开的时候量到的全是零，开了局才有位置；--ui 一变、绘卷那一栏收放，
   位置也跟着走。改用一个量出来的边界提前返回，就会被开局前那份零锁死——
   进了局往左扫，边界还停在 40，永远早退，这一栏再也不亮。
   所以边界写成固定的 200（两条轨道都在 left:3～6，宽 76 上下，够宽了），
   在这条带子里且没有亮着的，就重量一次。 */
var RAIL_EDGE=200;
var RAILH={its:null,box:null};
function railHovScan(){
  var rails=document.querySelectorAll('.gRail,.g3dRail'),its=[],i,j,a;
  for(i=0;i<rails.length;i++){a=rails[i].querySelectorAll('.gArr');
    for(j=0;j<a.length;j++)its.push({r:rails[i],e:a[j]});}
  RAILH.its=its;RAILH.box=null;
}
function railHovBox(){
  var its=RAILH.its||[],i,b=[];
  for(i=0;i<its.length;i++)b.push(its[i].r.getBoundingClientRect());
  RAILH.box=b;
}
function railHovAt(x,y){
  var its=RAILH.its||[],b=RAILH.box||[],i,e,rb,l,t;
  for(i=0;i<its.length;i++){e=its[i].e;rb=b[i];
    if(!rb||!rb.width||!e.offsetParent)continue;
    l=rb.left+e.offsetLeft;t=rb.top+e.offsetTop;
    if(x>=l-2&&x<=l+e.offsetWidth+2&&y>=t-2&&y<=t+e.offsetHeight+16)return e;}
  return null;
}
function railHov(){
  railHovScan();
  if(!RAILH.its.length)return;
  document.addEventListener('pointermove',function(ev){
    if(ev.pointerType&&ev.pointerType!=='mouse')return;   /* 触控没有 hover 这回事 */
    var its=RAILH.its,i,on=false;
    for(i=0;i<its.length;i++)if(its[i].e.classList.contains('hv')){on=true;break;}
    if(ev.clientX>RAIL_EDGE&&!on)return;   /* 离得远又没亮着的：一次测量都不做 */
    if(!on||!RAILH.box)railHovBox();       /* 没亮着就重量：轨道会随开局与收放挪位子 */
    var got=railHovAt(ev.clientX,ev.clientY);
    for(i=0;i<its.length;i++)its[i].e.classList.toggle('hv',its[i].e===got);
  },{passive:true});
}
try{railHov();}catch(_){}
function touchy(){"""



def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('左栏那一疊小窗的命中已经改过了，跳过。')
        return
    for a, b in ((CSS_OLD, CSS_NEW), (JS_OLD, JS_NEW)):
        n = s.count(a)
        if n != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (n, a[:56]))
        s = s.replace(a, b)
    if '.gArr:hover' in s:
        raise SystemExit('還有 .gArr:hover 沒換掉，環沒斷，停手。')
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('左栏那一疊小窗（绘卷／地图／商店／装备）的 hover 改成按版面座标判：')
    print('  .gArr:hover → .gArr.hv，命中由 railHov 算，变形不再回头影响命中。')


if __name__ == '__main__':
    main()
