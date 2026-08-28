//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-smLoqPx0.js"),
	process: () => import("./index.svelte-PPxaDbM6.js"),
	request: () => import("./request-DpYvS06P.js"),
	lorebook: () => import("./lorebook.svelte-tS8ffG7-.js"),
	scripts: () => import("./scripts-4eTebsRb.js"),
	triggers: () => import("./triggers-DGtqKjw7.js"),
	modules: () => import("./modules-DlnTUSbF.js"),
	plugins: () => import("./plugins.svelte-COkScQYP.js"),
	hypaMemoryV3: () => import("./hypav3--Gn2pOf5.js"),
	supaMemory: () => import("./supaMemory-OM3t8Ugr.js"),
	characterCards: () => import("./characterCards-Dtbvdb40.js"),
	tokenizer: () => import("./tokenizer-NoEuZ7LG.js"),
	parser: () => import("./parser.svelte-Bi_H5GDW.js"),
	storage: () => import("./autoStorage-BJhl3UGn.js"),
	stores: () => import("./stores.svelte-BW3oIltv.js"),
	prompt: () => import("./prompt-B18zSP-B.js"),
	translator: () => import("./translator-CswI0bzX.js"),
	feliniaGame: () => import("./feliniaGame-DnMDW_gT.js")
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
