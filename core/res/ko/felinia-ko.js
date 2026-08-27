/* FELINIA · 人物条目·局内现写
   ═══════════════════════════════════════════════════════════════════
   卡里带着四十一代五百九十位真人的名字、身份与事迹（出自名册，是史实）。
   其中一百五十七位的六条条目是封闭沙盒写好的，台词也是真台词。
   余下四百三十三位只有名字与事迹，台词一栏是空的 —— 那是有意留空的：
   台词必须是走过闭合流程写出来的，不许拿别处凑。

   这一层做的就是把那道流程搬进游戏，用玩家自己的接口现写：

     ⓪ 译入   中文事实卡        →  韩语场面文件 ＋ 一张名表      零汉字是锁
     ① 集笔   韩语提示词全文    →  韩语六条条目 ＋ 原稿          见本八篇整个嵌进去
     ② 译出   韩语条目          →  中文条目                      必须是另一次请求

   三段各发一次请求、各自从零开始，互不带上文 —— 同一次请求里既写又译，
   它会顺手把自己的稿子润一遍，文体就没了。这一条是仓库里实测出来的。

   跑在后台：玩家在择地、立身、识人那三步上点的时候，这边在写。
   写不完也不碍事 —— 没写回来的人照旧用卡里那份口吻谱台词兜底。
   写回来了就把台词与六条条目填进去，并装进世界书，对局时能被检索到。

   一代只写一次。写完存进 localStorage，下次进同一代直接取。
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var K = {run:{}, key:'felinia.ko.doss.v1'};
  var PER = 7;          /* 一次写几位。仓库里手工跑的也是七位一批，长度实测合适 */

  function han(s){var m=String(s==null?'':s).match(/[一-鿿]/g);return m?m.length:0;}
  function hangul(s){return /[가-힣]/.test(String(s==null?'':s));}

  /* ── 存过的取回来 ───────────────────────────────────────── */
  function load(){
    try{return JSON.parse(localStorage.getItem(K.key)||'{}');}catch(_){return {};}
  }
  function save(era, people){
    try{
      var all=load();all[era]=people;
      localStorage.setItem(K.key, JSON.stringify(all));
    }catch(_){}                     /* 配额满了就算了，这一层只是省一次重写 */
  }

  /* ── 中文事实卡：交给⓪的那一份 ──────────────────────────
     栏目与仓库里 ⓪한벌 那份事实卡对齐，模型见到的是同一种表。 */
  function zhCard(era, list){
    var o=[];
    o.push('# 这一代的世界（只是事实，不要写进正文当解说）');
    o.push('年代：'+era.yl+'（'+era.age+'）');
    o.push('地区路线：'+era.reg);
    o.push('这一代成立的事：'+era.w);
    o.push('在场的制度：'+(era.inst||[]).join('、'));
    o.push('可去的地方：'+(era.locs||[]).map(function(L){
      return L.cn+'（'+L.n+'）'+(L.d||'');}).join('；'));
    o.push('');
    o.push('# 这个世界的身体规矩（写人物时不能违背，但不要在正文里解释）');
    o.push('· 猫娘平均身高一百四十厘米上下，正面挨打极弱，跑、爬、夜视、游泳、平衡远胜人类。');
    o.push('· 猫耳与尾巴既是感官也是情绪，藏不住。摸尾巴要先得允许，不许就是侵犯。');
    o.push('· 手是人形的手，手背有毛，掌面有肉垫；脚是猫脚加肉垫，穿不了人类的鞋楦，也裹不了脚。');
    o.push('· 猫娘的血只能给猫娘。掉毛，换毛期尤其明显。要散热，所以衣服通风、开口、不压耳、不束腰。');
    o.push('· 一生只生一窝，一窝多女；与人类男子所生的孩子恒为猫娘。发情期是周期性的，不等于背叛。');
    o.push('· 体罚对猫娘无效，越打越不听。要用商量、契约、即刻的回应和看得见的赏。');
    o.push('· 猫娘约占总人口三分之一，不是稀奇的少数。');
    o.push('');
    o.push('# 这一批要写的人（一共 '+list.length+' 位）');
    list.forEach(function(p){
      o.push('');
      o.push('----');
      o.push('姓名：'+p.n);
      o.push('物种：'+(p.sp==='cat'?'猫娘':'人类'));
      o.push('年龄：'+p.age+' 岁');
      o.push('身高：'+p.h+' 厘米');
      o.push('体重：'+p.w+' 公斤');
      if(p.sp==='cat'){
        o.push('毛色：'+p.fur+'。'+p.mark);
        o.push('品种（形态—生态复合型）：'+p.morph.n+'。'+p.morph.m);
        o.push('耳尾习惯：'+(p.tail||'情绪一动，耳朵和尾巴就跟着动'));
      }else{
        o.push('发色：'+p.fur);
        o.push('品种：人类。没有耳尾，没有肉垫，情绪不写在身上');
      }
      o.push('服装：'+p.dress);
      o.push('身份地位：'+p.ti);
      o.push('出生地：'+p.born);
      o.push('居住地：'+p.live);
      o.push('性格：'+p.temper.join('；'));
      o.push('人物关系：'+p.rel);
      if(p.d)o.push('这个人身上发生过的事（史实，不许改动）：'+p.d);
    });
    return o.join('\n');
  }

  /* ── ⓪ 的中文指示。与开局那一段同源，只是要的东西换成人物 ── */
  var P0='把下面这份「人物事实卡」改写成韩语，交回两块内容。\n\n'
   +'第一块，以单独一行「[jangmyeon]」开头，其后是韩语的事实卡：\n'
   +'· 原有的栏目一栏不少，一栏不添。\n'
   +'· 不要替他们编情节、编目标、编结局。那几样不归你定。\n'
   +'· 栏目标记用什么符号都行，但整块里一个汉字都不许出现。\n'
   +'· 人名与地名一律改成韩文音写。\n\n'
   +'第二块，以单独一行「[ireumpyo]」开头，其后每行一条，形如\n'
   +'    韩文音写 | 原名\n'
   +'把你音写过的每一个人名与地名都列进去。这一块里可以出现原名。\n\n'
   +'只交回这两块，不要解释，不要写别的。';

  function split0(txt){
    var s=String(txt||''),a=s.indexOf('[jangmyeon]'),b=s.indexOf('[ireumpyo]');
    if(a<0)return null;
    return {scene:((b>a)?s.slice(a+11,b):s.slice(a+11)).trim(),
            names:((b>a)?s.slice(b+10):'').trim()};
  }
  /* ①②交回来的两块：[hangmok] 是条目数组，[wongo] 是原稿 */
  function splitD(txt){
    var s=String(txt||''),a=s.indexOf('[hangmok]'),b=s.indexOf('[wongo]');
    if(a<0)return null;
    return {lore:((b>a)?s.slice(a+9,b):s.slice(a+9)).trim(),
            ms:((b>a)?s.slice(b+7):'').trim()};
  }
  function parseLore(t){
    var s=String(t||'').replace(/^```[a-z]*\s*/i,'').replace(/```\s*$/,'').trim();
    var a=s.indexOf('['),b=s.lastIndexOf(']');
    if(a<0||b<a)return null;
    try{var v=JSON.parse(s.slice(a,b+1));return (v&&v.length)?v:null;}catch(_){return null;}
  }

  /* ── 把交回来的条目装进这一局 ─────────────────────────── */
  var SAY=/原文如是[。.]/;
  var LINE=/(「[^」]+」)/g;

  function quotesOf(entries){
    for(var i=0;i<entries.length;i++){
      var e=entries[i];
      if(!e||!/说话/.test(String(e.title||'')))continue;
      var m=SAY.exec(String(e.content||''));
      if(!m)continue;
      var got=String(e.content).slice(m.index+m[0].length).match(LINE);
      if(got&&got.length>=2)return got.slice(0,2);
    }
    return null;
  }

  function install(era, entries){
    /* ① 台词填回名册那一份：立身与识人上看到的就是这两句 */
    var by={};
    entries.forEach(function(e){
      if(!e||!e.cat)return;(by[e.cat]=by[e.cat]||[]).push(e);
    });
    /* 名字对不上就白写了。②那一段拿着名表把音写还原成原名，多半分毫不差，
       但偶尔会多带一个字（「尼禄」写成「尼禄皇帝」）。那种情况下按包含关系认领，
       认不着就宁可不填 —— 填错人比不填坏得多。 */
    function pick(name){
      if(by[name])return by[name];
      var ks=Object.keys(by),hit=null;
      for(var i=0;i<ks.length;i++){
        var k=ks[i];
        if(k.indexOf(name)>=0||name.indexOf(k)>=0){ if(hit)return null; hit=by[k]; }
      }
      return hit;
    }
    try{
      (FE.eras||[]).forEach(function(E){
        if(E.i!==era)return;
        (E.figs||[]).forEach(function(f){
          var g=pick(f.n);if(!g)return;
          var q=quotesOf(g);
          if(q){f.q=q;f.pend=0;}
        });
      });
      /* 已经掷好的这一池人也跟着换 —— 玩家可能正停在识人那一步 */
      (FE.pool||[]).forEach(function(p){
        var g=pick(p.n);if(!g)return;
        var q=quotesOf(g);
        if(q)p.q=q;
        p.koDoss=g;
      });
      var hg=FE.hero?pick(FE.hero.n):null;
      if(hg){
        var hq=quotesOf(hg);
        if(hq)FE.hero.q=hq;
        FE.hero.koDoss=hg;
      }
    }catch(_){}

    /* ② 六条条目装进当前时代的 Risu 原生世界书，按关键词触发 */
    try{
      var C=CARDS&&CARDS.luzhi;if(!C)return;
      C.lorebook=C.lorebook||[];
      var have={};
      C.lorebook.forEach(function(e){if(e&&e.title)have[e.title]=1;});
      entries.forEach(function(e){
        if(!e||!e.title||have[e.title])return;
        C.lorebook.push({title:e.title,cat:e.cat,keys:e.keys||[e.cat],
                         content:e.content,ord:60,era:era,on:true});
      });
    }catch(_){}
  }

  /* ── 一批的三段 ─────────────────────────────────────────── */
  function forgeBatch(era, list, done){
    var zh=zhCard(FE.era, list);

    function call(msgs,opt,ok,bad){
      try{
        opt=opt||{};
        opt.aux=1;opt.noStream=true;
        risuInvoke(msgs,function(t){ok(String(t||''));},
                   function(m){bad(m||'请求失败');},opt);
      }catch(e){bad((e&&e.message)||'请求发不出去');}
    }

    /* ⓪ 译入 */
    function s0(retry){
      call([{role:'system',content:FE.ko.hand},{role:'user',content:P0+'\n\n'+zh}],
           {aux:true,noStream:true,max_tokens:3000},
           function(out){
             var sp=split0(out);
             if(!sp||!sp.scene||han(sp.scene)>0){
               if(!retry)return s0(1);
               return done(null,'事实卡没译干净');
             }
             s1(sp,0);
           }, function(m){done(null,m);});
    }
    /* ① 集笔 —— 见本八篇整个嵌进去。零汉字是这一段的锁。 */
    function s1(sp,retry){
      var pr=FE.ko.doss.replace('{{견본}}',FE.ko.samples.join('\n\n'))
                       .replace('{{장면}}',sp.scene)
                       .replace('{{COUNT}}',String(list.length));
      if(han(pr)>0)return done(null,'提示词里混进了汉字，已停手');
      call([{role:'user',content:pr}],{aux:true,noStream:true,max_tokens:8000},
           function(out){
             var d=splitD(out);
             if(!d||!d.lore||han(d.lore)>0||!hangul(d.lore)){
               if(!retry)return s1(sp,1);
               return done(null,'韩语条目没有回来');
             }
             s2(sp,d,0);
           }, function(m){done(null,m);});
    }
    /* ② 译出 —— 另一次请求，不带上文 */
    function s2(sp,d,retry){
      var tr=FE.ko.trdoss.replace('{{원고}}',d.lore+'\n\n'+d.ms)
                         .replace('{{표기}}',sp.names||'(없음)');
      call([{role:'user',content:tr}],{aux:true,noStream:true,max_tokens:8000},
           function(out){
             var z=splitD(out)||{lore:out};
             var arr=parseLore(z.lore);
             if(!arr){ if(!retry)return s2(sp,d,1); return done(null,'中文条目没有回来'); }
             done(arr,null);
           }, function(m){done(null,m);});
    }
    s0(0);
  }

  /* ── 一代的入口。跑在后台，不挡玩家 ─────────────────── */
  function run(era){
    if(K.run[era])return;                       /* 这一代正在写 */
    var cached=load()[era];
    if(cached&&cached.length){install(era,cached);return;}
    try{if(!apiReady())return;}catch(_){return;}
    if(!FE||!FE.ko||!FE.ko.doss||!FE.era||FE.era.i!==era)return;

    var pend=(FE.pool||[]).filter(function(p){return p.fig&&(!p.q||!p.q.length);});
    if(!pend.length)return;

    K.run[era]=1;
    var out=[],at=0;
    function step(){
      if(at>=pend.length){
        K.run[era]=0;
        if(out.length){install(era,out);save(era,out);}
        return;
      }
      var lot=pend.slice(at,at+PER);at+=PER;
      forgeBatch(era,lot,function(arr,err){
        if(arr&&arr.length){out=out.concat(arr);install(era,arr);}
        /* 一批没写成不拖累后面的：接着写下一批。全都没成也只是照旧用兜底台词。 */
        step();
      });
    }
    step();
  }

  window.FELKO={run:run, install:install, zhCard:zhCard};
})();
