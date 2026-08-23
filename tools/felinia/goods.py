#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""每一代的货：写出 core/res/data/felinia/goods.json。

    python3 tools/felinia/goods.py

原先商店只有一张 ARMDB，七十三件全是秦的东西（粟饭、鱼脍、腌鱼……），
底下那段说明也写死了「秦市有市亭、有市籍……咸阳市的常价」——
四十一代共用这一套，跟纪年、地区、地点全无关系。这里把那三个维度补上：

  · 纪年   每一代一张自己的货单，钱的名目也各是各的
  · 地区   货单按这一代的地区路线写（草原—俄国的和伊斯兰世界的不是一批东西）
  · 地点   每一件注明在哪几处有货（at），别处不上架

写法是说明书，不是散文：净重、材料、尺寸、保存期限、禁忌、怎么用。
一句一件事，能量的就写数目。不要形容，不要比喻，不要感慨。

  cat  只能取 SHOP_SEC 里那九样：吃食 药 荤忌 衣物 杂物 器物 消耗 武器 防具
  ic   只能取引擎里已有的那六十七个图标名，见 ARMICONS
  at   这一代 eras.json 里的地点拉丁名；留空表示各处都有
  use  gan 好感 / xing 原形 / jie 是否算一次戒心（0 或 1）
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT  = os.path.join(ROOT, 'core/res/data/felinia/goods.json')
ERAS = os.path.join(ROOT, 'core/res/data/felinia/eras.json')

CATS = ('吃食', '药', '荤忌', '衣物', '杂物', '器物', '消耗', '武器', '防具')
ICONS = set('''armor arrow band belt boot bowl bread bulb cake candy chain cheese chest
cloak clog coin comb crossbow dagger egg fan fish flask ge greens headband helm herb jar
jerky kerchief lamp leaf liver meat mirror needle pad pail paste pin pouch powder ribbon
ricebowl robe rouge sash sashimi seal shield skewer skirt slipper soup spear stone sword
tablet tag taro tunic tweezer veil vine winejar wrap'''.split())


def it(k, cn, la, cat, price, ic, spec, at=(), gan=0, xing=0, jie=0, act='', eff='', stack=1):
    """一件货。spec 是说明书那一段，用「 · 」断开，一节一件事。"""
    o = {'k': k, 'cn': cn, 'la': la, 'cat': cat, 'price': price, 'ic': ic,
         'spec': spec, 'stack': stack}
    if at:
        o['at'] = list(at)
    if act:
        o['use'] = {'act': act, 'gan': gan, 'xing': xing, 'jie': jie, 'eff': eff}
    return o


GOODS = {}

# ═══════════ 一 · 史前窝群（前一万年 · 旧大陆） ═══════════
# 钱还没有。市场就是火塘边的交换，作价按「一日口粮」折。
GOODS[1] = {
    'unit': '份',
    'note': ('这一代没有钱。作价的单位是「份」，一份＝一个成年人一日的口粮。'
             '换东西在火塘边当面点清，不记账，不赊。'
             '带毛的皮子按整张算，破了口的折半。'),
    'items': [
      it('g1_meat', '烤到半干的兽肉', 'CARO', '吃食', 2, 'meat',
         '一条约 700 克 · 火上烘到半干 · 阴凉处三日，潮天一日 · 不加盐',
         at=('FOCVS', 'ARBOR'), gan=6, xing=3, jie=1,
         act='把肉搁在她够得着的地方', eff='好感+6，原形+3，算一次戒心'),
      it('g1_fish', '浅滩捞的小鱼', 'PISCIS', '吃食', 1, 'fish',
         '五到八条一串 · 合计约 300 克 · 当日食用 · 刺细，需去头',
         at=('VADVM',), gan=5, xing=4, jie=1,
         act='把一串小鱼递过去', eff='好感+5，原形+4，算一次戒心'),
      it('g1_nut', '树上采的坚果', 'NVX', '吃食', 1, 'greens',
         '一兜约 500 克 · 带壳 · 干处可放一冬 · 须砸开，壳伤牙',
         at=('ARBOR', 'FOSSA'), gan=2, xing=0, jie=0,
         act='把一兜坚果倒出来', eff='好感+2，原形不动，不算戒心'),
      it('g1_hide', '整张兽皮', 'PELLIS', '衣物', 4, 'cloak',
         '整张 · 约 120×90 厘米 · 未鞣，硬 · 披挂用 · 耳尾都不缚 · 雨天吸水后加重一倍',
         at=('FOCVS',)),
      it('g1_grass', '编草短衣', 'VESTIS HERBAE', '衣物', 2, 'tunic',
         '及膝 · 草绳编 · 换毛期扎得住碎毛 · 每七日须重编一次 · 不防雨'),
      it('g1_cord', '一条绳带', 'FVNIS', '杂物', 1, 'band',
         '长约 3 米 · 树皮搓 · 承重约 20 公斤 · 系工具用 · 沾水后承重减半'),
      it('g1_flint', '打火石一对', 'SILEX', '器物', 2, 'stone',
         '两块一对 · 合重约 200 克 · 敲击取火 · 须配干苔 · 潮天不发火',
         at=('FOCVS', 'FOSSA')),
      it('g1_spear', '削尖的木矛', 'HASTA', '武器', 3, 'spear',
         '长约 180 厘米 · 木身火烤硬化 · 无金属头 · 掷出后多半找不回来 · 近身不如远掷'),
      it('g1_herb', '嚼过止血的草', 'HERBA', '药', 2, 'herb',
         '一小把约 30 克 · 阴干 · 嚼碎外敷 · 止小口子的血 · 不可吞下',
         at=('ARBOR', 'FOSSA')),
      it('g1_pail', '兽皮水囊', 'VTER', '器物', 3, 'pail',
         '容约 2 升 · 缝口涂脂 · 每日须晾 · 存水过夜发腥',
         at=('VADVM', 'FOCVS')),
    ],
}

# ═══════════ 十三 · 阿拔斯时代的商队（八五〇年 · 伊斯兰世界） ═══════════
GOODS[13] = {
    'unit': '第尔汗',
    'note': ('钱是第尔汗（银）与第纳尔（金），一第纳尔约合二十第尔汗。'
             '集市有市监，秤有官印，短秤要罚。'
             '商栈里的价比集市高一到两成，那是店钱和护卫契的份。'
             '沙碛与泉上无市，只有过路的商队私下折换。'),
    'items': [
      it('g13_dates', '干枣一袋', 'DACTYLI', '吃食', 3, 'jar',
         '净重 900 克 · 阴干 · 含糖高 · 阴凉处可放一年 · 袋口麻绳扎两道',
         at=('SVQ', 'CARAVANSERAI'), gan=4, xing=1, jie=0,
         act='解开袋口', eff='好感+4，原形+1，不算戒心'),
      it('g13_kebab', '炙羊肉', 'CARO ASSA', '吃食', 6, 'skewer',
         '一串约 200 克 · 现炙 · 当场食用 · 已按教法宰杀 · 不含猪',
         at=('SVQ',), gan=7, xing=4, jie=1,
         act='把一串炙羊肉递过去', eff='好感+7，原形+4，算一次戒心'),
      it('g13_cheese', '干酪', 'CASEVS', '吃食', 4, 'cheese',
         '一块约 250 克 · 羊乳 · 盐渍 · 可放两月 · 盐分高，须配水',
         at=('CARAVANSERAI', 'FONS'), gan=5, xing=2, jie=1,
         act='掰下一块干酪', eff='好感+5，原形+2，算一次戒心'),
      it('g13_water', '皮水袋', 'VTER AQVAE', '器物', 5, 'pail',
         '容 4 升 · 山羊皮 · 内壁涂柏油 · 满载重 4.4 公斤 · 每日须查缝线',
         at=('FONS', 'CARAVANSERAI', 'DESERTVM')),
      it('g13_veil', '耳间薄纱', 'VELVM', '衣物', 8, 'veil',
         '幅宽 60 厘米 · 细棉 · 绕过耳根系在颈后 · 不压耳廓 · 沙天可掩口鼻',
         at=('SVQ',)),
      it('g13_robe', '尾部开口的长衣', 'TVNICA', '衣物', 14, 'robe',
         '及踝 · 棉 · 尾部开口由女裁缝加固 · 肩背走线双道 · 不束腰',
         at=('SVQ',)),
      it('g13_cloak', '夜行的深色斗篷', 'PALLIVM', '衣物', 11, 'cloak',
         '及膝 · 厚棉 · 未染的深褐 · 夜间不反光 · 昼间过热',
         at=('CARAVANSERAI', 'DESERTVM')),
      it('g13_lamp', '油灯', 'LVCERNA', '器物', 3, 'lamp',
         '陶 · 容油 80 毫升 · 一注约燃三时辰 · 须配灯芯草 · 风中不可用',
         at=('SVQ', 'CARAVANSERAI')),
      it('g13_salve', '晒伤的膏', 'VNGVENTVM', '药', 6, 'paste',
         '罐装 40 克 · 橄榄油与蜡 · 外敷 · 日涂两次 · 不可入眼 · 开罐后一月内用完',
         at=('SVQ', 'FONS')),
      it('g13_kohl', '眼线粉', 'STIBIVM', '杂物', 5, 'powder',
         '小盒 8 克 · 研过的锑石 · 配细签 · 挡日光的反照 · 沙天每日补一次',
         at=('SVQ',)),
      it('g13_rope', '驼绳', 'FVNIS CAMELI', '杂物', 4, 'chain',
         '长 6 米 · 棕榈纤维 · 承重 120 公斤 · 结处每旬须重打 · 湿后收缩',
         at=('CARAVANSERAI', 'DESERTVM')),
      it('g13_tally', '驿站互认的牌', 'TESSERA', '杂物', 9, 'seal',
         '铜 · 直径 40 毫米 · 一面铸站名 · 凭此在互认的驿站换水与草料 · 遗失不补',
         at=('CARAVANSERAI',)),
      it('g13_dagger', '腰刀', 'PVGIO', '武器', 18, 'dagger',
         '刃长 22 厘米 · 钢 · 单刃 · 连鞘重 400 克 · 商队护卫契内准带 · 入城须解下',
         at=('SVQ', 'CARAVANSERAI')),
      it('g13_pad', '骆驼鞍垫', 'STRAGVLVM', '器物', 7, 'pad',
         '60×40 厘米 · 毛毡 · 厚 25 毫米 · 长途骑乘用 · 每旬须拍打去沙',
         at=('CARAVANSERAI', 'DESERTVM')),
    ],
}


def check(eras):
    loc = {e['i']: set(L['n'] for L in e['locs']) for e in eras}
    n = 0
    for era, g in sorted(GOODS.items()):
        assert era in loc, '纪年 %d 不在 eras.json 里' % era
        keys = set()
        for o in g['items']:
            assert o['cat'] in CATS, '%s 的类别不在册：%s' % (o['cn'], o['cat'])
            assert o['ic'] in ICONS, '%s 的图标引擎里没有：%s' % (o['cn'], o['ic'])
            assert o['k'] not in keys, '纪年 %d 有重复的键：%s' % (era, o['k'])
            keys.add(o['k'])
            for a in o.get('at', []):
                assert a in loc[era], '纪年 %d 没有这个地点：%s' % (era, a)
            assert '·' in o['spec'], '%s 的说明不是分节写的' % o['cn']
            n += 1
    return n


def main():
    eras = json.load(io.open(ERAS, encoding='utf-8'))
    n = check(eras)
    obj = {str(k): v for k, v in GOODS.items()}
    io.open(OUT, 'w', encoding='utf-8').write(
        json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
    print('货单 · 纪年 %d 代 · 货 %d 件 · %.1f KB（写满是 41 代）'
          % (len(GOODS), n, os.path.getsize(OUT) / 1024))


if __name__ == '__main__':
    main()
