#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ANNALES · 纪年选择页 —— 往主文档里加一层，排在选局环前面。

流程原来是   菜单 INITIVM → 剧情线 lineSel → 选局环 → dlgOpen → 入局
加完这一层是 菜单 INITIVM → 剧情线 lineSel → 纪年 eraSel → 选局环 → dlgOpen → 入局

接口只动 lsPick() 那一处：剧情线选定后，若该线有纪年图版就先进 eraSel，
没有就照旧直接进选局环——所以没配图的线一点不受影响。

图版数据的取法有先后：卡里的 annals 优先（由 cardbuild.py 注入），
卡里没有就退到本文件写死的那一份。图片本身不内嵌，走 core/res/img/annals/。
"""
import io, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
ANN  = os.path.join(ROOT, 'core/res/img/annals/annals.json')

A_HTML = '</div>\n<canvas id="grain"></canvas>'
A_PICK = '''function lsPick(i){
  var line=LS.order[i];
  lsClose();rebuildRing(line);
  try{$('#lineTg').textContent=LINE_LBL[line]+' ⇄';}catch(_){}
  menuExit();
}'''

# ══════════════════════════ 样式 ══════════════════════════
CSS = '''
<style>
/* ═══════ 纪年 ANNALES ═══════
   与剧情线 lineSel 同一层级、同一套外壳：满屏、不透光、底条在下、说明块在左。
   只有转轴不一样——线是竖排三张，纪年是横排四十二张，所以这里走横向卷轴：
   选中那张按原比例摊开，两边的收成窄条一直排出画外，两端压暗收边。 */
#eraSel{position:fixed;inset:0;z-index:46;display:none;background:rgba(6,6,6,.97);touch-action:none}
#eraSel.on{display:block}

#esReel{position:absolute;left:0;right:0;top:5vh;height:73vh;overflow:hidden;display:flex;align-items:center}
#esReel::before,#esReel::after{content:"";position:absolute;top:0;bottom:0;width:14vw;z-index:4;pointer-events:none}
#esReel::before{left:0;background:linear-gradient(90deg,#060606 0%,rgba(6,6,6,.7) 45%,rgba(6,6,6,0) 100%)}
#esReel::after{right:0;background:linear-gradient(270deg,#060606 0%,rgba(6,6,6,.7) 45%,rgba(6,6,6,0) 100%)}

#esTrack{display:flex;align-items:center;gap:6px;will-change:transform;
  transition:transform 560ms cubic-bezier(.16,1,.3,1)}

/* 边不切齐，但也不是渐隐——是撕口。内部照旧实心，只有边界被噪声啃成毛边，
   深浅不一，像从册子上撕下来的一页。横竖构图各一张遮罩，拉伸铺满。 */
#eraSel .pl{position:relative;flex:0 0 auto;width:92px;height:73vh;background:transparent;
  border:0;padding:0;cursor:pointer;overflow:hidden;
  transition:width 560ms cubic-bezier(.16,1,.3,1),filter 560ms cubic-bezier(.16,1,.3,1);
  filter:brightness(.3) saturate(.45) contrast(1.06);
  -webkit-mask-image:url(/core/res/img/annals/edge-h.png);-webkit-mask-size:100% 100%;
  -webkit-mask-repeat:no-repeat;
          mask-image:url(/core/res/img/annals/edge-h.png);mask-size:100% 100%;mask-repeat:no-repeat}
#eraSel .pl.tall{-webkit-mask-image:url(/core/res/img/annals/edge-v.png);
                         mask-image:url(/core/res/img/annals/edge-v.png)}
/* 关掉图片的原生拖拽：不关的话一按住往边上拖，浏览器就以为你要把图拖走，
   发一个 pointercancel 把我们的拖拽掐断，手感是「拖不动」。 */
#eraSel .pl img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;
  -webkit-user-drag:none;user-select:none;-webkit-user-select:none}
#eraSel{-webkit-user-select:none;user-select:none}
/* 纸面的颗粒，薄薄一层，均匀铺——不参与边缘 */
#eraSel .pl::after{content:"";position:absolute;inset:0;pointer-events:none;mix-blend-mode:overlay;
  opacity:.2;background-size:170px 170px;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'><filter id='t'><feTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3'/></filter><rect width='170' height='170' filter='url(%23t)'/></svg>")}
/* 选中那张的底部暗角：说明文字压在图上，得有这层才读得清 */
#eraSel .pl.on::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(0deg,rgba(6,6,6,.9) 0%,rgba(6,6,6,.55) 15%,rgba(6,6,6,0) 40%)}
#eraSel .pl:hover{filter:brightness(.46) saturate(.6) contrast(1.06)}
#eraSel .pl:focus-visible{outline:1px solid var(--gold);outline-offset:2px}
#eraSel .pl.on{filter:none;cursor:default}

#esMission{position:fixed;top:auto;bottom:26vh;left:6vw;z-index:48;line-height:1;pointer-events:none;
  transition:left 560ms cubic-bezier(.16,1,.3,1),bottom 560ms cubic-bezier(.16,1,.3,1)}
#esMission .m-tag{margin-bottom:10px}
#esMission .m-tag .tag{background:var(--gold);color:#0a0a0a}
#esMission .num{display:inline-block;background:var(--paper);color:#0a0a0a;font-weight:700;
  font-size:clamp(26px,3.4vw,42px);padding:5px 10px 2px;letter-spacing:.06em;font-family:var(--mono)}
#esMission .ttl{margin-top:9px;display:flex;flex-direction:column;align-items:flex-start;gap:5px}
#esMission .ttl span{display:inline-block;background:var(--paper);color:#0a0a0a;font-weight:700;
  font-size:clamp(12px,1.25vw,17px);letter-spacing:.14em;padding:5px 9px 3px}
#esMission .era{margin-top:12px;max-width:44ch;font-size:10px;line-height:1.9;
  letter-spacing:.12em;color:var(--mut)}

/* 纪年轴：上排纪元分段，下排四十二枚菱标，年号只在挤得下的地方露出来 */
#esChron{position:fixed;left:0;right:0;bottom:40px;z-index:48;padding:0 12px 10px}
#esBands{display:flex;width:min(1560px,96vw);margin:0 auto;border-top:1px solid #232320}
#esBands div{box-sizing:border-box;text-align:center;padding:6px 0 4px;font-size:9.5px;letter-spacing:.3em;
  text-indent:.3em;color:var(--mut);border-right:1px solid #232320;font-family:var(--mono);
  transition:color 360ms}
#esBands div:first-child{border-left:1px solid #232320}
#esBands div.live{color:var(--gold-hi)}
#esPips{position:relative;display:flex;width:min(1560px,96vw);margin:0 auto;height:40px;align-items:center}
#esPips::before{content:"";position:absolute;left:0;right:0;top:15px;height:1px;background:#232320}
/* min-width:0 是关键——不写的话 flex 项不会缩到最小内容宽以下，
     年号一长就把整排顶宽，四十二枚累计能溢出三四百像素，跟纪元条对不上。 */
#eraSel .pip{position:relative;flex:1 1 0;min-width:0;height:100%;border:0;background:none;padding:0;
  cursor:pointer;display:flex;flex-direction:column;align-items:center}
#eraSel .pip i{width:4px;height:4px;margin-top:13px;background:#3a3a36;transform:rotate(45deg);
  transition:background 300ms,transform 300ms}
#eraSel .pip:hover i{background:var(--mut);transform:rotate(45deg) scale(1.4)}
#eraSel .pip:focus-visible{outline:1px solid var(--gold);outline-offset:-2px}
#eraSel .pip.on i{background:var(--gold-hi);transform:rotate(45deg) scale(2);
  box-shadow:0 0 9px rgba(236,200,120,.75)}
#eraSel .pip b{position:absolute;top:26px;left:50%;transform:translateX(-50%);
  font-family:var(--mono);font-size:9px;font-weight:400;
  letter-spacing:.04em;color:#3a3a36;opacity:0;white-space:nowrap;transition:opacity 300ms,color 300ms}
#eraSel .pip.mark b{opacity:.85;color:var(--mut)}
#eraSel .pip.mark.hush b{opacity:0}
#eraSel .pip.on b{opacity:1;color:var(--gold-hi)}

#esFoot{position:fixed;left:0;right:0;bottom:0;min-height:40px;z-index:48;
  border-top:1px solid #232320;display:flex;align-items:center;justify-content:space-between;
  padding:0 18px;font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--mut);
  background:rgba(6,6,6,.9)}
#esFoot .go{color:var(--txt);cursor:pointer;display:inline-block;white-space:nowrap;
  padding:9px 14px;margin-left:8px;border:1px solid rgba(201,155,63,.45);background:rgba(201,155,63,.06)}
#esFoot .go:hover{color:var(--gold-hi)}
#esBrand{position:fixed;top:18px;left:18px;z-index:48;font-family:var(--mono);font-size:10px;
  letter-spacing:.2em;color:var(--mut);pointer-events:none}
#esBrand b{color:var(--txt);font-weight:400}

@media (max-width:760px){
  #eraSel .pl{width:40px;height:46vh}
  #esReel{height:46vh;top:7vh}
  #eraSel .pip b{display:none}
  #esFoot .lbl{display:none}
}
</style>
'''

# ══════════════════════════ DOM ══════════════════════════
HTML = '''
<div id="eraSel">
  <div id="esBrand"><b>ANNALES</b>&nbsp;·&nbsp;纪年选择</div>
  <div id="esReel"><div id="esTrack"></div></div>
  <div id="esMission">
    <div class="m-tag"><span class="tag">纪年</span></div>
    <div><span class="num" id="esNum">01</span></div>
    <div class="ttl" id="esTtl"><span></span><span></span></div>
    <div class="era" id="esEra"></div>
  </div>
  <div id="esChron">
    <div id="esBands"></div>
    <div id="esPips"></div>
  </div>
  <div id="esFoot">
    <span>● ANNALES SELECT&nbsp;&nbsp;|&nbsp;&nbsp;<span class="lbl">CLICK / DRAG / ← → TO MOVE</span></span>
    <span class="r"><span class="go" id="esBack">ESC&nbsp;·&nbsp;RETVRN</span><span class="go" id="esGo">ENGAGE&nbsp;⏎</span></span>
  </div>
</div>
'''

# ══════════════════════════ 逻辑 ══════════════════════════
JS_HEAD = '''
/* ═══════════ ANNALES · 纪年选择（横向卷轴） ═══════════
   排在剧情线与选局环之间。数据取自卡的 annals 字段，卡里没有就用 ANNALS_DEF。
   选中那张按本身比例摊开，其余收成窄条；底下一条纪年轴，纪元分段对齐图版顺序。 */
var ANNALS_DEF=__ANN__;
var ES={on:false,i:0,line:null,rows:[],pls:[],pips:[],bands:[]};

function esRows(line){
  var a=(typeof CARDS!=='undefined'&&CARDS&&CARDS[line]&&CARDS[line].annals)||null;
  if(a&&a.length)return a;
  return ANNALS_DEF;
}
function esHas(line){return esRows(line).length>0;}

function esBuild(){
  var tr=$('#esTrack'),bd=$('#esBands'),pp=$('#esPips'),k;
  tr.innerHTML='';bd.innerHTML='';pp.innerHTML='';
  ES.pls=[];ES.pips=[];ES.bands=[];
  for(k=0;k<ES.rows.length;k++){
    (function(n){
      var d=ES.rows[n];
      var b=document.createElement('button');
      b.className='pl';b.type='button';
      b.setAttribute('aria-label',(d.y||'卷首')+' '+d.t);
      b.innerHTML='<img alt="">';
      if((d.r||1.5)<1)b.classList.add('tall');   /* 竖构图换竖的那张撕边遮罩 */
      /* 不要 stopPropagation：它会把窗口上那条清理拖拽状态的监听一起挡掉，
         状态残留到下一次按下，手一动就乱跳。 */
      b.addEventListener('pointerup',function(){
        if(ES.moved>ES.dead)return;      /* 这一下是拖，不是点 */
        if(n!==ES.i)esGo(n);             /* 点选中的那张不做事——进局只认 ENGAGE 与回车 */
      });
      tr.appendChild(b);ES.pls.push(b);
      var p=document.createElement('button');
      p.className='pip'+((n===0||ES.rows[n-1].era!==d.era)?' mark':'');
      p.type='button';p.setAttribute('aria-label',(d.y||'卷首')+' '+d.t);
      p.innerHTML='<i></i><b>'+(d.y||'卷首')+'</b>';
      p.addEventListener('pointerup',function(){esGo(n);});
      pp.appendChild(p);ES.pips.push(p);
    })(k);
  }
  var g=[];
  for(k=0;k<ES.rows.length;k++){
    if(g.length&&g[g.length-1].era===ES.rows[k].era)g[g.length-1].n++;
    else g.push({era:ES.rows[k].era,n:1});
  }
  for(k=0;k<g.length;k++){
    var e=document.createElement('div');
    e.style.flex=g[k].n+' 1 0';e.textContent=g[k].era;
    bd.appendChild(e);g[k].el=e;
  }
  ES.bands=g;
}

/* 一次只把选中那张前后各六张的图真装上，省得四十二张一起下 */
function esLoad(){
  var k,d,im;
  for(k=0;k<ES.rows.length;k++){
    if(Math.abs(k-ES.i)>6)continue;
    im=ES.pls[k].firstChild;d=ES.rows[k];
    if(im&&!im.getAttribute('src')){im.setAttribute('src',d.src);im.setAttribute('alt',d.t);}
  }
}

function esLayout(){
  var reel=$('#esReel'),h=reel.clientHeight||420,narrow=innerWidth<=760?40:92,gap=6;
  var maxW=innerWidth*0.62,before=0,k,w,wi,hi=h;
  /* 选中那张按原图比例给框：宽超出上限时改压高度，不是裁画面。
     所以框的长宽比永远等于原图，object-fit 裁不掉任何东西。 */
  var r=ES.rows[ES.i].r||1.5;
  wi=h*r;
  if(wi>maxW){wi=maxW;hi=maxW/r;}
  for(k=0;k<ES.pls.length;k++){
    w=(k===ES.i)?wi:narrow;
    ES.pls[k].style.width=w+'px';
    ES.pls[k].style.height=(k===ES.i?hi:h)+'px';
    if(k<ES.i)before+=w+gap;
  }
  $('#esTrack').style.transform='translateX('+(-(before+wi/2-reel.clientWidth/2))+'px)';
  /* 说明块压在选中那张的左下角。位置按算出来的宽度推，不读 getBoundingClientRect——
     那一刻卷轴还在过渡里，读回来的是中途值。 */
  var m=$('#esMission'),rr=reel.getBoundingClientRect();
  var pb=rr.top+rr.height/2+hi/2;              /* 选中那张的下沿（卷轴纵向居中） */
  if(innerWidth>760){
    m.style.left=Math.round(rr.left+rr.width/2-wi/2+26)+'px';
    m.style.bottom=Math.round(innerHeight-pb+24)+'px';
  }else{
    m.style.left='12px';m.style.bottom=Math.round(innerHeight-pb+14)+'px';
  }
}

function esThin(){
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
}

function esRender(){
  var d=ES.rows[ES.i],k;
  for(k=0;k<ES.pls.length;k++)ES.pls[k].classList.toggle('on',k===ES.i);
  for(k=0;k<ES.pips.length;k++)ES.pips[k].classList.toggle('on',k===ES.i);
  for(k=0;k<ES.bands.length;k++)ES.bands[k].el.classList.toggle('live',ES.bands[k].era===d.era);
  $('#esNum').textContent=(ES.i<9?'0':'')+(ES.i+1);
  var t=$('#esTtl');t.innerHTML='';
  var a=document.createElement('span');a.textContent=d.t;t.appendChild(a);
  if(d.y){var b=document.createElement('span');b.textContent=d.y;t.appendChild(b);}
  $('#esEra').textContent=d.s||'';
  esLoad();esLayout();esThin();
}
function esGo(n){
  if(n<0)n=0;if(n>ES.rows.length-1)n=ES.rows.length-1;
  ES.i=n;esRender();
}
function esOpen(line){
  ES.line=line;ES.rows=esRows(line);ES.i=0;
  esBuild();$('#eraSel').classList.add('on');ES.on=true;
  esRender();setTimeout(function(){esLayout();esThin();},60);
}
function esClose(){ES.on=false;$('#eraSel').classList.remove('on');}
function esEngage(){
  if(!ES.on)return;
  var d=ES.rows[ES.i];
  try{ERA.sel=null;if(typeof d.ys==='number')ERA.year=d.ys;}catch(_){}
  esClose();rebuildRing(ES.line);menuExit();
}
function esBackToLines(){esClose();lsOpen();}

(function(){
  /* 换图只认三样：点一下、方向键、按住拖。
     滚轮一概不接——触控板两指轻轻一动就发 wheel，手还没停就翻过去好几张。
     按下之后还有一道死区，没走满 ES.dead 像素就当没动，挡住点击时的手抖。 */
  var el=$('#eraSel'),STEP=150;
  ES.dead=14;ES.drag=null;ES.moved=0;
  el.addEventListener('pointerdown',function(e){
    if(e.button!==undefined&&e.button!==0)return;          /* 只认左键 */
    if(e.target.closest&&(e.target.closest('#esFoot')||e.target.closest('#esChron')))return;
    ES.drag={x:e.clientX,i:ES.i,live:false};ES.moved=0;
  });
  /* 移动与抬起挂在窗口上：拖到画外再松手也收得回来 */
  addEventListener('pointermove',function(e){
    var d=ES.drag;if(!d)return;
    ES.moved=Math.max(ES.moved,Math.abs(e.clientX-d.x));
    if(!d.live){
      if(ES.moved<ES.dead)return;
      d.live=true;d.x=e.clientX;return;                     /* 从越过死区那一点重新起算 */
    }
    var step=Math.round((d.x-e.clientX)/STEP);
    if(d.i+step!==ES.i)esGo(d.i+step);
  });
  function up(){ES.drag=null;setTimeout(function(){ES.moved=0;},0);}
  addEventListener('pointerup',up);addEventListener('pointercancel',up);
  addEventListener('keydown',function(e){
    if(!ES.on)return;
    var k=e.key;
    if(k==='ArrowRight'||k==='d'||k==='D'){esGo(ES.i+1);e.preventDefault();}
    else if(k==='ArrowLeft'||k==='a'||k==='A'){esGo(ES.i-1);e.preventDefault();}
    else if(k==='Home'){esGo(0);e.preventDefault();}
    else if(k==='End'){esGo(ES.rows.length-1);e.preventDefault();}
    else if(k==='Enter'){esEngage();e.preventDefault();}
    else if(k==='Escape'){esBackToLines();e.preventDefault();}
  });
  addEventListener('resize',function(){if(ES.on){esLayout();esThin();}});
  $('#esGo').addEventListener('pointerup',function(){esEngage();});
  $('#esBack').addEventListener('pointerup',function(){esBackToLines();});
})();
'''

PICK_NEW = '''function lsPick(i){
  var line=LS.order[i];
  try{$('#lineTg').textContent=LINE_LBL[line]+' ⇄';}catch(_){}
  /* 有纪年图版的线，先过 ANNALES 这一层；没有的照旧直入选局环 */
  if(typeof esHas==='function'&&esHas(line)){lsClose();esOpen(line);return;}
  lsClose();rebuildRing(line);
  menuExit();
}'''


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if '#eraSel' in s:
        sys.exit('主文档里已经有 ANNALES 这一层了，没有重复打。')
    for nm, a in (('DOM', A_HTML), ('lsPick', A_PICK)):
        if s.count(a) != 1:
            sys.exit('锚点 %s 不是唯一的（%d 处），停手。' % (nm, s.count(a)))

    rows = json.load(io.open(ANN, encoding='utf-8'))
    for _r in rows:
        _r['src'] = '/' + _r['src'].lstrip('/')
    js = JS_HEAD.replace('__ANN__', json.dumps(rows, ensure_ascii=False, separators=(',', ':')))

    # 注意顺序：先闭合 #lineSel，纪年层才是它的兄弟节点而不是子节点
    s = s.replace(A_HTML, '</div>\n' + CSS + HTML + '<canvas id="grain"></canvas>', 1)
    s = s.replace(A_PICK, js + PICK_NEW, 1)

    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('已注入：图版 %d 幅 · 主文档 %.0f KB' % (len(rows), os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
