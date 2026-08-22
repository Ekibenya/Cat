/* LVZHI.SYS · service worker
   壳层预缓存 + 其余按需缓存。素材总量近 200MB（三维包与乐曲），一次性全预下载既慢又
   会撑爆配额，所以只预存「打得开」所需的那几个档，其余用过哪个存哪个。 */
var V = 'lvzhi-v1';
var SHELL = [
  '/',
  '/manifest.webmanifest',
  '/core/res/icon/favicon.svg',
  '/core/res/icon/icon-192.png',
  '/core/res/icon/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(V).then(function (c) {
      /* 逐个放行：任何一个档挂掉都不该让整个安装失败（addAll 是全有全无的） */
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { return k === V ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u;
  try { u = new URL(r.url); } catch (_) { return; }
  /* 跨域一律不碰：AI 接口、生图接口、NovelAI 中转都必须原样直达 */
  if (u.origin !== location.origin) return;
  if (u.pathname.indexOf('/_vercel/') === 0) return;

  /* 文档：网络优先，断网时回落到上一次缓存的壳 */
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(function (res) {
        var cp = res.clone();
        caches.open(V).then(function (c) { c.put('/', cp).catch(function () {}); });
        return res;
      }).catch(function () {
        return caches.match('/').then(function (m) { return m || Response.error(); });
      })
    );
    return;
  }

  /* 代码类（脚本／清单／JSON）一律网络优先：它们带版本号也挡不住各种中间缓存，
     一旦拿到旧脚本，页面看着是新的、行为是旧的，最难查。断网时才回落缓存。 */
  if (/\.(js|mjs|json|webmanifest)$/i.test(u.pathname)) {
    e.respondWith(
      fetch(r).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var cp = res.clone();
          caches.open(V).then(function (c) { c.put(r, cp).catch(function () {}); });
        }
        return res;
      }).catch(function () {
        return caches.match(r).then(function (m) { return m || Response.error(); });
      })
    );
    return;
  }

  /* 其余素材（.dat／图片／字体）：缓存优先、后台回源刷新（stale-while-revalidate） */
  e.respondWith(
    caches.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) {
        if (res && res.ok && res.type === 'basic' && cacheable(res)) {
          var cp = res.clone();
          /* 配额满了就让它失败，浏览器自己按 LRU 淘汰，不影响本次返回 */
          caches.open(V).then(function (c) { c.put(r, cp).catch(function () {}); });
        }
        return res;
      }).catch(function () { return hit || Response.error(); });
      return hit || net;
    })
  );
});

/* 大档一律不进 SW 缓存：三维包与乐曲合计近 200MB，全存下来会把本站变成浏览器
   清理配额时的首选目标——而清理是按站点整体来的，会连 localStorage 里的存档一起抹掉。
   况且 /core/res/* 本来就带 immutable 长缓存，重访时浏览器自己的 HTTP 缓存已经接住了，
   SW 这一层只需要保证「打得开、能离线进菜单」。 */
var MAXB = 4 * 1024 * 1024;
function cacheable(res) {
  var n = parseInt(res.headers.get('content-length') || '', 10);
  /* 分块传输（压缩响应普遍如此）没有 content-length，parseInt 得到 NaN，
     而 NaN > MAXB 恒为 false —— 于是 !(false) === true，护栏形同虚设，
     近 200MB 的三维包与乐曲照单全收。拿不到长度时一律按「大档」处理。 */
  if (isNaN(n)) return false;
  return n <= MAXB;
}
