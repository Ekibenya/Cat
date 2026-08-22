#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把奶油那道整站反色烘焙进颜色值——特效全留，运行时滤镜归零。

这张卡与以往每一张卡唯一的结构差别是 var LUX=1：整份文档常年套在
html.lux{filter:invert(1) hue-rotate(180deg)} 里。根元素挂滤镜，整页就成了
一个渲染面：任何一个像素变化（光标闪、悬停过渡）都要把整页重过滤镜、
让每一块毛玻璃重取样。特效因此从「画一次就缓存」变成「每帧都收钱」——
逐项打开逐项变卡，实测正是这个叠加曲线。别的卡同样的特效不卡，
只因它们从不开这道滤镜。

好在 invert(1)+hue-rotate(180deg) 是对合变换（做两次回到原处），
外加暖纸罩那一步（反色前 screen 一层 s）合成一个仿射变换：

    G(c) = clamp( M · ((1-c) ∘ (1-s)) )      M＝hue-rotate(180°) 矩阵，s＝#181204

仿射意味着它跟半透明合成、渐变插值都可交换——把每一个颜色字面量替换成
G(颜色)，再把滤镜与暖纸罩整个删掉，最终像素逐位不变（12 个色样对过浏览器，
误差 0）。真彩豁免层（菜单马赛克、纪年页、铸局四步）不烘焙：
它们本来就按真彩写，只要把「再反一次抵消」的那几条滤镜一并删掉，
再各自补一层暖纸（multiply #f0eadc，等价于原来隔着滤镜的那一层）。

对局屏那几张画布（山、地图、缩略窗）画的是「预反色」——原来靠整页滤镜
翻回正色。滤镜删了，js 里的颜色字面量也一并烘焙；画到画布上的马赛克底图
（locus.png，真彩）改成经 ctx.filter 预反一份再贴。

已经烘焙过就什么都不做，好让重打脚本能反复跑。
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC  = os.path.join(ROOT, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html')
MARK = '/* BAKED·已烘焙 */'

# hue-rotate(180deg) 的矩阵（css filter effects 规范给的系数）
M = [[-0.574, 1.430, 0.144],
     [ 0.426, 0.430, 0.144],
     [ 0.426, 1.430,-0.856]]
S = (0x18/255.0, 0x12/255.0, 0x04/255.0)     # 暖纸罩 #181204


def G(r, g, b):
    """G(c)=clamp(M·((1-c)∘(1-s)))，输入输出都是 0..255 整数。"""
    x = ((1-r/255.0)*(1-S[0]), (1-g/255.0)*(1-S[1]), (1-b/255.0)*(1-S[2]))
    out = []
    for row in M:
        v = row[0]*x[0] + row[1]*x[1] + row[2]*x[2]
        out.append(max(0, min(255, round(v*255))))
    return tuple(out)


def bake_hex(m):
    h = m.group(1)
    if len(h) in (3, 4):
        h = ''.join(ch*2 for ch in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    a = h[6:8]                                   # 8 位带 alpha，alpha 不动
    nr, ng, nb = G(r, g, b)
    return '#%02x%02x%02x%s' % (nr, ng, nb, a)


def bake_rgb(m):
    r, g, b = int(m.group(2)), int(m.group(3)), int(m.group(4))
    nr, ng, nb = G(r, g, b)
    return '%s%d,%d,%d' % (m.group(1), nr, ng, nb)


T = (0xf0/255.0, 0xea/255.0, 0xdc/255.0)     # \u6696\u7eb8 #f0eadc


def mulT(r, g, b):
    return (round(r*T[0]), round(g*T[1]), round(b*T[2]))


def mul_hex(m):
    h = m.group(1)
    if len(h) in (3, 4):
        h = ''.join(ch*2 for ch in h)
    r, g, b = mulT(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
    return '#%02x%02x%02x%s' % (r, g, b, h[6:8])


def mul_rgb(m):
    r, g, b = mulT(int(m.group(2)), int(m.group(3)), int(m.group(4)))
    return '%s%d,%d,%d' % (m.group(1), r, g, b)


RE_HEX = re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b')
RE_RGB = re.compile(r'(rgba?\(\s*)(\d+)\s*,\s*(\d+)\s*,\s*(\d+)')


def bake_text(t):
    return RE_RGB.sub(bake_rgb, RE_HEX.sub(bake_hex, t))


def find1(s, pat, nm):
    n = s.count(pat)
    if n != 1:
        sys.exit('锚点 %s 该有 1 处，实际 %d 处，停手。' % (nm, n))
    return s.find(pat)



PAIRS = [
  ('html.lux{filter:invert(1) hue-rotate(180deg);color-scheme:light}',
   MARK + """
/* 奶油配色已烘焙进每一个颜色值：上面整份样式里的颜色都是 G(原色)。
   这里不再挂整页滤镜——根元素一挂滤镜，任何一个像素变化都要整页重过
   着色器、33 块毛玻璃全部重取样，特效才因此逐项叠卡。 */
html.lux{color-scheme:light}"""),
  ('html.lux #zjScene3D canvas,html.lux #mdScene3D canvas,html.lux img{filter:invert(1) hue-rotate(180deg)}',
   '/* 滤镜已卸：图片本来就是真彩，不再需要反回来 */'),
  ("""html.lux::after{content:'';position:fixed;inset:0;z-index:2147483647;pointer-events:none;
  background:#181204;mix-blend-mode:screen}""",
   """/* 暖纸罩已按层落地：界面色烘焙时乘进了 (1-s)，真彩三层各自盖一层 multiply。 */
html.lux #eraSel::after,html.lux #feWrap::after{
  content:'';position:absolute;inset:0;z-index:2147483647;pointer-events:none;
  background:#f0eadc;mix-blend-mode:multiply}"""),
  ('html.lux #menu:not(.gbg):not(.era){filter:invert(1) hue-rotate(180deg)}',
   '/* 滤镜已卸：这一层本来就是真彩 */'),
  ('html.lux #eraSel{filter:invert(1) hue-rotate(180deg)}',
   '/* 滤镜已卸：这一层本来就是真彩 */'),
  ('html.lux #eraSel img{filter:none}', '/* 滤镜已卸 */'),
  ('html.lux #feWrap{filter:invert(1) hue-rotate(180deg)}',
   '/* 滤镜已卸：这一层本来就是真彩 */'),
  ('html.lux #feWrap img{filter:none}', '/* 滤镜已卸 */'),
]

def main():
    s = io.open(DOC, encoding='utf-8').read()
    if MARK in s:
        print('早已烘焙，跳过。')
        return

    # ── 滤镜与暖纸罩本体：整套拆下 ───────────────────────────────────────
    #    先把这几条规则挖成占位符（趁颜色还没烘、锚点还对得上），
    #    烘完再把新写法填回去——新写法里的 #f0eadc 是真彩，不能被烘。
    for idx,(old,new) in enumerate(PAIRS):
        if s.count(old)!=1:
            sys.exit('锚点 %r 该有 1 处，实际 %d 处，停手。' % (old[:44], s.count(old)))
        s=s.replace(old,'@@BAKE'+str(idx)+'@@',1)
    m3d=re.search(r'html\.lux #pnTx #zjScene3D>canvas,html\.lux #pnTx #mdScene3D>canvas,'
                  r'html\.lux #pnTx #modScene3D>canvas\{[^}]*\}',s)
    if not m3d: sys.exit('3d 画布那条 lux 规则没找到，停手。')
    s=s[:m3d.start()]+'@@BAKE3D@@'+s[m3d.end():]

    # ── 豁免区间（真彩层，不烘焙）─────────────────────────────────────────
    ex = []
    # ① 第二个 <style>（纪年页 + 铸局四步的全部样式）
    blocks = [(m.start(), m.end()) for m in re.finditer(r'<style[^>]*>.*?</style>', s, re.S)]
    if len(blocks) != 2:
        sys.exit('该有两个 style 块，实际 %d 个，停手。' % len(blocks))
    ex.append(blocks[1])
    # ② eraSel 与 menu 的正文标记（feWrap 的正文标记里没有颜色，样式都在 style#1）
    a = find1(s, '<div id="eraSel"', 'eraSel')
    b = find1(s, '<div id="menu"', 'menu')
    c = find1(s, '<div id="intro"', 'intro')
    if not (a < b < c):
        sys.exit('eraSel/menu/intro 的先后顺序不对，停手。')
    ex.append((a, c))
    d = find1(s, '<div id="feWrap"', 'feWrap')
    e = s.find('\n<div id=', d + 100)
    ex.append((d, e))
    # ③ 马赛克引擎那一段 js（画的是真彩 emblem/border）
    f = find1(s, 'var mosCv=$(', 'mos 起点')
    g = find1(s, "var mOv=$('#menu')", 'mos 终点')
    ex.append((f, g))
    # ④ felinia js（铸局四步整层）
    h = find1(s, 'var FE={ld:0', 'felinia 起点')
    fe_tail = 'd(function(){});return _o.apply(this,arguments);};\n  }catch(_){}\n})();'
    i = find1(s, fe_tail, 'felinia 终点') + len(fe_tail)
    ex.append((h, i))
    # ⑤ 卡资料 JSON（正文文字，不是界面色）
    j = find1(s, '<script id="cardLuzhi">', '卡资料')
    k = s.find('</script>', j)
    ex.append((j, k))
    # ⑥ style#0 里两段「按真彩写、选择器落在豁免子树上」的样式：
    #    菜单马赛克那一节（creamfix 的 :root{--cream:#fcfcfc} 也在这一节里）
    #    与纪年页浅底那一节。这两节的字面颜色都是真彩，不烘。
    a6 = find1(s, '/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 \u83dc\u5355\uff1a\u5976\u6cb9\u7eb8', '\u83dc\u5355\u8282')
    b6 = find1(s, '/* ---------- intro', '\u83dc\u5355\u8282\u5c3e')
    # \u83dc\u5355\u8282\u4e0d\u8c41\u514d\uff1a\u6539\u8d70\u300c\u4e58 t\u300d\u2014\u2014multiply \u53ef\u4ea4\u6362\uff0c
    # \u628a\u6696\u7eb8\u7f69\u76f4\u63a5\u6298\u8fdb\u83dc\u5355\u7684 DOM \u989c\u8272\uff0c
    # \u90a3\u5c42\u5168\u5c4f ::after \u5c31\u80fd\u7701\u6389\uff08\u7816\u7684\u90e8\u5206\u5728\u753b\u5e03\u91cc\u540c\u6837\u4e58\uff09\u3002
    ex.append((a6, b6))
    a7 = find1(s, '/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 \u7eaa\u5e74\u9875\uff1a\u6d45\u5e95\u914d\u8272', '\u7eaa\u5e74\u8282')
    b7 = s.find('/* \u2550\u2550', a7 + 10)
    if b7 < 0: sys.exit('\u7eaa\u5e74\u8282\u5c3e\u6ca1\u627e\u5230\uff0c\u505c\u624b\u3002')
    ex.append((a7, b7))
    # creamfix 落在别处的那一条奶油覆写：选择器落在豁免子树上，值是真彩
    p8 = find1(s, 'html.lux #eraSel{background:#fcfcfc}', 'eraSel\u5976\u6cb9\u8986\u5199')
    ex.append((p8, p8 + len('html.lux #eraSel{background:#fcfcfc}')))
    # \u5e27\u65f6\u8868\u4e0e\u8bca\u65ad\u677f\uff1a\u7eaf\u7070\u9636\u81ea\u6210\u4e00\u4f53\uff0c\u989c\u8272\u7167\u5b57\u9762\u4fdd\u7559
    p9 = find1(s, '/* \u8bca\u65ad\u677f\uff1a\u7f51\u5740\u52a0 ?diag=1', '\u8bca\u65ad\u677f')
    p10 = s.find("el.id='perfHud'", p9)
    if p10 < 0: sys.exit('\u5e27\u65f6\u8868\u6ca1\u627e\u5230\uff0c\u505c\u624b\u3002')
    p11 = s.find(chr(10)+'})();'+chr(10), p10)
    if p11 < 0: sys.exit('\u5e27\u65f6\u8868\u5c3e\u6ca1\u627e\u5230\uff0c\u505c\u624b\u3002')
    ex.append((p9, p11 + 6))
    # \u2500\u2500 \u8c41\u514d\u5c42\u8981\u7528\u7684 CSS \u53d8\u91cf\uff1a\u628a\u70d8\u524d\u7684\u771f\u5f69\u503c\u5b58\u4e0b\u6765\uff0c\u70d8\u5b8c\u5728\u8c41\u514d\u6839\u4e0a\u91cd\u65b0\u58f0\u660e
    used = set()
    for a0, b0 in ex:
        used |= set(re.findall(r'var\(\s*(--[\w-]+)', s[a0:b0]))
    truevals = {}
    for m in re.finditer(r'(--[\w-]+)\s*:\s*([^;}]+)', s):
        nm, val = m.group(1), m.group(2).strip()
        if nm in used and nm not in truevals and (RE_HEX.search(val) or RE_RGB.search(val)):
            truevals[nm] = val
    # 区间允许互相包含（小豁免常落在大节里），排好序后合并成不相交的一串
    ex.sort()
    merged = []
    for a9, b9 in ex:
        if merged and a9 <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], b9)
        else:
            merged.append([a9, b9])
    ex = [(a9, b9) for a9, b9 in merged]

    # ── 逐段烘焙（豁免区间原样保留）──────────────────────────────────────
    out, pos, n_hex, n_rgb = [], 0, 0, 0
    for a2, b2 in ex:
        seg = s[pos:a2]
        n_hex += len(RE_HEX.findall(seg)); n_rgb += len(RE_RGB.findall(seg))
        out.append(bake_text(seg)); out.append(s[a2:b2]); pos = b2
    seg = s[pos:]
    n_hex += len(RE_HEX.findall(seg)); n_rgb += len(RE_RGB.findall(seg))
    out.append(bake_text(seg))
    s = ''.join(out)


    # 情报台六扇小窗的毛玻璃里带一档 brightness(2.6)：它对「反色前的暗底」是提亮，
    # 对烘焙后的浅底就是直接打爆成纯白。按同一套代数换算成等效写法：
    #   原：先反色画好 c，毛玻璃取到暗底，×2.6，最后整页反色 → F(2.6·c)
    #   今：毛玻璃取到的是 F(c)，要还原同一结果得走 y=2.6x−1.6，
    #   即 brightness(.619) 再 contrast(4.2)（4.2·(0.619x−0.5)+0.5 = 2.6x−1.6）。
    #   blur 与 saturate 跟反色可交换，照旧不动。
    if s.count('blur(6px) brightness(2.6) saturate(140%)') != 2:
        sys.exit('mvWin \u6bdb\u73bb\u7483\u90a3\u6863\u4eae\u5ea6\u8be5\u6709 2 \u5904\uff0c\u505c\u624b\u3002')
    # \u90a3\u6863 brightness(2.6) \u5168\u90e8\u7684\u804c\u8d23\u5c31\u662f\u628a\u53cd\u8272\u4e16\u754c\u91cc\u7684\u6697\u5e95\u63d0\u4eae\u3002
    # \u5e95\u5df2\u70d8\u6210\u6d45\u8272\uff0c\u5b83\u7684\u6d3b\u5e72\u5b8c\u4e86\uff1b\u7559\u7740\u53cd\u800c\u628a\u6d45\u5e95\u6253\u7206\u6210\u7eaf\u767d\u3002
    s = s.replace('blur(6px) brightness(2.6) saturate(140%)',
                  'blur(6px) saturate(140%)', 2)
    # \u4fa7\u5361\u6846\u7684 brightness(.86)\uff1a\u540c\u4e00\u5957\u4ee3\u6570\u6362\u7b97\uff0c
    # \u65e7\u4e16\u754c F(0.86c) \u2261 \u65b0\u4e16\u754c 0.86u+0.14w \u2248 contrast(.77) \u518d brightness(1.116)
    if s.count("C.fr.style.filter=pop?'none':'brightness(.86)';") != 1:
        sys.exit('\u4fa7\u5361\u6846\u90a3\u6863\u4eae\u5ea6\u6ca1\u627e\u5230\uff0c\u505c\u624b\u3002')
    s = s.replace("C.fr.style.filter=pop?'none':'brightness(.86)';",
                  "C.fr.style.filter=pop?'none':'contrast(.77) brightness(1.116)';", 1)
    # \u91d1\u94ae\u60ac\u505c\u7684 brightness(1.12) \u540c\u7406
    s = s.replace('.zjP .gbtn:hover{filter:brightness(1.12)}',
                  '.zjP .gbtn:hover{filter:brightness(.918) contrast(1.22)}', 1)

    # 马赛克的暖纸乘在源图上：砖是互相叠着铺的（马赛克的味道就来自叠），
    # 逐砖乘会把重叠处乘两遍。给 emblem/border 两张源图各乘一次 t，
    # 铺出来的每一块自然只带一层暖纸——与原来那层全屏 ::after 逐像素相等。
    # 马赛克换用乘过暖纸的源图（构建期由 thumbs.py 烤好），
    # 与原来那层全屏 ::after multiply 逐像素相等，采样路径也与原来一致。
    for _src in ("emblem", "border"):
        _old = "/core/res/img/annals/" + _src + ".png'"
        if s.count(_old) != 1:
            sys.exit('马赛克源图 %s 该有 1 处，实际 %d 处，停手。' % (_src, s.count(_old)))
        s = s.replace(_old, "/core/res/img/annals/" + _src + "_t.png'", 1)

    # 帧时表原来自带一道反回来的滤镜（隔着整页滤镜才需要）。滤镜烘掉了，摘掉。
    s = s.replace(";filter:invert(1) hue-rotate(180deg)'", "'", 1)

    # 菜单节乘 t：G 已经跳过它了，这里把暖纸乘进去（multiply 可交换，
    # 与原来那层全屏 ::after 逐像素相等）。放在主烘焙之后做，免得被 G 再过一遍。
    a6 = find1(s, '/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 \u83dc\u5355\uff1a\u5976\u6cb9\u7eb8', '\u83dc\u5355\u8282(\u4e58t)')
    b6 = find1(s, '/* ---------- intro', '\u83dc\u5355\u8282\u5c3e(\u4e58t)')
    s = s[:a6] + RE_RGB.sub(mul_rgb, RE_HEX.sub(mul_hex, s[a6:b6])) + s[b6:]

    # 豁免层消费的共享变量：根上的那份已被烘焙，这里按真彩重新声明一遍
    if truevals:
        mulvals = {k: RE_RGB.sub(mul_rgb, RE_HEX.sub(mul_hex, v)) for k, v in truevals.items()}
        rule = ('/* \u8fd9\u51e0\u4e2a\u53d8\u91cf\u6839\u4e0a\u90a3\u4efd\u5df2\u70d8\u6210 G(\u539f\u8272)\u3002'
                '\u7eaa\u5e74\u9875\u4e0e\u94f8\u5c40\u7528\u539f\u8272\uff08\u5b83\u4eec\u81ea\u5e26\u6696\u7eb8\u7f69\uff09\uff1b'
                '\u83dc\u5355\u7528\u4e58\u8fc7\u6696\u7eb8\u7684\u503c\uff08\u5b83\u7684\u7f69\u5b50\u5df2\u6298\u8fdb\u989c\u8272\uff09\u3002 */\n'
                '#eraSel,#feWrap{'
                + ';'.join(k+':'+v for k, v in sorted(truevals.items())) + '}\n'
                + '#menu:not(.gbg):not(.era){'
                + ';'.join(k+':'+v for k, v in sorted(mulvals.items())) + '}\n')
        i2 = s.rfind('<style>')
        s = s[:i2+len('<style>')] + '\n' + rule + s[i2+len('<style>'):]

    # \u5360\u4f4d\u7b26\u6362\u56de\u65b0\u5199\u6cd5\uff08\u8fd9\u4e9b\u6587\u672c\u662f\u70d8\u5b8c\u624d\u63d2\u8fdb\u6765\u7684\uff09
    for idx,(old,new) in enumerate(PAIRS):
        s=s.replace('@@BAKE'+str(idx)+'@@',new,1)
    s=s.replace('@@BAKE3D@@','/* 滤镜已卸（3d 已停用） */',1)

    # ── 对局地图画的马赛克底图：预反一份再贴 ────────────────────────────
    A_MI = 'function gmMM(){'
    N_MI = '''/* 地图底图要贴「预反色」那一份：这几张画布上的颜色全是按「隔着整页滤镜」
   写的预反值，滤镜烘掉之后，真彩的 locus.png 直接贴上去会亮暗颠倒。
   开局第一次用时经 ctx.filter 反一份存起来，后面一直用它。 */
function gmMI(){
  if(gmMI._c)return gmMI._c;
  if(!(FE&&FE.mi&&FE.mi.width))return null;
  var c=document.createElement('canvas');
  c.width=FE.mi.width;c.height=FE.mi.height;
  var g=c.getContext('2d');
  g.filter='invert(1) hue-rotate(180deg)';
  var im=FE.mi;g.drawImage(im,0,0);   /* 换个写法，免得底下那次批量替换把这一行也卷进去 */
  gmMI._c=c;return c;
}
function gmMM(){'''
    if s.count(A_MI) != 1:
        sys.exit('gmMM 锚点不唯一，停手。')
    s = s.replace(A_MI, N_MI, 1)
    n_mi = s.count('drawImage(FE.mi,')
    if n_mi != 2:
        sys.exit('drawImage(FE.mi 该有 2 处，实际 %d 处，停手。' % n_mi)
    s = s.replace('drawImage(FE.mi,', 'drawImage(gmMI()||FE.mi,')

    # 版号推一格：线上一眼可辨
    s = s.replace('var BUILD=106;', 'var BUILD=109;', 1)

    io.open(DOC, 'w', encoding='utf-8').write(s)
    print('烘焙完成 · 十六进制 %d 处 · rgb() %d 处 · 主文档 %.0f KB'
          % (n_hex, n_rgb, os.path.getsize(DOC)/1024))


if __name__ == '__main__':
    main()
