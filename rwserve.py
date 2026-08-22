import http.server, functools
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # 只看路径，别把 ?perf=1 之类的查询串算进去——线上 vercel.json 的重写规则
        # 也是只匹配路径的，本地不剥掉就跟线上对不上。
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        if path in ('/', '/index.html'):
            self.path = '/core/vendor/three/build/chunks/9d717bc0/156a50943028.html'
        return super().do_GET()
http.server.ThreadingHTTPServer(('127.0.0.1', 8932), H).serve_forever()
