#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""纪年人物名单。**一个字都不在这里写。**

以前这一份是手写在 eras_a~d.py 里的十位随口起名的人。那一份已经整份删掉了。
现在的来路只有两条，缺一不可：

  · 是谁      —— tools/felinia/roster.py。真名、真身、真事迹，一位不许编。
  · 说什么话  —— st/data/figures/*.zh.lore.json。那是韩语封闭沙盒写完再译回来的。

所以这里只有搬运和挑拣，没有创作。要是某一代的沙盒成品还没回来，
build 就在这里停住并说清楚缺哪一批 —— 这是有意的：
宁可造不出卡，也不许再出现一个没走过封闭沙盒的人物条目。

签名台词也一样。台词从「说话的样子」那一条里原样取，
取的是沙盒写的那几句，不是这里改写的。
"""
import glob
import hashlib
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ZHDIR = os.path.join(ROOT, 'st/data/figures')

sys.path.insert(0, HERE)
from roster import ROSTER                      # noqa: E402

# 口吻谱怎么派。按名册上的身份挑，挑不着才按名字散开。
# 上面的先中，所以窄的放前面、宽的放后面。
VOICE_RULE = [
    (('海盗', '船', '航海', '出海', '水手', '沉箱'), 'v19'),
    (('将', '元帅', '骑士', '兵', '武士', '镖', '射手', '战'), 'v02'),
    (('医', '护士', '外科', '卫生', '病'), 'v11'),
    (('祭司', '神庙', '主教', '教皇', '修士', '伊玛目', '教主', '先知', '异端'), 'v06'),
    (('术士', '炼金', '魔法', '魔术', '女巫', '法师', '解字', '妖僧'), 'v16'),
    (('皇后', '王后', '太后', '妃', '公主', '女王', '女皇', '摄政'), 'v10'),
    (('皇帝', '国王', '苏丹', '哈里发', '法老', '可汗', '大汗', '王', '总督',
      '埃米尔', '暴君', '君'), 'v06'),
    (('妓', '舞', '歌', '乐', '演员', '交际花', '宠', '情妇', '沙龙'), 'v09'),
    (('作家', '诗人', '词人', '史', '书生', '记事', '笔', '写', '抄', '译',
      '编', '报', '画', '说书', '讲', '追忆', '题壁'), 'v07'),
    (('工', '匠', '造', '炼钢', '排字', '装订', '包工', '学徒', '技艺'), 'v08'),
    (('商', '贾', '巨富', '钱', '账', '库', '税', '盐', '港务', '公证',
      '柜台', '房东', '签约', '两头下注'), 'v18'),
    (('杀', '刺客', '毒', '屠', '刽子手', '劫', '盗', '贼', '骗', '窃',
      '恶棍', '恶人', '恶名', '走狗', '酷吏'), 'v21'),
    (('侦探', '警', '猎', '追', '守', '巡', '户籍', '调查', '量人'), 'v17'),
    (('囚', '奴', '被弃', '被卖', '被逐', '被废', '被夺', '被送走', '被剥',
      '被围观', '被展出', '死刑', '绞', '枪决', '枪毙', '受刑'), 'v24'),
    (('女工', '济贫', '互助', '联合会', '公社', '护民官', '演说', '煽动',
      '宣言', '造反', '起义', '街', '闯'), 'v12'),
    (('学', '教师', '教授', '老师', '学生', '算', '会诊', '数据'), 'v13'),
    (('女官', '女史', '宦官', '宰相', '丞相', '权臣', '权相', '奸相', '县令',
      '巡抚', '法官', '公诉', '使节', '出使', '传令', '记录', '户'), 'v23'),
    (('母', '姊', '姐', '主妇', '女仆', '丫头', '妻', '寡', '四子'), 'v22'),
    (('疯', '狂', '自封', '自吹', '梦见', '听见声音', '癔症', '怪物',
      '巨人', '魔王', '神', '冥'), 'v01'),
]
VOICE_FALLBACK = ['v01', 'v03', 'v04', 'v05', 'v14', 'v15', 'v17', 'v20', 'v21', 'v22']

# 台词起头的记号。句点收两种：译出那一段偶尔把句号落成半角点，
# 「原文如是.」和「原文如是。」是同一个记号。成品一个字都不改，认记号的这头放宽。
# 韩语原稿那一批（konow.py 装进来的 ko-raw）用的是 [[SAY]]。
# 两种记号都认——认的是记号，取的还是沙盒原样写的那几句。
SAY_HEAD = re.compile(r'原文如是[。.]|\[\[SAY\]\]')
LINE = re.compile('(「[^」]+」)')


def _voice(era, f):
    k = f['kind']
    for words, v in VOICE_RULE:
        if any(w in k for w in words):
            return v
    h = hashlib.sha256(('%d/%s' % (era, f['n'])).encode('utf-8')).hexdigest()
    return VOICE_FALLBACK[int(h[:8], 16) % len(VOICE_FALLBACK)]


def _load(era):
    """把这一代所有批次的中文成品条目并成 名字 -> 条目表。"""
    out = {}
    # .ko-raw 是还没译出的韩语原稿（见 konow.py）。同一位若两份都在，
    # 译好的那份排在后面、后写入，正文以它为准。
    for p in (sorted(glob.glob(os.path.join(ZHDIR, 'e%02db*.ko-raw.lore.json' % era)))
              + sorted(glob.glob(os.path.join(ZHDIR, 'e%02db*.zh.lore.json' % era)))):
        for e in json.load(io.open(p, encoding='utf-8')):
            out.setdefault(e['cat'], []).append(e)
    return out


def _quotes(entries, who):
    """从「说话的样子」那一条里原样取两句。改写一个字都不许。"""
    say = [e for e in entries if e['title'].endswith('说话的样子')]
    if not say:
        raise SystemExit('%s 没有「说话的样子」那一条' % who)
    body = say[0]['content']
    m = SAY_HEAD.search(body)
    if not m:
        raise SystemExit('%s 的「说话的样子」没有台词标记' % who)
    got = LINE.findall(body[m.end():])
    if len(got) < 2:
        raise SystemExit('%s 的台词不足两句' % who)
    return got[:2]


def build(era, partial=False):
    """partial 是「边写边入卡」用的：沙盒还没交回来的人先不放，回来了几位算几位。

    放开的只有「少」这一件事。**没走过沙盒的人依旧一个都不许进来** ——
    这里从头到尾只从 zh.lore.json 里取，取不着就跳过，绝不就地编一个顶上。
    这两件事常被混为一谈，所以写在这里：这一版拦的是编造，不是不全。
    """
    lore = _load(era)
    out, seen = [], set()
    for f in ROSTER[era]:
        if f['n'] in seen:
            raise SystemExit('纪年 %d 名册上有重名：%s' % (era, f['n']))
        seen.add(f['n'])
        one = {'n': f['n'], 'sp': f['sp'], 'ti': f['kind'],
               'v': _voice(era, f), 'd': f['fact']}
        ent = lore.get(f['n'])
        if ent:
            one['q'] = _quotes(ent, '纪年 %d 的 %s' % (era, f['n']))
        elif partial:
            # 条目还没写。名字、身份、事迹照放 —— 这三样出自名册，是真人史实，
            # 不是编的，本来就该进卡。**只有台词空着**，因为台词必须是沙盒写的。
            # 早先这里是整个人一起跳过，于是二十九代的立身与识人是空的；
            # 那是把「不许编造」错当成了「不许不全」。
            one['q'] = []
            one['pend'] = 1
        else:
            raise SystemExit('纪年 %d 的 %s 还没有沙盒成品' % (era, f['n']))
        out.append(one)
    return out


if __name__ == '__main__':
    done = miss = 0
    for era in sorted(ROSTER):
        try:
            build(era)
            done += 1
        except SystemExit as e:
            miss += 1
            print('%2d  %s' % (era, e))
    print('齐了 %d 代，还缺 %d 代' % (done, miss))
