#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""封闭沙盒流水线：把一批人从中文事实卡送到中文成品条目。

三段，各发一次请求，各自从零开始，互不带上文。
这是运营指针第三节定死的：同一个沙盒既写又译，实测会把文体译没。

  ⓪ 译入沙盒   中文事实卡      →  韩语场面文件（零汉字）＋ 一张名表
  ① 集笔沙盒   韩语提示词全文  →  韩语原稿 ＋ 韩语条目   ← 见本八篇整个嵌在提示词里
  ② 译出沙盒   韩语原稿与条目  →  中文原稿 ＋ 中文条目   ← 必须与 ① 不是同一个

名表装着汉字，所以绝不进 ① 的提示词，也不放进那个不许有汉字的仓库。
主会话一个韩文字母都不写：两段要附在后面的指示文，是先用中文写好、
再由译入沙盒译成韩语的，这里只做替换。

用法
    python3 kopipe.py 0 <纪年> <批号> [...]    只跑 ⓪
    python3 kopipe.py 1 <纪年> <批号> [...]    只跑 ①
    python3 kopipe.py 2 <纪年> <批号> [...]    只跑 ②
    python3 kopipe.py plan                     列出还没做完的批次
"""
import io
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
KOREPO = '/home/user/Korean'
KO = os.path.join(ROOT, 'st/data-quiet.ko/figures')      # 韩语真本，入库
# 沙盒只被允许写 --add-dir 底下的路径，所以凡是要它落笔的地方都必须在这棵树里
TAB = os.path.join(ROOT, 'tools/felinia/.ko-tab')        # 名表，带汉字，不入库（已在忽略表里）
# 译出来的中文原稿。卡不吃它，只有条目才进卡，所以它是工件不是成品，不入库。
# 但它也必须落在这棵树底下：不然沙盒写不进去，就会在仓库根上到处丢半截文件。
ZHMS = os.path.join(ROOT, 'tools/felinia/.zh-ms')
PROMPT = '/tmp/cattest/ko/prompt'
LOG = '/tmp/cattest/ko/log'
# 两段的指示文。原先摆在 /tmp 底下，通一重开就没了 —— 那是韩语真本，不能放在会没的地方。
# ① 的那两份零汉字，所以进 data-quiet.ko；② 的那份带四个汉字（「原文如是」这个记号），
# 只在译出那一段的提示词末尾出现，不进那个不许有汉字的库，所以摆在工具这边。
INSTR_A = os.path.join(KO, 'instrA.ko.txt')
# 补丁：外貌与概要那两条里非写不可的东西，再说一遍。实测七十七人里二十五处漏了。
INSTR_A2 = os.path.join(KO, 'addA.ko.txt')
INSTR_B = os.path.join(HERE, 'instrB.ko.txt')
HANDOFF = os.path.join(KOREPO, '넘김말.md')
# 直接叫那边的 샌드박스.sh 会因为上游握手偶发失败而整批白丢，
# 所以过一层 sbretry.sh：同一批原样再叫，间隔逐次拉开，最多四次。
SANDBOX = os.path.join(HERE, 'sbretry.sh')
BUILD = os.path.join(KOREPO, 'skill/scripts/build.py')

sys.path.insert(0, HERE)
from roster import ROSTER          # noqa: E402
import figgen                      # noqa: E402

# 一趟塞几批。
# ⓪ 和 ② 是**翻译**，那里不产生文体，合批不会串味，所以几批并作一趟。
# ① 是**写**，声音在那里出生，必须一批一沙盒 —— 一个会话写多了会踩着自己的字，
# 见本的力气被冲淡，人物的口吻往一处收。这一条不许为了快而动。
# 并排的路数不变：仍旧是六个沙盒同时跑，只是每个沙盒手上多拿几批。
CHUNK = {'0': 5, '1': 1, '2': 2}

for d in (KO, TAB, ZHMS, PROMPT, LOG):
    if not os.path.isdir(d):
        os.makedirs(d)

HAN = re.compile(r'[一-鿿]')
HANGUL = re.compile(r'[가-힣]')


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    io.open(p, 'w', encoding='utf-8').write(s)


def tag(era, bi):
    return 'e%02db%d' % (era, bi)


def paths(era, bi):
    t = tag(era, bi)
    return {
        'zhscene': os.path.join(PROMPT, t + '.zh.scene.txt'),
        'koscene': os.path.join(KO, t + '.ko.scene.txt'),
        'names': os.path.join(TAB, t + '.names.txt'),
        'koms': os.path.join(KO, t + '.ko.ms.txt'),
        'kolore': os.path.join(KO, t + '.ko.lore.json'),
        'zhms': os.path.join(ZHMS, t + '.zh.ms.txt'),
        'zhlore': os.path.join(ROOT, 'st/data/figures', t + '.zh.lore.json'),
    }


# ── ⓪ 译入 ────────────────────────────────────────────────
S0 = """把下面这份中文资料整篇译成韩语。

译的规矩：
· 译文里一个汉字都不许有。人名、地名、族名一律用韩文字母音译。
· 拉丁字母写的地名（像 FOCVS 这样的）原样保留，不要动。
· 数字用阿拉伯数字，不要写成汉字。
· 栏目名也要译成韩语。
· 不要增删内容，不要加解说。

译完存到这个文件：
{ko}

另外再做一张名表，存到这个文件：
{tab}
名表一行一位，写成「韩文音译＝原来的写法」。上面出现过的每一个人名、每一个地名都要在表上。

两个文件都存好以后，只用韩语回一句和两个文件各自的字数。

=========== 要译的资料从这里开始 ===========

{body}
"""


S0M_HEAD = """这一趟交给你的不是一份，是 {n} 份。

译的规矩（每一份都一样）：
· 译文里一个汉字都不许有。人名、地名、族名一律用韩文字母音译。
· 拉丁字母写的地名（像 FOCVS 这样的）原样保留，不要动。
· 数字用阿拉伯数字，不要写成汉字。
· 栏目名也要译成韩语。
· 不要增删内容，不要加解说。

每一份的开头都写着这一份该存到哪里，照着存。
一份一份地做完，做完第一份再开始第二份，不要混在一起。

全部存好以后，只用韩语回一句，和每个文件各自的字数。
"""

S0M_ONE = """
=================== 第 {i} 份 ===================

译文存到这个文件：
{ko}

名表存到这个文件：
{tab}
名表一行一位，写成「韩文音译＝原来的写法」。这一份里出现过的每一个人名、
每一个地名都要在表上。

------------------- 要译的资料 -------------------

{body}
"""


def stage0(era, bi):
    return stage0m([(era, bi)])


def stage0m(grp):
    """⓪ 合批。几份资料一趟译完，各存各的。"""
    if len(grp) == 1:
        era, bi = grp[0]
        p = paths(era, bi)
        write(p['zhscene'], figgen.scene(era, bi))
        body = S0.format(ko=p['koscene'], tab=p['names'], body=read(p['zhscene']))
        pf = os.path.join(PROMPT, tag(era, bi) + '.s0.txt')
        write(pf, read(HANDOFF) + '\n\n' + body)
        return pf
    parts = [S0M_HEAD.format(n=len(grp))]
    for i, (era, bi) in enumerate(grp, 1):
        p = paths(era, bi)
        write(p['zhscene'], figgen.scene(era, bi))
        parts.append(S0M_ONE.format(i=i, ko=p['koscene'], tab=p['names'],
                                    body=read(p['zhscene'])))
    pf = os.path.join(PROMPT, '_'.join(tag(e, b) for e, b in grp) + '.s0.txt')
    write(pf, read(HANDOFF) + '\n\n' + ''.join(parts))
    return pf


# ── ① 集笔 ────────────────────────────────────────────────
class NotReady(Exception):
    """这一批还差前一段的东西。跳过它，别把整个波次拖死。"""


def stage1(era, bi):
    p = paths(era, bi)
    if not os.path.exists(p['koscene']):
        raise NotReady('%s 的韩语场面文件还没有' % tag(era, bi))
    out = subprocess.run([sys.executable, BUILD, p['koscene']],
                         capture_output=True)
    if out.returncode != 0:
        sys.exit('build 拒了 %s：%s' % (tag(era, bi), out.stderr.decode()))
    body = out.stdout.decode('utf-8')
    tail = (read(INSTR_A)
            .replace('{{COUNT}}', str(len(figgen.batches(era)[bi])))
            .replace('{{ORIGPATH}}', p['koms'])
            .replace('{{LOREPATH}}', p['kolore']))
    if os.path.exists(INSTR_A2):
        tail = tail + '\n\n' + read(INSTR_A2)
    pf = os.path.join(PROMPT, tag(era, bi) + '.s1.txt')
    write(pf, read(HANDOFF) + '\n\n' + body + '\n\n' + tail)
    return pf


# ── ② 译出 ────────────────────────────────────────────────
MULTI_B = os.path.join(KO, 'multiB.ko.txt')     # 韩语的「这一趟有几份」那段话


def stage2(era, bi):
    return stage2m([(era, bi)])


def stage2m(grp):
    """② 合批。几份原稿一趟译完，各存各的。

    分隔的那段话必须是韩语 —— 这一段提示词整篇是韩语，掺一句中文进去就破了闭。
    所以那段话是先写中文、由译入沙盒译过来的，存在 multiB.ko.txt，这里只做替换。
    """
    if len(grp) == 1:
        return _stage2one(*grp[0])
    if not os.path.exists(MULTI_B):
        raise NotReady('韩语的分隔说明还没有：' + MULTI_B)
    parts = [read(MULTI_B).replace('[[N]]', str(len(grp)))]
    for era, bi in grp:
        parts.append(_body2(era, bi))
    pf = os.path.join(PROMPT, '_'.join(tag(e, b) for e, b in grp) + '.s2.txt')
    write(pf, read(HANDOFF) + '\n\n' + '\n\n\n'.join(parts))
    return pf


def _body2(era, bi):
    p = paths(era, bi)
    # 两样都要有。实测出过一次「项目在、原稿没了」的判 —— 沙盒把原稿删了。
    # 那时候不能整波死掉，跳过它，让 ① 重跑一遍就是了。
    for k in ('koms', 'kolore'):
        if not os.path.exists(p[k]):
            raise NotReady('%s 的 %s 还没有' % (tag(era, bi), k))
    notation = read(p['names']) if os.path.exists(p['names']) else ''
    out = subprocess.run([sys.executable, BUILD, '--tr', p['koms'], notation],
                         capture_output=True)
    if out.returncode != 0:
        sys.exit('build --tr 拒了 %s' % tag(era, bi))
    body = out.stdout.decode('utf-8')
    tail = (read(INSTR_B)
            .replace('{{KOLORE}}', p['kolore'])
            .replace('{{ZHMS}}', p['zhms'])
            .replace('{{ZHLORE}}', p['zhlore']))
    d = os.path.dirname(p['zhlore'])
    if not os.path.isdir(d):
        os.makedirs(d)
    return body + '\n\n' + tail


def _stage2one(era, bi):
    pf = os.path.join(PROMPT, tag(era, bi) + '.s2.txt')
    write(pf, read(HANDOFF) + '\n\n' + _body2(era, bi))
    return pf


STAGES = {'0': (stage0, 's0'), '1': (stage1, 's1'), '2': (stage2, 's2')}
MULTI = {'0': stage0m, '1': lambda g: stage1(*g[0]), '2': stage2m}


def run_mixed(waves):
    """一波里混着几段。

    为什么要混：一段排空了才走下一段的话，②只剩一批的时候
    六个位子空着五个，一批做完才轮到①。实测就撞上过这个。
    位子先给靠后的段（②优先，其次①，最后⓪）—— 靠后的做完就能入库，
    早一点腾出手来。
    """
    args = []
    for stage, g in waves:
        fn, sfx = STAGES[stage]
        try:
            pf = MULTI[stage](g) if len(g) > 1 else fn(*g[0])
        except NotReady as e:
            sys.stderr.write('건너뛴다 %s\n' % e)
            continue
        args.append('%s%s=%s' % ('_'.join(tag(e, b) for e, b in g), sfx, pf))
    if not args:
        sys.stderr.write('띄울 것이 없다\n')
        return 0
    cmd = ['sh', SANDBOX, '열기', '--뜸', '30', LOG, ROOT] + args
    sys.stderr.write('→ %d 개 띄운다 (섞어서)\n' % len(args))
    return subprocess.call(cmd)


def run(stage, jobs):
    fn, sfx = STAGES[stage]
    ch = CHUNK[stage]
    groups = [jobs[i:i + ch] for i in range(0, len(jobs), ch)]
    args = []
    for g in groups:
        try:
            pf = MULTI[stage](g) if ch > 1 else fn(*g[0])
        except NotReady as e:
            sys.stderr.write('건너뛴다 %s\n' % e)
            continue
        args.append('%s%s=%s' % ('_'.join(tag(e, b) for e, b in g), sfx, pf))
    if not args:
        sys.stderr.write('띄울 것이 없다 (%s)\n' % stage)
        return 0
    # --뜸：先只放一个出去，等它把开头那一大段（规矩加八篇见本，约四十千字节）
    # 刻进缓存，再放其余的。实测这一批记录里读出六千九百四十六万、刻入五百三十三万，
    # 读出远大于刻入，说明确实在分着用同一份开头 —— 运营指针要求先量再开，量过了。
    cmd = ['sh', SANDBOX, '열기', '--뜸', '30', LOG, ROOT] + args
    sys.stderr.write('→ %d 개 띄운다 (%s)\n' % (len(args), stage))
    return subprocess.call(cmd)


def plan():
    todo = {'0': [], '1': [], '2': []}
    for era in sorted(ROSTER):
        for bi in range(len(figgen.batches(era))):
            p = paths(era, bi)
            if not os.path.exists(p['koscene']):
                todo['0'].append((era, bi))
            elif not (os.path.exists(p['koms']) and os.path.exists(p['kolore'])):
                todo['1'].append((era, bi))
            elif not os.path.exists(p['zhlore']):
                todo['2'].append((era, bi))
    for k in '012':
        print('%s: %d' % (k, len(todo[k])))
    return todo


def main(argv):
    if len(argv) > 1 and argv[1] == 'plan':
        plan()
        return 0
    stage = argv[1]
    jobs = [(int(argv[i]), int(argv[i + 1])) for i in range(2, len(argv), 2)]
    return run(stage, jobs)


if __name__ == '__main__':
    sys.exit(main(sys.argv))
