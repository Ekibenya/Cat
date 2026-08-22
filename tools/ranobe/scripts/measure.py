# -*- coding: utf-8 -*-
"""原稿をラノベ中訳体の基準で採点する。合否は数字で出す。

    python3 measure.py <原稿.md> [<原稿2.md> ...]
    python3 measure.py --selftest      # corpus/ の7本が全部通ることを確認する

判定帯は corpus/ の実測レンジから決めてある。コーパス7本が落ちるような
変更を加えてはいけない。落ちたらその変更が間違っている。
"""
import io
import re
import statistics
import sys

DLG_OPEN = '「『"“'


def world_def():
    """このカードの世界前提を返す → (中心語, 手掛かり語のリスト)。

    探す順：環境変数 RANOBE_WORLD（JSON 文字列）→ scripts/ の隣 → その一つ上
    （＝スキル本体 or リポジトリの tools/ranobe/）の world.json。
    見つからない／中心語が空なら (None, None) を返し、C7 は黙って飛ぶ。
    書き始める前に world.json を書くこと。
    """
    import json
    import os
    raw = os.environ.get('RANOBE_WORLD')
    if not raw:
        here = os.path.dirname(os.path.abspath(__file__))
        for p in (os.path.join(here, 'world.json'),
                  os.path.join(os.path.dirname(here), 'world.json')):
            if os.path.exists(p):
                raw = io.open(p, encoding='utf-8').read()
                break
    if not raw:
        return None, None
    try:
        d = json.loads(raw)
    except ValueError:
        return None, None
    return (d.get('term') or None), (d.get('cues') or None)

# --- S1: これが出たら即不合格（AI が語り手として意味を解説する構文） ---
S1 = [
    (r'[在正]?等(着|著)?你[^。！？」]{0,12}(开价|说|回答|做出|选择|决定|开口)', '語り手が「〜を待っている」と内心を断定'),
    (r'她?在?(试探|掂量|衡量|测量)你', '語り手が内心を断定'),
    (r'(这|那)(就)?是(在)?(说|意味着|表示)', '語り手による意味の解説'),
    (r'他还不知道|你还不知道|此时的[^，。]{1,6}还不知道', '先取り予告'),
    (r'意味着', '意味付け'),
]

# --- S2: 中華ネット小説の常套句 ---
# 実サンプル7本に一度も出ない＝中華ネット小説だけの語。
# 「仿佛/如同/微微/缓缓/几分/只见」は原典に実在したので禁止から外した
# （自分の思い込みで健全な語を禁じていた）。
# --- S4: 泼妇骂街の指紋。SKILL 十七節。
#     罵倒の量ではなく質の問題。既製の呪い・撒泼の姿態・理を求める言い方は、
#     どれも「観客に向かって、被害者として、音量で押す」型に属する——
#     精神病質の内心の罵倒とは行動も出発点も逆である。
#     閾値は勘で作っていない：候補44語を参照コーパス7本＋手書き開局75篇＋
#     四本の世界書（計75万字）に当て、零命中だった41語だけを残した。
#     実際に使われていた3語（不得好死・捶胸・坐在地上哭）と、
#     訴えではなく勘定である「凭什么」は外してある。
POFU = [
    # 既製の呪い
    '断子绝孙', '挨千刀', '天打雷劈', '死全家', '全家死光', '烂了心肝', '生儿子没屁眼',
    # 撒泼の姿態
    '撒泼', '叉腰', '顿足', '一屁股坐在地上', '拍着大腿', '唾沫星子', '跳着脚',
    # 理を求める＝被害者に落ちる
    '讲不讲理', '评评理', '有没有天理', '天理何在', '我招谁惹谁', '上辈子造了什么孽',
    '我跟你没完', '咱们走着瞧', '有本事你别走', '你还是不是人', '我容易吗',
    '我这是造了什么孽', '苍天啊', '老天爷开开眼', '这日子没法过', '活不下去了',
    '让我死了算了', '哭天抢地', '寻死觅活', '指着鼻子骂',
    # 泼妇そのもの
    '泼妇', '骂街', '没脸没皮', '不要脸的东西', '丧良心', '老娘我', '看老娘',
]

# --- S2b: 中国北方口語・講談調（「江湖の痞味」）。
# コーパス2万字超に一度も出ない＝訳文には存在しない語。訳文体には方言色が無い。
JIANGHU = ['真行', '拍胸脯', '一拍大腿', '拍了拍大腿', '大点声', '我跟你讲', '我跟你说', '别不信', '你这种的', '明码标价', '小狼崽', '三回', '甭', '老子', '麻利', '混不吝', '穷小子', '条汉子', '汉子', '半大孩子', '扎堆', '滴水不漏', '一步一回头', '立威', '腌住', '馊了', '一只手数得过来', '顺手就', '笑闹', '没根的', '踩在底下', '家底', '实在少见', '跪了一地', '手脚快', '全招', '不吭声', '最好使', '划得来', '拿人命']

# --- 訳文体の接続語。原典実測：竟14.3 / 不过6.1 / 虽然6.1 / 这么6.8 / 明明5.5 …（万字あたり）
TRANSLATIONESE = ['其实', '当然', '不过', '毕竟', '明明', '反正', '总之', '果然',
                  '难道', '究竟', '确实', '甚至', '居然', '竟', '原本', '原来',
                  '看来', '似乎', '大概', '恐怕', '说不定', '不如', '即使', '即便',
                  '虽然', '然而', '于是', '因此', '这么', '那么', '根本', '分明']

S2 = ['心中一凛', '嘴角勾起', '眸子', '眸中', '眼底', '淡淡地', '暗道',
      '赫然', '不愧是', '却见', '心头一震', '眼神一凝', '嘴角浮现',
      '如遭雷击', '瞳孔一缩']

# --- S2c: 開局（序章）専用の追加禁止。コーパスには適用しない。
# コーパスには武侠題材の一本が含まれるため「侠」「沉吟」等が実在する。
# しかしこのカードの開局では、説書調・侠気・装深沉は一切禁止である（施主の明示指示）。
# よって S2c は is_opening のときだけ発火する。
S2C = ['却说', '且说', '但见', '欲知', '按下不表', '看官', '话分两头', '各表一枝', '这正应了', '有诗为证', '江湖', '一诺千金', '生死之交', '肝胆', '血性', '好汉', '壮士', '兄台', '某家', '洒家', '英雄气', '半晌', '不置可否', '冷哼', '缓缓开口', '淡淡道', '深深地看了', '不由分说', '讳莫如深', '爷们', '娘们儿', '愣是', '压根儿', '横竖', '张罗', '抬杠', '登时', '旋即', '矣', '寻思', '煞气', '狠厉', '阴鸷', '目光如炬']
# 部分一致の誤検出を避けるための精密パターン。
# 「把话说完了」「阿勒坛在下面」「也遂可敦」を叩かないこと。
S2C_EXEMPT = {
    # 講釈師の「话说／却说／且说」は文頭専用。「话说回来」「把话说完」は正常。
    '话说': re.compile(r'(?:^|[\n。！？…])\s*话说(?!回来)'),
    '却说': re.compile(r'(?:^|[\n。！？…])\s*却说'),
    '且说': re.compile(r'(?:^|[\n。！？…])\s*且说'),
    # 「正是：」は講釈の決まり文句。文中の「正是问题所在」は正常。
    '正是': re.compile(r'(?:^|\n)\s*正是'),
    # 一人称の「在下」だけ。「在下面」は方位。
    '在下': re.compile(r'在下(?![面里边方])'),
    # 文語の「遂」だけ。人名「也遂可敦」は除外。
    '遂': re.compile(r'(?<![也])遂'),
    '焉': re.compile(r'(?<![嫣])焉[。，！？]'),
    '矣': re.compile(r'矣[。，！？]'),
}

# --- S2g: 現代の男女無差反応。SKILL 十四節。開局のときだけ発火する。
# 古代の場面で「美人に近づかれた男が怯える／退く／侮辱されたと感じる」は
# 素の言語モデルの既定値であって、その時代の反応ではない。
# 逆向き（醜い者に言い寄られて喜ぶ）も同じ穴なので併せて禁じる。
S2G = ['自尊心受到', '感到被冒犯', '觉得被冒犯', '受到了侮辱', '感到侮辱', '觉得受辱',
       '被羞辱了一般', '尊严受损', '有失尊严', '男人也有尊严', '男人也是有自尊',
       '不是随便的男人', '洁身自好', '守身如玉', '正人君子不会', '拒绝了她的诱惑',
       '不为所动地后退', '吓得后退', '惊恐地后退', '像受惊', '花容失色地躲开',
       '感到不适与冒犯', '这是对我的侮辱', '你把我当什么人']

# --- S2d は廃止した。
# 165万字の実物（韓国ラノベ中訳2本）で検証したところ、14パターン全てが出現した。
# 2万字のコーパスで「原理的に出ない」と判断したのが誤りだった。
# 語彙・構文の禁止で文体を守るという方向自体が間違いであり、
# 正しいのは「無いと成立しないものを実測して要求する」ことである（C13/C14）。
S2D = []

# --- S3: 締めの形 ---
# 締めの禁止形は「選択肢の提示」だけ。ただの疑問文で終わるのは原典にも実在する
# （サンプル4の章末：「この世に、アイスのためだけの祭りがあるのか？」）。
S3_TAIL = re.compile(r'你(要|会|想|打算|准备)(怎么|如何|选|做什么)|还是[^，。]{1,8}？\s*$|你的选择')


PRON = '我你他她它'


def pron_density(narr):
    """地の文における人称代名詞の密度（100字あたり）。主語省略が効いていれば下がる。"""
    body = re.sub(r'\s', '', ''.join(narr))
    if not body:
        return 0.0
    return round(100 * sum(body.count(c) for c in PRON) / len(body), 1)


def pron_dominance(narr):
    """主導人称が全代名詞に占める割合。人称が混ざっているほど下がる。"""
    body = re.sub(r'\s', '', ''.join(narr))
    cnt = [body.count(c) for c in PRON]
    tot = sum(cnt)
    return round(100 * max(cnt) / tot) if tot else 100


FIXHINT = {
    'C1': '一行目を叫び・命令・擬音、または「我完蛋了」式の結論一言にする',
    'C2': '【】の内心絶叫を足す（SKILL 四節のツッコミ8型から選ぶ）',
    'C3': '（）の内心ツッコミを足す。シーンごとに最低4箇所',
    'C4': '擬音を独立行で置く。「咔。」「咚。」「哗啦。」',
    'C5': '節末を動作・台詞・音に。風と月光で終わらない',
    'C6': '冒頭付近に「我叫○○，○○岁，正在○○」を置く。プレイヤーは前の開局を読んでいない',
    'C7': 'ウマ娘とは何かを一〜二文で説明する。どの開局から入っても世界が分かること',
    'C8': '何が懸かっているかを言い切る。「输了就○○」「这条命值○○」',
    'C9': '今日の目標を一文で。大義ではなく、みっともなく小さく私的に。'
          '「我才不要○○」「首先，得○○」「我只想○○」',
    'C10': '台詞なしで喋らずに何十段も続いている＝沉默寡言装深沉。'
           '間に台詞を割り込ませる。誰かに喋らせる',
    'C11': '主人公が正常すぎる。症状で狂気を出す——同語反復／数を数える／場違いな笑い／'
           '「其实我…」の自白／【】の発作。references/devices.md の「狂気の出し方」を見る',
    'C13': '感嘆詞を撒く（哎呀／唉／呃／诶／哇／嘿嘿／哼／嘛／唔／嗯）。実測5〜65/万字',
    'C14': '確認・反問を入れる（对吧／是吧／不是吗／知道吗／是不是／〜吧？）',
    # C15〜C21 は依頼者が明示した要求。勘で作った禁止リストではないので、
    # 訂正履歴6（禁止リストを勘で拡張するな）の対象外。SKILL 十一節と対。
    'C15': '暴力を四字熟語で要約している。その語の機能は「読者に想像させないこと」。'
           '一人がどう死んだかを書くか、書かないか',
    'C16': '抽象名詞（绝望／恐惧／惨状／暴行／人间地狱…）。'
           'その語を書かず、その語を生じさせた物を書く',
    'C17': '嗅覚が無い。匂いは層で書く——粪／焦げた髪／内臓／雨／馬／饐えた馬乳酒／鉄',
    'C18': '音の質が無い。「惨叫」ではなく、どれだけ続き、いつ調子が変わり、いつ止んだか',
    'C19': '節末の道徳的反省（这就是战争／历史无声地记录着…）。動作か物で止める',
    'C20': '罵倒が無い。他妈的／滚／闭嘴／贱／狗／杂种／放屁／老子／死小子 を日常語として撒く',
    'C21': '感嘆符が少ない。怒鳴り合う局は一篇で10個以上',
    'C22': '悔い・良心・ためらいの語。これが一つ出ると、その世界に人権があることになる',
    'C23': '要らない加害／値段づけ／仲間を売る／他人の痛みを娯楽にする——が足りない。'
           '古代の悪人は「やりたくてやる」。SKILL 十二節',
    'C24': '見下しが地の語彙になっていない（这帮东西／这些牲口／不算人／奴才／贱民）',
    'C25': '陰険さが無い。嫁祸・告発・騙して殺させる・嘲弄・恩を高く売る のどれかを、'
           '得意げに一つ以上。SKILL 12-3b',
    'S2dOLD': '廃止。韓国語の逐語訳では出ない形＝韓国語稿を経ていない証拠。'
           '韓国語で書き直してから訳し直す',
    'C12': '韓国語稿 NN.ko.md が無い／段落数が対応していない。'
           '中国語で直接書くと必ず中華の語感が混じる。先に韓国語で書くこと',
    'S2c': '説書調／侠気／装深沉の語。韓国ラノベ訳文には一つも無い。無色の語へ',
    'S4': '泼妇骂街になっている。罵倒の量ではなく質の問題——'
          '観客を要らなくし、委屈を優越に変え、既製の呪いを名指しの具体に変える（十七節）',
    'S1': '語り手が内心を断定している。キャラ本人に喋らせる',
    'S2': '中華ネット小説の常套句。無色の語に置換',
    'S2b': '北方口語・講談調。訳文体に方言色は無い。無色の標準語へ',
    'S2g': '現代の男女無差反応。美人に近づかれた男は怯えも退きも侮辱されもしない。'
           'SKILL 十四節の六筋（大喜び／口ごもる／値踏み／道学者面／条件を出す／手が出る）から選ぶ。'
           '動じない男を書くなら理由をその場に書く',
    'C26': '相手が変わっても口調が同じ＝一人に一本の声しか無い。'
           '上には敬称と短文、下には蔑称と命令。同じ幕の二か所で差をつける。SKILL 14-5',
    'C27': '◈行の眼色欄が無い／使い回し／心声の言い換え。'
           'その人物が今この瞬間、主人公をどう値踏みしているかを一行。SKILL 14-9',
    'C28': '◈行の心声が人物間で似すぎ＝全員が同じ語彙・同じ勘定で考えている。'
           '罵倒の総量は落とさず配り方を変える。心声の語彙は職掌から出す。SKILL 十六節',
    'S3': '選択肢の提示で終わっている。場面で止める',
    '台詞段落比率%': '問答の合間に世界観の地の文を足す（削るのではなく足す）',
    '地の文1文平均': '逗号で繋げる。段落を割るのではなく文を繋ぐ',
    '長段一文一段率%': '長い段落を文単位で割る（逗号では割らない）',
    '段落中央値': '短く刻みすぎ。文を逗号で繋いで段落を太らせる',
    '人称/百字': '主語を落とす。三人称を固有名詞か省略に替える',
    '主人称占有%': '人称が混ざっている。一人称に統一する',
    '訳語連接/万字': '其实・不过・明明・果然・确实・居然・竟・看来・恐怕・根本 を撒く',
    '短段(内心)率%': '内心の短い割り込みを増減する',
}


def load(path):
    t = io.open(path, encoding='utf-8').read()
    # 一行目が JSON ヘッダなら落とす
    lines = t.split('\n')
    if lines and lines[0].strip().startswith('{'):
        t = '\n'.join(lines[1:])
    body = t.split('<mvu_panel>')[0]
    ps = [x.strip() for x in body.split('\n') if x.strip()]
    ps = [x for x in ps if not x.startswith('**') and not x.startswith('【')
          and not x.startswith('#') and not x.startswith('---')]
    return t, ps


def score(path):
    raw, ps = load(path)
    if not ps:
        print('%-14s 段落なし' % path)
        return False
    dlg = [x for x in ps if x[:1] in DLG_OPEN]
    narr = [x for x in ps if x[:1] not in DLG_OPEN]
    dl = [len(x) for x in dlg] or [0]
    ns = [max(1, len(re.findall(r'[。！？…]', x))) for x in dlg] or [0]
    sents = [s for s in re.split(r'(?<=[。！？])', ''.join(narr)) if s.strip()]
    sl = [len(s) for s in sents] or [0]
    # 一文一段は「まとまった地の文」に対して見る。
    # 15字以下の内心ツッコミは二拍・三拍で刻むのが正常なので対象外。
    longn = [p for p in narr if len(p) > 15]
    one = sum(1 for p in longn if len(re.findall(r'[。！？]', p)) <= 1)

    m = {
        '台詞段落比率%': round(100 * len(dlg) / len(ps)),
        '台詞平均字数': round(statistics.mean(dl), 1),
        '台詞3文以上%': round(100 * sum(1 for x in ns if x >= 3) / max(1, len(ns))),
        '台詞10字以下%': round(100 * sum(1 for x in dl if x <= 10) / max(1, len(dl))),
        '地の文1文平均': round(statistics.mean(sl), 1),
        '段落中央値': statistics.median([len(x) for x in ps]),
        '長段一文一段率%': round(100 * one / max(1, len(longn))),
        # 内心ツッコミの代理指標：14字以下の地の文段落がどれだけ挟まっているか
        '短段(内心)率%': round(100 * sum(1 for x in narr if len(x) <= 14) / max(1, len(narr))),
        # 人称代名詞の密度。韓国ラノベ中訳の実測は 2.1/100字。主語省略が効いている証拠。
        '人称/百字': pron_density(narr),
        # 訳文体接続語の密度（万字あたり）。原典は 78.5。低いと「中国語の地の文」に戻る。
        '訳語連接/万字': round(10000 * sum(raw.count(w) for w in TRANSLATIONESE)
                              / max(1, len(re.sub(r'\s', '', raw))), 1),
        # 主導人称が全代名詞に占める割合。実測 78%（我36/計46）。
        '主人称占有%': pron_dominance(narr),
    }
    # 台詞比率の下限が日本型(30)より低いのは、韓国型の内心ツッコミが
    # 地の文側の分母を押し上げるため。ツッコミを削って比率を稼ぐのは本末転倒。
    # === 韓国ラノベ中訳サンプル7本（日常/生存/武侠/軽快/群像/迷宮/叙事詩）の実測レンジ ===
    # 発見：地の文の1文は「短くない」。実測 15.9〜23.8字。
    # 短いのは「段落あたりの文の数」であって、文そのものではない。
    # 以前の (8,14) は自分の思い込みで、原典のどれにも当てはまらなかった。
    ok = {
        '台詞段落比率%': (8, 52), '台詞平均字数': (10, 32), '台詞3文以上%': (0, 50),
        '台詞10字以下%': (0, 80), '地の文1文平均': (14, 26), '段落中央値': (13, 33),
        '長段一文一段率%': (40, 100), '短段(内心)率%': (8, 55),
        '人称/百字': (1.2, 4.0), '主人称占有%': (45, 95),
        '訳語連接/万字': (45, 130),
    }
    # ===== 構造チェック（文体統計より上位。ここを外すと随筆に戻る）=====
    # 節見出し（**…**）が2つ以上ある＝完結した開局とみなす。
    # corpus/ の抜粋断片には節構造が無いので、構造チェックは適用しない。
    struct = []
    is_opening = len([1 for x in raw.split('\n') if x.strip().startswith('**')]) >= 2
    first = ps[0] if ps else ''
    # 1) コールドオープン：一行目は台詞・擬音・叫びであること
    # 実サンプル（韓国ラノベの序章）の一行目は「看来是时候认清现实了——我完蛋了。」だった。
    # 叫びでも擬音でもなく、**結論の一言**である。よって冷開場の定義を広げる：
    #   台詞／擬音／内心マーカー／叫び／**26字以内の一人称の結論文**
    cold = (first[:1] in DLG_OPEN
            or re.match(r'^[【（(]', first)
            or re.match(r'^[^。]{0,10}[！!]', first)
            or (len(first) <= 26 and re.search(r'(我|俺)', first)))
    if is_opening and not cold:
        struct.append(('C1', first[:18], '冷開場でない（叫び・擬音・結論一言のどれでもない）'))
    # 2) 内心の絶叫【】が2つ以上
    if is_opening and len(re.findall(r'【[^】]+】', raw)) < 2:
        struct.append(('C2', '%d個' % len(re.findall(r'【[^】]+】', raw)), '内心絶叫【】が2つ未満'))
    # 3) 括弧内心ツッコミが8つ以上
    nz = len(re.findall(r'（[^）]+）', raw))
    if is_opening and nz < 8:
        struct.append(('C3', '%d個' % nz, '括弧の内心ツッコミが8つ未満'))
    # 4) 擬音の独立行が1つ以上
    if is_opening and not any(re.fullmatch(r'[^。！？「」（）【】]{1,6}[。！]', x) and
               re.search(r'[咔哗啪轰砰嗒锵咚叮噼铛嘟咕沙嘶哐吱]', x) for x in ps):
        struct.append(('C4', '-', '擬音の独立行が無い'))
    # 5) 節末が雰囲気止めでないこと（各節の最終段落を見る）
    secs, cur = [], []
    for line in raw.split('\n'):
        s = line.strip()
        if s.startswith('**') and cur:
            secs.append(cur); cur = []
        elif s and not s.startswith(('**', '【开局', '{', '<')):
            cur.append(s)
    if cur:
        secs.append(cur)
    # 6) 序章自足性：新規プレイヤーは前の開局を読んでいない。
    #    冒頭付近で「私は誰か」を名乗ること。
    head = ''.join(ps[:14])
    if is_opening and not re.search(r'我叫[^。，]{1,10}[，。]', head):
        struct.append(('C6', head[:16], '冒頭14段以内に「我叫○○」の自己紹介が無い'))
    # 7) 世界そのものの説明：この世界の前提を毎回書く。
    #    どの開局から入っても、その一篇だけで世界が分かること。
    #    ——検査する語はカードごとに違う。世界定義は world.json（または環境変数
    #    RANOBE_WORLD）から読む。定義が無ければ検査を飛ばす（黙って通す）。
    #    ここに特定カードの語を焼き込むと、次のカードで必ず誤判定する。
    wt, wc = world_def()
    if is_opening and wt and wc:
        cue = '|'.join(map(re.escape, wc))
        t = re.escape(wt)
        if not re.search(r'%s[^。]{0,40}(%s)|(%s)[^。]{0,40}%s' % (t, cue, cue, t), raw):
            struct.append(('C7', '-', '「%s とは何か」の説明が無い（毎篇に必要）' % wt))
    # 8) 賭け金の明示：この一戦で何が懸かっているかを地の文か台詞で言い切る。
    if is_opening and not re.search(r'(如果|要是|万一)[^。]{2,30}(就|便)[^。]{2,30}[。]'
                                    r'|输了[^。]{0,20}[。]|(换|值|抵)[^。]{0,16}(命|条命)', raw):
        struct.append(('C8', '-', '賭け金（何が懸かっているか）が明示されていない'))

    # 9) 今日の目標が一文であること。大義（帝国を統べる・復讐する）は目標ではない。
    #    これが無いと必ず「岁月静好の回想録」になる。
    if is_opening and not re.search(
            r'我才不要|我(今天)?只想|我(今天)?只要|我不想|我要的只是'
            r'|首先[，,]|得先|必须先|我打算|我要做的|今天只(想|要)', raw):
        struct.append(('C9', '-', '今日の目標が一文で書かれていない（大義は目標ではない）'))
    # 10) 沉默寡言装深沉の検出：台詞なしで地の文が何段続くか。
    #     コーパス実測の最大は32段（ko2-生存）。34段を超えたら「誰も喋っていない」。
    gap = cont = 0
    for p in ps:
        if p[:1] in DLG_OPEN:
            cont = 0
        else:
            cont += 1
            gap = max(gap, cont)
    if is_opening and gap > 34:
        struct.append(('C10', '%d段' % gap, '台詞なしの地の文が続きすぎ＝沉默寡言装深沉'))

    # 11) 狂気の症状（施主の明示指示：「疯・癫・精神有问题・有病」の感じを必ず出す）。
    #     歴史教科書の正常な人物を書いてはいけない。以下の5症状のうち3つ以上。
    # 同語反復：短句を括弧・句読点・語尾助詞まで剥がして正規化し、
    # 同じ核が2回以上出るかを見る。「说出来了。说出来了。」「赢了。……赢了啊。」の両方を拾う。
    def _core(x):
        x = re.sub(r'^[（(【「『]+|[）)】」』]+$', '', x.strip())
        x = re.sub(r'^[…\.．\s]+', '', x)
        x = re.sub(r'[啊呀吧呢了嘛哦噢的]*[。！？…\.]*$', '', x)
        return x
    _cores = [_core(x) for x in ps]
    _cores = [c for c in _cores if 2 <= len(c) <= 12]
    _rep = any(_cores.count(c) >= 2 for c in set(_cores))
    mad = {
        '同語反復': _rep,
        '数えている': bool(re.search(r'第[〇一二三四五六七八九十百千两0-9]+(次|遍|回|趟|个)'
                                r'|我数(着|过|了)|数到|一天三遍|加起来大概有', raw)),
        '場違いな笑い': bool(re.search(r'笑(了出来|出声|得|出来|了一下|了一声)'
                                     r'|忍不住笑|想笑|可笑|滑稽|在笑|笑了。', raw)),
        '自白': bool(re.search(r'其实我|说实话|老实说|我承认|不想承认|不肯承认|说来丢人', raw)),
        '絶叫の発作': len(re.findall(r'【[^】]+】', raw)) >= 4,
    }
    if is_opening and sum(mad.values()) < 3:
        struct.append(('C11', '/'.join(k for k, v in mad.items() if v) or '無',
                       '狂気の症状が3つ未満＝歴史教科書の正常人になっている'))

    # 12) 韓国語稿の存在を強制する（構造的対策）。
    #     中国語で直接書く限り、どれだけ語彙を禁じても中華の語感は必ず戻ってくる。
    #     唯一の根本対策は「先に韓国語で書き、逐語訳する」ことなので、それを機械で担保する。
    #     NN.md に対して NN.ko.md が存在し、段落数が概ね対応していること。
    if is_opening:
        import os
        # 韓国語稿の置き場は3通り許す：同じ階層／隣の ko/／リポジトリの
        # tools/ranobe/ko/（納品先の開局は st/data/openings/ に置くので、
        # 原稿を同じ階層に置くと出荷物に混ざる）。RANOBE_KO_DIR でも上書きできる。
        base = re.sub(r'\.md$', '.ko.md', os.path.basename(path))
        d = os.path.dirname(os.path.abspath(path))
        cands = [os.path.join(d, base), os.path.join(d, 'ko', base)]
        if os.environ.get('RANOBE_KO_DIR'):
            cands.insert(0, os.path.join(os.environ['RANOBE_KO_DIR'], base))
        up = d
        for _ in range(5):
            up = os.path.dirname(up)
            if not up:
                break
            cands.append(os.path.join(up, 'tools/ranobe/ko', base))
        ko = next((c for c in cands if os.path.exists(c)), cands[0])
        if not os.path.exists(ko):
            struct.append(('C12', os.path.basename(ko), '韓国語稿が無い＝中国語で直接書いている'))
        else:
            kps = [x for x in io.open(ko, encoding='utf-8').read().split('\n') if x.strip()]
            kn, cn = len(kps), len(ps)
            if cn and not (0.75 <= kn / cn <= 1.35):
                struct.append(('C12', '%d行/%d段' % (kn, cn),
                               '韓国語稿と中国語稿の段落数が対応していない＝逐語訳になっていない'))

    # 13) 感嘆詞（実測：原典7本 5.1〜64.6／万字、長編2本 19.6〜41.7／万字）。
    #     ゼロだと「中国語の字幕」になる。開局1篇（約2000字）で最低3個。
    INTERJ = r'呜哇|哎呀|哎哟|唉|呃+|啊啊|诶+|哇+|嘿嘿|嘻嘻|哈哈|噗|哼|嘛[，。、]|唔+|呼+|嗯+'
    if is_opening:
        c = len(re.findall(INTERJ, raw))
        if c < 3:
            struct.append(('C13', '%d个' % c, '感嘆詞が足りない＝韓国語の話し言葉になっていない'))
    # 14) 確認・反問（実測：原典 0〜23.5／万字、長編 6.8〜10.2／万字）。
    #     相手に確かめる言い方が皆無だと、全員が宣言しかしない機械になる。
    CONFIRM = r'对吧|是吧|不是吗|知道吗|好吗|是不是|吧？|吗。|了吧|没有吗|行吗'
    if is_opening:
        c = len(re.findall(CONFIRM, raw))
        if c < 2:
            struct.append(('C14', '%d个' % c, '確認・反問が無い＝会話が宣言だけになっている'))

    # 15) 暴力の成語要約。ここに挙げたものは全て「情景を書かずに済ませる」ための語。
    CLICHE = ['尸横遍野', '血流成河', '惨绝人寰', '生灵涂炭', '哀鸿遍野', '尸山血海',
              '血雨腥风', '惨不忍睹', '触目惊心', '人间炼狱', '横尸遍野', '血肉横飞',
              '惨状', '暴行', '人间地狱']
    if is_opening:
        for w in CLICHE:
            if w in raw:
                struct.append(('C15', w, '暴力を成語で要約している＝読者に想像させない語'))
    # 16) 抽象名詞。語り手が感情に名前を付けた時点で、読者は物を見なくて済む。
    if is_opening:
        for w in ['绝望', '恐惧', '悲惨', '残暴', '恐怖气氛']:
            if w in raw:
                struct.append(('C16', w, '抽象名詞。その語を生じさせた物を書く'))
    # 17) 嗅覚。視覚は美化されやすい。匂いが一つも無い開局は「絵」でしかない。
    SMELL = r'味|臭|腥|膻|焦|馊|酸|骚|香|嗅|闻(?!言)|鼻子'
    if is_opening:
        c = len(set(re.findall(SMELL, raw)))
        if c < 2:
            struct.append(('C17', '%d種' % c, '嗅覚が足りない＝視覚だけで書いている'))
    # 18) 音の質。悲鳴の一語で済ませていないか。
    SOUND = r'声|响|叫|喊|嚎|咔|嘎|噗|哗|咚|嘶|吼|静|听'
    if is_opening:
        c = len(re.findall(SOUND, raw))
        if c < 8:
            struct.append(('C18', '%d个' % c, '音が足りない＝聴覚が抜けている'))
    # 19) 節末の道徳的反省。
    if is_opening:
        for w in ['这就是战争', '历史无声', '历史记住', '无声地记录', '这就是命',
                  '战争就是这样', '人就是这样']:
            if w in raw:
                struct.append(('C19', w, '道徳的反省で締めている'))
    # 20) 罵倒。韓国の小説の会話は罵倒が地の語彙であって、味付けではない。
    #     依頼者の指摘（2回目）を受けて閾値を 2 → 8 に引き上げた。
    #     会話3行に1行は何かしら汚い語が入っている、が目安。
    CURSE = (r'他妈的|妈的|他娘的|滚|闭嘴|贱|狗东西|狗崽子|狗屎|杂种|崽子|放屁|老子|'
             r'死小子|臭小子|王八|操|畜生|蠢货|婊|傻|白痴|废物|去死|神经病|疯子|见鬼|'
             r'混蛋|该死|要命|屁话|屎')
    if is_opening:
        c = len(re.findall(CURSE, raw))
        if c < 8:
            struct.append(('C20', '%d个' % c, '罵倒が足りない＝上品な会社員の会話になっている'))
    # 21) 感嘆符。
    if is_opening:
        c = raw.count('！')
        if c < 10:
            struct.append(('C21', '%d个' % c, '感嘆符が少ない＝怒鳴っていない'))

    # 22) 悔い・良心。一語でも出たら、その一人称は現代の道徳主体である。
    if is_opening:
        for w in ['不忍', '良心', '罪恶感', '内疚', '愧疚', '可怜', '心软', '不该这样',
                  '对不起', '我错了', '犹豫了一下', '有点难受', '不是滋味', '于心']:
            if w in raw:
                struct.append(('C22', w, '悔い・良心の語＝現代の善人が汚い言葉を使っているだけ'))
    # 23) 能動的な加害・値段づけ・略奪。命令でやらされているだけの人物は被害者に見える。
    EVIL = (r'抢|夺|剥下|扒下|扒了|归我|是我的了|分了|值几|值多少|卖多少|能卖|能换|'
            r'换多少|赔率|押|赌|战利|摸尸|翻他|搜身|拿走|顺手|好玩|有意思|看热闹|'
            r'叫人来看|脱下来|脱了|拧下|捡走|收进怀里|几头|几张羊皮|几匹绢|一头能|'
            r'卖两次|卖给|涨价|太少了')
    if is_opening:
        c = len(re.findall(EVIL, raw))
        if c < 2:
            struct.append(('C23', '%d个' % c, '要らない加害・値段づけ・略奪が無い＝命令に従っただけの善人'))
    # 24) 見下しが地の語彙になっているか。
    LOOKDOWN = r'这帮|那帮|这些东西|这东西|牲口|不算人|奴才|贱民|杂碎|一群|狗一样|畜生一样'
    if is_opening and not re.search(LOOKDOWN, raw):
        struct.append(('C24', '無', '見下しが地の語彙になっていない＝全員が対等な現代社会'))
    # 25) 陰険さ。暴力だけでは足りない。頭を使った悪が一つも無いと「殴るだけの人」になる。
    SLY = (r'嫁祸|栽赃|推给|让他背|算在.{1,6}头上|记在.{1,6}头上|报上去|告发|密告|'
           r'骗|诓|哄|装作|假装|学了一下|学他|学着他|学得|模仿|捏着|拿捏|把柄|再涨|'
           r'涨价|先.{1,4}再谈|等他.{1,6}再|没人看见|谁看见了|其实我.{0,10}没|'
           r'一步都没|根本没动|跟我没关系|就这么写|只有我知道|卖两次')
    if is_opening and not re.search(SLY, raw):
        struct.append(('C25', '無', '陰険さが無い＝殴るだけの単純な人物'))
    # 26) 上下の落差。捕まえたいのは「一部屋まるごと同じ丁寧さで喋る」平坦さである。
    #     当初は「上向きの語と下向きの語が両方要る」と書いたが、それは誤りだった——
    #     語り手が階層の頂点にいる局（大汗の視点）や、上位者がその場にいない局
    #     （逃奴の少年・屍を担ぐ少年）には上向きの語が出なくて当然で、実際に草原カードの
    #     20局中8局が落ちた。訂正履歴14と同じ穴（カード固有の語を式に焼き込む）である。
    #     よって「どちらも無い」ときだけ落とす。片側だけなら階層は書けている。SKILL 14-5
    UP = (r'您|大人|陛下|夫人|阁下|将军|大汗|可汗|那颜|主人|主子|殿下|请|惶恐|'
          r'不敢|小人|奴婢|奴才我|臣|回禀|禀|遵命|听凭')
    DOWN = (r'这帮|那帮|这东西|这些东西|牲口|奴才|贱|狗东西|废物|蠢货|滚|闭嘴|'
            r'混蛋|畜生|杂碎|你他妈|叫你|不算人|贱民')
    if is_opening:
        u, d = bool(re.search(UP, raw)), bool(re.search(DOWN, raw))
        if not u and not d:
            struct.append(('C26', '上下とも無',
                           '敬いも見下しも無い＝一部屋まるごと同じ丁寧さの現代人'))
    # 27) 状態欄の眼色。<sec_npc> を持つ原稿にだけ掛ける（コーパスには panel が無いので飛ぶ）。
    #     欄が無い／占位のまま／数人が同じ文言、のいずれも「値踏みをしていない」証拠。SKILL 14-9
    if '<sec_npc>' in raw:
        rows = [x.strip() for x in raw.split('\n')
                if x.strip().startswith('\u25c8')]
        PLACE = {'', '—', '-', '不详', '（未估）', '未估', '同上', '无'}
        short = [r for r in rows if r.count('|') < 8]
        if short:
            struct.append(('C27', '%d行が8本の縦線に満たない' % len(short), '眼色欄が無い'))
        else:
            eyes = [r.split('|')[8].strip() for r in rows]
            real = [e for e in eyes if e not in PLACE]
            if not real:
                struct.append(('C27', '全行が占位', '眼色欄が埋まっていない'))
            elif len(set(real)) < len(real):
                struct.append(('C27', '重複あり', '数人の眼色が同じ文言＝値踏みをしていない'))

    # 28) ◈心声の人物間語彙重複。<sec_npc> を持つ原稿にだけ掛ける（コーパスは panel を持たないので飛ぶ）。
    #     全員に均等に汚く喋らせると門卒も皇帝も同じ語彙・同じ勘定単位になる（訂正履歴 #18）。
    #     閾値は手書き44篇（luzhi 24・mongol 20）の実測——最大重複の中位 0.067／九分位 0.147／最悪 0.222。
    #     0.35 は実測の最悪値の 1.6 倍で、手書き原稿には当たらない。
    if '<sec_npc>' in raw:
        import itertools as _it
        _rows = [x.strip() for x in raw.split('\n') if x.strip().startswith('\u25c8')]
        _hearts = []
        for _r in _rows:
            _p = _r.split('|')
            if len(_p) > 3:
                _t = re.sub(r'[^\u4e00-\u9fff]', '', _p[3])
                if len(_t) >= 12:
                    _hearts.append((_p[0].lstrip('\u25c8').strip(),
                                    set(_t[i:i + 2] for i in range(len(_t) - 1))))
        _worst, _pair = 0.0, ''
        for (_n1, _b1), (_n2, _b2) in _it.combinations(_hearts, 2):
            _ov = len(_b1 & _b2) / max(1, min(len(_b1), len(_b2)))
            if _ov > _worst:
                _worst, _pair = _ov, _n1 + '×' + _n2
        if _worst > 0.35:
            struct.append(('C28', '%s 重複%.2f' % (_pair, _worst),
                           '数人の心声が同じ語彙・同じ勘定＝声が一本しかない'))

    if is_opening:
        for w in S2G:
            if w in raw:
                struct.append(('S2g', w, '現代の男女無差反応＝二〇二六年の反応であって古代のそれではない'))

    MOOD = re.compile(r'(风|月光|火光|烟|草浪|夜色|星)[^。]{0,12}[。]?$')
    for i, sec in enumerate(secs if is_opening else []):
        if sec and MOOD.search(sec[-1]) and len(sec[-1]) > 12:
            struct.append(('C5', sec[-1][-14:], '第%d節が雰囲気で終わっている（引きが無い）' % (i + 1)))

    fails = []
    print('■ %s' % path)
    for k, v in m.items():
        lo, hi = ok[k]
        good = lo <= v <= hi
        if not good:
            fails.append(k)
        print('   %-14s %-7s  [%s~%s] %s' % (k, v, lo, hi, 'OK' if good else '×'))

    hits = []
    for pat, why in S1:
        for x in re.findall(pat, raw):
            hits.append(('S1', ''.join(x) if isinstance(x, tuple) else x, why))
    for w in S2:
        if w in raw:
            hits.append(('S2', w, '中華小説常套句'))
    for w in JIANGHU:
        if w in raw:
            hits.append(('S2b', w, '北方口語・講談調＝江湖の痞味'))
    for w in POFU:
        if w in raw:
            hits.append(('S4', w, '泼妇骂街の指紋＝観客に向かって被害者として音量で押す型'))
    if is_opening:
        for pat, why in S2D:
            for m in re.findall(pat, raw):
                hits.append(('S2d', (''.join(m) if isinstance(m, tuple) else m)[:10], why))
        for w in S2C:
            pat = S2C_EXEMPT.get(w)
            if (pat.search(raw) if pat else (w in raw)):
                hits.append(('S2c', w, '説書調・侠気・装深沉の語（開局では厳禁）'))
    for p in ps[-3:]:
        if S3_TAIL.search(p) and p[:1] not in DLG_OPEN:
            hits.append(('S3', p[-16:], '疑問で締めている'))

    hits = struct + hits
    if hits:
        print('   -- 検出 --')
        for lv, tok, why in hits:
            print('   %s  %-14s %s' % (lv, tok, why))

    passed = not fails and not hits
    print('   => %s' % ('合格' if passed else '不合格'))
    if not passed:
        for k in fails:
            if k in FIXHINT:
                print('      ↳ %s' % FIXHINT[k])
        for lv, _, _ in hits:
            if lv in FIXHINT:
                print('      ↳ %s' % FIXHINT[lv])
    print('')
    return passed


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    args = sys.argv[1:]
    if args[0] == '--selftest':
        import glob
        import os
        here = os.path.dirname(os.path.abspath(__file__))
        args = sorted(glob.glob(os.path.join(here, '..', 'corpus', '*.txt')))
        if not args:
            print('corpus/ が見つからない')
            sys.exit(2)
    res = [score(p) for p in args]
    print('合格 %d / %d' % (sum(res), len(res)))
    sys.exit(0 if all(res) else 1)
