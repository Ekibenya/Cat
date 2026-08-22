/* ============================================================
   周纪 · 千年天下 —— 天下三维 · 八城游历模块 (zj3d)
   洛邑(周)金顶 + 七国城郭各具国色：秦黑 楚赤 齐紫 燕蓝 韩绿 赵土金 魏青碧
   资产：AncientChina / HistoricChina / HistoricChineseInterior 全量 457 模型
   ============================================================ */
(function () {
  'use strict';
  if (!window.THREE || !window.ZJ_GLTFLoader) return;
  var T = window.THREE;

  var BASE = (function () {
    // locate the runtime dir relative to this script
    var s = document.currentScript && document.currentScript.src;
    if (s) return s.slice(0, s.lastIndexOf('/') + 1);
    return 'core/';
  })();

  /* ---------------- 国色 · palettes ---------------- */
  // ancient texture per state; historic texture per state; sky/ground tint
  var STATES = {
    zhou: { name: '周', city: '洛邑', anc: 'LowpolyChineseBuilding_Texture_03.png', his: 'LowpolyHistoric_Texture_01.png', grass: 0x8fc86a, accent: 0xd8b23a },
    qin:  { name: '秦', city: '咸阳', anc: 'LowpolyChineseBuilding_Texture_04.png', his: 'LowpolyHistoric_Texture_05.png', grass: 0x84b05f, accent: 0x2b2b33 },
    chu:  { name: '楚', city: '郢',   anc: 'LowpolyChineseBuilding_Texture_03.png', his: 'LowpolyHistoric_Texture_03.png', grass: 0x8ed072, accent: 0xa63b26 },
    qi:   { name: '齐', city: '临淄', anc: 'LowpolyChineseBuilding_Texture_01.png', his: 'LowpolyHistoric_Texture_04.png', grass: 0x92c766, accent: 0x6d4a8f },
    yan:  { name: '燕', city: '蓟',   anc: 'LowpolyChineseBuilding_Texture_02.png', his: 'LowpolyHistoric_Texture_02.png', grass: 0x7fb264, accent: 0x33528f },
    han:  { name: '韩', city: '新郑', anc: 'LowpolyChineseBuilding_Texture_05.png', his: 'LowpolyHistoric_Texture_05.png', grass: 0x8ac368, accent: 0x3f7d4e },
    zhao: { name: '赵', city: '邯郸', anc: 'Ancient_Tex_Zhao.png',                  his: 'LowpolyHistoric_Texture_01.png', grass: 0x9bc167, accent: 0xb98a3a },
    wei:  { name: '魏', city: '大梁', anc: 'Ancient_Tex_Wei.png',                   his: 'LowpolyHistoric_Texture_02.png', grass: 0x8fcb74, accent: 0x3a8f86 }
  };
  // 棋盘地点 → 国 + 场景风味
  var LOC2 = {
    '洛邑': { st: 'zhou', flavor: 'luoyi' },
    '咸阳': { st: 'qin', flavor: 'town' }, '函谷关': { st: 'qin', flavor: 'pass' }, '成都': { st: 'qin', flavor: 'town' },
    '邯郸': { st: 'zhao', flavor: 'town' }, '灵寿': { st: 'zhao', flavor: 'town' },
    '蓟': { st: 'yan', flavor: 'town' },
    '临淄': { st: 'qi', flavor: 'town' }, '曲阜': { st: 'qi', flavor: 'town' }, '陶邑': { st: 'qi', flavor: 'town' },
    '大梁': { st: 'wei', flavor: 'water' }, '商丘': { st: 'wei', flavor: 'town' },
    '新郑': { st: 'han', flavor: 'town' },
    '郢': { st: 'chu', flavor: 'water' }, '宛': { st: 'chu', flavor: 'town' }, '姑苏': { st: 'chu', flavor: 'water' }, '会稽': { st: 'chu', flavor: 'water' }
  };

  /* ---------------- module state ---------------- */
  var Z = window.ZJ3D = {
    ready: false, failed: false, loading: false, prog: 0,
    expanded: false, mode: 'city', // city | interior
    cv: null, rnd: null, packs: {}, tex: {}, mats: {},
    scene: null, cam: null, cityKey: '', pending: null,
    player: null, colliders: [], doors: [], exitDoor: null, side: 'zhou',
    interiorFrom: null, keys: {}, joy: { on: false, x: 0, y: 0 },
    camYaw: 0, camPitch: 0.32, camDist: 12, lastLoc: null, night: false,
    chipText: '', eraText: '',
    owns: function () { return this.ready && !this.failed; }
  };
  try { Z.expanded = localStorage.getItem('zj3d_expand') === '1'; } catch (e) { }

  /* ---------------- seeded rng ---------------- */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = hash(seed); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------------- asset loading ---------------- */
  var MANI = [
    ['ancient', 'ancient.glb'], ['historic', 'historic.glb'], ['interior', 'interior.glb']
  ];
  var TEXES = ['LowpolyChineseBuilding_Texture_01.png', 'LowpolyChineseBuilding_Texture_02.png', 'LowpolyChineseBuilding_Texture_03.png', 'LowpolyChineseBuilding_Texture_04.png', 'LowpolyChineseBuilding_Texture_05.png',
    'Ancient_Tex_Zhao.png', 'Ancient_Tex_Wei.png',
    'LowpolyHistoric_Texture_01.png', 'LowpolyHistoric_Texture_02.png', 'LowpolyHistoric_Texture_03.png', 'LowpolyHistoric_Texture_04.png', 'LowpolyHistoric_Texture_05.png',
    'LowpolyHistoric_Sculpture_01.png',
    'LowpolyHistoricInterior_Texture_01.png', 'LowpolyHistoricInterior_Texture_02.png', 'LowpolyHistoricInterior_Texture_03.png'];

  /* 资材包：单文件容器（滚动异或编码），解出各 GLB 与贴图字节 */
  function unpack(ab) {
    var K = 'ZhouJiQianNianTianXia';
    var u = new Uint8Array(ab);
    for (var i = 0; i < u.length; i++) u[i] ^= (K.charCodeAt(i % K.length) + ((i * 7) & 0xff)) & 0xff;
    if (u[0] !== 90 || u[1] !== 74 || u[2] !== 80 || u[3] !== 49) throw new Error('bad pack'); // 'ZJP1'
    var dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
    var n = dv.getUint32(4, true), off = 8, metas = [];
    var dec = new TextDecoder();
    for (var j = 0; j < n; j++) {
      var nl = dv.getUint16(off, true); off += 2;
      var name = dec.decode(u.subarray(off, off + nl)); off += nl;
      var len = dv.getUint32(off, true); off += 4;
      metas.push([name, len]);
    }
    var out = {};
    metas.forEach(function (m) { out[m[0]] = u.subarray(off, off + m[1]); off += m[1]; });
    return out;
  }
  /* 棋子小包：与地中海引擎共用同一份（pawn.glb + pawn.json + 调色板贴图）。
     失败不致命——取不到骨架就仍旧用本引擎自己的火柴人。 */
  var PAWN_PACK = 'core/res/data/idx/v1/ceb0dfcfec.dat?v=1';
  function loadPawnPack(loader, texLoader) {
    return fetch(PAWN_PACK).then(function (r) {
      if (!r.ok) throw new Error('pawn pack http ' + r.status);
      return r.arrayBuffer();
    }).then(function (ab) {
      var pk = unpack(ab);
      try { Z.pawnRig = JSON.parse(new TextDecoder().decode(pk['pawn.json'])); } catch (e) { }
      var js = [new Promise(function (res, rej) {
        loader.parse(pk['pawn.glb'].slice().buffer, '', res, rej);
      }).then(function (g) {
        var lib = {};
        g.scene.children.forEach(function (n) { if (n.name) lib[n.name] = n; });
        Z.packs.pawn = { root: g.scene, lib: lib, names: Object.keys(lib) };
      })];
      if (pk['tex/pawnpal.png']) {
        var url = URL.createObjectURL(new Blob([pk['tex/pawnpal.png']], { type: 'image/png' }));
        js.push(texLoader.loadAsync(url).then(function (tx) {
          URL.revokeObjectURL(url);
          tx.colorSpace = T.SRGBColorSpace; tx.flipY = false;
          Z.tex['pawnpal.png'] = tx;
        }));
      }
      return Promise.all(js);
    }).catch(function (e) { console.warn('pawn pack failed', e); });
  }
  function loadAll() {
    if (Z.loading || Z.ready || Z.failed) return;
    Z.loading = true;
    var loader = new window.ZJ_GLTFLoader();
    if (window.ZJ_MeshoptDecoder) loader.setMeshoptDecoder(window.ZJ_MeshoptDecoder);
    var texLoader = new T.TextureLoader();
    var done = 0, total = MANI.length + TEXES.length + 1;
    function tick() { done++; Z.prog = done / total; updateHud(); }
    fetch('core/res/data/idx/v1/df6d172d82.dat').then(function (r) {
      if (!r.ok) throw new Error('pack http ' + r.status);
      return r.arrayBuffer();
    }).then(function (ab) {
      var pk = unpack(ab); tick();
      var jobs = [];
      MANI.forEach(function (m) {
        /* 包里没有这一项就跳过：代码与资材包若因缓存错配（旧代码新包），
           这里硬取会整个引擎起不来，宁可少一套模型也不能全崩 */
        if (!pk[m[1]]) { console.warn('pack entry missing', m[1]); tick(); return; }
        jobs.push(new Promise(function (res, rej) {
          loader.parse(pk[m[1]].slice().buffer, '', res, rej);
        }).then(function (g) {
          var lib = {};
          g.scene.children.forEach(function (n) { if (n.name) lib[n.name] = n; });
          Z.packs[m[0]] = { root: g.scene, lib: lib, names: Object.keys(lib) };
          tick();
        }));
      });
      TEXES.forEach(function (t) {
        if (!pk['tex/' + t]) { console.warn('pack tex missing', t); tick(); return; }
        var url = URL.createObjectURL(new Blob([pk['tex/' + t]], { type: 'image/png' }));
        jobs.push(texLoader.loadAsync(url).then(function (tx) {
          URL.revokeObjectURL(url);
          tx.colorSpace = T.SRGBColorSpace; tx.flipY = false;
          Z.tex[t] = tx; tick();
        }));
      });
      jobs.push(loadPawnPack(loader, texLoader));
      return Promise.all(jobs);
    }).then(function () {
      Z.ready = true; Z.loading = false;
      if (Z.pending) { var p = Z.pending; Z.pending = null; showLocation(p[0], p[1]); }
      /* 加载期间到达的那一幕在这里补放，别让开局的剧情感知整个丢掉 */
      if (Z.pendStory) { var ps = Z.pendStory; Z.pendStory = null; try { Z.onStory(ps); } catch (e) { } }
      if (window.ZJ3D_onExpand) window.ZJ3D_onExpand(); // re-render app so the pane hands over to 3D
    }).catch(function (e) {
      console.warn('zj3d assets failed', e); Z.failed = true; Z.loading = false; updateHud();
    });
  }

  function matFor(texName) {
    if (Z.mats[texName]) return Z.mats[texName];
    var m = new T.MeshLambertMaterial({ map: Z.tex[texName] });
    Z.mats[texName] = m; return m;
  }

  /* template info cache: bbox size + ground offset */
  var tinfo = {};
  function info(pack, name) {
    var k = pack + '/' + name;
    if (tinfo[k]) return tinfo[k];
    var n = Z.packs[pack].lib[name];
    if (!n) { console.warn('missing model', k); return null; }
    var bb = new T.Box3().setFromObject(n);
    var s = new T.Vector3(), c = new T.Vector3(); bb.getSize(s); bb.getCenter(c);
    return tinfo[k] = { size: s, center: c, minY: bb.min.y, name: name, pack: pack };
  }

  var USED = { ancient: {}, historic: {}, interior: {} };
  function spawn(pack, name, texName, opts) {
    opts = opts || {};
    var lib = Z.packs[pack].lib;
    var tpl = lib[name];
    if (!tpl) { console.warn('no model', pack, name); return null; }
    var seq = 0;
    if (Z.inRecipe) {
      seq = ++Z.spawnSeq;
      if (razedOf(Z.cityKey).indexOf(seq) >= 0) return null; // 已被拆毁：不再落成
    }
    USED[pack][name] = 1;
    var inf = info(pack, name);
    var o = tpl.clone(true);
    var mat = matFor(texName);
    o.traverse(function (ch) { if (ch.isMesh) { ch.material = mat; ch.castShadow = !!opts.shadow; ch.receiveShadow = true; } });
    var g = new T.Group();
    g.add(o);
    o.position.y = -inf.minY; // pivot to ground
    g.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    g.rotation.y = opts.ry || 0;
    if (opts.s) g.scale.setScalar(opts.s);
    g.userData.model = pack + '/' + name;
    Z.scene.add(g);
    if (opts.solid !== false && inf.size.x * inf.size.z > 2.2) {
      var sc = opts.s || 1;
      var hw = inf.size.x / 2 * sc * (opts.shrink || 0.86), hd = inf.size.z / 2 * sc * (opts.shrink || 0.86);
      Z.colliders.push({ x: g.position.x + (inf.center.x - 0) * 0, z: g.position.z, hw: hw, hd: hd, ry: opts.ry || 0, cx: inf.center.x * sc, cz: inf.center.z * sc, seq: seq || undefined });
    }
    if (seq) { g.userData.spawnSeq = seq; Z.cityRoots.push(g); }
    if (opts.door) {
      var dr = opts.door, ang = (opts.ry || 0) + (dr.side || 0);
      var dist = dr.dist != null ? dr.dist : (inf.size.z / 2 + 1.2);
      Z.doors.push({
        x: g.position.x + Math.sin(ang) * dist, z: g.position.z + Math.cos(ang) * dist,
        label: dr.label || name, interior: dr.interior, city: Z.cityKey, seq: seq || undefined, bid: opts.bid
      });
    } else if (opts.autodoor !== false && (pack === 'ancient' || pack === 'historic')
      && name.indexOf('_Env_') < 0 && !/bridge|fence|wall|sculpture|statue|monument|lantern|well_|column|pillar|plaque/i.test(name)
      && inf.size.y > 2.6 && inf.size.x * inf.size.z > 9 && Math.min(inf.size.x, inf.size.z) > 2.2) {
      // 万屋皆可入：凡成屋之形者自动开门于正面、出碰撞体一步
      var angA = (opts.ry || 0);
      var distA = inf.size.z / 2 * (opts.s || 1) + 1.5;
      Z.doors.push({
        x: g.position.x + Math.sin(angA) * distA, z: g.position.z + Math.cos(angA) * distA,
        label: dispName(pack, name), interior: pickInteriorKind(pack, name, inf), city: Z.cityKey,
        seq: seq || undefined, bid: opts.bid, auto: true
      });
    }
    return g;
  }
  /* 依名与体量为建筑指派室内格局（确定性） */
  function pickInteriorKind(pack, name, inf) {
    var n = name.toLowerCase(), area = inf.size.x * inf.size.z;
    if (/inn|restaurant|tavern|hotel|teahouse/.test(n)) return 'inn';
    if (/shop|store|stall|market|book/.test(n)) return 'shop';
    if (/palace|temple|pavilion|tower/.test(n) || area > 130) return hash(name) % 2 ? 'throne' : 'hall';
    if (area > 60) return ['hall', 'study', 'inn', 'storeroom'][hash(name + 'k') % 4];
    return ['home', 'shop', 'home', 'study', 'bedroom'][hash(name + 'k') % 5];
  }

  /* ---------------- procedural nature kit ---------------- */
  function lambx(c) { return new T.MeshLambertMaterial({ color: c }); }
  /* 自然物（树竹花石等）注册：城内按 natSeq、旷野分块按 chunk 键持久可拆 */
  Z.natureRoots = []; Z.natSeq = 0; Z.chunkCtx = null; Z.chunkN = 0;
  function natReg(root, disp) {
    if (!root) return root;
    root.userData.natDisp = disp;
    var id = null;
    if (Z.inRecipe) id = 'n' + (++Z.natSeq);
    else if (Z.chunkCtx) id = 'c' + Z.chunkCtx + '#' + (++Z.chunkN);
    if (!id) return root;
    try {
      if (razedOf(Z.cityKey).indexOf(id) >= 0) { if (root.parent) root.parent.remove(root); return null; }
    } catch (e) { }
    root.userData.natId = id;
    Z.natureRoots.push(root);
    return root;
  }
  var NM = {};
  function nmat(c) { return NM[c] || (NM[c] = lambx(c)); }
  var PERF = { low: false };
  try { PERF.low = localStorage.getItem('zj3d_lowfx') === '1'; } catch (e) { }
  function perfSave() { try { localStorage.setItem('zj3d_lowfx', PERF.low ? '1' : '0'); } catch (e) { } }
  function applyPerf() {
    if (!Z.rnd) return;
    var pr = isTouch() ? (PERF.low ? 1.25 : 1.5) : 2;
    Z.rnd.setPixelRatio(Math.min(pr, window.devicePixelRatio || 1));
    var sh = !(isTouch() && PERF.low);
    if (Z.rnd.shadowMap.enabled !== sh) {
      Z.rnd.shadowMap.enabled = sh;
      if (Z.scene) Z.scene.traverse(function (o) { if (o.isMesh && o.material) o.material.needsUpdate = true; });
    }
  }
  function LOD() { return (matchMedia('(pointer:coarse)').matches) ? (PERF.low ? 0.4 : 0.55) : 1; }

  // smooth polyline via midpoint quadratic curves
  function drawSmooth(x, pts, u) {
    x.beginPath();
    x.moveTo(u(pts[0][0]), u(pts[0][1]));
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2, mz = (pts[i][1] + pts[i + 1][1]) / 2;
      x.quadraticCurveTo(u(pts[i][0]), u(pts[i][1]), u(mx), u(mz));
    }
    var l = pts[pts.length - 1];
    x.lineTo(u(l[0]), u(l[1]));
    x.stroke();
  }

  function groundTex(st, R, paths, plazas, water) {
    var c = document.createElement('canvas'); c.width = c.height = 1024;
    var x = c.getContext('2d');
    var g = new T.Color(st.grass);
    x.fillStyle = '#' + g.getHexString(); x.fillRect(0, 0, 1024, 1024);
    var rr = rng('ground' + st.name);
    // macro mottling: big soft patches
    for (var i = 0; i < 260; i++) {
      var gx = rr() * 1024, gy = rr() * 1024, rad = 24 + rr() * 70;
      var cc = g.clone().offsetHSL((rr() - .5) * 0.035, (rr() - .5) * 0.06, (rr() - .5) * 0.10);
      x.fillStyle = '#' + cc.getHexString(); x.globalAlpha = 0.30;
      x.beginPath(); x.arc(gx, gy, rad, 0, 7); x.fill();
    }
    // 枯草黄斑与泥土露地：城郊草皮不再一色
    var dry0 = g.clone().offsetHSL(-0.07, -0.18, 0.07);
    for (var d0 = 0; d0 < 60; d0++) {
      var dc0 = dry0.clone().offsetHSL((rr() - .5) * 0.02, 0, (rr() - .5) * 0.08);
      x.fillStyle = '#' + dc0.getHexString(); x.globalAlpha = 0.12 + rr() * 0.12;
      x.beginPath(); x.arc(rr() * 1024, rr() * 1024, 12 + rr() * 34, 0, 7); x.fill();
    }
    var mud0 = g.clone().lerp(new T.Color(0x8f7952), 0.7);
    for (var m0 = 0; m0 < 30; m0++) {
      var mc0 = mud0.clone().offsetHSL(0, (rr() - .5) * 0.06, (rr() - .5) * 0.08);
      x.fillStyle = '#' + mc0.getHexString(); x.globalAlpha = 0.12 + rr() * 0.12;
      x.beginPath(); x.arc(rr() * 1024, rr() * 1024, 7 + rr() * 16, 0, 7); x.fill();
    }
    // fine speckle
    for (var i2 = 0; i2 < 500; i2++) {
      var cc2 = g.clone().offsetHSL(0, 0.03, (rr() - .5) * 0.16);
      x.fillStyle = '#' + cc2.getHexString(); x.globalAlpha = 0.35;
      x.beginPath(); x.arc(rr() * 1024, rr() * 1024, 2 + rr() * 7, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    function u(v) { return (v / R + 1) * 512; }
    function uw(v) { return v / R * 512; } // width scalar
    // sand paths: dark under-stroke then light core (soft edge illusion)
    x.lineCap = 'round'; x.lineJoin = 'round';
    paths.forEach(function (p) {
      x.strokeStyle = '#c3ab7d'; x.lineWidth = uw(p.w);
      drawSmooth(x, p.pts, u);
      x.strokeStyle = '#dbc79b'; x.lineWidth = uw(p.w * 0.72);
      drawSmooth(x, p.pts, u);
    });
    (plazas || []).forEach(function (p) {
      if (p.stone) {
        // stone-tiled plaza with grout lines
        x.save();
        x.beginPath();
        if (p.rect) x.rect(u(p.x - p.rx), u(p.z - p.rz), uw(p.rx * 2), uw(p.rz * 2));
        else x.ellipse(u(p.x), u(p.z), uw(p.rx), uw(p.rz), 0, 0, 7);
        x.clip();
        x.fillStyle = '#b6b1a6'; x.fillRect(0, 0, 1024, 1024);
        x.strokeStyle = '#a09a8f'; x.lineWidth = 1.4;
        var step = uw(2.3);
        for (var gx2 = u(p.x - p.rx); gx2 < u(p.x + p.rx); gx2 += step) { x.beginPath(); x.moveTo(gx2, u(p.z - p.rz)); x.lineTo(gx2, u(p.z + p.rz)); x.stroke(); }
        for (var gz2 = u(p.z - p.rz); gz2 < u(p.z + p.rz); gz2 += step) { x.beginPath(); x.moveTo(u(p.x - p.rx), gz2); x.lineTo(u(p.x + p.rx), gz2); x.stroke(); }
        x.restore();
      } else {
        x.fillStyle = p.c || '#dbc79b'; x.beginPath();
        x.ellipse(u(p.x), u(p.z), uw(p.rx), uw(p.rz), 0, 0, 7); x.fill();
      }
    });
    (water || []).forEach(function (w) {
      x.fillStyle = '#c9b98d'; x.beginPath();
      x.ellipse(u(w.x), u(w.z), uw(w.rx + 1.8), uw(w.rz + 1.8), 0, 0, 7); x.fill();
    });
    var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace;
    return tx;
  }

  function addGround(st, R, paths, plazas, water) {
    Z.grassC = st.grass; // 山脚草坡取当前国色，与地面无缝衔接
    var m = new T.Mesh(new T.PlaneGeometry(R * 2, R * 2), new T.MeshLambertMaterial({ map: groundTex(st, R, paths, plazas || [], water || []) }));
    m.rotation.x = -Math.PI / 2; m.receiveShadow = true; Z.scene.add(m);
    return m;
  }

  /* 山：多面棱峰（角向谐波折棱 + 逐面明暗 + 不规则雪线），沿山脊排成岭 */
  var ROCKC = [0x969ca6, 0x8b919c, 0xa2a8b2, 0x848a95];
  var MTN_MAT = null;
  function mtnMat() { return MTN_MAT || (MTN_MAT = new T.MeshLambertMaterial({ vertexColors: true })); }
  function mtnMesh(pw, ph, seed, rockC, snow, gLo, gHi) {
    // gLo/gHi：草坡带（面心高度比）——之下全草、之间草岩驳杂、之上纯岩
    // 主峰默认不披草（山脚过渡交给岩席/山肩/草丘），仅显式传入时着草
    if (gLo === undefined) gLo = -2;
    if (gHi === undefined) gHi = -1;
    var rs = 8 + (hash(seed + 'rs') % 3); // 8~10 棱 × 4 环
    var geo = new T.ConeGeometry(pw, ph, rs, 4, true).toNonIndexed();
    var pos = geo.attributes.position;
    // 角向谐波：决定山棱与山坳的走向（低次大起伏 + 高次碎棱）
    var h1 = 2 + (hash(seed + 'h1') % 3), h2 = 4 + (hash(seed + 'h2') % 3);
    var p1 = (hash(seed + 'p1') % 628) / 100, p2 = (hash(seed + 'p2') % 628) / 100;
    var a1 = 0.15 + (hash(seed + 'a1') % 18) / 100;
    var a2 = 0.08 + (hash(seed + 'a2') % 13) / 100;
    var apx = ((hash(seed + 'ax') % 100) / 100 - 0.5) * pw * 0.55;
    var apz = ((hash(seed + 'az') % 100) / 100 - 0.5) * pw * 0.55;
    var i;
    for (i = 0; i < pos.count; i++) {
      var vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
      var rr = Math.hypot(vx, vz);
      var t = (vy + ph / 2) / ph; // 0 山脚 → 1 峰顶
      if (rr < 1e-4) { if (vy > 0) { pos.setX(i, vx + apx); pos.setZ(i, vz + apz); } continue; }
      var th = Math.atan2(vx, vz);
      // 逐格噪声按（环号,棱号）取键，接缝两侧同键不裂
      var ring = Math.round(t * 4);
      var ai = Math.round(((th + Math.PI) / 6.2832) * rs) % rs;
      var cn = (hash(seed + 'c' + ring + '_' + ai) % 100) / 100 - 0.5;
      var f = 1 + a1 * Math.sin(h1 * th + p1) + a2 * Math.sin(h2 * th + p2) + cn * 0.42 * (1.05 - t * 0.55);
      f *= 1 + 0.34 * (1 - t) * (1 - t) - 0.08 * (1 - t); // 底缓顶陡的凹弧山形，山脚外张
      if (f < 0.42) f = 0.42;
      pos.setX(i, vx * f); pos.setZ(i, vz * f);
      if (t > 0.04 && t < 0.97) pos.setY(i, vy + cn * ph * 0.09 * (1 - t * 0.6));
      if (t > 0.5) { var k = (t - 0.5) * 1.6; pos.setX(i, pos.getX(i) + apx * k); pos.setZ(i, pos.getZ(i) + apz * k); } // 上部随峰尖偏斜
    }
    geo.computeVertexNormals();
    // 逐面着色：山脚草坡 → 草岩驳杂 → 岩面明暗错落 → 不规则雪线
    var n = pos.count, col = new Float32Array(n * 3);
    var rc = new T.Color(rockC), sc = new T.Color(0xe9edf4), c0 = new T.Color();
    var gc = new T.Color(Z.grassC || 0x8fc86a), _gc0 = new T.Color();
    var snowT = snow ? 0.52 + (hash(seed + 'sl') % 14) / 100 : 2;
    for (i = 0; i < n; i += 3) {
      var ty = ((pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3 + ph / 2) / ph;
      var fj = (hash(seed + 'f' + i) % 100) / 100;
      if (ty > snowT + (fj - 0.5) * 0.13) c0.copy(sc).multiplyScalar(0.93 + fj * 0.07);
      else {
        c0.copy(rc).multiplyScalar((0.78 + fj * 0.34) * (0.86 + ty * 0.2));
        var mix = (gHi - ty) / (gHi - gLo) + (fj - 0.5) * 0.4; // 草→岩渐次，带逐面抖动成驳杂带
        if (mix > 0) c0.lerp(_gc0.copy(gc).multiplyScalar(0.88 + fj * 0.24), Math.min(1, mix));
      }
      for (var j = 0; j < 3; j++) { col[(i + j) * 3] = c0.r; col[(i + j) * 3 + 1] = c0.g; col[(i + j) * 3 + 2] = c0.b; }
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3));
    return new T.Mesh(geo, mtnMat());
  }
  function mountainGroup(w, h, seed) {
    var r = rng('mt' + seed);
    var g = new T.Group();
    var peaks = 2 + (hash(seed + 'p') % 3); // 主峰 + 2~4 侧峰
    var ridgeA = r() * 6.28, dx = Math.sin(ridgeA), dz = Math.cos(ridgeA);
    for (var p = 0; p <= peaks; p++) {
      var pw = w * (p === 0 ? 1 : 0.42 + r() * 0.36), ph = h * (p === 0 ? 1 : 0.36 + r() * 0.45);
      var m = mtnMesh(pw, ph, seed + 'k' + p, ROCKC[hash(seed + p) % 4], ph > 26);
      var along = p === 0 ? 0 : (p % 2 ? 1 : -1) * (0.5 + r() * 0.55) * w; // 沿脊两侧列峰
      m.position.set(dx * along + (r() - 0.5) * w * 0.35, ph / 2 - 1.2, dz * along + (r() - 0.5) * w * 0.35);
      m.rotation.y = ridgeA + (r() - 0.5) * 0.9;
      m.scale.set(1, 1, 0.68 + r() * 0.42); // 顺脊压扁，成岭不成锥
      g.add(m);
    }
    // 岩席：贴地薄岩，灰岩自山根一直漫进草原
    var sheets = 3 + (hash(seed + 'st') % 2);
    for (var q3 = 0; q3 < sheets; q3++) {
      var ba = (q3 / sheets) * 6.28 + r() * 0.9;
      var bw = w * (0.7 + r() * 0.5), bh = 1.1 + r() * 1.5;
      var mb = mtnMesh(bw, bh, seed + 't' + q3, ROCKC[hash(seed + 'tc' + q3) % 4], false, -2, -1);
      mb.position.set(Math.sin(ba) * w * (0.4 + r() * 0.35), bh / 2 - 0.45 + q3 * 0.04, Math.cos(ba) * w * (0.4 + r() * 0.35));
      mb.rotation.y = r() * 6.28;
      mb.scale.set(1, 1, 0.55 + r() * 0.5);
      g.add(mb);
    }
    // 山肩岩坡：山体自身摊入平地——半数是裸岩山趾直接压进草原，半数披草渐没
    var should = 2 + (hash(seed + 'sh') % 2);
    for (var q2 = 0; q2 < should; q2++) {
      var sa2 = (q2 / should) * 6.28 + r() * 1.2;
      var sw = w * (0.85 + r() * 0.45), sh2 = h * (0.06 + r() * 0.09);
      var rocky = q2 % 2 === 0;
      var ms = mtnMesh(sw, sh2, seed + 's' + q2, ROCKC[hash(seed + 'sc2' + q2) % 4], false,
        rocky ? -2 : 0.3, rocky ? -1 : 0.85);
      ms.position.set(Math.sin(sa2) * w * (0.35 + r() * 0.3), sh2 / 2 - 0.9 + 0.02 + q2 * 0.04, Math.cos(sa2) * w * (0.35 + r() * 0.3));
      ms.rotation.y = r() * 6.28;
      ms.scale.set(1, 1, 0.6 + r() * 0.5);
      g.add(ms);
    }
    // 山前草丘：低缓绿坡围裙，接住草地与岩体的落差
    var mounds = 1 + (hash(seed + 'md') % 2);
    for (var q = 0; q < mounds; q++) {
      var qa = r() * 6.28;
      var qw = w * (0.55 + r() * 0.6), qh = h * (0.09 + r() * 0.09);
      var mq = mtnMesh(qw, qh, seed + 'q' + q, ROCKC[hash(seed + 'qc' + q) % 4], false, 0.7, 1.35);
      mq.position.set(Math.sin(qa) * w * (0.6 + r() * 0.4), qh / 2 - 1.2 + q * 0.03, Math.cos(qa) * w * (0.6 + r() * 0.4));
      mq.rotation.y = r() * 6.28;
      mq.scale.set(1, 1, 0.62 + r() * 0.5);
      g.add(mq);
    }
    return g;
  }
  function mountain(x, z, w, h, seed) {
    var g = mountainGroup(w, h, seed + x + z);
    g.position.set(x, 0, z);
    Z.scene.add(g);
    (Z.mtnSpots = Z.mtnSpots || []).push({ x: x, z: z, w: w }); // 供地块绘制山根砾石裙
  }
  function mountainRing(R, seed, gaps) {
    var r = rng('ring' + seed);
    for (var a = 0; a < 360; a += 34 + r() * 30) {
      var rad = a * Math.PI / 180, skip = false;
      (gaps || []).forEach(function (gp) { var d = Math.abs(((a - gp + 540) % 360) - 180); if (d < 22) skip = true; });
      if (skip) continue;
      var dist = R * (1.18 + r() * 0.42); // 外推山环，山裙不再吞没城缘建筑
      mountain(Math.sin(rad) * dist, Math.cos(rad) * dist, 16 + r() * 24, 26 + r() * 34, seed + a);
    }
  }
  /* 岩石台地（图4：山腰要塞的基座） */
  function rockTerrace(x, z, w, d, tiers, tierH, seed) {
    var r = rng('rt' + seed);
    for (var i = 0; i < tiers; i++) {
      var tw = w - i * (w * 0.22), td = d - i * (d * 0.22);
      var geo = new T.BoxGeometry(tw, tierH, td, 3, 1, 3);
      var pos = geo.attributes.position;
      for (var v = 0; v < pos.count; v++) {
        if (Math.abs(pos.getX(v)) > tw * 0.49 || Math.abs(pos.getZ(v)) > td * 0.49) {
          pos.setX(v, pos.getX(v) + (r() - .5) * 0.5);
          pos.setZ(v, pos.getZ(v) + (r() - .5) * 0.5);
        }
      }
      geo.computeVertexNormals();
      var m = new T.Mesh(geo, nmat(ROCKC[(i + hash(seed)) % 4]));
      m.position.set(x, tierH / 2 + i * tierH, z);
      m.receiveShadow = true; m.castShadow = true;
      Z.scene.add(m);
    }
    Z.colliders.push({ x: x, z: z, hw: w / 2, hd: d / 2, ry: 0, cx: 0, cz: 0 });
    return tiers * tierH;
  }

  /* 树：茂密多球树冠 */
  var TREECOL = {
    green: [0x5fa04e, 0x6fb054, 0x549a48, 0x7cbb5d],
    pink: [0xeeaccb, 0xe59cc0, 0xf5bdd6, 0xe8a8c8],
    autumn: [0xdd8f34, 0xcc6a2e, 0xe6ab3f, 0xd47a30],
    red: [0xc85a50, 0xb84a46, 0xd06a54],
    pine: [0x3e7e48, 0x357040, 0x468852]
  };
  function tree(x, z, kind, seed) {
    var r = rng('tr' + seed + x + z), g = new T.Group();
    var cols = TREECOL[kind || 'green'];
    var th = 1.2 + r() * 1.1;
    var trunk = new T.Mesh(new T.CylinderGeometry(0.18, 0.3, th, 5), nmat(0x6c4b2f));
    trunk.position.y = th / 2; trunk.castShadow = true; g.add(trunk);
    if (kind === 'pine') {
      for (var i = 0; i < 3; i++) {
        var cone = new T.Mesh(new T.ConeGeometry(1.15 - i * 0.3, 1.35, 7), nmat(cols[i % cols.length]));
        cone.position.y = th + 0.4 + i * 0.85; cone.castShadow = true; g.add(cone);
      }
    } else {
      var blobs = 3 + (hash(seed + 'b' + x) % 3);
      for (var b = 0; b < blobs; b++) {
        var br = 0.8 + r() * 0.6;
        var blob = new T.Mesh(new T.IcosahedronGeometry(br, 0), nmat(cols[(b + hash(seed)) % cols.length]));
        blob.position.set((r() - .5) * 1.3, th + 0.5 + r() * 1.3, (r() - .5) * 1.3);
        blob.rotation.set(r() * 3, r() * 3, r() * 3);
        blob.castShadow = true; g.add(blob);
      }
      var top = new T.Mesh(new T.IcosahedronGeometry(0.55 + r() * 0.3, 0), nmat(cols[0]));
      top.position.set(0, th + 1.7 + r() * 0.5, 0); top.castShadow = true; g.add(top);
    }
    g.position.set(x, 0, z); g.rotation.y = r() * 6.28;
    g.scale.setScalar(0.85 + r() * 0.75);
    Z.scene.add(g);
    return natReg(g, { green: '常青树', pink: '樱树', autumn: '金枫', red: '红枫', pine: '苍松' }[kind || 'green'] || '树木');
  }
  function treeCluster(x, z, kinds, seed) {
    var r = rng('tc' + seed);
    var n = 2 + (hash(seed + 'n') % 3);
    for (var i = 0; i < n; i++) {
      tree(x + (r() - .5) * 6, z + (r() - .5) * 6, kinds[Math.floor(r() * kinds.length)], seed + i);
    }
  }
  /* 竹丛（图2：贴山根的密竹） */
  function bambooGrove(x, z, seed, big) {
    var r = rng('bb' + seed + x + z), g = new T.Group();
    var n = (big ? 10 : 6) + (hash(seed + 'c' + x) % 7);
    var stalkC = [0x4e9e50, 0x5da957, 0x449447, 0x63b258];
    for (var i = 0; i < n; i++) {
      var h = 3.6 + r() * 3.2;
      var sx = (r() - .5) * (big ? 3.4 : 2.2), sz = (r() - .5) * (big ? 3.4 : 2.2);
      var st2 = new T.Mesh(new T.CylinderGeometry(0.055, 0.085, h, 4), nmat(stalkC[i % 4]));
      st2.position.set(sx, h / 2, sz);
      st2.rotation.z = (r() - .5) * 0.14; st2.rotation.x = (r() - .5) * 0.14;
      st2.castShadow = true; g.add(st2);
      for (var L = 0; L < 2; L++) {
        var lv = new T.Mesh(new T.IcosahedronGeometry(0.34 + r() * 0.28, 0), nmat(stalkC[(i + 1 + L) % 4]));
        lv.scale.set(1, 1.7, 1);
        lv.position.set(sx + (r() - .5) * 0.7, h * (0.62 + L * 0.25), sz + (r() - .5) * 0.7);
        g.add(lv);
      }
    }
    g.position.set(x, 0, z); Z.scene.add(g); return natReg(g, '竹丛');
  }
  function rock(x, z, s, seed) {
    var m = new T.Mesh(new T.IcosahedronGeometry(s, 0), nmat(ROCKC[hash(seed + 'r') % 4]));
    var r = rng('rk' + seed + x);
    m.position.set(x, s * 0.3, z); m.rotation.set(r() * 3, r() * 3, r() * 3);
    m.scale.set(1, 0.55 + r() * 0.45, 0.8 + r() * 0.4);
    m.castShadow = true; Z.scene.add(m); return natReg(m, '岩石');
  }
  /* 露岩：平野上破土而出的基岩，坡脚碎砾环伺 */
  function jiashan(x, z, seed) {
    var r = rng('js' + seed), g = new T.Group();
    var n = 1 + (hash(seed + 'n') % 2);
    for (var i = 0; i < n; i++) {
      var pw = 2.6 + r() * 3, ph = 3.2 + r() * 4.6;
      var m = mtnMesh(pw, ph, seed + 'j' + i, ROCKC[hash(seed + i) % 4], ph > 6.4);
      m.position.set((r() - .5) * 3, ph / 2, (r() - .5) * 3);
      m.rotation.y = r() * 6.28;
      m.castShadow = true;
      g.add(m);
    }
    for (var b = 0; b < 3; b++) {
      var bs = 0.3 + r() * 0.55;
      var bx = new T.Mesh(new T.IcosahedronGeometry(bs, 0), nmat(ROCKC[hash(seed + 'q' + b) % 4]));
      bx.position.set((r() - .5) * 6, bs * 0.35, (r() - .5) * 6);
      bx.rotation.set(r() * 3, r() * 3, r() * 3);
      g.add(bx);
    }
    g.position.set(x, 0, z); Z.scene.add(g);
    return natReg(g, '假山');
  }
  function outcrop(x, z, seed) {
    var r = rng('oc' + seed);
    var g = new T.Group();
    var n = 1 + (hash(seed + 'n') % 2);
    for (var i = 0; i < n; i++) {
      var pw = 2 + r() * 3.2, ph = 1 + r() * 2.2;
      var m = mtnMesh(pw, ph, seed + 'o' + i, ROCKC[hash(seed + i) % 4], false, -2, -1);
      m.position.set((r() - .5) * 3.5, ph / 2 - 0.5, (r() - .5) * 3.5);
      m.rotation.y = r() * 6.28;
      m.scale.set(1, 0.62 + r() * 0.5, 0.66 + r() * 0.5);
      m.castShadow = true;
      g.add(m);
    }
    var nb = 2 + (hash(seed + 'b') % 3);
    for (var b = 0; b < nb; b++) {
      var s = 0.28 + r() * 0.6;
      var bx = new T.Mesh(new T.IcosahedronGeometry(s, 0), nmat(ROCKC[hash(seed + 'bc' + b) % 4]));
      bx.position.set((r() - .5) * 7, s * 0.32, (r() - .5) * 7);
      bx.rotation.set(r() * 3, r() * 3, r() * 3);
      bx.scale.set(1, 0.6 + r() * 0.4, 0.85 + r() * 0.3);
      g.add(bx);
    }
    g.position.set(x, 0, z);
    Z.scene.add(g);
    return natReg(g, '露岩');
  }
  function rockCluster(x, z, seed) {
    var r = rng('rc' + seed);
    var n = 2 + (hash(seed + 'n') % 3);
    var g = new T.Group();
    for (var i = 0; i < n; i++) {
      var s = 0.45 + r() * 1.3;
      var rx = x + (r() - .5) * 3, rz = z + (r() - .5) * 3;
      var m = new T.Mesh(new T.IcosahedronGeometry(s, 0), nmat(ROCKC[hash(seed + 'r' + i) % 4]));
      m.position.set(rx, s * 0.3, rz); m.rotation.set(r() * 3, r() * 3, r() * 3);
      m.scale.set(1, 0.55 + r() * 0.45, 0.8 + r() * 0.4); m.castShadow = true;
      g.add(m);
      if (r() > 0.6) { var moss = new T.Mesh(new T.IcosahedronGeometry(s * 0.4, 0), nmat(0x6fae57)); moss.position.set(rx, s * 0.62, rz); g.add(moss); }
    }
    Z.scene.add(g);
    return natReg(g, '岩组');
  }
  /* 花圃（图5：紫鸢尾/橙黄花丛） */
  var FLOWERC = [0x9a6ec8, 0xe8874a, 0xe8c84a, 0xe8a8c8, 0xd85a6a, 0x8a7ed8];
  function flowerPatch(x, z, seed) {
    var r = rng('fl' + seed + x), g = new T.Group();
    var n = 5 + (hash(seed + 'f') % 5);
    for (var i = 0; i < n; i++) {
      var fx = (r() - .5) * 1.8, fz = (r() - .5) * 1.8, fh = 0.3 + r() * 0.4;
      var stem = new T.Mesh(new T.CylinderGeometry(0.02, 0.03, fh, 3), nmat(0x5b9e4a));
      stem.position.set(fx, fh / 2, fz); g.add(stem);
      var head = new T.Mesh(new T.IcosahedronGeometry(0.09 + r() * 0.05, 0), nmat(FLOWERC[(i + hash(seed)) % 6]));
      head.position.set(fx, fh + 0.06, fz); g.add(head);
    }
    var leaf = new T.Mesh(new T.ConeGeometry(0.3, 0.5, 4), nmat(0x6fae57));
    leaf.scale.set(1, 0.6, 0.4); leaf.position.set(0, 0.14, 0); g.add(leaf);
    g.position.set(x, 0, z); Z.scene.add(g); return natReg(g, '花圃');
  }
  /* 芦苇 / 香蒲 */
  function reeds(x, z, seed) {
    var r = rng('rd' + seed + x), g = new T.Group();
    var n = 6 + (hash(seed + 'r') % 6);
    for (var i = 0; i < n; i++) {
      var rx2 = (r() - .5) * 1.6, rz2 = (r() - .5) * 1.6, rh = 1.2 + r() * 1.1;
      var st3 = new T.Mesh(new T.CylinderGeometry(0.025, 0.04, rh, 3), nmat(0x6da65a));
      st3.position.set(rx2, rh / 2, rz2); st3.rotation.z = (r() - .5) * 0.18; g.add(st3);
      if (r() > 0.5) {
        var tip = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.26, 4), nmat(0x8a5a3a));
        tip.position.set(rx2 + st3.rotation.z * -rh * 0.5, rh + 0.1, rz2); g.add(tip);
      }
    }
    g.position.set(x, 0, z); Z.scene.add(g); return natReg(g, '芦苇');
  }
  /* 草垛（图8农庄） */
  function haystack(x, z, seed) {
    var r = rng('hs' + seed);
    var g = new T.Group();
    var body = new T.Mesh(new T.ConeGeometry(0.95, 1.5, 7, 2), nmat(0xd9b96a));
    body.position.y = 0.75; body.castShadow = true; g.add(body);
    var cap = new T.Mesh(new T.ConeGeometry(0.45, 0.5, 6), nmat(0xc4a24f));
    cap.position.y = 1.62; g.add(cap);
    g.position.set(x, 0, z); g.rotation.y = r() * 6.28; Z.scene.add(g);
    return natReg(g, '草垛');
  }
  /* 有机池塘（图5全套：环石+莲+芦苇+鸢尾+石灯笼） */
  function pondOrganic(cx, cz, rx, rz, seed, opts) {
    opts = opts || {};
    var r = rng('pd' + seed);
    var wmat = new T.MeshLambertMaterial({ color: 0x58a5b8, transparent: true, opacity: 0.92 });
    [[0, 0, 1], [rx * 0.45, rz * 0.3, 0.62], [-rx * 0.4, -rz * 0.35, 0.55]].forEach(function (e) {
      var w = new T.Mesh(new T.CircleGeometry(1, 22), wmat);
      w.rotation.x = -Math.PI / 2;
      w.scale.set(rx * e[2], rz * e[2], 1);
      w.position.set(cx + e[0], 0.06, cz + e[1]);
      Z.scene.add(w);
    });
    // rim rocks
    for (var a = 0; a < 6.28; a += 0.38 + r() * 0.4) {
      rock(cx + Math.cos(a) * (rx + 0.5 + r() * 1.2), cz + Math.sin(a) * (rz + 0.5 + r() * 1.2), 0.35 + r() * 0.75, seed + a);
    }
    // lotus pads + blossoms
    var pads = opts.lotus === false ? 0 : 12 + (hash(seed) % 6);
    for (var i = 0; i < pads; i++) {
      var lx = cx + (r() - .5) * rx * 1.4, lz = cz + (r() - .5) * rz * 1.4;
      var pad = new T.Mesh(new T.CircleGeometry(0.26 + r() * 0.2, 7), nmat(r() > 0.5 ? 0x4e9e50 : 0x5fae57));
      pad.rotation.x = -Math.PI / 2; pad.rotation.z = r() * 6.28;
      pad.position.set(lx, 0.1, lz); Z.scene.add(pad);
      if (r() > 0.65) {
        var fl = new T.Mesh(new T.ConeGeometry(0.15, 0.3, 5), nmat(r() > 0.5 ? 0xe8a8c8 : 0xf3e6ee));
        fl.position.set(lx + 0.2, 0.24, lz); Z.scene.add(fl);
      }
    }
    // reeds + irises at edges
    reeds(cx - rx * 0.9, cz + rz * 0.75, seed + 'r1');
    reeds(cx + rx * 0.85, cz - rz * 0.7, seed + 'r2');
    flowerPatch(cx - rx - 1.4, cz - rz * 0.3, seed + 'ir');
    flowerPatch(cx + rx * 0.6, cz + rz + 1.2, seed + 'ir2');
    // stone lantern (historic sculpture)
    if (opts.lantern !== false) spawn('historic', 'SM_Sculpture_06', 'LowpolyHistoric_Texture_01.png', { x: cx + rx + 1.6, z: cz + 0.8, ry: -0.6, shadow: true, solid: false });
    Z.colliders.push({ x: cx, z: cz, hw: rx * 0.9, hd: rz * 0.9, ry: 0, cx: 0, cz: 0 });
  }
  /* 菜畦（图8：密植成行+围栏） */
  function cropField(x, z, w, d, ry, seed) {
    var g = new T.Group(); var r = rng('cf' + seed);
    var soil = new T.Mesh(new T.BoxGeometry(w, 0.2, d), nmat(0x6e5233)); soil.position.y = 0.1; soil.receiveShadow = true; g.add(soil);
    var rows = Math.max(3, Math.floor(d / 0.85));
    var greens = [0x7fb84e, 0x8ec455, 0x9ccd5f, 0x6fae44];
    for (var i = 0; i < rows; i++) {
      var ridge = new T.Mesh(new T.BoxGeometry(w - 0.5, 0.1, 0.34), nmat(0x7a5b3a));
      ridge.position.set(0, 0.22, -d / 2 + 0.55 + i * 0.85); g.add(ridge);
      for (var jx = -w / 2 + 0.55; jx < w / 2 - 0.3; jx += 0.52) {
        var cr = new T.Mesh(new T.ConeGeometry(0.12, 0.5 + r() * 0.42, 4), nmat(greens[(i + ((jx * 10) | 0)) % 4 < 0 ? 0 : (i + Math.abs((jx * 10) | 0)) % 4]));
        cr.position.set(jx + (r() - .5) * 0.15, 0.5, -d / 2 + 0.55 + i * 0.85); g.add(cr);
      }
    }
    var fm = nmat(0xa8845c);
    [[-w / 2, 0, 0.08, d], [w / 2, 0, 0.08, d]].forEach(function (s2) {
      var rail = new T.Mesh(new T.BoxGeometry(s2[2], 0.07, s2[3]), fm); rail.position.set(s2[0], 0.66, s2[1]); g.add(rail);
      var rail2 = rail.clone(); rail2.position.y = 0.38; g.add(rail2);
    });
    [-d / 2, d / 2].forEach(function (sz) {
      var rail = new T.Mesh(new T.BoxGeometry(w, 0.07, 0.08), fm); rail.position.set(0, 0.66, sz); g.add(rail);
      var rail2 = rail.clone(); rail2.position.y = 0.38; g.add(rail2);
    });
    for (var px = -w / 2; px <= w / 2 + 0.01; px += 1.25) {
      [-d / 2, d / 2].forEach(function (pz) { var post = new T.Mesh(new T.BoxGeometry(0.1, 0.8, 0.1), fm); post.position.set(px, 0.4, pz); g.add(post); });
    }
    for (var pz2 = -d / 2 + 1.25; pz2 < d / 2; pz2 += 1.25) {
      [-w / 2, w / 2].forEach(function (px2) { var post = new T.Mesh(new T.BoxGeometry(0.1, 0.8, 0.1), fm); post.position.set(px2, 0.4, pz2); g.add(post); });
    }
    g.position.set(x, 0, z); g.rotation.y = ry || 0; Z.scene.add(g);
    return natReg(g, '菜畦');
  }
  /* 农庄单元（图8：仓+畦+草垛+树） */
  function farmstead(st, x, z, ry, seed) {
    var r = rng('fs' + seed);
    var g0 = Math.sin(ry), g1 = Math.cos(ry);
    function lp(lx, lz) { return [x + lx * g1 + lz * g0, z - lx * g0 + lz * g1]; }
    var p1 = lp(0, -7);
    spawn('ancient', 'SM_Granary_01', st.anc, { x: p1[0], z: p1[1], ry: ry + Math.PI, shadow: true });
    var f1 = lp(-6.5, 2.5), f2 = lp(5.5, 3.5);
    cropField(f1[0], f1[1], 9, 6.5, ry + 0.06, seed);
    cropField(f2[0], f2[1], 8, 6, ry - 0.08, seed + 'b');
    var h1 = lp(-1, 8.5), h2 = lp(1.6, 9.6), t1 = lp(11, -4);
    haystack(h1[0], h1[1], seed); haystack(h2[0], h2[1], seed + 'h');
    tree(t1[0], t1[1], 'green', seed + 't');
    var rc = lp(-11, -5); rockCluster(rc[0], rc[1], seed + 'r');
  }
  function lanternPost(x, z, seed) {
    var g = new T.Group();
    var post = new T.Mesh(new T.CylinderGeometry(0.07, 0.09, 3.1, 5), nmat(0x5c4028)); post.position.y = 1.55; g.add(post);
    var arm = new T.Mesh(new T.BoxGeometry(1.1, 0.07, 0.07), nmat(0x5c4028)); arm.position.set(0.45, 2.9, 0); g.add(arm);
    var lt = new T.Mesh(new T.SphereGeometry(0.24, 6, 5), new T.MeshLambertMaterial({ color: 0xd8452e, emissive: 0x902010, emissiveIntensity: 0.55 }));
    lt.scale.y = 1.25; lt.position.set(0.85, 2.62, 0); g.add(lt);
    g.position.set(x, 0, z); g.rotation.y = rng('lp' + seed + x)() * 6.28; Z.scene.add(g);
    return natReg(g, '灯柱');
  }
  function cloud(x, y, z, s, seed) {
    var g = new T.Group(); var r = rng('cl' + seed);
    for (var i = 0; i < 3 + (hash(seed + 'c') % 3); i++) {
      var b = new T.Mesh(new T.IcosahedronGeometry(1 + r() * 0.9, 0), new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.93 }));
      b.position.set(i * 1.3 - 1.5, (r() - .5) * 0.5, (r() - .5) * 0.8);
      b.scale.set(1.35, 0.6, 1); g.add(b);
    }
    g.position.set(x, y, z); g.scale.setScalar(s); Z.scene.add(g);
  }
  /* 招牌：横匾挂在铺门上方 */
  function signboard(st, x, z, ry, seed) {
    var nm = (hash(seed) % 2) ? 'SM_Env_Misc_01' : 'SM_Env_Misc_02';
    spawn('ancient', nm, st.anc, { x: x, z: z, ry: ry, y: 2.9, solid: false, s: 0.8 });
  }

  /* ---------------- scene bootstrap ---------------- */
  function newScene(skyC, fogC, fogNear, fogFar, night) {
    disposeScene();
    var sc = new T.Scene();
    sc.background = new T.Color(night ? 0x141b2e : skyC);
    sc.fog = new T.Fog(night ? 0x141b2e : fogC, fogNear, fogFar);
    var amb = new T.AmbientLight(night ? 0x8898c8 : 0xffffff, night ? 0.55 : 0.82);
    sc.add(amb);
    var sun = new T.DirectionalLight(night ? 0xaabbee : 0xfff0d0, night ? 0.5 : 1.5);
    sun.position.set(40, 62, 28);
    sun.castShadow = true;
    sun.shadow.mapSize.set(isTouch() ? 1024 : 2048, isTouch() ? 1024 : 2048);
    var sz = 90; sun.shadow.camera.left = -sz; sun.shadow.camera.right = sz; sun.shadow.camera.top = sz; sun.shadow.camera.bottom = -sz;
    sun.shadow.camera.far = 220; sun.shadow.bias = -0.0008;
    sc.add(sun);
    sc.userData._skyC = night ? 0x141b2e : skyC;
    sc.userData._fogNear = fogNear; sc.userData._fogFar = fogFar;
    Z.scene = sc; Z.colliders = []; Z.doors = []; Z.exitDoor = null;
    Z.pawns = []; Z.orders = []; Z.actor = null; Z.selNpc = null;
    Z.cityRoots = []; Z.anims = []; Z.natureRoots = []; Z.chunkCtx = null; Z.escort = []; Z.mtnSpots = []; Z.tp = null;
    return sc;
  }
  function disposeScene() {
    if (!Z.scene) return;
    /* 原来只 dispose 几何体，材质与贴图一个都不碰：每建一座城至少新造一张
       1024×1024 的地面 CanvasTexture（含 mipmap 约 5.6MB）外加十几张 256×256，
       换城即泄漏、单调增长永不回收——玩上半小时显存就吃满了。
       共用资源（userData.shared，来自资材包）一律不动，那是全局复用的。 */
    /* 全局复用的那两份材质缓存（贴图材质 Z.mats、纯色材质 NM）绝不能碰：
       它们跨城复用，dispose 掉之后下一座城的模型会整片变黑。
       要回收的只是这一座城现造的那些——地面的 1024×1024 CanvasTexture、
       山根砾石裙的 256×256 之类。 */
    var keep = [];
    try { for (var mk in Z.mats) keep.push(Z.mats[mk]); } catch (e) { }
    try { for (var nk in NM) keep.push(NM[nk]); } catch (e) { }
    var seen = [];
    function killMat(m) {
      if (!m || keep.indexOf(m) >= 0) return;
      if (m.userData && m.userData.shared) return;
      ['map', 'normalMap', 'emissiveMap', 'alphaMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap'].forEach(function (k) {
        var t = m[k];
        if (t && t.isTexture && t.isCanvasTexture && !(t.userData && t.userData.shared)) {
          try { t.dispose(); } catch (e) { }
          m[k] = null;
        }
      });
      try { m.dispose(); } catch (e) { }
    }
    Z.scene.traverse(function (o) {
      if (!o.isMesh) return;
      if (o.geometry && !o.userData.shared) { try { o.geometry.dispose(); } catch (e) { } }
      if (!o.material) return;
      var ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach(function (m) {
        if (!m || seen.indexOf(m) >= 0) return;
        seen.push(m); killMat(m);
      });
    });
    Z.scene = null;
  }

  /* ---------------- player ---------------- */
  /* 棋子骨架：与地中海引擎共用同一份模块。本引擎的市井众生仍用自家火柴人
     （希腊甲胄穿在中原百姓身上不像话），只有罗马纪的女主走这条路。 */
  function rigPawn(cfg) {
    var lib = Z.packs.pawn && Z.packs.pawn.lib;
    if (!window.ZJ_PAWN || !lib || !Z.pawnRig || !Z.tex['pawnpal.png']) return null;
    window.ZJ_PAWN.bind({ T: T, nmat: nmat, mat: matFor('pawnpal.png'), lib: lib, rig: Z.pawnRig });
    var g = window.ZJ_PAWN.make(cfg);
    return (g && g.userData && g.userData.rig) ? g : null;   /* 回落成火柴人就当没拿到 */
  }
  function buildPlayer() {
    var g = new T.Group();
    var roma = (Z.side === 'roma');
    var robe = new T.Mesh(new T.CylinderGeometry(0.24, 0.42, 1.15, 8), nmat(0x24202c)); robe.position.y = 0.62; robe.castShadow = true; g.add(robe);
    var band = new T.Mesh(new T.CylinderGeometry(0.25, 0.30, 0.14, 8), nmat(0xa63b26)); band.position.y = 1.0; g.add(band);
    var chest = new T.Mesh(new T.CylinderGeometry(0.20, 0.25, 0.42, 8), nmat(0x2c2836)); chest.position.y = 1.36; chest.castShadow = true; g.add(chest);
    var head = new T.Mesh(new T.SphereGeometry(0.155, 8, 7), nmat(0xf0d8bc)); head.position.y = 1.7; g.add(head);
    if (roma) {
      /* 骨架资材到位就用带装备的模型（与地中海引擎同一份共用模块），
         取不到再退回下面这套简笔——总之绝不能是天子冕。 */
      var rg = rigPawn({ outfit: 'fglad', head: 'Mid_Hair', hairC: 0xd9a94e, prop: 'sword',
                         robe: 0x24202c, band: 0xa63b26, chest: 0x2c2836 });
      if (rg) { rg.userData.isPlayer = true; return rg; }
    }
    if (roma) {
      /* 羅馬紀走到中原時，操縱的仍是貝羅娜：金色波波頭、腰間佩劍，斷不可頂天子冕旒 */
      var bob = new T.Mesh(new T.SphereGeometry(0.165, 8, 7), nmat(0xd9a94e));
      bob.scale.set(1.04, 0.82, 1.04); bob.position.y = 1.755; g.add(bob);
      var nape = new T.Mesh(new T.BoxGeometry(0.26, 0.16, 0.12), nmat(0xd9a94e));
      nape.position.set(0, 1.64, -0.06); g.add(nape);
      var bl = new T.Mesh(new T.BoxGeometry(0.05, 0.62, 0.09), nmat(0x6e6e76));
      bl.position.set(0.27, 0.86, 0.03); bl.rotation.z = 0.16; g.add(bl);
      var hilt = new T.Mesh(new T.BoxGeometry(0.11, 0.05, 0.05), nmat(0xc9a063));
      hilt.position.set(0.30, 1.18, 0.03); g.add(hilt);
    } else {
      var hair = new T.Mesh(new T.SphereGeometry(0.16, 8, 7), nmat(0x1a1512)); hair.scale.set(1, 0.72, 1); hair.position.y = 1.76; g.add(hair);
      var crown = new T.Mesh(new T.BoxGeometry(0.34, 0.05, 0.2), nmat(0x2c2836)); crown.position.y = 1.9; g.add(crown);
      var beadF = new T.Mesh(new T.BoxGeometry(0.3, 0.1, 0.02), nmat(0xd8b23a)); beadF.position.set(0, 1.85, 0.11); g.add(beadF);
    }
    g.userData.isPlayer = true;
    return g;
  }
  /* ---------------- 王室卫队：天子仪仗常随 ---------------- */
  Z.escort = [];
  var GUARD_CFG = { robe: 0x2c2836, band: 0xc9a063, chest: 0x3a3444, hat: 'plume', hatC: 0x2c2836, prop: 'spear', s: 0.94 };
  function escortOffsets(n) {
    // 御前四卫：前二后二；逾四者再列于后
    var pts = [[-0.95, 1.9], [0.95, 1.9], [-0.95, -1.9], [0.95, -1.9]];
    for (var i = 4; i < n; i++) {
      var col = i % 2 ? 1 : -1, row = ((i - 4) / 2) | 0;
      pts.push([col * 0.95, -(3.2 + row * 1.25)]);
    }
    return pts.slice(0, n);
  }
  Z.captive = false;      // 剧情软禁：仪仗尽散
  Z.escortBusy = false;   // 卫队出击中（暂离仪仗位）
  /* 卫队员额（玩家增减，持久）。两张卡分开记：天子有四卫仪仗，贝罗娜不是天子，默认无卫。 */
  Z.escortN = 4;
  function escortKey() { return Z.side === 'roma' ? 'zj3d_escortN_roma' : 'zj3d_escortN'; }
  function escortNLoad() {
    Z.escortN = (Z.side === 'roma') ? 0 : 4;
    try { var v = parseInt(localStorage.getItem(escortKey())); if (v >= 0 && v <= 24) Z.escortN = v; } catch (e) { }
  }
  function escortNSave() { try { localStorage.setItem(escortKey(), '' + Z.escortN); } catch (e) { } }
  escortNLoad();
  /* 换卡＝换人：丢掉旧棋子与仪仗，并逼下一帧重建本城，由 placePlayer 重新落人 */
  Z.setSide = function (s) {
    s = (s === 'roma') ? 'roma' : 'zhou';
    if (s === Z.side) return;
    Z.side = s;
    escortNLoad();
    if (Z.player) { if (Z.player.parent) Z.player.parent.remove(Z.player); Z.player = null; }
    Z.cityKey = '';
  };
  var GUARD_COST = 100, GUARD_REFUND = 50;
  function escortAdd() {
    if (Z.captive || Z.escortN >= 24 || ECON.gold < GUARD_COST) return;
    ECON.gold -= GUARD_COST; econSave();
    Z.escortN++; escortNSave();
    spawnEscort();
    updateBuildHud();
  }
  function escortSub() {
    if (Z.escortN <= 0) return;
    Z.escortN--; escortNSave();
    ECON.gold += GUARD_REFUND; econSave();
    spawnEscort();
    updateBuildHud();
  }
  function spawnEscort() {
    Z.escort.forEach(function (g) {
      if (g.parent) g.parent.remove(g);
      Z.pawns = Z.pawns.filter(function (p) { return p.root !== g; });
    });
    Z.escort = [];
    Z.escortBusy = false;
    if (!Z.player || !Z.scene) return;
    if (Z.captive) return; // 软禁之身，无卫可随
    var n = Z.escortN; // 员额由天子钦定（默认四卫：前二后二）
    var offs = escortOffsets(n);
    var py = Z.player.rotation.y, sy = Math.sin(py), cy = Math.cos(py);
    for (var i = 0; i < n; i++) {
      var g = makePawn(GUARD_CFG);
      g.userData.escort = true;
      var ox = offs[i][0], oz = offs[i][1];
      g.position.set(
        Z.player.position.x + ox * cy + oz * sy,
        0,
        Z.player.position.z - ox * sy + oz * cy
      );
      g.rotation.y = py;
      g.userData.off = offs[i];
      Z.scene.add(g);
      Z.escort.push(g);
      // 卫士可点：选中即为「御前卫队」号令对象
      regPawn(g, { name: '御前卫队', cat: '羽林近卫', desc: '闻警则出，护驾而还', tag: 'escort', own: true });
    }
  }
  function escortKill(k) {
    for (var i = 0; i < k && Z.escort.length; i++) {
      var g = Z.escort.pop();
      puff(g.position.x, 0.8, g.position.z, 0xd94f1e, 3, 1.8, 1);
      if (g.parent) g.parent.remove(g);
      Z.pawns = Z.pawns.filter(function (p) { return p.root !== g; });
    }
  }
  /* 卫队出击战斗结算 */
  function resolveEscortBattle(tgt, byOrder) {
    var city = Z.cityKey;
    var n = Z.escort.length;
    var pos = posName(Math.round(tgt.root.position.x / CELL), Math.round(tgt.root.position.z / CELL));
    var msg;
    if (tgt.tag !== 'unit') {
      var nm = tgt.name, cat = tgt.cat;
      killPawn(tgt);
      msg = '（周天子敕命御前卫队出击——' + nm + '（' + cat + '）于' + city + '城' + pos + '为卫士所格杀，卫队无伤，归列护驾。）';
    } else {
      var dC = tgt.count;
      var aS = n * 16 * (0.9 + Math.random() * 0.25); // 羽林近卫，以一当二
      var dS = dC * 10 * (0.85 + Math.random() * 0.3);
      var dCas = Math.min(dC, Math.max(1, Math.round(aS / 22)));
      var gCas = Math.min(n, Math.round(dS / 34));
      var dLeft = dC - dCas;
      escortKill(gCas);
      if (dLeft <= 0) killPawn(tgt); else shrinkUnit(tgt, dLeft);
      var res = dLeft <= 0 ? tgt.name + '全军覆没' : tgt.name + '余' + dLeft + '人退却';
      msg = '（周天子敕命御前卫队出击' + tgt.name + '。过程：卫队突阵于' + city + '城' + pos + '，' + tgt.name + '伤亡' + dCas + '人，卫士殉职' + gCas + '人。结果：' + res + '，卫队归列护驾。影响：天子亲兵见血，都中侧目。）';
    }
    Z.escortBusy = false;
    if (window.ZJ3D_say) ZJ3D_say(msg);
    updateBuildHud();
  }
  /* ---------------- 剧情感知：软禁 / 遇刺 ---------------- */
  var STORY = { last: '', coolAt: 0 };
  Z.onStory = function (text) {
    if (!text || text === STORY.last) return;
    /* 引擎加载完通常要几秒（真实网络取资材包更久），而宿主在展开三维面板 600ms 后
       就把开局那一幕递了进来。原来先记 STORY.last 再查 ready：这一幕被记成「已处理」
       却什么都没做，等 ready 之后宿主再递同一段文本时，第一行的去重直接把它挡掉——
       开局里的「软禁/人质/阶下囚」不会让仪仗散去，「刺客/夜袭」不会触发遇刺事件。
       onRender 早就有 pending 重放，onStory 一直没有。 */
    if (!Z.ready) { Z.pendStory = text; return; }
    STORY.last = text;
    // 软禁与获释
    if (/软禁|幽禁|禁足|被囚|囚于|拘于|人质|阶下囚|不得出|看守森严|活玉玺/.test(text)) {
      if (!Z.captive) { Z.captive = true; spawnEscort(); }
    } else if (/获释|脱身|放归|重获自由|逃出|大赦|仪仗复/.test(text)) {
      if (Z.captive) { Z.captive = false; spawnEscort(); }
    }
    // 遇刺事件（冷却 90 秒）
    if (Z.mode === 'city' && Date.now() > STORY.coolAt && /刺客|行刺|刺杀|暗杀|伏兵|截杀|夜袭|图穷匕见/.test(text)) {
      STORY.coolAt = Date.now() + 90000;
      startAssassinEvent();
    }
  };
  var EV = null; // {assassins:[], phase, t}
  function startAssassinEvent() {
    if (EV || !Z.player || !Z.scene) return;
    var k = 2 + (hash('as' + Date.now()) % 3);
    var as = [];
    for (var i = 0; i < k; i++) {
      var a = (i / k) * 6.28 + Math.random();
      var g = makePawn({ robe: 0x1c1a20, band: 0x3a3038, chest: 0x24202a, hat: 'scarf', hatC: 0x1c1a20, prop: 'sword', s: 0.96 });
      g.position.set(Z.player.position.x + Math.sin(a) * 15, 0, Z.player.position.z + Math.cos(a) * 15);
      Z.scene.add(g);
      as.push(g);
    }
    EV = { assassins: as, phase: 'charge', t: 5 };
  }
  function eventTick(dt, t) {
    if (!EV) return;
    var px = Z.player.position.x, pz = Z.player.position.z;
    if (EV.phase === 'charge') {
      EV.t -= dt;
      var near = false;
      EV.assassins.forEach(function (g) {
        var dx = px - g.position.x, dz = pz - g.position.z, dd = Math.hypot(dx, dz);
        if (dd > 3.2) {
          var sp = 4.5 * dt;
          g.position.x += dx / dd * sp; g.position.z += dz / dd * sp;
          g.rotation.y = Math.atan2(dx, dz);
          g.position.y = Math.abs(Math.sin(t * 9)) * 0.05;
        } else near = true;
      });
      // 卫队迎击：向最近刺客突进
      if (Z.escort.length) {
        Z.escortBusy = true;
        Z.escort.forEach(function (g, i) {
          var tg = EV.assassins[i % EV.assassins.length];
          var dx = tg.position.x - g.position.x, dz = tg.position.z - g.position.z, dd = Math.hypot(dx, dz);
          if (dd > 1.2) { var sp = 6 * dt; g.position.x += dx / dd * sp; g.position.z += dz / dd * sp; g.rotation.y = Math.atan2(dx, dz); }
        });
      }
      if (near || EV.t <= 0) { EV.phase = 'clash'; EV.t = 2.4; }
    } else if (EV.phase === 'clash') {
      EV.t -= dt;
      EV.assassins.forEach(function (g) { g.position.x += (Math.random() - .5) * 0.14; g.position.z += (Math.random() - .5) * 0.14; });
      Z.escort.forEach(function (g) { g.position.x += (Math.random() - .5) * 0.12; g.position.z += (Math.random() - .5) * 0.12; });
      if (EV.t <= 0) {
        var k = EV.assassins.length, city = Z.cityKey, msg;
        EV.assassins.forEach(function (g) { puff(g.position.x, 0.8, g.position.z, 0x4a4440, 2, 1.6, 1); if (g.parent) g.parent.remove(g); });
        if (Z.escort.length) {
          var gCas = Math.random() < 0.35 ? 1 : 0;
          gCas = Math.min(gCas, Math.max(0, Z.escort.length - 1));
          if (gCas > 0) escortKill(gCas);
          msg = '（变起仓促——' + k + '名刺客扑向御驾，御前卫队立时合围搏杀。刺客' + k + '人尽数格杀' + (gCas > 0 ? '，卫士殉职' + gCas + '人' : '，卫队无一伤亡') + '，天子无恙。太史令记：有贼犯驾于' + city + '。）';
        } else {
          msg = '（变起仓促——' + k + '名刺客扑向御驾，左右竟无一卫！兵刃加身，天子却立而不倒，创口于众目之下弥合如初。刺客骇然掷刃，仓皇遁走。' + city + '城中悄声相传：天子果然不可杀。）';
        }
        Z.escortBusy = false;
        EV = null;
        if (window.ZJ3D_say) ZJ3D_say(msg);
      }
    }
  }
  function escortTick(dt, t) {
    if (!Z.player || !Z.escort.length) return;
    var py = Z.player.rotation.y, sy = Math.sin(py), cy = Math.cos(py);
    for (var i = 0; i < Z.escort.length; i++) {
      var g = Z.escort[i];
      if (!g.parent) continue;
      var off = g.userData.off;
      var tx = Z.player.position.x + off[0] * cy + off[1] * sy;
      var tz = Z.player.position.z - off[0] * sy + off[1] * cy;
      var dx = tx - g.position.x, dz = tz - g.position.z;
      var dd = Math.hypot(dx, dz);
      if (dd > 0.35) {
        var sp = Math.min(8.5, 2.2 + dd * 2.2) * dt;
        if (sp > dd) sp = dd;
        g.position.x += dx / dd * sp;
        g.position.z += dz / dd * sp;
        g.rotation.y = Math.atan2(dx, dz);
        g.position.y = Math.abs(Math.sin(t * 8 + i * 1.7)) * 0.045;
      } else {
        g.position.y *= 0.8;
        // 立定后转向与天子同向
        var d0 = py - g.rotation.y;
        while (d0 > Math.PI) d0 -= Math.PI * 2;
        while (d0 < -Math.PI) d0 += Math.PI * 2;
        g.rotation.y += d0 * Math.min(1, dt * 5);
      }
    }
  }
  function placePlayer(x, z, yaw) {
    if (!Z.player || Z.player.parent !== Z.scene) { Z.player = buildPlayer(); Z.scene.add(Z.player); }
    Z.player.position.set(x, 0, z); Z.player.rotation.y = yaw || 0;
    Z.camYaw = (yaw || 0) + Math.PI; // camera behind
    Z.camSnap = true;
    spawnEscort();
  }

  /* ============================================================
     城市配方
     ============================================================ */

  // 街铺：先规划（算出门前支路），再落地（配摊棚/果箱/招牌/灯笼/后院树）
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function crates(x, z, r) {
    var colors = [0xc84a3a, 0xe0a83c, 0x8ec455, 0xd98a34];
    var g = new T.Group();
    for (var i = 0; i < 2 + Math.floor(r() * 3); i++) {
      var bx = x + (r() - .5) * 1.5, bz = z + (r() - .5) * 1.5;
      var box = new T.Mesh(new T.BoxGeometry(0.6, 0.34, 0.6), nmat(0xa8845c));
      box.position.set(bx, 0.17, bz); box.rotation.y = r(); box.castShadow = true; g.add(box);
      for (var f = 0; f < 3; f++) {
        var fruit = new T.Mesh(new T.IcosahedronGeometry(0.11, 0), nmat(colors[Math.floor(r() * 4)]));
        fruit.position.set(bx + (r() - .5) * 0.3, 0.42, bz + (r() - .5) * 0.3); g.add(fruit);
      }
    }
    Z.scene.add(g);
    return natReg(g, '果箱');
  }
  function shopLabel(name) {
    var L = {
      Blacksmith: '铁匠铺', Bookstore: '书肆', Butcher: '肉铺', Clothing: '布庄', Grocery: '杂货铺',
      Pharmacy: '药铺', Resturant: '酒楼', Hotel: '客栈', Tea: '茶棚', Gold: '金铺', Jewlry: '珠玉行',
      Pottery: '陶坊', Warehouse: '货栈', Weapon: '兵器铺', Granary: '官仓', Horse: '马厩',
      Private: '民居', Parlor: '粮行', Foundry: '铸坊', Eternal: '神祠', Main: '官署', Palace: '宫室',
      Gazeebo: '凉亭', Tathed: '草棚'
    };
    for (var k in L) if (name.indexOf(k) >= 0) return L[k];
    return '屋舍';
  }
  function pickInterior(name) {
    if (/Hotel|Resturant/.test(name)) return 'inn';
    if (/Bookstore/.test(name)) return 'study';
    if (/Private|Parlor/.test(name)) return 'home';
    if (/Palace|Main_Hall|Eternal/.test(name)) return 'hall';
    if (/Warehouse|Granary|Foundry|Butcher|Grocery|Clothing|Gold|Jewlry|Pharmacy|Weapon|Blacksmith|Pottery/.test(name)) return 'shop';
    return null;
  }
  /* 规划一条市街：返回 {placements, paths}；xSide=-1 西侧 +1 东侧 */
  function planShopRow(list, xSide, z0, gap) {
    var placements = [], paths = [];
    var z = z0;
    list.forEach(function (name) {
      var inf = info('ancient', name); if (!inf) return;
      var ry = xSide < 0 ? Math.PI / 2 : -Math.PI / 2;
      var bx = xSide * (8 + inf.size.z / 2);
      var zc = z + inf.size.x / 2;
      placements.push({ name: name, x: bx, z: zc, ry: ry, doorX: xSide * 7.2, doorZ: zc });
      paths.push({ w: 2.4, pts: [[xSide * 3.4, zc], [xSide * 7.4, zc]] });
      z += inf.size.x + gap;
    });
    return { placements: placements, paths: paths, endZ: z };
  }
  function buildShopRow(st, texA, plan, r) {
    plan.placements.forEach(function (p, i) {
      var inf = info('ancient', p.name);
      spawn('ancient', p.name, texA, {
        x: p.x, z: p.z, ry: p.ry, shadow: true,
        door: { side: 0, dist: inf.size.z / 2 + 1.5, interior: pickInterior(p.name), label: shopLabel(p.name) }
      });
      var xSide = p.x < 0 ? -1 : 1;
      // 招牌横匾
      signboard(st, p.doorX + xSide * 0.6, p.z, p.ry, 'sb' + p.z + p.name);
      // 摊棚 + 果箱（几乎每铺，图6/7）
      if (r() > 0.2) {
        var stall = 'SM_Env_Stall_' + pad2(1 + Math.floor(r() * 15));
        spawn('ancient', stall, texA, { x: xSide * 5.2, z: p.z + (r() - .5) * 2.2, ry: p.ry + (r() - .5) * .25, solid: false });
        crates(xSide * 3.9, p.z + (r() - .5) * 2.5, r);
      }
      if (i % 2 === 0) lanternPost(xSide * 4.4, p.z - 2.6, 'st' + p.z);
      if (r() > 0.55) { var bt = ['green', 'pink', 'autumn'][Math.floor(r() * 3)]; tree(xSide * (10 + info('ancient', p.name).size.z + r() * 4), p.z + (r() - .5) * 4, bt, 'bk' + p.z); }
      if (r() > 0.7) flowerPatch(xSide * 3.2, p.z + 2.2, 'fp' + p.z);
    });
  }

  /* ---------- 通用城镇（七国都邑） ---------- */
  var TOWN_SETS = {
    qin: ['SM_Weapon_Shop_01', 'SM_Blacksmith_01', 'SM_Foundry_Room', 'SM_Granary_01', 'SM_Warehouse_01', 'SM_Butcher_01', 'SM_Grocery_01', 'SM_Private_House_01', 'SM_Horse_Room_01'],
    zhao: ['SM_Horse_Room_01', 'SM_Weapon_Shop_01', 'SM_Blacksmith_01', 'SM_Hotel_01', 'SM_Butcher_01', 'SM_Private_House_02', 'SM_Warehouse_01', 'SM_Clothing_Store_01'],
    yan: ['SM_Hotel_01', 'SM_Horse_Room_01', 'SM_Granary_01', 'SM_Pharmacy_01', 'SM_Private_House_03', 'SM_Grocery_01', 'SM_Tathed_Cage_01', 'SM_Warehouse_01'],
    qi: ['SM_Gold_Shop_01', 'SM_Jewlry_Store_01', 'SM_Jewlry_Store_02', 'SM_Bookstore_01', 'SM_Bookstore_02', 'SM_Clothing_Store_01', 'SM_Clothing_Store_02', 'SM_Resturant_01', 'SM_Hotel_01', 'SM_Tea_Stall_01'],
    wei: ['SM_Warehouse_01', 'SM_Granary_01', 'SM_Parlor_01', 'SM_Grocery_01', 'SM_Resturant_02', 'SM_Clothing_Store_02', 'SM_Private_House_01', 'SM_Bookstore_01'],
    han: ['SM_Blacksmith_01', 'SM_Foundry_Room', 'SM_Weapon_Shop_01', 'SM_Pottery_Workshop_01', 'SM_Grocery_01', 'SM_Private_House_02', 'SM_Butcher_01', 'SM_Pharmacy_01'],
    chu: ['SM_Eternal_Life', 'SM_Tea_Stall_01', 'SM_Resturant_01', 'SM_Pharmacy_01', 'SM_Bookstore_02', 'SM_Private_House_03', 'SM_Pottery_Workshop_01', 'SM_Clothing_Store_01', 'SM_Jewlry_Store_01']
  };
  var TOWN_HIS = {
    qin: { gaz: 'SM_Gazeebo_08', extra: ['SM_Tower_04'] },
    zhao: { gaz: 'SM_Gazeebo_04', extra: ['SM_Tower_05'] },
    yan: { gaz: 'SM_Gazeebo_02', extra: ['SM_Mausoleum_03'] },
    qi: { gaz: 'SM_Gazeebo_05', extra: ['SM_Threater_Stage_01', 'SM_Plaque_05'] },
    wei: { gaz: 'SM_Gazeebo_06', extra: ['SM_Bridge_02'] },
    han: { gaz: 'SM_Gazeebo_07', extra: ['SM_Tower_02'] },
    chu: { gaz: 'SM_Gazeebo_03', extra: ['SM_Bridge_01', 'SM_Sculpture_14'] }
  };

  function buildTown(stKey, locName, flavor) {
    var st = STATES[stKey];
    var r = rng('city' + locName);
    var R = 118;
    newScene(0xa9d7ec, 0xd2e8d8, 55, 230, Z.night);

    // ---- 规划 ----
    var sets = TOWN_SETS[stKey] || TOWN_SETS.qi;
    var half = Math.ceil(sets.length / 2);
    var rowW = planShopRow(sets.slice(0, half), -1, -8, 2.4);
    var rowE = planShopRow(sets.slice(half), 1, -4, 2.4);
    // 主路蜿蜒 S 形；横街弧线；支路来自铺面规划
    var paths = [
      { w: 8, pts: [[0, R * 0.88], [1.5, 46], [-2, 12], [0, -18], [1, -40], [0, -R * 0.55]] },
      { w: 5, pts: [[-R * 0.6, 16], [-26, 9], [0, 6], [26, 10], [R * 0.6, 18]] },
      { w: 3.5, pts: [[0, -30], [14, -38], [R * 0.34, -R * 0.5]] },
      { w: 3, pts: [[26, 44], [34, 40], [40, 44]] } // 农庄小径
    ].concat(rowW.paths, rowE.paths);
    var plazas = [
      { x: 0, z: -36, rx: 13, rz: 10, stone: true },   // 宫前石板广场
      { x: 0, z: 24, rx: 9, rz: 7 }                    // 市集沙场
    ];
    var waters = [{ x: -34, z: 24, rx: flavor === 'water' ? 14 : 9, rz: flavor === 'water' ? 9 : 6.5 }];
    addGround(st, R, paths, plazas, waters);
    mountainRing(R, locName, [0, 180]);

    // ---- 落地 ----
    spawn('historic', 'SM_Plaque_01', st.his, { x: 0, z: 58, ry: 0, shadow: true, shrink: 0.4 });
    lanternPost(-5.5, 52, 'g1'); lanternPost(5.5, 52, 'g2');
    buildShopRow(st, st.anc, rowW, r);
    buildShopRow(st, st.anc, rowE, r);

    // 宫室（石板广场北）+ 石阶感台基 + 双狮
    spawn('ancient', 'SM_Env_Floor_01', st.anc, { x: 0, z: -52, ry: 0, solid: false, s: 2.6 });
    var pal = spawn('ancient', 'SM_Palace_01', st.anc, {
      x: 0, z: -52, ry: 0, shadow: true,
      door: { side: 0, dist: 14, interior: 'hall', label: st.name + '宫' }
    });
    spawn('historic', 'SM_Sculpture_09', 'LowpolyHistoric_Texture_01.png', { x: -6.5, z: -40, ry: Math.PI, shadow: true });
    spawn('historic', 'SM_Sculpture_10', 'LowpolyHistoric_Texture_01.png', { x: 6.5, z: -40, ry: Math.PI, shadow: true });
    lanternPost(-9, -37, 'pl1'); lanternPost(9, -37, 'pl2');
    spawn('ancient', 'SM_Main_Hall', st.anc, { x: -32, z: -54, ry: 0.4, shadow: true, door: { side: 0, dist: 13, interior: 'hall', label: '官署' } });
    // 官署后山竹
    bambooGrove(-42, -64, locName + 'bg1', true);
    rockCluster(-22, -46, locName + 'rc1');

    // 园林（图5）：水榭 + 池 + 花 + 秋树
    var his = TOWN_HIS[stKey] || {};
    var w0 = waters[0];
    pondOrganic(w0.x, w0.z, w0.rx, w0.rz, locName, {});
    if (his.gaz) {
      spawn('ancient', 'SM_Env_Floor_05', st.anc, { x: w0.x + w0.rx + 7, z: w0.z + 3, ry: -0.7, solid: false, s: 1.4 });
      spawn('historic', his.gaz, st.his, { x: w0.x + w0.rx + 7, z: w0.z + 3, ry: -0.7, shadow: true });
    }
    treeCluster(w0.x - 4, w0.z - w0.rz - 6, ['autumn', 'red', 'green'], locName + 'gt');
    treeCluster(w0.x + 8, w0.z + w0.rz + 5, ['pink', 'green'], locName + 'gt2');
    flowerPatch(w0.x + w0.rx + 3, w0.z - 2, locName + 'gf');

    // 国色点睛 historic 件
    (his.extra || []).forEach(function (nm, i) {
      var inf = info('historic', nm);
      spawn('historic', nm, st.his, { x: 34 + i * (inf.size.x + 8), z: 20 + i * 8, ry: -0.4 - i * 0.5, shadow: true });
    });

    // 农庄单元（图8，东南）
    farmstead(st, 34, 46, -0.35, locName + 'fs');

    // 民居散布（带院树）
    ['SM_Private_House_01', 'SM_Private_House_02', 'SM_Private_House_03'].forEach(function (nm, i) {
      if (sets.indexOf(nm) >= 0) return;
      var hx = -48 + i * 9, hz = -12 + i * 16;
      spawn('ancient', nm, st.anc, { x: hx, z: hz, ry: 1.1 + i * 0.6, shadow: true, door: { side: 0, interior: 'home', label: '民居' } });
      tree(hx + 7, hz + 4, i === 1 ? 'pink' : 'green', locName + 'ht' + i);
    });

    dressNature(st, R, r, flavor, locName);
    for (var i = 0; i < 5; i++) cloud((r() - .5) * 170, 44 + r() * 18, (r() - .5) * 170, 2.4 + r() * 2, locName + i);

    placePlayer(0, 34, Math.PI);
    hudCity(st, locName);
  }

  /* 自然披挂：近山竹丛 + 树簇 + 石组 + 花圃 */
  function dressNature(st, R, r, flavor, seed) {
    var lod = LOD();
    var kinds = flavor === 'pass' ? ['pine', 'pine', 'green', 'autumn'] : ['green', 'green', 'pink', 'autumn', 'red'];
    function clearOf(x, z) {
      if (Math.abs(x) < 14 && z > -70 && z < 62) return false;  // 主街带
      if (Math.abs(z - 16) < 8 && Math.abs(x) < R * 0.62) return false; // 横街带
      if (Math.hypot(x + 34, z - 24) < 18) return false; // 园林池
      if (Math.hypot(x - 34, z - 46) < 16) return false; // 农庄
      if (Math.hypot(x, z + 48) < 22) return false;      // 宫区
      return true;
    }
    var nT = Math.round(18 * lod);
    for (var i = 0; i < nT; i++) {
      var a = r() * 6.28, d = R * (0.38 + r() * 0.42);
      var x = Math.sin(a) * d, z = Math.cos(a) * d;
      if (!clearOf(x, z)) continue;
      treeCluster(x, z, kinds, seed + 'tc' + i);
    }
    var nB = Math.round(10 * lod);
    for (var b = 0; b < nB; b++) {
      var a2 = r() * 6.28, d2 = R * (0.66 + r() * 0.2);
      var bx = Math.sin(a2) * d2, bz = Math.cos(a2) * d2;
      if (!clearOf(bx, bz)) continue;
      bambooGrove(bx, bz, seed + 'b' + b, r() > 0.4);
    }
    var nR = Math.round(8 * lod);
    for (var k = 0; k < nR; k++) {
      var a3 = r() * 6.28, d3 = R * (0.3 + r() * 0.55);
      var rx = Math.sin(a3) * d3, rz = Math.cos(a3) * d3;
      if (!clearOf(rx, rz)) continue;
      rockCluster(rx, rz, seed + 'k' + k);
    }
    for (var f = 0; f < Math.round(7 * lod); f++) {
      var a4 = r() * 6.28, d4 = R * (0.25 + r() * 0.4);
      var fx = Math.sin(a4) * d4, fz = Math.cos(a4) * d4;
      if (!clearOf(fx, fz)) continue;
      flowerPatch(fx, fz, seed + 'f' + f);
    }
  }

  /* ---------- 函谷关 · 山道雄关（图4：岩台要塞） ---------- */
  function buildPass(locName) {
    var st = STATES.qin;
    var r = rng('pass' + locName);
    var R = 105;
    newScene(0xa2cce4, 0xc4d8d0, 40, 200, Z.night);
    var paths = [
      { w: 7.5, pts: [[0, R * 0.88], [1.5, 40], [-1.5, 10], [0, -24], [0, -R * 0.88]] },
      { w: 2.6, pts: [[0, -2], [-9, -8], [-13, -16]] } // 登城小径
    ];
    var plazas = [{ x: 0, z: -8, rx: 10, rz: 8, stone: true }];
    addGround(st, R, paths, plazas, []);
    // 峡谷石壁：两侧密山
    for (var zz = -R; zz <= R; zz += 12 + r() * 6) {
      mountain(-42 - r() * 15, zz, 13 + r() * 9, 42 + r() * 28, locName + 'L' + zz);
      mountain(42 + r() * 15, zz, 13 + r() * 9, 42 + r() * 28, locName + 'R' + zz);
    }
    // 关城建在岩石台地上（图4）
    var terrH = rockTerrace(-14, -22, 30, 24, 2, 1.5, locName + 'T');
    spawn('ancient', 'SM_Env_Stair_06', st.anc, { x: -4, z: -12, ry: Math.PI, shadow: true, s: 1.8, solid: false });
    spawn('ancient', 'SM_Main_Hall', st.anc, { x: -14, z: -24, ry: 0, y: terrH, shadow: true, s: 1.05, door: { side: 0, dist: 14, interior: 'hall', label: '关府' } });
    spawn('historic', 'SM_Tower_04', st.his, { x: -24, z: -34, y: terrH, shadow: true });
    // 关墙横锁道口
    ['SM_Env_Wall_01', 'SM_Env_Wall_02'].forEach(function (nm, i) {
      for (var k = 0; k < 3; k++) spawn('ancient', nm, st.anc, { x: (i ? 1 : -1) * (6.5 + k * 4.5), z: 2, ry: Math.PI / 2, shadow: true, shrink: 0.95 });
    });
    spawn('ancient', 'SM_Warehouse_01', st.anc, { x: 14, z: -22, ry: 0.5, shadow: true, door: { side: 0, interior: 'shop', label: '武库' } });
    spawn('ancient', 'SM_Horse_Room_01', st.anc, { x: -15, z: 20, ry: 1.2, shadow: true });
    spawn('ancient', 'SM_Tathed_Cage_01', st.anc, { x: 14, z: 26, ry: -0.8, shadow: true });
    crates(10, -14, r); crates(-8, 6, r);
    // 火盆列道
    for (var zb = 38; zb >= -2; zb -= 9) {
      [-4.4, 4.4].forEach(function (bx) {
        var bowl = new T.Mesh(new T.CylinderGeometry(0.5, 0.3, 0.5, 6), nmat(0x4a4a52)); bowl.position.set(bx, 1.15, zb); bowl.castShadow = true;
        var leg = new T.Mesh(new T.CylinderGeometry(0.1, 0.14, 0.95, 5), nmat(0x3a3a42)); leg.position.set(bx, 0.45, zb);
        var fire = new T.Mesh(new T.ConeGeometry(0.3, 0.55, 5), new T.MeshLambertMaterial({ color: 0xe8a83c, emissive: 0xd06a20, emissiveIntensity: 0.9 }));
        fire.position.set(bx, 1.6, zb);
        Z.scene.add(bowl); Z.scene.add(leg); Z.scene.add(fire);
      });
    }
    // 崖根松竹
    for (var i = 0; i < Math.round(8 * LOD()); i++) {
      var side = i % 2 ? 1 : -1, pz = -70 + i * 18 + r() * 8;
      tree(side * (15 + r() * 5), pz, 'pine', locName + 'p' + i);
      if (r() > 0.5) bambooGrove(side * (17 + r() * 4), pz + 7, locName + 'pb' + i, false);
    }
    tree(8, -34, 'autumn', locName + 'aut');
    rockCluster(9, 14, locName + 'rr1'); rockCluster(-10, 34, locName + 'rr2');
    for (var c = 0; c < 4; c++) cloud((r() - .5) * 120, 46 + r() * 14, (r() - .5) * 120, 2 + r() * 2, locName + c);
    placePlayer(0, 40, Math.PI);
    hudCity(st, locName);
  }

  /* ---------- 洛邑 · 天下之中（最宏大） ---------- */
  function buildLuoyi() {
    var st = STATES.zhou;
    var rr = rng('luoyi');
    var R = 170;
    newScene(0xa9d7ec, 0xd6e8da, 70, 300, Z.night);
    var paths = [
      { w: 10, pts: [[0, R * 0.9], [0, 60], [0, -20], [0, -R * 0.72]] },
      { w: 6, pts: [[-R * 0.7, 34], [-40, 26], [0, 24], [40, 26], [R * 0.7, 34]] },
      { w: 4, pts: [[-52, 24], [-56, -6], [-58, -34]] },
      { w: 4, pts: [[52, 26], [58, -8], [60, -30]] },
      { w: 3, pts: [[22, 96], [30, 100], [30, 130]] },
      { w: 3, pts: [[-22, 96], [-34, 96], [-44, 104]] }
    ];
    var plazas = [
      { x: 0, z: 20, rx: 9, rz: 26, stone: true, rect: true },   // 神道石板
      { x: 0, z: -34, rx: 24, rz: 17, stone: true },             // 明堂广场
      { x: 0, z: -62, rx: 22, rz: 14, stone: true },
      { x: 0, z: 100, rx: 13, rz: 9 }                            // 市集沙场
    ];
    var waters = [{ x: 0, z: 44, rx: 27, rz: 5.5 }, { x: 56, z: -58, rx: 12, rz: 9 }];
    addGround(st, R, paths, plazas, waters);
    mountainRing(R, 'luoyi', [0]);

    // ---- 中轴线 ----
    spawn('historic', 'SM_Plaque_01', st.his, { x: 0, z: 86, ry: 0, shadow: true });
    lanternPost(-6, 80, 'lyg1'); lanternPost(6, 80, 'lyg2');
    // 御河（莲苇夹岸）+ 三桥
    var moat = new T.Mesh(new T.PlaneGeometry(64, 11), new T.MeshLambertMaterial({ color: 0x58a5b8, transparent: true, opacity: 0.92 }));
    moat.rotation.x = -Math.PI / 2; moat.position.set(0, 0.05, 44); Z.scene.add(moat);
    // 水面挡道，仅三处可渡：中央石道 + 东西两景观桥
    Z.colliders.push({ x: -11, z: 44, hw: 5, hd: 5.5, ry: 0, cx: 0, cz: 0 });
    Z.colliders.push({ x: 11, z: 44, hw: 5, hd: 5.5, ry: 0, cx: 0, cz: 0 });
    Z.colliders.push({ x: -30, z: 44, hw: 2, hd: 5.5, ry: 0, cx: 0, cz: 0 });
    Z.colliders.push({ x: 30, z: 44, hw: 2, hd: 5.5, ry: 0, cx: 0, cz: 0 });
    // 中央御道石渡（平铺，可行走不穿模）
    var cause = new T.Mesh(new T.BoxGeometry(12, 0.26, 13.5), nmat(0xb6b1a6));
    cause.position.set(0, 0.13, 44); cause.receiveShadow = true; Z.scene.add(cause);
    [[-6.2], [6.2]].forEach(function (cx2) {
      var curb = new T.Mesh(new T.BoxGeometry(0.5, 0.6, 13.5), nmat(0xa09a8f));
      curb.position.set(cx2[0], 0.3, 44); Z.scene.add(curb);
    });
    spawn('historic', 'SM_Bridge_01', st.his, { x: -22, z: 44, ry: Math.PI / 2, solid: false, shadow: true, s: 0.6 });
    spawn('historic', 'SM_Bridge_02', st.his, { x: 22, z: 44, ry: Math.PI / 2, solid: false, shadow: true, s: 0.6 });
    reeds(-30, 39, 'moat1'); reeds(29, 49, 'moat2'); reeds(12, 38.5, 'moat3');
    for (var lp2 = 0; lp2 < 6; lp2++) {
      var lpx = -26 + lp2 * 10.5;
      var pad = new T.Mesh(new T.CircleGeometry(0.3, 7), nmat(0x4e9e50));
      pad.rotation.x = -Math.PI / 2; pad.position.set(lpx, 0.1, 44 + (lp2 % 2 ? 2 : -2)); Z.scene.add(pad);
    }
    // 神道石雕十四座 + 道旁花树
    var scNames = ['SM_Sculpture_01', 'SM_Sculpture_02', 'SM_Sculpture_03', 'SM_Sculpture_04', 'SM_Sculpture_05', 'SM_Sculpture_06', 'SM_Sculpture_07', 'SM_Sculpture_08', 'SM_Sculpture_09', 'SM_Sculpture_10', 'SM_Sculpture_11', 'SM_Sculpture_12', 'SM_Sculpture_13', 'SM_Sculpture_14'];
    scNames.forEach(function (nm, i) {
      var side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      spawn('historic', nm, 'LowpolyHistoric_Texture_01.png', { x: side * 10, z: 36 - row * 5.2, ry: side > 0 ? -Math.PI / 2 : Math.PI / 2, shadow: true });
      if (row % 2 === 0) flowerPatch(side * 13.5, 34 - row * 5.2, 'sdf' + i);
      if (row % 3 === 0) tree(side * 16.5, 38 - row * 5.2, i % 4 < 2 ? 'pink' : 'green', 'sdt' + i);
    });
    spawn('historic', 'SM_Plaque_02', st.his, { x: 0, z: 4, ry: 0, shadow: true });
    // 明堂
    spawn('historic', 'SM_Mausoleum_02', st.his, { x: 0, z: -34, ry: 0, shadow: true, s: 1.15, door: { side: 0, dist: 18, interior: 'throne', label: '明堂' } });
    lanternPost(-13, -22, 'mt1'); lanternPost(13, -22, 'mt2');
    // 主殿群
    spawn('historic', 'SM_Palace_01', st.his, { x: 0, z: -88, ry: 0, shadow: true, door: { side: 0, dist: 15, interior: 'throne', label: '路寝正殿' } });
    spawn('historic', 'SM_Palace_02', st.his, { x: -34, z: -80, ry: 0.35, shadow: true, door: { side: 0, dist: 12, interior: 'study', label: '天禄阁' } });
    spawn('historic', 'SM_Palace_03', st.his, { x: 34, z: -80, ry: -0.35, shadow: true, door: { side: 0, dist: 12, interior: 'bedroom', label: '寝宫' } });
    spawn('historic', 'SM_Palace_04', st.his, { x: -56, z: -56, ry: 0.8, shadow: true, door: { side: 0, dist: 11, interior: 'hall', label: '偏殿' } });
    spawn('historic', 'SM_Palace_05', st.his, { x: 58, z: -52, ry: -0.8, shadow: true, door: { side: 0, dist: 11, interior: 'storeroom', label: '守藏室' } });
    // 宫后竹林岩组（近景层次）
    bambooGrove(-46, -88, 'lyb1', true); bambooGrove(48, -86, 'lyb2', true);
    rockCluster(-22, -70, 'lyr1'); rockCluster(24, -68, 'lyr2');
    treeCluster(-46, -70, ['pink', 'green'], 'lyt1'); treeCluster(48, -68, ['autumn', 'green'], 'lyt2');
    // 陵坛双塔
    spawn('historic', 'SM_Mausoleum_01', st.his, { x: -66, z: -20, ry: 0.9, shadow: true });
    spawn('historic', 'SM_Mausoleum_03', st.his, { x: 70, z: -16, ry: -0.9, shadow: true });
    spawn('historic', 'SM_Tower_01', st.his, { x: -30, z: -46, shadow: true });
    spawn('historic', 'SM_Tower_03', st.his, { x: 30, z: -46, shadow: true });
    spawn('historic', 'SM_Threater_Stage_01', st.his, { x: -44, z: 12, ry: 1.2, shadow: true });
    // 十亭两苑（配石板亭基与花木）
    ['SM_Gazeebo_01', 'SM_Gazeebo_02', 'SM_Gazeebo_03', 'SM_Gazeebo_04', 'SM_Gazeebo_05', 'SM_Gazeebo_06', 'SM_Gazeebo_07', 'SM_Gazeebo_08', 'SM_Gazeebo_09', 'SM_Gazeebo_10'].forEach(function (nm, i) {
      var side = i < 5 ? -1 : 1, k = i % 5;
      var gx = side * (86 + (k % 2) * 16), gz = 26 - k * 18;
      spawn('ancient', 'SM_Env_Floor_06', st.anc, { x: gx, z: gz, ry: side * -0.5, solid: false, s: 1.5 });
      spawn('historic', nm, st.his, { x: gx, z: gz, ry: side * -0.5, shadow: true });
      if (k % 2 === 0) { flowerPatch(gx + side * 6, gz + 3, 'gzf' + i); tree(gx - side * 7, gz - 5, ['pink', 'autumn', 'green'][i % 3], 'gzt' + i); }
      if (k === 2) bambooGrove(gx + side * 9, gz - 8, 'gzb' + i, false);
    });
    spawn('historic', 'SM_Plaque_03', st.his, { x: -64, z: 28, ry: Math.PI / 2, shadow: true });
    spawn('historic', 'SM_Plaque_04', st.his, { x: 64, z: 28, ry: -Math.PI / 2, shadow: true });
    spawn('historic', 'SM_Plaque_05', st.his, { x: 0, z: -114, ry: 0, shadow: true });
    // 红墙长殿
    ['SM_Env_Building_14', 'SM_Env_Building_15', 'SM_Env_Building_16', 'SM_Env_Building_17', 'SM_Env_Building_18', 'SM_Env_Building_19'].forEach(function (nm, i) {
      var side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      spawn('historic', nm, st.his, { x: side * (24 + row * 2), z: -14 - row * 26, ry: side > 0 ? Math.PI / 2 : -Math.PI / 2, shadow: true });
    });
    // 四隅鼓楼
    [['SM_Env_Building_20', -78, 64], ['SM_Env_Building_26', 78, 64], ['SM_Env_Building_21', -92, -66], ['SM_Env_Building_25', 92, -66]].forEach(function (row) {
      spawn('historic', row[0], st.his, { x: row[1], z: row[2], shadow: true });
      bambooGrove(row[1] + 8, row[2] + 6, 'dr' + row[1], false);
    });
    // 百官署：西列三署、东列两署，避开御道与市集
    var offX = -122;
    ['SM_Building_01', 'SM_Building_02', 'SM_Building_03'].forEach(function (nm, i) {
      var inf = info('historic', nm);
      spawn('historic', nm, st.his, { x: offX + inf.size.x / 2, z: 70 + (i % 2) * 20, ry: 0.15 * (i - 1), shadow: true, door: i === 1 ? { side: 0, interior: 'hall', label: '官署' } : null });
      offX += inf.size.x + 7;
    });
    var offXe = 40;
    ['SM_Building_04', 'SM_Building_05'].forEach(function (nm, i) {
      var inf = info('historic', nm);
      spawn('historic', nm, st.his, { x: offXe + inf.size.x / 2, z: 70 + i * 20, ry: -0.15, shadow: true });
      offXe += inf.size.x + 8;
    });
    ['SM_Building_06', 'SM_Building_07'].forEach(function (nm, i) {
      spawn('historic', nm, st.his, { x: i ? -108 : -92, z: 108 + i * 20, shadow: true });
      bambooGrove(i ? -116 : -84, 116 + i * 16, 'b67' + i, false);
    });
    // 外郭南沿列署
    var offX2 = -78;
    ['SM_Building_08', 'SM_Building_09', 'SM_Building_10', 'SM_Building_11', 'SM_Building_12', 'SM_Building_13', 'SM_Building_14', 'SM_Building_15'].forEach(function (nm, i) {
      var inf = info('historic', nm);
      spawn('historic', nm, st.his, { x: offX2 + inf.size.x / 2, z: 148 + (i % 2) * 12, ry: Math.PI, shadow: true });
      offX2 += inf.size.x + 6;
    });

    // ---- 外郭市里 ----
    var texA = st.anc;
    var rowEp = planShopRow(['SM_Resturant_02', 'SM_Bookstore_01', 'SM_Clothing_Store_02', 'SM_Tea_Stall_01', 'SM_Grocery_01'], 1, 92, 3);
    var rowWp = planShopRow(['SM_Hotel_01', 'SM_Bookstore_02', 'SM_Pharmacy_01', 'SM_Jewlry_Store_02', 'SM_Butcher_01'], -1, 92, 3);
    // 市里支路手绘（在 ground 已画好主路系统之上，市街支路走沙场）—— 已包含在 paths 内不可再画，直接落建筑
    rowEp.placements.forEach(function (p) { p.x += 15; p.doorX += 15; });
    rowWp.placements.forEach(function (p) { p.x -= 15; p.doorX -= 15; });
    buildShopRow(st, texA, rowEp, rr);
    buildShopRow(st, texA, rowWp, rr);
    for (var i = 0; i < 6; i++) {
      spawn('ancient', 'SM_Env_Stall_' + pad2(1 + Math.floor(rr() * 15)), texA, { x: (rr() - .5) * 20, z: 96 + rr() * 34, ry: rr() * 6.28, solid: false });
      crates((rr() - .5) * 18, 96 + rr() * 34, rr);
    }
    for (var lp3 = 0; lp3 < 4; lp3++) lanternPost((rr() - .5) * 24, 92 + rr() * 40, 'luoyilp' + lp3);


    // 御苑池（图5 全套）
    pondOrganic(56, -58, 12, 9, 'luoyipond', {});
    spawn('historic', 'SM_Bridge_03', st.his, { x: 56, z: -58, ry: 0.35, solid: false, shadow: true, s: 0.5 });
    spawn('ancient', 'SM_Env_Floor_07', texA, { x: 42, z: -66, ry: 0.7, solid: false, s: 1.5 });
    spawn('ancient', 'SM_Gazeebo_01', texA, { x: 42, z: -66, ry: 0.7, shadow: true });
    treeCluster(66, -70, ['autumn', 'red'], 'lypt');

    // 西郊农庄带
    farmstead(st, -38, 100, 0.2, 'lyfs1');
    farmstead(st, -58, 116, -0.15, 'lyfs2');
    spawn('ancient', 'SM_Parlor_01', texA, { x: -70, z: 96, ry: 2.6, shadow: true });

    dressNature(st, R, rr, 'luoyi', 'luoyi');
    for (var ci = 0; ci < 7; ci++) cloud((rr() - .5) * 220, 52 + rr() * 22, (rr() - .5) * 220, 2.6 + rr() * 2.4, 'lyc' + ci);

    placePlayer(0, 66, Math.PI);
    hudCity(st, '洛邑');
  }

  /* 素材全量可用性由「营造清单」承担：全部 457 件模型进托盘由玩家营造，
     不再在洛邑陈列未用构件（原公输坊陈列院已移除）。 */
  /* ---------------- 室内配方 ---------------- */
  var ITEX = 'LowpolyHistoricInterior_Texture_01.png';
  function roomShell(w, d, h, texA, night) {
    // floor
    var fl = new T.Mesh(new T.BoxGeometry(w, 0.2, d), nmat(0x8a6a48)); fl.position.y = -0.1; fl.receiveShadow = true; Z.scene.add(fl);
    // walls
    var wallM = nmat(0xcfc4ae), beamM = nmat(0x6a4a30);
    [[-w / 2, 0, 0.24, d], [w / 2, 0, 0.24, d]].forEach(function (cfg) {
      var m = new T.Mesh(new T.BoxGeometry(cfg[2], h, cfg[3]), wallM); m.position.set(cfg[0], h / 2, cfg[1]); Z.scene.add(m);
      Z.colliders.push({ x: cfg[0], z: cfg[1], hw: cfg[2] / 2 + 0.3, hd: cfg[3] / 2, ry: 0, cx: 0, cz: 0 });
    });
    var back = new T.Mesh(new T.BoxGeometry(w, h, 0.24), wallM); back.position.set(0, h / 2, -d / 2); Z.scene.add(back);
    Z.colliders.push({ x: 0, z: -d / 2, hw: w / 2, hd: 0.42, ry: 0, cx: 0, cz: 0 });
    // front wall with door gap
    [[-w / 4 - 1, w / 2 - 2], [w / 4 + 1, w / 2 - 2]].forEach(function (cfg) {
      var m = new T.Mesh(new T.BoxGeometry(cfg[1], h, 0.24), wallM); m.position.set(cfg[0], h / 2, d / 2); Z.scene.add(m);
      Z.colliders.push({ x: cfg[0], z: d / 2, hw: cfg[1] / 2, hd: 0.42, ry: 0, cx: 0, cz: 0 });
    });
    // lintel above door gap + door leaf (keeps the camera ray inside the room)
    var lin = new T.Mesh(new T.BoxGeometry(4.2, h - 2.3, 0.24), wallM); lin.position.set(0, 2.3 + (h - 2.3) / 2, d / 2); Z.scene.add(lin);
    spawn('ancient', 'SM_Env_Door_28', texA, { x: 0, z: d / 2 - 0.05, ry: 0, solid: false, s: 1.18 });
    Z.colliders.push({ x: 0, z: d / 2, hw: 2.2, hd: 0.42, ry: 0, cx: 0, cz: 0 });
    Z.roomD = d; Z.roomW = w;
    // ceiling beams
    for (var bx = -w / 2 + 1.5; bx < w / 2; bx += 2.2) {
      var bm = new T.Mesh(new T.BoxGeometry(0.18, 0.24, d), beamM); bm.position.set(bx, h - 0.2, 0); bm.userData.ceil = true; Z.scene.add(bm);
    }
    var ceil = new T.Mesh(new T.BoxGeometry(w, 0.14, d), nmat(0x5a3e28)); ceil.position.y = h + 0.05; ceil.userData.ceil = true; Z.scene.add(ceil);
    // lattice windows on back wall (ancient env windows!)
    spawn('ancient', 'SM_Env_Window_04', texA, { x: -w / 4, z: -d / 2 + 0.28, ry: 0, solid: false });
    spawn('ancient', 'SM_Env_Window_09', texA, { x: w / 4, z: -d / 2 + 0.28, ry: 0, solid: false });
    // warm light
    var warm = new T.PointLight(0xffd9a0, night ? 26 : 14, 0, 1.6); warm.position.set(0, h - 0.8, 0); Z.scene.add(warm);
    var warm2 = new T.PointLight(0xffc880, 8, 0, 1.8); warm2.position.set(w / 3, 2, d / 3); Z.scene.add(warm2);
  }

  var INTERIORS = {
    study: function () { // 书房 · 天禄阁
      roomShell(16, 12, 4.6, STATES.zhou.anc, Z.night);
      spawn('interior', 'SM_Desk_04', ITEX, { x: -3, z: -3.4, ry: 0.25, shadow: true });
      spawn('interior', 'SM_Chair_03', ITEX, { x: -3, z: -1.9, ry: Math.PI + 0.25, shadow: true });
      spawn('interior', 'SM_Partition_01', ITEX, { x: -7.2, z: -4.4, ry: Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Screen_01', ITEX, { x: 3.4, z: -5.2, ry: 0, shadow: true });
      spawn('interior', 'SM_Table_02', ITEX, { x: 3.2, z: -1.4, ry: 0.1, shadow: true });
      spawn('interior', 'SM_Case_01', ITEX, { x: 6.6, z: -3.6, ry: -0.5, shadow: true });
      spawn('interior', 'SM_Case_04', ITEX, { x: 6.9, z: -1.6, ry: -0.2, shadow: true });
      spawn('interior', 'SM_Table_05', ITEX, { x: -5.8, z: 2.6, ry: 0, shadow: true });
      spawn('interior', 'SM_Couch_01', ITEX, { x: 1.2, z: 2.8, ry: Math.PI, shadow: true });
      spawn('interior', 'SM_Desk_01', ITEX, { x: 5.6, z: 2.4, ry: -1.2, shadow: true });
      spawn('interior', 'SM_Chair_01', ITEX, { x: 5.4, z: 3.7, ry: Math.PI - 1.2, shadow: true });
    },
    bedroom: function () { // 寝宫
      roomShell(16, 12, 4.6, STATES.zhou.anc, Z.night);
      spawn('interior', 'SM_Bed_01', ITEX, { x: -4.6, z: -3.4, ry: Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Screen_02', ITEX, { x: -0.6, z: -4.6, ry: 0.2, shadow: true });
      spawn('interior', 'SM_Table_11', ITEX, { x: 3, z: -4.4, ry: 0, shadow: true });
      spawn('interior', 'SM_Chair_02', ITEX, { x: 3, z: -3.1, ry: Math.PI, shadow: true });
      spawn('interior', 'SM_Cloth_Rack_01', ITEX, { x: 6.6, z: -3.8, ry: -0.6, shadow: true });
      spawn('interior', 'SM_Cabinet_02', ITEX, { x: 6.9, z: -0.6, ry: -Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Couch_02', ITEX, { x: 0.6, z: 1.2, ry: 0, shadow: true });
      spawn('interior', 'SM_Table_09', ITEX, { x: -3.4, z: 2.4, ry: 0, shadow: true });
      spawn('interior', 'SM_Case_02', ITEX, { x: -6.8, z: 2.6, ry: 1.1, shadow: true });
      spawn('interior', 'SM_Cover_05', ITEX, { x: -6.9, z: -0.8, ry: Math.PI / 2, shadow: true });
    },
    throne: function () { // 明堂 · 正殿
      roomShell(20, 15, 5.4, STATES.zhou.anc, Z.night);
      // dais
      var dais = new T.Mesh(new T.BoxGeometry(6.4, 0.55, 4.2), nmat(0x8a2f22)); dais.position.set(0, 0.27, -5.2); dais.receiveShadow = true; Z.scene.add(dais);
      spawn('interior', 'SM_Chair_04', ITEX, { x: 0, z: -5.8, ry: 0, shadow: true, y: 0.55 });
      spawn('interior', 'SM_Screen_03', ITEX, { x: 0, z: -6.9, ry: 0, shadow: true, y: 0.55 });
      spawn('interior', 'SM_Table_04', ITEX, { x: -1.8, z: -4.6, ry: 0, shadow: true, y: 0.55 });
      spawn('interior', 'SM_Table_03', ITEX, { x: 1.8, z: -4.6, ry: 0, shadow: true, y: 0.55 });
      spawn('interior', 'SM_Cover_01', ITEX, { x: -5.5, z: -3, ry: Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Cover_02', ITEX, { x: 5.5, z: -3, ry: -Math.PI / 2, shadow: true });
      // 百官席
      for (var i = 0; i < 3; i++) {
        spawn('interior', 'SM_Table_08', ITEX, { x: -3.2, z: -0.6 + i * 2.4, ry: Math.PI / 2, shadow: true });
        spawn('interior', 'SM_Table_07', ITEX, { x: 3.2, z: -0.6 + i * 2.4, ry: -Math.PI / 2, shadow: true });
      }
      spawn('interior', 'SM_Screen_05', ITEX, { x: -8.6, z: -5.6, ry: 0.9, shadow: true });
      spawn('interior', 'SM_Table_01', ITEX, { x: 8.2, z: -5.8, ry: 0, shadow: true });
    },
    hall: function () { // 官署正堂
      roomShell(16, 12, 4.8, STATES.zhou.anc, Z.night);
      spawn('interior', 'SM_Desk_02', ITEX, { x: 0, z: -4, ry: 0, shadow: true });
      spawn('interior', 'SM_Chair_01', ITEX, { x: 0, z: -5.2, ry: 0, shadow: true });
      spawn('interior', 'SM_Screen_04', ITEX, { x: 0, z: -5.8, ry: 0, shadow: true });
      spawn('interior', 'SM_Cabinet_01', ITEX, { x: -6.8, z: -4, ry: Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Table_06', ITEX, { x: -3.4, z: 0.8, ry: 0, shadow: true });
      spawn('interior', 'SM_Chair_02', ITEX, { x: -3.4, z: 2.2, ry: Math.PI, shadow: true });
      spawn('interior', 'SM_Table_10', ITEX, { x: 6.4, z: -4.2, ry: -0.4, shadow: true });
      spawn('interior', 'SM_Case_03', ITEX, { x: 6.8, z: -1.4, ry: -Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Cover_03', ITEX, { x: -6.9, z: 1.4, ry: Math.PI / 2, shadow: true });
    },
    inn: function () { // 酒楼客栈大堂
      roomShell(18, 13, 4.8, STATES.zhou.anc, Z.night);
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
        spawn('interior', 'SM_Table_06', ITEX, { x: -4.5 + i * 9, z: -2.6 + j * 4.6, ry: 0.1 * (i + j), shadow: true });
        spawn('interior', 'SM_Chair_01', ITEX, { x: -4.5 + i * 9, z: -1.3 + j * 4.6, ry: Math.PI, shadow: true });
        spawn('interior', 'SM_Chair_02', ITEX, { x: -4.5 + i * 9, z: -3.9 + j * 4.6, ry: 0, shadow: true });
      }
      spawn('interior', 'SM_Cabinet_03', ITEX, { x: -8.2, z: -5, ry: Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Cabinet_04', ITEX, { x: 8.2, z: -5, ry: -Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Cover_04', ITEX, { x: 0, z: -5.9, ry: 0, shadow: true });
      spawn('interior', 'SM_Bed_04', ITEX, { x: 7.6, z: 3.4, ry: -Math.PI / 2, shadow: true });
    },
    home: function () { // 民居
      roomShell(12, 10, 4.2, STATES.zhou.anc, Z.night);
      spawn('interior', 'SM_Bed_02', ITEX, { x: -3.6, z: -2.8, ry: Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Table_08', ITEX, { x: 1.6, z: -2.4, ry: 0, shadow: true });
      spawn('interior', 'SM_Chair_02', ITEX, { x: 1.6, z: -1.1, ry: Math.PI, shadow: true });
      spawn('interior', 'SM_Case_02', ITEX, { x: 4.8, z: -3.2, ry: -0.8, shadow: true });
      spawn('interior', 'SM_Cloth_Rack_01', ITEX, { x: -4.9, z: 1.8, ry: 1.2, shadow: true });
    },
    shop: function () { // 铺面
      roomShell(13, 10, 4.2, STATES.zhou.anc, Z.night);
      spawn('interior', 'SM_Desk_03', ITEX, { x: 0, z: -2.8, ry: 0, shadow: true });
      spawn('interior', 'SM_Chair_01', ITEX, { x: 0, z: -4, ry: 0, shadow: true });
      spawn('interior', 'SM_Cabinet_01', ITEX, { x: -5.4, z: -3.2, ry: Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Case_01', ITEX, { x: 5, z: -3.4, ry: -0.9, shadow: true });
      spawn('interior', 'SM_Case_03', ITEX, { x: 5.4, z: -1, ry: -Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Table_02', ITEX, { x: -3.8, z: 0.6, ry: 0.2, shadow: true });
    },
    storeroom: function () { // 守藏室（老聃上班的地方 · 陈列全部箱柜）
      roomShell(16, 12, 4.6, STATES.zhou.anc, Z.night);
      ['SM_Case_01', 'SM_Case_02', 'SM_Case_03', 'SM_Case_04'].forEach(function (nm, i) {
        spawn('interior', nm, ITEX, { x: -6 + i * 3.6, z: -4.2, ry: 0, shadow: true });
      });
      ['SM_Cabinet_01', 'SM_Cabinet_02', 'SM_Cabinet_03', 'SM_Cabinet_04'].forEach(function (nm, i) {
        spawn('interior', nm, ITEX, { x: -6.9, z: -2 + i * 2.1, ry: Math.PI / 2, shadow: true });
      });
      spawn('interior', 'SM_Desk_01', ITEX, { x: 2.4, z: 0.4, ry: 0.15, shadow: true });
      spawn('interior', 'SM_Chair_03', ITEX, { x: 2.4, z: 1.7, ry: Math.PI, shadow: true });
      spawn('interior', 'SM_Bed_03', ITEX, { x: 6.4, z: 2.6, ry: -Math.PI / 2, shadow: true });
      spawn('interior', 'SM_Table_07', ITEX, { x: -2.6, z: 2.2, ry: 0, shadow: true });
    }
  };

  function enterInterior(kind, label, key) {
    if (Z.B) cancelGhost();
    Z.sel = null; Z.tp = null; Z.actor = null; Z.selNpc = null;
    Z.interiorFrom = { city: Z.cityKey, px: Z.player.position.x, pz: Z.player.position.z, yaw: Z.player.rotation.y };
    Z.mode = 'interior';
    Z.intKey = key ? (Z.cityKey + '#室' + key) : null;
    newScene(0x0f0c08, 0x0f0c08, 30, 90, true);
    Z.scene.background = new T.Color(0x141008);
    Z.scene.fog = null;
    var amb = new T.AmbientLight(0xffe8c8, 0.5); Z.scene.add(amb);
    (INTERIORS[kind] || INTERIORS.hall)();
    var dHalf = (Z.roomD || 12) / 2;
    Z.exitDoor = { x: 0, z: dHalf - 1.1, label: '出门' };
    // 玩家在此屋陈设过的家具随格局一并落位
    Z.placedRoots = [];
    if (Z.intKey) buildsOf(Z.cityKey).items.forEach(spawnBuild);
    placePlayer(0, dHalf - 2.8, Math.PI);
    Z.camDist = 5.2; Z.camPitch = 0.4;
    hudInterior(label || '室内');
  }
  function exitInterior() {
    var back = Z.interiorFrom; Z.interiorFrom = null;
    Z.mode = 'city';
    Z.intKey = null; Z.intPlan = false;
    Z.camDist = 12;
    var loc = Z.lastLoc;
    buildFor(loc);
    if (back) {
      placePlayer(back.px, back.pz, back.yaw);
      Z.bcam.fx = back.px; Z.bcam.fz = back.pz; Z.camSnap = true;
    }
    updateBuildHud();
  }

  /* ---------------- location routing ---------------- */
  function buildFor(locName) {
    Z.cityKey = locName;
    if (Z.B) cancelGhost();
    Z.sel = null;
    var cfg = LOC2[locName] || { st: 'zhou', flavor: 'luoyi' };
    chunkReset();
    Z.spawnSeq = 0; Z.natSeq = 0; Z.inRecipe = true;
    if (cfg.flavor === 'luoyi') buildLuoyi();
    else if (cfg.flavor === 'pass') buildPass(locName);
    else buildTown(cfg.st, locName, cfg.flavor);
    Z.inRecipe = false;
    ensureChunks(0, 0);
    applyBuilds();
    spawnAmbient(locName);
    clearGhostMats();
    ensureGrid();
    if (bHud.wrap) updateBuildHud();
  }
  function showLocation(locName, night) {
    if (!Z.ready) { Z.pending = [locName, night]; loadAll(); return; }
    Z.night = !!night;
    if (Z.mode === 'interior') return; // don't yank player out of a room
    if (Z.cityKey === locName && Z.scene) return;
    buildFor(locName);
  }

  /* ---------------- renderer / pane ---------------- */
  function ensureRenderer() {
    if (Z.rnd) return;
    var cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
    var rnd = new T.WebGLRenderer({ canvas: cv, antialias: true });
    rnd.setPixelRatio(Math.min(isTouch() ? (PERF.low ? 1.25 : 1.5) : 2, window.devicePixelRatio || 1));
    if (isTouch() && PERF.low) rnd.shadowMap.enabled = false;
    rnd.shadowMap.enabled = true; rnd.shadowMap.type = T.PCFShadowMap;
    Z.cv = cv; Z.rnd = rnd;
    Z.cam = new T.PerspectiveCamera(55, 2, 0.3, 700); // near 抬高换取远处深度精度，防近平面岩席闪抖
    bindInput(cv);
    bindBuildInput(cv);
    // iOS Safari：掐掉页面滚动/双击缩放等默认手势，确保指针事件独占画布
    cv.addEventListener('touchstart', function (e) { if (Z.expanded) e.preventDefault(); }, { passive: false });
    cv.addEventListener('touchmove', function (e) { if (Z.expanded) e.preventDefault(); }, { passive: false });
    requestAnimationFrame(tick);
  }

  var hud = null, joyEl = null, joyKnob = null, doorBtn = null, expBtn = null, locChip = null, eraChip = null, tipEl = null, loadEl = null;
  function ensureHud(host) {
    if (hud && hud.parentNode === host) return;
    hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;inset:0;pointer-events:none;font-family:inherit;z-index:5';
    // location chip
    locChip = document.createElement('div');
    locChip.style.cssText = 'position:absolute;top:8px;left:10px;padding:3px 10px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:10px;letter-spacing:.15em;border-radius:0;backdrop-filter:blur(2px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    hud.appendChild(locChip);
    // 纪年：地名框下方一行半透明小字（不进框），太长自动跑马灯
    eraChip = document.createElement('div');
    eraChip.style.cssText = 'position:absolute;top:34px;left:12px;max-width:62%;font-size:8.5px;letter-spacing:.06em;color:rgba(200,200,194,.5);text-shadow:0 1px 3px rgba(0,0,0,.85);white-space:nowrap;overflow:hidden;pointer-events:none;display:none';
    hud.appendChild(eraChip);
    applyChip();
    /* 顶排按钮统一进一个 flex 行：原先各自写死 right 偏移，而「游历」还在另一层，
       两层互不知情，展开后必然叠在一起。改成同一行由 flex 排布，永不重叠。 */
    var tr0 = document.createElement('div');
    tr0.style.cssText = 'position:absolute;top:8px;right:10px;display:flex;gap:6px;align-items:center;pointer-events:auto';
    hud.appendChild(tr0); Z._topRow = tr0;
    // expand button
    expBtn = document.createElement('div');
    expBtn.style.cssText = 'order:9;padding:2px 8px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:9.5px;letter-spacing:.1em;cursor:pointer;pointer-events:auto;border-radius:0';
    expBtn.onclick = function () { Z.toggleExpand(); };
    tr0.appendChild(expBtn);
    var xBtn = document.createElement('div');
    xBtn.style.cssText = 'order:10;padding:2px 8px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:9.5px;cursor:pointer;pointer-events:auto;border-radius:0;display:none';
    xBtn.textContent = '×';
    xBtn.title = '完全隐藏三维横条（文字区右上可随时展开）';
    xBtn.onclick = function () {
      if (window.ZJ3D_closePane) { ZJ3D_closePane(); return; }
      try { localStorage.setItem('zj3d_hide', '1'); } catch (e) { }
      if (window.ZJ3D_onExpand) window.ZJ3D_onExpand();
    };
    tr0.appendChild(xBtn); Z._xBtn = xBtn;
    // 低配模式（仅手机）：更低渲染分辨率 + 关阴影 + 锁30帧
    if (isTouch()) {
      var lowBtn = document.createElement('div');
      var lowSty = function () {
        lowBtn.style.cssText = 'order:3;padding:2px 8px;background:' + (PERF.low ? 'rgba(201,155,63,.35)' : 'rgba(6,6,6,.62)') + ';border:1px solid rgba(236,236,232,.22);color:' + (PERF.low ? '#060606' : '#d9d9d4') + ';font-size:9.5px;letter-spacing:.1em;cursor:pointer;pointer-events:auto;border-radius:0;display:' + (Z.expanded ? 'block' : 'none');
      };
      lowSty();
      lowBtn.textContent = '低配';
      lowBtn.onclick = function () { PERF.low = !PERF.low; perfSave(); applyPerf(); lowSty(); };
      tr0.appendChild(lowBtn); Z._lowBtn = lowSty;
      var txtBtn = document.createElement('div');
      txtBtn.style.cssText = 'order:2;padding:2px 8px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:9.5px;letter-spacing:.1em;cursor:pointer;pointer-events:auto;border-radius:0;display:' + (Z.expanded ? 'block' : 'none');
      txtBtn.textContent = '纯文字';
      txtBtn.title = '关闭三维，纯文字游玩（最省电），可随时开回';
      txtBtn.onclick = function () { try { localStorage.setItem('zj3d_off', '1'); } catch (e) { } location.reload(); };
      tr0.appendChild(txtBtn); Z._txtBtn = txtBtn;
    }
    // door button
    doorBtn = document.createElement('div');
    doorBtn.style.cssText = 'position:absolute;left:50%;bottom:18%;transform:translateX(-50%);padding:5px 18px;background:rgba(6,6,6,.7);-webkit-backdrop-filter:blur(4px) saturate(140%);backdrop-filter:blur(4px) saturate(140%);border:1px solid rgba(236,236,232,.28);color:#d9d9d4;font-size:11px;letter-spacing:.25em;cursor:pointer;pointer-events:auto;display:none;border-radius:0';
    doorBtn.onclick = function () { tryDoor(); };
    hud.appendChild(doorBtn);
    // joystick (mobile)
    joyEl = document.createElement('div');
    joyEl.style.cssText = 'position:absolute;right:18px;bottom:16px;width:96px;height:96px;border-radius:50%;background:rgba(6,6,6,.4);border:1px solid rgba(236,236,232,.22);pointer-events:auto;display:none;touch-action:none';
    joyKnob = document.createElement('div');
    joyKnob.style.cssText = 'position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:rgba(201,155,63,.5);border:1px solid rgba(236,236,232,.5)';
    joyEl.appendChild(joyKnob);
    bindJoy(joyEl);
    hud.appendChild(joyEl);
    // tip
    tipEl = document.createElement('div');
    tipEl.style.cssText = 'position:absolute;bottom:8px;left:12px;color:rgba(200,200,194,.5);font-size:9px;letter-spacing:.12em;text-align:left';
    hud.appendChild(tipEl);
    // loading overlay
    loadEl = document.createElement('div');
    loadEl.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;color:#c99b3f;font-size:11px;letter-spacing:.3em;background:rgba(6,6,6,.5)';
    hud.appendChild(loadEl);
    host.appendChild(hud);
    ensureBuildHud(host);
  }
  function isTouch() { return matchMedia('(pointer:coarse)').matches; }
  /* 手机上画面左上角正压着台前调度那一列的第一枚小窗（3D场景），地名片和纪年那行
     怎么摆都在它底下。这两样在正文顶栏和状态栏里都各有一份，画面里这份是重复的，
     窄屏干脆不出——比互相让位干净。760 这个界是宿主那边缩略列的媒体查询边界。 */
  function chipOn() { return !!Z.chipText && innerWidth > 760; }
  function updateHud() {
    if (!hud) return;
    if (Z.loading) { loadEl.style.display = 'flex'; loadEl.textContent = '营造天下 ' + Math.round(Z.prog * 100) + '%'; }
    else if (Z.failed) { loadEl.style.display = 'flex'; loadEl.textContent = '三维资材未至 · 以简册代之'; }
    else loadEl.style.display = 'none';
    expBtn.textContent = Z.expanded ? '收起' : '营造'; // 展开默认即营造；游历是营造内的切换项
    if (Z._xBtn) {
      Z._xBtn.style.display = 'block'; /* 关闭钮常驻：任何档位都能一键收起 */
      /* 位置交给 flex 行，不再写死偏移 */
    }
    if (Z._lowBtn) Z._lowBtn();
    if (Z._txtBtn) Z._txtBtn.style.display = Z.expanded ? 'block' : 'none';
    if (locChip) { // 与顶排按钮同行：限宽到右侧最近按钮之前，放不下省略号截断
      locChip.style.display = chipOn() ? 'block' : 'none';
      var lm = Infinity;
      [bHud.goldChip, Z._txtBtn, bHud.viewBtn, expBtn].forEach(function (el) {
        if (!el || el.style.display === 'none') return;
        var r = el.getBoundingClientRect();
        if (r.width && r.left < lm) lm = r.left;
      });
      var hr = hud.getBoundingClientRect();
      locChip.style.maxWidth = isFinite(lm) ? Math.max(46, lm - hr.left - 18) + 'px' : '';
      if (eraChip && eraChip._full) fitScroll(eraChip, eraChip._full);
    }
    joyEl.style.display = (Z.expanded && isTouch() && !inBuild()) ? 'block' : 'none';
    tipEl.innerHTML = !Z.expanded ? '' : (inBuild()
      ? (isTouch() ? '拖转视角 · 双指缩放 · 点选格位' : '拖转视角 · 滚轮缩放 · WASD 平移 · 点选格位')
      : (isTouch() ? '左摇杆移动 · 拖屏转视角' : 'WASD 移动 · 拖拽转视角 · 滚轮缩放'));
    if (bHud.wrap) updateBuildHud();
  }
  function applyChip() {
    if (!locChip) return;
    locChip.textContent = Z.chipText || '';
    locChip.style.display = chipOn() ? 'block' : 'none';
    applyEra();
  }
  /* 纪年不进地名框——单独一行半透明小字浮在框下面；太长就无缝跑马灯滚动。 */
  function applyEra() {
    if (!eraChip) return;
    var era = Z.eraText || '';
    if (!era || !chipOn()) { eraChip.style.display = 'none'; eraChip.textContent = ''; eraChip._full = ''; return; }
    eraChip.style.display = 'block';
    eraChip._full = era;
    fitScroll(eraChip, era);
  }
  /* 放不下就无缝跑马灯：静态量宽度，溢出则首尾相接两段匀速平移；幂等，不频繁重启动画。 */
  function fitScroll(el, full) {
    if (!el || !full) return;
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:nowrap;letter-spacing:inherit;font:inherit';
    probe.textContent = full;
    el.appendChild(probe);
    var need = probe.scrollWidth;
    el.removeChild(probe);
    var wantMarq = need > el.clientWidth + 2;
    var hasMarq = !!el.querySelector('.zj3dMarq');
    if (wantMarq === hasMarq && (hasMarq || el.textContent === full)) return;
    el.textContent = '';
    if (!wantMarq) { el.textContent = full; return; }
    var track = document.createElement('div');
    track.className = 'zj3dMarq';
    track.style.cssText = 'display:inline-flex;white-space:nowrap;will-change:transform';
    var s1 = document.createElement('span'); s1.textContent = full;
    var s2 = document.createElement('span'); s2.textContent = full; s2.style.paddingLeft = '30px'; s2.setAttribute('aria-hidden', 'true');
    track.appendChild(s1); track.appendChild(s2);
    el.appendChild(track);
    track.style.animationDuration = Math.max(6, (need + 30) / 26) + 's';
  }
  Z.setEra = function (s) { s = (s == null ? '' : String(s)); if (Z.eraText === s) return; Z.eraText = s; applyEra(); };
  function hudCity(st, locName) {
    Z.chipText = locName + ' · ' + st.name + (LOC2[locName] && LOC2[locName].flavor === 'luoyi' ? '王城' : '');
    applyChip();
  }
  function hudInterior(label) { Z.chipText = Z.cityKey + ' · ' + label; applyChip(); }

  /* ---------------- input ---------------- */
  function bindInput(cv) {
    window.addEventListener('keydown', function (e) {
      if (!Z.expanded) return;
      var k = e.key.toLowerCase();
      if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      Z.keys[k] = true;
      if (inBuild()) {
        if (k === 'r') rotateGhost(1);
        if (k === 'enter' && Z.B) confirmGhost();
        if (k === 'escape') { if (Z.B) cancelGhost(); else { Z.sel = null; updateBuildHud(); } }
      } else if (k === 'e') tryDoor();
      if ('wasd '.indexOf(k) >= 0 || k.indexOf('arrow') === 0) e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { Z.keys[e.key.toLowerCase()] = false; });
    var drag = null;
    cv.addEventListener('pointerdown', function (e) {
      Z.lastInputT = performance.now();
      if (!Z.expanded || inBuild()) return;
      drag = { x: e.clientX, y: e.clientY, yaw: Z.camYaw, pitch: Z.camPitch, moved: 0 };
      try { cv.setPointerCapture(e.pointerId); } catch (err) { }
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
      Z.camYaw = drag.yaw - (e.clientX - drag.x) * 0.0065;
      Z.camPitch = Math.max(0.08, Math.min(1.15, drag.pitch + (e.clientY - drag.y) * 0.004));
    });
    cv.addEventListener('pointerup', function (e) {
      var wasClick = drag && drag.moved < 7;
      drag = null;
      if (!wasClick || inBuild() || Z.mode !== 'city') return;
      if (Z.pawns.length) {
        var ph = pickAt(e, Z.pawns.map(function (p) { return p.root; }));
        var pw = ph && pawnOf(ph);
        if (pw) { openNpcBar(pw); return; }
      }
      // 游历亦可点屋而入：射线沿途查找第一栋有门建筑（穿透牌坊石雕等无门小品）
      var list = Z.cityRoots.concat(Z.placedRoots);
      if (list.length) {
        var host = Z.cv.getBoundingClientRect();
        var nx = ((e.clientX - host.left) / host.width) * 2 - 1;
        var ny = -((e.clientY - host.top) / host.height) * 2 + 1;
        _ray.setFromCamera(new T.Vector2(nx, ny), Z.cam);
        _ray.far = Infinity;
        var hits = _ray.intersectObjects(list, true);
        var tried = [];
        for (var hi = 0; hi < hits.length && tried.length < 4; hi++) {
          var root = hits[hi].object;
          while (root && !(root.userData && (root.userData.spawnSeq || root.userData.buildId))) root = root.parent;
          if (!root || tried.indexOf(root) >= 0) continue;
          tried.push(root);
          var d = doorFor(root);
          if (d && d.interior) {
            var seq = root.userData.spawnSeq, bid = root.userData.buildId;
            enterInterior(d.interior, d.label, seq != null ? 's' + seq : (bid != null ? 'b' + bid : null));
            return;
          }
        }
      }
    });
    cv.addEventListener('wheel', function (e) {
      if (!Z.expanded || inBuild()) return;
      e.preventDefault();
      Z.camDist = Math.max(4, Math.min(26, Z.camDist + e.deltaY * 0.012));
    }, { passive: false });
  }
  function bindJoy(el) {
    el.addEventListener('pointermove', function () { Z.lastInputT = performance.now(); });
    var active = null;
    function setKnob(dx, dy) { joyKnob.style.transform = 'translate(' + dx * 28 + 'px,' + dy * 28 + 'px)'; }
    el.addEventListener('pointerdown', function (e) {
      active = e.pointerId; try { el.setPointerCapture(e.pointerId); } catch (err) { } handle(e);
    });
    el.addEventListener('pointermove', handle);
    function handle(e) {
      if (active === null) return;
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      var len = Math.hypot(dx, dy) || 1;
      if (len > 1) { dx /= len; dy /= len; }
      Z.joy.on = true; Z.joy.x = dx; Z.joy.y = dy;
      setKnob(dx, dy);
    }
    function end() { active = null; Z.joy.on = false; Z.joy.x = Z.joy.y = 0; setKnob(0, 0); }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  /* ---------------- doors ---------------- */
  function nearestDoor() {
    if (!Z.player) return null;
    var px = Z.player.position.x, pz = Z.player.position.z, best = null, bd = 9;
    if (Z.mode === 'interior' && Z.exitDoor) {
      var d0 = Math.hypot(px - Z.exitDoor.x, pz - Z.exitDoor.z);
      if (d0 < 3.2) return { exit: true, label: Z.exitDoor.label };
      return null;
    }
    for (var i = 0; i < Z.doors.length; i++) {
      var d = Z.doors[i];
      if (!d.interior) continue;
      var dist = Math.hypot(px - d.x, pz - d.z);
      if (dist < 3.4 && dist < bd) { bd = dist; best = d; } // 半径放宽：有地台阶梯者亦可及门
    }
    return best;
  }
  function tryDoor() {
    var d = nearestDoor(); if (!d) return;
    if (d.exit) exitInterior();
    else enterInterior(d.interior, d.label, d.seq != null ? 's' + d.seq : (d.bid != null ? 'b' + d.bid : null));
  }

  /* ---------------- movement + camera ---------------- */
  var clock = new T.Clock();
  var _ray = new T.Raycaster();
  function tick() {
    requestAnimationFrame(tick);
    /* 收起即休眠：停渲染停演算。中原侧此前没有这一段，宿主调 O.sleep() 让另一侧引擎
       让路时它照样满帧跑，两台引擎同时渲染——手机上直接掉到个位数帧率。 */
    if (Z.asleep) {
      if (!Z._torn && Z.scene && performance.now() - Z._sleptAt > 90000) {
        try { disposeScene(); } catch (e) { }
        Z._torn = true;
      }
      return;
    }
    if (!Z.scene || !Z.rnd || !Z.cv.isConnected) return;
    if (isTouch()) { // 手机：操作中全速，静止或低配 30fps；打字时 ~8fps 让键盘丝滑
      var nowT = performance.now();
      var ae = document.activeElement;
      var typing = ae && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT');
      var gap = typing ? 120 : ((!PERF.low && (nowT - (Z.lastInputT || 0) < 1200 || Z.anims.length || Z.orders.length || Z.B)) ? 0 : 30);
      if (gap && tick._lt && nowT - tick._lt < gap) return;
      tick._lt = nowT;
    }
    var dt = Math.min(0.05, clock.getDelta());
    var t = performance.now() / 1000;
    if (Z.player) {
      var mx = 0, mz = 0;
      if (Z.expanded && !inBuild()) {
        if (Z.keys['w'] || Z.keys['arrowup']) mz -= 1;
        if (Z.keys['s'] || Z.keys['arrowdown']) mz += 1;
        if (Z.keys['a'] || Z.keys['arrowleft']) mx -= 1;
        if (Z.keys['d'] || Z.keys['arrowright']) mx += 1;
        if (Z.joy.on) { mx += Z.joy.x; mz += Z.joy.y; }
      }
      var moving = (mx !== 0 || mz !== 0);
      if (moving) {
        var len = Math.hypot(mx, mz); mx /= len; mz /= len;
        // move relative to camera yaw (camera sits at +yaw side, looks back at player)
        var sy = Math.sin(Z.camYaw), cy = Math.cos(Z.camYaw);
        var wx = mx * cy + mz * sy, wz = -mx * sy + mz * cy;
        var sp = (Z.mode === 'interior' ? 3.4 : 6.2) * dt;
        var nx = Z.player.position.x + wx * sp, nz = Z.player.position.z + wz * sp;
        var lim = Z.mode === 'interior' ? 11 : 2000;
        nx = Math.max(-lim, Math.min(lim, nx)); nz = Math.max(-lim, Math.min(lim, nz));
        // collision: circle vs rotated AABBs
        for (var i = 0; i < Z.colliders.length; i++) {
          var c = Z.colliders[i];
          var dx = nx - c.x, dz = nz - c.z;
          var cs = Math.cos(-c.ry), sn = Math.sin(-c.ry);
          var lx = dx * cs - dz * sn - (c.cx || 0), lz = dx * sn + dz * cs - (c.cz || 0);
          var pr = 0.55;
          if (Math.abs(lx) < c.hw + pr && Math.abs(lz) < c.hd + pr) {
            var ox = c.hw + pr - Math.abs(lx), oz = c.hd + pr - Math.abs(lz);
            if (ox < oz) lx += (lx > 0 ? ox : -ox); else lz += (lz > 0 ? oz : -oz);
            var rx = (lx + (c.cx || 0)) * cs + (lz + (c.cz || 0)) * sn, rz = -(lx + (c.cx || 0)) * sn + (lz + (c.cz || 0)) * cs;
            nx = c.x + rx; nz = c.z + rz;
          }
        }
        Z.player.position.x = nx; Z.player.position.z = nz;
        Z.player.rotation.y = Math.atan2(wx, wz);
        Z.player.position.y = Math.abs(Math.sin(t * 9)) * 0.05;
      } else if (Z.player) {
        Z.player.position.y *= 0.8;
      }
      // door prompt
      var nd = nearestDoor();
      if (doorBtn) {
        if (nd && Z.expanded && !inBuild()) { doorBtn.style.display = 'block'; doorBtn.textContent = nd.exit ? '⾨ 出门' : '⾨ 入 · ' + nd.label + (isTouch() ? '' : '（E）'); }
        else doorBtn.style.display = 'none';
      }
    }
    if (Z.mode === 'city' && Z.ready && Z.scene) { pawnTick(dt, t); rigTick(dt); animTick(dt); }
    if (Z.ready && Z.scene && Z.player) { if (!Z.escortBusy) escortTick(dt, t); eventTick(dt, t); }
    // 分块旷野随焦点生成
    if ((tick._ck = (tick._ck || 0) + dt) > 0.4) {
      tick._ck = 0;
      if (Z.mode === 'city' && Z.scene) {
        var _fx = inBuild() ? Z.bcam.fx : (Z.player ? Z.player.position.x : 0);
        var _fz = inBuild() ? Z.bcam.fz : (Z.player ? Z.player.position.z : 0);
        ensureChunks(_fx, _fz);
      }
    }
    // camera
    var cam = Z.cam;
    if (inBuild()) {
      buildCamTick(dt);
      if ((tick._e = (tick._e || 0) + dt) > 1) { tick._e = 0; updateBuildHud(); }
    } else if (Z.expanded && Z.player) {
      var py = Z.mode === 'interior' ? 1.6 : 2.2;
      var cd = Z.camDist;
      var head = new T.Vector3(Z.player.position.x, py, Z.player.position.z);
      var dir = new T.Vector3(Math.sin(Z.camYaw) * Math.cos(Z.camPitch), Math.sin(Z.camPitch), Math.cos(Z.camYaw) * Math.cos(Z.camPitch));
      // occlusion: pull camera in front of anything blocking the line of sight
      if (Z.camSnap) Z.scene.updateMatrixWorld(true); // fresh scene: matrices not yet computed
      _ray.set(head, dir); _ray.far = cd;
      var hits = _ray.intersectObjects(Z.scene.children, true);
      for (var hi = 0; hi < hits.length; hi++) {
        var isPl = false, oo = hits[hi].object;
        while (oo) { if (oo.userData && oo.userData.isPlayer) { isPl = true; break; } oo = oo.parent; }
        if (isPl) continue;
        cd = Math.max(2.4, hits[hi].distance * 0.92);
        break;
      }
      var tgt = head.clone().addScaledVector(dir, cd);
      if (Z.camSnap) { cam.position.copy(tgt); Z.camSnap = false; }
      else cam.position.lerp(tgt, 0.2);
      cam.lookAt(head);
    } else {
      // ambient orbit of city center (indoors: gentle sway, stays inside the room)
      if (Z.mode === 'interior') {
        var ang0 = Math.sin(t * 0.16) * 0.5;
        cam.position.set(Math.sin(ang0) * 4.2, 2.5 + Math.sin(t * 0.1) * 0.3, Math.cos(ang0) * 4.2);
        cam.lookAt(0, 1.3, -2);
      } else {
        var ang = t * 0.05;
        cam.position.set(Math.sin(ang) * 62, 30 + Math.sin(t * 0.11) * 2, Math.cos(ang) * 62);
        cam.lookAt(0, 4, 0);
      }
    }
    Z.rnd.render(Z.scene, cam);
  }

  /* ============================================================
     无垠旷野 · 分块生成（Minecraft 式）
     以镜头/玩家为中心 64m 分块动态生成四野：草地、树竹岩花、丘山、御道延伸
     每块由种子确定，重访一致；远块自动卸载
     ============================================================ */
  var CHUNK = 64, CH = { map: {}, mats: null, pg: null, rg: null, rm: null, lastKey: '' };
  Z.__CH = CH;
  function cityRad() {
    var cfg = LOC2[Z.cityKey] || {};
    return cfg.flavor === 'luoyi' ? 170 : (cfg.flavor === 'pass' ? 105 : 118);
  }
  function paintPlain(x, g, seedstr) {
    // 原野底色：干湿区块 + 枯草黄斑 + 泥土露地 + 草色细斑 + 碎点，摆脱一片死绿
    var rr = rng('pp' + seedstr);
    x.fillStyle = '#' + g.getHexString(); x.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 5; i++) {
      var cc = g.clone().offsetHSL((rr() - .5) * 0.05, (rr() - .5) * 0.1, (rr() - .5) * 0.08);
      x.fillStyle = '#' + cc.getHexString(); x.globalAlpha = 0.2;
      x.beginPath(); x.arc(rr() * 256, rr() * 256, 60 + rr() * 90, 0, 7); x.fill();
    }
    var dry = g.clone().offsetHSL(-0.07, -0.18, 0.07);
    for (var d = 0; d < 26; d++) {
      var dc = dry.clone().offsetHSL((rr() - .5) * 0.02, 0, (rr() - .5) * 0.08);
      x.fillStyle = '#' + dc.getHexString(); x.globalAlpha = 0.16 + rr() * 0.14;
      x.beginPath(); x.arc(rr() * 256, rr() * 256, 7 + rr() * 20, 0, 7); x.fill();
    }
    var mud = g.clone().lerp(new T.Color(0x8f7952), 0.72);
    for (var m2 = 0; m2 < 14; m2++) {
      var mc = mud.clone().offsetHSL(0, (rr() - .5) * 0.06, (rr() - .5) * 0.08);
      x.fillStyle = '#' + mc.getHexString(); x.globalAlpha = 0.15 + rr() * 0.15;
      x.beginPath(); x.arc(rr() * 256, rr() * 256, 4 + rr() * 10, 0, 7); x.fill();
    }
    for (var i3 = 0; i3 < 120; i3++) {
      var c3 = g.clone().offsetHSL((rr() - .5) * 0.03, (rr() - .5) * 0.05, (rr() - .5) * 0.1);
      x.fillStyle = '#' + c3.getHexString(); x.globalAlpha = 0.3;
      x.beginPath(); x.arc(rr() * 256, rr() * 256, 4 + rr() * 16, 0, 7); x.fill();
    }
    for (var s2 = 0; s2 < 240; s2++) {
      var c4 = g.clone().offsetHSL(0, 0, (rr() - .5) * 0.22);
      x.fillStyle = '#' + c4.getHexString(); x.globalAlpha = 0.4;
      x.fillRect(rr() * 256, rr() * 256, 1 + rr() * 2, 1 + rr() * 2);
    }
    x.globalAlpha = 1;
  }
  function chunkMats(st) {
    if (CH.mats) return CH.mats;
    CH.mats = [];
    for (var v = 0; v < 5; v++) {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var x = c.getContext('2d');
      paintPlain(x, new T.Color(st.grass), 'v' + v + st.name);
      var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
      CH.mats.push(new T.MeshLambertMaterial({ map: t }));
    }
    return CH.mats;
  }
  function chunkReset() {
    CH.map = {}; CH.mats = null; CH.lastKey = '';
  }
  function makeChunk(kx, kz, st) {
    var g = new T.Group();
    var key = kx + '_' + kz;
    Z.chunkCtx = key; Z.chunkN = 0;
    var r = rng('ck' + Z.cityKey + '|' + key);
    var x0 = kx * CHUNK, z0 = kz * CHUNK;
    var mats = chunkMats(st);
    if (!CH.pg) CH.pg = new T.PlaneGeometry(CHUNK + 0.5, CHUNK + 0.5);
    var plane = new T.Mesh(CH.pg, mats[hash('m' + key) % 5]);
    plane.rotation.x = -Math.PI / 2;
    plane.rotation.z = (hash('r' + key) % 4) * Math.PI / 2;
    plane.position.set(x0, -0.07 - ((kx + kz) & 1) * 0.02, z0); // 奇偶错高：重叠带内两块地皮不再共面打架
    plane.receiveShadow = true;
    plane.userData.shared = true;
    g.add(plane);
    // 御道向南北无限延伸
    if (Math.abs(x0) < CHUNK / 2 + 5) {
      if (!CH.rg) CH.rg = new T.PlaneGeometry(9, CHUNK + 0.5);
      if (!CH.rm) CH.rm = new T.MeshLambertMaterial({ color: 0xd9c69a });
      var road = new T.Mesh(CH.rg, CH.rm);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, -0.04, z0); // 抬离地皮最高层 3cm，远景不打架
      road.userData.shared = true;
      g.add(road);
    }
    var R = cityRad();
    function outside(x, z) { return Math.max(Math.abs(x), Math.abs(z)) > R * 1.0; }
    var nColl = 0;
    // 草木散布
    var n = 3 + (hash('n' + key) % 5);
    for (var i = 0; i < n; i++) {
      var px = x0 + (r() - .5) * CHUNK, pz = z0 + (r() - .5) * CHUNK;
      if (!outside(px, pz)) continue;
      if (Math.abs(px) < 8) continue; // 御道净空
      var t0 = r(), obj = null;
      if (t0 < 0.48) obj = tree(px, pz, ['green', 'green', 'pink', 'autumn', 'pine'][Math.floor(r() * 5)], 'ck' + key + i);
      else if (t0 < 0.64) obj = bambooGrove(px, pz, 'ckb' + key + i, r() > 0.5);
      else if (t0 < 0.78) obj = rock(px, pz, 0.5 + r() * 1.4, 'ck' + key + i);
      else if (t0 < 0.9) obj = outcrop(px, pz, 'cko' + key + i);
      else obj = flowerPatch(px, pz, 'ckf' + key + i);
      if (obj) { if (obj.parent) obj.parent.remove(obj); g.add(obj); }
    }
    // 远郊丘山（离城越远越多，御道两侧留空）
    var aprons = [];
    var distC = Math.hypot(x0, z0);
    if (distC > R + 20) {
      var hillP = Math.min(0.6, 0.22 + (distC - R) / 800);
      if (r() < hillP) {
        var mw = 10 + r() * 20, mh = 8 + r() * (distC > R * 2 ? 40 : 22);
        var px2 = x0 + (r() - .5) * (CHUNK - mw), pz2 = z0 + (r() - .5) * (CHUNK - mw);
        if (Math.abs(px2) > mw + 10) {
          var mg = mountainGroup(mw, mh, 'ck' + key);
          mg.position.set(px2, 0, pz2);
          g.add(mg);
          aprons.push({ x: px2, z: pz2, w: mw });
          // 山脚乱石
          var nsc = 6 + (hash('sc' + key) % 5);
          for (var s3 = 0; s3 < nsc; s3++) {
            var sa = r() * 6.28, sd = mw * (0.85 + r() * 0.8);
            var ro = rock(px2 + Math.sin(sa) * sd, pz2 + Math.cos(sa) * sd, 0.25 + r() * 0.8, 'sc' + key + s3);
            if (ro) { if (ro.parent) ro.parent.remove(ro); g.add(ro); }
          }
          Z.colliders.push({ x: px2, z: pz2, hw: mw * 0.55, hd: mw * 0.55, ry: 0, cx: 0, cz: 0, chunk: key });
          nColl++;
        }
      }
    }
    // 山根砾石裙：本块丘山与邻近城山的灰岩色一并漫到地皮上
    (Z.mtnSpots || []).forEach(function (sp) {
      if (Math.abs(sp.x - x0) < CHUNK / 2 + sp.w * 1.7 && Math.abs(sp.z - z0) < CHUNK / 2 + sp.w * 1.7) aprons.push(sp);
    });
    if (aprons.length) {
      var c2 = document.createElement('canvas'); c2.width = c2.height = 256;
      var xg = c2.getContext('2d');
      paintPlain(xg, new T.Color(st.grass), 'mk' + key);
      var GRY = ['#8f959e', '#7d838c', '#9aa0a8', '#84868f'];
      aprons.forEach(function (sp) {
        var cu = ((sp.x - x0) / CHUNK + 0.5) * 256, cv = ((sp.z - z0) / CHUNK + 0.5) * 256;
        var rpx = Math.min((sp.w * 1.9) / CHUNK * 256, 150);
        for (var a2 = 0; a2 < 150; a2++) {
          var an = r() * 6.28, dd = Math.pow(r(), 1.35) * rpx * 1.6;
          var frin = dd > rpx * 0.85; // 外缘砾石渐稀、混入黄土
          xg.fillStyle = frin ? (r() > 0.5 ? '#93815f' : '#8a7a58') : GRY[(a2 + ((r() * 4) | 0)) % 4];
          xg.globalAlpha = frin ? 0.22 + r() * 0.18 : 0.4 + r() * 0.3;
          xg.beginPath(); xg.arc(cu + Math.sin(an) * dd, cv + Math.cos(an) * dd, 3 + r() * (frin ? 9 : 14), 0, 7); xg.fill();
        }
      });
      xg.globalAlpha = 1;
      var t2 = new T.CanvasTexture(c2); t2.colorSpace = T.SRGBColorSpace;
      plane.material = new T.MeshLambertMaterial({ map: t2 });
      plane.rotation.z = 0;
      plane.userData.ownMat = true;
    }
    Z.scene.add(g);
    Z.chunkCtx = null;
    return { g: g, key: key };
  }
  function disposeChunk(key) {
    var ch = CH.map[key];
    if (!ch) return;
    delete CH.map[key];
    if (ch.g.parent) ch.g.parent.remove(ch.g);
    ch.g.traverse(function (o) {
      if (o.isMesh && o.geometry && !o.userData.shared) o.geometry.dispose();
      if (o.userData.ownMat && o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    });
    Z.colliders = Z.colliders.filter(function (c) { return c.chunk !== key; });
    var pre = 'c' + key + '#';
    Z.natureRoots = Z.natureRoots.filter(function (r2) { return !(r2.userData.natId && r2.userData.natId.indexOf(pre) === 0); });
  }
  function ensureChunks(fx, fz) {
    if (!Z.scene || Z.mode !== 'city' || !Z.ready) return;
    var key0 = Math.round(fx / CHUNK) + '_' + Math.round(fz / CHUNK);
    if (key0 === CH.lastKey && Object.keys(CH.map).length) return;
    CH.lastKey = key0;
    var st = STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
    var ccx = Math.round(fx / CHUNK), ccz = Math.round(fz / CHUNK), RAD = 3;
    var want = {};
    for (var dx = -RAD; dx <= RAD; dx++) for (var dz = -RAD; dz <= RAD; dz++) {
      var key = (ccx + dx) + '_' + (ccz + dz);
      want[key] = 1;
      if (!CH.map[key]) CH.map[key] = makeChunk(ccx + dx, ccz + dz, st);
    }
    Object.keys(CH.map).forEach(function (k) { if (!want[k]) disposeChunk(k); });
  }

  /* ============================================================
     营造模式（Pocket Build 式上帝视角造城）
     网格吸附 · 幽灵预览 · 旋转确认 · 国库金 · 每城存档 · 敕令通报 AI
     ============================================================ */
  var CELL = 2;
  Z.view = 'build';          // 默认营造；游历为可切换选项（仅城市场景生效）
  try { var _v0 = localStorage.getItem('zj3d_view2'); if (_v0 === 'walk' || _v0 === 'build') Z.view = _v0; } catch (e) { }
  Z.bcam = { fx: 0, fz: 20, yaw: 0.6, pitch: 0.85, dist: 60 };
  Z.B = null;                // 幽灵态 {item, obj, cx, cz, ry, valid, movingId}
  Z.sel = null;              // 选中的已建 {rec, root}
  Z.placedRoots = [];
  function inBuild() { return Z.expanded && Z.view === 'build' && (Z.mode === 'city' || (Z.mode === 'interior' && Z.intPlan)); }

  /* ---------------- 国库 ---------------- */
  var ECON = { gold: 5000, stamp: 0, RATE: 30 }; // 岁入 金30/分钟
  try {
    var _e = JSON.parse(localStorage.getItem('zj3d_econ') || '{}');
    if (typeof _e.gold === 'number') ECON.gold = _e.gold;
    if (typeof _e.stamp === 'number') ECON.stamp = _e.stamp;
  } catch (e) { }
  function econSave() { try { localStorage.setItem('zj3d_econ', JSON.stringify({ gold: ECON.gold, stamp: ECON.stamp })); } catch (e) { } }
  function econTick() {
    var now = Date.now();
    if (!ECON.stamp) ECON.stamp = now;
    var mins = (now - ECON.stamp) / 60000;
    if (mins >= 1) {
      var gain = Math.min(3000, Math.floor(mins) * ECON.RATE);
      ECON.gold += gain; ECON.stamp = now; econSave();
    }
  }

  /* ---------------- 建造存档 ---------------- */
  var BUILDS = {};
  try { BUILDS = JSON.parse(localStorage.getItem('zj3d_builds_v1') || '{}'); } catch (e) { }
  function buildsSave() {
    try {
      var cur = {}; try { cur = JSON.parse(localStorage.getItem('zj3d_builds_v1') || '{}') || {}; } catch (e2) { }
      for (var k in BUILDS) if (Object.prototype.hasOwnProperty.call(BUILDS, k)) cur[k] = BUILDS[k];
      localStorage.setItem('zj3d_builds_v1', JSON.stringify(cur));
    } catch (e) { }
  }
  function buildsOf(loc) {
    if (Z.mode === 'interior' && Z.intKey) loc = Z.intKey; // 室内陈设各屋一档
    return BUILDS[loc] || (BUILDS[loc] = { seq: 0, items: [] });
  }

  /* ---------------- 名录 ---------------- */
  var CNUM = ['零', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  function cnum(n) { return CNUM[n] || ('之' + n); }
  var FAM_CN = {
    Base: '台基', Brick: '砖脊', Door: '门户', Floor: '铺地', Misc: '杂件', Pillar: '立柱', Roof: '屋顶',
    Stair: '阶梯', Stairs: '阶梯', Stall: '市摊', Wall: '墙垣', Window: '窗棂', Wood: '木料',
    Building: '楼体', Extra: '饰件',
    Bridge: '石桥', Gazeebo: '亭榭', Mausoleum: '陵台', Palace: '宫殿', Plaque: '牌楼',
    Sculpture: '石雕', Threater: '戏台', Tower: '宝塔',
    Bed: '床榻', Cabinet: '立柜', Case: '木箱', Chair: '座椅', Cloth: '衣架', Couch: '矮榻',
    Cover: '罩门', Desk: '书案', Partition: '多宝阁', Screen: '屏风', Table: '案几'
  };
  function dispName(pack, name) {
    var lbl = shopLabel(name);
    if (lbl !== '屋舍') {
      var m0 = name.match(/_(\d+)$/);
      return lbl + (m0 && +m0[1] > 1 ? '·' + cnum(+m0[1]) : '');
    }
    var m = name.match(/^SM_(?:Env_)?([A-Za-z]+?)(?:_[A-Za-z]+?)?_?(\d+)?$/);
    var fam = m && FAM_CN[m[1]] ? FAM_CN[m[1]] : '构件';
    var idx = m && m[2] ? +m[2] : 0;
    return fam + (idx ? '·' + (idx <= 10 ? cnum(idx) : idx) : '');
  }
  function priceOf(pack, name) {
    var inf = info(pack, name); if (!inf) return 50;
    var vol = Math.max(0.05, inf.size.x * inf.size.y * inf.size.z);
    return Math.max(8, Math.round(Math.pow(vol, 0.62) * 10));
  }
  /* 草木庭石（程序化）目录 */
  var FLORA = {
    tree_green: { disp: '常青树', price: 30, make: function (x, z, s) { return tree(x, z, 'green', s); } },
    tree_pink: { disp: '樱树', price: 45, make: function (x, z, s) { return tree(x, z, 'pink', s); } },
    tree_autumn: { disp: '金枫', price: 40, make: function (x, z, s) { return tree(x, z, 'autumn', s); } },
    tree_red: { disp: '红枫', price: 40, make: function (x, z, s) { return tree(x, z, 'red', s); } },
    tree_pine: { disp: '苍松', price: 30, make: function (x, z, s) { return tree(x, z, 'pine', s); } },
    bamboo: { disp: '竹丛', price: 35, make: function (x, z, s) { return bambooGrove(x, z, s, true); } },
    rocks: { disp: '岩组', price: 20, make: function (x, z, s) { rockCluster(x, z, s); return null; } },
    flowers: { disp: '花圃', price: 15, make: function (x, z, s) { return flowerPatch(x, z, s); } },
    hay: { disp: '草垛', price: 12, make: function (x, z, s) { haystack(x, z, s); return null; } },
    lantern: { disp: '灯柱', price: 25, make: function (x, z, s) { return lanternPost(x, z, s); } },
    crates: { disp: '果箱', price: 8, make: function (x, z, s) { crates(x, z, rng(s)); return null; } },
    reeds: { disp: '芦苇', price: 18, make: function (x, z, s) { return reeds(x, z, s); } },
    outcrop: { disp: '露岩', price: 45, make: function (x, z, s) { return outcrop(x, z, s); } },
    jiashan: { disp: '假山', price: 90, make: function (x, z, s) { return jiashan(x, z, s); } },
    pond: { disp: '池塘', price: 70, make: function (x, z, s) { pondOrganic(x, z, 5.5, 4, s); return null; } }
  };
  /* 道路（程序化，8×8 米一段——与御道同宽，可旋转拼接） */
  var RW = 8; // 一段道路的边长（4×4 格）
  function roadBase(h, c) { var m = new T.Mesh(new T.BoxGeometry(RW, h, RW), nmat(c)); m.position.y = h / 2 + 0.015; return m; }
  var ROADS = {
    shiban: {
      disp: '石板道', price: 60, make: function (x, z, s) {
        var r = rng('rd' + s), g = new T.Group(), cs = [0x9aa0a8, 0x8f959e, 0xa8adb4, 0x848a92];
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
          var p = new T.Mesh(new T.BoxGeometry(1.82 + r() * 0.12, 0.1, 1.82 + r() * 0.12), nmat(cs[(i * 4 + j + ((r() * 4) | 0)) % 4]));
          p.position.set(-3 + i * 2 + (r() - .5) * 0.1, 0.07, -3 + j * 2 + (r() - .5) * 0.1);
          p.rotation.y = (r() - .5) * 0.08; g.add(p);
        }
        g.position.set(x, 0, z); Z.scene.add(g); return g;
      }
    },
    hangtu: {
      disp: '夯土官道', price: 25, make: function (x, z, s) {
        var r = rng('rd' + s), g = new T.Group();
        g.add(roadBase(0.08, 0xc9b183));
        for (var i = 0; i < 14; i++) {
          var d = new T.Mesh(new T.BoxGeometry(0.4 + r() * 0.7, 0.016, 0.4 + r() * 0.7), nmat(r() > 0.5 ? 0xb99f72 : 0xd4bd8f));
          d.position.set((r() - .5) * 7, 0.104, (r() - .5) * 7); d.rotation.y = r() * 3; g.add(d);
        }
        g.position.set(x, 0, z); Z.scene.add(g); return g;
      }
    },
    shashi: {
      disp: '砂石道', price: 30, make: function (x, z, s) {
        var r = rng('rd' + s), g = new T.Group(), cs = [0xa8a294, 0x968f80, 0xb5ae9e];
        g.add(roadBase(0.07, 0xb0a894));
        for (var i = 0; i < 30; i++) {
          var p = new T.Mesh(new T.IcosahedronGeometry(0.06 + r() * 0.1, 0), nmat(cs[i % 3]));
          p.position.set((r() - .5) * 7.4, 0.1, (r() - .5) * 7.4);
          p.rotation.set(r() * 3, r() * 3, r() * 3); p.scale.y = 0.5; g.add(p);
        }
        g.position.set(x, 0, z); Z.scene.add(g); return g;
      }
    },
    nitu: {
      disp: '泥泞小径', price: 15, make: function (x, z, s) {
        var r = rng('rd' + s), g = new T.Group();
        g.add(roadBase(0.06, 0x7a6142));
        for (var i = 0; i < 9; i++) {
          var d = new T.Mesh(new T.CylinderGeometry(0.3 + r() * 0.5, 0.3 + r() * 0.5, 0.018, 7), nmat(0x5c4a33));
          d.position.set((r() - .5) * 6.6, 0.085, (r() - .5) * 6.6); d.scale.x = 0.7 + r() * 0.5; g.add(d);
        }
        g.position.set(x, 0, z); Z.scene.add(g); return g;
      }
    },
    zhandao: {
      disp: '木栈道', price: 80, make: function (x, z, s) {
        var r = rng('rd' + s), g = new T.Group(), ws = [0x9a6f45, 0x8a6440, 0xa5794e];
        for (var b = 0; b < 3; b++) {
          var beam = new T.Mesh(new T.BoxGeometry(0.24, 0.16, RW), nmat(0x77522f));
          beam.position.set(b === 0 ? -3.3 : b === 1 ? 0 : 3.3, 0.12, 0); g.add(beam);
        }
        for (var i = 0; i < 16; i++) {
          var p = new T.Mesh(new T.BoxGeometry(7.5, 0.08, 0.4), nmat(ws[(i + ((r() * 3) | 0)) % 3]));
          p.position.set((r() - .5) * 0.06, 0.24, -3.75 + i * 0.5); p.rotation.y = (r() - .5) * 0.02; g.add(p);
        }
        g.position.set(x, 0, z); Z.scene.add(g); return g;
      }
    },
    shanjing: {
      disp: '山径垫步', price: 40, make: function (x, z, s) {
        var r = rng('rd' + s), g = new T.Group(), cs = [0x969ca6, 0x8b919c, 0xa2a8b2];
        for (var i = 0; i < 9; i++) {
          var p = new T.Mesh(new T.CylinderGeometry(0.55 + r() * 0.4, 0.65 + r() * 0.4, 0.1, 5 + ((r() * 3) | 0)), nmat(cs[i % 3]));
          p.position.set((r() - .5) * 4.4, 0.07, -3.4 + i * 0.85 + (r() - .5) * 0.5);
          p.rotation.y = r() * 3; g.add(p);
        }
        g.position.set(x, 0, z); Z.scene.add(g); return g;
      }
    },
    yudao: {
      disp: '御道', price: 70, make: function (x, z, s) {
        var g = new T.Group();
        g.add(roadBase(0.08, 0xd9c69a));
        for (var b = 0; b < 2; b++) {
          var curb = new T.Mesh(new T.BoxGeometry(0.28, 0.14, RW), nmat(0xb99e6d));
          curb.position.set(b ? 3.85 : -3.85, 0.09, 0); g.add(curb);
        }
        g.position.set(x, 0, z); Z.scene.add(g); return g;
      }
    }
  };
  /* 营造总账：先尽情兴作/拆除，一键「奏报」集中入史 */
  var LEDGER = { built: [], razed: [] };
  try { var _lg = JSON.parse(localStorage.getItem('zj3d_ledger') || 'null'); if (_lg && _lg.built && _lg.razed) LEDGER = _lg; } catch (e) { }
  function ledgerSave() { try { localStorage.setItem('zj3d_ledger', JSON.stringify(LEDGER)); } catch (e) { } }
  function ledgerAdd(kind, entry) { LEDGER[kind].push(entry); ledgerSave(); updateBuildHud(); }
  function ledgerCount() { return LEDGER.built.length + LEDGER.razed.length; }
  function submitLedger() {
    if (!ledgerCount()) return;
    function group(arr) {
      var m = {}, out = [];
      arr.forEach(function (e) {
        var k = (e.v || '') + e.d;
        if (!m[k]) { m[k] = { d: e.d, v: e.v || '', n: 0, g: 0 }; out.push(m[k]); }
        m[k].n++; m[k].g += (e.g || 0);
      });
      return out;
    }
    var cities = [];
    LEDGER.built.concat(LEDGER.razed).forEach(function (e) { if (e.c && cities.indexOf(e.c) < 0) cities.push(e.c); });
    var parts = [];
    if (LEDGER.built.length) {
      var spent = 0; LEDGER.built.forEach(function (e) { spent += e.g || 0; });
      parts.push('兴作——' + group(LEDGER.built).map(function (e) { return e.v + e.d + (e.n > 1 ? '×' + e.n : ''); }).join('、') + '，共支金' + spent);
    }
    if (LEDGER.razed.length) {
      var back = 0; LEDGER.razed.forEach(function (e) { back += e.g || 0; });
      parts.push('除旧——' + group(LEDGER.razed).map(function (e) { return e.v + e.d + (e.n > 1 ? '×' + e.n : ''); }).join('、') + (back ? '，共返金' + back : ''));
    }
    var msg = '（周天子颁营造清单于太史，本轮于' + (cities.join('、') || Z.cityKey) + '：' + parts.join('；') + '。国库现余金' + ECON.gold + '，役夫既发，坊市为之一新。）';
    if (window.ZJ3D_say) ZJ3D_say(msg);
    LEDGER = { built: [], razed: [] }; ledgerSave(); updateBuildHud();
  }
  var CATALOG = null;
  function catalog() {
    if (CATALOG) return CATALOG;
    function pack2items(pk, filt) {
      return Z.packs[pk].names.filter(filt).sort().map(function (nm) {
        return { kind: 'model', pack: pk, name: nm, disp: dispName(pk, nm), price: priceOf(pk, nm) };
      });
    }
    CATALOG = [
      { tab: '市井', items: pack2items('ancient', function (n) { return n.indexOf('_Env_') < 0 || /_Env_Stall_/.test(n); }) },
      { tab: '王室', items: pack2items('historic', function (n) { return n.indexOf('_Env_') < 0; }) },
      { tab: '家具', items: pack2items('interior', function () { return true; }) },
      {
        tab: '构件', items: pack2items('ancient', function (n) { return n.indexOf('_Env_') >= 0 && !/_Env_Stall_/.test(n); })
          .concat(pack2items('historic', function (n) { return n.indexOf('_Env_') >= 0; }))
      },
      {
        tab: '道路', items: Object.keys(ROADS).map(function (k) {
          return { kind: 'road', name: k, disp: ROADS[k].disp, price: ROADS[k].price };
        })
      },
      {
        tab: '草木', items: Object.keys(FLORA).map(function (k) {
          return { kind: 'flora', name: k, disp: FLORA[k].disp, price: FLORA[k].price };
        })
      },
      {
        tab: '人物', items: Object.keys(NPC_TYPES).map(function (k) {
          return { kind: 'npc', name: k, disp: NPC_TYPES[k].disp, price: NPC_TYPES[k].price };
        }).concat(Object.keys(HIST).map(function (k) {
          return { kind: 'npc', name: k, disp: HIST[k].disp, price: HIST[k].price };
        }))
      },
      {
        tab: '军旅', items: Object.keys(TROOPS).map(function (k) {
          return { kind: 'unit', name: k, disp: TROOPS[k].disp + '·' + TROOPS[k].count + '人', price: TROOPS[k].price };
        })
      }
    ];
    return CATALOG;
  }
  function daysOf(price) { return Math.max(1, Math.round(price / 150)); }
  function posName(cx, cz) {
    var dx = Math.round(cx * CELL), dz = Math.round(cz * CELL);
    return (dx >= 0 ? '东' : '西') + Math.abs(dx) + '步·' + (dz >= 0 ? '南' : '北') + Math.abs(dz) + '步';
  }

  /* ---------------- 网格 ---------------- */
  function ensureGrid() {
    if (!Z.scene) return;
    if (!Z.gridH || Z.gridH.parent !== Z.scene) {
      var gh = new T.GridHelper(240, 120, 0xc9a063, 0xc9a063);
      gh.material.transparent = true; gh.material.opacity = 0.18;
      gh.position.y = 0.04;
      Z.scene.add(gh); Z.gridH = gh;
      var fp = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: 0x66dd66, transparent: true, opacity: 0.32, depthWrite: false }));
      fp.rotation.x = -Math.PI / 2; fp.position.y = 0.06; fp.visible = false;
      Z.scene.add(fp); Z.footM = fp;
    }
    Z.gridH.visible = inBuild();
    if (Z.footM) Z.footM.visible = inBuild() && !!Z.B;
  }
  function ghostAABB() {
    var B = Z.B; if (!B) return null;
    if (B.item.kind === 'npc') return { x: B.cx * CELL, z: B.cz * CELL, hw: 0.7, hd: 0.7 };
    if (B.item.kind === 'unit') {
      var tr0 = TROOPS[B.item.name];
      return { x: B.cx * CELL, z: B.cz * CELL, hw: tr0.cols * 0.65 + 0.5, hd: Math.ceil(tr0.count / tr0.cols) * 0.65 + 0.5 };
    }
    if (B.item.kind === 'road') { var sr = B.s || 1; return { x: B.cx * CELL, z: B.cz * CELL, hw: (RW / 2 - 0.1) * sr, hd: (RW / 2 - 0.1) * sr }; }
    if (B.item.kind === 'flora') {
      var FR = { bamboo: 2.2, rocks: 2, jiashan: 3.2, outcrop: 3, pond: 5.5, reeds: 1.2 };
      var r0 = (FR[B.item.name] || 1.4) * (B.s || 1);
      return { x: B.cx * CELL, z: B.cz * CELL, hw: r0, hd: r0 };
    }
    var inf = info(B.item.pack, B.item.name);
    var sc = B.item.kind === 'model' ? (B.s || 1) : 1;
    if (B.rx || B.rz) {
      var ob = obbOf(B.item.pack, B.item.name, B.rx || 0, B.ry, B.rz || 0, sc);
      return { x: B.cx * CELL + ob.ox, z: B.cz * CELL + ob.oz, hw: ob.hw, hd: ob.hd };
    }
    var ac = Math.abs(Math.cos(B.ry)), as = Math.abs(Math.sin(B.ry));
    var hw = (ac * inf.size.x + as * inf.size.z) / 2 * sc, hd = (as * inf.size.x + ac * inf.size.z) / 2 * sc;
    return { x: B.cx * CELL, z: B.cz * CELL, hw: hw, hd: hd };
  }
  var OBBC = {};
  function obbOf(pack, name, rx, ry, rz, sc) {
    sc = sc || 1;
    var key = pack + '/' + name + '|' + rx.toFixed(3) + ',' + ry.toFixed(3) + ',' + rz.toFixed(3) + ',' + sc;
    if (OBBC[key]) return OBBC[key];
    var inf = info(pack, name);
    var eu = new T.Euler(rx, ry, rz, 'XYZ');
    var mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9, mnz = 1e9, mxz = -1e9;
    for (var i = 0; i < 8; i++) {
      var v = new T.Vector3(
        (inf.center.x + (i & 1 ? 0.5 : -0.5) * inf.size.x) * sc,
        (i & 2 ? inf.size.y : 0) * sc,
        (inf.center.z + (i & 4 ? 0.5 : -0.5) * inf.size.z) * sc
      ).applyEuler(eu);
      mnx = Math.min(mnx, v.x); mxx = Math.max(mxx, v.x);
      mny = Math.min(mny, v.y); mxy = Math.max(mxy, v.y);
      mnz = Math.min(mnz, v.z); mxz = Math.max(mxz, v.z);
    }
    return OBBC[key] = { ox: (mnx + mxx) / 2, oz: (mnz + mxz) / 2, hw: (mxx - mnx) / 2, hd: (mxz - mnz) / 2, lift: Math.max(0, -mny) };
  }
  function aabbHit(a, b, pad) {
    return Math.abs(a.x - b.x) < a.hw + b.hw + (pad || 0) && Math.abs(a.z - b.z) < a.hd + b.hd + (pad || 0);
  }
  function ghostValid() {
    // 摆放全自由：允许与既有建筑交叉（行走碰撞体照常生效），只校验边界与国库
    var B = Z.B; if (!B) return false;
    var bb = ghostAABB();
    if (Math.abs(bb.x) > 2000 || Math.abs(bb.z) > 2000) return false;
    return ECON.gold >= B.item.price;
  }
  function recAABB(rec) {
    if (rec.kind === 'road') { var sr2 = rec.s || 1; return { x: rec.cx * CELL, z: rec.cz * CELL, hw: (RW / 2 - 0.1) * sr2, hd: (RW / 2 - 0.1) * sr2 }; }
    if (rec.kind === 'npc') return { x: rec.cx * CELL, z: rec.cz * CELL, hw: 0.7, hd: 0.7 };
    if (rec.kind === 'unit') { var uh = unitHalf(rec); return { x: rec.cx * CELL, z: rec.cz * CELL, hw: uh.hw, hd: uh.hd }; }
    if (rec.kind === 'flora') { var FR2 = { bamboo: 2.2, rocks: 2, jiashan: 3.2, outcrop: 3, pond: 5.5, reeds: 1.2 }; var r0 = (FR2[rec.name] || 1.4) * (rec.s || 1); return { x: rec.cx * CELL, z: rec.cz * CELL, hw: r0, hd: r0 }; }
    var inf = info(rec.pack, rec.name);
    var sc2 = rec.s || 1;
    if (rec.rx || rec.rz) {
      var ob2 = obbOf(rec.pack, rec.name, rec.rx || 0, rec.ry || 0, rec.rz || 0, sc2);
      return { x: rec.cx * CELL + ob2.ox, z: rec.cz * CELL + ob2.oz, hw: ob2.hw, hd: ob2.hd };
    }
    var ac = Math.abs(Math.cos(rec.ry || 0)), as = Math.abs(Math.sin(rec.ry || 0));
    return { x: rec.cx * CELL, z: rec.cz * CELL, hw: (ac * inf.size.x + as * inf.size.z) / 2 * sc2, hd: (as * inf.size.x + ac * inf.size.z) / 2 * sc2 };
  }

  /* ---------------- 幽灵 ---------------- */
  var GHOSTMAT = {};
  function ghostMat(pack, ok) {
    var key = pack + (ok ? 'g' : 'r');
    if (GHOSTMAT[key]) return GHOSTMAT[key];
    var st = STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
    var tex = pack === 'ancient' ? Z.tex[st.anc] : pack === 'historic' ? Z.tex[st.his] : Z.tex['LowpolyHistoricInterior_Texture_01.png'];
    var m = new T.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.62, color: ok ? 0x9fe89f : 0xe89a9a, depthWrite: false });
    GHOSTMAT[key] = m; return m;
  }
  function clearGhostMats() { GHOSTMAT = {}; }
  function startGhost(item, movingId, cx, cz, ry, sc, rx, rz) {
    cancelGhost();
    var f = Z.bcam;
    var B = Z.B = {
      item: item,
      cx: cx != null ? cx : Math.round(f.fx / CELL),
      cz: cz != null ? cz : Math.round(f.fz / CELL),
      ry: ry || 0, rx: rx || 0, rz: rz || 0, s: sc || 1, movingId: movingId || null
    };
    function pickProxy(w, h, d) {
      var p = new T.Mesh(new T.BoxGeometry(Math.max(2.4, w), Math.max(2.8, h), Math.max(2.4, d)),
        new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
      p.position.y = Math.max(2.8, h) / 2;
      p.userData.proxy = true;
      return p;
    }
    if (item.kind === 'model') {
      var tpl = Z.packs[item.pack].lib[item.name];
      var inf = info(item.pack, item.name);
      var o = tpl.clone(true);
      o.position.y = -inf.minY;
      var g = new T.Group(); g.add(o);
      g.add(pickProxy(inf.size.x, inf.size.y, inf.size.z));
      Z.scene.add(g); B.obj = g;
    } else if (item.kind === 'npc') {
      var t0 = NPC_TYPES[item.name] || HIST[item.name];
      B.obj = makePawn(t0.cfg); Z.scene.add(B.obj);
    } else if (item.kind === 'unit') {
      B.obj = makeUnit(item.name, TROOPS[item.name].count); Z.scene.add(B.obj);
    } else {
      var fl = (item.kind === 'road' ? ROADS[item.name] : FLORA[item.name]).make(0, 0, 'ghost' + Date.now() % 100000);
      if (fl) { fl.traverse(function (m) { if (m.isMesh) { m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.62; m.material.depthWrite = false; } }); B.obj = fl; }
      else { B.obj = new T.Group(); Z.scene.add(B.obj); }
      B.obj.add(pickProxy(3, 4, 3));
    }
    updateGhost();
    updateBuildHud();
  }
  function updateGhost() {
    var B = Z.B; if (!B) return;
    B.valid = ghostValid();
    if (B.obj) {
      B.obj.position.set(B.cx * CELL, 0, B.cz * CELL);
      if (B.item.kind === 'model') B.obj.rotation.set(B.rx || 0, B.ry, B.rz || 0); else B.obj.rotation.y = B.ry;
      if (B.item.kind === 'model' || B.item.kind === 'road' || B.item.kind === 'flora') B.obj.scale.setScalar(B.s || 1);
      if (B.item.kind === 'model') {
        var mat = ghostMat(B.item.pack, B.valid);
        B.obj.traverse(function (m) { if (m.isMesh && !m.userData.proxy) m.material = mat; });
      }
    }
    if (Z.footM) {
      var bb = ghostAABB();
      Z.footM.visible = inBuild();
      Z.footM.scale.set(bb.hw * 2 + 0.6, bb.hd * 2 + 0.6, 1);
      Z.footM.position.set(bb.x, 0.06, bb.z);
      Z.footM.material.color.set(B.valid ? 0x66dd66 : 0xe05545);
    }
    updateBuildHud();
  }
  function cancelGhost() {
    var B = Z.B; if (!B) return;
    if (B.obj && B.obj.parent) B.obj.parent.remove(B.obj);
    if (B.movingId) { // 恢复被移动的原件显示
      var root = rootOfBuild(B.movingId);
      if (root) root.visible = true;
    }
    Z.B = null;
    if (Z.footM) Z.footM.visible = false;
    updateBuildHud();
  }
  function rotateGhost(dir) {
    if (!Z.B) return;
    Z.B.ry = (Z.B.ry + dir * Math.PI / 4 + Math.PI * 2) % (Math.PI * 2);
    updateGhost();
  }
  function confirmGhost() {
    var B = Z.B; if (!B || !B.valid) return;
    var store = buildsOf(Z.cityKey);
    var rec;
    if (B.movingId) {
      rec = null;
      for (var i = 0; i < store.items.length; i++) if (store.items[i].id === B.movingId) rec = store.items[i];
      if (rec) {
        removeBuildObject(B.movingId);
        rec.cx = B.cx; rec.cz = B.cz; rec.ry = B.ry;
        if (rec.kind !== 'npc' && rec.kind !== 'unit' && Math.abs((B.s || 1) - 1) > 0.01) rec.s = Math.round(B.s * 100) / 100; else delete rec.s;
        if (rec.kind === 'model' && B.rx) rec.rx = Math.round(B.rx * 1000) / 1000; else delete rec.rx;
        if (rec.kind === 'model' && B.rz) rec.rz = Math.round(B.rz * 1000) / 1000; else delete rec.rz;
        spawnBuild(rec);
      }
    } else {
      ECON.gold -= B.item.price; econSave();
      rec = {
        id: ++store.seq, kind: B.item.kind, pack: B.item.pack, name: B.item.name,
        disp: B.item.disp, price: B.item.price, cx: B.cx, cz: B.cz, ry: B.ry,
        seed: Z.cityKey + '#' + store.seq
      };
      if (B.item.kind !== 'npc' && B.item.kind !== 'unit' && Math.abs((B.s || 1) - 1) > 0.01) rec.s = Math.round(B.s * 100) / 100;
      if (B.item.kind === 'model' && B.rx) rec.rx = Math.round(B.rx * 1000) / 1000;
      if (B.item.kind === 'model' && B.rz) rec.rz = Math.round(B.rz * 1000) / 1000;
      if (B.item.kind === 'npc') rec.npc = B.item.name;
      if (B.item.kind === 'unit') { rec.troop = B.item.name; rec.count = TROOPS[B.item.name].count; }
      store.items.push(rec);
      spawnBuild(rec);
      var verb = Z.mode === 'interior' ? '陈设' : B.item.kind === 'npc' ? '招纳' : B.item.kind === 'unit' ? '征募' : B.item.kind === 'road' ? '铺设' : '起建';
      ledgerAdd('built', { d: B.item.disp, v: verb, g: B.item.price, c: Z.cityKey });
    }
    buildsSave();
    var keep = B.item, wasMoving = B.movingId;
    if (B.obj && B.obj.parent) B.obj.parent.remove(B.obj);
    Z.B = null;
    if (Z.footM) Z.footM.visible = false;
    updateBuildHud();
  }

  /* ---------------- 已建落地 / 管理 ---------------- */
  function spawnBuild(rec) {
    /* 原来这两类直接 return，末尾那句 Z.placedRoots.push(root) 根本轮不到执行：
       rootOfBuild 找不到它们，removeBuildObject 只能删档案、删不掉场上的棋子。
       于是 AI 重生成同一幕时（applyEdict 先 edictUndo 再重放），档案里始终两条，
       场上却按 2、4、6、8 递增，一堆同名人物和军团重叠站在同一格上。 */
    if (rec.kind === 'npc' || rec.kind === 'unit') {
      var pr = (rec.kind === 'npc') ? spawnNpcPawn(rec) : spawnUnitPawn(rec);
      if (pr) { pr.userData.buildId = rec.id; Z.placedRoots.push(pr); }
      return pr;
    }
    var st = STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
    var root = null;
    if (rec.kind === 'model') {
      var tex = rec.pack === 'ancient' ? st.anc : rec.pack === 'historic' ? st.his : 'LowpolyHistoricInterior_Texture_01.png';
      root = spawn(rec.pack, rec.name, tex, { x: rec.cx * CELL, z: rec.cz * CELL, ry: rec.ry, s: rec.s || undefined, shadow: true, shrink: 0.92, bid: rec.id });
      if (root) {
        var cl = Z.colliders[Z.colliders.length - 1];
        if (cl && cl.x === rec.cx * CELL && cl.z === rec.cz * CELL) cl.buildId = rec.id;
        if (rec.rx || rec.rz) { // 三轴斜置：原位旋转（可沉入地面作残迹），按真实包围盒修正碰撞体
          var ob3 = obbOf(rec.pack, rec.name, rec.rx || 0, rec.ry || 0, rec.rz || 0, rec.s || 1);
          root.rotation.set(rec.rx || 0, rec.ry || 0, rec.rz || 0);
          if (cl && cl.buildId === rec.id) {
            cl.x = rec.cx * CELL + ob3.ox; cl.z = rec.cz * CELL + ob3.oz;
            cl.hw = ob3.hw * 0.86; cl.hd = ob3.hd * 0.86; cl.ry = 0; cl.cx = 0; cl.cz = 0;
          }
        }
      }
    } else if (rec.kind === 'road') {
      root = ROADS[rec.name].make(rec.cx * CELL, rec.cz * CELL, rec.seed);
      if (root) { root.rotation.y = rec.ry || 0; if (rec.s) root.scale.setScalar(rec.s); }
    } else {
      root = FLORA[rec.name].make(rec.cx * CELL, rec.cz * CELL, rec.seed);
      if (root && rec.s) root.scale.setScalar(rec.s);
    }
    if (root) { root.userData.buildId = rec.id; Z.placedRoots.push(root); }
    return root;
  }
  function rootOfBuild(id) {
    for (var i = 0; i < Z.placedRoots.length; i++) if (Z.placedRoots[i].userData.buildId === id) return Z.placedRoots[i];
    return null;
  }
  function removeBuildObject(id) {
    var root = rootOfBuild(id);
    if (root && root.parent) root.parent.remove(root);
    /* 人物/军旅同时登记在 Z.pawns 里，只从场景摘掉不够：
       残留的 meta 会继续出现在 snapshot()（喂给 AI 的「在场」）与点选命中里。 */
    if (root) Z.pawns = Z.pawns.filter(function (p) { return !p || p.root !== root; });
    Z.placedRoots = Z.placedRoots.filter(function (r) { return r.userData.buildId !== id; });
    Z.colliders = Z.colliders.filter(function (c) { return c.buildId !== id; });
    Z.doors = Z.doors.filter(function (d) { return d.bid !== id; });
  }
  function demolishBuild(rec) {
    var store = buildsOf(Z.cityKey);
    store.items = store.items.filter(function (it) { return it.id !== rec.id; });
    removeBuildObject(rec.id);
    var refund = Math.round(rec.price * 0.6);
    ECON.gold += refund; econSave(); buildsSave();
    ledgerAdd('razed', { d: rec.disp, v: '拆去', g: refund, c: Z.cityKey });
    Z.sel = null; updateBuildHud();
  }
  function applyBuilds() {
    Z.placedRoots = [];
    var store = BUILDS[Z.cityKey];
    if (!store) return;
    store.items.forEach(spawnBuild);
  }

  /* ---------------- 上帝相机 ---------------- */
  function buildCamTick(dt) {
    var b = Z.bcam;
    if (Z.intPlan) { // 室内规划：俯角锁高、距离收紧，永远从揭开的屋顶往里看
      if (b.pitch < 0.85) b.pitch = 0.85;
      if (b.dist > 42) b.dist = 42;
    }
    var sp = b.dist * 0.9 * dt;
    var sy = Math.sin(b.yaw), cy = Math.cos(b.yaw);
    if (Z.keys['w'] || Z.keys['arrowup']) { b.fx -= sy * sp; b.fz -= cy * sp; }
    if (Z.keys['s'] || Z.keys['arrowdown']) { b.fx += sy * sp; b.fz += cy * sp; }
    if (Z.keys['a'] || Z.keys['arrowleft']) { b.fx -= cy * sp; b.fz += sy * sp; }
    if (Z.keys['d'] || Z.keys['arrowright']) { b.fx += cy * sp; b.fz -= sy * sp; }
    b.fx = Math.max(-2000, Math.min(2000, b.fx)); b.fz = Math.max(-2000, Math.min(2000, b.fz));
    if (Z.gridH) { Z.gridH.position.x = Math.round(b.fx / CELL) * CELL; Z.gridH.position.z = Math.round(b.fz / CELL) * CELL; }
    var cam = Z.cam;
    var tx = b.fx + Math.sin(b.yaw) * Math.cos(b.pitch) * b.dist;
    var tz = b.fz + Math.cos(b.yaw) * Math.cos(b.pitch) * b.dist;
    var ty = Math.sin(b.pitch) * b.dist;
    var tgt = new T.Vector3(tx, ty, tz);
    if (Z.camSnap) { cam.position.copy(tgt); Z.camSnap = false; }
    else cam.position.lerp(tgt, 0.22);
    cam.lookAt(b.fx, 0, b.fz);
  }
  function groundPoint(e) {
    var host = Z.cv.getBoundingClientRect();
    var nx = ((e.clientX - host.left) / host.width) * 2 - 1;
    var ny = -((e.clientY - host.top) / host.height) * 2 + 1;
    _ray.setFromCamera(new T.Vector2(nx, ny), Z.cam);
    var t = -_ray.ray.origin.y / _ray.ray.direction.y;
    if (!(t > 0)) return null;
    var p = _ray.ray.origin.clone().addScaledVector(_ray.ray.direction, t);
    return p;
  }
  function pickAt(e, roots) {
    var host = Z.cv.getBoundingClientRect();
    var nx = ((e.clientX - host.left) / host.width) * 2 - 1;
    var ny = -((e.clientY - host.top) / host.height) * 2 + 1;
    _ray.setFromCamera(new T.Vector2(nx, ny), Z.cam);
    _ray.far = Infinity;
    var hits = _ray.intersectObjects(roots, true);
    if (!hits.length) return null;
    var o = hits[0].object;
    while (o) { if (o.userData && (o.userData.buildId || o.userData.spawnSeq || o.userData.natId || o.userData.pawn || o === (Z.B && Z.B.obj))) return o; o = o.parent; }
    return hits[0].object;
  }
  function bindBuildInput(cv) {
    var ptrs = {}, orb = null, gdrag = false, pinch0 = 0, dist0 = 0, moved = 0, downE = null, pend = null, pinchMid = null;
    cv.addEventListener('pointerdown', function (e) {
      Z.lastInputT = performance.now();
      if (!inBuild()) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { cv.setPointerCapture(e.pointerId); } catch (err) { }
      var ids = Object.keys(ptrs);
      moved = 0; downE = e;
      if (ids.length >= 2) {
        var a = ptrs[ids[0]], b2 = ptrs[ids[1]];
        pinch0 = Math.hypot(a.x - b2.x, a.y - b2.y); dist0 = Z.bcam.dist;
        pinchMid = {
          x: (a.x + b2.x) / 2, y: (a.y + b2.y) / 2,
          yaw: Z.bcam.yaw, pitch: Z.bcam.pitch,
          ang: Math.atan2(b2.y - a.y, b2.x - a.x),
          p0: {}, mode: null // mode: 'anchor'=按住+旋转 | 'pinch'=捏合
        };
        pinchMid.p0[ids[0]] = { x: a.x, y: a.y };
        pinchMid.p0[ids[1]] = { x: b2.x, y: b2.y };
        orb = null; gdrag = false; pend = null;
        return;
      }
      // 命中幽灵则拖动幽灵
      if (Z.B && Z.B.obj) {
        var hit = pickAt(e, [Z.B.obj]);
        if (hit) { gdrag = true; try { cv.setPointerCapture(e.pointerId); } catch (err) { } return; }
      }
      // 点在人物/军旅上：留待抬指判定（不进入建筑拖拽/旋转）
      if (!Z.B && Z.pawns.length) {
        var hp0 = pickAt(e, Z.pawns.map(function (p) { return p.root; }));
        if (hp0 && pawnOf(hp0)) { try { cv.setPointerCapture(e.pointerId); } catch (err) { } return; }
      }
      // 按住已建之物：待判定（拖=直接迁移，点=选中菜单）
      if (!Z.B && Z.placedRoots.length) {
        var hit2 = pickAt(e, Z.placedRoots);
        if (hit2 && hit2.userData && hit2.userData.buildId) {
          pend = { id: hit2.userData.buildId };
          try { cv.setPointerCapture(e.pointerId); } catch (err) { }
          return;
        }
      }
      orb = { x: e.clientX, y: e.clientY, yaw: Z.bcam.yaw, pitch: Z.bcam.pitch, pan: e.pointerType === 'touch', px: e.clientX, py: e.clientY };
      try { cv.setPointerCapture(e.pointerId); } catch (err) { }
    });
    cv.addEventListener('pointermove', function (e) {
      Z.lastInputT = performance.now();
      if (!inBuild()) return;
      if (ptrs[e.pointerId]) { moved += Math.hypot(e.clientX - ptrs[e.pointerId].x, e.clientY - ptrs[e.pointerId].y); ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; }
      var ids = Object.keys(ptrs);
      if (ids.length >= 2) {
        var a = ptrs[ids[0]], b2 = ptrs[ids[1]];
        if (!pinchMid) return;
        var pA = pinchMid.p0[ids[0]] || a, pB = pinchMid.p0[ids[1]] || b2;
        var dispA = Math.hypot(a.x - pA.x, a.y - pA.y), dispB = Math.hypot(b2.x - pB.x, b2.y - pB.y);
        if (!pinchMid.mode && Math.max(dispA, dispB) > 18) {
          // 分型一次定终身：一指按住不动=转视角；两指齐动=捏合；证据不足再等等
          var mn = Math.min(dispA, dispB);
          if (mn < 6) { pinchMid.mode = 'anchor'; pinchMid.anchorId = dispA < dispB ? ids[0] : ids[1]; }
          else if (mn > 10) pinchMid.mode = 'pinch';
        }
        if (pinchMid.mode === 'anchor') {
          var mvP = pinchMid.anchorId === ids[0] ? b2 : a;
          var mv0 = pinchMid.p0[pinchMid.anchorId === ids[0] ? ids[1] : ids[0]] || mvP;
          Z.bcam.yaw = pinchMid.yaw - (mvP.x - mv0.x) * 0.006;
          Z.bcam.pitch = Math.max(0.25, Math.min(1.45, pinchMid.pitch + (mvP.y - mv0.y) * 0.004));
          return;
        }
        if (!pinchMid.mode) return; // 分型未定：按兵不动，防误缩放
        var d = Math.hypot(a.x - b2.x, a.y - b2.y);
        if (pinch0 > 0) Z.bcam.dist = Math.max(14, Math.min(170, dist0 * pinch0 / Math.max(20, d)));
        var mx = (a.x + b2.x) / 2, my = (a.y + b2.y) / 2;
        var ang = Math.atan2(b2.y - a.y, b2.x - a.x);
        var dAng = ang - pinchMid.ang;
        if (dAng > Math.PI) dAng -= Math.PI * 2; if (dAng < -Math.PI) dAng += Math.PI * 2;
        Z.bcam.yaw = pinchMid.yaw - (mx - pinchMid.x) * 0.005 + dAng;
        Z.bcam.pitch = Math.max(0.25, Math.min(1.45, pinchMid.pitch + (my - pinchMid.y) * 0.004));
        return;
      }
      if (pend && moved > 9) {
        // 拖动已建之物 → 立即转为迁移幽灵
        var store0 = buildsOf(Z.cityKey), rec0 = null;
        store0.items.forEach(function (it) { if (it.id === pend.id) rec0 = it; });
        if (rec0) {
          var root0 = rootOfBuild(rec0.id); if (root0) root0.visible = false;
          Z.sel = null;
          startGhost({ kind: rec0.kind, pack: rec0.pack, name: rec0.name, disp: rec0.disp, price: 0 }, rec0.id, rec0.cx, rec0.cz, rec0.ry, rec0.s, rec0.rx, rec0.rz);
          gdrag = true;
        }
        pend = null;
      }
      if (gdrag && Z.B) {
        var p = groundPoint(e);
        if (p) { Z.B.cx = Math.round(p.x / CELL); Z.B.cz = Math.round(p.z / CELL); updateGhost(); }
        return;
      }
      if (orb) {
        if (orb.pan) { // 手机单指：平移画面（抓地拖动）
          var k1 = Z.bcam.dist * 0.0022;
          var sy1 = Math.sin(Z.bcam.yaw), cy1 = Math.cos(Z.bcam.yaw);
          var dmx1 = e.clientX - orb.px, dmy1 = e.clientY - orb.py;
          Z.bcam.fx += -cy1 * dmx1 * k1 + (-sy1) * dmy1 * k1;
          Z.bcam.fz += sy1 * dmx1 * k1 + (-cy1) * dmy1 * k1;
          orb.px = e.clientX; orb.py = e.clientY;
        } else {
          Z.bcam.yaw = orb.yaw - (e.clientX - orb.x) * 0.006;
          Z.bcam.pitch = Math.max(0.25, Math.min(1.45, orb.pitch + (e.clientY - orb.y) * 0.004));
        }
      }
    });
    function up(e) {
      if (!inBuild()) { delete ptrs[e.pointerId]; orb = null; gdrag = false; pend = null; return; }
      var wasClick = moved < 7 && downE;
      delete ptrs[e.pointerId];
      orb = null; pinchMid = null;
      var rem = Object.keys(ptrs);
      if (rem.length === 1 && e.pointerType === 'touch') { // 双指抬一指：余指继续平移
        var rp = ptrs[rem[0]];
        orb = { x: rp.x, y: rp.y, yaw: Z.bcam.yaw, pitch: Z.bcam.pitch, pan: true, px: rp.x, py: rp.y };
        pinch0 = 0;
        return;
      }
      if (pend) { // 点击已建之物 → 选中菜单
        var store1 = buildsOf(Z.cityKey), rec1 = null;
        store1.items.forEach(function (it) { if (it.id === pend.id) rec1 = it; });
        pend = null;
        if (rec1 && wasClick) { Z.sel = { rec: rec1, root: rootOfBuild(rec1.id) }; updateBuildHud(); }
        return;
      }
      if (gdrag) { gdrag = false; return; }
      if (!wasClick) return;
      // 点击人物/军旅/周天子：弹窗或预备移驾
      if (!Z.B) {
        var proots = Z.pawns.map(function (p) { return p.root; });
        if (Z.player && Z.player.parent) proots.push(Z.player);
        var ph = proots.length ? pickAt(e, proots) : null;
        if (ph) {
          var oo = ph, isP = false;
          while (oo) { if (oo.userData && oo.userData.isPlayer) { isP = true; break; } oo = oo.parent; }
          if (isP) { // 点中周天子 → 预备移驾（点目标格瞬移）
            Z.tp = { phase: 'armed' };
            Z.sel = null; Z.actor = null; Z.selNpc = null;
            updateBuildHud();
            return;
          }
          var pw = pawnOf(ph);
          if (pw) {
            if (pw.own && pw.tag === 'unit' && Z.actor !== pw) setActor(pw);
            if (pw.tag === 'escort') {
              Z.actor = { escort: true, name: '御前卫队', root: Z.player, tag: 'unit', own: true };
              updateBuildHud();
            }
            openNpcBar(pw);
            return;
          }
        }
      }
      // 幽灵：点地即挪格
      if (Z.B) {
        var p = groundPoint(e);
        if (p) { Z.B.cx = Math.round(p.x / CELL); Z.B.cz = Math.round(p.z / CELL); updateGhost(); }
        return;
      }
      // 移驾选址：预备状态下点任意处取格心为目标，可反复重选
      if (Z.tp) {
        var tgp = groundPoint(e);
        if (tgp) {
          Z.tp = { phase: 'confirm', x: Math.round(tgp.x / CELL) * CELL, z: Math.round(tgp.z / CELL) * CELL };
          updateBuildHud();
        }
        return;
      }
      // 点中物体（建筑/树木草石）→ 选中菜单（选中军旅时菜单含「攻击」）
      var pickList = Z.placedRoots.concat(Z.cityRoots).concat(Z.natureRoots);
      if (pickList.length) {
        var hit = pickAt(e, pickList);
        if (hit && hit.userData) {
          if (hit.userData.natId) {
            Z.sel = { rec: null, root: hit, disp: hit.userData.natDisp || '草木' };
            updateBuildHud(); return;
          }
          if (hit.userData.buildId) {
            var store = buildsOf(Z.cityKey);
            var rec = null;
            store.items.forEach(function (it) { if (it.id === hit.userData.buildId) rec = it; });
            if (rec) { Z.sel = { rec: rec, root: hit, disp: rec.disp }; updateBuildHud(); return; }
          } else if (hit.userData.spawnSeq) {
            Z.sel = { rec: null, root: hit, disp: buildingDisp(hit) };
            updateBuildHud(); return;
          }
        }
      }
      // 点空地：已选军旅即行军（御前卫队不离驾巡地）
      if (Z.actor && !Z.actor.escort && Z.actor.root.parent) {
        var gp0 = groundPoint(e);
        if (gp0) {
          Z.orders = Z.orders.filter(function (o) { return o.unit !== Z.actor; });
          Z.orders.push({ unit: Z.actor, type: 'move', tx: gp0.x, tz: gp0.z });
          Z.selNpc = null; updateBuildHud();
          return;
        }
      }
      Z.sel = null; updateBuildHud();
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) {
      if (!inBuild()) return;
      e.preventDefault();
      Z.bcam.dist = Math.max(14, Math.min(170, Z.bcam.dist + e.deltaY * 0.06));
    }, { passive: false });
  }

  /* 营造入内：上帝视角进屋规划陈设 */
  function doorFor(root) {
    var seq = root.userData.spawnSeq, bid = root.userData.buildId;
    for (var i = 0; i < Z.doors.length; i++) {
      var d = Z.doors[i];
      if ((seq != null && d.seq === seq) || (bid != null && d.bid === bid)) return d;
    }
    return null;
  }
  function enterInteriorPlan(sel) {
    var root = sel.root;
    var d = doorFor(root);
    if (!d) return;
    Z.intPlan = true;
    var seq = root.userData.spawnSeq, bid = root.userData.buildId;
    enterInterior(d.interior, d.label, seq != null ? 's' + seq : (bid != null ? 'b' + bid : null));
    // 揭顶观室：上帝视角下藏起天花板与梁，并补亮室内
    Z.scene.traverse(function (o) { if (o.userData && o.userData.ceil) o.visible = false; });
    Z.scene.add(new T.AmbientLight(0xffffff, 0.55));
    Z.bcam.fx = 0; Z.bcam.fz = 0; Z.bcam.dist = 15; Z.bcam.yaw = 0; Z.bcam.pitch = 1.15; Z.camSnap = true;
    Z.sel = null;
    if (bHud.tray) { bHud.tab = 0; if (bHud.tray.style.display !== 'none') fillTray(); }
    updateBuildHud();
  }

  /* 移驾：周天子瞬移至目标格，卫队随驾列位 */
  function doTeleport() {
    if (!Z.tp || Z.tp.phase !== 'confirm' || !Z.player) return;
    puff(Z.player.position.x, 0.7, Z.player.position.z, 0xd8b23a, 2, 1.6, 0.8);
    Z.player.position.x = Z.tp.x; Z.player.position.z = Z.tp.z;
    var py = Z.player.rotation.y, sy = Math.sin(py), cy = Math.cos(py);
    Z.escort.forEach(function (g) {
      var off = g.userData.off || [0, -2];
      g.position.set(Z.tp.x + off[0] * cy + off[1] * sy, 0, Z.tp.z - off[0] * sy + off[1] * cy);
    });
    puff(Z.tp.x, 0.7, Z.tp.z, 0xd8b23a, 2, 1.6, 0.8);
    Z.tp = null; updateBuildHud();
  }

  /* ---------------- 营造 HUD（托盘 / 幽灵操作 / 选中操作 / 国库） ---------------- */
  var bHud = { wrap: null, goldChip: null, viewBtn: null, trayBtn: null, tray: null, tabsEl: null, listEl: null, ghostBar: null, selBar: null, tab: 0, thumbQ: null };
  function ensureBuildHud(host) {
    if (bHud.wrap && bHud.wrap.parentNode === hud) return;
    bHud._openedSession = false; // 新建/重建 HUD 时复位，好让「进营造自动弹清单」对新托盘重新生效
    var w = document.createElement('div');
    w.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    // 国库
    var gold = document.createElement('div');
    gold.style.cssText = isTouch() ? 'order:1;padding:2px 8px;background:rgba(6,6,6,.66);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(201,155,63,.55);color:#ecc878;font-size:9.5px;letter-spacing:.04em;border-radius:0;display:none;white-space:nowrap' : 'position:absolute;top:8px;left:50%;transform:translateX(-50%);max-width:calc(100% - 340px);overflow:hidden;text-overflow:ellipsis;padding:3px 12px;background:rgba(6,6,6,.66);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(201,155,63,.55);color:#ecc878;font-size:10.5px;letter-spacing:.1em;border-radius:0;display:none;white-space:nowrap';
    (isTouch() && Z._topRow ? Z._topRow : w).appendChild(gold); bHud.goldChip = gold;
    // 模式切换
    var vb = document.createElement('div');
    vb.style.cssText = 'order:4;padding:2px 8px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:9.5px;letter-spacing:.1em;cursor:pointer;pointer-events:auto;border-radius:0';
    vb.onclick = function () { if (Z.intPlan) { exitInterior(); return; } Z.toggleView(); };
    (Z._topRow || w).appendChild(vb); bHud.viewBtn = vb;
    // 托盘开关
    var tb = document.createElement('div');
    tb.style.cssText = 'position:absolute;right:8px;bottom:8px;padding:' + (isTouch() ? '4px 10px' : '6px 16px') + ';background:rgba(6,6,6,.62);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:' + (isTouch() ? '10px' : '11px') + ';letter-spacing:.18em;cursor:pointer;pointer-events:auto;border-radius:0;display:none;font-weight:600';
    tb.textContent = isTouch() ? '清单' : '营造清单';
    tb.onclick = function () { bHud.tray.style.display = bHud.tray.style.display === 'none' ? 'block' : 'none'; fillTray(); };
    w.appendChild(tb); bHud.trayBtn = tb;
    // 奏报（集中通报本轮兴作/拆除）
    var rb = document.createElement('div');
    rb.style.cssText = 'position:absolute;right:' + (isTouch() ? '70px' : '124px') + ';bottom:8px;padding:' + (isTouch() ? '4px 10px' : '6px 16px') + ';background:rgba(201,155,63,.2);border:1px solid rgba(201,155,63,.55);color:#ecc878;font-size:' + (isTouch() ? '10px' : '11px') + ';letter-spacing:.18em;cursor:pointer;pointer-events:auto;border-radius:0;display:none;font-weight:600';
    rb.onclick = function () { submitLedger(); };
    w.appendChild(rb); bHud.reportBtn = rb;
    // 托盘
    var mob = isTouch();
    var tray = document.createElement('div');
    tray.style.cssText = 'position:absolute;left:6px;right:6px;bottom:' + (mob ? '38px' : '44px') + ';height:' + (mob ? '96px' : '132px') + ';background:rgba(6,6,6,.7);-webkit-backdrop-filter:blur(6px) saturate(140%);backdrop-filter:blur(6px) saturate(140%);border:1px solid rgba(236,236,232,.22);border-radius:0;pointer-events:auto;display:none;backdrop-filter:blur(3px)';
    var tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;gap:2px;padding:' + (mob ? '2px 4px 0' : '4px 6px 0');
    tray.appendChild(tabs); bHud.tabsEl = tabs;
    var list = document.createElement('div');
    list.style.cssText = 'display:flex;gap:' + (mob ? '4px' : '6px') + ';overflow-x:auto;overflow-y:hidden;padding:' + (mob ? '4px' : '6px') + ';height:' + (mob ? '66px' : '96px') + ';scrollbar-width:thin';
    tray.appendChild(list); bHud.listEl = list;
    w.appendChild(tray); bHud.tray = tray;
    // 幽灵操作条
    var gb = document.createElement('div');
    gb.style.cssText = 'position:absolute;left:50%;bottom:186px;transform:translateX(-50%);display:none;gap:' + (isTouch() ? '4px' : '8px') + ';pointer-events:auto;align-items:center;background:rgba(6,6,6,.88);border:1px solid rgba(236,236,232,.25);padding:' + (isTouch() ? '4px 6px' : '6px 10px') + ';border-radius:0;max-width:98%;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch';
    w.appendChild(gb); bHud.ghostBar = gb;
    // 轴向旋转条（幽灵条上方）
    var ab = document.createElement('div');
    ab.style.cssText = gb.style.cssText;
    w.appendChild(ab); bHud.axisBar = ab;
    // 选中操作条
    var sb = document.createElement('div');
    sb.style.cssText = gb.style.cssText;
    w.appendChild(sb); bHud.selBar = sb;
    // 人物弹窗条
    var nb = document.createElement('div');
    nb.style.cssText = gb.style.cssText;
    w.appendChild(nb); bHud.npcBar = nb;
    hud.appendChild(w); bHud.wrap = w;
  }
  function mkBtn(txt, fn, danger) {
    var b = document.createElement('div');
    b.style.cssText = 'padding:' + (isTouch() ? '4px 9px' : '4px 12px') + ';cursor:pointer;font-size:' + (isTouch() ? '10px' : '11px') + ';letter-spacing:.12em;white-space:nowrap;border:1px solid ' + (danger ? 'rgba(224,110,90,.7);color:#f0a898' : 'rgba(236,236,232,.22);color:#d9d9d4') + ';border-radius:0;user-select:none';
    b.textContent = txt; b.onclick = fn; return b;
  }
  function fillTray() {
    if (!bHud.tray || bHud.tray.style.display === 'none') return;
    var cats = catalog();
    if (Z.mode === 'interior') { cats = cats.filter(function (c) { return c.tab === '家具'; }); if (bHud.tab >= cats.length) bHud.tab = 0; }
    bHud.tabsEl.innerHTML = '';
    cats.forEach(function (c, i) {
      var t = document.createElement('div');
      t.textContent = c.tab;
      t.style.cssText = 'padding:' + (isTouch() ? '2px 9px' : '3px 14px') + ';cursor:pointer;font-size:' + (isTouch() ? '9.5px' : '10.5px') + ';letter-spacing:.16em;border-radius:0;' +
        (i === bHud.tab ? 'background:rgba(201,155,63,.2);color:#ecc878;border:1px solid rgba(201,155,63,.55);border-bottom:none' : 'color:#9c9c98;border:1px solid transparent');
      t.onclick = function () { bHud.tab = i; fillTray(); };
      bHud.tabsEl.appendChild(t);
    });
    var listEl = bHud.listEl;
    listEl.innerHTML = '';
    var mob = isTouch();
    var cw = mob ? 56 : 76, chh = mob ? 62 : 92, tw = mob ? 42 : 60, th = mob ? 32 : 52;
    cats[bHud.tab].items.forEach(function (item) {
      var card = document.createElement('div');
      card.style.cssText = 'flex:none;width:' + cw + 'px;height:' + chh + 'px;background:rgba(10,10,10,.82);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.18);border-radius:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:2px;gap:1px';
      var im = document.createElement('div');
      im.style.cssText = 'width:' + tw + 'px;height:' + th + 'px;background:#101010 center/cover;border-radius:0';
      im.dataset.pack = item.pack || ''; im.dataset.name = item.name; im.dataset.kind = item.kind;
      card.appendChild(im);
      var nm = document.createElement('div');
      nm.textContent = item.disp;
      nm.style.cssText = 'font-size:' + (mob ? '8.5px' : '9px') + ';color:#d9d9d4;white-space:nowrap;overflow:hidden;max-width:' + (cw - 6) + 'px';
      card.appendChild(nm);
      var pr = document.createElement('div');
      var afford = ECON.gold >= item.price;
      pr.textContent = '金 ' + item.price;
      pr.style.cssText = 'font-size:' + (mob ? '8.5px' : '8.5px') + ';color:' + (afford ? '#c8c8c2' : '#c2492f');
      card.appendChild(pr);
      card.onclick = function () {
        startGhost(item);
        if (isTouch()) bHud.tray.style.display = 'none'; // 手机：选中即收起托盘，让出视野
      };
      listEl.appendChild(card);
      queueThumb(im, item);
    });
  }
  /* 懒缩略图 */
  var THUMB = { rnd: null, cam: null, scene: null, cache: {}, queue: [], busy: false };
  function queueThumb(el, item) {
    var key = item.kind + '/' + (item.pack || '') + '/' + item.name;
    if (THUMB.cache[key]) { el.style.backgroundImage = 'url(' + THUMB.cache[key] + ')'; return; }
    THUMB.queue.push([el, item, key]);
    pumpThumbs();
  }
  function pumpThumbs() {
    if (THUMB.busy || !THUMB.queue.length) return;
    THUMB.busy = true;
    requestAnimationFrame(function () {
      var t0 = performance.now(), budget = isTouch() ? 6 : 12;
      while (THUMB.queue.length && performance.now() - t0 < budget) {
        var job = THUMB.queue.shift();
        if (!job[0].isConnected) continue; // 标签页已切走：跳过，切回时会重新入队
        renderThumb(job[0], job[1], job[2]);
      }
      THUMB.busy = false;
      if (THUMB.queue.length) pumpThumbs();
    });
  }
  function renderThumb(el, item, key) {
    try {
      if (!THUMB.rnd) {
        var cv2 = document.createElement('canvas'); cv2.width = cv2.height = 96;
        THUMB.rnd = new T.WebGLRenderer({ canvas: cv2, antialias: true, alpha: true, preserveDrawingBuffer: true });
        THUMB.scene = new T.Scene();
        THUMB.scene.add(new T.AmbientLight(0xffffff, 1.05));
        var s2 = new T.DirectionalLight(0xffffff, 1.7); s2.position.set(3, 6, 4); THUMB.scene.add(s2);
        THUMB.cam = new T.PerspectiveCamera(34, 1, 0.01, 500);
      }
      var obj;
      if (item.kind === 'model') {
        var st = STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
        var tex = item.pack === 'ancient' ? Z.tex[st.anc] : item.pack === 'historic' ? Z.tex[st.his] : Z.tex['LowpolyHistoricInterior_Texture_01.png'];
        obj = Z.packs[item.pack].lib[item.name].clone(true);
        var mm = new T.MeshLambertMaterial({ map: tex });
        obj.traverse(function (m) { if (m.isMesh) m.material = mm; });
      } else if (item.kind === 'npc') {
        var nt = NPC_TYPES[item.name] || HIST[item.name];
        if (!nt) { el.style.background = '#3a4a34'; THUMB.cache[key] = ''; return; }
        obj = makePawn(nt.cfg);
      } else if (item.kind === 'unit') {
        obj = makeUnit(item.name, TROOPS[item.name].count);
      } else {
        // road/flora 工厂会自行挂进 Z.scene；临时换成缩略图场景接住，避免残留物漏进城中
        var prevScene = Z.scene, before = THUMB.scene.children.slice();
        Z.scene = THUMB.scene;
        try { obj = (item.kind === 'road' ? ROADS[item.name] : FLORA[item.name]).make(0, 0, 'thumb' + item.name); }
        finally { Z.scene = prevScene; }
        if (!obj) { // rocks/hay/crates 等返回 null：从缩略图场景里收编刚生成的节点
          obj = new T.Group();
          THUMB.scene.children.slice().forEach(function (c) { if (before.indexOf(c) < 0) { THUMB.scene.remove(c); obj.add(c); } });
          if (!obj.children.length) { el.style.background = '#3a4a34'; THUMB.cache[key] = ''; return; }
        }
        if (obj.parent) obj.parent.remove(obj);
      }
      THUMB.scene.add(obj);
      var bb = new T.Box3().setFromObject(obj);
      var c = new T.Vector3(), s3 = new T.Vector3(); bb.getCenter(c); bb.getSize(s3);
      var rad = Math.max(s3.x, s3.y, s3.z) * 0.75 + 0.01;
      THUMB.cam.position.set(c.x + rad * 1.5, c.y + rad * 1.05, c.z + rad * 1.5);
      THUMB.cam.lookAt(c);
      THUMB.rnd.render(THUMB.scene, THUMB.cam);
      var url = THUMB.rnd.domElement.toDataURL();
      THUMB.scene.remove(obj);
      THUMB.cache[key] = url;
      el.style.backgroundImage = 'url(' + url + ')';
    } catch (e) { }
  }
  function updateBuildHud() {
    if (!bHud.wrap) return;
    var on = inBuild();
    bHud.goldChip.style.display = on ? 'block' : 'none';
    if (on) { econTick(); bHud.goldChip.textContent = isTouch() ? ('金 ' + ECON.gold.toLocaleString()) : ('国库 金 ' + ECON.gold.toLocaleString() + ' · 岁入 ' + ECON.RATE + '/分'); }
    bHud.trayBtn.style.display = on ? 'block' : 'none';
    if (bHud.reportBtn) {
      var lc = ledgerCount();
      bHud.reportBtn.style.display = (on && lc > 0) ? 'block' : 'none';
      bHud.reportBtn.textContent = isTouch() ? ('奏报·' + lc + '（发AI）') : ('奏报·' + lc + '（发送给AI）');
    }
    /* 点「营造」就是「我要盖东西」，清单跟着一起出来——原先还得再点一次清单钮，
       等于把一个意图拆成两下。当年不敢自动弹是因为默认那一条只有两百来像素高，
       132px 的清单压上去就看不见城了；现在这一钮同时把面板展开到 tx2，高度够，
       两样并存不打架。
       一趟只弹这一次（_openedSession）：玩家自己收起来之后不再自动弹回去。
       离开营造(on=false)一律收起并复位。 */
    if (!on) { bHud._openedSession = false; bHud.tray.style.display = 'none'; }
    else if (!bHud._openedSession) {
      bHud._openedSession = true;
      bHud.tray.style.display = 'block';
      fillTray();
    }
    /* 手机上情报台那一列浮在右缘（名字最左到视口 345），底下这两枚贴右摆的钮正压在它上面。
       清单栏本身一格不缩——只把钮往左挪一截，错开就行。桌面那一列在面板之外，不挪。 */
    var _shift = (innerWidth <= 760) ? 44 : 0;
    if (bHud.trayBtn) bHud.trayBtn.style.right = (8 + _shift) + 'px';
    if (bHud.reportBtn) bHud.reportBtn.style.right = ((isTouch() ? 70 : 124) + _shift) + 'px';
    bHud.viewBtn.style.display = (Z.expanded && (Z.mode === 'city' || Z.intPlan)) ? 'block' : 'none';
    bHud.viewBtn.textContent = Z.intPlan ? '出 · 回城' : (Z.view === 'build' ? '游历' : '营造');
    // 操作条贴近底部，托盘展开时抬升避让
    var trayOpen = bHud.tray && bHud.tray.style.display !== 'none';
    var barBottom = trayOpen ? (isTouch() ? '142px' : '184px') : (isTouch() ? '40px' : '48px');
    bHud.ghostBar.style.bottom = barBottom;
    bHud.axisBar.style.bottom = 'calc(' + barBottom + ' + ' + (isTouch() ? '38px' : '46px') + ')';
    bHud.selBar.style.bottom = barBottom;
    bHud.npcBar.style.bottom = barBottom;
    // 人物弹窗（游历模式亦可对话）
    var nb = bHud.npcBar;
    var np = Z.selNpc;
    if (Z.expanded && Z.mode === 'city' && np && np.root.parent) {
      nb.style.display = 'flex'; nb.innerHTML = '';
      var nl = document.createElement('div');
      nl.style.cssText = 'color:#d9d9d4;font-size:10.5px;letter-spacing:.06em;padding-right:4px;white-space:nowrap;max-width:' + (isTouch() ? '120px' : '260px') + ';overflow:hidden;text-overflow:ellipsis';
      nl.textContent = np.name + '（' + np.cat + '）';
      nl.title = np.desc || '';
      nb.appendChild(nl);
      nb.appendChild(mkBtn('对话', function () {
        if (window.ZJ3D_say) ZJ3D_say('（周天子与' + np.name + '（' + np.cat + '）开启对话。）');
        Z.selNpc = null; updateBuildHud();
      }));
      if (np.tag === 'escort' && inBuild()) {
        nb.appendChild(mkBtn('增员·金' + GUARD_COST, function () { escortAdd(); }));
        nb.appendChild(mkBtn('减员·返' + GUARD_REFUND, function () { escortSub(); }, true));
      }
      if (inBuild() && Z.actor && Z.actor !== np && np.tag !== 'escort' && Z.actor.root.parent) {
        nb.appendChild(mkBtn('攻击', function () {
          if (Z.actor.escort) {
            if (Z.escort.length) Z.orders.push({ unit: Z.actor, type: 'escortAtk', target: np, phase: 'march' });
          } else {
            Z.orders = Z.orders.filter(function (o) { return o.unit !== Z.actor; });
            Z.orders.push({ unit: Z.actor, type: 'attack', target: np, phase: 'march' });
          }
          Z.selNpc = null; updateBuildHud();
        }, true));
      }
      if (inBuild() && np.own) nb.appendChild(mkBtn('遣散', function () { dismissPawn(np); }, true));
      nb.appendChild(mkBtn('✕', function () { Z.selNpc = null; updateBuildHud(); }));
    } else nb.style.display = 'none';
    // ghost bar（Pocket Build 式：45°步进 + 360°旋转滑条 + 缩放滑条）
    var gb = bHud.ghostBar;
    if (on && Z.B) {
      gb.style.display = 'flex';
      var gKey = (Z.B.movingId || 0) + '|' + Z.B.item.kind + '|' + Z.B.item.disp;
      if (bHud.gKey !== gKey) {
        bHud.gKey = gKey; gb.innerHTML = '';
        var mob0 = isTouch();
        var lab = document.createElement('div');
        lab.style.cssText = 'color:#d9d9d4;font-size:10.5px;white-space:nowrap;max-width:' + (mob0 ? '58px' : '150px') + ';overflow:hidden;text-overflow:ellipsis;flex:none';
        lab.textContent = (Z.B.movingId ? '迁·' : '') + Z.B.item.disp;
        gb.appendChild(lab);
        gb.style.width = mob0 ? '96%' : 'auto';
        if (!mob0) {
          gb.appendChild(mkBtn('↺', function () { rotateGhost(-1); }));
          gb.appendChild(mkBtn('↻', function () { rotateGhost(1); }));
        }
        var mkSlider = function (icon, min, max, val, w, fn) {
          var wrap = document.createElement('div');
          wrap.style.cssText = 'display:flex;align-items:center;gap:3px;color:#c8c8c2;font-size:10px;white-space:nowrap' + (mob0 ? ';flex:1 1 40px;min-width:40px' : '');
          if (icon && !mob0) { var ic = document.createElement('span'); ic.textContent = icon; wrap.appendChild(ic); }
          var sl = document.createElement('input');
          sl.type = 'range'; sl.min = min; sl.max = max; sl.value = val;
          sl.style.cssText = (mob0 ? 'width:100%' : 'width:' + w + 'px') + ';accent-color:#c99b3f;cursor:pointer;margin:0';
          sl.addEventListener('pointerdown', function () { bHud.gDrag = true; });
          sl.addEventListener('pointerup', function () { bHud.gDrag = false; });
          sl.addEventListener('input', function () { fn(parseFloat(sl.value)); });
          wrap.appendChild(sl);
          gb.appendChild(wrap);
          return sl;
        };
        bHud.gRot = mkSlider('⟳', 0, 360, Math.round((Z.B.ry || 0) * 180 / Math.PI), mob0 ? 46 : 120, function (v) {
          if (Z.B) { Z.B.ry = v * Math.PI / 180; updateGhost(); }
        });
        bHud.gScl = null;
        if (Z.B.item.kind === 'model' || Z.B.item.kind === 'road' || (Z.B.item.kind === 'flora' && !/^(rocks|hay|crates|pond)$/.test(Z.B.item.name))) {
          bHud.gScl = mkSlider('⤢', 50, 500, Math.round((Z.B.s || 1) * 100), mob0 ? 40 : 100, function (v) {
            if (Z.B) { Z.B.s = v / 100; updateGhost(); }
          });
        }
        var zBtn = mkBtn('正', function () { if (Z.B) { Z.B.ry = 0; updateGhost(); } });
        zBtn.title = '朝向归正到 0°';
        gb.appendChild(zBtn);
        if (Z.B.item.kind === 'model') {
          var axBtn = mkBtn('轴', function () { bHud.gAxis = !bHud.gAxis; bHud.gKey = ''; updateBuildHud(); });
          if (bHud.gAxis) { axBtn.style.background = 'rgba(201,155,63,.2)'; axBtn.style.color = '#ecc878'; }
          gb.appendChild(axBtn);
        }
        var okBtn = mkBtn(mob0 ? '✓建' : '✓ 定建', function () { confirmGhost(); });
        okBtn.style.background = 'rgba(120,170,120,.22)';
        gb.appendChild(okBtn);
        gb.appendChild(mkBtn('✕', function () { cancelGhost(); }, true));
        // 轴向条内容随幽灵重建
        var ab2 = bHud.axisBar; ab2.innerHTML = '';
        if (Z.B.item.kind === 'model') {
          var AXC = { x: '#7a9ae0', y: '#e8e2d4', z: '#e07a6a' };
          ['x', 'y', 'z'].forEach(function (ax) {
            var grp = document.createElement('div');
            grp.style.cssText = 'display:flex;align-items:center;gap:2px;border-bottom:2px solid ' + AXC[ax] + ';padding:0 2px 2px';
            var t = document.createElement('span');
            t.textContent = ax.toUpperCase();
            t.style.cssText = 'color:' + AXC[ax] + ';font-size:10px;padding-right:2px';
            grp.appendChild(t);
            var step = function (degStep) {
              if (!Z.B) return;
              var k = ax === 'y' ? 'ry' : ax === 'x' ? 'rx' : 'rz';
              Z.B[k] = ((Z.B[k] || 0) + degStep * Math.PI / 180 + Math.PI * 2) % (Math.PI * 2);
              updateGhost();
            };
            var pad = isTouch() ? '4px 10px' : '3px 12px';
            [['‹', -10], ['›', 10]].forEach(function (bd) {
              var b0 = mkBtn(bd[0], function () { step(bd[1]); });
              b0.style.padding = pad; b0.title = (bd[1] > 0 ? '+' : '') + bd[1] + '°';
              grp.appendChild(b0);
            });
            ab2.appendChild(grp);
          });
          var rst = mkBtn('归正', function () { if (Z.B) { Z.B.rx = 0; Z.B.rz = 0; updateGhost(); } });
          ab2.appendChild(rst);
          bHud.gAxDeg = null;
        }
      }
      var deg = Math.round((Z.B.ry || 0) * 180 / Math.PI) % 360;
      if (!bHud.gDrag) {
        var rv = '' + (((deg % 360) + 360) % 360), sv = '' + Math.round((Z.B.s || 1) * 100);
        if (bHud.gRot && bHud.gRot.value !== rv) bHud.gRot.value = rv;
        if (bHud.gScl && bHud.gScl.value !== sv) bHud.gScl.value = sv;
      }
      var axShow = (bHud.gAxis && Z.B.item.kind === 'model') ? 'flex' : 'none';
      if (bHud.axisBar.style.display !== axShow) bHud.axisBar.style.display = axShow;
      var abKey = bHud.ghostBar.style.bottom + '|' + bHud.gKey;
      if (bHud.abKey !== abKey) { // 仅布局真正变化时才读高度（offsetHeight 会强制回流）
        bHud.abKey = abKey;
        var gbB = parseInt(bHud.ghostBar.style.bottom) || 40;
        bHud.axisBar.style.bottom = (gbB + (bHud.ghostBar.offsetHeight || 34) + 6) + 'px';
      }
    } else { gb.style.display = 'none'; bHud.axisBar.style.display = 'none'; bHud.gKey = ''; bHud.gDrag = false; }
    // selection bar
    var sb = bHud.selBar;
    if (on && Z.tp) {
      sb.style.display = 'flex'; sb.innerHTML = '';
      var tl = document.createElement('div');
      tl.style.cssText = 'color:#d9d9d4;font-size:10.5px;letter-spacing:.06em;white-space:nowrap';
      if (Z.tp.phase === 'confirm') {
        tl.textContent = '移驾至 ' + posName(Math.round(Z.tp.x / CELL), Math.round(Z.tp.z / CELL)) + '？';
        sb.appendChild(tl);
        sb.appendChild(mkBtn('✓ 移驾', function () { doTeleport(); }));
        sb.appendChild(mkBtn('✕', function () { Z.tp = null; updateBuildHud(); }, true));
      } else {
        tl.textContent = '已选 周天子 · 点目标地点即可移驾';
        sb.appendChild(tl);
        sb.appendChild(mkBtn('✕', function () { Z.tp = null; updateBuildHud(); }, true));
      }
    } else if (on && !Z.sel && !Z.B && !Z.selNpc && Z.actor && Z.actor.root.parent) {
      sb.style.display = 'flex'; sb.innerHTML = '';
      var al = document.createElement('div');
      al.style.cssText = 'color:#d9d9d4;font-size:10.5px;letter-spacing:.06em;white-space:nowrap';
      al.textContent = Z.actor.escort ? '已选 御前卫队（' + Z.escort.length + '人）· 点目标即出击' : '已选 ' + Z.actor.name + ' · 点地行军，点目标可攻可谈';
      sb.appendChild(al);
      sb.appendChild(mkBtn('✕', function () { setActor(null); }));
    } else if (on && Z.sel && !Z.B) {
      sb.style.display = 'flex'; sb.innerHTML = '';
      var lab2 = document.createElement('div');
      lab2.style.cssText = 'color:#d9d9d4;font-size:10.5px;letter-spacing:.08em;padding-right:4px;white-space:nowrap';
      var selDisp = Z.sel.rec ? Z.sel.rec.disp : (Z.sel.disp || buildingDisp(Z.sel.root));
      lab2.textContent = selDisp + ' · ' + posName(Math.round(Z.sel.root.position.x / CELL), Math.round(Z.sel.root.position.z / CELL));
      sb.appendChild(lab2);
      /* Z.actor 也可能是「禁卫军」那个合成对象，它的 root 就是 Z.player。
         别处（点空地行军、攻击人物）都排除了 escort，只有这里漏了：
         压进 Z.orders 的军令里 unit.root 指向主角本人，pawnTick 每帧把她按 5.5m/s
         拖向那栋楼，期间玩家的摇杆/WASD 全被覆盖。 */
      if (Z.actor && !Z.actor.escort && Z.actor.root.parent && Z.actor.tag === 'unit') {
        sb.appendChild(mkBtn('攻击', function () {
          var tgt = { root: Z.sel.root, disp: selDisp };
          Z.orders = Z.orders.filter(function (o) { return o.unit !== Z.actor; });
          Z.orders.push({ unit: Z.actor, type: 'attackB', target: tgt, phase: 'march' });
          Z.sel = null; updateBuildHud();
        }, true));
      }
      if (Z.sel.rec) {
        sb.appendChild(mkBtn('迁移', function () {
          var rec = Z.sel.rec;
          var root = rootOfBuild(rec.id); if (root) root.visible = false;
          Z.sel = null;
          startGhost({ kind: rec.kind, pack: rec.pack, name: rec.name, disp: rec.disp, price: 0 }, rec.id, rec.cx, rec.cz, rec.ry, rec.s, rec.rx, rec.rz);
        }));
      } else if (Z.sel.root && Z.sel.root.userData.spawnSeq && Z.sel.root.userData.model) {
        sb.appendChild(mkBtn('迁移', function () {
          var rec2 = adoptEnvBuilding(Z.sel.root);
          Z.sel = null;
          if (!rec2) { updateBuildHud(); return; }
          var root2 = rootOfBuild(rec2.id); if (root2) root2.visible = false;
          startGhost({ kind: 'model', pack: rec2.pack, name: rec2.name, disp: rec2.disp, price: 0 }, rec2.id, rec2.cx, rec2.cz, rec2.ry, rec2.s);
        }));
      }
      if (Z.mode === 'city' && Z.sel.root && doorFor(Z.sel.root)) {
        sb.appendChild(mkBtn('入内', function () { enterInteriorPlan(Z.sel); }));
      }
      sb.appendChild(mkBtn('拆除', function () { edictDemolish(Z.sel); }, true));
      sb.appendChild(mkBtn('✕', function () { Z.sel = null; updateBuildHud(); }));
    } else sb.style.display = 'none';
  }
  Z.toggleView = function () {
    if (Z.mode !== 'city') return;
    cancelGhost(); Z.sel = null;
    Z.view = Z.view === 'build' ? 'walk' : 'build';
    try { localStorage.setItem('zj3d_view2', Z.view); } catch (e) { }
    if (Z.view === 'build') {
      // 相机聚焦玩家附近
      if (Z.player) { Z.bcam.fx = Z.player.position.x; Z.bcam.fz = Z.player.position.z; }
      clearGhostMats();
    }
    Z.camSnap = true;
    ensureGrid(); updateHud(); updateBuildHud();
  };

  /* ============================================================
     众生 · NPC 与军旅系统
     士农工商百业棋子 · 历史人物 · 军队编制/移动/攻击 · 对话与战报入史
     ============================================================ */
  Z.pawns = [];          // 所有可点击人形 {root, name, cat, desc, tag:'ambient'|'hist'|'placed'|'unit', recId, count, state, tx, tz, wanderT, home:{x,z}, own}
  Z.actor = null;        // 选中的己方军旅（可下移动/攻击令）
  Z.orders = [];         // 进行中的军令 {unit, type:'move'|'attack', tx, tz, target, phase, t}

  /* ---------------- 棋子工厂 ---------------- */
  // hat: none|cone(斗笠)|flat(进贤冠)|bun(髻)|plume(将盔)|scarf(帻巾)
  // prop: none|spear|sword|slip(简)|qin(琴)|bundle(货担)|hoe(锄)|staff(杖)|fan(羽扇)|axe(斧)|rod(钓竿)|scroll
  function makePawn(cfg) {
    var g = new T.Group();
    var robe = new T.Mesh(new T.CylinderGeometry(0.22, 0.38, 1.05, 7), nmat(cfg.robe));
    robe.position.y = 0.56; robe.castShadow = true; g.add(robe);
    var band = new T.Mesh(new T.CylinderGeometry(0.23, 0.27, 0.12, 7), nmat(cfg.band || 0x8a6a48));
    band.position.y = 0.92; g.add(band);
    var chest = new T.Mesh(new T.CylinderGeometry(0.18, 0.23, 0.38, 7), nmat(cfg.chest || cfg.robe));
    chest.position.y = 1.24; chest.castShadow = true; g.add(chest);
    var head = new T.Mesh(new T.SphereGeometry(0.14, 8, 7), nmat(0xf0d8bc)); head.position.y = 1.56; g.add(head);
    var hair = new T.Mesh(new T.SphereGeometry(0.145, 8, 7), nmat(0x1a1512)); hair.scale.set(1, 0.7, 1); hair.position.y = 1.62; g.add(hair);
    if (cfg.hat === 'cone') { var h1 = new T.Mesh(new T.ConeGeometry(0.3, 0.16, 8), nmat(0xd9c69a)); h1.position.y = 1.72; g.add(h1); }
    else if (cfg.hat === 'flat') { var h2 = new T.Mesh(new T.BoxGeometry(0.3, 0.05, 0.18), nmat(cfg.hatC || 0x2c2836)); h2.position.y = 1.74; g.add(h2); }
    else if (cfg.hat === 'bun') { var h3 = new T.Mesh(new T.SphereGeometry(0.06, 6, 5), nmat(0x1a1512)); h3.position.y = 1.76; g.add(h3); }
    else if (cfg.hat === 'plume') {
      var h4 = new T.Mesh(new T.CylinderGeometry(0.15, 0.16, 0.12, 7), nmat(cfg.hatC || 0x4a4a52)); h4.position.y = 1.72; g.add(h4);
      var pl = new T.Mesh(new T.ConeGeometry(0.05, 0.28, 5), nmat(0xc2492f)); pl.position.y = 1.9; g.add(pl);
    }
    else if (cfg.hat === 'scarf') { var h5 = new T.Mesh(new T.CylinderGeometry(0.15, 0.155, 0.09, 7), nmat(cfg.hatC || 0x6a4a30)); h5.position.y = 1.7; g.add(h5); }
    var pr = cfg.prop;
    if (pr === 'spear') { var p1 = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 2.1, 4), nmat(0x8a6a48)); p1.position.set(0.3, 1.05, 0); g.add(p1); var tip = new T.Mesh(new T.ConeGeometry(0.05, 0.18, 4), nmat(0xb8bec6)); tip.position.set(0.3, 2.2, 0); g.add(tip); }
    else if (pr === 'sword') { var p2 = new T.Mesh(new T.BoxGeometry(0.05, 0.85, 0.1), nmat(0x4a4a52)); p2.position.set(-0.02, 1.1, -0.26); p2.rotation.x = 0.5; g.add(p2); }
    else if (pr === 'slip') { var p3 = new T.Mesh(new T.BoxGeometry(0.3, 0.05, 0.2), nmat(0xd9c69a)); p3.position.set(0.26, 1.05, 0.12); g.add(p3); }
    else if (pr === 'qin') { var p4 = new T.Mesh(new T.BoxGeometry(0.55, 0.06, 0.2), nmat(0x6a4a30)); p4.position.set(0, 1.02, 0.24); p4.rotation.z = 0.3; g.add(p4); }
    else if (pr === 'bundle') { var p5 = new T.Mesh(new T.SphereGeometry(0.2, 6, 5), nmat(cfg.bundleC || 0xa8845c)); p5.scale.set(1, 0.7, 0.8); p5.position.set(0, 1.5, -0.3); g.add(p5); }
    else if (pr === 'hoe') { var p6 = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.5, 4), nmat(0x8a6a48)); p6.position.set(0.3, 0.85, 0); p6.rotation.z = 0.2; g.add(p6); var bl = new T.Mesh(new T.BoxGeometry(0.2, 0.05, 0.05), nmat(0x6a6a72)); bl.position.set(0.42, 1.6, 0); g.add(bl); }
    else if (pr === 'staff') { var p7 = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 1.7, 4), nmat(0x6a4a30)); p7.position.set(0.3, 0.85, 0); g.add(p7); }
    else if (pr === 'fan') { var p8 = new T.Mesh(new T.ConeGeometry(0.16, 0.3, 6), nmat(0xf3e6ee)); p8.rotation.z = Math.PI / 2; p8.position.set(0.32, 1.15, 0); g.add(p8); }
    else if (pr === 'axe') { var p9 = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.1, 4), nmat(0x8a6a48)); p9.position.set(0.3, 0.9, 0); g.add(p9); var ax = new T.Mesh(new T.BoxGeometry(0.16, 0.14, 0.04), nmat(0x6a6a72)); ax.position.set(0.36, 1.38, 0); g.add(ax); }
    else if (pr === 'rod') { var pa = new T.Mesh(new T.CylinderGeometry(0.015, 0.02, 1.9, 4), nmat(0x8a6a48)); pa.rotation.z = -0.6; pa.position.set(0.4, 1.3, 0); g.add(pa); }
    // 拾取柱（透明）
    var pick = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 2.1, 6), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
    pick.position.y = 1.05; pick.userData.proxy = true; g.add(pick);
    if (cfg.s) g.scale.setScalar(cfg.s);
    return g;
  }

  /* ---------------- 人物类别（那个时代的百业众生） ---------------- */
  var NPC_TYPES = {
    shi: { disp: '士人', cat: '士', price: 90, cfg: { robe: 0x3e6e8e, band: 0x2c3844, hat: 'flat', prop: 'slip' }, desc: '佩简游学，言必称先王' },
    nong: { disp: '农人', cat: '农', price: 30, cfg: { robe: 0x8a6a3a, band: 0x6a4a24, hat: 'cone', prop: 'hoe' }, desc: '面朝黄土，岁望有年' },
    gong: { disp: '匠人', cat: '工', price: 55, cfg: { robe: 0x5e6e78, band: 0x3e4a52, hat: 'scarf', prop: 'axe' }, desc: '斧凿在手，营造天下' },
    shang: { disp: '商贾', cat: '商', price: 110, cfg: { robe: 0x7e4e8e, band: 0xc9a063, hat: 'scarf', prop: 'bundle' }, desc: '通有无于四方，蚁鼻钱叮当' },
    guan: { disp: '官吏', cat: '官', price: 220, cfg: { robe: 0x2c2836, band: 0xc9a063, hat: 'flat', prop: 'slip' }, desc: '簪笔奉册，趋走于公门' },
    jiang: { disp: '将军', cat: '将', price: 480, cfg: { robe: 0x5e2e2a, band: 0x8a6a48, hat: 'plume', prop: 'sword' }, desc: '甲胄在身，不拜' },
    fangshi: { disp: '方士', cat: '方技', price: 150, cfg: { robe: 0xe8e2d4, band: 0x9a8a6a, hat: 'bun', prop: 'staff' }, desc: '言不死之药在海上三山' },
    yueshi: { disp: '乐师', cat: '乐', price: 120, cfg: { robe: 0x4e7e6e, band: 0x2e5e4e, hat: 'bun', prop: 'qin' }, desc: '抚琴击磬，乐与政通' },
    shiguan: { disp: '史官', cat: '史', price: 180, cfg: { robe: 0x3a3a44, band: 0x9d8c6b, hat: 'flat', prop: 'slip' }, desc: '秉笔直书，君举必书' },
    wuzhu: { disp: '巫祝', cat: '祝', price: 140, cfg: { robe: 0x6e3e7e, band: 0xc9a063, hat: 'bun', prop: 'staff' }, desc: '事鬼神，掌祝号' },
    youxia: { disp: '游侠', cat: '侠', price: 200, cfg: { robe: 0x4a4a52, band: 0xa63b26, hat: 'scarf', prop: 'sword' }, desc: '其言必信，其行必果' },
    rusheng: { disp: '儒生', cat: '儒', price: 100, cfg: { robe: 0x6e8ea8, band: 0x3e5e78, hat: 'flat', prop: 'slip' }, desc: '诵诗三百，习礼大树下' },
    mozhe: { disp: '墨者', cat: '墨', price: 100, cfg: { robe: 0x3a3a32, band: 0x5a5a4a, hat: 'scarf', prop: 'staff' }, desc: '短褐草鞋，兼爱非攻' },
    shuike: { disp: '说客', cat: '纵横', price: 260, cfg: { robe: 0x8e6e3e, band: 0xc9a063, hat: 'flat', prop: 'fan' }, desc: '一怒而诸侯惧，安居而天下熄' },
    yizhe: { disp: '医者', cat: '医', price: 160, cfg: { robe: 0x5e7e5e, band: 0x3e5e3e, hat: 'scarf', prop: 'bundle', bundleC: 0x8ec455 }, desc: '望闻问切，起死人肉白骨' },
    buzhe: { disp: '卜者', cat: '卜', price: 130, cfg: { robe: 0x7e7e6e, band: 0x5e5e4e, hat: 'bun', prop: 'slip' }, desc: '灼龟观兆，蓍草在袖' },
    yufu: { disp: '渔父', cat: '渔', price: 40, cfg: { robe: 0x4e6e7e, band: 0x3e5a66, hat: 'cone', prop: 'rod' }, desc: '沧浪之水清兮，可以濯吾缨' },
    qiaofu: { disp: '樵夫', cat: '樵', price: 40, cfg: { robe: 0x6a5a3a, band: 0x4a3e28, hat: 'cone', prop: 'axe' }, desc: '担柴唱晚，不知有汉' },
    muren: { disp: '牧童', cat: '牧', price: 35, cfg: { robe: 0x7e9e5e, band: 0x5e7e44, hat: 'cone', prop: 'staff', s: 0.8 }, desc: '骑牛遥指杏花村' },
    paoren: { disp: '庖人', cat: '庖', price: 60, cfg: { robe: 0x9e7e5e, band: 0x7e5e3e, hat: 'scarf', prop: 'none' }, desc: '游刃有余，进乎技矣' },
    zhinu: { disp: '织女', cat: '织', price: 60, cfg: { robe: 0xc88aa8, band: 0xa86a88, hat: 'bun', prop: 'none' }, desc: '机杼声声，锦成文章' },
    yinshi: { disp: '隐士', cat: '隐', price: 150, cfg: { robe: 0x8e9e8e, band: 0x6e7e6e, hat: 'cone', prop: 'staff' }, desc: '凤兮凤兮，何德之衰' },
    dizi: { disp: '弟子', cat: '学', price: 50, cfg: { robe: 0x9eb0c0, band: 0x6e8ea8, hat: 'bun', prop: 'slip', s: 0.9 }, desc: '负笈从师，问道于途' },
    yushou: { disp: '驭手', cat: '御', price: 80, cfg: { robe: 0x6e5e4e, band: 0x4e3e2e, hat: 'scarf', prop: 'staff' }, desc: '六辔在手，过都邑必式' }
  };
  /* 历史人物（可招纳 + 各城常驻） */
  var HIST = {
    laodan: { disp: '老聃', cat: '守藏室史', price: 1500, cfg: { robe: 0xe8e2d4, band: 0x9a8a6a, hat: 'bun', prop: 'staff' }, desc: '周守藏室之史，言道德五千言' },
    gongshu: { disp: '公输班', cat: '天下巧匠', price: 1200, cfg: { robe: 0x5e6e78, band: 0xc9a063, hat: 'scarf', prop: 'axe' }, desc: '削竹为鹊，成而飞之，三日不下' },
    kongzi: { disp: '孔仲尼', cat: '儒家之宗', price: 1500, cfg: { robe: 0x6e8ea8, band: 0x3e5e78, hat: 'flat', prop: 'slip', s: 1.1 }, desc: '知其不可而为之者' },
    yanhui: { disp: '颜回', cat: '孔门高弟', price: 600, cfg: { robe: 0x9eb0c0, band: 0x6e8ea8, hat: 'bun', prop: 'slip' }, desc: '一箪食一瓢饮，不改其乐' },
    zilu: { disp: '子路', cat: '孔门之勇', price: 600, cfg: { robe: 0x5e4e3e, band: 0xa63b26, hat: 'scarf', prop: 'sword' }, desc: '君子死，冠不免' },
    changhong: { disp: '苌弘', cat: '周室乐官', price: 800, cfg: { robe: 0x4e7e6e, band: 0xc9a063, hat: 'flat', prop: 'qin' }, desc: '碧血三年，乐通天地' },
    yinxi: { disp: '尹喜', cat: '函谷关令', price: 700, cfg: { robe: 0x3e6e8e, band: 0x9d8c6b, hat: 'flat', prop: 'slip' }, desc: '望紫气东来，强留著书' },
    shangyang: { disp: '商鞅', cat: '变法者', price: 1200, cfg: { robe: 0x2c2836, band: 0xc9a063, hat: 'flat', prop: 'slip' }, desc: '徙木立信，作法自毙' },
    baiqi: { disp: '白起', cat: '秦之杀神', price: 1500, cfg: { robe: 0x2a2a32, band: 0x8a6a48, hat: 'plume', prop: 'sword' }, desc: '料敌合变，出奇无穷' },
    lianpo: { disp: '廉颇', cat: '赵之良将', price: 1200, cfg: { robe: 0x5e2e2a, band: 0x8a6a48, hat: 'plume', prop: 'spear' }, desc: '一饭斗米，尚能饭否' },
    linxiangru: { disp: '蔺相如', cat: '完璧之臣', price: 1000, cfg: { robe: 0x8e6e3e, band: 0xc9a063, hat: 'flat', prop: 'slip' }, desc: '先国家之急而后私仇' },
    yanying: { disp: '晏婴', cat: '齐之贤相', price: 1000, cfg: { robe: 0x2c2836, band: 0x9d8c6b, hat: 'flat', prop: 'fan', s: 0.85 }, desc: '橘生淮南则为橘' },
    zouyan: { disp: '邹衍', cat: '阴阳家', price: 900, cfg: { robe: 0x6e3e7e, band: 0x9a8a6a, hat: 'flat', prop: 'slip' }, desc: '谈天衍，五德终始' },
    yueyi: { disp: '乐毅', cat: '燕之名将', price: 1200, cfg: { robe: 0x33528f, band: 0x8a6a48, hat: 'plume', prop: 'sword' }, desc: '下齐七十余城' },
    jingke: { disp: '荆轲', cat: '刺客', price: 1300, cfg: { robe: 0x4a4a52, band: 0xa63b26, hat: 'scarf', prop: 'sword' }, desc: '风萧萧兮易水寒' },
    xinlingjun: { disp: '信陵君', cat: '魏公子', price: 1200, cfg: { robe: 0x3a8f86, band: 0xc9a063, hat: 'flat', prop: 'fan' }, desc: '窃符救赵，食客三千' },
    hanfei: { disp: '韩非', cat: '法家集成', price: 1200, cfg: { robe: 0x3f7d4e, band: 0x2c3844, hat: 'flat', prop: 'slip' }, desc: '口吃而善著书，说难孤愤' },
    quyuan: { disp: '屈原', cat: '楚之三闾', price: 1300, cfg: { robe: 0xa63b26, band: 0x6e3e7e, hat: 'flat', prop: 'slip' }, desc: '举世皆浊我独清' },
    yangyouji: { disp: '养由基', cat: '楚之神射', price: 900, cfg: { robe: 0x8a4a3a, band: 0x5e2e2a, hat: 'scarf', prop: 'spear' }, desc: '百步穿杨' },
    sunwu: { disp: '孙武', cat: '兵圣', price: 1500, cfg: { robe: 0x3a3a44, band: 0x8a6a48, hat: 'flat', prop: 'slip' }, desc: '兵者，国之大事' },
    wuzixu: { disp: '伍子胥', cat: '吴之柱石', price: 1200, cfg: { robe: 0x4e6e7e, band: 0x8a6a48, hat: 'plume', prop: 'sword' }, desc: '悬目东门，以观越师' },
    xishi: { disp: '西施', cat: '越之浣纱女', price: 1300, cfg: { robe: 0xc88aa8, band: 0xe8a8c8, hat: 'bun', prop: 'none' }, desc: '沉鱼之貌，家国之计' },
    fanli: { disp: '范蠡', cat: '陶朱公', price: 1200, cfg: { robe: 0x7e4e8e, band: 0xc9a063, hat: 'scarf', prop: 'bundle' }, desc: '三致千金，泛舟五湖' },
    bianque: { disp: '扁鹊', cat: '神医', price: 1200, cfg: { robe: 0x5e7e5e, band: 0x3e5e3e, hat: 'scarf', prop: 'bundle', bundleC: 0x8ec455 }, desc: '起虢太子于既死' },
    xuxing: { disp: '许行', cat: '农家', price: 700, cfg: { robe: 0x8a6a3a, band: 0x6a4a24, hat: 'cone', prop: 'hoe' }, desc: '贤者与民并耕而食' }
  };
  /* 各城常驻历史人物 */
  var HIST_BY_LOC = {
    '洛邑': ['laodan', 'gongshu', 'changhong', 'kongzi'],
    '函谷关': ['yinxi'],
    '咸阳': ['shangyang', 'baiqi'],
    '邯郸': ['lianpo', 'linxiangru'],
    '临淄': ['yanying', 'zouyan'],
    '曲阜': ['kongzi', 'yanhui', 'zilu'],
    '蓟': ['yueyi', 'jingke'],
    '大梁': ['xinlingjun'],
    '新郑': ['hanfei'],
    '郢': ['quyuan', 'yangyouji'],
    '宛': ['bianque'],
    '姑苏': ['sunwu', 'wuzixu'],
    '会稽': ['fanli', 'xishi'],
    '陶邑': ['fanli'],
    '商丘': ['gongshu'],
    '成都': ['xuxing'],
    '灵寿': ['lianpo']
  };
  /* 军旅编制 */
  var TROOPS = {
    zu: { disp: '甲士', count: 1, price: 60, cols: 1 },
    wu: { disp: '一伍', count: 5, price: 260, cols: 5 },
    ying: { disp: '一营', count: 20, price: 950, cols: 5 },
    jun: { disp: '一军', count: 48, price: 2100, cols: 8 }
  };
  var SOLDIER_CFG = { robe: 0x3a3a42, band: 0x8a6a48, chest: 0x4a4a52, hat: 'plume', hatC: 0x3a3a42, prop: 'spear' };
  var NAME_POOL = ['伯', '仲', '叔', '季', '石', '禾', '桑', '陶', '革', '车', '骨', '弓', '灶', '井', '柳', '梅'];

  function unitFormation(count, cols) {
    var pts = [];
    for (var i = 0; i < count; i++) {
      var col = i % cols, row = (i / cols) | 0;
      pts.push([(col - (cols - 1) / 2) * 1.3, row * 1.3]);
    }
    return pts;
  }
  function makeUnit(troopKey, count) {
    var tr = TROOPS[troopKey];
    var g = new T.Group();
    var pts = unitFormation(count, tr.cols);
    for (var i = 0; i < count; i++) {
      var p = makePawn(SOLDIER_CFG);
      p.position.set(pts[i][0], 0, pts[i][1]);
      g.add(p);
    }
    // 拾取盒
    var w = tr.cols * 1.3 + 1, d = Math.ceil(count / tr.cols) * 1.3 + 1;
    var pick = new T.Mesh(new T.BoxGeometry(w, 2.2, d), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
    pick.position.set(0, 1.1, (Math.ceil(count / tr.cols) - 1) * 0.65);
    pick.userData.proxy = true; g.add(pick);
    return g;
  }
  function unitHalf(rec) {
    var tr = TROOPS[rec.troop];
    return { hw: tr.cols * 0.65 + 0.5, hd: Math.ceil(rec.count / tr.cols) * 0.65 + 0.5 };
  }

  /* ---------------- 注册 / 生成 ---------------- */
  function regPawn(root, meta) {
    root.userData.pawn = true;
    meta.root = root;
    meta.home = { x: root.position.x, z: root.position.z };
    meta.wanderT = 1 + Math.random() * 3;
    Z.pawns.push(meta);
    return meta;
  }
  /* ── 剧情人物落地 ────────────────────────────────────────────────
     在此之前，场上站着的全是程序生成的路人：AI 笔下写谁、写了什么，画面一概不知情。
     这里把状态栏 ◈ 行里的在场者真的放进场景——站在她面前，按行当挑形貌，名字即剧情里那个名字。
     只在名单变动时重排，逐帧调用也不费事。 */
  function castType(role) {
    var r = String(role || '');
    var k = /王|帝|天子|君|执政|元老/.test(r) ? 'guan'
      : /将|尉|骑|兵|卫|统帅|司令|军/.test(r) ? 'jiang'
      : /商|贾|市/.test(r) ? 'shang'
      : /医/.test(r) ? 'yizhe'
      : /祭|巫|占|卜|星|神/.test(r) ? 'wuzhu'
      : /匠|工|铁/.test(r) ? 'gong'
      : /乐|琴|歌/.test(r) ? 'yueshi'
      : /史|书|记|录/.test(r) ? 'shiguan'
      : /农|牧|渔|樵/.test(r) ? 'nong'
      : 'shi';
    return NPC_TYPES[k] || NPC_TYPES.shi;
  }
  Z.cast = [];
  Z.setCast = function (list) {
    if (!Z.ready || !Z.scene || Z.mode !== 'city') return;
    /* 换城会整个换 scene（newScene 同时把 Z.pawns 清空）。只判 root.parent 不够——
       旧棋子的父节点仍指着那个已被丢弃的旧 scene，非空却早已不在画面里。
       必须同时确认「父节点就是当前 scene」且「仍登记在 Z.pawns 里」，否则换城后
       Z.cast 会留着一批幽灵，剧情人物从此不再重新落地。 */
    Z.cast = Z.cast.filter(function (m) {
      return m.root && m.root.parent === Z.scene && Z.pawns.indexOf(m) >= 0;
    });
    list = (list || []).filter(function (c) { return c && c.name; }).slice(0, 6);
    var sig = list.map(function (c) { return c.name; }).join('|');
    if (sig === Z._castSig && Z.cast.length === list.length) return;
    Z._castSig = sig;
    var want = {}; list.forEach(function (c) { want[String(c.name)] = c; });
    Z.cast = Z.cast.filter(function (m) {
      if (want[m.castName]) return true;
      if (m.root && m.root.parent) m.root.parent.remove(m.root);
      Z.pawns = Z.pawns.filter(function (p) { return p !== m; });
      return false;
    });
    var have = {}; Z.cast.forEach(function (m) { have[m.castName] = m; });
    var px = Z.player ? Z.player.position.x : 0, pz = Z.player ? Z.player.position.z : 0;
    var yaw = Z.player ? Z.player.rotation.y : 0;
    list.forEach(function (c, i) {
      var nm = String(c.name);
      if (have[nm]) return;
      var t = castType(c.role);
      var g = null; try { g = makePawn(t.cfg); } catch (e) { return; }
      if (!g) return;
      var a = yaw + Math.PI + (i - (list.length - 1) / 2) * 0.44;
      var r = 3.8 + (i % 2) * 1.1;
      g.position.set(px + Math.sin(a) * r, 0, pz + Math.cos(a) * r);
      g.rotation.y = a + Math.PI;                       /* 面朝她 */
      Z.scene.add(g);
      var meta = regPawn(g, { name: nm, cat: c.role || t.cat, desc: c.state || t.desc || '', tag: 'cast', wander: 1.2 });
      meta.castName = nm;
      Z.cast.push(meta);
    });
  };
  function spawnNpcPawn(rec) { // player-placed npc
    var t = NPC_TYPES[rec.npc] || HIST[rec.npc];
    /* 剧情里来的具名角色（张仪、克娄巴特拉……）当然不在这两张表里。
       原来直接 return null，于是正文写谁来了、三维里都不会出现。
       按身份词猜个外形，名字用正文写的那个。 */
    if (!t && rec.fromStory) t = castType(rec.role || rec.cat || rec.disp || '');
    if (!t) return null;
    var root = makePawn(t.cfg);
    root.position.set(rec.cx * CELL, 0, rec.cz * CELL);
    root.rotation.y = rec.ry || 0;
    Z.scene.add(root);
    root.userData.buildId = rec.id;
    regPawn(root, { name: rec.disp, cat: t.cat, desc: t.desc, tag: 'placed', recId: rec.id, own: true, wander: 4 });
    return root;
  }
  function spawnUnitPawn(rec) {
    var root = makeUnit(rec.troop, rec.count);
    root.position.set(rec.cx * CELL, 0, rec.cz * CELL);
    root.rotation.y = rec.ry || 0;
    Z.scene.add(root);
    root.userData.buildId = rec.id;
    regPawn(root, { name: rec.disp, cat: '王师·' + rec.count + '人', desc: '闻鼓则进，闻金则退', tag: 'unit', recId: rec.id, own: true, count: rec.count, state: 'idle' });
    return root;
  }
  /* 城中众生（种子化，非存档） */
  function spawnAmbient(locName) {
    var r = rng('folk' + locName);
    var keys = Object.keys(NPC_TYPES);
    var n = Math.round((16 + (hash(locName) % 8)) * LOD());
    for (var i = 0; i < n; i++) {
      var key = keys[Math.floor(r() * keys.length)];
      var t = NPC_TYPES[key];
      var a = r() * 6.28, d = 15 + r() * 70;
      var x = Math.sin(a) * d, z = Math.cos(a) * d;
      var root = makePawn(t.cfg);
      root.position.set(x, 0, z); root.rotation.y = r() * 6.28;
      Z.scene.add(root);
      regPawn(root, {
        name: t.disp + '·' + NAME_POOL[Math.floor(r() * NAME_POOL.length)],
        cat: t.cat, desc: t.desc, tag: 'ambient', wander: 10
      });
    }
    (HIST_BY_LOC[locName] || []).forEach(function (hk, i) {
      /* 表里拼错一个键，整城构建就会在这里抛 TypeError 半途夭折——而调用方那层
         try/catch 会把它整个吞掉：玩家看到的是一座缺了大半的空城，控制台一声不响。 */
      var h = HIST[hk];
      if (!h) { console.warn('HIST_BY_LOC 指向不存在的条目:', hk); return; }
      var root = makePawn(h.cfg);
      var a = 1.2 + i * 1.5, d = 18 + i * 9;
      root.position.set(Math.sin(a) * d, 0, Math.cos(a) * d - 10);
      Z.scene.add(root);
      regPawn(root, { name: h.disp, cat: h.cat, desc: h.desc, tag: 'hist', wander: 6 });
    });
  }

  /* ---------------- 游走 / 军令 / 战斗 tick ---------------- */
  /* 骨架摆臂：与地中海引擎同一份实现（共用模块）。本引擎只有罗马纪的女主是骨架棋子，
     其余火柴人没有 userData.rig，模块内会直接跳过。 */
  function rigTick(dt) {
    if (!window.ZJ_PAWN) return;
    for (var i = 0; i < Z.pawns.length; i++) { var r = Z.pawns[i].root; if (r && r.parent) window.ZJ_PAWN.swing(r, dt); }
    if (Z.player) window.ZJ_PAWN.swing(Z.player, dt);
  }
  function pawnTick(dt, t) {
    for (var i = 0; i < Z.pawns.length; i++) {
      var p = Z.pawns[i];
      if (!p.root.parent) continue;
      if (p.tag === 'unit') continue; // 军旅走军令
      if (p.tag === 'escort') continue; // 卫队由 escortTick 列队驱动，勿此处漫步拉扯
      p.wanderT -= dt;
      if (p.wanderT <= 0) {
        p.wanderT = 2.5 + Math.random() * 5;
        var wr = p.wander || 8;
        p.tx = p.home.x + (Math.random() - .5) * wr * 2;
        p.tz = p.home.z + (Math.random() - .5) * wr * 2;
      }
      if (p.tx != null) {
        var dx = p.tx - p.root.position.x, dz = p.tz - p.root.position.z;
        var dd = Math.hypot(dx, dz);
        if (dd > 0.3) {
          var sp = 1.1 * dt;
          p.root.position.x += dx / dd * sp;
          p.root.position.z += dz / dd * sp;
          p.root.rotation.y = Math.atan2(dx, dz);
          p.root.position.y = Math.abs(Math.sin(t * 7 + i)) * 0.04;
        } else { p.tx = null; p.root.position.y = 0; }
      }
    }
    // 军令
    for (var o = Z.orders.length - 1; o >= 0; o--) {
      var od = Z.orders[o];
      var u = od.unit;
      if (!u.root.parent) { Z.orders.splice(o, 1); continue; }
      if (od.type === 'move' || ((od.type === 'attack' || od.type === 'attackB') && od.phase === 'march')) {
        if (od.type !== 'move' && !od.target.root.parent) { Z.orders.splice(o, 1); continue; }
        var txz = od.type === 'move' ? [od.tx, od.tz] : [od.target.root.position.x, od.target.root.position.z];
        var dx2 = txz[0] - u.root.position.x, dz2 = txz[1] - u.root.position.z;
        var dd2 = Math.hypot(dx2, dz2);
        var stopAt = od.type === 'attack' ? 4.5 : od.type === 'attackB' ? (od.half || (od.half = Math.max(rootHalf(od.target.root).hw, rootHalf(od.target.root).hd) + 4)) : 0.6;
        if (dd2 > stopAt) {
          var sp2 = 5.5 * dt;
          u.root.position.x += dx2 / dd2 * sp2;
          u.root.position.z += dz2 / dd2 * sp2;
          u.root.rotation.y = Math.atan2(dx2, dz2);
          u.root.position.y = Math.abs(Math.sin(t * 8)) * 0.05;
        } else if (od.type === 'move') {
          u.root.position.y = 0;
          // 落位入档
          var rec = recOf(u.recId);
          if (rec) { rec.cx = Math.round(u.root.position.x / CELL); rec.cz = Math.round(u.root.position.z / CELL); buildsSave(); }
          Z.orders.splice(o, 1);
        } else { od.phase = 'fight'; od.t = 2.2; }
      } else if (od.type === 'attackB' && od.phase === 'fight') {
        od.t -= dt;
        u.root.position.x += (Math.random() - .5) * 0.1;
        u.root.position.z += (Math.random() - .5) * 0.1;
        if (od.target.root.parent) {
          od.target.root.position.x += (Math.random() - .5) * 0.08;
          od.target.root.position.z += (Math.random() - .5) * 0.08;
          od.fireT = (od.fireT || 0) - dt;
          if (od.fireT <= 0) {
            od.fireT = 0.22;
            puff(od.target.root.position.x, 0.6, od.target.root.position.z, 0xe8722c, 2, 2.6, 3).forEach(function (pt) {
              Z.anims.push({ mode: 'dismantle', root: new T.Group(), t: 1.5, T: 1.6, h: 0, parts: [pt] });
            });
          }
        }
        if (od.t <= 0) { resolveRaze(u, od.target); Z.orders.splice(o, 1); }
      } else if (od.type === 'escortAtk') {
        if (!od.target.root.parent) { Z.escortBusy = false; Z.orders.splice(o, 1); continue; }
        Z.escortBusy = true;
        var tp = od.target.root.position;
        if (od.phase === 'march') {
          var arrived = false;
          Z.escort.forEach(function (g, gi) {
            var dx3 = tp.x - g.position.x + (gi % 3 - 1) * 1.2, dz3 = tp.z - g.position.z + ((gi / 3 | 0) % 3 - 1) * 1.2;
            var dd3 = Math.hypot(dx3, dz3);
            if (dd3 > 2) { var sp3 = 6 * dt; g.position.x += dx3 / dd3 * sp3; g.position.z += dz3 / dd3 * sp3; g.rotation.y = Math.atan2(dx3, dz3); g.position.y = Math.abs(Math.sin(t * 8 + gi)) * 0.05; }
            else arrived = true;
          });
          if (arrived || !Z.escort.length) { od.phase = 'fight'; od.t = 2.2; }
        } else {
          od.t -= dt;
          Z.escort.forEach(function (g) { g.position.x += (Math.random() - .5) * 0.12; g.position.z += (Math.random() - .5) * 0.12; });
          if (od.target.root.parent) { od.target.root.position.x += (Math.random() - .5) * 0.1; od.target.root.position.z += (Math.random() - .5) * 0.1; }
          if (od.t <= 0) { resolveEscortBattle(od.target, true); Z.orders.splice(o, 1); }
        }
      } else if (od.type === 'attack' && od.phase === 'fight') {
        od.t -= dt;
        // 交锋抖动
        u.root.position.x += (Math.random() - .5) * 0.12;
        u.root.position.z += (Math.random() - .5) * 0.12;
        if (od.target.root.parent) {
          od.target.root.position.x += (Math.random() - .5) * 0.1;
          od.target.root.position.z += (Math.random() - .5) * 0.1;
        }
        if (od.t <= 0) { resolveBattle(u, od.target); Z.orders.splice(o, 1); }
      }
    }
  }
  function recOf(id) {
    var items = buildsOf(Z.cityKey).items;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  /* ---------------- 战斗结算 + 战报入史 ---------------- */
  function killPawn(p) {
    if (p.root.parent) p.root.parent.remove(p.root);
    Z.pawns = Z.pawns.filter(function (x) { return x !== p; });
    if (p.recId) {
      var store = buildsOf(Z.cityKey);
      store.items = store.items.filter(function (it) { return it.id !== p.recId; });
      buildsSave();
    }
    if (Z.actor === p) setActor(null);
  }
  function shrinkUnit(p, newCount) {
    var rec = recOf(p.recId);
    var pos = { x: p.root.position.x, z: p.root.position.z, ry: p.root.rotation.y };
    if (p.root.parent) p.root.parent.remove(p.root);
    Z.pawns = Z.pawns.filter(function (x) { return x !== p; });
    if (rec) {
      rec.count = newCount;
      rec.cx = Math.round(pos.x / CELL); rec.cz = Math.round(pos.z / CELL); rec.ry = pos.ry;
      rec.disp = rec.disp.replace(/（余\d+人）/, '') + '';
      buildsSave();
      var np = spawnUnitPawn(rec);
      return Z.pawns[Z.pawns.length - 1];
    }
    return null;
  }
  function resolveBattle(atk, tgt) {
    var city = Z.cityKey;
    var pos = posName(Math.round(tgt.root.position.x / CELL), Math.round(tgt.root.position.z / CELL));
    var msg;
    if (tgt.tag !== 'unit') {
      // 对平民/人物：一击而殁
      var nm = tgt.name, cat = tgt.cat;
      killPawn(tgt);
      msg = '（周天子敕命' + atk.name + '攻击' + nm + '（' + cat + '）。过程：兵刃骤起于' + city + '城' + pos + '，' + nm + '不及走避。结果：' + nm + '殒命，' + atk.name + '无伤。影响：城中震恐，市井奔散，民心动摇——太史令秉笔直书，此事必载于史。）';
    } else {
      var aC = atk.count, dC = tgt.count;
      var aS = aC * 10 * (0.85 + Math.random() * 0.3);
      var dS = dC * 10 * (0.85 + Math.random() * 0.3);
      var dCas = Math.min(dC, Math.max(1, Math.round(aS / 22)));
      var aCas = Math.min(aC, Math.max(0, Math.round(dS / 30)));
      var dLeft = dC - dCas, aLeft = aC - aCas;
      var proc = '两军于' + city + '城' + pos + '交锋，戈矛相击，' + atk.name + '伤亡' + aCas + '人，' + tgt.name + '伤亡' + dCas + '人';
      var res, imp;
      if (dLeft <= 0 && aLeft > 0) { res = tgt.name + '全军覆没，' + atk.name + '余' + aLeft + '人'; imp = '王师大胜，军威震于四方，然杀伐之气盈城'; }
      else if (aLeft <= 0 && dLeft > 0) { res = atk.name + '全军覆没，' + tgt.name + '余' + dLeft + '人'; imp = '王师折戟，朝野哗然，诸侯侧目'; }
      else if (aLeft <= 0 && dLeft <= 0) { res = '两军俱灭，尸横遍地'; imp = '惨胜如败，城中缟素'; }
      else { res = atk.name + '余' + aLeft + '人，' + tgt.name + '余' + dLeft + '人，胜负未分而两军暂却'; imp = '兵连祸结，民心惶惶'; }
      // 应用伤亡
      if (dLeft <= 0) killPawn(tgt); else shrinkUnit(tgt, dLeft);
      if (aLeft <= 0) killPawn(atk); else if (aCas > 0) { var na = shrinkUnit(atk, aLeft); if (Z.actor === atk) setActor(na); }
      msg = '（周天子敕命' + atk.name + '攻击' + tgt.name + '。过程：' + proc + '。结果：' + res + '。影响：' + imp + '。）';
    }
    if (window.ZJ3D_say) ZJ3D_say(msg);
    updateBuildHud();
  }

  /* ---------------- 选中 / 弹窗 ---------------- */
  var actorRing = null;
  function setActor(p) {
    Z.actor = p;
    if (actorRing && actorRing.parent) actorRing.parent.remove(actorRing);
    if (p && p.root.parent) {
      if (!actorRing) {
        actorRing = new T.Mesh(new T.RingGeometry(1, 1.25, 24), new T.MeshBasicMaterial({ color: 0x66dd66, transparent: true, opacity: 0.7, depthWrite: false }));
        actorRing.rotation.x = -Math.PI / 2;
      }
      var hf = p.tag === 'unit' ? unitHalf(recOf(p.recId) || { troop: 'wu', count: p.count }) : { hw: 0.8, hd: 0.8 };
      actorRing.scale.setScalar(Math.max(hf.hw, hf.hd));
      actorRing.position.set(0, 0.08, 0);
      p.root.add(actorRing);
    }
    updateBuildHud();
  }
  function pawnOf(obj) {
    var o = obj;
    while (o) {
      for (var i = 0; i < Z.pawns.length; i++) if (Z.pawns[i].root === o) return Z.pawns[i];
      o = o.parent;
    }
    return null;
  }
  Z.selNpc = null; // 弹窗目标
  function openNpcBar(p) { Z.selNpc = p; updateBuildHud(); }

  /* 军费/人物遣散退五成 */
  function dismissPawn(p) {
    var rec = recOf(p.recId);
    var refund = rec ? Math.round(rec.price * 0.5) : 0;
    ECON.gold += refund; econSave();
    var nm = p.name;
    killPawn(p);
    ledgerAdd('razed', { d: nm, v: '遣散', g: refund, c: Z.cityKey });
    Z.selNpc = null; updateBuildHud();
  }

  /* ============================================================
     拆毁系统：官拆（依制卸梁）与兵毁（纵火倾颓）
     原生城建亦可拆（按城持久化"已拆名录"），动画与敕文两制并行
     ============================================================ */
  Z.cityRoots = [];   // 原生城建可点根节点
  Z.anims = [];       // 进行中的拆毁动画
  var RAZED = {};
  try { RAZED = JSON.parse(localStorage.getItem('zj3d_razed_v1') || '{}'); } catch (e) { }
  function razedOf(loc) { return RAZED[loc] || (RAZED[loc] = []); }
  function razedSave() {
    try {
      var cur = {}; try { cur = JSON.parse(localStorage.getItem('zj3d_razed_v1') || '{}') || {}; } catch (e2) { }
      for (var k in RAZED) if (Object.prototype.hasOwnProperty.call(RAZED, k)) cur[k] = RAZED[k];
      localStorage.setItem('zj3d_razed_v1', JSON.stringify(cur));
    } catch (e) { }
  }

  function rootHalf(root) {
    var bb = new T.Box3().setFromObject(root);
    var s = new T.Vector3(); bb.getSize(s);
    return { hw: s.x / 2, hd: s.z / 2, h: s.y };
  }
  function buildingDisp(root) {
    var m = (root.userData.model || '').split('/');
    return m.length === 2 ? dispName(m[0], m[1]) : '屋舍';
  }

  /* 收编原生城建：原件除名，转生为玩家可迁移的营造记录 */
  function adoptEnvBuilding(root) {
    var m = (root.userData.model || '').split('/');
    if (m.length !== 2) return null;
    var seq = root.userData.spawnSeq;
    var store = buildsOf(Z.cityKey);
    var rec = {
      id: ++store.seq, kind: 'model', pack: m[0], name: m[1],
      disp: buildingDisp(root), price: 0,
      cx: Math.round(root.position.x / CELL), cz: Math.round(root.position.z / CELL),
      ry: root.rotation.y || 0,
      seed: Z.cityKey + '#' + store.seq
    };
    if (Math.abs(root.scale.x - 1) > 0.01) rec.s = Math.round(root.scale.x * 100) / 100;
    if (seq) {
      var rz = razedOf(Z.cityKey);
      if (rz.indexOf(seq) < 0) rz.push(seq);
      razedSave();
      Z.cityRoots = Z.cityRoots.filter(function (r) { return r !== root; });
      Z.colliders = Z.colliders.filter(function (c) { return c.seq !== seq; });
      Z.doors = Z.doors.filter(function (d) { return d.seq !== seq; });
    }
    if (root.parent) root.parent.remove(root);
    store.items.push(rec);
    buildsSave();
    spawnBuild(rec);
    return rec;
  }
  /* ---------------- 拆毁执行 ---------------- */
  function finalizeRemove(root) {
    var seq = root.userData.spawnSeq, bid = root.userData.buildId, nid = root.userData.natId;
    if (nid) {
      var rzn = razedOf(Z.cityKey);
      if (rzn.indexOf(nid) < 0) rzn.push(nid);
      razedSave();
      Z.natureRoots = Z.natureRoots.filter(function (r2) { return r2 !== root; });
      if (Z.sel && Z.sel.root === root) Z.sel = null;
      return;
    }
    if (bid) {
      var store = buildsOf(Z.cityKey);
      store.items = store.items.filter(function (it) { return it.id !== bid; });
      buildsSave();
      Z.placedRoots = Z.placedRoots.filter(function (r) { return r !== root; });
      Z.colliders = Z.colliders.filter(function (c) { return c.buildId !== bid; });
    } else if (seq) {
      var rz = razedOf(Z.cityKey);
      if (rz.indexOf(seq) < 0) rz.push(seq);
      razedSave();
      Z.cityRoots = Z.cityRoots.filter(function (r) { return r !== root; });
      Z.colliders = Z.colliders.filter(function (c) { return c.seq !== seq; });
      Z.doors = Z.doors.filter(function (d) { return d.seq !== seq; });
    }
    if (Z.sel && Z.sel.root === root) { Z.sel = null; }
  }
  function puff(x, y, z2, color, n, vy, spread) {
    var parts = [];
    for (var i = 0; i < n; i++) {
      var m = new T.Mesh(new T.IcosahedronGeometry(0.25 + Math.random() * 0.4, 0),
        new T.MeshLambertMaterial({ color: color, transparent: true, opacity: 0.85 }));
      m.position.set(x + (Math.random() - .5) * spread, y + Math.random() * 1.2, z2 + (Math.random() - .5) * spread);
      Z.scene.add(m);
      parts.push({ m: m, vx: (Math.random() - .5) * 1.6, vy: vy * (0.6 + Math.random() * 0.8), vz: (Math.random() - .5) * 1.6 });
    }
    return parts;
  }
  /* 官拆：缓沉入土 + 尘雾 */
  function dismantleBuilding(root, onDone) {
    finalizeRemove(root);
    var hf = rootHalf(root);
    var parts = puff(root.position.x, 0.4, root.position.z, 0xb8b2a4, 10, 1.2, hf.hw * 1.6);
    Z.anims.push({ mode: 'dismantle', root: root, t: 0, T: 1.6, h: hf.h, parts: parts, done: onDone });
  }
  /* 兵毁：火光浓烟 + 倾颓 + 焦土 */
  function razeBuilding(root, onDone) {
    finalizeRemove(root);
    var hf = rootHalf(root);
    Z.anims.push({ mode: 'collapse', root: root, t: 0, T: 2.6, h: hf.h, hw: hf.hw, parts: [], fireT: 0, done: onDone });
  }
  function animTick(dt) {
    for (var i = Z.anims.length - 1; i >= 0; i--) {
      var a = Z.anims[i];
      a.t += dt;
      if (a.mode === 'dismantle') {
        if (a.root.parent) {
          a.root.position.y -= (a.h / a.T) * dt;
          var s = Math.max(0.55, 1 - a.t / a.T * 0.35);
          a.root.scale.set(s, a.root.scale.y, s);
        }
      } else {
        // collapse: 前段抖动喷火，后段倾斜下沉
        if (a.root.parent) {
          if (a.t < 1.1) {
            a.root.position.x += (Math.random() - .5) * 0.14;
            a.root.position.z += (Math.random() - .5) * 0.14;
            a.fireT -= dt;
            if (a.fireT <= 0) {
              a.fireT = 0.14;
              a.parts = a.parts.concat(
                puff(a.root.position.x, 0.6, a.root.position.z, Math.random() > 0.5 ? 0xe8722c : 0xd94f1e, 3, 3.2, a.hw * 1.5),
                puff(a.root.position.x, a.h * 0.5, a.root.position.z, 0x4a4440, 2, 2.2, a.hw)
              );
            }
          } else {
            a.root.rotation.z += dt * 0.5;
            a.root.rotation.x += dt * 0.22;
            a.root.position.y -= (a.h / (a.T - 1.1)) * dt * 1.1;
          }
        }
      }
      // 粒子
      for (var p = 0; p < a.parts.length; p++) {
        var pt = a.parts[p];
        pt.m.position.x += pt.vx * dt; pt.m.position.y += pt.vy * dt; pt.m.position.z += pt.vz * dt;
        pt.m.material.opacity -= dt * 0.55;
        pt.m.scale.multiplyScalar(1 + dt * 0.7);
      }
      if (a.t >= a.T) {
        if (a.root.parent) a.root.parent.remove(a.root);
        a.parts.forEach(function (pt) { if (pt.m.parent) { pt.m.parent.remove(pt.m); pt.m.geometry.dispose(); } });
        if (a.mode === 'collapse') {
          var scorch = new T.Mesh(new T.CircleGeometry(Math.max(2, a.hw * 1.1), 12),
            new T.MeshLambertMaterial({ color: 0x2c2620, transparent: true, opacity: 0.85 }));
          scorch.rotation.x = -Math.PI / 2; scorch.position.set(a.root.position.x, 0.05, a.root.position.z);
          Z.scene.add(scorch);
        }
        if (a.done) a.done();
        Z.anims.splice(i, 1);
      }
    }
  }

  /* ---------------- 官拆入口（含原生城建） ---------------- */
  function edictDemolish(sel) {
    var city = Z.cityKey;
    var pos = posName(Math.round(sel.root.position.x / CELL), Math.round(sel.root.position.z / CELL));
    var disp = sel.rec ? sel.rec.disp : buildingDisp(sel.root);
    var refund = sel.rec ? Math.round(sel.rec.price * 0.6) : 0;
    if (refund) { ECON.gold += refund; econSave(); }
    var isNature = !!sel.root.userData.natId;
    dismantleBuilding(sel.root);
    ledgerAdd('razed', { d: disp, v: isNature ? '清除' : '拆除', g: refund, c: city });
    Z.sel = null; updateBuildHud();
  }
  /* ---------------- 兵毁结算 ---------------- */
  function resolveRaze(atk, tgt) {
    var city = Z.cityKey;
    var pos = posName(Math.round(tgt.root.position.x / CELL), Math.round(tgt.root.position.z / CELL));
    var disp = tgt.disp;
    var isNature = !!tgt.root.userData.natId;
    razeBuilding(tgt.root);
    if (window.ZJ3D_say && isNature) {
      ZJ3D_say('（周天子敕命' + atk.name + '于' + city + '城' + pos + '纵火焚除' + disp + '，草木化为焦炭，烟起数里。）');
    } else if (window.ZJ3D_say) {
      ZJ3D_say('（周天子敕命' + atk.name + '攻毁' + city + '城' + pos + '之' + disp +
        '。过程：兵卒鼓噪而进，纵火焚椽，槌墙毁柱，梁木轰然而倒。结果：' + disp +
        '焚毁倾颓，化为瓦砾焦土。影响：烟尘蔽日，市人夺路奔走，物议汹汹——太史令直书天子毁城，民心为之一沉。）');
    }
    updateBuildHud();
  }

  /* ============================================================
     叙事营造单：太史所记的兴作/毁损/人物来去，作用于当前城
     ============================================================ */
  var EDICT = { key: '', city: '', built: [], razed: [], razedRecs: [] };
  try { var _ed0 = JSON.parse(localStorage.getItem('zj3d_edict') || 'null'); if (_ed0 && _ed0.key) EDICT = _ed0; } catch (e) { }
  function edictSave() { try { localStorage.setItem('zj3d_edict', JSON.stringify(EDICT)); } catch (e) { } }
  var EDICT_ALIAS = {
    '厩': '马厩', '厩舍': '马厩', '马棚': '马厩', '酒肆': '酒楼', '酒馆': '酒楼', '酒家': '酒楼',
    '旅店': '客栈', '客舍': '客栈', '逆旅': '客栈', '宅': '民居', '屋': '民居', '房': '民居',
    '房屋': '民居', '民宅': '民居', '庐': '民居', '宅院': '民居', '粮仓': '官仓', '仓廪': '官仓',
    '仓': '官仓', '谷仓': '官仓', '祠': '神祠', '庙': '神祠', '祠堂': '神祠', '神庙': '神祠',
    '衙署': '官署', '府署': '官署', '官府': '官署', '宫': '宫室', '殿': '宫室', '宫殿': '宫室',
    '书店': '书肆', '书铺': '书肆', '茶肆': '茶棚', '茶馆': '茶棚', '药肆': '药铺', '医馆': '药铺',
    '铁铺': '铁匠铺', '锻铺': '铁匠铺', '武库': '兵器铺', '亭': '凉亭', '亭子': '凉亭',
    '树': '常青树', '松': '苍松', '枫': '红枫', '樱': '樱树', '竹': '竹丛', '竹林': '竹丛',
    '花': '花圃', '花园': '花圃', '灯': '灯柱', '桥': '石桥', '塔': '宝塔', '戏楼': '戏台',
    '苇': '芦苇', '水池': '池塘', '荷池': '池塘', '石山': '假山', '山石': '假山', '岩石': '露岩',
    '路': '石板道', '道': '石板道', '街': '石板道', '官道': '夯土官道'
  };
  function edictWord(w) {
    w = String(w || '').replace(/[的之一座座间栋所处株棵条段]/g, '').trim();
    return EDICT_ALIAS[w] || w;
  }
  function edictResolve(word) {
    word = edictWord(word);
    if (!word) return null;
    var pref = { '市井': 5, '王室': 4, '人物': 4, '草木': 3, '道路': 3, '军旅': 2, '构件': 1 };
    var best = null, bestScore = -1;
    catalog().forEach(function (c) {
      if (c.tab === '家具') return; // 家具只属室内
      c.items.forEach(function (it) {
        var d = it.disp.replace(/·.+$/, '');
        var score = -1;
        if (d === word) score = 100;
        else if (d.indexOf(word) === 0 || word.indexOf(d) === 0) score = 60;
        else if (word.length >= 2 && (d.indexOf(word) >= 0 || word.indexOf(d) >= 0)) score = 40;
        if (score < 0) return;
        score += (pref[c.tab] || 0);
        if (score > bestScore) { bestScore = score; best = it; }
      });
    });
    return best;
  }
  function itemAABBAt(item, cx, cz) {
    if (item.kind === 'npc') return { x: cx * CELL, z: cz * CELL, hw: 0.7, hd: 0.7 };
    if (item.kind === 'unit') { var tr = TROOPS[item.name]; return { x: cx * CELL, z: cz * CELL, hw: tr.cols * 0.65 + 0.5, hd: Math.ceil(tr.count / tr.cols) * 0.65 + 0.5 }; }
    if (item.kind === 'road') return { x: cx * CELL, z: cz * CELL, hw: RW / 2 - 0.1, hd: RW / 2 - 0.1 };
    if (item.kind === 'flora') { var r0 = item.name === 'bamboo' ? 2.2 : (item.name === 'rocks' ? 2 : 1.4); return { x: cx * CELL, z: cz * CELL, hw: r0, hd: r0 }; }
    var inf = info(item.pack, item.name);
    return { x: cx * CELL, z: cz * CELL, hw: inf.size.x / 2, hd: inf.size.z / 2 };
  }
  function edictSpotFree(bb) {
    for (var i = 0; i < Z.colliders.length; i++) {
      var c = Z.colliders[i];
      if (aabbHit(bb, { x: c.x, z: c.z, hw: c.hw, hd: c.hd }, -0.4)) return false;
    }
    var items = buildsOf(Z.cityKey).items;
    for (var j = 0; j < items.length; j++) if (aabbHit(bb, recAABB(items[j]), -0.2)) return false;
    return true;
  }
  function edictSpot(item, seedStr, cx0, cz0) {
    var r = rng('ed' + seedStr);
    var px = cx0 != null ? cx0 : (Z.player ? Z.player.position.x : Z.bcam.fx);
    var pz = cz0 != null ? cz0 : (Z.player ? Z.player.position.z : Z.bcam.fz);
    var a0 = r() * 6.28;
    for (var ring = 8; ring <= 70; ring += 4) {
      for (var k = 0; k < 12; k++) {
        var a = a0 + k * 0.524 + ring * 0.13;
        var cx = Math.round((px + Math.sin(a) * ring) / CELL), cz = Math.round((pz + Math.cos(a) * ring) / CELL);
        var bb = itemAABBAt(item, cx, cz);
        if (Math.abs(bb.x) > 1900 || Math.abs(bb.z) > 1900) continue;
        if (edictSpotFree(bb)) return { cx: cx, cz: cz };
      }
    }
    return null;
  }
  /* 毁损选靶：先 AI 自建，再城中原生，最后点名匹配玩家所建 */
  function edictTarget(word) {
    word = edictWord(word);
    if (!word) return null;
    var px = Z.player ? Z.player.position.x : 0, pz = Z.player ? Z.player.position.z : 0;
    function nearest(list) {
      var best = null, bd = 1e9;
      list.forEach(function (root) {
        var d = (root.position.x - px) * (root.position.x - px) + (root.position.z - pz) * (root.position.z - pz);
        if (d < bd) { bd = d; best = root; }
      });
      return best;
    }
    var store = buildsOf(Z.cityKey);
    function recMatch(rec, exact) {
      var d = (rec.disp || '').replace(/·.+$/, '');
      return exact ? d === word : (d === word || d.indexOf(word) >= 0 || word.indexOf(d) >= 0);
    }
    // 1) AI 自建
    var ai = Z.placedRoots.filter(function (r2) {
      var rec = null; store.items.forEach(function (it) { if (it.id === r2.userData.buildId) rec = it; });
      return rec && rec.ai && recMatch(rec, false);
    });
    if (ai.length) return nearest(ai);
    // 2) 城中原生（含屋舍类构件），按中文名匹配
    var env = Z.cityRoots.filter(function (r3) {
      var d = buildingDisp(r3).replace(/·.+$/, '');
      return d === word || d.indexOf(word) >= 0 || word.indexOf(d) >= 0;
    });
    if (env.length) return nearest(env);
    // 2.5) 泛指民房而城中无此名目：就近挑一栋有门的民用建筑（民居/铺面/客栈）
    if (word === '民居' || word === '屋舍') {
      var civ = Z.cityRoots.filter(function (r5) {
        var seq5 = r5.userData.spawnSeq; if (!seq5) return false;
        for (var di = 0; di < Z.doors.length; di++) {
          var dd = Z.doors[di];
          if (dd.seq === seq5) return dd.interior === 'home' || dd.interior === 'shop' || dd.interior === 'inn';
        }
        return false;
      });
      if (civ.length) return nearest(civ);
    }
    // 3) 玩家所建：仅当点名（全名一致）才可毁
    var own = Z.placedRoots.filter(function (r4) {
      var rec = null; store.items.forEach(function (it) { if (it.id === r4.userData.buildId) rec = it; });
      return rec && !rec.ai && rec.kind === 'model' && recMatch(rec, true);
    });
    if (own.length) return nearest(own);
    return null;
  }
  function edictUndo() {
    var store = BUILDS[EDICT.city];
    (EDICT.built || []).forEach(function (id) {
      if (Z.cityKey === EDICT.city) removeBuildObject(id);
      if (store) store.items = store.items.filter(function (it) { return it.id !== id; });
    });
    // 撤销毁损：城建/草木从毁册除名并重建；玩家/AI 所建则原件回档
    var needRebuild = false;
    if (EDICT.city && (EDICT.razed || []).length) {
      var rz = razedOf(EDICT.city);
      EDICT.razed.forEach(function (k) { var ix = rz.indexOf(k); if (ix >= 0) { rz.splice(ix, 1); needRebuild = true; } });
      razedSave();
    }
    (EDICT.razedRecs || []).forEach(function (rec) {
      if (store) { store.items.push(rec); if (Z.cityKey === EDICT.city) spawnBuild(rec); }
    });
    buildsSave();
    if (needRebuild && Z.cityKey === EDICT.city && Z.mode === 'city') buildFor(Z.cityKey);
    EDICT = { key: '', city: '', built: [], razed: [], razedRecs: [] };
    edictSave();
  }
  Z.applyEdict = function (spec, key) {
    /* 面板收起满 90 秒场景会被拆掉（Z.scene=null），但 ready/mode/cityKey 都还在。
       原来的守卫查不到这一点，一路走到 spawn 的 Z.scene.add(g) 抛 TypeError；
       而记录是「先入档再 spawn」，于是档案里留下一条只有记录没有实体的重影建筑。 */
    if (!Z.ready || !Z.scene || Z.mode !== 'city' || !Z.cityKey || !spec) return;
    if (EDICT.key === key) return; // 本轮已应用
    if (EDICT.key && EDICT.key.split('@')[0] === String(key).split('@')[0]) edictUndo(); // 重演此幕：先撤上一版
    var made = [], razedKeys = [], razedRecs = [];
    /* 「来者」原来跟建筑走同一条流水，统一过 edictResolve —— 而那只在「可建之物」词表
       （建筑/草木/道路/军旅 + 职业类目名）里找。人名当然找不到，score 恒 <0，
       整条被丢弃：剧情里出现的任何具名角色都不会出现在三维里。
       改成先按身份词猜个外形，再把 sec_deed 里写的那个人名原样挂上去。 */
    /* 正文里抓出来的「来者」有相当一部分是泛指（有人／众人／使者／几个人），
       把它们当具名角色摆进城里只会平添一堆叫「有人」的路人。 */
    var VAGUE = /^(有人|某人|众人|人们|大家|一行人|几个人|数人|数十人|一群人|他|她|它|他们|她们|我|你|来人|此人|那人|这人|无|不详)$/;
    (spec.come || []).slice(0, 3).forEach(function (c, ci) {
      var nm = String((c && c.name) || '').trim();
      if (!nm || nm.length < 2 || nm.length > 8 || VAGUE.test(nm)) return;
      var item = edictResolve(nm) || edictResolve(String(c.role || '')) || null;
      var store = buildsOf(Z.cityKey);
      var spot = edictSpot(item || { kind: 'npc' }, key + '@who#' + ci);
      if (!spot) return;
      var rec = {
        id: ++store.seq, kind: 'npc',
        pack: (item && item.pack) || '', name: (item && item.name) || nm,
        npc: (item && item.kind === 'npc') ? item.name : nm,
        disp: nm, fromStory: 1, price: 0, cx: spot.cx, cz: spot.cz, ry: 0,
        seed: Z.cityKey + '#' + store.seq, ai: 1
      };
      store.items.push(rec);
      if (!spawnBuild(rec)) { store.items.pop(); --store.seq; return; }
      made.push(rec.id);
    });
    var builds = (spec.build || []).slice(0, 3);
    builds.forEach(function (b, bi) {
      var item = edictResolve(b.name); if (!item) return;
      var n = Math.max(1, Math.min(3, b.n || 1));
      for (var i = 0; i < n; i++) {
        var spot = edictSpot(item, key + '#' + bi + '#' + i); if (!spot) return;
        var store = buildsOf(Z.cityKey);
        var rec = {
          id: ++store.seq, kind: item.kind, pack: item.pack, name: item.name,
          disp: item.disp, price: 0, cx: spot.cx, cz: spot.cz, ry: 0,
          seed: Z.cityKey + '#' + store.seq, ai: 1
        };
        if (item.kind === 'npc') rec.npc = item.name;
        if (item.kind === 'unit') { rec.troop = item.name; rec.count = TROOPS[item.name].count; }
        store.items.push(rec); spawnBuild(rec); made.push(rec.id);
        var parts = puff(spot.cx * CELL, 0.8, spot.cz * CELL, 0xd9b96a, 8, 1.8, 3);
        Z.anims.push({ mode: 'dismantle', root: new T.Group(), t: 0, T: 1.2, h: 0, parts: parts });
      }
    });
    (spec.raze || []).slice(0, 2).forEach(function (rz) {
      var root = edictTarget(rz.name); if (!root) return;
      var bid = root.userData.buildId, seq = root.userData.spawnSeq, nid = root.userData.natId;
      if (bid) { // 玩家/AI 所建：留档以备重演撤销
        var store = buildsOf(Z.cityKey), rec0 = null;
        store.items.forEach(function (it) { if (it.id === bid) rec0 = it; });
        if (rec0) razedRecs.push(JSON.parse(JSON.stringify(rec0)));
      } else if (nid) razedKeys.push(nid);
      else if (seq) razedKeys.push(seq);
      razeBuilding(root);
    });
    (spec.go || []).slice(0, 2).forEach(function (g) {
      var w = edictWord(g.name);
      if (!w) return;
      for (var gi = 0; gi < Z.pawns.length; gi++) {
        var p = Z.pawns[gi];
        if (p.tag !== 'ambient' && p.tag !== 'hist' && p.tag !== 'placed') continue;
        if ((p.name || '').indexOf(w) < 0 && (p.cat || '').indexOf(w) < 0) continue;
        if (p.recId) {
          var st2 = buildsOf(Z.cityKey), rc = null;
          st2.items.forEach(function (it) { if (it.id === p.recId) rc = it; });
          if (rc) razedRecs.push(JSON.parse(JSON.stringify(rc)));
          st2.items = st2.items.filter(function (it) { return it.id !== p.recId; });
        }
        if (p.root && p.root.parent) p.root.parent.remove(p.root);
        Z.pawns.splice(gi, 1);
        break;
      }
    });
    buildsSave();
    EDICT = { key: key, city: Z.cityKey, built: made, razed: razedKeys, razedRecs: razedRecs };
    edictSave();
  };

  /* ============================================================
     御令：「令·天下」的世界指令由游戏亲自解析执行，AI 只叙其果
     ============================================================ */
  var CNN = { '一': 1, '两': 2, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  function cmdPan(x, z) { Z.bcam.fx = x; Z.bcam.fz = z; }
  function cmdMovePlayer(x, z) {
    if (!Z.player) { cmdPan(x, z); return; }
    puff(Z.player.position.x, 0.7, Z.player.position.z, 0xd8b23a, 2, 1.6, 0.8);
    Z.player.position.x = x; Z.player.position.z = z;
    var py = Z.player.rotation.y, sy = Math.sin(py), cy = Math.cos(py);
    Z.escort.forEach(function (g) {
      var off = g.userData.off || [0, -2];
      g.position.set(x + off[0] * cy + off[1] * sy, 0, z - off[0] * sy + off[1] * cy);
    });
    puff(x, 0.7, z, 0xd8b23a, 2, 1.6, 0.8);
    cmdPan(x, z);
  }
  function cmdName(part) {
    return String(part || '')
      .replace(/[×xX*]\s*\d+/g, '')
      .replace(/[一两二三四五六七八九十]?\s*[座间栋个株棵段条处所支队]/g, '')
      .replace(/^(?:在|于)[^，。]{0,6}?(?:处|边|侧|角|方)?/, '')
      .replace(/[，。！!、\s「」]/g, '')
      .trim();
  }
  function cmdDispOf(root) {
    var disp = root.userData.natDisp || buildingDisp(root);
    var store = buildsOf(Z.cityKey);
    store.items.forEach(function (it) { if (it.id === root.userData.buildId) disp = it.disp; });
    return disp;
  }
  function cmdRazeTarget(word) {
    var w = edictWord(word);
    if (!w) return null;
    var px = Z.player ? Z.player.position.x : 0, pz = Z.player ? Z.player.position.z : 0;
    var store = buildsOf(Z.cityKey);
    var best = null, bd = 1e9;
    Z.placedRoots.forEach(function (r) {
      var rec = null; store.items.forEach(function (it) { if (it.id === r.userData.buildId) rec = it; });
      if (!rec || !r.parent) return;
      var d0 = (rec.disp || '').replace(/·.+$/, '');
      if (!(d0 === w || d0.indexOf(w) >= 0 || w.indexOf(d0) >= 0)) return;
      var d = Math.pow(r.position.x - px, 2) + Math.pow(r.position.z - pz, 2);
      if (d < bd) { bd = d; best = r; }
    });
    return best || edictTarget(word);
  }
  function cmdBuild(part, raw) {
    var n = 1, mm = /[×xX*]\s*(\d+)/.exec(part);
    if (mm) n = parseInt(mm[1], 10);
    else { var cm = /([一两二三四五六七八九十])\s*[座间栋个株棵段条支队]/.exec(part); if (cm) n = CNN[cm[1]] || 1; }
    n = Math.max(1, Math.min(6, n));
    var name = cmdName(part);
    var item = name ? edictResolve(name) : null;
    if (!item) return { ok: false, report: '未识得「' + (name || part) + '」为何物。可兴作之名目详见营造清单（如：马厩、酒楼、民居、官仓、神祠、石板道、常青树……）' };
    var cost = item.price * n;
    if (ECON.gold < cost) return { ok: false, report: '国库仅余金' + ECON.gold + '，不足以支此役所需金' + cost };
    var dm = /[宫城]?([东南西北])/.exec(raw);
    var px = Z.player ? Z.player.position.x : Z.bcam.fx, pz = Z.player ? Z.player.position.z : Z.bcam.fz;
    var D = { '东': [30, 0], '西': [-30, 0], '南': [0, 30], '北': [0, -30] };
    if (dm && D[dm[1]]) { px += D[dm[1]][0]; pz += D[dm[1]][1]; }
    var store = buildsOf(Z.cityKey), made = 0, lastSpot = null;
    for (var i = 0; i < n; i++) {
      var spot = edictSpot(item, 'cmd' + store.seq + '#' + i + name, px, pz);
      if (!spot) break;
      var rec = {
        id: ++store.seq, kind: item.kind, pack: item.pack, name: item.name,
        disp: item.disp, price: item.price, cx: spot.cx, cz: spot.cz, ry: 0,
        seed: Z.cityKey + '#' + store.seq, ai: 1
      };
      if (item.kind === 'npc') rec.npc = item.name;
      if (item.kind === 'unit') { rec.troop = item.name; rec.count = TROOPS[item.name].count; }
      store.items.push(rec); spawnBuild(rec); made++; lastSpot = spot;
      var parts = puff(spot.cx * CELL, 0.8, spot.cz * CELL, 0xd9b96a, 8, 1.8, 3);
      Z.anims.push({ mode: 'dismantle', root: new T.Group(), t: 0, T: 1.2, h: 0, parts: parts });
    }
    if (!made) return { ok: false, report: '御驾附近已无空地可容' + item.disp + '，请移步他处再颁此令' };
    ECON.gold -= item.price * made; econSave(); buildsSave();
    cmdPan(lastSpot.cx * CELL, lastSpot.cz * CELL);
    return { ok: true, report: item.disp + '×' + made + '已于' + posName(lastSpot.cx, lastSpot.cz) + '一带落成，支金' + (item.price * made) + '，国库余金' + ECON.gold };
  }
  function cmdRaze(part) {
    var word = cmdName(part);
    var root = word ? cmdRazeTarget(word) : null;
    if (!root) return { ok: false, report: '城中未寻得可拆的「' + (word || part) + '」' };
    var disp = cmdDispOf(root);
    var store = buildsOf(Z.cityKey), rec = null;
    store.items.forEach(function (it) { if (it.id === root.userData.buildId) rec = it; });
    var refund = rec ? Math.round((rec.price || 0) * 0.6) : 0;
    if (refund) { ECON.gold += refund; econSave(); }
    var pos = posName(Math.round(root.position.x / CELL), Math.round(root.position.z / CELL));
    cmdPan(root.position.x, root.position.z);
    dismantleBuilding(root);
    return { ok: true, report: pos + '之' + disp + '已奉敕拆除' + (refund ? '，役毕返金' + refund : '') };
  }
  function cmdFind(part) {
    var w = cmdName(part) || String(part || '').trim();
    if (!w) return { ok: false, report: '未言明欲寻何人' };
    var px = Z.player ? Z.player.position.x : 0, pz = Z.player ? Z.player.position.z : 0;
    var best = null, bd = 1e9;
    Z.pawns.forEach(function (p) {
      if (p.tag === 'escort' || p.tag === 'unit') return;
      if ((p.name || '').indexOf(w) < 0 && (p.cat || '').indexOf(w) < 0) return;
      if (!p.root || !p.root.parent) return;
      var d = Math.pow(p.root.position.x - px, 2) + Math.pow(p.root.position.z - pz, 2);
      if (d < bd) { bd = d; best = p; }
    });
    if (!best) return { ok: false, report: '城中未寻得「' + w + '」其人' };
    var bx = best.root.position.x, bz = best.root.position.z;
    cmdMovePlayer(bx + 1.8, bz + 1.8);
    return { ok: true, report: '已于' + posName(Math.round(bx / CELL), Math.round(bz / CELL)) + '寻得' + best.name + '（' + best.cat + '），御驾已至其前' };
  }
  function cmdAttack(part) {
    var w = cmdName(part) || String(part || '').trim();
    var unit = null;
    Z.pawns.forEach(function (p) { if (!unit && p.tag === 'unit' && p.own && p.root && p.root.parent) unit = p; });
    if (!unit) return { ok: false, report: '麾下并无成建制王师。请先于营造清单「军旅」征募，再颁攻伐之令' };
    var root = cmdRazeTarget(w);
    if (root) {
      var disp = cmdDispOf(root);
      Z.orders = Z.orders.filter(function (o) { return o.unit !== unit; });
      Z.orders.push({ unit: unit, type: 'attackB', target: { root: root, disp: disp }, phase: 'march' });
      cmdPan(root.position.x, root.position.z);
      return { ok: true, report: unit.name + '已奉令开赴，兵锋直指' + disp + '——战果太史令将另行奏报' };
    }
    var np = null, nd = 1e9;
    Z.pawns.forEach(function (p) {
      if (p.own || p.tag === 'escort') return;
      if ((p.name || '').indexOf(w) < 0 && (p.cat || '').indexOf(w) < 0) return;
      if (!p.root || !p.root.parent) return;
      var d = Math.pow(p.root.position.x - unit.root.position.x, 2) + Math.pow(p.root.position.z - unit.root.position.z, 2);
      if (d < nd) { nd = d; np = p; }
    });
    if (!np) return { ok: false, report: '未寻得可攻之「' + w + '」' };
    Z.orders = Z.orders.filter(function (o) { return o.unit !== unit; });
    Z.orders.push({ unit: unit, type: 'attack', target: np, phase: 'march' });
    cmdPan(np.root.position.x, np.root.position.z);
    return { ok: true, report: unit.name + '已奉令开赴，直取' + np.name + '——战果太史令将另行奏报' };
  }
  function cmdGo(part) {
    var w = String(part || '').trim().replace(/[，。！\s]/g, '');
    var dm = /^[宫城]?([东南西北])(?:边|侧|面|方|郊)?$/.exec(w);
    var px = Z.player ? Z.player.position.x : Z.bcam.fx, pz = Z.player ? Z.player.position.z : Z.bcam.fz;
    if (dm) {
      var D = { '东': [46, 0], '西': [-46, 0], '南': [0, 46], '北': [0, -46] };
      var o = D[dm[1]];
      cmdMovePlayer(px + o[0], pz + o[1]);
      return { ok: true, report: '御驾已移至' + posName(Math.round((px + o[0]) / CELL), Math.round((pz + o[1]) / CELL)) };
    }
    var word = cmdName(w) || w;
    var root = cmdRazeTarget(word);
    if (root) {
      var hf = rootHalf(root);
      cmdMovePlayer(root.position.x, root.position.z + hf.hd + 2.5);
      return { ok: true, report: '御驾已至' + cmdDispOf(root) + '门前' };
    }
    return cmdFind(word.replace(/^[找寻]/, ''));
  }
  Z.command = function (raw) {
    raw = String(raw || '').trim();
    if (!raw) return { ok: false, report: '敕令为空' };
    if (!Z.ready || !Z.scene || Z.mode !== 'city' || !Z.cityKey) return { ok: false, report: '三维天下尚未就绪，请展开上方三维画面待城池加载完毕' };
    var m;
    m = /(?:攻打|攻击|讨伐|兵发|^攻|^伐)\s*(.+)$/.exec(raw); if (m) return cmdAttack(m[1]);
    m = /(?:拆除|拆掉|拆了|平毁|撤去|清除|^拆)\s*(.+)$/.exec(raw); if (m) return cmdRaze(m[1]);
    m = /^(?:找|寻访?|召见|见)\s*(.+)$/.exec(raw); if (m) return cmdFind(m[1]);
    m = /^(?:去|往|移步|行至|到)\s*(.+)$/.exec(raw); if (m) return cmdGo(m[1]);
    m = /(?:盖|修建|建造|营建|兴建|新建|起|造|修|铺设|铺|植|种|建)\s*(.+)$/.exec(raw); if (m) return cmdBuild(m[1], raw);
    return { ok: false, report: '未能辨识敕令。可用句式：起马厩×2 ／ 拆酒楼 ／ 攻打粮仓 ／ 寻老聃 ／ 去城南 ／ 移驾郢（列国都邑）' };
  };

  /* ---------------- public hooks ---------------- */
  Z.toggleExpand = function () {
    Z.expanded = !Z.expanded;
    /* 面板的档位（0 默认 / 1 放大 / 2 全屏）以 Z.tier 为准，台前调度小窗和这一钮
       共用同一个数。以前这里只翻 expanded 不动 tier，面板读 tier 仍是 0，
       于是按了「营造」画面纹丝不动。展开顶到第 1 档（已在更大档就留着），收起归 0。 */
    Z.tier = Z.expanded ? Math.max(1, Z.tier | 0) : 0;
    try { localStorage.setItem('zj3d_expand', Z.expanded ? '1' : '0'); } catch (e) { }
    try { localStorage.setItem('med3d_tier', String(Z.tier)); localStorage.setItem('med3d_expand', Z.tier > 0 ? '1' : '0'); } catch (e) { }
    Z.camDist = Z.mode === 'interior' ? 7 : 12;
    if (window.ZJ3D_onExpand) window.ZJ3D_onExpand();
    updateHud(); if (bHud.wrap) updateBuildHud();
  };
  Z.sleep = function () { if (Z.asleep) return; Z.asleep = true; Z._sleptAt = performance.now(); };
  Z.wake = function () {
    if (!Z.asleep) return;
    Z.asleep = false;
    if (Z._torn) {
      Z._torn = false; Z.cityKey = null;
      if (Z.mode === 'interior') {
        Z.mode = 'city'; Z.intKey = null; Z.intPlan = false;
        Z.interiorFrom = null; Z.exitDoor = null;
      }
    }
  };
  /* 读档：宿主把存档里的三维状态写回 localStorage 之后调这一下。
     没有它的话，引擎闭包里那份页面加载时读进来的旧副本会在下一次保存时
     把刚回档的名录整份覆盖回去——存档回到过去，城市却停在未来。 */
  Z.reloadStore = function () {
    try { BUILDS = JSON.parse(localStorage.getItem('zj3d_builds_v1') || '{}') || {}; } catch (e) { }
    try { RAZED = JSON.parse(localStorage.getItem('zj3d_razed_v1') || '{}') || {}; } catch (e) { }
    try {
      var _e2 = JSON.parse(localStorage.getItem('zj3d_econ') || '{}');
      /* 键不存在＝那份存档写下时还没花过钱，要回到初值，不能留着当前这一份 */
      if (_e2 && _e2.gold != null) { ECON.gold = _e2.gold; ECON.stamp = _e2.stamp; }
      else { ECON.gold = 5000; ECON.stamp = 0; }
    } catch (e) { }
    try { var _l2 = JSON.parse(localStorage.getItem('zj3d_ledger') || 'null'); LEDGER = (_l2 && _l2.built && _l2.razed) ? _l2 : { built: [], razed: [] }; } catch (e) { }
    try { var _d2 = JSON.parse(localStorage.getItem('zj3d_edict') || 'null'); EDICT = (_d2 && _d2.key) ? _d2 : { key: '', city: '', built: [], razed: [], razedRecs: [] }; } catch (e) { }
    Z.cityKey = null;                       /* 下一帧照新名录重建 */
    try { updateHud(); } catch (e) { }
  };
  /* 天气取景。mvuSpec 里对模型白纸黑字承诺过「三维画面据此取景」，此前一直没兑现。
     做法克制：只调雾的浓淡与天色/日照的冷暖，不加粒子系统——那会拖垮手机。
     每次建城之后也要复涂一遍，否则新城会退回默认晴天。 */
  Z.wx = null;
  function applyWeather() {
    var sc = Z.scene, w = Z.wx;
    if (!sc || !sc.fog || !w) return;
    var night = !!Z.night;
    var base = night ? 0x141b2e : (sc.userData._skyC != null ? sc.userData._skyC : sc.background.getHex());
    var near = sc.userData._fogNear, far = sc.userData._fogFar;
    if (near == null || far == null) return;
    var tint = null, k = 1;
    if (w.fog) { tint = night ? 0x2a2f3a : 0xb9b3a4; k = 0.34; }        /* 雾/沙尘：视距压到三成 */
    else if (w.snow) { tint = night ? 0x243046 : 0xd8dde4; k = 0.62; }
    else if (w.rain) { tint = night ? 0x141a26 : 0x8f96a0; k = 0.55; }
    else if (w.clear) { k = 1.25; }                                      /* 晴：看得更远 */
    sc.fog.near = near * (k < 1 ? k : 1);
    sc.fog.far = far * k;
    if (tint != null) { sc.fog.color.setHex(tint); sc.background.setHex(tint); }
    else { sc.fog.color.setHex(base); sc.background.setHex(base); }
    /* 阴雨雪时把日照压下去一档，晴天恢复 */
    sc.traverse(function (o) {
      if (!o.isDirectionalLight) return;
      if (o.userData._i0 == null) o.userData._i0 = o.intensity;
      o.intensity = o.userData._i0 * ((w.rain || w.snow || w.fog) ? 0.55 : 1);
    });
  }
  Z.setWeather = function (m) {
    if (!m) return;
    var sig = [m.fog ? 1 : 0, m.rain ? 1 : 0, m.snow ? 1 : 0, m.clear ? 1 : 0, Z.night ? 1 : 0].join('');
    Z.wx = m;
    if (sig === Z._wxSig) return;
    Z._wxSig = sig;
    try { applyWeather(); } catch (e) { }
  };
  Z.setLow = function (on) { PERF.low = !!on; perfSave(); applyPerf(); if (Z._lowBtn) Z._lowBtn(); };
  /* ---------------- 三维 → prompt 的三个入口 ----------------
     环海侧一直有这三个函数，中原侧从来没有：于是玩周纪时 GENIVS.brief() 的第一行
     `var s=snap(); if(!s||!s.city)return ''` 恒为空——系统提示里整段【三维实况】缺失，
     AI 不知道玩家在哪座城、造了什么、身边站着谁、国库多少，也拿不到 <sec_deed> 的
     回执格式说明，于是永远不会输出回执，正文再也驱动不了三维。 */
  Z.vocab = function () {                       /* 可建之物的一级名，给 AI 当选词表 */
    var seen = {}, list = [];
    try {
      catalog().forEach(function (c) {
        if (c.tab === '家具') return;
        (c.items || []).forEach(function (it) {
          var d = String(it.disp || '').replace(/·.+$/, '');
          if (d && !seen[d]) { seen[d] = 1; list.push(d); }
        });
      });
    } catch (e) { }
    return list;
  };
  Z.resolve = function (w) {                    /* 把 AI 写的词对到真实可建之物 */
    try {
      var it = edictResolve(w);
      return it ? { name: it.name, disp: it.disp, kind: it.kind, price: it.price } : null;
    } catch (e) { return null; }
  };
  Z.snapshot = function () {
    if (!Z.owns() || !Z.cityKey) return null;
    var px = Z.player ? Z.player.position.x : 0, pz = Z.player ? Z.player.position.z : 0;
    var s = {
      city: Z.cityKey, mode: Z.mode, interior: Z.intKey || '', night: !!Z.night,
      escortN: Z.escortN || 0, captive: !!Z.captive,
      gold: 0, rate: 0, playerPos: '', builds: [], pawns: [],
      ledger: { built: [], razed: [] }, vocab: []
    };
    try { s.gold = ECON.gold; s.rate = ECON.RATE; } catch (e) { }
    try { s.playerPos = posName(Math.round(px / CELL), Math.round(pz / CELL)); } catch (e) { }
    try {
      var agg = {};
      (buildsOf(Z.cityKey).items || []).forEach(function (it) {
        var k = it.disp || it.name;
        if (!agg[k]) { agg[k] = { disp: k, pos: posName(it.cx, it.cz), n: 0, ai: it.ai ? 1 : 0 }; s.builds.push(agg[k]); }
        agg[k].n++;
      });
    } catch (e) { }
    try {
      (Z.pawns || []).forEach(function (p) {
        if (!p || !p.root || !p.root.parent || !p.name) return;
        var d = Math.abs(p.root.position.x - px) + Math.abs(p.root.position.z - pz);
        if (d > 40) return;
        s.pawns.push({
          name: p.name, cat: p.cat || '', desc: p.desc || '', tag: p.tag || '',
          own: p.own ? 1 : 0, d: d,
          pos: posName(Math.round(p.root.position.x / CELL), Math.round(p.root.position.z / CELL))
        });
      });
      s.pawns.sort(function (a, b) { return a.d - b.d; });
    } catch (e) { }
    try { s.ledger.built = LEDGER.built.slice(); s.ledger.razed = LEDGER.razed.slice(); } catch (e) { }
    try { s.vocab = Z.vocab(); } catch (e) { }
    return s;
  };

  Z.isLow = function () { return PERF.low; };
  Z.paneH = function (mob) {
    if (!Z.owns()) return mob ? 140 : 186;
    if (Z.expanded) return Math.round(window.innerHeight * (mob ? 0.52 : 0.58));
    return mob ? 150 : 200;
  };
  Z.onRender = function (locName, night) {
    var host = document.getElementById('zjScene3D');
    if (!host) return;
    ensureHud(host);
    Z.lastLoc = locName;
    if (!Z.ready) { showLocation(locName, night); updateHud(); return; }
    ensureRenderer();
    if (Z.cv.parentNode !== host) host.insertBefore(Z.cv, host.firstChild);
    var w = host.clientWidth, h = host.clientHeight;
    if (w && h) {
      Z.rnd.setSize(w, h, false);
      Z.cam.aspect = w / h; Z.cam.updateProjectionMatrix();
    }
    /* 地点也变了的时候不必在这儿重建：紧接着的 showLocation 会用新的 Z.night 建新城，
       原来这一句先拿旧的 Z.cityKey 整城重建一遍（约 450 次 spawn ＋ 现画一张 1024²
       地面贴图），纯属白干还多泄漏一整套贴图。「入夜，她已抵达雅典」这种写法很常见。 */
    if (Z.night !== !!night && Z.cityKey === locName && Z.mode === 'city' && Z.ready && Z.cityKey) {
      Z.night = !!night; buildFor(Z.cityKey); // rebuild lighting
    }
    showLocation(locName, night);
    try { if (Z.wx) applyWeather(); } catch (e) { }   /* 新城建好后把天气复涂一遍 */
    updateHud();
  };
  // dev: jump straight to a city / interior
  Z.debugCity = function (locName, night) {
    Z.night = !!night; Z.mode = 'city'; Z.cityKey = '';
    buildFor(locName); Z.cityKey = locName;
  };
  Z.debugInterior = function (kind) { enterInterior(kind, kind); };
  // coverage report (dev)
  Z.coverage = function () {
    var out = {};
    ['ancient', 'historic', 'interior'].forEach(function (pk) {
      var un = Z.packs[pk].names.filter(function (n) { return !USED[pk][n]; });
      out[pk] = { total: Z.packs[pk].names.length, used: Z.packs[pk].names.length - un.length, unused: un };
    });
    return out;
  };
  loadAll();
})();
