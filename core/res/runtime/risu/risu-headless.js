//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-DctrpHam.js"),
	process: () => import("./index.svelte-CVb78WN3.js"),
	request: () => import("./request-COsRz1Eo.js"),
	lorebook: () => import("./lorebook.svelte-C74ATjj5.js"),
	scripts: () => import("./scripts-DShjZtgB.js"),
	triggers: () => import("./triggers-oq3-r-WT.js"),
	modules: () => import("./modules-D_htiwxJ.js"),
	plugins: () => import("./plugins.svelte-BvRAL4Zh.js"),
	hypaMemoryV3: () => import("./hypav3-YF-3m5e-.js"),
	supaMemory: () => import("./supaMemory-BGLo5qdb.js"),
	characterCards: () => import("./characterCards-BdIoO4o6.js"),
	tokenizer: () => import("./tokenizer-DvqPPmeQ.js"),
	parser: () => import("./parser.svelte-CWFbFwLW.js"),
	storage: () => import("./autoStorage-BycQLKfJ.js"),
	stores: () => import("./stores.svelte-CVK98ggU.js"),
	prompt: () => import("./prompt-DeMZZErj.js"),
	translator: () => import("./translator-CPX9Jd4u.js"),
	feliniaGame: () => import("./feliniaGame-DTchwe4c.js")
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
