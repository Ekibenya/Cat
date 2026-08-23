import json, re, os

a = json.load(open('/home/user/cat/st/data/figures/e08b0.zh.lore.json'))
b = json.load(open('/home/user/cat/st/data-quiet.ko/figures/e08b0.ko.lore.json'))
print('항목 수', len(a), len(b))
print('키 이름 확인:', all(list(x.keys()) == ['cat', 'title', 'keys', 'content'] for x in a))
print('keys 개수 같음:', all(len(x['keys']) == len(y['keys']) for x, y in zip(a, b)))
h = re.compile('[가-힣ㄱ-ㅎㅏ-ㅣ]')
bad = []
for i, x in enumerate(a):
    for k, v in x.items():
        s = v if isinstance(v, str) else ''.join(v)
        if h.search(s):
            bad.append((i, k))
print('한글 남은 곳:', bad)
print('content 줄바꿈:', [i for i, x in enumerate(a) if '\n' in x['content']])
print('SAY 남음:', [i for i, x in enumerate(a) if '[[SAY]]' in x['content']])
print('原文如是 개수:', sum(x['content'].count('原文如是。') for x in a))
print('원본 SAY 개수:', sum(x['content'].count('[[SAY]]') for x in b))
print('JSON 글자 수:', len(open('/home/user/cat/st/data/figures/e08b0.zh.lore.json', encoding='utf-8').read()))

p = '/tmp/cattest/ko/prompt/e08b0.zh.ms.txt'
if os.path.exists(p):
    t = open(p, encoding='utf-8').read()
    print('원고 글자 수:', len(t))
    print('원고 한글 남음:', bool(h.search(t)))
else:
    print('원고 파일 아직 없음')
