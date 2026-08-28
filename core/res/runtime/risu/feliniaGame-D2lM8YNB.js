import { s as e } from "./types-EGRr9d8r.js";
//#region src/headless/feliniaGame.ts
function t(e, t) {
	let n = { ...e };
	for (let e of t) n.desc = [n.desc, `【当前在场角色 · ${e.name}】\n${e.desc || ""}`].filter(Boolean).join("\n\n"), n.personality = [
		n.personality,
		`【${e.name} · 性格与行为】\n${e.personality || ""}`,
		e.exampleMessage ? `【${e.name} · 说话样例】\n${e.exampleMessage}` : ""
	].filter(Boolean).join("\n\n"), n.scenario = [n.scenario, `当前在场人物：${e.name}`].filter(Boolean).join("\n"), n.exampleMessage = [n.exampleMessage, `【${e.name} · 说话样例】\n${e.exampleMessage || ""}`].filter(Boolean).join("\n\n");
	return n;
}
var n = null;
function r(e) {
	if (typeof structuredClone == "function") try {
		return structuredClone(e);
	} catch {}
	return JSON.parse(JSON.stringify(e));
}
function i() {
	return globalThis.crypto?.randomUUID?.() || `felinia-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function a(e) {
	return Array.isArray(e) ? e.map(String).map((e) => e.trim()).filter(Boolean) : String(e || "").split(/[,，、|]/).map((e) => e.trim()).filter(Boolean);
}
function o(e) {
	return typeof e == "string" ? e : e ? Object.entries(e).map(([e, t]) => `${e}=${typeof t == "string" ? t : JSON.stringify(t)}`).join("\n") : "";
}
function s(e) {
	if (typeof e == "number") return [
		"system",
		"user",
		"assistant"
	][e];
	if (e === "system" || e === "user" || e === "assistant") return e;
}
function c(e, t, n) {
	if (e.enabled === !1 || e.on === !1) return null;
	let r = { ...e.extensions || {} }, i = String(e.content || ""), o = e.probability ?? e.prob;
	(e.useProbability ?? o !== void 0) && o !== void 0 && o !== 100 && (i = `@@probability ${o}\n${i}`);
	let c = s(e.role);
	e.position === 4 && typeof e.depth == "number" && c && (i = `@@depth ${e.depth}\n@@role ${c}\n${i}`);
	let l = a(e.secondary_keys ?? e.keys2);
	typeof e.selectiveLogic == "number" && l.length && (e.selectiveLogic === 1 && (i = `@@exclude_keys_all ${l.join(",")}\n${i}`), e.selectiveLogic === 2 && l.forEach((e) => {
		i = `@@exclude_keys ${e}\n${i}`;
	}), e.selectiveLogic === 3 && l.forEach((e) => {
		i = `@@additional_keys ${e}\n${i}`;
	})), typeof e.delay == "number" && e.delay > 0 && (i = `@@activate_only_after ${e.delay}\n${i}`);
	let u = e.match_whole_words ?? e.fullWordMatching;
	return u === !0 && (i = `@@match_full_word\n${i}`), u === !1 && (i = `@@match_partial_word\n${i}`), r.risu_case_sensitive = e.case_sensitive ?? e.caseSensitive ?? !1, {
		id: String(e.id ?? `${n}-lore-${t}`),
		key: a(e.keys).join(", "),
		secondkey: l.join(", "),
		insertorder: e.insertion_order ?? e.ord ?? 100,
		comment: e.comment ?? e.title ?? e.name ?? `${n} ${t + 1}`,
		content: i,
		mode: e.mode ?? "normal",
		alwaysActive: e.constant ?? !1,
		selective: e.selective ?? !1,
		extentions: r,
		activationPercent: o,
		loreCache: null,
		useRegex: e.use_regex ?? e.useRegex ?? !1,
		folder: e.folder
	};
}
function l() {
	return {
		message: [],
		note: "",
		name: "FELINIA",
		localLore: [],
		scriptstate: {},
		fmIndex: -1,
		id: i()
	};
}
function u(e, t) {
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
function d(e, t) {
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
	}, o = [], s = [];
	for (let e of t) {
		let t = new Set((e.figs || []).map((e) => e.n)), r = n.filter((t) => t.era === e.i && t.lay !== "figures");
		o.push({
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
			lorebook: r,
			defaultVariables: {
				felinia_era: e.i,
				felinia_year: e.y ?? "",
				felinia_era_label: e.ys ?? ""
			}
		}), (e.figs || []).forEach((r, i) => {
			let o = n.filter((t) => t.era === e.i && t.lay === "figures" && (t.cat === `人 · ${r.n}` || String(t.title || "").startsWith(`${r.n} ·`))).map((n) => {
				if (!/第五项\s*·\s*关系|关系/.test(String(n.title || ""))) return n;
				let o = a(n.keys).filter((e) => e !== r.n && t.has(e));
				return {
					...n,
					keys: o.length ? o : [`__FELINIA_RELATION_${e.i}_${i}__`]
				};
			}), c = `era:${e.i}:npc:${i}:${r.n}`;
			s.push({
				key: c,
				eraIndex: e.i,
				species: r.sp,
				title: r.ti,
				name: r.n,
				description: [r.ti, r.d].filter(Boolean).join("\n"),
				personality: o.map((e) => e.content || "").filter(Boolean).join("\n\n"),
				mes_example: (r.q || []).join("\n"),
				quotes: r.q,
				lorebook: o,
				tags: [
					"FELINIA",
					`era:${e.i}`,
					r.sp || "",
					r.ti || ""
				].filter(Boolean),
				defaultVariables: {
					felinia_npc_key: c,
					felinia_era: e.i,
					felinia_species: r.sp || "",
					felinia_title: r.ti || "",
					felinia_sprite: r.v || ""
				}
			});
		});
	}
	return {
		base: i,
		eras: o,
		npcs: s
	};
}
function f(e, t) {
	let n = t.kind === "era" ? `era-${t.eraIndex}` : `npc-${t.key}`, a = (e.lorebook || []).map((e, t) => c(e, t, n)).filter((e) => !!e), s = r(e.regex || []), u = r(e.triggers || []), d = {
		...t,
		baseLoreCount: a.length,
		baseRegexCount: s.length,
		baseTriggerCount: u.length,
		baseDesc: e.description || "",
		basePersonality: e.personality || "",
		baseScenario: e.scenario || "",
		baseExampleMessage: e.mes_example || "",
		activeNpcKeys: []
	};
	return {
		type: "character",
		name: e.name || (t.kind === "era" ? `FELINIA ${t.eraIndex}` : t.key),
		firstMessage: e.first_mes || "",
		desc: e.description || "",
		notes: "",
		chats: [l()],
		chatFolders: [],
		chatPage: 0,
		viewScreen: "none",
		bias: [],
		emotionImages: [],
		globalLore: a,
		chaId: i(),
		sdData: [],
		customscript: s,
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
			tokenBudget: e.loreTokenBudget ?? 800,
			scanDepth: e.scanDepth ?? 5,
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
		defaultVariables: o(e.defaultVariables),
		reloadKeys: 0,
		prebuiltAssetCommand: "",
		prebuiltAssetExclude: [],
		prebuiltAssetStyle: "",
		customModuleToggle: "",
		hideChatIcon: !0
	};
}
function p(e) {
	return e.extentions?.felinia;
}
async function m() {
	return n ||= Promise.all([
		import("./database.svelte-Bcus0gCM.js"),
		import("./index.svelte-N1eKJDhy.js"),
		import("./scripts-D7ed2lD4.js"),
		import("./stores.svelte-DiC-JPdd.js"),
		import("./translator-LLYLOcBR.js"),
		import("./globalApi.svelte-AOxqJqdN.js")
	]).then(([e, t, n, r, i, a]) => ({
		database: e,
		process: t,
		scripts: n,
		stores: r,
		translator: i,
		globalApi: a
	})), n;
}
function h() {
	return {
		characters: [],
		language: "en",
		useStreaming: !0,
		usePlainFetch: !0,
		strictOpenAICompatible: !0,
		inlayErrorResponse: !0,
		botPresets: [],
		botPresetsId: 0
	};
}
async function g(e) {
	let t = await m();
	t.database.setDatabase(h());
	let n = [...e.eras].sort((e, t) => e.index - t.index).map((t) => f(u(e.base, t), {
		kind: "era",
		key: `era:${t.index}`,
		eraIndex: t.index
	})), r = e.npcs.map((e) => f(e, {
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
async function _(e, t) {
	return g(d(e, t));
}
async function v(e, n = []) {
	let i = await m(), a = i.database.getDatabase(), o = a.characters.findIndex((t) => t.type !== "group" && p(t)?.kind === "era" && p(t)?.eraIndex === e);
	if (o < 0) throw Error(`FELINIA era ${e} is not installed`);
	let s = a.characters[o], c = p(s);
	s.globalLore = s.globalLore.slice(0, c.baseLoreCount), s.customscript = s.customscript.slice(0, c.baseRegexCount), s.triggerscript = s.triggerscript.slice(0, c.baseTriggerCount), s.desc = c.baseDesc ?? s.desc, s.personality = c.basePersonality ?? s.personality, s.scenario = c.baseScenario ?? s.scenario, s.exampleMessage = c.baseExampleMessage ?? s.exampleMessage;
	let l = [];
	for (let e of [...new Set(n)]) {
		let t = a.characters.find((t) => t.type !== "group" && p(t)?.kind === "npc" && p(t)?.key === e);
		t && (l.push(t), s.globalLore.push(...r(t.globalLore)), s.customscript.push(...r(t.customscript)), s.triggerscript.push(...r(t.triggerscript)));
	}
	return Object.assign(s, t({
		desc: s.desc,
		personality: s.personality,
		scenario: s.scenario,
		exampleMessage: s.exampleMessage
	}, l)), c.activeNpcKeys = l.map((e) => p(e).key), s.extentions.felinia = c, i.stores.selectedCharID.set(o), i.database.setCharacterByIndex(o, s), {
		era: e,
		character: s,
		activeNpcs: l
	};
}
async function y(e) {
	let t = await m(), n = t.database.getCurrentCharacter();
	if (!n || n.type === "group") throw Error("No FELINIA era is active");
	e.systemPrompt !== void 0 && (n.systemPrompt = e.systemPrompt), e.description !== void 0 && (n.desc = e.description), e.personality !== void 0 && (n.personality = e.personality), e.scenario !== void 0 && (n.scenario = e.scenario), e.firstMessage !== void 0 && (n.firstMessage = e.firstMessage), e.postHistoryInstructions !== void 0 && (n.replaceGlobalNote = e.postHistoryInstructions), e.defaultVariables !== void 0 && (n.defaultVariables = o(e.defaultVariables));
	let i = n.chats[n.chatPage];
	return e.authorNote !== void 0 && (i.note = e.authorNote), e.localLore !== void 0 && (i.localLore = e.localLore.map((e, t) => c(e, t, "session")).filter((e) => !!e)), e.regexScripts !== void 0 && n.customscript.push(...r(e.regexScripts)), e.triggerScripts !== void 0 && n.triggerscript.push(...r(e.triggerScripts)), t.database.setCurrentCharacter(n), n;
}
async function b(e) {
	let t = await m(), n = t.database.getDatabase(), r = t.database.getCurrentCharacter();
	if (!r || r.type === "group") throw Error("No FELINIA era is active");
	r.supaMemory = e.enabled && e.mode !== "off", n.hypaV3 = r.supaMemory, n.hypav2 = !1, n.hypaMemory = !1, e.apiKey !== void 0 && (n.supaMemoryKey = e.apiKey), t.database.setCurrentCharacter(r);
}
async function x(e) {
	let t = (await m()).database.getDatabase();
	t.translatorType = e.provider === "deeplx" ? "deeplX" : e.provider, t.deeplOptions = {
		key: e.deeplKey || "",
		freeApi: e.deeplFree ?? !0
	}, t.deeplXOptions = {
		url: e.deeplxUrl || "http://localhost:1188",
		token: e.deeplxToken || ""
	}, t.feliniaFinalPromptTranslation = e.provider !== "off";
}
async function S(e, t, n, r) {
	return !e || r.provider === "off" ? e : (await x(r), (await m()).translator.runTranslator(e, !0, t, n, {
		regenerate: r.regenerate,
		throwOnError: !0
	}));
}
async function C(e, t) {
	let n = await m(), r = n.database.getDatabase(), i = r.characters.findIndex((t) => t.type !== "group" && p(t)?.kind === "npc" && p(t)?.key === e);
	if (i < 0) throw Error(`FELINIA character ${e} is not installed`);
	let a = r.characters[i];
	a.scriptstate = {
		...a.scriptstate || {},
		...t
	}, n.database.setCharacterByIndex(i, a);
}
async function w(e, t) {
	let n = await m();
	await n.database.importPreset({
		name: e,
		data: t
	});
	let r = n.database.getDatabase();
	r.botPresets.length && (r.botPresetsId = r.botPresets.length - 1, n.database.changeToPreset(r.botPresetsId, !1));
}
function T(t) {
	return t === "responses" ? e.OpenAIResponseAPI : t === "anthropic" ? e.Anthropic : t === "gemini" ? e.GoogleCloud : t === "mistral" ? e.Mistral : t === "ollama" ? e.Ollama : e.OpenAICompatible;
}
async function E(e) {
	let t = (await m()).database.getDatabase();
	t.aiModel = "reverse_proxy", t.proxyRequestModel = "custom", t.customProxyRequestModel = e.model, t.forceReplaceUrl = e.base, t.proxyKey = e.key || "", t.customAPIFormat = T(e.format), t.temperature = e.temperature == null ? -1e3 : Math.round(e.temperature * 100), t.top_p = e.topP == null ? -1e3 : e.topP, t.reasoningEffort = e.reasoningEffort ?? -1, t.maxResponse = e.maxTokens ?? 4096, t.maxContext = e.contextTokens ?? 65536, t.useStreaming = e.stream ?? !0, t.autofillRequestUrl = e.autofillRequestUrl ?? !0, t.usePlainFetch = !0, t.strictOpenAICompatible = e.format === "openai" || !e.format, t.inlayErrorResponse = !0;
}
function D(e, t) {
	let n = [...e.message.slice(t)].reverse().find((e) => e.role === "char" && /```risuerror\b/i.test(e.data || ""));
	return n ? (e.message = e.message.slice(0, t), String(n.data || "").replace(/^```risuerror\s*/i, "").replace(/```\s*$/i, "").trim()) : "";
}
function O(e) {
	return String(e || "").replace(/<mvu_panel>[\s\S]*?<\/mvu_panel>/gi, "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim().length;
}
function k(e) {
	return {
		role: e.role === "assistant" || e.role === "char" ? "char" : "user",
		data: String(e.content || ""),
		scanData: e.scanContent == null ? void 0 : String(e.scanContent),
		name: e.name,
		chatId: e.chatId,
		time: e.time ?? Date.now()
	};
}
async function A(e) {
	let t = await m(), n = t.database.getCurrentCharacter();
	if (!n || n.type === "group") throw Error("No FELINIA era is active");
	n.chats[n.chatPage].message = e.filter((e) => e.role !== "system").map(k), t.database.setCurrentCharacter(n);
}
async function j() {
	let e = (await m()).database.getCurrentCharacter();
	return !e || e.type === "group" ? [] : e.chats[e.chatPage].message.map((e) => ({
		role: e.role === "char" ? "assistant" : "user",
		content: e.data,
		name: e.name,
		chatId: e.chatId,
		time: e.time
	}));
}
async function M(e = {}) {
	let t = await m();
	e.provider && await E(e.provider);
	let n = t.database.getCurrentCharacter();
	if (!n || n.type === "group") throw Error("No FELINIA era is active");
	let i = n.chats[n.chatPage], a = i.message.length, o = n.systemPrompt, s = Math.max(0, Math.round(e.minChars || 0)), c = Math.max(0, Math.min(1, Math.round(e.maxShortRetries ?? 1)));
	t.process.doingChat.set(!1);
	let l = n.chats[n.chatPage].message.at(-1)?.data || "", u;
	e.onDelta && (u = setInterval(() => {
		let n = t.database.getCurrentChat()?.message.at(-1);
		n?.role !== "char" || n.data === l || (l = n.data, e.onDelta?.(l));
	}, 50));
	try {
		let u;
		for (let d = 0; d <= c; d++) {
			if (d > 0 && (i.message = i.message.slice(0, a), n.systemPrompt = `${o}\n\n최종 분량 교정. 직전 초안은 ${s}자 미만이라 폐기되었다. 같은 장면을 처음부터 다시 쓰되, 상태창을 제외한 한국어 소설 본문이 반드시 ${s}자 이상이 된 뒤에만 끝낸다. 요약하거나 결말을 서두르지 말고 사건, 반응, 대화와 구체적인 동작을 늘린다.`, t.database.setCurrentCharacter(n), l = i.message.at(-1)?.data || ""), t.process.doingChat.set(!1), !await t.process.sendChat(-1, {
				signal: e.signal,
				preview: e.preview
			})) {
				let e = D(i, a) || "生成请求失败";
				if (!u) throw Error(e);
				i.message.push(r(u));
				break;
			}
			if (e.preview) break;
			let f = i.message.at(-1);
			if (!(!f || f.role !== "char") && ((!u || O(f.data) > O(u.data)) && (u = r(f)), !s || O(f.data) >= s || d === c)) {
				u && f.data !== u.data && (i.message[i.message.length - 1] = r(u));
				break;
			}
		}
		if (e.preview) return {
			text: JSON.stringify(t.process.previewFormated),
			prompt: r(t.process.previewFormated),
			history: await j()
		};
		let d = t.database.getCurrentChat()?.message.at(-1);
		if (!d || d.role !== "char" || !String(d.data || "").trim()) throw Error("接口没有返回可显示的正文");
		return e.onDelta?.(d.data), {
			text: d.data,
			history: await j()
		};
	} finally {
		n.systemPrompt = o, t.database.setCurrentCharacter(n), u && clearInterval(u), t.process.doingChat.set(!1);
	}
}
async function N(e) {
	let t = await m();
	e.provider && await E(e.provider);
	let n = await import("./request-iOPkl_0w.js"), r = t.database.getCurrentCharacter();
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
async function P(e) {
	let t = await m(), n = `${e.base.replace(/\/$/, "").replace(/\/(chat\/completions|responses)$/i, "")}/models`, r = await t.globalApi.globalFetch(n, {
		method: "GET",
		headers: e.key ? { Authorization: `Bearer ${e.key}` } : {},
		plainFetchForce: !0
	});
	if (!r.ok) throw Error(typeof r.data == "string" ? r.data : `HTTP ${r.status}`);
	return (Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data?.models) ? r.data.models : []).map((e) => String(e?.id || e?.name || "")).filter(Boolean);
}
async function F(e) {
	let t = await m(), n = t.database.getCurrentCharacter();
	return n ? t.scripts.processScript(n, e, "editdisplay") : e;
}
async function I() {
	return (await m()).database.getDatabase({ snapshot: !0 });
}
async function L(e) {
	let t = await m();
	t.database.setDatabase(e);
	let n = e.characters.findIndex((e) => e.type !== "group" && p(e)?.kind === "era");
	t.stores.selectedCharID.set(n);
}
async function R() {
	let e = await m();
	e.database.setDatabase(h()), e.stores.selectedCharID.set(-1);
}
var z = Object.freeze({
	version: "2026.8.250",
	upstreamCommit: "e565563a288ebe4c65b6099a1645ba477d1c84b4",
	install: g,
	installContent: _,
	compileDefinition: d,
	activateEra: v,
	setSessionContent: y,
	configureMemory: b,
	configureTranslation: x,
	translate: S,
	setNpcState: C,
	importPreset: w,
	configureProvider: E,
	setHistory: A,
	getHistory: j,
	generate: M,
	request: N,
	listModels: P,
	processDisplay: F,
	snapshot: I,
	restore: L,
	reset: R
});
//#endregion
export { z as FeliniaRisu, v as activateFeliniaEra, d as compileFeliniaDefinition, b as configureFeliniaMemory, E as configureFeliniaProvider, x as configureFeliniaTranslation, M as generateFeliniaTurn, j as getFeliniaHistory, w as importRisuPreset, _ as installFeliniaContent, g as installFeliniaGame, P as listFeliniaModels, t as mergeFeliniaNativeCharacterFields, F as processFeliniaDisplay, N as requestFeliniaAux, R as resetFeliniaRisu, L as restoreFeliniaRisu, k as risuMessage, A as setFeliniaHistory, C as setFeliniaNpcState, y as setFeliniaSessionContent, I as snapshotFeliniaRisu, S as translateFelinia };
