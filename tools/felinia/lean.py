#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""瘦身：把这张卡用不上的三大块从每一帧、每一次开页里拿掉。

实测（1280×800，桌面 Chromium）：
  · 开页只是停在主菜单，javascript 堆就吃到 205.9 MB，帧率 20.7
  · 把三维那一层关掉，同一屏的堆落到 9.6 MB —— 一百九十六兆全是它

三块毛病，逐条：

① 三维天下（three.js 800 KB ＋ 两台引擎 716 KB ＋ 资材包 26 MB）
   每次开页都无条件装，装完就在内存里摆一整套三维场景。可这一层画的是
   周秦八城，是上一张卡的东西；这一张从前一万年走到一九〇〇年，四十一代，
   没有固定主角，那八座城一代也对不上。既然一格都用不着，整层停用。

② 粒子地球
   菜单那一屏的画布早就 `display:none`（马赛克盖在上头），可 menuDraw()
   照旧每帧把三万五千个地球点位算一遍、画一遍——画进一张看不见的画布。
   地球的点云、测地线、罗马疆域掩码合起来二十一 KB，四处画它的地方一处也留不得。

③ 纪年页的图版
   四十二张，一张全图解开六兆。原来是「前后各六张一起上全图」，
   走一遍就是两百多兆常驻。条子只有九十二像素宽，用缩图就够。

顺带三处早该改的：
  · 马赛克码砖的快慢提成两个明写的常数（MOS_POP / MOS_ALL），节奏照原样
  · 开始——直接进图版那一屏，中间选线那一层只有一条线，没有意义
  · 图版——鼠标点、手指点选中的那一张就是进下一步，原来点了没反应

对局屏的地图也一并换掉：原来挂的是半颗粒子地球，现在与择地那一步同一幅
罗马马赛克世界图、同一套投影——玩家在两处看到的是同一个世界。

已经打过就什么都不做，好让重打脚本能反复跑。
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

MARK = '/* LEAN：三维天下整层停用 */'
NL   = chr(10)      # 拼 js 片段时用，省得在这份脚本里跟转义打架


def body(s, head):
    """返回 head 那个函数从头到「配对的右花括号」为止的整段文本。"""
    i = s.find(head)
    if i < 0:
        sys.exit('找不到 %r，停手。' % head[:40])
    if s.count(head) != 1:
        sys.exit('%r 不是唯一的（%d 处），停手。' % (head[:40], s.count(head)))
    j = i + len(head) - 1          # 落在 '{' 上
    d = 0
    while j < len(s):
        c = s[j]
        if c == '{':
            d += 1
        elif c == '}':
            d -= 1
            if d == 0:
                return i, j + 1
        j += 1
    sys.exit('%r 的花括号没配上，停手。' % head[:40])


# ── ② 粒子地球：点云、测地线与罗马疆域掩码整块拿掉 ────────────────────────
GLOBE_NEW = """/* 粒子地球整块卸载。原来这里是一份 13 KB 的陆地掩码、一份罗马疆域掩码，
   加一段把它们摊成三万五千个点位的构造器；四处画它的地方（主菜单、纪年页、
   对局屏的地图面板、存档缩略窗）合起来每帧上十万次矩形入桶。
   菜单的画布本来就 display:none，纪年页的粒子地球这一版进不去，
   剩下两处已改用平铺的罗马马赛克世界图。三个数组留成空的，
   底下那些 for(i<LANDPTS.length) 一圈都不会转，不必逐处去删。 */
var LANDPTS=[],LINKS=[],GEO=[];"""

# ── ③ menuDraw：身体整段撤掉，只留纪年页那一路的分派 ─────────────────────
MENUDRAW_NEW = """function menuDraw(){
  if(ERA.on){eraDraw();return;}
  /* 底下原来是一整套：粒子地球、测地线壳、标题点阵、光晕。
     可 `#menu:not(.era):not(.gbg) #menuCv{display:none}` —— 这一屏的画布是
     不显示的，马赛克盖在上头。画了三万五千个点，一个也没人看见，
     帧率却因此从 60 掉到 21。整段撤掉。
     要请回来，去 git 里取这一段的旧身体。 */
}"""

# ── ④ 对局屏的地图：换成平铺的罗马马赛克世界图 ───────────────────────────
GMAP_NEW = """/* 对局屏的地图：与择地那一步同一幅罗马马赛克世界图，同一套投影。
   原来挂的是半颗粒子地球（球心压在面板左缘、只露右半边），
   与择地那一屏风马牛不相及，玩家在两处看到的是两个世界。 */
function gmMM(){try{return (FE&&FE.mm&&FE.mi&&FE.mi.width)?FE.mm:null;}catch(_){return null;}}
function gmBox(){
  /* 镜头对着这一代的地点群，视野至少两百度——先认出是世界的哪一边，再看是哪一处。
     与 feMapFit 同一条式子，只是落在画布的设备像素里，不落在 DOM 上。 */
  var mm=gmMM();if(!mm)return null;
  var A=ERA.act||[],i,lo0=1e9,lo1=-1e9,la0=1e9,la1=-1e9;
  for(i=0;i<A.length;i++){
    lo0=Math.min(lo0,A[i].lo0);lo1=Math.max(lo1,A[i].lo0);
    la0=Math.min(la0,A[i].la); la1=Math.max(la1,A[i].la);
  }
  if(!A.length){lo0=lo1=12;la0=la1=30;}
  var cLo=(lo0+lo1)/2,cLa=(la0+la1)/2;
  var span=Math.max(lo1-lo0,(la1-la0)*gmW/gmH)*1.9+24;
  span=Math.max(200,Math.min(360,span))/Math.max(.7,Math.min(4,GAME.zoom||1));
  var sc=gmW/(span*(mm.w/360));
  /* 面板是一根竖长条，整幅世界图按经度铺进去只占中间一条，上下空着两截。
     在不把这一代的地点挤出画面的前提下，把高度尽量铺满：
     scMax 是「这一代的地点群最少要露出来的经度跨度」定下的上限。 */
  var need=Math.max(24,(lo1-lo0)*1.6+20);
  sc=Math.max(sc,Math.min(gmW/(need*(mm.w/360)),gmH/mm.h));
  var bw=mm.w*sc,bh=mm.h*sc;
  var px=((cLo+180)/360)*bw,py=((mm.laTop-cLa)/(mm.laTop-mm.laBot))*bh;
  var L=gmW/2-px,T=gmH/2-py;
  L=(bw>gmW)?Math.min(0,Math.max(gmW-bw,L)):(gmW-bw)/2;
  T=(bh>gmH)?Math.min(0,Math.max(gmH-bh,T)):(gmH-bh)/2;
  return {mm:mm,L:L,T:T,bw:bw,bh:bh};
}
function gmPX(B,lo){return B.L+((lo+180)/360)*B.bw;}
function gmPY(B,la){return B.T+((B.mm.laTop-la)/(B.mm.laTop-B.mm.laBot))*B.bh;}
function gmapDraw(){
  if(gmW<4){gmapSize();if(gmW<4)return;}
  gmc.clearRect(0,0,gmW,gmH);
  GAME.hit.length=0;
  var B=gmBox();
  if(!B){                                   /* 图还没到：先空着，下一帧再说 */
    gmapDraw._sig='';                       /* 这一帧画的是占位，别把它记成已画好 */
    gmc.fillStyle='rgba(236,236,232,.35)';
    gmc.font=(11*DPR)+'px ui-monospace,Menlo,monospace';
    gmc.fillText('TABVLA…',14*DPR,20*DPR);
    return;
  }
  gmc.imageSmoothingEnabled=false;          /* 马赛克要的就是硬边 */
  gmc.drawImage(FE.mi,B.L,B.T,B.bw,B.bh);
  gmc.textBaseline='middle';
  var A=ERA.act||[],vis=[],i,hovI=-1,hb=52;
  for(i=0;i<A.length;i++){
    var mx=gmPX(B,A[i].lo0),my=gmPY(B,A[i].la);
    if(mx<-20||mx>gmW+20||my<-20||my>gmH+20)continue;
    vis.push({s:A[i],i:i,x:mx,y:my});
  }
  for(i=0;i<vis.length;i++){
    var d0=Math.hypot(GAME.mx-vis[i].x/DPR,GAME.my-vis[i].y/DPR);
    if(d0<hb){hb=d0;hovI=vis[i].i;}
  }
  var boxes=[];
  function coll(b){for(var k=0;k<boxes.length;k++){var o=boxes[k];
    if(b.x0<o.x1&&b.x1>o.x0&&b.y0<o.y1&&b.y1>o.y0)return true;}return false;}
  var prev=GAME.lblPrev||{},shown={};
  vis.sort(function(a,b){return (prev[b.s.n]?1:0)-(prev[a.s.n]?1:0);});
  for(var vj=0;vj<vis.length;vj++){
    var V=vis[vj],st=V.s,mx2=V.x,my2=V.y,hov=V.i===hovI;
    /* 底图是浅色的马赛克，点位得压得住：先一枚深底方砖，再一点金心 */
    var ms=(hov?9:7)*DPR;
    gmc.fillStyle='rgba(24,18,10,.82)';
    gmc.fillRect(mx2-ms/2,my2-ms/2,ms,ms);
    gmc.fillStyle=hov?'rgba(255,222,150,1)':'rgba(240,208,132,.95)';
    gmc.fillRect(mx2-ms/4,my2-ms/4,ms/2,ms/2);
    if(GAME.dest===st.n){
      var pu=1+.18*Math.sin(performance.now()*.004);
      gmc.strokeStyle='rgba(196,120,40,.95)';gmc.lineWidth=1.6*DPR;
      gmc.beginPath();gmc.arc(mx2,my2,12*DPR*pu,0,Math.PI*2);gmc.stroke();
    }else if(hov){
      gmc.strokeStyle='rgba(196,120,40,.8)';gmc.lineWidth=1;
      gmc.beginPath();gmc.arc(mx2,my2,11*DPR,0,Math.PI*2);gmc.stroke();
    }
    gmc.font=(9*DPR)+'px ui-monospace,Menlo,monospace';
    /* 同一座城里的几处地方，在这个尺度上几乎落在同一点。照实叠着画就只看得见最后一枚。
       撞上了就把牌子往下挪一格，最多挪四格；再挪不开的那一处只留点，不留牌。 */
    var lw=gmc.measureText(st.n).width,off=0,bx=null,tr;
    for(tr=0;tr<5;tr++){
      off=tr*20*DPR;
      bx={x0:mx2+9*DPR,y0:my2-9*DPR+off,x1:mx2+15*DPR+lw,y1:my2+16*DPR+off};
      if(hov||!coll(bx))break;
      bx=null;
    }
    if(bx){
      boxes.push(bx);
      if(off>1){                               /* 挪开了就拉一条细线回真正的那一点 */
        gmc.strokeStyle='rgba(24,18,10,.5)';gmc.lineWidth=1;
        gmc.beginPath();gmc.moveTo(mx2+2*DPR,my2);gmc.lineTo(bx.x0,my2+off);gmc.stroke();
      }
      /* 浅底上写字要垫一层，不然金字压在金砖上读不出来 */
      gmc.fillStyle='rgba(24,18,10,.78)';
      gmc.fillRect(bx.x0,bx.y0,bx.x1-bx.x0,bx.y1-bx.y0);
      gmc.fillStyle=hov?'rgba(255,236,190,1)':'rgba(240,234,220,.92)';
      gmc.fillText(st.n,mx2+13*DPR,my2-1*DPR+off);
      gmc.fillStyle=hov?'rgba(255,208,104,.95)':'rgba(206,198,178,.8)';
      gmc.font=(8*DPR)+'px ui-monospace,Menlo,monospace';
      gmc.fillText(st.cn,mx2+13*DPR,my2+10*DPR+off);
      shown[st.n]=1;
      GAME.hit.push({x:mx2/DPR,y:my2/DPR,i:V.i,
        b:{x0:bx.x0/DPR-4,y0:bx.y0/DPR-2,x1:bx.x1/DPR+4,y1:bx.y1/DPR+2}});
      continue;
    }
    GAME.hit.push({x:mx2/DPR,y:my2/DPR,i:V.i});
  }
  GAME.lblPrev=shown;
  try{window.__MAPHIT=GAME.hit;}catch(_){}   /* 可观测：测试用命中表 */
}"""

# ── ⑤ 存档缩略窗：同一幅平铺图 ────────────────────────────────────────────
THUMB_NEW = """function railMapThumb(){
  /* 缩略窗里原来另画一颗完整的粒子地球。地球撤了，这里改画同一幅马赛克世界图，
     整幅塞进窗里（不裁、不拉），再点上这一代的地点。 */
  var c=document.querySelector('#arrMap .mmap');if(!c)return;
  var g=c.getContext('2d');if(!g)return;
  var W=c.width,H=c.height;
  if(!(W>1)||!(H>1))return;
  var mm=gmMM();if(!mm)return;
  /* 这一枚每 0.7 秒被叫一次。画布再小，一变也要整页重来一遍滤镜与毛玻璃——
     实测就是那一下 40 毫秒的顿。图是死的，没变就别动它。 */
  var A0=ERA.act||[];
  var sig=[W,H,GAME.dest||'',A0.length,(A0[0]&&A0[0].n)||''].join('|');
  if(c._sig===sig)return;
  c._sig=sig;
  g.clearRect(0,0,W,H);
  var sc=Math.min(W/mm.w,H/mm.h),bw=mm.w*sc,bh=mm.h*sc;
  var L=(W-bw)/2,T=(H-bh)/2;
  g.imageSmoothingEnabled=false;
  g.drawImage(FE.mi,L,T,bw,bh);
  var A=ERA.act||[];
  for(var i=0;i<A.length;i++){
    var x=L+((A[i].lo0+180)/360)*bw,y=T+((mm.laTop-A[i].la)/(mm.laTop-mm.laBot))*bh;
    g.fillStyle=(GAME.dest===A[i].n)?'rgba(226,110,40,.95)':'rgba(24,18,10,.8)';
    g.fillRect(x-1.5,y-1.5,3,3);
  }
}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if MARK in s:
        print('瘦身早已打过，跳过。')
        return
    n = [0]

    def sub(name, old, new, cnt=1):
        if s0[0].count(old) != cnt:
            sys.exit('锚点 %s 该有 %d 处，实际 %d 处，停手。'
                     % (name, cnt, s0[0].count(old)))
        s0[0] = s0[0].replace(old, new, cnt)
        n[0] += cnt

    s0 = [s]

    # ① 三维天下整层停用
    sub('三维加载器',
        "  try{if(localStorage.getItem('zj3d_off')==='1'){window.__ZJ3D_OFF__=true;return;}}catch(e){}",
        "  " + MARK + """
  /* 这一层画的是周秦八城，是上一张卡的东西。这一张四十一代、没有固定主角，
     那八座城一代也对不上，一格都用不着；而它每次开页都要装 three.js 800 KB、
     两台引擎 716 KB，装完在内存里常驻一百九十六兆。整层不装。
     要请回来：把下面这一行 return 去掉，并把 core/three-bundle.min.js、
     core/vendor/three/build/chunks/9d717bc0/{36411d0a880f,1aa613ec934b,8e2ad10c77b4}.js
     与 core/res/data/st/ 一并取回。 */
  window.__ZJ3D_OFF__=true;return;""")

    # 三维那一格不再自己展开；面板与那一列钮一并收起
    sub('对局默认展开三维',
        "  if(!GAME.txOpen){GAME.txOpen=true;gEl.classList.add('txOpen');",
        "  if(false){GAME.txOpen=true;gEl.classList.add('txOpen');")
    sub('三维那一轮的守卫',
        "function zj3dTick(){\n  try{\n    if(!GAME.txOpen)return;",
        "function zj3dTick(){\n  try{\n"
        "    /* 三维那一层停用了。这里再挡一道：存档里带着旧的展开档位、\n"
        "       或是别处把 txOpen 打开，都不该把资材包与现代城的点云拉起来。 */\n"
        "    if(window.__ZJ3D_OFF__)return;\n"
        "    if(!GAME.txOpen)return;")
    sub('三维面板收起',
        '#menu #mosCv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;',
        '/* 三维天下整层停用，面板与那一列钮一并收起，免得对局屏上留一块空框 */\n'
        '#pnTx,.g3dRail{display:none!important}\n'
        '#menu #mosCv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;')

    # ② 粒子地球
    a = s0[0].find('var LAND_B64="')
    b = s0[0].find('\n})();\n', s0[0].find('var LANDPTS=[],LINKS=[],GEO=[];'))
    if a < 0 or b < 0 or b < a:
        sys.exit('地球那一整块的头尾对不上，停手。')
    s0[0] = s0[0][:a] + GLOBE_NEW + s0[0][b + len('\n})();'):]
    n[0] += 1

    # ③ menuDraw
    i, j = body(s0[0], 'function menuDraw(){')
    s0[0] = s0[0][:i] + MENUDRAW_NEW + s0[0][j:]
    n[0] += 1

    # ④ 对局屏的地图
    i, j = body(s0[0], 'function gmapDraw(){')
    # 把函数上头那一行旧注释一并换掉
    old_cmt = "/* half-globe map: the sphere hangs off the panel's left edge; drag to roll it */\n"
    if s0[0][i - len(old_cmt):i] == old_cmt:
        i -= len(old_cmt)
    s0[0] = s0[0][:i] + GMAP_NEW + s0[0][j:]
    n[0] += 1
    sub('地图面板的副题', '&nbsp;·&nbsp;地图&nbsp;&nbsp;—&nbsp;&nbsp;拖动旋转',
        '&nbsp;·&nbsp;地图&nbsp;&nbsp;—&nbsp;&nbsp;滚轮缩放')

    # ⑤ 存档缩略窗
    i, j = body(s0[0], 'function railMapThumb(){')
    s0[0] = s0[0][:i] + THUMB_NEW + s0[0][j:]
    n[0] += 1

    # ⑥ 地点表改由这一代的资料出（原来那一份 SITES 是上一张卡的周秦城池）
    sub('地点表',
        "  if(!ERA.act.length)ERA.act=buildActs((ERA.year==null?-221:ERA.year));",
        """  /* 地图上挂哪些地方，由这一代自己的资料说了算。
     原来走的是 SITES —— 那是上一张卡的周秦城池表，四十一代里对得上的只有一代。 */
  var _fl=null;try{_fl=(FE&&FE.era&&FE.era.locs)||null;}catch(_){}
  if(_fl&&_fl.length){
    var _rad=Math.PI/180;
    ERA.act=_fl.map(function(L,i){
      return {n:L.n,cn:L.cn,la:L.la,lo0:L.lo,d:L.d,
              cl:Math.cos(L.la*_rad),sy:Math.sin(L.la*_rad),lo:L.lo*_rad,delay:i*90};});
  }else if(!ERA.act.length)ERA.act=buildActs((ERA.year==null?-221:ERA.year));""")

    # ⑫ 对局屏的山：只画一次，不再每帧重画
    #    实测（1280×800）对局屏只有 16 帧，最长一帧 122 毫秒。逐项摘下来看：
    #      原样 15.9 ／ 去掉 html.lux 那道滤镜 23.2 ／ 去掉全部毛玻璃 31.6
    #      两个都去 60.2 ／ 只把 #gTerr 这一张画布藏起来 58.4
    #    最后一条是关键：画布照画，只是不显示，帧率就回来了——
    #    所以吃掉四十多帧的不是画山的那点算术，是「铺满视口的画布每帧都在变」。
    #    根元素上挂着 html.lux 的 invert+hue-rotate，页面里还有二十处毛玻璃；
    #    背景只要动一个像素，整页的滤镜和每一块毛玻璃就得全部重算一遍。
    #    山本来就只是往前漂那么一点，静止与漂移肉眼分不出来。改成只画一次。
    sub('对局屏的山',
        """function gTerrDraw(t){
  var c=document.getElementById('gTerr');if(!c)return;
  if(c.width!==tc.width||c.height!==tc.height){c.width=tc.width;c.height=tc.height;}
  var g=c.getContext('2d');if(!g)return;""",
        """function gTerrDraw(t){
  var c=document.getElementById('gTerr');if(!c)return;
  /* 只画一次：进对局画一次，视口变了再画一次。
     原本每帧重画，为的是那一点几乎看不出来的前移；可这是一张铺满视口的画布，
     它一变，根元素那道 invert+hue-rotate 与页面里二十处毛玻璃就得全部重算。
     实测就为这点漂移，对局屏从满帧掉到十六帧。要把漂移请回来，删掉下面这一行 return。 */
  if(c._painted&&c.width===tc.width&&c.height===tc.height)return;
  if(c.width!==tc.width||c.height!==tc.height){c.width=tc.width;c.height=tc.height;}
  var g=c.getContext('2d');if(!g)return;
  if(c.width>1&&c.height>1)c._painted=1;    /* 尺寸还没定就别记成画过了 */""")

    # ⑬ 地图面板：画面没变就不重画（同一个道理）
    sub('地图面板的重画闸',
        """function gmapDraw(){
  if(gmW<4){gmapSize();if(gmW<4)return;}
  gmc.clearRect(0,0,gmW,gmH);
  GAME.hit.length=0;""",
        """function gmapDraw(){
  if(gmW<4){gmapSize();if(gmW<4)return;}
  /* 同 gTerrDraw：这张画布一变，整页的滤镜与毛玻璃就要重算一遍。
     地图是死的，只有指针移动、缩放、换目的地时画面才真的不一样——
     那就只在这几样变了的时候重画，其余帧直接退出。 */
  var sig=[gmW,gmH,GAME.zoom||1,Math.round(GAME.mx),Math.round(GAME.my),
           GAME.dest||'',(ERA.act||[]).length,(ERA.act&&ERA.act[0]&&ERA.act[0].n)||''].join('|');
  if(gmapDraw._sig===sig)return;
  gmapDraw._sig=sig;
  gmc.clearRect(0,0,gmW,gmH);
  GAME.hit.length=0;""")

    # 目的地那一圈原本按时间搏动——一搏动，上面那道闸就形同虚设。改成不动的双圈。
    sub('目的地标记',
        """    if(GAME.dest===st.n){
      var pu=1+.18*Math.sin(performance.now()*.004);
      gmc.strokeStyle='rgba(196,120,40,.95)';gmc.lineWidth=1.6*DPR;
      gmc.beginPath();gmc.arc(mx2,my2,12*DPR*pu,0,Math.PI*2);gmc.stroke();
    }else if(hov){""",
        """    if(GAME.dest===st.n){
      /* 原来这一圈按时间搏动。搏动就意味着这张画布每帧都在变，
         上面那道「没变就不重画」的闸也就白设了。改成不动的双圈，一样认得出来。 */
      gmc.strokeStyle='rgba(196,120,40,.95)';gmc.lineWidth=1.6*DPR;
      gmc.beginPath();gmc.arc(mx2,my2,12*DPR,0,Math.PI*2);gmc.stroke();
      gmc.strokeStyle='rgba(196,120,40,.45)';gmc.lineWidth=1;
      gmc.beginPath();gmc.arc(mx2,my2,17*DPR,0,Math.PI*2);gmc.stroke();
    }else if(hov){""")

    # ⑭ 三维那一枚缩略窗：三维整层停用了，别再每 0.7 秒空画一次
    sub('三维缩略窗',
        "function rail3dThumb(){\n  var c=document.querySelector('#arr3d .m3d');if(!c)return;",
        "function rail3dThumb(){\n"
        "  if(window.__ZJ3D_OFF__)return;   /* 三维整层停用，这一枚连同那一列钮都收起来了 */\n"
        "  var c=document.querySelector('#arr3d .m3d');if(!c)return;")

    # ⑮ 纪年页拨图版：一步一卡的两处，都是「边写边读」逼出来的同步重排
    #    实测（DPR2）连续拨图版：20.7 帧，一半的帧超过 53 毫秒，最长 110 毫秒。
    #    两处毛病：
    #      esThin  在同一个循环里「读一次 getBoundingClientRect、加一次 class」——
    #              class 一加，布局就脏了，下一次读就得当场重排。四十二枚年号，
    #              等于每拨一格逼四十二次同步重排。改成先全读、再全写。
    #      esLayout 每拨一格就给四十二张图版全部重写宽高。真正变的只有两张
    #              （让出去的那张与接手的那张），其余四十张宽高一个像素没动，
    #              可写进 style 就算没变也要重算——那几张还都挂着 mask-image，
    #              重算就得把撕边遮罩重新栅格一遍。改成值没变就不写。
    sub('年号避让·先读后写',
        """function esThin(){
  /* 年号一行挤不下。先把与选中那枚相撞的纪元标记让开——选中的永远优先，
     再从左往右在剩下的纪元标记之间逐个避让。 */
  var k,r,act=null,edge=-1e9;
  for(k=0;k<ES.pips.length;k++)ES.pips[k].classList.remove('hush');
  if(ES.pips[ES.i])act=ES.pips[ES.i].querySelector('b').getBoundingClientRect();
  for(k=0;k<ES.pips.length;k++){
    if(k===ES.i||!ES.pips[k].classList.contains('mark'))continue;
    r=ES.pips[k].querySelector('b').getBoundingClientRect();
    if(act&&r.left<act.right+10&&r.right>act.left-10){ES.pips[k].classList.add('hush');continue;}
    if(r.left<edge+10){ES.pips[k].classList.add('hush');continue;}
    edge=r.right;
  }
}""",
        """function esThin(){
  /* 年号一行挤不下。先把与选中那枚相撞的纪元标记让开——选中的永远优先，
     再从左往右在剩下的纪元标记之间逐个避让。

     读与写必须分开走两趟。原来是一趟里「读一次矩形、加一次 hush」：
     class 一加布局就脏了，下一次读矩形浏览器就得当场把整条年号带重排一遍——
     四十二枚，等于每拨一格逼出四十二次同步重排。实测拨图版因此掉到二十帧。
     现在第一趟只读，第二趟只写，同步重排从四十二次降到一次。 */
  var k,act=null,edge=-1e9,rects=[],hush=[];
  for(k=0;k<ES.pips.length;k++)ES.pips[k].classList.remove('hush');
  for(k=0;k<ES.pips.length;k++){                 /* ① 一口气读完，中间不写任何东西 */
    var bb=ES.pips[k].querySelector('b');
    rects[k]=bb?bb.getBoundingClientRect():null;
  }
  act=rects[ES.i]||null;
  for(k=0;k<ES.pips.length;k++){                 /* ② 只算，仍然不写 */
    if(k===ES.i||!ES.pips[k].classList.contains('mark'))continue;
    var r=rects[k];if(!r)continue;
    if(act&&r.left<act.right+10&&r.right>act.left-10){hush.push(k);continue;}
    if(r.left<edge+10){hush.push(k);continue;}
    edge=r.right;
  }
  for(k=0;k<hush.length;k++)ES.pips[hush[k]].classList.add('hush');   /* ③ 一次写完 */
}""")

    sub('图版宽高·没变就不写',
        """  for(k=0;k<ES.pls.length;k++){
    w=(k===ES.i)?wi:narrow;
    ES.pls[k].style.width=w+'px';
    ES.pls[k].style.height=(k===ES.i?hi:h)+'px';
    if(k<ES.i)before+=w+gap;
  }""",
        """  /* 拨一格，真正换了尺寸的只有两张：让出去的那张与接手的那张。
     其余四十张一个像素没动，可只要写进 style，浏览器就当它变了——
     而这些图版都挂着撕边的 mask-image，一「变」就得把遮罩重新栅格一遍。
     所以值没变就不写。 */
  for(k=0;k<ES.pls.length;k++){
    var el=ES.pls[k];
    w=(k===ES.i)?wi:narrow;
    var hh=(k===ES.i)?hi:h;
    if(el._w!==w){el._w=w;el.style.width=w+'px';}
    if(el._h!==hh){el._h=hh;el.style.height=hh+'px';}
    if(k<ES.i)before+=w+gap;
  }""")

    # ⑯ 图版的 img 一律异步解码，别把解码压在主线程上
    sub('图版异步解码', '''      b.innerHTML='<img alt="">';''',
        '''      b.innerHTML='<img alt="" decoding="async">';''')

    # ⑱ 帧时表：网址后加 ?perf=1 打开
    #    这台机器跑的是软件光栅，量不准别人的机器。把尺子做进页面里，
    #    让实际那台机器自己报数，比在这边猜快得多。
    sub('帧时表', "applyGlass();" + chr(10) + "/* 拉条走过的那一段",
        """applyGlass();
/* 帧时表：网址后面加 ?perf=1 就出现，平时一行代码都不跑。
   报三个数：帧率、最近半秒里最长的一帧、超过 50 毫秒的帧数。
   卡不卡看的是后两个——平均帧率好看而偶尔一帧两百毫秒，手上就是一顿一顿的。 */
if(/[?&]perf=1/.test(location.search))(function(){
  var el=document.createElement('div');
  el.id='perfHud';
  el.style.cssText='position:fixed;left:8px;top:8px;z-index:2147483646;pointer-events:none;'
    +'font:11px/1.5 ui-monospace,Menlo,monospace;color:#0f0;background:rgba(0,0,0,.75);'
    +'padding:5px 8px;white-space:pre;filter:invert(1) hue-rotate(180deg)';
  document.body.appendChild(el);
  var last=performance.now(),acc=[],t0=last;
  (function tick(){
    var t=performance.now();acc.push(t-last);last=t;
    if(t-t0>=500){
      var n=acc.length,sum=0,worst=0,over=0,i;
      for(i=0;i<n;i++){sum+=acc[i];if(acc[i]>worst)worst=acc[i];if(acc[i]>50)over++;}
      var scr='菜单';
      try{scr=GAME.on?'对局屏':(ES.on?'纪年页':((typeof feIsOpen==='function'&&feIsOpen())?'铸局':'菜单'));}catch(_){}
      el.textContent=[scr+'  '+(1000/(sum/n)).toFixed(0)+' fps',
                      '最长一帧 '+worst.toFixed(0)+' ms',
                      '>50ms  '+over+' 帧/半秒'].join(String.fromCharCode(10));
      acc=[];t0=t;
    }
    requestAnimationFrame(tick);
  })();
})();""" + chr(10) + "/* 拉条走过的那一段")

    # ⑲ 情报台那一轮：闲着的时候也在满帧烧机器
    #    用「把 requestAnimationFrame 全部挂钩、按调用点记账」的办法量出来：
    #    对局屏静止不动，三秒里 mvTick 被叫了 180 次，一次不落。它每一帧要做四件事——
    #      getComputedStyle(.gNav)        逼一次样式重算
    #      MV.stage.clientWidth/Height    逼一次布局
    #      mvRailDraw()                   把导轨那张画布整个清掉重画
    #      mvBgDraw()                     二十赫兹把山脉那张画布重画
    #    没人动它的时候，这四件事每一帧算出来的结果一模一样。
    #    可这一页根元素上挂着 invert 滤镜、面板上还有毛玻璃：画布只要重画一次，
    #    整页的滤镜和每一块毛玻璃就得跟着重来一遍。于是「什么都没发生」也在满负荷
    #    烧 GPU——机器发烫就是这么来的，跟帧数高低是两回事。
    #    改法不动任何设计：两张画布各加一道「跟上次画的一模一样就不画」的闸；
    #    整轮在闲着时从每帧一次降到每半秒一次（真在动就立刻回到满帧）。
    #    画面一帧都不少，只是不再为一张没变过的图重画整页。
    sub('导轨画布·没变就不画',
        "function mvRailDraw(){" + NL + "  var c=MV.rail,g=MV.railx;if(!g)return;",
        "function mvRailDraw(){" + NL
        + "  var c=MV.rail,g=MV.railx;if(!g)return;" + NL
        + "  /* 这一条导轨只跟「共几段、停在第几段、拨到哪儿」有关。三样都没变就别重画——" + NL
        + "     重画一次，整页的滤镜与毛玻璃就得重来一遍。 */" + NL
        + "  var _sig=[MV.n,mvWrap(Math.round(MV.pos)),MV.pos.toFixed(3)," + NL
        + "            c.clientWidth,c.clientHeight,Math.min(devicePixelRatio||1,2)].join('|');" + NL
        + "  if(c._sig===_sig)return;" + NL
        + "  c._sig=_sig;")

    sub('山脉画布·没变就不画',
        "function mvBgDraw(now){" + NL + "  if(!MV.bgx)return;" + NL
        + "  var W=MV.bg.width,H=MV.bg.height;if(!(W>1&&H>1))return;",
        "function mvBgDraw(now){" + NL
        + "  if(!MV.bgx)return;" + NL
        + "  var W=MV.bg.width,H=MV.bg.height;if(!(W>1&&H>1))return;" + NL
        + "  /* 山只跟「拨到哪一段」有关。原来还把 now 一起喂进去，于是时间一走它就变，" + NL
        + "     二十赫兹重画一张铺满面板的画布，整页的滤镜与毛玻璃跟着重来二十次。" + NL
        + "     那点随时间的漂移本来也看不出来，去掉；位置变了照旧重画。 */" + NL
        + "  var _sig=[W,H,MV.mode,(MV.mode===2?mvRot():MV.pos).toFixed(2)].join('|');" + NL
        + "  if(MV.bg._sig===_sig)return;" + NL
        + "  MV.bg._sig=_sig;" + NL
        + "  now=0;")

    sub('情报台闲时降频',
        "function mvTick(){" + NL + "  MV.raf=0;" + NL + "  var box=MV.box;" + NL
        + "  if(!box||!MV.stage||!box.parentNode){return;}",
        "function mvTick(){" + NL
        + "  MV.raf=0;" + NL
        + "  var box=MV.box;" + NL
        + "  if(!box||!MV.stage||!box.parentNode){return;}" + NL
        + "  /* 闲着的时候降到每半秒一轮。底下那一套每帧都要读 getComputedStyle" + NL
        + "     （逼一次样式重算）和 clientWidth（逼一次布局），没人动它的时候" + NL
        + "     每帧算出来的结果都一样，纯属白烧。真在动——拖着、正在翻段、" + NL
        + "     尺寸还没定住——立刻回到满帧，一帧都不欠。 */" + NL
        + "  var _mv=MV.drag||MV.tgt!=null||(MV.stableN||0)<3" + NL
        + "        ||Math.abs(MV.pos-Math.round(MV.pos))>.001;" + NL
        + "  if(!_mv){" + NL
        + "    var _n=performance.now();" + NL
        + "    if(_n-(MV._slow||0)<500){MV.raf=requestAnimationFrame(mvTick);return;}" + NL
        + "    MV._slow=_n;" + NL
        + "  }else MV._slow=0;")

    # ㉑ 三张铺满视口的画布，这张卡一张也不显示，却照样按整屏分配
    #    量出来的（1440×900、DPR2）：这张卡的菜单常驻 15 张 canvas 合计 62.2 MB，
    #    其中三张是 2880×1800 的整屏画布，每张 19.8 MB——
    #      #terrain  选局环那一屏的山。这张卡进不去选局环，一笔都没画过。
    #      #menuCv   粒子地球那张。地球已经卸载，menuDraw 也空了，CSS 里还写着 display:none。
    #      #mosCv    马赛克，这一张是真在用的。
    #    另外 mosSet（离屏那张）也是 2880×1800，加起来将近 80 MB 的画布后备存储，
    #    而 Tails 同一屏只有两张、40 MB。
    #    画布一旦取过 2d 上下文并画过，浏览器就会把它挂在显存里；三张整屏的
    #    在视网膜屏上就是实打实的显存压力，挤不下就来回搬——机器发烫、掉帧，
    #    但 cpu 侧的火焰图上什么都看不见（我这台是软件光栅，更是看不出来）。
    #    没人显示的两张不再按整屏分配。#gTerr 原来跟着 #terrain 的尺寸走，
    #    改成按自己的盒子算，画面不受影响。
    sub('对局屏的山·自己量尺寸',
        "  if(c._painted&&c.width===tc.width&&c.height===tc.height)return;" + NL
        + "  if(c.width!==tc.width||c.height!==tc.height){c.width=tc.width;c.height=tc.height;}",
        "  /* 原来这张画布跟着 #terrain 的尺寸走。#terrain 是选局环那一屏的山，" + NL
        + "     这张卡进不去那一屏，那张整屏画布已经不再按视口分配了（见下），" + NL
        + "     所以这里改成按自己的盒子算。 */" + NL
        + "  var _w=Math.round((c.clientWidth||innerWidth)*DPR)," + NL
        + "      _h=Math.round((c.clientHeight||innerHeight)*DPR);" + NL
        + "  if(c._painted&&c.width===_w&&c.height===_h)return;" + NL
        + "  if(c.width!==_w||c.height!==_h){c.width=_w;c.height=_h;}")

    sub('选局环的山·不再按整屏分配',
        "  tc.width=innerWidth*DPR;tc.height=innerHeight*DPR;",
        "  /* #terrain 是选局环那一屏的山。这张卡从菜单直接进纪年页，" + NL
        + "     选局环整屏进不去，这张画布一笔都没画过——可只要按整屏分配，" + NL
        + "     视网膜屏上就是一张 2880×1800、十九兆的后备存储白占着。" + NL
        + "     要把选局环请回来，把这一行换回 tc.width=innerWidth*DPR; 就行。 */" + NL
        + "  if(tc.width!==1){tc.width=1;tc.height=1;}")

    sub('菜单画布·不再按整屏分配',
        "function menuSize(){DPR=Math.min(devicePixelRatio||1,2);" + NL
        + "  var w=Math.round(innerWidth*DPR),h=Math.round(innerHeight*DPR);" + NL
        + "  if(mCv.width===w&&mCv.height===h)return;" + NL
        + "  mW=mCv.width=w;mH=mCv.height=h;menuText();}",
        "function menuSize(){DPR=Math.min(devicePixelRatio||1,2);" + NL
        + "  var w=Math.round(innerWidth*DPR),h=Math.round(innerHeight*DPR);" + NL
        + "  /* mW/mH 照旧记着「本来该多大」——别处（例如进对局时那一次 clearRect）还读它们。" + NL
        + "     但画布本身不再按整屏分配：粒子地球已经卸载、menuDraw 是空的，" + NL
        + "     而 CSS 里这张画布在本卡的每一种状态下都是 display:none。" + NL
        + "     整屏分配等于白占一张 2880×1800、十九兆的后备存储。" + NL
        + "     menuText() 是给粒子标题算点阵的，同样没人用了，一并不跑。 */" + NL
        + "  mW=w;mH=h;" + NL
        + "  if(mCv.width!==1){mCv.width=1;mCv.height=1;}}")

    # ⑪ 版号：换没换到新的一版，看一眼页脚就知道
    #    （每次要上线的改动，把下面这个数字往上加一。）
    sub('版号', 'var BUILD=95;', 'var BUILD=104;')
    sub('页脚落版号',
        "function menuEnter(){MENU.gen=(MENU.gen||0)+1;MENU.exiting=false;MENU.on=true;",
        "function menuEnter(){MENU.gen=(MENU.gen||0)+1;MENU.exiting=false;MENU.on=true;\n"
        "  /* 版号落在页脚。线上到底换没换到新的一版，看一眼就知道，\n"
        "     不必去猜是浏览器缓存还是部署没上。对局屏的招牌上本来就有同一个数。 */\n"
        "  try{if(mfEl&&mfEl.textContent.indexOf('\u00b7B')<0)mfEl.textContent+='  \u00b7B'+BUILD;}catch(_){}")

    # ⑦ 码砖的节奏：照原样，慢慢码
    #    这一段先是被整个撤掉（一帧全出来），又被压到一秒二，两次都改坏了——
    #    砖一块一块码上去本来就是这一屏要看的东西，不是挡在前面的片头。
    #    节奏原样保留，只是把两个时长提成明写的常数，往后要调不必再去翻 mosTick。
    sub('码砖的节奏',
        'var MOS_POP=240, mosSeq=[], mosT0=0, mosRaf=0, mosDPR=1, MOS_B=26;',
        '/* MOS_POP 是单块砖落下的时长，MOS_ALL 是整幅铺满的时长（毫秒）。\n'
        '   这两个数就是码砖的快慢，改它们即可；别的地方不必动。 */\n'
        'var MOS_POP=240, MOS_ALL=5600, mosSeq=[], mosT0=0, mosRaf=0, mosDPR=1, MOS_B=26;')
    sub('码砖的步长',
        '  var el=now-mosT0, step=Math.max(1.4, 5600/mosSeq.length), i, a, done=0, live=[];',
        '  var el=now-mosT0, step=Math.max(1.4, MOS_ALL/mosSeq.length), i, a, done=0, live=[];')

    # ⑧ 图版：条子上一律缩图，只有选中那张换全图
    sub('图版装图',
        """/* 一次只把选中那张前后各六张的图真装上，省得四十二张一起下 */
function esLoad(){
  var k,d,im;
  for(k=0;k<ES.rows.length;k++){
    if(Math.abs(k-ES.i)>6)continue;
    im=ES.pls[k].firstChild;d=ES.rows[k];
    if(im&&!im.getAttribute('src')){im.setAttribute('src',d.src);im.setAttribute('alt',d.t);}
  }
}""",
        """/* 图版四十二张，一张全图解开是 1024×1536×4 ≈ 6 MB。
   原来是「选中那张前后各六张一起上全图」，走一遍四十二张就是两百多兆常驻，
   而且换出去也不放。可条子上那几张只有九十二像素宽，用不着全图。
   现在：条子一律上缩图（t/ 下，四十二张合计四百九十一 KB，可以一直留着），
   只有选中那一张在全图于后台解开之后才换上去——先换会闪一下空白。 */
function esThumb(s){return String(s).replace('/annals/','/annals/t/');}
function esLoad(){
  var k,d,im,th;
  for(k=0;k<ES.rows.length;k++){
    im=ES.pls[k].firstChild;if(!im)continue;
    d=ES.rows[k];th=esThumb(d.src);
    if(im.getAttribute('alt')!==d.t)im.setAttribute('alt',d.t);
    if(k!==ES.i){
      im._want=th;
      if(im.getAttribute('src')!==th)im.setAttribute('src',th);
      continue;
    }
    im._want=d.src;
    if(!im.getAttribute('src'))im.setAttribute('src',th);
    if(im.getAttribute('src')===d.src)continue;
    /* 全图要等手停下来再上。一张 1024×1536 的图解一次约二十毫秒，
       连着拨图版时每拨一格就解一张，光解码就把这一屏拖成二十帧。
       停手两百四十毫秒才上全图：拨的时候一路是缩图（条子上本来就看不出差别），
       停在哪一张，哪一张才换成全图。 */
    clearTimeout(esLoad._t);
    esLoad._t=setTimeout(function(){
      var j=ES.i,img=ES.pls[j]&&ES.pls[j].firstChild,full=ES.rows[j]&&ES.rows[j].src;
      if(!img||!full||img._want!==full||img.getAttribute('src')===full)return;
      var pre=new Image();
      pre.decoding='async';
      pre.onload=function(){
        /* 解好了再换，且换的时候手还停在这一张上 */
        var go=function(){if(img._want===full)img.setAttribute('src',full);};
        if(pre.decode)pre.decode().then(go,go);else go();
      };
      pre.src=full;
    },240);
  }
}""")

    # ⑨ 开始直接进图版那一屏
    sub('开始那一钮',
        "$('#miMiss').addEventListener('pointerup',function(e){e.stopPropagation();lsOpen();});",
        "$('#miMiss').addEventListener('pointerup',function(e){e.stopPropagation();\n"
        "  /* 这张卡只有一条线，中间那一层选线的屏没有意义：开始就是选图版 */\n"
        "  if(typeof esHas==='function'&&esHas(ACTIVE))esOpen(ACTIVE);else lsOpen();});")

    # ⑩ 点选中的那一张图版就是进下一步
    sub('图版点按',
        """      b.addEventListener('pointerup',function(){
        if(ES.moved>ES.dead)return;      /* 这一下是拖，不是点 */
        if(n!==ES.i)esGo(n);             /* 点选中的那张不做事——进局只认 ENGAGE 与回车 */
      });""",
        """      b.addEventListener('pointerup',function(){
        if(ES.moved>ES.dead)return;      /* 这一下是拖，不是点 */
        if(n!==ES.i){esGo(n);return;}    /* 先点选 */
        esEngage();                      /* 再点选中的那一张就是进下一步 */
      });""")

    io.open(DOC, 'w', encoding='utf-8').write(s0[0])
    print('瘦身已打 · 改了 %d 处 · 主文档 %.0f KB' % (n[0], os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
