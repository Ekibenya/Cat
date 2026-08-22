/* ============================================================
   罗马 · 地中海 —— 天下三维 · 环海城邦模块 (med3d)
   罗马(周)金顶 + 七国城郭各具国色：秦黑 楚赤 齐紫 燕蓝 韩绿 赵土金 魏青碧
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
    zhou: { name: '周', city: '罗马', anc: 'LowpolyChineseBuilding_Texture_03.png', his: 'LowpolyHistoric_Texture_01.png', grass: 0x8fc86a, accent: 0xd8b23a },
    qin:  { name: '秦', city: '迦太基', anc: 'LowpolyChineseBuilding_Texture_04.png', his: 'LowpolyHistoric_Texture_05.png', grass: 0x84b05f, accent: 0x2b2b33 },
    chu:  { name: '楚', city: '斯巴达',   anc: 'LowpolyChineseBuilding_Texture_03.png', his: 'LowpolyHistoric_Texture_03.png', grass: 0x8ed072, accent: 0xa63b26 },
    qi:   { name: '齐', city: '亚历山卓', anc: 'LowpolyChineseBuilding_Texture_01.png', his: 'LowpolyHistoric_Texture_04.png', grass: 0x92c766, accent: 0x6d4a8f },
    yan:  { name: '燕', city: '拜占庭',   anc: 'LowpolyChineseBuilding_Texture_02.png', his: 'LowpolyHistoric_Texture_02.png', grass: 0x7fb264, accent: 0x33528f },
    han:  { name: '韩', city: '科林斯', anc: 'LowpolyChineseBuilding_Texture_05.png', his: 'LowpolyHistoric_Texture_05.png', grass: 0x8ac368, accent: 0x3f7d4e },
    zhao: { name: '赵', city: '雅典', anc: 'Ancient_Tex_Zhao.png',                  his: 'LowpolyHistoric_Texture_01.png', grass: 0x9bc167, accent: 0xb98a3a },
    wei:  { name: '魏', city: '叙拉古', anc: 'Ancient_Tex_Wei.png',                   his: 'LowpolyHistoric_Texture_02.png', grass: 0x8fcb74, accent: 0x3a8f86 }
  };
  // 棋盘地点 → 国 + 场景风味
  var LOC2 = {
    '罗马': { st: 'zhou', flavor: 'luoyi' },
    '迦太基': { st: 'qin', flavor: 'town' }, '函谷关': { st: 'qin', flavor: 'pass' }, '成都': { st: 'qin', flavor: 'town' },
    '雅典': { st: 'zhao', flavor: 'town' }, '灵寿': { st: 'zhao', flavor: 'town' },
    '拜占庭': { st: 'yan', flavor: 'town' },
    '亚历山卓': { st: 'qi', flavor: 'town' }, '曲阜': { st: 'qi', flavor: 'town' }, '陶邑': { st: 'qi', flavor: 'town' },
    '叙拉古': { st: 'wei', flavor: 'water' }, '商丘': { st: 'wei', flavor: 'town' },
    '科林斯': { st: 'han', flavor: 'town' },
    '斯巴达': { st: 'chu', flavor: 'water' }, '宛': { st: 'chu', flavor: 'town' }, '姑苏': { st: 'chu', flavor: 'water' }, '会稽': { st: 'chu', flavor: 'water' }
  };

  /* ---------------- module state ---------------- */
  var Z = window.MED3D = {
    ready: false, failed: false, loading: false, prog: 0,
    expanded: false, mode: 'city', // city | interior
    cv: null, rnd: null, packs: {}, tex: {}, mats: {},
    scene: null, cam: null, cityKey: '', pending: null,
    player: null, colliders: [], doors: [], exitDoor: null,
    interiorFrom: null, keys: {}, joy: { on: false, x: 0, y: 0 },
    camYaw: 0, camPitch: 0.32, camDist: 12, lastLoc: null, night: false,
    chipText: '', eraText: '',
    owns: function () { return this.ready && !this.failed; }
  };
  try {
    var _tv = localStorage.getItem('med3d_tier');
    Z.tier = _tv != null ? (Math.abs(+_tv) % 3) : 0;
  } catch (e) { Z.tier = 0; }
  Z.expanded = Z.tier > 0;

  /* ---------------- seeded rng ---------------- */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = hash(seed); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------------- asset loading ---------------- */
  var MANI = [
    ['ancient', 'ancient.glb'], ['historic', 'historic.glb'], ['interior', 'interior.glb'], ['nature', 'nature.glb'],
    ['desert', 'desert.glb'],   /* 沙漠资材（缺件时装载器自动跳过，旧包不崩） */
    ['steppe', 'steppe.glb']   /* 草原毡帐资材（同上，缺件自动跳过） */
  ];
  var TEXES = ['LowpolyChineseBuilding_Texture_01.png', 'LowpolyChineseBuilding_Texture_02.png', 'LowpolyChineseBuilding_Texture_03.png', 'LowpolyChineseBuilding_Texture_04.png', 'LowpolyChineseBuilding_Texture_05.png',
    'Ancient_Tex_Zhao.png', 'Ancient_Tex_Wei.png',
    'LowpolyHistoric_Texture_01.png', 'LowpolyHistoric_Texture_02.png', 'LowpolyHistoric_Texture_03.png', 'LowpolyHistoric_Texture_04.png', 'LowpolyHistoric_Texture_05.png',
    'LowpolyHistoric_Sculpture_01.png',
    'LowpolyHistoricInterior_Texture_01.png', 'LowpolyHistoricInterior_Texture_02.png', 'LowpolyHistoricInterior_Texture_03.png',
    'T_Trees_temp_climate.png', 'T_Tree_tropical.png', 'T_Mountains_temperate_climate_32.png'];

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
  /* 棋子小包（pawn.glb + pawn.json + 调色板贴图）：两引擎共用同一份，各自加载各自持有。
     失败不致命——共用模块会自动回落到火柴人。 */
  var PAWN_PACK = 'core/res/data/idx/v1/ceb0dfcfec.dat?v=1';
  function loadPawnPack(loader, texLoader) {
    return fetch(PAWN_PACK).then(function (r) {
      if (!r.ok) throw new Error('pawn pack http ' + r.status);
      return r.arrayBuffer();
    }).then(function (ab) {
      var pk = unpack(ab);
      try { Z.pawnRig = JSON.parse(new TextDecoder().decode(pk['pawn.json'])); } catch (e) { }
      var jobs = [new Promise(function (res, rej) {
        loader.parse(pk['pawn.glb'].slice().buffer, '', res, rej);
      }).then(function (g) {
        var lib = {};
        g.scene.children.forEach(function (n) { if (n.name) lib[n.name] = n; });
        Z.packs.pawn = { root: g.scene, lib: lib, names: Object.keys(lib) };
      })];
      if (pk['tex/pawnpal.png']) {
        var url = URL.createObjectURL(new Blob([pk['tex/pawnpal.png']], { type: 'image/png' }));
        jobs.push(texLoader.loadAsync(url).then(function (tx) {
          URL.revokeObjectURL(url);
          tx.colorSpace = T.SRGBColorSpace; tx.flipY = false;
          Z.tex['pawnpal.png'] = tx;
        }));
      }
      return Promise.all(jobs);
    }).catch(function (e) { console.warn('pawn pack failed', e); });
  }
  /* 汉地资材（RitusZhou 那一套中式建筑）。与地中海那套是同一个低模套件的两次换皮：
     222 / 190 / 45 个构件名一个不差地对上，只是屋顶、斗拱、门脸重做过。
     所以中都、汴梁、临安这些城不必另写一套配方——把包换掉，原来的中式蓝图
     （buildTown / buildLuoyi / buildPass，本来就是从 RitusZhou 搬过来的）直接就能用。
     整包缺席不致命：zanc 一旦是 undefined，spawn 里的重定向自动退回地中海那套。 */
  var HAN_PACK = 'core/res/data/idx/v1/df6d172d82.dat?v=1';
  var HAN_SLOT = { ancient: 'zanc', historic: 'zhis', interior: 'zint' };
  /* 贴图也必须跟着换包。两套资材虽然构件名对得上，着色方式却是两回事：
     地中海那套重做过 UV，整包只吃一张 16×16 的调色条（每个面取一个像素）；
     中式这套还是原版的 1024×1024 图集。把 16×16 的调色条铺到中式模型的 UV 上，
     一面墙横跨半张图，出来就是那种彩虹条纹。
     所以中式贴图另存一份，键名前缀 han:，与地中海那份同名不同物、互不覆盖。 */
  function hanTex(texName) {
    return (Z.han && texName && Z.tex['han:' + texName]) ? 'han:' + texName : texName;
  }
  function loadHanPack(loader, texLoader) {
    return fetch(HAN_PACK).then(function (r) {
      if (!r.ok) throw new Error('han pack http ' + r.status);
      return r.arrayBuffer();
    }).then(function (ab) {
      var pk = unpack(ab);
      var texJobs = Object.keys(pk).filter(function (n) { return n.indexOf('tex/') === 0; }).map(function (n) {
        var url = URL.createObjectURL(new Blob([pk[n]], { type: 'image/png' }));
        return texLoader.loadAsync(url).then(function (tx) {
          URL.revokeObjectURL(url);
          tx.colorSpace = T.SRGBColorSpace; tx.flipY = false;
          Z.tex['han:' + n.slice(4)] = tx;
        }).catch(function () { });
      });
      return Promise.all(texJobs.concat(Object.keys(HAN_SLOT).map(function (k) {
        if (!pk[k + '.glb']) return null;
        return new Promise(function (res, rej) {
          loader.parse(pk[k + '.glb'].slice().buffer, '', res, rej);
        }).then(function (g) {
          var lib = {};
          g.scene.children.forEach(function (n) { if (n.name) lib[n.name] = n; });
          /* 两套包的构件名对到只差一个：中式那边导出时给某件多留了个 _1 后缀
             （SM_Env_Wall_23_1）。不改资材，在这儿补一条别名就够——
             凡是「××_1」而「××」缺席的，一律把无后缀那个名也指过去。 */
          Object.keys(lib).forEach(function (n) {
            var m1 = /^(.+)_1$/.exec(n);
            if (m1 && !lib[m1[1]]) lib[m1[1]] = lib[n];
          });
          Z.packs[HAN_SLOT[k]] = { root: g.scene, lib: lib, names: Object.keys(lib) };
        });
      })));
    }).catch(function (e) { console.warn('han pack failed — 汉地城退回地中海模型', e && e.message || e); });
  }
  function loadAll() {
    if (Z.loading || Z.ready || Z.failed) return;
    Z.loading = true;
    var loader = new window.ZJ_GLTFLoader();
    if (window.ZJ_MeshoptDecoder) loader.setMeshoptDecoder(window.ZJ_MeshoptDecoder);
    var texLoader = new T.TextureLoader();
    var done = 0, total = MANI.length + TEXES.length + 1;
    function tick() { done++; Z.prog = done / total; updateHud(); }
    fetch('core/res/data/idx/v1/cdcf9bb63a.dat?v=48').then(function (r) {
      if (!r.ok) throw new Error('pack http ' + r.status);
      return r.arrayBuffer();
    }).then(function (ab) {
      var pk = unpack(ab); tick();
      /* pawn.glb / pawn.json 已挪到两引擎共用的小包，见 loadPawnPack */
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
      jobs.push(loadHanPack(loader, texLoader));
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
  /* 自带贴图的资材包。沙漠与草原两套模型各自烘了自己的体素贴图，
     配方里生成它们时 texName 一律传 null（保留自带材质）——可另外三条路
     （托盘缩略图、幽灵、玩家落件重建）都走的是「不是 ancient 也不是 historic
     就刷室内贴图」这条 else，于是同一座沙漠民居，配方摆的是本色，
     玩家自己摆的被拿希腊室内图集重刷了一遍，颜色整个不对。 */
  function selfTex(pack) { return pack === 'desert' || pack === 'steppe'; }

  /* 汉地重定向：中都、汴梁、临安这类城把 ancient／historic／interior 三个槽
     整体换成中式那一套。两套构件名一一对应，所以换的是皮不是骨——
     配方一行都不用改。汉地包没装载成功就原样返回，退回地中海模型。 */
  function hanPack(pack) {
    if (!Z.han) return pack;
    var sl = HAN_SLOT[pack];
    return (sl && Z.packs && Z.packs[sl] && Z.packs[sl].lib) ? sl : pack;
  }

  /* template info cache: bbox size + ground offset */
  var tinfo = {};
  function info(pack, name) {
    pack = hanPack(pack);            /* 尺寸也得取换过之后那一件，否则碰撞体与门位全错 */
    var k = pack + '/' + name;
    if (tinfo[k]) return tinfo[k];
    var _P = Z.packs && Z.packs[pack];
    if (!_P || !_P.lib) { return null; }        /* 整包缺席：与缺模型同等对待 */
    var n = _P.lib[name];
    if (!n) { console.warn('missing model', k); return null; }
    var bb = new T.Box3().setFromObject(n);
    var s = new T.Vector3(), c = new T.Vector3(); bb.getSize(s); bb.getCenter(c);
    return tinfo[k] = { size: s, center: c, minY: bb.min.y, name: name, pack: pack };
  }

  var USED = { ancient: {}, historic: {}, interior: {}, nature: {}, pawn: {}, desert: {}, steppe: {}, zanc: {}, zhis: {}, zint: {} };
  var _packWarned = {};
  function spawn(pack, name, texName, opts) {
    opts = opts || {};
    var pack0 = pack;                /* 自动开门那一条按原槽判断，换皮之后名字对不上 */
    pack = hanPack(pack);
    /* 整包缺席要当场认怂，不能硬取。资材包是一个一个异步解出来的，容器里少了
       哪一项只 warn 一声就跳过（见 loadAll），而 Z.ready 照样置真——于是
       Z.packs['desert'] 这类可能永远是 undefined。原先这里直接 .lib，
       一个缺包就抛异常，异常从 medBuild 冲出去把整次建城打断在半路：
       城建了一半、Z.inRecipe 卡在 true，画面就那么僵住——玩家看到的
       「选开局有概率卡死」正是这个。少一套模型可以，整局崩不行。 */
    var P = Z.packs && Z.packs[pack];
    if (!P || !P.lib) {
      if (!_packWarned[pack]) { _packWarned[pack] = 1; console.warn('pack absent', pack, '— 该包的模型本局不出现'); }
      return null;
    }
    var lib = P.lib;
    var tpl = lib[name];
    if (!tpl) { console.warn('no model', pack, name); return null; }
    var seq = 0;
    if (Z.inRecipe) {
      seq = ++Z.spawnSeq;
      if (razedOf(Z.cityKey).indexOf(seq) >= 0) return null; // 已被拆毁：不再落成
    }
    (USED[pack] || (USED[pack] = {}))[name] = 1;
    var inf = info(pack, name);
    var o = tpl.clone(true);
    /* texName 为空＝保留模型自带材质（沙漠资材包自带体素贴图，不吃风格重染） */
    var mat = texName ? matFor(hanTex(texName)) : null;
    o.traverse(function (ch) { if (ch.isMesh) { if (mat) ch.material = mat; ch.castShadow = !!opts.shadow; ch.receiveShadow = true; } });
    var g = new T.Group();
    g.add(o);
    o.position.y = -inf.minY + 0.018; // pivot to ground（微抬 1.8cm 脱离地面共面，防底面 Z-fighting 闪烁；视角无关，不会抽搐）
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
    } else if (opts.autodoor !== false && (pack0 === 'ancient' || pack0 === 'historic')
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
  try { PERF.low = localStorage.getItem('med3d_lowfx') === '1'; } catch (e) { }
  function perfSave() { try { localStorage.setItem('med3d_lowfx', PERF.low ? '1' : '0'); } catch (e) { } }
  function applyPerf() {
    if (!Z.rnd) return;
    var pr = isTouch() ? (PERF.low ? 1.25 : 1.5) : 2;
    Z.rnd.setPixelRatio(Math.min(pr, window.devicePixelRatio || 1));
    var sh = !(isTouch() && PERF.low);
    if (Z.rnd.shadowMap.enabled !== sh) {
      Z.rnd.shadowMap.enabled = sh;
      Z.rnd.shadowMap.needsUpdate = true;
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
    var inf = new T.Mesh(new T.PlaneGeometry(4200, 4200), new T.MeshLambertMaterial({ color: new T.Color(st.grass || 0x93a760).multiplyScalar(0.97) }));
    inf.rotation.x = -Math.PI / 2; inf.position.y = -0.09; Z.scene.add(inf);
    Z.grassC = st.grass; // 山脚草坡取当前国色，与地面无缝衔接
    var m = new T.Mesh(new T.PlaneGeometry(R * 2, R * 2), new T.MeshLambertMaterial({ map: groundTex(st, R, paths, plazas || [], water || []) }));
    m.rotation.x = -Math.PI / 2; m.receiveShadow = true; Z.scene.add(m);
    return m;
  }

  /* 山：多面棱峰（角向谐波折棱 + 逐面明暗 + 不规则雪线），沿山脊排成岭 */
  var ROCKC = [0x969ca6, 0x8b919c, 0xa2a8b2, 0x848a95];
  /* ---------------- 自然资材（树/棕榈/山 61 模型全用） ---------------- */
  function natN(pre, a, b) { var o = []; for (var i = a; i <= b; i++) o.push(pre + (i < 10 ? '00' : '0') + i); return o; }
  var NATBROAD = ['Tree_temp_climate_001', 'Tree_temp_climate_002', 'Tree_temp_climate_003', 'Tree_temp_climate_007', 'Tree_temp_climate_008', 'Tree_temp_climate_009', 'Tree_temp_climate_012', 'Tree_temp_climate_015', 'Tree_temp_climate_016', 'Tree_temp_climate_017', 'Tree_temp_climate_018'];
  var NATCONIF = ['Tree_temp_climate_004', 'Tree_temp_climate_005', 'Tree_temp_climate_006', 'Tree_temp_climate_010', 'Tree_temp_climate_011', 'Tree_temp_climate_013', 'Tree_temp_climate_014', 'Tree_temp_climate_019', 'Tree_temp_climate_020', 'Tree_temp_climate_021'];
  var NATPALM = natN('Tree_Tropic_', 1, 20);
  var NATMTN = { hill: natN('Hill_temperate_climate_', 1, 5), mtn: natN('Mountains_temperate_climate_', 1, 10), plat: natN('Plateau_temperate_climate_', 1, 5) };
  NATMTN.mix = NATMTN.plat.concat(NATMTN.hill);
  function natTex(name) {
    return /Tropic/.test(name) ? 'T_Tree_tropical.png' : /^Tree_/.test(name) ? 'T_Trees_temp_climate.png' : 'T_Mountains_temperate_climate_32.png';
  }

  /* 单峰：资材山模按目标宽高缩放成一座峰 */
  function natPeak(name, w, h, ry) {
    var lib = Z.packs.nature && Z.packs.nature.lib;
    if (!lib || !lib[name]) return null;
    USED.nature[name] = 1;
    var inf = info('nature', name);
    var o = lib[name].clone(true);
    var mat = matFor('T_Mountains_temperate_climate_32.png');
    o.traverse(function (ch) { if (ch.isMesh) { ch.material = mat; ch.castShadow = true; ch.receiveShadow = true; } });
    var pg = new T.Group(); pg.add(o);
    o.position.y = -inf.minY;
    var sxz = w / Math.max(inf.size.x, inf.size.z), sy = h / inf.size.y;
    pg.scale.set(sxz, sy, sxz);
    pg.rotation.y = ry || 0;
    return pg;
  }
  /* 山体组团：主峰+侧峰沿同一走向排列、两端渐低、山前配麓丘 —— 自然山脉规律 */
  function massif(w, h, seed, strike) {
    var r = rng('mf' + seed), g = new T.Group();
    if (strike == null) strike = r() * 6.28;
    var dx = Math.sin(strike), dz = Math.cos(strike);
    var hh = hash('mf' + seed);
    var mainW = w * 2.4;
    var mpool = h >= 30 ? NATMTN.mtn : NATMTN.mix;
    var mp = natPeak(mpool[hh % mpool.length], mainW, h, strike + (r() - .5) * 0.4);
    if (mp) g.add(mp);
    var sides = 1 + (hh % 2);
    for (var i = 0; i <= sides; i++) {
      var sgn = i % 2 ? -1 : 1, off = (0.55 + r() * 0.3) * mainW;
      var sh = h * (0.48 + r() * 0.24), sw = mainW * (0.55 + r() * 0.28);
      var pool2 = sh >= 30 ? NATMTN.mtn : NATMTN.mix;
      var sp = natPeak(pool2[(hh + i + 1) % pool2.length], sw, sh, strike + (r() - .5) * 0.35);
      if (sp) { sp.position.set(dx * off * sgn, 0, dz * off * sgn); g.add(sp); }
    }
    var hp = natPeak(NATMTN.hill[hh % 5], mainW * (0.5 + r() * 0.35), h * (0.16 + r() * 0.1), strike + (r() - .5) * 0.7);
    if (hp) {
      var hs = hh & 8 ? 1 : -1;
      hp.position.set(-dz * hs * mainW * (0.5 + r() * 0.25), 0, dx * hs * mainW * (0.5 + r() * 0.25));
      g.add(hp);
    }
    return g;
  }
  function mountain(x, z, w, h, seed) {
    var hh = hash('nm' + seed + x + z), r = rng('nm2' + seed);
    var pool = h >= 34 ? NATMTN.mtn : (h >= 16 ? NATMTN.mix : NATMTN.hill);
    var pk = natPeak(pool[hh % pool.length], w * 2.4, h, (hh % 628) / 100);
    if (!pk) return;
    pk.position.set(x, 0, z); Z.scene.add(pk);
    (Z.mtnSpots = Z.mtnSpots || []).push({ x: x, z: z, w: w }); // 供地块绘制山根砾石裙
    if (h > 22 && (hh & 3) === 0) {
      var hp2 = natPeak(NATMTN.hill[hh % 5], w * 1.5, h * 0.22, r() * 6.28);
      if (hp2) { hp2.position.set(x + (r() - .5) * w * 2.2, 0, z + (r() - .5) * w * 2.2); Z.scene.add(hp2); }
    }
  }
  function mountainRing(R, seed, gaps) {
    var r = rng('ring' + seed);
    var a = r() * 30;
    while (a < 360) {
      var span = 34 + r() * 30, mid = a + span / 2, skip = false;
      (gaps || []).forEach(function (gp) { var d = Math.abs(((mid - gp + 540) % 360) - 180); if (d < 24 + span / 2) skip = true; });
      if (!skip) {
        var dist = R * (1.22 + r() * 0.28);
        var n = 3 + (hash(seed + 'n' + (a | 0)) % 3);
        var hMax = 30 + r() * 30;
        for (var i = 0; i < n; i++) {
          var t = n === 1 ? 0.5 : i / (n - 1);
          var ang = (a + t * span) * Math.PI / 180;
          var prof = Math.sin(Math.PI * (0.18 + 0.64 * t)); /* 两端低中间高 */
          var hh2 = hMax * (0.45 + 0.55 * prof);
          var ww = (13 + r() * 9 + prof * 8) * 2.4;
          var d2 = dist * (1 + (r() - .5) * 0.08);
          var px = Math.sin(ang) * d2, pz = Math.cos(ang) * d2;
          var pool = hh2 >= 34 ? NATMTN.mtn : (hh2 >= 16 ? NATMTN.mix : NATMTN.hill);
          var pk = natPeak(pool[hash(seed + 'p' + (a | 0) + i) % pool.length], ww, hh2, ang + Math.PI / 2 + (r() - .5) * 0.25);
          if (pk) {
            pk.position.set(px, 0, pz); Z.scene.add(pk);
            (Z.mtnSpots = Z.mtnSpots || []).push({ x: px, z: pz, w: ww / 2.4 });
          }
        }
        /* 山链内侧麓丘：承接平原 */
        var fh = 1 + (hash(seed + 'f' + (a | 0)) % 2);
        for (var q = 0; q < fh; q++) {
          var fa = (a + span * (0.25 + r() * 0.5)) * Math.PI / 180;
          var fd = dist * (0.84 - r() * 0.05);
          var fw = 20 + r() * 14, fhh = 6 + r() * 7;
          var hp = natPeak(NATMTN.hill[hash(seed + 'h' + (a | 0) + q) % 5], fw, fhh, fa + Math.PI / 2 + (r() - .5) * 0.5);
          if (hp) {
            hp.position.set(Math.sin(fa) * fd, 0, Math.cos(fa) * fd); Z.scene.add(hp);
            (Z.mtnSpots = Z.mtnSpots || []).push({ x: Math.sin(fa) * fd, z: Math.cos(fa) * fd, w: fw / 2.4 });
          }
        }
      }
      a += span + 12 + r() * 24;
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
    var r = rng('tr' + seed + x + z);
    var off = { green: 0, pink: 3, autumn: 6, red: 9, pine: 0 }[kind || 'green'] || 0;
    var pool = kind === 'pine' ? NATCONIF : NATBROAD;
    var name = pool[(hash('tk' + seed + x + z) + off) % pool.length];
    var g = spawn('nature', name, natTex(name), { x: x, z: z, ry: r() * 6.28, s: 0.8 + r() * 0.55, solid: false, autodoor: false, shadow: true });
    if (!g) return null;
    return natReg(g, kind === 'pine' ? '松柏' : '乔木');
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
      var pw = 3 + r() * 3, ph = 3.2 + r() * 4.6;
      var m = natPeak(NATMTN.mtn[hash(seed + 'j' + i) % 10], pw, ph, r() * 6.28);
      if (m) { m.position.set((r() - .5) * 3, 0, (r() - .5) * 3); g.add(m); }
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
      var pw = 4 + r() * 4, ph = 1.1 + r() * 1.8;
      var m = natPeak(NATMTN.hill[hash(seed + 'o' + i) % 5], pw, ph, r() * 6.28);
      if (m) { m.position.set((r() - .5) * 3.5, 0, (r() - .5) * 3.5); g.add(m); }
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
    /* 换了场就得重烘一次阴影——autoUpdate 已关，不主动刷会留着上一座城的影子 */
    try { if (Z.rnd && Z.rnd.shadowMap) Z.rnd.shadowMap.needsUpdate = true; } catch (_) { }
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
  function buildPlayer() {
    var g = makePawn({ outfit: 'fglad', head: 'Mid_Hair', hairC: 0xd9a94e, prop: 'sword', robe: 0x24202c, band: 0xa63b26, chest: 0x2c2836 });
    g.userData.isPlayer = true;
    return g;
  }
  /* 本局主角的名字。这支引擎原来把「贝罗娜」写死在十几处敕命文案里，
     换一张卡就会在秦宫里冒出罗马战神的名字。名字由主文档按开局给出。 */
  function HERO() {
    try { var f = window.__ROMA_HERO__; if (typeof f === 'function') { var n = f(); if (n) return n; } } catch (_) { }
    return '主角';
  }
  /* ---------------- 御前卫队：主角仪仗常随 ---------------- */
  Z.escort = [];
  var GUARD_CFG = { robe: 0x2c2836, band: 0xc9a063, chest: 0x3a3444, hat: 'plume', hatC: 0x2c2836, prop: 'spear', s: 0.94, outfit: 'corhop', head: 'Spartan_Mohawk_Helmet', shield: 1 };
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
  Z.escortN = 0;          // 卫队员额（默认无卫，玩家可雇，持久）
  try { var _en = parseInt(localStorage.getItem('zj3d_escortN')); if (_en >= 0 && _en <= 24) Z.escortN = _en; } catch (e) { }
  function escortNSave() { try { localStorage.setItem('zj3d_escortN', '' + Z.escortN); } catch (e) { } }
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
    var n = Z.escortN; // 员额由主角钦定（默认四卫：前二后二）
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
      // 卫士可点：选中即为「禁卫军」号令对象
      regPawn(g, { name: '禁卫军', cat: '羽林近卫', desc: '闻警则出，护驾而还', tag: 'escort', own: true });
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
      msg = '（' + HERO() + '敕命禁卫军出击——' + nm + '（' + cat + '）于' + city + '城' + pos + '为卫士所格杀，卫队无伤，归列护驾。）';
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
      msg = '（' + HERO() + '敕命禁卫军出击' + tgt.name + '。过程：卫队突阵于' + city + '城' + pos + '，' + tgt.name + '伤亡' + dCas + '人，卫士殉职' + gCas + '人。结果：' + res + '，卫队归列护驾。影响：禁卫见血，都中侧目。）';
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
          msg = '（变起仓促——' + k + '名刺客扑向御驾，禁卫军立时合围搏杀。刺客' + k + '人尽数格杀' + (gCas > 0 ? '，卫士殉职' + gCas + '人' : '，卫队无一伤亡') + '，' + HERO() + '无恙。史官记：有贼犯驾于' + city + '。）';
        } else {
          msg = '（变起仓促——' + k + '名刺客扑向御驾，左右竟无一卫！兵刃加身，' + HERO() + '却立而不倒，创口于众目之下弥合如初。刺客骇然掷刃，仓皇遁走。' + city + '城中悄声相传：' + HERO() + '果然不可杀。）';
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
        // 立定后转向与贝罗娜同向
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
      Blacksmith: '铺屋', Bookstore: '民宅', Butcher: '民宅', Clothing: '民宅', Grocery: '民宅',
      Pharmacy: '长屋', Resturant: '锯坊', Hotel: '民宅', Tea: '民宅', Gold: '民宅', Jewlry: '两层屋',
      Pottery: '陶匠', Warehouse: '筒仓', Weapon: '铁砧', Granary: '粮仓', Horse: '马厩',
      Private: '引水道', Parlor: '坡屋', Foundry: '铁工坊', Eternal: '神庙', Main: '元老院', Palace: '殿宇',
      Gazeebo: '喷泉', Tathed: '兽栏'
    };
    var SD = {
      SD_Tiny: '陋居', SD_Small: '邸舍', SD_Large: '大宅', SD_Tall: '塔楼', SD_House: '土坯民居',
      SD_Bazaar: '市集', SD_Monument: '尖碑', SD_Well: '水井',
      /* 这件资材原名「礼拜寺」——伊斯兰建筑，比本纪晚七百年。它不会被任何
         城池蓝图生成，但躺在建造栏里，玩家一按就能在前 30 年的埃及盖一座清真寺。
         模型本身只是个土坯穹顶建筑，按年代改叫穹顶祠，名实相符。 */
      SD_Mosque: '穹顶祠',
      SD_Palm: '棕榈', SD_Tree: '旱树', SD_Hill: '沙丘', SD_Plateau: '台地', SD_Mt: '沙山'
    };
    for (var kd in SD) if (name.indexOf(kd) === 0) return SD[kd];
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

  /* ---------- 罗马 · 天下之中（最宏大） ---------- */
  /* 原本只给洛邑一座城用，写死了国别与随机种。汉地几座都城（中都、汴梁）
     都该用这一套大都蓝图，于是收两个可选参数：不传＝老样子，传了就换墙面贴图
     与随机种，两座城的山形、云、树才不会一模一样。形制不变——都城就是都城。 */
  function buildLuoyi(locName, stKey) {
    var st = STATES[stKey] || STATES.zhou;
    var rr = rng('luoyi' + (locName || ''));
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
    mountainRing(R, 'luoyi' + (locName || ''), [0]);

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
    hudCity(st, locName || '罗马');
  }

  /* 素材全量可用性由「营造清单」承担：全部 457 件模型进托盘由玩家营造，
     不再在罗马陈列未用构件（原公输坊陈列院已移除）。 */
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
    ger: function () { // 毡帐室内：整体内景模型（steppe 包 ST_GerIn），毡壁以环段碰撞近似
      var w = 11, d = 11, R = 5.15;
      var fl = new T.Mesh(new T.BoxGeometry(w + 5, 0.2, d + 5), nmat(0x6a5a40));
      fl.position.y = -0.12; fl.receiveShadow = true; Z.scene.add(fl);
      var gin = spawn('steppe', 'ST_GerIn', null, { x: 0, z: 0, ry: Math.PI, solid: false, autodoor: false, shadow: false });
      if (!gin) { // steppe 包缺席：退化成毡色圆帐空间，好歹能进能出
        var shell = new T.Mesh(new T.CylinderGeometry(R + 0.4, R + 0.4, 3.4, 18, 1, true), nmat(0xcfc4ae));
        shell.position.y = 1.7; Z.scene.add(shell);
      }
      for (var i = 0; i < 14; i++) {
        var a = i / 14 * Math.PI * 2;
        if (Math.cos(a) > 0.86) continue;             /* +z 门洞留缺 */
        Z.colliders.push({ x: Math.sin(a) * R, z: Math.cos(a) * R, hw: 1.35, hd: 0.35, ry: a, cx: 0, cz: 0 });
      }
      Z.roomD = d; Z.roomW = w;
      var warm = new T.PointLight(0xffd9a0, Z.night ? 26 : 16, 0, 1.6); warm.position.set(0, 3.2, 0); Z.scene.add(warm);
      var warm2 = new T.PointLight(0xffc880, 9, 0, 1.8); warm2.position.set(2.4, 1.5, 2.4); Z.scene.add(warm2);
    },
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

  /* ============================================================
     MARE NOSTRVM · 地中海城邦布局层
     每城独立蓝图（史实形制）＋ 低多边形活海（顶点波动）＋ 航船巡弋
     ============================================================ */
  var MTEX = 'LowpolyHistoric_Texture_01.png';
  var MDL = {"palace": ["ancient", "SM_Palace_01"], "senate": ["ancient", "SM_Main_Hall"], "univ": ["historic", "SM_Palace_02"], "amphi": ["historic", "SM_Threater_Stage_01"], "circus": ["historic", "SM_Palace_03"], "arch": ["historic", "SM_Palace_04"], "parthenon": ["historic", "SM_Gazeebo_04"], "oracle": ["historic", "SM_Gazeebo_05"], "temple": ["ancient", "SM_Eternal_Life"], "temple2": ["historic", "SM_Gazeebo_02"], "temple3": ["historic", "SM_Gazeebo_03"], "bridge": ["historic", "SM_Bridge_01"], "watchtower": ["historic", "SM_Tower_01"], "walltower": ["historic", "SM_Tower_02"], "colossus": ["historic", "SM_Tower_03"], "aqueduct": ["ancient", "SM_Private_House_03"], "dock": ["ancient", "SM_Env_Floor_07"], "trireme": ["ancient", "SM_Env_Misc_01"], "trireme2": ["ancient", "SM_Env_Misc_02"], "trireme3": ["ancient", "SM_Env_Misc_03"], "sail": ["ancient", "SM_Env_Misc_04"], "sail2": ["ancient", "SM_Env_Misc_05"], "sail3": ["ancient", "SM_Env_Misc_06"], "rowboat": ["ancient", "SM_Env_Misc_07"], "rowboat2": ["ancient", "SM_Env_Misc_08"], "fishboat": ["ancient", "SM_Env_Misc_09"], "granary": ["ancient", "SM_Granary_01"], "silo": ["ancient", "SM_Warehouse_01"], "farm": ["historic", "SM_Env_Base_03"], "vineyard": ["historic", "SM_Env_Base_09"], "watermill": ["interior", "SM_Table_01"], "mill": ["ancient", "SM_Env_Stair_05"], "sawmill": ["ancient", "SM_Resturant_01"], "stable": ["ancient", "SM_Horse_Room_01"], "forge": ["ancient", "SM_Foundry_Room"], "well": ["interior", "SM_Table_06"], "well2": ["interior", "SM_Table_04"], "fountain": ["ancient", "SM_Gazeebo_01"], "fountain2": ["historic", "SM_Env_Base_07"], "zeus": ["historic", "SM_Sculpture_01"], "zeusSeat": ["historic", "SM_Sculpture_02"], "poseidon": ["historic", "SM_Sculpture_04"], "athena": ["historic", "SM_Sculpture_05"], "hera": ["historic", "SM_Sculpture_03"], "artemis": ["historic", "SM_Sculpture_06"], "aphrodite": ["historic", "SM_Sculpture_07"], "demeter": ["historic", "SM_Sculpture_08"], "hades": ["historic", "SM_Sculpture_09"], "hermes": ["historic", "SM_Sculpture_10"], "hercules": ["historic", "SM_Sculpture_12"], "achilles": ["historic", "SM_Sculpture_13"], "statue": ["interior", "SM_Cover_02"], "statueHalf": ["historic", "SM_Env_Base_10"], "discobolus": ["ancient", "SM_Env_Floor_06"], "thinker": ["interior", "SM_Screen_02"], "spartanStatue": ["interior", "SM_Case_01"], "medusa": ["historic", "SM_Env_Roof_21"], "omphalos": ["historic", "SM_Env_Stairs_04"], "lion": ["historic", "SM_Env_Roof_11"], "angel": ["historic", "SM_Sculpture_14"], "base": ["ancient", "SM_Env_Base_01"], "base2": ["ancient", "SM_Env_Base_02"], "base3": ["ancient", "SM_Env_Base_03"], "baseSm": ["ancient", "SM_Env_Base_04"], "cobble": ["ancient", "SM_Env_Base_05"], "colCor": ["ancient", "SM_Env_Pillar_01"], "colPlain": ["ancient", "SM_Env_Pillar_02"], "colRuin": ["ancient", "SM_Env_Pillar_03"], "colRuin2": ["ancient", "SM_Env_Pillar_04"], "railing": ["ancient", "SM_Env_Pillar_05"], "stairs": ["ancient", "SM_Env_Stair_01"], "gate": ["ancient", "SM_Env_Stair_02"], "palm": ["nature", "Tree_Tropic_012", "T_Tree_tropical.png"], "palm2": ["nature", "Tree_Tropic_002", "T_Tree_tropical.png"], "pine": ["nature", "Tree_temp_climate_019", "T_Trees_temp_climate.png"], "pine2": ["nature", "Tree_temp_climate_004", "T_Trees_temp_climate.png"], "tree": ["nature", "Tree_temp_climate_001", "T_Trees_temp_climate.png"], "olive": ["nature", "Tree_temp_climate_017", "T_Trees_temp_climate.png"], "fruitTree": ["nature", "Tree_temp_climate_008", "T_Trees_temp_climate.png"], "barracks": ["historic", "SM_Env_Extra_06"], "barracks2": ["historic", "SM_Env_Extra_07"], "ballista": ["historic", "SM_Env_Extra_01"], "catapult": ["historic", "SM_Env_Extra_03"], "trebuchet": ["historic", "SM_Env_Extra_04"], "ram": ["historic", "SM_Env_Extra_05"], "siegeTower": ["historic", "SM_Env_Extra_14"], "tentBig": ["historic", "SM_Env_Extra_08"], "tentOpen": ["historic", "SM_Env_Extra_09"], "tentSm": ["historic", "SM_Env_Extra_10"], "trojan": ["interior", "SM_Screen_05"], "warElephant": ["historic", "SM_Env_Extra_11"], "campfire": ["ancient", "SM_Env_Brick_11"], "cart": ["ancient", "SM_Env_Brick_12"], "horseCart": ["historic", "SM_Env_Base_17"], "horse": ["ancient", "SM_Env_Pillar_07"], "riding": ["ancient", "SM_Env_Wall_38"], "shop": ["ancient", "SM_Blacksmith_01"], "shop2": ["ancient", "SM_Bookstore_01"], "house": ["ancient", "SM_Bookstore_02"], "house1": ["ancient", "SM_Butcher_01"], "house2": ["ancient", "SM_Clothing_Store_01"], "house3": ["ancient", "SM_Clothing_Store_02"], "house4": ["ancient", "SM_Gold_Shop_01"], "house5": ["ancient", "SM_Grocery_01"], "house6": ["ancient", "SM_Hotel_01"], "houseGarden": ["ancient", "SM_Jewlry_Store_01"], "house2f": ["ancient", "SM_Jewlry_Store_02"], "houseSlope": ["ancient", "SM_Parlor_01"], "houseLong": ["ancient", "SM_Pharmacy_01"], "banner": ["historic", "SM_Plaque_01"], "banner2": ["historic", "SM_Plaque_02"], "flag": ["historic", "SM_Plaque_05"], "torch": ["ancient", "SM_Env_Brick_08"], "torchMon": ["historic", "SM_Env_Stairs_01"], "lamp": ["interior", "SM_Cover_04"], "hay": ["ancient", "SM_Env_Wood_04"], "straw": ["ancient", "SM_Env_Wood_05"], "cage": ["ancient", "SM_Tathed_Cage_01"], "potter": ["ancient", "SM_Pottery_Workshop_01"], "anvil": ["ancient", "SM_Weapon_Shop_01"], "bench": ["ancient", "SM_Env_Window_05"], "circleBench": ["ancient", "SM_Env_Window_04"], "centaur": ["interior", "SM_Table_07"], "minotaur": ["interior", "SM_Table_10"], "gorgon": ["interior", "SM_Table_09"], "faun": ["interior", "SM_Table_08"], "sundial": ["interior", "SM_Desk_01"], "maskTheatre": ["interior", "SM_Screen_01"], "jar": ["ancient", "SM_Env_Stall_12"], "jarMon": ["ancient", "SM_Env_Stair_07"], "basket": ["ancient", "SM_Env_Stall_05"], "barrel": ["ancient", "SM_Env_Floor_02"], "shopBox": ["ancient", "SM_Env_Stall_01"], "altarStone": ["ancient", "SM_Env_Base_03"]};
  function mput(key, x, z, ry, o) {
    var d = MDL[key]; if (!d) return null;
    o = o || {}; o.x = x; o.z = z; o.ry = ry || 0;
    if (o.shadow === undefined) o.shadow = true;
    return spawn(d[0], d[1], d[2] || MTEX, o);
  }
  function minfo(key) { var d = MDL[key]; return d ? info(d[0], d[1]) : null; }
  function mrow(keys, x0, z0, dx, dz, n, ry, o) {
    for (var i = 0; i < n; i++) mput(keys[i % keys.length], x0 + dx * i, z0 + dz * i, ry, o);
  }
  /* 柱廊：两端连线上等距立柱（希腊罗马的骨架） */
  function mcol(key, x1, z1, x2, z2, gap, o) {
    var dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz), n = Math.max(1, Math.round(L / (gap || 4)));
    for (var i = 0; i <= n; i++) mput(key, x1 + dx * i / n, z1 + dz * i / n, Math.atan2(dx, dz), o);
  }
  /* 街区：沿网格布民居，随机跳空成巷 */
  function mblock(keys, x0, z0, cols, rows, sx, sz, seed, o) {
    var r = rng('blk' + seed);
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      if (r() < 0.18) continue;
      mput(keys[(i + j * 3) % keys.length], x0 + i * sx + (r() - .5) * 1.6, z0 + j * sz + (r() - .5) * 1.6,
        ((r() * 4) | 0) * Math.PI / 2, o);
    }
  }

  /* ---------------- 活海：低多边形水面 + 波动 + 航船 ---------------- */
  var SEA = null, SHIPS = [];
  /* 水域登记：海半空间 / 河带 / 河样条折线 —— 供无限地形避水 */
  var AQUA = [];
  function inWater(x, z) {
    for (var i = 0; i < AQUA.length; i++) {
      var a = AQUA[i];
      if (a.kind === 'half') {
        if (((a.ax === 'x' ? x : z) - a.edge) * a.sgn > 0) return true;
      } else if (a.kind === 'strip') {
        if (Math.abs((a.ax === 'x' ? x : z) - a.c) < a.hw) return true;
      } else if (a.kind === 'poly') {
        for (var j = 0; j < a.pts.length - 1; j++) {
          var ax = a.pts[j][0], az = a.pts[j][1], bx = a.pts[j + 1][0], bz = a.pts[j + 1][1];
          var dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
          var t = L2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)) : 0;
          var qx = ax + dx * t - x, qz = az + dz * t - z;
          if (qx * qx + qz * qz < a.hw * a.hw) return true;
        }
      }
    }
    return false;
  }
  function seaField(cx, cz, w, d, color) {
    var lod = PERF.low ? 0.6 : 1;
    var sx = Math.max(12, Math.round(w / 7 * lod)), sz = Math.max(12, Math.round(d / 7 * lod));
    var geo = new T.PlaneGeometry(w, d, sx, sz);
    geo.rotateX(-Math.PI / 2);
    var mat = new T.MeshLambertMaterial({ color: color || 0x2e86ad, flatShading: true, transparent: true, opacity: 0.94 });
    var m = new T.Mesh(geo, mat);
    m.position.set(cx, 0.12, cz); /* 海面贴地：浪幅同步收小，波谷不破地 */
    m.receiveShadow = false;
    Z.scene.add(m);
    /* 深海底衬：远处不透光，海面透出层次 */
    var deep = new T.Mesh(new T.PlaneGeometry(w * 1.3, d * 1.3),
      new T.MeshLambertMaterial({ color: 0x14506e }));
    deep.rotation.x = -Math.PI / 2; deep.position.set(cx, -1.1, cz); Z.scene.add(deep);
    SEA = { m: m, geo: geo, t: 0 };
    /* —— 无限接天：海(宽片)铺半空间裙板，河带(窄条)沿长轴续到雾外 —— */
    var W2 = Math.min(w, d), skirtMat = new T.MeshLambertMaterial({ color: new T.Color(color || 0x2e86ad).multiplyScalar(0.68) });
    if (W2 >= 80) {
      var ax = d <= w ? 'z' : 'x';                       /* 短轴=离岸方向 */
      var cc = ax === 'z' ? cz : cx;
      var sgn = cc >= 0 ? 1 : -1;
      var edge = cc - sgn * W2 * 0.48;
      var sk = new T.Mesh(new T.PlaneGeometry(ax === 'z' ? 5200 : 2400, ax === 'z' ? 2400 : 5200), skirtMat);
      sk.rotation.x = -Math.PI / 2;
      sk.position.set(ax === 'z' ? cx : edge + sgn * 1200, 0.08, ax === 'z' ? edge + sgn * 1200 : cz);
      Z.scene.add(sk);
      AQUA.push({ kind: 'half', ax: ax, sgn: sgn, edge: edge });
    } else {
      var ax2 = w < d ? 'x' : 'z';                       /* 短轴=河宽方向 */
      var cc2 = ax2 === 'x' ? cx : cz;
      var sk2 = new T.Mesh(new T.PlaneGeometry(ax2 === 'x' ? W2 : 5200, ax2 === 'x' ? 5200 : W2), skirtMat);
      sk2.rotation.x = -Math.PI / 2;
      sk2.position.set(ax2 === 'x' ? cx : 0, 0.08, ax2 === 'x' ? 0 : cz);
      Z.scene.add(sk2);
      AQUA.push({ kind: 'strip', ax: ax2, c: cc2, hw: W2 * 0.46 });
      var Lh = Math.max(w, d) / 2;
      for (var ci = 0; ci < 2; ci++) for (var dd = Lh + 30; dd < 900; dd += 60) {
        var sgn2 = ci ? -1 : 1;
        if (ax2 === 'x') Z.colliders.push({ x: cx, z: cz + sgn2 * dd, hw: W2 * 0.5, hd: 30, ry: 0, cx: 0, cz: 0 });
        else Z.colliders.push({ x: cx + sgn2 * dd, z: cz, hw: 30, hd: W2 * 0.5, ry: 0, cx: 0, cz: 0 });
      }
    }
    return m;
  }
  function seaY(x, z) {
    if (!SEA) return 0; var t = SEA.t;
    return 0.12 + Math.sin(x * 0.075 + t * 1.15) * 0.05 + Math.sin(z * 0.1 - t * 0.85) * 0.038 + Math.sin((x + z) * 0.045 + t * 0.6) * 0.027;
  }
  /* 岸线：沙滩带 + 碎浪石 + 挡住玩家不下海 */
  function shoreLine(z0, x0, x1, seed) {
    var r = rng('sh' + seed);
    var sand = new T.Mesh(new T.PlaneGeometry(x1 - x0, 9), nmat(0xd9c89a));
    sand.rotation.x = -Math.PI / 2; sand.position.set((x0 + x1) / 2, 0.07, z0 - 4.5); Z.scene.add(sand);
    for (var x = x0 + 3; x < x1; x += 6 + r() * 9) rock(x, z0 - 0.6 + (r() - .5) * 2, 0.4 + r() * 0.8, seed + x);
    Z.colliders.push({ x: (x0 + x1) / 2, z: z0 + 60, hw: (x1 - x0) / 2 + 40, hd: 60, ry: 0, cx: 0, cz: 0 });
  }
  function shipRoute(key, pts, sp, o) {
    var g = mput(key, pts[0][0], pts[0][1], 0, Object.assign({ solid: false, autodoor: false, shadow: false }, o || {}));
    if (!g) return null;
    SHIPS.push({ g: g, pts: pts, i: 0, u: 0, sp: sp || 2.4, ph: SHIPS.length * 1.7 });
    return g;
  }
  function medTick(dt) {
    riverTick(dt);
    if (!SEA) return;
    SEA.t += dt;
    var p = SEA.geo.attributes.position, t = SEA.t, i;
    for (i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i);
      p.setY(i, Math.sin(x * 0.075 + t * 1.15) * 0.05 + Math.sin(z * 0.1 - t * 0.85) * 0.038 + Math.sin((x + z) * 0.045 + t * 0.6) * 0.027);
    }
    p.needsUpdate = true; SEA.geo.computeVertexNormals();
    for (i = 0; i < SHIPS.length; i++) {
      var s = SHIPS[i], a = s.pts[s.i], b = s.pts[(s.i + 1) % s.pts.length];
      var dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
      s.u += s.sp * dt / L;
      while (s.u >= 1) {
        s.u -= 1; s.i = (s.i + 1) % s.pts.length;
        a = s.pts[s.i]; b = s.pts[(s.i + 1) % s.pts.length];
        dx = b[0] - a[0]; dz = b[1] - a[1]; L = Math.hypot(dx, dz) || 1;
      }
      var px = a[0] + dx * s.u, pz = a[1] + dz * s.u;
      s.g.position.set(px, seaY(px, pz) - 0.1, pz);
      s.g.rotation.y = Math.atan2(dx, dz);
      s.g.rotation.z = Math.sin(t * 1.5 + s.ph) * 0.04;
      s.g.rotation.x = Math.sin(t * 1.1 + s.ph) * 0.03;
    }
  }

  /* ---------------- 地中海调色：干燥橄榄土 · 石灰岩 ---------------- */
  var MEDPAL = {
    latium: { name: 'ROMA', grass: 0x93a760, accent: 0xb4302a },
    graecia: { name: 'HELLAS', grass: 0x9dab5e, accent: 0x2f6f9c },
    africa: { name: 'AFRICA', grass: 0xc3b075, accent: 0xa8642c },
    aegypt: { name: 'AEGYPTVS', grass: 0xd3bf83, accent: 0xc9a227 },
    levant: { name: 'LEVANT', grass: 0xb5a86a, accent: 0x7a4b8f },
    gallia: { name: 'GALLIA', grass: 0x7fa356, accent: 0x3f7d4e },
    hispania: { name: 'HISPANIA', grass: 0xa8ac63, accent: 0xa03a2a },
    pontus: { name: 'PONTVS', grass: 0x8ba95f, accent: 0x33528f },
    steppe: { name: 'TARTARIA', grass: 0x8fa25c, accent: 0x3f7d4e },
    serica: { name: 'SERICA', grass: 0x86a058, accent: 0xb4302a }
  };
  /* 汉地城的墙面：中式建筑那五张贴图轮着用，按城名取，同一座城每次进都一样，
     不同城之间才有色差——汴梁一色、临安一色，不至于满地一个调子。 */
  var HANTEX = ['LowpolyChineseBuilding_Texture_01.png', 'LowpolyChineseBuilding_Texture_02.png',
                'LowpolyChineseBuilding_Texture_03.png', 'LowpolyChineseBuilding_Texture_04.png',
                'LowpolyChineseBuilding_Texture_05.png'];
  function medSt(k) {
    if (k === 'serica') {
      var ht = HANTEX[hash('han' + (Z.cityKey || '')) % HANTEX.length];
      return { name: 'SERICA', city: '', anc: ht, his: 'LowpolyHistoric_Texture_01.png',
               grass: MEDPAL.serica.grass, accent: MEDPAL.serica.accent, sand: false };
    }
    var p = MEDPAL[k] || MEDPAL.latium;
    return { name: p.name, city: '', anc: MTEX, his: MTEX, grass: p.grass, accent: p.accent,
             sand: (k === 'aegypt' || k === 'africa' || k === 'levant') };
  }

  /* 通用件：市集摊列 / 神域列像 / 橄榄园 / 松柏 */
  function agoraStalls(cx, cz, rad, n, seed) {
    var r = rng('ag' + seed);
    var kk = ['shopBox', 'basket', 'jar', 'barrel', 'shop', 'shop2'];
    for (var i = 0; i < n; i++) {
      var a = r() * 6.28, d = Math.sqrt(r()) * rad;
      mput(kk[(i * 3 + 1) % kk.length], cx + Math.cos(a) * d, cz + Math.sin(a) * d, r() * 6.28, { solid: false, autodoor: false });
    }
  }
  function godRow(list, cx, cz, dx, dz, ry) {
    for (var i = 0; i < list.length; i++) {
      mput('base', cx + dx * i, cz + dz * i, 0, { solid: false, autodoor: false });
      mput(list[i], cx + dx * i, cz + dz * i, ry, { autodoor: false, y: 0.35 });
    }
  }
  function oliveGrove(cx, cz, rad, n, seed, kinds) {
    var r = rng('og' + seed); kinds = kinds || ['olive', 'olive', 'pine', 'tree'];
    for (var i = 0; i < n; i++) {
      var a = r() * 6.28, d = Math.sqrt(r()) * rad;
      mput(kinds[(i) % kinds.length], cx + Math.cos(a) * d, cz + Math.sin(a) * d, r() * 6.28, { solid: false, autodoor: false });
    }
  }
  function palmRow(cx, cz, dx, dz, n, seed) {
    var r = rng('pr' + seed), h0 = hash('pr' + seed);
    for (var i = 0; i < n; i++) {
      var nm = NATPALM[(h0 + i) % NATPALM.length];
      spawn('nature', nm, natTex(nm), { x: cx + dx * i + (r() - .5) * 2, z: cz + dz * i + (r() - .5) * 2, ry: r() * 6.28, s: 0.85 + r() * 0.35, solid: false, autodoor: false, shadow: true });
    }
  }
  function crowd(cx, cz, rad, n, seed) {
    /* 市集人群：活人着衣漫步（旧版误撒裸身石像充数，已废） */
    var r = rng('cw' + seed);
    var keys = Object.keys(NPC_TYPES);
    for (var i = 0; i < n * 2; i++) {
      var a = r() * 6.28, d = Math.sqrt(r()) * rad;
      var t = NPC_TYPES[keys[Math.floor(r() * keys.length)]];
      var root = makePawn(pawnCfg(t, seed + 'cw' + i));
      root.position.set(cx + Math.cos(a) * d, 0, cz + Math.sin(a) * d);
      root.rotation.y = r() * 6.28;
      Z.scene.add(root);
      regPawn(root, {
        name: t.disp + '·' + NAME_POOL[Math.floor(r() * NAME_POOL.length)],
        cat: t.cat, desc: t.desc, tag: 'ambient', wander: Math.max(6, rad)
      });
    }
  }

  /* ============================================================
     诸城蓝图（一城一格，皆按史实形制）
     ============================================================ */

  /* ROMA：卡尔多×德库马努斯双轴 · 罗马广场 · 卡庇托林 · 斗兽场 · 大竞技场 · 引水道 · 台伯河 */
  function medRoma() {
    var st = medSt('latium'), R = 150, seed = 'roma';
    newScene(0x9fc9e4, 0xd6dfc9, 150, 640, Z.night);
    var paths = [
      { w: 9, pts: [[0, R * .92], [0, 40], [0, -20], [0, -R * .92]] },          // Cardo Maximus
      { w: 9, pts: [[-R * .92, 0], [-30, 0], [30, 0], [R * .92, 0]] },          // Decumanus Maximus
      { w: 4, pts: [[-R * .8, -34], [0, -34], [R * .8, -34]] },
      { w: 4, pts: [[-R * .8, 34], [0, 34], [R * .8, 34]] },
      { w: 4, pts: [[-46, -R * .8], [-46, R * .8]] },
      { w: 4, pts: [[46, -R * .8], [46, R * .8]] },
      { w: 3.2, pts: [[10, 12], [40, 26], [62, 34]] },                          // 通斗兽场
      { w: 3.2, pts: [[-12, 20], [-38, 38], [-58, 46]] }                        // 通大竞技场
    ];
    var plazas = [{ x: 0, z: 0, rx: 24, rz: 17, stone: true }, { x: -44, z: -48, rx: 15, rz: 12, stone: true }];
    addGround(st, R, paths, plazas, [{ x: -108, z: 30, rx: 26, rz: 62 }]);
    mountainRing(R, seed, [270]);

    /* 台伯河：西侧长水 + 石桥 */
    var riv = seaField(-112, 24, 46, 190, 0x3f7e93);
    shipRoute('rowboat', [[-104, -60], [-108, 10], [-112, 70], [-118, 100], [-112, 40], [-104, -30]], 3.0);
    shipRoute('fishboat', [[-120, 60], [-116, -20], [-122, -70], [-124, 20]], 2.2);
    mput('bridge', -86, 18, Math.PI / 2, { s: 1.1 });
    mcol('colRuin', -96, 6, -78, 6, 6, { solid: false, autodoor: false });

    /* FORVM ROMANVM：元老院 · 凯旋门 · 神庙 · 讲坛柱廊 */
    mput('senate', -17, -13, Math.PI / 2, { s: 1.05, door: { side: 0, dist: 12, interior: 'throne', label: 'CVRIA 元老院' } });
    mput('arch', 0, 19, 0, { s: 1.0 });
    mput('temple', 17, -12, -Math.PI / 2, { s: .95 });
    mput('temple2', 20, 8, -Math.PI / 2, { s: .9 });
    mput('altarStone', 0, -4, 0, { solid: false, autodoor: false });
    mput('torchMon', -7, 6, 0, { solid: false, autodoor: false });
    mput('torchMon', 7, 6, 0, { solid: false, autodoor: false });
    mcol('colCor', -22, 14, 22, 14, 5.2, { solid: false, autodoor: false });
    mcol('colCor', -22, -22, 22, -22, 5.2, { solid: false, autodoor: false });
    godRow(['zeus', 'athena', 'hera', 'hermes'], -18, 24, 12, 0, Math.PI);
    agoraStalls(0, -1, 15, 14, seed + 'f');

    /* CAPITOLIVM：台地上的朱庇特神庙 + 众神列像 */
    var capH = rockTerrace(-44, -48, 40, 30, 2, 1.7, seed + 'cap');
    mput('parthenon', -44, -52, 0, { y: capH, s: .95 });
    mput('zeusSeat', -44, -38, Math.PI, { y: capH, autodoor: false });
    mput('stairs', -44, -32, Math.PI, { y: 0, solid: false, autodoor: false, s: 1.6 });
    godRow(['poseidon', 'artemis', 'aphrodite', 'demeter', 'hades'], -66, -30, 9, 0, Math.PI / 2);

    /* COLOSSEVM & CIRCVS MAXIMVS */
    mput('amphi', 66, 36, -Math.PI / 5, { s: 1.15 });
    mput('circus', -62, 52, Math.PI / 2, { s: 1.05 });
    mput('arch', 48, 22, -Math.PI / 5, { s: .8 });

    /* AQVA：引水道自东南入城 */
    for (var i = 0; i < 5; i++) mput('aqueduct', 34 + i * 17, -78 + i * 3, 0.06, { autodoor: false });
    mput('fountain', 8, -30, 0, { autodoor: false });
    mput('fountain2', -26, 30, 0, { autodoor: false });

    /* INSVLAE：四象限街区民居（多层公寓） */
    var ins = ['house2f', 'house2f', 'houseSlope', 'house4', 'house5', 'houseLong'];
    mblock(ins, 12, -70, 4, 3, 15, 13, seed + 'q1');
    mblock(ins, -70, -70, 3, 3, 15, 13, seed + 'q2');
    mblock(ins, 12, 46, 4, 3, 15, 13, seed + 'q3');
    mblock(ins, -70, 46, 3, 2, 15, 13, seed + 'q4');
    mput('forge', 30, -22, Math.PI, { door: { side: 0, interior: 'shop', label: 'FABRICA 铁工坊' } });
    mput('potter', -30, -20, 0, { solid: false, autodoor: false });
    mput('granary', 56, -48, Math.PI / 2, { door: { side: 0, interior: 'storeroom', label: 'HORREVM 粮仓' } });
    mput('stable', -34, 66, 0.4);
    mput('cart', 20, 6, 0.6, { solid: false, autodoor: false });
    mput('horseCart', -14, -30, -0.5, { solid: false, autodoor: false });

    /* 松柏与石松：罗马郊野 */
    oliveGrove(90, -30, 40, 16, seed + 'o1', ['pine', 'pine2', 'olive']);
    oliveGrove(-90, 80, 34, 12, seed + 'o2', ['pine', 'olive', 'tree']);
    oliveGrove(70, 90, 34, 12, seed + 'o3', ['pine', 'fruitTree', 'olive']);
    for (var c = 0; c < 5; c++) cloud((c - 2) * 60, 50 + c * 4, -40 + c * 40, 3, seed + c);
    placePlayer(0, 40, Math.PI);
    hudCity(st, 'ROMA');
  }

  /* ATHENAE：卫城岩丘（帕特农）· 阿哥拉 · 剧场 · 比雷埃夫斯海 */
  function medAthenae() {
    var st = medSt('graecia'), R = 140, seed = 'ath';
    newScene(0xa8d4ea, 0xdde3cb, 150, 640, Z.night);
    var paths = [
      { w: 7, pts: [[-30, -34], [-14, -10], [0, 10], [6, 40], [4, R * .9] ] },   // 泛雅典娜大道
      { w: 5, pts: [[-R * .85, 18], [-30, 14], [20, 16], [R * .85, 24]] },
      { w: 3.4, pts: [[16, 8], [46, -6], [64, -18]] },
      { w: 3.4, pts: [[0, 52], [26, 70], [40, 96]] }
    ];
    addGround(st, R, paths, [{ x: 4, z: 16, rx: 20, rz: 14, stone: true }], []);
    mountainRing(R, seed, [0, 30]);
    /* 特米斯托克利城墙：不规则环三门 + 长墙双道下海通港 */
    cityWall([[0, -92], [52, -74], [86, -38], [92, 20], [64, 58], [20, 84], [-40, 88], [-88, 60], [-104, 8], [-96, -44], [-56, -80]], {
      gates: [{ x: 6, z: 85, ry: 0 }, { x: 90.5, z: 22, ry: 1.62 }, { x: -101, z: 17, ry: -1.55 }], gateS: .8, gateGap: 6.5, towerEvery: 26
    });
    cityWall([[-2, 88], [-22, 112], [-20.5, 113.2], [-0.5, 89.2]], { towers: false, h: 4.5, th: 1.6, gates: [] });
    cityWall([[14, 88], [6, 112], [7.5, 112.8], [15.5, 88.8]], { towers: false, h: 4.5, th: 1.6, gates: [] });

    /* 海：北面爱琴海 + 商船 */
    seaField(0, 175, 340, 130, 0x2a89b4);
    shoreLine(112, -170, 170, seed);
    mput('dock', -18, 116, 0, { autodoor: false });
    mput('dock', 22, 118, 0, { autodoor: false });
    shipRoute('trireme', [[-90, 140], [-20, 128], [50, 134], [120, 150], [40, 168], [-60, 160]], 3.6);
    shipRoute('sail', [[110, 128], [30, 150], [-70, 132], [-130, 152], [-30, 172]], 2.6);
    shipRoute('fishboat', [[-40, 124], [10, 130], [60, 126], [0, 140]], 1.8);

    /* ACROPOLIS：三层岩台 + 帕特农 + 雅典娜 + 山门阶 */
    var h = rockTerrace(-48, -46, 54, 42, 3, 2.2, seed + 'ac');
    mput('parthenon', -50, -52, 0.1, { y: h, s: .3 });
    mput('temple2', -26, -40, -Math.PI / 2, { y: h, s: .6 });
    mput('athena', -48, -28, Math.PI, { y: h, autodoor: false, s: 1.2 });
    mput('stairs', -40, -22, Math.PI, { solid: false, autodoor: false, s: 2.0 });
    mcol('colCor', -70, -26, -26, -26, 5, { y: h, solid: false, autodoor: false });
    mput('colossus', -74, -60, 0.6, { y: h, autodoor: false, s: .16 });

    /* AGORA：市集广场 · 柱廊 · 圆形讲堂 · 神像 */
    mcol('colPlain', -16, 30, 24, 30, 4.4, { solid: false, autodoor: false });
    mcol('colPlain', -16, 2, 24, 2, 4.4, { solid: false, autodoor: false });
    mput('senate', -20, 14, Math.PI / 2, { door: { side: 0, dist: 11, interior: 'hall', label: 'BOVLE 议事厅' } });
    mput('univ', 34, 12, -Math.PI / 2, { door: { side: 0, dist: 12, interior: 'study', label: 'ACADEMIA 学园' } });
    agoraStalls(4, 16, 17, 18, seed + 'ag');
    godRow(['hermes', 'demeter', 'artemis'], -12, 26, 13, 0, Math.PI);
    mput('fountain', 16, 26, 0, { autodoor: false });
    mput('sundial', -4, 8, 0, { solid: false, autodoor: false });

    /* 狄俄尼索斯剧场（依卫城南坡）+ 体育场 */
    mput('amphi', -12, -76, Math.PI, { s: 1.0 });
    mput('discobolus', 6, -60, Math.PI, { solid: false, autodoor: false });
    mput('circus', 62, -50, Math.PI / 2, { s: .85 });

    /* 民居：不规则有机生长（雅典非棋盘） */
    var hs = ['house', 'house1', 'house2', 'houseSlope', 'houseGarden', 'house2f'];
    mblock(hs, 26, 40, 4, 3, 13, 12, seed + 'h1');
    mblock(hs, -80, 20, 3, 4, 13, 12, seed + 'h2');
    mblock(hs, -70, 74, 4, 2, 13, 12, seed + 'h3');
    mblock(hs, 22, -44, 4, 2, 5.5, 5.5, seed + 'h4');
    mblock(hs, -20, 40, 4, 3, 5.5, 5.5, seed + 'h5');
    mblock(hs, -70, -16, 3, 3, 5.5, 5.5, seed + 'h6');
    mblock(hs, 60, 0, 3, 4, 5.5, 5.5, seed + 'h7');
    mput('forge', 44, 40, Math.PI);
    mput('potter', 30, 58, 0.4, { solid: false, autodoor: false });
    mput('well', 12, 44, 0, { solid: false, autodoor: false });

    oliveGrove(88, 50, 40, 20, seed + 'ol', ['olive', 'olive', 'pine']);
    oliveGrove(-100, -60, 36, 14, seed + 'ol2', ['olive', 'pine2']);
    mput('vineyard', 74, 78, 0.3);
    placePlayer(4, 56, Math.PI);
    hudCity(st, 'ATHENAE');
  }

  /* SPARTA：无城墙 · 军营方阵 · 校场 · 欧罗塔斯河 · 朴素无华 */
  function medSparta() {
    var st = medSt('graecia'), R = 130, seed = 'spa';
    newScene(0xa2cbe0, 0xd8dcc0, 150, 640, Z.night);
    var paths = [
      { w: 6, pts: [[0, R * .9], [0, 20], [0, -20], [0, -R * .9]] },
      { w: 5, pts: [[-R * .8, -6], [0, 0], [R * .8, -6]] },
      { w: 3, pts: [[-20, 30], [-46, 46], [-62, 70]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: -4, rx: 22, rz: 15 }], []);
    mountainRing(R, seed, [90]);
    /* 欧罗塔斯河：样条活水自北而南，桥连东岸 */
    riverSpline([[74, -160], [64, -95], [56, -30], [60, 35], [70, 95], [62, 160]], 9, {});
    riverBridge(0.48, { s: .85 });
    riverShip('rowboat2', 0.4, 0.012, 1, { s: .35 });
    riverShip('fishboat', 0.62, 0.01, -1, { s: .4 });
    /* 泰格特斯山：西侧连峰雄峙 */
    mountain(-152, -44, 26, 62, seed + 'tg1');
    mountain(-166, 22, 24, 56, seed + 'tg2');
    mountain(-148, 86, 22, 48, seed + 'tg3');

    /* 校场：训练桩、方阵石、火堆 —— 没有神庙群，没有巨像 */
    mput('barracks', -26, -26, Math.PI / 2, { door: { side: 0, dist: 10, interior: 'storeroom', label: 'SYSSITIA 共餐所' } });
    mput('barracks2', 26, -26, -Math.PI / 2);
    mput('barracks', -26, 22, Math.PI / 2);
    mput('barracks2', 26, 22, -Math.PI / 2);
    mput('spartanStatue', 0, -20, Math.PI, { autodoor: false, solid: false });
    mput('campfire', -8, 4, 0, { solid: false, autodoor: false });
    mput('campfire', 10, -8, 0, { solid: false, autodoor: false });
    for (var i = 0; i < 6; i++) mput('tentSm', -44 + i * 17, 46, 0.2 * i, { solid: false, autodoor: false });
    mput('ballista', -14, -44, 0.2); mput('catapult', 16, -46, -0.2);
    mput('trojan', 40, -56, 0.5, { s: .35, autodoor: false });
    mput('temple3', 0, -62, 0, { s: .8 });   // 阿尔忒弥斯·奥尔提亚小庙（简朴）
    mput('altarStone', 0, -50, 0, { solid: false, autodoor: false });

    /* 村落式聚居：斯巴达是五村合一，不设街区 */
    var hs = ['house', 'house3', 'houseSlope'];
    mblock(hs, -74, -8, 2, 3, 14, 15, seed + 'v1');
    mblock(hs, 22, 44, 3, 2, 14, 15, seed + 'v2');
    mblock(hs, -60, 66, 3, 2, 14, 15, seed + 'v3');
    mput('farm', -80, 60, 0.3); mput('vineyard', 70, -80, -0.3);
    mput('well', -6, 30, 0, { solid: false, autodoor: false });
    mput('stable', 40, 6, -Math.PI / 2);
    oliveGrove(-92, 20, 34, 14, seed + 'o', ['olive', 'pine']);
    oliveGrove(94, 70, 22, 12, seed + 'o2', ['olive', 'olive', 'pine2']);
    placePlayer(0, 34, Math.PI);
    hudCity(st, 'SPARTA');
  }

  /* CARTHAGO：圆形军港 COTHON · 比尔萨卫城 · 腓尼基商栈 */
  function medCarthago() {
    var st = medSt('africa'), R = 140, seed = 'car';
    newScene(0x9fd0e6, 0xe0d9b8, 150, 640, Z.night);
    var paths = [
      { w: 7, pts: [[0, R * .85], [0, 30], [-6, -10], [-14, -50], [-20, -R * .8]] },
      { w: 5, pts: [[-R * .8, 6], [-20, 2], [30, 8], [R * .8, 16]] },
      { w: 4, pts: [[0, 60], [-18, 78], [-26, 100]] }
    ];
    addGround(st, R, paths, [{ x: -12, z: -26, rx: 16, rz: 12, stone: true }], []);
    mountainRing(R, seed, [0, 340]);
    /* 三重陆防（史实制）：主墙高厚密塔两端入海 · 中墙弧线 · 外垒低矮土栅，门沿大道轴线贯串 */
    cityWallLine([[-104, 106], [-100, 44], [-92, -30], [-64, -72], [-14, -86], [42, -80], [78, -52], [92, -6], [98, 52], [100, 106]], {
      h: 8.5, th: 3.6, towerEvery: 16, towerS: 1.0, gateS: .9, gateGap: 7,
      gates: [{ x: -16, z: -85.5, ry: 3.04 }, { x: 94.4, z: 16, ry: 1.65 }, { x: -96, z: 6, ry: -1.62 }]
    });
    cityWallLine([[-114, 60], [-108, -16], [-88, -62], [-40, -96], [16, -102], [64, -90], [92, -50], [104, 26]], {
      h: 5.2, th: 2, towerEvery: 28, towerS: .7, gateS: .7, gateGap: 6,
      gates: [{ x: -18.5, z: -98.3, ry: 3.04 }, { x: -109.7, z: 6, ry: -1.62 }, { x: 102.5, z: 16, ry: 1.65 }]
    });
    cityWallLine([[-124, 70], [-120, -30], [-96, -80], [-44, -112], [24, -116], [80, -102], [108, -58], [118, 20]], {
      h: 3, th: 1.4, color: 0x9b7d58, cap: 0x86684a, gateS: .6, gateGap: 5.5,
      gates: [{ x: -19.8, z: -113.5, ry: 3.04 }, { x: -121.4, z: 5.5, ry: -1.62 }, { x: 117.5, z: 16, ry: 1.65 }]
    });
    aqueductRun(-150, -108, -38, -54, 8);
    /* 地中海在北：外港 + 圆形军港（科同）*/
    seaField(0, 176, 360, 140, 0x2f8fb8);
    shoreLine(114, -180, 180, seed);
    /* COTHON：巨型圆形军港——中岛提督府 · 二十战船辐辏 · 柱环码头 · 北口通海 */
    var cx = 26, cz = 88, cr = 36;
    var basin = new T.Mesh(new T.CircleGeometry(cr, 34), new T.MeshLambertMaterial({ color: 0x2a7ea3, flatShading: true }));
    basin.rotation.x = -Math.PI / 2; basin.position.set(cx, 0.08, cz); Z.scene.add(basin);
    var isl = new T.Mesh(new T.CylinderGeometry(13, 14, 1.2, 20), nmat(0xc8b78a));
    isl.position.set(cx, 0.55, cz); Z.scene.add(isl);
    Z.colliders.push({ x: cx, z: cz, hw: 13, hd: 13, ry: 0, cx: 0, cz: 0 });
    mput('temple3', cx, cz, 0, { y: 1.15, s: .8, autodoor: false });
    mput('walltower', cx + 8, cz - 6, 0.6, { y: 1.15, s: .8, autodoor: false });
    for (var a = 0; a < 6.283; a += 0.317) {
      mput((a * 10 | 0) % 2 ? 'trireme2' : 'trireme3', cx + Math.cos(a) * (cr - 10), cz + Math.sin(a) * (cr - 10), a + Math.PI / 2,
        { solid: false, autodoor: false, shadow: false, s: .8 });
    }
    for (var a2 = 0.35; a2 < 6.283; a2 += 0.44) {
      if (Math.abs(a2 - 1.57) < 0.5) continue; /* 北口通海 */
      mput('colPlain', cx + Math.cos(a2) * (cr + 2.5), cz + Math.sin(a2) * (cr + 2.5), a2, { solid: false, autodoor: false });
    }
    mput('dock', -40, 116, 0, { autodoor: false }); mput('dock', -14, 118, 0, { autodoor: false });
    shipRoute('trireme', [[-140, 150], [-40, 136], [60, 142], [150, 158], [40, 172], [-90, 166]], 3.8);
    shipRoute('sail3', [[130, 132], [20, 146], [-100, 134], [-150, 156], [-20, 174]], 2.8);

    /* BYRSA：卫城台地 —— 神庙 + 塔尼特祭坛 */
    var h = rockTerrace(-14, -56, 44, 34, 3, 2.0, seed + 'by');
    mput('temple', -14, -62, 0, { y: h, s: 1.05 });
    mput('altarStone', -14, -46, 0, { y: h, solid: false, autodoor: false });
    mput('poseidon', -30, -48, Math.PI / 2, { y: h, autodoor: false });
    mput('stairs', -14, -38, Math.PI, { solid: false, autodoor: false, s: 1.8 });
    mput('walltower', -46, -34, 0); mput('watchtower', 22, -40, 0);

    /* 商栈与市集：腓尼基以贸易立国 */
    mput('silo', 46, 34, -Math.PI / 2, { door: { side: 0, interior: 'storeroom', label: 'HORREVM 货栈' } });
    mput('granary', 46, 12, -Math.PI / 2);
    agoraStalls(6, 30, 22, 24, seed + 'mk');
    mput('forge', -44, 20, Math.PI / 2);
    var hs = ['house3', 'house4', 'house5', 'house2f', 'houseLong'];
    mblock(hs, -80, 30, 3, 3, 14, 13, seed + 'h1');
    mblock(hs, -74, -18, 2, 3, 14, 13, seed + 'h3');
    mblock(hs, -46, 42, 4, 3, 5, 5, seed + 'h4');
    mblock(hs, 56, -24, 3, 4, 5, 5.5, seed + 'h5');
    mblock(hs, -24, 66, 3, 3, 5, 5, seed + 'h6');
    mblock(hs, 12, -50, 4, 3, 5.5, 5, seed + 'h7');
    mblock(hs, -52, -40, 2, 3, 5.5, 5, seed + 'h8');
    mblock(hs, 34, 30, 3, 3, 5.5, 5, seed + 'h9');
    palmRow(-60, 96, 13, 2, 7, seed + 'p1');
    palmRow(74, 102, 12, -3, 5, seed + 'p2');
    oliveGrove(90, -46, 36, 14, seed + 'o', ['palm', 'olive', 'palm2']);
    mput('warElephant', -70, 74, 0.8, { autodoor: false });
    /* 麦加拉园圃区：布匿人的土坯民居与椰枣丛 */
    sdBlock(84, 30, 2, 2, 12, 11, seed + 'mg');
    sd('SD_Well', 76, 12, 0, { solid: false });
    sdPalms(96, -8, 13, 8, seed + 'sp');
    placePlayer(0, 56, Math.PI);
    hudCity(st, 'CARTHAGO');
  }

  /* ALEXANDRIA：法罗斯灯塔 · 大图书馆 · 棋盘街 · 王港 */
  function medAlexandria() {
    var st = medSt('aegypt'), R = 145, seed = 'alx';
    newScene(0xb2dcee, 0xe6dcae, 150, 640, Z.night);
    var paths = [
      { w: 11, pts: [[-R * .92, -10], [0, -10], [R * .92, -10]] },   // Canopic Way（大道）
      { w: 8, pts: [[-6, R * .85], [-6, -10], [-6, -R * .85]] },
      { w: 4, pts: [[-R * .8, 24], [R * .8, 24]] },
      { w: 4, pts: [[-R * .8, -44], [R * .8, -44]] },
      { w: 4, pts: [[-64, -R * .8], [-64, R * .7]] },
      { w: 4, pts: [[52, -R * .8], [52, R * .7]] }
    ];
    addGround(st, R, paths, [{ x: -6, z: -10, rx: 22, rz: 14, stone: true }], []);
    mountainRing(R, seed, [0, 20, 340]);
    /* 托勒密城墙：矩形环抱棋盘城 · 各干道皆设门 */
    cityWall([[-120, -64], [0, -72], [110, -64], [124, -10], [110, 52], [60, 86], [-60, 86], [-110, 52], [-124, -10]], {
      gates: [{ x: -123.8, z: -13, ry: -1.55 }, { x: 122.8, z: -13, ry: 1.55 }, { x: -5, z: -71.6, ry: 3.14 }, { x: -64, z: -67.7, ry: 3.14 }, { x: 52, z: -68.5, ry: 3.14 }, { x: -6, z: 86, ry: 0 }, { x: -64, z: 83.3, ry: 0 }, { x: 52, z: 86, ry: 0 }], gateS: .8, gateGap: 6.5, towerEvery: 28
    });
    /* 大港：北面 + 法罗斯岛灯塔 */
    seaField(0, 180, 380, 150, 0x2a94c0);
    shoreLine(112, -190, 190, seed);
    var isl = new T.Mesh(new T.CylinderGeometry(17, 20, 1.6, 12), nmat(0xcabb8c));
    isl.position.set(-64, 0.7, 132); Z.scene.add(isl);
    Z.colliders.push({ x: -64, z: 132, hw: 17, hd: 17, ry: 0, cx: 0, cz: 0 });
    mput('walltower', -64, 132, 0, { y: 1.5, s: 2.4, autodoor: false });   /* PHAROS 灯塔 */
    mput('torch', -64, 132, 0, { y: 29, s: 1.6, solid: false, autodoor: false });
    mput('colossus', -54, 124, 0.6, { y: 1.5, s: .14, autodoor: false });
    mput('bridge', -64, 116, 0, { s: .9, solid: false });                  /* HEPTASTADION 七星堤 */
    mput('dock', -20, 116, 0, { autodoor: false }); mput('dock', 16, 118, 0, { autodoor: false }); mput('dock', 50, 116, 0, { autodoor: false });
    shipRoute('sail2', [[-150, 146], [-40, 134], [70, 140], [160, 156], [40, 170], [-100, 162]], 3.2);
    shipRoute('trireme3', [[140, 130], [20, 144], [-110, 132], [-160, 154], [-10, 172]], 3.0);
    shipRoute('fishboat', [[-60, 122], [0, 126], [60, 124], [-10, 136]], 1.9);

    /* MOVSEION 大图书馆 + 王宫区（东北） */
    mput('univ', 30, 40, Math.PI, { s: 1.15, door: { side: 0, dist: 13, interior: 'study', label: 'BIBLIOTHECA 大图书馆' } });
    mcol('colCor', 6, 58, 56, 58, 5, { solid: false, autodoor: false });
    mput('palace', -40, 46, 0, { s: 2, door: { side: 0, dist: 13, interior: 'throne', label: 'BASILEIA 王宫' } });
    godRow(['hermes', 'athena', 'demeter', 'hades'], 4, 26, 12, 0, Math.PI);

    /* SEMA 陵园 + 神庙（塞拉皮斯） */
    var hSer = rockTerrace(-34, -52, 20, 14, 2, 2, seed + 'se');
    mput('temple', -34, -54, 0, { y: hSer, s: .7 });
    mput('temple2', 34, -52, 0, { s: .9 });
    mput('altarStone', 0, -40, 0, { solid: false, autodoor: false });
    mput('amphi', 74, -30, -Math.PI / 2, { s: .95 });

    /* 棋盘街区（希波丹姆式，亚历山卓正是范例） */
    var hs = ['house4', 'house5', 'house6', 'house2f', 'houseLong', 'houseSlope'];
    mblock(hs, -108, -34, 3, 3, 15, 14, seed + 'b1');
    mblock(hs, -108, 30, 3, 2, 15, 14, seed + 'b2');
    mblock(hs, -76, -64, 3, 2, 15, 14, seed + 'b3');
    mblock(hs, -28, -62, 4, 1, 14, 13, seed + 'b4');
    mblock(hs, -96, 4, 4, 4, 5.5, 5.5, seed + 'b5');
    mblock(hs, 70, 8, 4, 4, 5.5, 5.5, seed + 'b6');
    mblock(hs, -44, -36, 4, 3, 5.5, 5.5, seed + 'b7');
    mblock(hs, 14, -58, 3, 2, 5.5, 5.5, seed + 'b8');
    agoraStalls(-6, -6, 20, 22, seed + 'ag');
    mput('granary', -76, 74, 0.2); mput('silo', -54, 76, 0.2);
    mput('forge', 60, 4, Math.PI / 2);
    palmRow(-120, 100, 14, 1, 9, seed + 'p1');
    palmRow(30, 98, 13, 2, 8, seed + 'p2');
    palmRow(-40, -100, 15, 0, 7, seed + 'p3');
    oliveGrove(100, 70, 34, 12, seed + 'o', ['palm', 'palm2']);
    /* 拉科蒂斯区（埃及土著坊）：土坯民居 + 巴扎 + 水井——希腊城墙外的另一半城 */
    sdBlock(-96, -44, 2, 3, 12, 11, seed + 'rk');
    sd('SD_Bazaar', -78, -20, Math.PI / 2, { shadow: true });
    sd('SD_Well', -86, -6, 0, { solid: false });
    sdPalms(-108, 20, 15, 9, seed + 'sp');
    placePlayer(-6, 46, Math.PI);
    hudCity(st, 'ALEXANDRIA');
  }

  /* BYZANTIVM：金角湾岬角 · 海墙 · 竞技场 */
  function medByzantium() {
    var st = medSt('pontus'), R = 135, seed = 'byz';
    newScene(0x9dc8e6, 0xd4dcc8, 150, 640, Z.night);
    var paths = [
      { w: 8, pts: [[-R * .9, -20], [-20, -14], [20, -6], [R * .55, 10]] },   // Mese 大道
      { w: 5, pts: [[0, -R * .8], [4, -20], [0, 40], [-8, R * .6]] },
      { w: 3.4, pts: [[24, -6], [52, -22], [70, -44]] }
    ];
    addGround(st, R, paths, [{ x: 6, z: -8, rx: 18, rz: 13, stone: true }], []);
    mountainRing(R, seed, [0, 90, 300]);
    /* 三面环海：北金角湾、东博斯普鲁斯 */
    seaField(0, 168, 340, 130, 0x2b83ac);
    shoreLine(106, -170, 170, seed + 'n');
    var east = new T.Mesh(new T.PlaneGeometry(2400, 5200), new T.MeshLambertMaterial({ color: 0x226f96 }));
    east.rotation.x = -Math.PI / 2; east.position.set(1318, 0.03, 0); Z.scene.add(east);
    AQUA.push({ kind: 'half', ax: 'x', sgn: 1, edge: 118 });
    for (var ei = 0; ei < 8; ei++) Z.colliders.push({ x: 124, z: -140 + ei * 40, hw: 8, hd: 22, ry: 0, cx: 0, cz: 0 });
    shipRoute('sail', [[-120, 136], [-20, 126], [80, 132], [150, 120], [130, 40], [140, -60], [90, 140]], 3.4);
    shipRoute('trireme', [[140, -80], [150, 20], [120, 120], [10, 138], [-90, 130], [30, 150]], 3.0);
    mput('dock', -30, 110, 0, { autodoor: false }); mput('dock', 30, 112, 0, { autodoor: false });

    /* 狄奥多西式双重陆墙横锁地峡（西） + 海角灯塔 */
    cityWall([[-108, -88], [-104, 92], [-102.4, 92], [-106.4, -88]], { h: 7, th: 2.4, towerEvery: 22, gateS: .85, gateGap: 6.5, gates: [{ x: -106, z: -19.4, ry: -1.58 }] });
    cityWall([[-94, -90], [-90, 94], [-88.6, 94], [-92.6, -90]], { h: 4.6, th: 1.7, towers: false, gateS: .7, gateGap: 6, gates: [{ x: -92, z: -18.8, ry: -1.58 }] });
    mput('walltower', 106, 76, 0, { s: 1.7, autodoor: false });
    mput('torch', 106, 76, 0, { y: 20, s: 1.3, solid: false, autodoor: false });

    /* HIPPODROMOS + 大宫 + 主教座堂位（大神庙） */
    mput('circus', 30, -46, 0.1, { s: .8 });
    mput('palace', 62, -20, -Math.PI / 2, { s: 2, door: { side: 0, dist: 13, interior: 'throne', label: 'PALATIVM 大宫' } });
    mput('parthenon', -8, -34, 0, { s: .28 });
    mput('arch', 6, 6, 0, { s: .4 });
    mput('senate', -34, -12, Math.PI / 2, { door: { side: 0, dist: 11, interior: 'hall', label: 'SENATVS' } });
    godRow(['zeus', 'hera', 'artemis'], -22, 14, 12, 0, Math.PI);
    agoraStalls(4, 18, 18, 18, seed + 'ag');
    mput('fountain', 20, 24, 0, { autodoor: false });

    var hs = ['house2f', 'house1', 'house6', 'houseSlope', 'houseLong'];
    mblock(hs, -80, 22, 3, 3, 12, 12, seed + 'h1');
    mblock(hs, -78, -70, 3, 2, 12, 12, seed + 'h2');
    mblock(hs, 52, 42, 3, 2, 14, 13, seed + 'h3');
    mblock(hs, -40, 30, 4, 3, 5.5, 5, seed + 'h4');
    mblock(hs, 6, 36, 4, 2, 5.5, 5, seed + 'h5');
    mblock(hs, 40, 20, 3, 3, 5.5, 5, seed + 'h6');
    mput('forge', -50, 40, 0); mput('granary', -70, -34, Math.PI / 2);
    oliveGrove(-118, 70, 30, 12, seed + 'o', ['pine', 'olive']);
    oliveGrove(80, -90, 34, 14, seed + 'o2', ['pine2', 'olive', 'tree']);
    placePlayer(6, 34, Math.PI);
    hudCity(st, 'BYZANTIVM');
  }

  /* CORINTHVS：地峡双港 · 阿克罗科林斯 · 阿波罗神庙 */
  function medCorinth() {
    var st = medSt('graecia'), R = 132, seed = 'cor';
    newScene(0xa6d2ea, 0xd9e0c6, 150, 640, Z.night);
    var paths = [
      { w: 7, pts: [[0, R * .85], [0, 20], [-4, -20], [0, -R * .85]] },  // 贯通两海的地峡道
      { w: 5, pts: [[-R * .8, 8], [0, 4], [R * .8, 12]] },
      { w: 3.2, pts: [[-14, -30], [-36, -52], [-44, -74]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 6, rx: 19, rz: 13, stone: true }], []);
    mountainRing(R, seed, [0, 180]);
    /* 城墙环四门 · 阿克罗科林斯巨岩为背 */
    cityWall([[-30, -88], [30, -80], [70, -52], [88, -6], [72, 44], [30, 72], [-24, 80], [-72, 58], [-92, 8], [-84, -46]], {
      gates: [{ x: 2, z: 76, ry: 0 }, { x: -1.5, z: -84.2, ry: 3.14 }, { x: 84.8, z: 4, ry: 1.6 }, { x: -91.9, z: 7, ry: -1.6 }], gateS: .8, gateGap: 6.5, towerEvery: 26
    });
    mountain(-64, -108, 22, 52, seed + 'acr');
    /* 北：科林斯湾；南：萨罗尼克湾 —— 双海双港 */
    seaField(0, 164, 320, 120, 0x2d8ab2);
    shoreLine(106, -160, 160, seed + 'n');
    var south = new T.Mesh(new T.PlaneGeometry(5200, 2400), new T.MeshLambertMaterial({ color: 0x24718f }));
    south.rotation.x = -Math.PI / 2; south.position.set(0, 0.03, -1312); Z.scene.add(south);
    AQUA.push({ kind: 'half', ax: 'z', sgn: -1, edge: -112 });
    for (var si = 0; si < 8; si++) Z.colliders.push({ x: -140 + si * 40, z: -118, hw: 22, hd: 8, ry: 0, cx: 0, cz: 0 });
    mput('dock', -22, 110, 0, { autodoor: false }); mput('dock', 26, 112, 0, { autodoor: false });
    mput('dock', -18, -110, Math.PI, { autodoor: false }); mput('dock', 24, -112, Math.PI, { autodoor: false });
    shipRoute('sail3', [[-120, 132], [-20, 124], [80, 130], [140, 142], [20, 152], [-90, 146]], 3.0);
    shipRoute('trireme2', [[-110, -136], [0, -126], [110, -134], [40, -150], [-70, -148]], 2.8);
    /* 陆运滑道 DIOLKOS：拖船越地峡的石道 */
    for (var i = 0; i < 9; i++) mput('cobble', 100, -96 + i * 24, 0, { solid: false, autodoor: false, s: 1.4 });
    mput('rowboat', 100, 12, 0, { s: .5, solid: false, autodoor: false, shadow: false });

    /* ACROCORINTH：陡峭卫城 */
    var h = rockTerrace(-58, -60, 46, 36, 4, 2.4, seed + 'ak');
    mput('temple', -58, -66, 0, { y: h, s: 1.05 });
    mput('aphrodite', -58, -50, Math.PI, { y: h, autodoor: false });
    mput('stairs', -50, -40, Math.PI, { solid: false, autodoor: false, s: 1.9 });
    /* 阿波罗神庙（多立克，城中心） */
    mput('temple2', -2, -26, 0, { s: 1.1 });
    mcol('colCor', -22, -14, 18, -14, 4.6, { solid: false, autodoor: false });
    mput('fountain', 12, 14, 0, { autodoor: false });   // 佩瑞涅泉
    mput('senate', -26, 16, Math.PI / 2);
    mput('amphi', 54, -34, -Math.PI / 2, { s: .9 });
    agoraStalls(0, 8, 18, 20, seed + 'ag');
    godRow(['poseidon', 'hercules', 'athena'], -14, 26, 13, 0, Math.PI);
    var hs = ['house', 'house2', 'house5', 'houseGarden', 'house2f'];
    mblock(hs, -78, 22, 3, 3, 12, 12, seed + 'h1');
    mblock(hs, 50, 26, 3, 3, 12, 12, seed + 'h2');
    mblock(hs, -30, 52, 4, 2, 14, 13, seed + 'h3');
    mblock(hs, -28, -56, 3, 3, 5.5, 5, seed + 'h4');
    mblock(hs, 26, -52, 3, 2, 5.5, 5, seed + 'h5');
    mblock(hs, -52, 34, 3, 3, 5.5, 5, seed + 'h6');
    mput('forge', 34, 40, Math.PI); mput('potter', -40, 44, 0.3, { solid: false, autodoor: false });
    oliveGrove(96, -70, 32, 14, seed + 'o', ['olive', 'pine']);
    oliveGrove(-100, 74, 30, 12, seed + 'o2', ['olive', 'pine2']);
    mput('vineyard', 80, 66, 0.2);
    placePlayer(0, 40, Math.PI);
    hudCity(st, 'CORINTHVS');
  }

  /* SYRACVSAE：奥提伽岛 · 大港 · 希腊剧场 · 阿波罗神庙 */
  function medSyracusae() {
    var st = medSt('graecia'), R = 134, seed = 'syr';
    newScene(0xa4d6ee, 0xdfe0c2, 150, 640, Z.night);
    var paths = [
      { w: 7, pts: [[-8, R * .8], [-6, 30], [0, -6], [6, -40], [4, -R * .8]] },
      { w: 5, pts: [[-R * .8, -16], [0, -12], [R * .8, -8]] },
      { w: 3.4, pts: [[-16, -34], [-44, -50], [-60, -72]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: -10, rx: 18, rz: 13, stone: true }], []);
    mountainRing(R, seed, [0, 340]);
    /* 狄奥尼修斯长城：环高原四门 */
    cityWall([[-40, -92], [30, -84], [78, -50], [96, 0], [80, 48], [40, 76], [-30, 84], [-80, 60], [-100, 10], [-88, -52]], {
      gates: [{ x: 4.5, z: -87, ry: 3.1 }, { x: -6, z: 81.3, ry: 0 }, { x: 93, z: -8, ry: 1.6 }, { x: -95, z: -16, ry: -1.6 }], gateS: .8, gateGap: 6.5, towerEvery: 26
    });
    /* 拉托米亚采石场（耳朵洞） */
    var hQ = rockTerrace(-108, -64, 20, 12, 3, 2.4, seed + 'lq');
    mput('colRuin', -96, -54, 0.5, { solid: false, autodoor: false });
    mput('colRuin2', -104, -52, -0.4, { solid: false, autodoor: false });
    /* 大港在北，奥提伽岛横亘港口 */
    seaField(0, 172, 340, 140, 0x2b8fbc);
    shoreLine(110, -170, 170, seed);
    var ort = new T.Mesh(new T.CylinderGeometry(30, 34, 1.5, 18), nmat(0xc4bb8e));
    ort.scale.set(1.6, 1, 0.8); ort.position.set(18, 0.65, 132); Z.scene.add(ort);
    Z.colliders.push({ x: 18, z: 132, hw: 46, hd: 24, ry: 0, cx: 0, cz: 0 });
    mput('temple3', 4, 132, 0, { y: 1.4, s: .85 });          // 阿波罗/雅典娜神庙在岛上
    mput('fountain2', 42, 128, 0, { y: 1.4, autodoor: false }); // 阿瑞图萨泉
    mput('walltower', -14, 126, 0, { y: 1.4 });
    mput('bridge', -8, 116, 0, { s: .9, solid: false });
    mput('dock', 44, 112, 0, { autodoor: false }); mput('dock', -34, 114, 0, { autodoor: false });
    shipRoute('trireme', [[-130, 152], [-30, 158], [70, 156], [140, 166], [30, 176], [-80, 170]], 3.4);
    shipRoute('sail', [[120, 120], [60, 116], [-50, 118], [-120, 132], [-20, 146]], 2.6);

    /* 希腊大剧场（依山凿建）+ 祭坛 */
    mput('amphi', -52, -58, Math.PI * 0.15, { s: .8 });
    mput('altarStone', -30, -44, 0, { solid: false, autodoor: false, s: 1.4 });
    mput('temple', 8, -34, 0, { s: .85 });
    mcol('colCor', -12, -22, 26, -22, 4.6, { solid: false, autodoor: false });
    mput('senate', -30, 4, Math.PI / 2);
    mput('univ', 34, 8, -Math.PI / 2, { door: { side: 0, dist: 12, interior: 'study', label: 'ARCHIMEDES 学堂' } });
    mput('catapult', 56, 34, -0.6);   // 阿基米德的守城械
    mput('ballista', 66, 20, -0.4);
    agoraStalls(0, 0, 18, 18, seed + 'ag');
    godRow(['athena', 'artemis', 'hermes'], -16, 18, 13, 0, Math.PI);
    var hs = ['house1', 'house3', 'house6', 'houseSlope', 'house2f'];
    mblock(hs, -72, 16, 3, 3, 12, 12, seed + 'h1');
    mblock(hs, 36, 48, 3, 2, 12, 12, seed + 'h2');
    mblock(hs, -70, -30, 3, 2, 14, 13, seed + 'h3');
    mblock(hs, -40, 26, 4, 3, 5.5, 5, seed + 'h4');
    mblock(hs, 14, 24, 4, 3, 5.5, 5, seed + 'h5');
    mblock(hs, -52, 46, 3, 2, 5.5, 5, seed + 'h6');
    mput('forge', 40, -34, Math.PI); mput('granary', -80, 62, 0.2);
    oliveGrove(94, -60, 34, 14, seed + 'o', ['olive', 'pine']);
    oliveGrove(-104, 70, 30, 12, seed + 'o2', ['olive', 'fruitTree']);
    mput('vineyard', 74, 76, 0.3);
    placePlayer(0, 44, Math.PI);
    hudCity(st, 'SYRACVSAE');
  }

  /* DELPHI：山坡圣域 · 圣道 · 神谕所 · 肚脐石 · 宝库列 */
  function medDelphi() {
    var st = medSt('graecia'), R = 120, seed = 'dph';
    newScene(0xa9d8ef, 0xd5ddc4, 150, 640, Z.night);
    var paths = [{ w: 4.5, pts: [[0, R * .8], [4, 40], [-6, 10], [4, -18], [-2, -50]] }];
    addGround(st, R, paths, [{ x: 0, z: -26, rx: 14, rz: 10, stone: true }], []);
    /* 帕纳索斯山：三面高山合围，只留南向圣道 */
    for (var a = 40; a <= 320; a += 26) {
      var rad = a * Math.PI / 180;
      mountain(Math.sin(rad) * R * 1.02, Math.cos(rad) * R * 1.02, 20 + (a % 17), 40 + (a % 31), seed + a);
    }
    /* 层层台地：圣域依山而上 */
    var t1 = rockTerrace(0, -14, 62, 26, 1, 1.8, seed + 't1');
    var t2 = rockTerrace(0, -40, 46, 22, 2, 2.0, seed + 't2');
    mput('oracle', 0, -44, 0, { y: t2, s: .5 });               // 阿波罗神庙·神谕所
    mput('omphalos', 0, -30, 0, { y: t2, solid: false, autodoor: false });  // 大地肚脐
    mput('altarStone', -12, -30, 0, { y: t2, solid: false, autodoor: false });
    mput('stairs', 0, -22, Math.PI, { y: t1, solid: false, autodoor: false, s: 1.7 });
    /* 圣道两侧的城邦宝库与还愿像 */
    mput('temple2', -22, -12, 0.3, { y: t1, s: .55 });
    mput('temple3', 22, -12, -0.3, { y: t1, s: .55 });
    mput('temple2', -14, 4, 0.25, { s: .38 });
    mput('temple3', 14, 2, -0.25, { s: .4 });
    pondOrganic(34, -18, 5, 4, seed + 'cs', { lotus: false, lantern: false });
    godRow(['apollo' in MDL ? 'apollo' : 'hermes', 'athena', 'artemis', 'hercules'], -20, 4, 13, 0, Math.PI);
    mput('base2', 0, 12, 0, { solid: false, autodoor: false });
    mput('colossus', 0, 12, 0, { s: .2, autodoor: false });
    mcol('colRuin', -26, 20, 26, 20, 5, { solid: false, autodoor: false });
    /* 剧场与体育场（德尔斐竞技会） */
    mput('amphi', -34, -62, 0.4, { y: t2, s: .8 });
    mput('circus', 40, -66, Math.PI / 2, { s: .7 });
    mput('discobolus', 26, -48, Math.PI, { solid: false, autodoor: false });
    /* 朝圣者聚落：小客栈与摊位，无大市集 */
    var hs = ['house', 'house2', 'houseGarden'];
    mblock(hs, -46, 34, 3, 2, 13, 12, seed + 'h1');
    mblock(hs, 26, 40, 3, 2, 13, 12, seed + 'h2');
    agoraStalls(0, 30, 14, 10, seed + 'ag');
    mput('well', -10, 24, 0, { solid: false, autodoor: false });
    mput('centaur', -60, 60, 0.7, { autodoor: false });
    mput('faun', 56, 58, -0.5, { autodoor: false });
    oliveGrove(-64, -20, 26, 14, seed + 'o', ['olive', 'pine', 'pine2']);
    oliveGrove(62, 10, 26, 14, seed + 'o2', ['pine', 'olive']);
    placePlayer(0, 44, Math.PI);
    hudCity(st, 'DELPHI');
  }

  /* 通用：地中海港市（马西利亚 / 加德斯 / 塔兰托 / 推罗 / 西顿 …） */
  function medPort(locName, palKey, seedKey) {
    var st = medSt(palKey || 'graecia'), R = 128, seed = seedKey || locName;
    var r = rng('mp' + seed);
    newScene(0xa4d2ea, 0xdcdfc6, 150, 640, Z.night);
    var paths = [
      { w: 7, pts: [[0, R * .84], [2, 30], [-2, -10], [0, -R * .8]] },
      { w: 5, pts: [[-R * .78, 4], [0, 0], [R * .78, 8]] },
      { w: 3.2, pts: [[14, -18], [40, -32], [58, -52]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 2, rx: 17, rz: 12, stone: true }], []);
    mountainRing(R, seed, [0]);
    seaField(0, 164, 320, 130, 0x2d8cb6);
    shoreLine(104, -160, 160, seed);
    mput('dock', -24, 108, 0, { autodoor: false }); mput('dock', 20, 110, 0, { autodoor: false });
    shipRoute('sail', [[-120, 132], [-20, 124], [80, 130], [140, 144], [20, 154], [-90, 148]], 2.9);
    shipRoute('fishboat', [[-60, 118], [0, 122], [60, 120], [-10, 130]], 1.8);
    shipRoute('trireme2', [[130, 126], [10, 140], [-120, 128], [-40, 150]], 3.2);
    mput('watchtower', 46, 92, 0); mput('walltower', -52, 92, 0);
    /* 城心：神庙 + 议事厅 + 市集 */
    mput('temple', -10, -28, 0, { s: 1.0 });
    mput('senate', 24, -18, -Math.PI / 2);
    mcol('colPlain', -18, -6, 22, -6, 4.6, { solid: false, autodoor: false });
    agoraStalls(0, 6, 18, 18, seed + 'ag');
    godRow(['poseidon', 'hermes', 'aphrodite'], -16, 20, 13, 0, Math.PI);
    mput('fountain', 14, 22, 0, { autodoor: false });
    /* 仓储与作坊沿港 */
    mput('silo', -44, 70, 0.2, { door: { side: 0, interior: 'storeroom', label: 'HORREVM' } });
    mput('granary', 44, 66, -0.2);
    mput('forge', 34, 34, Math.PI); mput('potter', -34, 36, 0.4, { solid: false, autodoor: false });
    var hs = ['house1', 'house3', 'house5', 'houseSlope', 'houseLong', 'house2f'];
    mblock(hs, -94, 18, 3, 3, 14, 13, seed + 'h1');
    mblock(hs, 50, 24, 3, 3, 14, 13, seed + 'h2');
    mblock(hs, -40, -66, 4, 2, 14, 13, seed + 'h3');
    mput('amphi', -66, -50, Math.PI / 4, { s: .85 });
    var trees = palKey === 'africa' || palKey === 'aegypt' ? ['palm', 'palm2', 'olive'] : ['olive', 'pine', 'pine2'];
    oliveGrove(92, -30, 34, 14, seed + 'o', trees);
    oliveGrove(-96, -34, 30, 12, seed + 'o2', trees);
    mput('vineyard', 76, 74, 0.3);
    placePlayer(0, 40, Math.PI);
    hudCity(st, locName);
  }

  /* 通用：内陆行省城（卢泰西亚 / 伦丁尼恩 / 特里尔 / 阿奎莱亚 …）罗马殖民市形制 */
  function medColonia(locName, palKey, seedKey) {
    var st = medSt(palKey || 'gallia'), R = 124, seed = seedKey || locName;
    newScene(0x9dc6e2, 0xd2ddc4, 150, 640, Z.night);
    var paths = [
      { w: 8, pts: [[0, R * .85], [0, 0], [0, -R * .85]] },
      { w: 8, pts: [[-R * .85, 0], [0, 0], [R * .85, 0]] },
      { w: 3.6, pts: [[-R * .7, -30], [R * .7, -30]] },
      { w: 3.6, pts: [[-R * .7, 30], [R * .7, 30]] },
      { w: 3.6, pts: [[-40, -R * .7], [-40, R * .7]] },
      { w: 3.6, pts: [[40, -R * .7], [40, R * .7]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 0, rx: 18, rz: 13, stone: true }], [{ x: -96, z: 40, rx: 18, rz: 46 }]);
    mountainRing(R, seed, [270]);
    /* 河流与桥（行省城多依河而建） */
    seaField(-104, 30, 34, 180, 0x3d81a0);
    shipRoute('rowboat', [[-98, -60], [-104, 20], [-108, 90], [-100, 10]], 2.2);
    mput('bridge', -80, 24, Math.PI / 2, { s: 1.0 });
    /* FORVM：广场 + 神庙 + 巴西利卡 */
    mput('temple', -14, -14, 0, { s: .95 });
    mput('senate', 16, -14, -Math.PI / 2, { door: { side: 0, dist: 11, interior: 'hall', label: 'BASILICA' } });
    mput('arch', 0, 16, 0, { s: .85 });
    mcol('colCor', -18, 8, 18, 8, 5, { solid: false, autodoor: false });
    agoraStalls(0, -2, 15, 14, seed + 'ag');
    godRow(['zeus', 'hera'], -10, 24, 14, 0, Math.PI);
    /* 军营与城门塔（行省驻军） */
    mput('barracks', -46, -46, Math.PI / 2);
    mput('watchtower', 58, -58, 0); mput('walltower', -58, 58, 0);
    for (var i = 0; i < 4; i++) mput('gate', -30 + i * 20, 76, 0, { solid: false, autodoor: false });
    /* 街区 + 浴场 + 作坊 */
    mput('amphi', 62, 34, -Math.PI / 3, { s: .9 });
    mput('forge', 30, 40, Math.PI); mput('sawmill', -34, 44, 0.3);
    mput('watermill', -70, 12, Math.PI / 2, { solid: false, autodoor: false });
    var hs = ['house', 'house2', 'house4', 'houseSlope', 'houseGarden'];
    mblock(hs, -74, -60, 3, 3, 14, 13, seed + 'h1');
    mblock(hs, 50, -60, 3, 3, 14, 13, seed + 'h2');
    mblock(hs, 50, 48, 3, 2, 14, 13, seed + 'h3');
    mput('granary', -60, -20, Math.PI / 2); mput('stable', 46, 12, -Math.PI / 2);
    mput('farm', 84, 72, 0.2); mput('vineyard', -86, -74, -0.2);
    oliveGrove(90, -20, 32, 16, seed + 'o', ['tree', 'pine', 'olive']);
    oliveGrove(-88, 84, 28, 12, seed + 'o2', ['tree', 'pine2']);
    placePlayer(0, 34, Math.PI);
    hudCity(st, locName);
  }

  /* 通用：岩城 / 绿洲城（昔兰尼 · 佩特拉 · 麦罗埃 · 马里卜） */
  function medRock(locName, palKey, seedKey) {
    var st = medSt(palKey || 'africa'), R = 120, seed = seedKey || locName;
    var r = rng('mr' + seed);
    newScene(0xbcdcee, 0xe4d8ac, 150, 640, Z.night);
    var paths = [
      { w: 6, pts: [[0, R * .8], [-4, 30], [2, -10], [0, -R * .75]] },
      { w: 4, pts: [[-R * .7, 10], [0, 6], [R * .7, 14]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 4, rx: 15, rz: 11, stone: true }], []);
    /* 峡谷：两壁夹峙 */
    for (var zz = -R; zz <= R; zz += 16 + r() * 8) {
      mountain(-58 - r() * 16, zz, 15 + r() * 10, 34 + r() * 26, seed + 'L' + zz);
      mountain(58 + r() * 16, zz, 15 + r() * 10, 34 + r() * 26, seed + 'R' + zz);
    }
    /* 凿岩而成的立面：台地 + 柱廊神庙 */
    var h = rockTerrace(-30, -40, 40, 26, 2, 2.2, seed + 't');
    mput('temple', -30, -46, 0, { y: h, s: 1.05 });
    mcol('colCor', -46, -30, -14, -30, 4.4, { y: h, solid: false, autodoor: false });
    mput('stairs', -30, -24, Math.PI, { solid: false, autodoor: false, s: 1.8 });
    mput('oracle', 32, -44, -0.3, { s: .85 });
    mput('amphi', 26, 40, Math.PI / 5, { s: .8 });
    agoraStalls(0, 8, 15, 14, seed + 'ag');
    godRow(['hades', 'demeter'], -10, 22, 14, 0, Math.PI);
    mput('well', 6, 26, 0, { solid: false, autodoor: false });
    mput('fountain', -14, 34, 0, { autodoor: false });
    var hs = ['house3', 'house5', 'houseSlope', 'houseLong'];
    mblock(hs, -44, 44, 3, 2, 13, 12, seed + 'h1');
    mblock(hs, 18, 60, 3, 2, 13, 12, seed + 'h2');
    mblock(hs, -34, -76, 3, 2, 13, 12, seed + 'h3');
    mput('granary', 44, 20, -Math.PI / 2); mput('silo', 44, 2, -Math.PI / 2);
    palmRow(-16, 74, 12, 2, 6, seed + 'p1');
    palmRow(30, -70, 12, -2, 5, seed + 'p2');
    oliveGrove(0, 96, 26, 10, seed + 'o', ['palm', 'palm2']);
    mput('cart', 12, 12, 0.4, { solid: false, autodoor: false });
    placePlayer(0, 40, Math.PI);
    hudCity(st, locName);
  }

  /* 通用：凯尔特山堡 oppidum —— 土垣木栅环丘、酋长长屋、圆仓草垛、林牧田猎（努曼西亚/比布拉克特/阿莱西亚/卡姆罗敦） */
  function medOppidum(locName, palKey, seedKey) {
    var st = medSt(palKey || 'gallia'), R = 112, seed = seedKey || locName;
    var r = rng('op' + seed);
    newScene(0x9ac2de, 0xcddbc2, 150, 640, Z.night);
    var paths = [
      { w: 5, pts: [[0, R * .85], [2, 30], [0, 0], [-2, -30], [0, -R * .85]] },
      { w: 3, pts: [[-R * .7, 8], [-30, 4], [0, 0]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 0, rx: 12, rz: 9 }], []);
    mountainRing(R, seed, [0, 180]);
    /* 不规则土垣：南北二门 */
    var wpts = [], NW = 10, rw = 46 + r() * 8;
    for (var i = 0; i < NW; i++) {
      var ang = i / NW * Math.PI * 2;
      var rad = (i === 0 || i === NW / 2) ? rw : rw * (0.86 + r() * 0.3);
      wpts.push([Math.sin(ang) * rad, Math.cos(ang) * rad]);
    }
    cityWall(wpts, {
      h: 4.2, th: 1.8, color: 0x8a6b4a, cap: 0x74583c, towerS: 0.6, gateS: 0.62, gateGap: 5.5,
      gates: [{ x: 0, z: rw, ry: 0 }, { x: 0, z: -rw, ry: Math.PI }]
    });
    /* 酋长长屋 + 圣所 + 集会火塘 */
    mput('houseLong', 0, -20, Math.PI, { s: 1.35, door: { side: 0, dist: 9, interior: 'hall', label: locName + '·酋长长屋' } });
    mput('temple3', -22, -12, 0.4, { s: .55, autodoor: false });
    mput('campfire', 0, 0, 0, { solid: false, autodoor: false });
    mput('base', 6, -2, 0, { solid: false, autodoor: false });
    mput('hercules', 6, -2, -0.8, { y: .35, solid: false, autodoor: false });
    crowd(0, 4, 7, 6, seed + 'cw');
    /* 环火塘的圆形聚落：茅舍 + 谷仓 + 草垛 */
    var hs = ['houseGarden', 'house', 'house2', 'houseSlope'];
    for (var k = 0; k < 11; k++) {
      var ka = k / 11 * Math.PI * 2 + r() * 0.3, kd = 17 + r() * 16;
      var kx = Math.sin(ka) * kd, kz = Math.cos(ka) * kd;
      if (Math.abs(kx) < 6 || Math.hypot(kx, kz - (-20)) < 13) continue;
      mput(hs[k % hs.length], kx, kz, ka + Math.PI + (r() - .5) * 0.5);
      if (k % 3 === 0) mput('hay', kx + 4, kz + 3, r() * 3, { solid: false, autodoor: false });
    }
    mput('granary', 24, 14, -Math.PI / 2); mput('silo', 30, 20, 0.4);
    mput('forge', -26, 18, Math.PI / 2, { door: { side: 0, interior: 'shop', label: 'FABRICA 铁工坊' } });
    mput('anvil', -22, 21, 0, { solid: false, autodoor: false });
    mput('well', 8, 8, 0, { solid: false, autodoor: false });
    mput('stable', -14, 34, Math.PI); mput('horse', -8, 38, 0.8, { solid: false, autodoor: false });
    mput('straw', 14, 30, 0.6, { solid: false, autodoor: false });
    mput('cart', -4, 24, 0.5, { solid: false, autodoor: false });
    /* 垣外：田亩 + 针叶林 + 猎场 */
    mput('farm', -70, 40, 0.2); mput('farm', 66, -44, -0.15); mput('vineyard', 62, 52, 0.3);
    mput('hay', -62, 48, 0.4, { solid: false, autodoor: false });
    treeCluster(-64, -50, ['pine', 'green'], seed + 'f1');
    treeCluster(70, 10, ['pine', 'pine'], seed + 'f2');
    treeCluster(-76, -8, ['green', 'pine'], seed + 'f3');
    oliveGrove(0, -84, 26, 12, seed + 'f4', ['pine', 'tree', 'pine2']);
    oliveGrove(80, 78, 22, 9, seed + 'f5', ['pine', 'tree']);
    mput('tentSm', 54, -70, 0.8, { solid: false, autodoor: false });
    mput('campfire', 58, -66, 0, { solid: false, autodoor: false });
    for (var c = 0; c < 4; c++) cloud((c - 1.5) * 52, 66 + c * 4, -40 + c * 30, 2.6, seed + c);
    placePlayer(0, 26, Math.PI);
    hudCity(st, locName);
  }

  /* 通用：东方丝路城 —— 方城二门、王宫圣塔、巴扎长街、园圃棕榈、驼队帐营（巴克特拉/撒马尔罕/塔克西拉/华氏城） */
  function medOrient(locName, palKey, seedKey) {
    var st = medSt(palKey || 'levant'), R = 128, seed = seedKey || locName;
    var r = rng('or' + seed);
    newScene(0xa8cbe0, 0xdcd8b4, 150, 640, Z.night);
    var paths = [
      { w: 6, pts: [[0, R * .85], [0, 30], [0, -30], [0, -R * .85]] },
      { w: 5, pts: [[-R * .8, -2], [-30, -2], [30, -2], [R * .8, -2]] },
      { w: 3, pts: [[-34, 40], [30, 40]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: -2, rx: 14, rz: 10, stone: true }], []);
    mountainRing(R, seed, [0, 90, 180]);
    /* 方形土城：南北二门 */
    var q = 6 + r() * 4;
    var wq = [[-58, -50 - q], [0, -56 - q], [58, -50 - q], [64 + q, 0], [58, 50 + q], [0, 56 + q], [-58, 50 + q], [-64 - q, 0]];
    cityWall(wq, {
      h: 5.2, th: 2.2, color: 0xc9b184, cap: 0xb59d72, towerS: 0.7, gateS: 0.8, gateGap: 6,
      gates: [{ x: 0, z: 56 + q, ry: 0 }, { x: 0, z: -56 - q, ry: Math.PI }]
    });
    /* 王宫 + 圣塔 + 拜火坛 */
    mput('palace', -26, -30, 0.35, { y: 0, s: 1.5, door: { side: 0, dist: 12, interior: 'throne', label: locName + '·王宫' } });
    mput('colossus', 30, -34, -0.4, { s: .13, autodoor: false });
    mput('oracle', 34, 26, Math.PI, { s: .5, autodoor: false });
    mput('altarStone', 0, -16, 0, { solid: false, autodoor: false });
    mput('campfire', 0, -16, 0, { y: .5, solid: false, autodoor: false });
    /* 巴扎长街：沿东西大道两侧摊棚货栈 */
    for (var b = 0; b < 7; b++) {
      var bx = -30 + b * 10;
      mput(b % 2 ? 'shop' : 'shop2', bx, 7, Math.PI, { autodoor: false });
      if (b % 2 === 0) mput('shopBox', bx + 3, 3.5, r() * 2, { solid: false, autodoor: false });
      if (b % 3 === 0) mput('jar', bx - 3, 4, 0, { solid: false, autodoor: false });
    }
    agoraStalls(0, -6, 10, 10, seed + 'bz');
    crowd(2, -4, 9, 8, seed + 'cw');
    mput('banner', -8, 6, 0, { solid: false, autodoor: false });
    mput('banner2', 8, 6, 0, { solid: false, autodoor: false });
    /* 平顶民居街区 */
    var hs2 = ['house4', 'house5', 'house2f', 'house'];
    mblock(hs2, -48, 14, 3, 3, 12, 11, seed + 'h1');
    mblock(hs2, 20, 14, 3, 3, 12, 11, seed + 'h2');
    mblock(hs2, -48, -44, 2, 2, 12, 11, seed + 'h3');
    mblock(['houseGarden', 'house2'], 36, -12, 2, 2, 12, 10, seed + 'h4');
    /* 园圃水法 + 棕榈行道 */
    pondOrganic(-34, 42, 8, 6, seed + 'pq', { lotus: false, lantern: false });
    palmRow(-24, 48, 12, 0, 5, seed + 'p1');
    palmRow(12, -52, 11, 2, 5, seed + 'p2');
    oliveGrove(52, 40, 20, 8, seed + 'g1', ['palm', 'palm2', 'olive']);
    /* 城外驼队帐营 + 田亩 */
    mput('tentBig', 22, 78, 0.5, { solid: false, autodoor: false });
    mput('tentSm', 30, 84, 1.2, { solid: false, autodoor: false });
    mput('tentOpen', 14, 84, -0.4, { solid: false, autodoor: false });
    mput('campfire', 22, 84, 0, { solid: false, autodoor: false });
    mput('horseCart', 10, 74, 0.3, { solid: false, autodoor: false });
    mput('cart', 30, 72, -0.5, { solid: false, autodoor: false });
    mput('horse', 16, 70, 0.9, { solid: false, autodoor: false });
    mput('farm', -76, 66, 0.2); mput('vineyard', 76, -60, -0.3);
    mput('granary', -68, -60, 0.4); mput('silo', -60, -66, 0);
    palmRow(-70, 84, 13, -2, 4, seed + 'p3');
    for (var c2 = 0; c2 < 4; c2++) cloud((c2 - 1.5) * 54, 68 + c2 * 4, -36 + c2 * 28, 2.8, seed + c2);
    placePlayer(0, 30, Math.PI);
    hudCity(st, locName);
  }

  /* 通用：村庄 —— 无神庙无巨像，只有农舍、井、田、畜栏 */
  function medVicus(locName, palKey, seedKey) {
    var st = medSt(palKey || 'latium'), R = 108, seed = seedKey || locName;
    var r = rng('vc' + seed);
    newScene(0x9fcbe4, 0xd3dfc2, 150, 640, Z.night);
    var paths = [
      { w: 4.5, pts: [[-R * .8, 12], [-20, 4], [20, 8], [R * .8, 2]] },
      { w: 3, pts: [[4, 6], [10, -30], [4, -R * .7]] }
    ];
    addGround(st, R, paths, [{ x: 2, z: 6, rx: 9, rz: 7 }], [{ x: -46, z: 40, rx: 11, rz: 8 }]);
    mountainRing(R, seed, [180]);
    pondOrganic(-46, 40, 11, 8, seed, { lotus: false, lantern: false });
    /* 农舍散布沿路，各带菜园 */
    var hs = ['houseGarden', 'house', 'house2', 'houseSlope', 'house6'];
    var r2 = rng('vh' + seed);
    for (var i = 0; i < 9; i++) {
      var hx = -60 + i * 15 + (r2() - .5) * 6, hz = (i % 2 ? 22 : -16) + (r2() - .5) * 8;
      mput(hs[i % hs.length], hx, hz, r2() * 6.28);
      if (i % 3 === 0) mput('olive', hx + 7, hz + 5, 0, { solid: false, autodoor: false });
    }
    mput('well', 2, 4, 0, { solid: false, autodoor: false });
    mput('farm', -26, 54, 0.2); mput('farm', 24, 58, -0.2);
    mput('vineyard', 54, 34, 0.3); mput('vineyard', -58, -34, -0.3);
    mput('watermill', -50, 26, Math.PI / 2, { solid: false, autodoor: false });
    mput('stable', 40, -20, -Math.PI / 2); mput('granary', -20, -40, 0);
    mput('hay', 12, -28, 0.3, { solid: false, autodoor: false });
    mput('straw', 18, -24, -0.4, { solid: false, autodoor: false });
    mput('campfire', -4, 16, 0, { solid: false, autodoor: false });
    mput('cart', -12, 10, 0.5, { solid: false, autodoor: false });
    mput('horse', 34, -8, 0.8, { solid: false, autodoor: false });
    oliveGrove(70, -60, 30, 16, seed + 'o', ['olive', 'fruitTree', 'tree']);
    oliveGrove(-76, 70, 28, 14, seed + 'o2', ['olive', 'pine']);
    for (var c = 0; c < 4; c++) cloud((c - 1.5) * 50, 42 + c * 3, -30 + c * 34, 2.4, seed + c);
    placePlayer(2, 30, Math.PI);
    hudCity(st, locName);
  }



  /* ═══ 基建件甲：程序化城墙（多边形环 · 分段墙体+雉堞 · 顶点塔 · 门洞留缺 · 碰撞） ═══ */
  function cityWall(pts, opts) {
    opts = opts || {};
    var hgt = opts.h || 6.5, thick = opts.th || 2.4;
    var gates = opts.gates || [];
    var wallMat = nmat(opts.color || 0xcfc5b0), capMat = nmat(opts.cap || 0xc0b6a0);
    function nearGate(x, z) {
      for (var g = 0; g < gates.length; g++) if (Math.hypot(x - gates[g].x, z - gates[g].z) < (opts.gateGap || 7.5)) return true;
      return false;
    }
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      var dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
      var segs = Math.max(1, Math.round(L / 8));
      for (var s2 = 0; s2 < segs; s2++) {
        var t0 = (s2 + 0.5) / segs;
        var mx = a[0] + dx * t0, mz = a[1] + dz * t0;
        if (nearGate(mx, mz)) continue;
        var segL = L / segs + 0.4;
        var lowSeg = opts.low && opts.low(mx, mz); /* 低平段：引水道等跨墙处，无雉堞 */
        var h2 = lowSeg ? Math.min(3.4, hgt * 0.52) : hgt;
        var w = new T.Mesh(new T.BoxGeometry(thick, h2, segL), wallMat);
        w.position.set(mx, h2 / 2, mz); w.rotation.y = ang;
        w.castShadow = w.receiveShadow = true; Z.scene.add(w);
        var walk = new T.Mesh(new T.BoxGeometry(thick + 0.9, 0.6, segL), capMat);
        walk.position.set(mx, h2 + 0.3, mz); walk.rotation.y = ang; Z.scene.add(walk);
        if (!lowSeg) for (var c = -1; c <= 1; c++) {
          var m1 = new T.Mesh(new T.BoxGeometry(thick + 0.9, 1.0, 1.3), capMat);
          m1.position.set(mx + Math.sin(ang) * c * segL * 0.33, hgt + 1.1, mz + Math.cos(ang) * c * segL * 0.33);
          m1.rotation.y = ang; Z.scene.add(m1);
        }
        Z.colliders.push({ x: mx, z: mz, hw: thick / 2 + 0.5, hd: segL / 2, ry: ang, cx: 0, cz: 0 });
      }
      if (opts.towers !== false) mput(i % 3 === 2 ? 'watchtower' : 'walltower', a[0], a[1], ang, { autodoor: false, s: opts.towerS || 0.85 });
      if (opts.towerEvery) for (var td = opts.towerEvery; td < L - 6; td += opts.towerEvery) {
        var tx = a[0] + dx * td / L, tz = a[1] + dz * td / L;
        if (!nearGate(tx, tz) && !(opts.low && opts.low(tx, tz)))
          mput('walltower', tx, tz, ang, { autodoor: false, s: (opts.towerS || 0.85) * 0.92 });
      }
    }
    gates.forEach(function (g) { mput('gate', g.x, g.z, g.ry, { s: opts.gateS || 1.25, solid: false, autodoor: false }); });
  }

  /* 基建件丙：引水道连拱 —— 立柱+拱肩连梁+顶水槽，任意两点间等高长列 */
  function aqueductRun(x0, z0, x1, z1, hgt) {
    hgt = hgt || 9;
    var dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
    var ux = dx / L, uz = dz / L;
    var stone = nmat(0xcfc5b0), cap = nmat(0xbfb49d), water = nmat(0x3b86a6);
    for (var d = 0; d <= L; d += 5.6) {
      var px = x0 + ux * d, pz = z0 + uz * d;
      var pier = new T.Mesh(new T.BoxGeometry(1.7, hgt, 1.7), stone);
      pier.position.set(px, hgt / 2, pz); pier.rotation.y = ang;
      pier.castShadow = pier.receiveShadow = true; Z.scene.add(pier);
      Z.colliders.push({ x: px, z: pz, hw: 1.1, hd: 1.1, ry: ang, cx: 0, cz: 0 });
    }
    var segs = Math.max(1, Math.round(L / 8));
    for (var s2 = 0; s2 < segs; s2++) {
      var t0 = (s2 + 0.5) / segs, segL = L / segs + 0.3;
      var mx = x0 + dx * t0, mz = z0 + dz * t0;
      var beam = new T.Mesh(new T.BoxGeometry(2.2, 2.4, segL), stone);
      beam.position.set(mx, hgt + 1.2, mz); beam.rotation.y = ang;
      beam.castShadow = true; Z.scene.add(beam);
      var rim = new T.Mesh(new T.BoxGeometry(2.6, 0.7, segL), cap);
      rim.position.set(mx, hgt + 2.75, mz); rim.rotation.y = ang; Z.scene.add(rim);
      var wat = new T.Mesh(new T.BoxGeometry(1.5, 0.35, segL), water);
      wat.position.set(mx, hgt + 3.1, mz); wat.rotation.y = ang; Z.scene.add(wat);
    }
  }

  /* 开放墙线：折线不闭环（长墙/多重防线用），塔按间距沿线布 */
  function cityWallLine(pts, opts) {
    opts = opts || {};
    var off = [];
    for (var i = pts.length - 1; i >= 0; i--) {
      var pPrev = pts[Math.max(0, i - 1)], pNext = pts[Math.min(pts.length - 1, i + 1)];
      var dx = pNext[0] - pPrev[0], dz = pNext[1] - pPrev[1], L = Math.hypot(dx, dz) || 1;
      off.push([pts[i][0] - dz / L * 1.2, pts[i][1] + dx / L * 1.2]);
    }
    cityWall(pts.concat(off), Object.assign({}, opts, { towers: false, towerEvery: 0 }));
    if (opts.towerEvery) {
      var acc = 0;
      for (var j = 1; j < pts.length; j++) {
        var ddx = pts[j][0] - pts[j - 1][0], ddz = pts[j][1] - pts[j - 1][1], SL = Math.hypot(ddx, ddz);
        var ang = Math.atan2(ddx, ddz);
        for (var d = (opts.towerEvery - acc % opts.towerEvery) % opts.towerEvery; d < SL; d += opts.towerEvery) {
          var tx = pts[j - 1][0] + ddx * d / SL, tz = pts[j - 1][1] + ddz * d / SL, ng = false;
          (opts.gates || []).forEach(function (g) { if (Math.hypot(tx - g.x, tz - g.z) < (opts.gateGap || 7) + 3) ng = true; });
          if (!ng) mput((d | 0) % 3 === 2 ? 'watchtower' : 'walltower', tx, tz, ang, { autodoor: false, s: opts.towerS || 0.85 });
        }
        acc += SL;
      }
    }
  }

  /* ═══ 基建件乙：样条弯河（河床/沙岸/活水三层 ribbon · 顶点波动不破面 · 沿线行船/架桥） ═══ */
  var RIVER = null;
  function ribbonGeo(curve, width, N) {
    var pos = [], idx = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var p = curve.getPointAt(t), tan = curve.getTangentAt(t);
      var nx = -tan.z, nz = tan.x, k = Math.hypot(nx, nz) || 1;
      nx /= k; nz /= k;
      pos.push(p.x + nx * width / 2, 0, p.z + nz * width / 2);
      pos.push(p.x - nx * width / 2, 0, p.z - nz * width / 2);
    }
    for (var j = 0; j < N; j++) {
      var a2 = j * 2, b2 = j * 2 + 1, c2 = j * 2 + 2, d2 = j * 2 + 3;
      idx.push(a2, c2, b2, b2, c2, d2);
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  function riverSpline(ptsXZ, width, opts) {
    opts = opts || {};
    /* 两端顺势蜿蜒续出雾外，河不再戛然而止 */
    if (opts.extend !== false) {
      var ext = ptsXZ.slice(), K = 5, step = 120;
      var h0 = hash('rvx' + ptsXZ.length + width);
      var stretch = function (pA, pB, push) {
        var ang = Math.atan2(pA[0] - pB[0], pA[1] - pB[1]);
        var px = pA[0], pz = pA[1];
        for (var i2 = 1; i2 <= K; i2++) {
          ang += Math.sin(i2 * 0.9 + h0 % 7) * 0.24;
          px += Math.sin(ang) * step; pz += Math.cos(ang) * step;
          push([px, pz]);
        }
      };
      var head = []; stretch(ptsXZ[0], ptsXZ[1], function (p) { head.unshift(p); });
      var tail = []; stretch(ptsXZ[ptsXZ.length - 1], ptsXZ[ptsXZ.length - 2], function (p) { tail.push(p); });
      var plen = function (arr) { var L = 0; for (var q = 1; q < arr.length; q++) L += Math.hypot(arr[q][0] - arr[q - 1][0], arr[q][1] - arr[q - 1][1]); return L; };
      var hl = plen(head.concat([ptsXZ[0]])), ol = plen(ptsXZ), tl = plen([ptsXZ[ptsXZ.length - 1]].concat(tail));
      opts._t0 = hl / (hl + ol + tl); opts._t1 = (hl + ol) / (hl + ol + tl);
      ptsXZ = head.concat(ext, tail);
      AQUA.push({ kind: 'poly', pts: ptsXZ, hw: width * 0.75 });
    }
    var pts = ptsXZ.map(function (q) { return new T.Vector3(q[0], 0, q[1]); });
    var curve = new T.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    var N = PERF.low ? 120 : 220;
    /* 沙岸（最宽 · 最贴地） */
    /* 河贴地嵌槽：沙岸-深色河床-水面逐层微升，水面几与地平齐，不再浮成一条高台 */
    var bank = new T.Mesh(ribbonGeo(curve, width * 1.5, N), nmat(opts.sand || 0xd3c396));
    bank.position.y = 0.02; Z.scene.add(bank);
    /* 深色河床（比水面宽出一圈＝下切的暗岸沿） */
    var bed = new T.Mesh(ribbonGeo(curve, width * 1.18, N), nmat(opts.bed || 0x1d4a60));
    bed.position.y = 0.045; Z.scene.add(bed);
    /* 活水层：flat shading + 顶点波动（振幅小于层距，永不破面） */
    var wgeo = ribbonGeo(curve, width, N);
    var wat = new T.Mesh(wgeo, new T.MeshLambertMaterial({ color: opts.color || 0x3b86a6, flatShading: true, transparent: true, opacity: 0.93 }));
    wat.position.y = 0.11; Z.scene.add(wat);
    RIVER = { curve: curve, geo: wgeo, mesh: wat, t: 0, width: width, amp: opts.amp || 0.055, t0: opts._t0 || 0, t1: opts._t1 != null ? opts._t1 : 1 };
    /* 走不进河：全河稀布 + 城中原段加密 */
    for (var i = 0; i <= 88; i++) {
      var p = curve.getPointAt(i / 88);
      Z.colliders.push({ x: p.x, z: p.z, hw: width * 0.52, hd: width * 0.52, ry: 0, cx: 0, cz: 0 });
    }
    for (var i2 = 0; i2 <= 40; i2++) {
      var tt = RIVER.t0 + (RIVER.t1 - RIVER.t0) * i2 / 40;
      var p2 = curve.getPointAt(tt);
      Z.colliders.push({ x: p2.x, z: p2.z, hw: width * 0.52, hd: width * 0.52, ry: 0, cx: 0, cz: 0 });
    }
    return curve;
  }
  function rvT(t2) { return RIVER.t0 + (RIVER.t1 - RIVER.t0) * t2; }
  function riverBridge(t2, opts) {
    if (!RIVER) return;
    t2 = rvT(t2);
    var p = RIVER.curve.getPointAt(t2), tan = RIVER.curve.getTangentAt(t2);
    mput('bridge', p.x, p.z, Math.atan2(tan.x, tan.z) + Math.PI / 2, Object.assign({ s: 0.9, solid: false, autodoor: false }, opts || {}));
  }
  function riverIsland(t2, rx, rz, seed) {
    if (!RIVER) return null;
    t2 = rvT(t2);
    var p = RIVER.curve.getPointAt(t2);
    var isl = new T.Mesh(new T.CylinderGeometry(1, 1.15, 1.5, 14), nmat(0xc9bd92));
    isl.scale.set(rx, 1, rz); isl.position.set(p.x, 0.62, p.z); Z.scene.add(isl);
    Z.colliders.push({ x: p.x, z: p.z, hw: rx, hd: rz, ry: 0, cx: 0, cz: 0 });
    return { x: p.x, z: p.z, y: 1.4 };
  }
  function riverShip(key, t0, sp, dir, o) {
    if (!RIVER) return;
    var g = mput(key, 0, 0, 0, Object.assign({ solid: false, autodoor: false, shadow: false }, o || {}));
    if (!g) return;
    (RIVER.ships = RIVER.ships || []).push({ g: g, t: rvT(t0 || 0), sp: (sp || 0.012) * (RIVER.t1 - RIVER.t0) * (dir === -1 ? -1 : 1), ph: (RIVER.ships ? RIVER.ships.length : 0) * 1.9 });
  }
  function riverTick(dt) {
    if (!RIVER) return;
    RIVER.t += dt;
    var pa = RIVER.geo.attributes.position, t = RIVER.t, amp = RIVER.amp;
    for (var i = 0; i < pa.count; i++) {
      var x = pa.getX(i), z = pa.getZ(i);
      pa.setY(i, Math.sin(x * 0.11 + t * 1.3) * amp + Math.sin(z * 0.14 - t * 0.9) * amp * 0.8 + Math.sin((x + z) * 0.05 + t * 0.55) * amp * 0.6);
    }
    pa.needsUpdate = true; RIVER.geo.computeVertexNormals();
    (RIVER.ships || []).forEach(function (s) {
      s.t += s.sp * dt;
      if (s.t > 0.985) s.t = 0.015; if (s.t < 0.015) s.t = 0.985;
      var p = RIVER.curve.getPointAt(s.t), tan = RIVER.curve.getTangentAt(s.t);
      s.g.position.set(p.x, 0.16 + Math.sin(t * 1.4 + s.ph) * 0.035, p.z);
      s.g.rotation.y = Math.atan2(tan.x, tan.z) + (s.sp < 0 ? Math.PI : 0);
      s.g.rotation.z = Math.sin(t * 1.5 + s.ph) * 0.035;
    });
  }

  /* ═══ ROMA AETERNA · 从零重建：塞维安墙13顶点全环8门 · 台伯河反S样条+台伯岛三桥 ·
     七丘台地 · FORVM四面围合 · 斗兽场谷地 · 大竞技场 · 引水道十五连拱跨墙 · 十五街区铺满 ═══ */
  function medRomaF() {
    var st = medSt('latium'), R = 160, seed = 'romaF2';
    newScene(0x9fc9e4, 0xd6dfc9, 150, 680, Z.night);

    /* —— 道路：放射主路自各门出城 + 墙内环路 + 支路 —— */
    var paths = [
      { w: 4, pts: [[-2, 2], [8, 7], [14, 12], [24, 18], [27, 25]] },                            /* Via Sacra 圣道 */
      { w: 4, pts: [[12, 50], [20, 62], [31, 76], [52, 112], [74, 144]] },                       /* Via Appia */
      { w: 3.5, pts: [[2, -6], [8, -28], [52, -68], [82, -104], [94, -136]] },                   /* Via Salaria */
      { w: 3.5, pts: [[3, -4], [26, -10], [60, -12], [88, -18], [110, -24], [148, -28]] },       /* Via Tiburtina */
      { w: 3.5, pts: [[-2, -4], [-12, -20], [-20, -34], [-32, -70], [-38, -110], [-42, -155]] }, /* Via Flaminia */
      { w: 3.5, pts: [[-4, 6], [-30, 20], [-40, 28], [-48, 33], [-56, 37], [-66, 33], [-90, 24], [-110, 20]] }, /* Via Aurelia 经岛桥过河 */
      { w: 3, pts: [[-30, 40], [-44, 56], [-52, 80], [-58, 110], [-64, 145]] },                  /* Via Ostiensis 沿河 */
      { w: 3, pts: [[62, 36], [66, 46], [64, 72], [84, 98], [104, 124]] },                       /* Via Tusculana */
      { w: 3.5, pts: [[-4, 70], [-6, 88], [-8, 116], [-12, 148]] },                              /* Via Ardeatina */
      { w: 3, pts: [[0, -14], [30, -40], [62, -50], [94, -30], [94, 10], [70, 40], [44, 60], [10, 64], [-16, 48], [-24, 20], [-12, 6], [0, -14]] }, /* 墙内环路 */
      { w: 3, pts: [[-26, -52], [-38, -49], [-48, -51]] },                                       /* 万神殿支路(墙外自Flaminia分岔) */
      { w: 2.5, pts: [[2, -2], [14, -8], [24, -22]] },                                           /* Argiletum 窄街入苏布拉 */
      { w: 2.5, pts: [[-30, 40], [-40, 42], [-50, 44]] }                                         /* 码头支路 */
    ];
    var plazas = [
      { x: 0, z: 2, rx: 14, rz: 8, stone: true },      /* FORVM ROMANVM */
      { x: -27, z: 38, rx: 8, rz: 6, stone: true },    /* FORVM BOARIVM 牛市 */
      { x: -56, z: -46, rx: 6, rz: 5, stone: true }    /* 万神殿前庭 */
    ];
    addGround(st, R, paths, plazas, []);
    mountainRing(205, seed, [27, 40, 100, 145, 196, 203, 325, 336]);

    /* —— 台伯河：反S样条三层活水全程墙外 · 台伯岛医神庙 · Fabricius/Cestius岛桥+Aemilius整桥 —— */
    riverSpline([[-66, -158], [-104, -128], [-128, -84], [-116, -32], [-102, -4], [-72, 10], [-52, 20], [-60, 48], [-69, 84], [-110, 158]], 11, {});
    var isl = riverIsland(0.655, 8, 15);
    if (isl) mput('temple3', isl.x, isl.z, 0.6, { y: isl.y, s: .4, autodoor: false });
    riverBridge(0.635, { s: .85 });
    riverBridge(0.675, { s: .85 });
    riverBridge(0.70, { s: 1.0 });
    riverShip('sail', 0.30, 0.010, 1, { s: .55 });
    riverShip('trireme', 0.72, 0.008, -1, { s: .5 });
    riverShip('rowboat2', 0.50, 0.013, 1, { s: .35 });

    /* —— 塞维安城墙：门顶点拆沿路法向±4双点、门居中留洞 · 沿边每26单位补塔 · 引水道跨墙低平段 —— */
    var GATES = [
      { x: -40, z: 28, ry: -2.03 },   /* Flumentana 通河桥 */
      { x: -20, z: -34, ry: -2.82 },  /* Fontinalis Via Flaminia */
      { x: 82, z: -104, ry: 2.78 },   /* Collina Via Salaria */
      { x: 110, z: -24, ry: 1.68 },   /* Esquilina Via Tiburtina */
      { x: 64, z: 72, ry: 0.66 },     /* Caelimontana Via Tusculana */
      { x: 31, z: 76, ry: 0.53 },     /* Capena Via Appia */
      { x: -8, z: 116, ry: -0.12 },   /* Raudusculana Via Ardeatina */
      { x: -44, z: 56, ry: -0.32 }    /* Trigemina Via Ostiensis */
    ];
    var WB = [[-40, 28], [-28, -4], [-20, -34], [16, -72], [82, -104], [108, -56], [110, -24], [96, 28], [64, 72], [31, 76], [-8, 116], [-48, 88], [-44, 56]];
    var wpts = [];
    for (var wi = 0; wi < WB.length; wi++) {
      var wp = WB[wi], wg = null;
      for (var gk = 0; gk < GATES.length; gk++) if (GATES[gk].x === wp[0] && GATES[gk].z === wp[1]) wg = GATES[gk];
      if (!wg) { wpts.push(wp); continue; }
      var gnx = Math.cos(wg.ry), gnz = -Math.sin(wg.ry);
      var pA = [wp[0] - gnx * 4, wp[1] - gnz * 4], pB = [wp[0] + gnx * 4, wp[1] + gnz * 4];
      var pv = WB[(wi - 1 + WB.length) % WB.length];
      if (Math.hypot(pA[0] - pv[0], pA[1] - pv[1]) > Math.hypot(pB[0] - pv[0], pB[1] - pv[1])) { var pT = pA; pA = pB; pB = pT; }
      wpts.push(pA, pB);
    }
    cityWall(wpts, { gates: GATES, gateGap: 6.5, gateS: .8, towerEvery: 26, low: function (mx, mz) { return mx > 70 && mx < 78 && mz > 40 && mz < 70; } });

    /* —— FORVM ROMANVM：椭圆石场被元老院/巴西利卡/双庙/双凯旋门围合成"房间" —— */
    mput('temple', -7, -6, 2.6, { s: .5, door: { side: 0, dist: 11, interior: 'throne', label: 'CVRIA 元老院' } });
    mput('base', -4, -2, 0, { solid: false, autodoor: false });
    mput('statue', -4, -2, 2.6, { y: .35, solid: false, autodoor: false });
    mput('univ', -3, 13, 0, { s: .85, autodoor: false });                                        /* 巴西利卡·尤利亚 */
    mcol('colCor', -9, 5.5, 3, 5.5, 4.2, { solid: false, autodoor: false });
    mput('temple', -21, 7, 0, { s: .55 });                                                       /* 萨图恩神庙 */
    mput('torch', -16.5, 5, 0, { solid: false, autodoor: false });
    mput('torch', -16.5, 9, 0, { solid: false, autodoor: false });
    mput('temple2', 10, 10, -Math.PI / 2, { s: .7 });                                            /* 卡斯托尔神庙 */
    mput('jarMon', 2, 6, 0, { solid: false, autodoor: false });
    mput('arch', -17.5, -5, 1.1, { s: .4 });                                                      /* 塞维鲁凯旋门 */
    mput('base2', 0, 1, 0, { solid: false, autodoor: false });
    mput('riding', 0, 1, 0.8, { y: .4, autodoor: false });                                       /* 图密善骑像 */
    agoraStalls(3, -1, 5, 6, seed + 'fo');
    crowd(1, 1, 8, 10, seed + 'cw');
    mput('sundial', 5, -3, 0, { solid: false, autodoor: false });
    mput('banner', -5, 8, 0, { solid: false, autodoor: false });
    mput('banner2', 5, 8, 0, { solid: false, autodoor: false });

    /* —— 帝国广场带：战神复仇者庙小院 · 图拉真纪功柱+神庙+市场弧列 —— */
    mput('temple3', 7, -15, Math.PI, { s: .8 });
    mcol('colPlain', 14.5, -11, 14.5, -17, 3.2, { solid: false, autodoor: false });
    mput('base2', 2, -26, 0, { solid: false, autodoor: false });
    mput('colCor', 2, -26, 0, { s: 3, y: .5, solid: false, autodoor: false });                        /* 图拉真纪功柱 */
    mput('temple', 10, -31, Math.PI, { s: .75 });                                                /* 图拉真广场神庙 */
    var TM = [[6, -17.5, -2.7], [10, -19, -2.5], [13, -22, -2.2], [15, -26, -1.8], [15.5, -30, -1.4]];
    for (var tm = 0; tm < TM.length; tm++) mput('shop2', TM[tm][0], TM[tm][1], TM[tm][2], { autodoor: false });

    /* —— CAPITOLIVM 台地(西北贴广场)：朱庇特神庙+列神+东缘石阶双狮 —— */
    var capH = rockTerrace(-32, -15, 16, 14, 3, 2, seed + 'cap');
    mput('parthenon', -32, -16, 2.36, { y: capH, s: .22, autodoor: false });
    mput('stairs', -33.5, -6, Math.PI, { solid: false, autodoor: false, s: 1.4 });
    mput('lion', -37, -4.5, Math.PI, { solid: false, autodoor: false });
    mput('lion', -30.8, -4.8, Math.PI, { solid: false, autodoor: false });

    /* —— PALATINVS 台地(正南贴广场)：帝宫+顶缘柱列+北阶 —— */
    var palH = rockTerrace(8, 29, 28, 26, 3, 2.2, seed + 'pal');
    mput('palace', 8, 29, Math.PI, { y: palH, s: 2, door: { side: 0, dist: 13, interior: 'throne', label: 'DOMVS AVGVSTANA 帝宫' } });
    mcol('colCor', 1.5, 19.5, 14.5, 19.5, 4.3, { y: 4.4, solid: false, autodoor: false });
    mput('stairs', 8, 14.2, Math.PI, { solid: false, autodoor: false, s: 1.5 });
    mput('pine', -2, 44.5, 0, { solid: false, autodoor: false });
    mput('pine2', 3, 45.5, 0, { solid: false, autodoor: false });
    mput('pine', 9, 44.8, 0, { solid: false, autodoor: false });

    /* —— 谷地COLOSSEVM：斗兽场被街区贴身包裹 · 尼禄巨像 · 君士坦丁/提图斯双凯旋门 · 梅塔喷泉 —— */
    mput('amphi', 50, 16, 0, { s: .85 });
    mput('amphi', 50, 20, Math.PI, { s: .85 });
    mput('base2', 36, -2, 0, { solid: false, autodoor: false });
    mput('colossus', 36, -2, 1, { y: .4, s: .16, autodoor: false });
    mput('arch', 26, 25, 1.05, { s: .85 });
    mput('arch', 14, 12, 0.9, { s: .8 });
    mput('fountain2', 28, 10, 0, { autodoor: false });
    crowd(28, 16, 5, 7, seed + 'am');
    agoraStalls(30, 34, 5, 6, seed + 'as');

    /* —— CIRCVS MAXIMVS：卡帕拉丁/阿文丁之间 · SE端经Appia指向Capena门 —— */
    mput('circus', -8, 60, 0.59, { s: .8 });
    mput('base2', -22, 40, 0.59, { solid: false, autodoor: false });
    mput('base2', 6, 80, 0.59, { solid: false, autodoor: false });
    crowd(-30, 52, 5, 6, seed + 'cx');

    /* —— CAMPVS MARTIVS 墙外战神原：万神殿+日晷方尖碑+伊西斯庙 · 空旷校场感 —— */
    mput('oracle', -56, -54, 0, { s: .5, door: { side: 0, dist: 12, interior: 'hall', label: 'PANTHEON 万神殿' } });
    mcol('colCor', -60, -45, -52, -45, 3.5, { solid: false, autodoor: false });
    pondOrganic(-68, -62, 6, 5, seed + 'pq', { lotus: false, lantern: false });
    mput('torchMon', -72, -44, 0, { s: .45, solid: false, autodoor: false });                    /* 奥古斯都日晷方尖碑 */
    mput('sundial', -70, -41, 0, { solid: false, autodoor: false });
    mput('temple2', -64, -76, 0, { s: .9 });                                                     /* 伊西斯神庙 */
    godRow(['zeus', 'hera', 'athena'], -49, -38, 3.5, 0, 0);
    oliveGrove(-92, -84, 14, 8, seed + 'ho', ['olive', 'pine']);
    mput('colRuin', -88, -30, 0.4, { solid: false, autodoor: false });
    mput('colRuin', -86, -24, -0.3, { solid: false, autodoor: false });

    /* —— THERMAE+AQVA CLAVDIA：十五连拱自东南入城 于(74,60)跨墙低平段 终点接浴场 —— */
    mput('univ', 52, 46, 2.5, { s: .65, door: { side: 0, dist: 12, interior: 'inn', label: 'THERMAE 大浴场' } });
    mput('fountain', 42, 42, 0, { autodoor: false });
    aqueductRun(150, 116, 59, 49.6, 9);
    mput('colRuin2', 140, 128, 0.7, { solid: false, autodoor: false });
    mput('colRuin', 126, 120, -0.5, { solid: false, autodoor: false });
    mrow(['tree', 'pine'], 146, 108, -8.57, -6.29, 8, 0, { solid: false, autodoor: false });

    /* —— 凯里安/奎里纳莱条形台地小神庙 —— */
    var caeH = rockTerrace(48, 66, 20, 8, 2, 1.8, seed + 'cae');
    mput('temple', 48, 66, Math.PI / 2, { y: caeH, s: .65, autodoor: false });
    mput('well', 40, 71.5, 0, { solid: false, autodoor: false });
    mput('bench', 44, 72, 0, { solid: false, autodoor: false });
    var quiH = rockTerrace(11, -58, 22, 12, 2, 1.8, seed + 'qui');
    mput('temple', 11, -58, 3, { y: quiH, s: .7, autodoor: false });
    mput('base', 11, -47.5, 0, { solid: false, autodoor: false });
    mput('hermes', 11, -47.5, Math.PI, { y: .35, solid: false, autodoor: false });

    /* —— AVENTINVS：狄安娜神庙台地+阿尔忒弥斯像 —— */
    var aveH = rockTerrace(-34, 86, 30, 24, 2, 2, seed + 'ave');
    mput('temple3', -34, 86, 0.3, { y: aveH, s: .8, autodoor: false });
    mput('base', -25.5, 80, 0, { y: aveH, solid: false, autodoor: false });
    mput('artemis', -25.5, 80, 0.6, { y: aveH + .35, solid: false, autodoor: false });
    oliveGrove(-51, 68, 4, 4, seed + 'av2', ['pine', 'olive']);

    /* —— FORVM BOARIVM 牛市+河港：圆庙 · 波图努斯 · 大祭坛 · 码头系船 —— */
    mput('oracle', -29, 43, Math.PI / 2, { s: .3, autodoor: false });                            /* 赫拉克勒斯圆庙 */
    mput('temple2', -28, 29, Math.PI / 2, { s: .6 });                                            /* 波图努斯神庙 */
    mput('base', -22, 39, 0, { solid: false, autodoor: false });
    mput('hercules', -22, 39, -1.6, { y: .35, solid: false, autodoor: false });
    mput('campfire', -20.5, 41, 0, { solid: false, autodoor: false });
    mput('shopBox', -25, 35, 0.5, { solid: false, autodoor: false });
    mput('basket', -23, 36.5, 0.9, { solid: false, autodoor: false });
    mput('cart', -36, 42, 0.5, { solid: false, autodoor: false });
    mput('dock', -52, 44, -Math.PI / 2, { autodoor: false });
    mput('barrel', -49, 46, 0.4, { solid: false, autodoor: false });
    mput('jar', -48.5, 43, 0, { solid: false, autodoor: false });
    mput('basket', -50, 41, 0.8, { solid: false, autodoor: false });
    mput('fishboat', -60, 50, 1.2, { y: .42, s: .4, solid: false, autodoor: false, shadow: false });
    mput('rowboat', -62, 45, 0.9, { y: .42, s: .3, solid: false, autodoor: false, shadow: false });
    mput('palm', -42, 44, 0, { solid: false, autodoor: false });
    mput('palm2', -43.5, 39.5, 0, { solid: false, autodoor: false });

    /* —— CASTRA PRAETORIA 禁卫军营(城外东北) —— */
    mput('barracks', 104, -90, 2.2, { autodoor: false });
    mput('ballista', 97, -84, 2.2, { solid: false, autodoor: false });
    mput('tentBig', 112, -84, 2.4, { solid: false, autodoor: false });
    mput('tentSm', 108, -78, 1.8, { solid: false, autodoor: false });
    mput('campfire', 103, -81, 0, { solid: false, autodoor: false });
    mput('flag', 100, -87, 0, { solid: false, autodoor: false });

    /* —— 十五街区：墙内铺满到墙脚 · 苏布拉最密 · 墙外仅战神原稀疏带 —— */
    mblock(['house3', 'house2', 'house6', 'houseSlope'], 26, -46, 8, 6, 5.5, 5.5, seed + 'sub'); /* 苏布拉 */
    mblock(['house2f', 'house3', 'house5'], 24, -62, 5, 3, 5, 5, seed + 'vim');                  /* 维米纳莱谷 */
    mblock(['house', 'house3', 'houseGarden'], 74, -44, 5, 5, 5, 5.5, seed + 'esq');             /* 埃斯奎林 */
    mblock(['house2', 'house3', 'house6'], 34, -12, 6, 2, 5, 4.5, seed + 'car');                /* 卡里纳 */
    mblock(['house', 'house2', 'house3'], 72, 8, 3, 5, 5, 5.5, seed + 'cel');                    /* 卡厄利乌斯坡 */
    mblock(['house', 'house2', 'houseSlope', 'house6'], -12, 86, 5, 3, 5, 5, seed + 'avp');      /* 阿文丁平民区 */
    mblock(['shop', 'shop2', 'house2f'], -26, 14, 2, 3, 5, 5, seed + 'vel');                     /* 韦拉布鲁姆商业带 */
    mblock(['house3', 'house5', 'house2f'], -4, -48, 2, 3, 5, 5, seed + 'fla');                  /* 弗拉米尼亚坡地 */
    mblock(['house', 'house2', 'house4'], 74, -14, 4, 4, 5, 5, seed + 'ess');                    /* 埃斯奎林南坡 */
    mblock(['house2f', 'house3'], -10, -30, 2, 2, 5, 5, seed + 'flg');                           /* 弗拉米尼亚门坊 */
    mblock(['houseGarden', 'house'], -80, -40, 3, 3, 8, 8, seed + 'cam');                        /* 战神原稀疏带 */
    mblock(['house2', 'house3', 'houseSlope'], 62, -70, 5, 4, 5, 5.5, seed + 'ad1');                /* 奎里纳莱东北 */
    mblock(['house', 'house5'], 98, -52, 2, 4, 5, 5.5, seed + 'ad2');                            /* Esquilina门内侧 */
    mblock(['house', 'house2f', 'house2'], 26, 44, 3, 5, 5, 5, seed + 'ad3');                    /* 帕拉丁东坡 */
    mblock(['house', 'house3', 'house2'], 86, -16, 3, 7, 5, 5, seed + 'ad4');                    /* 东缘填充带 */
    mblock(['house', 'house2'], -18, 100, 3, 2, 5, 5, seed + 'ad5');                             /* 城南口袋 */
    mblock(['house2', 'house3'], -38, 62, 2, 3, 4.5, 5, seed + 'ad6');                           /* 河门内带 */
    mblock(['house2f', 'shop'], -17, 26, 2, 3, 5, 5, seed + 'ad7');                              /* 韦拉布鲁姆东 */
    mblock(['house', 'house4'], 38, 52, 2, 2, 5, 5, seed + 'ad8');                               /* 浴场西 */
    mblock(['house2', 'house'], 8, 64, 2, 2, 5, 4, seed + 'ad9');                                /* 卡佩纳门内 */
    mblock(['house3', 'house2'], 14, 44, 2, 2, 5, 4, seed + 'adA');                              /* 帕拉丁东南脚 */
    mblock(['house2', 'house6'], 26, -70, 4, 1, 5, 5, seed + 'adB');                             /* 北墙内沿 */
    mblock(['house3', 'houseSlope'], 46, -56, 3, 2, 5, 4, seed + 'adC');                         /* 苏布拉北 */

    /* —— 石松只成行成簇 · 城郊农庄带 —— */
    mrow(['tree', 'pine2'], 40, 81, 5, 8, 7, 0, { solid: false, autodoor: false });              /* Appia东列 */
    mrow(['tree', 'pine2'], 28, 88, 5, 8, 7, 0, { solid: false, autodoor: false });              /* Appia西列 */
    mput('farm', 118, 96, 0.2); mput('house', 109, 90, 0.4); mput('vineyard', 130, 84, -0.3);
    mput('silo', 112, 108, 0.5); mput('granary', 58, 124, 0.3);
    mput('hay', 96, 104, 0.5, { solid: false, autodoor: false });
    mput('straw', 88, 112, -0.4, { solid: false, autodoor: false });
    mput('farm', -56, -120, 0.1); mput('houseGarden', -47, -116, 0.3);
    mrow(['fruitTree'], -48, -100, -1, -10, 5, 0, { solid: false, autodoor: false });
    mput('watermill', -94, -6, -Math.PI / 2, { solid: false, autodoor: false });
    mput('sawmill', -90, -118, 0.6);
    oliveGrove(128, -56, 13, 7, seed + 'h2', ['olive', 'olive', 'pine']);
    mput('houseGarden', 114, -44, 0.3); mput('houseGarden', 122, -42, -0.4); mput('houseGarden', 130, -46, 0.7);

    for (var c = 0; c < 6; c++) cloud((c - 2.5) * 56, 74 + c * 4, -60 + c * 36, 3, seed + c);
    placePlayer(4, 5, Math.PI);
    hudCity(st, 'ROMA');
  }


  /* ═════════ 沙漠营造 · 程序件（金字塔/方尖碑/塔门） ═════════ */
  function sdMat(c){ return new T.MeshLambertMaterial({ color: c, flatShading: true }); }
  function pyramid(cx, cz, base, h, c) {
    var g = new T.Mesh(new T.ConeGeometry(base * 0.7071, h, 4, 1), sdMat(c || 0xd9c28c));
    g.rotation.y = Math.PI / 4; g.position.set(cx, h / 2, cz);
    g.castShadow = true; g.receiveShadow = true; Z.scene.add(g); return g;
  }
  function obelisk(cx, cz, h, c) {
    var grp = new T.Group();
    var shaft = new T.Mesh(new T.CylinderGeometry(h * .045, h * .075, h * .86, 4, 1), sdMat(c || 0xdcc48f));
    shaft.rotation.y = Math.PI / 4; shaft.position.y = h * .43; grp.add(shaft);
    var tip = new T.Mesh(new T.ConeGeometry(h * .045 * 1.42, h * .14, 4, 1), sdMat(0xc9a227));
    tip.rotation.y = Math.PI / 4; tip.position.y = h * .93; grp.add(tip);
    grp.position.set(cx, 0, cz); grp.traverse(function (o) { o.castShadow = true; });
    Z.scene.add(grp); return grp;
  }
  function pylonGate(cx, cz, w, h, ry, c) {
    var grp = new T.Group(), mm = sdMat(c || 0xd3b57e);
    function tower(off) {
      var geo = new T.CylinderGeometry(w * .16, w * .22, h, 4, 1);
      var m = new T.Mesh(geo, mm); m.rotation.y = Math.PI / 4;
      m.scale.z = 0.55; m.position.set(off, h / 2, 0); grp.add(m);
    }
    tower(-w / 2); tower(w / 2);
    var lin = new T.Mesh(new T.BoxGeometry(w * .58, h * .16, w * .12), mm);
    lin.position.y = h * .8; grp.add(lin);
    grp.position.set(cx, 0, cz); grp.rotation.y = ry || 0;
    grp.traverse(function (o) { o.castShadow = true; o.receiveShadow = true; });
    Z.scene.add(grp); return grp;
  }
  function sd(nm, x, z, ry, opts) {
    opts = opts || {}; opts.x = x; opts.z = z; opts.ry = ry || 0;
    return spawn('desert', nm, null, opts);
  }
  function sdRing(R, seed) {  /* 沙丘围场 + 远山背幕 */
    var r = rng('sr' + seed);
    for (var a = 0; a < Math.PI * 2; a += .5 + r() * .35) {
      var d = R * (0.94 + r() * .1);
      /* 沙丘定标：以棕榈（高 5）与民居（宽 4.2、高 13）为尺。原倍率 0.8~1.7 出来是
         宽 35~71、高 10——一道沙丘比整个街区还宽、跟房子一样高，站在城里像被土墙围住。
         降到 0.30~0.62：宽 13~26、高约 4，比棕榈略矮、几栋房子那么宽，才是沙丘该有的样子。 */
      sd('SD_Hill_0' + (1 + (r() * 5 | 0)), Math.cos(a) * d, Math.sin(a) * d, r() * 6.28, { solid: false, autodoor: false, s: .16 + r() * .17 });
    }
    for (var i = 0; i < 10; i++) {
      /* 远山：原先倍率 1.5~2.8 又摆在 R*1.15~1.45，等于把 26 米高的山头堆在城墙外一步，
         抬头全是山。改为缩到 0.80~1.45 并推到 R*1.55~2.05——山还在，但退成地平线上的一道脊，
         视觉上给城池让出天空。 */
      var aa = Math.PI * (.62 + i * .09 + r() * .05), dd = R * (1.55 + r() * .5);
      var big = (r() < .4 ? 'SD_Plateau_0' + (1 + (r() * 5 | 0)) : ('SD_Mt_' + ('0' + (1 + (r() * 10 | 0))).slice(-2)));
      sd(big, Math.cos(aa) * dd, Math.sin(aa) * dd, r() * 6.28, { solid: false, autodoor: false, s: .53 + r() * .43 });
    }
  }
  function sdPalms(cx, cz, rad, n, seed) {
    var r = rng('sp' + seed);
    for (var i = 0; i < n; i++) {
      var a = r() * 6.28, d = Math.sqrt(r()) * rad;
      sd(r() < .8 ? 'SD_Palm' : 'SD_Tree', cx + Math.cos(a) * d, cz + Math.sin(a) * d, r() * 6.28, { solid: false, autodoor: false, s: .8 + r() * .5 });
    }
  }
  var SD_HOUSES = ['SD_House_01','SD_House_02','SD_House_03','SD_House_04','SD_House_05','SD_House_06','SD_House_07','SD_House_08','SD_Small_01','SD_Small_02','SD_Small_03','SD_Small_04','SD_Tiny_01'];
  function sdBlock(cx, cz, cols, rows, dx, dz, seed) {
    var r = rng('sb' + seed);
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var nm = SD_HOUSES[(r() * SD_HOUSES.length) | 0];
      sd(nm, cx + i * dx + (r() - .5) * 2.5, cz + j * dz + (r() - .5) * 2.5, ((r() * 4) | 0) * Math.PI / 2 + (r() - .5) * .2, { shadow: true });
    }
  }
  /* 通用：草原斡耳朵营地（毡帐环 + 金帐居中；steppe 包缺席时以沙漠民居降级） */
  function medSteppe(locName, palKey, seedKey) {
    var st = medSt(palKey || 'steppe'), R = 112, seed = seedKey || locName;
    var r = rng('stp' + seed);
    newScene(0xcfe2ec, 0xbfcf9a, 150, 620, Z.night);
    var paths = [
      { w: 5, pts: [[0, R * .8], [2, 12], [0, -R * .7]] },
      { w: 3, pts: [[-R * .6, 6], [0, 2], [R * .6, 10]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 2, rx: 14, rz: 11, stone: false }], []);
    var ordo = spawn('steppe', 'ST_Ordo', null, { x: 0, z: -14, ry: Math.PI, shadow: true, s: 2.1, door: { side: 0, dist: 7.5, interior: 'ger', label: '金帐' } });
    if (!ordo) sd('SD_Large_01', 0, -14, Math.PI, { shadow: true });
    for (var ring = 1; ring <= 3; ring++) {
      var n = 6 + ring * 5, rad = 20 * ring + 8;
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2 + r() * .22, d = rad * (0.9 + r() * .18);
        var gx = Math.cos(a) * d, gz = Math.sin(a) * d - 4;
        /* 三种毡帐混编：ST_Ger 高顶素毡帐、ST_Ger2 矮宽挂毯毡帐、ST_Ger3 哈萨克白毡帐。
           三个模型出自不同作者，轮廓与花纹都不一样，营地才不是一个模子印出来的。
           哈萨克那顶面数最高（5.8万），压在四分之一以内，不让它把帧率吃光。 */
        var pick = r();
        /* 哈萨克那顶 5.8 万面，是另外两顶的三到九倍：低配机上把它压到一成以内，
           免得一个营地就把三角形预算吃干净。 */
        var kz = (function(){try{return PERF.low?.08:.25;}catch(_){return .12;}})();
        var nm = pick < kz ? 'ST_Ger3' : (pick < kz + .35 ? 'ST_Ger2' : 'ST_Ger');
        var g = spawn('steppe', nm, null,
          { x: gx, z: gz, ry: a + Math.PI / 2, shadow: true,
            s: nm === 'ST_Ger2' ? (.92 + r() * .45) : (.85 + r() * .4),
            door: { side: 0, interior: 'ger', label: '毡帐' } });
        if (!g && ring < 3 && r() < .6) sd('SD_Small_0' + (1 + (r() * 4 | 0)), gx, gz, a, { shadow: true });
      }
    }
    sd('SD_Well', 9, 10, 0, { solid: false });
    agoraStalls(-2, 14, 12, 9, seed + 'ag');
    mput('cart', 14, 18, .4, { solid: false, autodoor: false });
    placePlayer(0, 42, Math.PI);
    hudCity(st, locName);
  }
  /* 通用：沙漠城邦（尼罗河镇/绿洲市集/荒漠隘口通用） */
  function medDesert(locName, palKey, seedKey) {
    var st = medSt(palKey || 'aegypt'), R = 118, seed = seedKey || locName;
    var r = rng('sd' + seed);
    newScene(0xcfe2ec, 0xead9a8, 150, 620, Z.night);
    var paths = [
      { w: 6, pts: [[0, R * .8], [-3, 26], [2, -12], [0, -R * .7]] },
      { w: 4, pts: [[-R * .68, 8], [0, 4], [R * .68, 12]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 6, rx: 16, rz: 12, stone: true }], []);
    sdRing(R, seed);
    /* 市集心脏：巴扎 + 水井 + 摊列 */
    sd('SD_Bazaar', 0, -8, Math.PI, { shadow: true, s: 1.15 });
    sd('SD_Well', 7, 8, 0, { solid: false });
    agoraStalls(0, 10, 13, 12, seed + 'ag');
    sd('SD_Monument', -14, -2, 0, { shadow: true, s: .9 });
    /* 民居坊 ×3 + 地标塔楼/大宅 */
    sdBlock(-46, 30, 3, 2, 13, 12, seed + 'b1');
    sdBlock(20, 44, 3, 2, 13, 12, seed + 'b2');
    sdBlock(-38, -66, 3, 2, 13, 12, seed + 'b3');
    sd('SD_Large_01', 34, -30, -Math.PI / 2, { shadow: true });
    sd('SD_Tall_0' + (1 + (r() * 3 | 0)), 44, -46, Math.PI, { shadow: true });
    /* 绿洲与椰枣园 */
    sdPalms(-6, 66, 16, 12, seed + 'p1');
    sdPalms(36, -70, 13, 8, seed + 'p2');
    palmRow(-58, -20, 10, 0, 5, seed + 'pr');
    if (palKey === 'aegypt') { obelisk(0, -30, 9); pylonGate(0, -44, 16, 9, 0); }
    mput('cart', 10, 16, 0.5, { solid: false, autodoor: false });
    placePlayer(0, 38, Math.PI);
    hudCity(st, locName);
  }
  /* MEMPHIS：白墙之城 · 卜塔神庙塔门 · 萨卡拉金字塔天际线 */
  function medMemphis() {
    var st = medSt('aegypt'), R = 132, seed = 'mem';
    var r = rng(seed);
    newScene(0xd2e4ee, 0xead9a8, 150, 660, Z.night);
    var paths = [
      { w: 7, pts: [[0, R * .8], [0, 20], [0, -R * .75]] },
      { w: 4, pts: [[-R * .7, 0], [0, 8], [R * .7, 6]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: -6, rx: 18, rz: 13, stone: true }], []);
    sdRing(R, seed);
    /* 萨卡拉方向：地平线金字塔群（西南） */
    pyramid(-108, -96, 40, 26); pyramid(-84, -116, 26, 17); pyramid(-128, -70, 20, 13);
    /* 白墙围城（内城） */
    cityWall([[-56, -52], [56, -52], [56, 52], [-56, 52]], { h: 6, th: 2.2, towerEvery: 26, gateS: .85, gateGap: 7 });
    /* 卜塔大神庙轴线 */
    pylonGate(0, -46, 20, 11, 0);
    obelisk(-7, -38, 8); obelisk(7, -38, 8);
    mcol('colCor', -10, -28, 10, -28, 5, { solid: false, autodoor: false });
    mput('temple', 0, -18, 0, { s: 1.15, shadow: true });
    /* 城内坊市 */
    sd('SD_Bazaar', 16, 18, Math.PI / 2, { shadow: true });
    sd('SD_Well', 6, 26, 0, { solid: false });
    agoraStalls(12, 24, 11, 10, seed + 'ag');
    sdBlock(-44, 8, 3, 2, 12, 11, seed + 'h1');
    sdBlock(-44, -34, 3, 2, 12, 11, seed + 'h2');
    sdBlock(26, -20, 2, 3, 12, 11, seed + 'h3');
    sd('SD_Large_01', 36, 40, Math.PI, { shadow: true });
    /* 城外椰枣园（尼罗河谷侧＝东） */
    sdPalms(84, 24, 20, 14, seed + 'p1');
    sdPalms(78, -40, 16, 10, seed + 'p2');
    placePlayer(0, 40, Math.PI);
    hudCity(st, 'MEMPHIS');
  }
  /* 「开罗」建于公元 969 年，比艳后晚整整一千年，本线不该出现这个名字。
     但 AI 偶尔会顺手写今名，那时与其落回拉丁模板，不如落到这块地界上真正的古城——
     孟菲斯。所以别名留着兜底，城名牌一律显示 MEMPHIS，玩家看不到今名。 */
  function medCairo() { medMemphis(); }
  /* ══════════ 托勒密埃及诸城（艳后在世的前 69–前 30 年实景） ══════════
     旧名录是罗马线的地中海城表，埃及只有孟菲斯/底比斯两座，还混着一个开罗——
     开罗建于公元 969 年，比艳后晚一千年。这一段按考古与斯特拉波的记载补齐
     艳后治下真正存在的城池；凡罗马时期才有的东西（菲莱的图拉真亭、哈德良门，
     贝鲁西亚的六世纪大堡与剧场，贝勒尼基的罗马街网）一律不建。 */

  /* PHILAE 菲莱：整座花岗岩岛被一座神庙填满，从空中看像一条石船。
     南端登岸 → 前庭双列柱（东西不等长）→ 一塔门（前有双方尖碑，浮雕刻的正是
     艳后之父托勒密十二世）→ 内院（西为诞生殿）→ 二塔门（刻意与一塔门不平行，
     这道歪轴是菲莱最好认的特征）→ 多柱厅 → 圣殿。前 30 年它是个新工地：
     三分之二以上的石头是托勒密朝新凿的，漆色未褪。 */
  function medPhilae() {
    var st = medSt('aegypt'), R = 120, seed = 'phl';
    var r = rng(seed);
    newScene(0xc9e2f0, 0xe7d9a6, 140, 620, Z.night);
    var paths = [{ w: 6, pts: [[0, 86], [0, 10], [-4, -70]] }];
    addGround(st, R, paths, [{ x: 0, z: 22, rx: 13, rz: 9, stone: true }], []);
    /* 河水绕岛：这里是第一瀑布上缘，水面碎石嶙峋 */
    seaField(0, 150, 460, 190, 0x2f7fa8); seaField(0, -170, 460, 180, 0x2f7fa8);
    seaField(-190, 0, 170, 360, 0x2f7fa8); seaField(190, 0, 170, 360, 0x2f7fa8);
    shoreLine(96, -96, 96, seed + 'a');
    for (var i = 0; i < 16; i++) {           /* 瀑布区的黑花岗巨砾 */
      var a = r() * 6.28, d = 132 + r() * 54;
      rock(Math.cos(a) * d, Math.sin(a) * d, 1.6 + r() * 2.6, seed + 'bo' + i);
    }
    /* 岸壁与登岸石阶（岛缘是砌起来的码头墙） */
    for (i = -5; i <= 5; i++) mput('stairs', i * 9, 88, 0, { s: .8, solid: false, autodoor: false });
    mput('temple3', 0, 74, Math.PI, { s: .8, shadow: true });     /* 涅克塔内布前亭 */
    /* 前庭：东列柱长、西列柱短——两侧本就不等，别对称 */
    mcol('colCor', -13, 66, -13, 26, 7, { solid: false, autodoor: false });
    mcol('colCor', 14, 62, 14, 26, 6, { solid: false, autodoor: false });
    mput('temple2', 26, 52, -1.5, { s: .62, shadow: true });      /* 阿伦斯努菲斯庙 */
    mput('temple2', 27, 34, -1.5, { s: .5, shadow: true });       /* 曼杜利斯小祠 */
    /* 一塔门：宽 45.5m 高 18m，门前双方尖碑各高约 13m */
    pylonGate(0, 18, 22, 12, 0);
    obelisk(-8, 27, 9); obelisk(8, 27, 9);
    /* 内院：西侧诞生殿（哈托尔柱头），东侧列柱带小室（藏书室、香料房） */
    mput('temple2', -16, 2, 0.1, { s: .78, shadow: true });
    mcol('colCor', 13, 10, 13, -8, 4, { solid: false, autodoor: false });
    /* 二塔门：刻意偏轴——菲莱的两道塔门在实地就不平行 */
    pylonGate(-3, -12, 18, 11, 0.17);
    mput('temple', -4, -34, 0.17, { s: 1.05, shadow: true, door: { side: 0, dist: 12, interior: 'temple', label: 'ISIS 伊西斯圣殿' } });
    mput('temple3', 22, -46, -0.5, { s: .66, shadow: true });     /* 哈托尔庙（东北缘） */
    /* 西邻比加岛：更陡更荒，奥西里斯之墓所在，不可登 */
    rockTerrace(-150, -24, 60, 46, 3, 4.2, seed + 'bg');
    mput('colossus', -138, -18, 0.7, { y: 8, s: .12, autodoor: false });
    sdPalms(56, 62, 14, 8, seed + 'p');
    placePlayer(0, 78, Math.PI);
    hudCity(st, 'PHILAE');
  }

  /* EDFV 埃德富：荷鲁斯大庙。前 57 年刚刚竣工——艳后登基前六年的新建筑，
     是全埃及保存最好的一座。形制单纯：塔门 → 柱廊庭院 → 两进多柱厅 → 圣殿，
     外面一圈厚砖围墙把神庙整个箍住，门前一对花岗岩隼鹰。 */
  function medEdfu() {
    var st = medSt('aegypt'), R = 126, seed = 'edf';
    newScene(0xd4e6ef, 0xecdaa8, 150, 640, Z.night);
    var paths = [
      { w: 7, pts: [[0, R * .8], [0, 4], [0, -R * .6]] },
      { w: 4, pts: [[-R * .62, 30], [0, 26], [R * .62, 30]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 30, rx: 16, rz: 11, stone: true }], []);
    sdRing(R, seed);
    /* 神庙围墙：埃德富的围墙几乎贴着庙身，是它最醒目的轮廓 */
    cityWall([[-46, -58], [46, -58], [46, 24], [-46, 24]], { h: 7, th: 2.4, towerEvery: 30, gateS: .9, gateGap: 7 });
    pylonGate(0, 20, 21, 13, 0);
    mput('statue', -8, 30, 0, { s: 1.1, solid: false, autodoor: false });   /* 隼鹰像 */
    mput('statue', 8, 30, 0, { s: 1.1, solid: false, autodoor: false });
    mcol('colCor', -15, 10, -15, -12, 5, { solid: false, autodoor: false });
    mcol('colCor', 15, 10, 15, -12, 5, { solid: false, autodoor: false });
    mput('temple', 0, -22, 0, { s: 1.2, shadow: true, door: { side: 0, dist: 12, interior: 'temple', label: 'HORVS 荷鲁斯圣殿' } });
    mput('temple2', 0, -44, 0, { s: .72, shadow: true });
    /* 庙外市镇：泥砖民居与作坊压在旧丘上 */
    sdBlock(-70, 44, 3, 3, 12, 11, seed + 'h1');
    sdBlock(62, 40, 3, 2, 12, 11, seed + 'h2');
    sd('SD_Bazaar', -18, 56, Math.PI / 2, { shadow: true });
    sd('SD_Well', 14, 58, 0, { solid: false });
    agoraStalls(-14, 62, 10, 9, seed + 'ag');
    sdPalms(84, -20, 18, 12, seed + 'p1');
    placePlayer(0, 74, Math.PI);
    hudCity(st, 'EDFV');
  }

  /* DENDERA 丹达腊：哈托尔神庙。前 54 年动工，艳后本人与凯撒里昂的浮雕就刻在
     神殿后墙外壁上——全埃及唯一一处艳后本人的大型神庙浮雕。庙区有围墙、
     诞生殿、圣湖（方形石砌水池，四角有梯）。 */
  function medDendera() {
    var st = medSt('aegypt'), R = 124, seed = 'dnd';
    newScene(0xd6e7f0, 0xebd8a6, 150, 640, Z.night);
    var paths = [{ w: 7, pts: [[0, R * .78], [0, 6], [0, -R * .55]] },
                 { w: 4, pts: [[-R * .6, 34], [R * .6, 30]] }];
    addGround(st, R, paths, [{ x: 0, z: 34, rx: 15, rz: 10, stone: true }], []);
    sdRing(R, seed);
    cityWall([[-54, -50], [54, -50], [54, 30], [-54, 30]], { h: 6.5, th: 2.6, towerEvery: 32, gateS: .9, gateGap: 7 });
    pylonGate(0, 26, 20, 12, 0);
    mput('temple', 0, -10, 0, { s: 1.3, shadow: true, door: { side: 0, dist: 13, interior: 'temple', label: 'HATHOR 哈托尔圣殿' } });
    /* 后墙外壁：艳后与凯撒里昂的浮雕就在这一面 */
    mput('colossus', -7, -30, 0, { y: 1.2, s: .11, autodoor: false });
    mput('colossus', 7, -30, 0, { y: 1.2, s: .11, autodoor: false });
    mput('temple2', -30, 8, 0.2, { s: .7, shadow: true });        /* 诞生殿 */
    /* 圣湖：方池，四角石阶 */
    seaField(34, 6, 30, 26, 0x2f6f8c);
    for (var q = 0; q < 4; q++)
      mput('stairs', 34 + (q < 2 ? -13 : 13), 6 + (q % 2 ? -11 : 11), q * 1.57, { s: .7, solid: false, autodoor: false });
    sdBlock(-74, 50, 3, 2, 12, 11, seed + 'h1');
    sd('SD_Bazaar', 22, 54, Math.PI / 2, { shadow: true });
    sdPalms(80, 30, 16, 10, seed + 'p');
    placePlayer(0, 70, Math.PI);
    hudCity(st, 'DENDERA');
  }

  /* PELVSIVM 贝鲁西亚：埃及东北门户，不是神庙城而是泥泞里的要塞港。
     名字本义就是「泥」。两条尼罗河汊夹着它，四周盐沼，港口正在淤死。
     标志物是一座直径约 35 米的圆形礼水池，池心方台立着城神像（前 2 世纪起启用）。
     庞培就是在这里的沙滩上被杀的（前 48 年）。六世纪那座三十六塔大堡与罗马剧场
     都不属于这个年代，不建。 */
  function medPelusium() {
    var st = medSt('aegypt'), R = 132, seed = 'pls';
    var r = rng(seed);
    newScene(0xc6dae4, 0xdfd6b4, 130, 600, Z.night);
    var paths = [
      { w: 8, pts: [[-R * .9, -18], [0, -14], [R * .9, -22]] },   /* 西赴三角洲 / 东走西奈海岸道 */
      { w: 5, pts: [[-10, R * .8], [-6, -14], [0, -R * .6]] }
    ];
    addGround(st, R, paths, [{ x: -6, z: -14, rx: 15, rz: 10 }], []);
    /* 泻湖与河汊：城被水包着，地是软盐泥 */
    seaField(0, 150, 420, 160, 0x3d7f92);
    seaField(-150, -10, 120, 300, 0x3d7f92);
    seaField(150, 20, 110, 300, 0x3d7f92);
    shoreLine(92, -140, 140, seed + 's');
    /* 泥砖城圈：这个年代只有朴素的砖墙与方塔，没有石构大堡 */
    cityWall([[-72, -56], [72, -56], [80, 20], [56, 62], [-56, 62], [-80, 20]], { h: 5.5, th: 2.8, towerEvery: 22, gateS: .8, gateGap: 6.5 });
    /* 圆形礼水池：直径约 35m，池心方台供城神佩鲁西乌斯像 */
    seaField(26, 18, 34, 34, 0x37718a);
    mput('base2', 26, 18, 0, { s: 1.5, solid: false, autodoor: false });
    mput('statue', 26, 18, 0, { y: 2.2, s: 1.15, solid: false, autodoor: false });
    for (var q = 0; q < 6; q++) {
      var qa = q * 1.047;
      mput('colPlain', 26 + Math.cos(qa) * 21, 18 + Math.sin(qa) * 21, 0, { s: .8, solid: false, autodoor: false });
    }
    /* 驻军与关卡：这里是王国收关税、扣商队的地方 */
    mput('barracks', -44, -34, 0, { s: 1.2, shadow: true });
    mput('barracks2', -20, -38, 0, { s: 1.1, shadow: true });
    mput('watchtower', 66, -46, 0, { s: 1.1 });
    mput('gate', -6, -55, 0, { s: 1, autodoor: false });
    /* 河港：仓房、双耳瓶堆、系泊小船——是个杂乱的实用港，没有石构天际线 */
    mput('granary', -34, 44, 0, { s: 1.15, shadow: true });
    mput('granary', -12, 48, 0, { s: 1.05, shadow: true });
    mput('silo', 8, 46, 0, { s: 1 });
    for (var i = 0; i < 14; i++) mput('jar', -30 + i * 5.5, 58 + (i % 3) * 3.5, r() * 6.28, { s: .9, solid: false, autodoor: false });
    mput('dock', -20, 74, 0, { autodoor: false }); mput('dock', 16, 76, 0, { autodoor: false });
    shipRoute('fishboat', [[-90, 96], [-10, 88], [70, 94], [0, 108]], 1.8);
    shipRoute('sail2', [[110, 100], [10, 92], [-110, 100], [0, 118]], 2.4);
    sdBlock(-60, 30, 3, 2, 12, 11, seed + 'h1');
    sdBlock(40, -20, 2, 3, 12, 11, seed + 'h2');
    sd('SD_Bazaar', 4, 34, Math.PI / 2, { shadow: true });
    /* 东望卡西乌斯山：地平线上一道苍白的沙脊，塞尔波尼斯湖在其北 */
    for (i = 0; i < 7; i++)
      sd('SD_Hill_0' + (1 + (i % 5)), R * 1.5 + i * 12, -70 + i * 22, r() * 6.28, { solid: false, autodoor: false, s: .3 + r() * .2 });
    placePlayer(-6, 54, Math.PI);
    hudCity(st, 'PELVSIVM');
  }

  /* PTOLEMAIS 托勒密城：托勒密一世按亚历山卓的样子建在上埃及，是全埃及仅三座
     希腊城邦之一。斯特拉波说它「与孟菲斯等大」，是底比斯被劫（前 88 年）之后
     整个上埃及最兴旺的城。特征是希腊正交街网 + 石砌剧场 + 议事厅，
     旁边留着原来的埃及村子（普索伊）当本地人街区——跟亚历山卓的拉科蒂斯一个道理。
     实地只剩土丘和一截码头，所以这座是有据可依的复原，不是实测。 */
  function medPtolemais() {
    var st = medSt('aegypt'), R = 148, seed = 'ptl';
    newScene(0xcfe3ef, 0xe8dcb0, 150, 660, Z.night);
    /* 希腊棋盘：主街东西向，纵街等距——与埃及城的自由生长形成对照 */
    var paths = [
      { w: 10, pts: [[-R * .9, -6], [R * .9, -6]] },
      { w: 6, pts: [[-56, -R * .8], [-56, R * .75]] },
      { w: 6, pts: [[0, -R * .8], [0, R * .75]] },
      { w: 6, pts: [[56, -R * .8], [56, R * .75]] },
      { w: 4, pts: [[-R * .85, 44], [R * .85, 44]] },
      { w: 4, pts: [[-R * .85, -52], [R * .85, -52]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: -6, rx: 24, rz: 15, stone: true }], []);
    sdRing(R, seed);
    cityWall([[-104, -70], [104, -70], [116, -6], [104, 62], [-104, 62], [-116, -6]], { h: 6, th: 2.4, towerEvery: 30, gateS: .85, gateGap: 7 });
    /* 阿哥拉：议事厅（布勒）、集会场、王朝崇拜坛 */
    mput('senate', -22, -26, 0, { s: 1.25, shadow: true, door: { side: 0, dist: 12, interior: 'study', label: 'BOVLE 议事厅' } });
    mput('altarStone', 0, -20, 0, { s: 1.1, solid: false, autodoor: false });
    agoraStalls(6, 4, 16, 14, seed + 'ag');
    godRow(['zeusSeat', 'hermes', 'athena'], -14, 12, 14, 0, Math.PI);
    /* 石砌剧场：上埃及出现一座希腊剧场，是这座城最扎眼的东西 */
    mput('amphi', 58, -34, Math.PI, { s: 1.3, shadow: true });
    /* 希腊神庙：宙斯与狄俄尼索斯 */
    mput('parthenon', -60, -30, 0, { s: .95, shadow: true, door: { side: 0, dist: 12, interior: 'temple', label: 'ZEVS 宙斯庙' } });
    mput('temple2', -62, 20, 0, { s: .9, shadow: true });
    /* 伊西斯庙：有庙无庇护权——托勒密城的伊西斯庙不享避难特权 */
    mput('temple3', 40, 26, 0, { s: .85, shadow: true });
    /* 西岸尼罗河：石砌码头是这里唯一留到今天的实物 */
    seaField(0, 150, 460, 150, 0x2f7fa8);
    shoreLine(98, -130, 130, seed + 'q');
    for (var i = -4; i <= 4; i++) mput('stairs', i * 16, 96, 0, { s: .85, solid: false, autodoor: false });
    mput('dock', -40, 112, 0, { autodoor: false }); mput('dock', 34, 114, 0, { autodoor: false });
    shipRoute('sail2', [[-140, 128], [0, 120], [140, 130], [0, 142]], 2.6);
    /* 普索伊：原来的埃及村子，街是弯的，房是泥砖的 */
    sdBlock(-88, 34, 3, 3, 11, 10, seed + 'e1');
    sdBlock(-64, 48, 2, 2, 11, 10, seed + 'e2');
    sd('SD_Bazaar', -74, 12, Math.PI / 2, { shadow: true });
    sd('SD_Well', -56, 30, 0, { solid: false });
    sdPalms(96, 46, 18, 12, seed + 'p');
    placePlayer(0, 70, Math.PI);
    hudCity(st, 'PTOLEMAIS');
  }

  /* SYENE·ELEPHANTINE 阿斯旺与象岛：王国的南界，第一瀑布的咽喉。
     河在这里被黑花岗巨砾劈成几股；象岛南端是克努姆神庙区（涅克塔内布二世
     大加扩建的那一版），岛缘切进河岸的石阶竖井是尼罗水尺——量水位、定税额。
     东岸的塞伊尼此时才是行政与驻军所在，岛上反而在慢慢缩。
     东南的采石场里躺着那根未完成的方尖碑：长约 42 米，三面还连着基岩。 */
  function medSyene() {
    var st = medSt('aegypt'), R = 134, seed = 'syn';
    var r = rng(seed);
    newScene(0xcfe4f1, 0xe9d7a2, 145, 640, Z.night);
    var paths = [
      { w: 7, pts: [[52, R * .8], [56, 0], [50, -R * .7]] },      /* 东岸塞伊尼的主街 */
      { w: 4, pts: [[10, 34], [56, 30]] }
    ];
    addGround(st, R, paths, [{ x: 56, z: 12, rx: 14, rz: 10, stone: true }], []);
    /* 河与瀑布：巨砾满河，水分成几股 */
    seaField(-14, 0, 120, 420, 0x2f7fa8);
    for (var i = 0; i < 26; i++) {
      var bx = -70 + r() * 116, bz = -190 + r() * 380;
      rock(bx, bz, 1.4 + r() * 2.8, seed + 'bo' + i);
    }
    shoreLine(0, 30, 40, seed + 'sh');
    /* 象岛：南端庙区 + 高台上的旧庙 + 两处尼罗水尺石阶 */
    mput('temple', -46, -40, 0.1, { s: 1.15, shadow: true, door: { side: 0, dist: 12, interior: 'temple', label: 'KHNVM 克努姆圣殿' } });
    pylonGate(-46, -18, 17, 10, 0.1);
    mput('temple3', -58, -66, 0.2, { s: .7, shadow: true });      /* 高台上的萨蒂特庙 */
    rockTerrace(-58, -66, 26, 20, 2, 3.2, seed + 'tr');
    for (i = 0; i < 6; i++) mput('stairs', -32 - i * 1.6, -58 + i * 5, 1.6, { s: .8, solid: false, autodoor: false });  /* 水尺竖井 */
    for (i = 0; i < 5; i++) mput('stairs', -34 - i * 1.4, -6 + i * 4.5, 1.6, { s: .75, solid: false, autodoor: false });
    pyramid(-64, -96, 9, 7);                                       /* 三王朝小阶梯金字塔残迹 */
    sdBlock(-52, -8, 2, 2, 11, 10, seed + 'i1');
    /* 东岸塞伊尼：驻军、关卡、伊西斯小庙——努比亚商路的收税口 */
    mput('barracks', 70, -22, 0, { s: 1.15, shadow: true });
    mput('watchtower', 84, -44, 0, { s: 1.05 });
    mput('temple2', 44, -14, -0.2, { s: .72, shadow: true });
    sd('SD_Bazaar', 62, 26, Math.PI / 2, { shadow: true });
    sd('SD_Well', 48, 36, 0, { solid: false });
    agoraStalls(60, 34, 11, 10, seed + 'ag');
    sdBlock(74, 14, 3, 2, 12, 11, seed + 'h1');
    sdBlock(70, 52, 3, 2, 12, 11, seed + 'h2');
    mput('dock', 34, 56, 0, { autodoor: false }); mput('dock', 30, -54, 0, { autodoor: false });
    shipRoute('fishboat', [[-10, 120], [-20, 20], [-10, -120], [10, 0]], 1.7);
    /* 东南采石场：开凿面、碎石堆、下河的滑道，还有那根躺着的未完成方尖碑 */
    rockTerrace(112, 74, 54, 40, 3, 4.6, seed + 'qa');
    var unf = new T.Mesh(new T.BoxGeometry(4.2, 3.4, 40), sdMat(0xb5896a));
    unf.position.set(104, 1.7, 60); unf.rotation.y = 0.5; unf.castShadow = true; Z.scene.add(unf);
    natReg(unf, '未竟方尖碑');
    for (i = 0; i < 9; i++) rock(120 + r() * 40, 50 + r() * 54, 0.8 + r() * 1.5, seed + 'qr' + i);
    sdPalms(20, 78, 14, 8, seed + 'p');
    placePlayer(58, 46, Math.PI);
    hudCity(st, 'SYENE');
  }

  /* NAVCRATIS 瑙克拉提斯：埃及仅三座希腊城邦之一，但生意早被亚历山卓抢光。
     最强的形状是南边那圈巨大的泥砖大围场（约 480×390 米，阿蒙拉圣域），
     北边则挤着一堆小小的希腊神庙与「希腊人之家」——九个东希腊城邦合建的会馆。
     活水在西边（卡诺珀斯河汊此时已移到城西），码头也在西。 */
  function medNaukratis() {
    var st = medSt('aegypt'), R = 138, seed = 'nkr';
    newScene(0xd0e4ee, 0xe6dcb2, 145, 640, Z.night);
    var paths = [
      { w: 8, pts: [[-72, R * .78], [-64, 0], [-58, -R * .7]] },
      { w: 5, pts: [[-R * .8, -30], [R * .7, -34]] }
    ];
    addGround(st, R, paths, [{ x: -30, z: -32, rx: 15, rz: 10, stone: true }], []);
    sdRing(R, seed);
    /* 南部大围场：泥砖墙圈住整片圣域，中央一座巨大方台（「大丘」） */
    cityWall([[-40, 10], [72, 10], [72, 96], [-40, 96]], { h: 8, th: 3.4, towerEvery: 40, gateS: .9, gateGap: 7 });
    mput('base2', 20, 56, 0, { s: 3.2, solid: false, autodoor: false });
    mput('temple', 20, 40, Math.PI, { s: 1.1, shadow: true, door: { side: 0, dist: 12, interior: 'temple', label: 'AMVN-RA 阿蒙拉圣域' } });
    mput('granary', 56, 78, 0, { s: 1.2, shadow: true });          /* 埃及式府库 */
    mput('temple3', -22, 68, 0, { s: .5, shadow: true });          /* 泥砖的阿佛洛狄忒小庙（约 14×8 米） */
    mput('potter', -26, 84, 0, { s: 1 });                          /* 圣甲虫釉陶作坊 */
    /* 北部希腊区：几座小石庙，坡屋顶，混在泥砖城里格外扎眼 */
    mput('parthenon', -30, -62, 0, { s: .66, shadow: true });      /* 阿波罗庙 */
    mput('temple2', 6, -70, 0, { s: .66, shadow: true });          /* 赫拉庙 */
    mput('temple3', 42, -60, 0, { s: .58, shadow: true });         /* 狄俄斯库里庙 */
    cityWall([[-4, -44], [46, -44], [46, -14], [-4, -14]], { h: 4.5, th: 1.8, towerEvery: 26, gateS: .8, gateGap: 6 });
    mput('senate', 22, -30, 0, { s: 1.05, shadow: true, door: { side: 0, dist: 11, interior: 'study', label: 'HELLENION 希腊人会馆' } });
    mput('forge', -46, -34, 0, { s: 1 });                          /* 窑场 */
    mput('forge', -50, -18, 0.4, { s: .95 });
    /* 西侧河岸与仓埠 */
    seaField(-150, 0, 130, 400, 0x2f7fa8);
    shoreLine(0, -132, -96, seed + 'sh');
    mput('dock', -104, 22, 1.57, { autodoor: false }); mput('dock', -106, -26, 1.57, { autodoor: false });
    mput('granary', -86, 0, 1.57, { s: 1.1, shadow: true });
    shipRoute('sail2', [[-150, 120], [-120, 0], [-150, -120], [-176, 0]], 2.3);
    sdBlock(-24, -8, 3, 2, 11, 10, seed + 'h1');
    sdBlock(52, -6, 2, 2, 11, 10, seed + 'h2');
    sd('SD_Bazaar', -8, 24, Math.PI / 2, { shadow: true });
    sdPalms(96, 30, 16, 10, seed + 'p');
    placePlayer(-40, -20, Math.PI);
    hudCity(st, 'NAVCRATIS');
  }

  /* ARSINOE·CROCODILOPOLIS 鳄鱼城：不在尼罗河边，而在法尤姆洼地里——
     托勒密朝把美里斯湖放干了约 1200 平方公里造田，这一带是全埃及最「新建」的地方。
     斯特拉波留下最好用的一句白描：「巴赫尔约瑟夫渠穿城而过，两岸都是房子，
     河上有两座桥。」城中还有那个著名的佩特苏霍斯池——养着戴金饰宝石的圣鳄，
     游客花钱喂它。 */
  function medArsinoe() {
    var st = medSt('aegypt'), R = 136, seed = 'ars';
    newScene(0xd2e6ee, 0xe7dcae, 150, 640, Z.night);
    var paths = [
      { w: 6, pts: [[-R * .85, -34], [0, -30], [R * .85, -26]] },
      { w: 5, pts: [[-R * .8, 40], [0, 44], [R * .8, 40]] },
      { w: 5, pts: [[-40, -R * .7], [-36, R * .7]] }
    ];
    addGround(st, R, paths, [{ x: -8, z: -30, rx: 15, rz: 10, stone: true }], []);
    sdRing(R, seed);
    /* 渠穿城而过：水在城中间，两岸贴着房子，两座桥 */
    seaField(0, 6, 330, 17, 0x3d86a0);
    mput('bridge', -34, 6, 0, { s: 1.1, solid: false });
    mput('bridge', 44, 6, 0, { s: 1.1, solid: false });
    sdBlock(-70, -12, 3, 1, 12, 11, seed + 'n1');
    sdBlock(-22, -12, 3, 1, 12, 11, seed + 'n2');
    sdBlock(26, -12, 3, 1, 12, 11, seed + 'n3');
    sdBlock(-70, 24, 3, 1, 12, 11, seed + 's1');
    sdBlock(-22, 24, 3, 1, 12, 11, seed + 's2');
    sdBlock(26, 24, 3, 1, 12, 11, seed + 's3');
    /* 索贝克大庙：托勒密朝把中王国那座拆了重建，所以是新庙压旧基 */
    mput('temple', -6, -56, 0, { s: 1.3, shadow: true, door: { side: 0, dist: 13, interior: 'temple', label: 'SOBEK 索贝克圣殿' } });
    pylonGate(-6, -36, 20, 12, 0);
    obelisk(-16, -30, 7); obelisk(4, -30, 7);
    /* 佩特苏霍斯池：围墙、沙地、喂食小池与遮阳棚，圣鳄住在里面 */
    seaField(62, -44, 24, 20, 0x37718a);
    cityWall([[44, -60], [82, -60], [82, -28], [44, -28]], { h: 3.2, th: 1.4, towerEvery: 40, gateS: .7, gateGap: 5.5 });
    mput('tentOpen', 74, -52, 0, { s: 1.1, solid: false });
    mput('altarStone', 50, -34, 0, { s: .9, solid: false, autodoor: false });
    /* 灌溉扇：城外一格一格的新垦田与支渠，是这一带最特别的地貌 */
    for (var gx = -3; gx <= 3; gx++) {
      seaField(gx * 44, 96, 6, 120, 0x3d86a0);
      mput('farm', gx * 44 + 18, 108, 0, { s: 1, shadow: true });
    }
    seaField(0, 168, 400, 46, 0x3d86a0);
    sd('SD_Bazaar', 12, 40, Math.PI / 2, { shadow: true });
    sd('SD_Well', -46, 44, 0, { solid: false });
    agoraStalls(8, 46, 12, 11, seed + 'ag');
    mput('granary', -84, 44, 0, { s: 1.1, shadow: true });
    /* 东南哈瓦拉：阿蒙涅姆赫特三世的金字塔与那座著名的「迷宫」，
       此时已是残迹——希腊罗马游客专程来看的一处名胜，不是活建筑。 */
    pyramid(116, -104, 26, 18);
    for (var i = 0; i < 8; i++) mput('colRuin', 92 + i * 7, -78 + (i % 3) * 6, i * .7, { s: .9, solid: false, autodoor: false });
    sdPalms(-96, 62, 18, 12, seed + 'p');
    placePlayer(-8, 40, Math.PI);
    hudCity(st, 'ARSINOE');
  }

  /* THEBAE：卡纳克塔门轴线 · 双方尖碑 · 多柱厅 · 西岸崖壁 */
  function medThebes() {
    var st = medSt('aegypt'), R = 138, seed = 'thb';
    var r = rng(seed);
    newScene(0xd6e6ef, 0xe9d6a4, 150, 660, Z.night);
    var paths = [
      { w: 7, pts: [[0, R * .82], [0, 30], [0, -R * .6]] },
      { w: 4, pts: [[-R * .6, 20], [0, 14], [R * .6, 10]] }
    ];
    addGround(st, R, paths, [{ x: 0, z: 24, rx: 15, rz: 12, stone: true }], []);
    /* 西岸崖壁（帝王谷方向）：整排沙山 */
    for (var zz = -R; zz <= R; zz += 22 + r() * 10)
      sd('SD_Mt_' + ('0' + (1 + (r() * 10 | 0))).slice(-2), -R * 1.28 - r() * 22, zz, r() * 6.28, { solid: false, autodoor: false, s: .42 + r() * .22 });
    sdRing(R, seed);
    /* 卡纳克轴线：南进北庙 */
    pylonGate(0, -22, 22, 12, 0);
    obelisk(-8, -12, 11); obelisk(8, -12, 11);
    pylonGate(0, -52, 18, 10, 0);
    /* 多柱厅：4×4 柱阵 */
    mcol('colCor', -12, -66, 12, -66, 5.2, { solid: false, autodoor: false });
    mcol('colCor', -12, -74, 12, -74, 5.2, { solid: false, autodoor: false });
    mcol('colCor', -12, -82, 12, -82, 5.2, { solid: false, autodoor: false });
    mput('temple', 0, -94, 0, { s: 1.2, shadow: true });
    /* 圣湖 */
    seaField(34, -70, 26, 18, 0x2f8fae);
    /* 河东市镇 */
    sd('SD_Bazaar', 14, 34, Math.PI / 2, { shadow: true });
    sd('SD_Well', 4, 42, 0, { solid: false });
    agoraStalls(10, 40, 12, 11, seed + 'ag');
    sdBlock(-40, 44, 3, 2, 12, 11, seed + 'h1');
    sdBlock(30, 56, 3, 2, 12, 11, seed + 'h2');
    sd('SD_Monument', -16, 28, 0, { shadow: true, s: .85 });
    sdPalms(52, 20, 18, 12, seed + 'p1');
    palmRow(-24, 66, 11, 2, 6, seed + 'pr');
    placePlayer(0, 52, Math.PI);
    hudCity(st, 'THEBAE');
  }

  /* ---------------- 地点 → 蓝图 ---------------- */
  var MEDCITY = {
    '罗马': medRomaF, 'ROMA': medRomaF,
    '雅典': medAthenae, 'ATHENAE': medAthenae,
    '斯巴达': medSparta, 'SPARTA': medSparta,
    '迦太基': medCarthago, 'CARTHAGO': medCarthago,
    '亚历山卓': medAlexandria, 'ALEXANDRIA': medAlexandria,
    '亚历山大': medAlexandria, '亚历山大港': medAlexandria, '亚历山大里亚': medAlexandria,
    '孟菲斯': medMemphis, 'MEMPHIS': medMemphis,
    '开罗': medCairo, 'CAIRO': medCairo,
    '菲莱': medPhilae, 'PHILAE': medPhilae, '菲莱岛': medPhilae,
    '埃德富': medEdfu, 'EDFV': medEdfu, 'EDFU': medEdfu, '埃德夫': medEdfu,
    '丹达腊': medDendera, 'DENDERA': medDendera, '丹德拉': medDendera, '登德拉': medDendera,
    '贝鲁西亚': medPelusium, 'PELVSIVM': medPelusium, 'PELUSIUM': medPelusium, '佩鲁西乌姆': medPelusium,
    '托勒密城': medPtolemais, 'PTOLEMAIS': medPtolemais, '托勒密埃尔米乌': medPtolemais,
    '阿斯旺': medSyene, 'SYENE': medSyene, '塞伊尼': medSyene, '象岛': medSyene, '象牙岛': medSyene,
    '瑙克拉提斯': medNaukratis, 'NAVCRATIS': medNaukratis, 'NAUKRATIS': medNaukratis,
    '鳄鱼城': medArsinoe, 'ARSINOE': medArsinoe, '阿尔西诺伊': medArsinoe, '克罗科迪洛波利斯': medArsinoe,
    '埃及底比斯': medThebes, 'THEBAE': medThebes,
    '拜占庭': medByzantium, 'BYZANTIVM': medByzantium, '君士坦丁堡': medByzantium,
    '科林斯': medCorinth, 'CORINTHVS': medCorinth,
    '叙拉古': medSyracusae, 'SYRACVSAE': medSyracusae,
    '德尔斐': medDelphi, 'DELPHI': medDelphi
  };
  var MEDGEN = {
    '新迦太基': ['port', 'hispania'], '马西利亚': ['port', 'gallia'], '加德斯': ['port', 'hispania'],
    '塔兰托': ['port', 'graecia'], '推罗': ['port', 'levant'], '西顿': ['port', 'levant'],
    '以弗所': ['port', 'graecia'], '帕加马': ['port', 'graecia'], '佩拉': ['colonia', 'graecia'],
    '卢泰西亚': ['colonia', 'gallia'], '伦丁尼恩': ['colonia', 'gallia'], '特里尔': ['colonia', 'gallia'],
    '阿奎莱亚': ['colonia', 'latium'], '昔兰尼': ['desert', 'africa'], '佩特拉': ['desert', 'levant'],
    '耶路撒冷': ['desert', 'levant'], '孟菲斯': ['desert', 'aegypt'], '底比斯': ['desert', 'aegypt'],
    '埃及底比斯': ['desert', 'aegypt'], '麦罗埃': ['desert', 'aegypt'], '马里卜': ['desert', 'levant'],
    /* 托勒密埃及其余城邑：都真实存在于前 69–前 30 年，按性质各择形制 */
    '赫尔莫波利斯': ['desert', 'aegypt'], '俄克喜林库斯': ['desert', 'aegypt'],
    '科普托斯': ['desert', 'aegypt'], '考姆翁布': ['desert', 'aegypt'],
    '艾尔曼特': ['desert', 'aegypt'], '阿拜多斯': ['desert', 'aegypt'],
    '塞易斯': ['desert', 'aegypt'], '布巴斯提斯': ['desert', 'aegypt'],
    '塔尼斯': ['desert', 'aegypt'], '门德斯': ['desert', 'aegypt'],
    '克诺珀斯': ['port', 'aegypt'], '塔波西里斯': ['port', 'aegypt'],
    '马特鲁港': ['port', 'aegypt'], '帕莱托尼乌姆': ['port', 'aegypt'],
    '贝勒尼基': ['port', 'aegypt'], '米奥斯霍尔莫斯': ['port', 'aegypt'],
    '锡瓦绿洲': ['desert', 'africa'], '锡瓦': ['desert', 'africa'],
    '哈尔加绿洲': ['desert', 'africa'], '达赫拉绿洲': ['desert', 'africa'],
    '安条克': ['colonia', 'levant'], '巴比伦': ['desert', 'levant'], '波斯波利斯': ['desert', 'levant'],
    '泰西封': ['desert', 'levant'], '苏萨': ['desert', 'levant'],
    '埃克巴坦那': ['desert', 'levant'], '塞琉西亚': ['colonia', 'levant'],
    '潘提卡派翁': ['port', 'pontus'], '奥尔比亚': ['port', 'pontus'],
    '塔拉科': ['port', 'hispania'], '瑙克拉提斯': ['desert', 'aegypt'],
    '赛伊斯': ['desert', 'aegypt'], '布巴斯提斯': ['desert', 'aegypt'],
    '赛伊尼·阿斯旺': ['desert', 'aegypt'], '赛伊尼': ['desert', 'aegypt'],
    '努曼西亚': ['oppidum', 'hispania'], '比布拉克特': ['oppidum', 'gallia'],
    '阿莱西亚': ['oppidum', 'gallia'], '卡姆罗敦': ['oppidum', 'gallia'],
    '巴克特拉': ['desert', 'levant'], '撒马尔罕': ['desert', 'levant'],
    '塔克西拉': ['orient', 'graecia'], '华氏城': ['orient', 'serica'],
    /* 今名——AI 正文常用现代地名指古城，不入表就会落回拉丁 fallback */
    '吉萨': ['desert', 'aegypt'], '卢克索': ['desert', 'aegypt'],
    '阿斯旺': ['desert', 'aegypt'],
    '大马士革': ['desert', 'levant'], '巴格达': ['desert', 'levant'],
    '突尼斯': ['desert', 'africa'], '的黎波里': ['desert', 'africa'],
    '斐斯': ['desert', 'africa'], '加沙': ['desert', 'levant'],
    /* —— 蒙古纪地名（1177—1264） —— */
    '哈拉和林': ['orient', 'serica'], '和林': ['orient', 'serica'],
    '曲雕阿兰': ['steppe', 'steppe'], '阔迭额阿剌勒': ['steppe', 'steppe'],
    '斡难河': ['steppe', 'steppe'], '斡难河源': ['steppe', 'steppe'],
    '克鲁伦河': ['steppe', 'steppe'], '土兀剌河': ['steppe', 'steppe'],
    '起辇谷': ['steppe', 'steppe'], '不儿罕山': ['steppe', 'steppe'],
    '野狐岭': ['steppe', 'steppe'], '六盘山': ['steppe', 'steppe'],
    '贺兰山': ['steppe', 'steppe'], '迦勒迦河': ['steppe', 'steppe'],
    '也儿的石河': ['steppe', 'steppe'], '也的里河': ['steppe', 'steppe'],
    '萨莱': ['steppe', 'levant'], '金帐': ['steppe', 'steppe'],
    '中都': ['orient', 'serica'], '燕京': ['orient', 'serica'],
    '开封': ['orient', 'serica'], '汴京': ['orient', 'serica'], '汴梁': ['orient', 'serica'],
    '临安': ['orient', 'serica'], '蔡州': ['orient', 'serica'],
    '大同': ['orient', 'serica'], '太原': ['orient', 'serica'],
    '兴庆': ['desert', 'levant'], '兴庆府': ['desert', 'levant'], '中兴府': ['desert', 'levant'],
    '灵州': ['desert', 'levant'], '黑水城': ['desert', 'levant'],
    '布哈拉': ['desert', 'levant'], '不花剌': ['desert', 'levant'],
    '玉龙杰赤': ['desert', 'levant'], '乌尔根奇': ['desert', 'levant'],
    '讹答剌': ['desert', 'levant'], '毡的': ['desert', 'levant'],
    '苦盏': ['desert', 'levant'], '忽毡': ['desert', 'levant'],
    '谋夫': ['desert', 'levant'], '梅尔夫': ['desert', 'levant'],
    '你沙不儿': ['desert', 'levant'], '内沙布尔': ['desert', 'levant'],
    '赫拉特': ['desert', 'levant'], '也里': ['desert', 'levant'],
    '哥疾宁': ['desert', 'levant'], '八鲁湾': ['desert', 'levant'],
    '巴里黑': ['desert', 'levant'], '塔里寒': ['desert', 'levant'],
    '大不里士': ['desert', 'levant'], '阿剌模忒': ['desert', 'levant'],
    '基辅': ['colonia', 'gallia'], '弗拉基米尔': ['colonia', 'gallia'],
    '莫斯科': ['colonia', 'gallia'], '梁赞': ['colonia', 'gallia'],
    '诺夫哥罗德': ['colonia', 'gallia'], '克拉科夫': ['colonia', 'gallia'],
    '佩斯': ['colonia', 'gallia'], '布达': ['colonia', 'gallia'],
    '里格尼茨': ['colonia', 'gallia'], '不里阿耳': ['colonia', 'gallia'],
    '江华岛': ['orient', 'serica'], '开京': ['orient', 'serica'],
    '钓鱼城': ['orient', 'serica'], '襄阳': ['orient', 'serica'],
    '别失八里': ['desert', 'levant'], '阿力麻里': ['desert', 'levant'],
    '喀什': ['desert', 'levant'], '于阗': ['desert', 'levant'],
    '敦煌': ['desert', 'levant'], '哈密力': ['desert', 'levant'],
    '赛约河': ['steppe', 'steppe'], '印度河': ['desert', 'levant'],
    '三峰山': ['steppe', 'steppe'], '班朱尼河': ['steppe', 'steppe'],
    '薄兀剌川': ['steppe', 'steppe'], '答兰巴勒主惕': ['steppe', 'steppe'],
    '毡的': ['desert', 'levant'], '苦盏': ['desert', 'levant'],
    '谋夫': ['desert', 'levant'], '塔里寒': ['desert', 'levant'],
    '巴里黑': ['desert', 'levant'], '八鲁湾': ['desert', 'levant'],
    '哥疾宁': ['desert', 'levant'], '赫拉特': ['desert', 'levant'],
    '你沙不儿': ['desert', 'levant'], '大不里士': ['desert', 'levant'],
    '阿剌模忒': ['desert', 'levant'], '大马士革2': ['desert', 'levant'],
    '灵州': ['desert', 'levant'], '黑水城': ['desert', 'levant'],
    '蔡州': ['orient', 'serica'], '襄阳': ['orient', 'serica'],
    '布达': ['colonia', 'gallia'], '曲雕阿兰': ['steppe', 'steppe']
  };
  /* 城名→调色板：途中/城未建时四野也要认得目的地的水土（开罗途中不能是绿地） */
  var MEDCITYPAL = {
    '罗马': 'latium', 'ROMA': 'latium',
    '雅典': 'graecia', 'ATHENAE': 'graecia', '斯巴达': 'graecia', 'SPARTA': 'graecia',
    '科林斯': 'graecia', 'CORINTHVS': 'graecia', '叙拉古': 'graecia', 'SYRACVSAE': 'graecia',
    '德尔斐': 'graecia', 'DELPHI': 'graecia',
    '拜占庭': 'graecia', 'BYZANTIVM': 'graecia', '君士坦丁堡': 'graecia',
    '迦太基': 'africa', 'CARTHAGO': 'africa',
    '亚历山卓': 'aegypt', 'ALEXANDRIA': 'aegypt', '亚历山大': 'aegypt',
    '亚历山大港': 'aegypt', '亚历山大里亚': 'aegypt',
    '孟菲斯': 'aegypt', 'MEMPHIS': 'aegypt', '开罗': 'aegypt', 'CAIRO': 'aegypt',
    '埃及底比斯': 'aegypt', 'THEBAE': 'aegypt',
    '菲莱': 'aegypt', '埃德富': 'aegypt', '丹达腊': 'aegypt', '贝鲁西亚': 'aegypt',
    '托勒密城': 'aegypt', '阿斯旺': 'aegypt', '塞伊尼': 'aegypt', '象岛': 'aegypt',
    '瑙克拉提斯': 'aegypt', '鳄鱼城': 'aegypt', '阿尔西诺伊': 'aegypt'
  };
  /* 汉地城 → 哪一套中式蓝图 + 哪一国的墙面。
     形制：luoyi＝都城（中轴、明堂、外郭），town＝州城常制，water＝水乡，pass＝山关。
     国别只管贴图与草色，不换形制。这三套蓝图本来就是 RitusZhou 那边的中式城，
     一直躺在这份引擎里没人用——汉地城此前全被派给了 medOrient 的波斯巴扎。 */
  var HANCITY = {
    /* —— 秦：关中 —— */
    '咸阳': ['luoyi', 'qin'], '咸阳宫': ['luoyi', 'qin'], '咸阳宫·西殿': ['luoyi', 'qin'],
    '西殿': ['luoyi', 'qin'], '章台宫': ['luoyi', 'qin'], '掖庭': ['luoyi', 'qin'],
    '永巷': ['luoyi', 'qin'], '阿房': ['luoyi', 'qin'], '阿房宫': ['luoyi', 'qin'],
    '骊山': ['town', 'qin'], '上林苑': ['town', 'qin'], '兰池': ['water', 'qin'],
    '雍城': ['town', 'qin'], '栎阳': ['town', 'qin'], '蓝田': ['town', 'qin'],
    '郑国渠': ['water', 'qin'], '云阳·甘泉': ['town', 'qin'], '云阳': ['town', 'qin'],
    '函谷关': ['pass', 'qin'], '武关': ['pass', 'qin'], '萧关': ['pass', 'qin'],
    '大散关': ['pass', 'qin'], '临洮': ['town', 'qin'], '肤施·上郡': ['town', 'qin'],
    '上郡': ['town', 'qin'], '九原': ['town', 'qin'], '阴山长城': ['pass', 'qin'],
    '长城': ['pass', 'qin'], '直道': ['pass', 'qin'],
    /* —— 六国故地 —— */
    '洛阳': ['luoyi', 'zhou'], '洛邑': ['luoyi', 'zhou'], '长安': ['luoyi', 'zhou'],
    '大梁': ['luoyi', 'wei'], '开封': ['luoyi', 'wei'], '汴京': ['luoyi', 'wei'], '汴梁': ['luoyi', 'wei'],
    '新郑': ['luoyi', 'han'], '阳翟': ['town', 'han'], '上蔡': ['town', 'chu'], '陈': ['town', 'chu'],
    '邯郸': ['luoyi', 'zhao'], '大同': ['town', 'zhao'], '太原': ['town', 'zhao'], '真定': ['town', 'zhao'],
    '临淄': ['luoyi', 'qi'], '即墨': ['town', 'qi'], '琅邪台': ['town', 'qi'], '琅邪': ['town', 'qi'],
    '之罘': ['town', 'qi'], '曲阜': ['town', 'qi'], '泰山': ['town', 'qi'], '济南': ['town', 'qi'],
    '蓟': ['luoyi', 'yan'], '易水': ['water', 'yan'], '碣石': ['town', 'yan'],
    '襄平': ['town', 'yan'], '巨鹿': ['town', 'zhao'], '沙丘平台': ['town', 'zhao'], '沙丘': ['town', 'zhao'],
    '平原津': ['water', 'qi'], '濮阳': ['town', 'wei'], '定陶': ['town', 'wei'],
    '商丘': ['town', 'wei'], '博浪沙': ['town', 'han'], '单父': ['town', 'chu'],
    '郢·南郡': ['luoyi', 'chu'], '郢': ['luoyi', 'chu'], '南郡': ['town', 'chu'], '江陵': ['water', 'chu'],
    '宛': ['town', 'chu'], '南阳': ['town', 'chu'], '长沙': ['water', 'chu'],
    '吴·会稽郡': ['water', 'chu'], '会稽山': ['water', 'chu'], '会稽': ['water', 'chu'],
    '姑苏': ['water', 'chu'], '苏州': ['water', 'chu'], '建康': ['water', 'chu'],
    '番禺': ['water', 'chu'], '桂林郡': ['town', 'chu'], '象郡': ['town', 'chu'], '灵渠': ['water', 'chu'],
    '成都': ['town', 'qin'], '都江堰': ['water', 'qin'], '南郑': ['town', 'qin'], '汉中': ['town', 'qin']
  };
  /* 匈奴与西边：这些地方不是汉地，别被下面的名相正则误收进去 */
  var HUCITY = /头曼城|单于庭|河南地|匈奴|月氏|乌孙|张掖|敦煌|祁连|阴山以北|大漠|草原/;
  /* 名相：AI 正文常写没列名的府州县。带这些字样的一律按汉地办。 */
  var HANRE = /汉地|中原|中土|江南|淮南|淮北|河北|河东|河南|山东|关中|陕西|京兆|巴蜀|蜀地|川蜀|秦地|楚地|齐地|赵地|燕地|韩地|魏地|六国|咸阳|掖庭|永巷|骊山|阿房|驰道|栈道|某郡|某县|郡治|县廷|廷尉|少府|太仓|官署|府城|县城|州城|军镇|驿馆|传舍|书院|寺院|禅寺|运河|宫掖|后宫|离宫|行宫/;
  function isHan(nm) {
    if (!nm) return false;
    if (HANCITY[nm]) return true;
    if (HUCITY.test(nm)) return false;
    var g = MEDGEN[nm];
    if (g && g[1] === 'serica') return true;
    return HANRE.test(nm);
  }
  function medPalKey(nm) {
    if (!nm) return null;
    if (MEDCITYPAL[nm]) return MEDCITYPAL[nm];
    if (isHan(nm)) return 'serica';     /* 汉地一律丝国调色（中式贴图＋汉地草色） */
    var g = MEDGEN[nm];
    if (g) return g[1];
    if (/尼罗|埃及|西奈|努比亚|苏丹|法老|金字塔|亚历山卓|亚历山大|孟菲斯|底比斯|开罗|吉萨|卢克索|阿斯旺|菲莱|法尤姆|三角洲|菲莱|埃德富|丹达腊|贝鲁西亚|托勒密城|阿斯旺|塞伊尼|象岛|瑙克拉提斯|鳄鱼城|阿尔西诺伊|科普托斯|赫尔莫波利斯|俄克喜林库斯|考姆翁布|阿拜多斯|塞易斯|布巴斯提斯|塔尼斯|克诺珀斯|贝勒尼基|锡瓦/.test(nm)) return 'aegypt';   /* 城名子串也认：剧情常写「亚历山卓·王宫」这类复合地名 */
    if (/利比亚|撒哈拉|柏柏|努米底亚|毛里塔尼亚|摩洛哥|阿尔及|北非/.test(nm)) return 'africa';
    if (/阿拉伯|叙利亚|美索不达米亚|波斯|帕提亚|沙漠|绿洲|贝都因|河中|花剌子模|呼罗珊|西域|突厥斯坦/.test(nm)) return 'levant';
    if (/草原|斡难|克鲁伦|杭爱|漠北|漠南|大漠|毡帐|斡耳朵|营盘|冬营|夏营/.test(nm)) return 'steppe';
    return null;
  }
  function medBuild(locName) {
    SEA = null; SHIPS = []; RIVER = null; AQUA = [];
    /* 汉地先派工，赶在地中海那张表前头：模型槽已由 Z.han 换成中式包，
       这里只挑蓝图。列了名的按表走，认得是汉地但没列名的按州城常制。 */
    if (Z.han) {
      var hc = HANCITY[locName] || ['town', 'yan'];
      if (hc[0] === 'luoyi') buildLuoyi(locName, hc[1]);
      else if (hc[0] === 'pass') buildPass(locName);
      else buildTown(hc[1], locName, hc[0]);
      return true;
    }
    var f = MEDCITY[locName];
    if (f) { f(); return true; }
    var g = MEDGEN[locName];
    if (g) {
      if (g[0] === 'port') medPort(locName, g[1], locName);
      else if (g[0] === 'colonia') medColonia(locName, g[1], locName);
      else if (g[0] === 'oppidum') medOppidum(locName, g[1], locName);
      else if (g[0] === 'orient') medOrient(locName, g[1], locName);
      else if (g[0] === 'desert') medDesert(locName, g[1], locName);
      else if (g[0] === 'steppe') medSteppe(locName, g[1], locName);
      else medRock(locName, g[1], locName);
      return true;
    }
    /* 未列名地点：先辨沙域——埃及/北非/西亚字样一律沙漠城，不能落回拉丁样式 */
    var sandPal = /尼罗|埃及|西奈|努比亚|苏丹|法老|金字塔|亚历山卓|亚历山大|孟菲斯|底比斯|开罗|吉萨|卢克索|阿斯旺|菲莱|法尤姆|三角洲|菲莱|埃德富|丹达腊|贝鲁西亚|托勒密城|阿斯旺|塞伊尼|象岛|瑙克拉提斯|鳄鱼城|阿尔西诺伊|科普托斯|赫尔莫波利斯|俄克喜林库斯|考姆翁布|阿拜多斯|塞易斯|布巴斯提斯|塔尼斯|克诺珀斯|贝勒尼基|锡瓦/.test(locName) ? 'aegypt'
      : /利比亚|撒哈拉|柏柏|努米底亚|毛里塔尼亚|摩洛哥|阿尔及|北非/.test(locName) ? 'africa'
      : /阿拉伯|叙利亚|美索不达米亚|波斯|帕提亚|沙漠|绿洲|贝都因|绿洲/.test(locName) ? 'levant' : null;
    if (/草原|斡难|克鲁伦|杭爱|漠北|漠南|毡帐|斡耳朵|营盘|冬营|夏营|大帐|金帐/.test(locName)) { medSteppe(locName, 'steppe', locName); return true; }
    if (sandPal) { medDesert(locName, sandPal, locName); return true; }
    /* 再按名相择形——带村庄字样即田舍，靠海词即港市，余者行省城 */
    if (/村|庄|庄|乡|乡|田|农|农|VICVS/i.test(locName)) medVicus(locName, 'latium', locName);
    else if (/港|海|岛|岛|滨|滨/.test(locName)) medPort(locName, 'graecia', locName);
    else medColonia(locName, 'latium', locName);
    return true;
  }

  /* ---------------- location routing ---------------- */
  function buildFor(locName) {
    /* 资材没到位就别开工：packs 是异步一包一包填的，抢跑就会撞上 undefined。
       showLocation 本来就有这道守卫，但 debugCity、敕令重建、昼夜切换那几条
       路径是直接进来的，一样得挡。 */
    if (!Z.packs) { Z.pending = [locName, Z.night]; return; }
    Z.cityKey = locName;
    /* 这一句要早于任何 spawn／info：整局的模型槽由它决定走中式包还是地中海包。 */
    Z.han = isHan(locName);
    if (Z.B) cancelGhost();
    Z.sel = null;
    var cfg = LOC2[locName] || { st: 'zhou', flavor: 'luoyi' };
    chunkReset();
    Z.spawnSeq = 0; Z.natSeq = 0; Z.inRecipe = true;
    /* 蓝图里任何一步出岔子都不许把 inRecipe 撂在 true——那会让此后每一次
       落件都以为自己还在「配方」里，编号错位、拆毁记录错杀，越用越乱。
       一座城建坏了是残缺，引擎状态坏了是全盘。 */
    try {
      if (!medBuild(locName)) {
        if (cfg.flavor === 'luoyi') buildLuoyi();
        else if (cfg.flavor === 'pass') buildPass(locName);
        else buildTown(cfg.st, locName, cfg.flavor);
      }
    } catch (e) {
      console.warn('city build failed', locName, e && e.message || e);
    } finally {
      Z.inRecipe = false;
    }
    ensureChunks(0, 0);
    applyBuilds();
    spawnAmbient(locName);
    clearGhostMats();
    ensureGrid();
    if (bHud.wrap) updateBuildHud();
    /* 换了城就得重排托盘：同一件「殿宇」，漠北是地中海那件、汴梁是中式那件，
       缩略图是按城缓存的——不重排，玩家看着地中海的图却摆下一座中式殿。 */
    if (bHud.tray && bHud.tray.style.display !== 'none') { try { fillTray(); } catch (e) { } }
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
    /* 低配开关别再被下一行抹掉：原先这两句一前一后，手机上存过「低画质」也照样开阴影。 */
    rnd.shadowMap.enabled = !(isTouch() && PERF.low);
    rnd.shadowMap.type = T.PCFShadowMap;
    /* 太阳不动、城池静止，阴影图却每帧重算一遍全场深度，等于把 draw call 翻一倍。
       改为手动刷新：建城、换天气、开关夜晚时各刷一次就够。 */
    rnd.shadowMap.autoUpdate = false;
    rnd.shadowMap.needsUpdate = true;
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
    eraChip.style.cssText = 'position:absolute;top:36px;left:10px;max-width:62%;padding:2px 8px;background:rgba(6,6,6,.6);border:1px solid rgba(236,236,232,.14);font-size:8.5px;letter-spacing:.08em;color:#d9d9d4;text-shadow:0 1px 2px #000;white-space:nowrap;overflow:hidden;pointer-events:none;display:none';
    hud.appendChild(eraChip);
    applyChip();
    /* 右上按钮排：flex 布局，宽标签不再重叠 */
    var tr0 = document.createElement('div');
    /* 手机 390px 下这一排实测总宽 458px，金库 chip 整块被挤出屏幕外。
       给个 left 约束并允许换行，别让它无限向左溢出。 */
    tr0.style.cssText = 'position:absolute;top:8px;right:10px;left:10px;justify-content:flex-end;flex-wrap:wrap;display:flex;gap:6px;align-items:center;pointer-events:auto';
    hud.appendChild(tr0); Z._topRow = tr0;
    // expand button
    expBtn = document.createElement('div');
    expBtn.style.cssText = 'order:9;padding:3px 9px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:8.5px;letter-spacing:.22em;cursor:pointer;border-radius:0;white-space:nowrap';
    expBtn.onclick = function () { Z.toggleExpand(); };
    tr0.appendChild(expBtn);
    var xBtn = document.createElement('div');
    xBtn.style.cssText = 'order:10;padding:3px 9px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:9.5px;cursor:pointer;border-radius:0;display:none';
    xBtn.textContent = '×';
    xBtn.title = '收起面板（TERRA·天下 可重新展开）';
    xBtn.onclick = function () {
      if (window.ZJ3D_closePane) { ZJ3D_closePane(); return; }
      try { localStorage.setItem('med3d_hide', '1'); } catch (e) { }
      if (window.ZJ3D_onExpand) window.ZJ3D_onExpand();
    };
    tr0.appendChild(xBtn); Z._xBtn = xBtn;
    // 低配模式（仅手机）：更低渲染分辨率 + 关阴影 + 锁30帧
    if (isTouch()) {
      var lowBtn = document.createElement('div');
      var lowSty = function () {
        lowBtn.style.cssText = 'order:2;padding:3px 9px;background:rgba(6,6,6,.62);border:1px solid ' + (PERF.low ? 'rgba(201,155,63,.8)' : 'rgba(236,236,232,.22)') + ';color:' + (PERF.low ? '#ecc878' : '#d9d9d4') + ';font-size:8.5px;letter-spacing:.22em;cursor:pointer;border-radius:0;white-space:nowrap;display:' + (Z.expanded ? 'block' : 'none');
      };
      lowSty();
      lowBtn.textContent = 'LEVIS·低配';
      lowBtn.onclick = function () { PERF.low = !PERF.low; perfSave(); applyPerf(); lowSty(); };
      tr0.appendChild(lowBtn); Z._lowBtn = lowSty;
      var txtBtn = document.createElement('div');
      txtBtn.style.cssText = 'order:1;padding:3px 9px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:8.5px;letter-spacing:.22em;cursor:pointer;border-radius:0;white-space:nowrap;display:' + (Z.expanded ? 'block' : 'none');
      txtBtn.textContent = 'TEXTVS·纯文字';
      txtBtn.title = '关闭三维，纯文字游玩（最省电），可随时开回';
      txtBtn.onclick = function () { try { localStorage.setItem('med3d_off', '1'); } catch (e) { } location.reload(); };
      tr0.appendChild(txtBtn); Z._txtBtn = txtBtn;
    }
    // door button
    doorBtn = document.createElement('div');
    doorBtn.style.cssText = 'position:absolute;left:50%;bottom:18%;transform:translateX(-50%);padding:5px 16px;background:rgba(6,6,6,.7);-webkit-backdrop-filter:blur(4px) saturate(140%);backdrop-filter:blur(4px) saturate(140%);border:1px solid rgba(236,236,232,.28);color:#d9d9d4;font-size:10px;letter-spacing:.25em;cursor:pointer;pointer-events:auto;display:none;border-radius:0';
    doorBtn.onclick = function () { tryDoor(); };
    hud.appendChild(doorBtn);
    // joystick (mobile)
    joyEl = document.createElement('div');
    joyEl.style.cssText = 'position:absolute;right:18px;bottom:16px;width:96px;height:96px;border-radius:50%;background:rgba(6,6,6,.4);border:1px solid rgba(236,236,232,.22);pointer-events:auto;display:none;touch-action:none';
    joyKnob = document.createElement('div');
    joyKnob.style.cssText = 'position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:rgba(236,236,232,.22);border:1px solid rgba(236,236,232,.4)';
    joyEl.appendChild(joyKnob);
    bindJoy(joyEl);
    hud.appendChild(joyEl);
    // tip
    tipEl = document.createElement('div');
    tipEl.style.cssText = 'position:absolute;bottom:8px;left:12px;color:rgba(217,217,212,.45);font-size:9px;letter-spacing:.12em;text-align:left';
    hud.appendChild(tipEl);
    // loading overlay
    loadEl = document.createElement('div');
    loadEl.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;color:#c99b3f;font-size:10px;letter-spacing:.34em;background:rgba(6,6,6,.6)';
    hud.appendChild(loadEl);
    host.appendChild(hud);
    ensureBuildHud(host);
  }
  function isTouch() { return matchMedia('(pointer:coarse)').matches; }
  function updateHud() {
    if (!hud) return;
    if (Z.loading) { loadEl.style.display = 'flex'; loadEl.textContent = 'ROMA.SYS · 资材加载 ' + Math.round(Z.prog * 100) + '%'; }
    else if (Z.failed) { loadEl.style.display = 'flex'; loadEl.textContent = '3D资材加载失败 · 转纯文字模式'; }
    else loadEl.style.display = 'none';
    expBtn.textContent = Z.tier === 0 ? 'OPVS·建造' : (Z.tier === 1 ? 'MAIOR·放大' : 'CLAVDE·收起'); // 展开默认即营造；游历是营造内的切换项
    if (Z._xBtn) {
      Z._xBtn.style.display = 'block'; /* 关闭钮常驻：任何档位都能一键收起 */
      expBtn.style.right = '44px';
    }
    if (Z._lowBtn) Z._lowBtn();
    if (Z._txtBtn) Z._txtBtn.style.display = Z.expanded ? 'block' : 'none';
    if (locChip) { // 与顶排按钮同行：限宽到右侧最近按钮之前，放不下省略号截断
      locChip.style.display = Z.chipText ? 'block' : 'none';
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
    locChip.style.display = Z.chipText ? 'block' : 'none';
    applyEra();
  }
  /* 纪年不进地名框——单独一行半透明小字浮在框下面；太长就无缝跑马灯滚动。 */
  function applyEra() {
    if (!eraChip) return;
    var era = Z.eraText || '';
    if (!era || !Z.chipText) { eraChip.style.display = 'none'; eraChip.textContent = ''; eraChip._full = ''; return; }
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
    Z.medStCur = st;
    Z.chipText = locName + (st && st.name ? ' · ' + st.name : '');
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
  /* 帧循环里复用的临时向量：原先每帧 new 三个 Vector3，稳定的 GC 压力，
     在手机上表现为周期性的一顿一顿。 */
  var _headV = new T.Vector3(), _dirV = new T.Vector3(), _tgtV = new T.Vector3();
  function tick() {
    requestAnimationFrame(tick);
    if (Z.asleep) { /* 收起即休眠：停渲染停演算；久睡释放场景显存，唤醒自动重建 */
      if (!Z._torn && Z.scene && performance.now() - Z._sleptAt > 90000) { disposeScene(); Z._torn = true; }
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
        if (nd && Z.expanded && !inBuild()) { doorBtn.style.display = 'block'; doorBtn.textContent = nd.exit ? 'EXI·出门' : 'INTRA·' + nd.label + (isTouch() ? '' : '（E）'); }
        else doorBtn.style.display = 'none';
      }
    }
    if (Z.mode === 'city' && Z.ready && Z.scene) { pawnTick(dt, t); rigTick(dt); strikeTick(dt); animTick(dt); medTick(dt); }
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
      var head = _headV.set(Z.player.position.x, py, Z.player.position.z);
      var dir = _dirV.set(Math.sin(Z.camYaw) * Math.cos(Z.camPitch), Math.sin(Z.camPitch), Math.cos(Z.camYaw) * Math.cos(Z.camPitch));
      // occlusion: pull camera in front of anything blocking the line of sight
      if (Z.camSnap) Z.scene.updateMatrixWorld(true); // fresh scene: matrices not yet computed
      /* 遮挡射线原先每帧对整棵场景树递归求交——地面大板、山体、几百栋房、上百个
         棋子全都要过一遍包围球，还要逐三角扫，是漫游模式下最贵的一笔。
         镜头拉近这件事根本不需要 60Hz：改为每 4 帧算一次，中间沿用上次结果。
         另：head/dir 两个向量原先每帧新建，这里改成复用。 */
      if (Z.camSnap) tick._rc = 99;
      if ((tick._rc = (tick._rc || 0) + 1) >= 4) {
        tick._rc = 0;
        _ray.set(head, dir); _ray.far = cd;
        var hits = _ray.intersectObjects(Z.scene.children, true);
        var cdHit = cd;
        for (var hi = 0; hi < hits.length; hi++) {
          var isPl = false, oo = hits[hi].object;
          while (oo) { if (oo.userData && oo.userData.isPlayer) { isPl = true; break; } oo = oo.parent; }
          if (isPl) continue;
          cdHit = Math.max(2.4, hits[hi].distance * 0.92);
          break;
        }
        tick._cd = cdHit;
      }
      if (tick._cd != null) cd = Math.min(cd, tick._cd);
      var tgt = _tgtV.copy(head).addScaledVector(dir, cd);
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
    CH.map = {}; CH.mats = null; CH.rm = null; CH.lastKey = '';
  }
  /* 沙域四野单株：棕榈与沙漠资材件，走 tree() 同款注册回收 */
  function palmOne(x, z, seed) {
    var r = rng('pm' + seed + x + z);
    var nm = NATPALM[hash('pk' + seed + x + z) % NATPALM.length];
    var g = spawn('nature', nm, natTex(nm), { x: x, z: z, ry: r() * 6.28, s: 0.8 + r() * 0.5, solid: false, autodoor: false, shadow: true });
    return g ? natReg(g, '棕榈') : null;
  }
  function sdOne(nm, x, z, r) {
    /* 旷野散件同尺：沙丘那一档原本一颗就盖住半个地块 */
    var g = spawn('desert', nm, null, { x: x, z: z, ry: r() * 6.28, s: (/^SD_Hill/.test(nm) ? 0.17 + r() * 0.14 : 0.8 + r() * 0.6), solid: false, autodoor: false, shadow: true });
    return g ? natReg(g, '沙物') : null;
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
    if (Math.abs(x0) < CHUNK / 2 + 5 && !inWater(0, z0 - CHUNK / 2) && !inWater(0, z0 + CHUNK / 2)) {
      if (!CH.rg) CH.rg = new T.PlaneGeometry(9, CHUNK + 0.5);
      if (!CH.rm) CH.rm = new T.MeshLambertMaterial({ color: st.sand ? 0xe6d4a4 : 0xd9c69a });
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
      if (inWater(px, pz)) continue; // 水面不生草木
      var t0 = r(), obj = null;
      if (st.sand) {
        /* 沙域四野：棕榈、旱树、岩石、沙丘——不长温带阔叶林 */
        if (t0 < 0.3) obj = palmOne(px, pz, 'ck' + key + i);
        else if (t0 < 0.52) obj = rock(px, pz, 0.5 + r() * 1.4, 'ck' + key + i);
        else if (t0 < 0.72) obj = outcrop(px, pz, 'cko' + key + i);
        else if (t0 < 0.88) obj = sdOne('SD_Tree', px, pz, r);
        else obj = sdOne('SD_Hill', px, pz, r);
      }
      else if (t0 < 0.48) obj = tree(px, pz, ['green', 'green', 'pink', 'autumn', 'pine'][Math.floor(r() * 5)], 'ck' + key + i);
      else if (t0 < 0.64) obj = tree(px, pz, 'pine', 'ckb' + key + i);
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
        if (Math.abs(px2) > mw + 10 && !inWater(px2, pz2)) {
          if (st.sand) {
            /* 沙域远山：直接上沙漠山体资材（SD_Mt/SD_Plateau 成组连脉），不用程序灰岩 */
            var mtn = 1 + (hash('mtn' + key) % 3);
            for (var mi = 0; mi < mtn; mi++) {
              var mnm = r() < 0.3 ? ('SD_Plateau_0' + (1 + (r() * 5 | 0)))
                                  : ('SD_Mt_' + ('0' + (1 + (r() * 10 | 0))).slice(-2));
              var mx2 = px2 + (r() - .5) * mw * 1.8, mz2 = pz2 + (r() - .5) * mw * 1.8;
              var mg2 = spawn('desert', mnm, null, { x: mx2, z: mz2, ry: r() * 6.28, s: (0.34 + r() * 0.46) * Math.max(1, mh / 26), solid: false, autodoor: false, shadow: true });
              if (mg2) { natReg(mg2, '沙山'); if (mg2.parent) mg2.parent.remove(mg2); g.add(mg2); }
            }
            aprons.push({ x: px2, z: pz2, w: mw });
          } else {
            var mg = massif(mw, mh, 'ck' + key);
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
    var st = (function () { var pk = medPalKey(Z.cityKey); return pk ? medSt(pk) : null; })() || Z.medStCur || STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
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
  /* 键名必须与中原引擎分开：zj3d_view2 被 ZJ3D 共写，在周卡点过「漫游」会让罗马卡
     一进来就是 walk 模式，inBuild() 恒假、营造栏整套消失，而且极难自查。 */
  try { var _v0 = localStorage.getItem('med3d_view2'); if (_v0 === 'walk' || _v0 === 'build') Z.view = _v0; } catch (e) { }
  Z.bcam = { fx: 0, fz: 20, yaw: 0.6, pitch: 0.85, dist: 60 };
  Z.B = null;                // 幽灵态 {item, obj, cx, cz, ry, valid, movingId}
  Z.sel = null;              // 选中的已建 {rec, root}
  Z.placedRoots = [];
  function inBuild() { return Z.expanded && Z.view === 'build' && (Z.mode === 'city' || (Z.mode === 'interior' && Z.intPlan)); }

  /* ---------------- 国库 ---------------- */
  var ECON = { gold: 5000, stamp: 0, RATE: 30 }; // 岁入 金30/分钟
  try {
    var _e = JSON.parse(localStorage.getItem('med3d_econ') || '{}');
    if (typeof _e.gold === 'number') ECON.gold = _e.gold;
    if (typeof _e.stamp === 'number') ECON.stamp = _e.stamp;
  } catch (e) { }
  function econSave() { try { localStorage.setItem('med3d_econ', JSON.stringify({ gold: ECON.gold, stamp: ECON.stamp })); } catch (e) { } }
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
  /* 两台引擎是两个独立闭包，各自在初始化时把整份 zj3d_builds_v1 读进内存、
     之后又把自己那份整个写回。同一次会话里先在罗马造几栋、再走到洛邑造一栋，
     后写的一方就用页面加载时的陈旧副本把前一座城的营造记录整批抹掉（金币还照扣）。
     所以：环海侧换用自己的键，并且每次落盘前先回读合并，彻底消除整份覆盖。 */
  var BK = 'med3d_builds_v1';
  try { BUILDS = JSON.parse(localStorage.getItem(BK) || 'null') || JSON.parse(localStorage.getItem('zj3d_builds_v1') || '{}'); } catch (e) { }
  function buildsSave() {
    try {
      var cur = {}; try { cur = JSON.parse(localStorage.getItem(BK) || '{}') || {}; } catch (e2) { }
      for (var k in BUILDS) if (Object.prototype.hasOwnProperty.call(BUILDS, k)) cur[k] = BUILDS[k];
      localStorage.setItem(BK, JSON.stringify(cur));
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
    Base: '基座', Brick: '什物', Door: '甲胄', Floor: '铺地', Misc: '舟楫', Pillar: '石柱', Roof: '草木',
    Stair: '阶梯', Stairs: '阶梯', Stall: '市摊', Wall: '庶民', Window: '陈设', Wood: '工具',
    Building: '屋舍', Extra: '军械',
    Bridge: '石桥', Gazeebo: '神庙', Mausoleum: '圣所', Palace: '殿宇', Plaque: '旗幡',
    Sculpture: '神像', Threater: '剧场', Tower: '高塔',
    Bed: '床榻', Cabinet: '立柜', Case: '木箱', Chair: '座椅', Cloth: '衣架', Couch: '矮榻',
    Cover: '罩门', Desk: '书案', Partition: '多宝阁', Screen: '屏风', Table: '案几'
  };
  function dispName(pack, name) {
    if (pack === 'nature') {
      var nm2 = name.match(/_(\d+)$/), ni = nm2 ? +nm2[1] : 0;
      var base2 = /Tropic/.test(name) ? '棕榈' : /^Tree_/.test(name) ? '乔木' : /^Hill/.test(name) ? '丘陵' : /^Plateau/.test(name) ? '台山' : '山岳';
      return base2 + (ni ? '·' + (ni <= 10 ? cnum(ni) : ni) : '');
    }
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
      disp: '大道', price: 70, make: function (x, z, s) {
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
  try { var _lg = JSON.parse(localStorage.getItem('med3d_ledger') || 'null'); if (_lg && _lg.built && _lg.razed) LEDGER = _lg; } catch (e) { }
  function ledgerSave() { try { localStorage.setItem('med3d_ledger', JSON.stringify(LEDGER)); } catch (e) { } }
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
    var msg = '（' + HERO() + '颁营造清单于史官，本轮于' + (cities.join('、') || Z.cityKey) + '：' + parts.join('；') + '。国库现余金' + ECON.gold + '，役夫既发，坊市为之一新。）';
    if (window.ZJ3D_say) ZJ3D_say(msg);
    LEDGER = { built: [], razed: [] }; ledgerSave(); updateBuildHud();
  }
  var CATALOG = null;
  function catalog() {
    if (CATALOG) return CATALOG;
    function pack2items(pk, filt) {
      return Z.packs[pk].names.filter(filt).map(function (nm) {
        return { kind: 'model', pack: pk, name: nm, disp: dispName(pk, nm), price: priceOf(pk, nm) };
      }).sort(function (a, b) {
        var fa = a.disp.split('·')[0], fb = b.disp.split('·')[0];
        if (fa !== fb) return fa.localeCompare(fb, 'zh');
        var na = +(a.name.match(/_(\d+)$/) || [0, 0])[1], nb = +(b.name.match(/_(\d+)$/) || [0, 0])[1];
        return (na - nb) || (a.name < b.name ? -1 : 1);
      });
    }
    CATALOG = [
      { tab: '市井', lab: 'VICVS·民居', items: pack2items('ancient', function (n) { return n.indexOf('_Env_') < 0 || /_Env_Stall_/.test(n); }) },
      { tab: '王室', lab: 'REGIA·宫殿', items: pack2items('historic', function (n) { return n.indexOf('_Env_') < 0; }) },
      { tab: '家具', lab: 'SVPELLEX·家具', items: pack2items('interior', function () { return true; }) },
      { tab: '沙漠', lab: 'DESERTVM·沙漠', items: (Z.packs.desert && Z.packs.desert.names && Z.packs.desert.names.length) ? pack2items('desert', function () { return true; }) : [] },
      {
        tab: '构件', lab: 'OPVS·构件', items: pack2items('ancient', function (n) { return n.indexOf('_Env_') >= 0 && !/_Env_Stall_/.test(n); })
          .concat(pack2items('historic', function (n) { return n.indexOf('_Env_') >= 0; }))
      },
      {
        tab: '道路', lab: 'VIA·道路', items: Object.keys(ROADS).map(function (k) {
          return { kind: 'road', name: k, disp: ROADS[k].disp, price: ROADS[k].price };
        })
      },
      {
        tab: '草木', lab: 'SILVA·草木', items: Object.keys(FLORA).map(function (k) {
          return { kind: 'flora', name: k, disp: FLORA[k].disp, price: FLORA[k].price };
        }).concat(pack2items('nature', function () { return true; }))
      },
      {
        tab: '人物', lab: 'POPVLVS·人物', items: Object.keys(NPC_TYPES).map(function (k) {
          return { kind: 'npc', name: k, disp: NPC_TYPES[k].disp, price: NPC_TYPES[k].price };
        }).concat(Object.keys(HIST).map(function (k) {
          return { kind: 'npc', name: k, disp: HIST[k].disp, price: HIST[k].price };
        }))
      },
      {
        tab: '军旅', lab: 'LEGIO·军团', items: Object.keys(TROOPS).map(function (k) {
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
    var st = (function () { var pk = medPalKey(Z.cityKey); return pk ? medSt(pk) : null; })() || Z.medStCur || STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
    var tex = pack === 'ancient' ? Z.tex[hanTex(st.anc)] : pack === 'historic' ? Z.tex[hanTex(st.his)]
      : selfTex(pack) ? null                              /* 自带贴图：幽灵只染色不换图 */
      : Z.tex[hanTex('LowpolyHistoricInterior_Texture_01.png')];
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
      var _pk = Z.packs && Z.packs[hanPack(item.pack)];
      var tpl = _pk && _pk.lib && _pk.lib[item.name];
      var inf = info(item.pack, item.name);
      var o = tpl.clone(true);
      o.position.y = -inf.minY;
      var g = new T.Group(); g.add(o);
      g.add(pickProxy(inf.size.x, inf.size.y, inf.size.z));
      Z.scene.add(g); B.obj = g;
    } else if (item.kind === 'npc') {
      var t0 = NPC_TYPES[item.name] || HIST[item.name];
      B.obj = makePawn(pawnCfg(t0, 'b' + (item.bid || item.name))); Z.scene.add(B.obj);
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
        if (selfTex(B.item.pack)) {
          /* 自带贴图的包不换材质：把自身材质复制一份调透明，再拿绿／红去染，
             形体和本色都留着，只是半透明加一层可否落位的提示色。 */
          if (!B._gm) {
            B._gm = [];
            B.obj.traverse(function (m) {
              if (m.isMesh && !m.userData.proxy) {
                m.material = m.material.clone();
                m.material.transparent = true; m.material.opacity = 0.62; m.material.depthWrite = false;
                B._gm.push(m.material);
              }
            });
          }
          for (var gi = 0; gi < B._gm.length; gi++) B._gm[gi].color.setHex(B.valid ? 0x9fe89f : 0xe89a9a);
        } else {
          var mat = ghostMat(B.item.pack, B.valid);
          B.obj.traverse(function (m) { if (m.isMesh && !m.userData.proxy) m.material = mat; });
        }
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
    var st = (function () { var pk = medPalKey(Z.cityKey); return pk ? medSt(pk) : null; })() || Z.medStCur || STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
    var root = null;
    if (rec.kind === 'model') {
      var tex = rec.pack === 'ancient' ? st.anc : rec.pack === 'historic' ? st.his : rec.pack === 'nature' ? natTex(rec.name)
        : selfTex(rec.pack) ? null                        /* 自带贴图：一律不重刷 */
        : 'LowpolyHistoricInterior_Texture_01.png';
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
      // 点击人物/军旅/贝罗娜：弹窗或预备移驾
      if (!Z.B) {
        var proots = Z.pawns.map(function (p) { return p.root; });
        if (Z.player && Z.player.parent) proots.push(Z.player);
        var ph = proots.length ? pickAt(e, proots) : null;
        if (ph) {
          var oo = ph, isP = false;
          while (oo) { if (oo.userData && oo.userData.isPlayer) { isP = true; break; } oo = oo.parent; }
          if (isP) { // 点中主角 → 预备移驾（点目标格瞬移）
            Z.tp = { phase: 'armed' };
            Z.sel = null; Z.actor = null; Z.selNpc = null;
            updateBuildHud();
            return;
          }
          var pw = pawnOf(ph);
          if (pw) {
            if (pw.own && pw.tag === 'unit' && Z.actor !== pw) setActor(pw);
            if (pw.tag === 'escort') {
              Z.actor = { escort: true, name: '禁卫军', root: Z.player, tag: 'unit', own: true };
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
      // 点空地：已选军旅即行军（禁卫军不离驾巡地）
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

  /* 移驾：贝罗娜瞬移至目标格，卫队随驾列位 */
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
  /* 横向拖动滚动。
     只写 overflow-x:auto 是不够的：桌面鼠标压根拖不动滚动容器（只能用滚动条或
     shift+滚轮），触摸端这里又叠在三维画布的手势层上，原生 pan 未必轮得到。
     所以自己接指针事件来拖；顺带把竖直滚轮映射成横滚。
     拖动超过阈值才算滚动，并在这一次抬手时吃掉 click——否则一拖就误选了物品。 */
  function dragScroll(el) {
    if (!el || el._dragBound) return;
    el._dragBound = 1;
    var down = false, moved = false, sx = 0, sl = 0, pid = null;
    var vx = 0, lastX = 0, lastT = 0, glide = 0;          /* 惯性：松手后按末速滑行 */
    function stopGlide() { if (glide) { cancelAnimationFrame(glide); glide = 0; } }
    el.style.touchAction = 'pan-x';   /* 触摸交给浏览器原生横向 pan（带惯性），别跟它抢 */
    el.style.cursor = 'grab';
    /* 按下即开始拖，浏览器同时也在拉文字选区——两边抢同一个手势，拖起来发涩，
       松手还留一片反白。整条滚动带里没有一个字需要选中，直接禁掉。 */
    el.style.userSelect = 'none'; el.style.webkitUserSelect = 'none';
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;  /* 触摸走原生 */
      if (e.button != null && e.button !== 0) return;
      if (el.scrollWidth <= el.clientWidth + 1) return;   /* 装得下就不劫持 */
      el._eatClick = 0;                                   /* 新一次交互开始，清掉上次拖动留下的吃点标志 */
      stopGlide();
      down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; pid = e.pointerId;
      vx = 0; lastX = e.clientX; lastT = performance.now();
      /* 这里原来立刻 setPointerCapture。按 Pointer Events 规范，指针一旦被捕获，
         随后那次 click 就要投递到捕获元素上——于是建造清单里每张卡的 onclick 全成了空炮：
         点下去 click 落在滚动容器身上，卡片自己一次都收不到，物品选不了。
         （页签行没这毛病纯属侥幸：九个页签装得下，上面那句 scrollWidth 检查直接 return 了。）
         捕获推迟到真正开始拖（moved 置真）的那一刻——拖动照旧不丢指针，点击照旧命中卡片。 */
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) < 4) return;             /* 4px 之内仍当点击 */
      if (!moved) { try { el.setPointerCapture(pid); } catch (_) { } }
      moved = true;
      el.scrollLeft = sl - dx;
      el.style.cursor = 'grabbing';
      var now = performance.now(), dt = now - lastT;
      /* dt 太小就跳过：两次事件挤在同一毫秒（或掉了一帧）时 dx/dt 会算出离谱的速度，
         松手后能一路滑到底。取样间隔至少 4ms，并把末速钳在 ±2.2px/ms 以内。 */
      if (dt >= 4) {
        var v = (e.clientX - lastX) / dt;
        if (v > 2.2) v = 2.2; else if (v < -2.2) v = -2.2;
        vx = vx * 0.7 + v * 0.3;                          /* 指数平滑，免得被最后一帧的抖动带偏 */
        lastX = e.clientX; lastT = now;
      }
      e.preventDefault();
    });
    function up(e) {
      if (!down) return;
      down = false; el.style.cursor = 'grab';
      try { el.releasePointerCapture(pid); } catch (_) { }
      /* 这次是拖不是点：吃掉随之而来的那一次 click。
         标志在下一次 pointerdown 时清，不靠定时器——定时器在连续操作里来不及生效。 */
      if (moved) el._eatClick = 1;
      /* 松手不硬停：按末速滑行并逐帧衰减，碰到两端就收住 */
      if (moved && Math.abs(vx) > 0.05) {
        var vv = vx;
        (function run() {
          vv *= 0.94;
          if (Math.abs(vv) < 0.02) { glide = 0; return; }
          var before = el.scrollLeft;
          el.scrollLeft -= vv * 16;
          if (Math.abs(el.scrollLeft - before) < 0.5) { glide = 0; return; }
          glide = requestAnimationFrame(run);
        })();
      }
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', function (e) {
      if (el._eatClick) { e.stopPropagation(); e.preventDefault(); }
    }, true);
    el.addEventListener('wheel', function (e) {
      if (el.scrollWidth <= el.clientWidth + 1) return;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      el.scrollLeft += d; e.preventDefault();
    }, { passive: false });
  }
  function ensureBuildHud(host) {
    if (bHud.wrap && bHud.wrap.parentNode === hud) return;
    bHud._openedSession = false; // 新建/重建 HUD 时复位，好让「进营造自动弹清单」对新托盘重新生效
    var w = document.createElement('div');
    w.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    // 国库
    var gold = document.createElement('div');
    gold.style.cssText = isTouch() ? 'order:0;padding:3px 9px;background:rgba(6,6,6,.66);border:1px solid rgba(236,236,232,.22);color:#ecc878;font-size:8.5px;letter-spacing:.04em;border-radius:0;display:none;white-space:nowrap' : 'position:absolute;top:8px;left:50%;transform:translateX(-50%);padding:3px 12px;background:rgba(6,6,6,.66);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(201,155,63,.55);color:#ecc878;font-size:10.5px;letter-spacing:.1em;border-radius:0;display:none;white-space:nowrap';
    (isTouch() && Z._topRow ? Z._topRow : w).appendChild(gold); bHud.goldChip = gold;
    // 模式切换
    var vb = document.createElement('div');
    vb.style.cssText = 'order:5;padding:3px 9px;background:rgba(6,6,6,.62);-webkit-backdrop-filter:blur(3px) saturate(140%);backdrop-filter:blur(3px) saturate(140%);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:8.5px;letter-spacing:.22em;cursor:pointer;border-radius:0;white-space:nowrap';
    /* 室内一律先出门：Z.toggleView 开头就 if(Z.mode!=='city')return，
       在屋里点它等于点了个死钮，出不去也切不了模式。 */
    vb.onclick = function () { if (Z.intPlan || Z.mode === 'interior') { exitInterior(); return; } Z.toggleView(); };
    (Z._topRow || w).appendChild(vb); bHud.viewBtn = vb;
    // 托盘开关
    var tb = document.createElement('div');
    /* DICTVM 指令栏已移除，右下角空出来了，挪回去 */
    tb.style.cssText = 'position:absolute;right:8px;bottom:8px;padding:' + (isTouch() ? '4px 10px' : '6px 14px') + ';background:rgba(6,6,6,.7);border:1px solid rgba(201,155,63,.6);color:#ecc878;font-size:' + (isTouch() ? '9px' : '9.5px') + ';letter-spacing:.22em;cursor:pointer;pointer-events:auto;border-radius:0;display:none';
    tb.textContent = isTouch() ? '清单' : 'OPERA·建造清单';
    /* 首次进营造把钮点成金底黑字，让人一眼看见「这里能开清单」；点过一次即恢复常态。
       比自动弹托盘温和——不遮画面，但也不至于像以前那样完全没人发现得了。 */
    tb._hi = function (on) {
      tb.style.background = on ? 'rgba(201,155,63,.92)' : 'rgba(6,6,6,.7)';
      tb.style.color = on ? '#0a0a0a' : '#ecc878';
    };
    tb.onclick = function () {
      bHud._openedSession = true; tb._hi(false);
      /* 面板每次打开都被宿主强制回到 tier 0（=未展开），此时 inBuild() 恒假、
         营造 UI 整套不渲染——玩家点开三维就再也找不到建造栏。所以这个钮自己负责
         把层级抬到营造档：一次点击到位，不必先去面板里找那个「OPVS·建造」。 */
      if (!inBuild()) {
        Z.view = 'build';
        try { localStorage.setItem('med3d_view2', Z.view); } catch (e) { }
        if (!Z.tier || Z.tier < 1) {
          Z.tier = 1; Z.expanded = true;
          try { localStorage.setItem('med3d_tier', '1'); localStorage.setItem('med3d_expand', '1'); } catch (e) { }
          if (window.ZJ3D_onExpand) window.ZJ3D_onExpand();   /* 宿主据此把面板放大 */
        }
        updateHud(); updateBuildHud();
      }
      bHud.tray.style.display = bHud.tray.style.display === 'none' ? 'block' : 'none';
      fillTray();
    };
    w.appendChild(tb); bHud.trayBtn = tb;
    // 奏报（集中通报本轮兴作/拆除）
    var rb = document.createElement('div');
    rb.style.cssText = 'position:absolute;right:' + (isTouch() ? '62px' : '142px') + ';bottom:8px;padding:' + (isTouch() ? '4px 10px' : '6px 14px') + ';background:rgba(6,6,6,.7);border:1px solid rgba(236,236,232,.22);color:#d9d9d4;font-size:' + (isTouch() ? '9px' : '9.5px') + ';letter-spacing:.22em;cursor:pointer;pointer-events:auto;border-radius:0;display:none';
    rb.onclick = function () { submitLedger(); };
    w.appendChild(rb); bHud.reportBtn = rb;
    // 托盘
    var mob = isTouch();
    var tray = document.createElement('div');
    tray.style.cssText = 'position:absolute;left:6px;right:6px;bottom:' + (mob ? '38px' : '44px') + ';height:' + (mob ? '96px' : '132px') + ';background:rgba(6,6,6,.7);-webkit-backdrop-filter:blur(6px) saturate(140%);backdrop-filter:blur(6px) saturate(140%);border:1px solid rgba(236,236,232,.22);border-radius:0;pointer-events:auto;display:none;backdrop-filter:blur(3px)';
    var tabs = document.createElement('div');
    /* 八个页签的总宽（约 660px）远超托盘可见宽（手机上约 360px），而这里原本
       没有任何 overflow 设置——后四类「道路／草木／人物／军旅」整个落在框外，
       既看不见也滑不到。给它横向滚动，并把滚动条藏掉。 */
    tabs.style.cssText = 'display:flex;gap:2px;padding:' + (mob ? '2px 4px 0' : '4px 6px 0') +
      ';overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex:none';
    tabs.className = 'zjNoBar';
    tray.appendChild(tabs); bHud.tabsEl = tabs;
    var list = document.createElement('div');
    list.style.cssText = 'display:flex;gap:' + (mob ? '4px' : '6px') + ';overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;contain:paint;will-change:scroll-position;padding:' + (mob ? '4px' : '6px') + ';height:' + (mob ? '66px' : '96px') + ';scrollbar-width:thin';
    tray.appendChild(list); bHud.listEl = list;
    dragScroll(tabs); dragScroll(list);   /* 光有 overflow-x 是拖不动的，见下 */
    tray.className = 'zjTray';   /* 交给宿主动效层：弹出时自下滑入 */
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
    b.style.cssText = 'padding:' + (isTouch() ? '4px 9px' : '4px 12px') + ';cursor:pointer;font-size:' + (isTouch() ? '10px' : '11px') + ';letter-spacing:.12em;white-space:nowrap;border:1px solid ' + (danger ? 'rgba(176,101,90,.55);color:#c98f82' : 'rgba(236,236,232,.25);color:#d9d9d4') + ';border-radius:0;user-select:none';
    b.textContent = txt; b.onclick = fn; return b;
  }
  function fillTray() {
    if (!bHud.tray || bHud.tray.style.display === 'none') return;
    var cats = catalog();
    if (Z.mode === 'interior') { cats = cats.filter(function (c) { return c.tab === '家具'; }); if (bHud.tab >= cats.length) bHud.tab = 0; }
    bHud.tabsEl.innerHTML = '';
    /* 页签行装不下就得横着拖，而这一行只有二十几个像素高，抓都不好抓——
       九个大项本来就该一眼看全，不是用来拖的。所以先按完整名（OPVS·构件）排一遍，
       量一下溢不溢；溢了就整行退回短名（构件），窄屏一次就装下，根本不必拖。 */
    function paint(short) {
      bHud.tabsEl.innerHTML = '';
      cats.forEach(function (c, i) {
        var t = document.createElement('div');
        t.textContent = short ? (c.tab || c.lab) : (c.lab || c.tab);
        /* flex:none + nowrap：页签横向滚动时不许被压扁或折行，否则挤成一团照样点不着 */
        t.style.cssText = 'flex:none;white-space:nowrap;padding:' + (isTouch() ? '2px 9px' : short ? '3px 10px' : '3px 14px') + ';cursor:pointer;font-size:' + (isTouch() ? '9.5px' : '10.5px') + ';letter-spacing:' + (short ? '.10em' : '.16em') + ';border-radius:0;' +
          (i === bHud.tab ? 'background:transparent;color:#ecc878;border:1px solid rgba(201,155,63,.6);border-bottom:none' : 'color:#6b6b66;border:1px solid transparent');
        t.onclick = function () { bHud.tab = i; fillTray(); };
        bHud.tabsEl.appendChild(t);
      });
    }
    paint(false);
    if (bHud.tabsEl.scrollWidth > bHud.tabsEl.clientWidth + 1) paint(true);
    /* 短名仍装不下（超窄屏）才真要拖——那就至少把选中的那一项带进视野，
       免得拖完一看，高亮的页签留在框外。 */
    if (bHud.tabsEl.scrollWidth > bHud.tabsEl.clientWidth + 1) {
      var cur = bHud.tabsEl.children[bHud.tab];
      if (cur && cur.scrollIntoView) try { cur.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (_) { }
    }
    var listEl = bHud.listEl;
    listEl.innerHTML = '';
    var mob = isTouch();
    var cw = mob ? 56 : 76, chh = mob ? 62 : 92, tw = mob ? 42 : 60, th = mob ? 32 : 52;
    cats[bHud.tab].items.forEach(function (item) {
      var card = document.createElement('div');
      /* 卡片一律不要 backdrop-filter：一屏 45 张，每张都是一个独立的毛玻璃层，
         底下还是实时渲染的三维画布——每滚一帧合成器要把 45 块背景重新模糊一遍，
         拖起来就黏。托盘本身已经有一层毛玻璃了，卡片用不透明底色即可，观感几乎没差别。 */
      card.className = 'zjCard';
      card.style.cssText = 'flex:none;width:' + cw + 'px;height:' + chh + 'px;background:rgba(10,10,10,.82);border:1px solid rgba(236,236,232,.18);border-radius:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:2px;gap:1px';
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
      pr.style.cssText = 'font-size:' + (mob ? '8.5px' : '8.5px') + ';color:' + (afford ? '#8a8a85' : '#a05a4e');
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
    /* 缓存键要带上换皮之后的槽名：同一个「殿宇」，在漠北是地中海那件，
       进了汉地城是中式那件——键里不写，第一次渲染出来的图就一直粘着不换。 */
    var key = item.kind + '/' + hanPack(item.pack || '') + '/' + item.name;
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
        var st = (function () { var pk = medPalKey(Z.cityKey); return pk ? medSt(pk) : null; })() || Z.medStCur || STATES[(LOC2[Z.cityKey] || { st: 'zhou' }).st];
        var tex = item.pack === 'ancient' ? Z.tex[hanTex(st.anc)] : item.pack === 'historic' ? Z.tex[hanTex(st.his)]
          : selfTex(item.pack) ? null                     /* 自带贴图：缩略图照原样渲染 */
          : Z.tex[hanTex('LowpolyHistoricInterior_Texture_01.png')];
        var _pk2 = Z.packs && Z.packs[hanPack(item.pack)];
        if (!_pk2 || !_pk2.lib || !_pk2.lib[item.name]) return null;
        obj = _pk2.lib[item.name].clone(true);
        if (tex) {
          var mm = new T.MeshLambertMaterial({ map: tex });
          obj.traverse(function (m) { if (m.isMesh) m.material = mm; });
        }
      } else if (item.kind === 'npc') {
        var nt = NPC_TYPES[item.name] || HIST[item.name];
        if (!nt) { el.style.background = '#3a4a34'; THUMB.cache[key] = ''; return; }
        obj = makePawn(pawnCfg(nt, 'th' + item.name));   /* 缩略图用固定种子：每次重画都换脸会闪 */
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
    if (on) { econTick(); bHud.goldChip.textContent = isTouch() ? ('金 ' + ECON.gold.toLocaleString()) : ('AERARIVM·金 ' + ECON.gold.toLocaleString() + ' · +' + ECON.RATE + '/分'); }
    /* 常驻：只要三维就绪、人在城里，这个钮就一直在。
       原来绑死 inBuild()，而面板每次打开都被打回 tier 0（未展开），
       于是建造栏在玩家眼里就是「彻底出不来」。抬层级的活交给它自己的 onclick。 */
    var trayReachable = Z.ready && (Z.mode === 'city' || (Z.mode === 'interior' && Z.intPlan));
    bHud.trayBtn.style.display = trayReachable ? 'block' : 'none';
    bHud.trayBtn.textContent = isTouch()
      ? (on ? '清单' : '建造')
      : (on ? 'OPERA·建造清单' : 'OPERA·建造');
    if (bHud.reportBtn) {
      var lc = ledgerCount();
      bHud.reportBtn.style.display = (on && lc > 0) ? 'block' : 'none';
      bHud.reportBtn.textContent = isTouch() ? ('ACTA·' + lc + '（发AI）') : ('ACTA·通报·' + lc + '（发送给AI）');
    }
    /* 建造清单默认收起：一进来先让人看见三维场景本身，清单按钮就在顶排，想盖房子再点开。
       （旧行为是首次进营造即自动弹出，整幅画面被物品格挡住，看不到城。）
       离开营造(on=false)一律收起并复位。 */
    if (!on) { bHud._openedSession = false; bHud.tray.style.display = 'none'; bHud._autoTier = -1; }
    /* 一档（小）只让人先看清城，不弹清单；放大到二档／三档就自动把清单摆出来——
       那两档的画面本来就够高，清单不会把场景压没。同一档只自动弹一次，
       玩家手动收起后不再违逆他。 */
    if (on && Z.tier >= 1 && bHud._autoTier !== Z.tier) {
      bHud._autoTier = Z.tier;
      if (bHud.tray.style.display === 'none') {
        bHud.tray.style.display = 'block';
        bHud._openedSession = true;
        try { fillTray(); } catch (e) { }
      }
    }
    if (on && Z.tier < 1) bHud._autoTier = -1;   /* 缩回一档：下次再放大还要自动弹 */
    if (bHud.trayBtn && bHud.trayBtn._hi)
      bHud.trayBtn._hi(trayReachable && !bHud._openedSession);
    /* 室内即便没开陈设规划，也要留这个出口钮；否则进屋后营造 UI 全灭、无路可退 */
    bHud.viewBtn.style.display = Z.expanded ? 'block' : 'none';
    bHud.viewBtn.textContent = (Z.intPlan || Z.mode === 'interior') ? 'EXI·回城' : (Z.view === 'build' ? 'ITER·漫游' : 'OPVS·建造');
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
        if (window.ZJ3D_say) ZJ3D_say('（' + HERO() + '与' + np.name + '（' + np.cat + '）开启对话。）');
        Z.selNpc = null; updateBuildHud();
      }));
      if (np.tag === 'escort' && inBuild()) {
        nb.appendChild(mkBtn('增员·金' + GUARD_COST, function () { escortAdd(); }));
        nb.appendChild(mkBtn('减员·返' + GUARD_REFUND, function () { escortSub(); }, true));
      }
      var unitAtk = inBuild() && Z.actor && Z.actor !== np && np.tag !== 'escort' && Z.actor.root.parent;
      if (unitAtk) {
        nb.appendChild(mkBtn('攻击', function () {
          if (Z.actor.escort) {
            if (Z.escort.length) Z.orders.push({ unit: Z.actor, type: 'escortAtk', target: np, phase: 'march' });
          } else {
            Z.orders = Z.orders.filter(function (o) { return o.unit !== Z.actor; });
            Z.orders.push({ unit: Z.actor, type: 'attack', target: np, phase: 'march' });
          }
          Z.selNpc = null; updateBuildHud();
        }, true));
      } else if (Z.player && !(np.tag === 'escort' && np.own)) {
        /* 亲自出手：冲步挥剑动画 + 报一轮神谕 */
        nb.appendChild(mkBtn('攻击', function () {
          playerStrike(np);
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
          wrap.style.cssText = 'display:flex;align-items:center;gap:3px;color:#9c9c98;font-size:10px;white-space:nowrap' + (mob0 ? ';flex:1 1 40px;min-width:40px' : '');
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
          if (bHud.gAxis) { axBtn.style.background = 'rgba(201,160,99,.25)'; axBtn.style.color = '#ecc878'; }
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
      tl.style.cssText = 'color:#a9cbb8;font-size:10.5px;letter-spacing:.06em;white-space:nowrap';
      if (Z.tp.phase === 'confirm') {
        tl.textContent = '移驾至 ' + posName(Math.round(Z.tp.x / CELL), Math.round(Z.tp.z / CELL)) + '？';
        sb.appendChild(tl);
        sb.appendChild(mkBtn('✓ 移驾', function () { doTeleport(); }));
        sb.appendChild(mkBtn('✕', function () { Z.tp = null; updateBuildHud(); }, true));
      } else {
        tl.textContent = '已选 ' + HERO() + ' · 点目标地点即可前往';
        sb.appendChild(tl);
        sb.appendChild(mkBtn('✕', function () { Z.tp = null; updateBuildHud(); }, true));
      }
    } else if (on && !Z.sel && !Z.B && !Z.selNpc && Z.actor && Z.actor.root.parent) {
      sb.style.display = 'flex'; sb.innerHTML = '';
      var al = document.createElement('div');
      al.style.cssText = 'color:#a9cbb8;font-size:10.5px;letter-spacing:.06em;white-space:nowrap';
      al.textContent = Z.actor.escort ? '已选 禁卫军（' + Z.escort.length + '人）· 点目标即出击' : '已选 ' + Z.actor.name + ' · 点地行军，点目标可攻可谈';
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
    try { localStorage.setItem('med3d_view2', Z.view); } catch (e) { }
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
  /* 手持道具（两种人形通用） */
  /* 火柴人（资材未至时的兜底） */
  /* 装束骨架人：基础体+衣壳五段刚体骨架，发/盔挂头，盾挂左臂，道具挂右臂随摆 */

  /* 棋子系统已抽到共用模块（两引擎同一份），此处只做绑定与转发 */
  function pawnBind() {
    if (!window.ZJ_PAWN) return false;
    window.ZJ_PAWN.bind({ T: T, nmat: nmat, mat: matFor(MTEX),
      lib: Z.packs.pawn && Z.packs.pawn.lib, rig: Z.pawnRig, used: USED });
    return true;
  }
  /* 共用模块理论上必先于本引擎就位（它只有 8KB，而本引擎要等几十 MB 的包），
     万一没到也只能给个空组，绝不能返回 null 让调用方炸掉。 */
  function makePawn(cfg) {
    if (!pawnBind()) return new T.Group();
    return window.ZJ_PAWN.make(cfg) || new T.Group();
  }
  function makePawnStick(cfg) {
    if (!pawnBind()) return new T.Group();
    return window.ZJ_PAWN.stick(cfg) || new T.Group();
  }
  function rigSwing(root, t, moving, sp) {
    if (!window.ZJ_PAWN) return;
    return window.ZJ_PAWN.swing(root, t, moving, sp);
  }

  /* ---------------- 人物类别（那个时代的百业众生） ---------------- */
  var NPC_TYPES = {
    shi: { disp: '哲人', cat: '哲', price: 90, cfg: { robe: 0x3e6e8e, band: 0x2c3844, hat: 'flat', prop: 'slip' }, desc: '从游柱廊之下，言必称先贤' },
    nong: { disp: '农人', cat: '农', price: 30, cfg: { robe: 0x8a6a3a, band: 0x6a4a24, hat: 'cone', prop: 'hoe' }, desc: '躬耕陇亩，岁望丰穰' },
    gong: { disp: '匠人', cat: '工', price: 55, cfg: { robe: 0x5e6e78, band: 0x3e4a52, hat: 'scarf', prop: 'axe' }, desc: '斧凿在手，营造天下' },
    shang: { disp: '商贾', cat: '商', price: 110, cfg: { robe: 0x7e4e8e, band: 0xc9a063, hat: 'scarf', prop: 'bundle' }, desc: '通有无于列海，第纳里叮当' },
    guan: { disp: '文吏', cat: '吏', price: 220, cfg: { robe: 0x2c2836, band: 0xc9a063, hat: 'flat', prop: 'slip' }, desc: '执牍奉册，趋走于会堂' },
    jiang: { disp: '将军', cat: '将', price: 480, cfg: { robe: 0x5e2e2a, band: 0x8a6a48, hat: 'plume', prop: 'sword' }, desc: '甲胄在身，不拜' },
    fangshi: { disp: '星士', cat: '星占', price: 150, cfg: { robe: 0xe8e2d4, band: 0x9a8a6a, hat: 'bun', prop: 'staff' }, desc: '夜观星象，言命数悬于天球' },
    yueshi: { disp: '乐师', cat: '乐', price: 120, cfg: { robe: 0x4e7e6e, band: 0x2e5e4e, hat: 'bun', prop: 'qin' }, desc: '抚琴吹笛，乐与政通' },
    shiguan: { disp: '史官', cat: '史', price: 180, cfg: { robe: 0x3a3a44, band: 0x9d8c6b, hat: 'flat', prop: 'slip' }, desc: '秉笔直书，君举必书' },
    wuzhu: { disp: '祭司', cat: '祭', price: 140, cfg: { robe: 0x6e3e7e, band: 0xc9a063, hat: 'bun', prop: 'staff' }, desc: '司香火牺牲，占鸟飞之兆' },
    youxia: { disp: '角斗士', cat: '斗', price: 200, cfg: { robe: 0x4a4a52, band: 0xa63b26, hat: 'scarf', prop: 'sword' }, desc: '生死一掷，观者如堵' },
    rusheng: { disp: '修辞生', cat: '辩', price: 100, cfg: { robe: 0x6e8ea8, band: 0x3e5e78, hat: 'flat', prop: 'slip' }, desc: '习修辞于广场，出口成章' },
    mozhe: { disp: '犬儒', cat: '犬儒', price: 100, cfg: { robe: 0x3a3a32, band: 0x5a5a4a, hat: 'scarf', prop: 'staff' }, desc: '一袍一杖，白昼提灯寻真人' },
    shuike: { disp: '辩士', cat: '雄辩', price: 260, cfg: { robe: 0x8e6e3e, band: 0xc9a063, hat: 'flat', prop: 'fan' }, desc: '一言纵横列国，谈笑可弭刀兵' },
    yizhe: { disp: '医者', cat: '医', price: 160, cfg: { robe: 0x5e7e5e, band: 0x3e5e3e, hat: 'scarf', prop: 'bundle', bundleC: 0x8ec455 }, desc: '望闻问切，起死人肉白骨' },
    buzhe: { disp: '肠卜官', cat: '卜', price: 130, cfg: { robe: 0x7e7e6e, band: 0x5e5e4e, hat: 'bun', prop: 'slip' }, desc: '剖读牺牲，鸟飞定吉凶' },
    yufu: { disp: '渔父', cat: '渔', price: 40, cfg: { robe: 0x4e6e7e, band: 0x3e5a66, hat: 'cone', prop: 'rod' }, desc: '撒网海湾，鱼汛即天时' },
    qiaofu: { disp: '樵夫', cat: '樵', price: 40, cfg: { robe: 0x6a5a3a, band: 0x4a3e28, hat: 'cone', prop: 'axe' }, desc: '担柴唱晚，不问城中事' },
    muren: { disp: '牧童', cat: '牧', price: 35, cfg: { robe: 0x7e9e5e, band: 0x5e7e44, hat: 'cone', prop: 'staff', s: 0.8 }, desc: '驱羊过丘，芦笛自吹' },
    paoren: { disp: '庖人', cat: '庖', price: 60, cfg: { robe: 0x9e7e5e, band: 0x7e5e3e, hat: 'scarf', prop: 'none' }, desc: '鱼酱蜜酒，宴客如仪' },
    zhinu: { disp: '织女', cat: '织', price: 60, cfg: { robe: 0xc88aa8, band: 0xa86a88, hat: 'bun', prop: 'none' }, desc: '机杼声声，锦成文章' },
    yinshi: { disp: '隐士', cat: '隐', price: 150, cfg: { robe: 0x8e9e8e, band: 0x6e7e6e, hat: 'cone', prop: 'staff' }, desc: '凤兮凤兮，何德之衰' },
    dizi: { disp: '弟子', cat: '学', price: 50, cfg: { robe: 0x9eb0c0, band: 0x6e8ea8, hat: 'bun', prop: 'slip', s: 0.9 }, desc: '负笈从师，问道于途' },
    yushou: { disp: '驭手', cat: '御', price: 80, cfg: { robe: 0x6e5e4e, band: 0x4e3e2e, hat: 'scarf', prop: 'staff' }, desc: '六辔在手，过都邑必式' }
  };
  /* 历史人物（可招纳 + 各城常驻） */
  var HIST = {
    laodan: { disp: '苏格拉底', cat: '雅典哲人', price: 1500, cfg: { robe: 0xe8e2d4, band: 0x9a8a6a, hat: 'bun', prop: 'staff' }, desc: '自知其无知，饮鸩而不悔' },
    gongshu: { disp: '阿基米德', cat: '天下巧匠', price: 1200, cfg: { robe: 0x5e6e78, band: 0xc9a063, hat: 'scarf', prop: 'axe' }, desc: '予我一支点，可撬动大地' },
    kongzi: { disp: '亚里士多德', cat: '学园之宗', price: 1500, cfg: { robe: 0x6e8ea8, band: 0x3e5e78, hat: 'flat', prop: 'slip', s: 1.1 }, desc: '吾爱吾师，吾更爱真理' },
    yanhui: { disp: '毕达哥拉斯', cat: '数之宗师', price: 600, cfg: { robe: 0x9eb0c0, band: 0x6e8ea8, hat: 'bun', prop: 'slip' }, desc: '万物皆数，琴弦有理' },
    zilu: { disp: '列奥尼达', cat: '温泉关王', price: 600, cfg: { robe: 0x5e4e3e, band: 0xa63b26, hat: 'scarf', prop: 'sword' }, desc: '带盾归来，或卧盾上' },
    changhong: { disp: '品达', cat: '竖琴诗宗', price: 800, cfg: { robe: 0x4e7e6e, band: 0xc9a063, hat: 'flat', prop: 'qin' }, desc: '颂歌献给竞技的胜者' },
    yinxi: { disp: '希罗多德', cat: '史学之父', price: 700, cfg: { robe: 0x3e6e8e, band: 0x9d8c6b, hat: 'flat', prop: 'slip' }, desc: '行万里路，录万邦事' },
    shangyang: { disp: '梭伦', cat: '立法者', price: 1200, cfg: { robe: 0x2c2836, band: 0xc9a063, hat: 'flat', prop: 'slip' }, desc: '立法而后周游，十年不改一字' },
    baiqi: { disp: '汉尼拔', cat: '迦太基战神', price: 1500, cfg: { robe: 0x2a2a32, band: 0x8a6a48, hat: 'plume', prop: 'sword' }, desc: '翻越阿尔卑斯，罗马为之震怖' },
    lianpo: { disp: '大西庇阿', cat: '罗马良将', price: 1200, cfg: { robe: 0x5e2e2a, band: 0x8a6a48, hat: 'plume', prop: 'spear' }, desc: '扎马一战，雪坎尼之耻' },
    linxiangru: { disp: '西塞罗', cat: '共和之舌', price: 1000, cfg: { robe: 0x8e6e3e, band: 0xc9a063, hat: 'flat', prop: 'slip' }, desc: '一篇雄辩，可抵一军' },
    yanying: { disp: '伊索', cat: '寓言家', price: 1000, cfg: { robe: 0x2c2836, band: 0x9d8c6b, hat: 'flat', prop: 'fan', s: 0.85 }, desc: '狐狸与葡萄，尽在寓中' },
    zouyan: { disp: '泰勒斯', cat: '米利都智者', price: 900, cfg: { robe: 0x6e3e7e, band: 0x9a8a6a, hat: 'flat', prop: 'slip' }, desc: '预言日食，言万物源于水' },
    yueyi: { disp: '亚历山大', cat: '征服者', price: 1200, cfg: { robe: 0x33528f, band: 0x8a6a48, hat: 'plume', prop: 'sword' }, desc: '至世界尽头而泣，无地可征' },
    jingke: { disp: '布鲁图斯', cat: '弑君者', price: 1300, cfg: { robe: 0x4a4a52, band: 0xa63b26, hat: 'scarf', prop: 'sword' }, desc: '这一击，为了共和' },
    xinlingjun: { disp: '伯里克利', cat: '雅典第一人', price: 1200, cfg: { robe: 0x3a8f86, band: 0xc9a063, hat: 'flat', prop: 'fan' }, desc: '我们的城邦，是全希腊的学校' },
    hanfei: { disp: '修昔底德', cat: '严谨史家', price: 1200, cfg: { robe: 0x3f7d4e, band: 0x2c3844, hat: 'flat', prop: 'slip' }, desc: '强者行其所能，弱者忍其所必忍' },
    quyuan: { disp: '荷马', cat: '盲游吟者', price: 1300, cfg: { robe: 0xa63b26, band: 0x6e3e7e, hat: 'flat', prop: 'slip' }, desc: '歌阿喀琉斯之怒，吟奥德修斯之归' },
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
    '罗马': ['laodan', 'gongshu', 'changhong', 'kongzi'],
    '函谷关': ['yinxi'],
    '迦太基': ['shangyang', 'baiqi'],
    '雅典': ['lianpo', 'linxiangru'],
    '亚历山卓': ['yanying', 'zouyan'],
    '曲阜': ['kongzi', 'yanhui', 'zilu'],
    '拜占庭': ['yueyi', 'jingke'],
    '叙拉古': ['xinlingjun'],
    '科林斯': ['hanfei'],
    '斯巴达': ['quyuan', 'yangyouji'],
    '宛': ['bianque'],
    '姑苏': ['sunwu', 'wuzixu'],
    '会稽': ['fanli', 'xishi'],
    '陶邑': ['fanli'],
    '商丘': ['gongshu'],
    '成都': ['xuxing'],
    '灵寿': ['lianpo']
  };
  /* 军旅编制 */
  /* 头面候选。第二项是一组而非一个：原来每个职业钉死一个头，满街同一张脸，
     而其中大半又指向头顶本就是光的模型（资材里唯一盖得住头顶的男式发型只有
     Long_Hair），于是玩家看到的是「男的全秃，而且秃得一模一样」。
     Long_Hair 多给几个名额是有意的——它是唯一的满头，靠发色拉开区别。 */
  var M_HAIR = ['Long_Hair', 'Long_Hair', 'Long_Hair', 'Mid_Hair'];   /* 男子日常 */
  var M_WORK = ['Farmer_Hat', 'Farmer_Hat', 'Long_Hair'];             /* 户外劳作：多戴笠 */
  var M_LONG = ['Long_Hair', 'Long_Hair', 'Mid_Hair'];                /* 方外之人：一律蓄发 */
  /* 秃顶模型不再进平民池——只留给 HIST 里确实上了年纪的那几位（老聃、公输班、
     商鞅、晏婴），在 HIST_FIT 里逐个指定。 */
  var PAWN_FIT = { /* 市井日常皆着衣：shorts/skirt（袒身装）只留给角斗与竞技场面 */
    shi: ['siderobe', M_HAIR], nong: ['fisher', M_WORK], gong: ['fisher', M_HAIR], shang: ['citizen', M_HAIR],
    guan: ['normal', M_HAIR], jiang: ['mcart', 'Helmet_Mohawk'], fangshi: ['siderobe', M_LONG],
    yueshi: ['fshoulder', 'Hair_Bun_High'], shiguan: ['normal', M_HAIR], wuzhu: ['fpriest', 'Hair_Tiara'],
    youxia: ['mglad', 'Helmet_Face_Mask'], rusheng: ['citizen', M_HAIR], mozhe: ['siderobe', M_HAIR],
    shuike: ['siderobe', M_HAIR], yizhe: ['normal', M_HAIR], buzhe: ['fpriest', 'Hair_Bun_Low'],
    yufu: ['fisher', M_WORK], qiaofu: ['fisher', M_WORK], muren: ['citizen', M_HAIR], paoren: ['citizen', M_HAIR],
    zhinu: ['fdress', 'Hair_Bun_Mid'], yinshi: ['siderobe', M_LONG], dizi: ['citizen', M_HAIR], yushou: ['fisher', M_HAIR]
  };
  /* 候选组存进 _heads，head 仍写一个缺省值——没改造过的调用点照旧拿得到东西。
     第三项为真＝长者，发色走灰白。 */
  function fitApply(tab, store) {
    Object.keys(tab).forEach(function (k) {
      var t = store[k]; if (!t) return;
      var h = tab[k][1], pool = Array.isArray(h) ? h : [h];
      t.cfg.outfit = tab[k][0];
      t.cfg._heads = pool;
      t.cfg.head = pool[0];
      if (tab[k][2]) t.cfg._old = 1;
    });
  }
  fitApply(PAWN_FIT, NPC_TYPES);
  /* 发色。不给 hairC 的话 makePawn 里 dress() 会把躯干贴图刷到头发上，
     头发与头皮同色，等于没做头发——这是「男的全秃」的另一半原因。 */
  var HAIR_C = [0x1a1410, 0x241a12, 0x2b2118, 0x35271a, 0x43311f];   /* 黑 → 深褐 → 褐 */
  var HAIR_OLD = [0x6e675c, 0x8a8378, 0x9c968c];                     /* 灰白，长者 */
  /* 同职业的人不该长同一张脸：按各自的种子在候选里挑头面、挑发色。
     必须返回浅拷贝——NPC_TYPES[k].cfg 是所有同类共享的那一份，就地改会串味。 */
  function pawnCfg(t, seed) {
    if (!t || !t.cfg) return null;
    var c = {}, src = t.cfg;
    for (var k in src) c[k] = src[k];
    seed = String(seed == null ? '' : seed);
    var pool = src._heads;
    if (pool && pool.length > 1) c.head = pool[hash(seed) % pool.length];
    if (c.head && !c.hairC && !/Helmet|Hat/.test(c.head)) {
      var pal = src._old ? HAIR_OLD : HAIR_C;
      c.hairC = pal[hash(seed + 'hc') % pal.length];
    }
    return c;
  }
  /* 具名人物各有其貌，不参与随机。秃顶只留给确实上了年纪的几位（老聃、公输班、
     商鞅、晏婴），并且第三项置 1 走灰白发色——读起来是「老」，不是「没做头发」。
     颜回三十二而卒、屈原正当盛年、蔺相如为完璧之使，原来都顶着秃头，一并改掉。 */
  /* [服装, 头面, 执盾, 长者]。第三项一向是执盾，别挪；长者另开第四项，
     它只影响发色（灰白），不影响别的。
     秃顶只留给确实上了年纪的几位（老聃、公输班、商鞅、晏婴）。颜回三十二而卒、
     屈原正当盛年、蔺相如为完璧之使、邹衍游说诸侯——原来都顶着秃头，一并改掉。 */
  var HIST_FIT = {
    laodan: ['siderobe', 'Bald_and_Long_Hair', 0, 1], gongshu: ['fisher', 'Half_Bald', 0, 1], kongzi: ['siderobe', 'Long_Hair', 0, 1], yanhui: ['citizen', 'Long_Hair'],
    zilu: ['corhop', 'Spartan_Mohawk_Helmet', 1], changhong: ['citizen', 'Long_Hair'], yinxi: ['normal', 'Long_Hair'], shangyang: ['siderobe', 'Half_Bald', 0, 1],
    baiqi: ['mcart', 'Helmet_650_BC'], lianpo: ['athhop', 'Helmet_Mohawk', 1], linxiangru: ['normal', 'Long_Hair'], yanying: ['normal', 'Bald_and_Long_Hair', 0, 1],
    zouyan: ['siderobe', 'Long_Hair'], yueyi: ['corhop', 'Helmet_Atheniens', 1], jingke: ['normal', 'Long_Hair'],
    xinlingjun: ['corhop', 'Helmet_Without_Mohawk'], hanfei: ['normal', 'Long_Hair'], quyuan: ['siderobe', 'Long_Hair']
  };
  Object.keys(HIST_FIT).forEach(function (k) {
    if (!HIST[k]) return;
    var f = HIST_FIT[k], c = HIST[k].cfg;
    c.outfit = f[0]; c.head = f[1]; c._heads = [f[1]];   /* 具名人物不随机，池里就一个 */
    if (f[2]) c.shield = 1;
    if (f[3]) c._old = 1;
  });
  var TROOPS = {
    zu: { disp: '军团兵', count: 1, price: 60, cols: 1 },
    wu: { disp: '一什', count: 5, price: 260, cols: 5 },
    ying: { disp: '百人队', count: 20, price: 950, cols: 5 },
    jun: { disp: '一大队', count: 48, price: 2100, cols: 8 }
  };
  var SOLDIER_CFG = { robe: 0x3a3a42, band: 0x8a6a48, chest: 0x4a4a52, hat: 'plume', hatC: 0x3a3a42, prop: 'spear', outfit: 'athhop', head: 'Helmet_Mohawk', shield: 1 };
  var NAME_POOL = ['盖乌斯', '卢修斯', '马库斯', '提图斯', '昆图斯', '塞克图', '普布利', '格奈乌', '奥卢斯', '曼利乌', '德基乌', '弗拉维', '尤利乌', '瓦莱里', '科尔涅', '霍拉提'];

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
      var g = null; try { g = makePawn(pawnCfg(t, 'cast' + nm)); } catch (e) { return; }
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
    var root = makePawn(pawnCfg(t, 'rec' + (rec.id || rec.disp)));
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
    regPawn(root, { name: rec.disp, cat: '军团·' + rec.count + '人', desc: '闻鼓则进，闻金则退', tag: 'unit', recId: rec.id, own: true, count: rec.count, state: 'idle' });
    return root;
  }
  /* 城中众生（种子化，非存档） */
  function spawnAmbient(locName) {
    var r = rng('folk' + locName);
    var keys = Object.keys(NPC_TYPES);
    var n = Math.round((46 + (hash(locName) % 14)) * LOD()); /* 大城配大人口 */
    for (var i = 0; i < n; i++) {
      var key = keys[Math.floor(r() * keys.length)];
      var t = NPC_TYPES[key];
      var a = r() * 6.28, d = 12 + r() * 95;
      var x = Math.sin(a) * d, z = Math.cos(a) * d;
      var root = makePawn(pawnCfg(t, locName + 'amb' + i));
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
      var root = makePawn(pawnCfg(h, 'hist' + hk));
      var a = 1.2 + i * 1.5, d = 18 + i * 9;
      root.position.set(Math.sin(a) * d, 0, Math.cos(a) * d - 10);
      Z.scene.add(root);
      regPawn(root, { name: h.disp, cat: h.cat, desc: h.desc, tag: 'hist', wander: 6 });
    });
  }

  /* ---------------- 游走 / 军令 / 战斗 tick ---------------- */
  function rigTick(dt) {
    for (var i = 0; i < Z.pawns.length; i++) { var r = Z.pawns[i].root; if (r.parent) rigSwing(r, dt); }
    if (Z.player && !Z.strike) rigSwing(Z.player, dt);
  }
  /* 亲自出手：冲步至身前一挥，结果交神谕裁断 */
  function playerStrike(np) {
    if (!Z.player || !np.root.parent) return;
    var tp = np.root.position, pp = Z.player.position;
    var dx = tp.x - pp.x, dz = tp.z - pp.z, d = Math.hypot(dx, dz) || 1;
    Z.strike = {
      t: 0, dur: 0.8, sx: pp.x, sz: pp.z,
      gx: tp.x - dx / d * 1.05, gz: tp.z - dz / d * 1.05,
      tgt: np, yaw: Math.atan2(dx, dz)
    };
    if (window.ZJ3D_say) ZJ3D_say('（' + HERO() + '亲自拔剑出手，攻击' + np.name + '（' + np.cat + '）！这一击已然挥出：请神谕裁断此击结果与在场众人反应。）');
  }
  function strikeTick(dt) {
    var s = Z.strike; if (!s) return;
    var pl = Z.player; if (!pl) { Z.strike = null; return; }
    s.t += dt; var k = Math.min(1, s.t / s.dur);
    var dash = Math.min(1, k / 0.4);
    pl.position.x = s.sx + (s.gx - s.sx) * dash;
    pl.position.z = s.sz + (s.gz - s.sz) * dash;
    pl.rotation.y = s.yaw;
    var R = pl.userData.rig;
    /* 摆角限于肩盖可遮范围内，力度感由全身前倾补足（大角度会撕开肩缝） */
    if (R && R.armR) R.armR.rotation.x = k < 0.4 ? (-0.85 * (k / 0.4)) : (-0.85 + 1.35 * ((k - 0.4) / 0.6));
    if (R && R.torso) R.torso.rotation.z = k < 0.4 ? 0 : Math.sin((k - 0.4) * 5.2) * 0.08;
    pl.rotation.x = Math.sin(k * Math.PI) * 0.12;
    var tg = s.tgt;
    if (k > 0.6 && tg && tg.root.parent) tg.root.rotation.z = Math.sin((k - 0.6) * 16) * 0.14 * (1 - k);
    if (k >= 1) {
      if (tg && tg.root.parent) tg.root.rotation.z = 0;
      if (R && R.armR) R.armR.rotation.x = 0;
      if (R && R.torso) R.torso.rotation.z = 0;
      pl.rotation.x = 0;
      Z.strike = null;
    }
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
      msg = '（' + HERO() + '敕命' + atk.name + '攻击' + nm + '（' + cat + '）。过程：兵刃骤起于' + city + '城' + pos + '，' + nm + '不及走避。结果：' + nm + '殒命，' + atk.name + '无伤。影响：城中震恐，市井奔散，民心动摇——史官秉笔直书，此事必载于史。）';
    } else {
      var aC = atk.count, dC = tgt.count;
      var aS = aC * 10 * (0.85 + Math.random() * 0.3);
      var dS = dC * 10 * (0.85 + Math.random() * 0.3);
      var dCas = Math.min(dC, Math.max(1, Math.round(aS / 22)));
      var aCas = Math.min(aC, Math.max(0, Math.round(dS / 30)));
      var dLeft = dC - dCas, aLeft = aC - aCas;
      var proc = '两军于' + city + '城' + pos + '交锋，戈矛相击，' + atk.name + '伤亡' + aCas + '人，' + tgt.name + '伤亡' + dCas + '人';
      var res, imp;
      if (dLeft <= 0 && aLeft > 0) { res = tgt.name + '全军覆没，' + atk.name + '余' + aLeft + '人'; imp = '军团大胜，鹰旗威震四方，然杀伐之气盈城'; }
      else if (aLeft <= 0 && dLeft > 0) { res = atk.name + '全军覆没，' + tgt.name + '余' + dLeft + '人'; imp = '军团折戟，罗马哗然，列邦侧目'; }
      else if (aLeft <= 0 && dLeft <= 0) { res = '两军俱灭，尸横遍地'; imp = '惨胜如败，城中缟素'; }
      else { res = atk.name + '余' + aLeft + '人，' + tgt.name + '余' + dLeft + '人，胜负未分而两军暂却'; imp = '兵连祸结，民心惶惶'; }
      // 应用伤亡
      if (dLeft <= 0) killPawn(tgt); else shrinkUnit(tgt, dLeft);
      if (aLeft <= 0) killPawn(atk); else if (aCas > 0) { var na = shrinkUnit(atk, aLeft); if (Z.actor === atk) setActor(na); }
      msg = '（' + HERO() + '敕命' + atk.name + '攻击' + tgt.name + '。过程：' + proc + '。结果：' + res + '。影响：' + imp + '。）';
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
  var RK = 'med3d_razed_v1';
  try { RAZED = JSON.parse(localStorage.getItem(RK) || 'null') || JSON.parse(localStorage.getItem('zj3d_razed_v1') || '{}'); } catch (e) { }
  function razedOf(loc) { return RAZED[loc] || (RAZED[loc] = []); }
  function razedSave() {
    try {
      var cur = {}; try { cur = JSON.parse(localStorage.getItem(RK) || '{}') || {}; } catch (e2) { }
      for (var k in RAZED) if (Object.prototype.hasOwnProperty.call(RAZED, k)) cur[k] = RAZED[k];
      localStorage.setItem(RK, JSON.stringify(cur));
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
      ZJ3D_say('（' + HERO() + '敕命' + atk.name + '于' + city + '城' + pos + '纵火焚除' + disp + '，草木化为焦炭，烟起数里。）');
    } else if (window.ZJ3D_say) {
      ZJ3D_say('（' + HERO() + '敕命' + atk.name + '攻毁' + city + '城' + pos + '之' + disp +
        '。过程：兵卒鼓噪而进，纵火焚椽，槌墙毁柱，梁木轰然而倒。结果：' + disp +
        '焚毁倾颓，化为瓦砾焦土。影响：烟尘蔽日，市人夺路奔走，物议汹汹——史官直书' + HERO() + '毁城，民心为之一沉。）');
    }
    updateBuildHud();
  }

  /* ============================================================
     叙事营造单：太史所记的兴作/毁损/人物来去，作用于当前城
     ============================================================ */
  var EDICT = { key: '', city: '', built: [], razed: [], razedRecs: [] };
  try { var _ed0 = JSON.parse(localStorage.getItem('med3d_edict') || 'null'); if (_ed0 && _ed0.key) EDICT = _ed0; } catch (e) { }
  function edictSave() { try { localStorage.setItem('med3d_edict', JSON.stringify(EDICT)); } catch (e) { } }
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
    '路': '石板道', '道': '石板道', '街': '石板道', '官道': '夯土官道',
    /* 以上沿自中原引擎（目标多为中式名，本引擎没有的会被 edictWord 自动跳过）。
       以下是罗马这边的常用说法，映射到本引擎真实存在的名物上。 */
    '宫殿': '殿宇', '宫室': '殿宇', '王宫': '殿宇', '府邸': '殿宇',
    '民居': '民宅', '住宅': '民宅', '人家': '民宅',
    '官仓': '粮仓', '仓廪': '粮仓', '谷仓': '粮仓',
    '神祠': '神庙', '祠庙': '神庙', '圣殿': '神庙',
    '望楼': '高塔', '哨塔': '高塔', '角楼': '高塔',
    '剧院': '剧场', '戏院': '剧场',
    '渡槽': '引水道', '水道': '引水道', '沟渠': '引水道',
    '议事堂': '元老院', '议院': '元老院',
    '作坊': '铁工坊', '锻坊': '铁工坊', '铁匠铺': '铁工坊',
    '摊': '市摊', '摊位': '市摊', '集市': '市摊'
  };
  var _dispSet = null;
  function dispSet() {                      /* 本引擎目录里真实存在的一级名 */
    if (_dispSet) return _dispSet;
    _dispSet = {};
    try {
      catalog().forEach(function (c) {
        (c.items || []).forEach(function (it) {
          _dispSet[String(it.disp || '').replace(/·.+$/, '')] = 1;
        });
      });
    } catch (e) { }
    return _dispSet;
  }
  function edictWord(w) {
    w = String(w || '').replace(/[的之一座座间栋所处株棵条段]/g, '').trim();
    /* 别名表是从中原引擎搬来的，一半的映射目标（民居／官仓／神祠／官署／宫室…）
       在本引擎的目录里并不存在。只有当别名指向的东西确实存在时才替换，
       否则保留原词——否则「民宅」会被换成不存在的「民居」，反而找不着。 */
    var a = EDICT_ALIAS[w];
    return (a && dispSet()[a]) ? a : w;
  }
  function edictMatch(word) {
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
  function edictResolve(word) {
    var raw = String(word || '').replace(/[的之一座座间栋所处株棵条段]/g, '').trim();
    if (!raw) return null;
    /* 别名表是从中原引擎照搬来的，映射目标还是中式名（民宅→民居、粮仓→官仓、
       神庙→神祠……），而本引擎的目录里压根没有这些名字——于是别名不但没帮上忙，
       反而把本来能直接命中的词打成了 null。改为：别名先试，试不出来退回原词。 */
    var alias = EDICT_ALIAS[raw];
    return (alias ? edictMatch(alias) : null) || edictMatch(raw);
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
      return { ok: true, report: unit.name + '已奉令开赴，兵锋直指' + disp + '——战果史官将另行奏报' };
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
    return { ok: true, report: unit.name + '已奉令开赴，直取' + np.name + '——战果史官将另行奏报' };
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
    if (!raw) return { ok: false, report: '指令为空' };
    if (!Z.ready || !Z.scene || Z.mode !== 'city' || !Z.cityKey) return { ok: false, report: '三维天下尚未就绪，请展开上方三维画面待城池加载完毕' };
    var m;
    m = /(?:攻打|攻击|讨伐|兵发|^攻|^伐)\s*(.+)$/.exec(raw); if (m) return cmdAttack(m[1]);
    m = /(?:拆除|拆掉|拆了|平毁|撤去|清除|^拆)\s*(.+)$/.exec(raw); if (m) return cmdRaze(m[1]);
    m = /^(?:找|寻访?|召见|见)\s*(.+)$/.exec(raw); if (m) return cmdFind(m[1]);
    m = /^(?:去|往|移步|行至|到)\s*(.+)$/.exec(raw); if (m) return cmdGo(m[1]);
    m = /(?:盖|修建|建造|营建|兴建|新建|起|造|修|铺设|铺|植|种|建)\s*(.+)$/.exec(raw); if (m) return cmdBuild(m[1], raw);
    return { ok: false, report: '未能辨识指令。可用：建马厩×2 ／ 拆酒楼 ／ 攻打粮仓 ／ 寻苏格拉底 ／ 去城南 ／ 前往斯巴达（各城邦）' };
  };

  /* ---------------- 账实读取口（供宿主的本地弱AI 用）----------------
     引擎的 ECON / LEDGER / BUILDS / catalog / posName 全在这个 IIFE 的闭包里，
     宿主一个都拿不到，于是「城里发生了什么」从来传不到 AI 那边。开三个只读口。 */
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

  /* ---------------- public hooks ---------------- */
  Z.toggleExpand = function () {
    Z.tier = ((Z.tier || 0) + 1) % 3;                       /* 三档：默认条→中景→大景→默认条 */
    Z.expanded = Z.tier > 0;
    try { localStorage.setItem('med3d_tier', String(Z.tier)); localStorage.setItem('med3d_expand', Z.expanded ? '1' : '0'); } catch (e) { }
    Z.camDist = Z.mode === 'interior' ? 7 : 12;
    if (window.ZJ3D_onExpand) window.ZJ3D_onExpand();
    updateHud(); if (bHud.wrap) updateBuildHud();
  };
  Z.sleep = function () { if (Z.asleep) return; Z.asleep = true; Z._sleptAt = performance.now(); };
  Z.wake = function () {
    if (!Z.asleep) return;
    Z.asleep = false;
    if (Z._torn) {
      /* 场景已经被拆干净了，室内陈设无论如何都回不去。原来 wake 不动 Z.mode，
         于是重新展开后 showLocation 第一行的 `if (Z.mode === 'interior') return;`
         直接返回，永远走不到 buildFor —— Z.scene 永远是 null，画面死锁。
         唯一正确的落点是回到城里。 */
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
  /* 退场清算：被文档实例守卫调用。旧文档一旦被换下，它那份场景、几何、贴图、
     渲染器与 WebGL 上下文若不主动放掉，整份死文档就在内存里赖着不走——
     一回合一份，正是「内存无上限」的另一半账。 */
  Z.dispose = function () {
    try { if (Z.raf) cancelAnimationFrame(Z.raf); } catch (_) { }
    try { disposeScene(); } catch (_) { }
    try {
      if (Z.scene) Z.scene.traverse(function (o) {
        if (!o.isMesh) return;
        try { if (o.geometry) o.geometry.dispose(); } catch (_) { }
        var ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(function (m) {
          if (!m) return;
          ['map', 'normalMap', 'roughnessMap', 'emissiveMap', 'alphaMap', 'aoMap'].forEach(function (k) {
            try { if (m[k] && m[k].dispose) m[k].dispose(); } catch (_) { }
          });
          try { m.dispose(); } catch (_) { }
        });
      });
    } catch (_) { }
    try { if (Z.rnd) { Z.rnd.dispose(); Z.rnd.forceContextLoss && Z.rnd.forceContextLoss(); } } catch (_) { }
    Z.rnd = null; Z.scene = null; Z.cv = null; Z.ready = false;
    Z.packs = null; Z.tex = null; Z.mats = null;
    Z.pawns = []; Z.colliders = []; Z.cityRoots = []; Z.placedRoots = [];
  };
  Z.reloadStore = function () {
    try { BUILDS = JSON.parse(localStorage.getItem(BK) || '{}') || {}; } catch (e) { }
    try { RAZED = JSON.parse(localStorage.getItem(RK) || '{}') || {}; } catch (e) { }
    try {
      var _e2 = JSON.parse(localStorage.getItem('med3d_econ') || '{}');
      /* 键不存在＝那份存档写下时还没花过钱，要回到初值，不能留着当前这一份 */
      if (_e2 && _e2.gold != null) { ECON.gold = _e2.gold; ECON.stamp = _e2.stamp; }
      else { ECON.gold = 5000; ECON.stamp = 0; }
    } catch (e) { }
    try { var _l2 = JSON.parse(localStorage.getItem('med3d_ledger') || 'null'); LEDGER = (_l2 && _l2.built && _l2.razed) ? _l2 : { built: [], razed: [] }; } catch (e) { }
    try { var _d2 = JSON.parse(localStorage.getItem('med3d_edict') || 'null'); EDICT = (_d2 && _d2.key) ? _d2 : { key: '', city: '', built: [], razed: [], razedRecs: [] }; } catch (e) { }
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
  Z.isLow = function () { return PERF.low; };
  Z.paneH = function (mob) {
    if (!Z.owns()) return mob ? 140 : 186;
    if (Z.tier === 2) return Math.round(window.innerHeight * (mob ? 0.52 : 0.58));
    if (Z.tier === 1) return Math.round(window.innerHeight * (mob ? 0.4 : 0.42));
    return mob ? 150 : 200;
  };
  Z.onRender = function (locName, night) {
    var host = document.getElementById('mdScene3D');
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
  Z.debugNature = function () {
    var st = medSt('latium');
    SEA = null; SHIPS = []; RIVER = null; AQUA = [];
    newScene(0x9fc9e4, 0xd6dfc9, 200, 1600, false);
    addGround(st, 320, [], [], []);
    var names = Z.packs.nature.names.slice().sort();
    for (var i = 0; i < names.length; i++) {
      var nm = names[i], mt = /Hill|Mount|Plat/.test(nm);
      spawn('nature', nm, natTex(nm), { x: (i % 9) * 30 - 120, z: Math.floor(i / 9) * 30 - 90, s: mt ? 14 : 1, solid: false, autodoor: false, shadow: true });
    }
    var mg1 = massif(20, 40, 'demoA'); mg1.position.set(-200, 0, 30); Z.scene.add(mg1);
    var mg2 = massif(13, 20, 'demoB'); mg2.position.set(200, 0, -40); Z.scene.add(mg2);
    placePlayer(0, 160, Math.PI);
    hudCity(st, 'NATVRA');
  };
  Z.debugCity = function (locName, night) {
    Z.night = !!night; Z.mode = 'city'; Z.cityKey = '';
    if (!Z.ready) { Z.pending = [locName, night]; loadAll(); return; }
    buildFor(locName); Z.cityKey = locName;
  };
  Z.debugPawns = function () {
    var st = medSt('latium');
    SEA = null; SHIPS = []; RIVER = null; AQUA = [];
    newScene(0x9fc9e4, 0xd6dfc9, 200, 1600, false);
    addGround(st, 220, [], [], []);
    var ks = Z.pawnRig ? Object.keys(Z.pawnRig.outfits) : [];
    var out = [];
    for (var i = 0; i < ks.length; i++) {
      var g = makePawn({ outfit: ks[i], head: i % 2 ? 'Mid_Hair' : 'Helmet_Mohawk', shield: i % 3 === 0, prop: i % 2 ? 'sword' : 'staff', robe: 0x666666, band: 0x444444 });
      g.position.set((i % 6) * 3 - 7.5, 0, Math.floor(i / 6) * 3 - 4.5);
      Z.scene.add(g);
      var bb = new T.Box3().setFromObject(g), sz = new T.Vector3(); bb.getSize(sz);
      out.push(ks[i] + ' h' + sz.y.toFixed(2) + ' w' + sz.x.toFixed(2));
    }
    placePlayer(0, 14, Math.PI);
    hudCity(st, 'PAWNS');
    return out;
  };
  Z.debugInterior = function (kind) { enterInterior(kind, kind); };
  // coverage report (dev)
  Z.debugCatalog = function () {
    var c = catalog(), out = {}, models = 0;
    c.forEach(function (t) { out[t.tab] = t.items.length; t.items.forEach(function (it) { if (it.kind === 'model') models++; }); });
    out['模型合计'] = models;
    out['资材包合计'] = ['ancient', 'historic', 'interior', 'nature'].reduce(function (a, k) { return a + Z.packs[k].names.length; }, 0);
    return out;
  };
  Z.coverage = function () {
    var out = {};
    ['ancient', 'historic', 'interior', 'nature'].forEach(function (pk) {
      var un = Z.packs[pk].names.filter(function (n) { return !(USED[pk] || {})[n]; });
      out[pk] = { total: Z.packs[pk].names.length, used: Z.packs[pk].names.length - un.length, unused: un };
    });
    return out;
  };
  loadAll();
})();
