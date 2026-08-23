#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检收台：把封闭沙盒送回来的中文成品条目逐批过 Korean 的 ingest 关。

这一关不由这边自己写。gates/ingest.py 是那边的公器，这边只负责把
本卡的记法作为选项交过去：

  --len 130-420    实测：三百七十八条里最短一百三十七字，平均二百零八字。
                   母本卡每条平均一百六十五字，所以这个下限没有放水。
  --voice-mark     本卡的对白与情状之间用一个破折号连，有的行两边带空格，
                   有的不带。那是记法的抖动，不是文章的毛病，所以按正则去数。
  --voice-min 1    本卡把一个人的六句以上对白全装在「说话的样子」这一条里，
                   不是分散成三条。六句这个下限仍旧由那边卡着，没有动。

这三个选项都是那边留出来的口子，不是这边改了那边的规矩。改动本身
在那边按运营指针第六节走过了三步：先在已通过的三百七十八条上确认零误报，
再逐条塞进七种违例确认全部响，撤掉之后再确认回零。

文风那一份也在这里过，但选项不同：那一份不是按人分的，是按六组分的，
所以人均对白范本那一关关掉（--voice-min 0），改由本文件另外数一遍：
「往来的话的例子」与「心里话的例子」两组各八条，每条对白不少于六句。

用法
    python3 accept.py            过全部（人物各批 ＋ 文风）
    python3 accept.py e01b0 ...  只过指定的批
"""
import glob
import io
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ZHDIR = os.path.join(ROOT, 'st/data/figures')
GATE = '/home/user/Korean/gates/ingest.py'

OPTS = ['-', '--min', '20', '--len', '130-420',
        '--voice-mark', '」\\s*—', '--voice-min', '1']


# 委托人点名要的十二样：姓名·年龄·身高·体重·毛色·品种·服装·身份地位·
# 出生地·居住地·性格·人物关系，外加对白与心声。姓名是 cat 那一栏，身份看第一条，
# 性格·关系·对白各占一条，剩下的都藏在头两条的句子里，所以按词去找。
# 这些不是写成一栏一栏的表，是写在话里的，所以认的词要放宽 —— 「绑着皮护胫」也算穿。
NUM = '[0-9\u3007\u96f6\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\u767e]'
FIELD = [
    ('年龄',  '概要|来历', NUM + r'+\s*岁|岁数|年纪'),
    ('身高',  '外貌',      NUM + r'+\s*厘米'),
    ('体重',  '外貌',      NUM + r'+\s*公斤'),
    ('毛色',  '外貌',      '毛色|头发|发色|[黑白灰褐金银红棕青蓝黄]毛|虎斑|三色|玳瑁|毛是'),
    ('品种',  '外貌',      '品种|型|人类|没有耳朵|不是猫'),
    # 「衣着是一条腰带上挂着铜牌的样子」这一句本来被判成没写服装 —— 那是这一关自己看漏了。
    # 认的词放得比初版宽：说的是身上有什么，不是非得用「穿」这个字。
    ('服装',  '外貌',      '衣服|衣裳|衣着|穿|披|裹|袍|裙|甲|胄|护胫|靴|鞋|布|绑着|系着|'
                          '戴|腰带|带子|挂着|巾|帽|冠|赤身|光着|不着|一丝不挂|赤脚|光脚'),
    ('出生地', '概要|来历', '生于|生在|出生|出身'),
    ('居住地', '概要',      '住|待在|落脚|如今在|现在在|留在|窝在|守着'),
]
NEED_SEC = ('概要', '外貌', '来历', '性情', '关系', '说话的样子')


def fields(path):
    """一条一条看那十二样在不在。缺了就报，报到人头上。"""
    per = {}
    for e in json.load(io.open(path, encoding='utf-8')):
        per.setdefault(e['cat'], {})[e['title'].split('\u00b7')[-1].strip()] = e['content']
    bad = []
    for who in sorted(per):
        ent = per[who]
        for sec in NEED_SEC:
            if not any(sec in k for k in ent):
                bad.append('%s 少了「%s」这一条' % (who, sec))
        for name, sec, rx in FIELD:
            body = ''.join(v for k, v in ent.items() if re.search(sec, k))
            if not re.search(rx, body):
                bad.append('%s 没写%s' % (who, name))
    return bad


STYLE = os.path.join(ROOT, 'st/data/style/style.zh.lore.json')
STYLE_OPTS = ['-', '--min', '40', '--len', '200-900',
              '--voice-mark', '」\\s*—', '--voice-min', '0']
# 这两组是对白范本，一条里要有六句以上。别的四组是散条，不数。
CASE_CATS = ('往来的话的例子', '心里话的例子')
MARK = re.compile('」\\s*—')


def style():
    """文风那一份。先过一遍那边的机器关，再自己数一遍对白。"""
    if not os.path.exists(STYLE):
        print('없다  ' + STYLE)
        return 1
    r = subprocess.run([sys.executable, GATE, STYLE] + STYLE_OPTS,
                       capture_output=True)
    out = r.stdout.decode('utf-8')
    bad = r.returncode != 0
    if bad:
        print('떨어짐 문풍')
        for ln in out.splitlines():
            if '틀림' in ln:
                print('   ' + ln.strip())
    arr = json.load(io.open(STYLE, encoding='utf-8'))
    grp = {}
    for e in arr:
        grp.setdefault(e['cat'], []).append(e)
    for c in CASE_CATS:
        g = grp.get(c, [])
        if len(g) != 8:
            print('   틀림  %s 가 %d 조뿐이다. 여덟이어야 한다' % (c, len(g)))
            bad = True
        for e in g:
            n = len(MARK.findall(e['content']))
            if n < 6:
                print('   틀림  「%s」 대사가 %d 줄뿐이다. 여섯 줄 이상' % (e['title'], n))
                bad = True
    if not bad:
        print('통과  문풍     %s · %d 조 · %d 무리'
              % (out.splitlines()[0][3:], len(arr), len(grp)))
    return 1 if bad else 0


def main(argv):
    tags = argv[1:]
    files = ([os.path.join(ZHDIR, t + '.zh.lore.json') for t in tags] if tags
             else sorted(glob.glob(os.path.join(ZHDIR, '*.zh.lore.json'))))
    ok = bad = 0
    for f in files:
        if not os.path.exists(f):
            print('없다  ' + f)
            bad += 1
            continue
        r = subprocess.run([sys.executable, GATE, f] + OPTS,
                           capture_output=True)
        out = r.stdout.decode('utf-8')
        name = os.path.basename(f).split('.')[0]
        fb = fields(f)
        if r.returncode == 0 and not fb:
            ok += 1
            print('통과  %-8s %s' % (name, out.splitlines()[0][3:]))
        else:
            bad += 1
            print('떨어짐 ' + name)
            for ln in out.splitlines():
                if '틀림' in ln:
                    print('   ' + ln.strip())
            for x in fb:
                print('   틀림  ' + x)
    if not tags:
        if style():
            bad += 1
        else:
            ok += 1
    print('-- 통과 %d, 떨어짐 %d' % (ok, bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
