//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-B2-rmWGt.js"),
	process: () => import("./index.svelte-CZ49Faaa.js"),
	request: () => import("./request-Dx-PNrCL.js"),
	lorebook: () => import("./lorebook.svelte-L9smW6EW.js"),
	scripts: () => import("./scripts-BWJExb9G.js"),
	triggers: () => import("./triggers-BDGOzm_i.js"),
	modules: () => import("./modules-B4LOv5aM.js"),
	plugins: () => import("./plugins.svelte-B8FohPna.js"),
	hypaMemoryV3: () => import("./hypav3-CmD6ED7u.js"),
	supaMemory: () => import("./supaMemory-Dpoe3f6D.js"),
	characterCards: () => import("./characterCards-fNYV6_kl.js"),
	tokenizer: () => import("./tokenizer-nHne2sGi.js"),
	parser: () => import("./parser.svelte-DARNJ-X7.js"),
	storage: () => import("./autoStorage-CUhJpIrC.js"),
	stores: () => import("./stores.svelte-1uma_N82.js"),
	prompt: () => import("./prompt-BMIIRJT2.js"),
	translator: () => import("./translator-I7W3Gsuy.js"),
	feliniaGame: () => import("./feliniaGame-B-FE18Je.js")
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
