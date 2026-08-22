/* 棋子系统 · 两引擎共用
   原本地中海引擎与中原引擎各存一份人物代码，已经漂成两套（一边有衣柜骨架、
   一边只剩圆柱火柴人），于是罗马纪走到中原城时女主会变回柱子。这里把整套抽出来，
   两边都从这一份取，改一处两边同时生效。
   宿主只需提供 ctx：{ T, nmat, lib, rig, mat, used }
     T    three 命名空间
     nmat 取纯色材质（宿主自带缓存）
     lib  棋子资材库（pawn.glb 的节点表），无则自动回落火柴人
     rig  pawn.json 里的关节与套装表
     mat  躯干贴图材质
     used 覆盖率统计表，可省 */
(function () {
  var CTX = null;
  var USED = { pawn: {} };
  function nmat(c) { return CTX.nmat(c); }   /* 纯色材质缓存留在宿主，两边各自复用自己的缓存 */

  function makePawnStick(cfg) {
    var g = new CTX.T.Group();
    var robe = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.22, 0.38, 1.05, 7), nmat(cfg.robe));
    robe.position.y = 0.56; robe.castShadow = true; g.add(robe);
    var band = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.23, 0.27, 0.12, 7), nmat(cfg.band || 0x8a6a48));
    band.position.y = 0.92; g.add(band);
    var chest = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.18, 0.23, 0.38, 7), nmat(cfg.chest || cfg.robe));
    chest.position.y = 1.24; chest.castShadow = true; g.add(chest);
    var head = new CTX.T.Mesh(new CTX.T.SphereGeometry(0.14, 8, 7), nmat(0xf0d8bc)); head.position.y = 1.56; g.add(head);
    var hair = new CTX.T.Mesh(new CTX.T.SphereGeometry(0.145, 8, 7), nmat(0x1a1512)); hair.scale.set(1, 0.7, 1); hair.position.y = 1.62; g.add(hair);
    pawnProps(g, cfg);
    pawnPick(g);
    if (cfg.s) g.scale.setScalar(cfg.s);
    return g;
  }
  function pawnProps(gt, cfg) {
    var pr = cfg.prop;
    if (pr === 'spear') { var p1 = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.022, 0.022, 2.1, 4), nmat(0x8a6a48)); p1.position.set(0.3, 1.05, 0); gt.add(p1); var tip = new CTX.T.Mesh(new CTX.T.ConeGeometry(0.05, 0.18, 4), nmat(0xb8bec6)); tip.position.set(0.3, 2.2, 0); gt.add(tip); }
    else if (pr === 'sword') { var p2 = new CTX.T.Mesh(new CTX.T.BoxGeometry(0.045, 0.72, 0.09), nmat(0x4a4a52)); p2.position.set(0.27, 0.82, 0.03); p2.rotation.z = 0.08; gt.add(p2); } /* 佩于右腰侧：旧版斜背在背后，远看像条甩动的辫子 */
    else if (pr === 'slip') { var p3 = new CTX.T.Mesh(new CTX.T.BoxGeometry(0.3, 0.05, 0.2), nmat(0xd9c69a)); p3.position.set(0.26, 1.05, 0.12); gt.add(p3); }
    else if (pr === 'qin') { var p4 = new CTX.T.Mesh(new CTX.T.BoxGeometry(0.55, 0.06, 0.2), nmat(0x6a4a30)); p4.position.set(0, 1.02, 0.24); p4.rotation.z = 0.3; gt.add(p4); }
    else if (pr === 'bundle') { var p5 = new CTX.T.Mesh(new CTX.T.SphereGeometry(0.2, 6, 5), nmat(cfg.bundleC || 0xa8845c)); p5.scale.set(1, 0.7, 0.8); p5.position.set(0, 1.5, -0.3); gt.add(p5); }
    else if (pr === 'hoe') { var p6 = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.02, 0.02, 1.5, 4), nmat(0x8a6a48)); p6.position.set(0.3, 0.85, 0); p6.rotation.z = 0.2; gt.add(p6); var bl = new CTX.T.Mesh(new CTX.T.BoxGeometry(0.2, 0.05, 0.05), nmat(0x6a6a72)); bl.position.set(0.42, 1.6, 0); gt.add(bl); }
    else if (pr === 'staff') { var p7 = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.025, 0.025, 1.7, 4), nmat(0x6a4a30)); p7.position.set(0.3, 0.85, 0); gt.add(p7); }
    else if (pr === 'fan') { var p8 = new CTX.T.Mesh(new CTX.T.ConeGeometry(0.16, 0.3, 6), nmat(0xf3e6ee)); p8.rotation.z = Math.PI / 2; p8.position.set(0.32, 1.15, 0); gt.add(p8); }
    else if (pr === 'axe') { var p9 = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.02, 0.02, 1.1, 4), nmat(0x8a6a48)); p9.position.set(0.3, 0.9, 0); gt.add(p9); var ax = new CTX.T.Mesh(new CTX.T.BoxGeometry(0.16, 0.14, 0.04), nmat(0x6a6a72)); ax.position.set(0.36, 1.38, 0); gt.add(ax); }
    else if (pr === 'rod') { var pa = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.015, 0.02, 1.9, 4), nmat(0x8a6a48)); pa.rotation.z = -0.6; pa.position.set(0.4, 1.3, 0); gt.add(pa); }
  }
  function pawnPick(g) {
    var pick = new CTX.T.Mesh(new CTX.T.CylinderGeometry(0.55, 0.55, 2.1, 6), new CTX.T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
    pick.position.y = 1.05; pick.userData.proxy = true; g.add(pick);
  }
  function makePawn(cfg) {
    var lib = CTX && CTX.lib, rig = CTX && CTX.rig;
    if (!lib || !rig || !cfg.outfit || !rig.outfits[cfg.outfit]) return makePawnStick(cfg);
    var g = new CTX.T.Group();
    var mt = CTX.mat;
    var J = rig.joints, of = rig.outfits[cfg.outfit];
    function dress(node) { node.traverse(function (ch) { if (ch.isMesh) { ch.material = mt; ch.castShadow = true; } }); return node; }
    function seg(nm, j) {
      var tpl = lib['PW_' + cfg.outfit + '_' + nm]; if (!tpl) return null;
      var gr = new CTX.T.Group(); gr.add(dress(tpl.clone(true)));
      gr.position.set(j[0], j[1], j[2] || 0);
      g.add(gr); return gr;
    }
    var R = {};
    if (of.rigid) { seg('all', [0, 0, 0]); }
    else {
      R.torso = seg('torso', [0, J.hip, 0]);
      R.armL = seg('armL', J.armL); R.armR = seg('armR', J.armR);
      R.legL = seg('legL', J.legL); R.legR = seg('legR', J.legR);
      /* 双臂垂直姿已在资材内软权重烘焙（肩0°→手17°渐变），此处不再刚性旋转以免肩缝断裂 */
      if (cfg.head && R.torso) {
        var at = lib['PW_at_' + cfg.head];
        if (at) {
          var hd = dress(at.clone(true));
          if (cfg.hairC) { var hm = new CTX.T.MeshLambertMaterial({ color: cfg.hairC }); hd.traverse(function (ch) { if (ch.isMesh) ch.material = hm; }); }
          R.torso.add(hd);
        }
      }
      if (cfg.shield && R.armL) {
        var sh = lib['PW_at_Roman_Shield'];
        if (sh) { var s2 = dress(sh.clone(true)); s2.position.set(-0.05, -0.42, 0.08); s2.rotation.y = Math.PI / 2; R.armL.add(s2); }
      }
      USED.pawn['PW_' + cfg.outfit + '_torso'] = 1;
    }
    g.userData.rig = R;
    if (cfg.prop) {
      var pg = new CTX.T.Group();
      pawnProps(pg, cfg);
      /* 道具挂躯干（原火柴人根空间坐标直接可用）：不随臂大摆，只随身微晃 */
      if (R.torso) { pg.position.set(0, -J.hip, 0); R.torso.add(pg); }
      else g.add(pg);
    }
    pawnPick(g);
    if (cfg.s) g.scale.setScalar(cfg.s);
    return g;
  }
  function rigSwing(root, dt) {
    var R = root.userData.rig; if (!R || !R.armL) return;
    if (!isFinite(dt) || dt <= 0) return;
    var ud = root.userData;
    var dx = root.position.x - (ud._px != null ? ud._px : root.position.x);
    var dz = root.position.z - (ud._pz != null ? ud._pz : root.position.z);
    ud._px = root.position.x; ud._pz = root.position.z;
    var sp = Math.hypot(dx, dz) / Math.max(dt, 1e-3);
    if (!isFinite(sp)) sp = 0;
    var target = sp > 0.25 ? Math.min(0.3, 0.14 + sp * 0.05) : 0; /* 摆幅收敛：小步自然，不再大开大合 */
    var a0 = isFinite(ud._amp) ? ud._amp : 0;
    ud._amp = a0 + (target - a0) * Math.min(1, dt * 6);
    var p0 = isFinite(ud._ph) ? ud._ph : 0;
    ud._ph = p0 + dt * (5 + Math.min(sp, 6) * 1.4);
    var sw = Math.sin(ud._ph) * ud._amp;
    R.armL.rotation.x = sw * 0.7; R.armR.rotation.x = -sw * 0.7;
    if (R.legL) R.legL.rotation.x = -sw * 1.1;
    if (R.legR) R.legR.rotation.x = sw * 1.1;
    if (R.torso) R.torso.rotation.z = Math.sin(ud._ph * 0.5) * ud._amp * 0.05;
  }

  window.ZJ_PAWN = {
    bind: function (ctx) { CTX = ctx; if (ctx && ctx.used) USED = ctx.used; },
    ready: function () { return !!(CTX && CTX.lib && CTX.rig); },
    make: function (cfg) { return makePawn(cfg); },
    stick: function (cfg) { return makePawnStick(cfg); },
    swing: function () { return rigSwing.apply(null, arguments); },
    used: function () { return USED; }
  };
})();
