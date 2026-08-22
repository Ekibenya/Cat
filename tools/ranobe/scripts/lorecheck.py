# -*- coding: utf-8 -*-
"""世界書（ロアブック）の項目を採点する。開局本文とは別基準。

    python3 lorecheck.py <lore.json> [...]      # ファイル単位で採点
    python3 lorecheck.py --entry "<本文>"        # 一項目だけ試す

開局本文の measure.py は台詞前提なので、地の文だけの資料項目には使えない。
こちらは「中国語の随筆修辞を落とし、資料としての具体性を保つ」ことだけを見る。

判定帯は既存645項目の実測から決めた：
  排比コロン 18.9/万字 → 0 を目標（最大の癖）
  「不是X，是Y」 6.9/万字 → 0 を目標（二番目）
  1文平均 37.5字 → 20〜30字（百科調を落とす）
  数字密度 7.2/千字 → 維持（資料の価値そのもの）
"""
import io
import json
import re
import statistics
import sys

# --- 中国語随筆の修辞。資料項目には一つも要らない ---
RHETORIC = [
    (r'：[^。：]{2,14}，[^。：]{2,14}，[^。：]{2,14}[。；]', '排比コロン（：A，B，C。）'),
    (r'不是[^，。]{1,10}，(而)?是[^，。]{1,12}[。，]', '「不是X，是Y」の翻転'),
    (r'管(这|它|那|他|她)叫|称之为|所谓的', '講釈者の言い換え'),
    (r'只对了一半|只说对了|对了一半', '「只对了一半」型の落とし'),
    (r'标准像|写照|缩影|注脚|象征着', '随筆の比喩まとめ'),
    (r'也就是说|说到底|归根结底|总而言之', '総括・点題'),
    (r'偏偏|恰恰|反倒是|说来|论起', '文青の転換語'),
]

# --- 講談調・侠気・装深沉・網文套語（measure.py と共通の考え方）---
BANNED = [
    '话说', '却说', '但见', '欲知', '看官', '不在话下',
    '江湖', '恩怨', '快意', '好汉', '壮士', '兄台',
    '沉吟', '默然', '不置可否', '意味深长', '缓缓开口', '淡淡道',
    '心中一凛', '嘴角勾起', '眸子', '不愧是', '眼神一凝',
]


def score_entry(content, title=''):
    body = re.sub(r'\s', '', content)
    n = max(1, len(body))
    hits = []
    for pat, why in RHETORIC:
        for m in re.findall(pat, content):
            hits.append((why, (''.join(m) if isinstance(m, tuple) else m)[:14]))
    for w in BANNED:
        if w in content:
            hits.append(('禁止語', w))

    sents = [s for s in re.split(r'(?<=[。！？；])', content) if s.strip()]
    slen = statistics.mean([len(s) for s in sents]) if sents else 0
    nums = len(re.findall(r'[0-9]+|[一二三四五六七八九十百千万]{1,4}(?=[个人里天年头条匹岁])', content))
    numdens = 1000 * nums / n

    fails = []
    # 分量。実測：roma 中位460字（最短148）、cleo 中位260、mongol 中位227（最短140）。
    # 三本とも 140 字を下回る資料項目を一つも持たない（cleo の一句物志だけが例外）。
    # 90 字前後の「事典の見出し」を並べると、開局本文と同じ卡なのに世界書だけ
    # 別人が書いたように薄くなる——実際そうなった（訂正履歴 #15）。
    if len(body) < 140:
        fails.append('%d 字（140 以上。資料項目は一段の分量が要る）' % len(body))
    if not (16 <= slen <= 32):
        fails.append('1文平均 %.1f 字（16〜32）' % slen)
    if numdens < 4.0:
        fails.append('数字密度 %.1f/千字（4.0以上。資料は具体でなければ価値がない）' % numdens)
    return hits, fails, slen, numdens


def main(paths):
    INSTR = {'铁则', '指南', '玩法支援', '阵营', '开局支援'}
    tot = bad = 0
    allhits = {}
    for p in paths:
        for e in json.load(io.open(p, encoding='utf-8')):
            if e.get('cat') in INSTR:
                continue
            tot += 1
            hits, fails, slen, nd = score_entry(e.get('content', ''), e.get('title', ''))
            if hits or fails:
                bad += 1
                for why, tok in hits:
                    allhits.setdefault(why, []).append((e.get('title', '')[:22], tok))
                if len(sys.argv) > 2 or True:
                    pass
    print('項目 %d / 不合格 %d （%.0f%%）' % (tot, bad, 100.0 * bad / max(1, tot)))
    print('\n-- 検出内訳 --')
    for why, lst in sorted(allhits.items(), key=lambda kv: -len(kv[1])):
        print('  %-24s %4d 件   例: %s「%s」' % (why, len(lst), lst[0][0], lst[0][1]))
    return 0 if bad == 0 else 1


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    if sys.argv[1] == '--entry':
        h, f, s, d = score_entry(sys.argv[2])
        print('1文平均 %.1f / 数字密度 %.1f' % (s, d))
        for why, tok in h:
            print('  ×', why, tok)
        for x in f:
            print('  ×', x)
        print('=>', '合格' if not h and not f else '不合格')
        sys.exit(0 if not h and not f else 1)
    sys.exit(main(sys.argv[1:]))
