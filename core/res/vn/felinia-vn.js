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
    var im=new Image();im.onload=function(){show.src=asset.src;show.style.opacity='1';hide.style.opacity='0';mark(asset.src);};im.src=asset.src;
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
    var p=state.panel||{},hero=heroNameSafe(state),knownHero=rosterEntry(era,hero);
    var out=[{name:hero,role:'玩家',species:knownHero?knownHero.species:'cat',hero:true}],seen={};seen[out[0].name]=1;
    (p.npcs||[]).forEach(function(n){var name=String(n.name||'').trim();if(!name||seen[name])return;seen[name]=1;out.push({name:name,role:n.role||'',species:speciesOf(era,n),source:n});});
    return out;
  }
  function rxEsc(text){return String(text||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function actorsOf(cast){
    return (cast||[]).filter(function(p){return p&&!p.hero&&String(p.name||'').trim();});
  }
  function actorPositions(n){return n<=1?[50]:n===2?[33,67]:n===3?[20,50,80]:[13,38,63,88];}
  function renderSingles(era,cast,speaker){
    var host=$('vnCast');if(!host)return;host.innerHTML='';
    var shown=cast.slice(0,4),pos=actorPositions(shown.length);
    shown.forEach(function(person,i){
      /* 选图照旧：本代名录里点得着名字的用那一张专属，点不着的从通用池里按名字取。 */
      var known=rosterEntry(era,person.name);
      var exact=known&&era.assets.single.find(function(a){return a.species===person.species&&a.character===known.name;});
      var pool=era.assets.single.filter(function(a){return a.species===person.species&&!a.character;});
      if(!pool.length)pool=era.assets.single.filter(function(a){return a.species===person.species;});
      var asset=exact||(pool.length?pool[hash(person.name)%pool.length]:null);if(!asset)return;
      /* 画布的原始尺寸要等图落地才有，落地当场再收一次高，别等下一拍 */
      var cv=plate('vnActor',asset.src,function(){mark(asset.src);castFit();});
      cv.dataset.name=person.name;cv.style.left=pos[i]+'%';
      if(person.name===speaker)cv.classList.add('speaking');
      host.appendChild(cv);
      /* 名牌单独挂一枚，不做成立绘的孩子：立绘是画布，画布装不下别的元素，
         而且它的盒子比人高出好几倍（靠 object-fit 裁出上半身），
         名字挂在它身上会飘到画外去。名牌自己贴着框底站。 */
      var nm=document.createElement('b');
      nm.className='vnName'+(person.name===speaker?' speaking':'');
      nm.dataset.name=person.name;nm.style.left=pos[i]+'%';
      nm.textContent=person.name;
      host.appendChild(nm);
    });
  }
  /* 谁在说话只换一个记号，不重建这一层。
     从前谁说话也算进 castKey，一句话说到一半、说话人一变，整层立绘就重建一次——
     配上像素显形，就是每说一句人都碎掉重砌一遍。 */
  /* ── 立绘一律等高 ──
     样式表里每一档只写一个 height（240%／160%／94%…），宽度随各自的长宽比去长。
     这样 contain 不再有可缩的余地，画出来的高就等于那个 height —— 谁都一样。
     可横构图的人算出来会很宽（0.92 屏高 × 1.5 ≈ 三个屏宽），所以这儿统一收一道：
     按最宽的那一位算一个系数，所有人乘同一个系数。收的是整体，不是某一个，
     等高这件事不会被收坏。
     两道上限：一道管单个人（不许比画框宽出三成），一道管一排人加起来
     （总宽不许超过画框的两倍，也就是最多叠掉一半）。人少就站得大，
     人多就一起矮一档 —— 矮的是所有人同一个系数，不是谁被单独按下去。
     宽屏上两道都够不着，所以那边一个数不动。 */
  var CAST_W=1.3, CAST_ROW=2.0;
  function castFit(){
    var isle=$('vnIsle');if(!isle)return;
    var acts=[].slice.call(document.querySelectorAll('#vnCast .vnActor'));
    if(!acts.length){isle._fit='';return;}
    var fr=isle.getBoundingClientRect();
    if(fr.width<8||fr.height<8)return;
    /* 先按「画框多大、几个人、每张图多大」认一次；没变就不动，
       否则下面清 inline 高度那一下每拍都要逼一次重排。 */
    var sig=Math.round(fr.width)+'x'+Math.round(fr.height)+'|'+acts.map(function(a){
      return (a.getAttribute('data-name')||'')+':'+a.width+'x'+a.height;}).join(',');
    if(isle._fit===sig)return;
    isle._fit=sig;
    var i;
    /* 量之前先把上一轮写下的高清掉，不然量到的是自己写的那个数 */
    for(i=0;i<acts.length;i++)acts[i].style.height='';
    var H0=acts[0].getBoundingClientRect().height;
    if(!(H0>0))return;
    var cap=fr.width*CAST_W,row=fr.width*CAST_ROW,k=1,sum=0;
    for(i=0;i<acts.length;i++){
      var a=acts[i];if(!a.width||!a.height)continue;
      var need=H0*(a.width/a.height);
      sum+=need;
      if(need>cap)k=Math.min(k,cap/need);
    }
    if(sum>row)k=Math.min(k,row/sum);
    var H=Math.round(H0*k);
    for(i=0;i<acts.length;i++)acts[i].style.height=H+'px';
  }
  /* 换档（小窗→放大→全屏）不发 resize，可画框实实在在变了高，
     光靠 600ms 那一拍会先歪半秒。盯着画框自己量，变了当场重算。 */
  function castWatch(){
    var isle=$('vnIsle');if(!isle||isle._ro)return;
    try{isle._ro=new ResizeObserver(function(){castFit();});isle._ro.observe(isle);}
    catch(_){isle._ro=1;}
  }
  function markSpeaker(speaker){
    var host=$('vnCast');if(!host)return;
    /* 只有目标人物确实有一张独立立绘时才启动聚焦。群像图、未出现在前四位的角色、
       名字含糊或解析失败都保持全员原色，绝不出现“所有人一起被压黑”的误判。 */
    var target=null;
    [].forEach.call(host.querySelectorAll('.vnActor'),function(el){
      if(speaker&&el.dataset.name===speaker)target=el;
    });
    [].forEach.call(host.children,function(el){
      var isActor=el.classList&&el.classList.contains('vnActor');
      var active=!!target&&el.dataset.name===speaker;
      el.classList.toggle('speaking',active);
      el.classList.toggle('dimmed',isActor&&!!target&&!active);
    });
    V.speakKey=target?speaker:'';
  }
  function renderEnsemble(era,cast,state){
    var host=$('vnEnsemble');if(!host)return;host.innerHTML='';
    var body=String(state.text||''),crowd=cast.length>4||/众人|人群|队伍|窝群|全队|工场|军阵|家人/.test(body);
    if(!crowd)return false;
    ['cat','human'].forEach(function(sp,si){
      if(!cast.some(function(p){return p.species===sp;}))return;
      var pool=era.assets.group.filter(function(a){return a.species===sp;});if(!pool.length)return;
      var asset=pool[0],node=plate('',asset.src,function(){mark(asset.src);});
      node.style.left=si?'68%':'32%';
      host.appendChild(node);
    });
    return !!host.children.length;
  }
  /* ══════ 全屏那一档：底下那只对话框 ══════
     galgame 的老规矩：画面归画面，字归底下那一条框，一段一段念完。
     这一回 AI 写出来的一大段，在这儿被切成一句一句，点一下走一句。
     只在全屏时出现——小窗与放大两档的框太矮，压上一条对话框就什么也看不见了。 */
  var T={on:false,segs:[],i:-1,typing:0,timer:0,gen:0,key:''};
  function tEl(id){return $(id);}
  function velo(){try{return window.felVelo?window.felVelo():13;}catch(_){return 13;}}
  function busy(){try{return window.felBusy?window.felBusy():false;}catch(_){return false;}}
  function isBig(){try{return document.getElementById('game').classList.contains('txBig');}catch(_){return false;}}
  /* 面板、开局提示、标签一概不念：那些是给玩家看的登记表，不是这一幕的话。
     洗正文这件事引擎自己已经有一套（stripMvuLive，挂在 window.felProse 上）：
     思维链、六种 sec_* 段、markdown 围栏、流到一半的半截标签，它全认得。
     下面这几条是它不在时的退路——只剥 <mvu_panel> 与裸标签，粗得多：
     一回合若正文是空的、只带着几段状态回执，剥完标签剩下的回执文字
     照样会被切成句子念出来，看着就是「没有正文，全屏一进去框还是弹出来」。 */
  function talkText(raw){
    var s=String(raw||'');
    try{if(window.felProse)return String(window.felProse(s)||'');}catch(_){}
    return s
      .replace(/<mvu_panel>[\s\S]*?<\/mvu_panel>/g,'')
      .replace(/<mvu_panel>[\s\S]*$/,'')
      .replace(/<think>[\s\S]*?<\/think>/gi,'')
      .replace(/<\s*sec_[a-z]*\s*>[\s\S]*?<\s*\/\s*sec_[a-z]*\s*>/gi,'')
      .replace(/<\s*sec_[a-z]*\s*>[\s\S]*$/i,'')
      .replace(/<[^>]*>/g,'')
      .replace(/&nbsp;/g,' ');
  }
  /* 一段长的切成几句。三条断法，从紧到松：
       · 句号问号叹号收尾——收尾的引号括号跟着上一句走，
         不然「今晚不该有人过河。」的下引号会落到下一句开头；
         反过来，一个下引号本身也算这一句到头了（对白说完了）。
       · 攒够一句之后又开引号——让这一句话自己占一屏，是 galgame 的老排法。
       · 实在太长，逗号也认；再不成才硬断。 */
  function chop(par,lo,hi){
    var out=[],buf='',i,ch,isEnd;
    var END='。！？!?…',SOFT='，、；：,;:—',TAIL='」』）)】》”’"',OPEN='「『“（(【';
    for(i=0;i<par.length;i++){
      ch=par[i];
      if(OPEN.indexOf(ch)>=0&&buf.length>=lo){out.push(buf);buf='';}
      buf+=ch;
      isEnd=END.indexOf(ch)>=0;
      while(i+1<par.length&&TAIL.indexOf(par[i+1])>=0){buf+=par[++i];isEnd=true;}
      if(buf.length>=lo&&isEnd){out.push(buf);buf='';continue;}
      if(buf.length>=hi&&SOFT.indexOf(ch)>=0){out.push(buf);buf='';continue;}
      if(buf.length>=hi+34){out.push(buf);buf='';}
    }
    if(buf.trim())out.push(buf);
    return out;
  }
  var META_HEAD_RX=/^【(?:ACTVS|SERMO|CONSILIVM|EDICTVM|EPISTVLA|INSIDIAE|ITER|ARMA(?:·[^】]+)?|NPC|FEL_MEOW(?:_HEART|_WAVE)?|한국어\s*원문|中文译文)】/i;
  function talkItems(raw){
    var out=[];
    talkText(raw).split(/\n+/).forEach(function(par,pi){
      par=par.trim();
      if(!par)return;
      if(/^[◆◇◈▚]/.test(par))return;          /* 面板行 */
      /* 只略过真正的模式/翻译标签。模型正文的【】是本作约定的爆发心声，
         旧版用 /^【/ 一刀切，视觉小说因此从来不显示这一层。 */
      if(META_HEAD_RX.test(par))return;
      if(/^[-—─═]{3,}$/.test(par))return;
      var chunks=chop(par,26,58),cursor=0,quoted=false,thinking=false;
      chunks.forEach(function(x){
        var rawChunk=x,start=par.indexOf(rawChunk,cursor);if(start<0)start=cursor;
        cursor=start+rawChunk.length;x=rawChunk.trim();if(!x)return;
        var thoughtCarry=thinking,thought=thoughtCarry||/[（【]/.test(x);
        var carry=quoted,hasQuote=carry||/[「“]/.test(x);
        /* 本作只把直引号「」/“”当作当场对白；『』是回忆或转述，不亮现场人物。 */
        for(var ci=0;ci<rawChunk.length;ci++){
          if(rawChunk[ci]==='「'||rawChunk[ci]==='“')quoted=true;
          else if(rawChunk[ci]==='」'||rawChunk[ci]==='”')quoted=false;
          if(rawChunk[ci]==='（'||rawChunk[ci]==='('||rawChunk[ci]==='【')thinking=true;
          else if(rawChunk[ci]==='）'||rawChunk[ci]===')'||rawChunk[ci]==='】')thinking=false;
        }
        out.push({text:x,par:par,parIndex:pi,start:start,
          kind:thought?'thought':(hasQuote?'dialogue':'narration'),carry:carry});
      });
    });
    return out;
  }
  function namedHere(text,actors){
    return actors.filter(function(p){return String(text||'').indexOf(p.name)>=0;});
  }
  /* 一回正文只允许一位非玩家焦点拥有（）/【】里的内心。只有结构上唯一，或心声
     邻接段落反复且无歧义地指向同一姓名时才认；并列提到两个人时宁可不聚焦。 */
  function thoughtOwner(items,cast){
    var actors=actorsOf(cast);if(actors.length===1)return actors[0].name;
    var pars=[],scores={};actors.forEach(function(p){scores[p.name]=0;});
    items.forEach(function(it){if(pars.indexOf(it.par)<0)pars.push(it.par);});
    pars.forEach(function(par,i){
      if(!/^[（【]/.test(par))return;
      var direct=[];
      actors.forEach(function(p){
        var n=rxEsc(p.name);
        if(new RegExp(n+'(?:的)?(?:心声|心想|暗想|想着|想道|思忖)').test(par))direct.push(p);
      });
      if(direct.length===1){scores[direct[0].name]+=6;return;}
      var ctx='';
      for(var j=i-1;j>=0&&j>=i-2;j--){if(!/^[（【]/.test(pars[j])){ctx=pars[j];break;}}
      var mentioned=namedHere(ctx.slice(-90),actors);
      if(mentioned.length===1)scores[mentioned[0].name]+=2;
    });
    var ranked=actors.slice().sort(function(a,b){return scores[b.name]-scores[a.name];});
    if(!ranked.length||scores[ranked[0].name]<2)return '';
    if(ranked[1]&&scores[ranked[1].name]===scores[ranked[0].name])return '';
    return ranked[0].name;
  }
  /* 对白只认真正的署名关系：姓名标签、姓名+说话动词、或引号后的“某某说”。
     引号里的被称呼者不参与判定；多人在场又没有署名时保持中性。 */
  function dialogueOwner(item,cast){
    var actors=actorsOf(cast);if(!actors.length)return '';
    if(actors.length===1)return actors[0].name;
    var par=item.par,start=item.start,local=item.text;
    var rel=local.search(/[「“]/),open=rel>=0?start+rel:start;
    var close=Math.max(par.lastIndexOf('」',start+local.length),par.lastIndexOf('”',start+local.length));
    var before=par.slice(Math.max(0,open-64),open),after=close>=open?par.slice(close+1,close+54):'';
    var verb='(?:说|问|答|喊|叫|道|骂|吼|嘀咕|低声说|开口|出声|应声|接话|回话|喝道|嚷道)';
    var scored=[];
    actors.forEach(function(p){
      var n=rxEsc(p.name),score=0;
      if(new RegExp(n+'\\s*(?:对|向|朝)\\s*[^。！？\\n「”]{0,24}'+verb+'[：:,，\\s]*$').test(before))score=Math.max(score,190);
      if(new RegExp(n+'[^。！？\\n「”]{0,20}'+verb+'[：:,，\\s]*$').test(before))score=Math.max(score,150);
      if(new RegExp(n+'\\s*[：:]\\s*$').test(before))score=Math.max(score,180);
      if(new RegExp('^[\\s，,。.!！?？—-]*'+n+'[^。！？\\n]{0,12}'+verb).test(after))score=Math.max(score,200);
      if(score)scored.push({name:p.name,score:score});
    });
    scored.sort(function(a,b){return b.score-a.score;});
    if(!scored.length||scored[1]&&scored[1].score===scored[0].score)return '';
    return scored[0].name;
  }
  function talkStop(){T.gen++;if(T.timer){clearTimeout(T.timer);T.timer=0;}T.typing=0;}
  function talkClose(){
    talkStop();T.on=false;T.i=-1;
    var b=tEl('vnTalk');if(b)b.classList.remove('on');
    var w=tEl('vnTalkWho');if(w){w.textContent='';w.classList.remove('on');}
    markSpeaker('');
    talkReplayBtn();
  }
  /* 念完或按了 ✕ 之后，全屏里留一枚小钮：这一回还能从头再念。
     不留的话，收起来就再也叫不回来，除非等下一回。 */
  function talkReplayBtn(){
    var el=tEl('vnReplay');if(!el)return;
    el.classList.toggle('on',isBig()&&!T.on&&T.segs.length>0);
  }
  /* 全屏时输入条（.gInput）盖在视觉小说窗上头（它 z-index 27、窗子 25），
     对话框贴着底就被它压住半截。这里量一次它的高，把框抬到它上面去。
     写死一个数是不行的：手机、字号、安全区都会让它变高。
     只有全屏这一档要让：小窗与放大两档的窗子在屏幕上半，输入条在最底下，压不着。
     不分档一律留这一段的话，立绘脚下的名牌会被顶起六十几像素——顶到人脸上去。 */
  function talkGap(){
    var isle=tEl('vnIsle');if(!isle)return;
    var h=0;
    if(isBig()){
      try{var g=document.querySelector('#game .gInput');
          if(g){var r=g.getBoundingClientRect();if(r.height>4)h=Math.round(r.height)+6;}}catch(_){}
    }
    isle.style.setProperty('--vnGap',h+'px');
  }
  function talkPaint(){
    talkGap();
    var box=tEl('vnTalk');if(!box)return;
    box.classList.toggle('on',T.on);
    /* 框上自己带了说话人那一枚小牌，左下角原来那一枚就多余了——收起来。 */
    var isle=tEl('vnIsle');if(isle)isle.classList.toggle('talkOn',T.on);
    var num=tEl('vnTalkNum');if(num)num.textContent=T.on?((T.i+1)+' / '+T.segs.length):'';
  }
  function talkShow(k){
    var box=tEl('vnTalk'),body=tEl('vnTalkBody'),who=tEl('vnTalkWho'),tip=tEl('vnTalkTip');
    if(!box||!body)return;
    if(k>=T.segs.length){talkClose();return;}
    talkStop();
    T.i=k;
    var seg=T.segs[k],name=(T.who||[])[k]||'';
    if(who){who.textContent=name;who.classList.toggle('on',!!name);}
    markSpeaker(name);
    talkPaint();
    var sp=velo();
    if(tip)tip.classList.remove('on');
    if(!sp){body.textContent=seg;if(tip)tip.classList.add('on');return;}
    var gen=T.gen,i=0;
    T.typing=1;body.textContent='';
    (function step(){
      if(gen!==T.gen)return;
      if(i>=seg.length){T.typing=0;if(tip)tip.classList.add('on');return;}
      i+=1+(sp<8?2:0);
      body.textContent=seg.slice(0,i);
      T.timer=setTimeout(step,sp);
    })();
  }
  function talkAdvance(){
    if(!T.on)return;
    if(T.typing){                       /* 还在打字：这一下是「打完」，不是「下一句」 */
      talkStop();
      var body=tEl('vnTalkBody'),tip=tEl('vnTalkTip');
      if(body)body.textContent=T.segs[T.i]||'';
      if(tip)tip.classList.add('on');
      return;
    }
    talkShow(T.i+1);
  }
  function talkOpen(raw,cast){
    var items=talkItems(raw),segs=items.map(function(x){return x.text;});
    /* 这一回没有可念的正文：框收起来，上一回攒下的句子也一并丢掉——
       留着的话「再念一遍」那枚钮会挂在全屏里，按下去念的是上一回的话。 */
    if(!segs.length){T.segs=[];T.who=[];T.i=-1;talkClose();return;}
    cast=cast||[];
    var who=[],last='',heart=thoughtOwner(items,cast);
    items.forEach(function(item,i){
      var n='';
      if(item.kind==='thought')n=heart;
      else if(item.kind==='dialogue'){
        n=dialogueOwner(item,cast);
        /* 只在同一对尚未闭合的直引号被长度切开时继承；独立的下一句绝不沿用。 */
        if(!n&&item.carry)n=last;
      }
      who[i]=n;
      last=item.kind==='dialogue'?n:'';
    });
    T.segs=segs;T.who=who;T.kind=items.map(function(x){return x.kind;});T.cast=cast;T.on=true;
    talkShow(0);talkReplayBtn();
  }
  /* 什么时候开：进了全屏就开；全屏里换了一回、且这一回已经落定（不再流字），
     就从头念新的这一回。退出全屏一律收起。 */
  function talkSync(state,cast){
    T.last=state;T.lastCast=cast;
    talkGap();
    if(!isBig()){if(T.on)talkClose();T.key='';T.segs=[];talkReplayBtn();return;}
    if(busy())return;                    /* 还在流：等它写完再念 */
    var raw=String(state.text||'');
    var k=hash(raw);
    if(k===T.key)return;
    T.key=k;
    talkOpen(raw,cast);
  }
  function talkInit(){
    var box=tEl('vnTalk');if(!box||box._on)return;box._on=1;
    box.addEventListener('click',function(e){
      if(e.target&&e.target.closest&&e.target.closest('#vnTalkX')){e.stopPropagation();talkClose();return;}
      e.stopPropagation();talkAdvance();
    });
    var rp=tEl('vnReplay');
    if(rp)rp.addEventListener('click',function(e){
      e.stopPropagation();
      if(T.segs.length){T.on=true;talkShow(0);talkReplayBtn();}
    });
    /* 空格与回车也走下一句——galgame 的老手不爱把手从键盘上拿开。
       正在输入框里打字的时候不抢。 */
    document.addEventListener('keydown',function(e){
      if(!T.on||!isBig())return;
      var t=e.target,tag=t&&t.tagName;
      if(tag==='INPUT'||tag==='TEXTAREA'||(t&&t.isContentEditable))return;
      if(e.key===' '||e.key==='Enter'){e.preventDefault();talkAdvance();}
      else if(e.key==='Escape')talkClose();
    });
  }
  function tick(forced){
    if(!V.ready)return;var state=forced||currentState(),era=resolveEra(state);if(!era)return;V.lastEra=era;
    var panel=state.panel||{},loc=textOf(panel,'时地')||(state.op&&state.op.scene)||era.locations[0]||era.title;
    var weather=textOf(panel,'天气'),isle=$('vnIsle');if(isle){isle.classList.toggle('night',NIGHT_RX.test(loc));isle.classList.toggle('red',RED_RX.test(loc));}
    setBackground(era,loc,weather);
    var cast=castOf(era,state),speaker='';
    /* 「站着谁」与「谁在说」分成两把钥匙：前者变了才重建这一层（立绘重新显形），
       后者变了只换记号。合成一把的时候还捎上了正文尾巴的哈希——
       正文每流一个字它就变一次，于是这一层每秒重建好几遍。 */
    var crowd=cast.length>4||/众人|人群|队伍|窝群|全队|工场|军阵|家人/.test(String(state.text||''));
    var key=era.eraIndex+'|'+(crowd?'g':'s')+'|'+cast.map(function(p){return p.name+':'+p.species;}).join('+');
    if(key!==V.castKey){
      V.castKey=key;V.speakKey=null;
      var ensemble=renderEnsemble(era,cast,state);
      if(ensemble)$('vnCast').innerHTML='';else renderSingles(era,cast,'');
    }
    talkInit();talkSync(state,cast);
    /* 新一回还在流式生成时，旧对话框即使尚未换页也不继续压暗人物。 */
    speaker=(T.on&&isBig()&&!busy()&&T.i>=0)?((T.who||[])[T.i]||''):'';
    if(speaker!==V.speakKey)markSpeaker(speaker);
    var eraEl=$('vnEra');if(eraEl)eraEl.innerHTML='<b>'+esc(era.yearLabel+' · '+era.title)+'</b><span>'+esc(era.subtitle)+'</span>';
    var locEl=$('vnLoc');if(locEl)locEl.textContent=loc.replace(/\s+/g,' ').slice(0,32);
    var sp=$('vnSpeaker');if(sp){sp.textContent=speaker||'';sp.classList.toggle('on',!!speaker);}
    castWatch();castFit();
    
  }
  function init(){
    fetch('/core/res/data/felinia/vn-images.json?v=2').then(function(r){if(!r.ok)throw new Error('image index '+r.status);return r.json();}).then(function(data){
      V.manifest=data;V.ready=true;tick();
      setInterval(tick,600);
    }).catch(function(err){try{console.warn('[visual-novel]',err);}catch(_){}});
  }
  window.FELVN={tick:tick,inspect:function(){return {ready:V.ready,total:V.manifest&&V.manifest.total,counts:V.manifest&&V.manifest.counts,era:V.lastEra&&V.lastEra.eraIndex,rendered:Object.keys(V.used).length,focus:V.speakKey||'',segment:T.i>=0?T.i:null,kind:T.i>=0&&(T.kind||[])[T.i]||''};},preview:function(state){V.override=state||null;V.bgKey='';V.castKey='';V.speakKey=null;tick();},clearPreview:function(){V.override=null;V.bgKey='';V.castKey='';V.speakKey=null;markSpeaker('');tick();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
