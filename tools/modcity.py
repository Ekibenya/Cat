# -*- coding: utf-8 -*-
"""现代城市粒子沙盘 · 数据烘焙

OSM Overpass 原始件（建筑 out center / 干道·铁路 out geom / 车站节点）
→ 每城一个紧凑二进制（MC01）→ ZJP1 拼包 → gzip → 异或 → st/v1/modern.dat。

视觉语言对齐 STEM 沙盘：楼=按高度立的点柱，路=点线，站=红橙热点，名所=大热簇。
不动 idx/v1 与线上任何旧资材。
"""
import io, os, re, sys, json, gzip, math, struct, random, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.environ.get('MODCITY_RAW', '/tmp/modcity')
OUT  = os.path.join(ROOT, 'core/res/data/st/v1')
ENG  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/8e2ad10c77b4.js')

UNIT = 0.25          # 米/单位，int16 半径 ±8.19km
# 全量建筑：不设上限（用户要求一栋不丢）；渲染端按设备 LOD。

CITIES = {
 'tokyo': {'o': (139.740, 35.680), 'cn': '东京',
   'poi': [('皇居',139.7528,35.6852,3),('东京站',139.7671,35.6812,3),('新宿站',139.7004,35.6896,3),
           ('涩谷十字路口',139.7005,35.6595,3),('银座四丁目',139.7635,35.6717,2),('秋叶原',139.7730,35.6984,3),
           ('东京塔',139.7454,35.6586,3),('六本木',139.7297,35.6627,2),('上野公园',139.7737,35.7141,2),
           ('浅草寺',139.7967,35.7148,3),('晴空塔',139.8107,35.7101,2),('池袋站',139.7109,35.7295,2),
           ('中野站',139.6657,35.7056,2),('原宿',139.7027,35.6702,1),('筑地',139.7707,35.6655,1),
           ('歌舞伎町',139.7036,35.6952,2),('明治神宫',139.6993,35.6764,2),('代代木公园',139.6949,35.6717,1),
           ('表参道',139.7086,35.6654,2),('赤坂',139.7365,35.6745,1),('国会议事堂',139.7447,35.6759,2),
           ('东京大学',139.7621,35.7128,2),('神保町书店街',139.7576,35.6957,2),('神田',139.7708,35.6918,1),
           ('日本桥',139.7742,35.6841,2),('人形町',139.7826,35.6866,1),('月岛',139.7847,35.6645,1),
           ('台场海滨公园',139.7753,35.6270,2),('丰洲市场',139.7855,35.6494,1),('滨离宫庭园',139.7634,35.6597,1),
           ('新桥',139.7583,35.6660,1),('虎之门',139.7454,35.6690,1),('惠比寿',139.7101,35.6467,1),
           ('目黑',139.7156,35.6339,1),('品川',139.7387,35.6285,2),('代官山',139.7031,35.6484,1),
           ('中目黑',139.6987,35.6440,1),('下北泽',139.6672,35.6613,1),('新大久保',139.7001,35.7013,1),
           ('高田马场',139.7038,35.7123,1),('早稻田大学',139.7192,35.7089,1),('神乐坂',139.7405,35.7018,1),
           ('御茶水',139.7654,35.6997,1),('两国国技馆',139.7933,35.6967,1),('谷中银座',139.7669,35.7284,1),
           ('巢鸭',139.7391,35.7335,1)]},
 'nyc': {'o': (-73.9760, 40.7530), 'cn': '纽约',
   'poi': [('时代广场',-73.9855,40.7580,3),('帝国大厦',-73.9857,40.7484,3),('中央公园南',-73.9734,40.7666,2),
           ('大都会艺术博物馆',-73.9632,40.7794,2),('洛克菲勒中心',-73.9787,40.7587,2),('苏富比',-73.9530,40.7728,3),
           ('华尔街',-74.0106,40.7068,3),('世贸一号楼',-74.0134,40.7127,2),('布鲁克林大桥',-73.9969,40.7061,3),
           ('联合国总部',-73.9680,40.7489,1),('五大道57街',-73.9743,40.7638,2),('切尔西市场',-74.0060,40.7424,1),
           ('中央车站',-73.9772,40.7527,2),('自由塔码头',-74.0170,40.7020,1),
           ('唐人街',-73.9970,40.7158,2),('小意大利',-73.9973,40.7191,1),('苏活区',-74.0000,40.7233,2),
           ('格林威治村',-74.0027,40.7336,2),('华盛顿广场公园',-73.9973,40.7308,1),('联合广场',-73.9904,40.7359,2),
           ('熨斗大厦',-73.9897,40.7411,2),('麦迪逊广场花园',-73.9936,40.7505,2),('韩国城',-73.9860,40.7479,1),
           ('布莱恩特公园',-73.9836,40.7536,1),('高线公园',-74.0048,40.7480,1),('哈德逊城市广场',-74.0027,40.7539,2),
           ('林肯中心',-73.9840,40.7725,2),('哥伦布圆环',-73.9819,40.7681,1),('自然历史博物馆',-73.9740,40.7813,2),
           ('古根海姆美术馆',-73.9589,40.7830,2),('惠特尼美术馆',-74.0089,40.7396,1),('炮台公园',-74.0158,40.7033,1),
           ('南街海港',-74.0037,40.7069,1),('布鲁克林高地长廊',-73.9970,40.6960,1),('DUMBO',-73.9887,40.7033,2),
           ('威廉斯堡',-73.9573,40.7143,2),('哈莱姆125街',-73.9451,40.8091,2),('哥伦比亚大学',-73.9626,40.8075,2),
           ('克莱斯勒大厦',-73.9755,40.7516,2),('罗斯福岛',-73.9510,40.7614,1),('东村',-73.9838,40.7265,1),
           ('下东区',-73.9868,40.7154,1),('翠贝卡',-74.0086,40.7163,1)]},
 'osaka': {'o': (135.5020, 34.6700), 'cn': '大阪',
   'poi': [('大阪站·梅田',135.4959,34.7024,3),('道顿堀',135.5013,34.6687,3),('难波站',135.5013,34.6640,2),
           ('大阪城天守阁',135.5262,34.6873,3),('通天阁',135.5064,34.6525,3),('心斋桥',135.5010,34.6740,2),
           ('黑门市场',135.5065,34.6656,1),('天王寺站',135.5140,34.6475,2),('中之岛',135.4915,34.6930,1),
           ('京瓷巨蛋',135.4761,34.6693,1),('大阪港天保山',135.4360,34.6560,0),
           ('新世界',135.5063,34.6525,2),('四天王寺',135.5164,34.6544,2),('住吉大社',135.4930,34.6124,2),
           ('大阪天满宫',135.5129,34.6963,2),('天神桥筋商店街',135.5107,34.7047,2),('中崎町',135.5060,34.7085,1),
           ('梅田蓝天大厦',135.4903,34.7053,2),('堀江',135.4952,34.6717,1),('美国村',135.4981,34.6724,2),
           ('难波八阪神社',135.4988,34.6614,1),('大阪历史博物馆',135.5208,34.6827,1),('难波宫遗址',135.5218,34.6800,1),
           ('鹤桥',135.5308,34.6656,2),('天下茶屋',135.4934,34.6335,1),('阿倍野HARUKAS',135.5133,34.6458,2),
           ('长居公园',135.5181,34.6094,1),('弁天町',135.4634,34.6693,1),('造币局樱之通拔',135.5210,34.6960,1),
           ('京桥',135.5344,34.6967,2),('樱之宫',135.5203,34.7050,1),('日本桥电电城',135.5063,34.6600,2),
           ('九条',135.4780,34.6690,1)]},
}

def load(fn):
    p = os.path.join(RAW, fn)
    with io.open(p, encoding='utf-8') as f:
        return json.load(f)

def meters(lon, lat, o):
    kx = 111320.0 * math.cos(math.radians(o[1]))
    return ((lon - o[0]) * kx, -(lat - o[1]) * 111320.0)

def q(v):
    n = int(round(v / UNIT))
    return max(-32760, min(32760, n))

NYC_PHRASES = [
    ('World Trade Center', '世贸中心'), ('Grand Central', '中央车站'), ('Times Sq', '时代广场'),
    ('Times Square', '时代广场'), ('Bowling Green', '保龄格林'), ('City Hall', '市政厅'),
    ('Borough Hall', '区政厅'), ('Central Park North', '中央公园北'), ('Central Park', '中央公园'),
    ('Columbus Circle', '哥伦布圆环'), ('Herald Sq', '先驱广场'), ('Union Sq', '联合广场'),
    ('Penn Station', '宾州车站'), ('Port Authority', '港务局'), ('Bryant Pk', '布莱恩特公园'),
    ('Bryant Park', '布莱恩特公园'), ('Rockefeller Ctr', '洛克菲勒中心'), ('Rockefeller Center', '洛克菲勒中心'),
    ('Columbia University', '哥伦比亚大学'), ('Hunter College', '亨特学院'), ('Roosevelt Island', '罗斯福岛'),
    ('Lincoln Ctr', '林肯中心'), ('Lincoln Center', '林肯中心'), ('Museum of Natural History', '自然历史博物馆'),
    ('Cathedral Pkwy', '大教堂公园道'), ('Wall St', '华尔街'), ('South Ferry', '南渡口'),
    ('Whitehall St', '白厅街'), ('Brooklyn Bridge', '布鲁克林大桥'), ('High St', '高街'),
    ('Court Sq', '法院广场'), ('Hunters Point', '猎人角'), ('Atlantic Av', '大西洋大道'),
    ('Barclays Ctr', '巴克莱中心'), ('Broadway Junction', '百老汇枢纽'),
]
NYC_WORDS = {
    'Lexington': '莱克星顿', 'Madison': '麦迪逊', 'Fulton': '富尔顿', 'Canal': '坚尼', 'Chambers': '钱伯斯',
    'Franklin': '富兰克林', 'Christopher': '克里斯托弗', 'Houston': '豪斯顿', 'Spring': '斯普林',
    'Prince': '王子', 'Astor': '阿斯特', 'Bleecker': '布里克', 'Delancey': '德兰西', 'Essex': '埃塞克斯',
    'Bowery': '包厘', 'Broadway': '百老汇', 'Nassau': '拿骚', 'Rector': '雷克托', 'Cortlandt': '科特兰',
    'Clark': '克拉克', 'York': '约克', 'Jay': '杰伊', 'Hoyt': '霍伊特', 'Lafayette': '拉法叶',
    'Bergen': '卑尔根', 'Marcy': '马西', 'Lorimer': '洛里默', 'Bedford': '贝德福德', 'Graham': '格雷厄姆',
    'Montrose': '蒙特罗斯', 'Morgan': '摩根', 'Harlem': '哈莱姆', 'Dyckman': '戴克曼',
    'Whitehall': '白厅', 'Vernon': '弗农', 'Jackson': '杰克逊', 'Greenpoint': '绿点', 'Nostrand': '诺斯特兰德',
    'Kingston': '金斯顿', 'Utica': '尤蒂卡', 'Liberty': '自由', 'Smith': '史密斯', 'Carroll': '卡罗尔',
    'Clinton': '克林顿', 'Washington': '华盛顿', 'Metropolitan': '大都会', 'Flushing': '法拉盛',
    'Myrtle': '默特尔', 'Knickerbocker': '尼克博克', 'Central': '中央', 'Forest': '森林', 'Seneca': '塞尼卡',
    'DeKalb': '德卡尔布', 'Classon': '克拉森', 'Halsey': '哈尔西', 'Gates': '盖茨', 'Kosciuszko': '柯斯丘什科',
    'Flatbush': '弗拉特布什', 'Church': '教堂', 'Newkirk': '纽柯克', 'Beverly': '贝弗利', 'Cortelyou': '科特柳',
    'Parkside': '园边', 'Prospect': '展望', 'Botanic': '植物园', 'Eastern': '东方', 'Grand Army': '大军团',
    'Hewes': '休斯', 'Marble': '大理石', 'Hill': '山', 'Inwood': '因伍德', 'Chauncey': '昌西',
}
NYC_SUFFIX = [
    (r'(\d+)\s*(?:st|nd|rd|th)?[\s–-]*(?:Streets?|Sts?)\b', r'\1街'),
    (r'(\d+)\s*(?:st|nd|rd|th)?[\s–-]*(?:Avenues?|Avs?|Aves?)\b', r'\1大道'),
    (r'\b(?:Streets?|Sts?)\b', '街'), (r'\b(?:Avenues?|Avs?|Aves?)\b', '大道'),
    (r'\b(?:Squares?|Sqs?)\b', '广场'), (r'\bPa?r?ks?\b', '公园'),
    (r'\b(?:Boulevards?|Blvds?)\b', '大道'), (r'\b(?:Places?|Pls?)\b', '坊'),
    (r'\b(?:Roads?|Rds?)\b', '路'), (r'\bBridge\b', '桥'), (r'\bHeights\b', '高地'),
    (r'\bTerminal\b', '总站'), (r'\bStation\b', '车站'), (r'\bFerry\b', '渡口'),
    (r'\bEast\b', '东'), (r'\bWest\b', '西'), (r'\bNorth\b', '北'), (r'\bSouth\b', '南'),
    (r'\bCtr\b|\bCenter\b', '中心'), (r'\bCircle\b', '圆环'), (r'\bIsland\b', '岛'),
    (r'\bPkwy\b|\bParkway\b', '公园道'), (r'\bUniversity\b', '大学'), (r'\bCollege\b', '学院'),
    (r'\bMuseum\b', '博物馆'), (r'\bHall\b', '厅'),
]

def zh_nyc(name):
    """纽约站名汉化：先整词组、再单词词典、再序数街道规则；剩余英文原样保留。"""
    s = str(name)
    for en, zh in NYC_PHRASES:
        s = re.sub(re.escape(en), zh, s, flags=re.I)
    for pat, rep in NYC_SUFFIX:
        s = re.sub(pat, rep, s, flags=re.I)
    for en, zh in sorted(NYC_WORDS.items(), key=lambda kv: -len(kv[0])):
        s = re.sub(r'\b' + re.escape(en) + r'\b', zh, s, flags=re.I)
    s = re.sub(r'(\d+)(?:st|nd|rd|th)\b', r'\1', s)   # 裸序数收尾：47th → 47
    s = re.sub(r'\s*[–—-]\s*', '-', s)
    return s.strip()

def parse_h(tags):
    if not tags: return None
    h = tags.get('height') or tags.get('building:height')
    if h:
        m = re.match(r'^\s*([\d.]+)', str(h))
        if m:
            try: return float(m.group(1))
            except ValueError: pass
    lv = tags.get('building:levels')
    if lv:
        m = re.match(r'^\s*([\d.]+)', str(lv))
        if m:
            try: return float(m.group(1)) * 3.2
            except ValueError: pass
    return None

def bake_city(key):
    c = CITIES[key]; o = c['o']; suf = {'tokyo':'T','nyc':'N','osaka':'O'}[key]
    rnd = random.Random(42)

    # ---- 楼柱 ----
    bld = []
    for e in load('bld_%s.json' % suf).get('elements', []):
        b = e.get('bounds')
        if not b: continue
        clon = (b['minlon'] + b['maxlon']) / 2.0
        clat = (b['minlat'] + b['maxlat']) / 2.0
        x, z = meters(clon, clat, o)
        if abs(x) > 8100 or abs(z) > 8100: continue
        dx = (b['maxlon'] - b['minlon']) * 111320.0 * math.cos(math.radians(o[1]))
        dz = (b['maxlat'] - b['minlat']) * 111320.0
        area = max(10.0, dx * dz * 0.62)          # bbox→足迹的经验折减
        hx = max(1.5, min(120.0, dx / 2 * 0.86))  # 半宽/半深（略收，bbox 偏肥）
        hz = max(1.5, min(120.0, dz / 2 * 0.86))
        h = parse_h(e.get('tags'))
        if h is None: h = 6.0 + min(10.0, area / 160.0)
        h = max(3.0, min(460.0, h))
        imp = h * 1.6 + math.sqrt(area)           # 重要性：高度优先，足迹次之
        bld.append((imp, x, z, h, hx, hz))
    # 空间排序（粗网格 Z 序）：相邻楼记录相邻，gzip 压缩率显著更好；
    # 重要性字段只在此前用于并列去重语义，落盘顺序与画质无关。
    bld.sort(key=lambda t: (int((t[2] + 8200) // 160), int((t[1] + 8200) // 160)))
    bb = io.BytesIO()
    for imp, x, z, h, hx, hz in bld:
        lum = max(70, min(255, int(95 + h * 1.1 + rnd.random()*26)))
        bb.write(struct.pack('<hhHHHB', q(x), q(z), int(h*10),
                             int(min(1250, hx*10)), int(min(1250, hz*10)), lum))

    # ---- 路网点（含铁路） ----
    rb = io.BytesIO(); nroad = 0
    for fn, clss in (('road_%s.json' % suf, None), ('rail_%s.json' % suf, 3)):
        try: js = load(fn)
        except Exception: continue
        for e in js.get('elements', []):
            g = e.get('geometry')
            if not g or len(g) < 2: continue
            cls = clss
            if cls is None:
                hw = (e.get('tags') or {}).get('highway','')
                cls = 2 if hw in ('motorway','trunk') else (1 if hw=='primary' else 0)
            step = 15.0 if cls >= 2 else 20.0
            acc = step
            for i in range(1, len(g)):
                x0,z0 = meters(g[i-1]['lon'], g[i-1]['lat'], o)
                x1,z1 = meters(g[i]['lon'], g[i]['lat'], o)
                seg = math.hypot(x1-x0, z1-z0)
                if seg <= 0: continue
                t = acc
                while t < seg:
                    xx = x0+(x1-x0)*t/seg; zz = z0+(z1-z0)*t/seg
                    if abs(xx) <= 8100 and abs(zz) <= 8100:
                        rb.write(struct.pack('<hhB', q(xx), q(zz), cls)); nroad += 1
                    t += step
                acc = t - seg

    # ---- 车站 ----
    sta = {}
    try:
        for e in load('sta_%s.json' % suf).get('elements', []):
            t = e.get('tags') or {}
            nm = t.get('name:zh') or t.get('name') or ''
            if not nm: continue
            if key == 'nyc' and not t.get('name:zh'):
                nm = zh_nyc(nm)
            nm = re.sub(r'\s+', '', nm)[:24]
            x, z = meters(e['lon'], e['lat'], o)
            if abs(x) > 8100 or abs(z) > 8100: continue
            cls = 1 if t.get('station') == 'subway' else 0
            k = nm
            if k in sta:                      # 同名多口：取均值，地铁优先
                px, pz, pc, pn = sta[k]
                sta[k] = ((px+x)/2, (pz+z)/2, max(pc, cls), pn)
            else:
                sta[k] = (x, z, cls, nm)
    except Exception:
        pass
    sb = io.BytesIO()
    for x, z, cls, nm in sta.values():
        nb = nm.encode('utf-8')[:60]
        sb.write(struct.pack('<hhBB', q(x), q(z), cls, len(nb))); sb.write(nb)

    # ---- 名所 POI ----
    pb = io.BytesIO()
    for nm, lon, lat, rank in c['poi']:
        x, z = meters(lon, lat, o)
        nb = nm.encode('utf-8')[:60]
        pb.write(struct.pack('<hhBB', q(x), q(z), rank, len(nb))); pb.write(nb)

    head = struct.pack('<4sddfIIII', b'MC01', o[0], o[1], UNIT,
                       len(bld), nroad, len(sta), len(c['poi']))
    blob = head + bb.getvalue() + rb.getvalue() + sb.getvalue() + pb.getvalue()
    print('  %-6s 楼柱 %6d · 路点 %6d · 站 %4d · 名所 %2d · %5.2f MB'
          % (key, len(bld), nroad, len(sta), len(c['poi']), len(blob)/1048576.0))
    return blob

def xor_key():
    s = io.open(ENG, encoding='utf-8', errors='ignore').read()
    return re.search(r"var K\s*=\s*'([^']+)'", s).group(1)

def xor(buf, K):
    b = bytearray(buf); kl = len(K)
    for i in range(len(b)):
        b[i] ^= (ord(K[i % kl]) + ((i * 7) & 0xff)) & 0xff
    return bytes(b)

def pack(files):
    head = bytearray(b'ZJP1'); head += struct.pack('<I', len(files))
    body = bytearray()
    for name, blob in files:
        nb = name.encode('utf-8')
        head += struct.pack('<H', len(nb)) + nb + struct.pack('<I', len(blob))
        body += blob
    return bytes(head + body)

def main():
    files = [(k + '.bin', bake_city(k)) for k in ('tokyo', 'nyc', 'osaka')]
    blob = pack(files)
    # 沙盘数据走明 gzip：渲染端 DecompressionStream 直接解，网页与卡内同一条路
    fin = gzip.compress(blob, 9)
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'modern.dat')
    open(out, 'wb').write(fin)
    print('modern.dat  raw %.2f MB → %.2f MB  sha %s'
          % (len(blob)/1048576.0, len(fin)/1048576.0,
             hashlib.sha256(fin).hexdigest()[:16]))
    # 更新 manifest
    mp = os.path.join(OUT, 'manifest.json')
    mani = json.load(io.open(mp, encoding='utf-8'))
    mani['chunks']['modern'] = {'file': 'modern.dat', 'raw': len(blob), 'size': len(fin),
                                'entries': [f[0] for f in files],
                                'sha': hashlib.sha256(fin).hexdigest()[:16]}
    io.open(mp, 'w', encoding='utf-8').write(json.dumps(mani, ensure_ascii=False, indent=1))
    print('manifest 已更新')

if __name__ == '__main__':
    main()
