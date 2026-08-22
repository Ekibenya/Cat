#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把主文档里内联的马赛克位置表刷新成 emblem.json 的当前内容。

砖层图（emblem.png）与位置表是一对；重新生成图案之后光换图不换表，
网页就会照着旧坐标去裁新图，整幅错位。所以换图必跑这个。
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
EMB  = os.path.join(ROOT, 'core/res/img/annals/emblem.json')

PAT = re.compile(r'var MOS=\{.*?\};\n', re.S)


def main():
    s = io.open(DOC, encoding='utf-8').read()
    m = PAT.search(s)
    if not m:
        sys.exit('主文档里找不到 var MOS={…}; ——菜单补丁还没打？')
    if len(PAT.findall(s)) != 1:
        sys.exit('var MOS 不止一处，停手。')
    d = json.load(io.open(EMB, encoding='utf-8'))
    new = 'var MOS=' + json.dumps({'w': d['w'], 'h': d['h'], 'cells': d['cells']},
                                  separators=(',', ':')) + ';\n'
    io.open(DOC, 'w', encoding='utf-8').write(s[:m.start()] + new + s[m.end():])
    print('位置表已刷新：%d 块 · 主文档 %.0f KB' % (len(d['cells']), os.path.getsize(DOC) / 1024))


if __name__ == '__main__':
    main()
