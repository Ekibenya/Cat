#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""菜单页：奶油纸底 + 罗马马赛克（世界地图 · 猫首 · FELINIA）逐块砌出，四周围一圈边框。

三层砖：
  边框  沿视口四周两排，按当前窗口实时算，砖从 border.png 里随机取——窗口多宽都围得住
  图案  世界地图 + 猫首 + 标题，烤在 emblem.png 上，等比缩放居中摆进边框内
  颗粒  拼完淡入一层 riso 噪点

粒子地球（`#menu.era`，自定义开局选年代那一屏）原样留着，进那个模式时这一层自动收起。
"""
import io, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
EMB  = os.path.join(ROOT, 'core/res/img/annals/emblem.json')

A_CSS = '#menu{position:fixed;inset:0;z-index:40;background:var(--ink);opacity:0;'
A_DOM = '<div id="menu">\n  <canvas id="menuCv"></canvas>'
A_JS  = 'var MENU={on:false,exiting:false,t0:0};'
A_ENT = 'function menuEnter(){MENU.gen=(MENU.gen||0)+1;MENU.exiting=false;MENU.on=true;MENU.t0=performance.now();menuScatter();'
A_EXT = 'function menuExit(){\n  if(MENU.exiting)return;MENU.exiting=true;'

CSS = '''
/* ═══════ 菜单：奶油纸 + 罗马马赛克 ═══════
   选择器一律带 #menu:not(.era):not(.gbg)——原有的 #menu 规则排在本段之后，
   权重不压过去就会被盖回黑底；#mosCv 的 transform 同理，要盖掉 #menu canvas 那条。 */
:root{--cream:#f0eadc}
#menu:not(.era):not(.gbg){background:var(--cream)}
#menu:not(.era):not(.gbg) #menuCv{display:none}
#menu:not(.era):not(.gbg)::before{content:"";position:absolute;inset:0;pointer-events:none;
  opacity:.13;mix-blend-mode:multiply;z-index:1;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/></filter><rect width='260' height='260' filter='url(%23p)' opacity='.5'/></svg>");
  background-size:260px 260px}
#menu #mosCv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;
  transform:translateZ(0)}
#menu.era #mosCv,#menu.gbg #mosCv{display:none}
#menu #mosRiso{position:absolute;inset:0;pointer-events:none;z-index:2;
  opacity:0;transition:opacity 1.1s ease;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2'/></filter><rect width='180' height='180' filter='url(%23g)'/></svg>");
  background-size:180px 180px}
#menu #mosRiso.on{opacity:.2}
#menu.era #mosRiso,#menu.gbg #mosRiso{display:none}
#menu:not(.era):not(.gbg) .mItems{top:auto;bottom:104px;transform:translateX(-50%);z-index:3}
#menu:not(.era):not(.gbg) .mItem{color:#4a4237}
#menu:not(.era):not(.gbg) .mItem i{color:#9a742a}
#menu:not(.era):not(.gbg) .mItem:hover{color:#1f1a13;border-color:rgba(154,116,42,.55);
  background:rgba(255,255,255,.45);text-shadow:none}
#menu:not(.era):not(.gbg) .mFoot{color:#a09684;z-index:3;bottom:68px}
#menu:not(.era):not(.gbg) #luxTg{color:#4a4237;border-color:rgba(74,66,55,.35)}
#menu:not(.era):not(.gbg) #luxTg:hover{border-color:#9a742a}
'''

DOM = '''<div id="menu">
  <canvas id="menuCv"></canvas>
  <canvas id="mosCv"></canvas>
  <div id="mosRiso"></div>'''

JS = r'''
/* ═══════════ 菜单的罗马马赛克 ═══════════
   边框按视口实时排；图案等比缩放摆进边框内。已落位的砖画进离屏画布，
   每帧只重绘正在飞的那几十块——三千块也满帧。 */
var MOS=__MOS__;
var mosCv=$('#mosCv'), mosG=mosCv&&mosCv.getContext('2d');
var mosArt=new Image(), mosBd=new Image(), mosLoaded=0;
var mosSet=document.createElement('canvas'), mosSG=mosSet.getContext('2d');
var MOS_POP=240, mosSeq=[], mosT0=0, mosRaf=0, mosDPR=1, MOS_B=26;

function mosFit(){
  if(!mosCv)return;
  var vw=innerWidth, vh=innerHeight;
  mosDPR=Math.min(devicePixelRatio||1,2);
  mosCv.width=Math.round(vw*mosDPR); mosCv.height=Math.round(vh*mosDPR);
  mosSet.width=mosCv.width; mosSet.height=mosCv.height;
  var B=MOS_B, cols=Math.max(8,Math.floor(vw/B)), rows=Math.max(8,Math.floor(vh/B));
  var bx=(vw-cols*B)/2, by=(vh-rows*B)/2;
  var ring=[],seen={},k,r,c;
  function add(c,r){var key=c+','+r; if(seen[key])return; seen[key]=1;
    ring.push([bx+c*B,by+r*B,B,B,(c*7+r*13)%96]);}
  for(c=0;c<cols;c++){add(c,0);add(c,1);}
  for(r=2;r<rows-2;r++){add(cols-1,r);add(cols-2,r);}
  for(c=cols-1;c>=0;c--){add(c,rows-1);add(c,rows-2);}
  for(r=rows-3;r>=2;r--){add(0,r);add(1,r);}
  var padX=2*B+22, padTop=2*B+18, padBot=2*B+Math.max(96,vh*0.14);
  var aw=vw-padX*2, ah=vh-padTop-padBot;
  var sc=Math.min(aw/MOS.w, ah/MOS.h);
  var ox=(vw-MOS.w*sc)/2, oy=padTop+(ah-MOS.h*sc)/2;
  mosSeq=[];
  for(k=0;k<ring.length;k++) mosSeq.push([0,ring[k][0],ring[k][1],ring[k][2],ring[k][3],ring[k][4],0]);
  for(k=0;k<MOS.cells.length;k++){
    var q=MOS.cells[k];
    mosSeq.push([1,ox+q[0]*sc,oy+q[1]*sc,q[2]*sc,q[3]*sc,k,0]);
  }
}
function mosDraw(i,g,p){
  var e=mosSeq[i], D=mosDPR;
  g.save();
  if(p<1){var t=1-Math.pow(1-p,3),s=0.35+0.65*t,rt=(1-t)*0.5*(i%2?1:-1);
    g.globalAlpha=Math.min(1,t*1.6);
    g.translate((e[1]+e[3]/2)*D,(e[2]+e[4]/2)*D); g.rotate(rt); g.scale(s,s);
    g.translate(-(e[3]/2)*D,-(e[4]/2)*D);
  }else g.translate(e[1]*D,e[2]*D);
  if(e[0]===0){var si=e[5],sx=(si%12)*40,sy=((si/12)|0)*40;
    g.drawImage(mosBd,sx,sy,40,40,0,0,e[3]*D,e[4]*D);}
  else{var q=MOS.cells[e[5]];
    g.drawImage(mosArt,q[0],q[1],q[2],q[3],0,0,e[3]*D,e[4]*D);}
  g.restore();
}
function mosStart(){
  if(mosLoaded<2||!mosG)return;
  mosFit();
  mosSG.clearRect(0,0,mosSet.width,mosSet.height);
  mosG.clearRect(0,0,mosCv.width,mosCv.height);
  $('#mosRiso').classList.remove('on');
  mosT0=performance.now(); cancelAnimationFrame(mosRaf); mosRaf=requestAnimationFrame(mosTick);
}
function mosStop(){cancelAnimationFrame(mosRaf);mosRaf=0;}
function mosTick(now){
  var el=now-mosT0, step=Math.max(1.4, 5600/mosSeq.length), i, a, done=0, live=[];
  for(i=0;i<mosSeq.length;i++){
    a=el-i*step;
    if(a<=0)break;
    if(a>=MOS_POP){ if(!mosSeq[i][6]){mosDraw(i,mosSG,1);mosSeq[i][6]=1;} done++; }
    else live.push([i,a/MOS_POP]);
  }
  mosG.clearRect(0,0,mosCv.width,mosCv.height);
  mosG.drawImage(mosSet,0,0);
  for(i=0;i<live.length;i++) mosDraw(live[i][0],mosG,live[i][1]);
  if(done<mosSeq.length)mosRaf=requestAnimationFrame(mosTick);
  else{mosRaf=0;$('#mosRiso').classList.add('on');}
}
if(mosCv){
  mosArt.onload=mosBd.onload=function(){ if(++mosLoaded>=2 && MENU.on) mosStart(); };
  mosArt.src='/core/res/img/annals/emblem.png';
  mosBd.src='/core/res/img/annals/border.png';
  addEventListener('resize',function(){
    if(!MENU.on||mosLoaded<2)return;
    var wasDone=(mosRaf===0);
    mosFit();
    if(wasDone){
      mosSG.clearRect(0,0,mosSet.width,mosSet.height);
      for(var i=0;i<mosSeq.length;i++){mosDraw(i,mosSG,1);mosSeq[i][6]=1;}
      mosG.clearRect(0,0,mosCv.width,mosCv.height); mosG.drawImage(mosSet,0,0);
    }else mosStart();
  });
}
'''


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if '#mosCv' in s:
        sys.exit('主文档里已经有菜单马赛克了，没有重复打。')
    for nm, a in (('CSS', A_CSS), ('DOM', A_DOM), ('JS', A_JS),
                  ('menuEnter', A_ENT), ('menuExit', A_EXT)):
        if s.count(a) != 1:
            sys.exit('锚点 %s 不是唯一的（%d 处），停手。' % (nm, s.count(a)))

    d = json.load(io.open(EMB, encoding='utf-8'))
    mos = json.dumps({'w': d['w'], 'h': d['h'], 'cells': d['cells']}, separators=(',', ':'))

    s = s.replace(A_CSS, CSS + A_CSS, 1)
    s = s.replace(A_DOM, DOM, 1)
    s = s.replace(A_JS, A_JS + JS.replace('__MOS__', mos), 1)
    s = s.replace(A_ENT, A_ENT + 'mosStart();', 1)
    s = s.replace(A_EXT, A_EXT + 'mosStop();', 1)

    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('菜单马赛克已注入：图案 %d 块 + 视口边框 · 主文档 %.0f KB'
          % (len(d['cells']), os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
