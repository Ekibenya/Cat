(function(){
  'use strict';
  var V={manifest:null,ready:false,bgFlip:false,bgKey:'',castKey:'',speakKey:null,eraKey:'',lastEra:null,used:{},override:null};
  /* 立绘出场用像素显形（引擎里那一份 felPix，从 ghost 那张卡搬来的）。
     引擎没挂上就退回「直接画完」，不至于因为少一个效果整层立绘不出来。 */
  function pix(cv,im){
    try{if(window.felPix){window.felPix(cv,im);return;}}catch(_){}
    cv.width=im.naturalWidth||im.width;cv.height=im.naturalHeight||im.height;
    var g=cv.getContext('2d');if(g)g.drawImage(im,0,0);
  }
  function plate(cls,src,onload){
    var cv=document.createElement('canvas');
    if(cls)cv.className=cls;
    var im=new Image();
    im.onload=function(){pix(cv,im);if(onload)onload();};
    im.src=src;
    return cv;
  }
  var CAT_RX=/猫娘|猫耳|耳尾|尾巴|肉垫|窝群|同类/;
  var NIGHT_RX=/夜|晚|黄昏|日暮|薄暮|三更|四更|五更|子时|亥时|戌时|丑时|寅时|月|烛|灯下/;
  var RED_RX=/青楼|花街|宫廷|沙龙|百货|舞台|展会/;

  function $(id){return document.getElementById(id);}
  function hash(text){var h=2166136261,s=String(text||'');for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function esc(text){return String(text==null?'':text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function mark(src){V.used[src]=1;}
  function textOf(panel,key){var w=(panel&&panel.world)||{};return String(w[key]||w[key==='时地'?'時地':key==='天气'?'天氣':key]||'');}
  function latestText(){
    try{for(var i=S.history.length-1;i>=0;i--)if(S.history[i].role==='world'&&S.history[i].text)return String(S.history[i].text);}catch(_){}
    try{for(var j=TURNS.length-1;j>=0;j--)if(TURNS[j].role==='assistant')return String(TURNS[j].content||'');}catch(_){}
    return '';
  }
  function currentState(){
    if(V.override)return V.override;
    try{if(window.__FELVN_STATE__)return window.__FELVN_STATE__();}catch(_){}
    var p=null;try{p=currentPanel();}catch(_){}
    var op=null;try{op=GAME.op||null;}catch(_){}
    return {panel:p||{npcs:[],world:{}},op:op,text:latestText()};
  }
  function parseYear(value){
    var s=String(value||''),m=s.match(/前\s*([0-9]+)/);if(m)return -parseInt(m[1],10);
    m=s.match(/([0-9]{1,5})\s*年/);return m?parseInt(m[1],10):null;
  }
  function resolveEra(state){
    if(!V.manifest)return null;
    var p=state.panel||{},op=state.op||{},world=p.world||{};
    var year=op.year!=null?Number(op.year):parseYear(world['纪年']||world['紀年']);
    if(year!=null&&!isNaN(year)){
      var exact=V.manifest.eras.filter(function(e){return e.year===year;});
      if(exact.length===1)return exact[0];
    }
    var hay=[op.era,op.scene,world['纪年'],world['紀年'],world['时地'],world['時地']].join('|');
    var best=null,score=0;
    V.manifest.eras.forEach(function(era){
      var s=0;era.search.forEach(function(k){k=String(k||'');if(k&&hay.indexOf(k)>=0)s+=k.length;});
      era.locations.forEach(function(k){if(k&&hay.indexOf(k)>=0)s+=k.length*2;});
      if(s>score){score=s;best=era;}
    });
    if(best)return best;
    if(year!=null&&!isNaN(year)){
      return V.manifest.eras.slice().sort(function(a,b){return Math.abs(a.year-year)-Math.abs(b.year-year);})[0];
    }
    return V.manifest.eras[0];
  }
  function sceneIndex(era,loc,weather){
    var base=-1;
    for(var i=0;i<era.locations.length;i++)if(loc.indexOf(era.locations[i])>=0){base=i;break;}
    if(base<0)base=hash(loc||era.title)%Math.max(1,era.locations.length);
    var sky=/雪|霜/.test(weather+loc)?4:/雨|雾|霾/.test(weather+loc)?3:NIGHT_RX.test(loc)?2:/晴|晨|朝|午/.test(weather+loc)?1:0;
    return base+sky*Math.max(1,era.locations.length);
  }
  function setBackground(era,loc,weather){
    var list=era.assets.background;if(!list.length)return;
    var asset=list[sceneIndex(era,loc,weather)%list.length];
    var key=era.eraIndex+'|'+asset.src;if(key===V.bgKey)return;V.bgKey=key;
    var a=$('vnBgA'),b=$('vnBgB'),show=V.bgFlip?a:b,hide=V.bgFlip?b:a;V.bgFlip=!V.bgFlip;
    var im=new Image();im.onload=function(){show.src=asset.src;show.style.opacity='1';hide.style.opacity='0';mark(asset.src);paintAudit(era);};im.src=asset.src;
  }
  function rosterEntry(era,name){
    var key=String(name||'').replace(/[\s　]+/g,'').replace(/[（(].*?[）)]$/,'');
    for(var i=0;i<era.characters.length;i++)if(era.characters[i].name.replace(/[\s　]+/g,'')===key)return era.characters[i];
    return null;
  }
  function speciesOf(era,npc){
    var known=rosterEntry(era,npc.name);if(known)return known.species;
    return CAT_RX.test([npc.role,npc.state,npc.thought,npc.name].join('|'))?'cat':'human';
  }
  function heroNameSafe(state){if(state&&state.hero)return state.hero;try{return heroName()||'你';}catch(_){return '你';}}
  function castOf(era,state){
    var p=state.panel||{},out=[{name:heroNameSafe(state),role:'玩家',species:'cat',hero:true}],seen={};seen[out[0].name]=1;
    (p.npcs||[]).forEach(function(n){var name=String(n.name||'').trim();if(!name||seen[name])return;seen[name]=1;out.push({name:name,role:n.role||'',species:speciesOf(era,n),source:n});});
    return out;
  }
  function speakerOf(cast,text){
    var body=String(text||'').replace(/<mvu_panel>[\s\S]*$/,'');
    for(var i=cast.length-1;i>=0;i--)if(!cast[i].hero&&body.indexOf(cast[i].name)>=0)return cast[i].name;
    return '';
  }
  function actorPositions(n){return n<=1?[50]:n===2?[33,67]:n===3?[20,50,80]:[13,38,63,88];}
  function renderSingles(era,cast,speaker){
    var host=$('vnCast');if(!host)return;host.innerHTML='';
    var shown=cast.slice(0,4),pos=actorPositions(shown.length);
    shown.forEach(function(person,i){
      /* 选图照旧：本代名录里点得着名字的用那一张专属，点不着的从通用池里按名字取。 */
      var known=person.hero?null:rosterEntry(era,person.name);
      var exact=known&&era.assets.single.find(function(a){return a.species===person.species&&a.character===known.name;});
      var pool=era.assets.single.filter(function(a){return a.species===person.species&&!a.character;});
      if(!pool.length)pool=era.assets.single.filter(function(a){return a.species===person.species;});
      var asset=exact||(pool.length?pool[hash(person.name)%pool.length]:null);if(!asset)return;
      var cv=plate('vnActor',asset.src,function(){mark(asset.src);paintAudit(era);});
      cv.dataset.name=person.name;cv.style.left=pos[i]+'%';
      if(person.name===speaker)cv.classList.add('speaking');
      host.appendChild(cv);
    });
  }
  /* 谁在说话只换一个记号，不重建这一层。
     从前谁说话也算进 castKey，一句话说到一半、说话人一变，整层立绘就重建一次——
     配上像素显形，就是每说一句人都碎掉重砌一遍。 */
  function markSpeaker(speaker){
    var host=$('vnCast');if(!host)return;
    [].forEach.call(host.children,function(el){
      el.classList.toggle('speaking',!!speaker&&el.dataset.name===speaker);
    });
  }
  function renderEnsemble(era,cast,state){
    var host=$('vnEnsemble');if(!host)return;host.innerHTML='';
    var body=String(state.text||''),crowd=cast.length>4||/众人|人群|队伍|窝群|全队|工场|军阵|家人/.test(body);
    if(!crowd)return false;
    ['cat','human'].forEach(function(sp,si){
      if(!cast.some(function(p){return p.species===sp;}))return;
      var pool=era.assets.group.filter(function(a){return a.species===sp;});if(!pool.length)return;
      var asset=pool[0],node=plate('',asset.src,function(){mark(asset.src);paintAudit(era);});
      node.style.left=si?'68%':'32%';
      host.appendChild(node);
    });
    return !!host.children.length;
  }
  function paintAudit(era){
    if(!V.manifest)return;var el=$('vnCoverage');if(el)el.textContent='已映射 '+V.manifest.total+'/'+V.manifest.total;
    var audit=$('vnAudit');if(!audit||!era)return;
    audit.innerHTML='<b>全图库覆盖</b><br><span class="ok">✓ '+V.manifest.total+' / '+V.manifest.total+' 张均已编入场景规则</span><br>'+
      '背景 '+V.manifest.counts.background+' · 单人立绘 '+V.manifest.counts.single+'<br>组合立绘 '+V.manifest.counts.group+' · 绿幕原图不计入游戏<br><br>'+
      '<b>当前纪年</b><br>'+esc(era.yearLabel+' · '+era.title)+'<br>本纪年 '+era.assetCount+' 张 · 本次浏览已呈现 '+Object.keys(V.used).length+' 张';
  }
  function tick(forced){
    if(!V.ready)return;var state=forced||currentState(),era=resolveEra(state);if(!era)return;V.lastEra=era;
    var panel=state.panel||{},loc=textOf(panel,'时地')||(state.op&&state.op.scene)||era.locations[0]||era.title;
    var weather=textOf(panel,'天气'),isle=$('vnIsle');if(isle){isle.classList.toggle('night',NIGHT_RX.test(loc));isle.classList.toggle('red',RED_RX.test(loc));}
    setBackground(era,loc,weather);
    var cast=castOf(era,state),speaker=speakerOf(cast,state.text);
    /* 「站着谁」与「谁在说」分成两把钥匙：前者变了才重建这一层（立绘重新显形），
       后者变了只换记号。合成一把的时候还捎上了正文尾巴的哈希——
       正文每流一个字它就变一次，于是这一层每秒重建好几遍。 */
    var crowd=cast.length>4||/众人|人群|队伍|窝群|全队|工场|军阵|家人/.test(String(state.text||''));
    var key=era.eraIndex+'|'+(crowd?'g':'s')+'|'+cast.map(function(p){return p.name+':'+p.species;}).join('+');
    if(key!==V.castKey){
      V.castKey=key;V.speakKey=null;
      var ensemble=renderEnsemble(era,cast,state);
      if(ensemble)$('vnCast').innerHTML='';else renderSingles(era,cast,speaker);
    }
    if(speaker!==V.speakKey){V.speakKey=speaker;markSpeaker(speaker);}
    var eraEl=$('vnEra');if(eraEl)eraEl.innerHTML='<b>'+esc(era.yearLabel+' · '+era.title)+'</b><span>'+esc(era.subtitle)+'</span>';
    var locEl=$('vnLoc');if(locEl)locEl.textContent=loc.replace(/\s+/g,' ').slice(0,32);
    var sp=$('vnSpeaker');if(sp){sp.textContent=speaker||'';sp.classList.toggle('on',!!speaker);}
    paintAudit(era);
  }
  function init(){
    var coverage=$('vnCoverage'),audit=$('vnAudit');
    if(coverage)coverage.addEventListener('click',function(e){e.stopPropagation();if(audit)audit.classList.toggle('on');});
    fetch('/core/res/data/felinia/vn-images.json?v=2').then(function(r){if(!r.ok)throw new Error('image index '+r.status);return r.json();}).then(function(data){
      V.manifest=data;V.ready=true;tick();
      setInterval(tick,600);
    }).catch(function(err){if(coverage)coverage.textContent='图库索引未载入';try{console.warn('[visual-novel]',err);}catch(_){}});
  }
  window.FELVN={tick:tick,inspect:function(){return {ready:V.ready,total:V.manifest&&V.manifest.total,counts:V.manifest&&V.manifest.counts,era:V.lastEra&&V.lastEra.eraIndex,rendered:Object.keys(V.used).length};},preview:function(state){V.override=state||null;V.bgKey='';V.castKey='';V.speakKey=null;tick();},clearPreview:function(){V.override=null;V.bgKey='';V.castKey='';V.speakKey=null;tick();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
