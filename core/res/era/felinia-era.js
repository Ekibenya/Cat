/* 纪年简介弹窗。
   点一张图版，先摊开这一代是什么，再让人决定进不进。
   原来是点第二下直接落进四步，玩家在纪年轴上只看得见一张图和一行小字。

   **一个新样式都不写。** 用的是卡里现成的那一套弹窗：
     .gDlg          遮罩、居中、mvFade 淡入
     .gDlg .box     毛玻璃、边框、投影、mvRise 抬升（延后 60ms）
     .tag / h2 /.sub  眉标、标题、小字
     .eBtn          按钮，和「离开棋局？」那几个是同一个
   连「面板透明度」那根拉杆也照旧管得着 —— applyGlass 里本来就写着 .gDlg .box。

   资料取自 core/res/data/felinia/eras.json，由 feLoadPublic 递过来。
   取不着也照旧能用：只摆纪年轴上本来就有的那几行，按钮照旧能进。 */
(function(){
  'use strict';

  var B=null, ST={ok:null, no:null, eras:null, row:null};

  function esc(t){return String(t==null?'':t)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function build(){
    if(B)return B;
    B=document.createElement('div');
    B.className='gDlg';B.id='dlgEra';B.style.zIndex='88';
    B.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="erTtl"'
      +' style="max-width:min(calc(94vw/var(--ui)),640px)">'
      +'<span class="tag">ANNALES</span>'
      +'<h2 id="erTtl"></h2>'
      +'<div class="sub" id="erYr"></div>'
      +'<div class="sub" id="erLead" style="font-size:11.5px;line-height:2.15;'
      +'letter-spacing:.06em;color:#35342b;margin-top:16px"></div>'
      +'<dl id="erDl" style="margin:18px 0 0;display:grid;'
      +'grid-template-columns:auto 1fr;gap:8px 16px;align-items:baseline"></dl>'
      +'<div style="display:flex;gap:14px;margin-top:26px">'
      +'<span class="eBtn" id="erNo">RETVRN&nbsp;取消</span>'
      +'<span class="eBtn" id="erGo" style="flex:1;text-align:center">PERGERE&nbsp;进入该时代</span>'
      +'</div></div>';
    document.body.appendChild(B);
    B.querySelector('#erNo').addEventListener('click',function(){close(0);});
    B.querySelector('#erGo').addEventListener('click',function(){close(1);});
    /* 点遮罩＝取消。点到盒子里不算。 */
    B.addEventListener('click',function(e){if(e.target===B)close(0);});
    document.addEventListener('keydown',function(e){
      if(B.style.display!=='flex')return;
      if(e.key==='Escape'){e.preventDefault();close(0);}
      else if(e.key==='Enter'){e.preventDefault();close(1);}
    },true);
    return B;
  }

  function close(go){
    if(!B)return;
    var ok=ST.ok,no=ST.no;ST.ok=ST.no=ST.row=null;
    B.style.display='none';
    try{ if(go){ if(ok)ok(); } else if(no)no(); }catch(_){}
  }

  function eraOf(i){
    var a=ST.eras;if(!a)return null;
    for(var k=0;k<a.length;k++)if(a[k].i===i)return a[k];
    return null;
  }

  function fill(row, era){
    B.querySelector('#erTtl').textContent=row.t||(era&&era.t)||'';
    B.querySelector('#erYr').textContent=
      [(row.y||(era&&era.yl)||''),(row.era||(era&&era.age)||''),(era&&era.reg)||'']
      .filter(Boolean).join('　·　');
    B.querySelector('#erLead').textContent=(era&&era.w)||row.s||'';
    var dl=[];
    function put(k,v){ if(v)dl.push(
      '<dt class="sub" style="line-height:1.7;white-space:nowrap">'+esc(k)+'</dt>'
      +'<dd style="margin:0;font-size:11.5px;line-height:1.9;letter-spacing:.05em;color:#35342b">'
      +esc(v)+'</dd>'); }
    if(era){
      put('在场的制度',(era.inst||[]).join('、'));
      put('取名法',era.nm);
      put('能落脚的地方',(era.locs||[]).map(function(L){
        return L.cn+'（'+L.n+'）';}).join('　'));
      put('身上穿的',(era.dress||[]).slice(0,6).join('、'));
      var f=(era.figs||[]).length;
      if(f)put('在册的人', f+' 位　（猫娘 '
        +era.figs.filter(function(x){return x.sp==='cat';}).length+' 位）');
    }
    B.querySelector('#erDl').innerHTML=dl.join('');
  }

  /* row＝纪年轴上那一行；ok／no＝按了哪一个 */
  function ask(row, ok, no){
    if(!row||row.i==null||row.i<=0){ if(no)no(); return; }
    build();
    ST.ok=ok;ST.no=no;ST.row=row;
    fill(row, eraOf(row.i));
    /* display 一换，.gDlg 的 mvFade 与 .box 的 mvRise 就各自重放一遍 */
    B.style.display='none';
    void B.offsetWidth;
    B.style.display='flex';
    try{B.querySelector('#erGo').focus();}catch(_){}
    /* 资料是异步取的：先用手头这点摆上，取回来再补齐。
       补齐前认一认还是不是这一张 —— 玩家可能已经取消又点了别的一代。 */
    try{
      if(window.feLoadPublic&&!eraOf(row.i))
        window.feLoadPublic(function(list){
          if(list)ST.eras=list;
          if(ST.ok&&ST.row===row)fill(row, eraOf(row.i));
        });
    }catch(_){}
  }

  window.FELERA={ask:ask, close:close};
})();
