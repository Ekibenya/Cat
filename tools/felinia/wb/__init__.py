#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""世界书 · 后端条目。

这一层是**给神谕扫的，不是给人读的**。所以：
  · 一行一件事。没有修辞，没有过渡，没有「值得注意的是」。
  · 不许散文，不许小说腔，不许抒情，不许总结陈词。
  · 能当事实直接取用的写法优先：定义、数值、清单、条件、后果、禁止事项。
  · 每条正文不短于五百二十字（母本卡每条平均一百六十五字的三到四倍以上）。

两部母本——《猫娘世界通史》与《猫娘族群与文明》——的全部内容，
一句不漏地摊进这一层。摊法见 tools/felinia/wb/covermap.py 的对照表。

凡是涉及规则 · 文风 · 角色 · 人物 · 对白 · 心声 · 对话案例的条目，
不在这一层，在 st/data-quiet.ko/ 那一边——那些必须走封闭沙盒。
"""
import glob
import importlib
import os

WB = []


def load():
    del WB[:]
    here = os.path.dirname(os.path.abspath(__file__))
    for p in sorted(glob.glob(os.path.join(here, 'w_*.py'))):
        m = importlib.import_module('wb.' + os.path.basename(p)[:-3])
        WB.extend(getattr(m, 'E'))
    return WB
