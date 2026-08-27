//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/parsers/base64-arraybuffer.js
var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function t(t) {
	let n = "";
	for (let r = 0; r < t.length; r += 3) n += e[t[r] >> 2], n += e[(t[r] & 3) << 4 | t[r + 1] >> 4], n += e[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], n += e[t[r + 2] & 63];
	return t.length % 3 == 2 ? n = n.substring(0, n.length - 1) + "=" : t.length % 3 == 1 && (n = n.substring(0, n.length - 2) + "=="), n;
}
function n(t) {
	let n = new Uint8Array(256);
	for (let t = 0; t < 64; t++) n[e.charCodeAt(t)] = t;
	let r = t.length * .75;
	t[t.length - 1] === "=" && (r--, t[t.length - 2] === "=" && r--);
	let i = new Uint8Array(r);
	for (let e = 0, r = 0; e < t.length; e += 4) {
		let a = n[t.charCodeAt(e)], o = n[t.charCodeAt(e + 1)], s = n[t.charCodeAt(e + 2)], c = n[t.charCodeAt(e + 3)];
		i[r++] = a << 2 | o >> 4, i[r++] = (o & 15) << 4 | s >> 2, i[r++] = (s & 3) << 6 | c & 63;
	}
	return i;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/codecs/bitdepth.js
function r(e, t, n, r) {
	if (["32f", "64"].indexOf(t) > -1 && ["32f", "64"].indexOf(r) > -1) {
		n.set(e);
		return;
	}
	c(t), c(r);
	let i = s(t, r), a = {
		oldMin: 2 ** parseInt(t, 10) / 2,
		newMin: 2 ** parseInt(r, 10) / 2,
		oldMax: 2 ** parseInt(t, 10) / 2 - 1,
		newMax: 2 ** parseInt(r, 10) / 2 - 1
	};
	l(t, e, !0);
	for (let t = 0, r = e.length; t < r; t++) n[t] = i(e[t], a);
	l(r, n, !1);
}
function i(e, t) {
	return e = parseInt(e > 0 ? e / t.oldMax * t.newMax : e / t.oldMin * t.newMin, 10), e;
}
function a(e, t) {
	return parseInt(e > 0 ? e * t.newMax : e * t.newMin, 10);
}
function o(e, t) {
	return e > 0 ? e / t.oldMax : e / t.oldMin;
}
function s(e, t) {
	let n = function(e) {
		return e;
	};
	return e != t && (n = ["32f", "64"].includes(e) ? a : ["32f", "64"].includes(t) ? o : i), n;
}
function c(e) {
	if (e != "32f" && e != "64" && (parseInt(e, 10) < "8" || parseInt(e, 10) > "53")) throw Error("Invalid bit depth.");
}
function l(e, t, n) {
	if (e == "8") {
		let e = n ? -128 : 128;
		for (let n = 0, r = t.length; n < r; n++) t[n] = t[n] += e;
	}
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/codecs/imaadpcm.js
var u = [
	-1,
	-1,
	-1,
	-1,
	2,
	4,
	6,
	8,
	-1,
	-1,
	-1,
	-1,
	2,
	4,
	6,
	8
], d = [
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	16,
	17,
	19,
	21,
	23,
	25,
	28,
	31,
	34,
	37,
	41,
	45,
	50,
	55,
	60,
	66,
	73,
	80,
	88,
	97,
	107,
	118,
	130,
	143,
	157,
	173,
	190,
	209,
	230,
	253,
	279,
	307,
	337,
	371,
	408,
	449,
	494,
	544,
	598,
	658,
	724,
	796,
	876,
	963,
	1060,
	1166,
	1282,
	1411,
	1552,
	1707,
	1878,
	2066,
	2272,
	2499,
	2749,
	3024,
	3327,
	3660,
	4026,
	4428,
	4871,
	5358,
	5894,
	6484,
	7132,
	7845,
	8630,
	9493,
	10442,
	11487,
	12635,
	13899,
	15289,
	16818,
	18500,
	20350,
	22385,
	24623,
	27086,
	29794,
	32767
];
function f(e) {
	let t = {
		index: 0,
		predicted: 0,
		step: 7
	}, n = new Uint8Array(e.length), r = [], i = 0, a = 0;
	for (let o = 0, s = e.length; o < s; o++) o % 505 == 0 && o != 0 && (n.set(m(r, t), i), i += 256, r = [], a++), r.push(e[o]);
	let o = e.length / 2;
	return o % 2 && o++, n.slice(0, o + 512 + a * 4);
}
function p(e, t = 256) {
	let n = {
		index: 0,
		predicted: 0,
		step: 7
	}, r = new Int16Array(e.length * 2), i = [], a = 0;
	for (let o = 0, s = e.length; o < s; o++) {
		if (o % t == 0 && o != 0) {
			let e = h(i, n);
			r.set(e, a), a += e.length, i = [];
		}
		i.push(e[o]);
	}
	return r;
}
function m(e, t) {
	let n = te(e[0], t);
	for (let r = 3, i = e.length; r < i; r += 2) {
		let i = _(e[r], t), a = _(e[r + 1], t);
		n.push(a << 4 | i);
	}
	return n;
}
function h(e, t) {
	t.predicted = g(e[1] << 8 | e[0]), t.index = e[2], t.step = d[t.index];
	let n = [t.predicted, t.predicted];
	for (let r = 4, i = e.length; r < i; r++) {
		let i = e[r], a = i >> 4, o = a << 4 ^ i;
		n.push(y(o, t)), n.push(y(a, t));
	}
	return n;
}
function g(e) {
	return e > 32768 ? e - 65536 : e;
}
function _(e, t) {
	let n = e - t.predicted, r = 0;
	n >= 0 ? r = 0 : (r = 8, n = -n);
	let i = d[t.index], a = i >> 3;
	return n > i && (r |= 4, n -= i, a += i), i >>= 1, n > i && (r |= 2, n -= i, a += i), i >>= 1, n > i && (r |= 1, a += i), v(r, a, t), r;
}
function v(e, t, n) {
	e & 8 ? n.predicted -= t : n.predicted += t, n.predicted < -32768 ? n.predicted = -32768 : n.predicted > 32767 && (n.predicted = 32767), n.index += u[e & 7], n.index < 0 ? n.index = 0 : n.index > 88 && (n.index = 88);
}
function y(e, t) {
	let n = 0;
	return e & 4 && (n += t.step), e & 2 && (n += t.step >> 1), e & 1 && (n += t.step >> 2), n += t.step >> 3, e & 8 && (n = -n), t.predicted += n, t.predicted > 32767 ? t.predicted = 32767 : t.predicted < -32767 && (t.predicted = -32767), ee(e, t), t.predicted;
}
function ee(e, t) {
	t.index += u[e], t.index < 0 ? t.index = 0 : t.index > 88 && (t.index = 88), t.step = d[t.index];
}
function te(e, t) {
	_(e, t);
	let n = [];
	return n.push(e & 255), n.push(e >> 8 & 255), n.push(t.index), n.push(0), n;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/codecs/alaw.js
var ne = [
	1,
	1,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7
];
function re(e) {
	let t;
	e = e == -32768 ? -32767 : e;
	let n = ~e >> 8 & 128;
	if (n || (e *= -1), e > 32635 && (e = 32635), e >= 256) {
		let n = ne[e >> 8 & 127], r = e >> n + 3 & 15;
		t = n << 4 | r;
	} else t = e >> 4;
	return t ^ n ^ 85;
}
function b(e) {
	let t = 0;
	e ^= 85, e & 128 && (e &= -129, t = -1);
	let n = ((e & 240) >> 4) + 4, r = 0;
	return r = n == 4 ? e << 1 | 1 : 1 << n | (e & 15) << n - 4 | 1 << n - 5, r = t === 0 ? r : -r, r * 8 * -1;
}
function ie(e) {
	let t = new Uint8Array(e.length);
	for (let n = 0, r = e.length; n < r; n++) t[n] = re(e[n]);
	return t;
}
function x(e) {
	let t = new Int16Array(e.length);
	for (let n = 0, r = e.length; n < r; n++) t[n] = b(e[n]);
	return t;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/codecs/mulaw.js
var S = 132, C = 32635, w = [
	0,
	0,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	5,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7,
	7
], T = [
	0,
	132,
	396,
	924,
	1980,
	4092,
	8316,
	16764
];
function E(e) {
	let t, n, r, i;
	return t = e >> 8 & 128, t != 0 && (e = -e), e += S, e > C && (e = C), n = w[e >> 7 & 255], r = e >> n + 3 & 15, i = ~(t | n << 4 | r), i;
}
function D(e) {
	let t, n, r, i;
	return e = ~e, t = e & 128, n = e >> 4 & 7, r = e & 15, i = T[n] + (r << n + 3), t != 0 && (i = -i), i;
}
function ae(e) {
	let t = new Uint8Array(e.length);
	for (let n = 0, r = e.length; n < r; n++) t[n] = E(e[n]);
	return t;
}
function oe(e) {
	let t = new Int16Array(e.length);
	for (let n = 0, r = e.length; n < r; n++) t[n] = D(e[n]);
	return t;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/parsers/binary/lib/endianness.js
function O(e, t, n = 0, r = e.length) {
	for (let i = n; i < r; i += t) se(e, t, i);
}
function se(e, t, n) {
	t--;
	for (let r = 0; r < t; r++) {
		let i = e[n + r];
		e[n + r] = e[n + t], e[n + t] = i, t--;
	}
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/parsers/binary/lib/utf8-parser.js
function ce(e, t = 0, n = e.length) {
	let r = "";
	for (let i = t; i < n;) {
		let t = 128, n = 191, a = !1, o = e[i++];
		if (o >= 0 && o <= 127) r += String.fromCharCode(o);
		else {
			let s = 0;
			o >= 194 && o <= 223 ? s = 1 : o >= 224 && o <= 239 ? (s = 2, e[i] === 224 && (t = 160), e[i] === 237 && (n = 159)) : o >= 240 && o <= 244 ? (s = 3, e[i] === 240 && (t = 144), e[i] === 244 && (n = 143)) : a = !0, o &= (1 << 8 - s - 1) - 1;
			for (let r = 0; r < s; r++) (e[i] < t || e[i] > n) && (a = !0), o = o << 6 | e[i] & 63, i++;
			a ? r += "�" : o <= 65535 ? r += String.fromCharCode(o) : (o -= 65536, r += String.fromCharCode((o >> 10 & 1023) + 55296, (o & 1023) + 56320));
		}
	}
	return r;
}
function k(e, t, n = 0) {
	let r = 0, i = e.length;
	for (; r < i;) {
		let i = e.codePointAt(r);
		if (i < 128) t[n] = i, n++;
		else {
			let e = 0, a = 0;
			for (i <= 2047 ? (e = 1, a = 192) : i <= 65535 ? (e = 2, a = 224) : i <= 1114111 && (e = 3, a = 240, r++), t[n] = (i >> 6 * e) + a, n++; e > 0;) t[n] = 128 | i >> 6 * (e - 1) & 63, n++, e--;
		}
		r++;
	}
	return n;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/parsers/binary/lib/int-parser.js
var A = class {
	constructor(e, t = !1) {
		this.bits = e, this.offset = Math.ceil(e / 8), this.max = 2 ** e - 1, this.min = 0, this.unpack = this.unpack_, t && (this.max = 2 ** e / 2 - 1, this.min = -this.max - 1, this.unpack = this.unpackSigned_);
	}
	pack(e, t, n = 0) {
		t = this.clamp_(Math.round(t));
		for (let r = 0, i = this.offset; r < i; r++) e[n] = Math.floor(t / 2 ** (r * 8)) & 255, n++;
		return n;
	}
	unpack_(e, t = 0) {
		let n = 0;
		for (let r = 0; r < this.offset; r++) n += e[t + r] * 256 ** r;
		return n;
	}
	unpackSigned_(e, t = 0) {
		return this.sign_(this.unpack_(e, t));
	}
	clamp_(e) {
		return e > this.max ? this.max : e < this.min ? this.min : e;
	}
	sign_(e) {
		return e > this.max && (e -= this.max * 2 + 2), e;
	}
}, j = class {
	constructor(e, t) {
		this.offset = Math.ceil((e + t) / 8), this.ebits = e, this.fbits = t, this.bias = (1 << e - 1) - 1, this.biasP2 = 2 ** (this.bias + 1), this.ebitsFbits = e + t, this.fbias = 2 ** -(8 * this.offset - 1 - e);
	}
	pack(e, t, n) {
		Math.abs(t) > this.biasP2 - this.ebitsFbits * 2 && (t = t < 0 ? -Infinity : Infinity);
		let r = ((t = +t) || 1 / t) < 0 || t < 0 ? 1 : 0;
		t = Math.abs(t);
		let i = Math.min(Math.floor(Math.log(t) / Math.LN2), 1023), a = M(t / 2 ** i * 2 ** this.fbits);
		return t === t ? t !== 0 && (t >= 2 ** (1 - this.bias) ? (a / 2 ** this.fbits >= 2 && (i += 1, a = 1), i > this.bias ? (i = (1 << this.ebits) - 1, a = 0) : (i += this.bias, a = M(a) - 2 ** this.fbits)) : (a = M(t / 2 ** (1 - this.bias - this.fbits)), i = 0)) : (a = 2 ** (this.fbits - 1), i = (1 << this.ebits) - 1), this.packFloatBits_(e, n, r, i, a);
	}
	unpack(e, t) {
		let n = (1 << this.ebits) - 1, r, i = "";
		for (let n = this.offset - 1; n >= 0; n--) {
			let r = e[n + t].toString(2);
			i += "00000000".substring(r.length) + r;
		}
		let a = i.charAt(0) == "1" ? -1 : 1;
		i = i.substring(1);
		let o = parseInt(i.substring(0, this.ebits), 2);
		return i = i.substring(this.ebits), o == n ? parseInt(i, 2) === 0 ? a * Infinity : NaN : (o === 0 ? (o += 1, r = parseInt(i, 2)) : r = parseInt("1" + i, 2), a * r * this.fbias * 2 ** (o - this.bias));
	}
	packFloatBits_(e, t, n, r, i) {
		let a = [];
		a.push(n);
		for (let e = this.ebits; e > 0; --e) a[e] = r % 2 ? 1 : 0, r = Math.floor(r / 2);
		let o = a.length;
		for (let e = this.fbits; e > 0; --e) a[o + e] = i % 2 ? 1 : 0, i = Math.floor(i / 2);
		let s = a.join(""), c = this.offset + t - 1, l = t;
		for (; c >= t;) e[c] = parseInt(s.substring(0, 8), 2), s = s.substring(8), c--, l++;
		return l;
	}
};
function M(e) {
	let t = Math.floor(e), n = e - t;
	return n < .5 ? t : n > .5 || t % 2 ? t + 1 : t;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/parsers/binary/index.js
function N(e, t = 0, n = e.length) {
	return ce(e, t, n);
}
function P(e) {
	let t = [];
	return k(e, t), t;
}
function F(e, t, n = 0) {
	return k(e, t, n);
}
function I(e, t, n, r = 0) {
	t ||= {};
	let i = W(t.bits, t.fp, t.signed), a = Math.ceil(t.bits / 8), o = 0, s = r;
	for (let t = e.length; o < t; o++) r = i.pack(n, e[o], r);
	return t.be && O(n, a, s, r), r;
}
function L(e, t, n, r = 0, i = e.length) {
	t ||= {};
	let a = W(t.bits, t.fp, t.signed);
	if (i = U(e, r, i, a.offset), t.be) {
		let o = H(e);
		t.be && O(o, a.offset, r, i), V(o, n, r, i, a);
	} else V(e, n, r, i, a);
}
function R(e, t, n, r = 0) {
	return I([e], t, n, r);
}
function z(e, t) {
	let n = [];
	return R(e, t, n, 0), n;
}
function B(e, t, n = 0) {
	let r = [];
	return L(e, t, r, n, n + Math.ceil(t.bits / 8)), r[0];
}
function V(e, t, n, r, i) {
	let a = i.offset;
	for (let o = 0, s = n; s < r; s += a, o++) t[o] = i.unpack(e, s);
}
function H(e) {
	return new Uint8Array(e);
}
function U(e, t, n, r) {
	return n - (n - t) % r;
}
function W(e, t, n) {
	return t && e == 32 ? new j(8, 23) : t && e == 64 ? new j(11, 52) : new A(e, n);
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/riff-file.js
var G = class {
	constructor() {
		this.container = "", this.chunkSize = 0, this.format = "", this.signature = null, this.head = 0, this.uInt32 = {
			bits: 32,
			be: !1
		}, this.supported_containers = ["RIFF", "RIFX"];
	}
	setSignature(e) {
		if (this.head = 0, this.container = this.readString(e, 4), this.supported_containers.indexOf(this.container) === -1) throw Error("Not a supported format.");
		this.uInt32.be = this.container === "RIFX", this.chunkSize = this.readUInt32(e), this.format = this.readString(e, 4), this.signature = {
			chunkId: this.container,
			chunkSize: this.chunkSize,
			format: this.format,
			subChunks: this.getSubChunksIndex_(e)
		};
	}
	findChunk(e, t = !1) {
		let n = this.signature.subChunks, r = [];
		for (let i = 0; i < n.length; i++) if (n[i].chunkId == e) if (t) r.push(n[i]);
		else return n[i];
		return e == "LIST" && r.length ? r : null;
	}
	readString(e, t) {
		let n = "";
		return n = N(e, this.head, this.head + t), this.head += t, n;
	}
	readUInt32(e) {
		let t = B(e, this.uInt32, this.head);
		return this.head += 4, t;
	}
	getSubChunksIndex_(e) {
		let t = [], n = this.head;
		for (; n <= e.length - 8;) t.push(this.getSubChunkIndex_(e, n)), n += 8 + t[t.length - 1].chunkSize, n = n % 2 ? n + 1 : n;
		return t;
	}
	getSubChunkIndex_(e, t) {
		let n = {
			chunkId: this.getChunkId_(e, t),
			chunkSize: this.getChunkSize_(e, t)
		};
		if (n.chunkId == "LIST") n.format = N(e, t + 8, t + 12), this.head += 4, n.subChunks = this.getSubChunksIndex_(e);
		else {
			let e = n.chunkSize % 2 ? n.chunkSize + 1 : n.chunkSize;
			this.head = t + 8 + e, n.chunkData = {
				start: t + 8,
				end: this.head
			};
		}
		return n;
	}
	getChunkId_(e, t) {
		return this.head += 4, N(e, t, t + 4);
	}
	getChunkSize_(e, t) {
		return this.head += 4, B(e, this.uInt32, t + 4);
	}
}, le = class e extends G {
	constructor() {
		super(), this.supported_containers.push("RF64"), this.fmt = {
			chunkId: "",
			chunkSize: 0,
			audioFormat: 0,
			numChannels: 0,
			sampleRate: 0,
			byteRate: 0,
			blockAlign: 0,
			bitsPerSample: 0,
			cbSize: 0,
			validBitsPerSample: 0,
			dwChannelMask: 0,
			subformat: []
		}, this.fact = {
			chunkId: "",
			chunkSize: 0,
			dwSampleLength: 0
		}, this.cue = {
			chunkId: "",
			chunkSize: 0,
			dwCuePoints: 0,
			points: []
		}, this.smpl = {
			chunkId: "",
			chunkSize: 0,
			dwManufacturer: 0,
			dwProduct: 0,
			dwSamplePeriod: 0,
			dwMIDIUnityNote: 0,
			dwMIDIPitchFraction: 0,
			dwSMPTEFormat: 0,
			dwSMPTEOffset: 0,
			dwNumSampleLoops: 0,
			dwSamplerData: 0,
			loops: []
		}, this.bext = {
			chunkId: "",
			chunkSize: 0,
			description: "",
			originator: "",
			originatorReference: "",
			originationDate: "",
			originationTime: "",
			timeReference: [0, 0],
			version: 0,
			UMID: "",
			loudnessValue: 0,
			loudnessRange: 0,
			maxTruePeakLevel: 0,
			maxMomentaryLoudness: 0,
			maxShortTermLoudness: 0,
			reserved: "",
			codingHistory: ""
		}, this.iXML = {
			chunkId: "",
			chunkSize: 0,
			value: ""
		}, this.ds64 = {
			chunkId: "",
			chunkSize: 0,
			riffSizeHigh: 0,
			riffSizeLow: 0,
			dataSizeHigh: 0,
			dataSizeLow: 0,
			originationTime: 0,
			sampleCountHigh: 0,
			sampleCountLow: 0
		}, this.data = {
			chunkId: "",
			chunkSize: 0,
			samples: new Uint8Array()
		}, this.LIST = [], this.junk = {
			chunkId: "",
			chunkSize: 0,
			chunkData: []
		}, this._PMX = {
			chunkId: "",
			chunkSize: 0,
			value: ""
		}, this.uInt16 = {
			bits: 16,
			be: !1,
			signed: !1,
			fp: !1
		};
	}
	fromBuffer(e, t = !0) {
		if (this.clearHeaders(), this.setSignature(e), this.uInt16.be = this.uInt32.be, this.format != "WAVE") throw Error("Could not find the \"WAVE\" format identifier");
		this.readDs64Chunk_(e), this.readFmtChunk_(e), this.readFactChunk_(e), this.readBextChunk_(e), this.readiXMLChunk_(e), this.readCueChunk_(e), this.readSmplChunk_(e), this.readDataChunk_(e, t), this.readJunkChunk_(e), this.readLISTChunk_(e), this.read_PMXChunk_(e);
	}
	clearHeaders() {
		let t = new e();
		Object.assign(this.fmt, t.fmt), Object.assign(this.fact, t.fact), Object.assign(this.cue, t.cue), Object.assign(this.smpl, t.smpl), Object.assign(this.bext, t.bext), Object.assign(this.iXML, t.iXML), Object.assign(this.ds64, t.ds64), Object.assign(this.data, t.data), this.LIST = [], Object.assign(this.junk, t.junk), Object.assign(this._PMX, t._PMX);
	}
	readFmtChunk_(e) {
		let t = this.findChunk("fmt ");
		if (t) this.head = t.chunkData.start, this.fmt.chunkId = t.chunkId, this.fmt.chunkSize = t.chunkSize, this.fmt.audioFormat = this.readUInt16_(e), this.fmt.numChannels = this.readUInt16_(e), this.fmt.sampleRate = this.readUInt32(e), this.fmt.byteRate = this.readUInt32(e), this.fmt.blockAlign = this.readUInt16_(e), this.fmt.bitsPerSample = this.readUInt16_(e), this.readFmtExtension_(e);
		else throw Error("Could not find the \"fmt \" chunk");
	}
	readFmtExtension_(e) {
		this.fmt.chunkSize > 16 && (this.fmt.cbSize = this.readUInt16_(e), this.fmt.chunkSize > 18 && (this.fmt.validBitsPerSample = this.readUInt16_(e), this.fmt.chunkSize > 20 && (this.fmt.dwChannelMask = this.readUInt32(e), this.fmt.subformat = [
			this.readUInt32(e),
			this.readUInt32(e),
			this.readUInt32(e),
			this.readUInt32(e)
		])));
	}
	readFactChunk_(e) {
		let t = this.findChunk("fact");
		t && (this.head = t.chunkData.start, this.fact.chunkId = t.chunkId, this.fact.chunkSize = t.chunkSize, this.fact.dwSampleLength = this.readUInt32(e));
	}
	readCueChunk_(e) {
		let t = this.findChunk("cue ");
		if (t) {
			this.head = t.chunkData.start, this.cue.chunkId = t.chunkId, this.cue.chunkSize = t.chunkSize, this.cue.dwCuePoints = this.readUInt32(e);
			for (let t = 0; t < this.cue.dwCuePoints; t++) this.cue.points.push({
				dwName: this.readUInt32(e),
				dwPosition: this.readUInt32(e),
				fccChunk: this.readString(e, 4),
				dwChunkStart: this.readUInt32(e),
				dwBlockStart: this.readUInt32(e),
				dwSampleOffset: this.readUInt32(e)
			});
		}
	}
	readSmplChunk_(e) {
		let t = this.findChunk("smpl");
		if (t) {
			this.head = t.chunkData.start, this.smpl.chunkId = t.chunkId, this.smpl.chunkSize = t.chunkSize, this.smpl.dwManufacturer = this.readUInt32(e), this.smpl.dwProduct = this.readUInt32(e), this.smpl.dwSamplePeriod = this.readUInt32(e), this.smpl.dwMIDIUnityNote = this.readUInt32(e), this.smpl.dwMIDIPitchFraction = this.readUInt32(e), this.smpl.dwSMPTEFormat = this.readUInt32(e), this.smpl.dwSMPTEOffset = this.readUInt32(e), this.smpl.dwNumSampleLoops = this.readUInt32(e), this.smpl.dwSamplerData = this.readUInt32(e);
			for (let t = 0; t < this.smpl.dwNumSampleLoops; t++) this.smpl.loops.push({
				dwName: this.readUInt32(e),
				dwType: this.readUInt32(e),
				dwStart: this.readUInt32(e),
				dwEnd: this.readUInt32(e),
				dwFraction: this.readUInt32(e),
				dwPlayCount: this.readUInt32(e)
			});
		}
	}
	readDataChunk_(e, t) {
		let n = this.findChunk("data");
		if (n) this.data.chunkId = "data", this.data.chunkSize = n.chunkSize, t && (this.data.samples = e.slice(n.chunkData.start, n.chunkData.end));
		else throw Error("Could not find the \"data\" chunk");
	}
	readBextChunk_(e) {
		let t = this.findChunk("bext");
		t && (this.head = t.chunkData.start, this.bext.chunkId = t.chunkId, this.bext.chunkSize = t.chunkSize, this.bext.description = this.readString(e, 256), this.bext.originator = this.readString(e, 32), this.bext.originatorReference = this.readString(e, 32), this.bext.originationDate = this.readString(e, 10), this.bext.originationTime = this.readString(e, 8), this.bext.timeReference = [this.readUInt32(e), this.readUInt32(e)], this.bext.version = this.readUInt16_(e), this.bext.UMID = this.readString(e, 64), this.bext.loudnessValue = this.readUInt16_(e), this.bext.loudnessRange = this.readUInt16_(e), this.bext.maxTruePeakLevel = this.readUInt16_(e), this.bext.maxMomentaryLoudness = this.readUInt16_(e), this.bext.maxShortTermLoudness = this.readUInt16_(e), this.bext.reserved = this.readString(e, 180), this.bext.codingHistory = this.readString(e, this.bext.chunkSize - 602));
	}
	readiXMLChunk_(e) {
		let t = this.findChunk("iXML");
		t && (this.head = t.chunkData.start, this.iXML.chunkId = t.chunkId, this.iXML.chunkSize = t.chunkSize, this.iXML.value = N(e, this.head, this.head + this.iXML.chunkSize));
	}
	readDs64Chunk_(e) {
		let t = this.findChunk("ds64");
		if (t) this.head = t.chunkData.start, this.ds64.chunkId = t.chunkId, this.ds64.chunkSize = t.chunkSize, this.ds64.riffSizeHigh = this.readUInt32(e), this.ds64.riffSizeLow = this.readUInt32(e), this.ds64.dataSizeHigh = this.readUInt32(e), this.ds64.dataSizeLow = this.readUInt32(e), this.ds64.originationTime = this.readUInt32(e), this.ds64.sampleCountHigh = this.readUInt32(e), this.ds64.sampleCountLow = this.readUInt32(e);
		else if (this.container == "RF64") throw Error("Could not find the \"ds64\" chunk");
	}
	readLISTChunk_(e) {
		let t = this.findChunk("LIST", !0);
		if (t !== null) for (let n = 0; n < t.length; n++) {
			let r = t[n];
			this.LIST.push({
				chunkId: r.chunkId,
				chunkSize: r.chunkSize,
				format: r.format,
				subChunks: []
			});
			for (let t = 0; t < r.subChunks.length; t++) this.readLISTSubChunks_(r.subChunks[t], r.format, e);
		}
	}
	readLISTSubChunks_(e, t, n) {
		t == "adtl" ? [
			"labl",
			"note",
			"ltxt"
		].indexOf(e.chunkId) > -1 && this.readLISTadtlSubChunks_(n, e) : t == "INFO" && this.readLISTINFOSubChunks_(n, e);
	}
	readLISTadtlSubChunks_(e, t) {
		this.head = t.chunkData.start;
		let n = {
			chunkId: t.chunkId,
			chunkSize: t.chunkSize,
			dwName: this.readUInt32(e)
		};
		t.chunkId == "ltxt" ? (n.dwSampleLength = this.readUInt32(e), n.dwPurposeID = this.readUInt32(e), n.dwCountry = this.readUInt16_(e), n.dwLanguage = this.readUInt16_(e), n.dwDialect = this.readUInt16_(e), n.dwCodePage = this.readUInt16_(e), n.value = "") : n.value = this.readZSTR_(e, this.head), this.LIST[this.LIST.length - 1].subChunks.push(n);
	}
	readLISTINFOSubChunks_(e, t) {
		this.head = t.chunkData.start, this.LIST[this.LIST.length - 1].subChunks.push({
			chunkId: t.chunkId,
			chunkSize: t.chunkSize,
			value: this.readZSTR_(e, this.head)
		});
	}
	readJunkChunk_(e) {
		let t = this.findChunk("junk");
		t && (this.junk = {
			chunkId: t.chunkId,
			chunkSize: t.chunkSize,
			chunkData: [].slice.call(e.slice(t.chunkData.start, t.chunkData.end))
		});
	}
	read_PMXChunk_(e) {
		let t = this.findChunk("_PMX");
		t && (this.head = t.chunkData.start, this._PMX.chunkId = t.chunkId, this._PMX.chunkSize = t.chunkSize, this._PMX.value = N(e, this.head, this.head + this._PMX.chunkSize));
	}
	readZSTR_(e, t = 0) {
		for (let n = t; n < e.length && (this.head++, e[n] !== 0); n++);
		return N(e, t, this.head - 1);
	}
	readUInt16_(e) {
		let t = B(e, this.uInt16, this.head);
		return this.head += 2, t;
	}
};
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/parsers/write-string.js
function K(e, t) {
	let n = P(e);
	for (let e = n.length; e < t; e++) n.push(0);
	return n;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/wavefile-parser.js
var ue = class extends le {
	toBuffer() {
		this.uInt16.be = this.container === "RIFX", this.uInt32.be = this.uInt16.be;
		let e = [
			this.getJunkBytes_(),
			this.getDs64Bytes_(),
			this.getBextBytes_(),
			this.getiXMLBytes_(),
			this.getFmtBytes_(),
			this.getFactBytes_(),
			P(this.data.chunkId),
			z(this.data.samples.length, this.uInt32),
			this.data.samples,
			this.getCueBytes_(),
			this.getSmplBytes_(),
			this.getLISTBytes_(),
			this.get_PMXBytes_()
		], t = 0;
		for (let n = 0; n < e.length; n++) t += e[n].length;
		let n = new Uint8Array(t + 12), r = 0;
		r = F(this.container, n, r), r = R(t + 4, this.uInt32, n, r), r = F(this.format, n, r);
		for (let t = 0; t < e.length; t++) n.set(e[t], r), r += e[t].length;
		return n;
	}
	getBextBytes_() {
		let e = [];
		return this.enforceBext_(), this.bext.chunkId && (this.bext.chunkSize = 602 + this.bext.codingHistory.length, e = e.concat(P(this.bext.chunkId), z(602 + this.bext.codingHistory.length, this.uInt32), K(this.bext.description, 256), K(this.bext.originator, 32), K(this.bext.originatorReference, 32), K(this.bext.originationDate, 10), K(this.bext.originationTime, 8), z(this.bext.timeReference[0], this.uInt32), z(this.bext.timeReference[1], this.uInt32), z(this.bext.version, this.uInt16), K(this.bext.UMID, 64), z(this.bext.loudnessValue, this.uInt16), z(this.bext.loudnessRange, this.uInt16), z(this.bext.maxTruePeakLevel, this.uInt16), z(this.bext.maxMomentaryLoudness, this.uInt16), z(this.bext.maxShortTermLoudness, this.uInt16), K(this.bext.reserved, 180), K(this.bext.codingHistory, this.bext.codingHistory.length))), this.enforceByteLen_(e), e;
	}
	enforceBext_() {
		for (let e in this.bext) if (this.bext.hasOwnProperty(e) && this.bext[e] && e != "timeReference") {
			this.bext.chunkId = "bext";
			break;
		}
		(this.bext.timeReference[0] || this.bext.timeReference[1]) && (this.bext.chunkId = "bext");
	}
	getiXMLBytes_() {
		let e = [];
		if (this.iXML.chunkId) {
			let t = P(this.iXML.value);
			this.iXML.chunkSize = t.length, e = e.concat(P(this.iXML.chunkId), z(this.iXML.chunkSize, this.uInt32), t);
		}
		return this.enforceByteLen_(e), e;
	}
	getDs64Bytes_() {
		let e = [];
		return this.ds64.chunkId && (e = e.concat(P(this.ds64.chunkId), z(this.ds64.chunkSize, this.uInt32), z(this.ds64.riffSizeHigh, this.uInt32), z(this.ds64.riffSizeLow, this.uInt32), z(this.ds64.dataSizeHigh, this.uInt32), z(this.ds64.dataSizeLow, this.uInt32), z(this.ds64.originationTime, this.uInt32), z(this.ds64.sampleCountHigh, this.uInt32), z(this.ds64.sampleCountLow, this.uInt32))), this.enforceByteLen_(e), e;
	}
	getCueBytes_() {
		let e = [];
		if (this.cue.chunkId) {
			let t = this.getCuePointsBytes_();
			e = e.concat(P(this.cue.chunkId), z(t.length + 4, this.uInt32), z(this.cue.dwCuePoints, this.uInt32), t);
		}
		return this.enforceByteLen_(e), e;
	}
	getCuePointsBytes_() {
		let e = [];
		for (let t = 0; t < this.cue.dwCuePoints; t++) e = e.concat(z(this.cue.points[t].dwName, this.uInt32), z(this.cue.points[t].dwPosition, this.uInt32), P(this.cue.points[t].fccChunk), z(this.cue.points[t].dwChunkStart, this.uInt32), z(this.cue.points[t].dwBlockStart, this.uInt32), z(this.cue.points[t].dwSampleOffset, this.uInt32));
		return e;
	}
	getSmplBytes_() {
		let e = [];
		if (this.smpl.chunkId) {
			let t = this.getSmplLoopsBytes_();
			e = e.concat(P(this.smpl.chunkId), z(t.length + 36, this.uInt32), z(this.smpl.dwManufacturer, this.uInt32), z(this.smpl.dwProduct, this.uInt32), z(this.smpl.dwSamplePeriod, this.uInt32), z(this.smpl.dwMIDIUnityNote, this.uInt32), z(this.smpl.dwMIDIPitchFraction, this.uInt32), z(this.smpl.dwSMPTEFormat, this.uInt32), z(this.smpl.dwSMPTEOffset, this.uInt32), z(this.smpl.dwNumSampleLoops, this.uInt32), z(this.smpl.dwSamplerData, this.uInt32), t);
		}
		return this.enforceByteLen_(e), e;
	}
	getSmplLoopsBytes_() {
		let e = [];
		for (let t = 0; t < this.smpl.dwNumSampleLoops; t++) e = e.concat(z(this.smpl.loops[t].dwName, this.uInt32), z(this.smpl.loops[t].dwType, this.uInt32), z(this.smpl.loops[t].dwStart, this.uInt32), z(this.smpl.loops[t].dwEnd, this.uInt32), z(this.smpl.loops[t].dwFraction, this.uInt32), z(this.smpl.loops[t].dwPlayCount, this.uInt32));
		return e;
	}
	getFactBytes_() {
		let e = [];
		return this.fact.chunkId && (e = e.concat(P(this.fact.chunkId), z(this.fact.chunkSize, this.uInt32), z(this.fact.dwSampleLength, this.uInt32))), this.enforceByteLen_(e), e;
	}
	getFmtBytes_() {
		let e = [];
		if (this.fmt.chunkId) {
			let t = e.concat(P(this.fmt.chunkId), z(this.fmt.chunkSize, this.uInt32), z(this.fmt.audioFormat, this.uInt16), z(this.fmt.numChannels, this.uInt16), z(this.fmt.sampleRate, this.uInt32), z(this.fmt.byteRate, this.uInt32), z(this.fmt.blockAlign, this.uInt16), z(this.fmt.bitsPerSample, this.uInt16), this.getFmtExtensionBytes_());
			return this.enforceByteLen_(t), t;
		}
		throw Error("Could not find the \"fmt \" chunk");
	}
	getFmtExtensionBytes_() {
		let e = [];
		return this.fmt.chunkSize > 16 && (e = e.concat(z(this.fmt.cbSize, this.uInt16))), this.fmt.chunkSize > 18 && (e = e.concat(z(this.fmt.validBitsPerSample, this.uInt16))), this.fmt.chunkSize > 20 && (e = e.concat(z(this.fmt.dwChannelMask, this.uInt32))), this.fmt.chunkSize > 24 && (e = e.concat(z(this.fmt.subformat[0], this.uInt32), z(this.fmt.subformat[1], this.uInt32), z(this.fmt.subformat[2], this.uInt32), z(this.fmt.subformat[3], this.uInt32))), e;
	}
	getLISTBytes_() {
		let e = [];
		for (let t = 0; t < this.LIST.length; t++) {
			let n = this.getLISTSubChunksBytes_(this.LIST[t].subChunks, this.LIST[t].format);
			e = e.concat(P(this.LIST[t].chunkId), z(n.length + 4, this.uInt32), P(this.LIST[t].format), n);
		}
		return this.enforceByteLen_(e), e;
	}
	getLISTSubChunksBytes_(e, t) {
		let n = [];
		for (let r = 0, i = e.length; r < i; r++) t == "INFO" ? n = n.concat(this.getLISTINFOSubChunksBytes_(e[r])) : t == "adtl" && (n = n.concat(this.getLISTadtlSubChunksBytes_(e[r]))), this.enforceByteLen_(n);
		return n;
	}
	getLISTINFOSubChunksBytes_(e) {
		let t = [], n = K(e.value, e.value.length);
		return t = t.concat(P(e.chunkId), z(n.length + 1, this.uInt32), n), t.push(0), t;
	}
	getLISTadtlSubChunksBytes_(e) {
		let t = [];
		if (["labl", "note"].indexOf(e.chunkId) > -1) {
			let n = K(e.value, e.value.length);
			t = t.concat(P(e.chunkId), z(n.length + 4 + 1, this.uInt32), z(e.dwName, this.uInt32), n), t.push(0);
		} else e.chunkId == "ltxt" && (t = t.concat(this.getLtxtChunkBytes_(e)));
		return t;
	}
	getLtxtChunkBytes_(e) {
		return [].concat(P(e.chunkId), z(e.value.length + 20, this.uInt32), z(e.dwName, this.uInt32), z(e.dwSampleLength, this.uInt32), z(e.dwPurposeID, this.uInt32), z(e.dwCountry, this.uInt16), z(e.dwLanguage, this.uInt16), z(e.dwDialect, this.uInt16), z(e.dwCodePage, this.uInt16), K(e.value, e.value.length));
	}
	get_PMXBytes_() {
		let e = [];
		if (this._PMX.chunkId) {
			let t = P(this._PMX.value);
			this._PMX.chunkSize = t.length, e = e.concat(P(this._PMX.chunkId), z(this._PMX.chunkSize, this.uInt32), t);
		}
		return this.enforceByteLen_(e), e;
	}
	getJunkBytes_() {
		let e = [];
		return this.junk.chunkId ? e.concat(P(this.junk.chunkId), z(this.junk.chunkData.length, this.uInt32), this.junk.chunkData) : (this.enforceByteLen_(e), e);
	}
	enforceByteLen_(e) {
		e.length % 2 && e.push(0);
	}
};
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/parsers/interleave.js
function de(e) {
	let t = [];
	if (e.length > 0) if (e[0].constructor !== Number) {
		t = new Float64Array(e[0].length * e.length);
		for (let n = 0, r = e[0].length, i = 0; n < r; n++) for (let r = 0, a = e.length; r < a; r++, i++) t[i] = e[r][n];
	} else t = e;
	return t;
}
function fe(e, t, n = Float64Array) {
	let r = [];
	for (let i = 0; i < t; i++) r[i] = new n(e.length / t);
	for (let n = 0; n < t; n++) for (let i = n, a = 0; i < e.length; i += t, a++) r[n][a] = e[i];
	return r;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/validators/validate-num-channels.js
function pe(e, t) {
	let n = e * t / 8;
	return !(e < 1 || n > 65535);
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/validators/validate-sample-rate.js
function q(e, t, n) {
	let r = t / 8 * e * n;
	return !(n < 1 || r > 4294967295);
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/wavefile-creator.js
var me = class extends ue {
	constructor() {
		super(), this.bitDepth = "0", this.dataType = {
			bits: 0,
			be: !1
		}, this.WAV_AUDIO_FORMATS = {
			4: 17,
			8: 1,
			"8a": 6,
			"8m": 7,
			16: 1,
			24: 1,
			32: 1,
			"32f": 3,
			64: 3
		};
	}
	fromScratch(e, t, n, r, i) {
		i ||= {}, this.clearHeaders(), this.newWavFile_(e, t, n, r, i);
	}
	fromBuffer(e, t = !0) {
		super.fromBuffer(e, t), this.bitDepthFromFmt_(), this.updateDataType_();
	}
	toBuffer() {
		return this.validateWavHeader_(), super.toBuffer();
	}
	getSamples(e = !1, t = Float64Array) {
		let n = new t(this.data.samples.length / (this.dataType.bits / 8));
		return L(this.data.samples, this.dataType, n, 0, this.data.samples.length), !e && this.fmt.numChannels > 1 ? fe(n, this.fmt.numChannels, t) : n;
	}
	getSample(e) {
		if (e *= this.dataType.bits / 8, e + this.dataType.bits / 8 > this.data.samples.length) throw Error("Range error");
		return B(this.data.samples.slice(e, e + this.dataType.bits / 8), this.dataType);
	}
	setSample(e, t) {
		if (e *= this.dataType.bits / 8, e + this.dataType.bits / 8 > this.data.samples.length) throw Error("Range error");
		R(t, this.dataType, this.data.samples, e, !0);
	}
	getiXML() {
		return this.iXML.value;
	}
	setiXML(e) {
		if (typeof e != "string") throw TypeError("iXML value must be a string.");
		this.iXML.value = e, this.iXML.chunkId = "iXML";
	}
	get_PMX() {
		return this._PMX.value;
	}
	set_PMX(e) {
		if (typeof e != "string") throw TypeError("_PMX value must be a string.");
		this._PMX.value = e, this._PMX.chunkId = "_PMX";
	}
	newWavFile_(e, t, n, r, i) {
		i.container ||= "RIFF", this.container = i.container, this.bitDepth = n, r = de(r), this.updateDataType_();
		let a = this.dataType.bits / 8;
		this.data.samples = new Uint8Array(r.length * a), I(r, this.dataType, this.data.samples, 0, !0), this.makeWavHeader_(n, e, t, a, this.data.samples.length, i), this.data.chunkId = "data", this.data.chunkSize = this.data.samples.length, this.validateWavHeader_();
	}
	makeWavHeader_(e, t, n, r, i, a) {
		e == "4" ? this.createADPCMHeader_(e, t, n, r, i, a) : e == "8a" || e == "8m" ? this.createALawMulawHeader_(e, t, n, r, i, a) : Object.keys(this.WAV_AUDIO_FORMATS).indexOf(e) == -1 || t > 2 ? this.createExtensibleHeader_(e, t, n, r, i, a) : this.createPCMHeader_(e, t, n, r, i, a);
	}
	createPCMHeader_(e, t, n, r, i, a) {
		this.container = a.container, this.chunkSize = 36 + i, this.format = "WAVE", this.bitDepth = e, this.fmt = {
			chunkId: "fmt ",
			chunkSize: 16,
			audioFormat: this.WAV_AUDIO_FORMATS[e] || 65534,
			numChannels: t,
			sampleRate: n,
			byteRate: t * r * n,
			blockAlign: t * r,
			bitsPerSample: parseInt(e, 10),
			cbSize: 0,
			validBitsPerSample: 0,
			dwChannelMask: 0,
			subformat: []
		};
	}
	createADPCMHeader_(e, t, n, r, i, a) {
		this.createPCMHeader_(e, t, n, r, i, a), this.chunkSize = 40 + i, this.fmt.chunkSize = 20, this.fmt.byteRate = 4055, this.fmt.blockAlign = 256, this.fmt.bitsPerSample = 4, this.fmt.cbSize = 2, this.fmt.validBitsPerSample = 505, this.fact = {
			chunkId: "fact",
			chunkSize: 4,
			dwSampleLength: i * 2
		};
	}
	createExtensibleHeader_(e, t, n, r, i, a) {
		this.createPCMHeader_(e, t, n, r, i, a), this.chunkSize = 60 + i, this.fmt.chunkSize = 40, this.fmt.bitsPerSample = (parseInt(e, 10) - 1 | 7) + 1, this.fmt.cbSize = 22, this.fmt.validBitsPerSample = parseInt(e, 10), this.fmt.dwChannelMask = he(t), this.fmt.subformat = [
			1,
			1048576,
			2852126848,
			1905997824
		];
	}
	createALawMulawHeader_(e, t, n, r, i, a) {
		this.createPCMHeader_(e, t, n, r, i, a), this.chunkSize = 40 + i, this.fmt.chunkSize = 20, this.fmt.cbSize = 2, this.fmt.validBitsPerSample = 8, this.fact = {
			chunkId: "fact",
			chunkSize: 4,
			dwSampleLength: i
		};
	}
	bitDepthFromFmt_() {
		this.fmt.audioFormat === 3 && this.fmt.bitsPerSample === 32 ? this.bitDepth = "32f" : this.fmt.audioFormat === 6 ? this.bitDepth = "8a" : this.fmt.audioFormat === 7 ? this.bitDepth = "8m" : this.bitDepth = this.fmt.bitsPerSample.toString();
	}
	validateBitDepth_() {
		if (!this.WAV_AUDIO_FORMATS[this.bitDepth]) {
			if (parseInt(this.bitDepth, 10) > 8 && parseInt(this.bitDepth, 10) < 54) return !0;
			throw Error("Invalid bit depth.");
		}
		return !0;
	}
	updateDataType_() {
		this.dataType = {
			bits: (parseInt(this.bitDepth, 10) - 1 | 7) + 1,
			fp: this.bitDepth == "32f" || this.bitDepth == "64",
			signed: this.bitDepth != "8",
			be: this.container == "RIFX"
		}, [
			"4",
			"8a",
			"8m"
		].indexOf(this.bitDepth) > -1 && (this.dataType.bits = 8, this.dataType.signed = !1);
	}
	validateWavHeader_() {
		if (this.validateBitDepth_(), !pe(this.fmt.numChannels, this.fmt.bitsPerSample)) throw Error("Invalid number of channels.");
		if (!q(this.fmt.numChannels, this.fmt.bitsPerSample, this.fmt.sampleRate)) throw Error("Invalid sample rate.");
	}
};
function he(e) {
	let t = 0;
	return e === 1 ? t = 4 : e === 2 ? t = 3 : e === 4 ? t = 51 : e === 6 ? t = 63 : e === 8 && (t = 1599), t;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/wavefile-tag-editor.js
var ge = class extends me {
	getTag(e) {
		let t = this.getTagIndex_(e);
		return t.TAG === null ? null : this.LIST[t.LIST].subChunks[t.TAG].value;
	}
	setTag(e, t) {
		e = _e(e);
		let n = this.getTagIndex_(e);
		n.TAG === null ? n.LIST === null ? (this.LIST.push({
			chunkId: "LIST",
			chunkSize: 8 + t.length + 1,
			format: "INFO",
			subChunks: []
		}), this.LIST[this.LIST.length - 1].subChunks.push({
			chunkId: e,
			chunkSize: t.length + 1,
			value: t
		})) : this.LIST[n.LIST].subChunks.push({
			chunkId: e,
			chunkSize: t.length + 1,
			value: t
		}) : (this.LIST[n.LIST].subChunks[n.TAG].chunkSize = t.length + 1, this.LIST[n.LIST].subChunks[n.TAG].value = t);
	}
	deleteTag(e) {
		let t = this.getTagIndex_(e);
		return t.TAG === null ? !1 : (this.LIST[t.LIST].subChunks.splice(t.TAG, 1), !0);
	}
	listTags() {
		let e = this.getLISTIndex("INFO"), t = {};
		if (e !== null) for (let n = 0, r = this.LIST[e].subChunks.length; n < r; n++) t[this.LIST[e].subChunks[n].chunkId] = this.LIST[e].subChunks[n].value;
		return t;
	}
	getLISTIndex(e) {
		for (let t = 0, n = this.LIST.length; t < n; t++) if (this.LIST[t].format == e) return t;
		return null;
	}
	getTagIndex_(e) {
		let t = {
			LIST: null,
			TAG: null
		};
		for (let n = 0, r = this.LIST.length; n < r; n++) if (this.LIST[n].format == "INFO") {
			t.LIST = n;
			for (let r = 0, i = this.LIST[n].subChunks.length; r < i; r++) if (this.LIST[n].subChunks[r].chunkId == e) {
				t.TAG = r;
				break;
			}
			break;
		}
		return t;
	}
};
function _e(e) {
	if (e.constructor !== String) throw Error("Invalid tag name.");
	if (e.length < 4) for (let t = 0, n = 4 - e.length; t < n; t++) e += " ";
	return e;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/wavefile-cue-editor.js
var J = class extends ge {
	listCuePoints() {
		let e = this.getCuePoints_();
		for (let t = 0, n = e.length; t < n; t++) e[t].position = e[t].dwSampleOffset / this.fmt.sampleRate * 1e3, e[t].dwSampleLength ? (e[t].end = e[t].dwSampleLength / this.fmt.sampleRate * 1e3, e[t].end += e[t].position) : e[t].end = null, delete e[t].value;
		return e;
	}
	setCuePoint(e) {
		this.cue.chunkId = "cue ", e.label ||= "";
		let t = this.getCuePoints_();
		this.clearLISTadtl_(), this.cue.points = [], e.dwSampleOffset = e.position * this.fmt.sampleRate / 1e3, e.dwSampleLength = 0, e.end && (e.dwSampleLength = e.end * this.fmt.sampleRate / 1e3 - e.dwSampleOffset), t.length === 0 ? this.setCuePoint_(e, 1) : this.setCuePointInOrder_(t, e), this.cue.dwCuePoints = this.cue.points.length;
	}
	deleteCuePoint(e) {
		this.cue.chunkId = "cue ";
		let t = this.getCuePoints_();
		this.clearLISTadtl_();
		let n = this.cue.points.length;
		this.cue.points = [];
		for (let r = 0; r < n; r++) r + 1 !== e && this.setCuePoint_(t[r], r + 1);
		this.cue.dwCuePoints = this.cue.points.length, this.cue.dwCuePoints ? this.cue.chunkId = "cue " : (this.cue.chunkId = "", this.clearLISTadtl_());
	}
	updateLabel(e, t) {
		let n = this.getLISTIndex("adtl");
		if (n !== null) for (let r = 0, i = this.LIST[n].subChunks.length; r < i; r++) this.LIST[n].subChunks[r].dwName == e && (this.LIST[n].subChunks[r].value = t);
	}
	getCuePoints_() {
		let e = [];
		for (let t = 0; t < this.cue.points.length; t++) {
			let n = this.cue.points[t], r = this.getDataForCuePoint_(n.dwName);
			r.label = r.value ? r.value : "", r.dwPosition = n.dwPosition, r.fccChunk = n.fccChunk, r.dwChunkStart = n.dwChunkStart, r.dwBlockStart = n.dwBlockStart, r.dwSampleOffset = n.dwSampleOffset, e.push(r);
		}
		return e;
	}
	getDataForCuePoint_(e) {
		let t = this.getLISTIndex("adtl"), n = {};
		return t !== null && this.getCueDataFromLIST_(n, t, e), n;
	}
	getCueDataFromLIST_(e, t, n) {
		for (let r = 0, i = this.LIST[t].subChunks.length; r < i; r++) if (this.LIST[t].subChunks[r].dwName == n) {
			let n = this.LIST[t].subChunks[r];
			e.value = n.value || e.value, e.dwName = n.dwName || 0, e.dwSampleLength = n.dwSampleLength || 0, e.dwPurposeID = n.dwPurposeID || 0, e.dwCountry = n.dwCountry || 0, e.dwLanguage = n.dwLanguage || 0, e.dwDialect = n.dwDialect || 0, e.dwCodePage = n.dwCodePage || 0;
		}
	}
	setCuePoint_(e, t) {
		this.cue.points.push({
			dwName: t,
			dwPosition: e.dwPosition ? e.dwPosition : 0,
			fccChunk: e.fccChunk ? e.fccChunk : "data",
			dwChunkStart: e.dwChunkStart ? e.dwChunkStart : 0,
			dwBlockStart: e.dwBlockStart ? e.dwBlockStart : 0,
			dwSampleOffset: e.dwSampleOffset
		}), this.setLabl_(e, t);
	}
	setCuePointInOrder_(e, t) {
		let n = !1;
		for (let r = 0; r < e.length; r++) e[r].dwSampleOffset > t.dwSampleOffset && !n ? (this.setCuePoint_(t, r + 1), this.setCuePoint_(e[r], r + 2), n = !0) : this.setCuePoint_(e[r], n ? r + 2 : r + 1);
		n || this.setCuePoint_(t, this.cue.points.length + 1);
	}
	clearLISTadtl_() {
		for (let e = 0, t = this.LIST.length; e < t; e++) this.LIST[e].format == "adtl" && this.LIST.splice(e);
	}
	setLabl_(e, t) {
		let n = this.getLISTIndex("adtl");
		n === null && (this.LIST.push({
			chunkId: "LIST",
			chunkSize: 4,
			format: "adtl",
			subChunks: []
		}), n = this.LIST.length - 1), this.setLabelText_(n, e, t), e.dwSampleLength && this.setLtxtChunk_(n, e, t);
	}
	setLabelText_(e, t, n) {
		this.LIST[e].subChunks.push({
			chunkId: "labl",
			chunkSize: 4,
			dwName: n,
			value: t.label
		}), this.LIST[e].chunkSize += 12;
	}
	setLtxtChunk_(e, t, n) {
		this.LIST[e].subChunks.push({
			chunkId: "ltxt",
			chunkSize: 20,
			dwName: n,
			dwSampleLength: t.dwSampleLength,
			dwPurposeID: t.dwPurposeID || 0,
			dwCountry: t.dwCountry || 0,
			dwLanguage: t.dwLanguage || 0,
			dwDialect: t.dwDialect || 0,
			dwCodePage: t.dwCodePage || 0,
			value: t.label
		}), this.LIST[e].chunkSize += 28;
	}
}, ve = class {
	constructor(e, t, n) {
		this.length_ = e, this.scaleFactor_ = (e - 1) / t, this.interpolate = this.sinc, n.method === "point" ? this.interpolate = this.point : n.method === "linear" ? this.interpolate = this.linear : n.method === "cubic" && (this.interpolate = this.cubic), this.tangentFactor_ = 1 - Math.max(0, Math.min(1, n.tension || 0)), this.sincFilterSize_ = n.sincFilterSize || 1, this.kernel_ = be(n.sincWindow || ye);
	}
	point(e, t) {
		return this.getClippedInput_(Math.round(this.scaleFactor_ * e), t);
	}
	linear(e, t) {
		e = this.scaleFactor_ * e;
		let n = Math.floor(e);
		return e -= n, (1 - e) * this.getClippedInput_(n, t) + e * this.getClippedInput_(n + 1, t);
	}
	cubic(e, t) {
		e = this.scaleFactor_ * e;
		let n = Math.floor(e), r = [this.getTangent_(n, t), this.getTangent_(n + 1, t)], i = [this.getClippedInput_(n, t), this.getClippedInput_(n + 1, t)];
		e -= n;
		let a = e * e, o = e * a;
		return (2 * o - 3 * a + 1) * i[0] + (o - 2 * a + e) * r[0] + (-2 * o + 3 * a) * i[1] + (o - a) * r[1];
	}
	sinc(e, t) {
		e = this.scaleFactor_ * e;
		let n = Math.floor(e), r = n - this.sincFilterSize_ + 1, i = n + this.sincFilterSize_, a = 0;
		for (let n = r; n <= i; n++) a += this.kernel_(e - n) * this.getClippedInput_(n, t);
		return a;
	}
	getTangent_(e, t) {
		return this.tangentFactor_ * (this.getClippedInput_(e + 1, t) - this.getClippedInput_(e - 1, t)) / 2;
	}
	getClippedInput_(e, t) {
		return 0 <= e && e < this.length_ ? t[e] : 0;
	}
};
function ye(e) {
	return Math.exp(-e / 2 * e / 2);
}
function be(e) {
	return function(t) {
		return xe(t) * e(t);
	};
}
function xe(e) {
	return e === 0 ? 1 : Math.sin(Math.PI * e) / (Math.PI * e);
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/resampler/fir-lpf.js
var Y = class {
	constructor(e, t, n) {
		let r = 2 * Math.PI * n / t, i = 0;
		this.filters = [];
		for (let t = 0; t <= e; t++) t - e / 2 == 0 ? this.filters[t] = r : (this.filters[t] = Math.sin(r * (t - e / 2)) / (t - e / 2), this.filters[t] *= .54 - .46 * Math.cos(2 * Math.PI * t / e)), i += this.filters[t];
		for (let t = 0; t <= e; t++) this.filters[t] /= i;
		this.z = this.initZ_();
	}
	filter(e) {
		this.z.buf[this.z.pointer] = e;
		let t = 0;
		for (let e = 0, n = this.z.buf.length; e < n; e++) t += this.filters[e] * this.z.buf[(this.z.pointer + e) % this.z.buf.length];
		return this.z.pointer = (this.z.pointer + 1) % this.z.buf.length, t;
	}
	reset() {
		this.z = this.initZ_();
	}
	initZ_() {
		let e = [];
		for (let t = 0; t < this.filters.length - 1; t++) e.push(0);
		return {
			buf: e,
			pointer: 0
		};
	}
}, Se = class {
	constructor(e, t, n) {
		let r = [];
		for (let i = 0; i < e; i++) r.push(this.getCoeffs_({
			Fs: t,
			Fc: n,
			Q: .5 / Math.sin(Math.PI / (e * 2) * (i + .5))
		}));
		this.stages = [];
		for (let e = 0; e < r.length; e++) this.stages[e] = {
			b0: r[e].b[0],
			b1: r[e].b[1],
			b2: r[e].b[2],
			a1: r[e].a[0],
			a2: r[e].a[1],
			k: r[e].k,
			z: [0, 0]
		};
	}
	filter(e) {
		let t = e;
		for (let e = 0, n = this.stages.length; e < n; e++) t = this.runStage_(e, t);
		return t;
	}
	getCoeffs_(e) {
		let t = {};
		t.a = [], t.b = [];
		let n = this.preCalc_(e, t);
		return t.k = 1, t.b.push((1 - n.cw) / (2 * n.a0)), t.b.push(2 * t.b[0]), t.b.push(t.b[0]), t;
	}
	preCalc_(e, t) {
		let n = {}, r = 2 * Math.PI * e.Fc / e.Fs;
		return n.alpha = Math.sin(r) / (2 * e.Q), n.cw = Math.cos(r), n.a0 = 1 + n.alpha, t.a0 = n.a0, t.a.push(-2 * n.cw / n.a0), t.k = 1, t.a.push((1 - n.alpha) / n.a0), n;
	}
	runStage_(e, t) {
		let n = t * this.stages[e].k - this.stages[e].a1 * this.stages[e].z[0] - this.stages[e].a2 * this.stages[e].z[1], r = this.stages[e].b0 * n + this.stages[e].b1 * this.stages[e].z[0] + this.stages[e].b2 * this.stages[e].z[1];
		return this.stages[e].z[1] = this.stages[e].z[0], this.stages[e].z[0] = n, r;
	}
	reset() {
		for (let e = 0; e < this.stages.length; e++) this.stages[e].z = [0, 0];
	}
}, Ce = {
	point: !1,
	linear: !1,
	cubic: !0,
	sinc: !0
}, X = {
	IIR: 16,
	FIR: 71
}, we = {
	IIR: Se,
	FIR: Y
};
function Z(e, t, n, r = null) {
	r ||= {};
	let i = (n - t) / t + 1, a = new Float64Array(e.length * i);
	r.method = r.method || "cubic";
	let o = new ve(e.length, a.length, {
		method: r.method,
		tension: r.tension || 0,
		sincFilterSize: r.sincFilterSize || 6,
		sincWindow: r.sincWindow || void 0,
		clip: r.clip || "mirror"
	});
	if (r.LPF === void 0 && (r.LPF = Ce[r.method]), r.LPF) {
		r.LPFType = r.LPFType || "IIR";
		let i = we[r.LPFType];
		n > t ? Te(e, a, o, new i(r.LPForder || X[r.LPFType], n, t / 2)) : Ee(e, a, o, new i(r.LPForder || X[r.LPFType], t, n / 2));
	} else Q(e, a, o);
	return a;
}
function Q(e, t, n) {
	for (let r = 0, i = t.length; r < i; r++) t[r] = n.interpolate(r, e);
}
function Te(e, t, n, r) {
	for (let i = 0, a = t.length; i < a; i++) t[i] = r.filter(n.interpolate(i, e));
	r.reset();
	for (let e = t.length - 1; e >= 0; e--) t[e] = r.filter(t[e]);
}
function Ee(e, t, n, r) {
	for (let t = 0, n = e.length; t < n; t++) e[t] = r.filter(e[t]);
	r.reset();
	for (let t = e.length - 1; t >= 0; t--) e[t] = r.filter(e[t]);
	Q(e, t, n);
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/lib/wavefile-converter.js
var De = class extends J {
	toRIFF() {
		let e = new Float64Array($(this.data.samples.length, this.dataType.bits / 8));
		L(this.data.samples, this.dataType, e, 0, this.data.samples.length), this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, this.bitDepth, e, { container: "RIFF" });
	}
	toRIFX() {
		let e = new Float64Array($(this.data.samples.length, this.dataType.bits / 8));
		L(this.data.samples, this.dataType, e, 0, this.data.samples.length), this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, this.bitDepth, e, { container: "RIFX" });
	}
	toIMAADPCM() {
		if (this.fmt.sampleRate !== 8e3) throw Error("Only 8000 Hz files can be compressed as IMA-ADPCM.");
		if (this.fmt.numChannels !== 1) throw Error("Only mono files can be compressed as IMA-ADPCM.");
		{
			this.assure16Bit_();
			let e = new Int16Array($(this.data.samples.length, 2));
			L(this.data.samples, this.dataType, e, 0, this.data.samples.length), this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, "4", f(e), { container: this.correctContainer_() });
		}
	}
	fromIMAADPCM(e = "16") {
		this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, "16", p(this.data.samples, this.fmt.blockAlign), { container: this.correctContainer_() }), e != "16" && this.toBitDepth(e);
	}
	toALaw() {
		this.assure16Bit_();
		let e = new Int16Array($(this.data.samples.length, 2));
		L(this.data.samples, this.dataType, e, 0, this.data.samples.length), this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, "8a", ie(e), { container: this.correctContainer_() });
	}
	fromALaw(e = "16") {
		this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, "16", x(this.data.samples), { container: this.correctContainer_() }), e != "16" && this.toBitDepth(e);
	}
	toMuLaw() {
		this.assure16Bit_();
		let e = new Int16Array($(this.data.samples.length, 2));
		L(this.data.samples, this.dataType, e, 0, this.data.samples.length), this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, "8m", ae(e), { container: this.correctContainer_() });
	}
	fromMuLaw(e = "16") {
		this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, "16", oe(this.data.samples), { container: this.correctContainer_() }), e != "16" && this.toBitDepth(e);
	}
	toBitDepth(e, t = !0) {
		let n = e, i = this.bitDepth;
		t || (e != "32f" && (n = this.dataType.bits.toString()), i = "" + this.dataType.bits), this.assureUncompressed_();
		let a = this.getSamples(!0), o = new Float64Array(a.length);
		r(a, i, o, n), this.fromExisting_(this.fmt.numChannels, this.fmt.sampleRate, e, o, { container: this.correctContainer_() });
	}
	toSampleRate(e, t) {
		this.validateResample_(e);
		let n = this.getSamples(), r = [];
		if (n.constructor === Float64Array) r = Z(n, this.fmt.sampleRate, e, t);
		else for (let i = 0; i < n.length; i++) r.push(Z(n[i], this.fmt.sampleRate, e, t));
		this.fromExisting_(this.fmt.numChannels, e, this.bitDepth, r, { container: this.correctContainer_() });
	}
	validateResample_(e) {
		if (!q(this.fmt.numChannels, this.fmt.bitsPerSample, e)) throw Error("Invalid sample rate.");
		if ([
			"4",
			"8a",
			"8m"
		].indexOf(this.bitDepth) > -1) throw Error("wavefile can't change the sample rate of compressed files.");
	}
	assure16Bit_() {
		this.assureUncompressed_(), this.bitDepth != "16" && this.toBitDepth("16");
	}
	assureUncompressed_() {
		this.bitDepth == "8a" ? this.fromALaw() : this.bitDepth == "8m" ? this.fromMuLaw() : this.bitDepth == "4" && this.fromIMAADPCM();
	}
	correctContainer_() {
		return this.container == "RF64" ? "RIFF" : this.container;
	}
	fromExisting_(e, t, n, r, i) {
		let a = new J();
		Object.assign(this.fmt, a.fmt), Object.assign(this.fact, a.fact), Object.assign(this.ds64, a.ds64), Object.assign(this.data, a.data), this.newWavFile_(e, t, n, r, i);
	}
};
function $(e, t) {
	let n = e / t;
	return n % 2 && n++, n;
}
//#endregion
//#region node_modules/.pnpm/wavefile@11.0.0/node_modules/wavefile/index.js
var Oe = class extends De {
	constructor(e) {
		super(), e && this.fromBuffer(e);
	}
	fromBase64(e) {
		this.fromBuffer(n(e));
	}
	toBase64() {
		return t(this.toBuffer());
	}
	toDataURI() {
		return "data:audio/wav;base64," + this.toBase64();
	}
	fromDataURI(e) {
		this.fromBase64(e.replace("data:audio/wav;base64,", ""));
	}
};
//#endregion
export { Oe as WaveFile };
