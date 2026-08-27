import { i as e, t } from "./chunk-DeC0fbbY.js";
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/tokenizer/keywords.js
var n;
(function(e) {
	e[e.NONE = 0] = "NONE", e[e._abstract = 1] = "_abstract", e[e._accessor = 2] = "_accessor", e[e._as = 3] = "_as", e[e._assert = 4] = "_assert", e[e._asserts = 5] = "_asserts", e[e._async = 6] = "_async", e[e._await = 7] = "_await", e[e._checks = 8] = "_checks", e[e._constructor = 9] = "_constructor", e[e._declare = 10] = "_declare", e[e._enum = 11] = "_enum", e[e._exports = 12] = "_exports", e[e._from = 13] = "_from", e[e._get = 14] = "_get", e[e._global = 15] = "_global", e[e._implements = 16] = "_implements", e[e._infer = 17] = "_infer", e[e._interface = 18] = "_interface", e[e._is = 19] = "_is", e[e._keyof = 20] = "_keyof", e[e._mixins = 21] = "_mixins", e[e._module = 22] = "_module", e[e._namespace = 23] = "_namespace", e[e._of = 24] = "_of", e[e._opaque = 25] = "_opaque", e[e._out = 26] = "_out", e[e._override = 27] = "_override", e[e._private = 28] = "_private", e[e._protected = 29] = "_protected", e[e._proto = 30] = "_proto", e[e._public = 31] = "_public", e[e._readonly = 32] = "_readonly", e[e._require = 33] = "_require", e[e._satisfies = 34] = "_satisfies", e[e._set = 35] = "_set", e[e._static = 36] = "_static", e[e._symbol = 37] = "_symbol", e[e._type = 38] = "_type", e[e._unique = 39] = "_unique", e[e._using = 40] = "_using";
})(n ||= {});
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/tokenizer/types.js
/* istanbul ignore file */
var r;
(function(e) {
	e[e.PRECEDENCE_MASK = 15] = "PRECEDENCE_MASK", e[e.IS_KEYWORD = 16] = "IS_KEYWORD", e[e.IS_ASSIGN = 32] = "IS_ASSIGN", e[e.IS_RIGHT_ASSOCIATIVE = 64] = "IS_RIGHT_ASSOCIATIVE", e[e.IS_PREFIX = 128] = "IS_PREFIX", e[e.IS_POSTFIX = 256] = "IS_POSTFIX", e[e.IS_EXPRESSION_START = 512] = "IS_EXPRESSION_START", e[e.num = 512] = "num", e[e.bigint = 1536] = "bigint", e[e.decimal = 2560] = "decimal", e[e.regexp = 3584] = "regexp", e[e.string = 4608] = "string", e[e.name = 5632] = "name", e[e.eof = 6144] = "eof", e[e.bracketL = 7680] = "bracketL", e[e.bracketR = 8192] = "bracketR", e[e.braceL = 9728] = "braceL", e[e.braceBarL = 10752] = "braceBarL", e[e.braceR = 11264] = "braceR", e[e.braceBarR = 12288] = "braceBarR", e[e.parenL = 13824] = "parenL", e[e.parenR = 14336] = "parenR", e[e.comma = 15360] = "comma", e[e.semi = 16384] = "semi", e[e.colon = 17408] = "colon", e[e.doubleColon = 18432] = "doubleColon", e[e.dot = 19456] = "dot", e[e.question = 20480] = "question", e[e.questionDot = 21504] = "questionDot", e[e.arrow = 22528] = "arrow", e[e.template = 23552] = "template", e[e.ellipsis = 24576] = "ellipsis", e[e.backQuote = 25600] = "backQuote", e[e.dollarBraceL = 27136] = "dollarBraceL", e[e.at = 27648] = "at", e[e.hash = 29184] = "hash", e[e.eq = 29728] = "eq", e[e.assign = 30752] = "assign", e[e.preIncDec = 32640] = "preIncDec", e[e.postIncDec = 33664] = "postIncDec", e[e.bang = 34432] = "bang", e[e.tilde = 35456] = "tilde", e[e.pipeline = 35841] = "pipeline", e[e.nullishCoalescing = 36866] = "nullishCoalescing", e[e.logicalOR = 37890] = "logicalOR", e[e.logicalAND = 38915] = "logicalAND", e[e.bitwiseOR = 39940] = "bitwiseOR", e[e.bitwiseXOR = 40965] = "bitwiseXOR", e[e.bitwiseAND = 41990] = "bitwiseAND", e[e.equality = 43015] = "equality", e[e.lessThan = 44040] = "lessThan", e[e.greaterThan = 45064] = "greaterThan", e[e.relationalOrEqual = 46088] = "relationalOrEqual", e[e.bitShiftL = 47113] = "bitShiftL", e[e.bitShiftR = 48137] = "bitShiftR", e[e.plus = 49802] = "plus", e[e.minus = 50826] = "minus", e[e.modulo = 51723] = "modulo", e[e.star = 52235] = "star", e[e.slash = 53259] = "slash", e[e.exponent = 54348] = "exponent", e[e.jsxName = 55296] = "jsxName", e[e.jsxText = 56320] = "jsxText", e[e.jsxEmptyText = 57344] = "jsxEmptyText", e[e.jsxTagStart = 58880] = "jsxTagStart", e[e.jsxTagEnd = 59392] = "jsxTagEnd", e[e.typeParameterStart = 60928] = "typeParameterStart", e[e.nonNullAssertion = 61440] = "nonNullAssertion", e[e._break = 62480] = "_break", e[e._case = 63504] = "_case", e[e._catch = 64528] = "_catch", e[e._continue = 65552] = "_continue", e[e._debugger = 66576] = "_debugger", e[e._default = 67600] = "_default", e[e._do = 68624] = "_do", e[e._else = 69648] = "_else", e[e._finally = 70672] = "_finally", e[e._for = 71696] = "_for", e[e._function = 73232] = "_function", e[e._if = 73744] = "_if", e[e._return = 74768] = "_return", e[e._switch = 75792] = "_switch", e[e._throw = 77456] = "_throw", e[e._try = 77840] = "_try", e[e._var = 78864] = "_var", e[e._let = 79888] = "_let", e[e._const = 80912] = "_const", e[e._while = 81936] = "_while", e[e._with = 82960] = "_with", e[e._new = 84496] = "_new", e[e._this = 85520] = "_this", e[e._super = 86544] = "_super", e[e._class = 87568] = "_class", e[e._extends = 88080] = "_extends", e[e._export = 89104] = "_export", e[e._import = 90640] = "_import", e[e._yield = 91664] = "_yield", e[e._null = 92688] = "_null", e[e._true = 93712] = "_true", e[e._false = 94736] = "_false", e[e._in = 95256] = "_in", e[e._instanceof = 96280] = "_instanceof", e[e._typeof = 97936] = "_typeof", e[e._void = 98960] = "_void", e[e._delete = 99984] = "_delete", e[e._async = 100880] = "_async", e[e._get = 101904] = "_get", e[e._set = 102928] = "_set", e[e._declare = 103952] = "_declare", e[e._readonly = 104976] = "_readonly", e[e._abstract = 106e3] = "_abstract", e[e._static = 107024] = "_static", e[e._public = 107536] = "_public", e[e._private = 108560] = "_private", e[e._protected = 109584] = "_protected", e[e._override = 110608] = "_override", e[e._as = 112144] = "_as", e[e._enum = 113168] = "_enum", e[e._type = 114192] = "_type", e[e._implements = 115216] = "_implements";
})(r ||= {});
function i(e) {
	switch (e) {
		case r.num: return "num";
		case r.bigint: return "bigint";
		case r.decimal: return "decimal";
		case r.regexp: return "regexp";
		case r.string: return "string";
		case r.name: return "name";
		case r.eof: return "eof";
		case r.bracketL: return "[";
		case r.bracketR: return "]";
		case r.braceL: return "{";
		case r.braceBarL: return "{|";
		case r.braceR: return "}";
		case r.braceBarR: return "|}";
		case r.parenL: return "(";
		case r.parenR: return ")";
		case r.comma: return ",";
		case r.semi: return ";";
		case r.colon: return ":";
		case r.doubleColon: return "::";
		case r.dot: return ".";
		case r.question: return "?";
		case r.questionDot: return "?.";
		case r.arrow: return "=>";
		case r.template: return "template";
		case r.ellipsis: return "...";
		case r.backQuote: return "`";
		case r.dollarBraceL: return "${";
		case r.at: return "@";
		case r.hash: return "#";
		case r.eq: return "=";
		case r.assign: return "_=";
		case r.preIncDec: return "++/--";
		case r.postIncDec: return "++/--";
		case r.bang: return "!";
		case r.tilde: return "~";
		case r.pipeline: return "|>";
		case r.nullishCoalescing: return "??";
		case r.logicalOR: return "||";
		case r.logicalAND: return "&&";
		case r.bitwiseOR: return "|";
		case r.bitwiseXOR: return "^";
		case r.bitwiseAND: return "&";
		case r.equality: return "==/!=";
		case r.lessThan: return "<";
		case r.greaterThan: return ">";
		case r.relationalOrEqual: return "<=/>=";
		case r.bitShiftL: return "<<";
		case r.bitShiftR: return ">>/>>>";
		case r.plus: return "+";
		case r.minus: return "-";
		case r.modulo: return "%";
		case r.star: return "*";
		case r.slash: return "/";
		case r.exponent: return "**";
		case r.jsxName: return "jsxName";
		case r.jsxText: return "jsxText";
		case r.jsxEmptyText: return "jsxEmptyText";
		case r.jsxTagStart: return "jsxTagStart";
		case r.jsxTagEnd: return "jsxTagEnd";
		case r.typeParameterStart: return "typeParameterStart";
		case r.nonNullAssertion: return "nonNullAssertion";
		case r._break: return "break";
		case r._case: return "case";
		case r._catch: return "catch";
		case r._continue: return "continue";
		case r._debugger: return "debugger";
		case r._default: return "default";
		case r._do: return "do";
		case r._else: return "else";
		case r._finally: return "finally";
		case r._for: return "for";
		case r._function: return "function";
		case r._if: return "if";
		case r._return: return "return";
		case r._switch: return "switch";
		case r._throw: return "throw";
		case r._try: return "try";
		case r._var: return "var";
		case r._let: return "let";
		case r._const: return "const";
		case r._while: return "while";
		case r._with: return "with";
		case r._new: return "new";
		case r._this: return "this";
		case r._super: return "super";
		case r._class: return "class";
		case r._extends: return "extends";
		case r._export: return "export";
		case r._import: return "import";
		case r._yield: return "yield";
		case r._null: return "null";
		case r._true: return "true";
		case r._false: return "false";
		case r._in: return "in";
		case r._instanceof: return "instanceof";
		case r._typeof: return "typeof";
		case r._void: return "void";
		case r._delete: return "delete";
		case r._async: return "async";
		case r._get: return "get";
		case r._set: return "set";
		case r._declare: return "declare";
		case r._readonly: return "readonly";
		case r._abstract: return "abstract";
		case r._static: return "static";
		case r._public: return "public";
		case r._private: return "private";
		case r._protected: return "protected";
		case r._override: return "override";
		case r._as: return "as";
		case r._enum: return "enum";
		case r._type: return "type";
		case r._implements: return "implements";
		default: return "";
	}
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/tokenizer/state.js
var a = class {
	constructor(e, t, n) {
		this.startTokenIndex = e, this.endTokenIndex = t, this.isFunctionScope = n;
	}
}, o = class {
	constructor(e, t, n, r, i, a, o, s, c, l, u, d, f) {
		this.potentialArrowAt = e, this.noAnonFunctionType = t, this.inDisallowConditionalTypesContext = n, this.tokensLength = r, this.scopesLength = i, this.pos = a, this.type = o, this.contextualKeyword = s, this.start = c, this.end = l, this.isType = u, this.scopeDepth = d, this.error = f;
	}
}, s = class e {
	constructor() {
		e.prototype.__init.call(this), e.prototype.__init2.call(this), e.prototype.__init3.call(this), e.prototype.__init4.call(this), e.prototype.__init5.call(this), e.prototype.__init6.call(this), e.prototype.__init7.call(this), e.prototype.__init8.call(this), e.prototype.__init9.call(this), e.prototype.__init10.call(this), e.prototype.__init11.call(this), e.prototype.__init12.call(this), e.prototype.__init13.call(this);
	}
	__init() {
		this.potentialArrowAt = -1;
	}
	__init2() {
		this.noAnonFunctionType = !1;
	}
	__init3() {
		this.inDisallowConditionalTypesContext = !1;
	}
	__init4() {
		this.tokens = [];
	}
	__init5() {
		this.scopes = [];
	}
	__init6() {
		this.pos = 0;
	}
	__init7() {
		this.type = r.eof;
	}
	__init8() {
		this.contextualKeyword = n.NONE;
	}
	__init9() {
		this.start = 0;
	}
	__init10() {
		this.end = 0;
	}
	__init11() {
		this.isType = !1;
	}
	__init12() {
		this.scopeDepth = 0;
	}
	__init13() {
		this.error = null;
	}
	snapshot() {
		return new o(this.potentialArrowAt, this.noAnonFunctionType, this.inDisallowConditionalTypesContext, this.tokens.length, this.scopes.length, this.pos, this.type, this.contextualKeyword, this.start, this.end, this.isType, this.scopeDepth, this.error);
	}
	restoreFromSnapshot(e) {
		this.potentialArrowAt = e.potentialArrowAt, this.noAnonFunctionType = e.noAnonFunctionType, this.inDisallowConditionalTypesContext = e.inDisallowConditionalTypesContext, this.tokens.length = e.tokensLength, this.scopes.length = e.scopesLength, this.pos = e.pos, this.type = e.type, this.contextualKeyword = e.contextualKeyword, this.start = e.start, this.end = e.end, this.isType = e.isType, this.scopeDepth = e.scopeDepth, this.error = e.error;
	}
}, c;
(function(e) {
	e[e.backSpace = 8] = "backSpace", e[e.lineFeed = 10] = "lineFeed", e[e.tab = 9] = "tab", e[e.carriageReturn = 13] = "carriageReturn", e[e.shiftOut = 14] = "shiftOut", e[e.space = 32] = "space", e[e.exclamationMark = 33] = "exclamationMark", e[e.quotationMark = 34] = "quotationMark", e[e.numberSign = 35] = "numberSign", e[e.dollarSign = 36] = "dollarSign", e[e.percentSign = 37] = "percentSign", e[e.ampersand = 38] = "ampersand", e[e.apostrophe = 39] = "apostrophe", e[e.leftParenthesis = 40] = "leftParenthesis", e[e.rightParenthesis = 41] = "rightParenthesis", e[e.asterisk = 42] = "asterisk", e[e.plusSign = 43] = "plusSign", e[e.comma = 44] = "comma", e[e.dash = 45] = "dash", e[e.dot = 46] = "dot", e[e.slash = 47] = "slash", e[e.digit0 = 48] = "digit0", e[e.digit1 = 49] = "digit1", e[e.digit2 = 50] = "digit2", e[e.digit3 = 51] = "digit3", e[e.digit4 = 52] = "digit4", e[e.digit5 = 53] = "digit5", e[e.digit6 = 54] = "digit6", e[e.digit7 = 55] = "digit7", e[e.digit8 = 56] = "digit8", e[e.digit9 = 57] = "digit9", e[e.colon = 58] = "colon", e[e.semicolon = 59] = "semicolon", e[e.lessThan = 60] = "lessThan", e[e.equalsTo = 61] = "equalsTo", e[e.greaterThan = 62] = "greaterThan", e[e.questionMark = 63] = "questionMark", e[e.atSign = 64] = "atSign", e[e.uppercaseA = 65] = "uppercaseA", e[e.uppercaseB = 66] = "uppercaseB", e[e.uppercaseC = 67] = "uppercaseC", e[e.uppercaseD = 68] = "uppercaseD", e[e.uppercaseE = 69] = "uppercaseE", e[e.uppercaseF = 70] = "uppercaseF", e[e.uppercaseG = 71] = "uppercaseG", e[e.uppercaseH = 72] = "uppercaseH", e[e.uppercaseI = 73] = "uppercaseI", e[e.uppercaseJ = 74] = "uppercaseJ", e[e.uppercaseK = 75] = "uppercaseK", e[e.uppercaseL = 76] = "uppercaseL", e[e.uppercaseM = 77] = "uppercaseM", e[e.uppercaseN = 78] = "uppercaseN", e[e.uppercaseO = 79] = "uppercaseO", e[e.uppercaseP = 80] = "uppercaseP", e[e.uppercaseQ = 81] = "uppercaseQ", e[e.uppercaseR = 82] = "uppercaseR", e[e.uppercaseS = 83] = "uppercaseS", e[e.uppercaseT = 84] = "uppercaseT", e[e.uppercaseU = 85] = "uppercaseU", e[e.uppercaseV = 86] = "uppercaseV", e[e.uppercaseW = 87] = "uppercaseW", e[e.uppercaseX = 88] = "uppercaseX", e[e.uppercaseY = 89] = "uppercaseY", e[e.uppercaseZ = 90] = "uppercaseZ", e[e.leftSquareBracket = 91] = "leftSquareBracket", e[e.backslash = 92] = "backslash", e[e.rightSquareBracket = 93] = "rightSquareBracket", e[e.caret = 94] = "caret", e[e.underscore = 95] = "underscore", e[e.graveAccent = 96] = "graveAccent", e[e.lowercaseA = 97] = "lowercaseA", e[e.lowercaseB = 98] = "lowercaseB", e[e.lowercaseC = 99] = "lowercaseC", e[e.lowercaseD = 100] = "lowercaseD", e[e.lowercaseE = 101] = "lowercaseE", e[e.lowercaseF = 102] = "lowercaseF", e[e.lowercaseG = 103] = "lowercaseG", e[e.lowercaseH = 104] = "lowercaseH", e[e.lowercaseI = 105] = "lowercaseI", e[e.lowercaseJ = 106] = "lowercaseJ", e[e.lowercaseK = 107] = "lowercaseK", e[e.lowercaseL = 108] = "lowercaseL", e[e.lowercaseM = 109] = "lowercaseM", e[e.lowercaseN = 110] = "lowercaseN", e[e.lowercaseO = 111] = "lowercaseO", e[e.lowercaseP = 112] = "lowercaseP", e[e.lowercaseQ = 113] = "lowercaseQ", e[e.lowercaseR = 114] = "lowercaseR", e[e.lowercaseS = 115] = "lowercaseS", e[e.lowercaseT = 116] = "lowercaseT", e[e.lowercaseU = 117] = "lowercaseU", e[e.lowercaseV = 118] = "lowercaseV", e[e.lowercaseW = 119] = "lowercaseW", e[e.lowercaseX = 120] = "lowercaseX", e[e.lowercaseY = 121] = "lowercaseY", e[e.lowercaseZ = 122] = "lowercaseZ", e[e.leftCurlyBrace = 123] = "leftCurlyBrace", e[e.verticalBar = 124] = "verticalBar", e[e.rightCurlyBrace = 125] = "rightCurlyBrace", e[e.tilde = 126] = "tilde", e[e.nonBreakingSpace = 160] = "nonBreakingSpace", e[e.oghamSpaceMark = 5760] = "oghamSpaceMark", e[e.lineSeparator = 8232] = "lineSeparator", e[e.paragraphSeparator = 8233] = "paragraphSeparator";
})(c ||= {});
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/traverser/base.js
var l, u, d, f, p, m;
function h() {
	return m++;
}
function ee(e) {
	if ("pos" in e) {
		let t = ne(e.pos);
		e.message += ` (${t.line}:${t.column})`, e.loc = t;
	}
	return e;
}
var te = class {
	constructor(e, t) {
		this.line = e, this.column = t;
	}
};
function ne(e) {
	let t = 1, n = 1;
	for (let r = 0; r < e; r++) p.charCodeAt(r) === c.lineFeed ? (t++, n = 1) : n++;
	return new te(t, n);
}
function re(e, t, n, r) {
	p = e, f = new s(), m = 1, l = t, u = n, d = r;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/traverser/util.js
function g(e) {
	return f.contextualKeyword === e;
}
function ie(e) {
	let t = Se();
	return t.type === r.name && t.contextualKeyword === e;
}
function _(e) {
	return f.contextualKeyword === e && N(r.name);
}
function v(e) {
	_(e) || w();
}
function y() {
	return P(r.eof) || P(r.braceR) || b();
}
function b() {
	let e = f.tokens[f.tokens.length - 1], t = e ? e.end : 0;
	for (let e = t; e < f.start; e++) {
		let t = p.charCodeAt(e);
		if (t === c.lineFeed || t === c.carriageReturn || t === 8232 || t === 8233) return !0;
	}
	return !1;
}
function ae() {
	let e = Ce();
	for (let t = f.end; t < e; t++) {
		let e = p.charCodeAt(t);
		if (e === c.lineFeed || e === c.carriageReturn || e === 8232 || e === 8233) return !0;
	}
	return !1;
}
function x() {
	return N(r.semi) || y();
}
function S() {
	x() || w("Unexpected token, expected \";\"");
}
function C(e) {
	N(e) || w(`Unexpected token, expected "${i(e)}"`);
}
function w(e = "Unexpected token", t = f.start) {
	if (f.error) return;
	let n = SyntaxError(e);
	n.pos = t, f.error = n, f.pos = p.length, I(r.eof);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/util/whitespace.js
var oe = [
	9,
	11,
	12,
	c.space,
	c.nonBreakingSpace,
	c.oghamSpaceMark,
	8192,
	8193,
	8194,
	8195,
	8196,
	8197,
	8198,
	8199,
	8200,
	8201,
	8202,
	8239,
	8287,
	12288,
	65279
], se = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g, ce = new Uint8Array(65536);
for (let e of oe) ce[e] = 1;
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/util/identifier.js
function T(e) {
	if (e < 48) return e === 36;
	if (e < 58) return !0;
	if (e < 65) return !1;
	if (e < 91) return !0;
	if (e < 97) return e === 95;
	if (e < 123) return !0;
	if (e < 128) return !1;
	throw Error("Should not be called with non-ASCII char code.");
}
var E = new Uint8Array(65536);
for (let e = 0; e < 128; e++) E[e] = T(e) ? 1 : 0;
for (let e = 128; e < 65536; e++) E[e] = 1;
for (let e of oe) E[e] = 0;
E[8232] = 0, E[8233] = 0;
var le = E.slice();
for (let e = c.digit0; e <= c.digit9; e++) le[e] = 0;
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/tokenizer/readWordTree.js
var ue = new Int32Array([
	-1,
	27,
	783,
	918,
	1755,
	2376,
	2862,
	3483,
	-1,
	3699,
	-1,
	4617,
	4752,
	4833,
	5130,
	5508,
	5940,
	-1,
	6480,
	6939,
	7749,
	8181,
	8451,
	8613,
	-1,
	8829,
	-1,
	-1,
	-1,
	54,
	243,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	432,
	-1,
	-1,
	-1,
	675,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	81,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	108,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	135,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	162,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	189,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	216,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._abstract << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	270,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	297,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	324,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	351,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	378,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	405,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._accessor << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._as << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	459,
	-1,
	-1,
	-1,
	-1,
	-1,
	594,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	486,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	513,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	540,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._assert << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	567,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._asserts << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	621,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	648,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._async << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	702,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	729,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	756,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._await << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	810,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	837,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	864,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	891,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._break << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	945,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1107,
	-1,
	-1,
	-1,
	1242,
	-1,
	-1,
	1350,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	972,
	1026,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	999,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._case << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1053,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1080,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._catch << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1134,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1161,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1188,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1215,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._checks << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1269,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1296,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1323,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._class << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1377,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1404,
	1620,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1431,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._const << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1458,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1485,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1512,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1539,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1566,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1593,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._constructor << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1647,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1674,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1701,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1728,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._continue << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1782,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2349,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1809,
	1971,
	-1,
	-1,
	2106,
	-1,
	-1,
	-1,
	-1,
	-1,
	2241,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1836,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1863,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1890,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1917,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1944,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._debugger << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	1998,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2025,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2052,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2079,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._declare << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2133,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2160,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2187,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2214,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._default << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2268,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2295,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2322,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._delete << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._do << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2403,
	-1,
	2484,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2565,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2430,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2457,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._else << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2511,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2538,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._enum << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2592,
	-1,
	-1,
	-1,
	2727,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2619,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2646,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2673,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._export << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2700,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._exports << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2754,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2781,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2808,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2835,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._extends << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2889,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2997,
	-1,
	-1,
	-1,
	-1,
	-1,
	3159,
	-1,
	-1,
	3213,
	-1,
	-1,
	3294,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2916,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2943,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	2970,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._false << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3024,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3051,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3078,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3105,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3132,
	-1,
	(r._finally << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3186,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._for << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3240,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3267,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._from << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3321,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3348,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3375,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3402,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3429,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3456,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._function << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3510,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3564,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3537,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._get << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3591,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3618,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3645,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3672,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._global << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3726,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3753,
	4077,
	-1,
	-1,
	-1,
	-1,
	4590,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._if << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3780,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3807,
	-1,
	-1,
	3996,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3834,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3861,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3888,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3915,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3942,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	3969,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._implements << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4023,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4050,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._import << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._in << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4104,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4185,
	4401,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4131,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4158,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._infer << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4212,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4239,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4266,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4293,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4320,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4347,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4374,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._instanceof << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4428,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4455,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4482,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4509,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4536,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4563,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._interface << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._is << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4644,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4671,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4698,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4725,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._keyof << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4779,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4806,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._let << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4860,
	-1,
	-1,
	-1,
	-1,
	-1,
	4995,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4887,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4914,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4941,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	4968,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._mixins << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5022,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5049,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5076,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5103,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._module << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5157,
	-1,
	-1,
	-1,
	5373,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5427,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5184,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5211,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5238,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5265,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5292,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5319,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5346,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._namespace << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5400,
	-1,
	-1,
	-1,
	(r._new << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5454,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5481,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._null << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5535,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5562,
	-1,
	-1,
	-1,
	-1,
	5697,
	5751,
	-1,
	-1,
	-1,
	-1,
	n._of << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5589,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5616,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5643,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5670,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._opaque << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5724,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._out << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5778,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5805,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5832,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5859,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5886,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5913,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._override << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5967,
	-1,
	-1,
	6345,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	5994,
	-1,
	-1,
	-1,
	-1,
	-1,
	6129,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6021,
	-1,
	-1,
	-1,
	-1,
	-1,
	6048,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6075,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6102,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._private << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6156,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6183,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6318,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6210,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6237,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6264,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6291,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._protected << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._proto << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6372,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6399,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6426,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6453,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._public << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6507,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6534,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6696,
	-1,
	-1,
	6831,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6561,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6588,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6615,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6642,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6669,
	-1,
	n._readonly << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6723,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6750,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6777,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6804,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._require << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6858,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6885,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6912,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._return << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6966,
	-1,
	-1,
	-1,
	7182,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7236,
	7371,
	-1,
	7479,
	-1,
	7614,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	6993,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7020,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7047,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7074,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7101,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7128,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7155,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._satisfies << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7209,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._set << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7263,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7290,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7317,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7344,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._static << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7398,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7425,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7452,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._super << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7506,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7533,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7560,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7587,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._switch << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7641,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7668,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7695,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7722,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._symbol << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7776,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7938,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8046,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7803,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7857,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7830,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._this << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7884,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7911,
	-1,
	-1,
	-1,
	(r._throw << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7965,
	-1,
	-1,
	-1,
	8019,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	7992,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._true << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._try << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8073,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8100,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._type << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8127,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8154,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._typeof << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8208,
	-1,
	-1,
	-1,
	-1,
	8343,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8235,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8262,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8289,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8316,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._unique << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8370,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8397,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8424,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	n._using << 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8478,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8532,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8505,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._var << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8559,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8586,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._void << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8640,
	8748,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8667,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8694,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8721,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._while << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8775,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8802,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._with << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8856,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8883,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8910,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	8937,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	(r._yield << 1) + 1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1,
	-1
]);
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/tokenizer/readWord.js
function de() {
	let e = 0, t = 0, n = f.pos;
	for (; n < p.length && (t = p.charCodeAt(n), !(t < c.lowercaseA || t > c.lowercaseZ));) {
		let r = ue[e + (t - c.lowercaseA) + 1];
		if (r === -1) break;
		e = r, n++;
	}
	let i = ue[e];
	if (i > -1 && !E[t]) {
		f.pos = n, i & 1 ? I(i >>> 1) : I(r.name, i >>> 1);
		return;
	}
	for (; n < p.length;) {
		let e = p.charCodeAt(n);
		if (E[e]) n++;
		else if (e === c.backslash) {
			if (n += 2, p.charCodeAt(n) === c.leftCurlyBrace) {
				for (; n < p.length && p.charCodeAt(n) !== c.rightCurlyBrace;) n++;
				n++;
			}
		} else if (e === c.atSign && p.charCodeAt(n + 1) === c.atSign) n += 2;
		else break;
	}
	f.pos = n, I(r.name);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/tokenizer/index.js
var D;
(function(e) {
	e[e.Access = 0] = "Access", e[e.ExportAccess = 1] = "ExportAccess", e[e.TopLevelDeclaration = 2] = "TopLevelDeclaration", e[e.FunctionScopedDeclaration = 3] = "FunctionScopedDeclaration", e[e.BlockScopedDeclaration = 4] = "BlockScopedDeclaration", e[e.ObjectShorthandTopLevelDeclaration = 5] = "ObjectShorthandTopLevelDeclaration", e[e.ObjectShorthandFunctionScopedDeclaration = 6] = "ObjectShorthandFunctionScopedDeclaration", e[e.ObjectShorthandBlockScopedDeclaration = 7] = "ObjectShorthandBlockScopedDeclaration", e[e.ObjectShorthand = 8] = "ObjectShorthand", e[e.ImportDeclaration = 9] = "ImportDeclaration", e[e.ObjectKey = 10] = "ObjectKey", e[e.ImportAccess = 11] = "ImportAccess";
})(D ||= {});
var O;
(function(e) {
	e[e.NoChildren = 0] = "NoChildren", e[e.OneChild = 1] = "OneChild", e[e.StaticChildren = 2] = "StaticChildren", e[e.KeyAfterPropSpread = 3] = "KeyAfterPropSpread";
})(O ||= {});
function fe(e) {
	let t = e.identifierRole;
	return t === D.TopLevelDeclaration || t === D.FunctionScopedDeclaration || t === D.BlockScopedDeclaration || t === D.ObjectShorthandTopLevelDeclaration || t === D.ObjectShorthandFunctionScopedDeclaration || t === D.ObjectShorthandBlockScopedDeclaration;
}
function pe(e) {
	let t = e.identifierRole;
	return t === D.FunctionScopedDeclaration || t === D.BlockScopedDeclaration || t === D.ObjectShorthandFunctionScopedDeclaration || t === D.ObjectShorthandBlockScopedDeclaration;
}
function me(e) {
	let t = e.identifierRole;
	return t === D.TopLevelDeclaration || t === D.ObjectShorthandTopLevelDeclaration || t === D.ImportDeclaration;
}
function he(e) {
	let t = e.identifierRole;
	return t === D.TopLevelDeclaration || t === D.BlockScopedDeclaration || t === D.ObjectShorthandTopLevelDeclaration || t === D.ObjectShorthandBlockScopedDeclaration;
}
function ge(e) {
	let t = e.identifierRole;
	return t === D.FunctionScopedDeclaration || t === D.ObjectShorthandFunctionScopedDeclaration;
}
function _e(e) {
	return e.identifierRole === D.ObjectShorthandTopLevelDeclaration || e.identifierRole === D.ObjectShorthandBlockScopedDeclaration || e.identifierRole === D.ObjectShorthandFunctionScopedDeclaration;
}
var ve = class {
	constructor() {
		this.type = f.type, this.contextualKeyword = f.contextualKeyword, this.start = f.start, this.end = f.end, this.scopeDepth = f.scopeDepth, this.isType = f.isType, this.identifierRole = null, this.jsxRole = null, this.shadowsGlobal = !1, this.isAsyncOperation = !1, this.contextId = null, this.rhsEndIndex = null, this.isExpression = !1, this.numNullishCoalesceStarts = 0, this.numNullishCoalesceEnds = 0, this.isOptionalChainStart = !1, this.isOptionalChainEnd = !1, this.subscriptStartIndex = null, this.nullishStartIndex = null;
	}
};
function k() {
	f.tokens.push(new ve()), Ee();
}
function A() {
	f.tokens.push(new ve()), f.start = f.pos, Je();
}
function ye() {
	f.type === r.assign && --f.pos, Ue();
}
function j(e) {
	for (let t = f.tokens.length - e; t < f.tokens.length; t++) f.tokens[t].isType = !0;
	let t = f.isType;
	return f.isType = !0, t;
}
function M(e) {
	f.isType = e;
}
function N(e) {
	return P(e) ? (k(), !0) : !1;
}
function be(e) {
	let t = f.isType;
	f.isType = !0, N(e), f.isType = t;
}
function P(e) {
	return f.type === e;
}
function F() {
	let e = f.snapshot();
	k();
	let t = f.type;
	return f.restoreFromSnapshot(e), t;
}
var xe = class {
	constructor(e, t) {
		this.type = e, this.contextualKeyword = t;
	}
};
function Se() {
	let e = f.snapshot();
	k();
	let t = f.type, n = f.contextualKeyword;
	return f.restoreFromSnapshot(e), new xe(t, n);
}
function Ce() {
	return we(f.pos);
}
function we(e) {
	return se.lastIndex = e, e + se.exec(p)[0].length;
}
function Te() {
	return p.charCodeAt(Ce());
}
function Ee() {
	if (Ae(), f.start = f.pos, f.pos >= p.length) {
		let e = f.tokens;
		e.length >= 2 && e[e.length - 1].start >= p.length && e[e.length - 2].start >= p.length && w("Unexpectedly reached the end of input."), I(r.eof);
		return;
	}
	De(p.charCodeAt(f.pos));
}
function De(e) {
	le[e] || e === c.backslash || e === c.atSign && p.charCodeAt(f.pos + 1) === c.atSign ? de() : He(e);
}
function Oe() {
	for (; p.charCodeAt(f.pos) !== c.asterisk || p.charCodeAt(f.pos + 1) !== c.slash;) if (f.pos++, f.pos > p.length) {
		w("Unterminated comment", f.pos - 2);
		return;
	}
	f.pos += 2;
}
function ke(e) {
	let t = p.charCodeAt(f.pos += e);
	if (f.pos < p.length) for (; t !== c.lineFeed && t !== c.carriageReturn && t !== c.lineSeparator && t !== c.paragraphSeparator && ++f.pos < p.length;) t = p.charCodeAt(f.pos);
}
function Ae() {
	for (; f.pos < p.length;) {
		let e = p.charCodeAt(f.pos);
		switch (e) {
			case c.carriageReturn: p.charCodeAt(f.pos + 1) === c.lineFeed && ++f.pos;
			case c.lineFeed:
			case c.lineSeparator:
			case c.paragraphSeparator:
				++f.pos;
				break;
			case c.slash:
				switch (p.charCodeAt(f.pos + 1)) {
					case c.asterisk:
						f.pos += 2, Oe();
						break;
					case c.slash:
						ke(2);
						break;
					default: return;
				}
				break;
			default: if (ce[e]) ++f.pos;
			else return;
		}
	}
}
function I(e, t = n.NONE) {
	f.end = f.pos, f.type = e, f.contextualKeyword = t;
}
function je() {
	let e = p.charCodeAt(f.pos + 1);
	if (e >= c.digit0 && e <= c.digit9) {
		Ke(!0);
		return;
	}
	e === c.dot && p.charCodeAt(f.pos + 2) === c.dot ? (f.pos += 3, I(r.ellipsis)) : (++f.pos, I(r.dot));
}
function Me() {
	p.charCodeAt(f.pos + 1) === c.equalsTo ? L(r.assign, 2) : L(r.slash, 1);
}
function Ne(e) {
	let t = e === c.asterisk ? r.star : r.modulo, n = 1, i = p.charCodeAt(f.pos + 1);
	e === c.asterisk && i === c.asterisk && (n++, i = p.charCodeAt(f.pos + 2), t = r.exponent), i === c.equalsTo && p.charCodeAt(f.pos + 2) !== c.greaterThan && (n++, t = r.assign), L(t, n);
}
function Pe(e) {
	let t = p.charCodeAt(f.pos + 1);
	if (t === e) {
		p.charCodeAt(f.pos + 2) === c.equalsTo ? L(r.assign, 3) : L(e === c.verticalBar ? r.logicalOR : r.logicalAND, 2);
		return;
	}
	if (e === c.verticalBar) {
		if (t === c.greaterThan) {
			L(r.pipeline, 2);
			return;
		} else if (t === c.rightCurlyBrace && d) {
			L(r.braceBarR, 2);
			return;
		}
	}
	if (t === c.equalsTo) {
		L(r.assign, 2);
		return;
	}
	L(e === c.verticalBar ? r.bitwiseOR : r.bitwiseAND, 1);
}
function Fe() {
	p.charCodeAt(f.pos + 1) === c.equalsTo ? L(r.assign, 2) : L(r.bitwiseXOR, 1);
}
function Ie(e) {
	let t = p.charCodeAt(f.pos + 1);
	if (t === e) {
		L(r.preIncDec, 2);
		return;
	}
	t === c.equalsTo ? L(r.assign, 2) : e === c.plusSign ? L(r.plus, 1) : L(r.minus, 1);
}
function Le() {
	let e = p.charCodeAt(f.pos + 1);
	if (e === c.lessThan) {
		if (p.charCodeAt(f.pos + 2) === c.equalsTo) {
			L(r.assign, 3);
			return;
		}
		f.isType ? L(r.lessThan, 1) : L(r.bitShiftL, 2);
		return;
	}
	e === c.equalsTo ? L(r.relationalOrEqual, 2) : L(r.lessThan, 1);
}
function Re() {
	if (f.isType) {
		L(r.greaterThan, 1);
		return;
	}
	let e = p.charCodeAt(f.pos + 1);
	if (e === c.greaterThan) {
		let e = p.charCodeAt(f.pos + 2) === c.greaterThan ? 3 : 2;
		if (p.charCodeAt(f.pos + e) === c.equalsTo) {
			L(r.assign, e + 1);
			return;
		}
		L(r.bitShiftR, e);
		return;
	}
	e === c.equalsTo ? L(r.relationalOrEqual, 2) : L(r.greaterThan, 1);
}
function ze() {
	f.type === r.greaterThan && (--f.pos, Re());
}
function Be(e) {
	let t = p.charCodeAt(f.pos + 1);
	if (t === c.equalsTo) {
		L(r.equality, p.charCodeAt(f.pos + 2) === c.equalsTo ? 3 : 2);
		return;
	}
	if (e === c.equalsTo && t === c.greaterThan) {
		f.pos += 2, I(r.arrow);
		return;
	}
	L(e === c.equalsTo ? r.eq : r.bang, 1);
}
function Ve() {
	let e = p.charCodeAt(f.pos + 1), t = p.charCodeAt(f.pos + 2);
	e === c.questionMark && !(d && f.isType) ? t === c.equalsTo ? L(r.assign, 3) : L(r.nullishCoalescing, 2) : e === c.dot && !(t >= c.digit0 && t <= c.digit9) ? (f.pos += 2, I(r.questionDot)) : (++f.pos, I(r.question));
}
function He(e) {
	switch (e) {
		case c.numberSign:
			++f.pos, I(r.hash);
			return;
		case c.dot:
			je();
			return;
		case c.leftParenthesis:
			++f.pos, I(r.parenL);
			return;
		case c.rightParenthesis:
			++f.pos, I(r.parenR);
			return;
		case c.semicolon:
			++f.pos, I(r.semi);
			return;
		case c.comma:
			++f.pos, I(r.comma);
			return;
		case c.leftSquareBracket:
			++f.pos, I(r.bracketL);
			return;
		case c.rightSquareBracket:
			++f.pos, I(r.bracketR);
			return;
		case c.leftCurlyBrace:
			d && p.charCodeAt(f.pos + 1) === c.verticalBar ? L(r.braceBarL, 2) : (++f.pos, I(r.braceL));
			return;
		case c.rightCurlyBrace:
			++f.pos, I(r.braceR);
			return;
		case c.colon:
			p.charCodeAt(f.pos + 1) === c.colon ? L(r.doubleColon, 2) : (++f.pos, I(r.colon));
			return;
		case c.questionMark:
			Ve();
			return;
		case c.atSign:
			++f.pos, I(r.at);
			return;
		case c.graveAccent:
			++f.pos, I(r.backQuote);
			return;
		case c.digit0: {
			let e = p.charCodeAt(f.pos + 1);
			if (e === c.lowercaseX || e === c.uppercaseX || e === c.lowercaseO || e === c.uppercaseO || e === c.lowercaseB || e === c.uppercaseB) {
				Ge();
				return;
			}
		}
		case c.digit1:
		case c.digit2:
		case c.digit3:
		case c.digit4:
		case c.digit5:
		case c.digit6:
		case c.digit7:
		case c.digit8:
		case c.digit9:
			Ke(!1);
			return;
		case c.quotationMark:
		case c.apostrophe:
			qe(e);
			return;
		case c.slash:
			Me();
			return;
		case c.percentSign:
		case c.asterisk:
			Ne(e);
			return;
		case c.verticalBar:
		case c.ampersand:
			Pe(e);
			return;
		case c.caret:
			Fe();
			return;
		case c.plusSign:
		case c.dash:
			Ie(e);
			return;
		case c.lessThan:
			Le();
			return;
		case c.greaterThan:
			Re();
			return;
		case c.equalsTo:
		case c.exclamationMark:
			Be(e);
			return;
		case c.tilde:
			L(r.tilde, 1);
			return;
		default: break;
	}
	w(`Unexpected character '${String.fromCharCode(e)}'`, f.pos);
}
function L(e, t) {
	f.pos += t, I(e);
}
function Ue() {
	let e = f.pos, t = !1, n = !1;
	for (;;) {
		if (f.pos >= p.length) {
			w("Unterminated regular expression", e);
			return;
		}
		let r = p.charCodeAt(f.pos);
		if (t) t = !1;
		else {
			if (r === c.leftSquareBracket) n = !0;
			else if (r === c.rightSquareBracket && n) n = !1;
			else if (r === c.slash && !n) break;
			t = r === c.backslash;
		}
		++f.pos;
	}
	++f.pos, Ye(), I(r.regexp);
}
function We() {
	for (;;) {
		let e = p.charCodeAt(f.pos);
		if (e >= c.digit0 && e <= c.digit9 || e === c.underscore) f.pos++;
		else break;
	}
}
function Ge() {
	for (f.pos += 2;;) {
		let e = p.charCodeAt(f.pos);
		if (e >= c.digit0 && e <= c.digit9 || e >= c.lowercaseA && e <= c.lowercaseF || e >= c.uppercaseA && e <= c.uppercaseF || e === c.underscore) f.pos++;
		else break;
	}
	p.charCodeAt(f.pos) === c.lowercaseN ? (++f.pos, I(r.bigint)) : I(r.num);
}
function Ke(e) {
	let t = !1, n = !1;
	e || We();
	let i = p.charCodeAt(f.pos);
	if (i === c.dot && (++f.pos, We(), i = p.charCodeAt(f.pos)), (i === c.uppercaseE || i === c.lowercaseE) && (i = p.charCodeAt(++f.pos), (i === c.plusSign || i === c.dash) && ++f.pos, We(), i = p.charCodeAt(f.pos)), i === c.lowercaseN ? (++f.pos, t = !0) : i === c.lowercaseM && (++f.pos, n = !0), t) {
		I(r.bigint);
		return;
	}
	if (n) {
		I(r.decimal);
		return;
	}
	I(r.num);
}
function qe(e) {
	for (f.pos++;;) {
		if (f.pos >= p.length) {
			w("Unterminated string constant");
			return;
		}
		let t = p.charCodeAt(f.pos);
		if (t === c.backslash) f.pos++;
		else if (t === e) break;
		f.pos++;
	}
	f.pos++, I(r.string);
}
function Je() {
	for (;;) {
		if (f.pos >= p.length) {
			w("Unterminated template");
			return;
		}
		let e = p.charCodeAt(f.pos);
		if (e === c.graveAccent || e === c.dollarSign && p.charCodeAt(f.pos + 1) === c.leftCurlyBrace) {
			if (f.pos === f.start && P(r.template)) if (e === c.dollarSign) {
				f.pos += 2, I(r.dollarBraceL);
				return;
			} else {
				++f.pos, I(r.backQuote);
				return;
			}
			I(r.template);
			return;
		}
		e === c.backslash && f.pos++, f.pos++;
	}
}
function Ye() {
	for (; f.pos < p.length;) {
		let e = p.charCodeAt(f.pos);
		if (E[e]) f.pos++;
		else if (e === c.backslash) {
			if (f.pos += 2, p.charCodeAt(f.pos) === c.leftCurlyBrace) {
				for (; f.pos < p.length && p.charCodeAt(f.pos) !== c.rightCurlyBrace;) f.pos++;
				f.pos++;
			}
		} else break;
	}
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/getImportExportSpecifierInfo.js
function Xe(e, t = e.currentIndex()) {
	let n = t + 1;
	if (Ze(e, n)) {
		let r = e.identifierNameAtIndex(t);
		return {
			isType: !1,
			leftName: r,
			rightName: r,
			endIndex: n
		};
	}
	if (n++, Ze(e, n)) return {
		isType: !0,
		leftName: null,
		rightName: null,
		endIndex: n
	};
	if (n++, Ze(e, n)) return {
		isType: !1,
		leftName: e.identifierNameAtIndex(t),
		rightName: e.identifierNameAtIndex(t + 2),
		endIndex: n
	};
	if (n++, Ze(e, n)) return {
		isType: !0,
		leftName: null,
		rightName: null,
		endIndex: n
	};
	throw Error(`Unexpected import/export specifier at ${t}`);
}
function Ze(e, t) {
	let n = e.tokens[t];
	return n.type === r.braceR || n.type === r.comma;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/plugins/jsx/xhtml.js
var Qe = new Map([
	["quot", "\""],
	["amp", "&"],
	["apos", "'"],
	["lt", "<"],
	["gt", ">"],
	["nbsp", "\xA0"],
	["iexcl", "¡"],
	["cent", "¢"],
	["pound", "£"],
	["curren", "¤"],
	["yen", "¥"],
	["brvbar", "¦"],
	["sect", "§"],
	["uml", "¨"],
	["copy", "©"],
	["ordf", "ª"],
	["laquo", "«"],
	["not", "¬"],
	["shy", "­"],
	["reg", "®"],
	["macr", "¯"],
	["deg", "°"],
	["plusmn", "±"],
	["sup2", "²"],
	["sup3", "³"],
	["acute", "´"],
	["micro", "µ"],
	["para", "¶"],
	["middot", "·"],
	["cedil", "¸"],
	["sup1", "¹"],
	["ordm", "º"],
	["raquo", "»"],
	["frac14", "¼"],
	["frac12", "½"],
	["frac34", "¾"],
	["iquest", "¿"],
	["Agrave", "À"],
	["Aacute", "Á"],
	["Acirc", "Â"],
	["Atilde", "Ã"],
	["Auml", "Ä"],
	["Aring", "Å"],
	["AElig", "Æ"],
	["Ccedil", "Ç"],
	["Egrave", "È"],
	["Eacute", "É"],
	["Ecirc", "Ê"],
	["Euml", "Ë"],
	["Igrave", "Ì"],
	["Iacute", "Í"],
	["Icirc", "Î"],
	["Iuml", "Ï"],
	["ETH", "Ð"],
	["Ntilde", "Ñ"],
	["Ograve", "Ò"],
	["Oacute", "Ó"],
	["Ocirc", "Ô"],
	["Otilde", "Õ"],
	["Ouml", "Ö"],
	["times", "×"],
	["Oslash", "Ø"],
	["Ugrave", "Ù"],
	["Uacute", "Ú"],
	["Ucirc", "Û"],
	["Uuml", "Ü"],
	["Yacute", "Ý"],
	["THORN", "Þ"],
	["szlig", "ß"],
	["agrave", "à"],
	["aacute", "á"],
	["acirc", "â"],
	["atilde", "ã"],
	["auml", "ä"],
	["aring", "å"],
	["aelig", "æ"],
	["ccedil", "ç"],
	["egrave", "è"],
	["eacute", "é"],
	["ecirc", "ê"],
	["euml", "ë"],
	["igrave", "ì"],
	["iacute", "í"],
	["icirc", "î"],
	["iuml", "ï"],
	["eth", "ð"],
	["ntilde", "ñ"],
	["ograve", "ò"],
	["oacute", "ó"],
	["ocirc", "ô"],
	["otilde", "õ"],
	["ouml", "ö"],
	["divide", "÷"],
	["oslash", "ø"],
	["ugrave", "ù"],
	["uacute", "ú"],
	["ucirc", "û"],
	["uuml", "ü"],
	["yacute", "ý"],
	["thorn", "þ"],
	["yuml", "ÿ"],
	["OElig", "Œ"],
	["oelig", "œ"],
	["Scaron", "Š"],
	["scaron", "š"],
	["Yuml", "Ÿ"],
	["fnof", "ƒ"],
	["circ", "ˆ"],
	["tilde", "˜"],
	["Alpha", "Α"],
	["Beta", "Β"],
	["Gamma", "Γ"],
	["Delta", "Δ"],
	["Epsilon", "Ε"],
	["Zeta", "Ζ"],
	["Eta", "Η"],
	["Theta", "Θ"],
	["Iota", "Ι"],
	["Kappa", "Κ"],
	["Lambda", "Λ"],
	["Mu", "Μ"],
	["Nu", "Ν"],
	["Xi", "Ξ"],
	["Omicron", "Ο"],
	["Pi", "Π"],
	["Rho", "Ρ"],
	["Sigma", "Σ"],
	["Tau", "Τ"],
	["Upsilon", "Υ"],
	["Phi", "Φ"],
	["Chi", "Χ"],
	["Psi", "Ψ"],
	["Omega", "Ω"],
	["alpha", "α"],
	["beta", "β"],
	["gamma", "γ"],
	["delta", "δ"],
	["epsilon", "ε"],
	["zeta", "ζ"],
	["eta", "η"],
	["theta", "θ"],
	["iota", "ι"],
	["kappa", "κ"],
	["lambda", "λ"],
	["mu", "μ"],
	["nu", "ν"],
	["xi", "ξ"],
	["omicron", "ο"],
	["pi", "π"],
	["rho", "ρ"],
	["sigmaf", "ς"],
	["sigma", "σ"],
	["tau", "τ"],
	["upsilon", "υ"],
	["phi", "φ"],
	["chi", "χ"],
	["psi", "ψ"],
	["omega", "ω"],
	["thetasym", "ϑ"],
	["upsih", "ϒ"],
	["piv", "ϖ"],
	["ensp", " "],
	["emsp", " "],
	["thinsp", " "],
	["zwnj", "‌"],
	["zwj", "‍"],
	["lrm", "‎"],
	["rlm", "‏"],
	["ndash", "–"],
	["mdash", "—"],
	["lsquo", "‘"],
	["rsquo", "’"],
	["sbquo", "‚"],
	["ldquo", "“"],
	["rdquo", "”"],
	["bdquo", "„"],
	["dagger", "†"],
	["Dagger", "‡"],
	["bull", "•"],
	["hellip", "…"],
	["permil", "‰"],
	["prime", "′"],
	["Prime", "″"],
	["lsaquo", "‹"],
	["rsaquo", "›"],
	["oline", "‾"],
	["frasl", "⁄"],
	["euro", "€"],
	["image", "ℑ"],
	["weierp", "℘"],
	["real", "ℜ"],
	["trade", "™"],
	["alefsym", "ℵ"],
	["larr", "←"],
	["uarr", "↑"],
	["rarr", "→"],
	["darr", "↓"],
	["harr", "↔"],
	["crarr", "↵"],
	["lArr", "⇐"],
	["uArr", "⇑"],
	["rArr", "⇒"],
	["dArr", "⇓"],
	["hArr", "⇔"],
	["forall", "∀"],
	["part", "∂"],
	["exist", "∃"],
	["empty", "∅"],
	["nabla", "∇"],
	["isin", "∈"],
	["notin", "∉"],
	["ni", "∋"],
	["prod", "∏"],
	["sum", "∑"],
	["minus", "−"],
	["lowast", "∗"],
	["radic", "√"],
	["prop", "∝"],
	["infin", "∞"],
	["ang", "∠"],
	["and", "∧"],
	["or", "∨"],
	["cap", "∩"],
	["cup", "∪"],
	["int", "∫"],
	["there4", "∴"],
	["sim", "∼"],
	["cong", "≅"],
	["asymp", "≈"],
	["ne", "≠"],
	["equiv", "≡"],
	["le", "≤"],
	["ge", "≥"],
	["sub", "⊂"],
	["sup", "⊃"],
	["nsub", "⊄"],
	["sube", "⊆"],
	["supe", "⊇"],
	["oplus", "⊕"],
	["otimes", "⊗"],
	["perp", "⊥"],
	["sdot", "⋅"],
	["lceil", "⌈"],
	["rceil", "⌉"],
	["lfloor", "⌊"],
	["rfloor", "⌋"],
	["lang", "〈"],
	["rang", "〉"],
	["loz", "◊"],
	["spades", "♠"],
	["clubs", "♣"],
	["hearts", "♥"],
	["diams", "♦"]
]);
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/getJSXPragmaInfo.js
function $e(e) {
	let [t, n] = et(e.jsxPragma || "React.createElement"), [r, i] = et(e.jsxFragmentPragma || "React.Fragment");
	return {
		base: t,
		suffix: n,
		fragmentBase: r,
		fragmentSuffix: i
	};
}
function et(e) {
	let t = e.indexOf(".");
	return t === -1 && (t = e.length), [e.slice(0, t), e.slice(t)];
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/transformers/Transformer.js
var R = class {
	getPrefixCode() {
		return "";
	}
	getHoistedCode() {
		return "";
	}
	getSuffixCode() {
		return "";
	}
}, tt = class e extends R {
	__init() {
		this.lastLineNumber = 1;
	}
	__init2() {
		this.lastIndex = 0;
	}
	__init3() {
		this.filenameVarName = null;
	}
	__init4() {
		this.esmAutomaticImportNameResolutions = {};
	}
	__init5() {
		this.cjsAutomaticModuleNameResolutions = {};
	}
	constructor(t, n, r, i, a) {
		super(), this.rootTransformer = t, this.tokens = n, this.importProcessor = r, this.nameManager = i, this.options = a, e.prototype.__init.call(this), e.prototype.__init2.call(this), e.prototype.__init3.call(this), e.prototype.__init4.call(this), e.prototype.__init5.call(this), this.jsxPragmaInfo = $e(a), this.isAutomaticRuntime = a.jsxRuntime === "automatic", this.jsxImportSource = a.jsxImportSource || "react";
	}
	process() {
		return this.tokens.matches1(r.jsxTagStart) ? (this.processJSXTag(), !0) : !1;
	}
	getPrefixCode() {
		let e = "";
		if (this.filenameVarName && (e += `const ${this.filenameVarName} = ${JSON.stringify(this.options.filePath || "")};`), this.isAutomaticRuntime) if (this.importProcessor) for (let [t, n] of Object.entries(this.cjsAutomaticModuleNameResolutions)) e += `var ${n} = require("${t}");`;
		else {
			let { createElement: t, ...n } = this.esmAutomaticImportNameResolutions;
			t && (e += `import {createElement as ${t}} from "${this.jsxImportSource}";`);
			let r = Object.entries(n).map(([e, t]) => `${e} as ${t}`).join(", ");
			if (r) {
				let t = this.jsxImportSource + (this.options.production ? "/jsx-runtime" : "/jsx-dev-runtime");
				e += `import {${r}} from "${t}";`;
			}
		}
		return e;
	}
	processJSXTag() {
		let { jsxRole: e, start: t } = this.tokens.currentToken(), n = this.options.production ? null : this.getElementLocationCode(t);
		this.isAutomaticRuntime && e !== O.KeyAfterPropSpread ? this.transformTagToJSXFunc(n, e) : this.transformTagToCreateElement(n);
	}
	getElementLocationCode(e) {
		return `lineNumber: ${this.getLineNumberForIndex(e)}`;
	}
	getLineNumberForIndex(e) {
		let t = this.tokens.code;
		for (; this.lastIndex < e && this.lastIndex < t.length;) t[this.lastIndex] === "\n" && this.lastLineNumber++, this.lastIndex++;
		return this.lastLineNumber;
	}
	transformTagToJSXFunc(e, t) {
		let n = t === O.StaticChildren;
		this.tokens.replaceToken(this.getJSXFuncInvocationCode(n));
		let i = null;
		if (this.tokens.matches1(r.jsxTagEnd)) this.tokens.replaceToken(`${this.getFragmentCode()}, {`), this.processAutomaticChildrenAndEndProps(t);
		else {
			if (this.processTagIntro(), this.tokens.appendCode(", {"), i = this.processProps(!0), this.tokens.matches2(r.slash, r.jsxTagEnd)) this.tokens.appendCode("}");
			else if (this.tokens.matches1(r.jsxTagEnd)) this.tokens.removeToken(), this.processAutomaticChildrenAndEndProps(t);
			else throw Error("Expected either /> or > at the end of the tag.");
			i && this.tokens.appendCode(`, ${i}`);
		}
		for (this.options.production || (i === null && this.tokens.appendCode(", void 0"), this.tokens.appendCode(`, ${n}, ${this.getDevSource(e)}, this`)), this.tokens.removeInitialToken(); !this.tokens.matches1(r.jsxTagEnd);) this.tokens.removeToken();
		this.tokens.replaceToken(")");
	}
	transformTagToCreateElement(e) {
		if (this.tokens.replaceToken(this.getCreateElementInvocationCode()), this.tokens.matches1(r.jsxTagEnd)) this.tokens.replaceToken(`${this.getFragmentCode()}, null`), this.processChildren(!0);
		else if (this.processTagIntro(), this.processPropsObjectWithDevInfo(e), !this.tokens.matches2(r.slash, r.jsxTagEnd)) if (this.tokens.matches1(r.jsxTagEnd)) this.tokens.removeToken(), this.processChildren(!0);
		else throw Error("Expected either /> or > at the end of the tag.");
		for (this.tokens.removeInitialToken(); !this.tokens.matches1(r.jsxTagEnd);) this.tokens.removeToken();
		this.tokens.replaceToken(")");
	}
	getJSXFuncInvocationCode(e) {
		return this.options.production ? e ? this.claimAutoImportedFuncInvocation("jsxs", "/jsx-runtime") : this.claimAutoImportedFuncInvocation("jsx", "/jsx-runtime") : this.claimAutoImportedFuncInvocation("jsxDEV", "/jsx-dev-runtime");
	}
	getCreateElementInvocationCode() {
		if (this.isAutomaticRuntime) return this.claimAutoImportedFuncInvocation("createElement", "");
		{
			let { jsxPragmaInfo: e } = this;
			return `${this.importProcessor && this.importProcessor.getIdentifierReplacement(e.base) || e.base}${e.suffix}(`;
		}
	}
	getFragmentCode() {
		if (this.isAutomaticRuntime) return this.claimAutoImportedName("Fragment", this.options.production ? "/jsx-runtime" : "/jsx-dev-runtime");
		{
			let { jsxPragmaInfo: e } = this;
			return (this.importProcessor && this.importProcessor.getIdentifierReplacement(e.fragmentBase) || e.fragmentBase) + e.fragmentSuffix;
		}
	}
	claimAutoImportedFuncInvocation(e, t) {
		let n = this.claimAutoImportedName(e, t);
		return this.importProcessor ? `${n}.call(void 0, ` : `${n}(`;
	}
	claimAutoImportedName(e, t) {
		if (this.importProcessor) {
			let n = this.jsxImportSource + t;
			return this.cjsAutomaticModuleNameResolutions[n] || (this.cjsAutomaticModuleNameResolutions[n] = this.importProcessor.getFreeIdentifierForPath(n)), `${this.cjsAutomaticModuleNameResolutions[n]}.${e}`;
		} else return this.esmAutomaticImportNameResolutions[e] || (this.esmAutomaticImportNameResolutions[e] = this.nameManager.claimFreeName(`_${e}`)), this.esmAutomaticImportNameResolutions[e];
	}
	processTagIntro() {
		let e = this.tokens.currentIndex() + 1;
		for (; this.tokens.tokens[e].isType || !this.tokens.matches2AtIndex(e - 1, r.jsxName, r.jsxName) && !this.tokens.matches2AtIndex(e - 1, r.greaterThan, r.jsxName) && !this.tokens.matches1AtIndex(e, r.braceL) && !this.tokens.matches1AtIndex(e, r.jsxTagEnd) && !this.tokens.matches2AtIndex(e, r.slash, r.jsxTagEnd);) e++;
		if (e === this.tokens.currentIndex() + 1) {
			let e = this.tokens.identifierName();
			nt(e) && this.tokens.replaceToken(`'${e}'`);
		}
		for (; this.tokens.currentIndex() < e;) this.rootTransformer.processToken();
	}
	processPropsObjectWithDevInfo(e) {
		let t = this.options.production ? "" : `__self: this, __source: ${this.getDevSource(e)}`;
		if (!this.tokens.matches1(r.jsxName) && !this.tokens.matches1(r.braceL)) {
			t ? this.tokens.appendCode(`, {${t}}`) : this.tokens.appendCode(", null");
			return;
		}
		this.tokens.appendCode(", {"), this.processProps(!1), t ? this.tokens.appendCode(` ${t}}`) : this.tokens.appendCode("}");
	}
	processProps(e) {
		let t = null;
		for (;;) {
			if (this.tokens.matches2(r.jsxName, r.eq)) {
				let n = this.tokens.identifierName();
				if (e && n === "key") {
					t !== null && this.tokens.appendCode(t.replace(/[^\n]/g, "")), this.tokens.removeToken(), this.tokens.removeToken();
					let e = this.tokens.snapshot();
					this.processPropValue(), t = this.tokens.dangerouslyGetAndRemoveCodeSinceSnapshot(e);
					continue;
				} else this.processPropName(n), this.tokens.replaceToken(": "), this.processPropValue();
			} else if (this.tokens.matches1(r.jsxName)) {
				let e = this.tokens.identifierName();
				this.processPropName(e), this.tokens.appendCode(": true");
			} else if (this.tokens.matches1(r.braceL)) this.tokens.replaceToken(""), this.rootTransformer.processBalancedCode(), this.tokens.replaceToken("");
			else break;
			this.tokens.appendCode(",");
		}
		return t;
	}
	processPropName(e) {
		e.includes("-") ? this.tokens.replaceToken(`'${e}'`) : this.tokens.copyToken();
	}
	processPropValue() {
		this.tokens.matches1(r.braceL) ? (this.tokens.replaceToken(""), this.rootTransformer.processBalancedCode(), this.tokens.replaceToken("")) : this.tokens.matches1(r.jsxTagStart) ? this.processJSXTag() : this.processStringPropValue();
	}
	processStringPropValue() {
		let e = this.tokens.currentToken(), t = this.tokens.code.slice(e.start + 1, e.end - 1), n = it(t), r = at(t);
		this.tokens.replaceToken(r + n);
	}
	processAutomaticChildrenAndEndProps(e) {
		e === O.StaticChildren ? (this.tokens.appendCode(" children: ["), this.processChildren(!1), this.tokens.appendCode("]}")) : (e === O.OneChild && this.tokens.appendCode(" children: "), this.processChildren(!1), this.tokens.appendCode("}"));
	}
	processChildren(e) {
		let t = e;
		for (;;) {
			if (this.tokens.matches2(r.jsxTagStart, r.slash)) return;
			let e = !1;
			if (this.tokens.matches1(r.braceL)) this.tokens.matches2(r.braceL, r.braceR) ? (this.tokens.replaceToken(""), this.tokens.replaceToken("")) : (this.tokens.replaceToken(t ? ", " : ""), this.rootTransformer.processBalancedCode(), this.tokens.replaceToken(""), e = !0);
			else if (this.tokens.matches1(r.jsxTagStart)) this.tokens.appendCode(t ? ", " : ""), this.processJSXTag(), e = !0;
			else if (this.tokens.matches1(r.jsxText) || this.tokens.matches1(r.jsxEmptyText)) e = this.processChildTextElement(t);
			else throw Error("Unexpected token when processing JSX children.");
			e && (t = !0);
		}
	}
	processChildTextElement(e) {
		let t = this.tokens.currentToken(), n = this.tokens.code.slice(t.start, t.end), r = it(n), i = rt(n);
		return i === "\"\"" ? (this.tokens.replaceToken(r), !1) : (this.tokens.replaceToken(`${e ? ", " : ""}${i}${r}`), !0);
	}
	getDevSource(e) {
		return `{fileName: ${this.getFilenameVarName()}, ${e}}`;
	}
	getFilenameVarName() {
		return this.filenameVarName ||= this.nameManager.claimFreeName("_jsxFileName"), this.filenameVarName;
	}
};
function nt(e) {
	let t = e.charCodeAt(0);
	return t >= c.lowercaseA && t <= c.lowercaseZ;
}
function rt(e) {
	let t = "", n = "", r = !1, i = !1;
	for (let a = 0; a < e.length; a++) {
		let o = e[a];
		if (o === " " || o === "	" || o === "\r") r || (n += o);
		else if (o === "\n") n = "", r = !0;
		else {
			if (i && r && (t += " "), t += n, n = "", o === "&") {
				let { entity: n, newI: r } = ot(e, a + 1);
				a = r - 1, t += n;
			} else t += o;
			i = !0, r = !1;
		}
	}
	return r || (t += n), JSON.stringify(t);
}
function it(e) {
	let t = 0, n = 0;
	for (let r of e) r === "\n" ? (t++, n = 0) : r === " " && n++;
	return "\n".repeat(t) + " ".repeat(n);
}
function at(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		if (r === "\n") if (/\s/.test(e[n + 1])) for (t += " "; n < e.length && /\s/.test(e[n + 1]);) n++;
		else t += "\n";
		else if (r === "&") {
			let { entity: r, newI: i } = ot(e, n + 1);
			t += r, n = i - 1;
		} else t += r;
	}
	return JSON.stringify(t);
}
function ot(e, t) {
	let n = "", r = 0, i, a = t;
	if (e[a] === "#") {
		let t = 10;
		a++;
		let n;
		if (e[a] === "x") for (t = 16, a++, n = a; a < e.length && ct(e.charCodeAt(a));) a++;
		else for (n = a; a < e.length && st(e.charCodeAt(a));) a++;
		if (e[a] === ";") {
			let r = e.slice(n, a);
			r && (a++, i = String.fromCodePoint(parseInt(r, t)));
		}
	} else for (; a < e.length && r++ < 10;) {
		let t = e[a];
		if (a++, t === ";") {
			i = Qe.get(n);
			break;
		}
		n += t;
	}
	return i ? {
		entity: i,
		newI: a
	} : {
		entity: "&",
		newI: t
	};
}
function st(e) {
	return e >= c.digit0 && e <= c.digit9;
}
function ct(e) {
	return e >= c.digit0 && e <= c.digit9 || e >= c.lowercaseA && e <= c.lowercaseF || e >= c.uppercaseA && e <= c.uppercaseF;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/getNonTypeIdentifiers.js
function lt(e, t) {
	let n = $e(t), i = /* @__PURE__ */ new Set();
	for (let t = 0; t < e.tokens.length; t++) {
		let a = e.tokens[t];
		a.type === r.name && !a.isType && (a.identifierRole === D.Access || a.identifierRole === D.ObjectShorthand || a.identifierRole === D.ExportAccess) && !a.shadowsGlobal && i.add(e.identifierNameForToken(a)), a.type === r.jsxTagStart && i.add(n.base), a.type === r.jsxTagStart && t + 1 < e.tokens.length && e.tokens[t + 1].type === r.jsxTagEnd && (i.add(n.base), i.add(n.fragmentBase)), a.type === r.jsxName && a.identifierRole === D.Access && (!nt(e.identifierNameForToken(a)) || e.tokens[t + 1].type === r.dot) && i.add(e.identifierNameForToken(a));
	}
	return i;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/CJSImportProcessor.js
var ut = class e {
	__init() {
		this.nonTypeIdentifiers = /* @__PURE__ */ new Set();
	}
	__init2() {
		this.importInfoByPath = /* @__PURE__ */ new Map();
	}
	__init3() {
		this.importsToReplace = /* @__PURE__ */ new Map();
	}
	__init4() {
		this.identifierReplacements = /* @__PURE__ */ new Map();
	}
	__init5() {
		this.exportBindingsByLocalName = /* @__PURE__ */ new Map();
	}
	constructor(t, n, r, i, a, o, s) {
		this.nameManager = t, this.tokens = n, this.enableLegacyTypeScriptModuleInterop = r, this.options = i, this.isTypeScriptTransformEnabled = a, this.keepUnusedImports = o, this.helperManager = s, e.prototype.__init.call(this), e.prototype.__init2.call(this), e.prototype.__init3.call(this), e.prototype.__init4.call(this), e.prototype.__init5.call(this);
	}
	preprocessTokens() {
		for (let e = 0; e < this.tokens.tokens.length; e++) this.tokens.matches1AtIndex(e, r._import) && !this.tokens.matches3AtIndex(e, r._import, r.name, r.eq) && this.preprocessImportAtIndex(e), this.tokens.matches1AtIndex(e, r._export) && !this.tokens.matches2AtIndex(e, r._export, r.eq) && this.preprocessExportAtIndex(e);
		this.generateImportReplacements();
	}
	pruneTypeOnlyImports() {
		this.nonTypeIdentifiers = lt(this.tokens, this.options);
		for (let [e, t] of this.importInfoByPath.entries()) t.hasBareImport || t.hasStarExport || t.exportStarNames.length > 0 || t.namedExports.length > 0 || [
			...t.defaultNames,
			...t.wildcardNames,
			...t.namedImports.map(({ localName: e }) => e)
		].every((e) => this.shouldAutomaticallyElideImportedName(e)) && this.importsToReplace.set(e, "");
	}
	shouldAutomaticallyElideImportedName(e) {
		return this.isTypeScriptTransformEnabled && !this.keepUnusedImports && !this.nonTypeIdentifiers.has(e);
	}
	generateImportReplacements() {
		for (let [e, t] of this.importInfoByPath.entries()) {
			let { defaultNames: n, wildcardNames: r, namedImports: i, namedExports: a, exportStarNames: o, hasStarExport: s } = t;
			if (n.length === 0 && r.length === 0 && i.length === 0 && a.length === 0 && o.length === 0 && !s) {
				this.importsToReplace.set(e, `require('${e}');`);
				continue;
			}
			let c = this.getFreeIdentifierForPath(e), l;
			l = this.enableLegacyTypeScriptModuleInterop ? c : r.length > 0 ? r[0] : this.getFreeIdentifierForPath(e);
			let u = `var ${c} = require('${e}');`;
			if (r.length > 0) for (let e of r) {
				let t = this.enableLegacyTypeScriptModuleInterop ? c : `${this.helperManager.getHelperName("interopRequireWildcard")}(${c})`;
				u += ` var ${e} = ${t};`;
			}
			else o.length > 0 && l !== c ? u += ` var ${l} = ${this.helperManager.getHelperName("interopRequireWildcard")}(${c});` : n.length > 0 && l !== c && (u += ` var ${l} = ${this.helperManager.getHelperName("interopRequireDefault")}(${c});`);
			for (let { importedName: e, localName: t } of a) u += ` ${this.helperManager.getHelperName("createNamedExportFrom")}(${c}, '${t}', '${e}');`;
			for (let e of o) u += ` exports.${e} = ${l};`;
			s && (u += ` ${this.helperManager.getHelperName("createStarExport")}(${c});`), this.importsToReplace.set(e, u);
			for (let e of n) this.identifierReplacements.set(e, `${l}.default`);
			for (let { importedName: e, localName: t } of i) this.identifierReplacements.set(t, `${c}.${e}`);
		}
	}
	getFreeIdentifierForPath(e) {
		let t = e.split("/"), n = t[t.length - 1].replace(/\W/g, "");
		return this.nameManager.claimFreeName(`_${n}`);
	}
	preprocessImportAtIndex(e) {
		let t = [], i = [], a = [];
		if (e++, (this.tokens.matchesContextualAtIndex(e, n._type) || this.tokens.matches1AtIndex(e, r._typeof)) && !this.tokens.matches1AtIndex(e + 1, r.comma) && !this.tokens.matchesContextualAtIndex(e + 1, n._from) || this.tokens.matches1AtIndex(e, r.parenL)) return;
		if (this.tokens.matches1AtIndex(e, r.name) && (t.push(this.tokens.identifierNameAtIndex(e)), e++, this.tokens.matches1AtIndex(e, r.comma) && e++), this.tokens.matches1AtIndex(e, r.star) && (e += 2, i.push(this.tokens.identifierNameAtIndex(e)), e++), this.tokens.matches1AtIndex(e, r.braceL)) {
			let n = this.getNamedImports(e + 1);
			e = n.newIndex;
			for (let e of n.namedImports) e.importedName === "default" ? t.push(e.localName) : a.push(e);
		}
		if (this.tokens.matchesContextualAtIndex(e, n._from) && e++, !this.tokens.matches1AtIndex(e, r.string)) throw Error("Expected string token at the end of import statement.");
		let o = this.tokens.stringValueAtIndex(e), s = this.getImportInfo(o);
		s.defaultNames.push(...t), s.wildcardNames.push(...i), s.namedImports.push(...a), t.length === 0 && i.length === 0 && a.length === 0 && (s.hasBareImport = !0);
	}
	preprocessExportAtIndex(e) {
		if (this.tokens.matches2AtIndex(e, r._export, r._var) || this.tokens.matches2AtIndex(e, r._export, r._let) || this.tokens.matches2AtIndex(e, r._export, r._const)) this.preprocessVarExportAtIndex(e);
		else if (this.tokens.matches2AtIndex(e, r._export, r._function) || this.tokens.matches2AtIndex(e, r._export, r._class)) {
			let t = this.tokens.identifierNameAtIndex(e + 2);
			this.addExportBinding(t, t);
		} else if (this.tokens.matches3AtIndex(e, r._export, r.name, r._function)) {
			let t = this.tokens.identifierNameAtIndex(e + 3);
			this.addExportBinding(t, t);
		} else this.tokens.matches2AtIndex(e, r._export, r.braceL) ? this.preprocessNamedExportAtIndex(e) : this.tokens.matches2AtIndex(e, r._export, r.star) && this.preprocessExportStarAtIndex(e);
	}
	preprocessVarExportAtIndex(e) {
		let t = 0;
		for (let n = e + 2;; n++) if (this.tokens.matches1AtIndex(n, r.braceL) || this.tokens.matches1AtIndex(n, r.dollarBraceL) || this.tokens.matches1AtIndex(n, r.bracketL)) t++;
		else if (this.tokens.matches1AtIndex(n, r.braceR) || this.tokens.matches1AtIndex(n, r.bracketR)) t--;
		else if (t === 0 && !this.tokens.matches1AtIndex(n, r.name)) break;
		else if (this.tokens.matches1AtIndex(1, r.eq)) {
			let e = this.tokens.currentToken().rhsEndIndex;
			if (e == null) throw Error("Expected = token with an end index.");
			n = e - 1;
		} else {
			let e = this.tokens.tokens[n];
			if (fe(e)) {
				let e = this.tokens.identifierNameAtIndex(n);
				this.identifierReplacements.set(e, `exports.${e}`);
			}
		}
	}
	preprocessNamedExportAtIndex(e) {
		e += 2;
		let { newIndex: t, namedImports: i } = this.getNamedImports(e);
		if (e = t, this.tokens.matchesContextualAtIndex(e, n._from)) e++;
		else {
			for (let { importedName: e, localName: t } of i) this.addExportBinding(e, t);
			return;
		}
		if (!this.tokens.matches1AtIndex(e, r.string)) throw Error("Expected string token at the end of import statement.");
		let a = this.tokens.stringValueAtIndex(e);
		this.getImportInfo(a).namedExports.push(...i);
	}
	preprocessExportStarAtIndex(e) {
		let t = null;
		if (this.tokens.matches3AtIndex(e, r._export, r.star, r._as) ? (e += 3, t = this.tokens.identifierNameAtIndex(e), e += 2) : e += 3, !this.tokens.matches1AtIndex(e, r.string)) throw Error("Expected string token at the end of star export statement.");
		let n = this.tokens.stringValueAtIndex(e), i = this.getImportInfo(n);
		t === null ? i.hasStarExport = !0 : i.exportStarNames.push(t);
	}
	getNamedImports(e) {
		let t = [];
		for (;;) {
			if (this.tokens.matches1AtIndex(e, r.braceR)) {
				e++;
				break;
			}
			let n = Xe(this.tokens, e);
			if (e = n.endIndex, n.isType || t.push({
				importedName: n.leftName,
				localName: n.rightName
			}), this.tokens.matches2AtIndex(e, r.comma, r.braceR)) {
				e += 2;
				break;
			} else if (this.tokens.matches1AtIndex(e, r.braceR)) {
				e++;
				break;
			} else if (this.tokens.matches1AtIndex(e, r.comma)) e++;
			else throw Error(`Unexpected token: ${JSON.stringify(this.tokens.tokens[e])}`);
		}
		return {
			newIndex: e,
			namedImports: t
		};
	}
	getImportInfo(e) {
		let t = this.importInfoByPath.get(e);
		if (t) return t;
		let n = {
			defaultNames: [],
			wildcardNames: [],
			namedImports: [],
			namedExports: [],
			hasBareImport: !1,
			exportStarNames: [],
			hasStarExport: !1
		};
		return this.importInfoByPath.set(e, n), n;
	}
	addExportBinding(e, t) {
		this.exportBindingsByLocalName.has(e) || this.exportBindingsByLocalName.set(e, []), this.exportBindingsByLocalName.get(e).push(t);
	}
	claimImportCode(e) {
		let t = this.importsToReplace.get(e);
		return this.importsToReplace.set(e, ""), t || "";
	}
	getIdentifierReplacement(e) {
		return this.identifierReplacements.get(e) || null;
	}
	resolveExportBinding(e) {
		let t = this.exportBindingsByLocalName.get(e);
		return !t || t.length === 0 ? null : t.map((e) => `exports.${e}`).join(" = ");
	}
	getGlobalNames() {
		return new Set([...this.identifierReplacements.keys(), ...this.exportBindingsByLocalName.keys()]);
	}
}, dt = 44, ft = 59, pt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", mt = new Uint8Array(64), ht = new Uint8Array(128);
for (let e = 0; e < pt.length; e++) {
	let t = pt.charCodeAt(e);
	mt[e] = t, ht[t] = e;
}
function gt(e, t, n) {
	let r = t - n;
	r = r < 0 ? -r << 1 | 1 : r << 1;
	do {
		let t = r & 31;
		r >>>= 5, r > 0 && (t |= 32), e.write(mt[t]);
	} while (r > 0);
	return t;
}
var _t = 1024 * 16, vt = typeof TextDecoder < "u" ? /* @__PURE__ */ new TextDecoder() : typeof Buffer < "u" ? { decode(e) {
	return Buffer.from(e.buffer, e.byteOffset, e.byteLength).toString();
} } : { decode(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
	return t;
} }, yt = class {
	constructor() {
		this.pos = 0, this.out = "", this.buffer = new Uint8Array(_t);
	}
	write(e) {
		let { buffer: t } = this;
		t[this.pos++] = e, this.pos === _t && (this.out += vt.decode(t), this.pos = 0);
	}
	flush() {
		let { buffer: e, out: t, pos: n } = this;
		return n > 0 ? t + vt.decode(e.subarray(0, n)) : t;
	}
};
function bt(e) {
	let t = new yt(), n = 0, r = 0, i = 0, a = 0;
	for (let o = 0; o < e.length; o++) {
		let s = e[o];
		if (o > 0 && t.write(ft), s.length === 0) continue;
		let c = 0;
		for (let e = 0; e < s.length; e++) {
			let o = s[e];
			e > 0 && t.write(dt), c = gt(t, o[0], c), o.length !== 1 && (n = gt(t, o[1], n), r = gt(t, o[2], r), i = gt(t, o[3], i), o.length !== 4 && (a = gt(t, o[4], a)));
		}
	}
	return t.flush();
}
(/* @__PURE__ */ t(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r() : typeof define == "function" && define.amd ? define(r) : (n = typeof globalThis < "u" ? globalThis : n || self, n.resolveURI = r());
	})(e, (function() {
		let e = /^[\w+.-]+:\/\//, t = /^([\w+.-]+:)\/\/([^@/#?]*@)?([^:/#?]*)(:\d+)?(\/[^#?]*)?(\?[^#]*)?(#.*)?/, n = /^file:(?:\/\/((?![a-z]:)[^/#?]*)?)?(\/?[^#?]*)(\?[^#]*)?(#.*)?/i;
		function r(t) {
			return e.test(t);
		}
		function i(e) {
			return e.startsWith("//");
		}
		function a(e) {
			return e.startsWith("/");
		}
		function o(e) {
			return e.startsWith("file:");
		}
		function s(e) {
			return /^[.?#]/.test(e);
		}
		function c(e) {
			let n = t.exec(e);
			return u(n[1], n[2] || "", n[3], n[4] || "", n[5] || "/", n[6] || "", n[7] || "");
		}
		function l(e) {
			let t = n.exec(e), r = t[2];
			return u("file:", "", t[1] || "", "", a(r) ? r : "/" + r, t[3] || "", t[4] || "");
		}
		function u(e, t, n, r, i, a, o) {
			return {
				scheme: e,
				user: t,
				host: n,
				port: r,
				path: i,
				query: a,
				hash: o,
				type: 7
			};
		}
		function d(e) {
			if (i(e)) {
				let t = c("http:" + e);
				return t.scheme = "", t.type = 6, t;
			}
			if (a(e)) {
				let t = c("http://foo.com" + e);
				return t.scheme = "", t.host = "", t.type = 5, t;
			}
			if (o(e)) return l(e);
			if (r(e)) return c(e);
			let t = c("http://foo.com/" + e);
			return t.scheme = "", t.host = "", t.type = e ? e.startsWith("?") ? 3 : e.startsWith("#") ? 2 : 4 : 1, t;
		}
		function f(e) {
			if (e.endsWith("/..")) return e;
			let t = e.lastIndexOf("/");
			return e.slice(0, t + 1);
		}
		function p(e, t) {
			m(t, t.type), e.path === "/" ? e.path = t.path : e.path = f(t.path) + e.path;
		}
		function m(e, t) {
			let n = t <= 4, r = e.path.split("/"), i = 1, a = 0, o = !1;
			for (let e = 1; e < r.length; e++) {
				let t = r[e];
				if (!t) {
					o = !0;
					continue;
				}
				if (o = !1, t !== ".") {
					if (t === "..") {
						a ? (o = !0, a--, i--) : n && (r[i++] = t);
						continue;
					}
					r[i++] = t, a++;
				}
			}
			let s = "";
			for (let e = 1; e < i; e++) s += "/" + r[e];
			(!s || o && !s.endsWith("/..")) && (s += "/"), e.path = s;
		}
		function h(e, t) {
			if (!e && !t) return "";
			let n = d(e), r = n.type;
			if (t && r !== 7) {
				let e = d(t), i = e.type;
				switch (r) {
					case 1: n.hash = e.hash;
					case 2: n.query = e.query;
					case 3:
					case 4: p(n, e);
					case 5: n.user = e.user, n.host = e.host, n.port = e.port;
					case 6: n.scheme = e.scheme;
				}
				i > r && (r = i);
			}
			m(n, r);
			let i = n.query + n.hash;
			switch (r) {
				case 2:
				case 3: return i;
				case 4: {
					let r = n.path.slice(1);
					return r ? s(t || e) && !s(r) ? "./" + r + i : r + i : i || ".";
				}
				case 5: return n.path + i;
				default: return n.scheme + "//" + n.user + n.host + n.port + n.path + i;
			}
		}
		return h;
	}));
})))();
//#endregion
//#region node_modules/.pnpm/@jridgewell+gen-mapping@0.3.13/node_modules/@jridgewell/gen-mapping/dist/gen-mapping.mjs
var xt = class {
	constructor() {
		this._indexes = { __proto__: null }, this.array = [];
	}
};
function St(e) {
	return e;
}
function Ct(e, t) {
	return St(e)._indexes[t];
}
function wt(e, t) {
	let n = Ct(e, t);
	if (n !== void 0) return n;
	let { array: r, _indexes: i } = St(e);
	return i[t] = r.push(t) - 1;
}
var Tt = 0, Et = 1, Dt = 2, Ot = 3, kt = 4, At = -1, jt = class {
	constructor({ file: e, sourceRoot: t } = {}) {
		this._names = new xt(), this._sources = new xt(), this._sourcesContent = [], this._mappings = [], this.file = e, this.sourceRoot = t, this._ignoreList = new xt();
	}
};
function Mt(e) {
	return e;
}
var Nt = (e, t, n, r, i, a, o, s) => It(!0, e, t, n, r, i, a, o, s);
function Pt(e) {
	let { _mappings: t, _sources: n, _sourcesContent: r, _names: i, _ignoreList: a } = Mt(e);
	return Bt(t), {
		version: 3,
		file: e.file || void 0,
		names: i.array,
		sourceRoot: e.sourceRoot || void 0,
		sources: n.array,
		sourcesContent: r,
		mappings: t,
		ignoreList: a.array
	};
}
function Ft(e) {
	let t = Pt(e);
	return Object.assign({}, t, { mappings: bt(t.mappings) });
}
function It(e, t, n, r, i, a, o, s, c) {
	let { _mappings: l, _sources: u, _sourcesContent: d, _names: f } = Mt(t), p = Lt(l, n), m = Rt(p, r);
	if (!i) return e && Vt(p, m) ? void 0 : zt(p, m, [r]);
	let h = wt(u, i), ee = s ? wt(f, s) : At;
	if (h === d.length && (d[h] = c ?? null), !(e && Ht(p, m, h, a, o, ee))) return zt(p, m, s ? [
		r,
		h,
		a,
		o,
		ee
	] : [
		r,
		h,
		a,
		o
	]);
}
function Lt(e, t) {
	for (let n = e.length; n <= t; n++) e[n] = [];
	return e[t];
}
function Rt(e, t) {
	let n = e.length;
	for (let r = n - 1; r >= 0 && !(t >= e[r][Tt]); n = r--);
	return n;
}
function zt(e, t, n) {
	for (let n = e.length; n > t; n--) e[n] = e[n - 1];
	e[t] = n;
}
function Bt(e) {
	let { length: t } = e, n = t;
	for (let t = n - 1; t >= 0 && !(e[t].length > 0); n = t, t--);
	n < t && (e.length = n);
}
function Vt(e, t) {
	return t === 0 ? !0 : e[t - 1].length === 1;
}
function Ht(e, t, n, r, i, a) {
	if (t === 0) return !1;
	let o = e[t - 1];
	return o.length === 1 ? !1 : n === o[Et] && r === o[Dt] && i === o[Ot] && a === (o.length === 5 ? o[kt] : At);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/computeSourceMap.js
function Ut({ code: e, mappings: t }, n, r, i, a) {
	let o = Wt(i, a), s = new jt({ file: r.compiledFilename }), l = 0, u = t[0];
	for (; u === void 0 && l < t.length - 1;) l++, u = t[l];
	let d = 0, f = 0;
	u !== f && Nt(s, d, 0, n, d, 0);
	for (let r = 0; r < e.length; r++) {
		if (r === u) {
			let e = u - f, i = o[l];
			for (Nt(s, d, e, n, d, i); (u === r || u === void 0) && l < t.length - 1;) l++, u = t[l];
		}
		e.charCodeAt(r) === c.lineFeed && (d++, f = r + 1, u !== f && Nt(s, d, 0, n, d, 0));
	}
	let { sourceRoot: p, sourcesContent: m, ...h } = Ft(s);
	return h;
}
function Wt(e, t) {
	let n = Array(t.length), r = 0, i = t[r].start, a = 0;
	for (let o = 0; o < e.length; o++) o === i && (n[r] = i - a, r++, i = t[r].start), e.charCodeAt(o) === c.lineFeed && (a = o + 1);
	return n;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/HelperManager.js
var Gt = {
	require: "\n    import {createRequire as CREATE_REQUIRE_NAME} from \"module\";\n    const require = CREATE_REQUIRE_NAME(import.meta.url);\n  ",
	interopRequireWildcard: "\n    function interopRequireWildcard(obj) {\n      if (obj && obj.__esModule) {\n        return obj;\n      } else {\n        var newObj = {};\n        if (obj != null) {\n          for (var key in obj) {\n            if (Object.prototype.hasOwnProperty.call(obj, key)) {\n              newObj[key] = obj[key];\n            }\n          }\n        }\n        newObj.default = obj;\n        return newObj;\n      }\n    }\n  ",
	interopRequireDefault: "\n    function interopRequireDefault(obj) {\n      return obj && obj.__esModule ? obj : { default: obj };\n    }\n  ",
	createNamedExportFrom: "\n    function createNamedExportFrom(obj, localName, importedName) {\n      Object.defineProperty(exports, localName, {enumerable: true, configurable: true, get: () => obj[importedName]});\n    }\n  ",
	createStarExport: "\n    function createStarExport(obj) {\n      Object.keys(obj)\n        .filter((key) => key !== \"default\" && key !== \"__esModule\")\n        .forEach((key) => {\n          if (exports.hasOwnProperty(key)) {\n            return;\n          }\n          Object.defineProperty(exports, key, {enumerable: true, configurable: true, get: () => obj[key]});\n        });\n    }\n  ",
	nullishCoalesce: "\n    function nullishCoalesce(lhs, rhsFn) {\n      if (lhs != null) {\n        return lhs;\n      } else {\n        return rhsFn();\n      }\n    }\n  ",
	asyncNullishCoalesce: "\n    async function asyncNullishCoalesce(lhs, rhsFn) {\n      if (lhs != null) {\n        return lhs;\n      } else {\n        return await rhsFn();\n      }\n    }\n  ",
	optionalChain: "\n    function optionalChain(ops) {\n      let lastAccessLHS = undefined;\n      let value = ops[0];\n      let i = 1;\n      while (i < ops.length) {\n        const op = ops[i];\n        const fn = ops[i + 1];\n        i += 2;\n        if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {\n          return undefined;\n        }\n        if (op === 'access' || op === 'optionalAccess') {\n          lastAccessLHS = value;\n          value = fn(value);\n        } else if (op === 'call' || op === 'optionalCall') {\n          value = fn((...args) => value.call(lastAccessLHS, ...args));\n          lastAccessLHS = undefined;\n        }\n      }\n      return value;\n    }\n  ",
	asyncOptionalChain: "\n    async function asyncOptionalChain(ops) {\n      let lastAccessLHS = undefined;\n      let value = ops[0];\n      let i = 1;\n      while (i < ops.length) {\n        const op = ops[i];\n        const fn = ops[i + 1];\n        i += 2;\n        if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {\n          return undefined;\n        }\n        if (op === 'access' || op === 'optionalAccess') {\n          lastAccessLHS = value;\n          value = await fn(value);\n        } else if (op === 'call' || op === 'optionalCall') {\n          value = await fn((...args) => value.call(lastAccessLHS, ...args));\n          lastAccessLHS = undefined;\n        }\n      }\n      return value;\n    }\n  ",
	optionalChainDelete: "\n    function optionalChainDelete(ops) {\n      const result = OPTIONAL_CHAIN_NAME(ops);\n      return result == null ? true : result;\n    }\n  ",
	asyncOptionalChainDelete: "\n    async function asyncOptionalChainDelete(ops) {\n      const result = await ASYNC_OPTIONAL_CHAIN_NAME(ops);\n      return result == null ? true : result;\n    }\n  "
}, Kt = class e {
	__init() {
		this.helperNames = {};
	}
	__init2() {
		this.createRequireName = null;
	}
	constructor(t) {
		this.nameManager = t, e.prototype.__init.call(this), e.prototype.__init2.call(this);
	}
	getHelperName(e) {
		let t = this.helperNames[e];
		return t || (t = this.nameManager.claimFreeName(`_${e}`), this.helperNames[e] = t, t);
	}
	emitHelpers() {
		let e = "";
		this.helperNames.optionalChainDelete && this.getHelperName("optionalChain"), this.helperNames.asyncOptionalChainDelete && this.getHelperName("asyncOptionalChain");
		for (let [t, n] of Object.entries(Gt)) {
			let r = this.helperNames[t], i = n;
			t === "optionalChainDelete" ? i = i.replace("OPTIONAL_CHAIN_NAME", this.helperNames.optionalChain) : t === "asyncOptionalChainDelete" ? i = i.replace("ASYNC_OPTIONAL_CHAIN_NAME", this.helperNames.asyncOptionalChain) : t === "require" && (this.createRequireName === null && (this.createRequireName = this.nameManager.claimFreeName("_createRequire")), i = i.replace(/CREATE_REQUIRE_NAME/g, this.createRequireName)), r && (e += " ", e += i.replace(t, r).replace(/\s+/g, " ").trim());
		}
		return e;
	}
};
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/identifyShadowedGlobals.js
function qt(e, t, n) {
	Jt(e, n) && Yt(e, t, n);
}
function Jt(e, t) {
	for (let n of e.tokens) if (n.type === r.name && !n.isType && pe(n) && t.has(e.identifierNameForToken(n))) return !0;
	return !1;
}
function Yt(e, t, n) {
	let i = [], a = t.length - 1;
	for (let o = e.tokens.length - 1;; o--) {
		for (; i.length > 0 && i[i.length - 1].startTokenIndex === o + 1;) i.pop();
		for (; a >= 0 && t[a].endTokenIndex === o + 1;) i.push(t[a]), a--;
		if (o < 0) break;
		let s = e.tokens[o], c = e.identifierNameForToken(s);
		if (i.length > 1 && !s.isType && s.type === r.name && n.has(c)) {
			if (he(s)) Xt(i[i.length - 1], e, c);
			else if (ge(s)) {
				let t = i.length - 1;
				for (; t > 0 && !i[t].isFunctionScope;) t--;
				if (t < 0) throw Error("Did not find parent function scope.");
				Xt(i[t], e, c);
			}
		}
	}
	if (i.length > 0) throw Error("Expected empty scope stack after processing file.");
}
function Xt(e, t, n) {
	for (let i = e.startTokenIndex; i < e.endTokenIndex; i++) {
		let e = t.tokens[i];
		(e.type === r.name || e.type === r.jsxName) && t.identifierNameForToken(e) === n && (e.shadowsGlobal = !0);
	}
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/getIdentifierNames.js
function Zt(e, t) {
	let n = [];
	for (let i of t) i.type === r.name && n.push(e.slice(i.start, i.end));
	return n;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/NameManager.js
var Qt = class e {
	__init() {
		this.usedNames = /* @__PURE__ */ new Set();
	}
	constructor(t, n) {
		e.prototype.__init.call(this), this.usedNames = new Set(Zt(t, n));
	}
	claimFreeName(e) {
		let t = this.findFreeName(e);
		return this.usedNames.add(t), t;
	}
	findFreeName(e) {
		if (!this.usedNames.has(e)) return e;
		let t = 2;
		for (; this.usedNames.has(e + String(t));) t++;
		return e + String(t);
	}
}, $t = /* @__PURE__ */ t(((e) => {
	var t = e && e.__extends || (function() {
		var e = function(t, n) {
			return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, t) {
				e.__proto__ = t;
			} || function(e, t) {
				for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
			}, e(t, n);
		};
		return function(t, n) {
			e(t, n);
			function r() {
				this.constructor = t;
			}
			t.prototype = n === null ? Object.create(n) : (r.prototype = n.prototype, new r());
		};
	})();
	Object.defineProperty(e, "__esModule", { value: !0 }), e.DetailContext = e.NoopContext = e.VError = void 0;
	var n = function(e) {
		t(n, e);
		function n(t, r) {
			var i = e.call(this, r) || this;
			return i.path = t, Object.setPrototypeOf(i, n.prototype), i;
		}
		return n;
	}(Error);
	e.VError = n, e.NoopContext = function() {
		function e() {}
		return e.prototype.fail = function(e, t, n) {
			return !1;
		}, e.prototype.unionResolver = function() {
			return this;
		}, e.prototype.createContext = function() {
			return this;
		}, e.prototype.resolveUnion = function(e) {}, e;
	}();
	var r = function() {
		function e() {
			this._propNames = [""], this._messages = [null], this._score = 0;
		}
		return e.prototype.fail = function(e, t, n) {
			return this._propNames.push(e), this._messages.push(t), this._score += n, !1;
		}, e.prototype.unionResolver = function() {
			return new i();
		}, e.prototype.resolveUnion = function(e) {
			for (var t, n, r = e, i = null, a = 0, o = r.contexts; a < o.length; a++) {
				var s = o[a];
				(!i || s._score >= i._score) && (i = s);
			}
			i && i._score > 0 && ((t = this._propNames).push.apply(t, i._propNames), (n = this._messages).push.apply(n, i._messages));
		}, e.prototype.getError = function(e) {
			for (var t = [], r = this._propNames.length - 1; r >= 0; r--) {
				var i = this._propNames[r];
				e += typeof i == "number" ? "[" + i + "]" : i ? "." + i : "";
				var a = this._messages[r];
				a && t.push(e + " " + a);
			}
			return new n(e, t.join("; "));
		}, e.prototype.getErrorDetail = function(e) {
			for (var t = [], n = this._propNames.length - 1; n >= 0; n--) {
				var r = this._propNames[n];
				e += typeof r == "number" ? "[" + r + "]" : r ? "." + r : "";
				var i = this._messages[n];
				i && t.push({
					path: e,
					message: i
				});
			}
			for (var a = null, n = t.length - 1; n >= 0; n--) a && (t[n].nested = [a]), a = t[n];
			return a;
		}, e;
	}();
	e.DetailContext = r;
	var i = function() {
		function e() {
			this.contexts = [];
		}
		return e.prototype.createContext = function() {
			var e = new r();
			return this.contexts.push(e), e;
		}, e;
	}();
})), en = /* @__PURE__ */ t(((e) => {
	var t = e && e.__extends || (function() {
		var e = function(t, n) {
			return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, t) {
				e.__proto__ = t;
			} || function(e, t) {
				for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
			}, e(t, n);
		};
		return function(t, n) {
			e(t, n);
			function r() {
				this.constructor = t;
			}
			t.prototype = n === null ? Object.create(n) : (r.prototype = n.prototype, new r());
		};
	})();
	Object.defineProperty(e, "__esModule", { value: !0 }), e.basicTypes = e.BasicType = e.TParamList = e.TParam = e.param = e.TFunc = e.func = e.TProp = e.TOptional = e.opt = e.TIface = e.iface = e.TEnumLiteral = e.enumlit = e.TEnumType = e.enumtype = e.TIntersection = e.intersection = e.TUnion = e.union = e.TTuple = e.tuple = e.TArray = e.array = e.TLiteral = e.lit = e.TName = e.name = e.TType = void 0;
	var n = $t(), r = function() {
		function e() {}
		return e;
	}();
	e.TType = r;
	function i(e) {
		return typeof e == "string" ? o(e) : e;
	}
	function a(e, t) {
		var n = e[t];
		if (!n) throw Error("Unknown type " + t);
		return n;
	}
	function o(e) {
		return new s(e);
	}
	e.name = o;
	var s = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			return n.name = t, n._failMsg = "is not a " + t, n;
		}
		return n.prototype.getChecker = function(e, t, r) {
			var i = this, o = a(e, this.name), s = o.getChecker(e, t, r);
			return o instanceof T || o instanceof n ? s : function(e, t) {
				return s(e, t) ? !0 : t.fail(null, i._failMsg, 0);
			};
		}, n;
	}(r);
	e.TName = s;
	function c(e) {
		return new l(e);
	}
	e.lit = c;
	var l = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			return n.value = t, n.name = JSON.stringify(t), n._failMsg = "is not " + n.name, n;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this;
			return function(e, t) {
				return e === n.value ? !0 : t.fail(null, n._failMsg, -1);
			};
		}, n;
	}(r);
	e.TLiteral = l;
	function u(e) {
		return new d(i(e));
	}
	e.array = u;
	var d = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			return n.ttype = t, n;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this.ttype.getChecker(e, t);
			return function(e, t) {
				if (!Array.isArray(e)) return t.fail(null, "is not an array", 0);
				for (var r = 0; r < e.length; r++) if (!n(e[r], t)) return t.fail(r, null, 1);
				return !0;
			};
		}, n;
	}(r);
	e.TArray = d;
	function f() {
		return new p([...arguments].map(function(e) {
			return i(e);
		}));
	}
	e.tuple = f;
	var p = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			return n.ttypes = t, n;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this.ttypes.map(function(n) {
				return n.getChecker(e, t);
			}), r = function(e, t) {
				if (!Array.isArray(e)) return t.fail(null, "is not an array", 0);
				for (var r = 0; r < n.length; r++) if (!n[r](e[r], t)) return t.fail(r, null, 1);
				return !0;
			};
			return t ? function(e, t) {
				return r(e, t) ? e.length <= n.length ? !0 : t.fail(n.length, "is extraneous", 2) : !1;
			} : r;
		}, n;
	}(r);
	e.TTuple = p;
	function m() {
		return new h([...arguments].map(function(e) {
			return i(e);
		}));
	}
	e.union = m;
	var h = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			n.ttypes = t;
			var r = t.map(function(e) {
				return e instanceof s || e instanceof l ? e.name : null;
			}).filter(function(e) {
				return e;
			}), i = t.length - r.length;
			return r.length ? (i > 0 && r.push(i + " more"), n._failMsg = "is none of " + r.join(", ")) : n._failMsg = "is none of " + i + " types", n;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this, r = this.ttypes.map(function(n) {
				return n.getChecker(e, t);
			});
			return function(e, t) {
				for (var i = t.unionResolver(), a = 0; a < r.length; a++) if (r[a](e, i.createContext())) return !0;
				return t.resolveUnion(i), t.fail(null, n._failMsg, 0);
			};
		}, n;
	}(r);
	e.TUnion = h;
	function ee() {
		return new te([...arguments].map(function(e) {
			return i(e);
		}));
	}
	e.intersection = ee;
	var te = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			return n.ttypes = t, n;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = /* @__PURE__ */ new Set(), r = this.ttypes.map(function(r) {
				return r.getChecker(e, t, n);
			});
			return function(e, t) {
				return r.every(function(n) {
					return n(e, t);
				}) ? !0 : t.fail(null, null, 0);
			};
		}, n;
	}(r);
	e.TIntersection = te;
	function ne(e) {
		return new re(e);
	}
	e.enumtype = ne;
	var re = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			return n.members = t, n.validValues = /* @__PURE__ */ new Set(), n._failMsg = "is not a valid enum value", n.validValues = new Set(Object.keys(t).map(function(e) {
				return t[e];
			})), n;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this;
			return function(e, t) {
				return n.validValues.has(e) ? !0 : t.fail(null, n._failMsg, 0);
			};
		}, n;
	}(r);
	e.TEnumType = re;
	function g(e, t) {
		return new ie(e, t);
	}
	e.enumlit = g;
	var ie = function(e) {
		t(n, e);
		function n(t, n) {
			var r = e.call(this) || this;
			return r.enumName = t, r.prop = n, r._failMsg = "is not " + t + "." + n, r;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this, r = a(e, this.enumName);
			if (!(r instanceof re)) throw Error("Type " + this.enumName + " used in enumlit is not an enum type");
			var i = r.members[this.prop];
			if (!r.members.hasOwnProperty(this.prop)) throw Error("Unknown value " + this.enumName + "." + this.prop + " used in enumlit");
			return function(e, t) {
				return e === i ? !0 : t.fail(null, n._failMsg, -1);
			};
		}, n;
	}(r);
	e.TEnumLiteral = ie;
	function _(e) {
		return Object.keys(e).map(function(t) {
			return v(t, e[t]);
		});
	}
	function v(e, t) {
		return t instanceof x ? new S(e, t.ttype, !0) : new S(e, i(t), !1);
	}
	function y(e, t) {
		return new b(e, _(t));
	}
	e.iface = y;
	var b = function(e) {
		t(r, e);
		function r(t, n) {
			var r = e.call(this) || this;
			return r.bases = t, r.props = n, r.propSet = new Set(n.map(function(e) {
				return e.name;
			})), r;
		}
		return r.prototype.getChecker = function(e, t, r) {
			var i = this, o = this.bases.map(function(n) {
				return a(e, n).getChecker(e, t);
			}), s = this.props.map(function(n) {
				return n.ttype.getChecker(e, t);
			}), c = new n.NoopContext(), l = this.props.map(function(e, t) {
				return !e.isOpt && !s[t](void 0, c);
			}), u = function(e, t) {
				if (typeof e != "object" || !e) return t.fail(null, "is not an object", 0);
				for (var n = 0; n < o.length; n++) if (!o[n](e, t)) return !1;
				for (var n = 0; n < s.length; n++) {
					var r = i.props[n].name, a = e[r];
					if (a === void 0) {
						if (l[n]) return t.fail(r, "is missing", 1);
					} else if (!s[n](a, t)) return t.fail(r, null, 1);
				}
				return !0;
			};
			if (!t) return u;
			var d = this.propSet;
			return r && (this.propSet.forEach(function(e) {
				return r.add(e);
			}), d = r), function(e, t) {
				if (!u(e, t)) return !1;
				for (var n in e) if (!d.has(n)) return t.fail(n, "is extraneous", 2);
				return !0;
			};
		}, r;
	}(r);
	e.TIface = b;
	function ae(e) {
		return new x(i(e));
	}
	e.opt = ae;
	var x = function(e) {
		t(n, e);
		function n(t) {
			var n = e.call(this) || this;
			return n.ttype = t, n;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this.ttype.getChecker(e, t);
			return function(e, t) {
				return e === void 0 || n(e, t);
			};
		}, n;
	}(r);
	e.TOptional = x;
	var S = function() {
		function e(e, t, n) {
			this.name = e, this.ttype = t, this.isOpt = n;
		}
		return e;
	}();
	e.TProp = S;
	function C(e) {
		return new w(new ce([...arguments].slice(1)), i(e));
	}
	e.func = C;
	var w = function(e) {
		t(n, e);
		function n(t, n) {
			var r = e.call(this) || this;
			return r.paramList = t, r.result = n, r;
		}
		return n.prototype.getChecker = function(e, t) {
			return function(e, t) {
				return typeof e == "function" ? !0 : t.fail(null, "is not a function", 0);
			};
		}, n;
	}(r);
	e.TFunc = w;
	function oe(e, t, n) {
		return new se(e, i(t), !!n);
	}
	e.param = oe;
	var se = function() {
		function e(e, t, n) {
			this.name = e, this.ttype = t, this.isOpt = n;
		}
		return e;
	}();
	e.TParam = se;
	var ce = function(e) {
		t(r, e);
		function r(t) {
			var n = e.call(this) || this;
			return n.params = t, n;
		}
		return r.prototype.getChecker = function(e, t) {
			var r = this, i = this.params.map(function(n) {
				return n.ttype.getChecker(e, t);
			}), a = new n.NoopContext(), o = this.params.map(function(e, t) {
				return !e.isOpt && !i[t](void 0, a);
			}), s = function(e, t) {
				if (!Array.isArray(e)) return t.fail(null, "is not an array", 0);
				for (var n = 0; n < i.length; n++) {
					var a = r.params[n];
					if (e[n] === void 0) {
						if (o[n]) return t.fail(a.name, "is missing", 1);
					} else if (!i[n](e[n], t)) return t.fail(a.name, null, 1);
				}
				return !0;
			};
			return t ? function(e, t) {
				return s(e, t) ? e.length <= i.length ? !0 : t.fail(i.length, "is extraneous", 2) : !1;
			} : s;
		}, r;
	}(r);
	e.TParamList = ce;
	var T = function(e) {
		t(n, e);
		function n(t, n) {
			var r = e.call(this) || this;
			return r.validator = t, r.message = n, r;
		}
		return n.prototype.getChecker = function(e, t) {
			var n = this;
			return function(e, t) {
				return n.validator(e) ? !0 : t.fail(null, n.message, 0);
			};
		}, n;
	}(r);
	e.BasicType = T, e.basicTypes = {
		any: new T(function(e) {
			return !0;
		}, "is invalid"),
		number: new T(function(e) {
			return typeof e == "number";
		}, "is not a number"),
		object: new T(function(e) {
			return typeof e == "object" && e;
		}, "is not an object"),
		boolean: new T(function(e) {
			return typeof e == "boolean";
		}, "is not a boolean"),
		string: new T(function(e) {
			return typeof e == "string";
		}, "is not a string"),
		symbol: new T(function(e) {
			return typeof e == "symbol";
		}, "is not a symbol"),
		void: new T(function(e) {
			return e == null;
		}, "is not void"),
		undefined: new T(function(e) {
			return e === void 0;
		}, "is not undefined"),
		null: new T(function(e) {
			return e === null;
		}, "is not null"),
		never: new T(function(e) {
			return !1;
		}, "is unexpected"),
		Date: new T(le("[object Date]"), "is not a Date"),
		RegExp: new T(le("[object RegExp]"), "is not a RegExp")
	};
	var E = Object.prototype.toString;
	function le(e) {
		return function(t) {
			return typeof t == "object" && t && E.call(t) === e;
		};
	}
	typeof Buffer < "u" && (e.basicTypes.Buffer = new T(function(e) {
		return Buffer.isBuffer(e);
	}, "is not a Buffer"));
	for (var ue = function(t) {
		e.basicTypes[t.name] = new T(function(e) {
			return e instanceof t;
		}, "is not a " + t.name);
	}, de = 0, D = [
		Int8Array,
		Uint8Array,
		Uint8ClampedArray,
		Int16Array,
		Uint16Array,
		Int32Array,
		Uint32Array,
		Float32Array,
		Float64Array,
		ArrayBuffer
	]; de < D.length; de++) {
		var O = D[de];
		ue(O);
	}
})), z = /* @__PURE__ */ e((/* @__PURE__ */ t(((e) => {
	var t = e && e.__spreadArrays || function() {
		for (var e = 0, t = 0, n = arguments.length; t < n; t++) e += arguments[t].length;
		for (var r = Array(e), i = 0, t = 0; t < n; t++) for (var a = arguments[t], o = 0, s = a.length; o < s; o++, i++) r[i] = a[o];
		return r;
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.Checker = e.createCheckers = void 0;
	var n = en(), r = $t(), i = en();
	Object.defineProperty(e, "TArray", {
		enumerable: !0,
		get: function() {
			return i.TArray;
		}
	}), Object.defineProperty(e, "TEnumType", {
		enumerable: !0,
		get: function() {
			return i.TEnumType;
		}
	}), Object.defineProperty(e, "TEnumLiteral", {
		enumerable: !0,
		get: function() {
			return i.TEnumLiteral;
		}
	}), Object.defineProperty(e, "TFunc", {
		enumerable: !0,
		get: function() {
			return i.TFunc;
		}
	}), Object.defineProperty(e, "TIface", {
		enumerable: !0,
		get: function() {
			return i.TIface;
		}
	}), Object.defineProperty(e, "TLiteral", {
		enumerable: !0,
		get: function() {
			return i.TLiteral;
		}
	}), Object.defineProperty(e, "TName", {
		enumerable: !0,
		get: function() {
			return i.TName;
		}
	}), Object.defineProperty(e, "TOptional", {
		enumerable: !0,
		get: function() {
			return i.TOptional;
		}
	}), Object.defineProperty(e, "TParam", {
		enumerable: !0,
		get: function() {
			return i.TParam;
		}
	}), Object.defineProperty(e, "TParamList", {
		enumerable: !0,
		get: function() {
			return i.TParamList;
		}
	}), Object.defineProperty(e, "TProp", {
		enumerable: !0,
		get: function() {
			return i.TProp;
		}
	}), Object.defineProperty(e, "TTuple", {
		enumerable: !0,
		get: function() {
			return i.TTuple;
		}
	}), Object.defineProperty(e, "TType", {
		enumerable: !0,
		get: function() {
			return i.TType;
		}
	}), Object.defineProperty(e, "TUnion", {
		enumerable: !0,
		get: function() {
			return i.TUnion;
		}
	}), Object.defineProperty(e, "TIntersection", {
		enumerable: !0,
		get: function() {
			return i.TIntersection;
		}
	}), Object.defineProperty(e, "array", {
		enumerable: !0,
		get: function() {
			return i.array;
		}
	}), Object.defineProperty(e, "enumlit", {
		enumerable: !0,
		get: function() {
			return i.enumlit;
		}
	}), Object.defineProperty(e, "enumtype", {
		enumerable: !0,
		get: function() {
			return i.enumtype;
		}
	}), Object.defineProperty(e, "func", {
		enumerable: !0,
		get: function() {
			return i.func;
		}
	}), Object.defineProperty(e, "iface", {
		enumerable: !0,
		get: function() {
			return i.iface;
		}
	}), Object.defineProperty(e, "lit", {
		enumerable: !0,
		get: function() {
			return i.lit;
		}
	}), Object.defineProperty(e, "name", {
		enumerable: !0,
		get: function() {
			return i.name;
		}
	}), Object.defineProperty(e, "opt", {
		enumerable: !0,
		get: function() {
			return i.opt;
		}
	}), Object.defineProperty(e, "param", {
		enumerable: !0,
		get: function() {
			return i.param;
		}
	}), Object.defineProperty(e, "tuple", {
		enumerable: !0,
		get: function() {
			return i.tuple;
		}
	}), Object.defineProperty(e, "union", {
		enumerable: !0,
		get: function() {
			return i.union;
		}
	}), Object.defineProperty(e, "intersection", {
		enumerable: !0,
		get: function() {
			return i.intersection;
		}
	}), Object.defineProperty(e, "BasicType", {
		enumerable: !0,
		get: function() {
			return i.BasicType;
		}
	});
	var a = $t();
	Object.defineProperty(e, "VError", {
		enumerable: !0,
		get: function() {
			return a.VError;
		}
	});
	function o() {
		for (var e = [...arguments], r = Object.assign.apply(Object, t([{}, n.basicTypes], e)), i = {}, a = 0, o = e; a < o.length; a++) for (var c = o[a], l = 0, u = Object.keys(c); l < u.length; l++) {
			var d = u[l];
			i[d] = new s(r, c[d]);
		}
		return i;
	}
	e.createCheckers = o;
	var s = function() {
		function e(e, t, r) {
			if (r === void 0 && (r = "value"), this.suite = e, this.ttype = t, this._path = r, this.props = /* @__PURE__ */ new Map(), t instanceof n.TIface) for (var i = 0, a = t.props; i < a.length; i++) {
				var o = a[i];
				this.props.set(o.name, o.ttype);
			}
			this.checkerPlain = this.ttype.getChecker(e, !1), this.checkerStrict = this.ttype.getChecker(e, !0);
		}
		return e.prototype.setReportedPath = function(e) {
			this._path = e;
		}, e.prototype.check = function(e) {
			return this._doCheck(this.checkerPlain, e);
		}, e.prototype.test = function(e) {
			return this.checkerPlain(e, new r.NoopContext());
		}, e.prototype.validate = function(e) {
			return this._doValidate(this.checkerPlain, e);
		}, e.prototype.strictCheck = function(e) {
			return this._doCheck(this.checkerStrict, e);
		}, e.prototype.strictTest = function(e) {
			return this.checkerStrict(e, new r.NoopContext());
		}, e.prototype.strictValidate = function(e) {
			return this._doValidate(this.checkerStrict, e);
		}, e.prototype.getProp = function(t) {
			var n = this.props.get(t);
			if (!n) throw Error("Type has no property " + t);
			return new e(this.suite, n, this._path + "." + t);
		}, e.prototype.methodArgs = function(t) {
			var n = this._getMethod(t);
			return new e(this.suite, n.paramList);
		}, e.prototype.methodResult = function(t) {
			var n = this._getMethod(t);
			return new e(this.suite, n.result);
		}, e.prototype.getArgs = function() {
			if (!(this.ttype instanceof n.TFunc)) throw Error("getArgs() applied to non-function");
			return new e(this.suite, this.ttype.paramList);
		}, e.prototype.getResult = function() {
			if (!(this.ttype instanceof n.TFunc)) throw Error("getResult() applied to non-function");
			return new e(this.suite, this.ttype.result);
		}, e.prototype.getType = function() {
			return this.ttype;
		}, e.prototype._doCheck = function(e, t) {
			if (!e(t, new r.NoopContext())) {
				var n = new r.DetailContext();
				throw e(t, n), n.getError(this._path);
			}
		}, e.prototype._doValidate = function(e, t) {
			if (e(t, new r.NoopContext())) return null;
			var n = new r.DetailContext();
			return e(t, n), n.getErrorDetail(this._path);
		}, e.prototype._getMethod = function(e) {
			var t = this.props.get(e);
			if (!t) throw Error("Type has no property " + e);
			if (!(t instanceof n.TFunc)) throw Error("Property " + e + " is not a method");
			return t;
		}, e;
	}();
	e.Checker = s;
})))()), tn = {
	Transform: z.union(z.lit("jsx"), z.lit("typescript"), z.lit("flow"), z.lit("imports"), z.lit("react-hot-loader"), z.lit("jest")),
	SourceMapOptions: z.iface([], { compiledFilename: "string" }),
	Options: z.iface([], {
		transforms: z.array("Transform"),
		disableESTransforms: z.opt("boolean"),
		jsxRuntime: z.opt(z.union(z.lit("classic"), z.lit("automatic"), z.lit("preserve"))),
		production: z.opt("boolean"),
		jsxImportSource: z.opt("string"),
		jsxPragma: z.opt("string"),
		jsxFragmentPragma: z.opt("string"),
		keepUnusedImports: z.opt("boolean"),
		preserveDynamicImport: z.opt("boolean"),
		injectCreateRequireForImportRequire: z.opt("boolean"),
		enableLegacyTypeScriptModuleInterop: z.opt("boolean"),
		enableLegacyBabel5ModuleInterop: z.opt("boolean"),
		sourceMapOptions: z.opt("SourceMapOptions"),
		filePath: z.opt("string")
	})
}, { Options: nn } = (0, z.createCheckers)(tn);
function rn(e) {
	nn.strictCheck(e);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/traverser/lval.js
function an() {
	k(), W(!1);
}
function on(e) {
	k(), ln(e);
}
function B(e) {
	J(), cn(e);
}
function sn() {
	J(), f.tokens[f.tokens.length - 1].identifierRole = D.ImportDeclaration;
}
function cn(e) {
	let t;
	t = f.scopeDepth === 0 ? D.TopLevelDeclaration : e ? D.BlockScopedDeclaration : D.FunctionScopedDeclaration, f.tokens[f.tokens.length - 1].identifierRole = t;
}
function ln(e) {
	switch (f.type) {
		case r._this: {
			let e = j(0);
			k(), M(e);
			return;
		}
		case r._yield:
		case r.name:
			f.type = r.name, B(e);
			return;
		case r.bracketL:
			k(), un(r.bracketR, e, !0);
			return;
		case r.braceL:
			Gi(!0, e);
			return;
		default: w();
	}
}
function un(e, t, n = !1, i = !1, a = 0) {
	let o = !0, s = !1, c = f.tokens.length;
	for (; !N(e) && !f.error;) if (o ? o = !1 : (C(r.comma), f.tokens[f.tokens.length - 1].contextId = a, !s && f.tokens[c].isType && (f.tokens[f.tokens.length - 1].isType = !0, s = !0)), !(n && P(r.comma))) {
		if (N(e)) break;
		if (P(r.ellipsis)) {
			on(t), fn(), N(r.comma), C(e);
			break;
		} else dn(i, t);
	}
}
function dn(e, t) {
	e && _n([
		n._public,
		n._protected,
		n._private,
		n._readonly,
		n._override
	]), pn(t), fn(), pn(t, !0);
}
function fn() {
	d ? uo() : u && ti();
}
function pn(e, t = !1) {
	if (t || ln(e), !N(r.eq)) return;
	let n = f.tokens.length - 1;
	W(), f.tokens[n].rhsEndIndex = f.tokens.length;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/plugins/typescript.js
function mn() {
	return P(r.name);
}
function hn() {
	return P(r.name) || !!(f.type & r.IS_KEYWORD) || P(r.string) || P(r.num) || P(r.bigint) || P(r.decimal);
}
function gn() {
	let e = f.snapshot();
	return k(), (P(r.bracketL) || P(r.braceL) || P(r.star) || P(r.ellipsis) || P(r.hash) || hn()) && !b() ? !0 : (f.restoreFromSnapshot(e), !1);
}
function _n(e) {
	for (; vn(e) !== null;);
}
function vn(e) {
	if (!P(r.name)) return null;
	let t = f.contextualKeyword;
	if (e.indexOf(t) !== -1 && gn()) {
		switch (t) {
			case n._readonly:
				f.tokens[f.tokens.length - 1].type = r._readonly;
				break;
			case n._abstract:
				f.tokens[f.tokens.length - 1].type = r._abstract;
				break;
			case n._static:
				f.tokens[f.tokens.length - 1].type = r._static;
				break;
			case n._public:
				f.tokens[f.tokens.length - 1].type = r._public;
				break;
			case n._private:
				f.tokens[f.tokens.length - 1].type = r._private;
				break;
			case n._protected:
				f.tokens[f.tokens.length - 1].type = r._protected;
				break;
			case n._override:
				f.tokens[f.tokens.length - 1].type = r._override;
				break;
			case n._declare:
				f.tokens[f.tokens.length - 1].type = r._declare;
				break;
			default: break;
		}
		return t;
	}
	return null;
}
function yn() {
	for (J(); N(r.dot);) J();
}
function bn() {
	yn(), !b() && P(r.lessThan) && Pr();
}
function xn() {
	k(), lr();
}
function Sn() {
	k();
}
function Cn() {
	C(r._typeof), P(r._import) ? wn() : yn(), !b() && P(r.lessThan) && Pr();
}
function wn() {
	C(r._import), C(r.parenL), C(r.string), C(r.parenR), N(r.dot) && yn(), P(r.lessThan) && Pr();
}
function Tn() {
	N(r._const);
	let e = N(r._in), t = _(n._out);
	N(r._const), (e || t) && !P(r.name) ? f.tokens[f.tokens.length - 1].type = r.name : J(), N(r._extends) && V(), N(r.eq) && V();
}
function En() {
	P(r.lessThan) && Dn();
}
function Dn() {
	let e = j(0);
	for (P(r.lessThan) || P(r.typeParameterStart) ? k() : w(); !N(r.greaterThan) && !f.error;) Tn(), N(r.comma);
	M(e);
}
function On(e) {
	let t = e === r.arrow;
	En(), C(r.parenL), f.scopeDepth++, kn(!1), f.scopeDepth--, (t || P(e)) && ir(e);
}
function kn(e) {
	un(r.parenR, e);
}
function An() {
	N(r.comma) || S();
}
function jn() {
	On(r.colon), An();
}
function Mn() {
	let e = f.snapshot();
	k();
	let t = N(r.name) && P(r.colon);
	return f.restoreFromSnapshot(e), t;
}
function Nn() {
	if (!(P(r.bracketL) && Mn())) return !1;
	let e = j(0);
	return C(r.bracketL), J(), lr(), C(r.bracketR), or(), An(), M(e), !0;
}
function Pn(e) {
	N(r.question), !e && (P(r.parenL) || P(r.lessThan)) ? (On(r.colon), An()) : (or(), An());
}
function Fn() {
	if (P(r.parenL) || P(r.lessThan)) {
		jn();
		return;
	}
	if (P(r._new)) {
		k(), P(r.parenL) || P(r.lessThan) ? jn() : Pn(!1);
		return;
	}
	let e = !!vn([n._readonly]);
	Nn() || ((g(n._get) || g(n._set)) && gn(), Xi(-1), Pn(e));
}
function In() {
	Ln();
}
function Ln() {
	for (C(r.braceL); !N(r.braceR) && !f.error;) Fn();
}
function Rn() {
	let e = f.snapshot(), t = zn();
	return f.restoreFromSnapshot(e), t;
}
function zn() {
	return k(), N(r.plus) || N(r.minus) ? g(n._readonly) : (g(n._readonly) && k(), !P(r.bracketL) || (k(), !mn()) ? !1 : (k(), P(r._in)));
}
function Bn() {
	J(), C(r._in), V();
}
function Vn() {
	C(r.braceL), P(r.plus) || P(r.minus) ? (k(), v(n._readonly)) : _(n._readonly), C(r.bracketL), Bn(), _(n._as) && V(), C(r.bracketR), P(r.plus) || P(r.minus) ? (k(), C(r.question)) : N(r.question), sr(), S(), C(r.braceR);
}
function Hn() {
	for (C(r.bracketL); !N(r.bracketR) && !f.error;) Un(), N(r.comma);
}
function Un() {
	N(r.ellipsis) ? V() : (V(), N(r.question)), N(r.colon) && V();
}
function Wn() {
	C(r.parenL), V(), C(r.parenR);
}
function Gn() {
	for (A(), A(); !P(r.backQuote) && !f.error;) C(r.dollarBraceL), V(), A(), A();
	k();
}
var Kn;
(function(e) {
	e[e.TSFunctionType = 0] = "TSFunctionType", e[e.TSConstructorType = 1] = "TSConstructorType", e[e.TSAbstractConstructorType = 2] = "TSAbstractConstructorType";
})(Kn ||= {});
function qn(e) {
	e === Kn.TSAbstractConstructorType && v(n._abstract), (e === Kn.TSConstructorType || e === Kn.TSAbstractConstructorType) && C(r._new);
	let t = f.inDisallowConditionalTypesContext;
	f.inDisallowConditionalTypesContext = !1, On(r.arrow), f.inDisallowConditionalTypesContext = t;
}
function Jn() {
	switch (f.type) {
		case r.name:
			bn();
			return;
		case r._void:
		case r._null:
			k();
			return;
		case r.string:
		case r.num:
		case r.bigint:
		case r.decimal:
		case r._true:
		case r._false:
			Ii();
			return;
		case r.minus:
			k(), Ii();
			return;
		case r._this:
			Sn(), g(n._is) && !b() && xn();
			return;
		case r._typeof:
			Cn();
			return;
		case r._import:
			wn();
			return;
		case r.braceL:
			Rn() ? Vn() : In();
			return;
		case r.bracketL:
			Hn();
			return;
		case r.parenL:
			Wn();
			return;
		case r.backQuote:
			Gn();
			return;
		default:
			if (f.type & r.IS_KEYWORD) {
				k(), f.tokens[f.tokens.length - 1].type = r.name;
				return;
			}
			break;
	}
	w();
}
function Yn() {
	for (Jn(); !b() && N(r.bracketL);) N(r.bracketR) || (V(), C(r.bracketR));
}
function Xn() {
	if (v(n._infer), J(), P(r._extends)) {
		let e = f.snapshot();
		C(r._extends);
		let t = f.inDisallowConditionalTypesContext;
		f.inDisallowConditionalTypesContext = !0, V(), f.inDisallowConditionalTypesContext = t, (f.error || !f.inDisallowConditionalTypesContext && P(r.question)) && f.restoreFromSnapshot(e);
	}
}
function Zn() {
	if (g(n._keyof) || g(n._unique) || g(n._readonly)) k(), Zn();
	else if (g(n._infer)) Xn();
	else {
		let e = f.inDisallowConditionalTypesContext;
		f.inDisallowConditionalTypesContext = !1, Yn(), f.inDisallowConditionalTypesContext = e;
	}
}
function Qn() {
	if (N(r.bitwiseAND), Zn(), P(r.bitwiseAND)) for (; N(r.bitwiseAND);) Zn();
}
function $n() {
	if (N(r.bitwiseOR), Qn(), P(r.bitwiseOR)) for (; N(r.bitwiseOR);) Qn();
}
function er() {
	return P(r.lessThan) ? !0 : P(r.parenL) && nr();
}
function tr() {
	if (P(r.name) || P(r._this)) return k(), !0;
	if (P(r.braceL) || P(r.bracketL)) {
		let e = 1;
		for (k(); e > 0 && !f.error;) P(r.braceL) || P(r.bracketL) ? e++ : (P(r.braceR) || P(r.bracketR)) && e--, k();
		return !0;
	}
	return !1;
}
function nr() {
	let e = f.snapshot(), t = rr();
	return f.restoreFromSnapshot(e), t;
}
function rr() {
	return k(), !!(P(r.parenR) || P(r.ellipsis) || tr() && (P(r.colon) || P(r.comma) || P(r.question) || P(r.eq) || P(r.parenR) && (k(), P(r.arrow))));
}
function ir(e) {
	let t = j(0);
	C(e), cr() || V(), M(t);
}
function ar() {
	P(r.colon) && ir(r.colon);
}
function or() {
	P(r.colon) && lr();
}
function sr() {
	N(r.colon) && V();
}
function cr() {
	let e = f.snapshot();
	return g(n._asserts) ? (k(), _(n._is) ? (V(), !0) : mn() || P(r._this) ? (k(), _(n._is) && V(), !0) : (f.restoreFromSnapshot(e), !1)) : mn() || P(r._this) ? (k(), g(n._is) && !b() ? (k(), V(), !0) : (f.restoreFromSnapshot(e), !1)) : !1;
}
function lr() {
	let e = j(0);
	C(r.colon), V(), M(e);
}
function V() {
	if (dr(), f.inDisallowConditionalTypesContext || b() || !N(r._extends)) return;
	let e = f.inDisallowConditionalTypesContext;
	f.inDisallowConditionalTypesContext = !0, dr(), f.inDisallowConditionalTypesContext = e, C(r.question), V(), C(r.colon), V();
}
function ur() {
	return g(n._abstract) && F() === r._new;
}
function dr() {
	if (er()) {
		qn(Kn.TSFunctionType);
		return;
	}
	if (P(r._new)) {
		qn(Kn.TSConstructorType);
		return;
	} else if (ur()) {
		qn(Kn.TSAbstractConstructorType);
		return;
	}
	$n();
}
function fr() {
	let e = j(1);
	V(), C(r.greaterThan), M(e), wi();
}
function pr() {
	if (N(r.jsxTagStart)) {
		f.tokens[f.tokens.length - 1].type = r.typeParameterStart;
		let e = j(1);
		for (; !P(r.greaterThan) && !f.error;) V(), N(r.comma);
		H(), M(e);
	}
}
function mr() {
	for (; !P(r.braceL) && !f.error;) hr(), N(r.comma);
}
function hr() {
	yn(), P(r.lessThan) && Pr();
}
function gr() {
	B(!1), En(), N(r._extends) && mr(), Ln();
}
function _r() {
	B(!1), En(), C(r.eq), V(), S();
}
function vr() {
	if (P(r.string) ? Ii() : J(), N(r.eq)) {
		let e = f.tokens.length - 1;
		W(), f.tokens[e].rhsEndIndex = f.tokens.length;
	}
}
function yr() {
	for (B(!1), C(r.braceL); !N(r.braceR) && !f.error;) vr(), N(r.comma);
}
function br() {
	C(r.braceL), Xo(r.braceR);
}
function xr() {
	B(!1), N(r.dot) ? xr() : br();
}
function Sr() {
	g(n._global) ? J() : P(r.string) ? q() : w(), P(r.braceL) ? br() : S();
}
function Cr() {
	sn(), C(r.eq), Tr(), S();
}
function wr() {
	return g(n._require) && F() === r.parenL;
}
function Tr() {
	wr() ? Er() : yn();
}
function Er() {
	v(n._require), C(r.parenL), P(r.string) || w(), Ii(), C(r.parenR);
}
function Dr() {
	if (x()) return !1;
	switch (f.type) {
		case r._function: {
			let e = j(1);
			k();
			let t = f.start;
			return ts(t, !0), M(e), !0;
		}
		case r._class: {
			let e = j(1);
			return rs(!0, !1), M(e), !0;
		}
		case r._const: if (P(r._const) && ie(n._enum)) {
			let e = j(1);
			return C(r._const), v(n._enum), f.tokens[f.tokens.length - 1].type = r._enum, yr(), M(e), !0;
		}
		case r._var:
		case r._let: {
			let e = j(1);
			return Go(f.type !== r._var), M(e), !0;
		}
		case r.name: {
			let e = j(1), t = f.contextualKeyword, r = !1;
			return t === n._global ? (Sr(), r = !0) : r = Ar(t, !0), M(e), r;
		}
		default: return !1;
	}
}
function Or() {
	return Ar(f.contextualKeyword, !0);
}
function kr(e) {
	switch (e) {
		case n._declare: {
			let e = f.tokens.length - 1;
			if (Dr()) return f.tokens[e].type = r._declare, !0;
			break;
		}
		case n._global:
			if (P(r.braceL)) return br(), !0;
			break;
		default: return Ar(e, !1);
	}
	return !1;
}
function Ar(e, t) {
	switch (e) {
		case n._abstract:
			if (jr(t) && P(r._class)) return f.tokens[f.tokens.length - 1].type = r._abstract, rs(!0, !1), !0;
			break;
		case n._enum:
			if (jr(t) && P(r.name)) return f.tokens[f.tokens.length - 1].type = r._enum, yr(), !0;
			break;
		case n._interface:
			if (jr(t) && P(r.name)) {
				let e = j(t ? 2 : 1);
				return gr(), M(e), !0;
			}
			break;
		case n._module:
			if (jr(t)) {
				if (P(r.string)) {
					let e = j(t ? 2 : 1);
					return Sr(), M(e), !0;
				} else if (P(r.name)) {
					let e = j(t ? 2 : 1);
					return xr(), M(e), !0;
				}
			}
			break;
		case n._namespace:
			if (jr(t) && P(r.name)) {
				let e = j(t ? 2 : 1);
				return xr(), M(e), !0;
			}
			break;
		case n._type:
			if (jr(t) && P(r.name)) {
				let e = j(t ? 2 : 1);
				return _r(), M(e), !0;
			}
			break;
		default: break;
	}
	return !1;
}
function jr(e) {
	return e ? (k(), !0) : !x();
}
function Mr() {
	let e = f.snapshot();
	return Dn(), ns(), ar(), C(r.arrow), f.error ? (f.restoreFromSnapshot(e), !1) : (ea(!0), !0);
}
function Nr() {
	f.type === r.bitShiftL && (--f.pos, I(r.lessThan)), Pr();
}
function Pr() {
	let e = j(0);
	for (C(r.lessThan); !P(r.greaterThan) && !f.error;) V(), N(r.comma);
	e ? (C(r.greaterThan), M(e)) : (M(e), ze(), C(r.greaterThan), f.tokens[f.tokens.length - 1].isType = !0);
}
function Fr() {
	if (P(r.name)) switch (f.contextualKeyword) {
		case n._abstract:
		case n._declare:
		case n._enum:
		case n._interface:
		case n._module:
		case n._namespace:
		case n._type: return !0;
		default: break;
	}
	return !1;
}
function Ir(e, t) {
	if (P(r.colon) && ir(r.colon), !P(r.braceL) && x()) {
		let t = f.tokens.length - 1;
		for (; t >= 0 && (f.tokens[t].start >= e || f.tokens[t].type === r._default || f.tokens[t].type === r._export);) f.tokens[t].isType = !0, t--;
		return;
	}
	ea(!1, t);
}
function Lr(e, t, n) {
	if (!b() && N(r.bang)) {
		f.tokens[f.tokens.length - 1].type = r.nonNullAssertion;
		return;
	}
	if (P(r.lessThan) || P(r.bitShiftL)) {
		let n = f.snapshot();
		if (!t && Ai() && Mr()) return;
		if (Nr(), !t && N(r.parenL) ? (f.tokens[f.tokens.length - 1].subscriptStartIndex = e, K()) : P(r.backQuote) ? Wi() : (f.type === r.greaterThan || f.type !== r.parenL && f.type & r.IS_EXPRESSION_START && !b()) && w(), f.error) f.restoreFromSnapshot(n);
		else return;
	} else !t && P(r.questionDot) && F() === r.lessThan && (k(), f.tokens[e].isOptionalChainStart = !0, f.tokens[f.tokens.length - 1].subscriptStartIndex = e, Pr(), C(r.parenL), K());
	ki(e, t, n);
}
function Rr() {
	if (N(r._import)) return g(n._type) && F() !== r.eq && v(n._type), Cr(), !0;
	if (N(r.eq)) return U(), S(), !0;
	if (_(n._as)) return v(n._namespace), J(), S(), !0;
	if (g(n._type)) {
		let e = F();
		(e === r.braceL || e === r.star) && k();
	}
	return !1;
}
function zr() {
	if (J(), P(r.comma) || P(r.braceR)) {
		f.tokens[f.tokens.length - 1].identifierRole = D.ImportDeclaration;
		return;
	}
	if (J(), P(r.comma) || P(r.braceR)) {
		f.tokens[f.tokens.length - 1].identifierRole = D.ImportDeclaration, f.tokens[f.tokens.length - 2].isType = !0, f.tokens[f.tokens.length - 1].isType = !0;
		return;
	}
	if (J(), P(r.comma) || P(r.braceR)) {
		f.tokens[f.tokens.length - 3].identifierRole = D.ImportAccess, f.tokens[f.tokens.length - 1].identifierRole = D.ImportDeclaration;
		return;
	}
	J(), f.tokens[f.tokens.length - 3].identifierRole = D.ImportAccess, f.tokens[f.tokens.length - 1].identifierRole = D.ImportDeclaration, f.tokens[f.tokens.length - 4].isType = !0, f.tokens[f.tokens.length - 3].isType = !0, f.tokens[f.tokens.length - 2].isType = !0, f.tokens[f.tokens.length - 1].isType = !0;
}
function Br() {
	if (J(), P(r.comma) || P(r.braceR)) {
		f.tokens[f.tokens.length - 1].identifierRole = D.ExportAccess;
		return;
	}
	if (J(), P(r.comma) || P(r.braceR)) {
		f.tokens[f.tokens.length - 1].identifierRole = D.ExportAccess, f.tokens[f.tokens.length - 2].isType = !0, f.tokens[f.tokens.length - 1].isType = !0;
		return;
	}
	if (J(), P(r.comma) || P(r.braceR)) {
		f.tokens[f.tokens.length - 3].identifierRole = D.ExportAccess;
		return;
	}
	J(), f.tokens[f.tokens.length - 3].identifierRole = D.ExportAccess, f.tokens[f.tokens.length - 4].isType = !0, f.tokens[f.tokens.length - 3].isType = !0, f.tokens[f.tokens.length - 2].isType = !0, f.tokens[f.tokens.length - 1].isType = !0;
}
function Vr() {
	if (g(n._abstract) && F() === r._class) return f.type = r._abstract, k(), rs(!0, !0), !0;
	if (g(n._interface)) {
		let e = j(2);
		return Ar(n._interface, !0), M(e), !0;
	}
	return !1;
}
function Hr() {
	if (f.type === r._const) {
		let e = Se();
		if (e.type === r.name && e.contextualKeyword === n._enum) return C(r._const), v(n._enum), f.tokens[f.tokens.length - 1].type = r._enum, yr(), !0;
	}
	return !1;
}
function Ur(e) {
	let t = f.tokens.length;
	_n([
		n._abstract,
		n._readonly,
		n._declare,
		n._static,
		n._override
	]);
	let r = f.tokens.length;
	if (Nn()) {
		let n = e ? t - 1 : t;
		for (let e = n; e < r; e++) f.tokens[e].isType = !0;
		return !0;
	}
	return !1;
}
function Wr(e) {
	kr(e) || S();
}
function Gr() {
	let e = _(n._declare);
	e && (f.tokens[f.tokens.length - 1].type = r._declare);
	let t = !1;
	if (P(r.name)) if (e) {
		let e = j(2);
		t = Or(), M(e);
	} else t = Or();
	if (!t) if (e) {
		let e = j(2);
		Q(!0), M(e);
	} else Q(!0);
}
function Kr(e) {
	if (e && (P(r.lessThan) || P(r.bitShiftL)) && Nr(), _(n._implements)) {
		f.tokens[f.tokens.length - 1].type = r._implements;
		let e = j(1);
		mr(), M(e);
	}
}
function qr() {
	En();
}
function Jr() {
	En();
}
function Yr() {
	let e = j(0);
	b() || N(r.bang), or(), M(e);
}
function Xr() {
	P(r.colon) && lr();
}
function Zr(e, t) {
	return l ? Qr(e, t) : $r(e, t);
}
function Qr(e, t) {
	if (!P(r.lessThan)) return G(e, t);
	let n = f.snapshot(), i = G(e, t);
	if (f.error) f.restoreFromSnapshot(n);
	else return i;
	return f.type = r.typeParameterStart, Dn(), i = G(e, t), i || w(), i;
}
function $r(e, t) {
	if (!P(r.lessThan)) return G(e, t);
	let n = f.snapshot();
	Dn();
	let i = G(e, t);
	if (i || w(), f.error) f.restoreFromSnapshot(n);
	else return i;
	return G(e, t);
}
function ei() {
	if (P(r.colon)) {
		let e = f.snapshot();
		ir(r.colon), y() && w(), P(r.arrow) || w(), f.error && f.restoreFromSnapshot(e);
	}
	return N(r.arrow);
}
function ti() {
	let e = j(0);
	N(r.question), or(), M(e);
}
function ni() {
	(P(r.lessThan) || P(r.bitShiftL)) && Nr(), jo();
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/plugins/jsx/index.js
function ri() {
	let e = !1, t = !1;
	for (;;) {
		if (f.pos >= p.length) {
			w("Unterminated JSX contents");
			return;
		}
		let n = p.charCodeAt(f.pos);
		if (n === c.lessThan || n === c.leftCurlyBrace) {
			if (f.pos === f.start) {
				if (n === c.lessThan) {
					f.pos++, I(r.jsxTagStart);
					return;
				}
				He(n);
				return;
			}
			I(e && !t ? r.jsxEmptyText : r.jsxText);
			return;
		}
		n === c.lineFeed ? e = !0 : n !== c.space && n !== c.carriageReturn && n !== c.tab && (t = !0), f.pos++;
	}
}
function ii(e) {
	for (f.pos++;;) {
		if (f.pos >= p.length) {
			w("Unterminated string constant");
			return;
		}
		if (p.charCodeAt(f.pos) === e) {
			f.pos++;
			break;
		}
		f.pos++;
	}
	I(r.string);
}
function ai() {
	let e;
	do {
		if (f.pos > p.length) {
			w("Unexpectedly reached the end of input.");
			return;
		}
		e = p.charCodeAt(++f.pos);
	} while (E[e] || e === c.dash);
	I(r.jsxName);
}
function oi() {
	H();
}
function si(e) {
	if (oi(), !N(r.colon)) {
		f.tokens[f.tokens.length - 1].identifierRole = e;
		return;
	}
	oi();
}
function ci() {
	let e = f.tokens.length;
	si(D.Access);
	let t = !1;
	for (; P(r.dot);) t = !0, H(), oi();
	if (!t) {
		let t = f.tokens[e], n = p.charCodeAt(t.start);
		n >= c.lowercaseA && n <= c.lowercaseZ && (t.identifierRole = null);
	}
}
function li() {
	switch (f.type) {
		case r.braceL:
			k(), U(), H();
			return;
		case r.jsxTagStart:
			mi(), H();
			return;
		case r.string:
			H();
			return;
		default: w("JSX value should be either an expression or a quoted JSX text");
	}
}
function ui() {
	C(r.ellipsis), U();
}
function di(e) {
	if (P(r.jsxTagEnd)) return !1;
	ci(), u && pr();
	let t = !1;
	for (; !P(r.slash) && !P(r.jsxTagEnd) && !f.error;) {
		if (N(r.braceL)) {
			t = !0, C(r.ellipsis), W(), H();
			continue;
		}
		t && f.end - f.start === 3 && p.charCodeAt(f.start) === c.lowercaseK && p.charCodeAt(f.start + 1) === c.lowercaseE && p.charCodeAt(f.start + 2) === c.lowercaseY && (f.tokens[e].jsxRole = O.KeyAfterPropSpread), si(D.ObjectKey), P(r.eq) && (H(), li());
	}
	let n = P(r.slash);
	return n && H(), n;
}
function fi() {
	P(r.jsxTagEnd) || ci();
}
function pi() {
	let e = f.tokens.length - 1;
	f.tokens[e].jsxRole = O.NoChildren;
	let t = 0;
	if (!di(e)) for (hi();;) switch (f.type) {
		case r.jsxTagStart:
			if (H(), P(r.slash)) {
				H(), fi(), f.tokens[e].jsxRole !== O.KeyAfterPropSpread && (t === 1 ? f.tokens[e].jsxRole = O.OneChild : t > 1 && (f.tokens[e].jsxRole = O.StaticChildren));
				return;
			}
			t++, pi(), hi();
			break;
		case r.jsxText:
			t++, hi();
			break;
		case r.jsxEmptyText:
			hi();
			break;
		case r.braceL:
			k(), P(r.ellipsis) ? (ui(), hi(), t += 2) : (P(r.braceR) || (t++, U()), hi());
			break;
		default:
			w();
			return;
	}
}
function mi() {
	H(), pi();
}
function H() {
	f.tokens.push(new ve()), Ae(), f.start = f.pos;
	let e = p.charCodeAt(f.pos);
	if (le[e]) ai();
	else if (e === c.quotationMark || e === c.apostrophe) ii(e);
	else switch (++f.pos, e) {
		case c.greaterThan:
			I(r.jsxTagEnd);
			break;
		case c.lessThan:
			I(r.jsxTagStart);
			break;
		case c.slash:
			I(r.slash);
			break;
		case c.equalsTo:
			I(r.eq);
			break;
		case c.leftCurlyBrace:
			I(r.braceL);
			break;
		case c.dot:
			I(r.dot);
			break;
		case c.colon:
			I(r.colon);
			break;
		default: w();
	}
}
function hi() {
	f.tokens.push(new ve()), f.start = f.pos, ri();
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/plugins/types.js
function gi(e) {
	if (P(r.question)) {
		let e = F();
		if (e === r.colon || e === r.comma || e === r.parenR) return;
	}
	xi(e);
}
function _i() {
	be(r.question), P(r.colon) && (u ? lr() : d && Ja());
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/traverser/expression.js
var vi = class {
	constructor(e) {
		this.stop = e;
	}
};
function U(e = !1) {
	if (W(e), P(r.comma)) for (; N(r.comma);) W(e);
}
function W(e = !1, t = !1) {
	return u ? Zr(e, t) : d ? _o(e, t) : G(e, t);
}
function G(e, t) {
	if (P(r._yield)) return ia(), !1;
	(P(r.parenL) || P(r.name) || P(r._yield)) && (f.potentialArrowAt = f.start);
	let n = yi(e);
	return t && Vi(), f.type & r.IS_ASSIGN ? (k(), W(e), !1) : n;
}
function yi(e) {
	return Si(e) ? !0 : (bi(e), !1);
}
function bi(e) {
	u || d ? gi(e) : xi(e);
}
function xi(e) {
	N(r.question) && (W(), C(r.colon), W(e));
}
function Si(e) {
	let t = f.tokens.length;
	return wi() ? !0 : (Ci(t, -1, e), !1);
}
function Ci(e, t, i) {
	if (u && (r._in & r.PRECEDENCE_MASK) > t && !b() && (_(n._as) || _(n._satisfies))) {
		let n = j(1);
		V(), M(n), ze(), Ci(e, t, i);
		return;
	}
	let a = f.type & r.PRECEDENCE_MASK;
	if (a > 0 && (!i || !P(r._in)) && a > t) {
		let n = f.type;
		k(), n === r.nullishCoalescing && (f.tokens[f.tokens.length - 1].nullishStartIndex = e);
		let o = f.tokens.length;
		wi(), Ci(o, n & r.IS_RIGHT_ASSOCIATIVE ? a - 1 : a, i), n === r.nullishCoalescing && (f.tokens[e].numNullishCoalesceStarts++, f.tokens[f.tokens.length - 1].numNullishCoalesceEnds++), Ci(e, t, i);
	}
}
function wi() {
	if (u && !l && N(r.lessThan)) return fr(), !1;
	if (g(n._module) && Te() === c.leftCurlyBrace && !ae()) return aa(), !1;
	if (f.type & r.IS_PREFIX) return k(), wi(), !1;
	if (Ti()) return !0;
	for (; f.type & r.IS_POSTFIX && !y();) f.type === r.preIncDec && (f.type = r.postIncDec), k();
	return !1;
}
function Ti() {
	let e = f.tokens.length;
	return q() ? !0 : (Ei(e), f.tokens.length > e && f.tokens[e].isOptionalChainStart && (f.tokens[f.tokens.length - 1].isOptionalChainEnd = !0), !1);
}
function Ei(e, t = !1) {
	d ? yo(e, t) : Di(e, t);
}
function Di(e, t = !1) {
	let n = new vi(!1);
	do
		Oi(e, t, n);
	while (!n.stop && !f.error);
}
function Oi(e, t, n) {
	u ? Lr(e, t, n) : d ? Qa(e, t, n) : ki(e, t, n);
}
function ki(e, t, n) {
	if (!t && N(r.doubleColon)) Ni(), n.stop = !0, Ei(e, t);
	else if (P(r.questionDot)) {
		if (f.tokens[e].isOptionalChainStart = !0, t && F() === r.parenL) {
			n.stop = !0;
			return;
		}
		k(), f.tokens[f.tokens.length - 1].subscriptStartIndex = e, N(r.bracketL) ? (U(), C(r.bracketR)) : N(r.parenL) ? K() : Pi();
	} else if (N(r.dot)) f.tokens[f.tokens.length - 1].subscriptStartIndex = e, Pi();
	else if (N(r.bracketL)) f.tokens[f.tokens.length - 1].subscriptStartIndex = e, U(), C(r.bracketR);
	else if (!t && P(r.parenL)) if (Ai()) {
		let t = f.snapshot(), r = f.tokens.length;
		k(), f.tokens[f.tokens.length - 1].subscriptStartIndex = e;
		let i = h();
		f.tokens[f.tokens.length - 1].contextId = i, K(), f.tokens[f.tokens.length - 1].contextId = i, ji() && (f.restoreFromSnapshot(t), n.stop = !0, f.scopeDepth++, ns(), Mi(r));
	} else {
		k(), f.tokens[f.tokens.length - 1].subscriptStartIndex = e;
		let t = h();
		f.tokens[f.tokens.length - 1].contextId = t, K(), f.tokens[f.tokens.length - 1].contextId = t;
	}
	else P(r.backQuote) ? Wi() : n.stop = !0;
}
function Ai() {
	return f.tokens[f.tokens.length - 1].contextualKeyword === n._async && !y();
}
function K() {
	let e = !0;
	for (; !N(r.parenR) && !f.error;) {
		if (e) e = !1;
		else if (C(r.comma), N(r.parenR)) break;
		na(!1);
	}
}
function ji() {
	return P(r.colon) || P(r.arrow);
}
function Mi(e) {
	u ? Xr() : d && go(), C(r.arrow), Qi(e);
}
function Ni() {
	let e = f.tokens.length;
	q(), Ei(e, !0);
}
function q() {
	if (N(r.modulo)) return J(), !1;
	if (P(r.jsxText) || P(r.jsxEmptyText)) return Ii(), !1;
	if (P(r.lessThan) && l) return f.type = r.jsxTagStart, mi(), k(), !1;
	let e = f.potentialArrowAt === f.start;
	switch (f.type) {
		case r.slash:
		case r.assign: ye();
		case r._super:
		case r._this:
		case r.regexp:
		case r.num:
		case r.bigint:
		case r.decimal:
		case r.string:
		case r._null:
		case r._true:
		case r._false: return k(), !1;
		case r._import: return k(), P(r.dot) && (f.tokens[f.tokens.length - 1].type = r.name, k(), J()), !1;
		case r.name: {
			let t = f.tokens.length, i = f.start, a = f.contextualKeyword;
			return J(), a === n._await ? (ra(), !1) : a === n._async && P(r._function) && !y() ? (k(), ts(i, !1), !1) : e && a === n._async && !y() && P(r.name) ? (f.scopeDepth++, B(!1), C(r.arrow), Qi(t), !0) : P(r._do) && !y() ? (k(), $(), !1) : e && !y() && P(r.arrow) ? (f.scopeDepth++, cn(!1), C(r.arrow), Qi(t), !0) : (f.tokens[f.tokens.length - 1].identifierRole = D.Access, !1);
		}
		case r._do: return k(), $(), !1;
		case r.parenL: return Ri(e);
		case r.bracketL: return k(), ta(r.bracketR, !0), !1;
		case r.braceL: return Gi(!1, !1), !1;
		case r._function: return Fi(), !1;
		case r.at: Oo();
		case r._class: return rs(!1), !1;
		case r._new: return Hi(), !1;
		case r.backQuote: return Wi(), !1;
		case r.doubleColon: return k(), Ni(), !1;
		case r.hash: {
			let e = Te();
			return le[e] || e === c.backslash ? Pi() : k(), !1;
		}
		default: return w(), !1;
	}
}
function Pi() {
	N(r.hash), J();
}
function Fi() {
	let e = f.start;
	J(), N(r.dot) && J(), ts(e, !1);
}
function Ii() {
	k();
}
function Li() {
	C(r.parenL), U(), C(r.parenR);
}
function Ri(e) {
	let t = f.snapshot(), n = f.tokens.length;
	C(r.parenL);
	let i = !0;
	for (; !P(r.parenR) && !f.error;) {
		if (i) i = !1;
		else if (C(r.comma), P(r.parenR)) break;
		if (P(r.ellipsis)) {
			on(!1), Vi();
			break;
		} else W(!1, !0);
	}
	return C(r.parenR), e && zi() && Bi() ? (f.restoreFromSnapshot(t), f.scopeDepth++, ns(), Bi(), Qi(n), f.error ? (f.restoreFromSnapshot(t), Ri(!1), !1) : !0) : !1;
}
function zi() {
	return P(r.colon) || !y();
}
function Bi() {
	return u ? ei() : d ? vo() : N(r.arrow);
}
function Vi() {
	(u || d) && _i();
}
function Hi() {
	if (C(r._new), N(r.dot)) {
		J();
		return;
	}
	Ui(), d && $a(), N(r.parenL) && ta(r.parenR);
}
function Ui() {
	Ni(), N(r.questionDot);
}
function Wi() {
	for (A(), A(); !P(r.backQuote) && !f.error;) C(r.dollarBraceL), U(), A(), A();
	k();
}
function Gi(e, t) {
	let i = h(), a = !0;
	for (k(), f.tokens[f.tokens.length - 1].contextId = i; !N(r.braceR) && !f.error;) {
		if (a) a = !1;
		else if (C(r.comma), N(r.braceR)) break;
		let o = !1;
		if (P(r.ellipsis)) {
			let n = f.tokens.length;
			if (an(), e && (f.tokens.length === n + 2 && cn(t), N(r.braceR))) break;
			continue;
		}
		e || (o = N(r.star)), !e && g(n._async) ? (o && w(), J(), P(r.colon) || P(r.parenL) || P(r.braceR) || P(r.eq) || P(r.comma) || (P(r.star) && (k(), o = !0), Xi(i))) : Xi(i), Yi(e, t, i);
	}
	f.tokens[f.tokens.length - 1].contextId = i;
}
function Ki(e) {
	return !e && (P(r.string) || P(r.num) || P(r.bracketL) || P(r.name) || !!(f.type & r.IS_KEYWORD));
}
function qi(e, t) {
	let n = f.start;
	return P(r.parenL) ? (e && w(), Zi(n, !1), !0) : Ki(e) ? (Xi(t), Zi(n, !1), !0) : !1;
}
function Ji(e, t) {
	if (N(r.colon)) {
		e ? pn(t) : W(!1);
		return;
	}
	let n;
	n = e ? f.scopeDepth === 0 ? D.ObjectShorthandTopLevelDeclaration : t ? D.ObjectShorthandBlockScopedDeclaration : D.ObjectShorthandFunctionScopedDeclaration : D.ObjectShorthand, f.tokens[f.tokens.length - 1].identifierRole = n, pn(t, !0);
}
function Yi(e, t, n) {
	u ? qr() : d && lo(), qi(e, n) || Ji(e, t);
}
function Xi(e) {
	d && Xa(), N(r.bracketL) ? (f.tokens[f.tokens.length - 1].contextId = e, W(), C(r.bracketR), f.tokens[f.tokens.length - 1].contextId = e) : (P(r.num) || P(r.string) || P(r.bigint) || P(r.decimal) ? q() : Pi(), f.tokens[f.tokens.length - 1].identifierRole = D.ObjectKey, f.tokens[f.tokens.length - 1].contextId = e);
}
function Zi(e, t) {
	let n = h();
	f.scopeDepth++;
	let r = f.tokens.length;
	ns(t, n), $i(e, n);
	let i = f.tokens.length;
	f.scopes.push(new a(r, i, !0)), f.scopeDepth--;
}
function Qi(e) {
	ea(!0);
	let t = f.tokens.length;
	f.scopes.push(new a(e, t, !0)), f.scopeDepth--;
}
function $i(e, t = 0) {
	u ? Ir(e, t) : d ? Za(t) : ea(!1, t);
}
function ea(e, t = 0) {
	e && !P(r.braceL) ? W() : $(!0, t);
}
function ta(e, t = !1) {
	let n = !0;
	for (; !N(e) && !f.error;) {
		if (n) n = !1;
		else if (C(r.comma), N(e)) break;
		na(t);
	}
}
function na(e) {
	e && P(r.comma) || (P(r.ellipsis) ? (an(), Vi()) : P(r.question) ? k() : W(!1, !0));
}
function J() {
	k(), f.tokens[f.tokens.length - 1].type = r.name;
}
function ra() {
	wi();
}
function ia() {
	k(), !P(r.semi) && !y() && (N(r.star), W());
}
function aa() {
	v(n._module), C(r.braceL), Xo(r.braceR);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/plugins/flow.js
function oa(e) {
	return (e.type === r.name || !!(e.type & r.IS_KEYWORD)) && e.contextualKeyword !== n._from;
}
function Y(e) {
	let t = j(0);
	C(e || r.colon), Z(), M(t);
}
function sa() {
	C(r.modulo), v(n._checks), N(r.parenL) && (U(), C(r.parenR));
}
function ca() {
	let e = j(0);
	C(r.colon), P(r.modulo) ? sa() : (Z(), P(r.modulo) && sa()), M(e);
}
function la() {
	k(), ya(!0);
}
function ua() {
	k(), J(), P(r.lessThan) && X(), C(r.parenL), Va(), C(r.parenR), ca(), S();
}
function da() {
	P(r._class) ? la() : P(r._function) ? ua() : P(r._var) ? fa() : _(n._module) ? N(r.dot) ? ha() : pa() : g(n._type) ? ga() : g(n._opaque) ? _a() : g(n._interface) ? va() : P(r._export) ? ma() : w();
}
function fa() {
	k(), Ya(), S();
}
function pa() {
	for (P(r.string) ? q() : J(), C(r.braceL); !P(r.braceR) && !f.error;) P(r._import) ? (k(), As()) : w();
	C(r.braceR);
}
function ma() {
	C(r._export), N(r._default) ? P(r._function) || P(r._class) ? da() : (Z(), S()) : P(r._var) || P(r._function) || P(r._class) || g(n._opaque) ? da() : P(r.star) || P(r.braceL) || g(n._interface) || g(n._type) || g(n._opaque) ? hs() : w();
}
function ha() {
	v(n._exports), Ja(), S();
}
function ga() {
	k(), Ca();
}
function _a() {
	k(), wa(!0);
}
function va() {
	k(), ya();
}
function ya(e = !1) {
	if (Sa(), P(r.lessThan) && X(), N(r._extends)) do
		ba();
	while (!e && N(r.comma));
	if (g(n._mixins)) {
		k();
		do
			ba();
		while (N(r.comma));
	}
	if (g(n._implements)) {
		k();
		do
			ba();
		while (N(r.comma));
	}
	Na(e, !1, e);
}
function ba() {
	Ia(!1), P(r.lessThan) && Ea();
}
function xa() {
	ya();
}
function Sa() {
	J();
}
function Ca() {
	Sa(), P(r.lessThan) && X(), Y(r.eq), S();
}
function wa(e) {
	v(n._type), Sa(), P(r.lessThan) && X(), P(r.colon) && Y(r.colon), e || Y(r.eq), S();
}
function Ta() {
	Xa(), Ya(), N(r.eq) && Z();
}
function X() {
	let e = j(0);
	// istanbul ignore else: this condition is already checked at all call sites
	P(r.lessThan) || P(r.typeParameterStart) ? k() : w();
	do
		Ta(), P(r.greaterThan) || C(r.comma);
	while (!P(r.greaterThan) && !f.error);
	C(r.greaterThan), M(e);
}
function Ea() {
	let e = j(0);
	for (C(r.lessThan); !P(r.greaterThan) && !f.error;) Z(), P(r.greaterThan) || C(r.comma);
	C(r.greaterThan), M(e);
}
function Da() {
	if (v(n._interface), N(r._extends)) do
		ba();
	while (N(r.comma));
	Na(!1, !1, !1);
}
function Oa() {
	P(r.num) || P(r.string) ? q() : J();
}
function ka() {
	F() === r.colon ? (Oa(), Y()) : Z(), C(r.bracketR), Y();
}
function Aa() {
	Oa(), C(r.bracketR), C(r.bracketR), P(r.lessThan) || P(r.parenL) ? ja() : (N(r.question), Y());
}
function ja() {
	for (P(r.lessThan) && X(), C(r.parenL); !P(r.parenR) && !P(r.ellipsis) && !f.error;) Ba(), P(r.parenR) || C(r.comma);
	N(r.ellipsis) && Ba(), C(r.parenR), Y();
}
function Ma() {
	ja();
}
function Na(e, t, i) {
	let a;
	for (t && P(r.braceBarL) ? (C(r.braceBarL), a = r.braceBarR) : (C(r.braceL), a = r.braceR); !P(a) && !f.error;) {
		if (i && g(n._proto)) {
			let t = F();
			t !== r.colon && t !== r.question && (k(), e = !1);
		}
		if (e && g(n._static)) {
			let e = F();
			e !== r.colon && e !== r.question && k();
		}
		if (Xa(), N(r.bracketL)) N(r.bracketL) ? Aa() : ka();
		else if (P(r.parenL) || P(r.lessThan)) Ma();
		else {
			if (g(n._get) || g(n._set)) {
				let e = F();
				(e === r.name || e === r.string || e === r.num) && k();
			}
			Pa();
		}
		Fa();
	}
	C(a);
}
function Pa() {
	if (P(r.ellipsis)) {
		if (C(r.ellipsis), N(r.comma) || N(r.semi), P(r.braceR)) return;
		Z();
	} else Oa(), P(r.lessThan) || P(r.parenL) ? ja() : (N(r.question), Y());
}
function Fa() {
	!N(r.semi) && !N(r.comma) && !P(r.braceR) && !P(r.braceBarR) && w();
}
function Ia(e) {
	for (e || J(); N(r.dot);) J();
}
function La() {
	Ia(!0), P(r.lessThan) && Ea();
}
function Ra() {
	C(r._typeof), Ha();
}
function za() {
	for (C(r.bracketL); f.pos < p.length && !P(r.bracketR) && (Z(), !P(r.bracketR));) C(r.comma);
	C(r.bracketR);
}
function Ba() {
	let e = F();
	e === r.colon || e === r.question ? (J(), N(r.question), Y()) : Z();
}
function Va() {
	for (; !P(r.parenR) && !P(r.ellipsis) && !f.error;) Ba(), P(r.parenR) || C(r.comma);
	N(r.ellipsis) && Ba();
}
function Ha() {
	let e = !1, t = f.noAnonFunctionType;
	switch (f.type) {
		case r.name:
			if (g(n._interface)) {
				Da();
				return;
			}
			J(), La();
			return;
		case r.braceL:
			Na(!1, !1, !1);
			return;
		case r.braceBarL:
			Na(!1, !0, !1);
			return;
		case r.bracketL:
			za();
			return;
		case r.lessThan:
			X(), C(r.parenL), Va(), C(r.parenR), C(r.arrow), Z();
			return;
		case r.parenL:
			if (k(), !P(r.parenR) && !P(r.ellipsis)) if (P(r.name)) {
				let t = F();
				e = t !== r.question && t !== r.colon;
			} else e = !0;
			if (e) if (f.noAnonFunctionType = !1, Z(), f.noAnonFunctionType = t, f.noAnonFunctionType || !(P(r.comma) || P(r.parenR) && F() === r.arrow)) {
				C(r.parenR);
				return;
			} else N(r.comma);
			Va(), C(r.parenR), C(r.arrow), Z();
			return;
		case r.minus:
			k(), Ii();
			return;
		case r.string:
		case r.num:
		case r._true:
		case r._false:
		case r._null:
		case r._this:
		case r._void:
		case r.star:
			k();
			return;
		default: if (f.type === r._typeof) {
			Ra();
			return;
		} else if (f.type & r.IS_KEYWORD) {
			k(), f.tokens[f.tokens.length - 1].type = r.name;
			return;
		}
	}
	w();
}
function Ua() {
	for (Ha(); !y() && (P(r.bracketL) || P(r.questionDot));) N(r.questionDot), C(r.bracketL), N(r.bracketR) || (Z(), C(r.bracketR));
}
function Wa() {
	N(r.question) ? Wa() : Ua();
}
function Ga() {
	Wa(), !f.noAnonFunctionType && N(r.arrow) && Z();
}
function Ka() {
	for (N(r.bitwiseAND), Ga(); N(r.bitwiseAND);) Ga();
}
function qa() {
	for (N(r.bitwiseOR), Ka(); N(r.bitwiseOR);) Ka();
}
function Z() {
	qa();
}
function Ja() {
	Y();
}
function Ya() {
	J(), P(r.colon) && Ja();
}
function Xa() {
	(P(r.plus) || P(r.minus)) && (k(), f.tokens[f.tokens.length - 1].isType = !0);
}
function Za(e) {
	P(r.colon) && ca(), ea(!1, e);
}
function Qa(e, t, n) {
	if (P(r.questionDot) && F() === r.lessThan) {
		if (t) {
			n.stop = !0;
			return;
		}
		k(), Ea(), C(r.parenL), K();
		return;
	} else if (!t && P(r.lessThan)) {
		let e = f.snapshot();
		if (Ea(), C(r.parenL), K(), f.error) f.restoreFromSnapshot(e);
		else return;
	}
	ki(e, t, n);
}
function $a() {
	if (P(r.lessThan)) {
		let e = f.snapshot();
		Ea(), f.error && f.restoreFromSnapshot(e);
	}
}
function eo() {
	if (P(r.name) && f.contextualKeyword === n._interface) {
		let e = j(0);
		return k(), xa(), M(e), !0;
	} else if (g(n._enum)) return xo(), !0;
	return !1;
}
function to() {
	return g(n._enum) ? (xo(), !0) : !1;
}
function no(e) {
	if (e === n._declare) {
		if (P(r._class) || P(r.name) || P(r._function) || P(r._var) || P(r._export)) {
			let e = j(1);
			da(), M(e);
		}
	} else if (P(r.name)) {
		if (e === n._interface) {
			let e = j(1);
			xa(), M(e);
		} else if (e === n._type) {
			let e = j(1);
			Ca(), M(e);
		} else if (e === n._opaque) {
			let e = j(1);
			wa(!1), M(e);
		}
	}
	S();
}
function ro() {
	return g(n._type) || g(n._interface) || g(n._opaque) || g(n._enum);
}
function io() {
	return P(r.name) && (f.contextualKeyword === n._type || f.contextualKeyword === n._interface || f.contextualKeyword === n._opaque || f.contextualKeyword === n._enum);
}
function ao() {
	if (g(n._type)) {
		let e = j(1);
		k(), P(r.braceL) ? (Es(), bs()) : Ca(), M(e);
	} else if (g(n._opaque)) {
		let e = j(1);
		k(), wa(!1), M(e);
	} else if (g(n._interface)) {
		let e = j(1);
		k(), xa(), M(e);
	} else Q(!0);
}
function oo() {
	return P(r.star) || g(n._type) && F() === r.star;
}
function so() {
	if (_(n._type)) {
		let e = j(2);
		Cs(), M(e);
	} else Cs();
}
function co(e) {
	if (e && P(r.lessThan) && Ea(), g(n._implements)) {
		let e = j(0);
		k(), f.tokens[f.tokens.length - 1].type = r._implements;
		do
			Sa(), P(r.lessThan) && Ea();
		while (N(r.comma));
		M(e);
	}
}
function lo() {
	P(r.lessThan) && (X(), P(r.parenL) || w());
}
function uo() {
	let e = j(0);
	N(r.question), P(r.colon) && Ja(), M(e);
}
function fo() {
	if (P(r._typeof) || g(n._type)) {
		let e = Se();
		(oa(e) || e.type === r.braceL || e.type === r.star) && k();
	}
}
function po() {
	let e = f.contextualKeyword === n._type || f.type === r._typeof;
	e ? k() : J(), g(n._as) && !ie(n._as) ? (J(), e && !P(r.name) && !(f.type & r.IS_KEYWORD) || J()) : (e && (P(r.name) || f.type & r.IS_KEYWORD) && J(), _(n._as) && J());
}
function mo() {
	if (P(r.lessThan)) {
		let e = j(0);
		X(), M(e);
	}
}
function ho() {
	P(r.colon) && Ja();
}
function go() {
	if (P(r.colon)) {
		let e = f.noAnonFunctionType;
		f.noAnonFunctionType = !0, Ja(), f.noAnonFunctionType = e;
	}
}
function _o(e, t) {
	if (P(r.lessThan)) {
		let n = f.snapshot(), i = G(e, t);
		if (f.error) f.restoreFromSnapshot(n), f.type = r.typeParameterStart;
		else return i;
		let a = j(0);
		if (X(), M(a), i = G(e, t), i) return !0;
		w();
	}
	return G(e, t);
}
function vo() {
	if (P(r.colon)) {
		let e = j(0), t = f.snapshot(), n = f.noAnonFunctionType;
		f.noAnonFunctionType = !0, ca(), f.noAnonFunctionType = n, y() && w(), P(r.arrow) || w(), f.error && f.restoreFromSnapshot(t), M(e);
	}
	return N(r.arrow);
}
function yo(e, t = !1) {
	if (f.tokens[f.tokens.length - 1].contextualKeyword === n._async && P(r.lessThan)) {
		let e = f.snapshot();
		if (bo() && !f.error) return;
		f.restoreFromSnapshot(e);
	}
	Di(e, t);
}
function bo() {
	f.scopeDepth++;
	let e = f.tokens.length;
	return ns(), Bi() ? (Qi(e), !0) : !1;
}
function xo() {
	v(n._enum), f.tokens[f.tokens.length - 1].type = r._enum, J(), So();
}
function So() {
	_(n._of) && k(), C(r.braceL), Co(), C(r.braceR);
}
function Co() {
	for (; !P(r.braceR) && !f.error && !N(r.ellipsis);) wo(), P(r.braceR) || C(r.comma);
}
function wo() {
	J(), N(r.eq) && k();
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/traverser/statement.js
function To() {
	if (Xo(r.eof), f.scopes.push(new a(0, f.tokens.length, !0)), f.scopeDepth !== 0) throw Error(`Invalid scope depth at end of file: ${f.scopeDepth}`);
	return new Ls(f.tokens, f.scopes);
}
function Q(e) {
	d && eo() || (P(r.at) && Oo(), Eo(e));
}
function Eo(e) {
	if (u && Hr()) return;
	let t = f.type;
	switch (t) {
		case r._break:
		case r._continue:
			Mo();
			return;
		case r._debugger:
			No();
			return;
		case r._do:
			Po();
			return;
		case r._for:
			Fo();
			return;
		case r._function:
			if (F() === r.dot) break;
			e || w(), Ro();
			return;
		case r._class:
			e || w(), rs(!0);
			return;
		case r._if:
			zo();
			return;
		case r._return:
			Bo();
			return;
		case r._switch:
			Vo();
			return;
		case r._throw:
			Ho();
			return;
		case r._try:
			Wo();
			return;
		case r._let:
		case r._const: e || w();
		case r._var:
			Go(t !== r._var);
			return;
		case r._while:
			Ko();
			return;
		case r.braceL:
			$();
			return;
		case r.semi:
			qo();
			return;
		case r._export:
		case r._import: {
			let e = F();
			if (e === r.parenL || e === r.dot) break;
			k(), t === r._import ? As() : hs();
			return;
		}
		case r.name: if (f.contextualKeyword === n._async) {
			let e = f.start, t = f.snapshot();
			if (k(), P(r._function) && !y()) {
				C(r._function), ts(e, !0);
				return;
			} else f.restoreFromSnapshot(t);
		} else if (f.contextualKeyword === n._using && !ae() && F() === r.name) {
			Go(!0);
			return;
		} else if (Do()) {
			v(n._await), Go(!0);
			return;
		}
		default: break;
	}
	let i = f.tokens.length;
	U();
	let a = null;
	if (f.tokens.length === i + 1) {
		let e = f.tokens[f.tokens.length - 1];
		e.type === r.name && (a = e.contextualKeyword);
	}
	if (a == null) {
		S();
		return;
	}
	N(r.colon) ? Jo() : Yo(a);
}
function Do() {
	if (!g(n._await)) return !1;
	let e = f.snapshot();
	return k(), !g(n._using) || b() || (k(), !P(r.name) || b()) ? (f.restoreFromSnapshot(e), !1) : (f.restoreFromSnapshot(e), !0);
}
function Oo() {
	for (; P(r.at);) ko();
}
function ko() {
	if (k(), N(r.parenL)) U(), C(r.parenR);
	else {
		for (J(); N(r.dot);) J();
		Ao();
	}
}
function Ao() {
	u ? ni() : jo();
}
function jo() {
	N(r.parenL) && K();
}
function Mo() {
	k(), x() || (J(), S());
}
function No() {
	k(), S();
}
function Po() {
	k(), Q(!1), C(r._while), Li(), N(r.semi);
}
function Fo() {
	f.scopeDepth++;
	let e = f.tokens.length;
	Lo();
	let t = f.tokens.length;
	f.scopes.push(new a(e, t, !1)), f.scopeDepth--;
}
function Io() {
	return !(!g(n._using) || ie(n._of));
}
function Lo() {
	k();
	let e = !1;
	if (g(n._await) && (e = !0, k()), C(r.parenL), P(r.semi)) {
		e && w(), Zo();
		return;
	}
	let t = Do();
	if (t || P(r._var) || P(r._let) || P(r._const) || Io()) {
		if (t && v(n._await), k(), $o(!0, f.type !== r._var), P(r._in) || g(n._of)) {
			Qo(e);
			return;
		}
		Zo();
		return;
	}
	if (U(!0), P(r._in) || g(n._of)) {
		Qo(e);
		return;
	}
	e && w(), Zo();
}
function Ro() {
	let e = f.start;
	k(), ts(e, !0);
}
function zo() {
	k(), Li(), Q(!1), N(r._else) && Q(!1);
}
function Bo() {
	k(), x() || (U(), S());
}
function Vo() {
	k(), Li(), f.scopeDepth++;
	let e = f.tokens.length;
	for (C(r.braceL); !P(r.braceR) && !f.error;) if (P(r._case) || P(r._default)) {
		let e = P(r._case);
		k(), e && U(), C(r.colon);
	} else Q(!0);
	k();
	let t = f.tokens.length;
	f.scopes.push(new a(e, t, !1)), f.scopeDepth--;
}
function Ho() {
	k(), U(), S();
}
function Uo() {
	ln(!0), u && or();
}
function Wo() {
	if (k(), $(), P(r._catch)) {
		k();
		let e = null;
		if (P(r.parenL) && (f.scopeDepth++, e = f.tokens.length, C(r.parenL), Uo(), C(r.parenR)), $(), e != null) {
			let t = f.tokens.length;
			f.scopes.push(new a(e, t, !1)), f.scopeDepth--;
		}
	}
	N(r._finally) && $();
}
function Go(e) {
	k(), $o(!1, e), S();
}
function Ko() {
	k(), Li(), Q(!1);
}
function qo() {
	k();
}
function Jo() {
	Q(!0);
}
function Yo(e) {
	u ? Wr(e) : d ? no(e) : S();
}
function $(e = !1, t = 0) {
	let n = f.tokens.length;
	f.scopeDepth++, C(r.braceL), t && (f.tokens[f.tokens.length - 1].contextId = t), Xo(r.braceR), t && (f.tokens[f.tokens.length - 1].contextId = t);
	let i = f.tokens.length;
	f.scopes.push(new a(n, i, e)), f.scopeDepth--;
}
function Xo(e) {
	for (; !N(e) && !f.error;) Q(!0);
}
function Zo() {
	C(r.semi), P(r.semi) || U(), C(r.semi), P(r.parenR) || U(), C(r.parenR), Q(!1);
}
function Qo(e) {
	e ? _(n._of) : k(), U(), C(r.parenR), Q(!1);
}
function $o(e, t) {
	for (;;) {
		if (es(t), N(r.eq)) {
			let t = f.tokens.length - 1;
			W(e), f.tokens[t].rhsEndIndex = f.tokens.length;
		}
		if (!N(r.comma)) break;
	}
}
function es(e) {
	ln(e), u ? Yr() : d && ho();
}
function ts(e, t, n = !1) {
	P(r.star) && k(), t && !n && !P(r.name) && !P(r._yield) && w();
	let i = null;
	P(r.name) && (t || (i = f.tokens.length, f.scopeDepth++), B(!1));
	let o = f.tokens.length;
	f.scopeDepth++, ns(), $i(e);
	let s = f.tokens.length;
	f.scopes.push(new a(o, s, !0)), f.scopeDepth--, i !== null && (f.scopes.push(new a(i, s, !0)), f.scopeDepth--);
}
function ns(e = !1, t = 0) {
	u ? Jr() : d && mo(), C(r.parenL), t && (f.tokens[f.tokens.length - 1].contextId = t), un(r.parenR, !1, !1, e, t), t && (f.tokens[f.tokens.length - 1].contextId = t);
}
function rs(e, t = !1) {
	let n = h();
	k(), f.tokens[f.tokens.length - 1].contextId = n, f.tokens[f.tokens.length - 1].isExpression = !e;
	let r = null;
	e || (r = f.tokens.length, f.scopeDepth++), ps(e, t), ms();
	let i = f.tokens.length;
	if (os(n), !f.error && (f.tokens[i].contextId = n, f.tokens[f.tokens.length - 1].contextId = n, r !== null)) {
		let e = f.tokens.length;
		f.scopes.push(new a(r, e, !1)), f.scopeDepth--;
	}
}
function is() {
	return P(r.eq) || P(r.semi) || P(r.braceR) || P(r.bang) || P(r.colon);
}
function as() {
	return P(r.parenL) || P(r.lessThan);
}
function os(e) {
	for (C(r.braceL); !N(r.braceR) && !f.error;) {
		if (N(r.semi)) continue;
		if (P(r.at)) {
			ko();
			continue;
		}
		let t = f.start;
		ss(t, e);
	}
}
function ss(e, t) {
	u && _n([
		n._declare,
		n._public,
		n._protected,
		n._private,
		n._override
	]);
	let i = !1;
	if (P(r.name) && f.contextualKeyword === n._static) {
		if (J(), as()) {
			ls(e, !1);
			return;
		} else if (is()) {
			fs();
			return;
		}
		if (f.tokens[f.tokens.length - 1].type = r._static, i = !0, P(r.braceL)) {
			f.tokens[f.tokens.length - 1].contextId = t, $();
			return;
		}
	}
	cs(e, i, t);
}
function cs(e, t, i) {
	if (u && Ur(t)) return;
	if (N(r.star)) {
		us(i), ls(e, !1);
		return;
	}
	us(i);
	let a = !1, o = f.tokens[f.tokens.length - 1];
	o.contextualKeyword === n._constructor && (a = !0), ds(), as() ? ls(e, a) : is() ? fs() : o.contextualKeyword === n._async && !x() ? (f.tokens[f.tokens.length - 1].type = r._async, P(r.star) && k(), us(i), ds(), ls(e, !1)) : (o.contextualKeyword === n._get || o.contextualKeyword === n._set) && !(x() && P(r.star)) ? (o.contextualKeyword === n._get ? f.tokens[f.tokens.length - 1].type = r._get : f.tokens[f.tokens.length - 1].type = r._set, us(i), ls(e, !1)) : o.contextualKeyword === n._accessor && !x() ? (us(i), fs()) : x() ? fs() : w();
}
function ls(e, t) {
	u ? En() : d && P(r.lessThan) && X(), Zi(e, t);
}
function us(e) {
	Xi(e);
}
function ds() {
	if (u) {
		let e = j(0);
		N(r.question), M(e);
	}
}
function fs() {
	if (u ? (be(r.bang), or()) : d && P(r.colon) && Ja(), P(r.eq)) {
		let e = f.tokens.length;
		k(), W(), f.tokens[e].rhsEndIndex = f.tokens.length;
	}
	S();
}
function ps(e, t = !1) {
	u && (!e || t) && g(n._implements) || (P(r.name) && B(!0), u ? En() : d && P(r.lessThan) && X());
}
function ms() {
	let e = !1;
	N(r._extends) ? (Ti(), e = !0) : e = !1, u ? Kr(e) : d && co(e);
}
function hs() {
	let e = f.tokens.length - 1;
	u && Rr() || (xs() ? Ss() : vs() ? (J(), P(r.comma) && F() === r.star ? (C(r.comma), C(r.star), v(n._as), J()) : ys(), bs()) : N(r._default) ? gs() : Ts() ? _s() : (Es(), bs()), f.tokens[e].rhsEndIndex = f.tokens.length);
}
function gs() {
	if (u && Vr() || d && to()) return;
	let e = f.start;
	N(r._function) ? ts(e, !0, !0) : g(n._async) && F() === r._function ? (_(n._async), N(r._function), ts(e, !0, !0)) : P(r._class) ? rs(!0, !0) : P(r.at) ? (Oo(), rs(!0, !0)) : (W(), S());
}
function _s() {
	u ? Gr() : d ? ao() : Q(!0);
}
function vs() {
	if (u && Fr() || d && io()) return !1;
	if (P(r.name)) return f.contextualKeyword !== n._async;
	if (!P(r._default)) return !1;
	let e = Ce(), t = Se(), i = t.type === r.name && t.contextualKeyword === n._from;
	if (t.type === r.comma) return !0;
	if (i) {
		let t = p.charCodeAt(we(e + 4));
		return t === c.quotationMark || t === c.apostrophe;
	}
	return !1;
}
function ys() {
	N(r.comma) && Es();
}
function bs() {
	_(n._from) && (q(), Fs()), S();
}
function xs() {
	return d ? oo() : P(r.star);
}
function Ss() {
	d ? so() : Cs();
}
function Cs() {
	C(r.star), g(n._as) ? ws() : bs();
}
function ws() {
	k(), f.tokens[f.tokens.length - 1].type = r._as, J(), ys(), bs();
}
function Ts() {
	return u && Fr() || d && ro() || f.type === r._var || f.type === r._const || f.type === r._let || f.type === r._function || f.type === r._class || g(n._async) || P(r.at);
}
function Es() {
	let e = !0;
	for (C(r.braceL); !N(r.braceR) && !f.error;) {
		if (e) e = !1;
		else if (C(r.comma), N(r.braceR)) break;
		Ds();
	}
}
function Ds() {
	if (u) {
		Br();
		return;
	}
	J(), f.tokens[f.tokens.length - 1].identifierRole = D.ExportAccess, _(n._as) && J();
}
function Os() {
	let e = f.snapshot();
	return v(n._module), _(n._from) ? g(n._from) ? (f.restoreFromSnapshot(e), !0) : (f.restoreFromSnapshot(e), !1) : P(r.comma) ? (f.restoreFromSnapshot(e), !1) : (f.restoreFromSnapshot(e), !0);
}
function ks() {
	g(n._module) && Os() && k();
}
function As() {
	if (u && P(r.name) && F() === r.eq) {
		Cr();
		return;
	}
	if (u && g(n._type)) {
		let e = Se();
		if (e.type === r.name && e.contextualKeyword !== n._from) {
			if (v(n._type), F() === r.eq) {
				Cr();
				return;
			}
		} else (e.type === r.star || e.type === r.braceL) && v(n._type);
	}
	P(r.string) ? q() : (ks(), Ns(), v(n._from), q()), Fs(), S();
}
function js() {
	return P(r.name);
}
function Ms() {
	sn();
}
function Ns() {
	d && fo();
	let e = !0;
	if (!(js() && (Ms(), !N(r.comma)))) {
		if (P(r.star)) {
			k(), v(n._as), Ms();
			return;
		}
		for (C(r.braceL); !N(r.braceR) && !f.error;) {
			if (e) e = !1;
			else if (N(r.colon) && w("ES2015 named imports do not destructure. Use another statement for destructuring after the import."), C(r.comma), N(r.braceR)) break;
			Ps();
		}
	}
}
function Ps() {
	if (u) {
		zr();
		return;
	}
	if (d) {
		po();
		return;
	}
	sn(), g(n._as) && (f.tokens[f.tokens.length - 1].identifierRole = D.ImportAccess, k(), sn());
}
function Fs() {
	(P(r._with) || g(n._assert) && !b()) && (k(), Gi(!1, !1));
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/traverser/index.js
function Is() {
	return f.pos === 0 && p.charCodeAt(0) === c.numberSign && p.charCodeAt(1) === c.exclamationMark && ke(2), Ee(), To();
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/parser/index.js
var Ls = class {
	constructor(e, t) {
		this.tokens = e, this.scopes = t;
	}
};
function Rs(e, t, n, r) {
	if (r && n) throw Error("Cannot combine flow and typescript plugins.");
	re(e, t, n, r);
	let i = Is();
	if (f.error) throw ee(f.error);
	return i;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/isAsyncOperation.js
function zs(e) {
	let t = e.currentIndex(), r = 0, i = e.currentToken();
	do {
		let a = e.tokens[t];
		if (a.isOptionalChainStart && r++, a.isOptionalChainEnd && r--, r += a.numNullishCoalesceStarts, r -= a.numNullishCoalesceEnds, a.contextualKeyword === n._await && a.identifierRole == null && a.scopeDepth === i.scopeDepth) return !0;
		t += 1;
	} while (r > 0 && t < e.tokens.length);
	return !1;
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/TokenProcessor.js
var Bs = class e {
	__init() {
		this.resultCode = "";
	}
	__init2() {
		this.resultMappings = Array(this.tokens.length);
	}
	__init3() {
		this.tokenIndex = 0;
	}
	constructor(t, n, r, i, a) {
		this.code = t, this.tokens = n, this.isFlowEnabled = r, this.disableESTransforms = i, this.helperManager = a, e.prototype.__init.call(this), e.prototype.__init2.call(this), e.prototype.__init3.call(this);
	}
	snapshot() {
		return {
			resultCode: this.resultCode,
			tokenIndex: this.tokenIndex
		};
	}
	restoreToSnapshot(e) {
		this.resultCode = e.resultCode, this.tokenIndex = e.tokenIndex;
	}
	dangerouslyGetAndRemoveCodeSinceSnapshot(e) {
		let t = this.resultCode.slice(e.resultCode.length);
		return this.resultCode = e.resultCode, t;
	}
	reset() {
		this.resultCode = "", this.resultMappings = Array(this.tokens.length), this.tokenIndex = 0;
	}
	matchesContextualAtIndex(e, t) {
		return this.matches1AtIndex(e, r.name) && this.tokens[e].contextualKeyword === t;
	}
	identifierNameAtIndex(e) {
		return this.identifierNameForToken(this.tokens[e]);
	}
	identifierNameAtRelativeIndex(e) {
		return this.identifierNameForToken(this.tokenAtRelativeIndex(e));
	}
	identifierName() {
		return this.identifierNameForToken(this.currentToken());
	}
	identifierNameForToken(e) {
		return this.code.slice(e.start, e.end);
	}
	rawCodeForToken(e) {
		return this.code.slice(e.start, e.end);
	}
	stringValueAtIndex(e) {
		return this.stringValueForToken(this.tokens[e]);
	}
	stringValue() {
		return this.stringValueForToken(this.currentToken());
	}
	stringValueForToken(e) {
		return this.code.slice(e.start + 1, e.end - 1);
	}
	matches1AtIndex(e, t) {
		return this.tokens[e].type === t;
	}
	matches2AtIndex(e, t, n) {
		return this.tokens[e].type === t && this.tokens[e + 1].type === n;
	}
	matches3AtIndex(e, t, n, r) {
		return this.tokens[e].type === t && this.tokens[e + 1].type === n && this.tokens[e + 2].type === r;
	}
	matches1(e) {
		return this.tokens[this.tokenIndex].type === e;
	}
	matches2(e, t) {
		return this.tokens[this.tokenIndex].type === e && this.tokens[this.tokenIndex + 1].type === t;
	}
	matches3(e, t, n) {
		return this.tokens[this.tokenIndex].type === e && this.tokens[this.tokenIndex + 1].type === t && this.tokens[this.tokenIndex + 2].type === n;
	}
	matches4(e, t, n, r) {
		return this.tokens[this.tokenIndex].type === e && this.tokens[this.tokenIndex + 1].type === t && this.tokens[this.tokenIndex + 2].type === n && this.tokens[this.tokenIndex + 3].type === r;
	}
	matches5(e, t, n, r, i) {
		return this.tokens[this.tokenIndex].type === e && this.tokens[this.tokenIndex + 1].type === t && this.tokens[this.tokenIndex + 2].type === n && this.tokens[this.tokenIndex + 3].type === r && this.tokens[this.tokenIndex + 4].type === i;
	}
	matchesContextual(e) {
		return this.matchesContextualAtIndex(this.tokenIndex, e);
	}
	matchesContextIdAndLabel(e, t) {
		return this.matches1(e) && this.currentToken().contextId === t;
	}
	previousWhitespaceAndComments() {
		let e = this.code.slice(this.tokenIndex > 0 ? this.tokens[this.tokenIndex - 1].end : 0, this.tokenIndex < this.tokens.length ? this.tokens[this.tokenIndex].start : this.code.length);
		return this.isFlowEnabled && (e = e.replace(/@flow/g, "")), e;
	}
	replaceToken(e) {
		this.resultCode += this.previousWhitespaceAndComments(), this.appendTokenPrefix(), this.resultMappings[this.tokenIndex] = this.resultCode.length, this.resultCode += e, this.appendTokenSuffix(), this.tokenIndex++;
	}
	replaceTokenTrimmingLeftWhitespace(e) {
		this.resultCode += this.previousWhitespaceAndComments().replace(/[^\r\n]/g, ""), this.appendTokenPrefix(), this.resultMappings[this.tokenIndex] = this.resultCode.length, this.resultCode += e, this.appendTokenSuffix(), this.tokenIndex++;
	}
	removeInitialToken() {
		this.replaceToken("");
	}
	removeToken() {
		this.replaceTokenTrimmingLeftWhitespace("");
	}
	removeBalancedCode() {
		let e = 0;
		for (; !this.isAtEnd();) {
			if (this.matches1(r.braceL)) e++;
			else if (this.matches1(r.braceR)) {
				if (e === 0) return;
				e--;
			}
			this.removeToken();
		}
	}
	copyExpectedToken(e) {
		if (this.tokens[this.tokenIndex].type !== e) throw Error(`Expected token ${e}`);
		this.copyToken();
	}
	copyToken() {
		this.resultCode += this.previousWhitespaceAndComments(), this.appendTokenPrefix(), this.resultMappings[this.tokenIndex] = this.resultCode.length, this.resultCode += this.code.slice(this.tokens[this.tokenIndex].start, this.tokens[this.tokenIndex].end), this.appendTokenSuffix(), this.tokenIndex++;
	}
	copyTokenWithPrefix(e) {
		this.resultCode += this.previousWhitespaceAndComments(), this.appendTokenPrefix(), this.resultCode += e, this.resultMappings[this.tokenIndex] = this.resultCode.length, this.resultCode += this.code.slice(this.tokens[this.tokenIndex].start, this.tokens[this.tokenIndex].end), this.appendTokenSuffix(), this.tokenIndex++;
	}
	appendTokenPrefix() {
		let e = this.currentToken();
		if ((e.numNullishCoalesceStarts || e.isOptionalChainStart) && (e.isAsyncOperation = zs(this)), !this.disableESTransforms) {
			if (e.numNullishCoalesceStarts) for (let t = 0; t < e.numNullishCoalesceStarts; t++) e.isAsyncOperation ? (this.resultCode += "await ", this.resultCode += this.helperManager.getHelperName("asyncNullishCoalesce")) : this.resultCode += this.helperManager.getHelperName("nullishCoalesce"), this.resultCode += "(";
			e.isOptionalChainStart && (e.isAsyncOperation && (this.resultCode += "await "), this.tokenIndex > 0 && this.tokenAtRelativeIndex(-1).type === r._delete ? e.isAsyncOperation ? this.resultCode += this.helperManager.getHelperName("asyncOptionalChainDelete") : this.resultCode += this.helperManager.getHelperName("optionalChainDelete") : e.isAsyncOperation ? this.resultCode += this.helperManager.getHelperName("asyncOptionalChain") : this.resultCode += this.helperManager.getHelperName("optionalChain"), this.resultCode += "([");
		}
	}
	appendTokenSuffix() {
		let e = this.currentToken();
		if (e.isOptionalChainEnd && !this.disableESTransforms && (this.resultCode += "])"), e.numNullishCoalesceEnds && !this.disableESTransforms) for (let t = 0; t < e.numNullishCoalesceEnds; t++) this.resultCode += "))";
	}
	appendCode(e) {
		this.resultCode += e;
	}
	currentToken() {
		return this.tokens[this.tokenIndex];
	}
	currentTokenCode() {
		let e = this.currentToken();
		return this.code.slice(e.start, e.end);
	}
	tokenAtRelativeIndex(e) {
		return this.tokens[this.tokenIndex + e];
	}
	currentIndex() {
		return this.tokenIndex;
	}
	nextToken() {
		if (this.tokenIndex === this.tokens.length) throw Error("Unexpectedly reached end of input.");
		this.tokenIndex++;
	}
	previousToken() {
		this.tokenIndex--;
	}
	finish() {
		if (this.tokenIndex !== this.tokens.length) throw Error("Tried to finish processing tokens before reaching the end.");
		return this.resultCode += this.previousWhitespaceAndComments(), {
			code: this.resultCode,
			mappings: this.resultMappings
		};
	}
	isAtEnd() {
		return this.tokenIndex === this.tokens.length;
	}
};
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/getClassInfo.js
function Vs(e, t, i, a) {
	let o = t.snapshot(), s = Us(t), c = [], l = [], u = [], d = null, f = [], p = [], m = t.currentToken().contextId;
	if (m == null) throw Error("Expected non-null class context ID on class open-brace.");
	for (t.nextToken(); !t.matchesContextIdAndLabel(r.braceR, m);) if (t.matchesContextual(n._constructor) && !t.currentToken().isType) ({constructorInitializerStatements: c, constructorInsertPos: d} = Ws(t));
	else if (t.matches1(r.semi)) a || p.push({
		start: t.currentIndex(),
		end: t.currentIndex() + 1
	}), t.nextToken();
	else if (t.currentToken().isType) t.nextToken();
	else {
		let o = t.currentIndex(), s = !1, h = !1, ee = !1;
		for (; Gs(t.currentToken());) t.matches1(r._static) && (s = !0), t.matches1(r.hash) && (h = !0), (t.matches1(r._declare) || t.matches1(r._abstract)) && (ee = !0), t.nextToken();
		if (s && t.matches1(r.braceL)) {
			Hs(t, m);
			continue;
		}
		if (h) {
			Hs(t, m);
			continue;
		}
		if (t.matchesContextual(n._constructor) && !t.currentToken().isType) {
			({constructorInitializerStatements: c, constructorInsertPos: d} = Ws(t));
			continue;
		}
		let te = t.currentIndex();
		if (Ks(t), t.matches1(r.lessThan) || t.matches1(r.parenL)) {
			Hs(t, m);
			continue;
		}
		for (; t.currentToken().isType;) t.nextToken();
		if (t.matches1(r.eq)) {
			let n = t.currentIndex(), r = t.currentToken().rhsEndIndex;
			if (r == null) throw Error("Expected rhsEndIndex on class field assignment.");
			for (t.nextToken(); t.currentIndex() < r;) e.processToken();
			let a;
			s ? (a = i.claimFreeName("__initStatic"), u.push(a)) : (a = i.claimFreeName("__init"), l.push(a)), f.push({
				initializerName: a,
				equalsIndex: n,
				start: te,
				end: t.currentIndex()
			});
		} else (!a || ee) && p.push({
			start: o,
			end: t.currentIndex()
		});
	}
	return t.restoreToSnapshot(o), a ? {
		headerInfo: s,
		constructorInitializerStatements: c,
		instanceInitializerNames: [],
		staticInitializerNames: [],
		constructorInsertPos: d,
		fields: [],
		rangesToRemove: p
	} : {
		headerInfo: s,
		constructorInitializerStatements: c,
		instanceInitializerNames: l,
		staticInitializerNames: u,
		constructorInsertPos: d,
		fields: f,
		rangesToRemove: p
	};
}
function Hs(e, t) {
	for (e.nextToken(); e.currentToken().contextId !== t;) e.nextToken();
	for (; Gs(e.tokenAtRelativeIndex(-1));) e.previousToken();
}
function Us(e) {
	let t = e.currentToken(), n = t.contextId;
	if (n == null) throw Error("Expected context ID on class token.");
	let i = t.isExpression;
	if (i == null) throw Error("Expected isExpression on class token.");
	let a = null, o = !1;
	for (e.nextToken(), e.matches1(r.name) && (a = e.identifierName()); !e.matchesContextIdAndLabel(r.braceL, n);) e.matches1(r._extends) && !e.currentToken().isType && (o = !0), e.nextToken();
	return {
		isExpression: i,
		className: a,
		hasSuperclass: o
	};
}
function Ws(e) {
	let t = [];
	e.nextToken();
	let n = e.currentToken().contextId;
	if (n == null) throw Error("Expected context ID on open-paren starting constructor params.");
	for (; !e.matchesContextIdAndLabel(r.parenR, n);) if (e.currentToken().contextId === n) {
		if (e.nextToken(), Gs(e.currentToken())) {
			for (e.nextToken(); Gs(e.currentToken());) e.nextToken();
			let n = e.currentToken();
			if (n.type !== r.name) throw Error("Expected identifier after access modifiers in constructor arg.");
			let i = e.identifierNameForToken(n);
			t.push(`this.${i} = ${i}`);
		}
	} else e.nextToken();
	for (e.nextToken(); e.currentToken().isType;) e.nextToken();
	let i = e.currentIndex(), a = !1;
	for (; !e.matchesContextIdAndLabel(r.braceR, n);) {
		if (!a && e.matches2(r._super, r.parenL)) {
			e.nextToken();
			let t = e.currentToken().contextId;
			if (t == null) throw Error("Expected a context ID on the super call");
			for (; !e.matchesContextIdAndLabel(r.parenR, t);) e.nextToken();
			i = e.currentIndex(), a = !0;
		}
		e.nextToken();
	}
	return e.nextToken(), {
		constructorInitializerStatements: t,
		constructorInsertPos: i
	};
}
function Gs(e) {
	return [
		r._async,
		r._get,
		r._set,
		r.plus,
		r.minus,
		r._readonly,
		r._static,
		r._public,
		r._private,
		r._protected,
		r._override,
		r._abstract,
		r.star,
		r._declare,
		r.hash
	].includes(e.type);
}
function Ks(e) {
	if (e.matches1(r.bracketL)) {
		let t = e.currentToken().contextId;
		if (t == null) throw Error("Expected class context ID on computed name open bracket.");
		for (; !e.matchesContextIdAndLabel(r.bracketR, t);) e.nextToken();
		e.nextToken();
	} else e.nextToken();
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/elideImportEquals.js
function qs(e) {
	if (e.removeInitialToken(), e.removeToken(), e.removeToken(), e.removeToken(), e.matches1(r.parenL)) e.removeToken(), e.removeToken(), e.removeToken();
	else for (; e.matches1(r.dot);) e.removeToken(), e.removeToken();
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/getDeclarationInfo.js
var Js = {
	typeDeclarations: /* @__PURE__ */ new Set(),
	valueDeclarations: /* @__PURE__ */ new Set()
};
function Ys(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
	for (let i = 0; i < e.tokens.length; i++) {
		let a = e.tokens[i];
		a.type === r.name && me(a) && (a.isType ? t.add(e.identifierNameForToken(a)) : n.add(e.identifierNameForToken(a)));
	}
	return {
		typeDeclarations: t,
		valueDeclarations: n
	};
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/isExportFrom.js
function Xs(e) {
	let t = e.currentIndex();
	for (; !e.matches1AtIndex(t, r.braceR);) t++;
	return e.matchesContextualAtIndex(t + 1, n._from) && e.matches1AtIndex(t + 2, r.string);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/removeMaybeImportAttributes.js
function Zs(e) {
	(e.matches2(r._with, r.braceL) || e.matches2(r.name, r.braceL) && e.matchesContextual(n._assert)) && (e.removeToken(), e.removeToken(), e.removeBalancedCode(), e.removeToken());
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/shouldElideDefaultExport.js
function Qs(e, t, n, i) {
	if (!e || t) return !1;
	let a = n.currentToken();
	if (a.rhsEndIndex == null) throw Error("Expected non-null rhsEndIndex on export token.");
	let o = a.rhsEndIndex - n.currentIndex();
	if (o !== 3 && !(o === 4 && n.matches1AtIndex(a.rhsEndIndex - 1, r.semi))) return !1;
	let s = n.tokenAtRelativeIndex(2);
	if (s.type !== r.name) return !1;
	let c = n.identifierNameForToken(s);
	return i.typeDeclarations.has(c) && !i.valueDeclarations.has(c);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/transformers/CJSImportTransformer.js
var $s = class e extends R {
	__init() {
		this.hadExport = !1;
	}
	__init2() {
		this.hadNamedExport = !1;
	}
	__init3() {
		this.hadDefaultExport = !1;
	}
	constructor(t, n, r, i, a, o, s, c, l, u, d, f) {
		super(), this.rootTransformer = t, this.tokens = n, this.importProcessor = r, this.nameManager = i, this.helperManager = a, this.reactHotLoaderTransformer = o, this.enableLegacyBabel5ModuleInterop = s, this.enableLegacyTypeScriptModuleInterop = c, this.isTypeScriptTransformEnabled = l, this.isFlowTransformEnabled = u, this.preserveDynamicImport = d, this.keepUnusedImports = f, e.prototype.__init.call(this), e.prototype.__init2.call(this), e.prototype.__init3.call(this), this.declarationInfo = l ? Ys(n) : Js;
	}
	getPrefixCode() {
		let e = "";
		return this.hadExport && (e += "Object.defineProperty(exports, \"__esModule\", {value: true});"), e;
	}
	getSuffixCode() {
		return this.enableLegacyBabel5ModuleInterop && this.hadDefaultExport && !this.hadNamedExport ? "\nmodule.exports = exports.default;\n" : "";
	}
	process() {
		return this.tokens.matches3(r._import, r.name, r.eq) ? this.processImportEquals() : this.tokens.matches1(r._import) ? (this.processImport(), !0) : this.tokens.matches2(r._export, r.eq) ? (this.tokens.replaceToken("module.exports"), !0) : this.tokens.matches1(r._export) && !this.tokens.currentToken().isType ? (this.hadExport = !0, this.processExport()) : this.tokens.matches2(r.name, r.postIncDec) && this.processPostIncDec() ? !0 : this.tokens.matches1(r.name) || this.tokens.matches1(r.jsxName) ? this.processIdentifier() : this.tokens.matches1(r.eq) ? this.processAssignment() : this.tokens.matches1(r.assign) ? this.processComplexAssignment() : this.tokens.matches1(r.preIncDec) ? this.processPreIncDec() : !1;
	}
	processImportEquals() {
		let e = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
		return this.importProcessor.shouldAutomaticallyElideImportedName(e) ? qs(this.tokens) : this.tokens.replaceToken("const"), !0;
	}
	processImport() {
		if (this.tokens.matches2(r._import, r.parenL)) {
			if (this.preserveDynamicImport) {
				this.tokens.copyToken();
				return;
			}
			let e = this.enableLegacyTypeScriptModuleInterop ? "" : `${this.helperManager.getHelperName("interopRequireWildcard")}(`;
			this.tokens.replaceToken(`Promise.resolve().then(() => ${e}require`);
			let t = this.tokens.currentToken().contextId;
			if (t == null) throw Error("Expected context ID on dynamic import invocation.");
			for (this.tokens.copyToken(); !this.tokens.matchesContextIdAndLabel(r.parenR, t);) this.rootTransformer.processToken();
			this.tokens.replaceToken(e ? ")))" : "))");
			return;
		}
		if (this.removeImportAndDetectIfShouldElide()) this.tokens.removeToken();
		else {
			let e = this.tokens.stringValue();
			this.tokens.replaceTokenTrimmingLeftWhitespace(this.importProcessor.claimImportCode(e)), this.tokens.appendCode(this.importProcessor.claimImportCode(e));
		}
		Zs(this.tokens), this.tokens.matches1(r.semi) && this.tokens.removeToken();
	}
	removeImportAndDetectIfShouldElide() {
		if (this.tokens.removeInitialToken(), this.tokens.matchesContextual(n._type) && !this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, r.comma) && !this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, n._from)) return this.removeRemainingImport(), !0;
		if (this.tokens.matches1(r.name) || this.tokens.matches1(r.star)) return this.removeRemainingImport(), !1;
		if (this.tokens.matches1(r.string)) return !1;
		let e = !1, t = !1;
		for (; !this.tokens.matches1(r.string);) (!e && this.tokens.matches1(r.braceL) || this.tokens.matches1(r.comma)) && (this.tokens.removeToken(), this.tokens.matches1(r.braceR) || (t = !0), (this.tokens.matches2(r.name, r.comma) || this.tokens.matches2(r.name, r.braceR) || this.tokens.matches4(r.name, r.name, r.name, r.comma) || this.tokens.matches4(r.name, r.name, r.name, r.braceR)) && (e = !0)), this.tokens.removeToken();
		return this.keepUnusedImports ? !1 : this.isTypeScriptTransformEnabled ? !e : this.isFlowTransformEnabled ? t && !e : !1;
	}
	removeRemainingImport() {
		for (; !this.tokens.matches1(r.string);) this.tokens.removeToken();
	}
	processIdentifier() {
		let e = this.tokens.currentToken();
		if (e.shadowsGlobal) return !1;
		if (e.identifierRole === D.ObjectShorthand) return this.processObjectShorthand();
		if (e.identifierRole !== D.Access) return !1;
		let t = this.importProcessor.getIdentifierReplacement(this.tokens.identifierNameForToken(e));
		if (!t) return !1;
		let n = this.tokens.currentIndex() + 1;
		for (; n < this.tokens.tokens.length && this.tokens.tokens[n].type === r.parenR;) n++;
		return this.tokens.tokens[n].type === r.parenL ? this.tokens.tokenAtRelativeIndex(1).type === r.parenL && this.tokens.tokenAtRelativeIndex(-1).type !== r._new ? (this.tokens.replaceToken(`${t}.call(void 0, `), this.tokens.removeToken(), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.parenR)) : this.tokens.replaceToken(`(0, ${t})`) : this.tokens.replaceToken(t), !0;
	}
	processObjectShorthand() {
		let e = this.tokens.identifierName(), t = this.importProcessor.getIdentifierReplacement(e);
		return t ? (this.tokens.replaceToken(`${e}: ${t}`), !0) : !1;
	}
	processExport() {
		if (this.tokens.matches2(r._export, r._enum) || this.tokens.matches3(r._export, r._const, r._enum)) return this.hadNamedExport = !0, !1;
		if (this.tokens.matches2(r._export, r._default)) return this.tokens.matches3(r._export, r._default, r._enum) ? (this.hadDefaultExport = !0, !1) : (this.processExportDefault(), !0);
		if (this.tokens.matches2(r._export, r.braceL)) return this.processExportBindings(), !0;
		if (this.tokens.matches2(r._export, r.name) && this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, n._type)) {
			if (this.tokens.removeInitialToken(), this.tokens.removeToken(), this.tokens.matches1(r.braceL)) {
				for (; !this.tokens.matches1(r.braceR);) this.tokens.removeToken();
				this.tokens.removeToken();
			} else this.tokens.removeToken(), this.tokens.matches1(r._as) && (this.tokens.removeToken(), this.tokens.removeToken());
			return this.tokens.matchesContextual(n._from) && this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, r.string) && (this.tokens.removeToken(), this.tokens.removeToken(), Zs(this.tokens)), !0;
		}
		if (this.hadNamedExport = !0, this.tokens.matches2(r._export, r._var) || this.tokens.matches2(r._export, r._let) || this.tokens.matches2(r._export, r._const)) return this.processExportVar(), !0;
		if (this.tokens.matches2(r._export, r._function) || this.tokens.matches3(r._export, r.name, r._function)) return this.processExportFunction(), !0;
		if (this.tokens.matches2(r._export, r._class) || this.tokens.matches3(r._export, r._abstract, r._class) || this.tokens.matches2(r._export, r.at)) return this.processExportClass(), !0;
		if (this.tokens.matches2(r._export, r.star)) return this.processExportStar(), !0;
		throw Error("Unrecognized export syntax.");
	}
	processAssignment() {
		let e = this.tokens.currentIndex(), t = this.tokens.tokens[e - 1];
		if (t.isType || t.type !== r.name || t.shadowsGlobal || e >= 2 && this.tokens.matches1AtIndex(e - 2, r.dot) || e >= 2 && [
			r._var,
			r._let,
			r._const
		].includes(this.tokens.tokens[e - 2].type)) return !1;
		let n = this.importProcessor.resolveExportBinding(this.tokens.identifierNameForToken(t));
		return n ? (this.tokens.copyToken(), this.tokens.appendCode(` ${n} =`), !0) : !1;
	}
	processComplexAssignment() {
		let e = this.tokens.currentIndex(), t = this.tokens.tokens[e - 1];
		if (t.type !== r.name || t.shadowsGlobal || e >= 2 && this.tokens.matches1AtIndex(e - 2, r.dot)) return !1;
		let n = this.importProcessor.resolveExportBinding(this.tokens.identifierNameForToken(t));
		return n ? (this.tokens.appendCode(` = ${n}`), this.tokens.copyToken(), !0) : !1;
	}
	processPreIncDec() {
		let e = this.tokens.currentIndex(), t = this.tokens.tokens[e + 1];
		if (t.type !== r.name || t.shadowsGlobal || e + 2 < this.tokens.tokens.length && (this.tokens.matches1AtIndex(e + 2, r.dot) || this.tokens.matches1AtIndex(e + 2, r.bracketL) || this.tokens.matches1AtIndex(e + 2, r.parenL))) return !1;
		let n = this.tokens.identifierNameForToken(t), i = this.importProcessor.resolveExportBinding(n);
		return i ? (this.tokens.appendCode(`${i} = `), this.tokens.copyToken(), !0) : !1;
	}
	processPostIncDec() {
		let e = this.tokens.currentIndex(), t = this.tokens.tokens[e], n = this.tokens.tokens[e + 1];
		if (t.type !== r.name || t.shadowsGlobal || e >= 1 && this.tokens.matches1AtIndex(e - 1, r.dot)) return !1;
		let i = this.tokens.identifierNameForToken(t), a = this.importProcessor.resolveExportBinding(i);
		if (!a) return !1;
		let o = this.tokens.rawCodeForToken(n), s = this.importProcessor.getIdentifierReplacement(i) || i;
		if (o === "++") this.tokens.replaceToken(`(${s} = ${a} = ${s} + 1, ${s} - 1)`);
		else if (o === "--") this.tokens.replaceToken(`(${s} = ${a} = ${s} - 1, ${s} + 1)`);
		else throw Error(`Unexpected operator: ${o}`);
		return this.tokens.removeToken(), !0;
	}
	processExportDefault() {
		let e = !0;
		if (this.tokens.matches4(r._export, r._default, r._function, r.name) || this.tokens.matches5(r._export, r._default, r.name, r._function, r.name) && this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 2, n._async)) {
			this.tokens.removeInitialToken(), this.tokens.removeToken();
			let e = this.processNamedFunction();
			this.tokens.appendCode(` exports.default = ${e};`);
		} else if (this.tokens.matches4(r._export, r._default, r._class, r.name) || this.tokens.matches5(r._export, r._default, r._abstract, r._class, r.name) || this.tokens.matches3(r._export, r._default, r.at)) {
			this.tokens.removeInitialToken(), this.tokens.removeToken(), this.copyDecorators(), this.tokens.matches1(r._abstract) && this.tokens.removeToken();
			let e = this.rootTransformer.processNamedClass();
			this.tokens.appendCode(` exports.default = ${e};`);
		} else if (Qs(this.isTypeScriptTransformEnabled, this.keepUnusedImports, this.tokens, this.declarationInfo)) e = !1, this.tokens.removeInitialToken(), this.tokens.removeToken(), this.tokens.removeToken();
		else if (this.reactHotLoaderTransformer) {
			let e = this.nameManager.claimFreeName("_default");
			this.tokens.replaceToken(`let ${e}; exports.`), this.tokens.copyToken(), this.tokens.appendCode(` = ${e} =`), this.reactHotLoaderTransformer.setExtractedDefaultExportName(e);
		} else this.tokens.replaceToken("exports."), this.tokens.copyToken(), this.tokens.appendCode(" =");
		e && (this.hadDefaultExport = !0);
	}
	copyDecorators() {
		for (; this.tokens.matches1(r.at);) if (this.tokens.copyToken(), this.tokens.matches1(r.parenL)) this.tokens.copyExpectedToken(r.parenL), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.parenR);
		else {
			for (this.tokens.copyExpectedToken(r.name); this.tokens.matches1(r.dot);) this.tokens.copyExpectedToken(r.dot), this.tokens.copyExpectedToken(r.name);
			this.tokens.matches1(r.parenL) && (this.tokens.copyExpectedToken(r.parenL), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.parenR));
		}
	}
	processExportVar() {
		this.isSimpleExportVar() ? this.processSimpleExportVar() : this.processComplexExportVar();
	}
	isSimpleExportVar() {
		let e = this.tokens.currentIndex();
		if (e++, e++, !this.tokens.matches1AtIndex(e, r.name)) return !1;
		for (e++; e < this.tokens.tokens.length && this.tokens.tokens[e].isType;) e++;
		return !!this.tokens.matches1AtIndex(e, r.eq);
	}
	processSimpleExportVar() {
		this.tokens.removeInitialToken(), this.tokens.copyToken();
		let e = this.tokens.identifierName();
		for (; !this.tokens.matches1(r.eq);) this.rootTransformer.processToken();
		let t = this.tokens.currentToken().rhsEndIndex;
		if (t == null) throw Error("Expected = token with an end index.");
		for (; this.tokens.currentIndex() < t;) this.rootTransformer.processToken();
		this.tokens.appendCode(`; exports.${e} = ${e}`);
	}
	processComplexExportVar() {
		this.tokens.removeInitialToken(), this.tokens.removeToken();
		let e = this.tokens.matches1(r.braceL);
		e && this.tokens.appendCode("(");
		let t = 0;
		for (;;) if (this.tokens.matches1(r.braceL) || this.tokens.matches1(r.dollarBraceL) || this.tokens.matches1(r.bracketL)) t++, this.tokens.copyToken();
		else if (this.tokens.matches1(r.braceR) || this.tokens.matches1(r.bracketR)) t--, this.tokens.copyToken();
		else if (t === 0 && !this.tokens.matches1(r.name) && !this.tokens.currentToken().isType) break;
		else if (this.tokens.matches1(r.eq)) {
			let e = this.tokens.currentToken().rhsEndIndex;
			if (e == null) throw Error("Expected = token with an end index.");
			for (; this.tokens.currentIndex() < e;) this.rootTransformer.processToken();
		} else {
			let e = this.tokens.currentToken();
			if (fe(e)) {
				let t = this.tokens.identifierName(), n = this.importProcessor.getIdentifierReplacement(t);
				if (n === null) throw Error(`Expected a replacement for ${t} in \`export var\` syntax.`);
				_e(e) && (n = `${t}: ${n}`), this.tokens.replaceToken(n);
			} else this.rootTransformer.processToken();
		}
		if (e) {
			let e = this.tokens.currentToken().rhsEndIndex;
			if (e == null) throw Error("Expected = token with an end index.");
			for (; this.tokens.currentIndex() < e;) this.rootTransformer.processToken();
			this.tokens.appendCode(")");
		}
	}
	processExportFunction() {
		this.tokens.replaceToken("");
		let e = this.processNamedFunction();
		this.tokens.appendCode(` exports.${e} = ${e};`);
	}
	processNamedFunction() {
		if (this.tokens.matches1(r._function)) this.tokens.copyToken();
		else if (this.tokens.matches2(r.name, r._function)) {
			if (!this.tokens.matchesContextual(n._async)) throw Error("Expected async keyword in function export.");
			this.tokens.copyToken(), this.tokens.copyToken();
		}
		if (this.tokens.matches1(r.star) && this.tokens.copyToken(), !this.tokens.matches1(r.name)) throw Error("Expected identifier for exported function name.");
		let e = this.tokens.identifierName();
		if (this.tokens.copyToken(), this.tokens.currentToken().isType) for (this.tokens.removeInitialToken(); this.tokens.currentToken().isType;) this.tokens.removeToken();
		return this.tokens.copyExpectedToken(r.parenL), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.parenR), this.rootTransformer.processPossibleTypeRange(), this.tokens.copyExpectedToken(r.braceL), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.braceR), e;
	}
	processExportClass() {
		this.tokens.removeInitialToken(), this.copyDecorators(), this.tokens.matches1(r._abstract) && this.tokens.removeToken();
		let e = this.rootTransformer.processNamedClass();
		this.tokens.appendCode(` exports.${e} = ${e};`);
	}
	processExportBindings() {
		this.tokens.removeInitialToken(), this.tokens.removeToken();
		let e = Xs(this.tokens), t = [];
		for (;;) {
			if (this.tokens.matches1(r.braceR)) {
				this.tokens.removeToken();
				break;
			}
			let n = Xe(this.tokens);
			for (; this.tokens.currentIndex() < n.endIndex;) this.tokens.removeToken();
			if (!(n.isType || !e && this.shouldElideExportedIdentifier(n.leftName))) {
				let e = n.rightName;
				e === "default" ? this.hadDefaultExport = !0 : this.hadNamedExport = !0;
				let r = n.leftName, i = this.importProcessor.getIdentifierReplacement(r);
				t.push(`exports.${e} = ${i || r};`);
			}
			if (this.tokens.matches1(r.braceR)) {
				this.tokens.removeToken();
				break;
			}
			if (this.tokens.matches2(r.comma, r.braceR)) {
				this.tokens.removeToken(), this.tokens.removeToken();
				break;
			} else if (this.tokens.matches1(r.comma)) this.tokens.removeToken();
			else throw Error(`Unexpected token: ${JSON.stringify(this.tokens.currentToken())}`);
		}
		if (this.tokens.matchesContextual(n._from)) {
			this.tokens.removeToken();
			let e = this.tokens.stringValue();
			this.tokens.replaceTokenTrimmingLeftWhitespace(this.importProcessor.claimImportCode(e)), Zs(this.tokens);
		} else this.tokens.appendCode(t.join(" "));
		this.tokens.matches1(r.semi) && this.tokens.removeToken();
	}
	processExportStar() {
		for (this.tokens.removeInitialToken(); !this.tokens.matches1(r.string);) this.tokens.removeToken();
		let e = this.tokens.stringValue();
		this.tokens.replaceTokenTrimmingLeftWhitespace(this.importProcessor.claimImportCode(e)), Zs(this.tokens), this.tokens.matches1(r.semi) && this.tokens.removeToken();
	}
	shouldElideExportedIdentifier(e) {
		return this.isTypeScriptTransformEnabled && !this.keepUnusedImports && !this.declarationInfo.valueDeclarations.has(e);
	}
}, ec = class extends R {
	constructor(e, t, n, r, i, a, o, s) {
		super(), this.tokens = e, this.nameManager = t, this.helperManager = n, this.reactHotLoaderTransformer = r, this.isTypeScriptTransformEnabled = i, this.isFlowTransformEnabled = a, this.keepUnusedImports = o, this.nonTypeIdentifiers = i && !o ? lt(e, s) : /* @__PURE__ */ new Set(), this.declarationInfo = i && !o ? Ys(e) : Js, this.injectCreateRequireForImportRequire = !!s.injectCreateRequireForImportRequire;
	}
	process() {
		if (this.tokens.matches3(r._import, r.name, r.eq)) return this.processImportEquals();
		if (this.tokens.matches4(r._import, r.name, r.name, r.eq) && this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, n._type)) {
			this.tokens.removeInitialToken();
			for (let e = 0; e < 7; e++) this.tokens.removeToken();
			return !0;
		}
		if (this.tokens.matches2(r._export, r.eq)) return this.tokens.replaceToken("module.exports"), !0;
		if (this.tokens.matches5(r._export, r._import, r.name, r.name, r.eq) && this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 2, n._type)) {
			this.tokens.removeInitialToken();
			for (let e = 0; e < 8; e++) this.tokens.removeToken();
			return !0;
		}
		if (this.tokens.matches1(r._import)) return this.processImport();
		if (this.tokens.matches2(r._export, r._default)) return this.processExportDefault();
		if (this.tokens.matches2(r._export, r.braceL)) return this.processNamedExports();
		if (this.tokens.matches2(r._export, r.name) && this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, n._type)) {
			if (this.tokens.removeInitialToken(), this.tokens.removeToken(), this.tokens.matches1(r.braceL)) {
				for (; !this.tokens.matches1(r.braceR);) this.tokens.removeToken();
				this.tokens.removeToken();
			} else this.tokens.removeToken(), this.tokens.matches1(r._as) && (this.tokens.removeToken(), this.tokens.removeToken());
			return this.tokens.matchesContextual(n._from) && this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, r.string) && (this.tokens.removeToken(), this.tokens.removeToken(), Zs(this.tokens)), !0;
		}
		return !1;
	}
	processImportEquals() {
		let e = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
		return this.shouldAutomaticallyElideImportedName(e) ? qs(this.tokens) : this.injectCreateRequireForImportRequire ? (this.tokens.replaceToken("const"), this.tokens.copyToken(), this.tokens.copyToken(), this.tokens.replaceToken(this.helperManager.getHelperName("require"))) : this.tokens.replaceToken("const"), !0;
	}
	processImport() {
		if (this.tokens.matches2(r._import, r.parenL)) return !1;
		let e = this.tokens.snapshot();
		if (this.removeImportTypeBindings()) {
			for (this.tokens.restoreToSnapshot(e); !this.tokens.matches1(r.string);) this.tokens.removeToken();
			this.tokens.removeToken(), Zs(this.tokens), this.tokens.matches1(r.semi) && this.tokens.removeToken();
		}
		return !0;
	}
	removeImportTypeBindings() {
		if (this.tokens.copyExpectedToken(r._import), this.tokens.matchesContextual(n._type) && !this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, r.comma) && !this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, n._from)) return !0;
		if (this.tokens.matches1(r.string)) return this.tokens.copyToken(), !1;
		this.tokens.matchesContextual(n._module) && this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 2, n._from) && this.tokens.copyToken();
		let e = !1, t = !1, i = !1;
		if (this.tokens.matches1(r.name) && (this.shouldAutomaticallyElideImportedName(this.tokens.identifierName()) ? (this.tokens.removeToken(), this.tokens.matches1(r.comma) && this.tokens.removeToken()) : (e = !0, this.tokens.copyToken(), this.tokens.matches1(r.comma) && (i = !0, this.tokens.removeToken()))), this.tokens.matches1(r.star)) this.shouldAutomaticallyElideImportedName(this.tokens.identifierNameAtRelativeIndex(2)) ? (this.tokens.removeToken(), this.tokens.removeToken(), this.tokens.removeToken()) : (i && this.tokens.appendCode(","), e = !0, this.tokens.copyExpectedToken(r.star), this.tokens.copyExpectedToken(r.name), this.tokens.copyExpectedToken(r.name));
		else if (this.tokens.matches1(r.braceL)) {
			for (i && this.tokens.appendCode(","), this.tokens.copyToken(); !this.tokens.matches1(r.braceR);) {
				t = !0;
				let n = Xe(this.tokens);
				if (n.isType || this.shouldAutomaticallyElideImportedName(n.rightName)) {
					for (; this.tokens.currentIndex() < n.endIndex;) this.tokens.removeToken();
					this.tokens.matches1(r.comma) && this.tokens.removeToken();
				} else {
					for (e = !0; this.tokens.currentIndex() < n.endIndex;) this.tokens.copyToken();
					this.tokens.matches1(r.comma) && this.tokens.copyToken();
				}
			}
			this.tokens.copyExpectedToken(r.braceR);
		}
		return this.keepUnusedImports ? !1 : this.isTypeScriptTransformEnabled ? !e : this.isFlowTransformEnabled ? t && !e : !1;
	}
	shouldAutomaticallyElideImportedName(e) {
		return this.isTypeScriptTransformEnabled && !this.keepUnusedImports && !this.nonTypeIdentifiers.has(e);
	}
	processExportDefault() {
		if (Qs(this.isTypeScriptTransformEnabled, this.keepUnusedImports, this.tokens, this.declarationInfo)) return this.tokens.removeInitialToken(), this.tokens.removeToken(), this.tokens.removeToken(), !0;
		if (!(this.tokens.matches4(r._export, r._default, r._function, r.name) || this.tokens.matches5(r._export, r._default, r.name, r._function, r.name) && this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 2, n._async) || this.tokens.matches4(r._export, r._default, r._class, r.name) || this.tokens.matches5(r._export, r._default, r._abstract, r._class, r.name)) && this.reactHotLoaderTransformer) {
			let e = this.nameManager.claimFreeName("_default");
			return this.tokens.replaceToken(`let ${e}; export`), this.tokens.copyToken(), this.tokens.appendCode(` ${e} =`), this.reactHotLoaderTransformer.setExtractedDefaultExportName(e), !0;
		}
		return !1;
	}
	processNamedExports() {
		if (!this.isTypeScriptTransformEnabled) return !1;
		this.tokens.copyExpectedToken(r._export), this.tokens.copyExpectedToken(r.braceL);
		let e = Xs(this.tokens), t = !1;
		for (; !this.tokens.matches1(r.braceR);) {
			let n = Xe(this.tokens);
			if (n.isType || !e && this.shouldElideExportedName(n.leftName)) {
				for (; this.tokens.currentIndex() < n.endIndex;) this.tokens.removeToken();
				this.tokens.matches1(r.comma) && this.tokens.removeToken();
			} else {
				for (t = !0; this.tokens.currentIndex() < n.endIndex;) this.tokens.copyToken();
				this.tokens.matches1(r.comma) && this.tokens.copyToken();
			}
		}
		return this.tokens.copyExpectedToken(r.braceR), !this.keepUnusedImports && e && !t && (this.tokens.removeToken(), this.tokens.removeToken(), Zs(this.tokens)), !0;
	}
	shouldElideExportedName(e) {
		return this.isTypeScriptTransformEnabled && !this.keepUnusedImports && this.declarationInfo.typeDeclarations.has(e) && !this.declarationInfo.valueDeclarations.has(e);
	}
}, tc = class extends R {
	constructor(e, t, n) {
		super(), this.rootTransformer = e, this.tokens = t, this.isImportsTransformEnabled = n;
	}
	process() {
		return this.rootTransformer.processPossibleArrowParamEnd() || this.rootTransformer.processPossibleAsyncArrowWithTypeParams() || this.rootTransformer.processPossibleTypeRange() ? !0 : this.tokens.matches1(r._enum) ? (this.processEnum(), !0) : this.tokens.matches2(r._export, r._enum) ? (this.processNamedExportEnum(), !0) : this.tokens.matches3(r._export, r._default, r._enum) ? (this.processDefaultExportEnum(), !0) : !1;
	}
	processNamedExportEnum() {
		if (this.isImportsTransformEnabled) {
			this.tokens.removeInitialToken();
			let e = this.tokens.identifierNameAtRelativeIndex(1);
			this.processEnum(), this.tokens.appendCode(` exports.${e} = ${e};`);
		} else this.tokens.copyToken(), this.processEnum();
	}
	processDefaultExportEnum() {
		this.tokens.removeInitialToken(), this.tokens.removeToken();
		let e = this.tokens.identifierNameAtRelativeIndex(1);
		this.processEnum(), this.isImportsTransformEnabled ? this.tokens.appendCode(` exports.default = ${e};`) : this.tokens.appendCode(` export default ${e};`);
	}
	processEnum() {
		this.tokens.replaceToken("const"), this.tokens.copyExpectedToken(r.name);
		let e = !1;
		this.tokens.matchesContextual(n._of) && (this.tokens.removeToken(), e = this.tokens.matchesContextual(n._symbol), this.tokens.removeToken());
		let t = this.tokens.matches3(r.braceL, r.name, r.eq);
		this.tokens.appendCode(" = require(\"flow-enums-runtime\")");
		let i = !e && !t;
		for (this.tokens.replaceTokenTrimmingLeftWhitespace(i ? ".Mirrored([" : "({"); !this.tokens.matches1(r.braceR);) {
			if (this.tokens.matches1(r.ellipsis)) {
				this.tokens.removeToken();
				break;
			}
			this.processEnumElement(e, t), this.tokens.matches1(r.comma) && this.tokens.copyToken();
		}
		this.tokens.replaceToken(i ? "]);" : "});");
	}
	processEnumElement(e, t) {
		if (e) {
			let e = this.tokens.identifierName();
			this.tokens.copyToken(), this.tokens.appendCode(`: Symbol("${e}")`);
		} else t ? (this.tokens.copyToken(), this.tokens.replaceTokenTrimmingLeftWhitespace(":"), this.tokens.copyToken()) : this.tokens.replaceToken(`"${this.tokens.identifierName()}"`);
	}
};
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/transformers/JestHoistTransformer.js
function nc(e) {
	let t, n = e[0], r = 1;
	for (; r < e.length;) {
		let i = e[r], a = e[r + 1];
		if (r += 2, (i === "optionalAccess" || i === "optionalCall") && n == null) return;
		i === "access" || i === "optionalAccess" ? (t = n, n = a(n)) : (i === "call" || i === "optionalCall") && (n = a((...e) => n.call(t, ...e)), t = void 0);
	}
	return n;
}
var rc = "jest", ic = [
	"mock",
	"unmock",
	"enableAutomock",
	"disableAutomock"
], ac = class e extends R {
	__init() {
		this.hoistedFunctionNames = [];
	}
	constructor(t, n, r, i) {
		super(), this.rootTransformer = t, this.tokens = n, this.nameManager = r, this.importProcessor = i, e.prototype.__init.call(this);
	}
	process() {
		return this.tokens.currentToken().scopeDepth === 0 && this.tokens.matches4(r.name, r.dot, r.name, r.parenL) && this.tokens.identifierName() === rc ? nc([
			this,
			"access",
			(e) => e.importProcessor,
			"optionalAccess",
			(e) => e.getGlobalNames,
			"call",
			(e) => e(),
			"optionalAccess",
			(e) => e.has,
			"call",
			(e) => e(rc)
		]) ? !1 : this.extractHoistedCalls() : !1;
	}
	getHoistedCode() {
		return this.hoistedFunctionNames.length > 0 ? this.hoistedFunctionNames.map((e) => `${e}();`).join("") : "";
	}
	extractHoistedCalls() {
		this.tokens.removeToken();
		let e = !1;
		for (; this.tokens.matches3(r.dot, r.name, r.parenL);) {
			let t = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
			if (ic.includes(t)) {
				let t = this.nameManager.claimFreeName("__jestHoist");
				this.hoistedFunctionNames.push(t), this.tokens.replaceToken(`function ${t}(){${rc}.`), this.tokens.copyToken(), this.tokens.copyToken(), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.parenR), this.tokens.appendCode(";}"), e = !1;
			} else e ? this.tokens.copyToken() : this.tokens.replaceToken(`${rc}.`), this.tokens.copyToken(), this.tokens.copyToken(), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.parenR), e = !0;
		}
		return !0;
	}
}, oc = class extends R {
	constructor(e) {
		super(), this.tokens = e;
	}
	process() {
		if (this.tokens.matches1(r.num)) {
			let e = this.tokens.currentTokenCode();
			if (e.includes("_")) return this.tokens.replaceToken(e.replace(/_/g, "")), !0;
		}
		return !1;
	}
}, sc = class extends R {
	constructor(e, t) {
		super(), this.tokens = e, this.nameManager = t;
	}
	process() {
		return this.tokens.matches2(r._catch, r.braceL) ? (this.tokens.copyToken(), this.tokens.appendCode(` (${this.nameManager.claimFreeName("e")})`), !0) : !1;
	}
}, cc = class extends R {
	constructor(e, t) {
		super(), this.tokens = e, this.nameManager = t;
	}
	process() {
		if (this.tokens.matches1(r.nullishCoalescing)) {
			let e = this.tokens.currentToken();
			return this.tokens.tokens[e.nullishStartIndex].isAsyncOperation ? this.tokens.replaceTokenTrimmingLeftWhitespace(", async () => (") : this.tokens.replaceTokenTrimmingLeftWhitespace(", () => ("), !0;
		}
		if (this.tokens.matches1(r._delete) && this.tokens.tokenAtRelativeIndex(1).isOptionalChainStart) return this.tokens.removeInitialToken(), !0;
		let e = this.tokens.currentToken().subscriptStartIndex;
		if (e != null && this.tokens.tokens[e].isOptionalChainStart && this.tokens.tokenAtRelativeIndex(-1).type !== r._super) {
			let t = this.nameManager.claimFreeName("_"), n;
			if (n = e > 0 && this.tokens.matches1AtIndex(e - 1, r._delete) && this.isLastSubscriptInChain() ? `${t} => delete ${t}` : `${t} => ${t}`, this.tokens.tokens[e].isAsyncOperation && (n = `async ${n}`), this.tokens.matches2(r.questionDot, r.parenL) || this.tokens.matches2(r.questionDot, r.lessThan)) this.justSkippedSuper() && this.tokens.appendCode(".bind(this)"), this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'optionalCall', ${n}`);
			else if (this.tokens.matches2(r.questionDot, r.bracketL)) this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'optionalAccess', ${n}`);
			else if (this.tokens.matches1(r.questionDot)) this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'optionalAccess', ${n}.`);
			else if (this.tokens.matches1(r.dot)) this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'access', ${n}.`);
			else if (this.tokens.matches1(r.bracketL)) this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'access', ${n}[`);
			else if (this.tokens.matches1(r.parenL)) this.justSkippedSuper() && this.tokens.appendCode(".bind(this)"), this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'call', ${n}(`);
			else throw Error("Unexpected subscript operator in optional chain.");
			return !0;
		}
		return !1;
	}
	isLastSubscriptInChain() {
		let e = 0;
		for (let t = this.tokens.currentIndex() + 1;; t++) {
			if (t >= this.tokens.tokens.length) throw Error("Reached the end of the code while finding the end of the access chain.");
			if (this.tokens.tokens[t].isOptionalChainStart ? e++ : this.tokens.tokens[t].isOptionalChainEnd && e--, e < 0) return !0;
			if (e === 0 && this.tokens.tokens[t].subscriptStartIndex != null) return !1;
		}
	}
	justSkippedSuper() {
		let e = 0, t = this.tokens.currentIndex() - 1;
		for (;;) {
			if (t < 0) throw Error("Reached the start of the code while finding the start of the access chain.");
			if (this.tokens.tokens[t].isOptionalChainStart ? e-- : this.tokens.tokens[t].isOptionalChainEnd && e++, e < 0) return !1;
			if (e === 0 && this.tokens.tokens[t].subscriptStartIndex != null) return this.tokens.tokens[t - 1].type === r._super;
			t--;
		}
	}
}, lc = class extends R {
	constructor(e, t, n, r) {
		super(), this.rootTransformer = e, this.tokens = t, this.importProcessor = n, this.options = r;
	}
	process() {
		let e = this.tokens.currentIndex();
		if (this.tokens.identifierName() === "createReactClass") {
			let t = this.importProcessor && this.importProcessor.getIdentifierReplacement("createReactClass");
			return t ? this.tokens.replaceToken(`(0, ${t})`) : this.tokens.copyToken(), this.tryProcessCreateClassCall(e), !0;
		}
		if (this.tokens.matches3(r.name, r.dot, r.name) && this.tokens.identifierName() === "React" && this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 2) === "createClass") {
			let t = this.importProcessor && this.importProcessor.getIdentifierReplacement("React") || "React";
			return t ? (this.tokens.replaceToken(t), this.tokens.copyToken(), this.tokens.copyToken()) : (this.tokens.copyToken(), this.tokens.copyToken(), this.tokens.copyToken()), this.tryProcessCreateClassCall(e), !0;
		}
		return !1;
	}
	tryProcessCreateClassCall(e) {
		let t = this.findDisplayName(e);
		t && this.classNeedsDisplayName() && (this.tokens.copyExpectedToken(r.parenL), this.tokens.copyExpectedToken(r.braceL), this.tokens.appendCode(`displayName: '${t}',`), this.rootTransformer.processBalancedCode(), this.tokens.copyExpectedToken(r.braceR), this.tokens.copyExpectedToken(r.parenR));
	}
	findDisplayName(e) {
		return e < 2 ? null : this.tokens.matches2AtIndex(e - 2, r.name, r.eq) || e >= 2 && this.tokens.tokens[e - 2].identifierRole === D.ObjectKey ? this.tokens.identifierNameAtIndex(e - 2) : this.tokens.matches2AtIndex(e - 2, r._export, r._default) ? this.getDisplayNameFromFilename() : null;
	}
	getDisplayNameFromFilename() {
		let e = (this.options.filePath || "unknown").split("/"), t = e[e.length - 1], n = t.lastIndexOf("."), r = n === -1 ? t : t.slice(0, n);
		return r === "index" && e[e.length - 2] ? e[e.length - 2] : r;
	}
	classNeedsDisplayName() {
		let e = this.tokens.currentIndex();
		if (!this.tokens.matches2(r.parenL, r.braceL)) return !1;
		let t = e + 1, n = this.tokens.tokens[t].contextId;
		if (n == null) throw Error("Expected non-null context ID on object open-brace.");
		for (; e < this.tokens.tokens.length; e++) {
			let t = this.tokens.tokens[e];
			if (t.type === r.braceR && t.contextId === n) {
				e++;
				break;
			}
			if (this.tokens.identifierNameAtIndex(e) === "displayName" && this.tokens.tokens[e].identifierRole === D.ObjectKey && t.contextId === n) return !1;
		}
		if (e === this.tokens.tokens.length) throw Error("Unexpected end of input when processing React class.");
		return this.tokens.matches1AtIndex(e, r.parenR) || this.tokens.matches2AtIndex(e, r.comma, r.parenR);
	}
}, uc = class e extends R {
	__init() {
		this.extractedDefaultExportName = null;
	}
	constructor(t, n) {
		super(), this.tokens = t, this.filePath = n, e.prototype.__init.call(this);
	}
	setExtractedDefaultExportName(e) {
		this.extractedDefaultExportName = e;
	}
	getPrefixCode() {
		return "\n      (function () {\n        var enterModule = require('react-hot-loader').enterModule;\n        enterModule && enterModule(module);\n      })();".replace(/\s+/g, " ").trim();
	}
	getSuffixCode() {
		let e = /* @__PURE__ */ new Set();
		for (let t of this.tokens.tokens) !t.isType && me(t) && t.identifierRole !== D.ImportDeclaration && e.add(this.tokens.identifierNameForToken(t));
		let t = Array.from(e).map((e) => ({
			variableName: e,
			uniqueLocalName: e
		}));
		return this.extractedDefaultExportName && t.push({
			variableName: this.extractedDefaultExportName,
			uniqueLocalName: "default"
		}), `
;(function () {
  var reactHotLoader = require('react-hot-loader').default;
  var leaveModule = require('react-hot-loader').leaveModule;
  if (!reactHotLoader) {
    return;
  }
${t.map(({ variableName: e, uniqueLocalName: t }) => `  reactHotLoader.register(${e}, "${t}", ${JSON.stringify(this.filePath || "")});`).join("\n")}
  leaveModule(module);
})();`;
	}
	process() {
		return !1;
	}
}, dc = new Set(/* @__PURE__ */ "break.case.catch.class.const.continue.debugger.default.delete.do.else.export.extends.finally.for.function.if.import.in.instanceof.new.return.super.switch.this.throw.try.typeof.var.void.while.with.yield.enum.implements.interface.let.package.private.protected.public.static.await.false.null.true".split("."));
function fc(e) {
	if (e.length === 0 || !le[e.charCodeAt(0)]) return !1;
	for (let t = 1; t < e.length; t++) if (!E[e.charCodeAt(t)]) return !1;
	return !dc.has(e);
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/transformers/TypeScriptTransformer.js
var pc = class extends R {
	constructor(e, t, n) {
		super(), this.rootTransformer = e, this.tokens = t, this.isImportsTransformEnabled = n;
	}
	process() {
		return this.rootTransformer.processPossibleArrowParamEnd() || this.rootTransformer.processPossibleAsyncArrowWithTypeParams() || this.rootTransformer.processPossibleTypeRange() ? !0 : this.tokens.matches1(r._public) || this.tokens.matches1(r._protected) || this.tokens.matches1(r._private) || this.tokens.matches1(r._abstract) || this.tokens.matches1(r._readonly) || this.tokens.matches1(r._override) || this.tokens.matches1(r.nonNullAssertion) ? (this.tokens.removeInitialToken(), !0) : this.tokens.matches1(r._enum) || this.tokens.matches2(r._const, r._enum) ? (this.processEnum(), !0) : this.tokens.matches2(r._export, r._enum) || this.tokens.matches3(r._export, r._const, r._enum) ? (this.processEnum(!0), !0) : !1;
	}
	processEnum(e = !1) {
		for (this.tokens.removeInitialToken(); this.tokens.matches1(r._const) || this.tokens.matches1(r._enum);) this.tokens.removeToken();
		let t = this.tokens.identifierName();
		this.tokens.removeToken(), e && !this.isImportsTransformEnabled && this.tokens.appendCode("export "), this.tokens.appendCode(`var ${t}; (function (${t})`), this.tokens.copyExpectedToken(r.braceL), this.processEnumBody(t), this.tokens.copyExpectedToken(r.braceR), e && this.isImportsTransformEnabled ? this.tokens.appendCode(`)(${t} || (exports.${t} = ${t} = {}));`) : this.tokens.appendCode(`)(${t} || (${t} = {}));`);
	}
	processEnumBody(e) {
		let t = null;
		for (; !this.tokens.matches1(r.braceR);) {
			let { nameStringCode: n, variableName: i } = this.extractEnumKeyInfo(this.tokens.currentToken());
			this.tokens.removeInitialToken(), this.tokens.matches3(r.eq, r.string, r.comma) || this.tokens.matches3(r.eq, r.string, r.braceR) ? this.processStringLiteralEnumMember(e, n, i) : this.tokens.matches1(r.eq) ? this.processExplicitValueEnumMember(e, n, i) : this.processImplicitValueEnumMember(e, n, i, t), this.tokens.matches1(r.comma) && this.tokens.removeToken(), t = i ?? `${e}[${n}]`;
		}
	}
	extractEnumKeyInfo(e) {
		if (e.type === r.name) {
			let t = this.tokens.identifierNameForToken(e);
			return {
				nameStringCode: `"${t}"`,
				variableName: fc(t) ? t : null
			};
		} else if (e.type === r.string) {
			let t = this.tokens.stringValueForToken(e);
			return {
				nameStringCode: this.tokens.code.slice(e.start, e.end),
				variableName: fc(t) ? t : null
			};
		} else throw Error("Expected name or string at beginning of enum element.");
	}
	processStringLiteralEnumMember(e, t, n) {
		n == null ? (this.tokens.appendCode(`${e}[${t}]`), this.tokens.copyToken(), this.tokens.copyToken(), this.tokens.appendCode(";")) : (this.tokens.appendCode(`const ${n}`), this.tokens.copyToken(), this.tokens.copyToken(), this.tokens.appendCode(`; ${e}[${t}] = ${n};`));
	}
	processExplicitValueEnumMember(e, t, n) {
		let r = this.tokens.currentToken().rhsEndIndex;
		if (r == null) throw Error("Expected rhsEndIndex on enum assign.");
		if (n != null) {
			for (this.tokens.appendCode(`const ${n}`), this.tokens.copyToken(); this.tokens.currentIndex() < r;) this.rootTransformer.processToken();
			this.tokens.appendCode(`; ${e}[${e}[${t}] = ${n}] = ${t};`);
		} else {
			for (this.tokens.appendCode(`${e}[${e}[${t}]`), this.tokens.copyToken(); this.tokens.currentIndex() < r;) this.rootTransformer.processToken();
			this.tokens.appendCode(`] = ${t};`);
		}
	}
	processImplicitValueEnumMember(e, t, n, r) {
		let i = r == null ? "0" : `${r} + 1`;
		n != null && (this.tokens.appendCode(`const ${n} = ${i}; `), i = n), this.tokens.appendCode(`${e}[${e}[${t}] = ${i}] = ${t};`);
	}
}, mc = class e {
	__init() {
		this.transformers = [];
	}
	__init2() {
		this.generatedVariables = [];
	}
	constructor(t, n, r, i) {
		e.prototype.__init.call(this), e.prototype.__init2.call(this), this.nameManager = t.nameManager, this.helperManager = t.helperManager;
		let { tokenProcessor: a, importProcessor: o } = t;
		this.tokens = a, this.isImportsTransformEnabled = n.includes("imports"), this.isReactHotLoaderTransformEnabled = n.includes("react-hot-loader"), this.disableESTransforms = !!i.disableESTransforms, i.disableESTransforms || (this.transformers.push(new cc(a, this.nameManager)), this.transformers.push(new oc(a)), this.transformers.push(new sc(a, this.nameManager))), n.includes("jsx") && (i.jsxRuntime !== "preserve" && this.transformers.push(new tt(this, a, o, this.nameManager, i)), this.transformers.push(new lc(this, a, o, i)));
		let s = null;
		if (n.includes("react-hot-loader")) {
			if (!i.filePath) throw Error("filePath is required when using the react-hot-loader transform.");
			s = new uc(a, i.filePath), this.transformers.push(s);
		}
		if (n.includes("imports")) {
			if (o === null) throw Error("Expected non-null importProcessor with imports transform enabled.");
			this.transformers.push(new $s(this, a, o, this.nameManager, this.helperManager, s, r, !!i.enableLegacyTypeScriptModuleInterop, n.includes("typescript"), n.includes("flow"), !!i.preserveDynamicImport, !!i.keepUnusedImports));
		} else this.transformers.push(new ec(a, this.nameManager, this.helperManager, s, n.includes("typescript"), n.includes("flow"), !!i.keepUnusedImports, i));
		n.includes("flow") && this.transformers.push(new tc(this, a, n.includes("imports"))), n.includes("typescript") && this.transformers.push(new pc(this, a, n.includes("imports"))), n.includes("jest") && this.transformers.push(new ac(this, a, this.nameManager, o));
	}
	transform() {
		this.tokens.reset(), this.processBalancedCode();
		let e = this.isImportsTransformEnabled ? "\"use strict\";" : "";
		for (let t of this.transformers) e += t.getPrefixCode();
		e += this.helperManager.emitHelpers(), e += this.generatedVariables.map((e) => ` var ${e};`).join("");
		for (let t of this.transformers) e += t.getHoistedCode();
		let t = "";
		for (let e of this.transformers) t += e.getSuffixCode();
		let n = this.tokens.finish(), { code: r } = n;
		if (r.startsWith("#!")) {
			let i = r.indexOf("\n");
			return i === -1 && (i = r.length, r += "\n"), {
				code: r.slice(0, i + 1) + e + r.slice(i + 1) + t,
				mappings: this.shiftMappings(n.mappings, e.length)
			};
		} else return {
			code: e + r + t,
			mappings: this.shiftMappings(n.mappings, e.length)
		};
	}
	processBalancedCode() {
		let e = 0, t = 0;
		for (; !this.tokens.isAtEnd();) {
			if (this.tokens.matches1(r.braceL) || this.tokens.matches1(r.dollarBraceL)) e++;
			else if (this.tokens.matches1(r.braceR)) {
				if (e === 0) return;
				e--;
			}
			if (this.tokens.matches1(r.parenL)) t++;
			else if (this.tokens.matches1(r.parenR)) {
				if (t === 0) return;
				t--;
			}
			this.processToken();
		}
	}
	processToken() {
		if (this.tokens.matches1(r._class)) {
			this.processClass();
			return;
		}
		for (let e of this.transformers) if (e.process()) return;
		this.tokens.copyToken();
	}
	processNamedClass() {
		if (!this.tokens.matches2(r._class, r.name)) throw Error("Expected identifier for exported class name.");
		let e = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
		return this.processClass(), e;
	}
	processClass() {
		let e = Vs(this, this.tokens, this.nameManager, this.disableESTransforms), t = (e.headerInfo.isExpression || !e.headerInfo.className) && e.staticInitializerNames.length + e.instanceInitializerNames.length > 0, n = e.headerInfo.className;
		t && (n = this.nameManager.claimFreeName("_class"), this.generatedVariables.push(n), this.tokens.appendCode(` (${n} =`));
		let i = this.tokens.currentToken().contextId;
		if (i == null) throw Error("Expected class to have a context ID.");
		for (this.tokens.copyExpectedToken(r._class); !this.tokens.matchesContextIdAndLabel(r.braceL, i);) this.processToken();
		this.processClassBody(e, n);
		let a = e.staticInitializerNames.map((e) => `${n}.${e}()`);
		t ? this.tokens.appendCode(`, ${a.map((e) => `${e}, `).join("")}${n})`) : e.staticInitializerNames.length > 0 && this.tokens.appendCode(` ${a.map((e) => `${e};`).join(" ")}`);
	}
	processClassBody(e, t) {
		let { headerInfo: n, constructorInsertPos: i, constructorInitializerStatements: a, fields: o, instanceInitializerNames: s, rangesToRemove: c } = e, l = 0, u = 0, d = this.tokens.currentToken().contextId;
		if (d == null) throw Error("Expected non-null context ID on class.");
		this.tokens.copyExpectedToken(r.braceL), this.isReactHotLoaderTransformEnabled && this.tokens.appendCode("__reactstandin__regenerateByEval(key, code) {this[key] = eval(code);}");
		let f = a.length + s.length > 0;
		if (i === null && f) {
			let e = this.makeConstructorInitCode(a, s, t);
			if (n.hasSuperclass) {
				let t = this.nameManager.claimFreeName("args");
				this.tokens.appendCode(`constructor(...${t}) { super(...${t}); ${e}; }`);
			} else this.tokens.appendCode(`constructor() { ${e}; }`);
		}
		for (; !this.tokens.matchesContextIdAndLabel(r.braceR, d);) if (l < o.length && this.tokens.currentIndex() === o[l].start) {
			let e = !1;
			for (this.tokens.matches1(r.bracketL) ? this.tokens.copyTokenWithPrefix(`${o[l].initializerName}() {this`) : this.tokens.matches1(r.string) || this.tokens.matches1(r.num) ? (this.tokens.copyTokenWithPrefix(`${o[l].initializerName}() {this[`), e = !0) : this.tokens.copyTokenWithPrefix(`${o[l].initializerName}() {this.`); this.tokens.currentIndex() < o[l].end;) e && this.tokens.currentIndex() === o[l].equalsIndex && this.tokens.appendCode("]"), this.processToken();
			this.tokens.appendCode("}"), l++;
		} else if (u < c.length && this.tokens.currentIndex() >= c[u].start) {
			for (this.tokens.currentIndex() < c[u].end && this.tokens.removeInitialToken(); this.tokens.currentIndex() < c[u].end;) this.tokens.removeToken();
			u++;
		} else this.tokens.currentIndex() === i ? (this.tokens.copyToken(), f && this.tokens.appendCode(`;${this.makeConstructorInitCode(a, s, t)};`), this.processToken()) : this.processToken();
		this.tokens.copyExpectedToken(r.braceR);
	}
	makeConstructorInitCode(e, t, n) {
		return [...e, ...t.map((e) => `${n}.prototype.${e}.call(this)`)].join(";");
	}
	processPossibleArrowParamEnd() {
		if (this.tokens.matches2(r.parenR, r.colon) && this.tokens.tokenAtRelativeIndex(1).isType) {
			let e = this.tokens.currentIndex() + 1;
			for (; this.tokens.tokens[e].isType;) e++;
			if (this.tokens.matches1AtIndex(e, r.arrow)) {
				for (this.tokens.removeInitialToken(); this.tokens.currentIndex() < e;) this.tokens.removeToken();
				return this.tokens.replaceTokenTrimmingLeftWhitespace(") =>"), !0;
			}
		}
		return !1;
	}
	processPossibleAsyncArrowWithTypeParams() {
		if (!this.tokens.matchesContextual(n._async) && !this.tokens.matches1(r._async)) return !1;
		let e = this.tokens.tokenAtRelativeIndex(1);
		if (e.type !== r.lessThan || !e.isType) return !1;
		let t = this.tokens.currentIndex() + 1;
		for (; this.tokens.tokens[t].isType;) t++;
		if (this.tokens.matches1AtIndex(t, r.parenL)) {
			for (this.tokens.replaceToken("async ("), this.tokens.removeInitialToken(); this.tokens.currentIndex() < t;) this.tokens.removeToken();
			return this.tokens.removeToken(), this.processBalancedCode(), this.processToken(), !0;
		}
		return !1;
	}
	processPossibleTypeRange() {
		if (this.tokens.currentToken().isType) {
			for (this.tokens.removeInitialToken(); this.tokens.currentToken().isType;) this.tokens.removeToken();
			return !0;
		}
		return !1;
	}
	shiftMappings(e, t) {
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			r !== void 0 && (e[n] = r + t);
		}
		return e;
	}
};
(/* @__PURE__ */ t(((e) => {
	e.__esModule = !0, e.LinesAndColumns = void 0;
	var t = "\n", n = "\r";
	e.LinesAndColumns = function() {
		function e(e) {
			this.string = e;
			for (var r = [0], i = 0; i < e.length;) switch (e[i]) {
				case t:
					i += t.length, r.push(i);
					break;
				case n:
					i += n.length, e[i] === t && (i += t.length), r.push(i);
					break;
				default:
					i++;
					break;
			}
			this.offsets = r;
		}
		return e.prototype.locationForIndex = function(e) {
			if (e < 0 || e > this.string.length) return null;
			for (var t = 0, n = this.offsets; n[t + 1] <= e;) t++;
			var r = e - n[t];
			return {
				line: t,
				column: r
			};
		}, e.prototype.indexForLocation = function(e) {
			var t = e.line, n = e.column;
			return t < 0 || t >= this.offsets.length || n < 0 || n > this.lengthOfLine(t) ? null : this.offsets[t] + n;
		}, e.prototype.lengthOfLine = function(e) {
			var t = this.offsets[e];
			return (e === this.offsets.length - 1 ? this.string.length : this.offsets[e + 1]) - t;
		}, e;
	}();
})))();
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/util/getTSImportedNames.js
function hc(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n = 0; n < e.tokens.length; n++) e.matches1AtIndex(n, r._import) && !e.matches3AtIndex(n, r._import, r.name, r.eq) && gc(e, n, t);
	return t;
}
function gc(e, t, n) {
	t++, !e.matches1AtIndex(t, r.parenL) && (e.matches1AtIndex(t, r.name) && (n.add(e.identifierNameAtIndex(t)), t++, e.matches1AtIndex(t, r.comma) && t++), e.matches1AtIndex(t, r.star) && (t += 2, n.add(e.identifierNameAtIndex(t)), t++), e.matches1AtIndex(t, r.braceL) && (t++, _c(e, t, n)));
}
function _c(e, t, n) {
	for (;;) {
		if (e.matches1AtIndex(t, r.braceR)) return;
		let i = Xe(e, t);
		if (t = i.endIndex, i.isType || n.add(i.rightName), e.matches2AtIndex(t, r.comma, r.braceR) || e.matches1AtIndex(t, r.braceR)) return;
		if (e.matches1AtIndex(t, r.comma)) t++;
		else throw Error(`Unexpected token: ${JSON.stringify(e.tokens[t])}`);
	}
}
//#endregion
//#region node_modules/.pnpm/sucrase@3.35.1/node_modules/sucrase/dist/esm/index.js
function vc(e, t) {
	rn(t);
	try {
		let n = yc(e, t), r = new mc(n, t.transforms, !!t.enableLegacyBabel5ModuleInterop, t).transform(), i = { code: r.code };
		if (t.sourceMapOptions) {
			if (!t.filePath) throw Error("filePath must be specified when generating a source map.");
			i = {
				...i,
				sourceMap: Ut(r, t.filePath, t.sourceMapOptions, e, n.tokenProcessor.tokens)
			};
		}
		return i;
	} catch (e) {
		throw t.filePath && (e.message = `Error transforming ${t.filePath}: ${e.message}`), e;
	}
}
function yc(e, t) {
	let n = t.transforms.includes("jsx"), r = t.transforms.includes("typescript"), i = t.transforms.includes("flow"), a = t.disableESTransforms === !0, o = Rs(e, n, r, i), s = o.tokens, c = o.scopes, l = new Qt(e, s), u = new Kt(l), d = new Bs(e, s, i, a, u), f = !!t.enableLegacyTypeScriptModuleInterop, p = null;
	return t.transforms.includes("imports") ? (p = new ut(l, d, f, t, t.transforms.includes("typescript"), !!t.keepUnusedImports, u), p.preprocessTokens(), qt(d, c, p.getGlobalNames()), t.transforms.includes("typescript") && !t.keepUnusedImports && p.pruneTypeOnlyImports()) : t.transforms.includes("typescript") && !t.keepUnusedImports && qt(d, c, hc(d)), {
		tokenProcessor: d,
		scopes: c,
		nameManager: l,
		importProcessor: p,
		helperManager: u
	};
}
//#endregion
export { vc as transform };
