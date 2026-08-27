//#region node_modules/.pnpm/astring@1.9.0/node_modules/astring/dist/astring.mjs
var { stringify: e } = JSON;
/* c8 ignore if */
if (!String.prototype.repeat)
 /* c8 ignore next */
throw Error("String.prototype.repeat is undefined, see https://github.com/davidbonnet/astring#installation");
/* c8 ignore if */
if (!String.prototype.endsWith)
 /* c8 ignore next */
throw Error("String.prototype.endsWith is undefined, see https://github.com/davidbonnet/astring#installation");
var t = {
	"||": 2,
	"??": 3,
	"&&": 4,
	"|": 5,
	"^": 6,
	"&": 7,
	"==": 8,
	"!=": 8,
	"===": 8,
	"!==": 8,
	"<": 9,
	">": 9,
	"<=": 9,
	">=": 9,
	in: 9,
	instanceof: 9,
	"<<": 10,
	">>": 10,
	">>>": 10,
	"+": 11,
	"-": 11,
	"*": 12,
	"%": 12,
	"/": 12,
	"**": 13
}, n = {
	ArrayExpression: 20,
	TaggedTemplateExpression: 20,
	ThisExpression: 20,
	Identifier: 20,
	PrivateIdentifier: 20,
	Literal: 18,
	TemplateLiteral: 20,
	Super: 20,
	SequenceExpression: 20,
	MemberExpression: 19,
	ChainExpression: 19,
	CallExpression: 19,
	NewExpression: 19,
	ArrowFunctionExpression: 17,
	ClassExpression: 17,
	FunctionExpression: 17,
	ObjectExpression: 17,
	UpdateExpression: 16,
	UnaryExpression: 15,
	AwaitExpression: 15,
	BinaryExpression: 14,
	LogicalExpression: 13,
	ConditionalExpression: 4,
	AssignmentExpression: 3,
	YieldExpression: 2,
	RestElement: 1
};
function r(e, t) {
	let { generator: n } = e;
	if (e.write("("), t != null && t.length > 0) {
		n[t[0].type](t[0], e);
		let { length: r } = t;
		for (let i = 1; i < r; i++) {
			let r = t[i];
			e.write(", "), n[r.type](r, e);
		}
	}
	e.write(")");
}
function i(e, n, r, i) {
	let a = e.expressionsPrecedence[n.type];
	if (a === 17) return !0;
	let o = e.expressionsPrecedence[r.type];
	return a === o ? a !== 13 && a !== 14 ? !1 : n.operator === "**" && r.operator === "**" ? !i : a === 13 && o === 13 && (n.operator === "??" || r.operator === "??") ? !0 : i ? t[n.operator] <= t[r.operator] : t[n.operator] < t[r.operator] : !i && a === 15 && o === 14 && r.operator === "**" || a < o;
}
function a(e, t, n, r) {
	let { generator: a } = e;
	i(e, t, n, r) ? (e.write("("), a[t.type](t, e), e.write(")")) : a[t.type](t, e);
}
function o(e, t, n, r) {
	let i = t.split("\n"), a = i.length - 1;
	if (e.write(i[0].trim()), a > 0) {
		e.write(r);
		for (let t = 1; t < a; t++) e.write(n + i[t].trim() + r);
		e.write(n + i[a].trim());
	}
}
function s(e, t, n, r) {
	let { length: i } = t;
	for (let a = 0; a < i; a++) {
		let i = t[a];
		e.write(n), i.type[0] === "L" ? e.write("// " + i.value.trim() + "\n", i) : (e.write("/*"), o(e, i.value, n, r), e.write("*/" + r));
	}
}
function c(e) {
	let t = e;
	for (; t != null;) {
		let { type: e } = t;
		if (e[0] === "C" && e[1] === "a") return !0;
		if (e[0] === "M" && e[1] === "e" && e[2] === "m") t = t.object;
		else return !1;
	}
}
function l(e, t) {
	let { generator: n } = e, { declarations: r } = t;
	e.write(t.kind + " ");
	let { length: i } = r;
	if (i > 0) {
		n.VariableDeclarator(r[0], e);
		for (let t = 1; t < i; t++) e.write(", "), n.VariableDeclarator(r[t], e);
	}
}
var u, d, f, p, m, h, g = {
	Program(e, t) {
		let n = t.indent.repeat(t.indentLevel), { lineEnd: r, writeComments: i } = t;
		i && e.comments != null && s(t, e.comments, n, r);
		let a = e.body, { length: o } = a;
		for (let e = 0; e < o; e++) {
			let o = a[e];
			i && o.comments != null && s(t, o.comments, n, r), t.write(n), this[o.type](o, t), t.write(r);
		}
		i && e.trailingComments != null && s(t, e.trailingComments, n, r);
	},
	BlockStatement: h = function(e, t) {
		let n = t.indent.repeat(t.indentLevel++), { lineEnd: r, writeComments: i } = t, a = n + t.indent;
		t.write("{");
		let o = e.body;
		if (o != null && o.length > 0) {
			t.write(r), i && e.comments != null && s(t, e.comments, a, r);
			let { length: c } = o;
			for (let e = 0; e < c; e++) {
				let n = o[e];
				i && n.comments != null && s(t, n.comments, a, r), t.write(a), this[n.type](n, t), t.write(r);
			}
			t.write(n);
		} else i && e.comments != null && (t.write(r), s(t, e.comments, a, r), t.write(n));
		i && e.trailingComments != null && s(t, e.trailingComments, a, r), t.write("}"), t.indentLevel--;
	},
	ClassBody: h,
	StaticBlock(e, t) {
		t.write("static "), this.BlockStatement(e, t);
	},
	EmptyStatement(e, t) {
		t.write(";");
	},
	ExpressionStatement(e, t) {
		let n = t.expressionsPrecedence[e.expression.type];
		n === 17 || n === 3 && e.expression.left.type[0] === "O" ? (t.write("("), this[e.expression.type](e.expression, t), t.write(")")) : this[e.expression.type](e.expression, t), t.write(";");
	},
	IfStatement(e, t) {
		t.write("if ("), this[e.test.type](e.test, t), t.write(") "), this[e.consequent.type](e.consequent, t), e.alternate != null && (t.write(" else "), this[e.alternate.type](e.alternate, t));
	},
	LabeledStatement(e, t) {
		this[e.label.type](e.label, t), t.write(": "), this[e.body.type](e.body, t);
	},
	BreakStatement(e, t) {
		t.write("break"), e.label != null && (t.write(" "), this[e.label.type](e.label, t)), t.write(";");
	},
	ContinueStatement(e, t) {
		t.write("continue"), e.label != null && (t.write(" "), this[e.label.type](e.label, t)), t.write(";");
	},
	WithStatement(e, t) {
		t.write("with ("), this[e.object.type](e.object, t), t.write(") "), this[e.body.type](e.body, t);
	},
	SwitchStatement(e, t) {
		let n = t.indent.repeat(t.indentLevel++), { lineEnd: r, writeComments: i } = t;
		t.indentLevel++;
		let a = n + t.indent, o = a + t.indent;
		t.write("switch ("), this[e.discriminant.type](e.discriminant, t), t.write(") {" + r);
		let { cases: c } = e, { length: l } = c;
		for (let e = 0; e < l; e++) {
			let n = c[e];
			i && n.comments != null && s(t, n.comments, a, r), n.test ? (t.write(a + "case "), this[n.test.type](n.test, t), t.write(":" + r)) : t.write(a + "default:" + r);
			let { consequent: l } = n, { length: u } = l;
			for (let e = 0; e < u; e++) {
				let n = l[e];
				i && n.comments != null && s(t, n.comments, o, r), t.write(o), this[n.type](n, t), t.write(r);
			}
		}
		t.indentLevel -= 2, t.write(n + "}");
	},
	ReturnStatement(e, t) {
		t.write("return"), e.argument && (t.write(" "), this[e.argument.type](e.argument, t)), t.write(";");
	},
	ThrowStatement(e, t) {
		t.write("throw "), this[e.argument.type](e.argument, t), t.write(";");
	},
	TryStatement(e, t) {
		if (t.write("try "), this[e.block.type](e.block, t), e.handler) {
			let { handler: n } = e;
			n.param == null ? t.write(" catch ") : (t.write(" catch ("), this[n.param.type](n.param, t), t.write(") ")), this[n.body.type](n.body, t);
		}
		e.finalizer && (t.write(" finally "), this[e.finalizer.type](e.finalizer, t));
	},
	WhileStatement(e, t) {
		t.write("while ("), this[e.test.type](e.test, t), t.write(") "), this[e.body.type](e.body, t);
	},
	DoWhileStatement(e, t) {
		t.write("do "), this[e.body.type](e.body, t), t.write(" while ("), this[e.test.type](e.test, t), t.write(");");
	},
	ForStatement(e, t) {
		if (t.write("for ("), e.init != null) {
			let { init: n } = e;
			n.type[0] === "V" ? l(t, n) : this[n.type](n, t);
		}
		t.write("; "), e.test && this[e.test.type](e.test, t), t.write("; "), e.update && this[e.update.type](e.update, t), t.write(") "), this[e.body.type](e.body, t);
	},
	ForInStatement: u = function(e, t) {
		t.write(`for ${e.await ? "await " : ""}(`);
		let { left: n } = e;
		n.type[0] === "V" ? l(t, n) : this[n.type](n, t), t.write(e.type[3] === "I" ? " in " : " of "), this[e.right.type](e.right, t), t.write(") "), this[e.body.type](e.body, t);
	},
	ForOfStatement: u,
	DebuggerStatement(e, t) {
		t.write("debugger;", e);
	},
	FunctionDeclaration: d = function(e, t) {
		t.write((e.async ? "async " : "") + (e.generator ? "function* " : "function ") + (e.id ? e.id.name : ""), e), r(t, e.params), t.write(" "), this[e.body.type](e.body, t);
	},
	FunctionExpression: d,
	VariableDeclaration(e, t) {
		l(t, e), t.write(";");
	},
	VariableDeclarator(e, t) {
		this[e.id.type](e.id, t), e.init != null && (t.write(" = "), this[e.init.type](e.init, t));
	},
	ClassDeclaration(e, t) {
		if (t.write("class " + (e.id ? `${e.id.name} ` : ""), e), e.superClass) {
			t.write("extends ");
			let { superClass: n } = e, { type: r } = n, i = t.expressionsPrecedence[r];
			(r[0] !== "C" || r[1] !== "l" || r[5] !== "E") && (i === 17 || i < t.expressionsPrecedence.ClassExpression) ? (t.write("("), this[e.superClass.type](n, t), t.write(")")) : this[n.type](n, t), t.write(" ");
		}
		this.ClassBody(e.body, t);
	},
	ImportDeclaration(e, t) {
		t.write("import ");
		let { specifiers: n, attributes: r } = e, { length: i } = n, a = 0;
		if (i > 0) {
			for (; a < i;) {
				a > 0 && t.write(", ");
				let e = n[a], r = e.type[6];
				if (r === "D") t.write(e.local.name, e), a++;
				else if (r === "N") t.write("* as " + e.local.name, e), a++;
				else break;
			}
			if (a < i) {
				for (t.write("{");;) {
					let e = n[a], { name: r } = e.imported;
					if (t.write(r, e), r !== e.local.name && t.write(" as " + e.local.name), ++a < i) t.write(", ");
					else break;
				}
				t.write("}");
			}
			t.write(" from ");
		}
		if (this.Literal(e.source, t), r && r.length > 0) {
			t.write(" with { ");
			for (let e = 0; e < r.length; e++) this.ImportAttribute(r[e], t), e < r.length - 1 && t.write(", ");
			t.write(" }");
		}
		t.write(";");
	},
	ImportAttribute(e, t) {
		this.Identifier(e.key, t), t.write(": "), this.Literal(e.value, t);
	},
	ImportExpression(e, t) {
		t.write("import("), this[e.source.type](e.source, t), t.write(")");
	},
	ExportDefaultDeclaration(e, t) {
		t.write("export default "), this[e.declaration.type](e.declaration, t), t.expressionsPrecedence[e.declaration.type] != null && e.declaration.type[0] !== "F" && t.write(";");
	},
	ExportNamedDeclaration(e, t) {
		if (t.write("export "), e.declaration) this[e.declaration.type](e.declaration, t);
		else {
			t.write("{");
			let { specifiers: n } = e, { length: r } = n;
			if (r > 0) for (let e = 0;;) {
				let i = n[e], { name: a } = i.local;
				if (t.write(a, i), a !== i.exported.name && t.write(" as " + i.exported.name), ++e < r) t.write(", ");
				else break;
			}
			if (t.write("}"), e.source && (t.write(" from "), this.Literal(e.source, t)), e.attributes && e.attributes.length > 0) {
				t.write(" with { ");
				for (let n = 0; n < e.attributes.length; n++) this.ImportAttribute(e.attributes[n], t), n < e.attributes.length - 1 && t.write(", ");
				t.write(" }");
			}
			t.write(";");
		}
	},
	ExportAllDeclaration(e, t) {
		if (e.exported == null ? t.write("export * from ") : t.write("export * as " + e.exported.name + " from "), this.Literal(e.source, t), e.attributes && e.attributes.length > 0) {
			t.write(" with { ");
			for (let n = 0; n < e.attributes.length; n++) this.ImportAttribute(e.attributes[n], t), n < e.attributes.length - 1 && t.write(", ");
			t.write(" }");
		}
		t.write(";");
	},
	MethodDefinition(e, t) {
		e.static && t.write("static ");
		let n = e.kind[0];
		(n === "g" || n === "s") && t.write(e.kind + " "), e.value.async && t.write("async "), e.value.generator && t.write("*"), e.computed ? (t.write("["), this[e.key.type](e.key, t), t.write("]")) : this[e.key.type](e.key, t), r(t, e.value.params), t.write(" "), this[e.value.body.type](e.value.body, t);
	},
	ClassExpression(e, t) {
		this.ClassDeclaration(e, t);
	},
	ArrowFunctionExpression(e, t) {
		t.write(e.async ? "async " : "", e);
		let { params: n } = e;
		n != null && (n.length === 1 && n[0].type[0] === "I" ? t.write(n[0].name, n[0]) : r(t, e.params)), t.write(" => "), e.body.type[0] === "O" ? (t.write("("), this.ObjectExpression(e.body, t), t.write(")")) : this[e.body.type](e.body, t);
	},
	ThisExpression(e, t) {
		t.write("this", e);
	},
	Super(e, t) {
		t.write("super", e);
	},
	RestElement: f = function(e, t) {
		t.write("..."), this[e.argument.type](e.argument, t);
	},
	SpreadElement: f,
	YieldExpression(e, t) {
		t.write(e.delegate ? "yield*" : "yield"), e.argument && (t.write(" "), this[e.argument.type](e.argument, t));
	},
	AwaitExpression(e, t) {
		t.write("await ", e), a(t, e.argument, e);
	},
	TemplateLiteral(e, t) {
		let { quasis: n, expressions: r } = e;
		t.write("`");
		let { length: i } = r;
		for (let e = 0; e < i; e++) {
			let i = r[e], a = n[e];
			t.write(a.value.raw, a), t.write("${"), this[i.type](i, t), t.write("}");
		}
		let a = n[n.length - 1];
		t.write(a.value.raw, a), t.write("`");
	},
	TemplateElement(e, t) {
		t.write(e.value.raw, e);
	},
	TaggedTemplateExpression(e, t) {
		a(t, e.tag, e), this[e.quasi.type](e.quasi, t);
	},
	ArrayExpression: m = function(e, t) {
		if (t.write("["), e.elements.length > 0) {
			let { elements: n } = e, { length: r } = n;
			for (let e = 0;;) {
				let i = n[e];
				if (i != null && this[i.type](i, t), ++e < r) t.write(", ");
				else {
					i ?? t.write(", ");
					break;
				}
			}
		}
		t.write("]");
	},
	ArrayPattern: m,
	ObjectExpression(e, t) {
		let n = t.indent.repeat(t.indentLevel++), { lineEnd: r, writeComments: i } = t, a = n + t.indent;
		if (t.write("{"), e.properties.length > 0) {
			t.write(r), i && e.comments != null && s(t, e.comments, a, r);
			let o = "," + r, { properties: c } = e, { length: l } = c;
			for (let e = 0;;) {
				let n = c[e];
				if (i && n.comments != null && s(t, n.comments, a, r), t.write(a), this[n.type](n, t), ++e < l) t.write(o);
				else break;
			}
			t.write(r), i && e.trailingComments != null && s(t, e.trailingComments, a, r), t.write(n + "}");
		} else i ? e.comments == null ? e.trailingComments == null ? t.write("}") : (t.write(r), s(t, e.trailingComments, a, r), t.write(n + "}")) : (t.write(r), s(t, e.comments, a, r), e.trailingComments != null && s(t, e.trailingComments, a, r), t.write(n + "}")) : t.write("}");
		t.indentLevel--;
	},
	Property(e, t) {
		e.method || e.kind[0] !== "i" ? this.MethodDefinition(e, t) : (e.shorthand || (e.computed ? (t.write("["), this[e.key.type](e.key, t), t.write("]")) : this[e.key.type](e.key, t), t.write(": ")), this[e.value.type](e.value, t));
	},
	PropertyDefinition(e, t) {
		if (e.static && t.write("static "), e.computed && t.write("["), this[e.key.type](e.key, t), e.computed && t.write("]"), e.value == null) {
			e.key.type[0] !== "F" && t.write(";");
			return;
		}
		t.write(" = "), this[e.value.type](e.value, t), t.write(";");
	},
	ObjectPattern(e, t) {
		if (t.write("{"), e.properties.length > 0) {
			let { properties: n } = e, { length: r } = n;
			for (let e = 0; this[n[e].type](n[e], t), ++e < r;) t.write(", ");
		}
		t.write("}");
	},
	SequenceExpression(e, t) {
		r(t, e.expressions);
	},
	UnaryExpression(e, t) {
		if (e.prefix) {
			let { operator: n, argument: r, argument: { type: a } } = e;
			t.write(n);
			let o = i(t, r, e);
			!o && (n.length > 1 || a[0] === "U" && (a[1] === "n" || a[1] === "p") && r.prefix && r.operator[0] === n && (n === "+" || n === "-")) && t.write(" "), o ? (t.write(n.length > 1 ? " (" : "("), this[a](r, t), t.write(")")) : this[a](r, t);
		} else this[e.argument.type](e.argument, t), t.write(e.operator);
	},
	UpdateExpression(e, t) {
		e.prefix ? (t.write(e.operator), this[e.argument.type](e.argument, t)) : (this[e.argument.type](e.argument, t), t.write(e.operator));
	},
	AssignmentExpression(e, t) {
		this[e.left.type](e.left, t), t.write(" " + e.operator + " "), this[e.right.type](e.right, t);
	},
	AssignmentPattern(e, t) {
		this[e.left.type](e.left, t), t.write(" = "), this[e.right.type](e.right, t);
	},
	BinaryExpression: p = function(e, t) {
		let n = e.operator === "in";
		n && t.write("("), a(t, e.left, e, !1), t.write(" " + e.operator + " "), a(t, e.right, e, !0), n && t.write(")");
	},
	LogicalExpression: p,
	ConditionalExpression(e, t) {
		let { test: n } = e, r = t.expressionsPrecedence[n.type];
		r === 17 || r <= t.expressionsPrecedence.ConditionalExpression ? (t.write("("), this[n.type](n, t), t.write(")")) : this[n.type](n, t), t.write(" ? "), this[e.consequent.type](e.consequent, t), t.write(" : "), this[e.alternate.type](e.alternate, t);
	},
	NewExpression(e, t) {
		t.write("new ");
		let n = t.expressionsPrecedence[e.callee.type];
		n === 17 || n < t.expressionsPrecedence.CallExpression || c(e.callee) ? (t.write("("), this[e.callee.type](e.callee, t), t.write(")")) : this[e.callee.type](e.callee, t), r(t, e.arguments);
	},
	CallExpression(e, t) {
		let n = t.expressionsPrecedence[e.callee.type];
		n === 17 || n < t.expressionsPrecedence.CallExpression ? (t.write("("), this[e.callee.type](e.callee, t), t.write(")")) : this[e.callee.type](e.callee, t), e.optional && t.write("?."), r(t, e.arguments);
	},
	ChainExpression(e, t) {
		this[e.expression.type](e.expression, t);
	},
	MemberExpression(e, t) {
		let n = t.expressionsPrecedence[e.object.type];
		n === 17 || n < t.expressionsPrecedence.MemberExpression ? (t.write("("), this[e.object.type](e.object, t), t.write(")")) : this[e.object.type](e.object, t), e.computed ? (e.optional && t.write("?."), t.write("["), this[e.property.type](e.property, t), t.write("]")) : (e.optional ? t.write("?.") : t.write("."), this[e.property.type](e.property, t));
	},
	MetaProperty(e, t) {
		t.write(e.meta.name + "." + e.property.name, e);
	},
	Identifier(e, t) {
		t.write(e.name, e);
	},
	PrivateIdentifier(e, t) {
		t.write(`#${e.name}`, e);
	},
	Literal(t, n) {
		t.raw == null ? t.regex == null ? t.bigint == null ? n.write(e(t.value), t) : n.write(t.bigint + "n", t) : this.RegExpLiteral(t, n) : n.write(t.raw, t);
	},
	RegExpLiteral(e, t) {
		let { regex: n } = e;
		t.write(`/${n.pattern}/${n.flags}`, e);
	}
}, _ = {}, v = class {
	constructor(e) {
		let t = e ?? _;
		this.output = "", t.output == null ? this.output = "" : (this.output = t.output, this.write = this.writeToStream), this.generator = t.generator == null ? g : t.generator, this.expressionsPrecedence = t.expressionsPrecedence == null ? n : t.expressionsPrecedence, this.indent = t.indent == null ? "  " : t.indent, this.lineEnd = t.lineEnd == null ? "\n" : t.lineEnd, this.indentLevel = t.startingIndentLevel == null ? 0 : t.startingIndentLevel, this.writeComments = t.comments ? t.comments : !1, t.sourceMap != null && (this.write = t.output == null ? this.writeAndMap : this.writeToStreamAndMap, this.sourceMap = t.sourceMap, this.line = 1, this.column = 0, this.lineEndSize = this.lineEnd.split("\n").length - 1, this.mapping = {
			original: null,
			generated: this,
			name: void 0,
			source: t.sourceMap.file || t.sourceMap._file
		});
	}
	write(e) {
		this.output += e;
	}
	writeToStream(e) {
		this.output.write(e);
	}
	writeAndMap(e, t) {
		this.output += e, this.map(e, t);
	}
	writeToStreamAndMap(e, t) {
		this.output.write(e), this.map(e, t);
	}
	map(e, t) {
		if (t != null) {
			let { type: n } = t;
			if (n[0] === "L" && n[2] === "n") {
				this.column = 0, this.line++;
				return;
			}
			if (t.loc != null) {
				let { mapping: e } = this;
				e.original = t.loc.start, e.name = t.name, this.sourceMap.addMapping(e);
			}
			if (n[0] === "T" && n[8] === "E" || n[0] === "L" && n[1] === "i" && typeof t.value == "string") {
				let { length: t } = e, { column: n, line: r } = this;
				for (let i = 0; i < t; i++) e[i] === "\n" ? (n = 0, r++) : n++;
				this.column = n, this.line = r;
				return;
			}
		}
		let { length: n } = e, { lineEnd: r } = this;
		n > 0 && (this.lineEndSize > 0 && (r.length === 1 ? e[n - 1] === r : e.endsWith(r)) ? (this.line += this.lineEndSize, this.column = 0) : this.column += n);
	}
	toString() {
		return this.output;
	}
};
function y(e, t) {
	let n = new v(t);
	return n.generator[e.type](e, n), n.output;
}
//#endregion
export { y as generate };
