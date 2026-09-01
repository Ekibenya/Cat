//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-FgK7m0Ym.js"),
	process: () => import("./index.svelte-CX_u1ZSW.js"),
	request: () => import("./request-B6BlEmr0.js"),
	lorebook: () => import("./lorebook.svelte-Ce-FRrse.js"),
	scripts: () => import("./scripts-CatsANQR.js"),
	triggers: () => import("./triggers-Cd6DTSmI.js"),
	modules: () => import("./modules-BJS9D8ea.js"),
	plugins: () => import("./plugins.svelte-Diqyqpbb.js"),
	hypaMemoryV3: () => import("./hypav3-BuUU1ukh.js"),
	supaMemory: () => import("./supaMemory-D83HF-Hd.js"),
	characterCards: () => import("./characterCards-CKnVZiEt.js"),
	tokenizer: () => import("./tokenizer-JBvn6WtT.js"),
	parser: () => import("./parser.svelte-CSOPaeWT.js"),
	storage: () => import("./autoStorage-B2PEDRMw.js"),
	stores: () => import("./stores.svelte-MIgqTXU-.js"),
	prompt: () => import("./prompt-tJGLppwO.js"),
	translator: () => import("./translator-ZJudJtf-.js"),
	feliniaGame: () => import("./feliniaGame-Do_6xMRR.js")
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
