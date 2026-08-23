#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""世界书前端条目的封闭沙盒流水线。

哪些条目算前端：凡是碰规则 · 文风 · 角色 · 人物 · npc · 对话 · 对白 ·
心声 · 对话案例 · 对白案例的，一条都不许在主会话里写，一律走这条道。
后端（世界背景 · 时代背景）不走，那一半在 tools/felinia/wb/ 那边。

三段与人物那条流水线同一个规矩，只是场面文件不是事实卡，是文风底本：

  ⓪ 译入   中文文风底本    →  韩语场面文件（零汉字）      ← 已经做完，落在 KOSCENE
  ① 集笔   韩语提示词全文  →  韩语原稿 ＋ 韩语条目
  ② 译出   韩语原稿与条目  →  中文原稿 ＋ 中文条目        ← 必须与 ① 不是同一个

主会话一个韩文字母都不写。两段的指示文是先写中文、再由译入沙盒译过去的。

用法
    python3 stylepipe.py 1      只跑 ①
    python3 stylepipe.py 2      只跑 ②
    python3 stylepipe.py plan   看还差哪一段
"""
import io
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
KOREPO = '/home/user/Korean'
KODIR = os.path.join(ROOT, 'st/data-quiet.ko/style')
TAB = os.path.join(ROOT, 'tools/felinia/.ko-tab/style.names.txt')
PROMPT = '/tmp/cattest/ko/prompt'
LOG = '/tmp/cattest/ko/log'

KOSCENE = os.path.join(KODIR, 'style.ko.scene.txt')
INSTR_A = os.path.join(KODIR, 'instrC.ko.txt')
INSTR_B = '/tmp/cattest/ko/instrB.ko.txt'
KOMS = os.path.join(KODIR, 'style.ko.ms.txt')
KOLORE = os.path.join(KODIR, 'style.ko.lore.json')
ZHMS = os.path.join(ROOT, 'tools/felinia/.zh-ms/style.zh.ms.txt')
ZHLORE = os.path.join(ROOT, 'st/data/style/style.zh.lore.json')

HANDOFF = os.path.join(KOREPO, '넘김말.md')
SANDBOX = os.path.join(HERE, 'sbretry.sh')
BUILD = os.path.join(KOREPO, 'skill/scripts/build.py')


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    d = os.path.dirname(p)
    if d and not os.path.isdir(d):
        os.makedirs(d)
    io.open(p, 'w', encoding='utf-8').write(s)


def stage1():
    out = subprocess.run([sys.executable, BUILD, KOSCENE], capture_output=True)
    if out.returncode != 0:
        sys.exit('build 拒了文风底本：' + out.stderr.decode())
    tail = (read(INSTR_A)
            .replace('{{ORIGPATH}}', KOMS)
            .replace('{{LOREPATH}}', KOLORE))
    pf = os.path.join(PROMPT, 'style.s1.txt')
    write(pf, read(HANDOFF) + '\n\n' + out.stdout.decode('utf-8') + '\n\n' + tail)
    return pf


def stage2():
    for p in (KOMS, KOLORE):
        if not os.path.exists(p):
            sys.exit('还没有：' + p)
    notation = read(TAB) if os.path.exists(TAB) else ''
    out = subprocess.run([sys.executable, BUILD, '--tr', KOMS, notation],
                         capture_output=True)
    if out.returncode != 0:
        sys.exit('build --tr 拒了文风原稿：' + out.stderr.decode())
    tail = (read(INSTR_B)
            .replace('{{KOLORE}}', KOLORE)
            .replace('{{ZHMS}}', ZHMS)
            .replace('{{ZHLORE}}', ZHLORE))
    d = os.path.dirname(ZHLORE)
    if not os.path.isdir(d):
        os.makedirs(d)
    pf = os.path.join(PROMPT, 'style.s2.txt')
    write(pf, read(HANDOFF) + '\n\n' + out.stdout.decode('utf-8') + '\n\n' + tail)
    return pf


def run(stage):
    pf = {'1': stage1, '2': stage2}[stage]()
    name = 'styleS' + stage
    return subprocess.call(['sh', SANDBOX, '열기', LOG, ROOT, '%s=%s' % (name, pf)])


def plan():
    for p in (KOSCENE, KOMS, KOLORE, ZHMS, ZHLORE):
        print(('있다  ' if os.path.exists(p) else '없다  ') + p)


if __name__ == '__main__':
    a = sys.argv[1] if len(sys.argv) > 1 else 'plan'
    sys.exit(plan() if a == 'plan' else run(a))
