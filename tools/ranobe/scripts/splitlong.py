# -*- coding: utf-8 -*-
"""長い段落を文単位で割る。「長段一文一段率」が落ちたときの機械修理。

    python3 splitlong.py <稿.md> [...]

15字を超える地の文段落に句点が2つ以上あれば、文ごとに段落を割る。
（）で括られた内心は、割ったあと各文を（）で括り直す。
台詞・節見出し・パネルには触らない。
"""
import io
import re
import sys


def fix(path):
    raw = io.open(path, encoding='utf-8').read()
    body, sep, panel = raw.partition('<mvu_panel>')
    out = []
    for line in body.split('\n'):
        p = line.strip()
        if (not p or p.startswith(('**', '{', '【', '＊'))
                or p[:1] in '「『'
                or len(p) <= 15):
            out.append(line)
            continue
        inner = p
        wrapped = inner.startswith('（') and inner.endswith('）')
        if wrapped:
            inner = inner[1:-1]
        sents = [s for s in re.split(r'(?<=[。！？])', inner) if s.strip()]
        if len(sents) <= 1:
            out.append(line)
            continue
        for s in sents:
            out.append(('（%s）' % s.strip()) if wrapped else s.strip())
    io.open(path, 'w', encoding='utf-8').write('\n\n'.join(
        x for x in '\n'.join(out).split('\n')) if False else
        re.sub(r'\n{3,}', '\n\n', '\n'.join(out)) + sep + panel)


if __name__ == '__main__':
    for p in sys.argv[1:]:
        fix(p)
        print('split', p)
