//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-Bcus0gCM.js"),
	process: () => import("./index.svelte-N1eKJDhy.js"),
	request: () => import("./request-iOPkl_0w.js"),
	lorebook: () => import("./lorebook.svelte-BRjXqTsS.js"),
	scripts: () => import("./scripts-D7ed2lD4.js"),
	triggers: () => import("./triggers-BdgRXItj.js"),
	modules: () => import("./modules-C7J80M8f.js"),
	plugins: () => import("./plugins.svelte-ak3TEJWc.js"),
	hypaMemoryV3: () => import("./hypav3-CSl7__Jd.js"),
	supaMemory: () => import("./supaMemory-gWwglZbd.js"),
	characterCards: () => import("./characterCards-TO1K-Fj8.js"),
	tokenizer: () => import("./tokenizer-sji3Q9Pq.js"),
	parser: () => import("./parser.svelte-e1b1Jt2K.js"),
	storage: () => import("./autoStorage-BOIvn7Ey.js"),
	stores: () => import("./stores.svelte-DiC-JPdd.js"),
	prompt: () => import("./prompt-CmwM_rm2.js"),
	translator: () => import("./translator-LLYLOcBR.js"),
	feliniaGame: () => import("./feliniaGame-Cww2ZEVy.js")
}, t = /* @__PURE__ */ new Map();
function n(n) {
	let r = t.get(n);
	if (r) return r;
	let i = e[n]();
	return t.set(n, i), i;
}
async function r(e) {
	await Promise.all(e.map((e) => n(e)));
}
var i = Object.freeze({
	version: "2026.8.250",
	upstreamCommit: "e565563a288ebe4c65b6099a1645ba477d1c84b4",
	load: n,
	preload: r,
	modules: Object.freeze(Object.keys(e))
});
typeof window < "u" && (window.RisuHeadless = i, window.dispatchEvent(new CustomEvent("risu-headless-ready", { detail: i })));
//#endregion
export { i as default };
