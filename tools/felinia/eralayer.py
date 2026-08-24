#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""世界書按紀年分層：身處哪一代，就只發哪一代的人物與本代條目。

    python3 tools/felinia/eralayer.py

先說清楚一件事：**閘門本來就有一半。** 鑄局那一層選定紀年時會叫 feLoreBind：

    /* 定了纪年就把别代的条目关掉：通则常驻，本代五条参与检索，其余不发。 */
    function feLoreBind(i){ …… if(e&&e.era!=null&&!e.custom)e.on=(e.era===i); }

它管用。可是它只在鑄局那一層開著的時候跑一次，而**讀檔續局時那一層根本不開**
（同一份文件裡另一處註解就寫著「读档续局时 FE.era 是空的，铸局那一层根本没开过」）。
頁面一重載，lorebook 從卡裡重新讀出來，四十一代的 on 全是 true，再也沒人關過。

一九一六年那一局，存檔、重載、按「繼續遊戲」，再走一回合，實測注進去的是：

    前10000年 · 史前窩群 —— 五條
    前6000年 · 河岸聚落 —— 兩條
    人物：莉莉絲
    一九一六年自己的：**一條都沒有**

排序是「自寫 → custom → 卡帶的」再按 ord，同 ord 之間是檔案順序，
檔案順序就是紀年順序。於是紀年越靠前的越先裝桶——玩到近代，注進去的是史前。

所以這一支做兩件事。

一、把閘門挪進 loreFor 本身，不靠 feLoreBind 有沒有跑過。
    條目上帶 era 的（人物三千五百四十條、本代五百七十四條）只在那一代發；
    不帶 era 的（通則九、文風四十八、橫斷一百六十七、背景一百一十）照舊每代都在。
    同一個存檔重測：一九一六年自己七條，別代零條。

    本局是哪一代，按四層取，取不到就整個不閘（寧可照舊，也不要閘錯）：
        一、鑄局那一層開著時 —— FE.era.i，剛選的那一代
        二、GAME.op.ei      —— 鑄局時記進開局錨點的紀年號，存檔會一起存下來
        三、GAME.op.year    —— 老存檔只有 ei 以前的年份：在 annals 的 ys 裡找
                               「小於等於這一年的最後一代」，自訂年份也落得下去
        四、FE.era.i        —— 兜底

二、人物另給一個桶。
    光有閘門還不夠：本代那十四條每條七百字上下，關鍵詞又是「錢」「衣裳」「差事」
    這種每回合都命中的字，ord 30 先裝桶就把五千字吃光了，ord 60 的人物排不上。
    實測（在場兩位：瑪塔·哈里、紅男爵）——

        單桶：兩人共十二條條目，進去的是一條（瑪塔·哈里的第一項）
        分桶：十二條全進

    在場的人，卡裡反而沒有他們的話——那是這一條要治的。
    人物條目只在名字出現在近文裡才命中，所以這個桶平時是空的，不白佔上下文。

代價寫在這裡：世界書那一段由一萬九千九百八十字漲到兩萬兩千九百一十字（＋一成五）。
漲的部分全是在場那兩位的條目；換掉的部分是史前的窩群與莉莉絲。

打過一次就拒絕重打（自檢見 GUARD）。
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
GUARD = '_eraNow'

# ── 一、鑄局把紀年號寫進開局錨點（跟地點表同一個位子，存檔會一起帶走）──
A_OLD = """  try{draft.feLocs=e.locs.map(function(L){"""
A_NEW = """  /* 纪年号随开局锚点一起存：世界书的分代闸门靠它认「这一局是哪一代」。
     地点表当初也是为了同一件事写在这里的（读档续局时铸局那一层不会再开）。 */
  draft.ei=e.i;
  try{draft.feLocs=e.locs.map(function(L){"""

# ── 二、兩處「神諭鑄好之後重新落 op」的地方也要帶上 ei ──
OP_OLD = "loadOpening(line,{id:'custom',year:y,era:yl,scene:cn,text:txt},loc);"
OP_NEW = "loadOpening(line,{id:'custom',year:y,era:yl,ei:feEraI(),scene:cn,text:txt},loc);"

B_OLD = ("           if(!/<mvu_panel>/.test(txt))txt=txt+'\\n\\n'+panel;\n"
         "           " + OP_OLD)
B_NEW = ("           if(!/<mvu_panel>/.test(txt))txt=txt+'\\n\\n'+panel;\n"
         "           " + OP_NEW)

C_OLD = "      " + OP_OLD + "\n    },"
C_NEW = "      " + OP_NEW + "\n    },"

# ── 三、本局是哪一代 ──
FN_OLD = """function loreFor(text){"""
FN_NEW = """function feEraI(){try{return (FE&&FE.era&&FE.era.i)|0;}catch(_){return 0;}}
/* 本局是哪一代。取不到就返回 0，分代闸门整个不闸——宁可照旧，也不要闸错。 */
function _eraNow(){
  var i=0,open=false;
  try{var w=$('#feWrap');open=!!(w&&w.classList.contains('on'));}catch(_){}
  /* 铸局那一层开着的时候（condereSys 也要检索世界书），以刚选的那一代为准：
     那会儿 GAME.op 还是上一局的，照它走会按上一代发条目。 */
  if(open)i=feEraI();
  if(!i)try{if(GAME.op&&GAME.op.ei)i=GAME.op.ei|0;}catch(_){}
  /* 老存档里没有 ei，只有年份。annals 的 ys 是每一代的起始年，
     取「小于等于这一年的最后一代」——自定义开局填的年份落在两代之间也有着落。 */
  if(!i)try{
    var y=(GAME.op&&GAME.op.year),by=null;
    if(y!=null&&y!==''){
      var an=(CARDS[ACTIVE]&&CARDS[ACTIVE].annals)||[];
      for(var k=0;k<an.length;k++){var a=an[k];
        if(!a||!a.i||a.ys==null)continue;
        if(a.ys<=y&&(by===null||a.ys>by)){by=a.ys;i=a.i|0;}}
    }
  }catch(_){}
  if(!i)i=feEraI();
  return i|0;
}
function loreFor(text){"""

# ── 四、閘門本體 ──
G_OLD = """  var _yr=0;try{_yr=nowYear();}catch(_){}"""
G_NEW = """  /* 分代闸门。条目上带 era 的（人物三千五百四十条、本代五百七十四条）
     只在那一代发；不带 era 的（通则、文风、横断、背景）照旧每一代都在。
     铸局那一层选定纪年时的 feLoreBind 做的是同一件事（把别代的 on 关掉），
     可是它只在那一层开着时跑一次，读档续局时那一层根本不开 —— 页面一重载，
     四十一代的 on 全是 true。一九一六年的存档实测：读档后走一回合，注进去的是
     前10000年五条、前6000年两条、人物莉莉丝，本代一条都没有。
     排序是同 ord 按文件顺序，文件顺序就是纪年顺序，所以越玩到后面越注得早。
     闸门写在这里就不靠那一层跑没跑过。 */
  var _ei=(function(){try{return _eraNow();}catch(_){return 0;}})();
  function _otherEra(e){return !!(_ei&&e&&e.era!=null&&e.era!==_ei);}
  var _yr=0;try{_yr=nowYear();}catch(_){}"""

H_OLD = """    if(_tooEarly(ce))continue;"""
H_NEW = """    if(_tooEarly(ce)||_otherEra(ce))continue;"""

I_OLD = """    if(_tooEarly(e))continue;"""
I_NEW = """    if(_tooEarly(e)||_otherEra(e))continue;"""

# ── 五、人物另給一個桶 ──
J_OLD = """  var cbud=Math.max(4000,Math.round(budget*2.4));"""
J_NEW = """  var cbud=Math.max(4000,Math.round(budget*2.4));
  /* 人物条目单独一个桶。跟常驻条目分桶是同一个道理：本代那十四条每条七百字上下，
     关键词又是「钱」「衣裳」「差事」这种每回合都命中的字，ord 30 先装桶就把五千字
     吃光了，ord 60 的人物一条都排不上。实测两位同伴在场时命中人物条目 12 条、
     3126 字，单桶下只挤进去一条（玛塔·哈里的第一项）—— 在场的人，卡里反而没有他们的话。
     人物只在名字出现在近文里才命中，所以这个桶平时是空的，不白占上下文。 */
  var fbud=Math.max(3000,Math.round(budget*0.8));"""

K_OLD = """    if(hit){var s=loreBind(e);
      if(budget-s.length<0){dropped++;continue;}out.push(s);budget-=s.length;}"""
K_NEW = """    if(hit){var s=loreBind(e);
      if(e.lay==='figures'){
        if(fbud-s.length<0){dropped++;continue;}
        out.push(s);fbud-=s.length;
      }else{
        if(budget-s.length<0){dropped++;continue;}
        out.push(s);budget-=s.length;
      }}"""


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if GUARD in s:
        print('分代闸门已经装过了，跳过。')
        return
    n = s.count(OP_OLD)
    if n != 2:
        raise SystemExit('那句重新落 op 应该正好两处，实际 %d 处，停手。' % n)
    for a, b in ((A_OLD, A_NEW), (B_OLD, B_NEW), (C_OLD, C_NEW),
                 (FN_OLD, FN_NEW), (G_OLD, G_NEW), (H_OLD, H_NEW),
                 (I_OLD, I_NEW), (J_OLD, J_NEW), (K_OLD, K_NEW)):
        k = s.count(a)
        if k != 1:
            raise SystemExit('這一段命中 %d 次，不是一次，停手：%s' % (k, a[:60]))
        s = s.replace(a, b)
    if s.count(OP_OLD) != 0:
        raise SystemExit('還有沒帶上 ei 的落 op，停手。')
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('分代闸门已装：带 era 的条目只在本代发；人物另给一个桶。')
    print('  一九一六的存档读档续局实测（同一份存档，只换这一支）：')
    print('    之前  前10000年 5 条 · 前6000年 2 条 · 人物「莉莉丝」 · 本代 0 条')
    print('    之后  本代 7 条 · 人物「玛塔·哈里」「红男爵」共 12 条 · 别代 0 条')
    print('  代价：世界书那一段 19980 → 22910 字（＋一成五）。')


if __name__ == '__main__':
    main()
