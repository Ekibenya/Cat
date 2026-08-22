#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""让引擎认得「这张卡没有固定主角」。

空壳沿用的那套主角机制假定每张卡都有一位本尊：换人来演时，
系统提示里会一遍遍写「本局主角不是某某，某某不在本局登场」。
这张卡不是那种卡——每一局的主角都是玩家在铸局那一步现立的，
卡里根本没有本尊。照旧跑，等于每回合都把另一张卡的人名塞进提示词。

所以给卡加一个开关 heroless：卡里声明了，四处照顾到——
  cardHeroName  从卡里读，不再写死
  heroRebind    无本尊则不做替换
  heroSheet     只说「这一局你演的是谁」，不说「不是谁」
  heroTail      同上
  condereSys    档案与世界书那两句围栏也改成无本尊的说法
没声明的卡一个字都不受影响。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')

A_NAME = """function cardHeroName(){return {luzhi:'吕雉'}[ACTIVE]||'吕雉';}"""
N_NAME = """function cardHeroName(){
  try{var n=CARDS[ACTIVE]&&CARDS[ACTIVE].heroName;if(n)return n;}catch(_){}
  return {luzhi:'吕雉'}[ACTIVE]||'吕雉';
}
/* 这张卡有没有本尊。没有的话，凡是「你演的不是某某」那类话一律不发。 */
function cardHeroless(){try{return !!(CARDS[ACTIVE]&&CARDS[ACTIVE].heroless);}catch(_){return false;}}"""

A_REBIND = """function heroRebind(t){
  if(heroIsCard())return t||'';"""
N_REBIND = """function heroRebind(t){
  if(heroIsCard()||cardHeroless())return t||'';"""

A_SHEET = """function heroSheet(){
  var h=null;try{h=GAME.hero;}catch(_){}
  if(!h||!h.n)return '';
  var C=cardHeroName();
  return '【本局主角·以此为准，压过卡中原有的主角设定】'"""
N_SHEET = """function heroSheet(){
  var h=null;try{h=GAME.hero;}catch(_){}
  if(!h||!h.n)return '';
  var C=cardHeroName();
  if(cardHeroless())
    return '【本局主角·以此为准】'
      +'玩家这一局扮演的是「'+h.n+'」'
      +(h.g?('，出身'+h.g):'')+(h.a?('，'+h.a+'岁'):'')+(h.o?('，'+h.o):'')+'。\\n'
      +'· 这张卡没有固定的主角。每一局的主角都是玩家在开局时立的，'
      +'世界书里那些有名有姓的人是这个世界里的别人，不是她的前身、真身或化名。\\n'
      +'· 她的性格由玩家在正文里一句一句写出来，你不得预设。\\n'
      +'· 铁则一照旧：'+h.n+'的台词、动作、决定，一个字都不许你写。\\n';
  return '【本局主角·以此为准，压过卡中原有的主角设定】'"""

A_TAIL = """function heroTail(){
  var h=null;try{h=GAME.hero;}catch(_){}
  if(!h||!h.n)return '';
  var C=cardHeroName();
  return '【落笔前最后一遍·本局主角】本局主角是「'+h.n+'」，不是'+C+'。'"""
N_TAIL = """function heroTail(){
  var h=null;try{h=GAME.hero;}catch(_){}
  if(!h||!h.n)return '';
  var C=cardHeroName();
  if(cardHeroless())
    return '【落笔前最后一遍·本局主角】本局主角是「'+h.n+'」。'
      +'世界书里出现的人名都是这个世界里的别人，与她无关，也不是她的前身或真身。'
      +'镜头跟着'+h.n+'走，其余人等都是这个世界里的普通人。'
      +h.n+'的台词、动作、决定，一个字都不许你写。';
  return '【落笔前最后一遍·本局主角】本局主角是「'+h.n+'」，不是'+C+'。'"""

A_SYS = """    ((heroIsCard()&&!povHero())?('【玩家角色档案】'+(G.description||''))
                 :('【卡中原主角档案·仅供了解此世的笔调与背景，本局不适用于主角】'+heroDesc(G.description||''))),"""
N_SYS = """    ((heroIsCard()||cardHeroless())&&!povHero()?('【玩家角色档案】'+(G.description||''))
                 :('【卡中原主角档案·仅供了解此世的笔调与背景，本局不适用于主角】'+heroDesc(G.description||''))),"""

# 这一句在铸局与对局两条路上各有一份，两份的后半截措辞不同，所以只锚住前半截
A_LORE = """    ((heroIsCard()&&!povHero())?'【世界书·激活条目】'"""
N_LORE = """    (((heroIsCard()||cardHeroless())&&!povHero())?'【世界书·激活条目】'"""

# 钱的尺子：空壳里写死了秦制。这张卡从前一万年跑到一九一六年，一把尺子量不了。
A_COIN = """    +'秦制的尺子照这个记：粟一石三十钱，布一匹十一钱，居赀的人一日工钱八钱，'
    +'隶臣冬衣一百一十钱、夏衣五十五钱，赏赐折钱也用这把尺子。'"""
N_COIN = """    +(((typeof FE!=='undefined'&&FE.era&&FE.era.coin)
        ?('这一代的尺子照这个记：'+FE.era.coin+'。')
        :'秦制的尺子照这个记：粟一石三十钱，布一匹十一钱，居赀的人一日工钱八钱，隶臣冬衣一百一十钱、夏衣五十五钱，赏赐折钱也用这把尺子。'))"""

# 名 · 锚点 · 换成 · 应有几处（档案与世界书那两句在铸局与对局两条路上各有一份，
# 两处都要改；只改一处，另一条路照旧把别张卡的人名写进提示词）
PAIRS = [('cardHeroName', A_NAME, N_NAME, 1), ('heroRebind', A_REBIND, N_REBIND, 1),
         ('heroSheet', A_SHEET, N_SHEET, 1), ('heroTail', A_TAIL, N_TAIL, 1),
         ('角色档案那一句', A_SYS, N_SYS, 2), ('世界书那一句', A_LORE, N_LORE, 2),
         ('钱的尺子', A_COIN, N_COIN, 1)]


def main():
    s = io.open(DOC, encoding='utf-8').read()
    if 'function cardHeroless()' in s:
        sys.exit('主文档里已经打过无本尊开关了，没有重复打。')
    tot = 0
    for nm, a, _, cnt in PAIRS:
        if s.count(a) != cnt:
            sys.exit('锚点 %s 该有 %d 处，实际 %d 处，停手。' % (nm, cnt, s.count(a)))
        tot += cnt
    for _, a, n, cnt in PAIRS:
        s = s.replace(a, n, cnt)
    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('无本尊开关已注入 · 改了 %d 处 · 主文档 %.0f KB' % (tot, os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
