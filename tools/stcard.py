# -*- coding: utf-8 -*-
"""把主文档里的两份卡数据导成 chara_card_v3。

主文档里的 window.__GAME_ROMA__ / __GAME_ZHOU__ 本来就是按角色卡的字段名写的
（description / personality / scenario / system_prompt / post_history_instructions /
mes_example，外加 lorebook 与 openings），所以这里做的是格式转写，不是改写：
正文一个字都不动，只把结构摆成 V3 的样子。

对应关系：
  openings[0].text        → first_mes
  openings[1..].text      → alternate_greetings
  lorebook[]              → character_book.entries
      keys  → keys（源数据里有重复，去重但保序）
      keys2 → secondary_keys（非空则 selective:true）
      title → name        constant → constant
      ord   → insertion_order（缺省 100）
      on    → enabled（缺省 true）
      prob/cat/id → entry.extensions.roma（ST 不认的，留着给自家前端用）
  panelSpec、openings 的年代信息 → data.extensions.roma

不读也不写 core/ 下的任何东西，纯导出。
"""
import io, os, re, json, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
OUT  = os.path.join(ROOT, 'st')

_LN = os.environ.get('ROMA_LINE', 'luzhi')
# 线号 → (卡文件名前缀, 主文档里那个 <script id>)。本仓库只有 luzhi 一条线；
# 其余几条是同族别卡的线号，留着是为了两张卡同时装进酒馆时互不认错。
LINES = {'luzhi': [('luzhi', 'cardLuzhi')],
         'roma': [('roma', 'cardRoma')],
         'cleo': [('cleo', 'cardCleo')],
         'khan': [('khan', 'cardKhan')],
         'zhou': [('zhou', 'cardZhou')]}[_LN]
_NAME = os.environ.get('ROMA_NAME', '').strip()   # 覆盖卡名（独立卡用）


def grab(html, script_id):
    """从 <script id=…> 里挖出那个 JSON 字面量（括号配平，别用正则硬啃）。"""
    m = re.search(r'<script id="%s">([\s\S]*?)</script>' % script_id, html)
    if not m:
        raise SystemExit('找不到 %s' % script_id)
    b = m.group(1)
    i = b.index('{', b.index('='))
    d = 0
    for k, ch in enumerate(b[i:], i):
        if ch == '{':
            d += 1
        elif ch == '}':
            d -= 1
            if d == 0:
                return json.loads(b[i:k + 1])
    raise SystemExit('%s 括号不配平' % script_id)


def dedupe(seq):
    seen, out = set(), []
    for x in seq:
        x = str(x).strip()
        if x and x not in seen:
            seen.add(x); out.append(x)
    return out


def entries(lorebook):
    out = []
    for i, e in enumerate(lorebook):
        keys = dedupe(e.get('keys') or [])
        sec  = dedupe(e.get('keys2') or [])
        if not keys and not e.get('constant'):
            raise SystemExit('第 %d 条既无 keys 又非常驻，会永远不触发：%s' % (i, e.get('title')))
        ext = {'cat': e.get('cat', '')}
        if e.get('id'):   ext['id'] = e['id']
        if e.get('prob') is not None: ext['prob'] = e['prob']
        out.append({
            'id': i + 1,
            'keys': keys,
            'secondary_keys': sec,
            'comment': e.get('title', ''),
            'content': e.get('content', ''),
            'constant': bool(e.get('constant', False)),
            'selective': bool(sec),
            'insertion_order': int(e['ord']) if e.get('ord') is not None else 100,
            'enabled': bool(e.get('on', True)),
            'position': 'after_char' if e.get('pos') == 'depth' else 'before_char',
            'case_sensitive': False,
            'name': e.get('title', ''),
            'priority': 10,
            'extensions': dict({'roma': ext},
                               **({'position': 4, 'depth': int(e.get('depth', 3)), 'role': 0}
                                  if e.get('pos') == 'depth' else {})),
        })
    return out


def build(line, src):
    ops = src.get('openings') or []
    if not ops:
        raise SystemExit('%s 没有开局' % line)
    lb = src.get('lorebook') or []
    # ROMA_VER：写进卡名与 character_version，玩家在酒馆里一眼分清新旧版；
    # 名字变了导入即是新角色，不会悄悄覆盖旧卡的聊天。
    ver = os.environ.get('ROMA_VER', '').strip()
    card = {
        'spec': 'chara_card_v3',
        'spec_version': '3.0',
        'data': {
            'name': (_NAME or src.get('name', '')) + ((' v' + ver) if ver else ''),
            'description': src.get('description', ''),
            'personality': src.get('personality', ''),
            'scenario': src.get('scenario', ''),
            'first_mes': ops[0].get('text', ''),
            'mes_example': src.get('mes_example', ''),
            'creator_notes': '',
            'system_prompt': src.get('system_prompt', ''),
            'post_history_instructions': src.get('post_history_instructions', ''),
            'alternate_greetings': [o.get('text', '') for o in ops[1:]],
            'group_only_greetings': [],
            'tags': [],
            'creator': 'ekibenya',
            'character_version': ver,
            'character_book': {
                'name': src.get('name', '') + ' · 世界书',
                'description': '',
                'scan_depth': 4,
                'token_budget': 2048,
                'recursive_scanning': False,
                'extensions': {},
                'entries': entries(lb),
            },
            'extensions': {
                'roma': {
                    'line': line,
                    'panelSpec': src.get('panelSpec', {}),
                    # 开局的年代／地点／编号——前端要按玩家选的年份挑开局，
                    # 而 alternate_greetings 只是一串纯文本，带不了这些
                    'openings': [{'i': i, 'id': o.get('id'), 'era': o.get('era'),
                                  'scene': o.get('scene'), 'year': o.get('year')}
                                 for i, o in enumerate(ops)],
                },
            },
        },
    }
    return card


def check(line, card, src):
    """导完对一遍，别把正文改坏了。"""
    d = card['data']; ops = src['openings']; lb = src['lorebook']
    bad = []
    ver = os.environ.get('ROMA_VER', '').strip()
    for f in ['name', 'description', 'personality', 'scenario',
              'system_prompt', 'post_history_instructions', 'mes_example']:
        want = src.get(f, '')
        if f == 'name':
            want = (_NAME or want) + ((' v' + ver) if ver else '')
        if d[f] != want:
            bad.append('字段 %s 与源不符' % f)
    if len(d['alternate_greetings']) != len(ops) - 1:
        bad.append('开局数不对')
    if d['first_mes'] != ops[0]['text']:
        bad.append('first_mes 与 openings[0] 不符')
    for i, o in enumerate(ops[1:]):
        if d['alternate_greetings'][i] != o['text']:
            bad.append('alternate_greetings[%d] 与源不符' % i)
    ents = d['character_book']['entries']
    if len(ents) != len(lb):
        bad.append('世界书条数不对 %d≠%d' % (len(ents), len(lb)))
    for i, (a, b) in enumerate(zip(ents, lb)):
        if a['content'] != b['content']:
            bad.append('世界书第 %d 条正文被改动' % i)
        if not a['keys'] and not a['constant']:
            bad.append('世界书第 %d 条不可能触发' % i)
    for req in ['spec', 'spec_version']:
        if req not in card: bad.append('缺 %s' % req)
    for req in ['name', 'description', 'first_mes', 'alternate_greetings',
                'group_only_greetings', 'tags', 'creator', 'character_version', 'extensions']:
        if req not in d: bad.append('data 缺 %s' % req)
    return bad


def main():
    html = io.open(DOC, encoding='utf-8').read()
    os.makedirs(OUT, exist_ok=True)
    for line, sid in LINES:
        src = grab(html, sid)
        card = build(line, src)
        bad = check(line, card, src)
        blob = json.dumps(card, ensure_ascii=False, indent=1)
        fn = os.path.join(OUT, '%s.card.json' % line)
        io.open(fn, 'w', encoding='utf-8').write(blob)
        d = card['data']
        n = len(blob.encode('utf-8'))
        print('%-5s %-16s %6.1f KB · 世界书 %3d 条 · 开局 %2d 个（1 主 + %d 备）· sha %s'
              % (line, d['name'], n / 1024.0, len(d['character_book']['entries']),
                 len(d['alternate_greetings']) + 1, len(d['alternate_greetings']),
                 hashlib.sha256(blob.encode('utf-8')).hexdigest()[:12]))
        prompt = sum(len(d[f]) for f in ['description', 'personality', 'scenario',
                                         'system_prompt', 'post_history_instructions', 'mes_example'])
        const = sum(len(e['content']) for e in d['character_book']['entries'] if e['constant'])
        print('      常驻入提示词：卡字段 %d 字 + 常驻世界书 %d 条 %d 字 = %d 字'
              % (prompt, sum(1 for e in d['character_book']['entries'] if e['constant']),
                 const, prompt + const))
        print('      验收：%s' % ('PASS 与源逐字段一致' if not bad else 'FAIL ' + '; '.join(bad)))
        if bad:
            raise SystemExit(1)


if __name__ == '__main__':
    main()
