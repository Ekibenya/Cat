//#region src/headless/index.ts
var e = {
	database: () => import("./database.svelte-6y6bQUu0.js"),
	process: () => import("./index.svelte-v62VlkGe.js"),
	request: () => import("./request-LyNHi3Hw.js"),
	lorebook: () => import("./lorebook.svelte-Cw5S6XO_.js"),
	scripts: () => import("./scripts-CSEGo9qA.js"),
	triggers: () => import("./triggers-CJABSl5e.js"),
	modules: () => import("./modules-D7aE-I31.js"),
	plugins: () => import("./plugins.svelte-B_rq4-6t.js"),
	hypaMemoryV3: () => import("./hypav3-CIFd-j59.js"),
	supaMemory: () => import("./supaMemory-BB4jzAzl.js"),
	characterCards: () => import("./characterCards-DCKkCn7P.js"),
	tokenizer: () => import("./tokenizer-TdPycoLe.js"),
	parser: () => import("./parser.svelte-CiLdr4fX.js"),
	storage: () => import("./autoStorage-rvAWCXfM.js"),
	stores: () => import("./stores.svelte-CKy-gdVr.js"),
	prompt: () => import("./prompt-Cj08nOxN.js"),
	translator: () => import("./translator-BvM21ju2.js"),
	feliniaGame: () => import("./feliniaGame-CamEliMJ.js")
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
