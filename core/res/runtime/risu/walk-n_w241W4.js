//#region node_modules/.pnpm/acorn-walk@8.3.4/node_modules/acorn-walk/dist/walk.mjs
function e(e, t, n, r, i) {
	n ||= m, (function e(r, i, a) {
		var o = a || r.type;
		n[o](r, i, e), t[o] && t[o](r, i);
	})(e, r, i);
}
function t(e, t, n, r, i) {
	var a = [];
	n ||= m, (function e(r, i, o) {
		var s = o || r.type, c = r !== a[a.length - 1];
		c && a.push(r), n[s](r, i, e), t[s] && t[s](r, i || a, a), c && a.pop();
	})(e, r, i);
}
function n(e, t, n, r, i) {
	var a = n ? d(n, r || void 0) : r;
	(function e(t, n, r) {
		a[r || t.type](t, n, e);
	})(e, t, i);
}
function r(e) {
	return typeof e == "string" ? function(t) {
		return t === e;
	} : e || function() {
		return !0;
	};
}
var i = function(e, t) {
	this.node = e, this.state = t;
};
function a(e, t, n, r, i) {
	n ||= m;
	var a;
	(function e(r, i, o) {
		var s = o || r.type;
		n[s](r, i, e), a !== r && (t(r, i, s), a = r);
	})(e, r, i);
}
function o(e, t, n, r) {
	n ||= m;
	var i = [], a;
	(function e(r, o, s) {
		var c = s || r.type, l = r !== i[i.length - 1];
		l && i.push(r), n[c](r, o, e), a !== r && (t(r, o || i, i, c), a = r), l && i.pop();
	})(e, r);
}
function s(e, t, n, a, o, s) {
	o ||= m, a = r(a);
	try {
		(function e(r, s, c) {
			var l = c || r.type;
			if ((t == null || r.start <= t) && (n == null || r.end >= n) && o[l](r, s, e), (t == null || r.start === t) && (n == null || r.end === n) && a(l, r)) throw new i(r, s);
		})(e, s);
	} catch (e) {
		if (e instanceof i) return e;
		throw e;
	}
}
function c(e, t, n, a, o) {
	n = r(n), a ||= m;
	try {
		(function e(r, o, s) {
			var c = s || r.type;
			if (!(r.start > t || r.end < t) && (a[c](r, o, e), n(c, r))) throw new i(r, o);
		})(e, o);
	} catch (e) {
		if (e instanceof i) return e;
		throw e;
	}
}
function l(e, t, n, a, o) {
	n = r(n), a ||= m;
	try {
		(function e(r, o, s) {
			if (!(r.end < t)) {
				var c = s || r.type;
				if (r.start >= t && n(c, r)) throw new i(r, o);
				a[c](r, o, e);
			}
		})(e, o);
	} catch (e) {
		if (e instanceof i) return e;
		throw e;
	}
}
function u(e, t, n, a, o) {
	n = r(n), a ||= m;
	var s;
	return (function e(r, o, c) {
		if (!(r.start > t)) {
			var l = c || r.type;
			r.end <= t && (!s || s.node.end < r.end) && n(l, r) && (s = new i(r, o)), a[l](r, o, e);
		}
	})(e, o), s;
}
function d(e, t) {
	var n = Object.create(t || m);
	for (var r in e) n[r] = e[r];
	return n;
}
function f(e, t, n) {
	n(e, t);
}
function p(e, t, n) {}
var m = {};
m.Program = m.BlockStatement = m.StaticBlock = function(e, t, n) {
	for (var r = 0, i = e.body; r < i.length; r += 1) {
		var a = i[r];
		n(a, t, "Statement");
	}
}, m.Statement = f, m.EmptyStatement = p, m.ExpressionStatement = m.ParenthesizedExpression = m.ChainExpression = function(e, t, n) {
	return n(e.expression, t, "Expression");
}, m.IfStatement = function(e, t, n) {
	n(e.test, t, "Expression"), n(e.consequent, t, "Statement"), e.alternate && n(e.alternate, t, "Statement");
}, m.LabeledStatement = function(e, t, n) {
	return n(e.body, t, "Statement");
}, m.BreakStatement = m.ContinueStatement = p, m.WithStatement = function(e, t, n) {
	n(e.object, t, "Expression"), n(e.body, t, "Statement");
}, m.SwitchStatement = function(e, t, n) {
	n(e.discriminant, t, "Expression");
	for (var r = 0, i = e.cases; r < i.length; r += 1) {
		var a = i[r];
		n(a, t);
	}
}, m.SwitchCase = function(e, t, n) {
	e.test && n(e.test, t, "Expression");
	for (var r = 0, i = e.consequent; r < i.length; r += 1) {
		var a = i[r];
		n(a, t, "Statement");
	}
}, m.ReturnStatement = m.YieldExpression = m.AwaitExpression = function(e, t, n) {
	e.argument && n(e.argument, t, "Expression");
}, m.ThrowStatement = m.SpreadElement = function(e, t, n) {
	return n(e.argument, t, "Expression");
}, m.TryStatement = function(e, t, n) {
	n(e.block, t, "Statement"), e.handler && n(e.handler, t), e.finalizer && n(e.finalizer, t, "Statement");
}, m.CatchClause = function(e, t, n) {
	e.param && n(e.param, t, "Pattern"), n(e.body, t, "Statement");
}, m.WhileStatement = m.DoWhileStatement = function(e, t, n) {
	n(e.test, t, "Expression"), n(e.body, t, "Statement");
}, m.ForStatement = function(e, t, n) {
	e.init && n(e.init, t, "ForInit"), e.test && n(e.test, t, "Expression"), e.update && n(e.update, t, "Expression"), n(e.body, t, "Statement");
}, m.ForInStatement = m.ForOfStatement = function(e, t, n) {
	n(e.left, t, "ForInit"), n(e.right, t, "Expression"), n(e.body, t, "Statement");
}, m.ForInit = function(e, t, n) {
	e.type === "VariableDeclaration" ? n(e, t) : n(e, t, "Expression");
}, m.DebuggerStatement = p, m.FunctionDeclaration = function(e, t, n) {
	return n(e, t, "Function");
}, m.VariableDeclaration = function(e, t, n) {
	for (var r = 0, i = e.declarations; r < i.length; r += 1) {
		var a = i[r];
		n(a, t);
	}
}, m.VariableDeclarator = function(e, t, n) {
	n(e.id, t, "Pattern"), e.init && n(e.init, t, "Expression");
}, m.Function = function(e, t, n) {
	e.id && n(e.id, t, "Pattern");
	for (var r = 0, i = e.params; r < i.length; r += 1) {
		var a = i[r];
		n(a, t, "Pattern");
	}
	n(e.body, t, e.expression ? "Expression" : "Statement");
}, m.Pattern = function(e, t, n) {
	e.type === "Identifier" ? n(e, t, "VariablePattern") : e.type === "MemberExpression" ? n(e, t, "MemberPattern") : n(e, t);
}, m.VariablePattern = p, m.MemberPattern = f, m.RestElement = function(e, t, n) {
	return n(e.argument, t, "Pattern");
}, m.ArrayPattern = function(e, t, n) {
	for (var r = 0, i = e.elements; r < i.length; r += 1) {
		var a = i[r];
		a && n(a, t, "Pattern");
	}
}, m.ObjectPattern = function(e, t, n) {
	for (var r = 0, i = e.properties; r < i.length; r += 1) {
		var a = i[r];
		a.type === "Property" ? (a.computed && n(a.key, t, "Expression"), n(a.value, t, "Pattern")) : a.type === "RestElement" && n(a.argument, t, "Pattern");
	}
}, m.Expression = f, m.ThisExpression = m.Super = m.MetaProperty = p, m.ArrayExpression = function(e, t, n) {
	for (var r = 0, i = e.elements; r < i.length; r += 1) {
		var a = i[r];
		a && n(a, t, "Expression");
	}
}, m.ObjectExpression = function(e, t, n) {
	for (var r = 0, i = e.properties; r < i.length; r += 1) {
		var a = i[r];
		n(a, t);
	}
}, m.FunctionExpression = m.ArrowFunctionExpression = m.FunctionDeclaration, m.SequenceExpression = function(e, t, n) {
	for (var r = 0, i = e.expressions; r < i.length; r += 1) {
		var a = i[r];
		n(a, t, "Expression");
	}
}, m.TemplateLiteral = function(e, t, n) {
	for (var r = 0, i = e.quasis; r < i.length; r += 1) {
		var a = i[r];
		n(a, t);
	}
	for (var o = 0, s = e.expressions; o < s.length; o += 1) {
		var c = s[o];
		n(c, t, "Expression");
	}
}, m.TemplateElement = p, m.UnaryExpression = m.UpdateExpression = function(e, t, n) {
	n(e.argument, t, "Expression");
}, m.BinaryExpression = m.LogicalExpression = function(e, t, n) {
	n(e.left, t, "Expression"), n(e.right, t, "Expression");
}, m.AssignmentExpression = m.AssignmentPattern = function(e, t, n) {
	n(e.left, t, "Pattern"), n(e.right, t, "Expression");
}, m.ConditionalExpression = function(e, t, n) {
	n(e.test, t, "Expression"), n(e.consequent, t, "Expression"), n(e.alternate, t, "Expression");
}, m.NewExpression = m.CallExpression = function(e, t, n) {
	if (n(e.callee, t, "Expression"), e.arguments) for (var r = 0, i = e.arguments; r < i.length; r += 1) {
		var a = i[r];
		n(a, t, "Expression");
	}
}, m.MemberExpression = function(e, t, n) {
	n(e.object, t, "Expression"), e.computed && n(e.property, t, "Expression");
}, m.ExportNamedDeclaration = m.ExportDefaultDeclaration = function(e, t, n) {
	e.declaration && n(e.declaration, t, e.type === "ExportNamedDeclaration" || e.declaration.id ? "Statement" : "Expression"), e.source && n(e.source, t, "Expression");
}, m.ExportAllDeclaration = function(e, t, n) {
	e.exported && n(e.exported, t), n(e.source, t, "Expression");
}, m.ImportDeclaration = function(e, t, n) {
	for (var r = 0, i = e.specifiers; r < i.length; r += 1) {
		var a = i[r];
		n(a, t);
	}
	n(e.source, t, "Expression");
}, m.ImportExpression = function(e, t, n) {
	n(e.source, t, "Expression");
}, m.ImportSpecifier = m.ImportDefaultSpecifier = m.ImportNamespaceSpecifier = m.Identifier = m.PrivateIdentifier = m.Literal = p, m.TaggedTemplateExpression = function(e, t, n) {
	n(e.tag, t, "Expression"), n(e.quasi, t, "Expression");
}, m.ClassDeclaration = m.ClassExpression = function(e, t, n) {
	return n(e, t, "Class");
}, m.Class = function(e, t, n) {
	e.id && n(e.id, t, "Pattern"), e.superClass && n(e.superClass, t, "Expression"), n(e.body, t);
}, m.ClassBody = function(e, t, n) {
	for (var r = 0, i = e.body; r < i.length; r += 1) {
		var a = i[r];
		n(a, t);
	}
}, m.MethodDefinition = m.PropertyDefinition = m.Property = function(e, t, n) {
	e.computed && n(e.key, t, "Expression"), e.value && n(e.value, t, "Expression");
};
//#endregion
export { t as ancestor, m as base, l as findNodeAfter, c as findNodeAround, s as findNodeAt, u as findNodeBefore, a as full, o as fullAncestor, d as make, n as recursive, e as simple };
