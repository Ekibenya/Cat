#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把名册摊成一份份「事实卡」，再拼成交给封闭沙盒的场面文件。

这一步只做**摊开与拼装**，不写一个字的正文。
事实卡上的每一栏都是可以查、可以算的：年岁、身高、体重、毛色、形态型、
服装、身份、出生地、居住地、性情、尾耳习惯、关系。
相貌怎么描写、话怎么说、心里怎么想——一律不在这里，那是沙盒的活。

同一个人（同一枚种子）每次算出来完全一样，所以改一次名册不会把全盘打乱。

用法
    python3 figgen.py <纪年号> [批号]      把这一批的中文场面资料打到标准输出
    python3 figgen.py --all                 列出全部批次
"""
import hashlib
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import pools                      # noqa: E402
from roster import ROSTER         # noqa: E402
from eras_a import ERAS_A         # noqa: E402
from eras_b import ERAS_B         # noqa: E402
from eras_c import ERAS_C         # noqa: E402
from eras_d import ERAS_D         # noqa: E402

ERAS = {e['i']: e for e in (ERAS_A + ERAS_B + ERAS_C + ERAS_D)}
BATCH = 7                          # 一次交给沙盒几位。太多会写散，太少浪费一次装载

# 人类的头发。猫娘用 pools.FURS，人类另立一张，免得把人写成有毛被的
HAIR = ['黑', '深褐', '褐', '浅褐', '亚麻', '灰白', '花白', '全白', '赤褐', '沙金', '乌黑']
# 人类的体格：母本 TABLEAU 4，男 170.9／65.8，女 158.6／53.4
H_BODY = {'m': (170.9, 162, 181, 65.8, 55, 82), 'f': (158.6, 150, 168, 53.4, 44, 66)}


def seed(era, name):
    h = hashlib.sha256(('%d|%s' % (era, name)).encode('utf-8')).digest()
    return int.from_bytes(h[:8], 'big')


class Rng(object):
    """一枚种子摊成一串数。不用 random，免得别处调一次就把结果全变了。"""
    def __init__(self, s):
        self.s = s

    def nxt(self):
        self.s = (self.s * 6364136223846793005 + 1442695040888963407) & ((1 << 64) - 1)
        return self.s >> 11

    def pick(self, seq):
        return seq[self.nxt() % len(seq)]

    def rng(self, lo, hi):
        return lo + self.nxt() % (hi - lo + 1)

    def some(self, seq, n):
        seq = list(seq)
        out = []
        for _ in range(min(n, len(seq))):
            out.append(seq.pop(self.nxt() % len(seq)))
        return out


AGE_HINT = [
    ('幼', 8, 11), ('少', 12, 15), ('十', 13, 19), ('青年', 18, 26), ('少女', 13, 17),
    ('二十', 20, 27), ('三十', 30, 38), ('四十', 40, 47), ('壮年', 22, 34),
    ('正当用的年纪', 19, 26), ('已算年长', 27, 34), ('年长', 30, 42),
    ('刚成年', 16, 19), ('刚进青春期', 10, 12), ('不老', 0, 0), ('不详', 0, 0),
    ('说不清', 0, 0), ('看不出', 0, 0), ('传说', 0, 0), ('刚故去', 0, 0),
]


def age_of(fig, r):
    yr = fig.get('yr', '')
    # 名册上直接写了数字的，按数字来
    digits = ''.join(c for c in yr if c.isdigit())
    if digits and len(digits) <= 2:
        return int(digits)
    for key, lo, hi in AGE_HINT:
        if key in yr:
            if lo == 0:
                return 0                      # 神话人物：不给岁数
            return r.rng(lo, hi)
    return r.rng(18, 30)


def body(fig, r):
    if fig['sp'] == 'cat':
        h = r.rng(131, 148) + r.nxt() % 10 / 10.0
        w = r.rng(33, 47) + r.nxt() % 10 / 10.0
        return round(h, 1), round(w, 1)
    # 人类：名册上的人多半是男的，女的按女的尺度
    sex = 'f' if fig.get('female') else 'm'
    _, hl, hh, _, wl, wh = H_BODY[sex]
    return float(r.rng(hl, hh)), float(r.rng(wl, wh))


def card(era, fig, mates):
    """一位的事实卡。只有可查可算的栏目。"""
    e = ERAS[era]
    r = Rng(seed(era, fig['n']))
    age = age_of(fig, r)
    h, w = body(fig, r)
    out = []
    A = out.append
    A('姓名：%s' % fig['n'])
    A('真身：%s' % fig['src'])
    A('物种：%s' % ('猫娘' if fig['sp'] == 'cat' else '人类'))
    A('年龄：%s' % ('不给岁数（神话或传说中人）' if age == 0 else '%d 岁' % age))
    A('身高：%s 厘米' % h)
    A('体重：%s 公斤' % w)
    if fig['sp'] == 'cat':
        m = r.pick(pools.MORPHS)
        fur = r.pick(pools.FURS_RARE if m['k'] == 'court' else pools.FURS)
        A('毛色：%s。%s' % (fur, r.pick(pools.FUR_MARKS)))
        A('品种（形态—生态复合型）：%s。%s；常见生态是%s' % (m['n'], m['m'], m['e']))
        A('耳尾习惯：%s' % r.pick(pools.TAILS))
    else:
        A('发色：%s' % r.pick(HAIR))
        A('品种：人类。没有耳尾，没有肉垫，情绪不写在身上')
    A('服装：%s' % r.pick(e['dress']))
    A('身份地位：%s' % fig['kind'])
    loc = r.pick(e['locs'])
    loc2 = r.pick(e['locs'])
    A('出生地：%s（%s）' % (loc['cn'], loc['n']))
    A('居住地：%s（%s）' % (loc2['cn'], loc2['n']))
    A('性格：%s' % '；'.join(r.some(pools.TEMPER, 3)))
    TIES = ['同在一处，彼此认得', '有旧怨，见面不说话', '受过对方的恩，没还',
            '互相利用，谁也不点破', '一个照护过另一个', '同一件事上站在对立的两边',
            '一个欠着另一个的钱', '曾经同队，后来分了', '一个把另一个的事说了出去',
            '见过对方最难看的一次', '一个替另一个顶过罪', '拿同一件东西争过']
    rel = []
    others = [x['n'] for x in mates if x['n'] != fig['n']]
    for m2, tie in zip(r.some(others, 3), r.some(TIES, 3)):
        rel.append('%s——%s' % (m2, tie))
    A('人物关系：%s' % '；'.join(rel))
    A('这个人身上发生过的事（史实，不许改动）：%s' % fig['fact'])
    return '\n'.join(out)


def batches(era):
    figs = ROSTER[era]
    return [figs[i:i + BATCH] for i in range(0, len(figs), BATCH)]


def scene(era, bi):
    e = ERAS[era]
    grp = batches(era)[bi]
    allf = ROSTER[era]
    y = e['y']
    yl = ('公元前 %d 年' % -y) if y < 0 else ('公元 %d 年' % y)
    out = []
    A = out.append
    A('# 这一代的世界（只是事实，不要写进正文当解说）')
    A('年代：%s' % yl)
    A('地区路线：%s' % e['reg'])
    A('这一代成立的事：%s' % e['w'])
    A('在场的制度：%s' % '、'.join(e['inst']))
    A('取名法：%s' % e['nm'])
    A('可去的地方：%s' % '；'.join('%s（%s）%s' % (L['cn'], L['n'], L['d']) for L in e['locs']))
    A('')
    A('# 这个世界的身体规矩（写人物时不能违背，但不要在正文里解释）')
    A('· 猫娘平均身高一百四十厘米上下，正面挨打极弱，跑、爬、夜视、游泳、平衡远胜人类。')
    A('· 猫耳与尾巴既是感官也是情绪，藏不住。摸尾巴要先得允许，不许就是侵犯。')
    A('· 手是人形的手，手背有毛，掌面有肉垫；脚是猫脚加肉垫，穿不了人类的鞋楦，也裹不了脚。')
    A('· 猫娘的血只能给猫娘。掉毛，换毛期尤其明显。要散热，所以衣服通风、开口、不压耳、不束腰。')
    A('· 一生只生一窝，一窝多女；与人类男子所生的孩子恒为猫娘。发情期是周期性的，不等于背叛。')
    A('· 体罚对猫娘无效，越打越不听。要用商量、契约、即刻的回应和看得见的赏。')
    A('· 猫娘之间隔着语言也能用耳、尾、姿态、气味交换「危险、跟我走、绕开、停」，但这不是心灵感应，也不等于同一个阵营。')
    A('· 猫娘约占总人口三分之一，不是稀奇的少数。')
    A('')
    A('# 这一批要写的人（一共 %d 位）' % len(grp))
    for f in grp:
        A('')
        A('----')
        A(card(era, f, allf))
    return '\n'.join(out)


def main(argv):
    if '--all' in argv:
        n = 0
        for era in sorted(ROSTER):
            for bi, g in enumerate(batches(era)):
                print('%d %d %d' % (era, bi, len(g)))
                n += 1
        sys.stderr.write('共 %d 批\n' % n)
        return 0
    era = int(argv[1])
    bi = int(argv[2]) if len(argv) > 2 else 0
    sys.stdout.write(scene(era, bi))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
