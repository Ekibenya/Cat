#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把空壳里没掏干净的那几块上一张卡的正文，改成由卡来决定。

「空卡」掏的是卡资料，引擎的 javascript 里还留着三整块写死的上一张卡的东西，
每一回合都照发进提示词：

  eraGate()     一份前221到前170的年表，外加金链、四丈、某人不显老那几条
  abacusBand()  掖庭、四丈之内、恩宠那一格——量级分四档，全是那张卡的处境
  powerSpec()   某位至尊在场时怎么写
  invPreset()   开局的行头：秦制铜剑、赤帻、半两钱一串、出入木传

实测：对局那一发提示词里，上一张卡的主角名字出现四次，年表整段在场，
【装备】那一行给一九〇〇年巴黎的档案员发了一把铜剑。
这几块都不改成卡驱动，这张卡就永远在替另一张卡讲历史。

改法一律是加一道门，不删原来的东西：
  · 卡里有自己的年表（card.timeline）就照卡的发，没有再退回原来那一份
  · 卡声明了 heroless（没有固定主角）就不发算盘与至尊那两段——
    那两段说的是某一个特定的人在某一座宫里的处境，换张卡一个字都不成立
别的卡一个字不受影响。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

A_GATE = 'function eraGate(){\n  var bc=nowYear();if(!bc)return \'\';'
N_GATE = """/* 带正负号的年份：前 N 年记作 -N，公元 N 年记作 N，读不出来就是 null。
   引擎原有的 nowYear() 只认「前 N 年」（那张卡全在公元前），这一张要从前一万年
   一直走到近代，得另有一把尺。原来那一把不动，免得动到别处。 */
function feYearSigned(){
  var s='';
  try{
    var wd=(GAME.lastPanel&&GAME.lastPanel.wd)||[];
    for(var i=0;i<wd.length;i++)if(wd[i][0]==='纪年')s=String(wd[i].slice(1).join(''));
  }catch(_){}
  var m=s.match(/前\\s*([0-9]+)/);
  if(m)return -parseInt(m[1],10);
  m=s.match(/([0-9]{1,5})\\s*年/);
  if(m)return parseInt(m[1],10);
  try{if(GAME.op&&GAME.op.year!=null)return GAME.op.year;}catch(_){}
  return null;
}
function feYearLabel(y){return y<0?('前'+(-y)+'年'):(y+'年');}
/* 卡自带年表时的纪年闸门：只讲到此刻为止，往后的一个字不发。
   两头各留八条——整张表一次全发，光这一段就顶掉别处的预算。 */
function eraGateCard(tl){
  var y=feYearSigned();if(y===null)return '';
  var done=[],todo=[],i;
  for(i=0;i<tl.length;i++)(tl[i].y<=y?done:todo).push(feYearLabel(tl[i].y)+'　'+tl[i].k);
  if(done.length>8)done=done.slice(done.length-8);
  if(todo.length>8)todo=todo.slice(0,8);
  var L=['【纪年闸门·此刻是'+feYearLabel(y)+'·与铁则并列的最高优先级】'];
  L.push('本局此刻是'+feYearLabel(y)+'。还没到年份的事，这个世界里就还不存在：'
        +'不许写出来，不许暗示，不许让谁「隐约觉得」，'
        +'也不许当成早就有的规矩混进器物、称呼、口头禅或者当地的说法里。');
  if(done.length)L.push('· 已经发生，可以当既定事实用：\\n　'+done.join('\\n　'));
  if(todo.length)L.push('· 还没发生，这一回合一个字都不许写：\\n　'+todo.join('\\n　'));
  L.push('· 后世才成熟的词一个都不许用：制度的名目、医学的名目、心理的名目、传播的名目，'
        +'凡是这一年的人说不出口的，就绕开，不要用「某种装置」这类词蒙过去。');
  return L.join('\\n');
}
function eraGate(){
  var _tl=null;try{_tl=CARDS[ACTIVE]&&CARDS[ACTIVE].timeline;}catch(_){}
  if(_tl&&_tl.length)return eraGateCard(_tl);
  if(typeof cardHeroless==='function'&&cardHeroless())return '';
  var bc=nowYear();if(!bc)return '';"""

A_ABACUS = """function abacusBand(){
  var en=-1,mo=0;"""
N_ABACUS = """function abacusBand(){
  /* 这一段讲的是某一个人在某一座宫里的处境（掖庭、四丈之内、恩宠那一格）。
     没有固定主角的卡照发，等于把别人的处境当成你的。 */
  if(typeof cardHeroless==='function'&&cardHeroless())return '';
  var en=-1,mo=0;"""

A_POWER = """function powerSpec(){
  var on=false,H='';"""
N_POWER = """function powerSpec(){
  /* 至尊在场时怎么写——写的是那张卡里的那一位。没有固定主角的卡不发。 */
  if(typeof cardHeroless==='function'&&cardHeroless())return '';
  var on=false,H='';"""

# 行头：ARMDB 与 INVSETS 里的东西全是那张卡那个年代的（铜剑、赤帻、半两钱、出入木传）。
# 一张从前一万年走到近代的卡，套用那一份行头，等于每回合都告诉模型
# 「她腰上挂着半两钱、手里一把秦制铜剑」——不管这一幕是史前的河岸还是巴黎的百货。
# 没有固定主角的卡一律空着上场：身上穿什么由立身那一步的衣着说了算，
# 别的东西要在正文里现取现拿。器物库本身不动，将来按纪年补齐再说。
A_INV = """function invPreset(op){
  var k=(op&&op.id!=null&&INVSETS[op.id])?op.id:'_';"""
N_INV = """function invPreset(op){
  if(typeof cardHeroless==='function'&&cardHeroless()){
    INV={eq:{},bag:[]};INVSEL=null;USED1={};
    invStore();try{invRender();}catch(_){}
    return;
  }
  var k=(op&&op.id!=null&&INVSETS[op.id])?op.id:'_';"""

# 钱那一栏的说法：「她手上的半两钱」——半两是那个朝代的钱。换成中性的说法，
# 具体用什么钱由每一代自己的尺子讲（见 herofix.py 里换掉的那一句）。
A_COINWORD = "'\u00b7 \u25c6\u94b1 \u8fd9\u4e00\u680f\u662f\u5979\u624b\u4e0a\u7684\u534a\u4e24\u94b1\uff0c\u53ea\u5199\u7eaf\u6570\u5b57\uff0c\u4e0d\u5e26\u5355\u4f4d\uff0c'"
N_COINWORD = "'\u00b7 \u25c6\u94b1 \u8fd9\u4e00\u680f\u662f\u5979\u624b\u4e0a\u7684\u73b0\u94b1\uff0c\u53ea\u5199\u7eaf\u6570\u5b57\uff0c\u4e0d\u5e26\u5355\u4f4d\uff0c'"

PAIRS = [('eraGate', A_GATE, N_GATE), ('abacusBand', A_ABACUS, N_ABACUS),
         ('powerSpec', A_POWER, N_POWER), ('invPreset', A_INV, N_INV),
         ('\u94b1\u7684\u8bf4\u6cd5', A_COINWORD, N_COINWORD)]


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if 'cardHeroless===\'function\'&&cardHeroless()){\n    INV=' in s or 'function eraGateCard(' in s:
        print('这三块早已改成卡驱动，跳过。')
        return
    for nm, a, _ in PAIRS:
        if s.count(a) != 1:
            sys.exit('锚点 %s 不是唯一的（%d 处），停手。' % (nm, s.count(a)))
    for _, a, n in PAIRS:
        s = s.replace(a, n, 1)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('写死的段落已改成卡驱动 · 主文档 %.0f KB' % (os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
