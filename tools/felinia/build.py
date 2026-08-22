#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 tools/felinia/ 下的资料编译成游戏运行时读的三份 JSON。

    python3 tools/felinia/build.py

产出（core/res/data/felinia/）
    eras.json   四十一个纪年：地点 · 身份 · 服装 · 制度 · 十位有名有姓的人
    gen.json    生成机制的零件库：口吻谱 · 形态型 · 毛色 · 性情 · 尾耳 · 关系
    lore.json   世界书条目。八条通则（每回合都在）＋ 每个纪年五条（国家/历史/政治/事件/野史）

编译前先自检。检查不过就不写文件——半份资料比没有资料更难查。
"""
import io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT  = os.path.join(ROOT, 'core/res/data/felinia')
ANN  = os.path.join(ROOT, 'core/res/img/annals/annals.json')

sys.path.insert(0, HERE)
import pools                                    # noqa: E402
from eras_a import ERAS_A                       # noqa: E402
from eras_b import ERAS_B                       # noqa: E402
from eras_c import ERAS_C                       # noqa: E402
from eras_d import ERAS_D                       # noqa: E402
from lore_data import LORE                      # noqa: E402

ERAS = ERAS_A + ERAS_B + ERAS_C + ERAS_D

# ═══════════ 通则：不分纪年，每一局都成立 ═══════════
# 全部出自母本。这八条是常驻的——它们不是「这一年发生了什么」，
# 而是「这个世界的身体和制度一直是这样」。写成条目式，给神谕看。
CORE = [
 {'t': '身体', 'k': ['猫耳', '尾巴', '肉垫', '掉毛', '换毛', '夜视', '爬', '游'],
  'c': ['身高中位约一四〇厘米，体重中位约四〇公斤。',
        '猫耳与尾巴承担感官与情绪表达。尾根神经丰富。',
        '手是人类手形，可用针、笔、枪机、电报键；手背有毛，掌面有肉垫。',
        '脚是猫科式脚掌与肉垫，不是人类脚。普通鞋楦、踏板、长时间站姿都需调整。',
        '身体掉毛，换毛期尤其明显。',
        '正面攻击力与抗击打很弱：普通成年人甚至儿童都可能把成年猫娘打晕。',
        '跑得远快于人类；能爬墙、爬树、翻屋顶；夜视优良；天生会游；平衡与反应极高。',
        '夜视不是在全黑中看见东西。天生会游不等于不会失温、不会淹死。',
        '不要写成「动作快所以力气大」。实测是相反的组合。']},
 {'t': '血与卫生', 'k': ['血', '输血', '医院', '便所', '颗粒', '疫'],
  'c': ['猫娘的血只能在猫娘之间使用，不能与人类血液混用。',
        '任何医院、军队、灾害系统都必须维持并行的血源、检验与紧急调度。',
        '不能使用人类水冲便所，须用干燥颗粒料或等效的颗粒吸附系统。低位、密闭。',
        '对部分只在人类身体中流行的出疹热、儿童热病与疟疾，发病率可只有同住人类的十分之一至三分之一。',
        '代价是另一套负担：猫科呼吸热、幼年肠炎、消耗性血病、肾脏尿路与心肌病。',
        '二十五岁以后的肾脏与心肌重病率约为同龄人类的一点五至二点五倍。',
        '不要写成「猫娘身体弱」或「猫娘不生病」。两句都错。']},
 {'t': '窝群与生育', 'k': ['窝群', '一窝', '女儿', '姊妹', '母亲', '生育', '发情'],
  'c': ['人类男性与猫娘所生的后代只能是猫娘。',
        '一生只生一窝，一窝可有多名女儿。长期平均约四点四名活产。',
        '妊娠约九十至九十五日，约为人类的三分之一。',
        '古代每百名活产幼女只有三十至四十五名活到适宜生育的年龄。',
        '十至十二岁进入青春期；十三至十八岁安全完成一窝；三十五至四十五岁已相当于人类老年；五十岁以上属长寿个案。',
        '寿命约为同地同阶层人类的一半。人类伴侣通常比她多活二三十年。',
        '有固定发情期，无人类式单一伴侣概念，也不产生人类式出轨负罪感。',
        '建立长期情感依附时更看重对方是否善待自己；被彻底抛弃可能情绪崩溃。',
        '窝群＝母女、姊妹、同伴与共同照护组成的关系网，可跨越单一住宅或婚姻。']},
 {'t': '军务原则', 'k': ['军', '兵', '斥候', '侦察', '夜袭', '传令', '搜救'],
  'c': ['猫娘负责「先到、先看、先扰动」；人类负责「推进、承受、占领、维持」。',
        '不应被投入长时间正面肉搏。当轻型重步兵用，会造成极高伤亡与忠诚崩溃。',
        '指挥链必须跟得上她提供的信息。指挥迟缓，速度只会制造孤立与失联。',
        '需要高自主权、明确任务边界与快速撤退权。以羞辱、棍棒和机械操练维持纪律会失败。',
        '军功一旦成为胜负关键，就会转化为军饷要求、退役保障与公民权谈判。',
        '兵籍常早于婚籍承认她是独立行动者。']},
 {'t': '服装', 'k': ['衣', '服', '礼服', '头巾', '束腰', '制服', '裹脚'],
  'c': ['因毛发与散热需要通风、裸露面积较大的服装。古代社会常把这个功能需求道德化。',
        '不能使用硬质束腰体系；长期束腰会破坏呼吸、脊柱、尾根与平衡。',
        '裹脚在技术上完全不成立——她的脚是猫脚与肉垫。',
        '传统压耳式头巾会造成持续疼痛与感官受限，没有猫娘愿意戴。',
        '伊斯兰法域发展不压耳的肩披、宽袍、耳间薄纱，以整体端庄取代复制人类女性的头巾形式。',
        '好的裁法把压力分散在肩颈、背腰与裙裤侧缝，不把人做成舞台奇装。']},
 {'t': '情绪与尾语', 'k': ['耳朵', '尾巴', '情绪', '尾语', '摇', '僵'],
  'c': ['情绪强烈，耳朵、尾巴、姿态和声音会把情绪直接写在身体上。',
        '开心时尾巴摇动，恐惧时贴紧或僵直，愤怒时快速摆动。',
        '人类容易读懂她们，也更容易操纵、刺激或误判她们。',
        '可以通过训练控制或伪装尾巴动作，但这会形成额外心理负担。',
        '正式礼仪、军队和王室环境会要求掌握「尾语控制」。',
        '反例：惊吓可能使尾部僵直而非摆动；疼痛与疾病也会改变尾耳。耳尾不是不会说谎。',
        '未经同意触碰尾巴属于身体侵犯。']},
 {'t': '同类沟通', 'k': ['同类', '信号', '手势', '认出', '互助'],
  'c': ['能用耳、尾、姿态、气味和短促声调跨语言理解同类。这不是心灵感应。',
        '这项能力使跨境互助早于电报与民族护照。',
        '它没有消除国家、阶级与宗教：欧洲猫娘可随蒙古军攻击欧洲城镇，'
        '法国猫娘可在殖民军中指挥北非猫娘，中国猫娘会把联军中的猫娘军官视为侵略者。',
        '能读懂对方的恐惧，不等于愿意服从同一种政治。',
        '能比人类更准确理解猫的耳位、尾部、瞳孔与情绪，但不能与猫进行抽象语言对话。',
        '猫娘群体普遍反感人类养猫。']},
 {'t': '写这个世界时的禁忌', 'k': ['猫娘', '世界', '设定'],
  'c': ['不要把猫娘统一写成善良、受害或进步。她们能救援、协作、压迫、殖民、背叛、参战，也会遭受同样的行为。',
        '猫娘不是少数族群：人口与该国人类女性相当，约占总人口三分之一。',
        '没有「白人猫娘、东亚猫娘、黑人猫娘」这样的人类式面容分界。'
        '国籍主要通过语言、衣饰、宗教、步态训练、礼仪和姓名显现。',
        '旧大陆的例外：日本与部分东南亚岛国近代以前没有稳定猫娘人口；新大陆在欧洲人到来前没有本土猫娘。',
        '身体差异不会自动写出政治答案。要解释的是：谁有权给这些能力定价。',
        '不要发明精巧的制度、换算、装置或债务体系。想加机制的那个冲动本身就是停手的信号。',
        '不要在正文里做算术。不要报数目、算余额、结总账。',
        '不要给情绪起名字（「惨烈」「地狱般」）。写当场看得见的：谁做了什么，什么东西经了手。']},
]


# ═══════════ 「本地人住在哪儿」 ═══════════
# 档案里要有一行「如今住在……」。用地点表（水门、后门、桅顶）去填这一栏会闹笑话——
# 那些是干活的地方，不是住处。所以每一代单写一句：这一代的人平常住在什么样的地方。
HOME = {
 1:'火堆下风处的窝棚', 2:'河岸聚落的土屋', 3:'城墙根下的排屋', 4:'砖巷里的低位屋',
 5:'港边的石砌小屋', 6:'河堤边的泥砖屋', 7:'城外的外邦人区', 8:'仓栈后头的租房',
 9:'军户里的土房', 10:'驿站旁的客舍', 11:'港区的窄楼', 12:'修院客舍的通铺',
 13:'商栈后院的通铺', 14:'泊地边的木屋', 15:'夜市后巷的赁屋', 16:'楼里的后房',
 17:'城外棚户', 18:'随营移动的毡帐', 19:'商栈的通铺', 20:'教区的旧屋',
 21:'水巷边的浮屋', 22:'船坞后头的窄屋', 23:'港边的水手宿处', 24:'营地边的木棚',
 25:'港区的合租屋', 26:'宅邸后头的下人房', 27:'宅院的后罩房', 28:'阁楼上的赁屋',
 29:'区部登记的合租楼', 30:'港务站的宿处', 31:'工场后头的阁楼', 32:'工人住房的一格',
 33:'学堂的寄宿舍', 34:'铁路工人的宿处', 35:'医院后头的看护房', 36:'官署安置的长屋',
 37:'百货后街的赁屋', 38:'口岸窝群的通铺', 39:'展会临时公寓', 40:'混合家庭的城市住宅',
 41:'战壕后头的宿营地',
}


def load_annals():
    ann = json.load(io.open(ANN, encoding='utf-8'))
    return {a['i']: a for a in ann}


def check(eras, ann):
    seen = {}
    vkeys = set(v['k'] for v in pools.VOICES)
    for e in eras:
        i = e['i']
        assert i not in seen, '纪年 %d 重复' % i
        seen[i] = e
        assert i in ann, '纪年 %d 在纪年图版里没有对应的图' % i
        assert e['y'] == ann[i]['ys'], '纪年 %d 的年份与图版不符：%s vs %s' % (i, e['y'], ann[i]['ys'])
        for f in ('w', 'reg', 'nm'):
            assert e.get(f), '纪年 %d 缺 %s' % (i, f)
        assert 3 <= len(e['locs']) <= 6, '纪年 %d 的地点数不对：%d' % (i, len(e['locs']))
        for L in e['locs']:
            assert -90 <= L['la'] <= 90 and -180 <= L['lo'] <= 180, '纪年 %d 的坐标越界：%s' % (i, L['n'])
            assert L['n'] == L['n'].upper(), '纪年 %d 的拉丁地名要全大写：%s' % (i, L['n'])
        assert len(e['roles']) >= 5, '纪年 %d 的身份太少' % i
        assert len(e['dress']) >= 4, '纪年 %d 的服装太少' % i
        assert len(e['figs']) == 10, '纪年 %d 的人物不是十位：%d' % (i, len(e['figs']))
        nms = set()
        for f in e['figs']:
            assert f['n'] not in nms, '纪年 %d 有重名：%s' % (i, f['n'])
            nms.add(f['n'])
            assert f['sp'] in ('cat', 'human'), '纪年 %d 的 %s 物种不对' % (i, f['n'])
            assert f['v'] in vkeys, '纪年 %d 的 %s 口吻谱不存在：%s' % (i, f['n'], f['v'])
            assert len(f['q']) == 2, '纪年 %d 的 %s 签名台词不是两句' % (i, f['n'])
            for q in f['q']:
                assert q.startswith('「') and '」' in q, \
                    '纪年 %d 的 %s 台词没有用直角引号：%s' % (i, f['n'], q)
            assert len(f['d']) >= 10, '纪年 %d 的 %s 事迹太短' % (i, f['n'])
        cats = sum(1 for f in e['figs'] if f['sp'] == 'cat')
        assert 5 <= cats <= 9, '纪年 %d 的猫娘与人类比例失衡：%d/10' % (i, cats)
        assert i in LORE, '纪年 %d 没有世界书原料' % i
        assert HOME.get(i), '纪年 %d 没有写住处' % i
        for f in ('guo', 'zheng', 'shi', 'ye'):
            assert LORE[i].get(f), '纪年 %d 的世界书缺 %s' % (i, f)
    want = set(range(1, 42))
    assert set(seen) == want, '纪年不全，缺 %s' % sorted(want - set(seen))
    # 世界书原料不能有多出来的纪年
    assert set(LORE) == want, '世界书原料对不上，多出 %s' % sorted(set(LORE) - want)
    pools.check()
    return True


def year_label(y):
    return ('前%d年' % -y) if y < 0 else ('%d年' % y)


def build_eras(eras, ann):
    out = []
    for e in sorted(eras, key=lambda x: x['i']):
        a = ann[e['i']]
        out.append({
            'i': e['i'], 'y': e['y'], 'yl': year_label(e['y']),
            'ys': a['y'], 'age': a['era'], 't': a['t'], 's': a['s'], 'src': a['src'],
            'reg': e['reg'], 'w': e['w'], 'inst': e['inst'], 'nm': e['nm'],
            'home': HOME[e['i']],
            'locs': e['locs'], 'roles': e['roles'], 'dress': e['dress'],
            'figs': e['figs'],
        })
    return out


def build_gen():
    return {'morphs': pools.MORPHS, 'furs': pools.FURS, 'fursRare': pools.FURS_RARE,
            'furMarks': pools.FUR_MARKS, 'temper': pools.TEMPER, 'tails': pools.TAILS,
            'voices': pools.VOICES, 'relations': pools.RELATIONS,
            'origins': pools.ORIGINS,
            # 体格尺度：母本 TABLEAU 4 的中位数，上下各给一段合理范围
            'body': {'hMid': 139.8, 'hLo': 131, 'hHi': 148,
                     'wMid': 39.7, 'wLo': 33, 'wHi': 47},
            # 年龄段：母本第一卷与附录丙
            'ages': [[10, 12, '刚进青春期'], [13, 18, '可安全完成一窝的年岁'],
                     [19, 26, '正当用的年纪'], [27, 34, '在这个族群里已算年长'],
                     [35, 45, '相当于人类的老年'], [46, 52, '长寿个案']]}


def build_lore(eras):
    lb, ord_ = [], 10
    for c in CORE:
        lb.append({'title': '〔通则〕' + c['t'], 'cat': '通则', 'keys': c['k'],
                   'constant': True, 'on': True, 'ord': ord_,
                   'content': '\n'.join('· ' + x for x in c['c'])})
        ord_ += 1
    for e in sorted(eras, key=lambda x: x['i']):
        i, d = e['i'], LORE[e['i']]
        head = '〔%s · %s〕' % (year_label(e['y']), e['t'] if 't' in e else '')
        cat = '%s %s' % (year_label(e['y']), e['t'] if 't' in e else '')
        keys = ([L['cn'] for L in e['locs']] + [L['n'] for L in e['locs']]
                + list(e['inst']) + [f['n'] for f in e['figs']])
        keys = [k for k in keys if len(k) >= 2]
        def ent(name, lines, extra=None):
            return {'title': head + name, 'cat': cat, 'keys': keys, 'era': i,
                    'on': True, 'constant': False, 'ord': 50,
                    'content': '\n'.join('· ' + x for x in lines)}
        lb.append(ent('国家', d['guo']))
        lb.append(ent('历史', [e['w']] + ['地区路线：' + e['reg'],
                                          '在场的制度：' + '、'.join(e['inst']),
                                          '取名法：' + e['nm']]))
        lb.append(ent('政治', d['zheng']))
        lb.append(ent('事件', d['shi']))
        lb.append(ent('野史', d['ye'] + ['（以上为传闻。多半不实，但人会照着它行动。）']))
    return lb


def main():
    ann = load_annals()
    # eras 里没有 t/s，先从图版补上，check 之后再正式组装
    for e in ERAS:
        if e['i'] in ann:
            e.setdefault('t', ann[e['i']]['t'])
    check(ERAS, ann)

    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    data = [('eras.json', build_eras(ERAS, ann)),
            ('gen.json', build_gen()),
            ('lore.json', build_lore(ERAS))]
    for name, obj in data:
        p = os.path.join(OUT, name)
        io.open(p, 'w', encoding='utf-8').write(
            json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
    figs = sum(len(e['figs']) for e in ERAS)
    locs = sum(len(e['locs']) for e in ERAS)
    lb = build_lore(ERAS)
    print('已编译 · 纪年 %d 条 · 地点 %d 处 · 人物 %d 位 · 世界书 %d 条（通则 %d）'
          % (len(ERAS), locs, figs, len(lb), len(CORE)))
    for name, _ in data:
        print('    %-10s %6.1f KB' % (name, os.path.getsize(os.path.join(OUT, name)) / 1024))


if __name__ == '__main__':
    main()
