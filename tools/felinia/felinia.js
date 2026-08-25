/* ═══════════════ FELINIA · 铸局四步 ═══════════════
   择地 LOCVS → 立身 PERSONA → 识人 SOCII → 此刻 SITVS → 铸局

   这一层只做一件事：把玩家选的东西整理成一份「场面事实」。
   正文一个字也不在这里写——交给 feForge 的三段闭合流程去写。

   资料在 /core/res/data/felinia/ 下，四份 JSON 加一张择地图，
   第一次进纪年页才去取；取不到就整层不开，纪年页照旧退回选局环。 */

var FE={ld:0,eras:null,gen:null,lore:null,ko:null,mm:null,mi:null,vn:null,
        era:null,line:null,loc:null,hero:null,soc:[],cur:null,pool:[],
        step:'loc',salt:0};
var FE_STEPS=[['loc','择地'],['per','立身'],['soc','识人'],['sit','此刻']];
var FE_BASE='/core/res/data/felinia/';

/* ── 取数：五样一次取齐，缺一样就算没取到 ── */
function feLoad(cb){
  if(FE.ld===2){cb(true);return;}
  if(FE.ld===1){ (FE._q=FE._q||[]).push(cb); return; }
  FE.ld=1;FE._q=[cb];
  function done(ok){
    FE.ld=ok?2:0;
    var q=FE._q||[];FE._q=null;
    q.forEach(function(f){try{f(ok);}catch(_){}});
  }
  function j(n){return fetch(FE_BASE+n).then(function(r){
    if(!r.ok)throw new Error(n+' '+r.status);return r.json();});}
  var img=new Promise(function(res,rej){
    var im=new Image();im.onload=function(){res(im);};im.onerror=rej;
    im.src='/core/res/img/annals/locus.png';});
  Promise.all([j('eras.json'),j('gen.json'),j('lore.json'),j('ko.json'),j('locus.json'),j('vn-images.json'),img])
    .then(function(a){
      FE.eras=a[0];FE.gen=a[1];FE.lore=a[2];FE.ko=a[3];FE.mm=a[4];FE.vn=a[5];FE.mi=a[6];
      feLoreInstall();
      done(true);
    }).catch(function(){done(false);});
}

/* 世界书装进卡里：空壳卡的 lorebook 是空的，装上以后 LIBER 那一页有内容，
   对局时 loreFor() 也能按关键词检索到。已经有条目就不覆盖（玩家自写的优先）。 */
function feLoreInstall(){
  try{
    var C=CARDS&&CARDS.luzhi;if(!C)return;
    if(C.lorebook&&C.lorebook.length)return;
    C.lorebook=FE.lore.slice();
  }catch(_){}
}
/* 定了纪年就把别代的条目关掉：通则常驻，本代五条参与检索，其余不发。
   不这么做，四十一代两百来条会一起抢注入预算，等于什么都没进去。 */
function feLoreBind(i){
  try{
    var lb=(CARDS&&CARDS.luzhi&&CARDS.luzhi.lorebook)||[];
    for(var k=0;k<lb.length;k++){var e=lb[k];
      if(e&&e.era!=null&&!e.custom)e.on=(e.era===i);}
  }catch(_){}
}

/* ── 定种子的随机：同一枚种子每次算出同一个人 ── */
function feHash(s){var h=2166136261>>>0,i;s=String(s);
  for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function feRng(seed){var a=seed>>>0;return function(){
  a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function fePick(r,a){return a[Math.floor(r()*a.length)%a.length];}
function fePickN(r,a,n){var c=a.slice(),o=[];
  while(o.length<n&&c.length)o.push(c.splice(Math.floor(r()*c.length),1)[0]);return o;}
function feInt(r,lo,hi){return lo+Math.floor(r()*(hi-lo+1));}
function feEsc(s){return String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
/* 汉字计数：闭合流程那三段全靠这一把尺 */
function feHan(s){var m=String(s==null?'':s).match(/[一-鿿]/g);return m?m.length:0;}

/* ═══════════ 生成机制 ═══════════
   写死的只有每代十位：名字、身份、一件事、口吻谱、两句签名台词。
   其余（年龄·身高·体重·毛色·形态型·服装·出生地·居住地·性情·尾耳·窝群关系）
   都是按种子现算的，所以同一个人每次进游戏都长一个样，换种子才换人。 */
var FE_MORPH_REG={
  '中国':['valley','urban','steppe','alpine'],
  '欧洲—地中海':['coast','valley','urban','court'],
  '草原—俄国':['steppe','boreal','alpine','urban'],
  '伊斯兰世界':['arid','coast','valley','steppe'],
  '新大陆':['coast','valley','urban','boreal'],
  '日本':['urban','coast','valley'],
  '旧大陆':['valley','steppe','arid','alpine']
};
function feMorphFor(r,era,ti){
  var t=String(ti||'');
  if(/宫|近侍|陪伴|仪|王|礼仪|近卫/.test(t))return feM('court');
  if(/船|港|缆|索|舰|水|渡|栈桥|码头|坞|泳|救援/.test(t))return feM('coast');
  if(/雪|冰|驿|传骑|巡检|边|营/.test(t))return feM(r()<.5?'boreal':'steppe');
  if(/沙|商路|驮|盐|井/.test(t))return feM('arid');
  var pool=FE_MORPH_REG[era.reg]||FE_MORPH_REG['旧大陆'];
  return feM(fePick(r,pool));
}
/* 现生的人配哪一谱：先按身份认，认不出再随便挑一谱。
   不这么做，看门的会用学堂顶嘴的口气说话，一眼就假。 */
var FE_VOICE_BY=[
 [/守|岗|夜|门上|候望|巡夜/,'v01'],
 [/兵|军|斥候|侦|驿|烽|卫|队|尉|哨|传令/,'v02'],
 [/侍|丫头|内宅|嬷嬷|家内|陪伴|婢|外勤/,'v03'],
 [/码头|搬|扛|苦力|摊|港上|杂役|挑|厨|灶|洗衣|打捞/,'v04'],
 [/商|贩|牙|中人|向导|驼|贸|护卫/,'v05'],
 [/祭|庙|僧|修|教|神|礼|律|法学|布道/,'v06'],
 [/抄|书|记|校|字|档|算|测|图|文书/,'v07'],
 [/工|厂|机|匠|窑|锻|织|坑|检验/,'v08'],
 [/台|唱|弹|伶|演|楼|后门/,'v09'],
 [/宫|近侍|仪|王|近卫|礼仪/,'v10'],
 [/医|药|产|护|病|伤|血/,'v11'],
 [/学徒|学生|堂|旁听|新来|新兵|降科/,'v13'],
 [/账|帐|社|保|借|钱|贷|行会|互助/,'v14'],
 [/雪|冰|寻|搜|巡检|传骑/,'v15'],
 [/译|语|通事/,'v16'],
 [/猎|追踪|林|野|导路|老手/,'v17'],
 [/铺|掌柜|卖|市|店/,'v18'],
 [/船|缆|索|桅|舱|港务|栈桥|坞|舰/,'v19'],
 [/沙龙|贵|夫人|小姐|伴读|画/,'v20'],
 [/逃|无籍|难民|外来|被扣|刚下|刚上/,'v21'],
 [/长姊|舍监|带一窝|窝群|母亲/,'v22'],
 [/官|吏|书记|登记|税|管事|里正|管家/,'v23'],
 [/展|样板|样本|归化|陈列|被展/,'v24']
];
function feVoiceFor(r,ti){
  var t=String(ti||''),i;
  for(i=0;i<FE_VOICE_BY.length;i++)if(FE_VOICE_BY[i][0].test(t))return FE_VOICE_BY[i][1];
  return fePick(r,FE.gen.voices).k;
}
/* 衣着先按身份挑：难民穿联军的制服、宫女穿船台的护腕，一眼就假。
   身份里的字与那件衣裳的说明有一个字对得上就算数，都对不上再随便挑一件。 */
function feDress(r,era,ti){
  var t=String(ti||''),hit=[],i,j,d;
  for(i=0;i<era.dress.length;i++){
    d=era.dress[i];
    for(j=0;j<t.length;j++)if(t.charAt(j)!=='的'&&d.indexOf(t.charAt(j))>=0){hit.push(d);break;}
  }
  return fePick(r,hit.length?hit:era.dress);
}
function feM(k){var m=FE.gen.morphs,i;for(i=0;i<m.length;i++)if(m[i].k===k)return m[i];return m[0];}
function feVoice(k){var v=FE.gen.voices,i;for(i=0;i<v.length;i++)if(v[i].k===k)return v[i];return v[0];}
function feOrigins(era){
  if(era&&era.og&&era.og.length)return era.og;   /* 前几代的地名与后世不通用，各有各的 */
  return FE.gen.origins[(era&&era.reg)||'旧大陆']||FE.gen.origins['旧大陆'];
}

/* 事迹里写了岁数（「十四岁」「三十八岁」），档案就得照那个数。
   另掷一个，档案第一行说十四、第二行说十二，读的人立刻不信这份档案了。 */
function feCnNum(s){
  var D={'\u96f6':0,'\u4e00':1,'\u4e8c':2,'\u4e09':3,'\u56db':4,
         '\u4e94':5,'\u516d':6,'\u4e03':7,'\u516b':8,'\u4e5d':9};
  var m=String(s||'').match(/([\u96f6\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341]{1,4})\u5c81/);
  if(!m)return 0;
  var t=m[1],i,v=0,cur=0,d;
  for(i=0;i<t.length;i++){
    d=t.charAt(i);
    if(d==='\u5341'){v+=(cur||1)*10;cur=0;}
    else cur=D[d];
  }
  v+=cur;
  return (v>=6&&v<=99)?v:0;
}
/* 年龄：按身份挑年龄段。学徒·学生·丫头往小了取，管事·长者往大了取。
   这个族群三十五岁已近老年，所以「老」的数字比人类小得多。 */
function feAge(r,ti,sp){
  var t=String(ti||'');
  if(sp!=='cat')return /老|长者|嬷嬷|院长|校长|行首|里正|将|帕夏|主教|牧师/.test(t)
    ? feInt(r,48,66) : feInt(r,26,52);
  if(/幼|学生|学徒|丫头|新兵|新来|旁听|孩子/.test(t))return feInt(r,11,16);
  if(/年长|长者|嬷嬷|老人|老太|老者|老匠|舍监|行首|班头|军官|中尉|上尉|校尉|大夫|医师|管事|里正/.test(t))return feInt(r,28,41);
  return feInt(r,17,29);
}
function feBody(r,morph,sp){
  if(sp!=='cat'){
    /* 体重要跟着身高走：各掷各的会掷出一米七八配五十公斤这种人 */
    var hh=feInt(r,152,180),bmi=19+r()*8;
    return{h:hh,w:Math.round(bmi*hh*hh/10000)};
  }
  var b=FE.gen.body,h=b.hLo+r()*(b.hHi-b.hLo),w=b.wLo+r()*(b.wHi-b.wLo);
  if(morph&&morph.k==='alpine')h-=4.5;
  if(morph&&morph.k==='steppe')h+=3.5;
  if(morph&&morph.k==='boreal')w+=2.5;
  if(morph&&morph.k==='arid')w-=2;
  return{h:Math.round(h*10)/10,w:Math.round(w*10)/10};
}
function feFur(r,morph){
  var pool=(morph&&morph.k==='court')?FE.gen.fursRare.concat(FE.gen.furs.slice(0,8)):FE.gen.furs;
  return fePick(r,pool);
}

/* 一份档案。fig 给了就是册上那一位，没给就按这一代的身份表现生一位。 */
function feMake(era,fig,salt,forcedSp){
  var seed=feHash(era.i+'|'+((fig&&fig.n)||'x')+'|'+(salt==null?'':salt));
  var r=feRng(seed);
  var sp=fig?fig.sp:(forcedSp||'cat');
  var ti=fig?fig.ti:fePick(r,era.roles);
  var told=fig?feCnNum(fig.d):0;          /* 事迹里明写的岁数，优先 */
  var morph=(sp==='cat')?feMorphFor(r,era,ti):null;
  var b=feBody(r,morph,sp);
  var og=feOrigins(era);
  /* 出生地与居住地都取「地方」，不取场所——「居住地：后门」是笑话，
     后门是干活的地方。场所（era.locs）只用来定这一幕在哪儿发生。
     住处多半就是这一代本地人住的那种屋子；出身则可近可远。 */
  var two=fePickN(r,og,2);
  var _b=r();
  var born=(_b<.5)?two[0]
    :((_b<.78)?era.home
      :(fePick(r,FE.gen.origins[fePick(r,Object.keys(FE.gen.origins))])+'（远地）'));
  var here=(r()<.8)?era.home:(two[1]||two[0]);
  if(born===here)born=(two[0]===here?(two[1]||og[0]):two[0]);   /* 生处与住处不能同一句话说两遍 */
  var _rp=(sp==='cat')?FE.gen.relations:(FE.gen.relationsH||FE.gen.relations);
  var rel=fePick(r,_rp).replace('{a}',fePick(r,og));
  var v=feVoice(fig?fig.v:feVoiceFor(r,ti));
  return{
    id:seed, era:era.i, sp:sp, fig:fig||null, salt:(salt==null?'':salt),
    n:fig?fig.n:feName(r,era,seed),
    ti:ti, d:fig?fig.d:'', q:fig?fig.q.slice():[],
    age:told||feAge(r,ti,sp), h:b.h, w:b.w,
    fur:(sp==='cat')?feFur(r,morph):'', mark:(sp==='cat')?fePick(r,FE.gen.furMarks):'',
    morph:morph, dress:feDress(r,era,ti),
    born:born, live:here,
    temper:fePickN(r,FE.gen.temper,2), tail:(sp==='cat')?fePick(r,FE.gen.tails):'',
    rel:rel, v:v,
    /* 范本台词固定两句，加上本人的两句，凑成「原文如是。」后面的四到六句 */
    vq:fePickN(r,v.q,r()<.5?3:4)
  };
}
/* 没有写在册上的人，名字按这一代的取名法现起：
   取名法是一句人话（写在 era.nm 里），程序做不到照着它造词，
   所以退一步——从这一代册上那十位的名字里取字重组，起出来的名字与本代同源。 */
var FE_TITLE=/嬷嬷|掌柜|管家|小姐|大娘|太太|夫人|先生|老爷|大爷|二爷|行首|里正|校尉|亭长|大夫|医生|医官|医师|上校|中尉|上尉|少尉|院长|校长|舍监|牧师|教士|祭司|帕夏|长者|老人|婆|哨长|工头|经理|东家|主母|队长|军官|书记|警长|管事|班头|老太|老匠|师|官|吏|长/;
/* 拼名字时不该当零件用的字：职称、说明的残片、以及只能打头不能收尾的那几个 */
var FE_NAMEBAD=/的|了|人|员|工|者|兵|吏|官|师|尉|长|主|队|民|介|绍|无|被|典|家|生|夫/;
var FE_HEADONLY='阿老小大';
function feName(r,era,seed){
  var stem=[],bag=[],i,k,t;
  for(i=0;i<era.figs.length;i++){
    t=String(era.figs[i].n);
    /* 带「·」的多半是「某处·某人」这类前后缀写法，只留后半段 */
    if(t.indexOf('\u00b7')>=0)t=t.split('\u00b7').pop();
    /* 「联军的少尉薇拉」这种：「的」后面那一截才是名字 */
    var m=t.match(/\u7684([^\u7684]{2,4})$/);
    if(m)t=m[1];
    /* 带称谓的整个不要：拿「柳嬷嬷」去拼字会拼出「阿嬷嬷」，那不是名字是官称 */
    if(FE_TITLE.test(t))continue;
    /* 只留看得出是名字的那一段。带这些字的多半还是职称或者说明的残片
       （「被典的」「雇员林」「少尉薇拉」），拿去拼字会拼出「介绍茂」这种东西。 */
    if(FE_NAMEBAD.test(t))continue;
    if(t.length>=2&&t.length<=4)stem.push(t);
  }
  if(!stem.length)for(i=0;i<era.figs.length;i++){
    t=String(era.figs[i].n).split('\u00b7').pop();
    if(t.length>=2)stem.push(t.slice(0,3));
  }
  for(i=0;i<stem.length;i++)for(k=0;k<stem[i].length;k++)
    if(bag.indexOf(stem[i].charAt(k))<0)bag.push(stem[i].charAt(k));
  /* 拼出来的名字不能跟册上那些人重名——同一局里两个同名，玩家会当成同一个人 */
  var taken={};
  for(k=0;k<era.figs.length;k++)taken[era.figs[k].n]=1;
  for(k=0;k<(FE.pool||[]).length;k++)taken[FE.pool[k].n]=1;
  function ok(n){return n.length>=2&&n.length<=4&&!taken[n];}
  var nm='';
  for(var tries=0;tries<60;tries++){
    var a=fePick(r,stem);
    var head=a.slice(0,(a.length>2&&r()<.5)?2:1);
    var tail=(r()<.6)?fePick(r,bag):fePick(r,stem).slice(-1);
    while(tail.length&&head.length&&head.charAt(head.length-1)===tail.charAt(0))
      tail=tail.slice(1);
    if(tail&&FE_HEADONLY.indexOf(tail.charAt(tail.length-1))>=0)continue;  /* 阿、老、小不收尾 */
    nm=head+tail;
    if(ok(nm))return nm;
  }
  /* 拼不出新的，就从字袋里随便取两个不重的字——比缀一个生僻字体面 */
  for(i=0;i<bag.length;i++)for(k=0;k<bag.length;k++){
    if(i===k)continue;
    if(FE_HEADONLY.indexOf(bag[k])>=0)continue;
    nm=bag[i]+bag[k];
    if(ok(nm))return nm;
  }
  return nm||'\u65e0\u540d';
}
/* 档案文本。一栏一件事——外貌栏不掺来历，开头栏不掺关系。
   最后那一栏是「怎么说话」：先散文，再四字标记，再台词，再一句底色。 */
/* 档案直出世界书人物条目：那六条（概要·外貌·来历·性情·关系·说话的样子）是逐字
   写定的成品，比现算的六栏详实得多，一个字不改地摆上来。现算的那一套只留给世界书里
   没有的人——自拟的主角、feSocMore 现生的路人；他们本来就不在名册上，没有条目可取。 */
var FE_DOSS_ORD={'\u4e00':1,'\u4e8c':2,'\u4e09':3,'\u56db':4,'\u4e94':5,'\u516d':6};
function feDossLore(p){
  try{
    if(!p||!p.fig||!p.n)return null;
    var lb=(CARDS&&CARDS.luzhi&&CARDS.luzhi.lorebook)||[];
    var ei=(FE&&FE.era&&FE.era.i),cat='\u4eba \u00b7 '+p.n,out=[],i,e,t,m,o;
    for(i=0;i<lb.length;i++){e=lb[i];
      if(!e||e.lay!=='figures'||e.cat!==cat)continue;
      if(ei!=null&&e.era!=null&&e.era!==ei)continue;
      /* 标题是「名字 · 第N项 · 栏名」，可名字本身也可能带 ·（「…的海报 · 穆夏」），
         所以从尾巴数：倒数第二段是第N项，最后一段是栏名。 */
      t=String(e.title||'');m=t.split(' \u00b7 ');
      o=(m.length>2&&FE_DOSS_ORD[m[m.length-2].charAt(1)])||99;
      out.push([o,(m.length>2?m[m.length-1]:t),String(e.content||'')]);
    }
    if(!out.length)return null;
    out.sort(function(a,b){return a[0]-b[0];});
    return out.map(function(x){return [x[1],x[2]];});
  }catch(_){return null;}
}
function feDoss(p){
  var LB=feDossLore(p);
  if(LB)return LB;                       /* 名册上的人一律走世界书 */
  var L=[];
  L.push(['概要', p.n+'，'+p.ti+'。'+(p.sp==='cat'?'猫娘':'人类')+'，'+p.age+'岁。'
          +(p.d?p.d+'。':'')]);
  if(p.sp==='cat')
    L.push(['外貌', p.morph.n+'（'+p.morph.m+'）。毛色'+p.fur+'，'+p.mark+'。身高'
            +p.h+'厘米，体重'+p.w+'公斤。']);
  else
    L.push(['外貌', '身高'+p.h+'厘米，体重'+p.w+'公斤。']);
  L.push(['来历', '生于'+p.born+'，如今住在'+p.live+'。衣着：'+p.dress+'。']);
  L.push(['性格', p.temper.join('；')+'。'+(p.tail?p.tail+'。':'')]);
  L.push(['关系', p.rel+'。']);
  var qs=[];
  if(p.q[0])qs.push(p.q[0]+'——当值时');
  if(p.q[1])qs.push(p.q[1]+'——私下里');
  for(var i=0;i<p.vq.length;i++)qs.push(p.vq[i][0]+'——'+p.vq[i][1]);
  L.push(['说话', p.v.p+'原文如是。'
          +qs.join('；')+'。'+p.v.i]);
  return L;
}
function feDossText(p){return feDoss(p).map(function(x){return x[0]+'　'+x[1];}).join('\n');}
function feDossHtml(p){return feDoss(p).map(function(x){
  return '<b>'+feEsc(x[0])+'\u3000</b>'+feEsc(x[1]);}).join('\n');}

/* ═══════════ 开层 ═══════════ */
function feOpen(row,line){
  if(!row||row.i==null)return false;
  if(FE.ld===2)return feOpen2(row,line);
  /* 资料还没到：这一次先拦下，取完再开。取不到（断网、文件缺）就自己退回选局环，
     玩家看到的还是从前那条路，不会卡在纪年页上。 */
  feLoad(function(ok){
    if(ok&&feOpen2(row,line))return;
    try{esClose();rebuildRing(line);menuExit();}catch(_){}
  });
  return true;
}
function feOpen2(row,line){
  var era=null,i;
  for(i=0;i<FE.eras.length;i++)if(FE.eras[i].i===row.i){era=FE.eras[i];break;}
  if(!era)return false;
  FE.era=era;FE.line=line||'luzhi';FE.loc=null;FE.soc=[];FE.cur=null;FE.salt=0;FE._fit=null;
  FE.hero=feMake(era,null,'hero0');FE.hero.self=1;FE.hero.pre=-1;
  FE.pool=era.figs.map(function(f,k){var p=feMake(era,f,'');p.pre=k;return p;});
  try{FE._esi=ES.i;}catch(_){}
  feLoreBind(era.i);
  try{ERA.year=era.y;ERA.sel=null;}catch(_){}
  esClose();
  $('#feWrap').classList.add('on');
  $('#feEraLbl').textContent=era.yl+'　·　'+era.t;
  feStep('loc');
  return true;
}
function feClose(){$('#feWrap').classList.remove('on');}
function feIsOpen(){return $('#feWrap').classList.contains('on');}

function feStep(s){
  FE.step=s;
  var w=$('#feWrap');w.setAttribute('data-step',s);
  var idx=0,k;
  for(k=0;k<FE_STEPS.length;k++)if(FE_STEPS[k][0]===s)idx=k;
  $('#feStName').textContent=FE_STEPS[idx][1];
  var its=document.querySelectorAll('#feSteps i');
  for(k=0;k<its.length;k++){
    its[k].classList.toggle('on',k===idx);
    its[k].classList.toggle('done',k<idx);
  }
  if(s==='loc')feLocRender();
  if(s==='per')fePerRender();
  if(s==='soc')feSocRender();
  if(s==='sit')feSitRender();
  feFootSync();
}
function feFootSync(){
  var go=$('#feGo'),hint=$('#feHint');
  var ok=true,txt='PERGERE&nbsp;⏎';
  if(FE.step==='loc'){ok=!!FE.loc;hint.textContent='● LOCVS　在图上拣一处';}
  if(FE.step==='per'){ok=!!(FE.hero&&String(FE.hero.n||'').trim());
    hint.textContent='● PERSONA　这一局你扮演的人';}
  if(FE.step==='soc'){hint.textContent='● SOCII　已选 '+FE.soc.length+' 位（可以一位不选）';}
  if(FE.step==='sit'){txt='INCIPERE&nbsp;·&nbsp;铸局';hint.textContent='● SITVS　写完就开局';}
  go.innerHTML=txt;
  go.classList.toggle('off',!ok);
}
function feNext(){
  if($('#feGo').classList.contains('off'))return;
  var i=0,k;for(k=0;k<FE_STEPS.length;k++)if(FE_STEPS[k][0]===FE.step)i=k;
  if(i<FE_STEPS.length-1)feStep(FE_STEPS[i+1][0]);
  else feForge();
}
function fePrev(){
  var i=0,k;for(k=0;k<FE_STEPS.length;k++)if(FE_STEPS[k][0]===FE.step)i=k;
  if(i>0){feStep(FE_STEPS[i-1][0]);return;}
  feClose();
  try{
    esOpen(FE.line);
    if(FE._esi!=null){ES.i=FE._esi;esRender();
      setTimeout(function(){try{esLayout();esThin();}catch(_){}},60);}
  }catch(_){}
}

/* ═══ 一 · 择地 ═══ */
function feLocRender(){
  var im=$('#feMapImg');if(!im.src)im.src=FE.mi.src;
  feMapFitOnce();feMapDragInit();
  var box=$('#feMapIn'),k;
  var old=box.querySelectorAll('.feMk,.feLn');
  for(k=0;k<old.length;k++)old[k].remove();
  var pts=feLocLayout();
  FE.era.locs.forEach(function(L,n){
    var pt=pts[n];
    if(pt.dx||pt.dy){                       /* 挪过位的，拉一条细线回真正的那一点 */
      var len=Math.sqrt(pt.dx*pt.dx+pt.dy*pt.dy);
      var ln=document.createElement('div');
      ln.className='feLn';
      ln.style.left=pt.x0+'px';ln.style.top=pt.y0+'px';
      ln.style.width=len+'px';
      ln.style.transform='rotate('+Math.atan2(pt.dy,pt.dx)+'rad)';
      box.appendChild(ln);
    }
    var d=document.createElement('div');
    d.className='feMk'+(FE.loc===L?' on':'');
    d.style.left=(pt.x0+pt.dx)+'px';
    d.style.top=(pt.y0+pt.dy)+'px';
    d.innerHTML='<div class="dot"></div><div class="nm">'+feEsc(L.cn)+'</div>';
    d.addEventListener('pointerup',function(){feLocPick(n);});
    box.appendChild(d);
  });
  feLocList();
  feLocInfo();
}
/* 左板的地点清单：与图上的标记一一对应，点哪一边都一样。
   图上那几枚标记在同一座城里会挤成一团，清单是给「看名字挑」的人预备的。 */
function feLocList(){
  var box=$('#feLocList');if(!box)return;
  box.innerHTML='';
  FE.era.locs.forEach(function(L,n){
    var b=document.createElement('button');
    b.className='feLoc'+(FE.loc===L?' on':'');
    b.type='button';
    b.innerHTML='<b>'+feEsc(L.cn)+'</b><span>'+feEsc(L.n)+'</span>';
    b.addEventListener('click',function(){feLocPick(n);});
    box.appendChild(b);
  });
}
function feProjX(lo){return (lo+180)/360;}
function feProjY(la){return (FE.mm.laTop-la)/(FE.mm.laTop-FE.mm.laBot);}

/* 这幅图的投影是均匀的：经纬每一度都是同样的像素（宽 2520/360 ＝ 高 980/140 ＝ 7），
   所以缩放只要一个倍数，不必分方向算。
   镜头对着这一代的地点群，视野至少两百四十度：这一层要先让人认出「这是世界的哪一边」，
   再看清是哪一处。放得太近就只剩几块砖，认不出地方；同一座城里的几处地方靠散开解决，
   不靠推近镜头。 */
function feMapFit(){
  var host=$('#feMap'),box=$('#feMapIn');
  if(!host||!box||!FE.era)return;
  var W=host.clientWidth,H=host.clientHeight;
  if(W<60||H<60)return;
  var lo0=1e9,lo1=-1e9,la0=1e9,la1=-1e9;
  FE.era.locs.forEach(function(L){
    lo0=Math.min(lo0,L.lo);lo1=Math.max(lo1,L.lo);
    la0=Math.min(la0,L.la);la1=Math.max(la1,L.la);});
  var cLo=(lo0+lo1)/2,cLa=(la0+la1)/2;
  var span=Math.max(lo1-lo0,(la1-la0)*W/H)*1.9+24;
  span=Math.max(240,Math.min(360,span));
  var sc=W/(span*(FE.mm.w/360));
  var bw=FE.mm.w*sc,bh=FE.mm.h*sc;
  var cx=feProjX(cLo)*bw,cy=feProjY(cLa)*bh;
  var L=W/2-cx,T=H/2-cy;
  L=(bw>W)?Math.min(0,Math.max(W-bw,L)):(W-bw)/2;
  T=(bh>H)?Math.min(0,Math.max(H-bh,T)):(H-bh)/2;
  box.style.width=bw+'px';box.style.height=bh+'px';
  box.style.left=L+'px';box.style.top=T+'px';
  FE._bw=bw;FE._bh=bh;FE._fit=FE.era.i+'|'+W+'x'+H;
}
/* 摆位只在「换了一代」或「窗口尺寸变了」时重来。
   否则从立身退回择地，会把玩家刚拖到的位置弹回默认视野。 */
function feMapFitOnce(){
  var host=$('#feMap');if(!host||!FE.era)return;
  var k=FE.era.i+'|'+host.clientWidth+'x'+host.clientHeight;
  if(FE._fit===k)return;
  feMapFit();
}
/* ── 图可以拖，也可以缩 ──
   拖：按住图往哪儿拖就往哪儿走，边界卡住不让图离开视野。
   缩：滚轮／双指，以指针为定点，缩放范围是「整幅刚好铺满宽度」到「放大八倍」。
   拖过就不算点击——阈值六像素，免得手一抖把地点选错。 */
function feMapClamp(){
  var host=$('#feMap'),box=$('#feMapIn');
  if(!host||!box)return;
  var W=host.clientWidth,H=host.clientHeight,bw=FE._bw||0,bh=FE._bh||0;
  if(bw<1||bh<1)return;
  var L=parseFloat(box.style.left)||0,T=parseFloat(box.style.top)||0;
  L=(bw>W)?Math.min(0,Math.max(W-bw,L)):(W-bw)/2;
  T=(bh>H)?Math.min(0,Math.max(H-bh,T)):(H-bh)/2;
  box.style.left=L+'px';box.style.top=T+'px';
}
function feMapZoom(f,ox,oy){
  var host=$('#feMap'),box=$('#feMapIn');
  if(!host||!box||!FE.mm)return;
  var W=host.clientWidth,bw=FE._bw||0,bh=FE._bh||0;
  if(bw<1)return;
  var min=W,max=W*8;
  var nw=Math.max(min,Math.min(max,bw*f));
  if(Math.abs(nw-bw)<0.5)return;
  var k=nw/bw;
  var L=parseFloat(box.style.left)||0,T=parseFloat(box.style.top)||0;
  /* 指针底下那一点在缩放前后落在同一处 */
  box.style.left=(ox-(ox-L)*k)+'px';
  box.style.top=(oy-(oy-T)*k)+'px';
  FE._bw=nw;FE._bh=bh*k;
  box.style.width=FE._bw+'px';box.style.height=FE._bh+'px';
  feMapClamp();feLocRender();
}
function feMapDragInit(){
  var host=$('#feMap');if(!host||feMapDragInit._on)return;
  feMapDragInit._on=1;
  var P={},lx=0,ly=0,moved=0,pin0=0,mid0=null,drag=false,swallow=0,cap=0;
  function pts(){return Object.keys(P);}
  function dist(){var k=pts(),a=P[k[0]],b=P[k[1]];return Math.hypot(a.x-b.x,a.y-b.y);}
  function mid(){var k=pts(),a=P[k[0]],b=P[k[1]];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
  host.addEventListener('pointerdown',function(e){
    P[e.pointerId]={x:e.clientX,y:e.clientY};
    if(pts().length===2){drag=false;pin0=dist();mid0=mid();return;}
    /* 按下时先不捕获指针：一捕获，后续 pointerup 就全被这块图劫走，
       地点标记（它认的正是 pointerup）再也收不到，点了没反应。
       等真的拖过阈值再捕获——轻点保持原样，拖动照旧跟手。 */
    drag=true;moved=0;cap=0;lx=e.clientX;ly=e.clientY;
  });
  host.addEventListener('pointermove',function(e){
    if(!P[e.pointerId])return;
    P[e.pointerId]={x:e.clientX,y:e.clientY};
    if(pts().length>=2){
      var d=dist();
      if(pin0>0){
        var r=host.getBoundingClientRect(),m=mid();
        feMapZoom(d/pin0,m.x-r.left,m.y-r.top);
        pin0=d;
      }
      return;
    }
    if(!drag)return;
    var dx=e.clientX-lx,dy=e.clientY-ly;
    lx=e.clientX;ly=e.clientY;
    moved+=Math.abs(dx)+Math.abs(dy);
    if(!cap){
      if(moved<=6)return;              /* 还没算拖，先不动图 */
      cap=1;try{host.setPointerCapture(e.pointerId);}catch(_){}
    }
    var box=$('#feMapIn');
    box.style.left=((parseFloat(box.style.left)||0)+dx)+'px';
    box.style.top=((parseFloat(box.style.top)||0)+dy)+'px';
    feMapClamp();
  });
  function up(e){
    delete P[e.pointerId];
    if(pts().length<2){pin0=0;mid0=null;}
    if(pts().length===0){
      /* 只标记「紧接着的那一下点击要吞掉」，用完即清。
         原来用 setTimeout 复位 moved，下一次点还落在旧值上，
         于是拖过之后第一次点地点会被白白吞掉。 */
      if(drag&&moved>6)swallow=1;
      drag=false;moved=0;cap=0;
    }
  }
  host.addEventListener('pointerup',up);
  host.addEventListener('pointercancel',up);
  host.addEventListener('pointerleave',up);
  /* 拖过就别把这一下算成点地点——只吞这一下 */
  host.addEventListener('click',function(e){
    if(swallow){swallow=0;e.stopPropagation();e.preventDefault();}
  },true);
  /* 触控板与鼠标滚轮发的是同一种事件，但人的意思完全不同：
       · 触控板双指滑动 = 平移（Mac 上「拖」就是这个动作）
       · 触控板双指捏合 = 缩放，浏览器会把它报成 ctrlKey 的 wheel
       · 鼠标滚轮       = 缩放（看地图的老规矩）
     所以按下面三条分：带 ctrl 的一律缩放；有横向分量、或纵向步子很碎的，
     是触控板在滑，走平移；其余当成鼠标滚轮，缩放。
     判据用 deltaMode（0＝像素，鼠标滚轮常报 1＝行）加步长——
     鼠标滚轮一格通常是 100 上下的整数，触控板是连续的小数。 */
  host.addEventListener('wheel',function(e){
    e.preventDefault();
    var r=host.getBoundingClientRect();
    if(e.ctrlKey){                       /* 捏合 */
      feMapZoom(Math.exp(-e.deltaY*0.012),e.clientX-r.left,e.clientY-r.top);
      return;
    }
    var pad=(e.deltaMode===0)&&(Math.abs(e.deltaX)>0||Math.abs(e.deltaY)<50);
    if(pad){                             /* 触控板双指滑 = 平移 */
      var box=$('#feMapIn');
      box.style.left=((parseFloat(box.style.left)||0)-e.deltaX)+'px';
      box.style.top=((parseFloat(box.style.top)||0)-e.deltaY)+'px';
      feMapClamp();
      return;
    }
    feMapZoom(Math.exp(-e.deltaY*0.0016),e.clientX-r.left,e.clientY-r.top);
  },{passive:false});
}
/* 同一座城里的几处地方，投影上几乎是同一点。照实画就只剩一枚标记，
   另外三处点不着。所以重叠的往外散开，再拉一条细线回真正的那一点——
   散是为了点得着，线是为了不骗人。 */
function feLocLayout(){
  var bw=FE._bw||1,bh=FE._bh||1,MIND=54;
  var pts=FE.era.locs.map(function(L){
    return{x0:feProjX(L.lo)*bw,y0:feProjY(L.la)*bh,dx:0,dy:0};});
  var placed=[],i,k,a,rad,tries;
  for(i=0;i<pts.length;i++){
    var p=pts[i],ok=false;
    for(tries=0;tries<40&&!ok;tries++){
      if(tries){ rad=32+Math.floor(tries/8)*26;
                 a=(-Math.PI/2)+(tries%8)*(Math.PI/4)+i*0.4;
                 p.dx=Math.cos(a)*rad;p.dy=Math.sin(a)*rad; }
      ok=true;
      for(k=0;k<placed.length;k++){
        var q=placed[k],ddx=(p.x0+p.dx)-(q.x0+q.dx),ddy=(p.y0+p.dy)-(q.y0+q.dy);
        if(ddx*ddx+ddy*ddy<MIND*MIND){ok=false;break;}
      }
    }
    placed.push(p);
  }
  return pts;
}
function feLocPick(n){
  FE.loc=FE.era.locs[n];
  var ms=document.querySelectorAll('#feMapIn .feMk'),k;
  for(k=0;k<ms.length;k++)ms[k].classList.toggle('on',k===n);
  feLocInfo();feFootSync();
}
function feLocSync(){
  var box=$('#feLocList');if(!box)return;
  var bs=box.children;
  for(var i=0;i<bs.length;i++)bs[i].classList.toggle('on',FE.era.locs[i]===FE.loc);
}
function feLocInfo(){
  feLocSync();
  var L=FE.loc;
  $('#feLocN').textContent=L?L.n:'—';
  $('#feLocCn').textContent=L?L.cn:'在图上拣一处';
  $('#feLocD').textContent=L?L.d:'这一代能落脚的地方都标在图上。点一处，下面会写清那里是做什么的。';
  $('#feLocW').textContent=L?(FE.era.yl+'　'+FE.era.t+'　·　'+FE.era.s+'　·　'+FE.era.reg):'';
}

/* ═══ 二 · 立身 ═══ */
var FE_FIELDS=[
  ['sp','种属 SPECIES','species'],
  ['n','姓名 NOMEN','text'],
  ['age','年龄 AETAS','num'],
  ['h','身高（厘米）','num'],
  ['w','体重（公斤）','num'],
  ['fur','毛色','sel'],
  ['morph','品种 · 形态型','sel'],
  ['dress','服装','sel'],
  ['ti','身份地位','sel'],
  ['born','出生地','sel'],
  ['live','居住地','sel'],
  ['temper','性格','sel']
];
function fePerRender(){
  var host=$('#fePreList');host.innerHTML='';
  var mk=function(lbl,sub,k){
    var b=document.createElement('button');
    b.className='fePre'+(FE.hero.pre===k?' on':'');
    b.innerHTML='<b>'+feEsc(lbl)+'</b><span>'+feEsc(sub)+'</span>';
    b.addEventListener('click',function(){fePerPick(k);});
    host.appendChild(b);
  };
  mk('自拟一个人','按这一代的身份与服装现掷一个，各栏都能改',-1);
  FE.pool.forEach(function(p,k){
    if(!p.fig)return;                     /* 识人那一步现生的，不进这张预设表 */
    mk(p.n,(p.sp==='cat'?'猫娘':'人类')+'　·　'+p.ti+'　·　'+p.d.slice(0,22)+(p.d.length>22?'…':''),k);
  });
  fePerForm();
}
function fePerPick(k){
  if(k<0){FE.hero=feMake(FE.era,null,'hero'+(FE.salt||0));FE.hero.self=1;FE.hero.pre=-1;}
  else{var s=FE.pool[k];FE.hero=feMake(FE.era,s.fig,s.salt);FE.hero.pre=k;FE.hero.self=0;}
  fePerRender();feFootSync();
}
function fePerForm(){
  var g=$('#fePerForm'),h=FE.hero;g.innerHTML='';
  var opts={
    sp:['cat','human'],
    fur:FE.gen.furs,
    morph:FE.gen.morphs.map(function(m){return m.n;}),
    dress:FE.era.dress,
    ti:FE.era.roles.concat(h.ti&&FE.era.roles.indexOf(h.ti)<0?[h.ti]:[]),
    born:feOrigins(FE.era).concat(FE.era.locs.map(function(L){return L.cn;})),
    live:FE.era.locs.map(function(L){return L.cn;}).concat(feOrigins(FE.era)),
    temper:FE.gen.temper
  };
  FE_FIELDS.forEach(function(f){
    var key=f[0],lbl=f[1],kind=f[2];
    if(h.sp!=='cat'&&(key==='fur'||key==='morph'))return;
    var d=document.createElement('div');d.className='feF';
    var cur=(key==='morph')?h.morph.n:(key==='temper'?h.temper[0]:h[key]);
    var inner='<label>'+feEsc(lbl)+'</label>';
    if(kind==='species'){
      inner+='<select data-k="sp"><option value="cat"'+(cur==='cat'?' selected':'')+'>猫娘</option>'
        +'<option value="human"'+(cur==='human'?' selected':'')+'>人类</option></select>';
    }else if(kind==='sel'){
      var list=opts[key].slice();
      if(list.indexOf(cur)<0)list.unshift(cur);
      inner+='<select data-k="'+key+'">'+list.map(function(o){
        return '<option'+(o===cur?' selected':'')+'>'+feEsc(o)+'</option>';}).join('')+'</select>';
    }else{
      inner+='<input data-k="'+key+'"'+(kind==='num'?' inputmode="numeric"':'')
        +' value="'+feEsc(cur)+'">';
    }
    d.innerHTML=inner;g.appendChild(d);
  });
  var els=g.querySelectorAll('[data-k]'),k;
  for(k=0;k<els.length;k++)els[k].addEventListener('change',fePerSync);
  for(k=0;k<els.length;k++)els[k].addEventListener('input',fePerSync);
  fePerDoss();
  fePerPortrait();
  $('#fePerT').textContent=(h.pre<0?'自拟一个人':('扮演　'+h.n));
  $('#fePerNote').textContent='这一代的取名法：'+FE.era.nm
    +'。　身体尺度按此世的通例：身高中位一四〇厘米、体重中位四〇公斤；'
    +'十至十二岁进入青春期，三十五岁以后已算老年。';
}
/* 这一栏是把上面填的东西照实摊开：交给神谕的就是这一份，不多不少。 */
function fePerDoss(){
  var el=$('#fePerDoss');if(!el)return;
  el.innerHTML='<div class="feColH" style="padding:0 0 8px">这一局交出去的档案</div>'
    +feDossHtml(FE.hero);
}
function fePerSync(){
  var els=$('#fePerForm').querySelectorAll('[data-k]'),k,h=FE.hero;
  var oldSp=h.sp,nextSp=oldSp;
  for(k=0;k<els.length;k++)if(els[k].getAttribute('data-k')==='sp')nextSp=els[k].value;
  if(nextSp!==oldSp){
    var keep={n:h.n,ti:h.ti,dress:h.dress,born:h.born,live:h.live,temper:h.temper.slice()};
    h=FE.hero=feMake(FE.era,null,'hero-species-'+nextSp+'-'+(FE.salt||0),nextSp);
    h.self=1;h.pre=-1;
    for(var q in keep)h[q]=keep[q];
    fePerForm();feFootSync();return;
  }
  for(k=0;k<els.length;k++){
    var key=els[k].getAttribute('data-k'),v=els[k].value;
    if(key==='morph'){
      for(var m=0;m<FE.gen.morphs.length;m++)if(FE.gen.morphs[m].n===v)h.morph=FE.gen.morphs[m];
    }else if(key==='temper'){ h.temper=[v,h.temper[1]]; }
    else h[key]=v;
  }
  $('#fePerT').textContent=(h.pre<0?'自拟一个人':('扮演　'+h.n));
  fePerDoss();fePerPortrait();feFootSync();
}

function fePerPortrait(person,empty){
  var img=$('#fePerPortraitImg'),cap=$('#fePerPortraitCap'),h=empty?null:(person||FE.hero);
  if(!img||!cap||!FE.vn){return;}
  if(!h){img.removeAttribute('src');img.classList.remove('ready');img.alt='';cap.textContent='';return;}
  var era=null,i;
  for(i=0;i<FE.vn.eras.length;i++)if(FE.vn.eras[i].eraIndex===FE.era.i){era=FE.vn.eras[i];break;}
  if(!era){img.removeAttribute('src');img.classList.remove('ready');cap.textContent='';return;}
  var exact=null;
  for(i=0;i<era.assets.single.length;i++){
    if(era.assets.single[i].species===h.sp&&era.assets.single[i].character===h.n){
      exact=era.assets.single[i];break;
    }
  }
  var pool=era.assets.single.filter(function(a){return a.species===h.sp&&!a.character;});
  if(!pool.length)pool=era.assets.single.filter(function(a){return a.species===h.sp;});
  if(!pool.length){img.removeAttribute('src');img.classList.remove('ready');cap.textContent='';return;}
  var idx;
  if(h.pre>=0){
    var same=[];
    for(i=0;i<FE.pool.length;i++)if(FE.pool[i].sp===h.sp&&FE.pool[i].fig)same.push(i);
    idx=Math.max(0,same.indexOf(h.pre))%pool.length;
  }else idx=feHash(h.id+'|'+h.sp)%pool.length;
  var src=exact?exact.src:pool[idx].src;
  img.classList.remove('ready');
  img.alt=h.n+'（'+(h.sp==='cat'?'猫娘':'人类')+'）';
  img.onload=function(){img.classList.add('ready');};
  img.onerror=function(){img.classList.remove('ready');};
  if(img.getAttribute('src')===src&&img.complete)img.classList.add('ready');
  else img.src=src;
  cap.textContent=h.n+'　·　'+(h.sp==='cat'?'猫娘':'人类');
}

/* ═══ 三 · 识人 ═══ */
function feSocRender(){
  var host=$('#feSocList');host.innerHTML='';
  FE.pool.forEach(function(p,k){
    if(FE.hero&&FE.hero.pre===k)return;         /* 你演的那一位不再列进相关人物 */
    var d=document.createElement('div');
    d.className='feCard'+(FE.soc.indexOf(k)>=0?' on':'')+(FE.cur===k?' cur':'');
    d.innerHTML='<b>'+feEsc(p.n)+'</b><i>'+feEsc(p.ti)+'　'+(p.sp==='cat'?'猫娘':'人类')
      +'　'+p.age+'岁</i><span>'+feEsc(p.d?p.d.slice(0,38)+(p.d.length>38?'…':''):p.v.n)+'</span>';
    d.addEventListener('pointerup',function(){feSocTap(k);});
    host.appendChild(d);
  });
  feSocDoss();
}
function feSocTap(k){
  if(FE.cur!==k){FE.cur=k;feSocRender();return;}   /* 第一下看档案，第二下才选中 */
  var i=FE.soc.indexOf(k);
  if(i>=0)FE.soc.splice(i,1);
  else if(FE.soc.length<5)FE.soc.push(k);
  feSocRender();feFootSync();
}
function feSocDoss(){
  var el=$('#feDoss');
  if(FE.cur==null){fePerPortrait(null,true);
    el.textContent='点左边任意一位，这里出档案。再点一下，才把她带进这一局。';return;}
  var p=FE.pool[FE.cur];
  fePerPortrait(p);
  el.innerHTML=feDossHtml(p)
    +'\n\n'+(FE.soc.indexOf(FE.cur)>=0?'—— 已带进这一局。再点一下取消。'
                                      :'—— 再点一下，把她带进这一局。');
}
function feSocMore(){
  FE.salt++;
  var p=feMake(FE.era,null,'npc'+FE.salt+'-'+Date.now());
  p.pre=FE.pool.length;p.d='';p.fig=null;
  FE.pool.push(p);FE.cur=p.pre;
  feSocRender();feFootSync();
}

/* ═══ 四 · 此刻 ═══ */
function feSitRender(){
  var h=FE.hero,s=[];
  s.push(['纪年',FE.era.yl+'　'+FE.era.t+'　（'+FE.era.age+'　·　'+FE.era.reg+'）']);
  s.push(['地点',FE.loc?(FE.loc.cn+'（'+FE.loc.n+'）　'+FE.loc.d):'未定']);
  s.push(['扮演',h.n+'　'+h.ti+'　'+h.age+'岁　'
          +(h.sp==='cat'?(h.morph.n+'　毛色'+h.fur):'人类')]);
  s.push(['同场',FE.soc.length?FE.soc.map(function(k){
    return FE.pool[k].n+'（'+FE.pool[k].ti+'）';}).join('、'):'（未指定，由神谕按此地此时安排）']);
  $('#feSum').innerHTML=s.map(function(x){
    return '<b>'+feEsc(x[0])+'\u3000</b>'+feEsc(x[1]);}).join('\n');
}

/* ═══════════ 场面事实 ═══════════
   这一份是交给闭合流程的原料，不是给玩家读的。
   只写世界、扮演的人、身体、在场的人、要写的那一幕——
   不写情节、目标、障碍、结束的地方。那几样不归这里定。 */
function feSceneZh(){
  var e=FE.era,h=FE.hero,L=FE.loc,o=[];
  o.push('［世界］');
  o.push('年代：'+e.yl+'（'+e.age+'）　地区：'+e.reg);
  o.push('这一代：'+e.w);
  o.push('在场的制度：'+e.inst.join('、'));
  o.push('这个世界的身体：猫娘身高中位一四〇厘米，体重中位四〇公斤；有猫耳与尾巴，'
        +'手是人手、掌面有肉垫，脚是猫脚；跑得远快于人类，能爬墙翻屋顶，夜视好，天生会游，'
        +'正面挨打极弱；血只能给同类；不能束腰，不能裹脚，不戴压耳的头巾；'
        +'情绪写在耳朵和尾巴上；寿命约人类一半，三十五岁以后已算老年。');
  o.push('');
  /* 名册上的人以世界书那六条为准。原来这里报的是 feMake 按种子现算的岁数、
     身高体重、毛色、出身地、窝群——跟世界书里逐字写定的那份对不上（同一个人
     一边说四十三岁一五六厘米，一边说三十岁一六八厘米），两份都标着「以此为准」
     一起进提示词，AI 只能各取一半。现算那套只留给世界书里没有的人：
     自拟的主角、另生的路人。 */
  var _hl=feDossLore(h);
  o.push('［叙述者］');
  o.push('姓名：'+h.n+'（这是卡里定下的名字，必须用这个名字）');
  o.push('种族：'+(h.sp==='cat'?'猫娘':'人类'));
  o.push('身份：'+h.ti);
  if(_hl){
    o.push('以下六条出自世界书，是这个人的定稿。凡有出入，一律以这六条为准。');
    for(var _i=0;_i<_hl.length;_i++)o.push(_hl[_i][0]+'：'+_hl[_i][1]);
    o.push('');
  }else{
    o.push('年龄：'+h.age+'岁');
    o.push('性格：'+h.temper.join('；'));
    o.push('说话的样子：'+h.v.p);
    o.push('心里的样子：'+h.v.i);
    o.push('');
    o.push('［身体］');
    o.push('身高：'+h.h+'厘米　体重：'+h.w+'公斤');
    if(h.sp==='cat'){
      o.push('形态：'+h.morph.n+'（'+h.morph.m+'）');
      o.push('毛色：'+h.fur+'，'+h.mark);
      o.push('耳与尾：'+(h.tail||'情绪一动，耳朵和尾巴就跟着动'));
      o.push('脚：猫科脚掌与肉垫，不穿人类鞋楦');
    }
    o.push('身上：'+h.dress);
    o.push('出生地：'+h.born+'　居住地：'+h.live);
    o.push('窝群：'+h.rel);
    o.push('');
  }
  o.push('［在场的人］');
  if(FE.soc.length){
    FE.soc.forEach(function(k){
      var p=FE.pool[k];
      /* 名册上的同伴只报名字身份：他们那六条会在名字出现时由 loreFor 从
         世界书注入（人物条目有独立预算桶），这里再抄一遍是重复占上下文，
         而且抄的是现算值，正好又对不上。 */
      if(feDossLore(p))
        o.push(p.n+'——'+p.ti+'，'+(p.sp==='cat'?'猫娘':'人类')
          +'。（此人的详细条目在世界书里，按名字检索，以那份为准）');
      else
        o.push(p.n+'——'+p.ti+'，'+(p.sp==='cat'?'猫娘':'人类')+'，'+p.age+'岁。'
          +(p.d?p.d+'。':'')+'说话：'+p.v.p);
    });
  }else o.push('（没有指定。这一幕里可以只有叙述者一个人。不要另起新的人名。）');
  o.push('');
  o.push('［要写的那一幕］');
  o.push('这是开局。');
  o.push('时刻与地点：'+(L?(L.cn+'（'+L.n+'）。'+L.d+'。'):'由这一代与这个身份自然推出。'));
  var sit=String($('#feSit').value||'').trim();
  if(sit)o.push('此刻：'+sit);
  o.push('');
  o.push('［写的时候］');
  o.push('人名只用上面写到的。不要另起新名字。');
  o.push('不要解释这个世界的规矩。');
  o.push('不要在正文里做算术，不要报数目、算余额。');
  o.push('要写得长。对白要多。');
  return o.join('\n');
}

/* 交给译入沙盒的中文指示。用中文写是对的：这一段本来就是「中文指示 → 韩语」那一步。 */
var FE_P0='把下面这份「场面事实」改写成韩语，交回两块内容。\n\n'
 +'第一块，以单独一行「[jangmyeon]」开头，其后是韩语的场面文件：\n'
 +'· 只保留原有的那几栏：世界、叙述者、身体、在场的人、要写的那一幕、写的时候。\n'
 +'· 不要添加情节、目标、障碍、这一幕怎么收。那几样不归你定。\n'
 +'· 栏目标记用什么符号都行，但整块里一个汉字都不许出现。\n'
 +'· 人名与地名一律改成韩文音写。\n'
 +'· 「这是开局」那一句必须保留，要让读到的人一眼看出这是开局。\n\n'
 +'第二块，以单独一行「[ireumpyo]」开头，其后每行一条，形如\n'
 +'    韩文音写 | 原名\n'
 +'把你在第一块里音写过的每一个人名与地名都列进去。这一块里可以出现原名。\n\n'
 +'只交回这两块，不要解释，不要写别的。';

function feSplit0(txt){
  var s=String(txt||'');
  var a=s.indexOf('[jangmyeon]'), b=s.indexOf('[ireumpyo]');
  if(a<0)return null;
  var scene=(b>a)?s.slice(a+11,b):s.slice(a+11);
  var names=(b>a)?s.slice(b+10):'';
  return{scene:scene.trim(),names:names.trim()};
}

/* 未接神谕时看到的那一幕，以及铸局失败时退回的那一幕。
   它不是小说，是一份摊开的场面：这一代是什么样、这一处做什么、谁在旁边、你是谁。
   写得长一点是有道理的——正文那一栏顶上压着三维画面，太短就整幕藏在画面后头。 */
function feDraftText(){
  var e=FE.era,h=FE.hero,L=FE.loc,o=[];
  o.push(e.yl+'　'+e.t+'　'+(L?(L.cn+'（'+L.n+'）'):''));
  o.push('');
  o.push('——这一代——');
  o.push(e.w);
  o.push('在场的制度：'+e.inst.join('、')+'。');
  o.push('钱的尺子：'+e.coin+'。');
  o.push('');
  if(L){
    o.push('——此地——');
    o.push(L.cn+'，'+L.d+'。');
    o.push((e.s&&L.d.indexOf(e.s)<0&&e.s.indexOf(L.d)<0?(e.s+'。'):'')
      +'本地人多半住在'+e.home+'。');
    o.push('');
  }
  /* 名册上的人用世界书那两条（概要与外貌）。这一段会原样落进正文当第一幕，
     往后每一回都跟着上下文走——写着现算的岁数与出身，等于开局第一句就跟
     世界书里那份定稿打对台。摆概要与外貌两条，是因为对不上的事实都在这两条里。 */
  var _dl=feDossLore(h);
  o.push('——你——');
  if(_dl){
    o.push('你是「'+h.n+'」，'+h.ti+'。');
    for(var _i=0;_i<_dl.length;_i++)
      if(_dl[_i][0]==='概要'||_dl[_i][0]==='外貌')o.push(_dl[_i][1]);
  }else{
    o.push('你是「'+h.n+'」，'+h.ti+'，'+h.age+'岁。'
      +(h.sp==='cat'?(h.morph.n+'，毛色'+h.fur+'，'+h.mark+'。身高'+h.h+'厘米，体重'+h.w+'公斤。'):''));
    o.push('身上是'+h.dress+'。生于'+h.born+'，如今住在'+h.live+'。');
    o.push(h.temper.join('；')+'。'+(h.tail?h.tail+'。':''));
    o.push(h.rel+'。');
  }
  o.push('');
  if(FE.soc.length){
    o.push('——在场的人——');
    FE.soc.forEach(function(k){
      var p=FE.pool[k];
      if(feDossLore(p))
        o.push(p.n+'　'+p.ti+(p.sp==='cat'?'　猫娘':(/人类/.test(p.ti)?'':'　人类'))+'。');
      else
        o.push(p.n+'　'+p.ti+(p.sp==='cat'?'　猫娘':(/人类/.test(p.ti)?'':'　人类'))+'　'+p.age+'岁。'
          +(p.d?p.d+'。':'')+(p.q[0]?('她的口头：'+p.q[0]):''));
    });
    o.push('');
  }
  o.push('——此刻——');
  var sit=String($('#feSit').value||'').trim();
  o.push(sit||('这一幕自你落脚之刻写起。'+(L?(L.cn+'的活照旧在做，'):'')+'没有人特意在等你。'));
  o.push('');
  o.push('开口、动身，或先看看四周。');
  return o.join('\n');
}

/* ═══════════ 铸局 ═══════════ */
function feForge(){
  var e=FE.era,h=FE.hero,L=FE.loc;
  var y=e.y, yl=e.yl, cn=L?L.cn:e.t, nm=L?L.n:'FELINIA';
  var line=FE.line||'luzhi';
  var loc=(y<0?(-y)+' A.C.N.':'A.D. '+y)+' · '+nm;

  /* 先把玩家填的东西灌进引擎原有的那几个位子：
     底稿（condereOp）、系统提示（condereSys）、情报台的人物段都从这里读。 */
  feSyncEngine();
  feClose();

  /* 底稿的面板照旧由引擎拼（栏名要跟着卡的 panelSpec 走），正文换成本层这一份 */
  var draft=condereOp(line,y,nm,cn);
  /* 地点表随开局锚点一起存：读档续局时这一层不会再开，
     对局屏的地图与「此地」全靠它。只带画地图要用的那几栏。 */
  try{draft.feLocs=e.locs.map(function(L){
    return {n:L.n,cn:L.cn,la:L.la,lo:L.lo,d:L.d};});}catch(_){}
  var _mv=(String(draft.text).match(/<mvu_panel>[\s\S]*<\/mvu_panel>/)||[''])[0];
  draft.text=feDraftText()+(_mv?('\n\n'+_mv):'');
  /* loadOpening 里会把 GAME.hero 清成 null（正史开局一律是卡里的本尊），
     所以这一句必须排在它后面；铸局成稿再落一次 loadOpening 时也要再写一次，
     否则第二次之后「本局主角是谁」那一段就整段不发了。 */
  /* heroSheet 每回合都会把这几项写进【本局主角·以此为准】。名册上的人不能报
     现算的出身与岁数，否则每回合都在跟世界书对着干；性别同理，交给世界书说。 */
  var _hero=feDossLore(h)
    ?{n:h.n,g:'',a:'',o:h.ti,f:0}
    :{n:h.n,g:h.born,a:String(h.age),o:h.ti,f:1};
  loadOpening(line,draft,loc);
  GAME.hero=_hero;
  gameShow();

  if(!apiReady()){
    narrAdd('sys','…&nbsp;ORACVLVM&nbsp;未接线&nbsp;·&nbsp;此为程序化开局；接入&nbsp;AI&nbsp;后这一幕将由神谕现场铸写&nbsp;…',null);
    return;
  }

  var gen=TYPE_GEN, panel=(String(draft.text).match(/<mvu_panel>[\s\S]*<\/mvu_panel>/)||[''])[0];
  BUSY=true;genOpen('forge');
  function alive(){return gen===TYPE_GEN;}
  function fail(msg){
    BUSY=false;genClose();
    if(!alive())return;
    narrAdd('sys','⚠&nbsp;铸局失败：'+esc2(msg)+'&nbsp;——&nbsp;已回退为程序化开局，可在顶栏&nbsp;↻&nbsp;重演重试',null);
  }
  function call(msgs,opt,ok){
    oracleCall(msgs,function(t){if(alive())ok(String(t||''));},
               function(m){fail(m);},opt||{});
  }

  /* ⓪ 译入：中文场面事实 → 韩语场面文件 ＋ 一张名表 */
  var zh=feSceneZh();
  function stage0(retry){
    call([{role:'system',content:FE.ko.hand},
          {role:'user',content:FE_P0+'\n\n'+zh}],
         {max_tokens:2600},
         function(out){
           var sp=feSplit0(out);
           if(!sp||!sp.scene){ if(!retry)return stage0(1); return fail('场面文件没有回来'); }
           if(feHan(sp.scene)>0){ if(!retry)return stage0(1);
             return fail('场面文件里还留着汉字'); }
           stage1(sp,0);
         });
  }
  /* ① 集笔：见本八篇整个嵌进提示词，场面文件填进去。零汉字是这一段的锁。 */
  function stage1(sp,retry){
    var prompt=FE.ko.write.replace('{{견본}}',FE.ko.samples.join('\n\n'))
                          .replace('{{장면}}',sp.scene);
    if(feHan(prompt)>0)return fail('提示词里混进了汉字，已停手');
    call([{role:'user',content:prompt}],
         {max_tokens:3600,onDelta:function(t){try{genFirstToken();GEN.chars=t.length;}catch(_){}}},
         function(ms){
           ms=ms.trim();
           if(!ms){ if(!retry)return stage1(sp,1); return fail('原稿没有回来'); }
           if(feHan(ms)>0){ if(!retry)return stage1(sp,1); return fail('原稿里混进了汉字'); }
           stage2(sp,ms);
         });
  }
  /* ② 译出：必须是另一次请求，不带上文——同一个沙盒既写又译，会把自己的稿子润一遍。 */
  function stage2(sp,ms){
    var tr=FE.ko.tr.replace('{{원고}}',ms).replace('{{표기}}',sp.names||'(없음)');
    call([{role:'user',content:tr}],
         {max_tokens:3600,onDelta:function(t){try{GEN.chars=t.length;}catch(_){}}},
         function(out){
           BUSY=false;genClose();
           if(!alive())return;
           var txt=String(out||'').trim();
           if(!txt)return fail('译文没有回来');
           if(!/<mvu_panel>/.test(txt))txt=txt+'\n\n'+panel;
           loadOpening(line,{id:'custom',year:y,era:yl,scene:cn,text:txt},loc);
           GAME.hero=_hero;                 /* loadOpening 又清了一次，写回来 */
         });
  }
  stage0(0);
}

/* 把这一层选的东西灌进引擎原有的位子 */
function feSyncEngine(){
  var h=FE.hero,e=FE.era,L=FE.loc;
  function set(id,v){var el=$(id);if(el)el.value=v;}
  /* 引擎那句自我介绍读的是「出身<pfGens>，<pfAetas>岁，<pfOrtus>」，
     所以 pfGens 要放出生地、pfOrtus 放身份——放形态型会写成「出身河谷短毛型」。 */
  set('#pfNomen',h.n);
  set('#pfGens',h.born);
  set('#pfAetas',String(h.age));
  set('#pfOrtus',h.ti+(h.sp==='cat'?('　'+h.morph.n):''));
  set('#pfScene',String($('#feSit').value||'').trim());
  try{
    ERA.year=e.y;
    ERA.sel=L?{n:L.n,cn:L.cn,la:L.la,lo:L.lo}:null;
  }catch(_){}
  try{
    PSNPC.list=FE.soc.map(function(k){var p=FE.pool[k];
      return{name:p.n,role:p.ti,female:p.sp==='cat'?1:0,age:p.age};});
    PSNPC.sel=-1;
  }catch(_){}
}

/* ═══════════ 绑定 ═══════════ */
(function(){
  var w=$('#feWrap');if(!w)return;
  $('#feGo').addEventListener('pointerup',function(){feNext();});
  $('#feBack').addEventListener('pointerup',function(){fePrev();});
  $('#fePerRoll').addEventListener('pointerup',function(){
    FE.salt++;FE.hero=feMake(FE.era,null,'hero'+FE.salt+'-'+Date.now());
    FE.hero.self=1;FE.hero.pre=-1;fePerRender();feFootSync();});
  $('#feSocMore').addEventListener('pointerup',function(){feSocMore();});
  $('#feSit').addEventListener('input',function(){feSitRender();});
  addEventListener('resize',function(){if(feIsOpen()&&FE.step==='loc'){FE._fit=null;feMapFit();feLocRender();}});
  addEventListener('keydown',function(ev){
    if(!feIsOpen())return;
    var t=ev.target&&ev.target.tagName;
    if(t==='TEXTAREA'||t==='INPUT'||t==='SELECT'){
      if(ev.key==='Escape'){ev.target.blur();ev.preventDefault();}
      /* 此刻那一屏：Ctrl+Enter 直接铸局，与引擎别处一致 */
      if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){
        feNext();ev.preventDefault();ev.stopPropagation();}
      return;
    }
    if(ev.key==='Enter'){feNext();ev.preventDefault();ev.stopPropagation();}
    else if(ev.key==='Escape'){fePrev();ev.preventDefault();ev.stopPropagation();}
  },true);
  /* 纪年页一开就把资料先取上：等玩家挑完图，这边多半已经好了 */
  try{
    var _o=esOpen;
    esOpen=function(line){feLoad(function(){});return _o.apply(this,arguments);};
  }catch(_){}
})();
