/*
Quaternion.js v1.1.0 22/02/2016

Copyright (c) 2016, Robert Eisele (robert@xarg.org)
Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function (w) {
    function u(a, b) {
        var c = Math.abs(a),
            e = Math.abs(b);
        return 0 === a ? Math.log(e) : 0 === b ? Math.log(c) : 3e3 > c && 3e3 > e ? 0.5 * Math.log(a * a + b * b) : Math.log(a / Math.cos(Math.atan2(b, a)));
    }
    function q(a, b, c, e, d) {
        if (void 0 !== d) (a.w = b), (a.x = c), (a.y = e), (a.z = d);
        else {
            if ("object" === typeof b && void 0 === e) {
                if ("w" in b || "x" in b || "y" in b || "z" in b) {
                    a.w = b.w || 0;
                    a.x = b.x || 0;
                    a.y = b.y || 0;
                    a.z = b.z || 0;
                    return;
                }
                if ("re" in b && "im" in b) {
                    a.w = b.re;
                    a.x = b.im;
                    a.y = 0;
                    a.z = 0;
                    return;
                }
                if (4 === b.length) {
                    a.w = b[0];
                    a.x = b[1];
                    a.y = b[2];
                    a.z = b[3];
                    return;
                }
                if (3 === b.length) {
                    a.w = 0;
                    a.x = b[0];
                    a.y = b[1];
                    a.z = b[2];
                    return;
                }
                throw Error("Invalid object");
            }
            if ("string" === typeof b && void 0 === e) {
                b = b.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
                var f = 1;
                c = 0;
                e = { i: "x", j: "y", k: "z" };
                if (null === b) throw Error("Parse error");
                for (d = a.w = a.x = a.y = a.z = 0; d < b.length; d++) {
                    var g = b[d],
                        h = b[d + 1];
                    if (" " !== g && "\t" !== g && "\n" !== g)
                        if ("+" === g) f++;
                        else if ("-" === g) c++;
                        else {
                            if (0 === f + c) throw Error("Parse error" + g);
                            f = e[g];
                            if (void 0 !== f) " " === h || isNaN(h) ? (g = "1") : ((g = h), d++);
                            else {
                                if (isNaN(g)) throw Error("Parser error");
                                f = e[h];
                                void 0 !== f && d++;
                            }
                            a[f || "w"] += parseFloat((c % 2 ? "-" : "") + g);
                            f = c = 0;
                        }
                }
                if (0 < f + c) throw Error("Parser error");
            } else void 0 === b && a !== k ? ((a.w = 1), (a.x = a.y = a.z = 0)) : ((a.w = b || 0), c && 3 === c.length ? ((a.x = c[0]), (a.y = c[1]), (a.z = c[2])) : ((a.x = c || 0), (a.y = e || 0), (a.z = d || 0)));
        }
    }
    function r(a, b, c) {
        var e = "";
        if (0 !== a) {
            "" !== c ? (e += 0 > a ? " - " : " + ") : 0 > a && (e += "-");
            a = Math.abs(a);
            if (1 !== a || "" === b) e += a;
            e += b;
        }
        return e;
    }
    function h(a, b, c, e) {
        if (!(this instanceof h)) return new h(a, b, c, e);
        q(this, a, b, c, e);
    }
    var k = { w: 1, x: 0, y: 0, z: 0 };
    h.prototype = {
        w: 1,
        x: 0,
        y: 0,
        z: 0,
        add: function (a, b, c, e) {
            q(k, a, b, c, e);
            return new h(this.w + k.w, this.x + k.x, this.y + k.y, this.z + k.z);
        },
        sub: function (a, b, c, e) {
            q(k, a, b, c, e);
            return new h(this.w - k.w, this.x - k.x, this.y - k.y, this.z - k.z);
        },
        neg: function () {
            return new h(-this.w, -this.x, -this.y, -this.z);
        },
        norm: function () {
            var a = this.w,
                b = this.x,
                c = this.y,
                e = this.z;
            return Math.sqrt(a * a + b * b + c * c + e * e);
        },
        normSq: function () {
            var a = this.w,
                b = this.x,
                c = this.y,
                e = this.z;
            return a * a + b * b + c * c + e * e;
        },
        normalize: function () {
            var a = this.w,
                b = this.x,
                c = this.y,
                e = this.z,
                d = Math.sqrt(a * a + b * b + c * c + e * e);
            if (d < h.EPSILON) return h.ZERO;
            d = 1 / d;
            return new h(a * d, b * d, c * d, e * d);
        },
        mul: function (a, b, c, e) {
            q(k, a, b, c, e);
            a = this.w;
            b = this.x;
            c = this.y;
            e = this.z;
            var d = k.w,
                f = k.x,
                g = k.y,
                m = k.z;
            return new h(a * d - b * f - c * g - e * m, a * f + b * d + c * m - e * g, a * g + c * d + e * f - b * m, a * m + e * d + b * g - c * f);
        },
        scale: function (a) {
            return new h(this.w * a, this.x * a, this.y * a, this.z * a);
        },
        dot: function (a, b, c, e) {
            q(k, a, b, c, e);
            return this.w * k.w + this.x * k.x + this.y * k.y + this.z * k.z;
        },
        inverse: function () {
            var a = this.w,
                b = this.x,
                c = this.y,
                e = this.z,
                d = a * a + b * b + c * c + e * e;
            if (0 === d) return h.ZERO;
            d = 1 / d;
            return new h(a * d, -b * d, -c * d, -e * d);
        },
        div: function (a, b, c, e) {
            q(k, a, b, c, e);
            a = this.w;
            b = this.x;
            c = this.y;
            e = this.z;
            var d = k.w,
                f = k.x,
                g = k.y,
                m = k.z,
                n = d * d + f * f + g * g + m * m;
            if (0 === n) return h.ZERO;
            n = 1 / n;
            return new h((a * d + b * f + c * g + e * m) * n, (b * d - a * f - c * m + e * g) * n, (c * d - a * g - e * f + b * m) * n, (e * d - a * m - b * g + c * f) * n);
        },
        conjugate: function () {
            return new h(this.w, -this.x, -this.y, -this.z);
        },
        exp: function () {
            var a = this.x,
                b = this.y,
                c = this.z,
                e = Math.sqrt(a * a + b * b + c * c),
                d = Math.exp(this.w),
                f = (d / e) * Math.sin(e);
            return 0 === e ? new h(d, 0, 0, 0) : new h(d * Math.cos(e), a * f, b * f, c * f);
        },
        log: function () {
            var a = this.w,
                b = this.x,
                c = this.y,
                e = this.z;
            if (0 === c && 0 === e) return new h(u(a, b), Math.atan2(b, a), 0, 0);
            var d = Math.sqrt(b * b + c * c + e * e);
            d = Math.atan2(d, a) / d;
            return new h(0.5 * Math.log(b * b + c * c + e * e + a * a), b * d, c * d, e * d);
        },
        pow: function (a, b, c, e) {
            q(k, a, b, c, e);
            if (0 === k.y && 0 === k.z) {
                if (1 === k.w && 0 === k.x) return this;
                if (0 === k.w && 0 === k.x) return h.ONE;
                if (0 === this.y && 0 === this.z) {
                    a = this.w;
                    b = this.x;
                    if (0 === a && 0 === b) return h.ZERO;
                    c = Math.atan2(b, a);
                    e = u(a, b);
                    if (0 === k.x) {
                        if (0 === b && 0 <= a) return new h(Math.pow(a, k.w), 0, 0, 0);
                        if (0 === a)
                            switch (k.w % 4) {
                                case 0:
                                    return new h(Math.pow(b, k.w), 0, 0, 0);
                                case 1:
                                    return new h(0, Math.pow(b, k.w), 0, 0);
                                case 2:
                                    return new h(-Math.pow(b, k.w), 0, 0, 0);
                                case 3:
                                    return new h(0, -Math.pow(b, k.w), 0, 0);
                            }
                    }
                    a = Math.exp(k.w * e - k.x * c);
                    b = k.x * e + k.w * c;
                    return new h(a * Math.cos(b), a * Math.sin(b), 0, 0);
                }
            }
            return this.log().a(k).exp();
        },
        equals: function (a, b, c, e) {
            q(k, a, b, c, e);
            a = h.EPSILON;
            return Math.abs(k.w - this.w) < a && Math.abs(k.x - this.x) < a && Math.abs(k.y - this.y) < a && Math.abs(k.z - this.z) < a;
        },
        isFinite: function () {
            return isFinite(this.w) && isFinite(this.x) && isFinite(this.y) && isFinite(this.z);
        },
        isNaN: function () {
            return isNaN(this.w) || isNaN(this.x) || isNaN(this.y) || isNaN(this.z);
        },
        toString: function () {
            var a = this.w,
                b = this.x,
                c = this.y,
                e = this.z;
            if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(e)) return "NaN";
            a = r(a, "", "");
            a += r(b, "i", a);
            a += r(c, "j", a);
            a += r(e, "k", a);
            return "" === a ? "0" : a;
        },
        real: function () {
            return this.w;
        },
        imag: function () {
            return [this.x, this.y, this.z];
        },
        toVector: function () {
            return [this.w, this.x, this.y, this.z];
        },
        toMatrix: function (a) {
            var b = this.w,
                c = this.x,
                e = this.y,
                d = this.z,
                f = b * b + c * c + e * e + d * d,
                g = 0 === f ? 0 : 2 / f;
            f = g * b * c;
            var h = g * b * e;
            b = g * b * d;
            var k = g * c * c,
                l = g * c * e;
            c = g * c * d;
            var p = g * e * e;
            e = g * e * d;
            d *= g * d;
            return a
                ? [
                      [1 - (p + d), l - b, c + h],
                      [l + b, 1 - (k + d), e - f],
                      [c - h, e + f, 1 - (k + p)],
                  ]
                : [1 - (p + d), l - b, c + h, l + b, 1 - (k + d), e - f, c - h, e + f, 1 - (k + p)];
        },
        toMatrix4: function (a) {
            var b = this.w,
                c = this.x,
                e = this.y,
                d = this.z,
                f = b * b + c * c + e * e + d * d,
                g = 0 === f ? 0 : 2 / f;
            f = g * b * c;
            var h = g * b * e;
            b = g * b * d;
            var k = g * c * c,
                l = g * c * e;
            c = g * c * d;
            var p = g * e * e;
            e = g * e * d;
            d *= g * d;
            return a
                ? [
                      [1 - (p + d), l - b, c + h, 0],
                      [l + b, 1 - (k + d), e - f, 0],
                      [c - h, e + f, 1 - (k + p), 0],
                      [0, 0, 0, 1],
                  ]
                : [1 - (p + d), l - b, c + h, 0, l + b, 1 - (k + d), e - f, 0, c - h, e + f, 1 - (k + p), 0, 0, 0, 0, 1];
        },
        clone: function () {
            return new h(this);
        },
        rotateVector: function (a) {
            var b = this.w,
                c = this.x,
                e = this.y,
                d = this.z,
                f = a[0],
                g = a[1],
                h = a[2];
            a = -c * f - e * g - d * h;
            var k = b * f + e * h - d * g,
                l = b * g + d * f - c * h;
            f = b * h + c * g - e * f;
            return [k * b - a * c - l * d + f * e, l * b - a * e - f * c + k * d, f * b - a * d - k * e + l * c];
        },
        slerp: function (a, b, c, e) {
            q(k, a, b, c, e);
            var d = this.w,
                f = this.x,
                g = this.y,
                m = this.z,
                n = k.w,
                l = k.x,
                p = k.y,
                r = k.z,
                t = d * n + f * l + g * p + m * r;
            0 > t && ((d = -d), (f = -f), (g = -g), (m = -m), (t = -t));
            if (0.9995 < t)
                return function (a) {
                    return new h(d + a * (n - d), f + a * (l - f), g + a * (p - g), m + a * (r - m)).normalize();
                };
            var u = Math.acos(t),
                v = Math.sin(u);
            return function (a) {
                var b = u * a;
                a = Math.sin(b);
                b = Math.cos(b) - (t * a) / v;
                a /= v;
                return new h(b * d + a * n, b * f + a * l, b * g + a * p, b * m + a * r);
            };
        },
    };
    h.ZERO = new h(0, 0, 0, 0);
    h.ONE = new h(1, 0, 0, 0);
    h.I = new h(0, 1, 0, 0);
    h.J = new h(0, 0, 1, 0);
    h.K = new h(0, 0, 0, 1);
    h.EPSILON = 1e-16;
    h.fromAxisAngle = function (a, b) {
        var c = 0.5 * b,
            e = a[0],
            d = a[1],
            f = a[2],
            g = Math.sin(c) / Math.sqrt(e * e + d * d + f * f);
        return new h(Math.cos(c), e * g, d * g, f * g);
    };
    h.fromBetweenVectors = function (a, b) {
        var c = a[0],
            e = a[1],
            d = a[2],
            f = b[0],
            g = b[1],
            k = b[2],
            n = c * f + e * g + d * k,
            l = e * k - d * g;
        d = d * f - c * k;
        c = c * g - e * f;
        return new h(n + Math.sqrt(n * n + l * l + d * d + c * c), l, d, c).normalize();
    };
    h.fromEuler = function (a, b, c, e) {
        var d = 0.5 * b,
            f = 0.5 * c,
            g = 0.5 * a;
        a = Math.cos(d);
        c = Math.cos(f);
        b = Math.cos(g);
        d = Math.sin(d);
        f = Math.sin(f);
        g = Math.sin(g);
        return void 0 === e || "ZXY" === e
            ? new h(a * c * b - d * f * g, d * c * b - a * f * g, a * f * b + d * c * g, a * c * g + d * f * b)
            : "XYZ" === e
            ? new h(a * c * b - d * f * g, d * c * b + a * f * g, a * f * b - d * c * g, a * c * g + d * f * b)
            : "YXZ" === e
            ? new h(a * c * b + d * f * g, d * c * b + a * f * g, a * f * b - d * c * g, a * c * g - d * f * b)
            : "ZYX" === e
            ? new h(a * c * b + d * f * g, d * c * b - a * f * g, a * f * b + d * c * g, a * c * g - d * f * b)
            : "YZX" === e
            ? new h(a * c * b - d * f * g, d * c * b + a * f * g, a * f * b + d * c * g, a * c * g - d * f * b)
            : "XZY" === e
            ? new h(a * c * b + d * f * g, d * c * b - a * f * g, a * f * b - d * c * g, a * c * g + d * f * b)
            : null;
    };
    "function" === typeof define && define.amd
        ? define([], function () {
              return h;
          })
        : "object" === typeof exports
        ? (Object.defineProperty(exports, "__esModule", { value: !0 }), (h["default"] = h), (h.Quaternion = h), (module.exports = h))
        : (w.Quaternion = h);
})(this);
