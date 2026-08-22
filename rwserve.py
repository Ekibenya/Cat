import http.server, functools
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.path = '/core/vendor/three/build/chunks/9d717bc0/156a50943028.html'
        return super().do_GET()
http.server.ThreadingHTTPServer(('127.0.0.1', 8932), H).serve_forever()
