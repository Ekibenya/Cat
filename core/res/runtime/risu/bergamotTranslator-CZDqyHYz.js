import { i as e } from "./chunk-DeC0fbbY.js";
import { y as t } from "./browser-BOPsNcbU.js";
import { v as n } from "./characterCards-BhA9VRBa.js";
//#region node_modules/.pnpm/@browsermt+bergamot-translator@0.4.9/node_modules/@browsermt/bergamot-translator/translator.js
typeof window < "u" && window.Worker || (globalThis.Worker = class {
	#e;
	constructor(t) {
		this.#e = new Promise(async (n) => {
			let { Worker: r } = await import(
				/* webpackIgnore: true */
				"./__vite-browser-external-ruZKdfF3.js"
).then((t) => /* @__PURE__ */ e(t.default, 1));
			n(new r(t));
		});
	}
	addEventListener(e, t) {
		this.#e.then((n) => n.on(e, (e) => t({ data: e })));
	}
	postMessage(e) {
		this.#e.then((t) => t.postMessage(e));
	}
	terminate() {
		this.#e.then((e) => e.terminate());
	}
});
var r = class extends Error {}, i = class extends Error {}, a = class {
	constructor(e) {
		this.options = e || {}, this.registryUrl = this.options.registryUrl || "https://bergamot.s3.amazonaws.com/models/index.json", this.downloadTimeout = "downloadTimeout" in this.options ? parseInt(this.options.downloadTimeout) : 6e4, this.registry = this.loadModelRegistery(), this.buffers = /* @__PURE__ */ new Map(), this.pivotLanguage = "pivotLanguage" in this.options ? e.pivotLanguage : "en", this.models = /* @__PURE__ */ new Map(), this.onerror = this.options.onerror || ((e) => console.error("WASM Translation Worker error:", e));
	}
	async loadWorker() {
		let e = new Worker(new URL(
			/* @vite-ignore */
			"/assets/translator-worker-B0RljYAi.js",
			"" + import.meta.url
		)), t = 0, n = /* @__PURE__ */ new Map(), r = (r, ...i) => new Promise((a, o) => {
			let s = ++t;
			n.set(s, {
				accept: a,
				reject: o,
				callsite: {
					message: `${r}(${i.map((e) => String(e)).join(", ")})`,
					stack: (/* @__PURE__ */ Error()).stack
				}
			}), e.postMessage({
				id: s,
				name: r,
				args: i
			});
		});
		return e.addEventListener("message", function({ data: { id: e, result: t, error: r } }) {
			if (!n.has(e)) throw console.debug("Received message with unknown id:", arguments[0]), Error(`BergamotTranslator received response from worker to unknown call '${e}'`);
			let { accept: i, reject: a, callsite: o } = n.get(e);
			n.delete(e), r === void 0 ? i(t) : a(Object.assign(/* @__PURE__ */ Error(), r, {
				message: r.message + ` (response to ${o.message})`,
				stack: r.stack ? `${r.stack}\n${o.stack}` : o.stack
			}));
		}), e.addEventListener("error", this.onerror.bind(this)), await r("initialize", this.options), {
			worker: e,
			exports: new Proxy({}, { get(e, t, n) {
				if (t !== "then") return (...e) => r(t, ...e);
			} })
		};
	}
	async loadModelRegistery() {
		let e = await (await fetch(this.registryUrl, { credentials: "omit" })).json();
		return Array.from(Object.entries(e), ([e, t]) => ({
			from: e.substring(0, 2),
			to: e.substring(2, 4),
			files: t
		}));
	}
	getTranslationModel({ from: e, to: t }, n) {
		let r = JSON.stringify({
			from: e,
			to: t
		});
		if (!this.buffers.has(r)) {
			let i = this.loadTranslationModel({
				from: e,
				to: t
			}, n);
			this.buffers.set(r, i), i.catch((e) => this.buffers.delete(r));
		}
		return this.buffers.get(r);
	}
	async loadTranslationModel({ from: e, to: t }, n) {
		performance.mark(`loadTranslationModule.${JSON.stringify({
			from: e,
			to: t
		})}`);
		let r = (await this.registry).filter((n) => n.from == e && n.to == t);
		if (!r) throw Error(`No model for '${e}' -> '${t}'`);
		let a = r[0].files, o = () => reject(new i("abort signal")), s = new Promise((e, t) => {
			n?.signal && n.signal.addEventListener("abort", o);
		}), c = Object.fromEntries(await Promise.race([Promise.all(Object.entries(a).map(async ([r, i]) => {
			if (i === void 0 || i.name === void 0) return [r, null];
			try {
				return [r, await this.fetch(i.name, i.expectedSha256Hash, n)];
			} catch (n) {
				throw Error(`Could not fetch ${i.name} for ${e}->${t} model`, { cause: n });
			}
		})), s]));
		n?.signal && n.signal.removeEventListener("abort", o), performance.measure("loadTranslationModel", `loadTranslationModule.${JSON.stringify({
			from: e,
			to: t
		})}`);
		let l = [];
		if (c.vocab) l = [c.vocab];
		else if (c.trgvocab && c.srcvocab) l = [c.srcvocab, c.trgvocab];
		else throw Error(`Could not identify vocab files for ${e}->${t} model among: ${Array.from(Object.keys(a)).join(" ")}`);
		let u = {};
		return a.model.name.endsWith("intgemm8.bin") && (u["gemm-precision"] = "int8shiftAll"), a.qualityModel && (u["skip-cost"] = !1), a.config && Object.assign(u, a.config), {
			model: c.model,
			shortlist: c.lex,
			vocabs: l,
			qualityModel: c.qualityModel,
			config: u
		};
	}
	async fetch(e, t, n) {
		let r = new AbortController(), i = () => r.abort(), a = this.downloadTimeout ? setTimeout(i, this.downloadTimeout) : null;
		try {
			n?.signal && n.signal.addEventListener("abort", i);
			let a = {
				credentials: "omit",
				signal: r.signal
			};
			return t && (a.integrity = `sha256-${this.hexToBase64(t)}`), typeof window > "u" && delete a.integrity, await (await fetch(e, a)).arrayBuffer();
		} finally {
			a && clearTimeout(a), n?.signal && n.signal.removeEventListener("abort", i);
		}
	}
	hexToBase64(e) {
		return btoa(e.match(/\w{2}/g).map(function(e) {
			return String.fromCharCode(parseInt(e, 16));
		}).join(""));
	}
	getModels({ from: e, to: t }) {
		let n = JSON.stringify({
			from: e,
			to: t
		});
		return this.models.has(n) || this.models.set(n, this.findModels(e, t)), this.models.get(n);
	}
	async findModels(e, t) {
		let n = await this.registry, r = [], i = [], a = [];
		if (n.forEach((n) => {
			n.from === e && n.to === t ? r.push(n) : n.from === e && n.to === this.pivotLanguage ? i.push(n) : n.to === t && n.from === this.pivotLanguage && a.push(n);
		}), r.length) return [r[0]];
		if (i.length && a.length) return [i[0], a[0]];
		throw Error(`No model available to translate from '${e}' to '${t}'`);
	}
}, o = class {
	backing;
	worker;
	pending;
	constructor(e, t) {
		t ||= new a(e), this.backing = t, this.worker = this.backing.loadWorker().then((e) => ({
			...e,
			idle: !0
		}));
	}
	async delete() {
		this.pending &&= (this.pending.reject(new i("translator got deleted")), null);
		try {
			let { worker: e } = await this.worker;
			e.terminate();
		} finally {
			this.worker = null;
		}
	}
	translate(e, t) {
		return this.pending && this.pending.reject(new r()), new Promise((n, r) => {
			let a = {
				request: e,
				accept: n,
				reject: r,
				options: t
			};
			t?.signal && t.signal.addEventListener("abort", (e) => {
				r(new i("abort signal")), this.pending === a && (this.pending = null);
			}), this.pending = a, this.notify();
		});
	}
	notify() {
		setTimeout(async () => {
			if (this.pending) try {
				let e = await this.worker;
				if (!e.idle) return;
				let { request: t, accept: n, reject: r, options: i } = this.pending;
				this.pending = null, e.idle = !1;
				try {
					let r = await this.backing.getModels(t);
					await Promise.all(r.map(async ({ from: t, to: n }) => {
						if (!await e.exports.hasTranslationModel({
							from: t,
							to: n
						})) {
							let r = await this.backing.getTranslationModel({
								from: t,
								to: n
							}, { signal: i?.signal });
							await e.exports.loadTranslationModel({
								from: t,
								to: n
							}, r);
						}
					}));
					let { text: a, html: o, qualityScores: s } = t;
					n({
						request: t,
						...(await e.exports.translate({
							models: r.map(({ from: e, to: t }) => ({
								from: e,
								to: t
							})),
							texts: [{
								text: a,
								html: o,
								qualityScores: s
							}]
						}))[0]
					});
				} catch (e) {
					r(e);
				}
				e.idle = !0, this.pending && this.notify();
			} catch (e) {
				this.backing.onerror(e);
			}
		});
	}
}, s = class {
	dbName;
	storeName = "cache";
	constructor(e = "cache") {
		this.dbName = e;
	}
	async getDB() {
		return new Promise((e, t) => {
			let n = indexedDB.open(this.dbName, 1);
			n.onupgradeneeded = (e) => {
				let t = e.target.result;
				t.objectStoreNames.contains(this.storeName) || t.createObjectStore(this.storeName, { keyPath: "url" });
			}, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
		});
	}
	async load(e, t) {
		let n = await this.getDB();
		return new Promise((r, i) => {
			let a = n.transaction(this.storeName, "readonly").objectStore(this.storeName).get(e);
			a.onsuccess = () => {
				let e = a.result;
				e && e.checksum === t ? r(e.buffer) : r(null);
			}, a.onerror = () => i(a.error);
		});
	}
	async save(e, t, n) {
		let r = await this.getDB();
		return new Promise((i, a) => {
			let o = r.transaction(this.storeName, "readwrite").objectStore(this.storeName).put({
				url: e,
				checksum: t,
				buffer: n
			});
			o.onsuccess = () => i(), o.onerror = () => a(o.error);
		});
	}
	async clear() {
		let e = await this.getDB();
		return new Promise((t, n) => {
			let r = e.transaction(this.storeName, "readwrite").objectStore(this.storeName).clear();
			r.onsuccess = () => t(), r.onerror = () => n(r.error);
		});
	}
}, c = class extends a {
	cache;
	downloadTimeout;
	constructor(e) {
		e ||= {}, e.registryUrl = e.registryUrl || "https://raw.githubusercontent.com/mozilla/firefox-translations-models/refs/heads/main/registry.json", super(e), this.cache = new s("firefox-translations-models");
	}
	async loadModelRegistery() {
		let e = await super.loadModelRegistery();
		for (let t of e) for (let e in t.files) {
			let n = t.files[e];
			n.name = `https://media.githubusercontent.com/media/mozilla/firefox-translations-models/refs/heads/main/models/${n.modelType}/${t.from}${t.to}/${n.name}.gz`;
		}
		return e;
	}
	async fetch(e, t, r) {
		let i = await this.cache.load(e, t);
		if (i) return i;
		let a = await l(await (await fetch(e, { credentials: "omit" })).arrayBuffer());
		return await this.cache.save(e, t, n(a)), a;
	}
};
async function l(e) {
	if (typeof DecompressionStream < "u") {
		let t = new DecompressionStream("gzip"), n = new Response(e).body.pipeThrough(t);
		return await new Response(n).arrayBuffer();
	} else return t(new Uint8Array(e)).buffer;
}
var u = null, d = null;
async function f(e, t, n, r) {
	return u ??= new o({}, new c()), (await (d = i())).target.text;
	async function i() {
		return await d, u.translate({
			from: t,
			to: n,
			text: e,
			html: r
		});
	}
}
//#endregion
export { f as bergamotTranslate };
