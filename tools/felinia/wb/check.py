#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""世界书后端条目的检查台。

一、条数在八百到一千二百之间
二、每条正文不短于五百二十字（母本卡平均一百六十五字的三倍以上）
三、每条 keys 三到八个
四、标题不许重复
五、不许出现散文腔的连接词（这一层是给机器扫的）
六、两部母本的每一片都要有条目认领，一片不许空（对照表见 wb/slices.json）

按运营指针第六节，检查台要走三步：先在已通过的数据上确认零误报，
再故意塞违例看它响不响，撤掉再确认回零。三步不做完的检查台不算数。
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

MIN_LEN = 520
MAX_LEN = 1600
# 散文腔。这一层出现这些词就是写歪了
PROSE = ['值得注意的是', '不难看出', '由此可见', '换言之', '总而言之', '综上所述',
         '令人', '仿佛', '宛如', '犹如', '一如', '然而，', '不禁', '悄然', '娓娓',
         '在那个年代', '历史告诉我们', '我们可以看到', '让我们']


def check(entries, slices=None):
    errs, warns = [], []
    if not (800 <= len(entries) <= 1200):
        errs.append('条数 %d，不在 800—1200 之间' % len(entries))
    seen = {}
    for i, e in enumerate(entries):
        w = '[%d]' % i
        for k in ('title', 'cat', 'keys', 'content', 'src'):
            if k not in e:
                errs.append('%s 缺 %s' % (w, k))
                break
        else:
            t, c = e['title'], e['content']
            if t in seen:
                errs.append('%s 标题与 [%d] 重复：%s' % (w, seen[t], t))
            seen[t] = i
            n = len(c)
            if n < MIN_LEN:
                errs.append('%s 「%s」 %d 字，短于 %d' % (w, t, n, MIN_LEN))
            if n > MAX_LEN:
                warns.append('%s 「%s」 %d 字，偏长' % (w, t, n))
            if not (3 <= len(e['keys']) <= 8):
                errs.append('%s 「%s」 keys %d 个，不在 3—8' % (w, t, len(e['keys'])))
            for p in PROSE:
                if p in c:
                    errs.append('%s 「%s」 散文腔：%s' % (w, t, p))
    if slices:
        claimed = set()
        for e in entries:
            claimed.add(e.get('src', '').split('/')[0])
        for s in slices:
            if s['id'] not in claimed:
                errs.append('母本 %s 第 %s 页「%s」没有任何条目认领（段号 %s）'
                            % (s.get('book', '?'), s.get('page', '?'), s['name'], s['id']))
    return errs, warns


def main():
    import wb
    entries = wb.load()
    # 母本对照表。原来读的是 /tmp/cattest/wb/slices.json —— 临时目录，早没了，
    # 于是 sl 一直是 None，第六条「母本每一片都要有条目认领」从建好起一次都没跑过。
    # 表挪进仓库；找不着就报错，不再默默跳过。
    p = os.path.join(HERE, 'slices.json')
    if not os.path.exists(p):
        raise SystemExit('母本对照表不在：' + p)
    sl = json.load(io.open(p, encoding='utf-8'))
    errs, warns = check(entries, sl)
    ln = [len(e['content']) for e in entries] or [0]
    print('-- 条目 %d 条，正文合计 %d 字，平均 %d 字，最短 %d，最长 %d'
          % (len(entries), sum(ln), sum(ln) // max(1, len(ln)), min(ln), max(ln)))
    for e in errs[:40]:
        print('  틀림  ' + e)
    for x in warns[:10]:
        print('  주의  ' + x)
    print('  ' + ('통과' if not errs else '불합격: %d 건' % len(errs)))
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
