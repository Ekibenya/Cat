//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-CUQpbqF_.js"),
	process: () => import("./index.svelte-5mrvF_D2.js"),
	request: () => import("./request-IAbnL2mA.js"),
	lorebook: () => import("./lorebook.svelte-CiOWkpK4.js"),
	scripts: () => import("./scripts-ByGUe0tc.js"),
	triggers: () => import("./triggers-nKi9pxsv.js"),
	modules: () => import("./modules-DNdK3Nlp.js"),
	plugins: () => import("./plugins.svelte-BcPyOIQx.js"),
	hypaMemoryV3: () => import("./hypav3-BI8QF0dM.js"),
	supaMemory: () => import("./supaMemory-Dqd5HLWI.js"),
	characterCards: () => import("./characterCards-D_I_zXNo.js"),
	tokenizer: () => import("./tokenizer-BzMsg14E.js"),
	parser: () => import("./parser.svelte-DH84XHaC.js"),
	storage: () => import("./autoStorage-DDaKGv7D.js"),
	stores: () => import("./stores.svelte-nlEDrxsr.js"),
	prompt: () => import("./prompt-DU5oy7g4.js"),
	translator: () => import("./translator-CsKspvYV.js"),
	feliniaGame: () => import("./feliniaGame-CoUc8wkQ.js")
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
