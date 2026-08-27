//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-BILtDHEt.js"),
	process: () => import("./index.svelte-BE14p_UG.js"),
	request: () => import("./request-CQOPA_9t.js"),
	lorebook: () => import("./lorebook.svelte-D2n7E-aG.js"),
	scripts: () => import("./scripts-BKuXHPeN.js"),
	triggers: () => import("./triggers-CW1BB9xM.js"),
	modules: () => import("./modules-C_ikIoWd.js"),
	plugins: () => import("./plugins.svelte-TyFrFNp3.js"),
	hypaMemoryV3: () => import("./hypav3-CZm95B5a.js"),
	supaMemory: () => import("./supaMemory-BqEvEAqC.js"),
	characterCards: () => import("./characterCards-B9RkOpx1.js"),
	tokenizer: () => import("./tokenizer-DR2Hu53b.js"),
	parser: () => import("./parser.svelte-CD6xauOO.js"),
	storage: () => import("./autoStorage-DwL-q7He.js"),
	stores: () => import("./stores.svelte-BjS6ivxJ.js"),
	prompt: () => import("./prompt-D_kZucFg.js"),
	translator: () => import("./translator-Dtoe3kqo.js"),
	feliniaGame: () => import("./feliniaGame-DGBoU7-m.js")
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
