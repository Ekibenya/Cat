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
import re
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
# 钱还没有。市场就是火塘边的交换，算价按「一日口粮」折。
GOODS[1] = {
    'unit': '份',
    'note': ('这一代没有钱。算价的单位是「份」，一份＝一个成年人一日的口粮。'
             '换东西在火塘边当面点清楚，不记账本，不赊。'
             '带毛的皮子按整张算，破了口的算一半。'),
    'items': [
      it('g1_meat', '烤到半干的兽肉', 'CARO', '吃食', 2, 'meat',
         '一条约 700 克 · 火上烘到半干 · 阴凉处三日，潮湿的天气一日 · 不加盐',
         at=('FOCVS', 'ARBOR'), gan=6, xing=3, jie=1,
         act='把肉搁在她够得着的地方', eff='好感+6，原形+3，算一次戒心'),
      it('g1_fish', '浅滩捞的小鱼', 'PISCIS', '吃食', 1, 'fish',
         '五到八条一串 · 合计约 300 克 · 当天吃 · 刺细，需去头',
         at=('VADVM',), gan=5, xing=4, jie=1,
         act='把一串小鱼递过去', eff='好感+5，原形+4，算一次戒心'),
      it('g1_nut', '树上采的坚果', 'NVX', '吃食', 1, 'greens',
         '一兜约 500 克 · 带壳 · 放在干燥的地方能放一个冬天 · 要砸开，壳伤牙',
         at=('ARBOR', 'FOSSA'), gan=2, xing=0, jie=0,
         act='把一兜坚果倒出来', eff='好感+2，原形不动，不算戒心'),
      it('g1_hide', '整张兽皮', 'PELLIS', '衣物', 4, 'cloak',
         '整张 · 约 120×90 厘米 · 没鞣过，硬 · 披挂用 · 耳尾都不缚 · 雨天吸水后加重一倍',
         at=('FOCVS',)),
      it('g1_grass', '编草短衣', 'VESTIS HERBAE', '衣物', 2, 'tunic',
         '及膝 · 草绳编 · 换毛期扎得住碎毛 · 每七日要重编一次 · 不防雨'),
      it('g1_cord', '一条绳带', 'FVNIS', '杂物', 1, 'band',
         '长约 3 米 · 树皮搓 · 承重约 20 公斤 · 系工具用 · 沾水后承重减半'),
      it('g1_flint', '打火石一对', 'SILEX', '器物', 2, 'stone',
         '两块一对 · 合重约 200 克 · 敲击取火 · 要配干苔 · 潮湿的天气不发火',
         at=('FOCVS', 'FOSSA')),
      it('g1_spear', '削尖的木矛', 'HASTA', '武器', 3, 'spear',
         '长约 180 厘米 · 木身火烤硬化 · 无金属头 · 掷出后大多找不回来 · 近身不如远掷'),
      it('g1_herb', '嚼过止血的草', 'HERBA', '药', 2, 'herb',
         '一小把约 30 克 · 阴干 · 嚼碎外敷 · 止小口子的血 · 不能吞',
         at=('ARBOR', 'FOSSA')),
      it('g1_pail', '兽皮水囊', 'VTER', '器物', 3, 'pail',
         '容约 2 升 · 缝口涂脂 · 每天要晾 · 水放过夜会发腥',
         at=('VADVM', 'FOCVS')),
    ],
}

# ═══════════ 十三 · 阿拔斯时代的商队（八五〇年 · 伊斯兰世界） ═══════════
GOODS[13] = {
    'unit': '第尔汗',
    'note': ('钱是第尔汗（银）与第纳尔（金），一第纳尔约合二十第尔汗。'
             '集市有市监，秤有官印，缺斤少两要罚。'
             '商栈里的价比集市高一到两成，那是店钱和护卫契的份。'
             '沙碛和泉边没有铺子，只能跟路过的商队私下换。'),
    'items': [
      it('g13_dates', '干枣一袋', 'DACTYLI', '吃食', 3, 'jar',
         '净重 900 克 · 阴干 · 含糖高 · 放在阴凉的地方能放一年 · 袋口麻绳扎两道',
         at=('SVQ', 'CARAVANSERAI'), gan=4, xing=1, jie=0,
         act='解开袋口', eff='好感+4，原形+1，不算戒心'),
      it('g13_kebab', '炙羊肉', 'CARO ASSA', '吃食', 6, 'skewer',
         '一串约 200 克 · 现炙 · 当场吃 · 按教法宰过 · 不含猪',
         at=('SVQ',), gan=7, xing=4, jie=1,
         act='把一串炙羊肉递过去', eff='好感+7，原形+4，算一次戒心'),
      it('g13_cheese', '干酪', 'CASEVS', '吃食', 4, 'cheese',
         '一块约 250 克 · 羊乳 · 盐渍 · 能放两个月 · 盐分高，要配水',
         at=('CARAVANSERAI', 'FONS'), gan=5, xing=2, jie=1,
         act='掰下一块干酪', eff='好感+5，原形+2，算一次戒心'),
      it('g13_water', '皮水袋', 'VTER AQVAE', '器物', 5, 'pail',
         '容量 4 升 · 山羊皮 · 内壁涂柏油 · 满载重 4.4 公斤 · 每天要查缝线',
         at=('FONS', 'CARAVANSERAI', 'DESERTVM')),
      it('g13_veil', '耳间薄纱', 'VELVM', '衣物', 8, 'veil',
         '幅宽 60 厘米 · 细棉 · 绕过耳根系在颈后 · 不压耳廓 · 沙天可掩口鼻',
         at=('SVQ',)),
      it('g13_robe', '尾部开口的长衣', 'TVNICA', '衣物', 14, 'robe',
         '及踝 · 棉 · 尾部开口由女裁缝加固 · 肩背走线双道 · 不束腰',
         at=('SVQ',)),
      it('g13_cloak', '夜行的深色斗篷', 'PALLIVM', '衣物', 11, 'cloak',
         '及膝 · 厚棉 · 没染色的深褐 · 夜间不反光 · 昼间过热',
         at=('CARAVANSERAI', 'DESERTVM')),
      it('g13_lamp', '油灯', 'LVCERNA', '器物', 3, 'lamp',
         '陶 · 容油 80 毫升 · 一次加满大约能烧六小时 · 要配灯芯草 · 风中不能用',
         at=('SVQ', 'CARAVANSERAI')),
      it('g13_salve', '晒伤的膏', 'VNGVENTVM', '药', 6, 'paste',
         '罐装 40 克 · 橄榄油与蜡 · 外敷 · 一天涂两次 · 别弄进眼睛 · 开罐后一个月之内用完',
         at=('SVQ', 'FONS')),
      it('g13_kohl', '眼线粉', 'STIBIVM', '杂物', 5, 'powder',
         '小盒 8 克 · 研过的锑石 · 配细签 · 挡日光的反照 · 沙天每日补一次',
         at=('SVQ',)),
      it('g13_rope', '驼绳', 'FVNIS CAMELI', '杂物', 4, 'chain',
         '长 6 米 · 棕榈纤维 · 承重 120 公斤 · 结处每十天要重打 · 湿后收缩',
         at=('CARAVANSERAI', 'DESERTVM')),
      it('g13_tally', '驿站互认的牌', 'TESSERA', '杂物', 9, 'seal',
         '铜 · 直径 40 毫米 · 一面铸着站名 · 拿它在互相认牌的驿站换水和草料 · 丢了不补',
         at=('CARAVANSERAI',)),
      it('g13_dagger', '腰刀', 'PVGIO', '武器', 18, 'dagger',
         '刃长 22 厘米 · 钢 · 单刃 · 连鞘重 400 克 · 商队护卫契内可以带 · 入城要解下',
         at=('SVQ', 'CARAVANSERAI')),
      it('g13_pad', '骆驼鞍垫', 'STRAGVLVM', '器物', 7, 'pad',
         '60×40 厘米 · 毛毡 · 厚 25 毫米 · 长途骑乘用 · 每十天要拍打去沙',
         at=('CARAVANSERAI', 'DESERTVM')),
    ],
}


# ═══════════ 二 · 河岸聚落（前六千年 · 旧大陆） ═══════════
GOODS[2] = {
    'unit': '斗',
    'note': ('这一代还没有钱，价钱按谷子折算，一斗约合八公斤。'
             '换东西在谷仓门口当面点清楚，谷子要筛一遍，带壳的不算数。'
             '守仓的人抽一成，这是摆在明面上的规矩。'),
    'items': [
      it('g2_grain', '筛过的谷子', 'FRVMENTVM', '吃食', 1, 'ricebowl',
         '一斗约 8 公斤 · 已经筛掉壳与石子 · 放在干燥的地方能放一年 · 受潮会长虫，每个月要翻一次',
         at=('HORREVM', 'CAMPVS'), gan=3, xing=0, jie=0,
         act='把一斗谷子倒进她的容器', eff='好感+3，原形不动，不算戒心'),
      it('g2_fish', '河里捕的鱼', 'PISCIS', '吃食', 1, 'fish',
         '三到五条 · 合计约 1.2 公斤 · 当天吃 · 夏天放半天就发臭',
         at=('RIPA',), gan=6, xing=4, jie=1,
         act='把鱼摊在石头上', eff='好感+6，原形+4，算一次戒心'),
      it('g2_dryfish', '晒干的鱼', 'PISCIS SICCVS', '吃食', 2, 'jerky',
         '一串六条 · 约 600 克 · 盐渍后晒 · 能放三个月 · 咸，要配水',
         at=('HORREVM', 'RIPA'), gan=5, xing=2, jie=1,
         act='解下一串干鱼', eff='好感+5，原形+2，算一次戒心'),
      it('g2_pot', '陶罐', 'OLLA', '器物', 2, 'jar',
         '容量 5 升 · 陶 · 没上釉 · 装干货用 · 装水会渗 · 摔了补不了',
         at=('HORREVM', 'VICVS')),
      it('g2_sickle', '石镰', 'FALX', '器物', 3, 'ge',
         '刃长 15 厘米 · 石片嵌木柄 · 收割用 · 每割半天要重新磨一次',
         at=('CAMPVS',)),
      it('g2_mat', '草席', 'STORIA', '杂物', 1, 'wrap',
         '180×70 厘米 · 芦苇编 · 铺地或裹身 · 潮湿的天气会发霉 · 一个季度换一次',
         at=('VICVS', 'HORREVM')),
      it('g2_net', '渔网', 'RETE', '器物', 4, 'vine',
         '张开约 3×2 米 · 麻绳结 · 每次用完要晾 · 破口当天要补，不然越扯越大',
         at=('RIPA',)),
      it('g2_hidecoat', '皮外衣', 'PELLIS', '衣物', 3, 'cloak',
         '及膝 · 鞣过的兽皮 · 比生皮软 · 耳尾不缚 · 雨天要抹一遍油脂',
         at=('VICVS',)),
      it('g2_beads', '串珠', 'MONILE', '杂物', 2, 'chain',
         '一串 40 颗 · 河蚌壳磨的 · 长约 50 厘米 · 用来记数或送人 · 断了可重穿',
         at=('VICVS',), gan=4, xing=1, jie=0,
         act='把串珠放在她手边', eff='好感+4，原形+1，不算戒心'),
      it('g2_torch', '松脂火把', 'FAX', '消耗', 1, 'lamp',
         '长 60 厘米 · 松木裹脂 · 一支约烧两小时 · 夜里守仓用 · 室内会呛',
         at=('HORREVM', 'CAMPVS')),
    ],
}

# ═══════════ 三 · 两河城邦（前二九〇〇年 · 旧大陆） ═══════════
GOODS[3] = {
    'unit': '西克',
    'note': ('钱是银，按重量算，一西克约 8.3 克。日常小买卖大多直接用大麦折。'
             '神庙前庭和泥板房的交易要记一块泥板，双方按印，泥板归神庙存。'
             '城门口的摊子不记账本，价也乱一些。'),
    'items': [
      it('g3_barley', '大麦', 'HORDEVM', '吃食', 1, 'ricebowl',
         '一袋约 10 公斤 · 神庙口粮册上的定量 · 放在干燥的地方能放一年 · 磨粉前要再筛一遍',
         at=('TEMPLVM', 'PORTA'), gan=3, xing=0, jie=0,
         act='把一袋大麦搁下', eff='好感+3，原形不动，不算戒心'),
      it('g3_beer', '大麦酒', 'SICERA', '吃食', 2, 'winejar',
         '罐装 2 升 · 大麦发酵 · 浑浊，要用管子吸 · 三天之内喝完 · 酒精度低',
         at=('PORTA', 'MVRVS'), gan=5, xing=3, jie=1,
         act='把酒罐推过去，插上吸管', eff='好感+5，原形+3，算一次戒心'),
      it('g3_dates', '枣', 'PALMVLAE', '吃食', 2, 'jar',
         '一篮约 1.5 公斤 · 干枣 · 放在阴凉的地方能放一年 · 含糖高 · 吃多了牙疼',
         at=('PORTA', 'TEMPLVM'), gan=4, xing=1, jie=0,
         act='把一篮枣放下', eff='好感+4，原形+1，不算戒心'),
      it('g3_tablet', '空白泥板', 'TABELLA', '杂物', 1, 'tablet',
         '10×7 厘米 · 湿泥 · 写完要晒或烤 · 没干之前可抹平重写 · 干后改不了',
         at=('TABVLARIVM',)),
      it('g3_stylus', '芦苇笔', 'STILVS', '器物', 1, 'needle',
         '长 12 厘米 · 芦苇削成三角尖 · 在湿泥上压出楔形 · 尖钝了削一刀就能用',
         at=('TABVLARIVM',)),
      it('g3_seal', '滚印', 'SIGILLVM', '杂物', 12, 'seal',
         '圆柱 · 直径 12 毫米 · 石 · 在泥板上滚一道即是签名 · 丢了要报官，补刻另算',
         at=('TABVLARIVM', 'TEMPLVM')),
      it('g3_wool', '羊毛披肩', 'PALLA', '衣物', 5, 'sash',
         '幅 120×60 厘米 · 羊毛 · 单层 · 冬天要两条叠着穿 · 不压耳',
         at=('PORTA',)),
      it('g3_sandal', '皮凉鞋', 'SOLEA', '衣物', 3, 'slipper',
         '底厚 8 毫米 · 牛皮 · 猫科足型专制，脚趾处放开 · 走沙地一个月换底',
         at=('PORTA',)),
      it('g3_oil', '芝麻油', 'OLEVM', '消耗', 4, 'flask',
         '瓶装 500 毫升 · 点灯或抹身 · 密封能放半年 · 开瓶后一个月之内用完',
         at=('TEMPLVM', 'PORTA')),
      it('g3_spearman', '铜矛', 'HASTA AENEA', '武器', 20, 'spear',
         '全长 200 厘米 · 铜头木杆 · 连头重 1.8 公斤 · 兵籍在册子上的人拿册子去领 · 私下卖要罚钱',
         at=('MVRVS', 'PORTA')),
      it('g3_ration', '口粮册上的干饼', 'PANIS', '吃食', 1, 'bread',
         '四张约 500 克 · 大麦粉烤 · 能放五日 · 硬，要泡水或汤',
         at=('MVRVS', 'TEMPLVM'), gan=2, xing=0, jie=0,
         act='递过去两张干饼', eff='好感+2，原形不动，不算戒心'),
    ],
}

# ═══════════ 四 · 印度河城市（前二五〇〇年 · 旧大陆） ═══════════
GOODS[4] = {
    'unit': '砝',
    'note': ('这一代用标准砝码，一砝约 13.6 克，砝码是官造的立方石块，各处通用。'
             '大仓和浴池边的摊子都用同一套砝码，缺斤少两的货直接没收。'
             '排水沟口和屋顶路上没有正经摊位，买东西靠碰。'),
    'items': [
      it('g4_wheat', '小麦', 'TRITICVM', '吃食', 1, 'ricebowl',
         '一袋约 9 公斤 · 仓储登记后发放 · 放在干燥的地方能放一年 · 潮湿的天气要摊开晾',
         at=('GRANARIVM',), gan=3, xing=0, jie=0,
         act='把一袋小麦搁在门边', eff='好感+3，原形不动，不算戒心'),
      it('g4_soap', '皂土', 'TERRA LAVANDI', '消耗', 2, 'powder',
         '块装 200 克 · 碱土压成 · 浴池洗毛用 · 遇水化开 · 别弄进眼睛',
         at=('BALNEVM',)),
      it('g4_comb', '牙梳', 'PECTEN', '杂物', 3, 'comb',
         '长 11 厘米 · 象牙 · 双面，一面疏一面密 · 换毛期梳底毛用 · 齿断了修不了',
         at=('BALNEVM',), gan=6, xing=2, jie=1,
         act='把梳子递过去', eff='好感+6，原形+2，算一次戒心'),
      it('g4_towel', '棉布巾', 'LINTEVM', '杂物', 2, 'wrap',
         '90×50 厘米 · 棉 · 吸水 · 洗浴后擦毛用 · 每次用完要晾干，不然发霉',
         at=('BALNEVM', 'TECTA')),
      it('g4_lamp2', '陶灯', 'LVCERNA', '器物', 2, 'lamp',
         '容油 60 毫升 · 陶 · 一次加满大约能烧四小时 · 屋顶路上风大，要加罩',
         at=('TECTA', 'GRANARIVM')),
      it('g4_brick', '标准砖', 'LATER', '器物', 1, 'stone',
         '28×14×7 厘米 · 泥砖 · 全城同一尺寸 · 修屋补墙用 · 单块重约 4 公斤',
         at=('CLOACA', 'TECTA')),
      it('g4_weight', '砝码一副', 'PONDVS', '杂物', 6, 'stone',
         '立方石 · 七枚一副 · 从 1 砝到 64 砝 · 官造有印 · 缺一枚整副作废',
         at=('GRANARIVM',)),
      it('g4_bangle', '贝壳镯', 'ARMILLA', '衣物', 4, 'ribbon',
         '内径 55 毫米 · 海贝磨 · 一只 · 戴腕上 · 磕碰易裂',
         at=('BALNEVM', 'TECTA'), gan=5, xing=2, jie=0,
         act='把镯子放在台面上', eff='好感+5，原形+2，不算戒心'),
      it('g4_rope2', '井绳', 'FVNIS', '杂物', 2, 'chain',
         '长 12 米 · 棉麻合股 · 承重 60 公斤 · 排水沟口打捞用 · 泡水后要晾，不然烂芯',
         at=('CLOACA',)),
      it('g4_flat', '扁豆', 'LENS', '吃食', 1, 'greens',
         '一袋 2 公斤 · 干 · 能放一年 · 煮前要泡四小时 · 不泡会硬',
         at=('GRANARIVM',), gan=2, xing=0, jie=0,
         act='把扁豆倒进锅里', eff='好感+2，原形不动，不算戒心'),
    ],
}

# ═══════════ 五 · 克里特港口（前一四五〇年 · 欧洲—地中海） ═══════════
GOODS[5] = {
    'unit': '斤',
    'note': ('这一代用铜块算价，一斤约 470 克，港口的秤在货栈门口，谁都可以复秤。'
             '货封拆过的箱子价打八折，这是港口的老规矩。'
             '望岬上没有铺子，只有等船的人互相换点东西。'),
    'items': [
      it('g5_oliveoil', '橄榄油', 'OLEVM OLIVAE', '消耗', 3, 'flask',
         '罐装 2 升 · 头道压榨 · 密封能放一年 · 开罐后两个月之内用完 · 也能抹手抹毛',
         at=('CELLA', 'PORTVS')),
      it('g5_wine', '兑水的酒', 'VINVM', '吃食', 2, 'winejar',
         '罐装 1.5 升 · 葡萄酒兑三成水 · 开罐三天之内喝完 · 不兑水太烈',
         at=('PORTVS',), gan=5, xing=3, jie=1,
         act='把酒罐揭开', eff='好感+5，原形+3，算一次戒心'),
      it('g5_octopus', '晒的章鱼', 'POLYPVS', '吃食', 3, 'fish',
         '一条约 400 克 · 晒干 · 能放两个月 · 吃前要泡软再烤 · 咸',
         at=('PORTVS', 'PROMVNTVRIVM'), gan=7, xing=5, jie=1,
         act='把烤好的章鱼撕开一半', eff='好感+7，原形+5，算一次戒心'),
      it('g5_pitch', '船用沥青', 'PIX', '消耗', 4, 'jar',
         '桶装 3 公斤 · 补船缝用 · 要加热到能流动 · 冷了硬如石 · 沾手要用油擦',
         at=('NAVALIA',)),
      it('g5_awl', '缝帆锥', 'SVBVLA', '器物', 3, 'needle',
         '长 14 厘米 · 铜尖木柄 · 缝帆布与皮革 · 配蜡线用 · 尖子容易钝，要常磨',
         at=('NAVALIA',)),
      it('g5_sailcloth', '帆布', 'CARBASVS', '杂物', 6, 'wrap',
         '幅 200×90 厘米 · 亚麻厚织 · 补帆或搭棚 · 湿重会翻倍 · 不防火',
         at=('NAVALIA', 'CELLA')),
      it('g5_sealclay', '货封泥', 'SIGNVM', '杂物', 1, 'seal',
         '一盒约 300 克 · 细泥 · 按印后晾一日即硬 · 拆封留痕，看得出来',
         at=('CELLA',)),
      it('g5_tunic5', '短束衣', 'TVNICA BREVIS', '衣物', 5, 'tunic',
         '及膝 · 亚麻 · 腰上系带不勒 · 尾部开口 · 海风天要加披肩',
         at=('PORTVS', 'CELLA')),
      it('g5_hook', '鱼钩一把', 'HAMVS', '器物', 2, 'pin',
         '十枚一把 · 铜 · 长 20 到 40 毫米 · 配麻线 · 生锈了磨一下还能用',
         at=('PORTVS', 'PROMVNTVRIVM')),
      it('g5_lookout', '望远的铜片', 'SPECVLVM', '杂物', 7, 'mirror',
         '直径 90 毫米 · 抛光铜 · 反光传信用 · 阴天用不了 · 表面每十天要重抛一次',
         at=('PROMVNTVRIVM',)),
    ],
}

# ═══════════ 六 · 新王国尼罗河神庙粮仓（前一四〇〇年 · 旧大陆） ═══════════
GOODS[6] = {
    'unit': '德本',
    'note': ('钱是铜，按重量算，一德本约 91 克。神庙里大多不用钱，直接按口粮册发。'
             '粮仓的封印是官封，拆封要有文书，私拆算偷粮仓处理。'
             '河堤和水位阶上没有铺子，那两处只有当班的人。'),
    'items': [
      it('g6_emmer', '二粒小麦', 'FAR', '吃食', 1, 'ricebowl',
         '一袋约 10 公斤 · 神庙口粮册定量 · 放在干燥的地方能放一年 · 出仓要销一次账',
         at=('HORREVM SACRVM',), gan=3, xing=0, jie=0,
         act='按册子把口粮点给她', eff='好感+3，原形不动，不算戒心'),
      it('g6_bread6', '厚面饼', 'PANIS', '吃食', 1, 'bread',
         '两张约 700 克 · 二粒小麦粉 · 当天吃最好 · 隔一天要烤过再吃 · 沙子难免',
         at=('ATRIVM', 'HORREVM SACRVM'), gan=3, xing=1, jie=0,
         act='掰开一张面饼', eff='好感+3，原形+1，不算戒心'),
      it('g6_beer6', '面包啤酒', 'ZYTHVM', '吃食', 2, 'winejar',
         '罐装 2 升 · 面包发酵 · 稠 · 两天之内喝完 · 神庙按日配给，不外卖',
         at=('ATRIVM',), gan=5, xing=3, jie=1,
         act='把啤酒罐推过去', eff='好感+5，原形+3，算一次戒心'),
      it('g6_linen', '亚麻长衣', 'LINTEA', '衣物', 6, 'robe',
         '及踝 · 亚麻 · 轻薄透气 · 尾部开口 · 洗后会缩，要留出余量',
         at=('ATRIVM',)),
      it('g6_kohl6', '眼膏', 'STIBIVM', '杂物', 3, 'powder',
         '小罐 10 克 · 方铅矿研粉调油 · 挡河面反光 · 每日一次 · 别弄进眼睛',
         at=('ATRIVM',)),
      it('g6_papyrus', '纸草纸', 'PAPYRVS', '杂物', 4, 'tablet',
         '一卷 200×20 厘米 · 纸草压制 · 写账用 · 受潮会散 · 卷起来存',
         at=('HORREVM SACRVM',)),
      it('g6_sealring', '封印', 'SIGILLVM', '杂物', 9, 'seal',
         '指环式 · 直径 20 毫米 · 石 · 官封用 · 私自照着做算重罪',
         at=('HORREVM SACRVM',)),
      it('g6_rod', '水位尺', 'MENSVRA', '器物', 5, 'stone',
         '长 150 厘米 · 石刻 · 刻度以肘为单位 · 只在水位阶上用 · 搬不动，也不许搬',
         at=('NILOMETRVM',)),
      it('g6_basket', '芦苇筐', 'CORBIS', '器物', 2, 'chest',
         '容量 20 升 · 芦苇编 · 搬谷子用 · 装 15 公斤以上会破底',
         at=('HORREVM SACRVM', 'RIPA NILI')),
      it('g6_oilfish', '腌鱼', 'PISCIS SALSVS', '吃食', 2, 'jar',
         '一罐约 800 克 · 盐渍 · 能放三个月 · 咸，吃前要泡 · 神庙里不许带进内庭',
         at=('RIPA NILI', 'ATRIVM'), gan=6, xing=3, jie=1,
         act='把腌鱼罐揭开', eff='好感+6，原形+3，算一次戒心'),
    ],
}

# ═══════════ 七 · 古典雅典的柱廊以外（前四三〇年 · 欧洲—地中海） ═══════════
GOODS[7] = {
    'unit': '奥波尔',
    'note': ('钱是银币，六奥波尔合一德拉克马，一个匠人一天挣一德拉克马上下。'
             '市集上外邦人摆摊要另交一份摊税，价里已经算进去了。'
             '长墙一带没有正经市面，只有兵和往来的人。'),
    'items': [
      it('g7_olives', '腌橄榄', 'OLIVAE', '吃食', 1, 'jar',
         '一罐 500 克 · 盐水泡 · 能放半年 · 开罐后盐水要一直没过 · 咸',
         at=('AGORA',), gan=3, xing=1, jie=0,
         act='把橄榄罐推过去', eff='好感+3，原形+1，不算戒心'),
      it('g7_fish7', '小咸鱼', 'SALSAMENTVM', '吃食', 2, 'fish',
         '一包 300 克 · 黑海来的 · 盐渍 · 能放两个月 · 港口比市集便宜两成',
         at=('AGORA', 'PIRAEVS'), gan=6, xing=4, jie=1,
         act='打开鱼包', eff='好感+6，原形+4，算一次戒心'),
      it('g7_cheese7', '羊乳酪', 'CASEVS', '吃食', 2, 'cheese',
         '一块 300 克 · 羊乳 · 盐渍 · 能放一个月 · 配面包吃',
         at=('AGORA',), gan=5, xing=2, jie=1,
         act='切下一块乳酪', eff='好感+5，原形+2，算一次戒心'),
      it('g7_himation', '外袍', 'HIMATION', '衣物', 8, 'cloak',
         '幅 280×130 厘米 · 羊毛 · 整幅缠身，不裁不缝 · 缠法要学 · 冬天单穿不够',
         at=('AGORA',)),
      it('g7_strigil', '刮身器', 'STRIGILIS', '杂物', 4, 'ge',
         '长 25 厘米 · 铜 · 弧形刃 · 刮汗与浮毛用 · 刃口钝的才对，锋利的会伤皮',
         at=('STOA', 'AGORA')),
      it('g7_lamp7', '双嘴陶灯', 'LVCERNA', '器物', 3, 'lamp',
         '容油 100 毫升 · 陶 · 两个灯嘴 · 一次加满大约能烧六小时 · 柱廊里夜谈用',
         at=('STOA',)),
      it('g7_tablet7', '蜡板', 'TABELLA CERATA', '杂物', 3, 'tablet',
         '两片合 18×12 厘米 · 木框填蜡 · 铁笔写，抹平重用 · 夏天蜡会软',
         at=('STOA',)),
      it('g7_sandal7', '皮凉鞋', 'SANDALIVM', '衣物', 5, 'slipper',
         '底厚 10 毫米 · 牛皮 · 猫科足型开趾 · 长墙一带石子多，一个月换一次底',
         at=('AGORA', 'PIRAEVS')),
      it('g7_rope7', '船缆', 'FVNIS NAVALIS', '杂物', 5, 'chain',
         '长 20 米 · 麻 · 承重 300 公斤 · 每十天要查一次磨损处',
         at=('PIRAEVS',)),
      it('g7_shield7', '轻圆盾', 'PELTA', '防具', 14, 'shield',
         '直径 60 厘米 · 柳条蒙皮 · 重 2.2 公斤 · 小队制里斥候用 · 挡不住正面重击',
         at=('MVRVS LONGVS', 'AGORA')),
      it('g7_honey', '蜂蜜', 'MEL', '吃食', 4, 'jar',
         '罐装 400 克 · 山地采 · 不会坏 · 结晶了温一下就化 · 甜',
         at=('AGORA',), gan=6, xing=2, jie=0,
         act='舀一勺蜂蜜', eff='好感+6，原形+2，不算戒心'),
    ],
}

# ═══════════ 八 · 罗马家内（五〇年 · 欧洲—地中海） ═══════════
GOODS[8] = {
    'unit': '阿斯',
    'note': ('钱是铜阿斯，四阿斯合一塞斯特斯。广场上标价用塞斯特斯，零买按阿斯找。'
             '奥斯提亚港的货比城里便宜一两成，但要自己雇车运。'
             '家宅里的东西大多是主人买的，不走店铺。'),
    'items': [
      it('g8_bread8', '面包', 'PANIS', '吃食', 2, 'bread',
         '一个约 800 克 · 小麦粉 · 当天吃最好 · 隔一天烤过再吃 · 城里到处有卖',
         at=('FORVM', 'DOMVS'), gan=3, xing=1, jie=0,
         act='掰开一个面包', eff='好感+3，原形+1，不算戒心'),
      it('g8_garum', '鱼酱', 'GARVM', '吃食', 6, 'flask',
         '瓶装 250 毫升 · 小鱼发酵 · 味极重 · 能放一年 · 一次几滴就够',
         at=('FORVM', 'OSTIA'), gan=7, xing=4, jie=1,
         act='把鱼酱瓶开一点缝', eff='好感+7，原形+4，算一次戒心'),
      it('g8_wine8', '掺水的酒', 'VINVM', '吃食', 3, 'winejar',
         '罐装 2 升 · 兑水两成 · 三天之内喝完 · 不掺水会上头',
         at=('FORVM',), gan=5, xing=3, jie=1,
         act='把酒倒进两只杯子', eff='好感+5，原形+3，算一次戒心'),
      it('g8_tunic8', '家内短衣', 'TVNICA', '衣物', 9, 'tunic',
         '及膝 · 羊毛 · 尾部开口缝边 · 家内当班穿 · 洗后要拉平了晾',
         at=('DOMVS', 'FORVM')),
      it('g8_lamp8', '铜灯', 'LVCERNA AENEA', '器物', 7, 'lamp',
         '容油 120 毫升 · 铜 · 一次加满大约能烧八小时 · 夜间仓务用 · 灯芯每晚剪一次',
         at=('HORREA', 'DOMVS')),
      it('g8_tessera', '出入牌', 'TESSERA', '杂物', 5, 'tag',
         '骨牌 · 40×20 毫米 · 刻仓名与编号 · 夜间进仓栈拿它 · 丢了要补文书',
         at=('HORREA',)),
      it('g8_manumit', '解放文书副本', 'LIBELLVS', '杂物', 30, 'tablet',
         '蜡板两片 · 抄件 · 正本存官 · 副本随身 · 蜡面要避开热的地方，化了就没了',
         at=('FORVM',)),
      it('g8_oil8', '灯油', 'OLEVM', '消耗', 2, 'flask',
         '瓶装 1 升 · 橄榄油次榨 · 点灯用 · 能放半年 · 也能应急吃，但味道不好',
         at=('FORVM', 'HORREA')),
      it('g8_hook8', '搬货钩', 'HAMVS', '器物', 4, 'ge',
         '长 30 厘米 · 铁钩木柄 · 钩麻袋用 · 每十天查一次钩尖有没有裂',
         at=('HORREA', 'OSTIA')),
      it('g8_cloak8', '连帽斗篷', 'PAENVLA', '衣物', 12, 'cloak',
         '及小腿 · 厚羊毛 · 带帽，帽子不压耳 · 防雨 · 湿了很重',
         at=('OSTIA', 'FORVM')),
      it('g8_comb8', '骨梳', 'PECTEN', '杂物', 3, 'comb',
         '长 10 厘米 · 骨 · 双面 · 换毛期用密齿那面 · 齿断不修',
         at=('FORVM', 'DOMVS'), gan=6, xing=2, jie=1,
         act='把梳子放在她手边', eff='好感+6，原形+2，算一次戒心'),
    ],
}

# ═══════════ 九 · 汉代边塞（一〇〇年 · 中国） ═══════════
GOODS[9] = {
    'unit': '钱',
    'note': ('钱是五铢。边塞上东西贵，粮和布大多按军户口粮册发，不走市面。'
             '驿置能买到的东西最杂，因为来往的人多。'
             '烽燧上什么都没有，只有当班的干粮。'),
    'items': [
      it('g9_millet', '粟', 'MILIVM', '吃食', 2, 'ricebowl',
         '一袋约 12 公斤 · 军户口粮册定量 · 放在干燥的地方能放一年 · 出仓的时候要销账',
         at=('VICVS MILITARIS', 'LIMES'), gan=3, xing=0, jie=0,
         act='按册子把粟点给她', eff='好感+3，原形不动，不算戒心'),
      it('g9_jerky9', '肉干', 'CARO SICCA', '吃食', 5, 'jerky',
         '一条约 200 克 · 风干 · 能放三个月 · 硬，要撕着吃 · 烽燧当班的常备',
         at=('IGNIS', 'STATIO'), gan=6, xing=3, jie=1,
         act='撕下一段肉干', eff='好感+6，原形+3，算一次戒心'),
      it('g9_tea', '姜汤料', 'ZINGIBER', '药', 3, 'herb',
         '一包 60 克 · 干姜切片 · 煮水喝 · 能放半年 · 夜里守燧驱寒用',
         at=('STATIO', 'LIMES')),
      it('g9_felt', '毡',  'COACTVM', '衣物', 8, 'wrap',
         '150×80 厘米 · 羊毛压制 · 铺盖两用 · 防风 · 湿了很难干',
         at=('VICVS MILITARIS', 'STATIO')),
      it('g9_boot9', '皮靴', 'CALIGA', '衣物', 10, 'boot',
         '筒高 25 厘米 · 牛皮 · 猫科足型，掌面留垫位 · 沙地一个季度换一次底',
         at=('VICVS MILITARIS',)),
      it('g9_signal', '烽燧的柴束', 'FASCIS', '消耗', 1, 'lamp',
         '一束约 5 公斤 · 干柴加狼粪 · 白日举烟，夜里举火 · 受潮就点不着',
         at=('IGNIS',)),
      it('g9_pass', '过所', 'DIPLOMA', '杂物', 15, 'tablet',
         '木牍 · 23×3 厘米 · 写明人、马、去处 · 过驿置验一次 · 没有过所就出不了关',
         at=('STATIO',)),
      it('g9_ink', '墨与笔', 'ATRAMENTVM', '杂物', 4, 'needle',
         '墨一锭 30 克，笔一支 · 写木牍用 · 墨要现磨 · 笔尖每十天洗一次',
         at=('STATIO',)),
      it('g9_bow', '弩', 'BALLISTA MANVALIS', '武器', 40, 'crossbow',
         '臂张力约 3 石 · 木臂铜机 · 连箭匣重 3.5 公斤 · 军械在册，私自留着要判刑',
         at=('LIMES',)),
      it('g9_arrow9', '箭', 'SAGITTAE', '消耗', 3, 'arrow',
         '十支一束 · 长 65 厘米 · 铜镞 · 射出后要捡回 · 镞卷了可回炉',
         at=('LIMES', 'IGNIS')),
      it('g9_salve9', '冻疮膏', 'VNGVENTVM', '药', 5, 'paste',
         '罐装 50 克 · 猪脂加药末 · 外敷 · 一天两次 · 开罐一个月之内用完',
         at=('VICVS MILITARIS', 'STATIO')),
    ],
}

# ═══════════ 十 · 萨珊波斯的驿站黄昏（四〇〇年 · 伊斯兰世界） ═══════════
GOODS[10] = {
    'unit': '德拉克马',
    'note': ('钱是银德拉克马。驿站的价按路券上的等级算，官差比商队便宜三成。'
             '货封查验在驿站门口做，封拆过要重封，重封另收钱。'
             '御道上和水井边没有铺子，只有过路的人互相换。'),
    'items': [
      it('g10_flatbread', '薄饼', 'PANIS TENVIS', '吃食', 2, 'bread',
         '五张约 400 克 · 现烤 · 当天吃 · 卷东西吃 · 放一夜就硬',
         at=('MANSIO',), gan=3, xing=1, jie=0,
         act='卷一张饼递过去', eff='好感+3，原形+1，不算戒心'),
      it('g10_yogurt', '酸奶', 'LAC ACIDVM', '吃食', 3, 'bowl',
         '罐装 500 毫升 · 羊乳发酵 · 两天之内喝完 · 兑水解暑 · 天热易过酸',
         at=('MANSIO', 'PVTEVS'), gan=5, xing=2, jie=1,
         act='把酸奶罐推过去', eff='好感+5，原形+2，算一次戒心'),
      it('g10_lamb', '炖羊肉', 'CARO OVILLA', '吃食', 7, 'meat',
         '一份约 350 克 · 现炖 · 当场吃 · 驿站的灶只在日落后开',
         at=('MANSIO',), gan=8, xing=5, jie=1,
         act='把炖肉端到她面前', eff='好感+8，原形+5，算一次戒心'),
      it('g10_waterskin', '水袋', 'VTER', '器物', 5, 'pail',
         '容量 5 升 · 羊皮 · 内涂柏油 · 满载 5.5 公斤 · 每日查缝线',
         at=('PVTEVS', 'MANSIO')),
      it('g10_pass10', '路券', 'DIPLOMA', '杂物', 20, 'seal',
         '皮片 · 90×50 毫米 · 盖驿印 · 拿它在驿站换马与住宿 · 过期不认',
         at=('MANSIO', 'CASTELLVM')),
      it('g10_saddle', '鞍垫', 'STRAGVLVM', '器物', 8, 'pad',
         '65×45 厘米 · 毛毡加皮 · 厚 30 毫米 · 长途骑乘 · 每十天拍打去尘',
         at=('MANSIO',)),
      it('g10_coat10', '骑行外袍', 'CANDYS', '衣物', 13, 'robe',
         '及膝 · 羊毛 · 两侧开衩便于骑 · 尾部另开口 · 领后系带不压耳',
         at=('MANSIO', 'CASTELLVM')),
      it('g10_rope10', '井绳', 'FVNIS PVTEI', '杂物', 3, 'chain',
         '长 15 米 · 麻 · 承重 80 公斤 · 井口磨得最快，每十天查一次',
         at=('PVTEVS',)),
      it('g10_sword10', '直刀', 'GLADIVS', '武器', 35, 'sword',
         '刃长 70 厘米 · 钢 · 连鞘 1.4 公斤 · 商队护卫契内可以带 · 进城要登记',
         at=('CASTELLVM', 'MANSIO')),
      it('g10_seal10', '封泥盒', 'CAPSA SIGNI', '杂物', 6, 'seal',
         '木盒 · 60×40 毫米 · 内装封泥 · 重封货物用 · 泥干了要换',
         at=('MANSIO',)),
    ],
}

# ═══════════ 十一 · 拜占庭君士坦丁堡港口（五五〇年 · 欧洲—地中海） ═══════════
GOODS[11] = {
    'unit': '福利斯',
    'note': ('钱是铜福利斯，二百八十八福利斯合一金诺米斯玛。日常都用铜。'
             '海关棚查验后货物才准进城，查验单要随货走。'
             '水槽那边不做买卖，只有来打水的人。'),
    'items': [
      it('g11_bread11', '军面包', 'BVCELLATVM', '吃食', 2, 'bread',
         '两块约 500 克 · 烤两次 · 极硬 · 能放三个月 · 要泡汤或水',
         at=('PORTVS THEODOSII', 'NEORION'), gan=2, xing=0, jie=0,
         act='把干面包泡进汤里', eff='好感+2，原形不动，不算戒心'),
      it('g11_fish11', '腌鲭鱼', 'SCOMBER', '吃食', 4, 'fish',
         '一罐 600 克 · 盐渍 · 能放三个月 · 咸 · 开罐后三天之内吃完',
         at=('PORTVS THEODOSII',), gan=6, xing=4, jie=1,
         act='把鱼罐揭开', eff='好感+6，原形+4，算一次戒心'),
      it('g11_wine11', '松脂酒', 'VINVM RESINATVM', '吃食', 3, 'winejar',
         '罐装 1.5 升 · 加松脂防坏 · 味冲 · 开罐五天之内喝完',
         at=('PORTVS THEODOSII',), gan=5, xing=3, jie=1,
         act='把酒罐推过去', eff='好感+5，原形+3，算一次戒心'),
      it('g11_silk', '丝带', 'SERICVM', '衣物', 25, 'ribbon',
         '幅 200×8 厘米 · 丝 · 系发或系尾根 · 官营，出售要有单子 · 不能水洗',
         at=('TELONEVM',)),
      it('g11_seal11', '海关铅封', 'BVLLA', '杂物', 3, 'seal',
         '铅片 · 直径 25 毫米 · 查验后压在绳结上 · 拆封留痕 · 私自压封算伪造处理',
         at=('TELONEVM',)),
      it('g11_tar', '船用焦油', 'PIX NAVALIS', '消耗', 5, 'jar',
         '桶装 4 公斤 · 补缝与涂底 · 用前加热 · 沾手用油擦 · 明火附近不能开桶',
         at=('NEORION',)),
      it('g11_nail', '船钉', 'CLAVI', '器物', 4, 'pin',
         '五十枚一包 · 铁 · 长 70 毫米 · 修船用 · 受潮生锈，要泡油存',
         at=('NEORION',)),
      it('g11_bucket', '水桶', 'SITVLA', '器物', 3, 'pail',
         '容量 8 升 · 木条箍铁 · 水槽取水用 · 干太久会漏，要先泡胀',
         at=('CISTERNA', 'NEORION')),
      it('g11_cloak11', '带帽披风', 'CHLAMYS', '衣物', 14, 'cloak',
         '及小腿 · 厚毛 · 右肩别扣 · 帽子不压耳 · 海风天当班穿',
         at=('TELONEVM', 'PORTVS THEODOSII')),
      it('g11_lamp11', '玻璃灯', 'LVCERNA VITREA', '器物', 9, 'lamp',
         '容油 150 毫升 · 玻璃碗配铜架 · 亮度比陶灯高 · 摔了就没了',
         at=('TELONEVM',)),
    ],
}

# ═══════════ 十二 · 中世纪修院（八〇〇年 · 欧洲—地中海） ═══════════
GOODS[12] = {
    'unit': '第纳尔',
    'note': ('钱是银第纳尔，十二第纳尔合一索里都。修院自己不收钱，客舍的东西按施舍算。'
             '院外林地的柴和果子谁采谁得，但采多了要报给管林的。'
             '缮写室的东西全部不外售，只在院内领用。'),
    'items': [
      it('g12_pottage', '豆汤', 'PVLMENTVM', '吃食', 1, 'soup',
         '一碗约 400 毫升 · 豆与菜煮 · 当天吃 · 修院日常两餐之一 · 不放肉',
         at=('HOSPITIVM', 'CLAVSTRVM'), gan=3, xing=0, jie=0,
         act='把汤碗端过去', eff='好感+3，原形不动，不算戒心'),
      it('g12_cheese12', '院里做的乳酪', 'CASEVS', '吃食', 3, 'cheese',
         '一块 400 克 · 牛乳 · 熟成两个月 · 还能再能放两个月 · 客舍施舍常给这个',
         at=('HOSPITIVM',), gan=5, xing=2, jie=1,
         act='切下一块乳酪', eff='好感+5，原形+2，算一次戒心'),
      it('g12_ale', '淡啤酒', 'CEREVISIA', '吃食', 2, 'winejar',
         '罐装 1 升 · 修院酿 · 酒精度低 · 三天之内喝完 · 冬天配汤',
         at=('HOSPITIVM',), gan=4, xing=2, jie=1,
         act='倒一碗淡啤酒', eff='好感+4，原形+2，算一次戒心'),
      it('g12_habit', '粗呢外衣', 'CVCVLLA', '衣物', 7, 'robe',
         '及踝 · 没染色粗呢 · 带风帽，帽口开得下耳朵 · 尾部开口 · 扎人，里面要衬一层',
         at=('CLAVSTRVM', 'HOSPITIVM')),
      it('g12_blanket', '毛毯', 'STRAGVLVM', '杂物', 5, 'wrap',
         '190×110 厘米 · 羊毛 · 冬季庇护发给过夜的人 · 每年春天要晒一次防蛀',
         at=('HOSPITIVM',)),
      it('g12_quill', '鹅毛笔', 'PENNA', '杂物', 1, 'needle',
         '长 22 厘米 · 鹅翎 · 尖用小刀削 · 写半页就要重削 · 一支写不了一天',
         at=('SCRIPTORIVM',)),
      it('g12_ink12', '铁胆墨', 'ATRAMENTVM', '消耗', 4, 'flask',
         '瓶装 100 毫升 · 五倍子加铁盐 · 干后变黑 · 沾手要洗久 · 密封能放一年',
         at=('SCRIPTORIVM',)),
      it('g12_parch', '羊皮纸', 'MEMBRANA', '杂物', 12, 'tablet',
         '一张 30×22 厘米 · 小牛皮 · 刮修后可重写 · 受潮起皱 · 平放存',
         at=('SCRIPTORIVM',)),
      it('g12_axe', '柴斧', 'SECVRIS', '器物', 8, 'ge',
         '全长 60 厘米 · 铁头木柄 · 重 1.6 公斤 · 院外林地用 · 每十天磨一次刃',
         at=('SILVA',)),
      it('g12_herb12', '院里种的药草', 'HERBAE', '药', 3, 'herb',
         '一包 40 克 · 阴干 · 煮水或外敷 · 能放一年 · 用法要问管药的',
         at=('CLAVSTRVM', 'SILVA')),
      it('g12_candle', '蜡烛', 'CEREVS', '消耗', 2, 'lamp',
         '一支长 20 厘米 · 蜂蜡 · 大约能烧六小时 · 比油灯亮，也贵 · 缮写室夜里用',
         at=('SCRIPTORIVM', 'CLAVSTRVM')),
    ],
}


# 说明书体的自检。踩过三次才写下来的：
#   一、不许文言。须／不可／凭／按…论／无…不得 这一类，一个都不许留。
#   二、替换规则叠加会洗出「能能放」「容易钝，容易钝」这种重复，机器看不出来，眼睛才看得出，
#       所以这里连「同一段里两个字连着重复」和「整句重复」一起抓。
WEN = re.compile(r'(须|不可|凭|按.{1,3}论|无.{1,4}不得|之外|一律|多半)')
DUP = re.compile(r'(.{2,6})\1')


def wording(cn, t):
    m = WEN.search(t)
    assert not m, '%s 的说明里还有文言词「%s」：%s' % (cn, m.group(0), t)
    m = DUP.search(t)
    assert not m, '%s 的说明里有重复「%s」：%s' % (cn, m.group(1), t)
    segs = [x for x in re.split(r'[，·]', t) if len(x) > 3]
    assert len(segs) == len(set(segs)), '%s 的说明里有整句重复：%s' % (cn, t)


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
            wording(o['cn'], o['spec'])
            n += 1
        wording('纪年 %d 的市场说明' % era, g['note'])
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
