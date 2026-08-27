//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-4EkJLDA8.js"),
	process: () => import("./index.svelte-CufZQXtV.js"),
	request: () => import("./request-CRhmGyvI.js"),
	lorebook: () => import("./lorebook.svelte-D9WqmQzk.js"),
	scripts: () => import("./scripts-DTxco9ho.js"),
	triggers: () => import("./triggers-BiA2GQGS.js"),
	modules: () => import("./modules-Cp01BDpc.js"),
	plugins: () => import("./plugins.svelte-Cv3b35G1.js"),
	hypaMemoryV3: () => import("./hypav3-DGfLgtJs.js"),
	supaMemory: () => import("./supaMemory-Cs71rEJW.js"),
	characterCards: () => import("./characterCards-DL_YvfGp.js"),
	tokenizer: () => import("./tokenizer-Px3vOcgp.js"),
	parser: () => import("./parser.svelte-DVSTuMqy.js"),
	storage: () => import("./autoStorage-DiB2LWtf.js"),
	stores: () => import("./stores.svelte-CFiysrz_.js"),
	prompt: () => import("./prompt-gxGO0K21.js"),
	translator: () => import("./translator-CcOwkrIR.js"),
	feliniaGame: () => import("./feliniaGame-BPBNat8T.js")
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
