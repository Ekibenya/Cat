import { s as e } from "./types-EGRr9d8r.js";
//#region src/headless/feliniaGame.ts
var t = "【人物条目与台词样本的用法】\n人物条目里的具体台词只用于辨认措辞、语气、敬语和句长，不是必须复诵的台词表，更不是口头禅。每回合必须依据眼前的新动作、新对象和新利害重新组织说法；不得照抄条目中的整句，也不得复用最近三回已经说过的同一句或同一种推脱。条目描述的局部反应只适用于它原本的情境：例如“不替客人决定”不等于遇到任何事都说做不了，“话少”也不等于对所有问题只会说不知道。角色可以沉默、点头、追问、改口、转移话题或采取具体行动，但不能把一种性情压扁成两句循环回复。";
function n(e, n) {
	let r = { ...e };
	for (let e of n) r.desc = [r.desc, `【当前在场角色 · ${e.name}】\n${e.desc || ""}`].filter(Boolean).join("\n\n"), r.personality = [r.personality, `【${e.name} · 性格与行为】\n${e.personality || ""}`].filter(Boolean).join("\n\n"), r.scenario = [r.scenario, `当前在场人物：${e.name}`].filter(Boolean).join("\n");
	return n.length && (r.personality = [r.personality, t].filter(Boolean).join("\n\n")), r;
}
function r(e) {
	return /第五项\s*·\s*关系|关系/.test(String(e.title || e.comment || ""));
}
var i = null;
function a(e) {
	if (typeof structuredClone == "function") try {
		return structuredClone(e);
	} catch {}
	return JSON.parse(JSON.stringify(e));
}
function o() {
	return globalThis.crypto?.randomUUID?.() || `felinia-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function s(e) {
	return Array.isArray(e) ? e.map(String).map((e) => e.trim()).filter(Boolean) : String(e || "").split(/[,，、|]/).map((e) => e.trim()).filter(Boolean);
}
function c(e) {
	return typeof e == "string" ? e : e ? Object.entries(e).map(([e, t]) => `${e}=${typeof t == "string" ? t : JSON.stringify(t)}`).join("\n") : "";
}
function l(e) {
	if (typeof e == "number") return [
		"system",
		"user",
		"assistant"
	][e];
	if (e === "system" || e === "user" || e === "assistant") return e;
}
function u(e, t, n) {
	if (e.enabled === !1 || e.on === !1) return null;
	let r = { ...e.extensions || {} }, i = String(e.content || ""), a = e.probability ?? e.prob;
	(e.useProbability ?? a !== void 0) && a !== void 0 && a !== 100 && (i = `@@probability ${a}\n${i}`);
	let o = l(e.role);
	e.position === 4 && typeof e.depth == "number" && o && (i = `@@depth ${e.depth}\n@@role ${o}\n${i}`);
	let c = s(e.secondary_keys ?? e.keys2);
	typeof e.selectiveLogic == "number" && c.length && (e.selectiveLogic === 1 && (i = `@@exclude_keys_all ${c.join(",")}\n${i}`), e.selectiveLogic === 2 && c.forEach((e) => {
		i = `@@exclude_keys ${e}\n${i}`;
	}), e.selectiveLogic === 3 && c.forEach((e) => {
		i = `@@additional_keys ${e}\n${i}`;
	})), typeof e.delay == "number" && e.delay > 0 && (i = `@@activate_only_after ${e.delay}\n${i}`);
	let u = e.match_whole_words ?? e.fullWordMatching;
	return u === !0 && (i = `@@match_full_word\n${i}`), u === !1 && (i = `@@match_partial_word\n${i}`), r.risu_case_sensitive = e.case_sensitive ?? e.caseSensitive ?? !1, {
		id: String(e.id ?? `${n}-lore-${t}`),
		key: s(e.keys).join(", "),
		secondkey: c.join(", "),
		insertorder: e.insertion_order ?? e.ord ?? 100,
		comment: e.comment ?? e.title ?? e.name ?? `${n} ${t + 1}`,
		content: i,
		mode: e.mode ?? "normal",
		alwaysActive: e.constant ?? !1,
		selective: e.selective ?? !1,
		extentions: r,
		activationPercent: a,
		loreCache: null,
		useRegex: e.use_regex ?? e.useRegex ?? !1,
		folder: e.folder
	};
}
function d() {
	return {
		message: [],
		note: "",
		name: "FELINIA",
		localLore: [],
		scriptstate: {},
		fmIndex: -1,
		id: o()
	};
}
function f(e, t) {
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
function p(e, t) {
	let n = e.lorebook || [], i = n.filter((e) => e.era == null), a = {
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
		lorebook: i,
		regex: e.regex,
		triggers: e.triggers,
		defaultVariables: e.defaultVariables,
		scanDepth: e.scanDepth,
		loreTokenBudget: e.loreTokenBudget,
		recursiveScanning: e.recursiveScanning,
		fullWordMatching: e.fullWordMatching
	}, o = [], c = [];
	for (let e of t) {
		let t = new Set((e.figs || []).map((e) => e.n)), i = n.filter((t) => t.era === e.i && t.lay !== "figures");
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
			lorebook: i,
			defaultVariables: {
				felinia_era: e.i,
				felinia_year: e.y ?? "",
				felinia_era_label: e.ys ?? ""
			}
		}), (e.figs || []).forEach((i, a) => {
			let o = n.filter((t) => t.era === e.i && t.lay === "figures" && (t.cat === `人 · ${i.n}` || String(t.title || "").startsWith(`${i.n} ·`))).map((n) => {
				if (!r(n)) return n;
				let o = s(n.keys).filter((e) => e !== i.n && t.has(e));
				return {
					...n,
					keys: o.length ? o : [`__FELINIA_RELATION_${e.i}_${a}__`]
				};
			}), l = `era:${e.i}:npc:${a}:${i.n}`;
			c.push({
				key: l,
				eraIndex: e.i,
				species: i.sp,
				title: i.ti,
				name: i.n,
				description: [i.ti, i.d].filter(Boolean).join("\n"),
				personality: o.filter((e) => !r(e)).map((e) => e.content || "").filter(Boolean).join("\n\n"),
				mes_example: "",
				quotes: i.q,
				lorebook: o,
				tags: [
					"FELINIA",
					`era:${e.i}`,
					i.sp || "",
					i.ti || ""
				].filter(Boolean),
				defaultVariables: {
					felinia_npc_key: l,
					felinia_era: e.i,
					felinia_species: i.sp || "",
					felinia_title: i.ti || "",
					felinia_sprite: i.v || ""
				}
			});
		});
	}
	return {
		base: a,
		eras: o,
		npcs: c
	};
}
function m(e, t) {
	let n = t.kind === "era" ? `era-${t.eraIndex}` : `npc-${t.key}`, r = (e.lorebook || []).map((e, t) => u(e, t, n)).filter((e) => !!e), i = a(e.regex || []), s = a(e.triggers || []), l = {
		...t,
		baseLoreCount: r.length,
		baseRegexCount: i.length,
		baseTriggerCount: s.length,
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
		chats: [d()],
		chatFolders: [],
		chatPage: 0,
		viewScreen: "none",
		bias: [],
		emotionImages: [],
		globalLore: r,
		chaId: o(),
		sdData: [],
		customscript: i,
		triggerscript: s,
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
		extentions: { felinia: l },
		largePortrait: !1,
		lorePlus: !1,
		inlayViewScreen: !1,
		imported: !1,
		source: [],
		ccAssets: [],
		lowLevelAccess: !1,
		defaultVariables: c(e.defaultVariables),
		reloadKeys: 0,
		prebuiltAssetCommand: "",
		prebuiltAssetExclude: [],
		prebuiltAssetStyle: "",
		customModuleToggle: "",
		hideChatIcon: !0
	};
}
function h(e) {
	return e.extentions?.felinia;
}
async function g() {
	return i ||= Promise.all([
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
	})), i;
}
function _() {
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
async function v(e) {
	let t = await g();
	t.database.setDatabase(_());
	let n = [...e.eras].sort((e, t) => e.index - t.index).map((t) => m(f(e.base, t), {
		kind: "era",
		key: `era:${t.index}`,
		eraIndex: t.index
	})), r = e.npcs.map((e) => m(e, {
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
async function y(e, t) {
	return v(p(e, t));
}
async function b(e, t = []) {
	let r = await g(), i = r.database.getDatabase(), o = i.characters.findIndex((t) => t.type !== "group" && h(t)?.kind === "era" && h(t)?.eraIndex === e);
	if (o < 0) throw Error(`FELINIA era ${e} is not installed`);
	let s = i.characters[o], c = h(s);
	s.globalLore = s.globalLore.slice(0, c.baseLoreCount), s.customscript = s.customscript.slice(0, c.baseRegexCount), s.triggerscript = s.triggerscript.slice(0, c.baseTriggerCount), s.desc = c.baseDesc ?? s.desc, s.personality = c.basePersonality ?? s.personality, s.scenario = c.baseScenario ?? s.scenario, s.exampleMessage = c.baseExampleMessage ?? s.exampleMessage;
	let l = [];
	for (let e of [...new Set(t)]) {
		let t = i.characters.find((t) => t.type !== "group" && h(t)?.kind === "npc" && h(t)?.key === e);
		t && (l.push(t), s.globalLore.push(...a(t.globalLore.filter((e) => /第五项\s*·\s*关系|关系/.test(String(e.comment || ""))))), s.customscript.push(...a(t.customscript)), s.triggerscript.push(...a(t.triggerscript)));
	}
	return Object.assign(s, n({
		desc: s.desc,
		personality: s.personality,
		scenario: s.scenario,
		exampleMessage: s.exampleMessage
	}, l)), c.activeNpcKeys = l.map((e) => h(e).key), s.extentions.felinia = c, r.stores.selectedCharID.set(o), r.database.setCharacterByIndex(o, s), {
		era: e,
		character: s,
		activeNpcs: l
	};
}
async function x(e) {
	let t = await g(), n = t.database.getCurrentCharacter();
	if (!n || n.type === "group") throw Error("No FELINIA era is active");
	e.systemPrompt !== void 0 && (n.systemPrompt = e.systemPrompt), e.description !== void 0 && (n.desc = e.description), e.personality !== void 0 && (n.personality = e.personality), e.scenario !== void 0 && (n.scenario = e.scenario), e.firstMessage !== void 0 && (n.firstMessage = e.firstMessage), e.postHistoryInstructions !== void 0 && (n.replaceGlobalNote = e.postHistoryInstructions), e.defaultVariables !== void 0 && (n.defaultVariables = c(e.defaultVariables));
	let r = n.chats[n.chatPage];
	return e.authorNote !== void 0 && (r.note = e.authorNote), e.localLore !== void 0 && (r.localLore = e.localLore.map((e, t) => u(e, t, "session")).filter((e) => !!e)), e.regexScripts !== void 0 && n.customscript.push(...a(e.regexScripts)), e.triggerScripts !== void 0 && n.triggerscript.push(...a(e.triggerScripts)), t.database.setCurrentCharacter(n), n;
}
async function S(e) {
	let t = await g(), n = t.database.getDatabase(), r = t.database.getCurrentCharacter();
	if (!r || r.type === "group") throw Error("No FELINIA era is active");
	r.supaMemory = e.enabled && e.mode !== "off", n.hypaV3 = r.supaMemory, n.hypav2 = !1, n.hypaMemory = !1, e.apiKey !== void 0 && (n.supaMemoryKey = e.apiKey), t.database.setCurrentCharacter(r);
}
async function C(e) {
	let t = (await g()).database.getDatabase();
	t.translatorType = e.provider === "deeplx" ? "deeplX" : e.provider, t.deeplOptions = {
		key: e.deeplKey || "",
		freeApi: e.deeplFree ?? !0
	}, t.deeplXOptions = {
		url: e.deeplxUrl || "http://localhost:1188",
		token: e.deeplxToken || ""
	}, t.feliniaFinalPromptTranslation = e.provider !== "off";
}
async function w(e, t, n, r) {
	return !e || r.provider === "off" ? e : (await C(r), (await g()).translator.runTranslator(e, !0, t, n, {
		regenerate: r.regenerate,
		throwOnError: !0
	}));
}
async function T(e, t) {
	let n = await g(), r = n.database.getDatabase(), i = r.characters.findIndex((t) => t.type !== "group" && h(t)?.kind === "npc" && h(t)?.key === e);
	if (i < 0) throw Error(`FELINIA character ${e} is not installed`);
	let a = r.characters[i];
	a.scriptstate = {
		...a.scriptstate || {},
		...t
	}, n.database.setCharacterByIndex(i, a);
}
async function E(e, t) {
	let n = await g();
	await n.database.importPreset({
		name: e,
		data: t
	});
	let r = n.database.getDatabase();
	r.botPresets.length && (r.botPresetsId = r.botPresets.length - 1, n.database.changeToPreset(r.botPresetsId, !1));
}
function D(t) {
	return t === "responses" ? e.OpenAIResponseAPI : t === "anthropic" ? e.Anthropic : t === "gemini" ? e.GoogleCloud : t === "mistral" ? e.Mistral : t === "ollama" ? e.Ollama : e.OpenAICompatible;
}
async function O(e) {
	let t = (await g()).database.getDatabase();
	t.aiModel = "reverse_proxy", t.proxyRequestModel = "custom", t.customProxyRequestModel = e.model, t.forceReplaceUrl = e.base, t.proxyKey = e.key || "", t.customAPIFormat = D(e.format), t.temperature = e.temperature == null ? -1e3 : Math.round(e.temperature * 100), t.top_p = e.topP == null ? -1e3 : e.topP, t.reasoningEffort = e.reasoningEffort ?? 0, t.maxResponse = e.maxTokens ?? 4096, t.maxContext = e.contextTokens ?? 65536, t.useStreaming = e.stream ?? !0, t.autofillRequestUrl = e.autofillRequestUrl ?? !0, t.usePlainFetch = !0, t.strictOpenAICompatible = e.format === "openai" || !e.format, t.inlayErrorResponse = !0;
}
function k(e, t) {
	let n = [...e.message.slice(t)].reverse().find((e) => e.role === "char" && /```risuerror\b/i.test(e.data || ""));
	return n ? (e.message = e.message.slice(0, t), String(n.data || "").replace(/^```risuerror\s*/i, "").replace(/```\s*$/i, "").trim()) : "";
}
function A(e) {
	return String(e || "").replace(/<mvu_panel>[\s\S]*?<\/mvu_panel>/gi, "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim().length;
}
function j(e) {
	let t = [];
	for (let n of String(e || "").matchAll(/「([^」\n]{2,180})」/g)) for (let e of n[1].split(/[。！？!?]+/)) {
		let n = e.trim(), r = n.replace(/\s+/g, "").replace(/[，、：；…—―~～♡]+$/g, "").replace(/喵(?:呜|嗷|咪)?[~～♡]*$/u, "");
		r.length >= 3 && t.push({
			raw: n,
			key: r
		});
	}
	return t;
}
function M(e, t) {
	let n = new Set(t.flatMap((e) => j(e).map((e) => e.key)));
	return [...new Set(j(e).filter((e) => n.has(e.key)).map((e) => e.raw))];
}
function N(e) {
	return {
		role: e.role === "assistant" || e.role === "char" ? "char" : "user",
		data: String(e.content || ""),
		scanData: e.scanContent == null ? void 0 : String(e.scanContent),
		name: e.name,
		chatId: e.chatId,
		time: e.time ?? Date.now()
	};
}
async function P(e) {
	let t = await g(), n = t.database.getCurrentCharacter();
	if (!n || n.type === "group") throw Error("No FELINIA era is active");
	n.chats[n.chatPage].message = e.filter((e) => e.role !== "system").map(N), t.database.setCurrentCharacter(n);
}
async function F() {
	let e = (await g()).database.getCurrentCharacter();
	return !e || e.type === "group" ? [] : e.chats[e.chatPage].message.map((e) => ({
		role: e.role === "char" ? "assistant" : "user",
		content: e.data,
		name: e.name,
		chatId: e.chatId,
		time: e.time
	}));
}
async function I(e = {}) {
	let t = await g();
	e.provider && await O(e.provider);
	let n = t.database.getCurrentCharacter();
	if (!n || n.type === "group") throw Error("No FELINIA era is active");
	let r = n.chats[n.chatPage], i = r.message.length, o = n.systemPrompt, s = Math.max(0, Math.round(e.minChars || 0)), c = Math.max(0, Math.min(1, Math.round(e.maxShortRetries ?? 1))), l = Math.max(1, c), u = r.message.slice(0, i).filter((e) => e.role === "char").slice(-3).map((e) => String(e.data || ""));
	t.process.doingChat.set(!1);
	let d = n.chats[n.chatPage].message.at(-1)?.data || "", f;
	e.onDelta && (f = setInterval(() => {
		let n = t.database.getCurrentChat()?.message.at(-1);
		n?.role !== "char" || n.data === d || (d = n.data, e.onDelta?.(d));
	}, 50));
	try {
		let c, f, p = "";
		for (let m = 0; m <= l; m++) {
			if (m > 0 && (r.message = r.message.slice(0, i), n.systemPrompt = `${o}\n\n${p}`, t.database.setCurrentCharacter(n), d = r.message.at(-1)?.data || ""), t.process.doingChat.set(!1), !await t.process.sendChat(-1, {
				signal: e.signal,
				preview: e.preview
			})) {
				let e = k(r, i) || "生成请求失败", t = c || f;
				if (!t) throw Error(e);
				r.message.push(a(t));
				break;
			}
			if (e.preview) break;
			let h = r.message.at(-1);
			if (!h || h.role !== "char") continue;
			(!f || A(h.data) > A(f.data)) && (f = a(h));
			let g = M(h.data, u);
			!g.length && (!c || A(h.data) > A(c.data)) && (c = a(h));
			let _ = !!s && A(h.data) < s;
			if (!g.length && !_) break;
			if (m === l) {
				let e = c || f;
				e && (r.message[r.message.length - 1] = a(e));
				break;
			}
			p = g.length ? `【对白复读纠正】刚才草稿复用了最近三回已经说过的台词：${g.map((e) => `「${e}」`).join("、")}。该草稿作废。保持人物全部设定与当前场景，从本回开头重写；这些句子及同义的万能推脱都不得再次出现。根据眼前对象、动作和利害写出新的回应，也可以用沉默、追问、改口或具体行动代替。` : `【篇幅纠正】刚才草稿的正文不足 ${s} 字，已经作废。保持同一场景从头重写；状态栏不计入字数，正文达到 ${s} 字后才能结束。用事件、反应、对话和具体动作扩展，不要总结或赶结局。`;
		}
		if (e.preview) return {
			text: JSON.stringify(t.process.previewFormated),
			prompt: a(t.process.previewFormated),
			history: await F()
		};
		let m = t.database.getCurrentChat()?.message.at(-1);
		if (!m || m.role !== "char" || !String(m.data || "").trim()) throw Error("接口没有返回可显示的正文");
		return e.onDelta?.(m.data), {
			text: m.data,
			history: await F()
		};
	} finally {
		n.systemPrompt = o, t.database.setCurrentCharacter(n), f && clearInterval(f), t.process.doingChat.set(!1);
	}
}
async function L(e) {
	let t = await g();
	e.provider && await O(e.provider);
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
async function R(e) {
	let t = await g(), n = `${e.base.replace(/\/$/, "").replace(/\/(chat\/completions|responses)$/i, "")}/models`, r = await t.globalApi.globalFetch(n, {
		method: "GET",
		headers: e.key ? { Authorization: `Bearer ${e.key}` } : {},
		plainFetchForce: !0
	});
	if (!r.ok) throw Error(typeof r.data == "string" ? r.data : `HTTP ${r.status}`);
	return (Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data?.models) ? r.data.models : []).map((e) => String(e?.id || e?.name || "")).filter(Boolean);
}
async function z(e) {
	let t = await g(), n = t.database.getCurrentCharacter();
	return n ? t.scripts.processScript(n, e, "editdisplay") : e;
}
async function B() {
	return (await g()).database.getDatabase({ snapshot: !0 });
}
async function V(e) {
	let t = await g();
	t.database.setDatabase(e);
	let n = e.characters.findIndex((e) => e.type !== "group" && h(e)?.kind === "era");
	t.stores.selectedCharID.set(n);
}
async function H() {
	let e = await g();
	e.database.setDatabase(_()), e.stores.selectedCharID.set(-1);
}
var U = Object.freeze({
	version: "2026.8.250",
	upstreamCommit: "e565563a288ebe4c65b6099a1645ba477d1c84b4",
	install: v,
	installContent: y,
	compileDefinition: p,
	activateEra: b,
	setSessionContent: x,
	configureMemory: S,
	configureTranslation: C,
	translate: w,
	setNpcState: T,
	importPreset: E,
	configureProvider: O,
	setHistory: P,
	getHistory: F,
	generate: I,
	request: L,
	listModels: R,
	processDisplay: z,
	snapshot: B,
	restore: V,
	reset: H
});
//#endregion
export { U as FeliniaRisu, b as activateFeliniaEra, p as compileFeliniaDefinition, S as configureFeliniaMemory, O as configureFeliniaProvider, C as configureFeliniaTranslation, M as findRepeatedFeliniaDialogue, I as generateFeliniaTurn, F as getFeliniaHistory, E as importRisuPreset, y as installFeliniaContent, v as installFeliniaGame, R as listFeliniaModels, n as mergeFeliniaNativeCharacterFields, z as processFeliniaDisplay, L as requestFeliniaAux, H as resetFeliniaRisu, V as restoreFeliniaRisu, N as risuMessage, P as setFeliniaHistory, T as setFeliniaNpcState, x as setFeliniaSessionContent, B as snapshotFeliniaRisu, w as translateFelinia };
