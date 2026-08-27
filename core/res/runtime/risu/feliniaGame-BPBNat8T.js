import { s as e } from "./types-EGRr9d8r.js";
//#region src/headless/feliniaGame.ts
var t = null;
function n(e) {
	if (typeof structuredClone == "function") try {
		return structuredClone(e);
	} catch {}
	return JSON.parse(JSON.stringify(e));
}
function r() {
	return globalThis.crypto?.randomUUID?.() || `felinia-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function i(e) {
	return Array.isArray(e) ? e.map(String).map((e) => e.trim()).filter(Boolean) : String(e || "").split(/[,，、|]/).map((e) => e.trim()).filter(Boolean);
}
function a(e) {
	return typeof e == "string" ? e : e ? Object.entries(e).map(([e, t]) => `${e}=${typeof t == "string" ? t : JSON.stringify(t)}`).join("\n") : "";
}
function o(e) {
	if (typeof e == "number") return [
		"system",
		"user",
		"assistant"
	][e];
	if (e === "system" || e === "user" || e === "assistant") return e;
}
function s(e, t, n) {
	if (e.enabled === !1 || e.on === !1) return null;
	let r = { ...e.extensions || {} }, a = String(e.content || ""), s = e.probability ?? e.prob;
	(e.useProbability ?? s !== void 0) && s !== void 0 && s !== 100 && (a = `@@probability ${s}\n${a}`);
	let c = o(e.role);
	e.position === 4 && typeof e.depth == "number" && c && (a = `@@depth ${e.depth}\n@@role ${c}\n${a}`);
	let l = i(e.secondary_keys ?? e.keys2);
	typeof e.selectiveLogic == "number" && l.length && (e.selectiveLogic === 1 && (a = `@@exclude_keys_all ${l.join(",")}\n${a}`), e.selectiveLogic === 2 && l.forEach((e) => {
		a = `@@exclude_keys ${e}\n${a}`;
	}), e.selectiveLogic === 3 && l.forEach((e) => {
		a = `@@additional_keys ${e}\n${a}`;
	})), typeof e.delay == "number" && e.delay > 0 && (a = `@@activate_only_after ${e.delay}\n${a}`);
	let u = e.match_whole_words ?? e.fullWordMatching;
	return u === !0 && (a = `@@match_full_word\n${a}`), u === !1 && (a = `@@match_partial_word\n${a}`), r.risu_case_sensitive = e.case_sensitive ?? e.caseSensitive ?? !1, {
		id: String(e.id ?? `${n}-lore-${t}`),
		key: i(e.keys).join(", "),
		secondkey: l.join(", "),
		insertorder: e.insertion_order ?? e.ord ?? 100,
		comment: e.comment ?? e.title ?? e.name ?? `${n} ${t + 1}`,
		content: a,
		mode: e.mode ?? "normal",
		alwaysActive: e.constant ?? !1,
		selective: e.selective ?? !1,
		extentions: r,
		activationPercent: s,
		loreCache: null,
		useRegex: e.use_regex ?? e.useRegex ?? !1,
		folder: e.folder
	};
}
function c() {
	return {
		message: [],
		note: "",
		name: "FELINIA",
		localLore: [],
		scriptstate: {},
		fmIndex: -1,
		id: r()
	};
}
function l(e, t) {
	return {
		...e,
		...t,
		description: [e.description, t.description].filter(Boolean).join("\n\n"),
		personality: [e.personality, t.personality].filter(Boolean).join("\n\n"),
		scenario: [e.scenario, t.scenario].filter(Boolean).join("\n\n"),
		system_prompt: [e.system_prompt, t.system_prompt].filter(Boolean).join("\n\n"),
		post_history_instructions: [e.post_history_instructions, t.post_history_instructions].filter(Boolean).join("\n\n"),
		mes_example: [e.mes_example, t.mes_example].filter(Boolean).join("\n\n"),
		lorebook: [...e.lorebook || [], ...t.lorebook || []],
		regex: [...e.regex || [], ...t.regex || []],
		triggers: [...e.triggers || [], ...t.triggers || []],
		tags: [...new Set([...e.tags || [], ...t.tags || []])],
		alternate_greetings: t.alternate_greetings || e.alternate_greetings,
		defaultVariables: t.defaultVariables ?? e.defaultVariables
	};
}
function u(e, t) {
	let n = e.lorebook || [], r = n.filter((e) => e.era == null), i = {
		name: e.name || "FELINIA",
		description: e.description,
		personality: e.personality,
		scenario: e.scenario,
		first_mes: e.first_mes,
		mes_example: e.mes_example,
		creator_notes: e.creator_notes,
		system_prompt: e.system_prompt,
		post_history_instructions: e.post_history_instructions,
		alternate_greetings: e.alternate_greetings,
		tags: e.tags,
		creator: e.creator,
		character_version: e.character_version,
		lorebook: r,
		regex: e.regex,
		triggers: e.triggers,
		defaultVariables: e.defaultVariables,
		scanDepth: e.scanDepth,
		loreTokenBudget: e.loreTokenBudget,
		recursiveScanning: e.recursiveScanning,
		fullWordMatching: e.fullWordMatching
	}, a = [], o = [];
	for (let e of t) {
		let t = n.filter((t) => t.era === e.i && t.lay !== "figures");
		a.push({
			index: e.i,
			year: e.y,
			label: [e.ys, e.t].filter(Boolean).join(" · "),
			name: `FELINIA · ${[e.ys, e.t].filter(Boolean).join(" · ")}`,
			description: [e.s, e.nm].filter(Boolean).join("\n"),
			scenario: [
				e.ys ? `当前时代：${e.ys}` : "",
				e.t ? `时代场景：${e.t}` : "",
				e.s || "",
				e.inst || "",
				e.reg || ""
			].filter(Boolean).join("\n"),
			lorebook: t,
			defaultVariables: {
				felinia_era: e.i,
				felinia_year: e.y ?? "",
				felinia_era_label: e.ys ?? ""
			}
		}), (e.figs || []).forEach((t, r) => {
			let i = n.filter((n) => n.era === e.i && n.lay === "figures" && (n.cat === `人 · ${t.n}` || String(n.title || "").startsWith(`${t.n} ·`))), a = `era:${e.i}:npc:${r}:${t.n}`;
			o.push({
				key: a,
				eraIndex: e.i,
				species: t.sp,
				title: t.ti,
				name: t.n,
				description: [t.ti, t.d].filter(Boolean).join("\n"),
				personality: i.map((e) => e.content || "").filter(Boolean).join("\n\n"),
				mes_example: (t.q || []).join("\n"),
				quotes: t.q,
				lorebook: i,
				tags: [
					"FELINIA",
					`era:${e.i}`,
					t.sp || "",
					t.ti || ""
				].filter(Boolean),
				defaultVariables: {
					felinia_npc_key: a,
					felinia_era: e.i,
					felinia_species: t.sp || "",
					felinia_title: t.ti || "",
					felinia_sprite: t.v || ""
				}
			});
		});
	}
	return {
		base: i,
		eras: a,
		npcs: o
	};
}
function d(e, t) {
	let i = t.kind === "era" ? `era-${t.eraIndex}` : `npc-${t.key}`, o = (e.lorebook || []).map((e, t) => s(e, t, i)).filter((e) => !!e), l = n(e.regex || []), u = n(e.triggers || []), d = {
		...t,
		baseLoreCount: o.length,
		baseRegexCount: l.length,
		baseTriggerCount: u.length,
		activeNpcKeys: []
	};
	return {
		type: "character",
		name: e.name || (t.kind === "era" ? `FELINIA ${t.eraIndex}` : t.key),
		firstMessage: e.first_mes || "",
		desc: e.description || "",
		notes: "",
		chats: [c()],
		chatFolders: [],
		chatPage: 0,
		viewScreen: "none",
		bias: [],
		emotionImages: [],
		globalLore: o,
		chaId: r(),
		sdData: [],
		customscript: l,
		triggerscript: u,
		utilityBot: !1,
		exampleMessage: e.mes_example || "",
		creatorNotes: e.creator_notes || "",
		systemPrompt: e.system_prompt || "",
		postHistoryInstructions: "",
		alternateGreetings: e.alternate_greetings || [],
		tags: e.tags || ["FELINIA"],
		creator: e.creator || "",
		characterVersion: e.character_version || "",
		personality: e.personality || "",
		scenario: e.scenario || "",
		firstMsgIndex: -1,
		removedQuotes: !1,
		loreSettings: {
			tokenBudget: e.loreTokenBudget ?? 9e3,
			scanDepth: e.scanDepth ?? 8,
			recursiveScanning: e.recursiveScanning ?? !0,
			fullWordMatching: e.fullWordMatching ?? !1
		},
		loreExt: { risu_fullWordMatching: e.fullWordMatching ?? !1 },
		replaceGlobalNote: e.post_history_instructions || "",
		additionalText: "",
		extentions: { felinia: d },
		largePortrait: !1,
		lorePlus: !1,
		inlayViewScreen: !1,
		imported: !1,
		source: [],
		ccAssets: [],
		lowLevelAccess: !1,
		defaultVariables: a(e.defaultVariables),
		reloadKeys: 0,
		prebuiltAssetCommand: "",
		prebuiltAssetExclude: [],
		prebuiltAssetStyle: "",
		customModuleToggle: "",
		hideChatIcon: !0
	};
}
function f(e) {
	return e.extentions?.felinia;
}
async function p() {
	return t ||= Promise.all([
		import("./database.svelte-4EkJLDA8.js"),
		import("./index.svelte-CufZQXtV.js"),
		import("./scripts-DTxco9ho.js"),
		import("./stores.svelte-CFiysrz_.js"),
		import("./translator-CcOwkrIR.js"),
		import("./globalApi.svelte-C8ZLL2it.js")
	]).then(([e, t, n, r, i, a]) => ({
		database: e,
		process: t,
		scripts: n,
		stores: r,
		translator: i,
		globalApi: a
	})), t;
}
function m() {
	return {
		characters: [],
		language: "en",
		useStreaming: !0,
		botPresets: [],
		botPresetsId: 0
	};
}
async function h(e) {
	let t = await p();
	t.database.setDatabase(m());
	let n = [...e.eras].sort((e, t) => e.index - t.index).map((t) => d(l(e.base, t), {
		kind: "era",
		key: `era:${t.index}`,
		eraIndex: t.index
	})), r = e.npcs.map((e) => d(e, {
		kind: "npc",
		key: e.key,
		eraIndex: e.eraIndex
	})), i = t.database.getDatabase();
	return i.characters = [...n, ...r], t.stores.selectedCharID.set(n.length ? 0 : -1), {
		eras: n.length,
		npcs: r.length,
		total: i.characters.length
	};
}
async function g(e, t) {
	return h(u(e, t));
}
async function _(e, t = []) {
	let r = await p(), i = r.database.getDatabase(), a = i.characters.findIndex((t) => t.type !== "group" && f(t)?.kind === "era" && f(t)?.eraIndex === e);
	if (a < 0) throw Error(`FELINIA era ${e} is not installed`);
	let o = i.characters[a], s = f(o);
	o.globalLore = o.globalLore.slice(0, s.baseLoreCount), o.customscript = o.customscript.slice(0, s.baseRegexCount), o.triggerscript = o.triggerscript.slice(0, s.baseTriggerCount);
	let c = [];
	for (let e of [...new Set(t)]) {
		let t = i.characters.find((t) => t.type !== "group" && f(t)?.kind === "npc" && f(t)?.key === e);
		t && (c.push(t), o.globalLore.push(...n(t.globalLore)), o.customscript.push(...n(t.customscript)), o.triggerscript.push(...n(t.triggerscript)));
	}
	return s.activeNpcKeys = c.map((e) => f(e).key), o.extentions.felinia = s, r.stores.selectedCharID.set(a), r.database.setCharacterByIndex(a, o), {
		era: e,
		character: o,
		activeNpcs: c
	};
}
async function v(e) {
	let t = await p(), r = t.database.getCurrentCharacter();
	if (!r || r.type === "group") throw Error("No FELINIA era is active");
	e.systemPrompt !== void 0 && (r.systemPrompt = e.systemPrompt), e.description !== void 0 && (r.desc = e.description), e.personality !== void 0 && (r.personality = e.personality), e.scenario !== void 0 && (r.scenario = e.scenario), e.firstMessage !== void 0 && (r.firstMessage = e.firstMessage), e.postHistoryInstructions !== void 0 && (r.replaceGlobalNote = e.postHistoryInstructions), e.defaultVariables !== void 0 && (r.defaultVariables = a(e.defaultVariables));
	let i = r.chats[r.chatPage];
	return e.authorNote !== void 0 && (i.note = e.authorNote), e.localLore !== void 0 && (i.localLore = e.localLore.map((e, t) => s(e, t, "session")).filter((e) => !!e)), e.regexScripts !== void 0 && r.customscript.push(...n(e.regexScripts)), e.triggerScripts !== void 0 && r.triggerscript.push(...n(e.triggerScripts)), t.database.setCurrentCharacter(r), r;
}
async function y(e) {
	let t = await p(), n = t.database.getDatabase(), r = t.database.getCurrentCharacter();
	if (!r || r.type === "group") throw Error("No FELINIA era is active");
	r.supaMemory = e.enabled && e.mode !== "off", n.hypaV3 = r.supaMemory, n.hypav2 = !1, n.hypaMemory = !1, e.apiKey !== void 0 && (n.supaMemoryKey = e.apiKey), t.database.setCurrentCharacter(r);
}
async function b(e, t, n, r) {
	if (!e || r.provider === "off") return e;
	let i = await p(), a = i.database.getDatabase();
	return a.translatorType = r.provider === "deeplx" ? "deeplX" : r.provider, a.deeplOptions = {
		key: r.deeplKey || "",
		freeApi: r.deeplFree ?? !0
	}, a.deeplXOptions = {
		url: r.deeplxUrl || "http://localhost:1188",
		token: r.deeplxToken || ""
	}, i.translator.runTranslator(e, !0, t, n);
}
async function x(e, t) {
	let n = await p(), r = n.database.getDatabase(), i = r.characters.findIndex((t) => t.type !== "group" && f(t)?.kind === "npc" && f(t)?.key === e);
	if (i < 0) throw Error(`FELINIA character ${e} is not installed`);
	let a = r.characters[i];
	a.scriptstate = {
		...a.scriptstate || {},
		...t
	}, n.database.setCharacterByIndex(i, a);
}
async function S(e, t) {
	let n = await p();
	await n.database.importPreset({
		name: e,
		data: t
	});
	let r = n.database.getDatabase();
	r.botPresets.length && (r.botPresetsId = r.botPresets.length - 1, n.database.changeToPreset(r.botPresetsId, !1));
}
function C(t) {
	return t === "responses" ? e.OpenAIResponseAPI : t === "anthropic" ? e.Anthropic : t === "gemini" ? e.GoogleCloud : t === "mistral" ? e.Mistral : t === "ollama" ? e.Ollama : e.OpenAICompatible;
}
async function w(e) {
	let t = (await p()).database.getDatabase();
	t.aiModel = "reverse_proxy", t.proxyRequestModel = "custom", t.customProxyRequestModel = e.model, t.forceReplaceUrl = e.base, t.proxyKey = e.key || "", t.customAPIFormat = C(e.format), t.temperature = Math.round((e.temperature ?? .9) * 100), t.top_p = e.topP ?? 1, t.maxResponse = e.maxTokens ?? 4096, t.maxContext = e.contextTokens ?? 65536, t.useStreaming = e.stream ?? !0, t.autofillRequestUrl = e.autofillRequestUrl ?? !0;
}
function T(e) {
	return {
		role: e.role === "assistant" || e.role === "char" ? "char" : "user",
		data: String(e.content || ""),
		name: e.name,
		chatId: e.chatId,
		time: e.time ?? Date.now()
	};
}
async function E(e) {
	let t = await p(), n = t.database.getCurrentCharacter();
	if (!n || n.type === "group") throw Error("No FELINIA era is active");
	n.chats[n.chatPage].message = e.filter((e) => e.role !== "system").map(T), t.database.setCurrentCharacter(n);
}
async function D() {
	let e = (await p()).database.getCurrentCharacter();
	return !e || e.type === "group" ? [] : e.chats[e.chatPage].message.map((e) => ({
		role: e.role === "char" ? "assistant" : "user",
		content: e.data,
		name: e.name,
		chatId: e.chatId,
		time: e.time
	}));
}
async function O(e = {}) {
	let t = await p();
	e.provider && await w(e.provider);
	let r = t.database.getCurrentCharacter();
	if (!r || r.type === "group") throw Error("No FELINIA era is active");
	let i = r.chats[r.chatPage].message.at(-1)?.data || "", a;
	e.onDelta && (a = setInterval(() => {
		let n = t.database.getCurrentChat()?.message.at(-1);
		n?.role !== "char" || n.data === i || (i = n.data, e.onDelta?.(i));
	}, 50));
	try {
		if (!await t.process.sendChat(-1, {
			signal: e.signal,
			preview: e.preview
		})) throw Error("RisuAI generation failed");
		if (e.preview) return {
			text: JSON.stringify(t.process.previewFormated),
			prompt: n(t.process.previewFormated),
			history: await D()
		};
		let r = t.database.getCurrentChat()?.message.at(-1);
		if (!r || r.role !== "char") throw Error("RisuAI returned no assistant message");
		return e.onDelta?.(r.data), {
			text: r.data,
			history: await D()
		};
	} finally {
		a && clearInterval(a);
	}
}
async function k(e) {
	let t = await p();
	e.provider && await w(e.provider);
	let n = await import("./request-CRhmGyvI.js"), r = t.database.getCurrentCharacter();
	if (!r || r.type === "group") throw Error("No FELINIA era is active");
	let i = await n.requestChatData({
		formated: e.messages,
		currentChar: r,
		useStreaming: !!e.onDelta,
		forceStreaming: !!e.onDelta,
		maxTokens: e.maxTokens,
		staticModel: "reverse_proxy",
		bias: {},
		biasString: []
	}, "otherAx", e.signal);
	if (i.type === "fail") throw Error(i.result);
	if (i.type === "streaming") {
		let t = i.result.getReader(), n = "";
		for (;;) {
			let { done: r, value: i } = await t.read();
			if (i) {
				let t = Object.keys(i)[0];
				t && (n = i[t] ?? n), e.onDelta?.(n);
			}
			if (r) break;
		}
		return { text: n };
	}
	return i.type === "multiline" ? { text: i.result.join("\n") } : { text: i.result };
}
async function A(e) {
	let t = await p(), n = `${e.base.replace(/\/$/, "").replace(/\/(chat\/completions|responses)$/i, "")}/models`, r = await t.globalApi.globalFetch(n, {
		method: "GET",
		headers: e.key ? { Authorization: `Bearer ${e.key}` } : {},
		plainFetchForce: !0
	});
	if (!r.ok) throw Error(typeof r.data == "string" ? r.data : `HTTP ${r.status}`);
	return (Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data?.models) ? r.data.models : []).map((e) => String(e?.id || e?.name || "")).filter(Boolean);
}
async function j(e) {
	let t = await p(), n = t.database.getCurrentCharacter();
	return n ? t.scripts.processScript(n, e, "editdisplay") : e;
}
async function M() {
	return (await p()).database.getDatabase({ snapshot: !0 });
}
async function N(e) {
	let t = await p();
	t.database.setDatabase(e);
	let n = e.characters.findIndex((e) => e.type !== "group" && f(e)?.kind === "era");
	t.stores.selectedCharID.set(n);
}
async function P() {
	let e = await p();
	e.database.setDatabase(m()), e.stores.selectedCharID.set(-1);
}
var F = Object.freeze({
	version: "2026.8.250",
	upstreamCommit: "e565563a288ebe4c65b6099a1645ba477d1c84b4",
	install: h,
	installContent: g,
	compileDefinition: u,
	activateEra: _,
	setSessionContent: v,
	configureMemory: y,
	translate: b,
	setNpcState: x,
	importPreset: S,
	configureProvider: w,
	setHistory: E,
	getHistory: D,
	generate: O,
	request: k,
	listModels: A,
	processDisplay: j,
	snapshot: M,
	restore: N,
	reset: P
});
//#endregion
export { F as FeliniaRisu, _ as activateFeliniaEra, u as compileFeliniaDefinition, y as configureFeliniaMemory, w as configureFeliniaProvider, O as generateFeliniaTurn, D as getFeliniaHistory, S as importRisuPreset, g as installFeliniaContent, h as installFeliniaGame, A as listFeliniaModels, j as processFeliniaDisplay, k as requestFeliniaAux, P as resetFeliniaRisu, N as restoreFeliniaRisu, E as setFeliniaHistory, x as setFeliniaNpcState, v as setFeliniaSessionContent, M as snapshotFeliniaRisu, b as translateFelinia };
