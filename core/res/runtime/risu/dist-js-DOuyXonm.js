//#region node_modules/.pnpm/@tauri-apps+api@2.9.1/node_modules/@tauri-apps/api/external/tslib/tslib.es6.js
function e(e, t, n, r) {
	if (n === "a" && !r) throw TypeError("Private accessor was defined without a getter");
	if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw TypeError("Cannot read private member from an object whose class did not declare it");
	return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
function t(e, t, n, r, i) {
	if (r === "m") throw TypeError("Private method is not writable");
	if (r === "a" && !i) throw TypeError("Private accessor was defined without a setter");
	if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw TypeError("Cannot write private member to an object whose class did not declare it");
	return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
//#endregion
//#region node_modules/.pnpm/@tauri-apps+api@2.9.1/node_modules/@tauri-apps/api/core.js
var n, r, i, a, o, s = "__TAURI_TO_IPC_KEY__";
function c(e, t = !1) {
	return window.__TAURI_INTERNALS__.transformCallback(e, t);
}
var l = class {
	constructor(o) {
		n.set(this, void 0), r.set(this, 0), i.set(this, []), a.set(this, void 0), t(this, n, o || (() => {}), "f"), this.id = c((o) => {
			let s = o.index;
			if ("end" in o) {
				s == e(this, r, "f") ? this.cleanupCallback() : t(this, a, s, "f");
				return;
			}
			let c = o.message;
			if (s == e(this, r, "f")) {
				for (e(this, n, "f").call(this, c), t(this, r, e(this, r, "f") + 1, "f"); e(this, r, "f") in e(this, i, "f");) {
					let a = e(this, i, "f")[e(this, r, "f")];
					e(this, n, "f").call(this, a), delete e(this, i, "f")[e(this, r, "f")], t(this, r, e(this, r, "f") + 1, "f");
				}
				e(this, r, "f") === e(this, a, "f") && this.cleanupCallback();
			} else e(this, i, "f")[s] = c;
		});
	}
	cleanupCallback() {
		window.__TAURI_INTERNALS__.unregisterCallback(this.id);
	}
	set onmessage(e) {
		t(this, n, e, "f");
	}
	get onmessage() {
		return e(this, n, "f");
	}
	[(n = /* @__PURE__ */ new WeakMap(), r = /* @__PURE__ */ new WeakMap(), i = /* @__PURE__ */ new WeakMap(), a = /* @__PURE__ */ new WeakMap(), s)]() {
		return `__CHANNEL__:${this.id}`;
	}
	toJSON() {
		return this[s]();
	}
};
async function u(e, t = {}, n) {
	return window.__TAURI_INTERNALS__.invoke(e, t, n);
}
function d(e, t = "asset") {
	return window.__TAURI_INTERNALS__.convertFileSrc(e, t);
}
var f = class {
	get rid() {
		return e(this, o, "f");
	}
	constructor(e) {
		o.set(this, void 0), t(this, o, e, "f");
	}
	async close() {
		return u("plugin:resources|close", { rid: this.rid });
	}
};
o = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/.pnpm/@tauri-apps+plugin-shell@2.3.3/node_modules/@tauri-apps/plugin-shell/dist-js/index.js
var p = class {
	constructor() {
		this.eventListeners = Object.create(null);
	}
	addListener(e, t) {
		return this.on(e, t);
	}
	removeListener(e, t) {
		return this.off(e, t);
	}
	on(e, t) {
		return e in this.eventListeners ? this.eventListeners[e].push(t) : this.eventListeners[e] = [t], this;
	}
	once(e, t) {
		let n = (r) => {
			this.removeListener(e, n), t(r);
		};
		return this.addListener(e, n);
	}
	off(e, t) {
		return e in this.eventListeners && (this.eventListeners[e] = this.eventListeners[e].filter((e) => e !== t)), this;
	}
	removeAllListeners(e) {
		return e ? delete this.eventListeners[e] : this.eventListeners = Object.create(null), this;
	}
	emit(e, t) {
		if (e in this.eventListeners) {
			let n = this.eventListeners[e];
			for (let e of n) e(t);
			return !0;
		}
		return !1;
	}
	listenerCount(e) {
		return e in this.eventListeners ? this.eventListeners[e].length : 0;
	}
	prependListener(e, t) {
		return e in this.eventListeners ? this.eventListeners[e].unshift(t) : this.eventListeners[e] = [t], this;
	}
	prependOnceListener(e, t) {
		let n = (r) => {
			this.removeListener(e, n), t(r);
		};
		return this.prependListener(e, n);
	}
}, m = class {
	constructor(e) {
		this.pid = e;
	}
	async write(e) {
		await u("plugin:shell|stdin_write", {
			pid: this.pid,
			buffer: e
		});
	}
	async kill() {
		await u("plugin:shell|kill", {
			cmd: "killChild",
			pid: this.pid
		});
	}
}, h = class e extends p {
	constructor(e, t = [], n) {
		super(), this.stdout = new p(), this.stderr = new p(), this.program = e, this.args = typeof t == "string" ? [t] : t, this.options = n ?? {};
	}
	static create(t, n = [], r) {
		return new e(t, n, r);
	}
	static sidecar(t, n = [], r) {
		let i = new e(t, n, r);
		return i.options.sidecar = !0, i;
	}
	async spawn() {
		let e = this.program, t = this.args, n = this.options;
		typeof t == "object" && Object.freeze(t);
		let r = new l();
		return r.onmessage = (e) => {
			switch (e.event) {
				case "Error":
					this.emit("error", e.payload);
					break;
				case "Terminated":
					this.emit("close", e.payload);
					break;
				case "Stdout":
					this.stdout.emit("data", e.payload);
					break;
				case "Stderr":
					this.stderr.emit("data", e.payload);
					break;
			}
		}, await u("plugin:shell|spawn", {
			program: e,
			args: t,
			options: n,
			onEvent: r
		}).then((e) => new m(e));
	}
	async execute() {
		let e = this.program, t = this.args, n = this.options;
		return typeof t == "object" && Object.freeze(t), await u("plugin:shell|execute", {
			program: e,
			args: t,
			options: n
		});
	}
};
async function g(e, t) {
	await u("plugin:shell|open", {
		path: e,
		with: t
	});
}
//#endregion
export { f as a, u as c, g as i, c as l, h as n, s as o, p as r, d as s, m as t };
