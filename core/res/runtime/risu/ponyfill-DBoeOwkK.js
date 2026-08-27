import { a as e, c as t, g as n, i as r, l as i, n as a, o, p as s, r as c, s as l, t as u, u as d } from "./browser-BOPsNcbU.js";
//#region node_modules/.pnpm/compression-streams-polyfill@0.1.7/node_modules/compression-streams-polyfill/esm/ponyfill.mjs
var f = (e) => {
	class t {
		constructor() {
			this.i = new e(), this.i.ondata = (e, t) => {
				this.ondata(null, e, t);
			};
		}
		push(e, t) {
			try {
				this.queuedSize += e.length, this.i.push(e, t), this.queuedSize -= e.length, this.ondrain && this.ondrain(e.length);
			} catch (e) {
				this.ondata(e, null, t || !1);
			}
		}
	}
	return t;
}, p = 1;
try {
	new u().terminate();
} catch {
	p = 0;
}
var m = p ? {
	gzip: c,
	deflate: o,
	"deflate-raw": u
} : {
	gzip: f(i),
	deflate: f(n),
	"deflate-raw": f(l)
}, h = p ? {
	gzip: a,
	deflate: e,
	"deflate-raw": r
} : {
	gzip: f(t),
	deflate: f(s),
	"deflate-raw": f(d)
}, g = (e, t, n) => {
	class r extends e {
		constructor(e) {
			if (!arguments.length) throw TypeError(`Failed to construct '${n}': 1 argument required, but only 0 present.`);
			let r = t[e];
			if (!r) throw TypeError(`Failed to construct '${n}': Unsupported compression format: '${e}'`);
			let i = new r(), a;
			super({
				start: (e) => {
					i.ondata = (t, n, r) => {
						t ? e.error(t) : n && (e.enqueue(n), r && (a ? a() : e.terminate()));
					};
				},
				transform: (e) => {
					if (e instanceof ArrayBuffer) e = new Uint8Array(e);
					else if (ArrayBuffer.isView(e)) e = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
					else throw TypeError("The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
					if (i.push(e), i.queuedSize >= 32768) return new Promise((e) => {
						i.ondrain = () => {
							i.queuedSize < 32768 && e();
						};
					});
				},
				flush: () => new Promise((e) => {
					a = e, i.push(new Uint8Array(), !0);
				})
			}, {
				size: (e) => e.byteLength | 0,
				highWaterMark: 65536
			}, {
				size: (e) => e.byteLength | 0,
				highWaterMark: 65536
			});
		}
	}
	return r;
};
function _(e) {
	return g(e, m, "CompressionStream");
}
function v(e) {
	return g(e, h, "DecompressionStream");
}
//#endregion
export { _ as makeCompressionStream, v as makeDecompressionStream };
