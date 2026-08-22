# -*- coding: utf-8 -*-
"""资材重打包 —— 把 idx/v1 的整包拆成按需取的小包，并且真正压得动。

现状：idx/v1/*.dat 是「先拼包、再滚动异或」。异或的密钥流周期 5376 字节，
LZ 的匹配基本被打散，同一份内容异或前 gzip 能省 84%，异或后只省 26%——
那道混淆花掉了 17MB 传输。而且包里四份 GLB 本身也没压过（extensionsUsed 是空的，
引擎明明挂了 meshopt 解码器却没用上），所以整包 29.3MB 一次下完。

这里把顺序倒过来：拼包 → gzip → 异或。混淆照旧在，压缩也拿回来了。
取的一端相应改成：fetch → 去异或 → gunzip → unpack，多一步 DecompressionStream 而已。

同时按用途拆开，让一局只取自己要的那几块：
  core      nature.glb + 全部贴图      —— 任何场景都要
  ancient   ancient.glb                —— 古代建筑
  historic  historic.glb               —— 雕像灯柱匾额一类装饰（与 ancient 混用，不是「近代」）
  interior  interior.glb               —— 只有进室内才要
  pawn      棋子包（两引擎共用，原样搬）

不动 idx/v1 下的任何东西，线上那套照常跑。
"""
import io, os, re, sys, json, gzip, struct, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'core/res/data/idx/v1')
OUT  = os.path.join(ROOT, 'core/res/data/st/v1')
ENG  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/8e2ad10c77b4.js')

MED_PACK  = 'cdcf9bb63a.dat'      # 地中海城池资材
ZHOU_PACK = 'df6d172d82.dat'      # 中原城池资材（开局零·纽约 与 东征幕 都要它——
                                  #   默认第一条开场白就会取，不嵌等于把墙内玩家挡在门外）
PAWN_PACK = 'ceb0dfcfec.dat'      # 棋子（两引擎共用）

# 拆分方案：包名 -> 收哪些条目（None = 收全部剩下的贴图）
GROUPS = [
    ('core',     ['nature.glb'], True),
    ('ancient',  ['ancient.glb'], False),
    ('historic', ['historic.glb'], False),
    ('interior', ['interior.glb'], False),
]
# ROMA_ADD_GLB：外来新资材（如沙漠包 desert.glb）注入源包并独立成块
_ADD = os.environ.get('ROMA_ADD_GLB')
if _ADD and os.path.isfile(_ADD):
    GROUPS.append(('desert', ['desert.glb'], False))
# ROMA_STEPPE_GLB：草原毡帐资材（steppe.glb）注入并独立成块
_STP = os.environ.get('ROMA_STEPPE_GLB')
if _STP and os.path.isfile(_STP):
    GROUPS.append(('steppe', ['steppe.glb'], False))


def xor_key():
    """异或密钥直接从引擎里取，免得两边写死了对不上。"""
    s = io.open(ENG, encoding='utf-8', errors='ignore').read()
    m = re.search(r"var K\s*=\s*'([^']+)'", s)
    if not m:
        raise SystemExit('引擎里找不到异或密钥')
    return m.group(1)


def xor(buf, K):
    b = bytearray(buf)
    kl = len(K)
    for i in range(len(b)):
        b[i] ^= (ord(K[i % kl]) + ((i * 7) & 0xff)) & 0xff
    return bytes(b)


def unpack(buf):
    """ZJP1 容器：magic|uint32 条数|(uint16 名长|名|uint32 长)*|数据"""
    if buf[:4] != b'ZJP1':
        raise SystemExit('不是 ZJP1 包')
    n = struct.unpack_from('<I', buf, 4)[0]
    off = 8
    metas = []
    for _ in range(n):
        nl = struct.unpack_from('<H', buf, off)[0]; off += 2
        name = buf[off:off + nl].decode('utf-8'); off += nl
        ln = struct.unpack_from('<I', buf, off)[0]; off += 4
        metas.append((name, ln))
    out = {}
    for name, ln in metas:
        out[name] = buf[off:off + ln]; off += ln
    return out


def pack(files):
    """与引擎里的 unpack() 逐字节对应，顺序即写入顺序。"""
    head = bytearray(b'ZJP1')
    head += struct.pack('<I', len(files))
    body = bytearray()
    for name, blob in files:
        nb = name.encode('utf-8')
        head += struct.pack('<H', len(nb)) + nb + struct.pack('<I', len(blob))
        body += blob
    return bytes(head + body)


def sha(b):
    return hashlib.sha256(b).hexdigest()[:16]


def main():
    K = xor_key()
    os.makedirs(OUT, exist_ok=True)

    raw = open(os.path.join(SRC, MED_PACK), 'rb').read()
    src = unpack(xor(raw, K))
    print('源包 %s  %.2f MB  %d 项' % (MED_PACK, len(raw) / 1048576.0, len(src)))

    if _ADD and os.path.isfile(_ADD):
        src['desert.glb'] = open(_ADD, 'rb').read()
        print('  注入 desert.glb  %.2f MB' % (len(src['desert.glb']) / 1048576.0))
    if _STP and os.path.isfile(_STP):
        src['steppe.glb'] = open(_STP, 'rb').read()
        print('  注入 steppe.glb  %.2f MB' % (len(src['steppe.glb']) / 1048576.0))

    # ROMA_GLB_DIR：同名条目用该目录下的文件替换（meshopt 压缩版 GLB 从这里进来）。
    # 只影响 st/v1 卡用产物；idx/v1 与线上照旧不动。
    sub = os.environ.get('ROMA_GLB_DIR')
    if sub:
        for n in list(src):
            p = os.path.join(sub, n)
            if os.path.isfile(p):
                nb = open(p, 'rb').read()
                print('  替换 %-14s %6.2f MB → %5.2f MB' % (
                    n, len(src[n]) / 1048576.0, len(nb) / 1048576.0))
                src[n] = nb

    claimed = set()
    for _, names, _ in GROUPS:
        claimed |= set(names)
    leftovers = [k for k in src if k not in claimed]      # 贴图等

    mani = {'source': MED_PACK, 'xor': True, 'gzip': True, 'chunks': {}}
    total_raw = total_out = 0

    for gname, names, take_rest in GROUPS:
        picked = [(n, src[n]) for n in names if n in src]
        missing = [n for n in names if n not in src]
        if missing:
            raise SystemExit('源包里缺 %s' % missing)
        if take_rest:
            picked += [(n, src[n]) for n in sorted(leftovers)]
        blob = pack(picked)
        gz = gzip.compress(blob, 9)
        fin = xor(gz, K)
        fn = '%s.dat' % gname
        open(os.path.join(OUT, fn), 'wb').write(fin)
        total_raw += len(blob); total_out += len(fin)
        mani['chunks'][gname] = {
            'file': fn, 'raw': len(blob), 'size': len(fin),
            'entries': [n for n, _ in picked], 'sha': sha(fin),
        }
        print('  %-9s %2d 项  %7.2f MB → %6.2f MB  (-%2.0f%%)  %s' % (
            gname, len(picked), len(blob) / 1048576.0, len(fin) / 1048576.0,
            100 - 100.0 * len(fin) / len(blob), fn))

    # 棋子包原样搬一份（它才 3.1MB，但压完只剩 0.47MB，一样值）
    praw = open(os.path.join(SRC, PAWN_PACK), 'rb').read()
    pblob = xor(praw, K)
    pgz = xor(gzip.compress(pblob, 9), K)
    open(os.path.join(OUT, 'pawn.dat'), 'wb').write(pgz)
    total_raw += len(pblob); total_out += len(pgz)
    mani['chunks']['pawn'] = {'file': 'pawn.dat', 'raw': len(pblob), 'size': len(pgz),
                              'entries': sorted(unpack(pblob).keys()), 'sha': sha(pgz)}
    print('  %-9s %2d 项  %7.2f MB → %6.2f MB  (-%2.0f%%)  pawn.dat' % (
        'pawn', len(unpack(pblob)), len(pblob) / 1048576.0, len(pgz) / 1048576.0,
        100 - 100.0 * len(pgz) / len(pblob)))

    zraw = open(os.path.join(SRC, ZHOU_PACK), 'rb').read()
    zblob = xor(zraw, K)
    # ROMA_ZHOU_DIR：中原包条目替换（GLB 重压/贴图量化产物）。条目名里的 / 在
    # 替换目录中写作 _；条目顺序照源包原样保留。
    zsub = os.environ.get('ROMA_ZHOU_DIR')
    if zsub:
        n0 = struct.unpack_from('<I', zblob, 4)[0]
        off0, metas0 = 8, []
        for _ in range(n0):
            nl0 = struct.unpack_from('<H', zblob, off0)[0]; off0 += 2
            nm0 = zblob[off0:off0 + nl0].decode('utf-8'); off0 += nl0
            ln0 = struct.unpack_from('<I', zblob, off0)[0]; off0 += 4
            metas0.append((nm0, ln0))
        files0 = []
        for nm0, ln0 in metas0:
            data0 = zblob[off0:off0 + ln0]; off0 += ln0
            p0 = os.path.join(zsub, nm0.replace('/', '_'))
            if os.path.isfile(p0):
                nb0 = open(p0, 'rb').read()
                print('  中原替换 %-38s %6.2f MB → %5.2f MB' % (
                    nm0, len(data0) / 1048576.0, len(nb0) / 1048576.0))
                data0 = nb0
            files0.append((nm0, data0))
        zblob = pack(files0)
    zgz = xor(gzip.compress(zblob, 9), K)
    open(os.path.join(OUT, 'zhou.dat'), 'wb').write(zgz)
    total_raw += len(zblob); total_out += len(zgz)
    mani['chunks']['zhou'] = {'file': 'zhou.dat', 'raw': len(zblob), 'size': len(zgz),
                              'entries': sorted(unpack(zblob).keys()), 'sha': sha(zgz)}
    print('  %-9s %2d 项  %7.2f MB → %6.2f MB  (-%2.0f%%)  zhou.dat' % (
        'zhou', len(unpack(zblob)), len(zblob) / 1048576.0, len(zgz) / 1048576.0,
        100 - 100.0 * len(zgz) / len(zblob)))

    io.open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8').write(
        json.dumps(mani, ensure_ascii=False, indent=1))

    print('\n合计 %.2f MB → %.2f MB  (-%.0f%%)' % (
        total_raw / 1048576.0, total_out / 1048576.0, 100 - 100.0 * total_out / total_raw))
    cold = sum(mani['chunks'][k]['size'] for k in ['core', 'ancient', 'historic', 'pawn'])
    print('一局冷启动（core+ancient+historic+pawn）%.2f MB；interior 进室内再取 %.2f MB' % (
        cold / 1048576.0, mani['chunks']['interior']['size'] / 1048576.0))


if __name__ == '__main__':
    main()
