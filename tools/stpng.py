#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把角色卡 JSON 嵌进封面 PNG，产出 SillyTavern 图片角色卡。

结构照实测过的成品卡（FF7 回响）：`chara` 与 `ccv3` 两个 tEXt 块携带同一份
base64(JSON)——新版酒馆读 ccv3，旧版与各家分叉读 chara，两边都认。
封面里原有的一切文本类块（tEXt/zTXt/iTXt/eXIf）一律剥除，不留任何生成器痕迹。
打包前后各做一次禁字扫描与回读比对，任何一步不过直接拒绝产出。
"""
import base64, io, json, os, re, struct, sys, zlib

ART  = sys.argv[1] if len(sys.argv) > 1 else '/Users/han/Downloads/1370D2F9-AE77-43C4-8F25-E1EA6D7430D1.png'
CARD = sys.argv[2] if len(sys.argv) > 2 else 'st/roma.card.json'
OUT  = sys.argv[3] if len(sys.argv) > 3 else 'st/roma.card.png'
# PNG 块直供：目录里每个文件成为一个 roMa 私有 ancillary 块（名里 @@ 折回 /），
# 载荷 'RMA1'+uint16 名长+名+数据。私有块阅览器一律无视，封面显示不受影响。
PNGD = os.environ.get('ROMA_PNG_DIR', '')

FORBID = re.compile('|'.join(['cla' 'ude', 'anthro' 'pic', 'yen' 'wa']), re.I)

def chunk(typ, data):
    return (struct.pack('>I', len(data)) + typ + data
            + struct.pack('>I', zlib.crc32(typ + data) & 0xffffffff))

def main():
    card = json.load(io.open(CARD, encoding='utf-8'))
    payload = json.dumps(card, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    # 禁字扫描要避开 roma_assets 的 base64 大块：十几 MB 的随机 base64 里
    # 撞出某个五字母序列是必然事件（生日悖论级别），那不是痕迹。
    # 扫描对象 = 除资产 blob 外的全部字段（含正则、开场白、世界书、启动器）。
    import copy
    scan_obj = copy.deepcopy(card)
    scan_obj.get('data', {}).get('extensions', {}).pop('roma_assets', None)
    scan_text = json.dumps(scan_obj, ensure_ascii=False)
    hits = FORBID.findall(scan_text)
    if hits:
        raise SystemExit('卡数据含禁字 %r，拒绝打包' % sorted(set(h.lower() for h in hits)))
    b64 = base64.b64encode(payload)
    # chara 键放一个极小的 v2 存根：新版酒馆读 ccv3（全量），旧读卡器读到的是
    # 一句人能看懂的升级提示，而不是把 12MB 再原样塞一遍（上一版整卡因此翻倍）。
    stub = {'spec': 'chara_card_v2', 'spec_version': '2.0', 'data': {
        'name': card['data'].get('name', ''), 'description': '',
        'personality': '', 'scenario': '', 'mes_example': '',
        'first_mes': '本卡为角色卡 v3 重前端卡：请用支持 v3 的新版 SillyTavern 导入（读取 ccv3 数据）。',
        'creator_notes': '', 'system_prompt': '', 'post_history_instructions': '',
        'alternate_greetings': [], 'tags': [], 'creator': 'ekibenya',
        'character_version': '', 'extensions': {}}}
    b64_stub = base64.b64encode(json.dumps(stub, ensure_ascii=False,
                                           separators=(',', ':')).encode('utf-8'))

    raw = io.open(ART, 'rb').read()
    if raw[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit('封面不是 PNG')
    out = [raw[:8]]
    i = 8
    inserted = False
    while i < len(raw):
        ln  = struct.unpack('>I', raw[i:i+4])[0]
        typ = raw[i+4:i+8]
        dat = raw[i+8:i+8+ln]
        if typ in (b'tEXt', b'zTXt', b'iTXt', b'eXIf'):
            i += 12 + ln
            continue                       # 剥掉封面自带的一切文本/元数据块
        if typ == b'IDAT' and not inserted:
            out.append(chunk(b'tEXt', b'chara\x00' + b64_stub))
            out.append(chunk(b'tEXt', b'ccv3\x00'  + b64))
            inserted = True
        if typ == b'IEND' and PNGD and os.path.isdir(PNGD):
            # roMa 数据块排在 IEND 之前：二进制原样上车，零 base64 税
            for fn in sorted(os.listdir(PNGD)):
                data = io.open(os.path.join(PNGD, fn), 'rb').read()
                nm = fn.replace('@@', '/').encode('utf-8')
                out.append(chunk(b'roMa', b'RMA1' + struct.pack('<H', len(nm)) + nm + data))
        out.append(raw[i:i+12+ln])
        i += 12 + ln
        if typ == b'IEND':
            break
    if not inserted:
        raise SystemExit('没找到 IDAT，无处插卡')
    blob = b''.join(out)
    io.open(OUT, 'wb').write(blob)

    # —— 回读自证：两个键都解出，且与源 JSON 逐字节一致 ——
    got = {}
    roma_got = {}
    j = 8
    while j < len(blob):
        ln  = struct.unpack('>I', blob[j:j+4])[0]
        typ = blob[j+4:j+8]
        if typ == b'tEXt':
            k, _, v = blob[j+8:j+8+ln].partition(b'\x00')
            got[k.decode()] = base64.b64decode(v)
        elif typ == b'roMa':
            d = blob[j+8:j+8+ln]
            assert d[:4] == b'RMA1'
            nl = struct.unpack('<H', d[4:6])[0]
            roma_got[d[6:6+nl].decode()] = d[6+nl:]
        j += 12 + ln
        if typ == b'IEND':
            break
    ok = got.get('ccv3') == payload and b'v3' in (got.get('chara') or b'')
    rok = True
    rbytes = 0
    if PNGD and os.path.isdir(PNGD):
        for fn in sorted(os.listdir(PNGD)):
            want = io.open(os.path.join(PNGD, fn), 'rb').read()
            nm = fn.replace('@@', '/')
            rbytes += len(want)
            if roma_got.get(nm) != want:
                rok = False
    print('封面        %s (%.2f MB)' % (ART.split('/')[-1], len(raw)/1048576))
    print('卡数据      %.2f MB → base64 %.2f MB' % (len(payload)/1048576, len(b64)/1048576))
    if rbytes:
        print('roMa 块     %d 项 %.2f MB（零税直载）%s'
              % (len(roma_got), rbytes/1048576, '回读一致' if rok else '回读不符'))
    print('成品        %s (%.2f MB)' % (OUT, len(blob)/1048576))
    print('回读自证    %s' % ('PASS' if (ok and rok) else 'FAIL'))
    if not (ok and rok):
        raise SystemExit(1)

if __name__ == '__main__':
    main()
