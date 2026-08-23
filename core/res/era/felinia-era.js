/* 纪年简介弹窗。
   点一张图版，先摊开这一代是什么，再让人决定进不进。
   原来是点第二下直接进四步，玩家在纪年轴上只看得见一张图和一行小字。

   资料取自 core/res/data/felinia/eras.json（feLoad 已经取过就直接用）。
   取不着也照旧能用 —— 那就只摆纪年轴上本来就有的那几行，按钮照旧能进。 */
(function(){
  'use strict';

  var B=null, ST={ok:null, no:null, key:null, eras:null, row:null};

  function esc(t){return String(t==null?'':t)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function build(){
    if(B)return B;
    B=document.createElement('div');B.id='erBox';
    B.innerHTML='<div class="erVeil"></div>'
      +'<div class="erWin" role="dialog" aria-modal="true" aria-labelledby="erTtl">'
      +'<div class="erHd"><span class="erTag">ANNALES</span>'
      +'<h2 class="erTtl" id="erTtl"></h2><div class="erYr"></div></div>'
      +'<div class="erBd"></div>'
      +'<div class="erFt">'
      +'<button type="button" class="erBtn" data-no>取消<i>RETVRN</i></button>'
      +'<button type="button" class="erBtn go" data-ok>进入该时代<i>PERGERE</i></button>'
      +'</div></div>';
    document.body.appendChild(B);
    B.querySelector('[data-no]').addEventListener('click',function(){close(0);});
    B.querySelector('[data-ok]').addEventListener('click',function(){close(1);});
    B.querySelector('.erVeil').addEventListener('click',function(){close(0);});
    ST.key=function(e){
      if(!B.classList.contains('on'))return;
      if(e.key==='Escape'){e.preventDefault();close(0);}
      else if(e.key==='Enter'){e.preventDefault();close(1);}
    };
    document.addEventListener('keydown',ST.key,true);
    return B;
  }

  function close(go){
    if(!B)return;
    var ok=ST.ok,no=ST.no;ST.ok=ST.no=null;
    B.classList.remove('in');
    /* 等淡出走完再收起来，免得下一次打开时闪一下上一次的内容 */
    setTimeout(function(){ if(!ST.ok)B.classList.remove('on'); },260);
    try{ if(go){ if(ok)ok(); } else if(no)no(); }catch(_){}
  }

  /* 这一代的资料。纪年表在游戏那一层的闭包里，够不着，
     所以由 feLoadPublic 随回调递过来，这里存一份。 */
  function eraOf(i){
    var a=ST.eras;if(!a)return null;
    for(var k=0;k<a.length;k++)if(a[k].i===i)return a[k];
    return null;
  }

  function fill(row, era){
    var w=B.querySelector('.erWin');
    B.querySelector('.erTtl').textContent=row.t||(era&&era.t)||'';
    B.querySelector('.erYr').textContent=
      [(row.y||(era&&era.yl)||''),(row.era||(era&&era.age)||''),(era&&era.reg)||'']
      .filter(Boolean).join('　·　');
    var h=[];
    var lead=(era&&era.w)||row.s||'';
    if(lead)h.push('<p class="erP">'+esc(lead)+'</p>');
    var dl=[];
    function row2(k,v){ if(v)dl.push('<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>'); }
    if(era){
      row2('在场的制度',(era.inst||[]).join('、'));
      row2('取名法',era.nm);
      row2('能落脚的地方',(era.locs||[]).map(function(L){
        return L.cn+'（'+L.n+'）';}).join('　'));
      row2('身上穿的',(era.dress||[]).slice(0,6).join('、'));
      var f=(era.figs||[]).length;
      if(f)row2('在册的人', f+' 位　（猫娘 '
        +era.figs.filter(function(x){return x.sp==='cat';}).length+' 位）');
    }
    if(dl.length)h.push('<dl>'+dl.join('')+'</dl>');
    B.querySelector('.erBd').innerHTML=h.join('');
    B.querySelector('.erBd').scrollTop=0;
    w.setAttribute('aria-label', B.querySelector('.erTtl').textContent);
  }

  /* row＝纪年轴上那一行；ok／no＝按了哪一个 */
  function ask(row, ok, no){
    if(!row||row.i==null||row.i<=0){ if(no)no(); return; }
    build();
    ST.ok=ok;ST.no=no;ST.row=row;
    fill(row, eraOf(row.i));
    B.classList.add('on');
    /* 先摆上再加 in，过渡才有起点。两帧是实测值：一帧偶尔还赶在布局之前。 */
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      B.classList.add('in');
      var g=B.querySelector('[data-ok]');if(g)try{g.focus();}catch(_){}
    });});
    /* 资料是异步取的：先用手头这点摆上，取回来再补齐。
       补齐前先认一认还是不是这一张 —— 玩家可能已经取消又点了别的一代。 */
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
