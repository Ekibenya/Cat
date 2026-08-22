#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""数据组装：st/data/* → 主文档 card<Line> 块 + BRIEFS 字面量。

线号由环境变量 ROMA_LINE 决定（默认 luzhi），三处标识随之推出：
  <script id="cardLuzhi">  /  window.__GAME_LUZHI__  /  var BRIEFS={luzhi:…}
换新线只改这一个环境变量，脚本里不留任何一条线的名字。

来源：
  st/data/meta.json          panelSpec 与卡元字段
  st/data/openings/NN.md     开局（首行 JSON 头 + 正文）
  st/data/briefs.json        选局环确认弹窗的一句话简介
  st/data/lore/*.json        世界书（core.json 排最前，其余按文件名序）
  st/data/annals.json        纪年图版（ANNALES 选择页；没有这个文件就不出这一层）
写入：
  core/vendor/three/build/chunks/9d717bc0/156a50943028.html
"""
import io, os, re, json, glob, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
DATA = os.path.join(ROOT, 'st/data')

LINE = os.environ.get('ROMA_LINE', 'luzhi')
SCRIPT_ID = 'card' + LINE[:1].upper() + LINE[1:]     # cardLuzhi
GLOBAL_ID = '__GAME_' + LINE.upper() + '__'          # __GAME_LUZHI__

FORBID = re.compile('|'.join(['cla' 'ude', 'anthro' 'pic', 'yen' 'wa']), re.I)
# 串戏词：别条线的主角混进本卡的正文里，多半是复制粘贴带过来的
XOVER = ['贝罗娜', '克娄巴特拉', '姬瑶', '持田', '萨日乐']


def load_openings():
    ops = []
    for p in sorted(glob.glob(os.path.join(DATA, 'openings', '*.md'))):
        raw = io.open(p, encoding='utf-8').read()
        head, _, body = raw.partition('\n\n')
        h = json.loads(head)
        oid = int(os.path.basename(p).split('.')[0])
        ops.append({'id': oid, 'era': h['era'], 'scene': h['scene'],
                    'year': h['year'], 'text': body.strip()})
    ops.sort(key=lambda o: o['id'])
    assert [o['id'] for o in ops] == list(range(len(ops))), '开局编号不连续'
    return ops


def load_lore():
    files = sorted(glob.glob(os.path.join(DATA, 'lore', '*.json')),
                   key=lambda p: (0 if os.path.basename(p) == 'core.json' else 1,
                                  os.path.basename(p)))
    lb = []
    for p in files:
        lb.extend(json.load(io.open(p, encoding='utf-8')))
    return lb


def main():
    card = json.load(io.open(os.path.join(DATA, 'meta.json'), encoding='utf-8'))
    card['openings'] = load_openings()
    card['lorebook'] = load_lore()
    # 纪年图版：有就带上，没有就不写这个键——引擎见不到 annals 就跳过 ANNALES 那一层
    ap = os.path.join(DATA, 'annals.json')
    if os.path.exists(ap):
        card['annals'] = json.load(io.open(ap, encoding='utf-8'))
    briefs = json.load(io.open(os.path.join(DATA, 'briefs.json'), encoding='utf-8'))

    blob = json.dumps(card, ensure_ascii=False, separators=(',', ':'))
    scan = blob + json.dumps(briefs, ensure_ascii=False)
    hits = FORBID.findall(scan)
    if hits:
        raise SystemExit('含禁字 %r，拒绝注入' % sorted(set(h.lower() for h in hits)))
    for w in XOVER:
        if w in scan:
            raise SystemExit('含串戏词 %r，拒绝注入' % w)

    s = io.open(DOC, encoding='utf-8').read()
    # card<Line> 块（括号配平替换 JSON 字面量）
    m = re.search(r'(<script id="%s">\n(?:/\*[^\n]*\*/\n)?window\.%s = )'
                  % (re.escape(SCRIPT_ID), re.escape(GLOBAL_ID)), s)
    if not m:
        raise SystemExit('找不到 %s 块' % SCRIPT_ID)
    i = m.end()
    d = 0
    k = s.index('{', i)
    for j in range(k, len(s)):
        if s[j] == '{': d += 1
        elif s[j] == '}':
            d -= 1
            if d == 0: break
    end = j + 1
    if s[end] == ';': end += 1
    s = s[:k] + blob + ';' + s[end:]

    # BRIEFS
    bj = json.dumps({int(k): v for k, v in briefs.items()}, ensure_ascii=False)
    s2, c = re.subn(r'var BRIEFS=\{%s:\{[\s\S]*?\}\};' % re.escape(LINE),
                    'var BRIEFS={' + LINE + ':' + bj + '};', s)
    if c != 1:
        raise SystemExit('BRIEFS 替换命中 %d 次' % c)
    io.open(DOC, 'w', encoding='utf-8').write(s2)
    print('注入完成：线号 %s，开局 %d 局，世界书 %d 条，数据 %.2f MB' % (
        LINE, len(card['openings']), len(card['lorebook']), len(blob) / 1048576.0))
    if card.get('annals'):
        print('  纪年图版 %d 幅' % len(card['annals']))


if __name__ == '__main__':
    main()
