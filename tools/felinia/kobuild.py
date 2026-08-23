#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把闭合沙盒的作业流程打包成 core/res/data/felinia/ko.json。

    python3 tools/felinia/kobuild.py [作业流程仓库的路径]

游戏里生成开局走的是这一套三段式，与仓库里手工跑的一模一样：

    ⓪ 译入沙盒   中文的场面事实  →  韩语场面文件（零汉字）＋ 一张名表
    ① 集笔沙盒   韩语提示词全文  →  韩语原稿          ← 见本八篇整个嵌在提示词里
    ② 译出沙盒   韩语原稿        →  中文开局          ← 必须与 ① 是不同的一次请求

三段各发一次请求、各自从零开始，互不带上文——「同一个沙盒既写又译」实测会失败：
译的时候它会顺手把自己的稿子润一遍，文体就没了。

名表（이름표）单独走：它装着汉字，所以绝不能进 ① 的提示词，
只在 ② 那一段作为固定写法交出去。仓库的规程里，这张表本来也是不入库的。

打包的时候会自检：
  · 集笔提示词的模板里两个空位都在
  · 见本八篇一篇不少，且一个汉字都没有
  · 除名表以外的每一份韩语料都是零汉字
自检不过就不写文件。
"""
import glob
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT  = os.path.join(ROOT, 'core/res/data/felinia/ko.json')
DEF_SRC = '/home/user/Korean'

HAN = re.compile(r'[一-鿿]')
HANGUL = re.compile(r'[가-힣]')


def read(p):
    return io.open(p, encoding='utf-8').read()


# 人物条目那两份，是拿仓库里手工跑的那两份原样改的：
#   ① 集笔  = prompt-집필.md（见本与场面的空位在这里） + instrA + addA
#   ② 译出  = prompt-번역.md（原稿与固定写法的空位在这里） + instrB 里讲条目那几条
# 手工跑的版本收尾是「存进这两个文件」，局内没有文件系统，
# 所以收尾换成「直接写在回答里」。那两段收尾话是沙盒写的，存在 tailA/tailB.ko.txt。
INSTR_A = os.path.join(ROOT, 'st/data-quiet.ko/figures/instrA.ko.txt')
ADD_A   = os.path.join(ROOT, 'st/data-quiet.ko/figures/addA.ko.txt')
INSTR_B = os.path.join(HERE, 'instrB.ko.txt')
TAIL_A  = os.path.join(HERE, 'tailA.ko.txt')
TAIL_B  = os.path.join(HERE, 'tailB.ko.txt')

# 存文件那几句的起头。从这里往后整个切掉，换上「直接写在回答里」。
CUT_A = '배열은 이 파일에 저장하십시오'
CUT_B = '번역한 원고는 이 파일에 저장하십시오'
# instrB 开头那一段是「条目在这个文件里，先去读」——局内没有文件，整段不要。
KEEP_B = '그것은 배열이며'


def dossier(write, tr):
    a = read(INSTR_A)
    if CUT_A not in a:
        sys.exit('instrA 里找不到存文件那一句，不敢乱切')
    a = a.split(CUT_A, 1)[0].rstrip()
    if os.path.exists(ADD_A):
        a = a + '\n\n' + read(ADD_A).strip()
    doss = write.rstrip() + '\n\n' + a + '\n\n' + read(TAIL_A).strip()

    b = read(INSTR_B)
    if KEEP_B not in b or CUT_B not in b:
        sys.exit('instrB 的两处记号对不上，不敢乱切')
    b = b.split(KEEP_B, 1)[1]
    b = KEEP_B + b.split(CUT_B, 1)[0].rstrip()
    trdoss = tr.rstrip() + '\n\n' + b + '\n\n' + read(TAIL_B).strip()
    return doss, trdoss


def load(src):
    sk = os.path.join(src, 'skill')
    smp = sorted(glob.glob(os.path.join(sk, 'samples', 'ko-*.md')))
    if not smp:
        sys.exit('见本一篇也没有：%s' % os.path.join(sk, 'samples'))
    samples = [read(p).strip() for p in smp]
    write = read(os.path.join(sk, 'prompt-집필.md'))
    tr    = read(os.path.join(sk, 'prompt-번역.md'))
    doss, trdoss = dossier(write, tr)
    hand  = read(os.path.join(src, '넘김말.md'))
    # 넘김말 里只取「여기서부터 그대로 붙인다」以下那一段——上面是给作业者看的说明
    mark = '## 여기서부터 그대로 붙인다'
    if mark in hand:
        hand = hand.split(mark, 1)[1]
    hand = hand.strip().strip('-').strip()
    return samples, write, tr, hand, doss, trdoss


def check(samples, write, tr, hand, doss, trdoss):
    assert '{{견본}}' in write, '集笔模板里没有见本的空位'
    assert '{{장면}}' in write, '集笔模板里没有场面的空位'
    assert '{{원고}}' in tr, '译出模板里没有原稿的空位'
    assert '{{표기}}' in tr, '译出模板里没有固定写法的空位'
    assert len(samples) >= 8, '见本不足八篇：%d' % len(samples)
    for i, s in enumerate(samples, 1):
        h = HAN.findall(s)
        assert not h, '见本第 %d 篇混进了汉字：%s' % (i, ''.join(h[:10]))
        assert HANGUL.search(s), '见本第 %d 篇里没有韩文' % i
    assert '{{견본}}' in doss and '{{장면}}' in doss, '条目模板里少了空位'
    assert '{{COUNT}}' in doss, '条目模板里没有人数的空位'
    assert '{{원고}}' in trdoss and '{{표기}}' in trdoss, '条目译出模板里少了空位'
    # 条目译出模板是唯一带汉字的一份，而且只许带这四个字：
    # 它点名要把 [[SAY]] 换成「原文如是.」，那个记号本身就是汉字。
    # 别的汉字一个都不许有 —— 混进去就等于把中文语境带回韩语那一段。
    ok_han = set('原文如是')
    for nm, t in (('集笔模板', write), ('译出模板', tr), ('넘김말', hand),
                  ('条目模板', doss), ('条目译出模板', trdoss)):
        h = HAN.findall(t)
        if nm == '条目译出模板':
            h = [c for c in h if c not in ok_han]
        assert not h, '%s 里混进了汉字：%s' % (nm, ''.join(h[:10]))
        assert HANGUL.search(t), '%s 里没有韩文' % nm
    return True


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEF_SRC
    if not os.path.isdir(os.path.join(src, 'skill')):
        sys.exit('这个路径下没有 skill/：%s' % src)
    samples, write, tr, hand, doss, trdoss = load(src)
    check(samples, write, tr, hand, doss, trdoss)

    obj = {
        'hand': hand,
        'write': write,
        'tr': tr,
        # 人物条目：局内给玩家自己的接口跑的那两份
        'doss': doss,
        'trdoss': trdoss,
        # 见本按仓库里的编号顺序，前面缀上序号——build.py 就是这么拼的
        'samples': ['## 견본 %d\n%s' % (i, s) for i, s in enumerate(samples, 1)],
    }
    d = os.path.dirname(OUT)
    if not os.path.isdir(d):
        os.makedirs(d)
    io.open(OUT, 'w', encoding='utf-8').write(json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
    tot = len(obj['write']) + len(obj['tr']) + len(obj['hand']) + len(doss) + len(trdoss) + sum(len(s) for s in obj['samples'])
    print('作业流程已打包 · 见本 %d 篇 · 合计 %d 字 · %.1f KB'
          % (len(samples), tot, os.path.getsize(OUT) / 1024))


if __name__ == '__main__':
    main()
