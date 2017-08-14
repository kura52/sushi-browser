require.config({
        paths: {
            jquery: "../assets/vendor/jquery/js/jquery",
            underscore: "../assets/vendor/underscore/js/underscore",
            backbone: "../assets/vendor/backbone/js/backbone",
            text: "../assets/vendor/text/js/text",
            handlebars: "../assets/vendor/handlebars/js/handlebars",
            log4javascript: "../assets/vendor/log4javascript/js/log4javascript",
            sprintf: "../assets/vendor/sprintf/js/sprintf",
            jsziptools: "../assets/vendor/jsziptools/js/jsziptools.min",
            spin: "../assets/vendor/spin.js/js/spin",
            iscroll: "../assets/vendor/iscroll/js/iscroll-min",
            promise: "../assets/vendor/bluebird/index",
            progressbar: "../assets/vendor/bootstrap-progressbar/js/bootstrap-progressbar.min",
            pdfjs: "../assets/app/pdfjs/js/pdf",
            pdfjs_compatibility: "../assets/app/pdfjs/js/compatibility",
            unrar: "../assets/app/unrarlib/js/unrar.min",
            tiff: "../assets/app/tiff/js/tiff.min",
            jquerymobile: "../assets/app/jquery-mobile/js/jquery.mobile-1.4.0-rc.1.min",
            dropbox: "https://www.dropbox.com/static/api/1/dropins",
            gapi: "https://apis.google.com/js/api",
            gclient: "https://apis.google.com/js/client"
        },
        shim: {
            underscore: {
                exports: "_"
            },
            backbone: {
                deps: ["underscore", "jquery"],
                exports: "Backbone"
            },
            handlebars: {
                exports: "Handlebars"
            },
            pdfjs_compatibility: {
                exports: "PDFJS"
            },
            pdfjs: {
                deps: ["pdfjs_compatibility"],
                exports: "PDFJS"
            },
            log4javascript: {
                exports: "log4javascript"
            },
            sprintf: {
                exports: "sprintf"
            },
            jsziptools: {
                exports: "jz"
            },
            iscroll: {
                exports: "IScroll"
            },
            progressbar: {
                deps: ["jquery"]
            },
            dropbox: {
                exports: "Dropbox"
            },
            gapi: {
                exports: "gapi"
            },
            gclient: {
                exports: "gapi"
            }
        }
    }), define("config", function() {}),
    function(window, undefined) {
        function isArraylike(e) {
            var t = e.length,
                n = jQuery.type(e);
            return jQuery.isWindow(e) ? !1 : e.nodeType === 1 && t ? !0 : n === "array" || n !== "function" && (t === 0 || typeof t == "number" && t > 0 && t - 1 in e)
        }

        function createOptions(e) {
            var t = optionsCache[e] = {};
            return jQuery.each(e.match(core_rnotwhite) || [], function(e, n) {
                t[n] = !0
            }), t
        }

        function Data() {
            Object.defineProperty(this.cache = {}, 0, {
                get: function() {
                    return {}
                }
            }), this.expando = jQuery.expando + Math.random()
        }

        function dataAttr(e, t, n) {
            var r;
            if (n === undefined && e.nodeType === 1) {
                r = "data-" + t.replace(rmultiDash, "-$1").toLowerCase(), n = e.getAttribute(r);
                if (typeof n == "string") {
                    try {
                        n = n === "true" ? !0 : n === "false" ? !1 : n === "null" ? null : +n + "" === n ? +n : rbrace.test(n) ? JSON.parse(n) : n
                    } catch (i) {}
                    data_user.set(e, t, n)
                } else n = undefined
            }
            return n
        }

        function returnTrue() {
            return !0
        }

        function returnFalse() {
            return !1
        }

        function safeActiveElement() {
            try {
                return document.activeElement
            } catch (e) {}
        }

        function sibling(e, t) {
            while ((e = e[t]) && e.nodeType !== 1);
            return e
        }

        function winnow(e, t, n) {
            if (jQuery.isFunction(t)) return jQuery.grep(e, function(e, r) {
                return !!t.call(e, r, e) !== n
            });
            if (t.nodeType) return jQuery.grep(e, function(e) {
                return e === t !== n
            });
            if (typeof t == "string") {
                if (isSimple.test(t)) return jQuery.filter(t, e, n);
                t = jQuery.filter(t, e)
            }
            return jQuery.grep(e, function(e) {
                return core_indexOf.call(t, e) >= 0 !== n
            })
        }

        function manipulationTarget(e, t) {
            return jQuery.nodeName(e, "table") && jQuery.nodeName(t.nodeType === 1 ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
        }

        function disableScript(e) {
            return e.type = (e.getAttribute("type") !== null) + "/" + e.type, e
        }

        function restoreScript(e) {
            var t = rscriptTypeMasked.exec(e.type);
            return t ? e.type = t[1] : e.removeAttribute("type"), e
        }

        function setGlobalEval(e, t) {
            var n = e.length,
                r = 0;
            for (; r < n; r++) data_priv.set(e[r], "globalEval", !t || data_priv.get(t[r], "globalEval"))
        }

        function cloneCopyEvent(e, t) {
            var n, r, i, s, o, u, a, f;
            if (t.nodeType !== 1) return;
            if (data_priv.hasData(e)) {
                s = data_priv.access(e), o = data_priv.set(t, s), f = s.events;
                if (f) {
                    delete o.handle, o.events = {};
                    for (i in f)
                        for (n = 0, r = f[i].length; n < r; n++) jQuery.event.add(t, i, f[i][n])
                }
            }
            data_user.hasData(e) && (u = data_user.access(e), a = jQuery.extend({}, u), data_user.set(t, a))
        }

        function getAll(e, t) {
            var n = e.getElementsByTagName ? e.getElementsByTagName(t || "*") : e.querySelectorAll ? e.querySelectorAll(t || "*") : [];
            return t === undefined || t && jQuery.nodeName(e, t) ? jQuery.merge([e], n) : n
        }

        function fixInput(e, t) {
            var n = t.nodeName.toLowerCase();
            if (n === "input" && manipulation_rcheckableType.test(e.type)) t.checked = e.checked;
            else if (n === "input" || n === "textarea") t.defaultValue = e.defaultValue
        }

        function vendorPropName(e, t) {
            if (t in e) return t;
            var n = t.charAt(0).toUpperCase() + t.slice(1),
                r = t,
                i = cssPrefixes.length;
            while (i--) {
                t = cssPrefixes[i] + n;
                if (t in e) return t
            }
            return r
        }

        function isHidden(e, t) {
            return e = t || e, jQuery.css(e, "display") === "none" || !jQuery.contains(e.ownerDocument, e)
        }

        function getStyles(e) {
            return window.getComputedStyle(e, null)
        }

        function showHide(e, t) {
            var n, r, i, s = [],
                o = 0,
                u = e.length;
            for (; o < u; o++) {
                r = e[o];
                if (!r.style) continue;
                s[o] = data_priv.get(r, "olddisplay"), n = r.style.display, t ? (!s[o] && n === "none" && (r.style.display = ""), r.style.display === "" && isHidden(r) && (s[o] = data_priv.access(r, "olddisplay", css_defaultDisplay(r.nodeName)))) : s[o] || (i = isHidden(r), (n && n !== "none" || !i) && data_priv.set(r, "olddisplay", i ? n : jQuery.css(r, "display")))
            }
            for (o = 0; o < u; o++) {
                r = e[o];
                if (!r.style) continue;
                if (!t || r.style.display === "none" || r.style.display === "") r.style.display = t ? s[o] || "" : "none"
            }
            return e
        }

        function setPositiveNumber(e, t, n) {
            var r = rnumsplit.exec(t);
            return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : t
        }

        function augmentWidthOrHeight(e, t, n, r, i) {
            var s = n === (r ? "border" : "content") ? 4 : t === "width" ? 1 : 0,
                o = 0;
            for (; s < 4; s += 2) n === "margin" && (o += jQuery.css(e, n + cssExpand[s], !0, i)), r ? (n === "content" && (o -= jQuery.css(e, "padding" + cssExpand[s], !0, i)), n !== "margin" && (o -= jQuery.css(e, "border" + cssExpand[s] + "Width", !0, i))) : (o += jQuery.css(e, "padding" + cssExpand[s], !0, i), n !== "padding" && (o += jQuery.css(e, "border" + cssExpand[s] + "Width", !0, i)));
            return o
        }

        function getWidthOrHeight(e, t, n) {
            var r = !0,
                i = t === "width" ? e.offsetWidth : e.offsetHeight,
                s = getStyles(e),
                o = jQuery.support.boxSizing && jQuery.css(e, "boxSizing", !1, s) === "border-box";
            if (i <= 0 || i == null) {
                i = curCSS(e, t, s);
                if (i < 0 || i == null) i = e.style[t];
                if (rnumnonpx.test(i)) return i;
                r = o && (jQuery.support.boxSizingReliable || i === e.style[t]), i = parseFloat(i) || 0
            }
            return i + augmentWidthOrHeight(e, t, n || (o ? "border" : "content"), r, s) + "px"
        }

        function css_defaultDisplay(e) {
            var t = document,
                n = elemdisplay[e];
            if (!n) {
                n = actualDisplay(e, t);
                if (n === "none" || !n) iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(t.documentElement), t = (iframe[0].contentWindow || iframe[0].contentDocument).document, t.write("<!doctype html><html><body>"), t.close(), n = actualDisplay(e, t), iframe.detach();
                elemdisplay[e] = n
            }
            return n
        }

        function actualDisplay(e, t) {
            var n = jQuery(t.createElement(e)).appendTo(t.body),
                r = jQuery.css(n[0], "display");
            return n.remove(), r
        }

        function buildParams(e, t, n, r) {
            var i;
            if (jQuery.isArray(t)) jQuery.each(t, function(t, i) {
                n || rbracket.test(e) ? r(e, i) : buildParams(e + "[" + (typeof i == "object" ? t : "") + "]", i, n, r)
            });
            else if (!n && jQuery.type(t) === "object")
                for (i in t) buildParams(e + "[" + i + "]", t[i], n, r);
            else r(e, t)
        }

        function addToPrefiltersOrTransports(e) {
            return function(t, n) {
                typeof t != "string" && (n = t, t = "*");
                var r, i = 0,
                    s = t.toLowerCase().match(core_rnotwhite) || [];
                if (jQuery.isFunction(n))
                    while (r = s[i++]) r[0] === "+" ? (r = r.slice(1) || "*", (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
            }
        }

        function inspectPrefiltersOrTransports(e, t, n, r) {
            function o(u) {
                var a;
                return i[u] = !0, jQuery.each(e[u] || [], function(e, u) {
                    var f = u(t, n, r);
                    if (typeof f == "string" && !s && !i[f]) return t.dataTypes.unshift(f), o(f), !1;
                    if (s) return !(a = f)
                }), a
            }
            var i = {},
                s = e === transports;
            return o(t.dataTypes[0]) || !i["*"] && o("*")
        }

        function ajaxExtend(e, t) {
            var n, r, i = jQuery.ajaxSettings.flatOptions || {};
            for (n in t) t[n] !== undefined && ((i[n] ? e : r || (r = {}))[n] = t[n]);
            return r && jQuery.extend(!0, e, r), e
        }

        function ajaxHandleResponses(e, t, n) {
            var r, i, s, o, u = e.contents,
                a = e.dataTypes;
            while (a[0] === "*") a.shift(), r === undefined && (r = e.mimeType || t.getResponseHeader("Content-Type"));
            if (r)
                for (i in u)
                    if (u[i] && u[i].test(r)) {
                        a.unshift(i);
                        break
                    }
            if (a[0] in n) s = a[0];
            else {
                for (i in n) {
                    if (!a[0] || e.converters[i + " " + a[0]]) {
                        s = i;
                        break
                    }
                    o || (o = i)
                }
                s = s || o
            }
            if (s) return s !== a[0] && a.unshift(s), n[s]
        }

        function ajaxConvert(e, t, n, r) {
            var i, s, o, u, a, f = {},
                l = e.dataTypes.slice();
            if (l[1])
                for (o in e.converters) f[o.toLowerCase()] = e.converters[o];
            s = l.shift();
            while (s) {
                e.responseFields[s] && (n[e.responseFields[s]] = t), !a && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), a = s, s = l.shift();
                if (s)
                    if (s === "*") s = a;
                    else if (a !== "*" && a !== s) {
                    o = f[a + " " + s] || f["* " + s];
                    if (!o)
                        for (i in f) {
                            u = i.split(" ");
                            if (u[1] === s) {
                                o = f[a + " " + u[0]] || f["* " + u[0]];
                                if (o) {
                                    o === !0 ? o = f[i] : f[i] !== !0 && (s = u[0], l.unshift(u[1]));
                                    break
                                }
                            }
                        }
                    if (o !== !0)
                        if (o && e["throws"]) t = o(t);
                        else try {
                            t = o(t)
                        } catch (c) {
                            return {
                                state: "parsererror",
                                error: o ? c : "No conversion from " + a + " to " + s
                            }
                        }
                }
            }
            return {
                state: "success",
                data: t
            }
        }

        function createFxNow() {
            return setTimeout(function() {
                fxNow = undefined
            }), fxNow = jQuery.now()
        }

        function createTween(e, t, n) {
            var r, i = (tweeners[t] || []).concat(tweeners["*"]),
                s = 0,
                o = i.length;
            for (; s < o; s++)
                if (r = i[s].call(n, t, e)) return r
        }

        function Animation(e, t, n) {
            var r, i, s = 0,
                o = animationPrefilters.length,
                u = jQuery.Deferred().always(function() {
                    delete a.elem
                }),
                a = function() {
                    if (i) return !1;
                    var t = fxNow || createFxNow(),
                        n = Math.max(0, f.startTime + f.duration - t),
                        r = n / f.duration || 0,
                        s = 1 - r,
                        o = 0,
                        a = f.tweens.length;
                    for (; o < a; o++) f.tweens[o].run(s);
                    return u.notifyWith(e, [f, s, n]), s < 1 && a ? n : (u.resolveWith(e, [f]), !1)
                },
                f = u.promise({
                    elem: e,
                    props: jQuery.extend({}, t),
                    opts: jQuery.extend(!0, {
                        specialEasing: {}
                    }, n),
                    originalProperties: t,
                    originalOptions: n,
                    startTime: fxNow || createFxNow(),
                    duration: n.duration,
                    tweens: [],
                    createTween: function(t, n) {
                        var r = jQuery.Tween(e, f.opts, t, n, f.opts.specialEasing[t] || f.opts.easing);
                        return f.tweens.push(r), r
                    },
                    stop: function(t) {
                        var n = 0,
                            r = t ? f.tweens.length : 0;
                        if (i) return this;
                        i = !0;
                        for (; n < r; n++) f.tweens[n].run(1);
                        return t ? u.resolveWith(e, [f, t]) : u.rejectWith(e, [f, t]), this
                    }
                }),
                l = f.props;
            propFilter(l, f.opts.specialEasing);
            for (; s < o; s++) {
                r = animationPrefilters[s].call(f, e, l, f.opts);
                if (r) return r
            }
            return jQuery.map(l, createTween, f), jQuery.isFunction(f.opts.start) && f.opts.start.call(e, f), jQuery.fx.timer(jQuery.extend(a, {
                elem: e,
                anim: f,
                queue: f.opts.queue
            })), f.progress(f.opts.progress).done(f.opts.done, f.opts.complete).fail(f.opts.fail).always(f.opts.always)
        }

        function propFilter(e, t) {
            var n, r, i, s, o;
            for (n in e) {
                r = jQuery.camelCase(n), i = t[r], s = e[n], jQuery.isArray(s) && (i = s[1], s = e[n] = s[0]), n !== r && (e[r] = s, delete e[n]), o = jQuery.cssHooks[r];
                if (o && "expand" in o) {
                    s = o.expand(s), delete e[r];
                    for (n in s) n in e || (e[n] = s[n], t[n] = i)
                } else t[r] = i
            }
        }

        function defaultPrefilter(e, t, n) {
            var r, i, s, o, u, a, f = this,
                l = {},
                c = e.style,
                h = e.nodeType && isHidden(e),
                p = data_priv.get(e, "fxshow");
            n.queue || (u = jQuery._queueHooks(e, "fx"), u.unqueued == null && (u.unqueued = 0, a = u.empty.fire, u.empty.fire = function() {
                u.unqueued || a()
            }), u.unqueued++, f.always(function() {
                f.always(function() {
                    u.unqueued--, jQuery.queue(e, "fx").length || u.empty.fire()
                })
            })), e.nodeType === 1 && ("height" in t || "width" in t) && (n.overflow = [c.overflow, c.overflowX, c.overflowY], jQuery.css(e, "display") === "inline" && jQuery.css(e, "float") === "none" && (c.display = "inline-block")), n.overflow && (c.overflow = "hidden", f.always(function() {
                c.overflow = n.overflow[0], c.overflowX = n.overflow[1], c.overflowY = n.overflow[2]
            }));
            for (r in t) {
                i = t[r];
                if (rfxtypes.exec(i)) {
                    delete t[r], s = s || i === "toggle";
                    if (i === (h ? "hide" : "show")) {
                        if (i !== "show" || !p || p[r] === undefined) continue;
                        h = !0
                    }
                    l[r] = p && p[r] || jQuery.style(e, r)
                }
            }
            if (!jQuery.isEmptyObject(l)) {
                p ? "hidden" in p && (h = p.hidden) : p = data_priv.access(e, "fxshow", {}), s && (p.hidden = !h), h ? jQuery(e).show() : f.done(function() {
                    jQuery(e).hide()
                }), f.done(function() {
                    var t;
                    data_priv.remove(e, "fxshow");
                    for (t in l) jQuery.style(e, t, l[t])
                });
                for (r in l) o = createTween(h ? p[r] : 0, r, f), r in p || (p[r] = o.start, h && (o.end = o.start, o.start = r === "width" || r === "height" ? 1 : 0))
            }
        }

        function Tween(e, t, n, r, i) {
            return new Tween.prototype.init(e, t, n, r, i)
        }

        function genFx(e, t) {
            var n, r = {
                    height: e
                },
                i = 0;
            t = t ? 1 : 0;
            for (; i < 4; i += 2 - t) n = cssExpand[i], r["margin" + n] = r["padding" + n] = e;
            return t && (r.opacity = r.width = e), r
        }

        function getWindow(e) {
            return jQuery.isWindow(e) ? e : e.nodeType === 9 && e.defaultView
        }
        var rootjQuery, readyList, core_strundefined = typeof undefined,
            location = window.location,
            document = window.document,
            docElem = document.documentElement,
            _jQuery = window.jQuery,
            _$ = window.$,
            class2type = {},
            core_deletedIds = [],
            core_version = "2.0.3",
            core_concat = core_deletedIds.concat,
            core_push = core_deletedIds.push,
            core_slice = core_deletedIds.slice,
            core_indexOf = core_deletedIds.indexOf,
            core_toString = class2type.toString,
            core_hasOwn = class2type.hasOwnProperty,
            core_trim = core_version.trim,
            jQuery = function(e, t) {
                return new jQuery.fn.init(e, t, rootjQuery)
            },
            core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
            core_rnotwhite = /\S+/g,
            rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
            rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            rmsPrefix = /^-ms-/,
            rdashAlpha = /-([\da-z])/gi,
            fcamelCase = function(e, t) {
                return t.toUpperCase()
            },
            completed = function() {
                document.removeEventListener("DOMContentLoaded", completed, !1), window.removeEventListener("load", completed, !1), jQuery.ready()
            };
        jQuery.fn = jQuery.prototype = {
                jquery: core_version,
                constructor: jQuery,
                init: function(e, t, n) {
                    var r, i;
                    if (!e) return this;
                    if (typeof e == "string") {
                        e.charAt(0) === "<" && e.charAt(e.length - 1) === ">" && e.length >= 3 ? r = [null, e, null] : r = rquickExpr.exec(e);
                        if (r && (r[1] || !t)) {
                            if (r[1]) {
                                t = t instanceof jQuery ? t[0] : t, jQuery.merge(this, jQuery.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : document, !0));
                                if (rsingleTag.test(r[1]) && jQuery.isPlainObject(t))
                                    for (r in t) jQuery.isFunction(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
                                return this
                            }
                            return i = document.getElementById(r[2]), i && i.parentNode && (this.length = 1, this[0] = i), this.context = document, this.selector = e, this
                        }
                        return !t || t.jquery ? (t || n).find(e) : this.constructor(t).find(e)
                    }
                    return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : jQuery.isFunction(e) ? n.ready(e) : (e.selector !== undefined && (this.selector = e.selector, this.context = e.context), jQuery.makeArray(e, this))
                },
                selector: "",
                length: 0,
                toArray: function() {
                    return core_slice.call(this)
                },
                get: function(e) {
                    return e == null ? this.toArray() : e < 0 ? this[this.length + e] : this[e]
                },
                pushStack: function(e) {
                    var t = jQuery.merge(this.constructor(), e);
                    return t.prevObject = this, t.context = this.context, t
                },
                each: function(e, t) {
                    return jQuery.each(this, e, t)
                },
                ready: function(e) {
                    return jQuery.ready.promise().done(e), this
                },
                slice: function() {
                    return this.pushStack(core_slice.apply(this, arguments))
                },
                first: function() {
                    return this.eq(0)
                },
                last: function() {
                    return this.eq(-1)
                },
                eq: function(e) {
                    var t = this.length,
                        n = +e + (e < 0 ? t : 0);
                    return this.pushStack(n >= 0 && n < t ? [this[n]] : [])
                },
                map: function(e) {
                    return this.pushStack(jQuery.map(this, function(t, n) {
                        return e.call(t, n, t)
                    }))
                },
                end: function() {
                    return this.prevObject || this.constructor(null)
                },
                push: core_push,
                sort: [].sort,
                splice: [].splice
            }, jQuery.fn.init.prototype = jQuery.fn, jQuery.extend = jQuery.fn.extend = function() {
                var e, t, n, r, i, s, o = arguments[0] || {},
                    u = 1,
                    a = arguments.length,
                    f = !1;
                typeof o == "boolean" && (f = o, o = arguments[1] || {}, u = 2), typeof o != "object" && !jQuery.isFunction(o) && (o = {}), a === u && (o = this, --u);
                for (; u < a; u++)
                    if ((e = arguments[u]) != null)
                        for (t in e) {
                            n = o[t], r = e[t];
                            if (o === r) continue;
                            f && r && (jQuery.isPlainObject(r) || (i = jQuery.isArray(r))) ? (i ? (i = !1, s = n && jQuery.isArray(n) ? n : []) : s = n && jQuery.isPlainObject(n) ? n : {}, o[t] = jQuery.extend(f, s, r)) : r !== undefined && (o[t] = r)
                        }
                return o
            }, jQuery.extend({
                expando: "jQuery" + (core_version + Math.random()).replace(/\D/g, ""),
                noConflict: function(e) {
                    return window.$ === jQuery && (window.$ = _$), e && window.jQuery === jQuery && (window.jQuery = _jQuery), jQuery
                },
                isReady: !1,
                readyWait: 1,
                holdReady: function(e) {
                    e ? jQuery.readyWait++ : jQuery.ready(!0)
                },
                ready: function(e) {
                    if (e === !0 ? --jQuery.readyWait : jQuery.isReady) return;
                    jQuery.isReady = !0;
                    if (e !== !0 && --jQuery.readyWait > 0) return;
                    readyList.resolveWith(document, [jQuery]), jQuery.fn.trigger && jQuery(document).trigger("ready").off("ready")
                },
                isFunction: function(e) {
                    return jQuery.type(e) === "function"
                },
                isArray: Array.isArray,
                isWindow: function(e) {
                    return e != null && e === e.window
                },
                isNumeric: function(e) {
                    return !isNaN(parseFloat(e)) && isFinite(e)
                },
                type: function(e) {
                    return e == null ? String(e) : typeof e == "object" || typeof e == "function" ? class2type[core_toString.call(e)] || "object" : typeof e
                },
                isPlainObject: function(e) {
                    if (jQuery.type(e) !== "object" || e.nodeType || jQuery.isWindow(e)) return !1;
                    try {
                        if (e.constructor && !core_hasOwn.call(e.constructor.prototype, "isPrototypeOf")) return !1
                    } catch (t) {
                        return !1
                    }
                    return !0
                },
                isEmptyObject: function(e) {
                    var t;
                    for (t in e) return !1;
                    return !0
                },
                error: function(e) {
                    throw new Error(e)
                },
                parseHTML: function(e, t, n) {
                    if (!e || typeof e != "string") return null;
                    typeof t == "boolean" && (n = t, t = !1), t = t || document;
                    var r = rsingleTag.exec(e),
                        i = !n && [];
                    return r ? [t.createElement(r[1])] : (r = jQuery.buildFragment([e], t, i), i && jQuery(i).remove(), jQuery.merge([], r.childNodes))
                },
                parseJSON: JSON.parse,
                parseXML: function(e) {
                    var t, n;
                    if (!e || typeof e != "string") return null;
                    try {
                        n = new DOMParser, t = n.parseFromString(e, "text/xml")
                    } catch (r) {
                        t = undefined
                    }
                    return (!t || t.getElementsByTagName("parsererror").length) && jQuery.error("Invalid XML: " + e), t
                },
                noop: function() {},
                globalEval: function(code) {
                    var script, indirect = eval;
                    code = jQuery.trim(code), code && (code.indexOf("use strict") === 1 ? (script = document.createElement("script"), script.text = code, document.head.appendChild(script).parentNode.removeChild(script)) : indirect(code))
                },
                camelCase: function(e) {
                    return e.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase)
                },
                nodeName: function(e, t) {
                    return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
                },
                each: function(e, t, n) {
                    var r, i = 0,
                        s = e.length,
                        o = isArraylike(e);
                    if (n)
                        if (o)
                            for (; i < s; i++) {
                                r = t.apply(e[i], n);
                                if (r === !1) break
                            } else
                                for (i in e) {
                                    r = t.apply(e[i], n);
                                    if (r === !1) break
                                } else if (o)
                                    for (; i < s; i++) {
                                        r = t.call(e[i], i, e[i]);
                                        if (r === !1) break
                                    } else
                                        for (i in e) {
                                            r = t.call(e[i], i, e[i]);
                                            if (r === !1) break
                                        }
                    return e
                },
                trim: function(e) {
                    return e == null ? "" : core_trim.call(e)
                },
                makeArray: function(e, t) {
                    var n = t || [];
                    return e != null && (isArraylike(Object(e)) ? jQuery.merge(n, typeof e == "string" ? [e] : e) : core_push.call(n, e)), n
                },
                inArray: function(e, t, n) {
                    return t == null ? -1 : core_indexOf.call(t, e, n)
                },
                merge: function(e, t) {
                    var n = t.length,
                        r = e.length,
                        i = 0;
                    if (typeof n == "number")
                        for (; i < n; i++) e[r++] = t[i];
                    else
                        while (t[i] !== undefined) e[r++] = t[i++];
                    return e.length = r, e
                },
                grep: function(e, t, n) {
                    var r, i = [],
                        s = 0,
                        o = e.length;
                    n = !!n;
                    for (; s < o; s++) r = !!t(e[s], s), n !== r && i.push(e[s]);
                    return i
                },
                map: function(e, t, n) {
                    var r, i = 0,
                        s = e.length,
                        o = isArraylike(e),
                        u = [];
                    if (o)
                        for (; i < s; i++) r = t(e[i], i, n), r != null && (u[u.length] = r);
                    else
                        for (i in e) r = t(e[i], i, n), r != null && (u[u.length] = r);
                    return core_concat.apply([], u)
                },
                guid: 1,
                proxy: function(e, t) {
                    var n, r, i;
                    return typeof t == "string" && (n = e[t], t = e, e = n), jQuery.isFunction(e) ? (r = core_slice.call(arguments, 2), i = function() {
                        return e.apply(t || this, r.concat(core_slice.call(arguments)))
                    }, i.guid = e.guid = e.guid || jQuery.guid++, i) : undefined
                },
                access: function(e, t, n, r, i, s, o) {
                    var u = 0,
                        a = e.length,
                        f = n == null;
                    if (jQuery.type(n) === "object") {
                        i = !0;
                        for (u in n) jQuery.access(e, t, u, n[u], !0, s, o)
                    } else if (r !== undefined) {
                        i = !0, jQuery.isFunction(r) || (o = !0), f && (o ? (t.call(e, r), t = null) : (f = t, t = function(e, t, n) {
                            return f.call(jQuery(e), n)
                        }));
                        if (t)
                            for (; u < a; u++) t(e[u], n, o ? r : r.call(e[u], u, t(e[u], n)))
                    }
                    return i ? e : f ? t.call(e) : a ? t(e[0], n) : s
                },
                now: Date.now,
                swap: function(e, t, n, r) {
                    var i, s, o = {};
                    for (s in t) o[s] = e.style[s], e.style[s] = t[s];
                    i = n.apply(e, r || []);
                    for (s in t) e.style[s] = o[s];
                    return i
                }
            }), jQuery.ready.promise = function(e) {
                return readyList || (readyList = jQuery.Deferred(), document.readyState === "complete" ? setTimeout(jQuery.ready) : (document.addEventListener("DOMContentLoaded", completed, !1), window.addEventListener("load", completed, !1))), readyList.promise(e)
            }, jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(e, t) {
                class2type["[object " + t + "]"] = t.toLowerCase()
            }), rootjQuery = jQuery(document),
            function(e, t) {
                function st(e, t, n, i) {
                    var s, o, u, a, f, l, p, m, g, E;
                    (t ? t.ownerDocument || t : w) !== h && c(t), t = t || h, n = n || [];
                    if (!e || typeof e != "string") return n;
                    if ((a = t.nodeType) !== 1 && a !== 9) return [];
                    if (d && !i) {
                        if (s = Y.exec(e))
                            if (u = s[1]) {
                                if (a === 9) {
                                    o = t.getElementById(u);
                                    if (!o || !o.parentNode) return n;
                                    if (o.id === u) return n.push(o), n
                                } else if (t.ownerDocument && (o = t.ownerDocument.getElementById(u)) && y(t, o) && o.id === u) return n.push(o), n
                            } else {
                                if (s[2]) return P.apply(n, t.getElementsByTagName(e)), n;
                                if ((u = s[3]) && r.getElementsByClassName && t.getElementsByClassName) return P.apply(n, t.getElementsByClassName(u)), n
                            }
                        if (r.qsa && (!v || !v.test(e))) {
                            m = p = b, g = t, E = a === 9 && e;
                            if (a === 1 && t.nodeName.toLowerCase() !== "object") {
                                l = vt(e), (p = t.getAttribute("id")) ? m = p.replace(tt, "\\$&") : t.setAttribute("id", m), m = "[id='" + m + "'] ", f = l.length;
                                while (f--) l[f] = m + mt(l[f]);
                                g = V.test(e) && t.parentNode || t, E = l.join(",")
                            }
                            if (E) try {
                                return P.apply(n, g.querySelectorAll(E)), n
                            } catch (S) {} finally {
                                p || t.removeAttribute("id")
                            }
                        }
                    }
                    return Tt(e.replace(z, "$1"), t, n, i)
                }

                function ot() {
                    function t(n, r) {
                        return e.push(n += " ") > s.cacheLength && delete t[e.shift()], t[n] = r
                    }
                    var e = [];
                    return t
                }

                function ut(e) {
                    return e[b] = !0, e
                }

                function at(e) {
                    var t = h.createElement("div");
                    try {
                        return !!e(t)
                    } catch (n) {
                        return !1
                    } finally {
                        t.parentNode && t.parentNode.removeChild(t), t = null
                    }
                }

                function ft(e, t) {
                    var n = e.split("|"),
                        r = e.length;
                    while (r--) s.attrHandle[n[r]] = t
                }

                function lt(e, t) {
                    var n = t && e,
                        r = n && e.nodeType === 1 && t.nodeType === 1 && (~t.sourceIndex || A) - (~e.sourceIndex || A);
                    if (r) return r;
                    if (n)
                        while (n = n.nextSibling)
                            if (n === t) return -1;
                    return e ? 1 : -1
                }

                function ct(e) {
                    return function(t) {
                        var n = t.nodeName.toLowerCase();
                        return n === "input" && t.type === e
                    }
                }

                function ht(e) {
                    return function(t) {
                        var n = t.nodeName.toLowerCase();
                        return (n === "input" || n === "button") && t.type === e
                    }
                }

                function pt(e) {
                    return ut(function(t) {
                        return t = +t, ut(function(n, r) {
                            var i, s = e([], n.length, t),
                                o = s.length;
                            while (o--) n[i = s[o]] && (n[i] = !(r[i] = n[i]))
                        })
                    })
                }

                function dt() {}

                function vt(e, t) {
                    var n, r, i, o, u, a, f, l = T[e + " "];
                    if (l) return t ? 0 : l.slice(0);
                    u = e, a = [], f = s.preFilter;
                    while (u) {
                        if (!n || (r = W.exec(u))) r && (u = u.slice(r[0].length) || u), a.push(i = []);
                        n = !1;
                        if (r = X.exec(u)) n = r.shift(), i.push({
                            value: n,
                            type: r[0].replace(z, " ")
                        }), u = u.slice(n.length);
                        for (o in s.filter)(r = Q[o].exec(u)) && (!f[o] || (r = f[o](r))) && (n = r.shift(), i.push({
                            value: n,
                            type: o,
                            matches: r
                        }), u = u.slice(n.length));
                        if (!n) break
                    }
                    return t ? u.length : u ? st.error(e) : T(e, a).slice(0)
                }

                function mt(e) {
                    var t = 0,
                        n = e.length,
                        r = "";
                    for (; t < n; t++) r += e[t].value;
                    return r
                }

                function gt(e, t, n) {
                    var r = t.dir,
                        s = n && r === "parentNode",
                        o = S++;
                    return t.first ? function(t, n, i) {
                        while (t = t[r])
                            if (t.nodeType === 1 || s) return e(t, n, i)
                    } : function(t, n, u) {
                        var a, f, l, c = E + " " + o;
                        if (u) {
                            while (t = t[r])
                                if (t.nodeType === 1 || s)
                                    if (e(t, n, u)) return !0
                        } else
                            while (t = t[r])
                                if (t.nodeType === 1 || s) {
                                    l = t[b] || (t[b] = {});
                                    if ((f = l[r]) && f[0] === c) {
                                        if ((a = f[1]) === !0 || a === i) return a === !0
                                    } else {
                                        f = l[r] = [c], f[1] = e(t, n, u) || i;
                                        if (f[1] === !0) return !0
                                    }
                                }
                    }
                }

                function yt(e) {
                    return e.length > 1 ? function(t, n, r) {
                        var i = e.length;
                        while (i--)
                            if (!e[i](t, n, r)) return !1;
                        return !0
                    } : e[0]
                }

                function bt(e, t, n, r, i) {
                    var s, o = [],
                        u = 0,
                        a = e.length,
                        f = t != null;
                    for (; u < a; u++)
                        if (s = e[u])
                            if (!n || n(s, r, i)) o.push(s), f && t.push(u);
                    return o
                }

                function wt(e, t, n, r, i, s) {
                    return r && !r[b] && (r = wt(r)), i && !i[b] && (i = wt(i, s)), ut(function(s, o, u, a) {
                        var f, l, c, h = [],
                            p = [],
                            d = o.length,
                            v = s || xt(t || "*", u.nodeType ? [u] : u, []),
                            m = e && (s || !t) ? bt(v, h, e, u, a) : v,
                            g = n ? i || (s ? e : d || r) ? [] : o : m;
                        n && n(m, g, u, a);
                        if (r) {
                            f = bt(g, p), r(f, [], u, a), l = f.length;
                            while (l--)
                                if (c = f[l]) g[p[l]] = !(m[p[l]] = c)
                        }
                        if (s) {
                            if (i || e) {
                                if (i) {
                                    f = [], l = g.length;
                                    while (l--)(c = g[l]) && f.push(m[l] = c);
                                    i(null, g = [], f, a)
                                }
                                l = g.length;
                                while (l--)(c = g[l]) && (f = i ? B.call(s, c) : h[l]) > -1 && (s[f] = !(o[f] = c))
                            }
                        } else g = bt(g === o ? g.splice(d, g.length) : g), i ? i(null, o, g, a) : P.apply(o, g)
                    })
                }

                function Et(e) {
                    var t, n, r, i = e.length,
                        o = s.relative[e[0].type],
                        u = o || s.relative[" "],
                        a = o ? 1 : 0,
                        l = gt(function(e) {
                            return e === t
                        }, u, !0),
                        c = gt(function(e) {
                            return B.call(t, e) > -1
                        }, u, !0),
                        h = [function(e, n, r) {
                            return !o && (r || n !== f) || ((t = n).nodeType ? l(e, n, r) : c(e, n, r))
                        }];
                    for (; a < i; a++)
                        if (n = s.relative[e[a].type]) h = [gt(yt(h), n)];
                        else {
                            n = s.filter[e[a].type].apply(null, e[a].matches);
                            if (n[b]) {
                                r = ++a;
                                for (; r < i; r++)
                                    if (s.relative[e[r].type]) break;
                                return wt(a > 1 && yt(h), a > 1 && mt(e.slice(0, a - 1).concat({
                                    value: e[a - 2].type === " " ? "*" : ""
                                })).replace(z, "$1"), n, a < r && Et(e.slice(a, r)), r < i && Et(e = e.slice(r)), r < i && mt(e))
                            }
                            h.push(n)
                        }
                    return yt(h)
                }

                function St(e, t) {
                    var n = 0,
                        r = t.length > 0,
                        o = e.length > 0,
                        u = function(u, a, l, c, p) {
                            var d, v, m, g = [],
                                y = 0,
                                b = "0",
                                w = u && [],
                                S = p != null,
                                x = f,
                                T = u || o && s.find.TAG("*", p && a.parentNode || a),
                                N = E += x == null ? 1 : Math.random() || .1;
                            S && (f = a !== h && a, i = n);
                            for (;
                                (d = T[b]) != null; b++) {
                                if (o && d) {
                                    v = 0;
                                    while (m = e[v++])
                                        if (m(d, a, l)) {
                                            c.push(d);
                                            break
                                        }
                                    S && (E = N, i = ++n)
                                }
                                r && ((d = !m && d) && y--, u && w.push(d))
                            }
                            y += b;
                            if (r && b !== y) {
                                v = 0;
                                while (m = t[v++]) m(w, g, a, l);
                                if (u) {
                                    if (y > 0)
                                        while (b--) !w[b] && !g[b] && (g[b] = _.call(c));
                                    g = bt(g)
                                }
                                P.apply(c, g), S && !u && g.length > 0 && y + t.length > 1 && st.uniqueSort(c)
                            }
                            return S && (E = N, f = x), w
                        };
                    return r ? ut(u) : u
                }

                function xt(e, t, n) {
                    var r = 0,
                        i = t.length;
                    for (; r < i; r++) st(e, t[r], n);
                    return n
                }

                function Tt(e, t, n, i) {
                    var o, u, f, l, c, h = vt(e);
                    if (!i && h.length === 1) {
                        u = h[0] = h[0].slice(0);
                        if (u.length > 2 && (f = u[0]).type === "ID" && r.getById && t.nodeType === 9 && d && s.relative[u[1].type]) {
                            t = (s.find.ID(f.matches[0].replace(nt, rt), t) || [])[0];
                            if (!t) return n;
                            e = e.slice(u.shift().value.length)
                        }
                        o = Q.needsContext.test(e) ? 0 : u.length;
                        while (o--) {
                            f = u[o];
                            if (s.relative[l = f.type]) break;
                            if (c = s.find[l])
                                if (i = c(f.matches[0].replace(nt, rt), V.test(u[0].type) && t.parentNode || t)) {
                                    u.splice(o, 1), e = i.length && mt(u);
                                    if (!e) return P.apply(n, i), n;
                                    break
                                }
                        }
                    }
                    return a(e, h)(i, t, !d, n, V.test(e)), n
                }
                var n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g, y, b = "sizzle" + -(new Date),
                    w = e.document,
                    E = 0,
                    S = 0,
                    x = ot(),
                    T = ot(),
                    N = ot(),
                    C = !1,
                    k = function(e, t) {
                        return e === t ? (C = !0, 0) : 0
                    },
                    L = typeof t,
                    A = 1 << 31,
                    O = {}.hasOwnProperty,
                    M = [],
                    _ = M.pop,
                    D = M.push,
                    P = M.push,
                    H = M.slice,
                    B = M.indexOf || function(e) {
                        var t = 0,
                            n = this.length;
                        for (; t < n; t++)
                            if (this[t] === e) return t;
                        return -1
                    },
                    j = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
                    F = "[\\x20\\t\\r\\n\\f]",
                    I = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
                    q = I.replace("w", "w#"),
                    R = "\\[" + F + "*(" + I + ")" + F + "*(?:([*^$|!~]?=)" + F + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + q + ")|)|)" + F + "*\\]",
                    U = ":(" + I + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + R.replace(3, 8) + ")*)|.*)\\)|)",
                    z = new RegExp("^" + F + "+|((?:^|[^\\\\])(?:\\\\.)*)" + F + "+$", "g"),
                    W = new RegExp("^" + F + "*," + F + "*"),
                    X = new RegExp("^" + F + "*([>+~]|" + F + ")" + F + "*"),
                    V = new RegExp(F + "*[+~]"),
                    $ = new RegExp("=" + F + "*([^\\]'\"]*)" + F + "*\\]", "g"),
                    J = new RegExp(U),
                    K = new RegExp("^" + q + "$"),
                    Q = {
                        ID: new RegExp("^#(" + I + ")"),
                        CLASS: new RegExp("^\\.(" + I + ")"),
                        TAG: new RegExp("^(" + I.replace("w", "w*") + ")"),
                        ATTR: new RegExp("^" + R),
                        PSEUDO: new RegExp("^" + U),
                        CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + F + "*(even|odd|(([+-]|)(\\d*)n|)" + F + "*(?:([+-]|)" + F + "*(\\d+)|))" + F + "*\\)|)", "i"),
                        bool: new RegExp("^(?:" + j + ")$", "i"),
                        needsContext: new RegExp("^" + F + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + F + "*((?:-\\d)?\\d*)" + F + "*\\)|)(?=[^-]|$)", "i")
                    },
                    G = /^[^{]+\{\s*\[native \w/,
                    Y = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
                    Z = /^(?:input|select|textarea|button)$/i,
                    et = /^h\d$/i,
                    tt = /'|\\/g,
                    nt = new RegExp("\\\\([\\da-f]{1,6}" + F + "?|(" + F + ")|.)", "ig"),
                    rt = function(e, t, n) {
                        var r = "0x" + t - 65536;
                        return r !== r || n ? t : r < 0 ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, r & 1023 | 56320)
                    };
                try {
                    P.apply(M = H.call(w.childNodes), w.childNodes), M[w.childNodes.length].nodeType
                } catch (it) {
                    P = {
                        apply: M.length ? function(e, t) {
                            D.apply(e, H.call(t))
                        } : function(e, t) {
                            var n = e.length,
                                r = 0;
                            while (e[n++] = t[r++]);
                            e.length = n - 1
                        }
                    }
                }
                u = st.isXML = function(e) {
                    var t = e && (e.ownerDocument || e).documentElement;
                    return t ? t.nodeName !== "HTML" : !1
                }, r = st.support = {}, c = st.setDocument = function(e) {
                    var t = e ? e.ownerDocument || e : w,
                        n = t.defaultView;
                    if (t === h || t.nodeType !== 9 || !t.documentElement) return h;
                    h = t, p = t.documentElement, d = !u(t), n && n.attachEvent && n !== n.top && n.attachEvent("onbeforeunload", function() {
                        c()
                    }), r.attributes = at(function(e) {
                        return e.className = "i", !e.getAttribute("className")
                    }), r.getElementsByTagName = at(function(e) {
                        return e.appendChild(t.createComment("")), !e.getElementsByTagName("*").length
                    }), r.getElementsByClassName = at(function(e) {
                        return e.innerHTML = "<div class='a'></div><div class='a i'></div>", e.firstChild.className = "i", e.getElementsByClassName("i").length === 2
                    }), r.getById = at(function(e) {
                        return p.appendChild(e).id = b, !t.getElementsByName || !t.getElementsByName(b).length
                    }), r.getById ? (s.find.ID = function(e, t) {
                        if (typeof t.getElementById !== L && d) {
                            var n = t.getElementById(e);
                            return n && n.parentNode ? [n] : []
                        }
                    }, s.filter.ID = function(e) {
                        var t = e.replace(nt, rt);
                        return function(e) {
                            return e.getAttribute("id") === t
                        }
                    }) : (delete s.find.ID, s.filter.ID = function(e) {
                        var t = e.replace(nt, rt);
                        return function(e) {
                            var n = typeof e.getAttributeNode !== L && e.getAttributeNode("id");
                            return n && n.value === t
                        }
                    }), s.find.TAG = r.getElementsByTagName ? function(e, t) {
                        if (typeof t.getElementsByTagName !== L) return t.getElementsByTagName(e)
                    } : function(e, t) {
                        var n, r = [],
                            i = 0,
                            s = t.getElementsByTagName(e);
                        if (e === "*") {
                            while (n = s[i++]) n.nodeType === 1 && r.push(n);
                            return r
                        }
                        return s
                    }, s.find.CLASS = r.getElementsByClassName && function(e, t) {
                        if (typeof t.getElementsByClassName !== L && d) return t.getElementsByClassName(e)
                    }, m = [], v = [];
                    if (r.qsa = G.test(t.querySelectorAll)) at(function(e) {
                        e.innerHTML = "<select><option selected=''></option></select>", e.querySelectorAll("[selected]").length || v.push("\\[" + F + "*(?:value|" + j + ")"), e.querySelectorAll(":checked").length || v.push(":checked")
                    }), at(function(e) {
                        var n = t.createElement("input");
                        n.setAttribute("type", "hidden"), e.appendChild(n).setAttribute("t", ""), e.querySelectorAll("[t^='']").length && v.push("[*^$]=" + F + "*(?:''|\"\")"), e.querySelectorAll(":enabled").length || v.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), v.push(",.*:")
                    });
                    return (r.matchesSelector = G.test(g = p.webkitMatchesSelector || p.mozMatchesSelector || p.oMatchesSelector || p.msMatchesSelector)) && at(function(e) {
                        r.disconnectedMatch = g.call(e, "div"), g.call(e, "[s!='']:x"), m.push("!=", U)
                    }), v = v.length && new RegExp(v.join("|")), m = m.length && new RegExp(m.join("|")), y = G.test(p.contains) || p.compareDocumentPosition ? function(e, t) {
                        var n = e.nodeType === 9 ? e.documentElement : e,
                            r = t && t.parentNode;
                        return e === r || !!r && r.nodeType === 1 && !!(n.contains ? n.contains(r) : e.compareDocumentPosition && e.compareDocumentPosition(r) & 16)
                    } : function(e, t) {
                        if (t)
                            while (t = t.parentNode)
                                if (t === e) return !0;
                        return !1
                    }, k = p.compareDocumentPosition ? function(e, n) {
                        if (e === n) return C = !0, 0;
                        var i = n.compareDocumentPosition && e.compareDocumentPosition && e.compareDocumentPosition(n);
                        if (i) return i & 1 || !r.sortDetached && n.compareDocumentPosition(e) === i ? e === t || y(w, e) ? -1 : n === t || y(w, n) ? 1 : l ? B.call(l, e) - B.call(l, n) : 0 : i & 4 ? -1 : 1;
                        return e.compareDocumentPosition ? -1 : 1
                    } : function(e, n) {
                        var r, i = 0,
                            s = e.parentNode,
                            o = n.parentNode,
                            u = [e],
                            a = [n];
                        if (e === n) return C = !0, 0;
                        if (!s || !o) return e === t ? -1 : n === t ? 1 : s ? -1 : o ? 1 : l ? B.call(l, e) - B.call(l, n) : 0;
                        if (s === o) return lt(e, n);
                        r = e;
                        while (r = r.parentNode) u.unshift(r);
                        r = n;
                        while (r = r.parentNode) a.unshift(r);
                        while (u[i] === a[i]) i++;
                        return i ? lt(u[i], a[i]) : u[i] === w ? -1 : a[i] === w ? 1 : 0
                    }, t
                }, st.matches = function(e, t) {
                    return st(e, null, null, t)
                }, st.matchesSelector = function(e, t) {
                    (e.ownerDocument || e) !== h && c(e), t = t.replace($, "='$1']");
                    if (r.matchesSelector && d && (!m || !m.test(t)) && (!v || !v.test(t))) try {
                        var n = g.call(e, t);
                        if (n || r.disconnectedMatch || e.document && e.document.nodeType !== 11) return n
                    } catch (i) {}
                    return st(t, h, null, [e]).length > 0
                }, st.contains = function(e, t) {
                    return (e.ownerDocument || e) !== h && c(e), y(e, t)
                }, st.attr = function(e, n) {
                    (e.ownerDocument || e) !== h && c(e);
                    var i = s.attrHandle[n.toLowerCase()],
                        o = i && O.call(s.attrHandle, n.toLowerCase()) ? i(e, n, !d) : t;
                    return o === t ? r.attributes || !d ? e.getAttribute(n) : (o = e.getAttributeNode(n)) && o.specified ? o.value : null : o
                }, st.error = function(e) {
                    throw new Error("Syntax error, unrecognized expression: " + e)
                }, st.uniqueSort = function(e) {
                    var t, n = [],
                        i = 0,
                        s = 0;
                    C = !r.detectDuplicates, l = !r.sortStable && e.slice(0), e.sort(k);
                    if (C) {
                        while (t = e[s++]) t === e[s] && (i = n.push(s));
                        while (i--) e.splice(n[i], 1)
                    }
                    return e
                }, o = st.getText = function(e) {
                    var t, n = "",
                        r = 0,
                        i = e.nodeType;
                    if (!i)
                        for (; t = e[r]; r++) n += o(t);
                    else if (i === 1 || i === 9 || i === 11) {
                        if (typeof e.textContent == "string") return e.textContent;
                        for (e = e.firstChild; e; e = e.nextSibling) n += o(e)
                    } else if (i === 3 || i === 4) return e.nodeValue;
                    return n
                }, s = st.selectors = {
                    cacheLength: 50,
                    createPseudo: ut,
                    match: Q,
                    attrHandle: {},
                    find: {},
                    relative: {
                        ">": {
                            dir: "parentNode",
                            first: !0
                        },
                        " ": {
                            dir: "parentNode"
                        },
                        "+": {
                            dir: "previousSibling",
                            first: !0
                        },
                        "~": {
                            dir: "previousSibling"
                        }
                    },
                    preFilter: {
                        ATTR: function(e) {
                            return e[1] = e[1].replace(nt, rt), e[3] = (e[4] || e[5] || "").replace(nt, rt), e[2] === "~=" && (e[3] = " " + e[3] + " "), e.slice(0, 4)
                        },
                        CHILD: function(e) {
                            return e[1] = e[1].toLowerCase(), e[1].slice(0, 3) === "nth" ? (e[3] || st.error(e[0]), e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * (e[3] === "even" || e[3] === "odd")), e[5] = +(e[7] + e[8] || e[3] === "odd")) : e[3] && st.error(e[0]), e
                        },
                        PSEUDO: function(e) {
                            var n, r = !e[5] && e[2];
                            return Q.CHILD.test(e[0]) ? null : (e[3] && e[4] !== t ? e[2] = e[4] : r && J.test(r) && (n = vt(r, !0)) && (n = r.indexOf(")", r.length - n) - r.length) && (e[0] = e[0].slice(0, n), e[2] = r.slice(0, n)), e.slice(0, 3))
                        }
                    },
                    filter: {
                        TAG: function(e) {
                            var t = e.replace(nt, rt).toLowerCase();
                            return e === "*" ? function() {
                                return !0
                            } : function(e) {
                                return e.nodeName && e.nodeName.toLowerCase() === t
                            }
                        },
                        CLASS: function(e) {
                            var t = x[e + " "];
                            return t || (t = new RegExp("(^|" + F + ")" + e + "(" + F + "|$)")) && x(e, function(e) {
                                return t.test(typeof e.className == "string" && e.className || typeof e.getAttribute !== L && e.getAttribute("class") || "")
                            })
                        },
                        ATTR: function(e, t, n) {
                            return function(r) {
                                var i = st.attr(r, e);
                                return i == null ? t === "!=" : t ? (i += "", t === "=" ? i === n : t === "!=" ? i !== n : t === "^=" ? n && i.indexOf(n) === 0 : t === "*=" ? n && i.indexOf(n) > -1 : t === "$=" ? n && i.slice(-n.length) === n : t === "~=" ? (" " + i + " ").indexOf(n) > -1 : t === "|=" ? i === n || i.slice(0, n.length + 1) === n + "-" : !1) : !0
                            }
                        },
                        CHILD: function(e, t, n, r, i) {
                            var s = e.slice(0, 3) !== "nth",
                                o = e.slice(-4) !== "last",
                                u = t === "of-type";
                            return r === 1 && i === 0 ? function(e) {
                                return !!e.parentNode
                            } : function(t, n, a) {
                                var f, l, c, h, p, d, v = s !== o ? "nextSibling" : "previousSibling",
                                    m = t.parentNode,
                                    g = u && t.nodeName.toLowerCase(),
                                    y = !a && !u;
                                if (m) {
                                    if (s) {
                                        while (v) {
                                            c = t;
                                            while (c = c[v])
                                                if (u ? c.nodeName.toLowerCase() === g : c.nodeType === 1) return !1;
                                            d = v = e === "only" && !d && "nextSibling"
                                        }
                                        return !0
                                    }
                                    d = [o ? m.firstChild : m.lastChild];
                                    if (o && y) {
                                        l = m[b] || (m[b] = {}), f = l[e] || [], p = f[0] === E && f[1], h = f[0] === E && f[2], c = p && m.childNodes[p];
                                        while (c = ++p && c && c[v] || (h = p = 0) || d.pop())
                                            if (c.nodeType === 1 && ++h && c === t) {
                                                l[e] = [E, p, h];
                                                break
                                            }
                                    } else if (y && (f = (t[b] || (t[b] = {}))[e]) && f[0] === E) h = f[1];
                                    else
                                        while (c = ++p && c && c[v] || (h = p = 0) || d.pop())
                                            if ((u ? c.nodeName.toLowerCase() === g : c.nodeType === 1) && ++h) {
                                                y && ((c[b] || (c[b] = {}))[e] = [E, h]);
                                                if (c === t) break
                                            } return h -= i, h === r || h % r === 0 && h / r >= 0
                                }
                            }
                        },
                        PSEUDO: function(e, t) {
                            var n, r = s.pseudos[e] || s.setFilters[e.toLowerCase()] || st.error("unsupported pseudo: " + e);
                            return r[b] ? r(t) : r.length > 1 ? (n = [e, e, "", t], s.setFilters.hasOwnProperty(e.toLowerCase()) ? ut(function(e, n) {
                                var i, s = r(e, t),
                                    o = s.length;
                                while (o--) i = B.call(e, s[o]), e[i] = !(n[i] = s[o])
                            }) : function(e) {
                                return r(e, 0, n)
                            }) : r
                        }
                    },
                    pseudos: {
                        not: ut(function(e) {
                            var t = [],
                                n = [],
                                r = a(e.replace(z, "$1"));
                            return r[b] ? ut(function(e, t, n, i) {
                                var s, o = r(e, null, i, []),
                                    u = e.length;
                                while (u--)
                                    if (s = o[u]) e[u] = !(t[u] = s)
                            }) : function(e, i, s) {
                                return t[0] = e, r(t, null, s, n), !n.pop()
                            }
                        }),
                        has: ut(function(e) {
                            return function(t) {
                                return st(e, t).length > 0
                            }
                        }),
                        contains: ut(function(e) {
                            return function(t) {
                                return (t.textContent || t.innerText || o(t)).indexOf(e) > -1
                            }
                        }),
                        lang: ut(function(e) {
                            return K.test(e || "") || st.error("unsupported lang: " + e), e = e.replace(nt, rt).toLowerCase(),
                                function(t) {
                                    var n;
                                    do
                                        if (n = d ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang")) return n = n.toLowerCase(), n === e || n.indexOf(e + "-") === 0; while ((t = t.parentNode) && t.nodeType === 1);
                                    return !1
                                }
                        }),
                        target: function(t) {
                            var n = e.location && e.location.hash;
                            return n && n.slice(1) === t.id
                        },
                        root: function(e) {
                            return e === p
                        },
                        focus: function(e) {
                            return e === h.activeElement && (!h.hasFocus || h.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                        },
                        enabled: function(e) {
                            return e.disabled === !1
                        },
                        disabled: function(e) {
                            return e.disabled === !0
                        },
                        checked: function(e) {
                            var t = e.nodeName.toLowerCase();
                            return t === "input" && !!e.checked || t === "option" && !!e.selected
                        },
                        selected: function(e) {
                            return e.parentNode && e.parentNode.selectedIndex, e.selected === !0
                        },
                        empty: function(e) {
                            for (e = e.firstChild; e; e = e.nextSibling)
                                if (e.nodeName > "@" || e.nodeType === 3 || e.nodeType === 4) return !1;
                            return !0
                        },
                        parent: function(e) {
                            return !s.pseudos.empty(e)
                        },
                        header: function(e) {
                            return et.test(e.nodeName)
                        },
                        input: function(e) {
                            return Z.test(e.nodeName)
                        },
                        button: function(e) {
                            var t = e.nodeName.toLowerCase();
                            return t === "input" && e.type === "button" || t === "button"
                        },
                        text: function(e) {
                            var t;
                            return e.nodeName.toLowerCase() === "input" && e.type === "text" && ((t = e.getAttribute("type")) == null || t.toLowerCase() === e.type)
                        },
                        first: pt(function() {
                            return [0]
                        }),
                        last: pt(function(e, t) {
                            return [t - 1]
                        }),
                        eq: pt(function(e, t, n) {
                            return [n < 0 ? n + t : n]
                        }),
                        even: pt(function(e, t) {
                            var n = 0;
                            for (; n < t; n += 2) e.push(n);
                            return e
                        }),
                        odd: pt(function(e, t) {
                            var n = 1;
                            for (; n < t; n += 2) e.push(n);
                            return e
                        }),
                        lt: pt(function(e, t, n) {
                            var r = n < 0 ? n + t : n;
                            for (; --r >= 0;) e.push(r);
                            return e
                        }),
                        gt: pt(function(e, t, n) {
                            var r = n < 0 ? n + t : n;
                            for (; ++r < t;) e.push(r);
                            return e
                        })
                    }
                }, s.pseudos.nth = s.pseudos.eq;
                for (n in {
                        radio: !0,
                        checkbox: !0,
                        file: !0,
                        password: !0,
                        image: !0
                    }) s.pseudos[n] = ct(n);
                for (n in {
                        submit: !0,
                        reset: !0
                    }) s.pseudos[n] = ht(n);
                dt.prototype = s.filters = s.pseudos, s.setFilters = new dt, a = st.compile = function(e, t) {
                    var n, r = [],
                        i = [],
                        s = N[e + " "];
                    if (!s) {
                        t || (t = vt(e)), n = t.length;
                        while (n--) s = Et(t[n]), s[b] ? r.push(s) : i.push(s);
                        s = N(e, St(i, r))
                    }
                    return s
                }, r.sortStable = b.split("").sort(k).join("") === b, r.detectDuplicates = C, c(), r.sortDetached = at(function(e) {
                    return e.compareDocumentPosition(h.createElement("div")) & 1
                }), at(function(e) {
                    return e.innerHTML = "<a href='#'></a>", e.firstChild.getAttribute("href") === "#"
                }) || ft("type|href|height|width", function(e, t, n) {
                    if (!n) return e.getAttribute(t, t.toLowerCase() === "type" ? 1 : 2)
                }), (!r.attributes || !at(function(e) {
                    return e.innerHTML = "<input/>", e.firstChild.setAttribute("value", ""), e.firstChild.getAttribute("value") === ""
                })) && ft("value", function(e, t, n) {
                    if (!n && e.nodeName.toLowerCase() === "input") return e.defaultValue
                }), at(function(e) {
                    return e.getAttribute("disabled") == null
                }) || ft(j, function(e, t, n) {
                    var r;
                    if (!n) return (r = e.getAttributeNode(t)) && r.specified ? r.value : e[t] === !0 ? t.toLowerCase() : null
                }), jQuery.find = st, jQuery.expr = st.selectors, jQuery.expr[":"] = jQuery.expr.pseudos, jQuery.unique = st.uniqueSort, jQuery.text = st.getText, jQuery.isXMLDoc = st.isXML, jQuery.contains = st.contains
            }(window);
        var optionsCache = {};
        jQuery.Callbacks = function(e) {
            e = typeof e == "string" ? optionsCache[e] || createOptions(e) : jQuery.extend({}, e);
            var t, n, r, i, s, o, u = [],
                a = !e.once && [],
                f = function(c) {
                    t = e.memory && c, n = !0, o = i || 0, i = 0, s = u.length, r = !0;
                    for (; u && o < s; o++)
                        if (u[o].apply(c[0], c[1]) === !1 && e.stopOnFalse) {
                            t = !1;
                            break
                        }
                    r = !1, u && (a ? a.length && f(a.shift()) : t ? u = [] : l.disable())
                },
                l = {
                    add: function() {
                        if (u) {
                            var n = u.length;
                            (function o(t) {
                                jQuery.each(t, function(t, n) {
                                    var r = jQuery.type(n);
                                    r === "function" ? (!e.unique || !l.has(n)) && u.push(n) : n && n.length && r !== "string" && o(n)
                                })
                            })(arguments), r ? s = u.length : t && (i = n, f(t))
                        }
                        return this
                    },
                    remove: function() {
                        return u && jQuery.each(arguments, function(e, t) {
                            var n;
                            while ((n = jQuery.inArray(t, u, n)) > -1) u.splice(n, 1), r && (n <= s && s--, n <= o && o--)
                        }), this
                    },
                    has: function(e) {
                        return e ? jQuery.inArray(e, u) > -1 : !!u && !!u.length
                    },
                    empty: function() {
                        return u = [], s = 0, this
                    },
                    disable: function() {
                        return u = a = t = undefined, this
                    },
                    disabled: function() {
                        return !u
                    },
                    lock: function() {
                        return a = undefined, t || l.disable(), this
                    },
                    locked: function() {
                        return !a
                    },
                    fireWith: function(e, t) {
                        return u && (!n || a) && (t = t || [], t = [e, t.slice ? t.slice() : t], r ? a.push(t) : f(t)), this
                    },
                    fire: function() {
                        return l.fireWith(this, arguments), this
                    },
                    fired: function() {
                        return !!n
                    }
                };
            return l
        }, jQuery.extend({
            Deferred: function(e) {
                var t = [
                        ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
                        ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
                        ["notify", "progress", jQuery.Callbacks("memory")]
                    ],
                    n = "pending",
                    r = {
                        state: function() {
                            return n
                        },
                        always: function() {
                            return i.done(arguments).fail(arguments), this
                        },
                        then: function() {
                            var e = arguments;
                            return jQuery.Deferred(function(n) {
                                jQuery.each(t, function(t, s) {
                                    var o = s[0],
                                        u = jQuery.isFunction(e[t]) && e[t];
                                    i[s[1]](function() {
                                        var e = u && u.apply(this, arguments);
                                        e && jQuery.isFunction(e.promise) ? e.promise().done(n.resolve).fail(n.reject).progress(n.notify) : n[o + "With"](this === r ? n.promise() : this, u ? [e] : arguments)
                                    })
                                }), e = null
                            }).promise()
                        },
                        promise: function(e) {
                            return e != null ? jQuery.extend(e, r) : r
                        }
                    },
                    i = {};
                return r.pipe = r.then, jQuery.each(t, function(e, s) {
                    var o = s[2],
                        u = s[3];
                    r[s[1]] = o.add, u && o.add(function() {
                        n = u
                    }, t[e ^ 1][2].disable, t[2][2].lock), i[s[0]] = function() {
                        return i[s[0] + "With"](this === i ? r : this, arguments), this
                    }, i[s[0] + "With"] = o.fireWith
                }), r.promise(i), e && e.call(i, i), i
            },
            when: function(e) {
                var t = 0,
                    n = core_slice.call(arguments),
                    r = n.length,
                    i = r !== 1 || e && jQuery.isFunction(e.promise) ? r : 0,
                    s = i === 1 ? e : jQuery.Deferred(),
                    o = function(e, t, n) {
                        return function(r) {
                            t[e] = this, n[e] = arguments.length > 1 ? core_slice.call(arguments) : r, n === u ? s.notifyWith(t, n) : --i || s.resolveWith(t, n)
                        }
                    },
                    u, a, f;
                if (r > 1) {
                    u = new Array(r), a = new Array(r), f = new Array(r);
                    for (; t < r; t++) n[t] && jQuery.isFunction(n[t].promise) ? n[t].promise().done(o(t, f, n)).fail(s.reject).progress(o(t, a, u)) : --i
                }
                return i || s.resolveWith(f, n), s.promise()
            }
        }), jQuery.support = function(e) {
            var t = document.createElement("input"),
                n = document.createDocumentFragment(),
                r = document.createElement("div"),
                i = document.createElement("select"),
                s = i.appendChild(document.createElement("option"));
            return t.type ? (t.type = "checkbox", e.checkOn = t.value !== "", e.optSelected = s.selected, e.reliableMarginRight = !0, e.boxSizingReliable = !0, e.pixelPosition = !1, t.checked = !0, e.noCloneChecked = t.cloneNode(!0).checked, i.disabled = !0, e.optDisabled = !s.disabled, t = document.createElement("input"), t.value = "t", t.type = "radio", e.radioValue = t.value === "t", t.setAttribute("checked", "t"), t.setAttribute("name", "t"), n.appendChild(t), e.checkClone = n.cloneNode(!0).cloneNode(!0).lastChild.checked, e.focusinBubbles = "onfocusin" in window, r.style.backgroundClip = "content-box", r.cloneNode(!0).style.backgroundClip = "", e.clearCloneStyle = r.style.backgroundClip === "content-box", jQuery(function() {
                var t, n, i = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",
                    s = document.getElementsByTagName("body")[0];
                if (!s) return;
                t = document.createElement("div"), t.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", s.appendChild(t).appendChild(r), r.innerHTML = "", r.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%", jQuery.swap(s, s.style.zoom != null ? {
                    zoom: 1
                } : {}, function() {
                    e.boxSizing = r.offsetWidth === 4
                }), window.getComputedStyle && (e.pixelPosition = (window.getComputedStyle(r, null) || {}).top !== "1%", e.boxSizingReliable = (window.getComputedStyle(r, null) || {
                    width: "4px"
                }).width === "4px", n = r.appendChild(document.createElement("div")), n.style.cssText = r.style.cssText = i, n.style.marginRight = n.style.width = "0", r.style.width = "1px", e.reliableMarginRight = !parseFloat((window.getComputedStyle(n, null) || {}).marginRight)), s.removeChild(t)
            }), e) : e
        }({});
        var data_user, data_priv, rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
            rmultiDash = /([A-Z])/g;
        Data.uid = 1, Data.accepts = function(e) {
            return e.nodeType ? e.nodeType === 1 || e.nodeType === 9 : !0
        }, Data.prototype = {
            key: function(e) {
                if (!Data.accepts(e)) return 0;
                var t = {},
                    n = e[this.expando];
                if (!n) {
                    n = Data.uid++;
                    try {
                        t[this.expando] = {
                            value: n
                        }, Object.defineProperties(e, t)
                    } catch (r) {
                        t[this.expando] = n, jQuery.extend(e, t)
                    }
                }
                return this.cache[n] || (this.cache[n] = {}), n
            },
            set: function(e, t, n) {
                var r, i = this.key(e),
                    s = this.cache[i];
                if (typeof t == "string") s[t] = n;
                else if (jQuery.isEmptyObject(s)) jQuery.extend(this.cache[i], t);
                else
                    for (r in t) s[r] = t[r];
                return s
            },
            get: function(e, t) {
                var n = this.cache[this.key(e)];
                return t === undefined ? n : n[t]
            },
            access: function(e, t, n) {
                var r;
                return t === undefined || t && typeof t == "string" && n === undefined ? (r = this.get(e, t), r !== undefined ? r : this.get(e, jQuery.camelCase(t))) : (this.set(e, t, n), n !== undefined ? n : t)
            },
            remove: function(e, t) {
                var n, r, i, s = this.key(e),
                    o = this.cache[s];
                if (t === undefined) this.cache[s] = {};
                else {
                    jQuery.isArray(t) ? r = t.concat(t.map(jQuery.camelCase)) : (i = jQuery.camelCase(t), t in o ? r = [t, i] : (r = i, r = r in o ? [r] : r.match(core_rnotwhite) || [])), n = r.length;
                    while (n--) delete o[r[n]]
                }
            },
            hasData: function(e) {
                return !jQuery.isEmptyObject(this.cache[e[this.expando]] || {})
            },
            discard: function(e) {
                e[this.expando] && delete this.cache[e[this.expando]]
            }
        }, data_user = new Data, data_priv = new Data, jQuery.extend({
            acceptData: Data.accepts,
            hasData: function(e) {
                return data_user.hasData(e) || data_priv.hasData(e)
            },
            data: function(e, t, n) {
                return data_user.access(e, t, n)
            },
            removeData: function(e, t) {
                data_user.remove(e, t)
            },
            _data: function(e, t, n) {
                return data_priv.access(e, t, n)
            },
            _removeData: function(e, t) {
                data_priv.remove(e, t)
            }
        }), jQuery.fn.extend({
            data: function(e, t) {
                var n, r, i = this[0],
                    s = 0,
                    o = null;
                if (e === undefined) {
                    if (this.length) {
                        o = data_user.get(i);
                        if (i.nodeType === 1 && !data_priv.get(i, "hasDataAttrs")) {
                            n = i.attributes;
                            for (; s < n.length; s++) r = n[s].name, r.indexOf("data-") === 0 && (r = jQuery.camelCase(r.slice(5)), dataAttr(i, r, o[r]));
                            data_priv.set(i, "hasDataAttrs", !0)
                        }
                    }
                    return o
                }
                return typeof e == "object" ? this.each(function() {
                    data_user.set(this, e)
                }) : jQuery.access(this, function(t) {
                    var n, r = jQuery.camelCase(e);
                    if (i && t === undefined) {
                        n = data_user.get(i, e);
                        if (n !== undefined) return n;
                        n = data_user.get(i, r);
                        if (n !== undefined) return n;
                        n = dataAttr(i, r, undefined);
                        if (n !== undefined) return n;
                        return
                    }
                    this.each(function() {
                        var n = data_user.get(this, r);
                        data_user.set(this, r, t), e.indexOf("-") !== -1 && n !== undefined && data_user.set(this, e, t)
                    })
                }, null, t, arguments.length > 1, null, !0)
            },
            removeData: function(e) {
                return this.each(function() {
                    data_user.remove(this, e)
                })
            }
        }), jQuery.extend({
            queue: function(e, t, n) {
                var r;
                if (e) return t = (t || "fx") + "queue", r = data_priv.get(e, t), n && (!r || jQuery.isArray(n) ? r = data_priv.access(e, t, jQuery.makeArray(n)) : r.push(n)), r || []
            },
            dequeue: function(e, t) {
                t = t || "fx";
                var n = jQuery.queue(e, t),
                    r = n.length,
                    i = n.shift(),
                    s = jQuery._queueHooks(e, t),
                    o = function() {
                        jQuery.dequeue(e, t)
                    };
                i === "inprogress" && (i = n.shift(), r--), i && (t === "fx" && n.unshift("inprogress"), delete s.stop, i.call(e, o, s)), !r && s && s.empty.fire()
            },
            _queueHooks: function(e, t) {
                var n = t + "queueHooks";
                return data_priv.get(e, n) || data_priv.access(e, n, {
                    empty: jQuery.Callbacks("once memory").add(function() {
                        data_priv.remove(e, [t + "queue", n])
                    })
                })
            }
        }), jQuery.fn.extend({
            queue: function(e, t) {
                var n = 2;
                return typeof e != "string" && (t = e, e = "fx", n--), arguments.length < n ? jQuery.queue(this[0], e) : t === undefined ? this : this.each(function() {
                    var n = jQuery.queue(this, e, t);
                    jQuery._queueHooks(this, e), e === "fx" && n[0] !== "inprogress" && jQuery.dequeue(this, e)
                })
            },
            dequeue: function(e) {
                return this.each(function() {
                    jQuery.dequeue(this, e)
                })
            },
            delay: function(e, t) {
                return e = jQuery.fx ? jQuery.fx.speeds[e] || e : e, t = t || "fx", this.queue(t, function(t, n) {
                    var r = setTimeout(t, e);
                    n.stop = function() {
                        clearTimeout(r)
                    }
                })
            },
            clearQueue: function(e) {
                return this.queue(e || "fx", [])
            },
            promise: function(e, t) {
                var n, r = 1,
                    i = jQuery.Deferred(),
                    s = this,
                    o = this.length,
                    u = function() {
                        --r || i.resolveWith(s, [s])
                    };
                typeof e != "string" && (t = e, e = undefined), e = e || "fx";
                while (o--) n = data_priv.get(s[o], e + "queueHooks"), n && n.empty && (r++, n.empty.add(u));
                return u(), i.promise(t)
            }
        });
        var nodeHook, boolHook, rclass = /[\t\r\n\f]/g,
            rreturn = /\r/g,
            rfocusable = /^(?:input|select|textarea|button)$/i;
        jQuery.fn.extend({
            attr: function(e, t) {
                return jQuery.access(this, jQuery.attr, e, t, arguments.length > 1)
            },
            removeAttr: function(e) {
                return this.each(function() {
                    jQuery.removeAttr(this, e)
                })
            },
            prop: function(e, t) {
                return jQuery.access(this, jQuery.prop, e, t, arguments.length > 1)
            },
            removeProp: function(e) {
                return this.each(function() {
                    delete this[jQuery.propFix[e] || e]
                })
            },
            addClass: function(e) {
                var t, n, r, i, s, o = 0,
                    u = this.length,
                    a = typeof e == "string" && e;
                if (jQuery.isFunction(e)) return this.each(function(t) {
                    jQuery(this).addClass(e.call(this, t, this.className))
                });
                if (a) {
                    t = (e || "").match(core_rnotwhite) || [];
                    for (; o < u; o++) {
                        n = this[o], r = n.nodeType === 1 && (n.className ? (" " + n.className + " ").replace(rclass, " ") : " ");
                        if (r) {
                            s = 0;
                            while (i = t[s++]) r.indexOf(" " + i + " ") < 0 && (r += i + " ");
                            n.className = jQuery.trim(r)
                        }
                    }
                }
                return this
            },
            removeClass: function(e) {
                var t, n, r, i, s, o = 0,
                    u = this.length,
                    a = arguments.length === 0 || typeof e == "string" && e;
                if (jQuery.isFunction(e)) return this.each(function(t) {
                    jQuery(this).removeClass(e.call(this, t, this.className))
                });
                if (a) {
                    t = (e || "").match(core_rnotwhite) || [];
                    for (; o < u; o++) {
                        n = this[o], r = n.nodeType === 1 && (n.className ? (" " + n.className + " ").replace(rclass, " ") : "");
                        if (r) {
                            s = 0;
                            while (i = t[s++])
                                while (r.indexOf(" " + i + " ") >= 0) r = r.replace(" " + i + " ", " ");
                            n.className = e ? jQuery.trim(r) : ""
                        }
                    }
                }
                return this
            },
            toggleClass: function(e, t) {
                var n = typeof e;
                return typeof t == "boolean" && n === "string" ? t ? this.addClass(e) : this.removeClass(e) : jQuery.isFunction(e) ? this.each(function(n) {
                    jQuery(this).toggleClass(e.call(this, n, this.className, t), t)
                }) : this.each(function() {
                    if (n === "string") {
                        var t, r = 0,
                            i = jQuery(this),
                            s = e.match(core_rnotwhite) || [];
                        while (t = s[r++]) i.hasClass(t) ? i.removeClass(t) : i.addClass(t)
                    } else if (n === core_strundefined || n === "boolean") this.className && data_priv.set(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : data_priv.get(this, "__className__") || ""
                })
            },
            hasClass: function(e) {
                var t = " " + e + " ",
                    n = 0,
                    r = this.length;
                for (; n < r; n++)
                    if (this[n].nodeType === 1 && (" " + this[n].className + " ").replace(rclass, " ").indexOf(t) >= 0) return !0;
                return !1
            },
            val: function(e) {
                var t, n, r, i = this[0];
                if (!arguments.length) {
                    if (i) return t = jQuery.valHooks[i.type] || jQuery.valHooks[i.nodeName.toLowerCase()], t && "get" in t && (n = t.get(i, "value")) !== undefined ? n : (n = i.value, typeof n == "string" ? n.replace(rreturn, "") : n == null ? "" : n);
                    return
                }
                return r = jQuery.isFunction(e), this.each(function(n) {
                    var i;
                    if (this.nodeType !== 1) return;
                    r ? i = e.call(this, n, jQuery(this).val()) : i = e, i == null ? i = "" : typeof i == "number" ? i += "" : jQuery.isArray(i) && (i = jQuery.map(i, function(e) {
                        return e == null ? "" : e + ""
                    })), t = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
                    if (!t || !("set" in t) || t.set(this, i, "value") === undefined) this.value = i
                })
            }
        }), jQuery.extend({
            valHooks: {
                option: {
                    get: function(e) {
                        var t = e.attributes.value;
                        return !t || t.specified ? e.value : e.text
                    }
                },
                select: {
                    get: function(e) {
                        var t, n, r = e.options,
                            i = e.selectedIndex,
                            s = e.type === "select-one" || i < 0,
                            o = s ? null : [],
                            u = s ? i + 1 : r.length,
                            a = i < 0 ? u : s ? i : 0;
                        for (; a < u; a++) {
                            n = r[a];
                            if ((n.selected || a === i) && (jQuery.support.optDisabled ? !n.disabled : n.getAttribute("disabled") === null) && (!n.parentNode.disabled || !jQuery.nodeName(n.parentNode, "optgroup"))) {
                                t = jQuery(n).val();
                                if (s) return t;
                                o.push(t)
                            }
                        }
                        return o
                    },
                    set: function(e, t) {
                        var n, r, i = e.options,
                            s = jQuery.makeArray(t),
                            o = i.length;
                        while (o--) {
                            r = i[o];
                            if (r.selected = jQuery.inArray(jQuery(r).val(), s) >= 0) n = !0
                        }
                        return n || (e.selectedIndex = -1), s
                    }
                }
            },
            attr: function(e, t, n) {
                var r, i, s = e.nodeType;
                if (!e || s === 3 || s === 8 || s === 2) return;
                if (typeof e.getAttribute === core_strundefined) return jQuery.prop(e, t, n);
                if (s !== 1 || !jQuery.isXMLDoc(e)) t = t.toLowerCase(), r = jQuery.attrHooks[t] || (jQuery.expr.match.bool.test(t) ? boolHook : nodeHook);
                if (n === undefined) return r && "get" in r && (i = r.get(e, t)) !== null ? i : (i = jQuery.find.attr(e, t), i == null ? undefined : i);
                if (n !== null) return r && "set" in r && (i = r.set(e, n, t)) !== undefined ? i : (e.setAttribute(t, n + ""), n);
                jQuery.removeAttr(e, t)
            },
            removeAttr: function(e, t) {
                var n, r, i = 0,
                    s = t && t.match(core_rnotwhite);
                if (s && e.nodeType === 1)
                    while (n = s[i++]) r = jQuery.propFix[n] || n, jQuery.expr.match.bool.test(n) && (e[r] = !1), e.removeAttribute(n)
            },
            attrHooks: {
                type: {
                    set: function(e, t) {
                        if (!jQuery.support.radioValue && t === "radio" && jQuery.nodeName(e, "input")) {
                            var n = e.value;
                            return e.setAttribute("type", t), n && (e.value = n), t
                        }
                    }
                }
            },
            propFix: {
                "for": "htmlFor",
                "class": "className"
            },
            prop: function(e, t, n) {
                var r, i, s, o = e.nodeType;
                if (!e || o === 3 || o === 8 || o === 2) return;
                return s = o !== 1 || !jQuery.isXMLDoc(e), s && (t = jQuery.propFix[t] || t, i = jQuery.propHooks[t]), n !== undefined ? i && "set" in i && (r = i.set(e, n, t)) !== undefined ? r : e[t] = n : i && "get" in i && (r = i.get(e, t)) !== null ? r : e[t]
            },
            propHooks: {
                tabIndex: {
                    get: function(e) {
                        return e.hasAttribute("tabindex") || rfocusable.test(e.nodeName) || e.href ? e.tabIndex : -1
                    }
                }
            }
        }), boolHook = {
            set: function(e, t, n) {
                return t === !1 ? jQuery.removeAttr(e, n) : e.setAttribute(n, n), n
            }
        }, jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(e, t) {
            var n = jQuery.expr.attrHandle[t] || jQuery.find.attr;
            jQuery.expr.attrHandle[t] = function(e, t, r) {
                var i = jQuery.expr.attrHandle[t],
                    s = r ? undefined : (jQuery.expr.attrHandle[t] = undefined) != n(e, t, r) ? t.toLowerCase() : null;
                return jQuery.expr.attrHandle[t] = i, s
            }
        }), jQuery.support.optSelected || (jQuery.propHooks.selected = {
            get: function(e) {
                var t = e.parentNode;
                return t && t.parentNode && t.parentNode.selectedIndex, null
            }
        }), jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
            jQuery.propFix[this.toLowerCase()] = this
        }), jQuery.each(["radio", "checkbox"], function() {
            jQuery.valHooks[this] = {
                set: function(e, t) {
                    if (jQuery.isArray(t)) return e.checked = jQuery.inArray(jQuery(e).val(), t) >= 0
                }
            }, jQuery.support.checkOn || (jQuery.valHooks[this].get = function(e) {
                return e.getAttribute("value") === null ? "on" : e.value
            })
        });
        var rkeyEvent = /^key/,
            rmouseEvent = /^(?:mouse|contextmenu)|click/,
            rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
            rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
        jQuery.event = {
            global: {},
            add: function(e, t, n, r, i) {
                var s, o, u, a, f, l, c, h, p, d, v, m = data_priv.get(e);
                if (!m) return;
                n.handler && (s = n, n = s.handler, i = s.selector), n.guid || (n.guid = jQuery.guid++), (a = m.events) || (a = m.events = {}), (o = m.handle) || (o = m.handle = function(e) {
                    return typeof jQuery === core_strundefined || !!e && jQuery.event.triggered === e.type ? undefined : jQuery.event.dispatch.apply(o.elem, arguments)
                }, o.elem = e), t = (t || "").match(core_rnotwhite) || [""], f = t.length;
                while (f--) {
                    u = rtypenamespace.exec(t[f]) || [], p = v = u[1], d = (u[2] || "").split(".").sort();
                    if (!p) continue;
                    c = jQuery.event.special[p] || {}, p = (i ? c.delegateType : c.bindType) || p, c = jQuery.event.special[p] || {}, l = jQuery.extend({
                        type: p,
                        origType: v,
                        data: r,
                        handler: n,
                        guid: n.guid,
                        selector: i,
                        needsContext: i && jQuery.expr.match.needsContext.test(i),
                        namespace: d.join(".")
                    }, s), (h = a[p]) || (h = a[p] = [], h.delegateCount = 0, (!c.setup || c.setup.call(e, r, d, o) === !1) && e.addEventListener && e.addEventListener(p, o, !1)), c.add && (c.add.call(e, l), l.handler.guid || (l.handler.guid = n.guid)), i ? h.splice(h.delegateCount++, 0, l) : h.push(l), jQuery.event.global[p] = !0
                }
                e = null
            },
            remove: function(e, t, n, r, i) {
                var s, o, u, a, f, l, c, h, p, d, v, m = data_priv.hasData(e) && data_priv.get(e);
                if (!m || !(a = m.events)) return;
                t = (t || "").match(core_rnotwhite) || [""], f = t.length;
                while (f--) {
                    u = rtypenamespace.exec(t[f]) || [], p = v = u[1], d = (u[2] || "").split(".").sort();
                    if (!p) {
                        for (p in a) jQuery.event.remove(e, p + t[f], n, r, !0);
                        continue
                    }
                    c = jQuery.event.special[p] || {}, p = (r ? c.delegateType : c.bindType) || p, h = a[p] || [], u = u[2] && new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)"), o = s = h.length;
                    while (s--) l = h[s], (i || v === l.origType) && (!n || n.guid === l.guid) && (!u || u.test(l.namespace)) && (!r || r === l.selector || r === "**" && l.selector) && (h.splice(s, 1), l.selector && h.delegateCount--, c.remove && c.remove.call(e, l));
                    o && !h.length && ((!c.teardown || c.teardown.call(e, d, m.handle) === !1) && jQuery.removeEvent(e, p, m.handle), delete a[p])
                }
                jQuery.isEmptyObject(a) && (delete m.handle, data_priv.remove(e, "events"))
            },
            trigger: function(e, t, n, r) {
                var i, s, o, u, a, f, l, c = [n || document],
                    h = core_hasOwn.call(e, "type") ? e.type : e,
                    p = core_hasOwn.call(e, "namespace") ? e.namespace.split(".") : [];
                s = o = n = n || document;
                if (n.nodeType === 3 || n.nodeType === 8) return;
                if (rfocusMorph.test(h + jQuery.event.triggered)) return;
                h.indexOf(".") >= 0 && (p = h.split("."), h = p.shift(), p.sort()), a = h.indexOf(":") < 0 && "on" + h, e = e[jQuery.expando] ? e : new jQuery.Event(h, typeof e == "object" && e), e.isTrigger = r ? 2 : 3, e.namespace = p.join("."), e.namespace_re = e.namespace ? new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, e.result = undefined, e.target || (e.target = n), t = t == null ? [e] : jQuery.makeArray(t, [e]), l = jQuery.event.special[h] || {};
                if (!r && l.trigger && l.trigger.apply(n, t) === !1) return;
                if (!r && !l.noBubble && !jQuery.isWindow(n)) {
                    u = l.delegateType || h, rfocusMorph.test(u + h) || (s = s.parentNode);
                    for (; s; s = s.parentNode) c.push(s), o = s;
                    o === (n.ownerDocument || document) && c.push(o.defaultView || o.parentWindow || window)
                }
                i = 0;
                while ((s = c[i++]) && !e.isPropagationStopped()) e.type = i > 1 ? u : l.bindType || h, f = (data_priv.get(s, "events") || {})[e.type] && data_priv.get(s, "handle"), f && f.apply(s, t), f = a && s[a], f && jQuery.acceptData(s) && f.apply && f.apply(s, t) === !1 && e.preventDefault();
                return e.type = h, !r && !e.isDefaultPrevented() && (!l._default || l._default.apply(c.pop(), t) === !1) && jQuery.acceptData(n) && a && jQuery.isFunction(n[h]) && !jQuery.isWindow(n) && (o = n[a], o && (n[a] = null), jQuery.event.triggered = h, n[h](), jQuery.event.triggered = undefined, o && (n[a] = o)), e.result
            },
            dispatch: function(e) {
                e = jQuery.event.fix(e);
                var t, n, r, i, s, o = [],
                    u = core_slice.call(arguments),
                    a = (data_priv.get(this, "events") || {})[e.type] || [],
                    f = jQuery.event.special[e.type] || {};
                u[0] = e, e.delegateTarget = this;
                if (f.preDispatch && f.preDispatch.call(this, e) === !1) return;
                o = jQuery.event.handlers.call(this, e, a), t = 0;
                while ((i = o[t++]) && !e.isPropagationStopped()) {
                    e.currentTarget = i.elem, n = 0;
                    while ((s = i.handlers[n++]) && !e.isImmediatePropagationStopped())
                        if (!e.namespace_re || e.namespace_re.test(s.namespace)) e.handleObj = s, e.data = s.data, r = ((jQuery.event.special[s.origType] || {}).handle || s.handler).apply(i.elem, u), r !== undefined && (e.result = r) === !1 && (e.preventDefault(), e.stopPropagation())
                }
                return f.postDispatch && f.postDispatch.call(this, e), e.result
            },
            handlers: function(e, t) {
                var n, r, i, s, o = [],
                    u = t.delegateCount,
                    a = e.target;
                if (u && a.nodeType && (!e.button || e.type !== "click"))
                    for (; a !== this; a = a.parentNode || this)
                        if (a.disabled !== !0 || e.type !== "click") {
                            r = [];
                            for (n = 0; n < u; n++) s = t[n], i = s.selector + " ", r[i] === undefined && (r[i] = s.needsContext ? jQuery(i, this).index(a) >= 0 : jQuery.find(i, this, null, [a]).length), r[i] && r.push(s);
                            r.length && o.push({
                                elem: a,
                                handlers: r
                            })
                        }
                return u < t.length && o.push({
                    elem: this,
                    handlers: t.slice(u)
                }), o
            },
            props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
            fixHooks: {},
            keyHooks: {
                props: "char charCode key keyCode".split(" "),
                filter: function(e, t) {
                    return e.which == null && (e.which = t.charCode != null ? t.charCode : t.keyCode), e
                }
            },
            mouseHooks: {
                props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
                filter: function(e, t) {
                    var n, r, i, s = t.button;
                    return e.pageX == null && t.clientX != null && (n = e.target.ownerDocument || document, r = n.documentElement, i = n.body, e.pageX = t.clientX + (r && r.scrollLeft || i && i.scrollLeft || 0) - (r && r.clientLeft || i && i.clientLeft || 0), e.pageY = t.clientY + (r && r.scrollTop || i && i.scrollTop || 0) - (r && r.clientTop || i && i.clientTop || 0)), !e.which && s !== undefined && (e.which = s & 1 ? 1 : s & 2 ? 3 : s & 4 ? 2 : 0), e
                }
            },
            fix: function(e) {
                if (e[jQuery.expando]) return e;
                var t, n, r, i = e.type,
                    s = e,
                    o = this.fixHooks[i];
                o || (this.fixHooks[i] = o = rmouseEvent.test(i) ? this.mouseHooks : rkeyEvent.test(i) ? this.keyHooks : {}), r = o.props ? this.props.concat(o.props) : this.props, e = new jQuery.Event(s), t = r.length;
                while (t--) n = r[t], e[n] = s[n];
                return e.target || (e.target = document), e.target.nodeType === 3 && (e.target = e.target.parentNode), o.filter ? o.filter(e, s) : e
            },
            special: {
                load: {
                    noBubble: !0
                },
                focus: {
                    trigger: function() {
                        if (this !== safeActiveElement() && this.focus) return this.focus(), !1
                    },
                    delegateType: "focusin"
                },
                blur: {
                    trigger: function() {
                        if (this === safeActiveElement() && this.blur) return this.blur(), !1
                    },
                    delegateType: "focusout"
                },
                click: {
                    trigger: function() {
                        if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) return this.click(), !1
                    },
                    _default: function(e) {
                        return jQuery.nodeName(e.target, "a")
                    }
                },
                beforeunload: {
                    postDispatch: function(e) {
                        e.result !== undefined && (e.originalEvent.returnValue = e.result)
                    }
                }
            },
            simulate: function(e, t, n, r) {
                var i = jQuery.extend(new jQuery.Event, n, {
                    type: e,
                    isSimulated: !0,
                    originalEvent: {}
                });
                r ? jQuery.event.trigger(i, null, t) : jQuery.event.dispatch.call(t, i), i.isDefaultPrevented() && n.preventDefault()
            }
        }, jQuery.removeEvent = function(e, t, n) {
            e.removeEventListener && e.removeEventListener(t, n, !1)
        }, jQuery.Event = function(e, t) {
            if (!(this instanceof jQuery.Event)) return new jQuery.Event(e, t);
            e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || e.getPreventDefault && e.getPreventDefault() ? returnTrue : returnFalse) : this.type = e, t && jQuery.extend(this, t), this.timeStamp = e && e.timeStamp || jQuery.now(), this[jQuery.expando] = !0
        }, jQuery.Event.prototype = {
            isDefaultPrevented: returnFalse,
            isPropagationStopped: returnFalse,
            isImmediatePropagationStopped: returnFalse,
            preventDefault: function() {
                var e = this.originalEvent;
                this.isDefaultPrevented = returnTrue, e && e.preventDefault && e.preventDefault()
            },
            stopPropagation: function() {
                var e = this.originalEvent;
                this.isPropagationStopped = returnTrue, e && e.stopPropagation && e.stopPropagation()
            },
            stopImmediatePropagation: function() {
                this.isImmediatePropagationStopped = returnTrue, this.stopPropagation()
            }
        }, jQuery.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        }, function(e, t) {
            jQuery.event.special[e] = {
                delegateType: t,
                bindType: t,
                handle: function(e) {
                    var n, r = this,
                        i = e.relatedTarget,
                        s = e.handleObj;
                    if (!i || i !== r && !jQuery.contains(r, i)) e.type = s.origType, n = s.handler.apply(this, arguments), e.type = t;
                    return n
                }
            }
        }), jQuery.support.focusinBubbles || jQuery.each({
            focus: "focusin",
            blur: "focusout"
        }, function(e, t) {
            var n = 0,
                r = function(e) {
                    jQuery.event.simulate(t, e.target, jQuery.event.fix(e), !0)
                };
            jQuery.event.special[t] = {
                setup: function() {
                    n++ === 0 && document.addEventListener(e, r, !0)
                },
                teardown: function() {
                    --n === 0 && document.removeEventListener(e, r, !0)
                }
            }
        }), jQuery.fn.extend({
            on: function(e, t, n, r, i) {
                var s, o;
                if (typeof e == "object") {
                    typeof t != "string" && (n = n || t, t = undefined);
                    for (o in e) this.on(o, t, n, e[o], i);
                    return this
                }
                n == null && r == null ? (r = t, n = t = undefined) : r == null && (typeof t == "string" ? (r = n, n = undefined) : (r = n, n = t, t = undefined));
                if (r === !1) r = returnFalse;
                else if (!r) return this;
                return i === 1 && (s = r, r = function(e) {
                    return jQuery().off(e), s.apply(this, arguments)
                }, r.guid = s.guid || (s.guid = jQuery.guid++)), this.each(function() {
                    jQuery.event.add(this, e, r, n, t)
                })
            },
            one: function(e, t, n, r) {
                return this.on(e, t, n, r, 1)
            },
            off: function(e, t, n) {
                var r, i;
                if (e && e.preventDefault && e.handleObj) return r = e.handleObj, jQuery(e.delegateTarget).off(r.namespace ? r.origType + "." + r.namespace : r.origType, r.selector, r.handler), this;
                if (typeof e == "object") {
                    for (i in e) this.off(i, t, e[i]);
                    return this
                }
                if (t === !1 || typeof t == "function") n = t, t = undefined;
                return n === !1 && (n = returnFalse), this.each(function() {
                    jQuery.event.remove(this, e, n, t)
                })
            },
            trigger: function(e, t) {
                return this.each(function() {
                    jQuery.event.trigger(e, t, this)
                })
            },
            triggerHandler: function(e, t) {
                var n = this[0];
                if (n) return jQuery.event.trigger(e, t, n, !0)
            }
        });
        var isSimple = /^.[^:#\[\.,]*$/,
            rparentsprev = /^(?:parents|prev(?:Until|All))/,
            rneedsContext = jQuery.expr.match.needsContext,
            guaranteedUnique = {
                children: !0,
                contents: !0,
                next: !0,
                prev: !0
            };
        jQuery.fn.extend({
            find: function(e) {
                var t, n = [],
                    r = this,
                    i = r.length;
                if (typeof e != "string") return this.pushStack(jQuery(e).filter(function() {
                    for (t = 0; t < i; t++)
                        if (jQuery.contains(r[t], this)) return !0
                }));
                for (t = 0; t < i; t++) jQuery.find(e, r[t], n);
                return n = this.pushStack(i > 1 ? jQuery.unique(n) : n), n.selector = this.selector ? this.selector + " " + e : e, n
            },
            has: function(e) {
                var t = jQuery(e, this),
                    n = t.length;
                return this.filter(function() {
                    var e = 0;
                    for (; e < n; e++)
                        if (jQuery.contains(this, t[e])) return !0
                })
            },
            not: function(e) {
                return this.pushStack(winnow(this, e || [], !0))
            },
            filter: function(e) {
                return this.pushStack(winnow(this, e || [], !1))
            },
            is: function(e) {
                return !!winnow(this, typeof e == "string" && rneedsContext.test(e) ? jQuery(e) : e || [], !1).length
            },
            closest: function(e, t) {
                var n, r = 0,
                    i = this.length,
                    s = [],
                    o = rneedsContext.test(e) || typeof e != "string" ? jQuery(e, t || this.context) : 0;
                for (; r < i; r++)
                    for (n = this[r]; n && n !== t; n = n.parentNode)
                        if (n.nodeType < 11 && (o ? o.index(n) > -1 : n.nodeType === 1 && jQuery.find.matchesSelector(n, e))) {
                            n = s.push(n);
                            break
                        }
                return this.pushStack(s.length > 1 ? jQuery.unique(s) : s)
            },
            index: function(e) {
                return e ? typeof e == "string" ? core_indexOf.call(jQuery(e), this[0]) : core_indexOf.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
            },
            add: function(e, t) {
                var n = typeof e == "string" ? jQuery(e, t) : jQuery.makeArray(e && e.nodeType ? [e] : e),
                    r = jQuery.merge(this.get(), n);
                return this.pushStack(jQuery.unique(r))
            },
            addBack: function(e) {
                return this.add(e == null ? this.prevObject : this.prevObject.filter(e))
            }
        }), jQuery.each({
            parent: function(e) {
                var t = e.parentNode;
                return t && t.nodeType !== 11 ? t : null
            },
            parents: function(e) {
                return jQuery.dir(e, "parentNode")
            },
            parentsUntil: function(e, t, n) {
                return jQuery.dir(e, "parentNode", n)
            },
            next: function(e) {
                return sibling(e, "nextSibling")
            },
            prev: function(e) {
                return sibling(e, "previousSibling")
            },
            nextAll: function(e) {
                return jQuery.dir(e, "nextSibling")
            },
            prevAll: function(e) {
                return jQuery.dir(e, "previousSibling")
            },
            nextUntil: function(e, t, n) {
                return jQuery.dir(e, "nextSibling", n)
            },
            prevUntil: function(e, t, n) {
                return jQuery.dir(e, "previousSibling", n)
            },
            siblings: function(e) {
                return jQuery.sibling((e.parentNode || {}).firstChild, e)
            },
            children: function(e) {
                return jQuery.sibling(e.firstChild)
            },
            contents: function(e) {
                return e.contentDocument || jQuery.merge([], e.childNodes)
            }
        }, function(e, t) {
            jQuery.fn[e] = function(n, r) {
                var i = jQuery.map(this, t, n);
                return e.slice(-5) !== "Until" && (r = n), r && typeof r == "string" && (i = jQuery.filter(r, i)), this.length > 1 && (guaranteedUnique[e] || jQuery.unique(i), rparentsprev.test(e) && i.reverse()), this.pushStack(i)
            }
        }), jQuery.extend({
            filter: function(e, t, n) {
                var r = t[0];
                return n && (e = ":not(" + e + ")"), t.length === 1 && r.nodeType === 1 ? jQuery.find.matchesSelector(r, e) ? [r] : [] : jQuery.find.matches(e, jQuery.grep(t, function(e) {
                    return e.nodeType === 1
                }))
            },
            dir: function(e, t, n) {
                var r = [],
                    i = n !== undefined;
                while ((e = e[t]) && e.nodeType !== 9)
                    if (e.nodeType === 1) {
                        if (i && jQuery(e).is(n)) break;
                        r.push(e)
                    }
                return r
            },
            sibling: function(e, t) {
                var n = [];
                for (; e; e = e.nextSibling) e.nodeType === 1 && e !== t && n.push(e);
                return n
            }
        });
        var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            rtagName = /<([\w:]+)/,
            rhtml = /<|&#?\w+;/,
            rnoInnerhtml = /<(?:script|style|link)/i,
            manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
            rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
            rscriptType = /^$|\/(?:java|ecma)script/i,
            rscriptTypeMasked = /^true\/(.*)/,
            rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
            wrapMap = {
                option: [1, "<select multiple='multiple'>", "</select>"],
                thead: [1, "<table>", "</table>"],
                col: [2, "<table><colgroup>", "</colgroup></table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                _default: [0, "", ""]
            };
        wrapMap.optgroup = wrapMap.option, wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead, wrapMap.th = wrapMap.td, jQuery.fn.extend({
            text: function(e) {
                return jQuery.access(this, function(e) {
                    return e === undefined ? jQuery.text(this) : this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(e))
                }, null, e, arguments.length)
            },
            append: function() {
                return this.domManip(arguments, function(e) {
                    if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                        var t = manipulationTarget(this, e);
                        t.appendChild(e)
                    }
                })
            },
            prepend: function() {
                return this.domManip(arguments, function(e) {
                    if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                        var t = manipulationTarget(this, e);
                        t.insertBefore(e, t.firstChild)
                    }
                })
            },
            before: function() {
                return this.domManip(arguments, function(e) {
                    this.parentNode && this.parentNode.insertBefore(e, this)
                })
            },
            after: function() {
                return this.domManip(arguments, function(e) {
                    this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
                })
            },
            remove: function(e, t) {
                var n, r = e ? jQuery.filter(e, this) : this,
                    i = 0;
                for (;
                    (n = r[i]) != null; i++) !t && n.nodeType === 1 && jQuery.cleanData(getAll(n)), n.parentNode && (t && jQuery.contains(n.ownerDocument, n) && setGlobalEval(getAll(n, "script")), n.parentNode.removeChild(n));
                return this
            },
            empty: function() {
                var e, t = 0;
                for (;
                    (e = this[t]) != null; t++) e.nodeType === 1 && (jQuery.cleanData(getAll(e, !1)), e.textContent = "");
                return this
            },
            clone: function(e, t) {
                return e = e == null ? !1 : e, t = t == null ? e : t, this.map(function() {
                    return jQuery.clone(this, e, t)
                })
            },
            html: function(e) {
                return jQuery.access(this, function(e) {
                    var t = this[0] || {},
                        n = 0,
                        r = this.length;
                    if (e === undefined && t.nodeType === 1) return t.innerHTML;
                    if (typeof e == "string" && !rnoInnerhtml.test(e) && !wrapMap[(rtagName.exec(e) || ["", ""])[1].toLowerCase()]) {
                        e = e.replace(rxhtmlTag, "<$1></$2>");
                        try {
                            for (; n < r; n++) t = this[n] || {}, t.nodeType === 1 && (jQuery.cleanData(getAll(t, !1)), t.innerHTML = e);
                            t = 0
                        } catch (i) {}
                    }
                    t && this.empty().append(e)
                }, null, e, arguments.length)
            },
            replaceWith: function() {
                var e = jQuery.map(this, function(e) {
                        return [e.nextSibling, e.parentNode]
                    }),
                    t = 0;
                return this.domManip(arguments, function(n) {
                    var r = e[t++],
                        s = e[t++];
                    s && (r && r.parentNode !== s && (r = this.nextSibling), jQuery(this).remove(), s.insertBefore(n, r))
                }, !0), t ? this : this.remove()
            },
            detach: function(e) {
                return this.remove(e, !0)
            },
            domManip: function(e, t, n) {
                e = core_concat.apply([], e);
                var r, i, s, o, u, a, f = 0,
                    l = this.length,
                    c = this,
                    h = l - 1,
                    p = e[0],
                    d = jQuery.isFunction(p);
                if (d || !(l <= 1 || typeof p != "string" || jQuery.support.checkClone || !rchecked.test(p))) return this.each(function(r) {
                    var i = c.eq(r);
                    d && (e[0] = p.call(this, r, i.html())), i.domManip(e, t, n)
                });
                if (l) {
                    r = jQuery.buildFragment(e, this[0].ownerDocument, !1, !n && this), i = r.firstChild, r.childNodes.length === 1 && (r = i);
                    if (i) {
                        s = jQuery.map(getAll(r, "script"), disableScript), o = s.length;
                        for (; f < l; f++) u = r, f !== h && (u = jQuery.clone(u, !0, !0), o && jQuery.merge(s, getAll(u, "script"))), t.call(this[f], u, f);
                        if (o) {
                            a = s[s.length - 1].ownerDocument, jQuery.map(s, restoreScript);
                            for (f = 0; f < o; f++) u = s[f], rscriptType.test(u.type || "") && !data_priv.access(u, "globalEval") && jQuery.contains(a, u) && (u.src ? jQuery._evalUrl(u.src) : jQuery.globalEval(u.textContent.replace(rcleanScript, "")))
                        }
                    }
                }
                return this
            }
        }), jQuery.each({
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function(e, t) {
            jQuery.fn[e] = function(e) {
                var n, r = [],
                    i = jQuery(e),
                    s = i.length - 1,
                    o = 0;
                for (; o <= s; o++) n = o === s ? this : this.clone(!0), jQuery(i[o])[t](n), core_push.apply(r, n.get());
                return this.pushStack(r)
            }
        }), jQuery.extend({
            clone: function(e, t, n) {
                var r, i, s, o, u = e.cloneNode(!0),
                    a = jQuery.contains(e.ownerDocument, e);
                if (!jQuery.support.noCloneChecked && (e.nodeType === 1 || e.nodeType === 11) && !jQuery.isXMLDoc(e)) {
                    o = getAll(u), s = getAll(e);
                    for (r = 0, i = s.length; r < i; r++) fixInput(s[r], o[r])
                }
                if (t)
                    if (n) {
                        s = s || getAll(e), o = o || getAll(u);
                        for (r = 0, i = s.length; r < i; r++) cloneCopyEvent(s[r], o[r])
                    } else cloneCopyEvent(e, u);
                return o = getAll(u, "script"), o.length > 0 && setGlobalEval(o, !a && getAll(e, "script")), u
            },
            buildFragment: function(e, t, n, r) {
                var i, s, o, u, a, f, l = 0,
                    c = e.length,
                    h = t.createDocumentFragment(),
                    p = [];
                for (; l < c; l++) {
                    i = e[l];
                    if (i || i === 0)
                        if (jQuery.type(i) === "object") jQuery.merge(p, i.nodeType ? [i] : i);
                        else if (!rhtml.test(i)) p.push(t.createTextNode(i));
                    else {
                        s = s || h.appendChild(t.createElement("div")), o = (rtagName.exec(i) || ["", ""])[1].toLowerCase(), u = wrapMap[o] || wrapMap._default, s.innerHTML = u[1] + i.replace(rxhtmlTag, "<$1></$2>") + u[2], f = u[0];
                        while (f--) s = s.lastChild;
                        jQuery.merge(p, s.childNodes), s = h.firstChild, s.textContent = ""
                    }
                }
                h.textContent = "", l = 0;
                while (i = p[l++]) {
                    if (r && jQuery.inArray(i, r) !== -1) continue;
                    a = jQuery.contains(i.ownerDocument, i), s = getAll(h.appendChild(i), "script"), a && setGlobalEval(s);
                    if (n) {
                        f = 0;
                        while (i = s[f++]) rscriptType.test(i.type || "") && n.push(i)
                    }
                }
                return h
            },
            cleanData: function(e) {
                var t, n, r, i, s, o, u = jQuery.event.special,
                    a = 0;
                for (;
                    (n = e[a]) !== undefined; a++) {
                    if (Data.accepts(n)) {
                        s = n[data_priv.expando];
                        if (s && (t = data_priv.cache[s])) {
                            r = Object.keys(t.events || {});
                            if (r.length)
                                for (o = 0;
                                    (i = r[o]) !== undefined; o++) u[i] ? jQuery.event.remove(n, i) : jQuery.removeEvent(n, i, t.handle);
                            data_priv.cache[s] && delete data_priv.cache[s]
                        }
                    }
                    delete data_user.cache[n[data_user.expando]]
                }
            },
            _evalUrl: function(e) {
                return jQuery.ajax({
                    url: e,
                    type: "GET",
                    dataType: "script",
                    async: !1,
                    global: !1,
                    "throws": !0
                })
            }
        }), jQuery.fn.extend({
            wrapAll: function(e) {
                var t;
                return jQuery.isFunction(e) ? this.each(function(t) {
                    jQuery(this).wrapAll(e.call(this, t))
                }) : (this[0] && (t = jQuery(e, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
                    var e = this;
                    while (e.firstElementChild) e = e.firstElementChild;
                    return e
                }).append(this)), this)
            },
            wrapInner: function(e) {
                return jQuery.isFunction(e) ? this.each(function(t) {
                    jQuery(this).wrapInner(e.call(this, t))
                }) : this.each(function() {
                    var t = jQuery(this),
                        n = t.contents();
                    n.length ? n.wrapAll(e) : t.append(e)
                })
            },
            wrap: function(e) {
                var t = jQuery.isFunction(e);
                return this.each(function(n) {
                    jQuery(this).wrapAll(t ? e.call(this, n) : e)
                })
            },
            unwrap: function() {
                return this.parent().each(function() {
                    jQuery.nodeName(this, "body") || jQuery(this).replaceWith(this.childNodes)
                }).end()
            }
        });
        var curCSS, iframe, rdisplayswap = /^(none|table(?!-c[ea]).+)/,
            rmargin = /^margin/,
            rnumsplit = new RegExp("^(" + core_pnum + ")(.*)$", "i"),
            rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i"),
            rrelNum = new RegExp("^([+-])=(" + core_pnum + ")", "i"),
            elemdisplay = {
                BODY: "block"
            },
            cssShow = {
                position: "absolute",
                visibility: "hidden",
                display: "block"
            },
            cssNormalTransform = {
                letterSpacing: 0,
                fontWeight: 400
            },
            cssExpand = ["Top", "Right", "Bottom", "Left"],
            cssPrefixes = ["Webkit", "O", "Moz", "ms"];
        jQuery.fn.extend({
            css: function(e, t) {
                return jQuery.access(this, function(e, t, n) {
                    var r, i, s = {},
                        o = 0;
                    if (jQuery.isArray(t)) {
                        r = getStyles(e), i = t.length;
                        for (; o < i; o++) s[t[o]] = jQuery.css(e, t[o], !1, r);
                        return s
                    }
                    return n !== undefined ? jQuery.style(e, t, n) : jQuery.css(e, t)
                }, e, t, arguments.length > 1)
            },
            show: function() {
                return showHide(this, !0)
            },
            hide: function() {
                return showHide(this)
            },
            toggle: function(e) {
                return typeof e == "boolean" ? e ? this.show() : this.hide() : this.each(function() {
                    isHidden(this) ? jQuery(this).show() : jQuery(this).hide()
                })
            }
        }), jQuery.extend({
            cssHooks: {
                opacity: {
                    get: function(e, t) {
                        if (t) {
                            var n = curCSS(e, "opacity");
                            return n === "" ? "1" : n
                        }
                    }
                }
            },
            cssNumber: {
                columnCount: !0,
                fillOpacity: !0,
                fontWeight: !0,
                lineHeight: !0,
                opacity: !0,
                order: !0,
                orphans: !0,
                widows: !0,
                zIndex: !0,
                zoom: !0
            },
            cssProps: {
                "float": "cssFloat"
            },
            style: function(e, t, n, r) {
                if (!e || e.nodeType === 3 || e.nodeType === 8 || !e.style) return;
                var i, s, o, u = jQuery.camelCase(t),
                    a = e.style;
                t = jQuery.cssProps[u] || (jQuery.cssProps[u] = vendorPropName(a, u)), o = jQuery.cssHooks[t] || jQuery.cssHooks[u];
                if (n === undefined) return o && "get" in o && (i = o.get(e, !1, r)) !== undefined ? i : a[t];
                s = typeof n, s === "string" && (i = rrelNum.exec(n)) && (n = (i[1] + 1) * i[2] + parseFloat(jQuery.css(e, t)), s = "number");
                if (n == null || s === "number" && isNaN(n)) return;
                s === "number" && !jQuery.cssNumber[u] && (n += "px"), !jQuery.support.clearCloneStyle && n === "" && t.indexOf("background") === 0 && (a[t] = "inherit");
                if (!o || !("set" in o) || (n = o.set(e, n, r)) !== undefined) a[t] = n
            },
            css: function(e, t, n, r) {
                var i, s, o, u = jQuery.camelCase(t);
                return t = jQuery.cssProps[u] || (jQuery.cssProps[u] = vendorPropName(e.style, u)), o = jQuery.cssHooks[t] || jQuery.cssHooks[u], o && "get" in o && (i = o.get(e, !0, n)), i === undefined && (i = curCSS(e, t, r)), i === "normal" && t in cssNormalTransform && (i = cssNormalTransform[t]), n === "" || n ? (s = parseFloat(i), n === !0 || jQuery.isNumeric(s) ? s || 0 : i) : i
            }
        }), curCSS = function(e, t, n) {
            var r, i, s, o = n || getStyles(e),
                u = o ? o.getPropertyValue(t) || o[t] : undefined,
                a = e.style;
            return o && (u === "" && !jQuery.contains(e.ownerDocument, e) && (u = jQuery.style(e, t)), rnumnonpx.test(u) && rmargin.test(t) && (r = a.width, i = a.minWidth, s = a.maxWidth, a.minWidth = a.maxWidth = a.width = u, u = o.width, a.width = r, a.minWidth = i, a.maxWidth = s)), u
        }, jQuery.each(["height", "width"], function(e, t) {
            jQuery.cssHooks[t] = {
                get: function(e, n, r) {
                    if (n) return e.offsetWidth === 0 && rdisplayswap.test(jQuery.css(e, "display")) ? jQuery.swap(e, cssShow, function() {
                        return getWidthOrHeight(e, t, r)
                    }) : getWidthOrHeight(e, t, r)
                },
                set: function(e, n, r) {
                    var i = r && getStyles(e);
                    return setPositiveNumber(e, n, r ? augmentWidthOrHeight(e, t, r, jQuery.support.boxSizing && jQuery.css(e, "boxSizing", !1, i) === "border-box", i) : 0)
                }
            }
        }), jQuery(function() {
            jQuery.support.reliableMarginRight || (jQuery.cssHooks.marginRight = {
                get: function(e, t) {
                    if (t) return jQuery.swap(e, {
                        display: "inline-block"
                    }, curCSS, [e, "marginRight"])
                }
            }), !jQuery.support.pixelPosition && jQuery.fn.position && jQuery.each(["top", "left"], function(e, t) {
                jQuery.cssHooks[t] = {
                    get: function(e, n) {
                        if (n) return n = curCSS(e, t), rnumnonpx.test(n) ? jQuery(e).position()[t] + "px" : n
                    }
                }
            })
        }), jQuery.expr && jQuery.expr.filters && (jQuery.expr.filters.hidden = function(e) {
            return e.offsetWidth <= 0 && e.offsetHeight <= 0
        }, jQuery.expr.filters.visible = function(e) {
            return !jQuery.expr.filters.hidden(e)
        }), jQuery.each({
            margin: "",
            padding: "",
            border: "Width"
        }, function(e, t) {
            jQuery.cssHooks[e + t] = {
                expand: function(n) {
                    var r = 0,
                        i = {},
                        s = typeof n == "string" ? n.split(" ") : [n];
                    for (; r < 4; r++) i[e + cssExpand[r] + t] = s[r] || s[r - 2] || s[0];
                    return i
                }
            }, rmargin.test(e) || (jQuery.cssHooks[e + t].set = setPositiveNumber)
        });
        var r20 = /%20/g,
            rbracket = /\[\]$/,
            rCRLF = /\r?\n/g,
            rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
            rsubmittable = /^(?:input|select|textarea|keygen)/i;
        jQuery.fn.extend({
            serialize: function() {
                return jQuery.param(this.serializeArray())
            },
            serializeArray: function() {
                return this.map(function() {
                    var e = jQuery.prop(this, "elements");
                    return e ? jQuery.makeArray(e) : this
                }).filter(function() {
                    var e = this.type;
                    return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(e) && (this.checked || !manipulation_rcheckableType.test(e))
                }).map(function(e, t) {
                    var n = jQuery(this).val();
                    return n == null ? null : jQuery.isArray(n) ? jQuery.map(n, function(e) {
                        return {
                            name: t.name,
                            value: e.replace(rCRLF, "\r\n")
                        }
                    }) : {
                        name: t.name,
                        value: n.replace(rCRLF, "\r\n")
                    }
                }).get()
            }
        }), jQuery.param = function(e, t) {
            var n, r = [],
                i = function(e, t) {
                    t = jQuery.isFunction(t) ? t() : t == null ? "" : t, r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
                };
            t === undefined && (t = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional);
            if (jQuery.isArray(e) || e.jquery && !jQuery.isPlainObject(e)) jQuery.each(e, function() {
                i(this.name, this.value)
            });
            else
                for (n in e) buildParams(n, e[n], t, i);
            return r.join("&").replace(r20, "+")
        }, jQuery.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(e, t) {
            jQuery.fn[t] = function(e, n) {
                return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
            }
        }), jQuery.fn.extend({
            hover: function(e, t) {
                return this.mouseenter(e).mouseleave(t || e)
            },
            bind: function(e, t, n) {
                return this.on(e, null, t, n)
            },
            unbind: function(e, t) {
                return this.off(e, null, t)
            },
            delegate: function(e, t, n, r) {
                return this.on(t, e, n, r)
            },
            undelegate: function(e, t, n) {
                return arguments.length === 1 ? this.off(e, "**") : this.off(t, e || "**", n)
            }
        });
        var ajaxLocParts, ajaxLocation, ajax_nonce = jQuery.now(),
            ajax_rquery = /\?/,
            rhash = /#.*$/,
            rts = /([?&])_=[^&]*/,
            rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
            rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
            rnoContent = /^(?:GET|HEAD)$/,
            rprotocol = /^\/\//,
            rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
            _load = jQuery.fn.load,
            prefilters = {},
            transports = {},
            allTypes = "*/".concat("*");
        try {
            ajaxLocation = location.href
        } catch (e) {
            ajaxLocation = document.createElement("a"), ajaxLocation.href = "", ajaxLocation = ajaxLocation.href
        }
        ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [], jQuery.fn.load = function(e, t, n) {
            if (typeof e != "string" && _load) return _load.apply(this, arguments);
            var r, i, s, o = this,
                u = e.indexOf(" ");
            return u >= 0 && (r = e.slice(u), e = e.slice(0, u)), jQuery.isFunction(t) ? (n = t, t = undefined) : t && typeof t == "object" && (i = "POST"), o.length > 0 && jQuery.ajax({
                url: e,
                type: i,
                dataType: "html",
                data: t
            }).done(function(e) {
                s = arguments, o.html(r ? jQuery("<div>").append(jQuery.parseHTML(e)).find(r) : e)
            }).complete(n && function(e, t) {
                o.each(n, s || [e.responseText, t, e])
            }), this
        }, jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, t) {
            jQuery.fn[t] = function(e) {
                return this.on(t, e)
            }
        }), jQuery.extend({
            active: 0,
            lastModified: {},
            etag: {},
            ajaxSettings: {
                url: ajaxLocation,
                type: "GET",
                isLocal: rlocalProtocol.test(ajaxLocParts[1]),
                global: !0,
                processData: !0,
                async: !0,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                accepts: {
                    "*": allTypes,
                    text: "text/plain",
                    html: "text/html",
                    xml: "application/xml, text/xml",
                    json: "application/json, text/javascript"
                },
                contents: {
                    xml: /xml/,
                    html: /html/,
                    json: /json/
                },
                responseFields: {
                    xml: "responseXML",
                    text: "responseText",
                    json: "responseJSON"
                },
                converters: {
                    "* text": String,
                    "text html": !0,
                    "text json": jQuery.parseJSON,
                    "text xml": jQuery.parseXML
                },
                flatOptions: {
                    url: !0,
                    context: !0
                }
            },
            ajaxSetup: function(e, t) {
                return t ? ajaxExtend(ajaxExtend(e, jQuery.ajaxSettings), t) : ajaxExtend(jQuery.ajaxSettings, e)
            },
            ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
            ajaxTransport: addToPrefiltersOrTransports(transports),
            ajax: function(e, t) {
                function S(e, t, s, u) {
                    var f, m, g, b, E, S = t;
                    if (y === 2) return;
                    y = 2, o && clearTimeout(o), n = undefined, i = u || "", w.readyState = e > 0 ? 4 : 0, f = e >= 200 && e < 300 || e === 304, s && (b = ajaxHandleResponses(l, w, s)), b = ajaxConvert(l, b, w, f);
                    if (f) l.ifModified && (E = w.getResponseHeader("Last-Modified"), E && (jQuery.lastModified[r] = E), E = w.getResponseHeader("etag"), E && (jQuery.etag[r] = E)), e === 204 || l.type === "HEAD" ? S = "nocontent" : e === 304 ? S = "notmodified" : (S = b.state, m = b.data, g = b.error, f = !g);
                    else {
                        g = S;
                        if (e || !S) S = "error", e < 0 && (e = 0)
                    }
                    w.status = e, w.statusText = (t || S) + "", f ? p.resolveWith(c, [m, S, w]) : p.rejectWith(c, [w, S, g]), w.statusCode(v), v = undefined, a && h.trigger(f ? "ajaxSuccess" : "ajaxError", [w, l, f ? m : g]), d.fireWith(c, [w, S]), a && (h.trigger("ajaxComplete", [w, l]), --jQuery.active || jQuery.event.trigger("ajaxStop"))
                }
                typeof e == "object" && (t = e, e = undefined), t = t || {};
                var n, r, i, s, o, u, a, f, l = jQuery.ajaxSetup({}, t),
                    c = l.context || l,
                    h = l.context && (c.nodeType || c.jquery) ? jQuery(c) : jQuery.event,
                    p = jQuery.Deferred(),
                    d = jQuery.Callbacks("once memory"),
                    v = l.statusCode || {},
                    m = {},
                    g = {},
                    y = 0,
                    b = "canceled",
                    w = {
                        readyState: 0,
                        getResponseHeader: function(e) {
                            var t;
                            if (y === 2) {
                                if (!s) {
                                    s = {};
                                    while (t = rheaders.exec(i)) s[t[1].toLowerCase()] = t[2]
                                }
                                t = s[e.toLowerCase()]
                            }
                            return t == null ? null : t
                        },
                        getAllResponseHeaders: function() {
                            return y === 2 ? i : null
                        },
                        setRequestHeader: function(e, t) {
                            var n = e.toLowerCase();
                            return y || (e = g[n] = g[n] || e, m[e] = t), this
                        },
                        overrideMimeType: function(e) {
                            return y || (l.mimeType = e), this
                        },
                        statusCode: function(e) {
                            var t;
                            if (e)
                                if (y < 2)
                                    for (t in e) v[t] = [v[t], e[t]];
                                else w.always(e[w.status]);
                            return this
                        },
                        abort: function(e) {
                            var t = e || b;
                            return n && n.abort(t), S(0, t), this
                        }
                    };
                p.promise(w).complete = d.add, w.success = w.done, w.error = w.fail, l.url = ((e || l.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//"), l.type = t.method || t.type || l.method || l.type, l.dataTypes = jQuery.trim(l.dataType || "*").toLowerCase().match(core_rnotwhite) || [""], l.crossDomain == null && (u = rurl.exec(l.url.toLowerCase()), l.crossDomain = !(!u || u[1] === ajaxLocParts[1] && u[2] === ajaxLocParts[2] && (u[3] || (u[1] === "http:" ? "80" : "443")) === (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443")))), l.data && l.processData && typeof l.data != "string" && (l.data = jQuery.param(l.data, l.traditional)), inspectPrefiltersOrTransports(prefilters, l, t, w);
                if (y === 2) return w;
                a = l.global, a && jQuery.active++ === 0 && jQuery.event.trigger("ajaxStart"), l.type = l.type.toUpperCase(), l.hasContent = !rnoContent.test(l.type), r = l.url, l.hasContent || (l.data && (r = l.url += (ajax_rquery.test(r) ? "&" : "?") + l.data, delete l.data), l.cache === !1 && (l.url = rts.test(r) ? r.replace(rts, "$1_=" + ajax_nonce++) : r + (ajax_rquery.test(r) ? "&" : "?") + "_=" + ajax_nonce++)), l.ifModified && (jQuery.lastModified[r] && w.setRequestHeader("If-Modified-Since", jQuery.lastModified[r]), jQuery.etag[r] && w.setRequestHeader("If-None-Match", jQuery.etag[r])), (l.data && l.hasContent && l.contentType !== !1 || t.contentType) && w.setRequestHeader("Content-Type", l.contentType), w.setRequestHeader("Accept", l.dataTypes[0] && l.accepts[l.dataTypes[0]] ? l.accepts[l.dataTypes[0]] + (l.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : l.accepts["*"]);
                for (f in l.headers) w.setRequestHeader(f, l.headers[f]);
                if (!l.beforeSend || l.beforeSend.call(c, w, l) !== !1 && y !== 2) {
                    b = "abort";
                    for (f in {
                            success: 1,
                            error: 1,
                            complete: 1
                        }) w[f](l[f]);
                    n = inspectPrefiltersOrTransports(transports, l, t, w);
                    if (!n) S(-1, "No Transport");
                    else {
                        w.readyState = 1, a && h.trigger("ajaxSend", [w, l]), l.async && l.timeout > 0 && (o = setTimeout(function() {
                            w.abort("timeout")
                        }, l.timeout));
                        try {
                            y = 1, n.send(m, S)
                        } catch (E) {
                            if (!(y < 2)) throw E;
                            S(-1, E)
                        }
                    }
                    return w
                }
                return w.abort()
            },
            getJSON: function(e, t, n) {
                return jQuery.get(e, t, n, "json")
            },
            getScript: function(e, t) {
                return jQuery.get(e, undefined, t, "script")
            }
        }), jQuery.each(["get", "post"], function(e, t) {
            jQuery[t] = function(e, n, r, i) {
                return jQuery.isFunction(n) && (i = i || r, r = n, n = undefined), jQuery.ajax({
                    url: e,
                    type: t,
                    dataType: i,
                    data: n,
                    success: r
                })
            }
        }), jQuery.ajaxSetup({
            accepts: {
                script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            },
            contents: {
                script: /(?:java|ecma)script/
            },
            converters: {
                "text script": function(e) {
                    return jQuery.globalEval(e), e
                }
            }
        }), jQuery.ajaxPrefilter("script", function(e) {
            e.cache === undefined && (e.cache = !1), e.crossDomain && (e.type = "GET")
        }), jQuery.ajaxTransport("script", function(e) {
            if (e.crossDomain) {
                var t, n;
                return {
                    send: function(r, i) {
                        t = jQuery("<script>").prop({
                            async: !0,
                            charset: e.scriptCharset,
                            src: e.url
                        }).on("load error", n = function(e) {
                            t.remove(), n = null, e && i(e.type === "error" ? 404 : 200, e.type)
                        }), document.head.appendChild(t[0])
                    },
                    abort: function() {
                        n && n()
                    }
                }
            }
        });
        var oldCallbacks = [],
            rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery.ajaxSetup({
            jsonp: "callback",
            jsonpCallback: function() {
                var e = oldCallbacks.pop() || jQuery.expando + "_" + ajax_nonce++;
                return this[e] = !0, e
            }
        }), jQuery.ajaxPrefilter("json jsonp", function(e, t, n) {
            var r, i, s, o = e.jsonp !== !1 && (rjsonp.test(e.url) ? "url" : typeof e.data == "string" && !(e.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(e.data) && "data");
            if (o || e.dataTypes[0] === "jsonp") return r = e.jsonpCallback = jQuery.isFunction(e.jsonpCallback) ? e.jsonpCallback() : e.jsonpCallback, o ? e[o] = e[o].replace(rjsonp, "$1" + r) : e.jsonp !== !1 && (e.url += (ajax_rquery.test(e.url) ? "&" : "?") + e.jsonp + "=" + r), e.converters["script json"] = function() {
                return s || jQuery.error(r + " was not called"), s[0]
            }, e.dataTypes[0] = "json", i = window[r], window[r] = function() {
                s = arguments
            }, n.always(function() {
                window[r] = i, e[r] && (e.jsonpCallback = t.jsonpCallback, oldCallbacks.push(r)), s && jQuery.isFunction(i) && i(s[0]), s = i = undefined
            }), "script"
        }), jQuery.ajaxSettings.xhr = function() {
            try {
                return new XMLHttpRequest
            } catch (e) {}
        };
        var xhrSupported = jQuery.ajaxSettings.xhr(),
            xhrSuccessStatus = {
                0: 200,
                1223: 204
            },
            xhrId = 0,
            xhrCallbacks = {};
        window.ActiveXObject && jQuery(window).on("unload", function() {
            for (var e in xhrCallbacks) xhrCallbacks[e]();
            xhrCallbacks = undefined
        }), jQuery.support.cors = !!xhrSupported && "withCredentials" in xhrSupported, jQuery.support.ajax = xhrSupported = !!xhrSupported, jQuery.ajaxTransport(function(e) {
            var t;
            if (jQuery.support.cors || xhrSupported && !e.crossDomain) return {
                send: function(n, r) {
                    var i, s, o = e.xhr();
                    o.open(e.type, e.url, e.async, e.username, e.password);
                    if (e.xhrFields)
                        for (i in e.xhrFields) o[i] = e.xhrFields[i];
                    e.mimeType && o.overrideMimeType && o.overrideMimeType(e.mimeType), !e.crossDomain && !n["X-Requested-With"] && (n["X-Requested-With"] = "XMLHttpRequest");
                    for (i in n) o.setRequestHeader(i, n[i]);
                    t = function(e) {
                        return function() {
                            t && (delete xhrCallbacks[s], t = o.onload = o.onerror = null, e === "abort" ? o.abort() : e === "error" ? r(o.status || 404, o.statusText) : r(xhrSuccessStatus[o.status] || o.status, o.statusText, typeof o.responseText == "string" ? {
                                text: o.responseText
                            } : undefined, o.getAllResponseHeaders()))
                        }
                    }, o.onload = t(), o.onerror = t("error"), t = xhrCallbacks[s = xhrId++] = t("abort"), o.send(e.hasContent && e.data || null)
                },
                abort: function() {
                    t && t()
                }
            }
        });
        var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/,
            rfxnum = new RegExp("^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i"),
            rrun = /queueHooks$/,
            animationPrefilters = [defaultPrefilter],
            tweeners = {
                "*": [function(e, t) {
                    var n = this.createTween(e, t),
                        r = n.cur(),
                        i = rfxnum.exec(t),
                        s = i && i[3] || (jQuery.cssNumber[e] ? "" : "px"),
                        o = (jQuery.cssNumber[e] || s !== "px" && +r) && rfxnum.exec(jQuery.css(n.elem, e)),
                        u = 1,
                        a = 20;
                    if (o && o[3] !== s) {
                        s = s || o[3], i = i || [], o = +r || 1;
                        do u = u || ".5", o /= u, jQuery.style(n.elem, e, o + s); while (u !== (u = n.cur() / r) && u !== 1 && --a)
                    }
                    return i && (o = n.start = +o || +r || 0, n.unit = s, n.end = i[1] ? o + (i[1] + 1) * i[2] : +i[2]), n
                }]
            };
        jQuery.Animation = jQuery.extend(Animation, {
            tweener: function(e, t) {
                jQuery.isFunction(e) ? (t = e, e = ["*"]) : e = e.split(" ");
                var n, r = 0,
                    i = e.length;
                for (; r < i; r++) n = e[r], tweeners[n] = tweeners[n] || [], tweeners[n].unshift(t)
            },
            prefilter: function(e, t) {
                t ? animationPrefilters.unshift(e) : animationPrefilters.push(e)
            }
        }), jQuery.Tween = Tween, Tween.prototype = {
            constructor: Tween,
            init: function(e, t, n, r, i, s) {
                this.elem = e, this.prop = n, this.easing = i || "swing", this.options = t, this.start = this.now = this.cur(), this.end = r, this.unit = s || (jQuery.cssNumber[n] ? "" : "px")
            },
            cur: function() {
                var e = Tween.propHooks[this.prop];
                return e && e.get ? e.get(this) : Tween.propHooks._default.get(this)
            },
            run: function(e) {
                var t, n = Tween.propHooks[this.prop];
                return this.options.duration ? this.pos = t = jQuery.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : this.pos = t = e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : Tween.propHooks._default.set(this), this
            }
        }, Tween.prototype.init.prototype = Tween.prototype, Tween.propHooks = {
            _default: {
                get: function(e) {
                    var t;
                    return e.elem[e.prop] == null || !!e.elem.style && e.elem.style[e.prop] != null ? (t = jQuery.css(e.elem, e.prop, ""), !t || t === "auto" ? 0 : t) : e.elem[e.prop]
                },
                set: function(e) {
                    jQuery.fx.step[e.prop] ? jQuery.fx.step[e.prop](e) : e.elem.style && (e.elem.style[jQuery.cssProps[e.prop]] != null || jQuery.cssHooks[e.prop]) ? jQuery.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now
                }
            }
        }, Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
            set: function(e) {
                e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
            }
        }, jQuery.each(["toggle", "show", "hide"], function(e, t) {
            var n = jQuery.fn[t];
            jQuery.fn[t] = function(e, r, i) {
                return e == null || typeof e == "boolean" ? n.apply(this, arguments) : this.animate(genFx(t, !0), e, r, i)
            }
        }), jQuery.fn.extend({
            fadeTo: function(e, t, n, r) {
                return this.filter(isHidden).css("opacity", 0).show().end().animate({
                    opacity: t
                }, e, n, r)
            },
            animate: function(e, t, n, r) {
                var i = jQuery.isEmptyObject(e),
                    s = jQuery.speed(t, n, r),
                    o = function() {
                        var t = Animation(this, jQuery.extend({}, e), s);
                        (i || data_priv.get(this, "finish")) && t.stop(!0)
                    };
                return o.finish = o, i || s.queue === !1 ? this.each(o) : this.queue(s.queue, o)
            },
            stop: function(e, t, n) {
                var r = function(e) {
                    var t = e.stop;
                    delete e.stop, t(n)
                };
                return typeof e != "string" && (n = t, t = e, e = undefined), t && e !== !1 && this.queue(e || "fx", []), this.each(function() {
                    var t = !0,
                        i = e != null && e + "queueHooks",
                        s = jQuery.timers,
                        o = data_priv.get(this);
                    if (i) o[i] && o[i].stop && r(o[i]);
                    else
                        for (i in o) o[i] && o[i].stop && rrun.test(i) && r(o[i]);
                    for (i = s.length; i--;) s[i].elem === this && (e == null || s[i].queue === e) && (s[i].anim.stop(n), t = !1, s.splice(i, 1));
                    (t || !n) && jQuery.dequeue(this, e)
                })
            },
            finish: function(e) {
                return e !== !1 && (e = e || "fx"), this.each(function() {
                    var t, n = data_priv.get(this),
                        r = n[e + "queue"],
                        i = n[e + "queueHooks"],
                        s = jQuery.timers,
                        o = r ? r.length : 0;
                    n.finish = !0, jQuery.queue(this, e, []), i && i.stop && i.stop.call(this, !0);
                    for (t = s.length; t--;) s[t].elem === this && s[t].queue === e && (s[t].anim.stop(!0), s.splice(t, 1));
                    for (t = 0; t < o; t++) r[t] && r[t].finish && r[t].finish.call(this);
                    delete n.finish
                })
            }
        }), jQuery.each({
            slideDown: genFx("show"),
            slideUp: genFx("hide"),
            slideToggle: genFx("toggle"),
            fadeIn: {
                opacity: "show"
            },
            fadeOut: {
                opacity: "hide"
            },
            fadeToggle: {
                opacity: "toggle"
            }
        }, function(e, t) {
            jQuery.fn[e] = function(e, n, r) {
                return this.animate(t, e, n, r)
            }
        }), jQuery.speed = function(e, t, n) {
            var r = e && typeof e == "object" ? jQuery.extend({}, e) : {
                complete: n || !n && t || jQuery.isFunction(e) && e,
                duration: e,
                easing: n && t || t && !jQuery.isFunction(t) && t
            };
            r.duration = jQuery.fx.off ? 0 : typeof r.duration == "number" ? r.duration : r.duration in jQuery.fx.speeds ? jQuery.fx.speeds[r.duration] : jQuery.fx.speeds._default;
            if (r.queue == null || r.queue === !0) r.queue = "fx";
            return r.old = r.complete, r.complete = function() {
                jQuery.isFunction(r.old) && r.old.call(this), r.queue && jQuery.dequeue(this, r.queue)
            }, r
        }, jQuery.easing = {
            linear: function(e) {
                return e
            },
            swing: function(e) {
                return .5 - Math.cos(e * Math.PI) / 2
            }
        }, jQuery.timers = [], jQuery.fx = Tween.prototype.init, jQuery.fx.tick = function() {
            var e, t = jQuery.timers,
                n = 0;
            fxNow = jQuery.now();
            for (; n < t.length; n++) e = t[n], !e() && t[n] === e && t.splice(n--, 1);
            t.length || jQuery.fx.stop(), fxNow = undefined
        }, jQuery.fx.timer = function(e) {
            e() && jQuery.timers.push(e) && jQuery.fx.start()
        }, jQuery.fx.interval = 13, jQuery.fx.start = function() {
            timerId || (timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval))
        }, jQuery.fx.stop = function() {
            clearInterval(timerId), timerId = null
        }, jQuery.fx.speeds = {
            slow: 600,
            fast: 200,
            _default: 400
        }, jQuery.fx.step = {}, jQuery.expr && jQuery.expr.filters && (jQuery.expr.filters.animated = function(e) {
            return jQuery.grep(jQuery.timers, function(t) {
                return e === t.elem
            }).length
        }), jQuery.fn.offset = function(e) {
            if (arguments.length) return e === undefined ? this : this.each(function(t) {
                jQuery.offset.setOffset(this, e, t)
            });
            var t, n, r = this[0],
                i = {
                    top: 0,
                    left: 0
                },
                s = r && r.ownerDocument;
            if (!s) return;
            return t = s.documentElement, jQuery.contains(t, r) ? (typeof r.getBoundingClientRect !== core_strundefined && (i = r.getBoundingClientRect()), n = getWindow(s), {
                top: i.top + n.pageYOffset - t.clientTop,
                left: i.left + n.pageXOffset - t.clientLeft
            }) : i
        }, jQuery.offset = {
            setOffset: function(e, t, n) {
                var r, i, s, o, u, a, f, l = jQuery.css(e, "position"),
                    c = jQuery(e),
                    h = {};
                l === "static" && (e.style.position = "relative"), u = c.offset(), s = jQuery.css(e, "top"), a = jQuery.css(e, "left"), f = (l === "absolute" || l === "fixed") && (s + a).indexOf("auto") > -1, f ? (r = c.position(), o = r.top, i = r.left) : (o = parseFloat(s) || 0, i = parseFloat(a) || 0), jQuery.isFunction(t) && (t = t.call(e, n, u)), t.top != null && (h.top = t.top - u.top + o), t.left != null && (h.left = t.left - u.left + i), "using" in t ? t.using.call(e, h) : c.css(h)
            }
        }, jQuery.fn.extend({
            position: function() {
                if (!this[0]) return;
                var e, t, n = this[0],
                    r = {
                        top: 0,
                        left: 0
                    };
                return jQuery.css(n, "position") === "fixed" ? t = n.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), jQuery.nodeName(e[0], "html") || (r = e.offset()), r.top += jQuery.css(e[0], "borderTopWidth", !0), r.left += jQuery.css(e[0], "borderLeftWidth", !0)), {
                    top: t.top - r.top - jQuery.css(n, "marginTop", !0),
                    left: t.left - r.left - jQuery.css(n, "marginLeft", !0)
                }
            },
            offsetParent: function() {
                return this.map(function() {
                    var e = this.offsetParent || docElem;
                    while (e && !jQuery.nodeName(e, "html") && jQuery.css(e, "position") === "static") e = e.offsetParent;
                    return e || docElem
                })
            }
        }), jQuery.each({
            scrollLeft: "pageXOffset",
            scrollTop: "pageYOffset"
        }, function(e, t) {
            var n = "pageYOffset" === t;
            jQuery.fn[e] = function(r) {
                return jQuery.access(this, function(e, r, i) {
                    var s = getWindow(e);
                    if (i === undefined) return s ? s[t] : e[r];
                    s ? s.scrollTo(n ? window.pageXOffset : i, n ? i : window.pageYOffset) : e[r] = i
                }, e, r, arguments.length, null)
            }
        }), jQuery.each({
            Height: "height",
            Width: "width"
        }, function(e, t) {
            jQuery.each({
                padding: "inner" + e,
                content: t,
                "": "outer" + e
            }, function(n, r) {
                jQuery.fn[r] = function(r, i) {
                    var s = arguments.length && (n || typeof r != "boolean"),
                        o = n || (r === !0 || i === !0 ? "margin" : "border");
                    return jQuery.access(this, function(t, n, r) {
                        var i;
                        return jQuery.isWindow(t) ? t.document.documentElement["client" + e] : t.nodeType === 9 ? (i = t.documentElement, Math.max(t.body["scroll" + e], i["scroll" + e], t.body["offset" + e], i["offset" + e], i["client" + e])) : r === undefined ? jQuery.css(t, n, o) : jQuery.style(t, n, r, o)
                    }, t, s ? r : undefined, s, null)
                }
            })
        }), jQuery.fn.size = function() {
            return this.length
        }, jQuery.fn.andSelf = jQuery.fn.addBack, typeof module == "object" && module && typeof module.exports == "object" ? module.exports = jQuery : typeof define == "function" && define.amd && define("jquery", [], function() {
            return jQuery
        }), typeof window == "object" && typeof window.document == "object" && (window.jQuery = window.$ = jQuery)
    }(window), ! function(e, t, n) {
        "function" == typeof define && define.amd ? define("jquerymobile", ["jquery"], function(r) {
            return n(r, e, t), r.mobile
        }) : n(e.jQuery, e, t)
    }(this, document, function(e, t, n) {
        ! function(e) {
            e.mobile = {}
        }(e),
        function(e) {
            e.extend(e.mobile, {
                version: "1.4.0-rc.1",
                subPageUrlKey: "ui-page",
                hideUrlBar: !0,
                keepNative: ":jqmData(role='none'), :jqmData(role='nojs')",
                activePageClass: "ui-page-active",
                activeBtnClass: "ui-btn-active",
                focusClass: "ui-focus",
                ajaxEnabled: !0,
                hashListeningEnabled: !0,
                linkBindingEnabled: !0,
                defaultPageTransition: "fade",
                maxTransitionWidth: !1,
                minScrollBack: 0,
                defaultDialogTransition: "pop",
                pageLoadErrorMessage: "Error Loading Page",
                pageLoadErrorMessageTheme: "a",
                phonegapNavigationEnabled: !1,
                autoInitializePage: !0,
                pushStateEnabled: !0,
                ignoreContentEnabled: !1,
                buttonMarkup: {
                    hoverDelay: 200
                },
                dynamicBaseEnabled: !0,
                pageContainer: e(),
                allowCrossDomainPages: !1,
                dialogHashKey: "&ui-state=dialog"
            })
        }(e, this),
        function(e, t, n) {
            var r = {},
                i = e.find,
                s = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
                o = /:jqmData\(([^)]*)\)/g;
            e.extend(e.mobile, {
                ns: "",
                getAttribute: function(t, n) {
                    var r;
                    t = t.jquery ? t[0] : t, t && t.getAttribute && (r = t.getAttribute("data-" + e.mobile.ns + n));
                    try {
                        r = "true" === r ? !0 : "false" === r ? !1 : "null" === r ? null : +r + "" === r ? +r : s.test(r) ? JSON.parse(r) : r
                    } catch (i) {}
                    return r
                },
                nsNormalizeDict: r,
                nsNormalize: function(t) {
                    return r[t] || (r[t] = e.camelCase(e.mobile.ns + t))
                },
                closestPageData: function(e) {
                    return e.closest(":jqmData(role='page'), :jqmData(role='dialog')").data("mobile-page")
                }
            }), e.fn.jqmData = function(t, r) {
                var i;
                return "undefined" != typeof t && (t && (t = e.mobile.nsNormalize(t)), i = arguments.length < 2 || r === n ? this.data(t) : this.data(t, r)), i
            }, e.jqmData = function(t, n, r) {
                var i;
                return "undefined" != typeof n && (i = e.data(t, n ? e.mobile.nsNormalize(n) : n, r)), i
            }, e.fn.jqmRemoveData = function(t) {
                return this.removeData(e.mobile.nsNormalize(t))
            }, e.jqmRemoveData = function(t, n) {
                return e.removeData(t, e.mobile.nsNormalize(n))
            }, e.find = function(t, n, r, s) {
                return t.indexOf(":jqmData") > -1 && (t = t.replace(o, "[data-" + (e.mobile.ns || "") + "$1]")), i.call(this, t, n, r, s)
            }, e.extend(e.find, i)
        }(e, this),
        function(e, t) {
            function r(t, n) {
                var r, s, o, u = t.nodeName.toLowerCase();
                return "area" === u ? (r = t.parentNode, s = r.name, t.href && s && "map" === r.nodeName.toLowerCase() ? (o = e("img[usemap=#" + s + "]")[0], !!o && i(o)) : !1) : (/input|select|textarea|button|object/.test(u) ? !t.disabled : "a" === u ? t.href || n : n) && i(t)
            }

            function i(t) {
                return e.expr.filters.visible(t) && !e(t).parents().addBack().filter(function() {
                    return "hidden" === e.css(this, "visibility")
                }).length
            }
            var s = 0,
                o = /^ui-id-\d+$/;
            e.ui = e.ui || {}, e.extend(e.ui, {
                version: "@VERSION",
                keyCode: {
                    BACKSPACE: 8,
                    COMMA: 188,
                    DELETE: 46,
                    DOWN: 40,
                    END: 35,
                    ENTER: 13,
                    ESCAPE: 27,
                    HOME: 36,
                    LEFT: 37,
                    PAGE_DOWN: 34,
                    PAGE_UP: 33,
                    PERIOD: 190,
                    RIGHT: 39,
                    SPACE: 32,
                    TAB: 9,
                    UP: 38
                }
            }), e.fn.extend({
                focus: function(t) {
                    return function(n, r) {
                        return "number" == typeof n ? this.each(function() {
                            var t = this;
                            setTimeout(function() {
                                e(t).focus(), r && r.call(t)
                            }, n)
                        }) : t.apply(this, arguments)
                    }
                }(e.fn.focus),
                scrollParent: function() {
                    var t;
                    return t = e.ui.ie && /(static|relative)/.test(this.css("position")) || /absolute/.test(this.css("position")) ? this.parents().filter(function() {
                        return /(relative|absolute|fixed)/.test(e.css(this, "position")) && /(auto|scroll)/.test(e.css(this, "overflow") + e.css(this, "overflow-y") + e.css(this, "overflow-x"))
                    }).eq(0) : this.parents().filter(function() {
                        return /(auto|scroll)/.test(e.css(this, "overflow") + e.css(this, "overflow-y") + e.css(this, "overflow-x"))
                    }).eq(0), /fixed/.test(this.css("position")) || !t.length ? e(this[0].ownerDocument || n) : t
                },
                uniqueId: function() {
                    return this.each(function() {
                        this.id || (this.id = "ui-id-" + ++s)
                    })
                },
                removeUniqueId: function() {
                    return this.each(function() {
                        o.test(this.id) && e(this).removeAttr("id")
                    })
                }
            }), e.extend(e.expr[":"], {
                data: e.expr.createPseudo ? e.expr.createPseudo(function(t) {
                    return function(n) {
                        return !!e.data(n, t)
                    }
                }) : function(t, n, r) {
                    return !!e.data(t, r[3])
                },
                focusable: function(t) {
                    return r(t, !isNaN(e.attr(t, "tabindex")))
                },
                tabbable: function(t) {
                    var n = e.attr(t, "tabindex"),
                        i = isNaN(n);
                    return (i || n >= 0) && r(t, !i)
                }
            }), e("<a>").outerWidth(1).jquery || e.each(["Width", "Height"], function(n, r) {
                function i(t, n, r, i) {
                    return e.each(s, function() {
                        n -= parseFloat(e.css(t, "padding" + this)) || 0, r && (n -= parseFloat(e.css(t, "border" + this + "Width")) || 0), i && (n -= parseFloat(e.css(t, "margin" + this)) || 0)
                    }), n
                }
                var s = "Width" === r ? ["Left", "Right"] : ["Top", "Bottom"],
                    o = r.toLowerCase(),
                    u = {
                        innerWidth: e.fn.innerWidth,
                        innerHeight: e.fn.innerHeight,
                        outerWidth: e.fn.outerWidth,
                        outerHeight: e.fn.outerHeight
                    };
                e.fn["inner" + r] = function(n) {
                    return n === t ? u["inner" + r].call(this) : this.each(function() {
                        e(this).css(o, i(this, n) + "px")
                    })
                }, e.fn["outer" + r] = function(t, n) {
                    return "number" != typeof t ? u["outer" + r].call(this, t) : this.each(function() {
                        e(this).css(o, i(this, t, !0, n) + "px")
                    })
                }
            }), e.fn.addBack || (e.fn.addBack = function(e) {
                return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
            }), e("<a>").data("a-b", "a").removeData("a-b").data("a-b") && (e.fn.removeData = function(t) {
                return function(n) {
                    return arguments.length ? t.call(this, e.camelCase(n)) : t.call(this)
                }
            }(e.fn.removeData)), e.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()), e.support.selectstart = "onselectstart" in n.createElement("div"), e.fn.extend({
                disableSelection: function() {
                    return this.bind((e.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function(e) {
                        e.preventDefault()
                    })
                },
                enableSelection: function() {
                    return this.unbind(".ui-disableSelection")
                },
                zIndex: function(r) {
                    if (r !== t) return this.css("zIndex", r);
                    if (this.length)
                        for (var i, s, o = e(this[0]); o.length && o[0] !== n;) {
                            if (i = o.css("position"), ("absolute" === i || "relative" === i || "fixed" === i) && (s = parseInt(o.css("zIndex"), 10), !isNaN(s) && 0 !== s)) return s;
                            o = o.parent()
                        }
                    return 0
                }
            }), e.ui.plugin = {
                add: function(t, n, r) {
                    var i, s = e.ui[t].prototype;
                    for (i in r) s.plugins[i] = s.plugins[i] || [], s.plugins[i].push([n, r[i]])
                },
                call: function(e, t, n, r) {
                    var i, s = e.plugins[t];
                    if (s && (r || e.element[0].parentNode && 11 !== e.element[0].parentNode.nodeType))
                        for (i = 0; i < s.length; i++) e.options[s[i][0]] && s[i][1].apply(e.element, n)
                }
            }
        }(e),
        function(e, t) {
            e.extend(e.mobile, {
                window: e(t),
                document: e(n),
                keyCode: e.ui.keyCode,
                behaviors: {},
                silentScroll: function(n) {
                    "number" !== e.type(n) && (n = e.mobile.defaultHomeScroll), e.event.special.scrollstart.enabled = !1, setTimeout(function() {
                        t.scrollTo(0, n), e.mobile.document.trigger("silentscroll", {
                            x: 0,
                            y: n
                        })
                    }, 20), setTimeout(function() {
                        e.event.special.scrollstart.enabled = !0
                    }, 150)
                },
                getClosestBaseUrl: function(t) {
                    var n = e(t).closest(".ui-page").jqmData("url"),
                        r = e.mobile.path.documentBase.hrefNoHash;
                    return e.mobile.dynamicBaseEnabled && n && e.mobile.path.isPath(n) || (n = r), e.mobile.path.makeUrlAbsolute(n, r)
                },
                removeActiveLinkClass: function(t) {
                    !e.mobile.activeClickedLink || e.mobile.activeClickedLink.closest("." + e.mobile.activePageClass).length && !t || e.mobile.activeClickedLink.removeClass(e.mobile.activeBtnClass), e.mobile.activeClickedLink = null
                },
                getInheritedTheme: function(e, t) {
                    for (var n, r, i = e[0], s = "", o = /ui-(bar|body|overlay)-([a-z])\b/; i && (n = i.className || "", !(n && (r = o.exec(n)) && (s = r[2])));) i = i.parentNode;
                    return s || t || "a"
                },
                enhanceable: function(e) {
                    return this.haveParents(e, "enhance")
                },
                hijackable: function(e) {
                    return this.haveParents(e, "ajax")
                },
                haveParents: function(t, n) {
                    if (!e.mobile.ignoreContentEnabled) return t;
                    var r, i, s, o, u, f = t.length,
                        l = e();
                    for (o = 0; f > o; o++) {
                        for (i = t.eq(o), s = !1, r = t[o]; r;) {
                            if (u = r.getAttribute ? r.getAttribute("data-" + e.mobile.ns + n) : "", "false" === u) {
                                s = !0;
                                break
                            }
                            r = r.parentNode
                        }
                        s || (l = l.add(i))
                    }
                    return l
                },
                getScreenHeight: function() {
                    return t.innerHeight || e.mobile.window.height()
                },
                resetActivePageHeight: function(t) {
                    var n = e("." + e.mobile.activePageClass),
                        r = n.height(),
                        i = n.outerHeight(!0);
                    t = "number" == typeof t ? t : e.mobile.getScreenHeight(), n.css("min-height", t - (i - r))
                },
                loading: function() {
                    var t = this.loading._widget || e(e.mobile.loader.prototype.defaultHtml).loader(),
                        n = t.loader.apply(t, arguments);
                    return this.loading._widget = t, n
                }
            }), e.addDependents = function(t, n) {
                var r = e(t),
                    i = r.jqmData("dependents") || e();
                r.jqmData("dependents", e(i).add(n))
            }, e.fn.extend({
                removeWithDependents: function() {
                    e.removeWithDependents(this)
                },
                enhanceWithin: function() {
                    var t, n = {},
                        r = e.mobile.page.prototype.keepNativeSelector(),
                        i = this;
                    e.mobile.nojs && e.mobile.nojs(this), e.mobile.links && e.mobile.links(this), e.mobile.degradeInputsWithin && e.mobile.degradeInputsWithin(this), e.fn.buttonMarkup && this.find(e.fn.buttonMarkup.initSelector).not(r).jqmEnhanceable().buttonMarkup(), e.fn.fieldcontain && this.find(":jqmData(role='fieldcontain')").not(r).jqmEnhanceable().fieldcontain(), e.each(e.mobile.widgets, function(t, s) {
                        if (s.initSelector) {
                            var o = e.mobile.enhanceable(i.find(s.initSelector));
                            o.length > 0 && (o = o.not(r)), o.length > 0 && (n[s.prototype.widgetName] = o)
                        }
                    });
                    for (t in n) n[t][t]();
                    return this
                },
                addDependents: function(t) {
                    e.addDependents(this, t)
                },
                getEncodedText: function() {
                    return e("<a>").text(this.text()).html()
                },
                jqmEnhanceable: function() {
                    return e.mobile.enhanceable(this)
                },
                jqmHijackable: function() {
                    return e.mobile.hijackable(this)
                }
            }), e.removeWithDependents = function(t) {
                var n = e(t);
                (n.jqmData("dependents") || e()).remove(), n.remove()
            }, e.addDependents = function(t, n) {
                var r = e(t),
                    i = r.jqmData("dependents") || e();
                r.jqmData("dependents", e(i).add(n))
            }, e.find.matches = function(t, n) {
                return e.find(t, null, null, n)
            }, e.find.matchesSelector = function(t, n) {
                return e.find(n, null, null, [t]).length > 0
            }
        }(e, this),
        function(e, t) {
            var n = 0,
                r = Array.prototype.slice,
                i = e.cleanData;
            e.cleanData = function(t) {
                for (var n, r = 0; null != (n = t[r]); r++) try {
                    e(n).triggerHandler("remove")
                } catch (s) {}
                i(t)
            }, e.widget = function(t, n, r) {
                var i, s, o, u, f = {},
                    l = t.split(".")[0];
                return t = t.split(".")[1], i = l + "-" + t, r || (r = n, n = e.Widget), e.expr[":"][i.toLowerCase()] = function(t) {
                    return !!e.data(t, i)
                }, e[l] = e[l] || {}, s = e[l][t], o = e[l][t] = function(e, t) {
                    return this._createWidget ? (arguments.length && this._createWidget(e, t), void 0) : new o(e, t)
                }, e.extend(o, s, {
                    version: r.version,
                    _proto: e.extend({}, r),
                    _childConstructors: []
                }), u = new n, u.options = e.widget.extend({}, u.options), e.each(r, function(t, r) {
                    return e.isFunction(r) ? (f[t] = function() {
                        var e = function() {
                                return n.prototype[t].apply(this, arguments)
                            },
                            i = function(e) {
                                return n.prototype[t].apply(this, e)
                            };
                        return function() {
                            var t, n = this._super,
                                s = this._superApply;
                            return this._super = e, this._superApply = i, t = r.apply(this, arguments), this._super = n, this._superApply = s, t
                        }
                    }(), void 0) : (f[t] = r, void 0)
                }), o.prototype = e.widget.extend(u, {
                    widgetEventPrefix: s ? u.widgetEventPrefix || t : t
                }, f, {
                    constructor: o,
                    namespace: l,
                    widgetName: t,
                    widgetFullName: i
                }), s ? (e.each(s._childConstructors, function(t, n) {
                    var r = n.prototype;
                    e.widget(r.namespace + "." + r.widgetName, o, n._proto)
                }), delete s._childConstructors) : n._childConstructors.push(o), e.widget.bridge(t, o), o
            }, e.widget.extend = function(n) {
                for (var i, s, o = r.call(arguments, 1), u = 0, f = o.length; f > u; u++)
                    for (i in o[u]) s = o[u][i], o[u].hasOwnProperty(i) && s !== t && (n[i] = e.isPlainObject(s) ? e.isPlainObject(n[i]) ? e.widget.extend({}, n[i], s) : e.widget.extend({}, s) : s);
                return n
            }, e.widget.bridge = function(n, i) {
                var s = i.prototype.widgetFullName || n;
                e.fn[n] = function(o) {
                    var u = "string" == typeof o,
                        l = r.call(arguments, 1),
                        h = this;
                    return o = !u && l.length ? e.widget.extend.apply(null, [o].concat(l)) : o, u ? this.each(function() {
                        var r, i = e.data(this, s);
                        return "instance" === o ? (h = i, !1) : i ? e.isFunction(i[o]) && "_" !== o.charAt(0) ? (r = i[o].apply(i, l), r !== i && r !== t ? (h = r && r.jquery ? h.pushStack(r.get()) : r, !1) : void 0) : e.error("no such method '" + o + "' for " + n + " widget instance") : e.error("cannot call methods on " + n + " prior to initialization; " + "attempted to call method '" + o + "'")
                    }) : this.each(function() {
                        var t = e.data(this, s);
                        t ? t.option(o || {})._init() : e.data(this, s, new i(o, this))
                    }), h
                }
            }, e.Widget = function() {}, e.Widget._childConstructors = [], e.Widget.prototype = {
                widgetName: "widget",
                widgetEventPrefix: "",
                defaultElement: "<div>",
                options: {
                    disabled: !1,
                    create: null
                },
                _createWidget: function(t, r) {
                    r = e(r || this.defaultElement || this)[0], this.element = e(r), this.uuid = n++, this.eventNamespace = "." + this.widgetName + this.uuid, this.options = e.widget.extend({}, this.options, this._getCreateOptions(), t), this.bindings = e(), this.hoverable = e(), this.focusable = e(), r !== this && (e.data(r, this.widgetFullName, this), this._on(!0, this.element, {
                        remove: function(e) {
                            e.target === r && this.destroy()
                        }
                    }), this.document = e(r.style ? r.ownerDocument : r.document || r), this.window = e(this.document[0].defaultView || this.document[0].parentWindow)), this._create(), this._trigger("create", null, this._getCreateEventData()), this._init()
                },
                _getCreateOptions: e.noop,
                _getCreateEventData: e.noop,
                _create: e.noop,
                _init: e.noop,
                destroy: function() {
                    this._destroy(), this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)), this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled"), this.bindings.unbind(this.eventNamespace), this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus")
                },
                _destroy: e.noop,
                widget: function() {
                    return this.element
                },
                option: function(n, r) {
                    var i, s, o, u = n;
                    if (0 === arguments.length) return e.widget.extend({}, this.options);
                    if ("string" == typeof n)
                        if (u = {}, i = n.split("."), n = i.shift(), i.length) {
                            for (s = u[n] = e.widget.extend({}, this.options[n]), o = 0; o < i.length - 1; o++) s[i[o]] = s[i[o]] || {}, s = s[i[o]];
                            if (n = i.pop(), r === t) return s[n] === t ? null : s[n];
                            s[n] = r
                        } else {
                            if (r === t) return this.options[n] === t ? null : this.options[n];
                            u[n] = r
                        }
                    return this._setOptions(u), this
                },
                _setOptions: function(e) {
                    var t;
                    for (t in e) this._setOption(t, e[t]);
                    return this
                },
                _setOption: function(e, t) {
                    return this.options[e] = t, "disabled" === e && (this.widget().toggleClass(this.widgetFullName + "-disabled", !!t), this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus")), this
                },
                enable: function() {
                    return this._setOptions({
                        disabled: !1
                    })
                },
                disable: function() {
                    return this._setOptions({
                        disabled: !0
                    })
                },
                _on: function(t, n, r) {
                    var i, s = this;
                    "boolean" != typeof t && (r = n, n = t, t = !1), r ? (n = i = e(n), this.bindings = this.bindings.add(n)) : (r = n, n = this.element, i = this.widget()), e.each(r, function(r, o) {
                        function u() {
                            return t || s.options.disabled !== !0 && !e(this).hasClass("ui-state-disabled") ? ("string" == typeof o ? s[o] : o).apply(s, arguments) : void 0
                        }
                        "string" != typeof o && (u.guid = o.guid = o.guid || u.guid || e.guid++);
                        var l = r.match(/^(\w+)\s*(.*)$/),
                            h = l[1] + s.eventNamespace,
                            p = l[2];
                        p ? i.delegate(p, h, u) : n.bind(h, u)
                    })
                },
                _off: function(e, t) {
                    t = (t || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, e.unbind(t).undelegate(t)
                },
                _delay: function(e, t) {
                    function n() {
                        return ("string" == typeof e ? r[e] : e).apply(r, arguments)
                    }
                    var r = this;
                    return setTimeout(n, t || 0)
                },
                _hoverable: function(t) {
                    this.hoverable = this.hoverable.add(t), this._on(t, {
                        mouseenter: function(t) {
                            e(t.currentTarget).addClass("ui-state-hover")
                        },
                        mouseleave: function(t) {
                            e(t.currentTarget).removeClass("ui-state-hover")
                        }
                    })
                },
                _focusable: function(t) {
                    this.focusable = this.focusable.add(t), this._on(t, {
                        focusin: function(t) {
                            e(t.currentTarget).addClass("ui-state-focus")
                        },
                        focusout: function(t) {
                            e(t.currentTarget).removeClass("ui-state-focus")
                        }
                    })
                },
                _trigger: function(t, n, r) {
                    var i, s, o = this.options[t];
                    if (r = r || {}, n = e.Event(n), n.type = (t === this.widgetEventPrefix ? t : this.widgetEventPrefix + t).toLowerCase(), n.target = this.element[0], s = n.originalEvent)
                        for (i in s) i in n || (n[i] = s[i]);
                    return this.element.trigger(n, r), !(e.isFunction(o) && o.apply(this.element[0], [n].concat(r)) === !1 || n.isDefaultPrevented())
                }
            }, e.each({
                show: "fadeIn",
                hide: "fadeOut"
            }, function(t, n) {
                e.Widget.prototype["_" + t] = function(r, i, s) {
                    "string" == typeof i && (i = {
                        effect: i
                    });
                    var o, u = i ? i === !0 || "number" == typeof i ? n : i.effect || n : t;
                    i = i || {}, "number" == typeof i && (i = {
                        duration: i
                    }), o = !e.isEmptyObject(i), i.complete = s, i.delay && r.delay(i.delay), o && e.effects && e.effects.effect[u] ? r[t](i) : u !== t && r[u] ? r[u](i.duration, i.easing, s) : r.queue(function(n) {
                        e(this)[t](), s && s.call(r[0]), n()
                    })
                }
            })
        }(e),
        function(e) {
            var t = /[A-Z]/g,
                n = function(e) {
                    return "-" + e.toLowerCase()
                };
            e.extend(e.Widget.prototype, {
                _getCreateOptions: function() {
                    var r, i, s = this.element[0],
                        o = {};
                    if (!e.mobile.getAttribute(s, "defaults"))
                        for (r in this.options) i = e.mobile.getAttribute(s, r.replace(t, n)), null != i && (o[r] = i);
                    return o
                }
            }), e.mobile.widget = e.Widget
        }(e),
        function(e) {
            var t = "ui-loader",
                n = e("html");
            e.widget("mobile.loader", {
                options: {
                    theme: "a",
                    textVisible: !1,
                    html: "",
                    text: "loading"
                },
                defaultHtml: "<div class='" + t + "'>" + "<span class='ui-icon-loading'></span>" + "<h1></h1>" + "</div>",
                fakeFixLoader: function() {
                    var t = e("." + e.mobile.activeBtnClass).first();
                    this.element.css({
                        top: e.support.scrollTop && this.window.scrollTop() + this.window.height() / 2 || t.length && t.offset().top || 100
                    })
                },
                checkLoaderPosition: function() {
                    var t = this.element.offset(),
                        n = this.window.scrollTop(),
                        r = e.mobile.getScreenHeight();
                    (t.top < n || t.top - n > r) && (this.element.addClass("ui-loader-fakefix"), this.fakeFixLoader(), this.window.unbind("scroll", this.checkLoaderPosition).bind("scroll", e.proxy(this.fakeFixLoader, this)))
                },
                resetHtml: function() {
                    this.element.html(e(this.defaultHtml).html())
                },
                show: function(r, i, s) {
                    var o, u, f;
                    this.resetHtml(), "object" === e.type(r) ? (f = e.extend({}, this.options, r), r = f.theme) : (f = this.options, r = r || f.theme), u = i || (f.text === !1 ? "" : f.text), n.addClass("ui-loading"), o = f.textVisible, this.element.attr("class", t + " ui-corner-all ui-body-" + r + " ui-loader-" + (o || i || r.text ? "verbose" : "default") + (f.textonly || s ? " ui-loader-textonly" : "")), f.html ? this.element.html(f.html) : this.element.find("h1").text(u), this.element.appendTo(e.mobile.pageContainer), this.checkLoaderPosition(), this.window.bind("scroll", e.proxy(this.checkLoaderPosition, this))
                },
                hide: function() {
                    n.removeClass("ui-loading"), this.options.text && this.element.removeClass("ui-loader-fakefix"), e.mobile.window.unbind("scroll", this.fakeFixLoader), e.mobile.window.unbind("scroll", this.checkLoaderPosition)
                }
            })
        }(e, this),
        function(e, t, r) {
            function i(e) {
                return e = e || location.href, "#" + e.replace(/^[^#]*#?(.*)$/, "$1")
            }
            var s, o = "hashchange",
                u = n,
                a = e.event.special,
                f = u.documentMode,
                l = "on" + o in t && (f === r || f > 7);
            e.fn[o] = function(e) {
                return e ? this.bind(o, e) : this.trigger(o)
            }, e.fn[o].delay = 50, a[o] = e.extend(a[o], {
                setup: function() {
                    return l ? !1 : (e(s.start), void 0)
                },
                teardown: function() {
                    return l ? !1 : (e(s.stop), void 0)
                }
            }), s = function() {
                function n() {
                    var r = i(),
                        u = v(f);
                    r !== f ? (p(f = r, u), e(t).trigger(o)) : u !== f && (location.href = location.href.replace(/#.*/, "") + u), s = setTimeout(n, e.fn[o].delay)
                }
                var s, a = {},
                    f = i(),
                    c = function(e) {
                        return e
                    },
                    p = c,
                    v = c;
                return a.start = function() {
                    s || n()
                }, a.stop = function() {
                    s && clearTimeout(s), s = r
                }, t.attachEvent && !t.addEventListener && !l && function() {
                    var t, r;
                    a.start = function() {
                        t || (r = e.fn[o].src, r = r && r + i(), t = e('<iframe tabindex="-1" title="empty"/>').hide().one("load", function() {
                            r || p(i()), n()
                        }).attr("src", r || "javascript:0").insertAfter("body")[0].contentWindow, u.onpropertychange = function() {
                            try {
                                "title" === event.propertyName && (t.document.title = u.title)
                            } catch (e) {}
                        })
                    }, a.stop = c, v = function() {
                        return i(t.location.href)
                    }, p = function(n, r) {
                        var i = t.document,
                            s = e.fn[o].domain;
                        n !== r && (i.title = u.title, i.open(), s && i.write('<script>document.domain="' + s + '"</script>'), i.close(), t.location.hash = n)
                    }
                }(), a
            }()
        }(e, this),
        function(e) {
            t.matchMedia = t.matchMedia || function(e) {
                var t, n = e.documentElement,
                    r = n.firstElementChild || n.firstChild,
                    i = e.createElement("body"),
                    s = e.createElement("div");
                return s.id = "mq-test-1", s.style.cssText = "position:absolute;top:-100em", i.style.background = "none", i.appendChild(s),
                    function(e) {
                        return s.innerHTML = '&shy;<style media="' + e + '"> #mq-test-1 { width: 42px; }</style>', n.insertBefore(i, r), t = 42 === s.offsetWidth, n.removeChild(i), {
                            matches: t,
                            media: e
                        }
                    }
            }(n), e.mobile.media = function(e) {
                return t.matchMedia(e).matches
            }
        }(e),
        function(e) {
            var t = {
                touch: "ontouchend" in n
            };
            e.mobile.support = e.mobile.support || {}, e.extend(e.support, t), e.extend(e.mobile.support, t)
        }(e),
        function(e) {
            e.extend(e.support, {
                orientation: "orientation" in t && "onorientationchange" in t
            })
        }(e),
        function(e, r) {
            function i(e) {
                var t, n = e.charAt(0).toUpperCase() + e.substr(1),
                    i = (e + " " + m.join(n + " ") + n).split(" ");
                for (t in i)
                    if (v[i[t]] !== r) return !0
            }

            function s(e, t, r) {
                var i, s, o = n.createElement("div"),
                    u = function(e) {
                        return e.charAt(0).toUpperCase() + e.substr(1)
                    },
                    a = function(e) {
                        return "" === e ? "" : "-" + e.charAt(0).toLowerCase() + e.substr(1) + "-"
                    },
                    f = function(n) {
                        var r = a(n) + e + ": " + t + ";",
                            i = u(n),
                            f = i + ("" === i ? e : u(e));
                        o.setAttribute("style", r), o.style[f] && (s = !0)
                    },
                    l = r ? r : m;
                for (i = 0; i < l.length; i++) f(l[i]);
                return !!s
            }

            function o() {
                var n = t,
                    r = !(!n.document.createElementNS || !n.document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect || n.opera && -1 === navigator.userAgent.indexOf("Chrome")),
                    i = function(t) {
                        t && r || e("html").addClass("ui-nosvg")
                    },
                    s = new n.Image;
                s.onerror = function() {
                    i(!1)
                }, s.onload = function() {
                    i(1 === s.width && 1 === s.height)
                }, s.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            }

            function u() {
                var i, s, o, u = "transform-3d",
                    a = e.mobile.media("(-" + m.join("-" + u + "),(-") + "-" + u + "),(" + u + ")");
                if (a) return !!a;
                i = n.createElement("div"), s = {
                    MozTransform: "-moz-transform",
                    transform: "transform"
                }, d.append(i);
                for (o in s) i.style[o] !== r && (i.style[o] = "translate3d( 100px, 1px, 1px )", a = t.getComputedStyle(i).getPropertyValue(s[o]));
                return !!a && "none" !== a
            }

            function a() {
                var t, n, r = location.protocol + "//" + location.host + location.pathname + "ui-dir/",
                    i = e("head base"),
                    s = null,
                    o = "";
                return i.length ? o = i.attr("href") : i = s = e("<base>", {
                    href: r
                }).appendTo("head"), t = e("<a href='testurl' />").prependTo(d), n = t[0].href, i[0].href = o || location.pathname, s && s.remove(), 0 === n.indexOf(r)
            }

            function f() {
                var e, r = n.createElement("x"),
                    i = n.documentElement,
                    s = t.getComputedStyle;
                return "pointerEvents" in r.style ? (r.style.pointerEvents = "auto", r.style.pointerEvents = "x", i.appendChild(r), e = s && "auto" === s(r, "").pointerEvents, i.removeChild(r), !!e) : !1
            }

            function l() {
                var e = n.createElement("div");
                return "undefined" != typeof e.getBoundingClientRect
            }

            function h() {
                var e = t,
                    n = navigator.userAgent,
                    r = navigator.platform,
                    i = n.match(/AppleWebKit\/([0-9]+)/),
                    s = !!i && i[1],
                    o = n.match(/Fennec\/([0-9]+)/),
                    u = !!o && o[1],
                    a = n.match(/Opera Mobi\/([0-9]+)/),
                    f = !!a && a[1];
                return (r.indexOf("iPhone") > -1 || r.indexOf("iPad") > -1 || r.indexOf("iPod") > -1) && s && 534 > s || e.operamini && "[object OperaMini]" === {}.toString.call(e.operamini) || a && 7458 > f || n.indexOf("Android") > -1 && s && 533 > s || u && 6 > u || "palmGetResource" in t && s && 534 > s || n.indexOf("MeeGo") > -1 && n.indexOf("NokiaBrowser/8.5.0") > -1 ? !1 : !0
            }
            var p, d = e("<body>").prependTo("html"),
                v = d[0].style,
                m = ["Webkit", "Moz", "O"],
                g = "palmGetResource" in t,
                y = t.opera,
                w = t.operamini && "[object OperaMini]" === {}.toString.call(t.operamini),
                E = t.blackberry && !i("-webkit-transform");
            e.extend(e.mobile, {
                browser: {}
            }), e.mobile.browser.oldIE = function() {
                var e = 3,
                    t = n.createElement("div"),
                    r = t.all || [];
                do t.innerHTML = "<!--[if gt IE " + ++e + "]><br><![endif]-->"; while (r[0]);
                return e > 4 ? e : !e
            }(), e.extend(e.support, {
                cssTransitions: "WebKitTransitionEvent" in t || s("transition", "height 100ms linear", ["Webkit", "Moz", ""]) && !e.mobile.browser.oldIE && !y,
                pushState: "pushState" in history && "replaceState" in history && !(t.navigator.userAgent.indexOf("Firefox") >= 0 && t.top !== t) && -1 === t.navigator.userAgent.search(/CriOS/),
                mediaquery: e.mobile.media("only all"),
                cssPseudoElement: !!i("content"),
                touchOverflow: !!i("overflowScrolling"),
                cssTransform3d: u(),
                cssAnimations: !!i("animationName"),
                boxShadow: !!i("boxShadow") && !E,
                fixedPosition: h(),
                scrollTop: ("pageXOffset" in t || "scrollTop" in n.documentElement || "scrollTop" in d[0]) && !g && !w,
                dynamicBaseTag: a(),
                cssPointerEvents: f(),
                boundingRect: l(),
                inlineSVG: o
            }), d.remove(), p = function() {
                var e = t.navigator.userAgent;
                return e.indexOf("Nokia") > -1 && (e.indexOf("Symbian/3") > -1 || e.indexOf("Series60/5") > -1) && e.indexOf("AppleWebKit") > -1 && e.match(/(BrowserNG|NokiaBrowser)\/7\.[0-3]/)
            }(), e.mobile.gradeA = function() {
                return (e.support.mediaquery && e.support.cssPseudoElement || e.mobile.browser.oldIE && e.mobile.browser.oldIE >= 8) && (e.support.boundingRect || null !== e.fn.jquery.match(/1\.[0-7+]\.[0-9+]?/))
            }, e.mobile.ajaxBlacklist = t.blackberry && !t.WebKitPoint || w || p, p && e(function() {
                e("head link[rel='stylesheet']").attr("rel", "alternate stylesheet").attr("rel", "stylesheet")
            }), e.support.boxShadow || e("html").addClass("ui-noboxshadow")
        }(e),
        function(e, t) {
            var n, r = e.mobile.window,
                i = function() {};
            e.event.special.beforenavigate = {
                setup: function() {
                    r.on("navigate", i)
                },
                teardown: function() {
                    r.off("navigate", i)
                }
            }, e.event.special.navigate = n = {
                bound: !1,
                pushStateEnabled: !0,
                originalEventName: t,
                isPushStateEnabled: function() {
                    return e.support.pushState && e.mobile.pushStateEnabled === !0 && this.isHashChangeEnabled()
                },
                isHashChangeEnabled: function() {
                    return e.mobile.hashListeningEnabled === !0
                },
                popstate: function(t) {
                    var n = new e.Event("navigate"),
                        i = new e.Event("beforenavigate"),
                        s = t.originalEvent.state || {};
                    i.originalEvent = t, r.trigger(i), i.isDefaultPrevented() || (t.historyState && e.extend(s, t.historyState), n.originalEvent = t, setTimeout(function() {
                        r.trigger(n, {
                            state: s
                        })
                    }, 0))
                },
                hashchange: function(t) {
                    var n = new e.Event("navigate"),
                        i = new e.Event("beforenavigate");
                    i.originalEvent = t, r.trigger(i), i.isDefaultPrevented() || (n.originalEvent = t, r.trigger(n, {
                        state: t.hashchangeState || {}
                    }))
                },
                setup: function() {
                    n.bound || (n.bound = !0, n.isPushStateEnabled() ? (n.originalEventName = "popstate", r.bind("popstate.navigate", n.popstate)) : n.isHashChangeEnabled() && (n.originalEventName = "hashchange", r.bind("hashchange.navigate", n.hashchange)))
                }
            }
        }(e),
        function(e, n) {
            var r, i, s = "&ui-state=dialog";
            e.mobile.path = r = {
                uiStateKey: "&ui-state",
                urlParseRE: /^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,
                getLocation: function(e) {
                    var t = e ? this.parseUrl(e) : location,
                        n = this.parseUrl(e || location.href).hash;
                    return n = "#" === n ? "" : n, t.protocol + "//" + t.host + t.pathname + t.search + n
                },
                getDocumentUrl: function(t) {
                    return t ? e.extend({}, r.documentUrl) : r.documentUrl.href
                },
                parseLocation: function() {
                    return this.parseUrl(this.getLocation())
                },
                parseUrl: function(t) {
                    if ("object" === e.type(t)) return t;
                    var n = r.urlParseRE.exec(t || "") || [];
                    return {
                        href: n[0] || "",
                        hrefNoHash: n[1] || "",
                        hrefNoSearch: n[2] || "",
                        domain: n[3] || "",
                        protocol: n[4] || "",
                        doubleSlash: n[5] || "",
                        authority: n[6] || "",
                        username: n[8] || "",
                        password: n[9] || "",
                        host: n[10] || "",
                        hostname: n[11] || "",
                        port: n[12] || "",
                        pathname: n[13] || "",
                        directory: n[14] || "",
                        filename: n[15] || "",
                        search: n[16] || "",
                        hash: n[17] || ""
                    }
                },
                makePathAbsolute: function(e, t) {
                    var n, r, i, s;
                    if (e && "/" === e.charAt(0)) return e;
                    for (e = e || "", t = t ? t.replace(/^\/|(\/[^\/]*|[^\/]+)$/g, "") : "", n = t ? t.split("/") : [], r = e.split("/"), i = 0; i < r.length; i++) switch (s = r[i]) {
                        case ".":
                            break;
                        case "..":
                            n.length && n.pop();
                            break;
                        default:
                            n.push(s)
                    }
                    return "/" + n.join("/")
                },
                isSameDomain: function(e, t) {
                    return r.parseUrl(e).domain === r.parseUrl(t).domain
                },
                isRelativeUrl: function(e) {
                    return "" === r.parseUrl(e).protocol
                },
                isAbsoluteUrl: function(e) {
                    return "" !== r.parseUrl(e).protocol
                },
                makeUrlAbsolute: function(e, t) {
                    if (!r.isRelativeUrl(e)) return e;
                    t === n && (t = this.documentBase);
                    var i = r.parseUrl(e),
                        s = r.parseUrl(t),
                        o = i.protocol || s.protocol,
                        u = i.protocol ? i.doubleSlash : i.doubleSlash || s.doubleSlash,
                        a = i.authority || s.authority,
                        f = "" !== i.pathname,
                        l = r.makePathAbsolute(i.pathname || s.filename, s.pathname),
                        h = i.search || !f && s.search || "",
                        p = i.hash;
                    return o + u + a + l + h + p
                },
                addSearchParams: function(t, n) {
                    var i = r.parseUrl(t),
                        s = "object" == typeof n ? e.param(n) : n,
                        o = i.search || "?";
                    return i.hrefNoSearch + o + ("?" !== o.charAt(o.length - 1) ? "&" : "") + s + (i.hash || "")
                },
                convertUrlToDataUrl: function(e) {
                    var n = r.parseUrl(e);
                    return r.isEmbeddedPage(n) ? n.hash.split(s)[0].replace(/^#/, "").replace(/\?.*$/, "") : r.isSameDomain(n, this.documentBase) ? n.hrefNoHash.replace(this.documentBase.domain, "").split(s)[0] : t.decodeURIComponent(e)
                },
                get: function(e) {
                    return e === n && (e = r.parseLocation().hash), r.stripHash(e).replace(/[^\/]*\.[^\/*]+$/, "")
                },
                set: function(e) {
                    location.hash = e
                },
                isPath: function(e) {
                    return /\//.test(e)
                },
                clean: function(e) {
                    return e.replace(this.documentBase.domain, "")
                },
                stripHash: function(e) {
                    return e.replace(/^#/, "")
                },
                stripQueryParams: function(e) {
                    return e.replace(/\?.*$/, "")
                },
                cleanHash: function(e) {
                    return r.stripHash(e.replace(/\?.*$/, "").replace(s, ""))
                },
                isHashValid: function(e) {
                    return /^#[^#]+$/.test(e)
                },
                isExternal: function(e) {
                    var t = r.parseUrl(e);
                    return t.protocol && t.domain !== this.documentUrl.domain ? !0 : !1
                },
                hasProtocol: function(e) {
                    return /^(:?\w+:)/.test(e)
                },
                isEmbeddedPage: function(e) {
                    var t = r.parseUrl(e);
                    return "" !== t.protocol ? !this.isPath(t.hash) && t.hash && (t.hrefNoHash === this.documentUrl.hrefNoHash || this.documentBaseDiffers && t.hrefNoHash === this.documentBase.hrefNoHash) : /^#/.test(t.href)
                },
                squash: function(e, t) {
                    var n, i, s, o, u = this.isPath(e),
                        a = this.parseUrl(e),
                        f = a.hash,
                        l = "";
                    return t = t || (r.isPath(e) ? r.getLocation() : r.getDocumentUrl()), i = u ? r.stripHash(e) : e, i = r.isPath(a.hash) ? r.stripHash(a.hash) : i, o = i.indexOf(this.uiStateKey), o > -1 && (l = i.slice(o), i = i.slice(0, o)), n = r.makeUrlAbsolute(i, t), s = this.parseUrl(n).search, u ? ((r.isPath(f) || 0 === f.replace("#", "").indexOf(this.uiStateKey)) && (f = ""), l && -1 === f.indexOf(this.uiStateKey) && (f += l), -1 === f.indexOf("#") && "" !== f && (f = "#" + f), n = r.parseUrl(n), n = n.protocol + "//" + n.host + n.pathname + s + f) : n += n.indexOf("#") > -1 ? l : "#" + l, n
                },
                isPreservableHash: function(e) {
                    return 0 === e.replace("#", "").indexOf(this.uiStateKey)
                },
                hashToSelector: function(e) {
                    var t = "#" === e.substring(0, 1);
                    return t && (e = e.substring(1)), (t ? "#" : "") + e.replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, "\\$1")
                },
                getFilePath: function(t) {
                    var n = "&" + e.mobile.subPageUrlKey;
                    return t && t.split(n)[0].split(s)[0]
                },
                isFirstPageUrl: function(t) {
                    var i = r.parseUrl(r.makeUrlAbsolute(t, this.documentBase)),
                        s = i.hrefNoHash === this.documentUrl.hrefNoHash || this.documentBaseDiffers && i.hrefNoHash === this.documentBase.hrefNoHash,
                        o = e.mobile.firstPage,
                        u = o && o[0] ? o[0].id : n;
                    return s && (!i.hash || "#" === i.hash || u && i.hash.replace(/^#/, "") === u)
                },
                isPermittedCrossDomainRequest: function(t, n) {
                    return e.mobile.allowCrossDomainPages && ("file:" === t.protocol || "content:" === t.protocol) && -1 !== n.search(/^https?:/)
                }
            }, r.documentUrl = r.parseLocation(), i = e("head").find("base"), r.documentBase = i.length ? r.parseUrl(r.makeUrlAbsolute(i.attr("href"), r.documentUrl.href)) : r.documentUrl, r.documentBaseDiffers = r.documentUrl.hrefNoHash !== r.documentBase.hrefNoHash, r.getDocumentBase = function(t) {
                return t ? e.extend({}, r.documentBase) : r.documentBase.href
            }, e.extend(e.mobile, {
                getDocumentUrl: r.getDocumentUrl,
                getDocumentBase: r.getDocumentBase
            })
        }(e),
        function(e, t) {
            e.mobile.History = function(e, t) {
                this.stack = e || [], this.activeIndex = t || 0
            }, e.extend(e.mobile.History.prototype, {
                getActive: function() {
                    return this.stack[this.activeIndex]
                },
                getLast: function() {
                    return this.stack[this.previousIndex]
                },
                getNext: function() {
                    return this.stack[this.activeIndex + 1]
                },
                getPrev: function() {
                    return this.stack[this.activeIndex - 1]
                },
                add: function(e, t) {
                    t = t || {}, this.getNext() && this.clearForward(), t.hash && -1 === t.hash.indexOf("#") && (t.hash = "#" + t.hash), t.url = e, this.stack.push(t), this.activeIndex = this.stack.length - 1
                },
                clearForward: function() {
                    this.stack = this.stack.slice(0, this.activeIndex + 1)
                },
                find: function(e, t, n) {
                    t = t || this.stack;
                    var r, i, s, o = t.length;
                    for (i = 0; o > i; i++)
                        if (r = t[i], (decodeURIComponent(e) === decodeURIComponent(r.url) || decodeURIComponent(e) === decodeURIComponent(r.hash)) && (s = i, n)) return s;
                    return s
                },
                closest: function(e) {
                    var n, r = this.activeIndex;
                    return n = this.find(e, this.stack.slice(0, r)), n === t && (n = this.find(e, this.stack.slice(r), !0), n = n === t ? n : n + r), n
                },
                direct: function(n) {
                    var r = this.closest(n.url),
                        i = this.activeIndex;
                    r !== t && (this.activeIndex = r, this.previousIndex = i), i > r ? (n.present || n.back || e.noop)(this.getActive(), "back") : r > i ? (n.present || n.forward || e.noop)(this.getActive(), "forward") : r === t && n.missing && n.missing(this.getActive())
                }
            })
        }(e),
        function(e) {
            var r = e.mobile.path,
                i = location.href;
            e.mobile.Navigator = function(t) {
                this.history = t, this.ignoreInitialHashChange = !0, e.mobile.window.bind({
                    "popstate.history": e.proxy(this.popstate, this),
                    "hashchange.history": e.proxy(this.hashchange, this)
                })
            }, e.extend(e.mobile.Navigator.prototype, {
                squash: function(i, s) {
                    var o, u, f = r.isPath(i) ? r.stripHash(i) : i;
                    return u = r.squash(i), o = e.extend({
                        hash: f,
                        url: u
                    }, s), t.history.replaceState(o, o.title || n.title, u), o
                },
                hash: function(e, t) {
                    var n, i, s, o;
                    return n = r.parseUrl(e), i = r.parseLocation(), i.pathname + i.search === n.pathname + n.search ? s = n.hash ? n.hash : n.pathname + n.search : r.isPath(e) ? (o = r.parseUrl(t), s = o.pathname + o.search + (r.isPreservableHash(o.hash) ? o.hash.replace("#", "") : "")) : s = e, s
                },
                go: function(i, s, o) {
                    var u, f, l, h, p = e.event.special.navigate.isPushStateEnabled();
                    f = r.squash(i), l = this.hash(i, f), o && l !== r.stripHash(r.parseLocation().hash) && (this.preventNextHashChange = o), this.preventHashAssignPopState = !0, t.location.hash = l, this.preventHashAssignPopState = !1, u = e.extend({
                        url: f,
                        hash: l,
                        title: n.title
                    }, s), p && (h = new e.Event("popstate"), h.originalEvent = {
                        type: "popstate",
                        state: null
                    }, this.squash(i, u), o || (this.ignorePopState = !0, e.mobile.window.trigger(h))), this.history.add(u.url, u)
                },
                popstate: function(t) {
                    var n, s;
                    if (e.event.special.navigate.isPushStateEnabled()) return this.preventHashAssignPopState ? (this.preventHashAssignPopState = !1, t.stopImmediatePropagation(), void 0) : this.ignorePopState ? (this.ignorePopState = !1, void 0) : !t.originalEvent.state && 1 === this.history.stack.length && this.ignoreInitialHashChange && (this.ignoreInitialHashChange = !1, location.href === i) ? (t.preventDefault(), void 0) : (n = r.parseLocation().hash, !t.originalEvent.state && n ? (s = this.squash(n), this.history.add(s.url, s), t.historyState = s, void 0) : (this.history.direct({
                        url: (t.originalEvent.state || {}).url || n,
                        present: function(n, r) {
                            t.historyState = e.extend({}, n), t.historyState.direction = r
                        }
                    }), void 0))
                },
                hashchange: function(t) {
                    var i, s;
                    if (e.event.special.navigate.isHashChangeEnabled() && !e.event.special.navigate.isPushStateEnabled()) {
                        if (this.preventNextHashChange) return this.preventNextHashChange = !1, t.stopImmediatePropagation(), void 0;
                        i = this.history, s = r.parseLocation().hash, this.history.direct({
                            url: s,
                            present: function(n, r) {
                                t.hashchangeState = e.extend({}, n), t.hashchangeState.direction = r
                            },
                            missing: function() {
                                i.add(s, {
                                    hash: s,
                                    title: n.title
                                })
                            }
                        })
                    }
                }
            })
        }(e),
        function(e) {
            e.mobile.navigate = function(t, n, r) {
                e.mobile.navigate.navigator.go(t, n, r)
            }, e.mobile.navigate.history = new e.mobile.History, e.mobile.navigate.navigator = new e.mobile.Navigator(e.mobile.navigate.history);
            var t = e.mobile.path.parseLocation();
            e.mobile.navigate.history.add(t.href, {
                hash: t.hash
            })
        }(e),
        function(e, t, n, r) {
            function i(e) {
                for (; e && "undefined" != typeof e.originalEvent;) e = e.originalEvent;
                return e
            }

            function s(t, n) {
                var s, o, u, a, f, l, c, h, p, d = t.type;
                if (t = e.Event(t), t.type = n, s = t.originalEvent, o = e.event.props, d.search(/^(mouse|click)/) > -1 && (o = O), s)
                    for (c = o.length, a; c;) a = o[--c], t[a] = s[a];
                if (d.search(/mouse(down|up)|click/) > -1 && !t.which && (t.which = 1), -1 !== d.search(/^touch/) && (u = i(s), d = u.touches, f = u.changedTouches, l = d && d.length ? d[0] : f && f.length ? f[0] : r))
                    for (h = 0, p = L.length; p > h; h++) a = L[h], t[a] = l[a];
                return t
            }

            function o(t) {
                for (var n, r, i = {}; t;) {
                    n = e.data(t, N);
                    for (r in n) n[r] && (i[r] = i.hasVirtualBinding = !0);
                    t = t.parentNode
                }
                return i
            }

            function u(t, n) {
                for (var r; t;) {
                    if (r = e.data(t, N), r && (!n || r[n])) return t;
                    t = t.parentNode
                }
                return null
            }

            function a() {
                F = !1
            }

            function f() {
                F = !0
            }

            function l() {
                U = 0, B.length = 0, j = !1, f()
            }

            function c() {
                a()
            }

            function h() {
                p(), _ = setTimeout(function() {
                    _ = 0, l()
                }, e.vmouse.resetTimerDuration)
            }

            function p() {
                _ && (clearTimeout(_), _ = 0)
            }

            function d(t, n, r) {
                var i;
                return (r && r[t] || !r && u(n.target, t)) && (i = s(n, t), e(n.target).trigger(i)), i
            }

            function v(t) {
                var n, r = e.data(t.target, C);
                j || U && U === r || (n = d("v" + t.type, t), n && (n.isDefaultPrevented() && t.preventDefault(), n.isPropagationStopped() && t.stopPropagation(), n.isImmediatePropagationStopped() && t.stopImmediatePropagation()))
            }

            function m(t) {
                var n, r, s, u = i(t).touches;
                u && 1 === u.length && (n = t.target, r = o(n), r.hasVirtualBinding && (U = R++, e.data(n, C, U), p(), c(), H = !1, s = i(t).touches[0], D = s.pageX, P = s.pageY, d("vmouseover", t, r), d("vmousedown", t, r)))
            }

            function g(e) {
                F || (H || d("vmousecancel", e, o(e.target)), H = !0, h())
            }

            function y(t) {
                if (!F) {
                    var n = i(t).touches[0],
                        r = H,
                        s = e.vmouse.moveDistanceThreshold,
                        u = o(t.target);
                    H = H || Math.abs(n.pageX - D) > s || Math.abs(n.pageY - P) > s, H && !r && d("vmousecancel", t, u), d("vmousemove", t, u), h()
                }
            }

            function b(e) {
                if (!F) {
                    f();
                    var t, n, r = o(e.target);
                    d("vmouseup", e, r), H || (t = d("vclick", e, r), t && t.isDefaultPrevented() && (n = i(e).changedTouches[0], B.push({
                        touchID: U,
                        x: n.clientX,
                        y: n.clientY
                    }), j = !0)), d("vmouseout", e, r), H = !1, h()
                }
            }

            function w(t) {
                var n, r = e.data(t, N);
                if (r)
                    for (n in r)
                        if (r[n]) return !0;
                return !1
            }

            function E() {}

            function S(t) {
                var n = t.substr(1);
                return {
                    setup: function() {
                        w(this) || e.data(this, N, {});
                        var r = e.data(this, N);
                        r[t] = !0, M[t] = (M[t] || 0) + 1, 1 === M[t] && q.bind(n, v), e(this).bind(n, E), I && (M.touchstart = (M.touchstart || 0) + 1, 1 === M.touchstart && q.bind("touchstart", m).bind("touchend", b).bind("touchmove", y).bind("scroll", g))
                    },
                    teardown: function() {
                        --M[t], M[t] || q.unbind(n, v), I && (--M.touchstart, M.touchstart || q.unbind("touchstart", m).unbind("touchmove", y).unbind("touchend", b).unbind("scroll", g));
                        var r = e(this),
                            i = e.data(this, N);
                        i && (i[t] = !1), r.unbind(n, E), w(this) || r.removeData(N)
                    }
                }
            }
            var x, T, N = "virtualMouseBindings",
                C = "virtualTouchID",
                k = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split(" "),
                L = "clientX clientY pageX pageY screenX screenY".split(" "),
                A = e.event.mouseHooks ? e.event.mouseHooks.props : [],
                O = e.event.props.concat(A),
                M = {},
                _ = 0,
                D = 0,
                P = 0,
                H = !1,
                B = [],
                j = !1,
                F = !1,
                I = "addEventListener" in n,
                q = e(n),
                R = 1,
                U = 0;
            for (e.vmouse = {
                    moveDistanceThreshold: 10,
                    clickDistanceThreshold: 10,
                    resetTimerDuration: 1500
                }, T = 0; T < k.length; T++) e.event.special[k[T]] = S(k[T]);
            I && n.addEventListener("click", function(t) {
                var n, r, i, s, o, u, a = B.length,
                    f = t.target;
                if (a)
                    for (n = t.clientX, r = t.clientY, x = e.vmouse.clickDistanceThreshold, i = f; i;) {
                        for (s = 0; a > s; s++)
                            if (o = B[s], u = 0, i === f && Math.abs(o.x - n) < x && Math.abs(o.y - r) < x || e.data(i, C) === o.touchID) return t.preventDefault(), t.stopPropagation(), void 0;
                        i = i.parentNode
                    }
            }, !0)
        }(e, t, n),
        function(e) {
            function t(t, n, r) {
                var i = r.type;
                r.type = n, e.event.dispatch.call(t, r), r.type = i
            }
            var r = e(n),
                i = e.mobile.support.touch,
                s = "touchmove scroll",
                o = i ? "touchstart" : "mousedown",
                u = i ? "touchend" : "mouseup",
                a = i ? "touchmove" : "mousemove";
            e.each("touchstart touchmove touchend tap taphold swipe swipeleft swiperight scrollstart scrollstop".split(" "), function(t, n) {
                e.fn[n] = function(e) {
                    return e ? this.bind(n, e) : this.trigger(n)
                }, e.attrFn && (e.attrFn[n] = !0)
            }), e.event.special.scrollstart = {
                enabled: !0,
                setup: function() {
                    function n(e, n) {
                        r = n, t(o, r ? "scrollstart" : "scrollstop", e)
                    }
                    var r, i, o = this,
                        u = e(o);
                    u.bind(s, function(t) {
                        e.event.special.scrollstart.enabled && (r || n(t, !0), clearTimeout(i), i = setTimeout(function() {
                            n(t, !1)
                        }, 50))
                    })
                },
                teardown: function() {
                    e(this).unbind(s)
                }
            }, e.event.special.tap = {
                tapholdThreshold: 750,
                emitTapOnTaphold: !0,
                setup: function() {
                    var n = this,
                        i = e(n),
                        s = !1;
                    i.bind("vmousedown", function(o) {
                        function u() {
                            clearTimeout(h)
                        }

                        function a() {
                            u(), i.unbind("vclick", l).unbind("vmouseup", u), r.unbind("vmousecancel", a)
                        }

                        function l(e) {
                            a(), s || p !== e.target ? s && e.stopPropagation() : t(n, "tap", e)
                        }
                        if (s = !1, o.which && 1 !== o.which) return !1;
                        var h, p = o.target;
                        i.bind("vmouseup", u).bind("vclick", l), r.bind("vmousecancel", a), h = setTimeout(function() {
                            e.event.special.tap.emitTapOnTaphold || (s = !0), t(n, "taphold", e.Event("taphold", {
                                target: p
                            }))
                        }, e.event.special.tap.tapholdThreshold)
                    })
                },
                teardown: function() {
                    e(this).unbind("vmousedown").unbind("vclick").unbind("vmouseup"), r.unbind("vmousecancel")
                }
            }, e.event.special.swipe = {
                scrollSupressionThreshold: 30,
                durationThreshold: 1e3,
                horizontalDistanceThreshold: 30,
                verticalDistanceThreshold: 75,
                start: function(t) {
                    var n = t.originalEvent.touches ? t.originalEvent.touches[0] : t;
                    return {
                        time: (new Date).getTime(),
                        coords: [n.pageX, n.pageY],
                        origin: e(t.target)
                    }
                },
                stop: function(e) {
                    var t = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                    return {
                        time: (new Date).getTime(),
                        coords: [t.pageX, t.pageY]
                    }
                },
                handleSwipe: function(n, r, i, s) {
                    if (r.time - n.time < e.event.special.swipe.durationThreshold && Math.abs(n.coords[0] - r.coords[0]) > e.event.special.swipe.horizontalDistanceThreshold && Math.abs(n.coords[1] - r.coords[1]) < e.event.special.swipe.verticalDistanceThreshold) {
                        var o = n.coords[0] > r.coords[0] ? "swipeleft" : "swiperight";
                        return t(i, "swipe", e.Event("swipe", {
                            target: s,
                            swipestart: n,
                            swipestop: r
                        })), t(i, o, e.Event(o, {
                            target: s,
                            swipestart: n,
                            swipestop: r
                        })), !0
                    }
                    return !1
                },
                setup: function() {
                    var t = this,
                        n = e(t);
                    n.bind(o, function(r) {
                        function i(n) {
                            o && (s = e.event.special.swipe.stop(n), l || (l = e.event.special.swipe.handleSwipe(o, s, t, f)), Math.abs(o.coords[0] - s.coords[0]) > e.event.special.swipe.scrollSupressionThreshold && n.preventDefault())
                        }
                        var s, o = e.event.special.swipe.start(r),
                            f = r.target,
                            l = !1;
                        n.bind(a, i).one(u, function() {
                            l = !0, n.unbind(a, i)
                        })
                    })
                },
                teardown: function() {
                    e(this).unbind(o).unbind(a).unbind(u)
                }
            }, e.each({
                scrollstop: "scrollstart",
                taphold: "tap",
                swipeleft: "swipe",
                swiperight: "swipe"
            }, function(t, n) {
                e.event.special[t] = {
                    setup: function() {
                        e(this).bind(n, e.noop)
                    },
                    teardown: function() {
                        e(this).unbind(n)
                    }
                }
            })
        }(e, this),
        function(e) {
            e.event.special.throttledresize = {
                setup: function() {
                    e(this).bind("resize", s)
                },
                teardown: function() {
                    e(this).unbind("resize", s)
                }
            };
            var t, n, r, i = 250,
                s = function() {
                    n = (new Date).getTime(), r = n - o, r >= i ? (o = n, e(this).trigger("throttledresize")) : (t && clearTimeout(t), t = setTimeout(s, i - r))
                },
                o = 0
        }(e),
        function(e, t) {
            function r() {
                var e = i();
                e !== s && (s = e, h.trigger(p))
            }
            var i, s, o, u, a, f, l, h = e(t),
                p = "orientationchange",
                d = {
                    0: !0,
                    180: !0
                };
            e.support.orientation && (a = t.innerWidth || h.width(), f = t.innerHeight || h.height(), l = 50, o = a > f && a - f > l, u = d[t.orientation], (o && u || !o && !u) && (d = {
                "-90": !0,
                90: !0
            })), e.event.special.orientationchange = e.extend({}, e.event.special.orientationchange, {
                setup: function() {
                    return e.support.orientation && !e.event.special.orientationchange.disabled ? !1 : (s = i(), h.bind("throttledresize", r), void 0)
                },
                teardown: function() {
                    return e.support.orientation && !e.event.special.orientationchange.disabled ? !1 : (h.unbind("throttledresize", r), void 0)
                },
                add: function(e) {
                    var t = e.handler;
                    e.handler = function(e) {
                        return e.orientation = i(), t.apply(this, arguments)
                    }
                }
            }), e.event.special.orientationchange.orientation = i = function() {
                var r = !0,
                    i = n.documentElement;
                return r = e.support.orientation ? d[t.orientation] : i && i.clientWidth / i.clientHeight < 1.1, r ? "portrait" : "landscape"
            }, e.fn[p] = function(e) {
                return e ? this.bind(p, e) : this.trigger(p)
            }, e.attrFn && (e.attrFn[p] = !0)
        }(e, this),
        function(e) {
            var t = e("head").children("base"),
                n = {
                    element: t.length ? t : e("<base>", {
                        href: e.mobile.path.documentBase.hrefNoHash
                    }).prependTo(e("head")),
                    linkSelector: "[src], link[href], a[rel='external'], :jqmData(ajax='false'), a[target]",
                    set: function(t) {
                        e.mobile.dynamicBaseEnabled && e.support.dynamicBaseTag && n.element.attr("href", e.mobile.path.makeUrlAbsolute(t, e.mobile.path.documentBase))
                    },
                    rewrite: function(t, r) {
                        var i = e.mobile.path.get(t);
                        r.find(n.linkSelector).each(function(t, n) {
                            var r = e(n).is("[href]") ? "href" : e(n).is("[src]") ? "src" : "action",
                                s = e(n).attr(r);
                            s = s.replace(location.protocol + "//" + location.host + location.pathname, ""), /^(\w+:|#|\/)/.test(s) || e(n).attr(r, i + s)
                        })
                    },
                    reset: function() {
                        n.element.attr("href", e.mobile.path.documentBase.hrefNoSearch)
                    }
                };
            e.mobile.base = n
        }(e),
        function(e, t) {
            e.mobile.widgets = {};
            var n = e.widget,
                r = e.mobile.keepNative;
            e.widget = function(n) {
                return function() {
                    var r = n.apply(this, arguments),
                        i = r.prototype.widgetName;
                    return r.initSelector = r.prototype.initSelector !== t ? r.prototype.initSelector : ":jqmData(role='" + i + "')", e.mobile.widgets[i] = r, r
                }
            }(e.widget), e.extend(e.widget, n), e.mobile.document.on("create", function(t) {
                e(t.target).enhanceWithin()
            }), e.widget("mobile.page", {
                options: {
                    theme: "a",
                    domCache: !1,
                    keepNativeDefault: e.mobile.keepNative,
                    contentTheme: null,
                    enhanced: !1
                },
                _createWidget: function() {
                    e.Widget.prototype._createWidget.apply(this, arguments), this._trigger("init")
                },
                _create: function() {
                    return this._trigger("beforecreate") === !1 ? !1 : (this.options.enhanced || this._enhance(), this._on(this.element, {
                        pagebeforehide: "removeContainerBackground",
                        pagebeforeshow: "_handlePageBeforeShow"
                    }), this.element.enhanceWithin(), "dialog" === e.mobile.getAttribute(this.element[0], "role") && e.mobile.dialog && this.element.dialog(), void 0)
                },
                _enhance: function() {
                    var n = "data-" + e.mobile.ns,
                        r = this;
                    this.options.role && this.element.attr("data-" + e.mobile.ns + "role", this.options.role), this.element.attr("tabindex", "0").addClass("ui-page ui-page-theme-" + this.options.theme), this.element.find("[" + n + "role='content']").each(function() {
                        var i = e(this),
                            s = this.getAttribute(n + "theme") || t;
                        r.options.contentTheme = s || r.options.contentTheme || r.options.dialog && r.options.theme || "dialog" === r.element.jqmData("role") && r.options.theme, i.addClass("ui-content"), r.options.contentTheme && i.addClass("ui-body-" + r.options.contentTheme), i.attr("role", "main").addClass("ui-content")
                    })
                },
                bindRemove: function(t) {
                    var n = this.element;
                    !n.data("mobile-page").options.domCache && n.is(":jqmData(external-page='true')") && n.bind("pagehide.remove", t || function(t, n) {
                        if (!n.samePage) {
                            var r = e(this),
                                i = new e.Event("pageremove");
                            r.trigger(i), i.isDefaultPrevented() || r.removeWithDependents()
                        }
                    })
                },
                _setOptions: function(n) {
                    n.theme !== t && this.element.removeClass("ui-body-" + this.options.theme).addClass("ui-body-" + n.theme), n.contentTheme !== t && this.element.find("[data-" + e.mobile.ns + "='content']").removeClass("ui-body-" + this.options.contentTheme).addClass("ui-body-" + n.contentTheme)
                },
                _handlePageBeforeShow: function() {
                    this.setContainerBackground()
                },
                removeContainerBackground: function() {
                    this.element.closest(":mobile-pagecontainer").pagecontainer({
                        theme: "none"
                    })
                },
                setContainerBackground: function(e) {
                    this.element.parent().pagecontainer({
                        theme: e || this.options.theme
                    })
                },
                keepNativeSelector: function() {
                    var t = this.options,
                        n = e.trim(t.keepNative || ""),
                        i = e.trim(e.mobile.keepNative),
                        s = e.trim(t.keepNativeDefault),
                        o = r === i ? "" : i,
                        u = "" === o ? s : "";
                    return (n ? [n] : []).concat(o ? [o] : []).concat(u ? [u] : []).join(", ")
                }
            })
        }(e),
        function(e, r) {
            e.widget("mobile.pagecontainer", {
                options: {
                    theme: "a"
                },
                initSelector: !1,
                _create: function() {
                    this.setLastScrollEnabled = !0, this._on(this.window, {
                        navigate: "_filterNavigateEvents"
                    }), this._on(this.window, {
                        navigate: "_disableRecordScroll",
                        scrollstop: "_delayedRecordScroll"
                    }), this._on({
                        pagechange: "_afterContentChange"
                    }), this.window.one("navigate", e.proxy(function() {
                        this.setLastScrollEnabled = !0
                    }, this))
                },
                _setOptions: function(e) {
                    e.theme !== r && "none" !== e.theme ? this.element.removeClass("ui-overlay-" + this.options.theme).addClass("ui-overlay-" + e.theme) : e.theme !== r && this.element.removeClass("ui-overlay-" + this.options.theme), this._super(e)
                },
                _disableRecordScroll: function() {
                    this.setLastScrollEnabled = !1
                },
                _enableRecordScroll: function() {
                    this.setLastScrollEnabled = !0
                },
                _afterContentChange: function() {
                    this.setLastScrollEnabled = !0, this._off(this.window, "scrollstop"), this._on(this.window, {
                        scrollstop: "_delayedRecordScroll"
                    })
                },
                _recordScroll: function() {
                    if (this.setLastScrollEnabled) {
                        var e, t, n, r = this._getActiveHistory();
                        r && (e = this._getScroll(), t = this._getMinScroll(), n = this._getDefaultScroll(), r.lastScroll = t > e ? n : e)
                    }
                },
                _delayedRecordScroll: function() {
                    setTimeout(e.proxy(this, "_recordScroll"), 100)
                },
                _getScroll: function() {
                    return this.window.scrollTop()
                },
                _getMinScroll: function() {
                    return e.mobile.minScrollBack
                },
                _getDefaultScroll: function() {
                    return e.mobile.defaultHomeScroll
                },
                _filterNavigateEvents: function(t, n) {
                    var r;
                    t.originalEvent && t.originalEvent.isDefaultPrevented() || (r = t.originalEvent.type.indexOf("hashchange") > -1 ? n.state.hash : n.state.url, r || (r = this._getHash()), r && "#" !== r && 0 !== r.indexOf("#" + e.mobile.path.uiStateKey) || (r = location.href), this._handleNavigate(r, n.state))
                },
                _getHash: function() {
                    return e.mobile.path.parseLocation().hash
                },
                getActivePage: function() {
                    return this.activePage
                },
                _getInitialContent: function() {
                    return e.mobile.firstPage
                },
                _getHistory: function() {
                    return e.mobile.navigate.history
                },
                _getActiveHistory: function() {
                    return e.mobile.navigate.history.getActive()
                },
                _getDocumentBase: function() {
                    return e.mobile.path.documentBase
                },
                back: function() {
                    this.go(-1)
                },
                forward: function() {
                    this.go(1)
                },
                go: function(n) {
                    if (e.mobile.hashListeningEnabled) t.history.go(n);
                    else {
                        var r = e.mobile.navigate.history.activeIndex,
                            i = r + parseInt(n, 10),
                            s = e.mobile.navigate.history.stack[i].url,
                            o = n >= 1 ? "forward" : "back";
                        e.mobile.navigate.history.activeIndex = i, e.mobile.navigate.history.previousIndex = r, this.change(s, {
                            direction: o,
                            changeHash: !1,
                            fromHashChange: !0
                        })
                    }
                },
                _handleDestination: function(t) {
                    var n;
                    return "string" === e.type(t) && (t = e.mobile.path.stripHash(t)), t && (n = this._getHistory(), t = e.mobile.path.isPath(t) ? t : e.mobile.path.makeUrlAbsolute("#" + t, this._getDocumentBase()), t === e.mobile.path.makeUrlAbsolute("#" + n.initialDst, this._getDocumentBase()) && n.stack.length && n.stack[0].url !== n.initialDst.replace(e.mobile.dialogHashKey, "") && (t = this._getInitialContent())), t || this._getInitialContent()
                },
                _handleDialog: function(t, n) {
                    var r, i, s = this.getActivePage();
                    return s && !s.hasClass("ui-dialog") ? ("back" === n.direction ? this.back() : this.forward(), !1) : (r = n.pageUrl, i = this._getActiveHistory(), e.extend(t, {
                        role: i.role,
                        transition: i.transition,
                        reverse: "back" === n.direction
                    }), r)
                },
                _handleNavigate: function(t, n) {
                    var i = e.mobile.path.stripHash(t),
                        s = this._getHistory(),
                        o = 0 === s.stack.length ? "none" : r,
                        u = {
                            changeHash: !1,
                            fromHashChange: !0,
                            reverse: "back" === n.direction
                        };
                    e.extend(u, n, {
                        transition: (s.getLast() || {}).transition || o
                    }), s.activeIndex > 0 && i.indexOf(e.mobile.dialogHashKey) > -1 && s.initialDst !== i && (i = this._handleDialog(u, n), i === !1) || this._changeContent(this._handleDestination(i), u)
                },
                _changeContent: function(t, n) {
                    e.mobile.changePage(t, n)
                },
                _getBase: function() {
                    return e.mobile.base
                },
                _getNs: function() {
                    return e.mobile.ns
                },
                _enhance: function(e, t) {
                    return e.page({
                        role: t
                    })
                },
                _include: function(e, t) {
                    e.appendTo(this.element), this._enhance(e, t.role), e.page("bindRemove")
                },
                _find: function(t) {
                    var n, r = this._createFileUrl(t),
                        i = this._createDataUrl(t),
                        s = this._getInitialContent();
                    return n = this.element.children("[data-" + this._getNs() + "url='" + i + "']"), 0 === n.length && i && !e.mobile.path.isPath(i) && (n = this.element.children(e.mobile.path.hashToSelector("#" + i)).attr("data-" + this._getNs() + "url", i).jqmData("url", i)), 0 === n.length && e.mobile.path.isFirstPageUrl(r) && s && s.parent().length && (n = e(s)), n
                },
                _getLoader: function() {
                    return e.mobile.loading()
                },
                _showLoading: function(t, n, r, i) {
                    this._loadMsg || (this._loadMsg = setTimeout(e.proxy(function() {
                        this._getLoader().loader("show", n, r, i), this._loadMsg = 0
                    }, this), t))
                },
                _hideLoading: function() {
                    clearTimeout(this._loadMsg), this._loadMsg = 0, this._getLoader().loader("hide")
                },
                _showError: function() {
                    this._hideLoading(), this._showLoading(0, e.mobile.pageLoadErrorMessageTheme, e.mobile.pageLoadErrorMessage, !0), setTimeout(e.proxy(this, "_hideLoading"), 1500)
                },
                _parse: function(t, n) {
                    var r, i = e("<div></div>");
                    return i.get(0).innerHTML = t, r = i.find(":jqmData(role='page'), :jqmData(role='dialog')").first(), r.length || (r = e("<div data-" + this._getNs() + "role='page'>" + (t.split(/<\/?body[^>]*>/gim)[1] || "") + "</div>")), r.attr("data-" + this._getNs() + "url", e.mobile.path.convertUrlToDataUrl(n)).attr("data-" + this._getNs() + "external-page", !0), r
                },
                _setLoadedTitle: function(t, n) {
                    var r = n.match(/<title[^>]*>([^<]*)/) && RegExp.$1;
                    r && !t.jqmData("title") && (r = e("<div>" + r + "</div>").text(), t.jqmData("title", r))
                },
                _isRewritableBaseTag: function() {
                    return e.mobile.dynamicBaseEnabled && !e.support.dynamicBaseTag
                },
                _createDataUrl: function(t) {
                    return e.mobile.path.convertUrlToDataUrl(t)
                },
                _createFileUrl: function(t) {
                    return e.mobile.path.getFilePath(t)
                },
                _triggerWithDeprecated: function(t, n, r) {
                    var i = e.Event("page" + t),
                        s = e.Event(this.widgetName + t);
                    return (r || this.element).trigger(i, n), this.element.trigger(s, n), {
                        deprecatedEvent: i,
                        event: s
                    }
                },
                _loadSuccess: function(t, n, i, s) {
                    var o = this._createFileUrl(t),
                        u = this._createDataUrl(t);
                    return e.proxy(function(l, p, v) {
                        var m, y = new RegExp("(<[^>]+\\bdata-" + this._getNs() + "role=[\"']?page[\"']?[^>]*>)"),
                            w = new RegExp("\\bdata-" + this._getNs() + "url=[\"']?([^\"'>]*)[\"']?");
                        y.test(l) && RegExp.$1 && w.test(RegExp.$1) && RegExp.$1 && (o = e.mobile.path.getFilePath(e("<div>" + RegExp.$1 + "</div>").text())), i.prefetch === r && this._getBase().set(o), m = this._parse(l, o), this._setLoadedTitle(m, l), n.xhr = v, n.textStatus = p, n.page = m, n.content = m, this._trigger("load", r, n) && (this._isRewritableBaseTag() && m && this._getBase().rewrite(o, m), this._include(m, i), t.indexOf("&" + e.mobile.subPageUrlKey) > -1 && (m = this.element.children("[data-" + this._getNs() + "url='" + u + "']")), i.showLoadMsg && this._hideLoading(), this.element.trigger("pageload"), s.resolve(t, i, m))
                    }, this)
                },
                _loadDefaults: {
                    type: "get",
                    data: r,
                    reloadPage: !1,
                    reload: !1,
                    role: r,
                    showLoadMsg: !1,
                    loadMsgDelay: 50
                },
                load: function(t, n) {
                    var i, s, o, u, f = n && n.deferred || e.Deferred(),
                        l = e.extend({}, this._loadDefaults, n),
                        c = null,
                        h = e.mobile.path.makeUrlAbsolute(t, this._findBaseWithDefault());
                    return l.reload = l.reloadPage, l.data && "get" === l.type && (h = e.mobile.path.addSearchParams(h, l.data), l.data = r), l.data && "post" === l.type && (l.reload = !0), i = this._createFileUrl(h), s = this._createDataUrl(h), c = this._find(h), 0 === c.length && e.mobile.path.isEmbeddedPage(i) && !e.mobile.path.isFirstPageUrl(i) ? (f.reject(h, l), void 0) : (this._getBase().reset(), c.length && !l.reload ? (this._enhance(c, l.role), f.resolve(h, l, c), l.prefetch || this._getBase().set(t), void 0) : (u = {
                        url: t,
                        absUrl: h,
                        dataUrl: s,
                        deferred: f,
                        options: l
                    }, o = this._triggerWithDeprecated("beforeload", u), o.deprecatedEvent.isDefaultPrevented() || o.event.isDefaultPrevented() ? void 0 : (l.showLoadMsg && this._showLoading(l.loadMsgDelay), l.prefetch === r && this._getBase().reset(), e.mobile.allowCrossDomainPages || e.mobile.path.isSameDomain(e.mobile.path.documentUrl, h) ? (e.ajax({
                        url: i,
                        type: l.type,
                        data: l.data,
                        contentType: l.contentType,
                        dataType: "html",
                        success: this._loadSuccess(h, u, l, f),
                        error: this._loadError(h, u, l, f)
                    }), void 0) : (f.reject(h, l), void 0))))
                },
                _loadError: function(t, n, r, i) {
                    return e.proxy(function(s, o, u) {
                        this._getBase().set(e.mobile.path.get()), n.xhr = s, n.textStatus = o, n.errorThrown = u;
                        var f = this._triggerWithDeprecated("loadfailed", n);
                        f.deprecatedEvent.isDefaultPrevented() || f.event.isDefaultPrevented() || (r.showLoadMsg && this._showError(), i.reject(t, r))
                    }, this)
                },
                _getTransitionHandler: function(t) {
                    return t = e.mobile._maybeDegradeTransition(t), e.mobile.transitionHandlers[t] || e.mobile.defaultTransitionHandler
                },
                _triggerCssTransitionEvents: function(t, n, r) {
                    var i = !1;
                    r = r || "", n && (t[0] === n[0] && (i = !0), this._triggerWithDeprecated(r + "hide", {
                        nextPage: t,
                        samePage: i
                    }, n)), this._triggerWithDeprecated(r + "show", {
                        prevPage: n || e("")
                    }, t)
                },
                _cssTransition: function(t, n, r) {
                    var i, s, o = r.transition,
                        u = r.reverse,
                        f = r.deferred;
                    this._triggerCssTransitionEvents(t, n, "before"), this._hideLoading(), i = this._getTransitionHandler(o), s = (new i(o, u, t, n)).transition(), s.done(function() {
                        f.resolve.apply(f, arguments)
                    }), s.done(e.proxy(function() {
                        this._triggerCssTransitionEvents(t, n)
                    }, this))
                },
                _releaseTransitionLock: function() {
                    s = !1, i.length > 0 && e.mobile.changePage.apply(null, i.pop())
                },
                _removeActiveLinkClass: function(t) {
                    e.mobile.removeActiveLinkClass(t)
                },
                _loadUrl: function(t, n, r) {
                    r.target = t, r.deferred = e.Deferred(), this.load(t, r), r.deferred.done(e.proxy(function(e, t, r) {
                        s = !1, t.absUrl = n.absUrl, this.transition(r, n, t)
                    }, this)), r.deferred.fail(e.proxy(function() {
                        this._removeActiveLinkClass(!0), this._releaseTransitionLock(), this._triggerWithDeprecated("changefailed", n)
                    }, this))
                },
                _triggerPageBeforeChange: function(t, n, r) {
                    var i = new e.Event("pagebeforechange");
                    return e.extend(n, {
                        toPage: t,
                        options: r
                    }), n.absUrl = "string" === e.type(t) ? e.mobile.path.makeUrlAbsolute(t, this._findBaseWithDefault()) : r.absUrl, this.element.trigger(i, n), i.isDefaultPrevented() ? !1 : !0
                },
                change: function(t, n) {
                    if (s) return i.unshift(arguments), void 0;
                    var r = e.extend({}, e.mobile.changePage.defaults, n),
                        o = {};
                    r.fromPage = r.fromPage || this.activePage, this._triggerPageBeforeChange(t, o, r) && (t = o.toPage, "string" === e.type(t) ? (s = !0, this._loadUrl(t, o, r)) : this.transition(t, o, r))
                },
                transition: function(t, o, u) {
                    var l, h, p, v, m, g, y, b, w, E, S, x, T, N;
                    if (s) return i.unshift([t, u]), void 0;
                    if (this._triggerPageBeforeChange(t, o, u) && (N = this._triggerWithDeprecated("beforetransition", o), !N.deprecatedEvent.isDefaultPrevented() && !N.event.isDefaultPrevented())) {
                        if (s = !0, t[0] !== e.mobile.firstPage[0] || u.dataUrl || (u.dataUrl = e.mobile.path.documentUrl.hrefNoHash), l = u.fromPage, h = u.dataUrl && e.mobile.path.convertUrlToDataUrl(u.dataUrl) || t.jqmData("url"), p = h, v = e.mobile.path.getFilePath(h), m = e.mobile.navigate.history.getActive(), g = 0 === e.mobile.navigate.history.activeIndex, y = 0, b = n.title, w = ("dialog" === u.role || "dialog" === t.jqmData("role")) && t.jqmData("dialog") !== !0, l && l[0] === t[0] && !u.allowSamePageTransition) return s = !1, this._triggerWithDeprecated("transition", o), this.element.trigger("pagechange", o), u.fromHashChange && e.mobile.navigate.history.direct({
                            url: h
                        }), void 0;
                        t.page({
                            role: u.role
                        }), u.fromHashChange && (y = "back" === u.direction ? -1 : 1);
                        try {
                            n.activeElement && "body" !== n.activeElement.nodeName.toLowerCase() ? e(n.activeElement).blur() : e("input:focus, textarea:focus, select:focus").blur()
                        } catch (C) {}
                        E = !1, w && m && (m.url && m.url.indexOf(e.mobile.dialogHashKey) > -1 && this.activePage && !this.activePage.hasClass("ui-dialog") && e.mobile.navigate.history.activeIndex > 0 && (u.changeHash = !1, E = !0), h = m.url || "", h += !E && h.indexOf("#") > -1 ? e.mobile.dialogHashKey : "#" + e.mobile.dialogHashKey, 0 === e.mobile.navigate.history.activeIndex && h === e.mobile.navigate.history.initialDst && (h += e.mobile.dialogHashKey)), S = m ? t.jqmData("title") || t.children(":jqmData(role='header')").find(".ui-title").text() : b, S && b === n.title && (b = S), t.jqmData("title") || t.jqmData("title", b), u.transition = u.transition || (y && !g ? m.transition : r) || (w ? e.mobile.defaultDialogTransition : e.mobile.defaultPageTransition), !y && E && (e.mobile.navigate.history.getActive().pageUrl = p), h && !u.fromHashChange && (!e.mobile.path.isPath(h) && h.indexOf("#") < 0 && (h = "#" + h), x = {
                            transition: u.transition,
                            title: b,
                            pageUrl: p,
                            role: u.role
                        }, u.changeHash !== !1 && e.mobile.hashListeningEnabled ? e.mobile.navigate(h, x, !0) : t[0] !== e.mobile.firstPage[0] && e.mobile.navigate.history.add(h, x)), n.title = b, e.mobile.activePage = t, this.activePage = t, u.reverse = u.reverse || 0 > y, T = e.Deferred(), this._cssTransition(t, l, {
                            transition: u.transition,
                            reverse: u.reverse,
                            deferred: T
                        }), T.done(e.proxy(function(n, r, i, s, f) {
                            e.mobile.removeActiveLinkClass(), u.duplicateCachedPage && u.duplicateCachedPage.remove(), f || e.mobile.focusPage(t), this._releaseTransitionLock(), this.element.trigger("pagechange", o), this._triggerWithDeprecated("transition", o)
                        }, this))
                    }
                },
                _findBaseWithDefault: function() {
                    var t = this.activePage && e.mobile.getClosestBaseUrl(this.activePage);
                    return t || e.mobile.path.documentBase.hrefNoHash
                }
            }), e.mobile.navreadyDeferred = e.Deferred();
            var i = [],
                s = !1
        }(e),
        function(e, n) {
            function r(e) {
                for (; e && ("string" != typeof e.nodeName || "a" !== e.nodeName.toLowerCase());) e = e.parentNode;
                return e
            }
            var i = e.Deferred(),
                s = e.mobile.path.documentUrl,
                o = null;
            e.mobile.loadPage = function(t, n) {
                var r;
                return n = n || {}, r = n.pageContainer || e.mobile.pageContainer, n.deferred = e.Deferred(), r.pagecontainer("load", t, n), n.deferred.promise()
            }, e.mobile.back = function() {
                var n = t.navigator;
                this.phonegapNavigationEnabled && n && n.app && n.app.backHistory ? n.app.backHistory() : e.mobile.pageContainer.pagecontainer("back")
            }, e.mobile.focusPage = function(e) {
                var t = e.find("[autofocus]"),
                    n = e.find(".ui-title:eq(0)");
                return t.length ? (t.focus(), void 0) : (n.length ? n.focus() : e.focus(), void 0)
            }, e.mobile._maybeDegradeTransition = e.mobile._maybeDegradeTransition || function(e) {
                return e
            }, e.fn.animationComplete = function(t) {
                return e.support.cssTransitions ? e(this).one("webkitAnimationEnd animationend", t) : (setTimeout(t, 0), e(this))
            }, e.mobile.changePage = function(t, n) {
                e.mobile.pageContainer.pagecontainer("change", t, n)
            }, e.mobile.changePage.defaults = {
                transition: n,
                reverse: !1,
                changeHash: !0,
                fromHashChange: !1,
                role: n,
                duplicateCachedPage: n,
                pageContainer: n,
                showLoadMsg: !0,
                dataUrl: n,
                fromPage: n,
                allowSamePageTransition: !1
            }, e.mobile._registerInternalEvents = function() {
                var i = function(t, n) {
                    var r, i, u, l, c = !0;
                    return !e.mobile.ajaxEnabled || t.is(":jqmData(ajax='false')") || !t.jqmHijackable().length || t.attr("target") ? !1 : (r = o && o.attr("formaction") || t.attr("action"), l = (t.attr("method") || "get").toLowerCase(), r || (r = e.mobile.getClosestBaseUrl(t), "get" === l && (r = e.mobile.path.parseUrl(r).hrefNoSearch), r === e.mobile.path.documentBase.hrefNoHash && (r = s.hrefNoSearch)), r = e.mobile.path.makeUrlAbsolute(r, e.mobile.getClosestBaseUrl(t)), e.mobile.path.isExternal(r) && !e.mobile.path.isPermittedCrossDomainRequest(s, r) ? !1 : (n || (i = t.serializeArray(), o && o[0].form === t[0] && (u = o.attr("name"), u && (e.each(i, function(e, t) {
                        return t.name === u ? (u = "", !1) : void 0
                    }), u && i.push({
                        name: u,
                        value: o.attr("value")
                    }))), c = {
                        url: r,
                        options: {
                            type: l,
                            data: e.param(i),
                            transition: t.jqmData("transition"),
                            reverse: "reverse" === t.jqmData("direction"),
                            reloadPage: !0
                        }
                    }), c))
                };
                e.mobile.document.delegate("form", "submit", function(t) {
                    var n;
                    t.isDefaultPrevented() || (n = i(e(this)), n && (e.mobile.changePage(n.url, n.options), t.preventDefault()))
                }), e.mobile.document.bind("vclick", function(t) {
                    var n, s, u = t.target,
                        f = !1;
                    if (!(t.which > 1) && e.mobile.linkBindingEnabled) {
                        if (o = e(u), e.data(u, "mobile-button")) {
                            if (!i(e(u).closest("form"), !0)) return;
                            u.parentNode && (u = u.parentNode)
                        } else {
                            if (u = r(u), !u || "#" === e.mobile.path.parseUrl(u.getAttribute("href") || "#").hash) return;
                            if (!e(u).jqmHijackable().length) return
                        }~u.className.indexOf("ui-link-inherit") ? u.parentNode && (s = e.data(u.parentNode, "buttonElements")) : s = e.data(u, "buttonElements"), s ? u = s.outer : f = !0, n = e(u), f && (n = n.closest(".ui-btn")), n.length > 0 && !n.hasClass("ui-state-disabled") && (e.mobile.removeActiveLinkClass(!0), e.mobile.activeClickedLink = n, e.mobile.activeClickedLink.addClass(e.mobile.activeBtnClass))
                    }
                }), e.mobile.document.bind("click", function(i) {
                    if (e.mobile.linkBindingEnabled && !i.isDefaultPrevented()) {
                        var o, u, l, h, p, v, m, g = r(i.target),
                            y = e(g),
                            w = function() {
                                t.setTimeout(function() {
                                    e.mobile.removeActiveLinkClass(!0)
                                }, 200)
                            };
                        if (e.mobile.activeClickedLink && e.mobile.activeClickedLink[0] === i.target.parentNode && w(), g && !(i.which > 1) && y.jqmHijackable().length) {
                            if (y.is(":jqmData(rel='back')")) return e.mobile.back(), !1;
                            if (o = e.mobile.getClosestBaseUrl(y), u = e.mobile.path.makeUrlAbsolute(y.attr("href") || "#", o), !e.mobile.ajaxEnabled && !e.mobile.path.isEmbeddedPage(u)) return w(), void 0;
                            if (-1 !== u.search("#")) {
                                if (u = u.replace(/[^#]*#/, ""), !u) return i.preventDefault(), void 0;
                                u = e.mobile.path.isPath(u) ? e.mobile.path.makeUrlAbsolute(u, o) : e.mobile.path.makeUrlAbsolute("#" + u, s.hrefNoHash)
                            }
                            if (l = y.is("[rel='external']") || y.is(":jqmData(ajax='false')") || y.is("[target]"), h = l || e.mobile.path.isExternal(u) && !e.mobile.path.isPermittedCrossDomainRequest(s, u)) return w(), void 0;
                            p = y.jqmData("transition"), v = "reverse" === y.jqmData("direction") || y.jqmData("back"), m = y.attr("data-" + e.mobile.ns + "rel") || n, e.mobile.changePage(u, {
                                transition: p,
                                reverse: v,
                                role: m,
                                link: y
                            }), i.preventDefault()
                        }
                    }
                }), e.mobile.document.delegate(".ui-page", "pageshow.prefetch", function() {
                    var t = [];
                    e(this).find("a:jqmData(prefetch)").each(function() {
                        var n = e(this),
                            r = n.attr("href");
                        r && -1 === e.inArray(r, t) && (t.push(r), e.mobile.loadPage(r, {
                            role: n.attr("data-" + e.mobile.ns + "rel"),
                            prefetch: !0
                        }))
                    })
                }), e.mobile.pageContainer.pagecontainer(), e.mobile.document.bind("pageshow", e.mobile.resetActivePageHeight), e.mobile.window.bind("throttledresize", e.mobile.resetActivePageHeight)
            }, e(function() {
                i.resolve()
            }), e.when(i, e.mobile.navreadyDeferred).done(function() {
                e.mobile._registerInternalEvents()
            })
        }(e),
        function(e, t) {
            e.mobile.Transition = function() {
                this.init.apply(this, arguments)
            }, e.extend(e.mobile.Transition.prototype, {
                toPreClass: " ui-page-pre-in",
                init: function(t, n, r, i) {
                    e.extend(this, {
                        name: t,
                        reverse: n,
                        $to: r,
                        $from: i,
                        deferred: new e.Deferred
                    })
                },
                cleanFrom: function() {
                    this.$from.removeClass(e.mobile.activePageClass + " out in reverse " + this.name).height("")
                },
                beforeDoneIn: function() {},
                beforeDoneOut: function() {},
                beforeStartOut: function() {},
                doneIn: function() {
                    this.beforeDoneIn(), this.$to.removeClass("out in reverse " + this.name).height(""), this.toggleViewportClass(), e.mobile.window.scrollTop() !== this.toScroll && this.scrollPage(), this.sequential || this.$to.addClass(e.mobile.activePageClass), this.deferred.resolve(this.name, this.reverse, this.$to, this.$from, !0)
                },
                doneOut: function(e, t, n, r) {
                    this.beforeDoneOut(), this.startIn(e, t, n, r)
                },
                hideIn: function(e) {
                    this.$to.css("z-index", -10), e.call(this), this.$to.css("z-index", "")
                },
                scrollPage: function() {
                    e.event.special.scrollstart.enabled = !1, (e.mobile.hideUrlBar || this.toScroll !== e.mobile.defaultHomeScroll) && t.scrollTo(0, this.toScroll), setTimeout(function() {
                        e.event.special.scrollstart.enabled = !0
                    }, 150)
                },
                startIn: function(t, n, r, i) {
                    this.hideIn(function() {
                        this.$to.addClass(e.mobile.activePageClass + this.toPreClass), i || e.mobile.focusPage(this.$to), this.$to.height(t + this.toScroll), r || this.scrollPage()
                    }), r || this.$to.animationComplete(e.proxy(function() {
                        this.doneIn()
                    }, this)), this.$to.removeClass(this.toPreClass).addClass(this.name + " in " + n), r && this.doneIn()
                },
                startOut: function(t, n, r) {
                    this.beforeStartOut(t, n, r), this.$from.height(t + e.mobile.window.scrollTop()).addClass(this.name + " out" + n)
                },
                toggleViewportClass: function() {
                    e.mobile.pageContainer.toggleClass("ui-mobile-viewport-transitioning viewport-" + this.name)
                },
                transition: function() {
                    var t = this.reverse ? " reverse" : "",
                        n = e.mobile.getScreenHeight(),
                        r = e.mobile.maxTransitionWidth !== !1 && e.mobile.window.width() > e.mobile.maxTransitionWidth,
                        i = !e.support.cssTransitions || !e.support.cssAnimations || r || !this.name || "none" === this.name || Math.max(e.mobile.window.scrollTop(), this.toScroll) > e.mobile.getMaxScrollForTransition();
                    return this.toScroll = e.mobile.navigate.history.getActive().lastScroll || e.mobile.defaultHomeScroll, this.toggleViewportClass(), this.$from && !i ? this.startOut(n, t, i) : this.doneOut(n, t, i, !0), this.deferred.promise()
                }
            })
        }(e, this),
        function(e) {
            e.mobile.SerialTransition = function() {
                this.init.apply(this, arguments)
            }, e.extend(e.mobile.SerialTransition.prototype, e.mobile.Transition.prototype, {
                sequential: !0,
                beforeDoneOut: function() {
                    this.$from && this.cleanFrom()
                },
                beforeStartOut: function(t, n, r) {
                    this.$from.animationComplete(e.proxy(function() {
                        this.doneOut(t, n, r)
                    }, this))
                }
            })
        }(e),
        function(e) {
            e.mobile.ConcurrentTransition = function() {
                this.init.apply(this, arguments)
            }, e.extend(e.mobile.ConcurrentTransition.prototype, e.mobile.Transition.prototype, {
                sequential: !1,
                beforeDoneIn: function() {
                    this.$from && this.cleanFrom()
                },
                beforeStartOut: function(e, t, n) {
                    this.doneOut(e, t, n)
                }
            })
        }(e),
        function(e) {
            var t = function() {
                return 3 * e.mobile.getScreenHeight()
            };
            e.mobile.transitionHandlers = {
                sequential: e.mobile.SerialTransition,
                simultaneous: e.mobile.ConcurrentTransition
            }, e.mobile.defaultTransitionHandler = e.mobile.transitionHandlers.sequential, e.mobile.transitionFallbacks = {}, e.mobile._maybeDegradeTransition = function(t) {
                return t && !e.support.cssTransform3d && e.mobile.transitionFallbacks[t] && (t = e.mobile.transitionFallbacks[t]), t
            }, e.mobile.getMaxScrollForTransition = e.mobile.getMaxScrollForTransition || t
        }(e),
        function(e) {
            e.mobile.transitionFallbacks.flip = "fade"
        }(e, this),
        function(e) {
            e.mobile.transitionFallbacks.flow = "fade"
        }(e, this),
        function(e) {
            e.mobile.transitionFallbacks.pop = "fade"
        }(e, this),
        function(e) {
            e.mobile.transitionHandlers.slide = e.mobile.transitionHandlers.simultaneous, e.mobile.transitionFallbacks.slide = "fade"
        }(e, this),
        function(e) {
            e.mobile.transitionFallbacks.slidedown = "fade"
        }(e, this),
        function(e) {
            e.mobile.transitionFallbacks.slidefade = "fade"
        }(e, this),
        function(e) {
            e.mobile.transitionFallbacks.slideup = "fade"
        }(e, this),
        function(e) {
            e.mobile.transitionFallbacks.turn = "fade"
        }(e, this),
        function(e) {
            e.mobile.degradeInputs = {
                color: !1,
                date: !1,
                datetime: !1,
                "datetime-local": !1,
                email: !1,
                month: !1,
                number: !1,
                range: "number",
                search: "text",
                tel: !1,
                time: !1,
                url: !1,
                week: !1
            }, e.mobile.page.prototype.options.degradeInputs = e.mobile.degradeInputs, e.mobile.degradeInputsWithin = function(t) {
                t = e(t), t.find("input").not(e.mobile.page.prototype.keepNativeSelector()).each(function() {
                    var t, n, r, i, s = e(this),
                        o = this.getAttribute("type"),
                        u = e.mobile.degradeInputs[o] || "text";
                    e.mobile.degradeInputs[o] && (t = e("<div>").html(s.clone()).html(), n = t.indexOf(" type=") > -1, r = n ? /\s+type=["']?\w+['"]?/ : /\/?>/, i = ' type="' + u + '" data-' + e.mobile.ns + 'type="' + o + '"' + (n ? "" : ">"), s.replaceWith(t.replace(r, i)))
                })
            }
        }(e),
        function(e, t, n) {
            e.widget("mobile.page", e.mobile.page, {
                options: {
                    closeBtn: "left",
                    closeBtnText: "Close",
                    overlayTheme: "a",
                    corners: !0,
                    dialog: !1
                },
                _create: function() {
                    this._super(), this.options.dialog && (e.extend(this, {
                        _inner: this.element.children(),
                        _headerCloseButton: null
                    }), this.options.enhanced || this._setCloseBtn(this.options.closeBtn))
                },
                _enhance: function() {
                    this._super(), this.options.dialog && this.element.addClass("ui-dialog").wrapInner(e("<div/>", {
                        role: "dialog",
                        "class": "ui-dialog-contain ui-overlay-shadow" + (this.options.corners ? " ui-corner-all" : "")
                    }))
                },
                _setOptions: function(t) {
                    var r, i, s = this.options;
                    t.corners !== n && this._inner.toggleClass("ui-corner-all", !!t.corners), t.overlayTheme !== n && e.mobile.activePage[0] === this.element[0] && (s.overlayTheme = t.overlayTheme, this._handlePageBeforeShow()), t.closeBtnText !== n && (r = s.closeBtn, i = t.closeBtnText), t.closeBtn !== n && (r = t.closeBtn), r && this._setCloseBtn(r, i), this._super(t)
                },
                _handlePageBeforeShow: function() {
                    this.options.overlayTheme && this.options.dialog ? (this.removeContainerBackground(), this.setContainerBackground(this.options.overlayTheme)) : this._super()
                },
                _setCloseBtn: function(t, n) {
                    var r, i = this._headerCloseButton;
                    t = "left" === t ? "left" : "right" === t ? "right" : "none", "none" === t ? i && (i.remove(), i = null) : i ? (i.removeClass("ui-btn-left ui-btn-right").addClass("ui-btn-" + t), n && i.text(n)) : (r = this._inner.find(":jqmData(role='header')").first(), i = e("<a></a>", {
                        href: "#",
                        "class": "ui-btn ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-" + t
                    }).attr("data-" + e.mobile.ns + "rel", "back").text(n || this.options.closeBtnText || "").prependTo(r), this._on(i, {
                        click: "close"
                    })), this._headerCloseButton = i
                }
            })
        }(e, this),
        function(e, t, n) {
            e.widget("mobile.dialog", {
                options: {
                    closeBtn: "left",
                    closeBtnText: "Close",
                    overlayTheme: "a",
                    corners: !0
                },
                _handlePageBeforeShow: function() {
                    this._isCloseable = !0, this.options.overlayTheme && this.element.page("removeContainerBackground").page("setContainerBackground", this.options.overlayTheme)
                },
                _handlePageBeforeHide: function() {
                    this._isCloseable = !1
                },
                _handleVClickSubmit: function(t) {
                    var n, r = e(t.target).closest("vclick" === t.type ? "a" : "form");
                    r.length && !r.jqmData("transition") && (n = {}, n["data-" + e.mobile.ns + "transition"] = (e.mobile.navigate.history.getActive() || {}).transition || e.mobile.defaultDialogTransition, n["data-" + e.mobile.ns + "direction"] = "reverse", r.attr(n))
                },
                _create: function() {
                    var t = this.element,
                        n = this.options;
                    t.addClass("ui-dialog").wrapInner(e("<div/>", {
                        role: "dialog",
                        "class": "ui-dialog-contain ui-overlay-shadow" + (n.corners ? " ui-corner-all" : "")
                    })), e.extend(this, {
                        _isCloseable: !1,
                        _inner: t.children(),
                        _headerCloseButton: null
                    }), this._on(t, {
                        vclick: "_handleVClickSubmit",
                        submit: "_handleVClickSubmit",
                        pagebeforeshow: "_handlePageBeforeShow",
                        pagebeforehide: "_handlePageBeforeHide"
                    }), this._setCloseBtn(n.closeBtn)
                },
                _setOptions: function(t) {
                    var r, i, s = this.options;
                    t.corners !== n && this._inner.toggleClass("ui-corner-all", !!t.corners), t.overlayTheme !== n && e.mobile.activePage[0] === this.element[0] && (s.overlayTheme = t.overlayTheme, this._handlePageBeforeShow()), t.closeBtnText !== n && (r = s.closeBtn, i = t.closeBtnText), t.closeBtn !== n && (r = t.closeBtn), r && this._setCloseBtn(r, i), this._super(t)
                },
                _setCloseBtn: function(t, n) {
                    var r, i = this._headerCloseButton;
                    t = "left" === t ? "left" : "right" === t ? "right" : "none", "none" === t ? i && (i.remove(), i = null) : i ? (i.removeClass("ui-btn-left ui-btn-right").addClass("ui-btn-" + t), n && i.text(n)) : (r = this._inner.find(":jqmData(role='header')").first(), i = e("<a></a>", {
                        role: "button",
                        href: "#",
                        "class": "ui-btn ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-" + t
                    }).text(n || this.options.closeBtnText || "").prependTo(r), this._on(i, {
                        click: "close"
                    })), this._headerCloseButton = i
                },
                close: function() {
                    var t = e.mobile.navigate.history;
                    this._isCloseable && (this._isCloseable = !1, e.mobile.hashListeningEnabled && t.activeIndex > 0 ? e.mobile.back() : e.mobile.pageContainer.pagecontainer("back"))
                }
            })
        }(e, this),
        function(e, t) {
            var n = /([A-Z])/g;
            e.widget("mobile.collapsible", {
                options: {
                    enhanced: !1,
                    expandCueText: null,
                    collapseCueText: null,
                    collapsed: !0,
                    heading: "h1,h2,h3,h4,h5,h6,legend",
                    collapsedIcon: null,
                    expandedIcon: null,
                    iconpos: null,
                    theme: null,
                    contentTheme: null,
                    inset: null,
                    corners: null,
                    mini: null
                },
                _create: function() {
                    var t = this.element,
                        n = {
                            accordion: t.closest(":jqmData(role='collapsible-set')" + (e.mobile.collapsibleset ? ", :mobile-collapsibleset" : "")).addClass("ui-collapsible-set")
                        };
                    e.extend(this, {
                        _ui: n
                    }), this.options.enhanced ? (n.heading = e(".ui-collapsible-heading", this.element[0]), n.content = n.heading.next(), n.anchor = e("a", n.heading[0]).first(), n.status = n.anchor.children(".ui-collapsible-heading-status")) : this._enhance(t, n), this._on(n.heading, {
                        tap: function() {
                            n.heading.find("a").first().addClass(e.mobile.activeBtnClass)
                        },
                        click: function(e) {
                            this._handleExpandCollapse(!n.heading.hasClass("ui-collapsible-heading-collapsed")), e.preventDefault(), e.stopPropagation()
                        }
                    })
                },
                _getOptions: function(t) {
                    var r, i = this._ui.accordion,
                        s = this._ui.accordionWidget;
                    t = e.extend({}, t), i.length && !s && (this._ui.accordionWidget = s = i.data("mobile-collapsibleset"));
                    for (r in t) t[r] = null != t[r] ? t[r] : s ? s.options[r] : i.length ? e.mobile.getAttribute(i[0], r.replace(n, "-$1").toLowerCase()) : null, null == t[r] && (t[r] = e.mobile.collapsible.defaults[r]);
                    return t
                },
                _themeClassFromOption: function(e, t) {
                    return t ? "none" === t ? "" : e + t : ""
                },
                _enhance: function(t, n) {
                    var r, i = this._getOptions(this.options),
                        s = this._themeClassFromOption("ui-body-", i.contentTheme);
                    return t.addClass("ui-collapsible " + (i.inset ? "ui-collapsible-inset " : "") + (i.inset && i.corners ? "ui-corner-all " : "") + (s ? "ui-collapsible-themed-content " : "")), n.originalHeading = t.children(this.options.heading).first(), n.content = t.wrapInner("<div class='ui-collapsible-content " + s + "'></div>").children(".ui-collapsible-content"), n.heading = n.originalHeading, n.heading.is("legend") && (n.heading = e("<div role='heading'>" + n.heading.html() + "</div>"), n.placeholder = e("<div><!-- placeholder for legend --></div>").insertBefore(n.originalHeading), n.originalHeading.remove()), r = i.collapsed ? i.collapsedIcon ? "ui-icon-" + i.collapsedIcon : "" : i.expandedIcon ? "ui-icon-" + i.expandedIcon : "", n.status = e("<span class='ui-collapsible-heading-status'></span>"), n.anchor = n.heading.detach().addClass("ui-collapsible-heading").append(n.status).wrapInner("<a href='#' class='ui-collapsible-heading-toggle'></a>").find("a").first().addClass("ui-btn " + (r ? r + " " : "") + (r ? "ui-btn-icon-" + ("right" === i.iconpos ? "right" : "left") + " " : "") + this._themeClassFromOption("ui-btn-", i.theme) + " " + (i.mini ? "ui-mini " : "")), n.heading.insertBefore(n.content), this._handleExpandCollapse(this.options.collapsed), n
                },
                refresh: function() {
                    var t, n = {};
                    for (t in e.mobile.collapsible.defaults) n[t] = this.options[t];
                    this._setOptions(n)
                },
                _setOptions: function(e) {
                    var n, r, i, s, o = this.element,
                        u = this._getOptions(this.options),
                        a = this._ui,
                        f = a.anchor,
                        l = a.status,
                        c = this._getOptions(e);
                    e.collapsed !== t && this._handleExpandCollapse(e.collapsed), n = o.hasClass("ui-collapsible-collapsed"), n ? (c.expandCueText !== t && l.text(c.expandCueText), c.collapsedIcon !== t && (u.collapsedIcon && f.removeClass("ui-icon-" + u.collapsedIcon), c.collapsedIcon && f.addClass("ui-icon-" + c.collapsedIcon))) : (c.collapseCueText !== t && l.text(c.collapseCueText), c.expandedIcon !== t && (u.expandedIcon && f.removeClass("ui-icon-" + u.expandedIcon), c.expandedIcon && f.addClass("ui-icon-" + c.expandedIcon))), c.iconpos !== t && (f.removeClass("ui-btn-icon-" + ("right" === u.iconPos ? "right" : "left")), f.addClass("ui-btn-icon-" + ("right" === c.iconPos ? "right" : "left"))), c.theme !== t && (i = this._themeClassFromOption("ui-btn-", u.theme), r = this._themeClassFromOption("ui-btn-", c.theme), f.removeClass(i).addClass(r)), c.contentTheme !== t && (i = this._themeClassFromOption("ui-body-", u.theme), r = this._themeClassFromOption("ui-body-", c.theme), a.content.removeClass(i).addClass(r)), c.inset !== t && (o.toggleClass("ui-collapsible-inset", c.inset), s = !(!c.inset || !c.corners && !u.corners)), c.corners !== t && (s = !(!c.corners || !c.inset && !u.inset)), s !== t && o.toggleClass("ui-corner-all", s), c.mini !== t && f.toggleClass("ui-mini", c.mini), this._super(e)
                },
                _handleExpandCollapse: function(t) {
                    var n = this._getOptions(this.options),
                        r = this._ui;
                    r.status.text(t ? n.expandCueText : n.collapseCueText), r.heading.toggleClass("ui-collapsible-heading-collapsed", t).find("a").first().toggleClass("ui-icon-" + n.expandedIcon, !t).toggleClass("ui-icon-" + n.collapsedIcon, t || n.expandedIcon === n.collapsedIcon).removeClass(e.mobile.activeBtnClass), this.element.toggleClass("ui-collapsible-collapsed", t), r.content.toggleClass("ui-collapsible-content-collapsed", t).attr("aria-hidden", t).trigger("updatelayout"), this.options.collapsed = t, this._trigger(t ? "collapse" : "expand")
                },
                expand: function() {
                    this._handleExpandCollapse(!1)
                },
                collapse: function() {
                    this._handleExpandCollapse(!0)
                },
                _destroy: function() {
                    var e = this._ui,
                        t = this.options;
                    t.enhanced || (e.placeholder ? (e.originalHeading.insertBefore(e.placeholder), e.placeholder.remove(), e.heading.remove()) : (e.status.remove(), e.heading.removeClass("ui-collapsible-heading ui-collapsible-heading-collapsed").children().contents().unwrap()), e.anchor.contents().unwrap(), e.content.contents().unwrap(), this.element.removeClass("ui-collapsible ui-collapsible-collapsed ui-collapsible-themed-content ui-collapsible-inset ui-corner-all"))
                }
            }), e.mobile.collapsible.defaults = {
                expandCueText: " click to expand contents",
                collapseCueText: " click to collapse contents",
                collapsedIcon: "plus",
                contentTheme: "inherit",
                expandedIcon: "minus",
                iconpos: "left",
                inset: !0,
                corners: !0,
                theme: "inherit",
                mini: !1
            }
        }(e),
        function(e) {
            e.mobile.behaviors.addFirstLastClasses = {
                _getVisibles: function(e, t) {
                    var n;
                    return t ? n = e.not(".ui-screen-hidden") : (n = e.filter(":visible"), 0 === n.length && (n = e.not(".ui-screen-hidden"))), n
                },
                _addFirstLastClasses: function(e, t, n) {
                    e.removeClass("ui-first-child ui-last-child"), t.eq(0).addClass("ui-first-child").end().last().addClass("ui-last-child"), n || this.element.trigger("updatelayout")
                },
                _removeFirstLastClasses: function(e) {
                    e.removeClass("ui-first-child ui-last-child")
                }
            }
        }(e),
        function(e, t) {
            var n = ":mobile-collapsible, " + e.mobile.collapsible.initSelector;
            e.widget("mobile.collapsibleset", e.extend({
                initSelector: ":jqmData(role='collapsible-set'),:jqmData(role='collapsibleset')",
                options: e.extend({
                    enhanced: !1
                }, e.mobile.collapsible.defaults),
                _handleCollapsibleExpand: function(t) {
                    var n = e(t.target).closest(".ui-collapsible");
                    n.parent().is(":mobile-collapsibleset, :jqmData(role='collapsible-set')") && n.siblings(".ui-collapsible:not(.ui-collapsible-collapsed)").collapsible("collapse")
                },
                _create: function() {
                    var t = this.element,
                        n = this.options;
                    e.extend(this, {
                        _classes: ""
                    }), n.enhanced || (t.addClass("ui-collapsible-set " + this._themeClassFromOption("ui-group-theme-", n.theme) + " " + (n.corners && n.inset ? "ui-corner-all " : "")), this.element.find(e.mobile.collapsible.initSelector).collapsible()), this._on(t, {
                        collapsibleexpand: "_handleCollapsibleExpand"
                    })
                },
                _themeClassFromOption: function(e, t) {
                    return t ? "none" === t ? "" : e + t : ""
                },
                _init: function() {
                    this._refresh(!0), this.element.children(n).filter(":jqmData(collapsed='false')").collapsible("expand")
                },
                _setOptions: function(e) {
                    var n, r, i = this.element,
                        s = this._themeClassFromOption("ui-group-theme-", e.theme);
                    return s && i.removeClass(this._themeClassFromOption("ui-group-theme-", this.options.theme)).addClass(s), e.inset !== t && (r = !(!e.inset || !e.corners && !this.options.corners)), e.corners !== t && (r = !(!e.corners || !e.inset && !this.options.inset)), r !== t && i.toggleClass("ui-corner-all", r), n = this._super(e), this.element.children(":mobile-collapsible").collapsible("refresh"), n
                },
                _destroy: function() {
                    var e = this.element;
                    this._removeFirstLastClasses(e.children(n)), e.removeClass("ui-collapsible-set ui-corner-all " + this._themeClassFromOption("ui-group-theme-", this.options.theme)).children(":mobile-collapsible").collapsible("destroy")
                },
                _refresh: function(t) {
                    var r = this.element.children(n);
                    this.element.find(e.mobile.collapsible.initSelector).not(".ui-collapsible").collapsible(), this._addFirstLastClasses(r, this._getVisibles(r, t), t)
                },
                refresh: function() {
                    this._refresh(!1)
                }
            }, e.mobile.behaviors.addFirstLastClasses))
        }(e),
        function(e) {
            e.fn.fieldcontain = function() {
                return this.addClass("ui-field-contain")
            }
        }(e),
        function(e) {
            e.fn.grid = function(t) {
                return this.each(function() {
                    var n, r, i = e(this),
                        s = e.extend({
                            grid: null
                        }, t),
                        o = i.children(),
                        u = {
                            solo: 1,
                            a: 2,
                            b: 3,
                            c: 4,
                            d: 5
                        },
                        f = s.grid;
                    if (!f)
                        if (o.length <= 5)
                            for (r in u) u[r] === o.length && (f = r);
                        else f = "a", i.addClass("ui-grid-duo");
                    n = u[f], i.addClass("ui-grid-" + f), o.filter(":nth-child(" + n + "n+1)").addClass("ui-block-a"), n > 1 && o.filter(":nth-child(" + n + "n+2)").addClass("ui-block-b"), n > 2 && o.filter(":nth-child(" + n + "n+3)").addClass("ui-block-c"), n > 3 && o.filter(":nth-child(" + n + "n+4)").addClass("ui-block-d"), n > 4 && o.filter(":nth-child(" + n + "n+5)").addClass("ui-block-e")
                })
            }
        }(e),
        function(e, t) {
            e.widget("mobile.navbar", {
                options: {
                    iconpos: "top",
                    grid: null
                },
                _create: function() {
                    var r = this.element,
                        i = r.find("a"),
                        s = i.filter(":jqmData(icon)").length ? this.options.iconpos : t;
                    r.addClass("ui-navbar").attr("role", "navigation").find("ul").jqmEnhanceable().grid({
                        grid: this.options.grid
                    }), i.each(function() {
                        var t = e.mobile.getAttribute(this, "icon"),
                            n = e.mobile.getAttribute(this, "theme"),
                            r = "ui-btn";
                        n && (r += " ui-btn-" + n), t && (r += " ui-icon-" + t + " ui-btn-icon-" + s), e(this).addClass(r)
                    }), r.delegate("a", "vclick", function() {
                        var t = e(this);
                        t.hasClass("ui-state-disabled") || t.hasClass("ui-disabled") || t.hasClass(e.mobile.activeBtnClass) || (i.removeClass(e.mobile.activeBtnClass), t.addClass(e.mobile.activeBtnClass), e(n).one("pagehide", function() {
                            t.removeClass(e.mobile.activeBtnClass)
                        }))
                    }), r.closest(".ui-page").bind("pagebeforeshow", function() {
                        i.filter(".ui-state-persist").addClass(e.mobile.activeBtnClass)
                    })
                }
            })
        }(e),
        function(e) {
            var t = e.mobile.getAttribute;
            e.widget("mobile.listview", e.extend({
                options: {
                    theme: null,
                    countTheme: null,
                    dividerTheme: null,
                    icon: "carat-r",
                    splitIcon: "carat-r",
                    splitTheme: null,
                    corners: !0,
                    shadow: !0,
                    inset: !1
                },
                _create: function() {
                    var e = this,
                        t = "";
                    t += e.options.inset ? " ui-listview-inset" : "", e.options.inset && (t += e.options.corners ? " ui-corner-all" : "", t += e.options.shadow ? " ui-shadow" : ""), e.element.addClass(" ui-listview" + t), e.refresh(!0)
                },
                _findFirstElementByTagName: function(e, t, n, r) {
                    var i = {};
                    for (i[n] = i[r] = !0; e;) {
                        if (i[e.nodeName]) return e;
                        e = e[t]
                    }
                    return null
                },
                _addThumbClasses: function(t) {
                    var n, r, i = t.length;
                    for (n = 0; i > n; n++) r = e(this._findFirstElementByTagName(t[n].firstChild, "nextSibling", "img", "IMG")), r.length && e(this._findFirstElementByTagName(r[0].parentNode, "parentNode", "li", "LI")).addClass(r.hasClass("ui-li-icon") ? "ui-li-has-icon" : "ui-li-has-thumb")
                },
                _getChildrenByTagName: function(t, n, r) {
                    var i = [],
                        s = {};
                    for (s[n] = s[r] = !0, t = t.firstChild; t;) s[t.nodeName] && i.push(t), t = t.nextSibling;
                    return e(i)
                },
                _beforeListviewRefresh: e.noop,
                _afterListviewRefresh: e.noop,
                refresh: function(n) {
                    var r, i, s, o, u, f, l, c, h, p, d, v, m, g, y, w, E, S, x, T, N = this.options,
                        C = this.element,
                        k = !!e.nodeName(C[0], "ol"),
                        L = C.attr("start"),
                        A = {},
                        O = C.find(".ui-li-count"),
                        M = t(C[0], "counttheme") || this.options.countTheme,
                        _ = M ? "ui-body-" + M : "ui-body-inherit";
                    for (N.theme && C.addClass("ui-group-theme-" + N.theme), k && (L || 0 === L) && (d = parseInt(L, 10) - 1, C.css("counter-reset", "listnumbering " + d)), this._beforeListviewRefresh(), T = this._getChildrenByTagName(C[0], "li", "LI"), i = 0, s = T.length; s > i; i++) o = T.eq(i), u = "", (n || o[0].className.search(/\bui-li-static\b|\bui-li-divider\b/) < 0) && (h = this._getChildrenByTagName(o[0], "a", "A"), p = "list-divider" === t(o[0], "role"), m = o.attr("value"), f = t(o[0], "theme"), h.length && h[0].className.search(/\bui-btn\b/) < 0 && !p ? (l = t(o[0], "icon"), c = l === !1 ? !1 : l || N.icon, h.removeClass("ui-link"), r = "ui-btn", f && (r += " ui-btn-" + f), h.length > 1 ? (u = "ui-li-has-alt", g = h.last(), y = t(g[0], "theme") || N.splitTheme || t(o[0], "theme", !0), w = y ? " ui-btn-" + y : "", E = t(g[0], "icon") || t(o[0], "icon") || N.splitIcon, S = "ui-btn ui-btn-icon-notext ui-icon-" + E + w, g.attr("title", e.trim(g.getEncodedText())).addClass(S).empty()) : c && (r += " ui-btn-icon-right ui-icon-" + c), h.first().addClass(r)) : p ? (x = t(o[0], "theme") || N.dividerTheme || N.theme, u = "ui-li-divider ui-bar-" + (x ? x : "inherit"), o.attr("role", "heading")) : h.length <= 0 && (u = "ui-li-static ui-body-" + (f ? f : "inherit")), k && m && (v = parseInt(m, 10) - 1, o.css("counter-reset", "listnumbering " + v))), A[u] || (A[u] = []), A[u].push(o[0]);
                    for (u in A) e(A[u]).addClass(u);
                    O.each(function() {
                        e(this).closest("li").addClass("ui-li-has-count")
                    }), _ && O.addClass(_), this._addThumbClasses(T), this._addThumbClasses(T.find(".ui-btn")), this._afterListviewRefresh(), this._addFirstLastClasses(T, this._getVisibles(T, n), n)
                }
            }, e.mobile.behaviors.addFirstLastClasses))
        }(e),
        function(e) {
            function t(t) {
                var n = e.trim(t.text()) || null;
                return n ? n = n.slice(0, 1).toUpperCase() : null
            }
            e.widget("mobile.listview", e.mobile.listview, {
                options: {
                    autodividers: !1,
                    autodividersSelector: t
                },
                _beforeListviewRefresh: function() {
                    this.options.autodividers && (this._replaceDividers(), this._superApply(arguments))
                },
                _replaceDividers: function() {
                    var t, r, i, s, o, u = null,
                        f = this.element;
                    for (f.children("li:jqmData(role='list-divider')").remove(), r = f.children("li"), t = 0; t < r.length; t++) i = r[t], s = this.options.autodividersSelector(e(i)), s && u !== s && (o = n.createElement("li"), o.appendChild(n.createTextNode(s)), o.setAttribute("data-" + e.mobile.ns + "role", "list-divider"), i.parentNode.insertBefore(o, i)), u = s
                }
            })
        }(e),
        function(e) {
            var t = /(^|\s)ui-li-divider($|\s)/,
                n = /(^|\s)ui-screen-hidden($|\s)/;
            e.widget("mobile.listview", e.mobile.listview, {
                options: {
                    hideDividers: !1
                },
                _afterListviewRefresh: function() {
                    var e, r, i, s = !0;
                    if (this._superApply(arguments), this.options.hideDividers)
                        for (e = this._getChildrenByTagName(this.element[0], "li", "LI"), r = e.length - 1; r > -1; r--) i = e[r], i.className.match(t) ? (s && (i.className = i.className + " ui-screen-hidden"), s = !0) : i.className.match(n) || (s = !1)
                }
            })
        }(e),
        function(e) {
            e.mobile.nojs = function(t) {
                e(":jqmData(role='nojs')", t).addClass("ui-nojs")
            }
        }(e),
        function(e) {
            e.mobile.behaviors.formReset = {
                _handleFormReset: function() {
                    this._on(this.element.closest("form"), {
                        reset: function() {
                            this._delay("_reset")
                        }
                    })
                }
            }
        }(e),
        function(e, t) {
            e.widget("mobile.checkboxradio", e.extend({
                initSelector: "input:not( :jqmData(role='flipswitch' ) )[type='checkbox'],input[type='radio']:not( :jqmData(role='flipswitch' ))",
                options: {
                    theme: "inherit",
                    mini: !1,
                    wrapperClass: null,
                    enhanced: !1,
                    iconpos: "left"
                },
                _create: function() {
                    var t = this.element,
                        n = this.options,
                        r = function(e, t) {
                            return e.jqmData(t) || e.closest("form, fieldset").jqmData(t)
                        },
                        i = t.closest("label"),
                        s = i.length ? i : t.closest("form, fieldset, :jqmData(role='page'), :jqmData(role='dialog')").find("label").filter("[for='" + e.mobile.path.hashToSelector(t[0].id) + "']").first(),
                        o = t[0].type,
                        u = "ui-" + o + "-on",
                        f = "ui-" + o + "-off";
                    ("checkbox" === o || "radio" === o) && (this.element[0].disabled && (this.options.disabled = !0), n.iconpos = r(t, "iconpos") || s.attr("data-" + e.mobile.ns + "iconpos") || n.iconpos, n.mini = r(t, "mini") || n.mini, e.extend(this, {
                        input: t,
                        label: s,
                        parentLabel: i,
                        inputtype: o,
                        checkedClass: u,
                        uncheckedClass: f
                    }), this.options.enhanced || this._enhance(), this._on(s, {
                        vmouseover: "_handleLabelVMouseOver",
                        vclick: "_handleLabelVClick"
                    }), this._on(t, {
                        vmousedown: "_cacheVals",
                        vclick: "_handleInputVClick",
                        focus: "_handleInputFocus",
                        blur: "_handleInputBlur"
                    }), this._handleFormReset(), this.refresh())
                },
                _enhance: function() {
                    this.label.addClass("ui-btn ui-corner-all"), this.parentLabel.length > 0 ? this.input.add(this.label).wrapAll(this._wrapper()) : (this.element.wrap(this._wrapper()), this.element.parent().prepend(this.label)), this._setOptions({
                        theme: this.options.theme,
                        iconpos: this.options.iconpos,
                        mini: this.options.mini
                    })
                },
                _wrapper: function() {
                    return e("<div class='" + (this.options.wrapperClass ? this.options.wrapperClass : "") + " ui-" + this.inputtype + (this.options.disabled ? " ui-state-disabled" : "") + "' >")
                },
                _handleInputFocus: function() {
                    this.label.addClass(e.mobile.focusClass)
                },
                _handleInputBlur: function() {
                    this.label.removeClass(e.mobile.focusClass)
                },
                _handleInputVClick: function() {
                    var e = this.element;
                    e.is(":checked") ? (e.prop("checked", !0), this._getInputSet().not(e).prop("checked", !1)) : e.prop("checked", !1), this._updateAll()
                },
                _handleLabelVMouseOver: function(e) {
                    this.label.parent().hasClass("ui-state-disabled") && e.stopPropagation()
                },
                _handleLabelVClick: function(e) {
                    var t = this.element;
                    return t.is(":disabled") ? (e.preventDefault(), void 0) : (this._cacheVals(), t.prop("checked", "radio" === this.inputtype && !0 || !t.prop("checked")), t.triggerHandler("click"), this._getInputSet().not(t).prop("checked", !1), this._updateAll(), !1)
                },
                _cacheVals: function() {
                    this._getInputSet().each(function() {
                        e(this).attr("data-" + e.mobile.ns + "cacheVal", this.checked)
                    })
                },
                _getInputSet: function() {
                    return "checkbox" === this.inputtype ? this.element : this.element.closest("form, :jqmData(role='page'), :jqmData(role='dialog')").find("input[name='" + this.element[0].name + "'][type='" + this.inputtype + "']")
                },
                _updateAll: function() {
                    var t = this;
                    this._getInputSet().each(function() {
                        var n = e(this);
                        (this.checked || "checkbox" === t.inputtype) && n.trigger("change")
                    }).checkboxradio("refresh")
                },
                _reset: function() {
                    this.refresh()
                },
                _hasIcon: function() {
                    var t, n, r = e.mobile.controlgroup;
                    return r && (t = this.element.closest(":mobile-controlgroup," + r.prototype.initSelector), t.length > 0) ? (n = e.data(t[0], "mobile-controlgroup"), "horizontal" !== (n ? n.options.type : t.attr("data-" + e.mobile.ns + "type"))) : !0
                },
                refresh: function() {
                    var t = this._hasIcon(),
                        n = this.element[0].checked,
                        r = e.mobile.activeBtnClass,
                        i = "ui-btn-icon-" + this.options.iconpos,
                        s = [],
                        o = [];
                    t ? (o.push(r), s.push(i)) : (o.push(i), (n ? s : o).push(r)), n ? (s.push(this.checkedClass), o.push(this.uncheckedClass)) : (s.push(this.uncheckedClass), o.push(this.checkedClass)), this.label.addClass(s.join(" ")).removeClass(o.join(" "))
                },
                widget: function() {
                    return this.label.parent()
                },
                _setOptions: function(e) {
                    var n = this.label,
                        r = this.options,
                        i = this.widget(),
                        s = this._hasIcon();
                    e.disabled !== t && (this.input.prop("disabled", !!e.disabled), i.toggleClass("ui-state-disabled", !!e.disabled)), e.mini !== t && i.toggleClass("ui-mini", !!e.mini), e.theme !== t && n.removeClass("ui-btn-" + r.theme).addClass("ui-btn-" + e.theme), e.wrapperClass !== t && i.removeClass(r.wrapperClass).addClass(e.wrapperClass), e.iconpos !== t && s ? n.removeClass("ui-btn-icon-" + r.iconpos).addClass("ui-btn-icon-" + e.iconpos) : s || n.removeClass("ui-btn-icon-" + r.iconpos), this._super(e)
                }
            }, e.mobile.behaviors.formReset))
        }(e),
        function(e, t) {
            e.widget("mobile.button", {
                initSelector: "input[type='button'], input[type='submit'], input[type='reset']",
                options: {
                    theme: null,
                    icon: null,
                    iconpos: "left",
                    iconshadow: !1,
                    corners: !0,
                    shadow: !0,
                    inline: null,
                    mini: null,
                    wrapperClass: null,
                    enhanced: !1
                },
                _create: function() {
                    this.element.is(":disabled") && (this.options.disabled = !0), this.options.enhanced || this._enhance(), e.extend(this, {
                        wrapper: this.element.parent()
                    }), this._on({
                        focus: function() {
                            this.widget().addClass(e.mobile.focusClass)
                        },
                        blur: function() {
                            this.widget().removeClass(e.mobile.focusClass)
                        }
                    }), this.refresh(!0)
                },
                _enhance: function() {
                    this.element.wrap(this._button())
                },
                _button: function() {
                    var t = this.options,
                        n = this._getIconClasses(this.options);
                    return e("<div class='ui-btn ui-input-btn" + (t.wrapperClass ? " " + t.wrapperClass : "") + (t.theme ? " ui-btn-" + t.theme : "") + (t.corners ? " ui-corner-all" : "") + (t.shadow ? " ui-shadow" : "") + (t.inline ? " ui-btn-inline" : "") + (t.mini ? " ui-mini" : "") + (t.disabled ? " ui-state-disabled" : "") + (n ? " " + n : "") + "' >" + this.element.val() + "</div>")
                },
                widget: function() {
                    return this.wrapper
                },
                _destroy: function() {
                    this.element.insertBefore(this.button), this.button.remove()
                },
                _getIconClasses: function(e) {
                    return e.icon ? "ui-icon-" + e.icon + (e.iconshadow ? " ui-shadow-icon" : "") + " ui-btn-icon-" + e.iconpos : ""
                },
                _setOptions: function(n) {
                    var r = this.widget();
                    n.theme !== t && r.removeClass(this.options.theme).addClass("ui-btn-" + n.theme), n.corners !== t && r.toggleClass("ui-corner-all", n.corners), n.shadow !== t && r.toggleClass("ui-shadow", n.shadow), n.inline !== t && r.toggleClass("ui-btn-inline", n.inline), n.mini !== t && r.toggleClass("ui-mini", n.mini), n.disabled !== t && (this.element.prop("disabled", n.disabled), r.toggleClass("ui-state-disabled", n.disabled)), (n.icon !== t || n.iconshadow !== t || n.iconpos !== t) && r.removeClass(this._getIconClasses(this.options)).addClass(this._getIconClasses(e.extend({}, this.options, n))), this._super(n)
                },
                refresh: function(t) {
                    if (this.options.icon && "notext" === this.options.iconpos && this.element.attr("title") && this.element.attr("title", this.element.val()), !t) {
                        var n = this.element.detach();
                        e(this.wrapper).text(this.element.val()).append(n)
                    }
                }
            })
        }(e),
        function(e) {
            var t = e("meta[name=viewport]"),
                n = t.attr("content"),
                r = n + ",maximum-scale=1, user-scalable=no",
                i = n + ",maximum-scale=10, user-scalable=yes",
                s = /(user-scalable[\s]*=[\s]*no)|(maximum-scale[\s]*=[\s]*1)[$,\s]/.test(n);
            e.mobile.zoom = e.extend({}, {
                enabled: !s,
                locked: !1,
                disable: function(n) {
                    s || e.mobile.zoom.locked || (t.attr("content", r), e.mobile.zoom.enabled = !1, e.mobile.zoom.locked = n || !1)
                },
                enable: function(n) {
                    s || e.mobile.zoom.locked && n !== !0 || (t.attr("content", i), e.mobile.zoom.enabled = !0, e.mobile.zoom.locked = !1)
                },
                restore: function() {
                    s || (t.attr("content", n), e.mobile.zoom.enabled = !0)
                }
            })
        }(e),
        function(e, t) {
            e.widget("mobile.textinput", {
                initSelector: "input[type='text'],input[type='search'],:jqmData(type='search'),input[type='number'],:jqmData(type='number'),input[type='password'],input[type='email'],input[type='url'],input[type='tel'],textarea,input[type='time'],input[type='date'],input[type='month'],input[type='week'],input[type='datetime'],input[type='datetime-local'],input[type='color'],input:not([type]),input[type='file']",
                options: {
                    theme: null,
                    corners: !0,
                    mini: !1,
                    preventFocusZoom: /iPhone|iPad|iPod/.test(navigator.platform) && navigator.userAgent.indexOf("AppleWebKit") > -1,
                    wrapperClass: "",
                    enhanced: !1
                },
                _create: function() {
                    var t = this.options,
                        n = this.element.is("[type='search'], :jqmData(type='search')"),
                        r = "TEXTAREA" === this.element[0].tagName,
                        i = this.element.is("[data-" + (e.mobile.ns || "") + "type='range']"),
                        s = (this.element.is("input") || this.element.is("[data-" + (e.mobile.ns || "") + "type='search']")) && !i;
                    this.element.prop("disabled") && (t.disabled = !0), e.extend(this, {
                        classes: this._classesFromOptions(),
                        isSearch: n,
                        isTextarea: r,
                        isRange: i,
                        inputNeedsWrap: s
                    }), this._autoCorrect(), t.enhanced || this._enhance(), this._on({
                        focus: "_handleFocus",
                        blur: "_handleBlur"
                    })
                },
                refresh: function() {
                    this.setOptions({
                        disabled: this.element.is(":disabled")
                    })
                },
                _enhance: function() {
                    var e = [];
                    this.isTextarea && e.push("ui-input-text"), (this.isTextarea || this.isRange) && e.push("ui-shadow-inset"), this.inputNeedsWrap ? this.element.wrap(this._wrap()) : e = e.concat(this.classes), this.element.addClass(e.join(" "))
                },
                widget: function() {
                    return this.inputNeedsWrap ? this.element.parent() : this.element
                },
                _classesFromOptions: function() {
                    var e = this.options,
                        t = [];
                    return t.push("ui-body-" + (null === e.theme ? "inherit" : e.theme)), e.corners && t.push("ui-corner-all"), e.mini && t.push("ui-mini"), e.disabled && t.push("ui-state-disabled"), e.wrapperClass && t.push(e.wrapperClass), t
                },
                _wrap: function() {
                    return e("<div class='" + (this.isSearch ? "ui-input-search " : "ui-input-text ") + this.classes.join(" ") + " " + "ui-shadow-inset'></div>")
                },
                _autoCorrect: function() {
                    "undefined" == typeof this.element[0].autocorrect || e.support.touchOverflow || (this.element[0].setAttribute("autocorrect", "off"), this.element[0].setAttribute("autocomplete", "off"))
                },
                _handleBlur: function() {
                    this.widget().removeClass(e.mobile.focusClass), this.options.preventFocusZoom && e.mobile.zoom.enable(!0)
                },
                _handleFocus: function() {
                    this.options.preventFocusZoom && e.mobile.zoom.disable(!0), this.widget().addClass(e.mobile.focusClass)
                },
                _setOptions: function(e) {
                    var n = this.widget();
                    this._super(e), (e.disabled !== t || e.mini !== t || e.corners !== t || e.theme !== t || e.wrapperClass !== t) && (n.removeClass(this.classes.join(" ")), this.classes = this._classesFromOptions(), n.addClass(this.classes.join(" "))), e.disabled !== t && this.element.prop("disabled", !!e.disabled)
                },
                _destroy: function() {
                    this.options.enhanced || (this.inputNeedsWrap && this.element.unwrap(), this.element.removeClass("ui-input-text " + this.classes.join(" ")))
                }
            })
        }(e),
        function(e, r) {
            e.widget("mobile.slider", e.extend({
                initSelector: "input[type='range'], :jqmData(type='range'), :jqmData(role='slider')",
                widgetEventPrefix: "slide",
                options: {
                    theme: null,
                    trackTheme: null,
                    corners: !0,
                    mini: !1,
                    highlight: !1
                },
                _create: function() {
                    var i, s, o, u, f, l, h, p, v, m, g = this,
                        y = this.element,
                        w = this.options.trackTheme || e.mobile.getAttribute(y[0], "theme"),
                        E = w ? " ui-bar-" + w : " ui-bar-inherit",
                        S = this.options.corners || y.jqmData("corners") ? " ui-corner-all" : "",
                        x = this.options.mini || y.jqmData("mini") ? " ui-mini" : "",
                        T = y[0].nodeName.toLowerCase(),
                        N = "select" === T,
                        C = y.parent().is(":jqmData(role='rangeslider')"),
                        k = N ? "ui-slider-switch" : "",
                        L = y.attr("id"),
                        A = e("[for='" + L + "']"),
                        O = A.attr("id") || L + "-label",
                        M = N ? 0 : parseFloat(y.attr("min")),
                        _ = N ? y.find("option").length - 1 : parseFloat(y.attr("max")),
                        D = t.parseFloat(y.attr("step") || 1),
                        P = n.createElement("a"),
                        H = e(P),
                        B = n.createElement("div"),
                        j = e(B),
                        F = this.options.highlight && !N ? function() {
                            var t = n.createElement("div");
                            return t.className = "ui-slider-bg " + e.mobile.activeBtnClass, e(t).prependTo(j)
                        }() : !1;
                    if (A.attr("id", O), this.isToggleSwitch = N, P.setAttribute("href", "#"), B.setAttribute("role", "application"), B.className = [this.isToggleSwitch ? "ui-slider ui-slider-track ui-shadow-inset " : "ui-slider-track ui-shadow-inset ", k, E, S, x].join(""), P.className = "ui-slider-handle", B.appendChild(P), H.attr({
                            role: "slider",
                            "aria-valuemin": M,
                            "aria-valuemax": _,
                            "aria-valuenow": this._value(),
                            "aria-valuetext": this._value(),
                            title: this._value(),
                            "aria-labelledby": O
                        }), e.extend(this, {
                            slider: j,
                            handle: H,
                            control: y,
                            type: T,
                            step: D,
                            max: _,
                            min: M,
                            valuebg: F,
                            isRangeslider: C,
                            dragging: !1,
                            beforeStart: null,
                            userModified: !1,
                            mouseMoved: !1
                        }), N) {
                        for (h = y.attr("tabindex"), h && H.attr("tabindex", h), y.attr("tabindex", "-1").focus(function() {
                                e(this).blur(), H.focus()
                            }), s = n.createElement("div"), s.className = "ui-slider-inneroffset", o = 0, u = B.childNodes.length; u > o; o++) s.appendChild(B.childNodes[o]);
                        for (B.appendChild(s), H.addClass("ui-slider-handle-snapping"), i = y.find("option"), f = 0, l = i.length; l > f; f++) p = f ? "a" : "b", v = f ? " " + e.mobile.activeBtnClass : "", m = n.createElement("span"), m.className = ["ui-slider-label ui-slider-label-", p, v].join(""), m.setAttribute("role", "img"), m.appendChild(n.createTextNode(i[f].innerHTML)), e(m).prependTo(j);
                        g._labels = e(".ui-slider-label", j)
                    }
                    y.addClass(N ? "ui-slider-switch" : "ui-slider-input"), this._on(y, {
                        change: "_controlChange",
                        keyup: "_controlKeyup",
                        blur: "_controlBlur",
                        vmouseup: "_controlVMouseUp"
                    }), j.bind("vmousedown", e.proxy(this._sliderVMouseDown, this)).bind("vclick", !1), this._on(n, {
                        vmousemove: "_preventDocumentDrag"
                    }), this._on(j.add(n), {
                        vmouseup: "_sliderVMouseUp"
                    }), j.insertAfter(y), N || C || (s = this.options.mini ? "<div class='ui-slider ui-mini'>" : "<div class='ui-slider'>", y.add(j).wrapAll(s)), this._on(this.handle, {
                        vmousedown: "_handleVMouseDown",
                        keydown: "_handleKeydown",
                        keyup: "_handleKeyup"
                    }), this.handle.bind("vclick", !1), this._handleFormReset(), this.refresh(r, r, !0)
                },
                _setOptions: function(e) {
                    e.theme !== r && this._setTheme(e.theme), e.trackTheme !== r && this._setTrackTheme(e.trackTheme), e.corners !== r && this._setCorners(e.corners), e.mini !== r && this._setMini(e.mini), e.highlight !== r && this._setHighlight(e.highlight), e.disabled !== r && this._setDisabled(e.disabled), this._super(e)
                },
                _controlChange: function(e) {
                    return this._trigger("controlchange", e) === !1 ? !1 : (this.mouseMoved || this.refresh(this._value(), !0), void 0)
                },
                _controlKeyup: function() {
                    this.refresh(this._value(), !0, !0)
                },
                _controlBlur: function() {
                    this.refresh(this._value(), !0)
                },
                _controlVMouseUp: function() {
                    this._checkedRefresh()
                },
                _handleVMouseDown: function() {
                    this.handle.focus()
                },
                _handleKeydown: function(t) {
                    var n = this._value();
                    if (!this.options.disabled) {
                        switch (t.keyCode) {
                            case e.mobile.keyCode.HOME:
                            case e.mobile.keyCode.END:
                            case e.mobile.keyCode.PAGE_UP:
                            case e.mobile.keyCode.PAGE_DOWN:
                            case e.mobile.keyCode.UP:
                            case e.mobile.keyCode.RIGHT:
                            case e.mobile.keyCode.DOWN:
                            case e.mobile.keyCode.LEFT:
                                t.preventDefault(), this._keySliding || (this._keySliding = !0, this.handle.addClass("ui-state-active"))
                        }
                        switch (t.keyCode) {
                            case e.mobile.keyCode.HOME:
                                this.refresh(this.min);
                                break;
                            case e.mobile.keyCode.END:
                                this.refresh(this.max);
                                break;
                            case e.mobile.keyCode.PAGE_UP:
                            case e.mobile.keyCode.UP:
                            case e.mobile.keyCode.RIGHT:
                                this.refresh(n + this.step);
                                break;
                            case e.mobile.keyCode.PAGE_DOWN:
                            case e.mobile.keyCode.DOWN:
                            case e.mobile.keyCode.LEFT:
                                this.refresh(n - this.step)
                        }
                    }
                },
                _handleKeyup: function() {
                    this._keySliding && (this._keySliding = !1, this.handle.removeClass("ui-state-active"))
                },
                _sliderVMouseDown: function(e) {
                    return this.options.disabled || 1 !== e.which && 0 !== e.which && e.which !== r ? !1 : this._trigger("beforestart", e) === !1 ? !1 : (this.dragging = !0, this.userModified = !1, this.mouseMoved = !1, this.isToggleSwitch && (this.beforeStart = this.element[0].selectedIndex), this.refresh(e), this._trigger("start"), !1)
                },
                _sliderVMouseUp: function() {
                    return this.dragging ? (this.dragging = !1, this.isToggleSwitch && (this.handle.addClass("ui-slider-handle-snapping"), this.mouseMoved ? this.userModified ? this.refresh(0 === this.beforeStart ? 1 : 0) : this.refresh(this.beforeStart) : this.refresh(0 === this.beforeStart ? 1 : 0)), this.mouseMoved = !1, this._trigger("stop"), !1) : void 0
                },
                _preventDocumentDrag: function(e) {
                    return this._trigger("drag", e) === !1 ? !1 : this.dragging && !this.options.disabled ? (this.mouseMoved = !0, this.isToggleSwitch && this.handle.removeClass("ui-slider-handle-snapping"), this.refresh(e), this.userModified = this.beforeStart !== this.element[0].selectedIndex, !1) : void 0
                },
                _checkedRefresh: function() {
                    this.value !== this._value() && this.refresh(this._value())
                },
                _value: function() {
                    return this.isToggleSwitch ? this.element[0].selectedIndex : parseFloat(this.element.val())
                },
                _reset: function() {
                    this.refresh(r, !1, !0)
                },
                refresh: function(t, r, i) {
                    var s, o, u, f, l, h, p, d, v, m, g, y, b, w, E, S, x, T, N, C, k = this,
                        L = e.mobile.getAttribute(this.element[0], "theme"),
                        A = this.options.theme || L,
                        O = A ? " ui-btn-" + A : "",
                        M = this.options.trackTheme || L,
                        _ = M ? " ui-bar-" + M : " ui-bar-inherit",
                        D = this.options.corners ? " ui-corner-all" : "",
                        P = this.options.mini ? " ui-mini" : "";
                    if (k.slider[0].className = [this.isToggleSwitch ? "ui-slider ui-slider-switch ui-slider-track ui-shadow-inset" : "ui-slider-track ui-shadow-inset", _, D, P].join(""), (this.options.disabled || this.element.prop("disabled")) && this.disable(), this.value = this._value(), this.options.highlight && !this.isToggleSwitch && 0 === this.slider.find(".ui-slider-bg").length && (this.valuebg = function() {
                            var t = n.createElement("div");
                            return t.className = "ui-slider-bg " + e.mobile.activeBtnClass, e(t).prependTo(k.slider)
                        }()), this.handle.addClass("ui-btn" + O + " ui-shadow"), p = this.element, d = !this.isToggleSwitch, v = d ? [] : p.find("option"), m = d ? parseFloat(p.attr("min")) : 0, g = d ? parseFloat(p.attr("max")) : v.length - 1, y = d && parseFloat(p.attr("step")) > 0 ? parseFloat(p.attr("step")) : 1, "object" == typeof t) {
                        if (u = t, f = 8, s = this.slider.offset().left, o = this.slider.width(), l = o / ((g - m) / y), !this.dragging || u.pageX < s - f || u.pageX > s + o + f) return;
                        h = l > 1 ? 100 * ((u.pageX - s) / o) : Math.round(100 * ((u.pageX - s) / o))
                    } else null == t && (t = d ? parseFloat(p.val() || 0) : p[0].selectedIndex), h = 100 * ((parseFloat(t) - m) / (g - m));
                    if (!isNaN(h) && (b = h / 100 * (g - m) + m, w = (b - m) % y, E = b - w, 2 * Math.abs(w) >= y && (E += w > 0 ? y : -y), S = 100 / ((g - m) / y), b = parseFloat(E.toFixed(5)), "undefined" == typeof l && (l = o / ((g - m) / y)), l > 1 && d && (h = (b - m) * S * (1 / y)), 0 > h && (h = 0), h > 100 && (h = 100), m > b && (b = m), b > g && (b = g), this.handle.css("left", h + "%"), this.handle[0].setAttribute("aria-valuenow", d ? b : v.eq(b).attr("value")), this.handle[0].setAttribute("aria-valuetext", d ? b : v.eq(b).getEncodedText()), this.handle[0].setAttribute("title", d ? b : v.eq(b).getEncodedText()), this.valuebg && this.valuebg.css("width", h + "%"), this._labels && (x = 100 * (this.handle.width() / this.slider.width()), T = h && x + (100 - x) * h / 100, N = 100 === h ? 0 : Math.min(x + 100 - T, 100), this._labels.each(function() {
                            var t = e(this).hasClass("ui-slider-label-a");
                            e(this).width((t ? T : N) + "%")
                        })), !i)) {
                        if (C = !1, d ? (C = p.val() !== b, p.val(b)) : (C = p[0].selectedIndex !== b, p[0].selectedIndex = b), this._trigger("beforechange", t) === !1) return !1;
                        !r && C && p.trigger("change")
                    }
                },
                _setHighlight: function(e) {
                    e = !!e, e ? (this.options.highlight = !!e, this.refresh()) : this.valuebg && (this.valuebg.remove(), this.valuebg = !1)
                },
                _setTheme: function(e) {
                    this.handle.removeClass("ui-btn-" + this.options.theme).addClass("ui-btn-" + e);
                    var t = this.options.theme ? this.options.theme : "inherit",
                        n = e ? e : "inherit";
                    this.control.removeClass("ui-body-" + t).addClass("ui-body-" + n)
                },
                _setTrackTheme: function(e) {
                    var t = this.options.trackTheme ? this.options.trackTheme : "inherit",
                        n = e ? e : "inherit";
                    this.slider.removeClass("ui-body-" + t).addClass("ui-body-" + n)
                },
                _setMini: function(e) {
                    e = !!e, this.isToggleSwitch || this.isRangeslider || (this.slider.parent().toggleClass("ui-mini", e), this.element.toggleClass("ui-mini", e)), this.slider.toggleClass("ui-mini", e)
                },
                _setCorners: function(e) {
                    this.slider.toggleClass("ui-corner-all", e), this.isToggleSwitch || this.control.toggleClass("ui-corner-all", e)
                },
                _setDisabled: function(e) {
                    e = !!e, this.element.prop("disabled", e), this.slider.toggleClass("ui-state-disabled").attr("aria-disabled", e)
                }
            }, e.mobile.behaviors.formReset))
        }(e),
        function(e) {
            function t() {
                return n || (n = e("<div></div>", {
                    "class": "ui-slider-popup ui-shadow ui-corner-all"
                })), n.clone()
            }
            var n;
            e.widget("mobile.slider", e.mobile.slider, {
                options: {
                    popupEnabled: !1,
                    showValue: !1
                },
                _create: function() {
                    this._super(), e.extend(this, {
                        _currentValue: null,
                        _popup: null,
                        _popupVisible: !1
                    }), this._setOption("popupEnabled", this.options.popupEnabled), this._on(this.handle, {
                        vmousedown: "_showPopup"
                    }), this._on(this.slider.add(this.document), {
                        vmouseup: "_hidePopup"
                    }), this._refresh()
                },
                _positionPopup: function() {
                    var e = this.handle.offset();
                    this._popup.offset({
                        left: e.left + (this.handle.width() - this._popup.width()) / 2,
                        top: e.top - this._popup.outerHeight() - 5
                    })
                },
                _setOption: function(e, n) {
                    this._super(e, n), "showValue" === e ? this.handle.html(n && !this.options.mini ? this._value() : "") : "popupEnabled" === e && n && !this._popup && (this._popup = t().addClass("ui-body-" + (this.options.theme || "a")).insertBefore(this.element))
                },
                refresh: function() {
                    this._super.apply(this, arguments), this._refresh()
                },
                _refresh: function() {
                    var e, t = this.options;
                    t.popupEnabled && this.handle.removeAttr("title"), e = this._value(), e !== this._currentValue && (this._currentValue = e, t.popupEnabled && this._popup ? (this._positionPopup(), this._popup.html(e)) : t.showValue && !this.options.mini && this.handle.html(e))
                },
                _showPopup: function() {
                    this.options.popupEnabled && !this._popupVisible && (this.handle.html(""), this._popup.show(), this._positionPopup(), this._popupVisible = !0)
                },
                _hidePopup: function() {
                    var e = this.options;
                    e.popupEnabled && this._popupVisible && (e.showValue && !e.mini && this.handle.html(this._value()), this._popup.hide(), this._popupVisible = !1)
                }
            })
        }(e),
        function(e, t) {
            e.widget("mobile.flipswitch", e.extend({
                options: {
                    onText: "On",
                    offText: "Off",
                    theme: null,
                    enhanced: !1,
                    wrapperClass: null,
                    corners: !0,
                    mini: !1
                },
                _create: function() {
                    this.options.enhanced ? e.extend(this, {
                        flipswitch: this.element.parent(),
                        on: this.element.find(".ui-flipswitch-on").eq(0),
                        off: this.element.find(".ui-flipswitch-off").eq(0),
                        type: this.element.get(0).tagName
                    }) : this._enhance(), this._handleFormReset(), this.element.is(":disabled") && this._setOptions({
                        disabled: !0
                    }), this._on(this.flipswitch, {
                        click: "_toggle",
                        swipeleft: "_left",
                        swiperight: "_right"
                    }), this._on(this.on, {
                        keydown: "_keydown"
                    }), this._on({
                        change: "refresh"
                    })
                },
                widget: function() {
                    return this.flipswitch
                },
                _left: function() {
                    this.flipswitch.removeClass("ui-flipswitch-active"), "SELECT" === this.type ? this.element.get(0).selectedIndex = 0 : this.element.prop("checked", !1), this.element.trigger("change")
                },
                _right: function() {
                    this.flipswitch.addClass("ui-flipswitch-active"), "SELECT" === this.type ? this.element.get(0).selectedIndex = 1 : this.element.prop("checked", !0), this.element.trigger("change")
                },
                _enhance: function() {
                    var t = e("<div>"),
                        n = this.options,
                        r = this.element,
                        i = n.theme ? n.theme : "inherit",
                        s = e("<span></span>", {
                            tabindex: 1
                        }),
                        o = e("<span></span>"),
                        u = r.get(0).tagName,
                        f = "INPUT" === u ? n.onText : r.find("option").eq(1).text(),
                        l = "INPUT" === u ? n.offText : r.find("option").eq(0).text();
                    s.addClass("ui-flipswitch-on ui-btn ui-shadow ui-btn-inherit").text(f), o.addClass("ui-flipswitch-off").text(l), t.addClass("ui-flipswitch ui-shadow-inset ui-bar-" + i + " " + (n.wrapperClass ? n.wrapperClass : "") + " " + (r.is(":checked") || r.find("option").eq(1).is(":selected") ? "ui-flipswitch-active" : "") + (r.is(":disabled") ? " ui-state-disabled" : "") + (n.corners ? " ui-corner-all" : "") + (n.mini ? " ui-mini" : "")).append(s, o), r.addClass("ui-flipswitch-input").after(t).appendTo(t), e.extend(this, {
                        flipswitch: t,
                        on: s,
                        off: o,
                        type: u
                    })
                },
                _reset: function() {
                    this.refresh()
                },
                refresh: function() {
                    var e, t = this.flipswitch.hasClass("ui-flipswitch-active") ? "_right" : "_left";
                    e = "SELECT" === this.type ? this.element.get(0).selectedIndex > 0 ? "_right" : "_left" : this.element.prop("checked") ? "_right" : "_left", e !== t && this[e]()
                },
                _toggle: function() {
                    var e = this.flipswitch.hasClass("ui-flipswitch-active") ? "_left" : "_right";
                    this[e]()
                },
                _keydown: function(t) {
                    t.which === e.mobile.keyCode.LEFT ? this._left() : t.which === e.mobile.keyCode.RIGHT ? this._right() : t.which === e.mobile.keyCode.SPACE && (this._toggle(), t.preventDefault())
                },
                _setOptions: function(e) {
                    if (e.theme !== t) {
                        var n = e.theme ? e.theme : "inherit",
                            r = e.theme ? e.theme : "inherit";
                        this.widget().removeClass("ui-bar-" + n).addClass("ui-bar-" + r)
                    }
                    e.onText !== t && this.on.text(e.onText), e.offText !== t && this.off.text(e.offText), e.disabled !== t && this.widget().toggleClass("ui-state-disabled", e.disabled), e.mini !== t && this.widget().toggleClass("ui-mini", e.mini), e.corners !== t && this.widget().toggleClass("ui-corner-all", e.corners), this._super(e)
                },
                _destroy: function() {
                    this.options.enhanced || (this.on.remove(), this.off.remove(), this.element.unwrap(), this.flipswitch.remove(), this.removeClass("ui-flipswitch-input"))
                }
            }, e.mobile.behaviors.formReset))
        }(e),
        function(e, t) {
            e.widget("mobile.rangeslider", e.extend({
                options: {
                    theme: null,
                    trackTheme: null,
                    corners: !0,
                    mini: !1,
                    highlight: !0
                },
                _create: function() {
                    var t = this.element,
                        n = this.options.mini ? "ui-rangeslider ui-mini" : "ui-rangeslider",
                        r = t.find("input").first(),
                        i = t.find("input").last(),
                        s = t.find("label").first(),
                        o = e.data(r.get(0), "mobile-slider") || e.data(r.slider().get(0), "mobile-slider"),
                        u = e.data(i.get(0), "mobile-slider") || e.data(i.slider().get(0), "mobile-slider"),
                        f = o.slider,
                        l = u.slider,
                        c = o.handle,
                        h = e("<div class='ui-rangeslider-sliders' />").appendTo(t);
                    r.addClass("ui-rangeslider-first"), i.addClass("ui-rangeslider-last"), t.addClass(n), f.appendTo(h), l.appendTo(h), s.insertBefore(t), c.prependTo(l), e.extend(this, {
                        _inputFirst: r,
                        _inputLast: i,
                        _sliderFirst: f,
                        _sliderLast: l,
                        _label: s,
                        _targetVal: null,
                        _sliderTarget: !1,
                        _sliders: h,
                        _proxy: !1
                    }), this.refresh(), this._on(this.element.find("input.ui-slider-input"), {
                        slidebeforestart: "_slidebeforestart",
                        slidestop: "_slidestop",
                        slidedrag: "_slidedrag",
                        slidebeforechange: "_change",
                        blur: "_change",
                        keyup: "_change"
                    }), this._on({
                        mousedown: "_change"
                    }), this._on(this.element.closest("form"), {
                        reset: "_handleReset"
                    }), this._on(c, {
                        vmousedown: "_dragFirstHandle"
                    })
                },
                _handleReset: function() {
                    var e = this;
                    setTimeout(function() {
                        e._updateHighlight()
                    }, 0)
                },
                _dragFirstHandle: function(t) {
                    return e.data(this._inputFirst.get(0), "mobile-slider").dragging = !0, e.data(this._inputFirst.get(0), "mobile-slider").refresh(t), !1
                },
                _slidedrag: function(t) {
                    var n = e(t.target).is(this._inputFirst),
                        r = n ? this._inputLast : this._inputFirst;
                    return this._sliderTarget = !1, "first" === this._proxy && n || "last" === this._proxy && !n ? (e.data(r.get(0), "mobile-slider").dragging = !0, e.data(r.get(0), "mobile-slider").refresh(t), !1) : void 0
                },
                _slidestop: function(t) {
                    var n = e(t.target).is(this._inputFirst);
                    this._proxy = !1, this.element.find("input").trigger("vmouseup"), this._sliderFirst.css("z-index", n ? 1 : "")
                },
                _slidebeforestart: function(t) {
                    this._sliderTarget = !1, e(t.originalEvent.target).hasClass("ui-slider-track") && (this._sliderTarget = !0, this._targetVal = e(t.target).val())
                },
                _setOptions: function(e) {
                    e.theme !== t && this._setTheme(e.theme), e.trackTheme !== t && this._setTrackTheme(e.trackTheme), e.mini !== t && this._setMini(e.mini), e.highlight !== t && this._setHighlight(e.highlight), this._super(e), this.refresh()
                },
                refresh: function() {
                    var e = this.element,
                        t = this.options;
                    (this._inputFirst.is(":disabled") || this._inputLast.is(":disabled")) && (this.options.disabled = !0), e.find("input").slider({
                        theme: t.theme,
                        trackTheme: t.trackTheme,
                        disabled: t.disabled,
                        corners: t.corners,
                        mini: t.mini,
                        highlight: t.highlight
                    }).slider("refresh"), this._updateHighlight()
                },
                _change: function(t) {
                    if ("keyup" === t.type) return this._updateHighlight(), !1;
                    var n = this,
                        r = parseFloat(this._inputFirst.val(), 10),
                        i = parseFloat(this._inputLast.val(), 10),
                        s = e(t.target).hasClass("ui-rangeslider-first"),
                        o = s ? this._inputFirst : this._inputLast,
                        u = s ? this._inputLast : this._inputFirst;
                    if (this._inputFirst.val() > this._inputLast.val() && "mousedown" === t.type && !e(t.target).hasClass("ui-slider-handle")) o.blur();
                    else if ("mousedown" === t.type) return;
                    return r > i && !this._sliderTarget ? (o.val(s ? i : r).slider("refresh"), this._trigger("normalize")) : r > i && (o.val(this._targetVal).slider("refresh"), setTimeout(function() {
                        u.val(s ? r : i).slider("refresh"), e.data(u.get(0), "mobile-slider").handle.focus(), n._sliderFirst.css("z-index", s ? "" : 1), n._trigger("normalize")
                    }, 0), this._proxy = s ? "first" : "last"), r === i ? (e.data(o.get(0), "mobile-slider").handle.css("z-index", 1), e.data(u.get(0), "mobile-slider").handle.css("z-index", 0)) : (e.data(u.get(0), "mobile-slider").handle.css("z-index", ""), e.data(o.get(0), "mobile-slider").handle.css("z-index", "")), this._updateHighlight(), r >= i ? !1 : void 0
                },
                _updateHighlight: function() {
                    var t = parseInt(e.data(this._inputFirst.get(0), "mobile-slider").handle.get(0).style.left, 10),
                        n = parseInt(e.data(this._inputLast.get(0), "mobile-slider").handle.get(0).style.left, 10),
                        r = n - t;
                    this.element.find(".ui-slider-bg").css({
                        "margin-left": t + "%",
                        width: r + "%"
                    })
                },
                _setTheme: function(e) {
                    this._inputFirst.slider("option", "theme", e), this._inputLast.slider("option", "theme", e)
                },
                _setTrackTheme: function(e) {
                    this._inputFirst.slider("option", "trackTheme", e), this._inputLast.slider("option", "trackTheme", e)
                },
                _setMini: function(e) {
                    this._inputFirst.slider("option", "mini", e), this._inputLast.slider("option", "mini", e), this.element.toggleClass("ui-mini", !!e)
                },
                _setHighlight: function(e) {
                    this._inputFirst.slider("option", "highlight", e), this._inputLast.slider("option", "highlight", e)
                },
                _destroy: function() {
                    this._label.prependTo(this.element), this.element.removeClass("ui-rangeslider ui-mini"), this._inputFirst.after(this._sliderFirst), this._inputLast.after(this._sliderLast), this._sliders.remove(), this.element.find("input").removeClass("ui-rangeslider-first ui-rangeslider-last").slider("destroy")
                }
            }, e.mobile.behaviors.formReset))
        }(e),
        function(e, t) {
            e.widget("mobile.textinput", e.mobile.textinput, {
                options: {
                    clearBtn: !1,
                    clearBtnText: "Clear text"
                },
                _create: function() {
                    this._super(), (this.options.clearBtn || this.isSearch) && this._addClearBtn()
                },
                clearButton: function() {
                    return e("<a href='#' class='ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all' title='" + this.options.clearBtnText + "'>" + this.options.clearBtnText + "</a>")
                },
                _clearBtnClick: function(e) {
                    this.element.val("").focus().trigger("change"), this._clearBtn.addClass("ui-input-clear-hidden"), e.preventDefault()
                },
                _addClearBtn: function() {
                    this.options.enhanced || this._enhanceClear(), e.extend(this, {
                        _clearBtn: this.widget().find("a.ui-input-clear")
                    }), this._bindClearEvents(), this._toggleClear()
                },
                _enhanceClear: function() {
                    this.clearButton().appendTo(this.widget()), this.widget().addClass("ui-input-has-clear")
                },
                _bindClearEvents: function() {
                    this._on(this._clearBtn, {
                        click: "_clearBtnClick"
                    }), this._on({
                        keyup: "_toggleClear",
                        change: "_toggleClear",
                        input: "_toggleClear",
                        focus: "_toggleClear",
                        blur: "_toggleClear",
                        cut: "_toggleClear",
                        paste: "_toggleClear"
                    })
                },
                _unbindClear: function() {
                    this._off(this._clearBtn, "click"), this._off(this.element, "keyup change input focus blur cut paste")
                },
                _setOptions: function(e) {
                    this._super(e), e.clearbtn === t || this.element.is("textarea, :jqmData(type='range')") || (e.clearBtn ? this._addClearBtn() : this._destroyClear()), e.clearBtnText !== t && this._clearBtn !== t && this._clearBtn.text(e.clearBtnText)
                },
                _toggleClear: function() {
                    this._delay("_toggleClearClass", 0)
                },
                _toggleClearClass: function() {
                    this._clearBtn.toggleClass("ui-input-clear-hidden", !this.element.val())
                },
                _destroyClear: function() {
                    this.element.removeClass("ui-input-has-clear"), this._unbindClear()._clearBtn.remove()
                },
                _destroy: function() {
                    this._super(), this._destroyClear()
                }
            })
        }(e),
        function(e, t) {
            e.widget("mobile.textinput", e.mobile.textinput, {
                options: {
                    autogrow: !0,
                    keyupTimeoutBuffer: 100
                },
                _create: function() {
                    this._super(), this.options.autogrow && this.isTextarea && this._autogrow()
                },
                _autogrow: function() {
                    this._on({
                        keyup: "_timeout",
                        change: "_timeout",
                        input: "_timeout",
                        paste: "_timeout"
                    }), this._on(!0, this.document, {
                        pageshow: "_handleShow",
                        popupbeforeposition: "_handleShow",
                        updatelayout: "_handleShow",
                        panelopen: "_handleShow"
                    })
                },
                _handleShow: function(t) {
                    e.contains(t.target, this.element[0]) && this.element.is(":visible") && ("popupbeforeposition" !== t.type && this.element.addClass("ui-textinput-autogrow-resize").one("transitionend webkitTransitionEnd oTransitionEnd", e.proxy(function() {
                        this.element.removeClass("ui-textinput-autogrow-resize")
                    }, this)), this._prepareHeightUpdate())
                },
                _unbindAutogrow: function() {
                    this._off(this.element, "keyup change input paste"), this._off(this.document, "pageshow popupbeforeposition updatelayout panelopen")
                },
                keyupTimeout: null,
                _prepareHeightUpdate: function(e) {
                    this.keyupTimeout && clearTimeout(this.keyupTimeout), e === t ? this._updateHeight() : this.keyupTimeout = this._delay("_updateHeight", e)
                },
                _timeout: function() {
                    this._prepareHeightUpdate(this.options.keyupTimeoutBuffer)
                },
                _updateHeight: function() {
                    this.keyupTimeout = 0, this.element.css({
                        height: 0,
                        "min-height": 0,
                        "max-height": 0
                    });
                    var e, t, n, r = this.element[0].scrollHeight,
                        i = this.element[0].clientHeight,
                        s = parseFloat(this.element.css("border-top-width")),
                        o = parseFloat(this.element.css("border-bottom-width")),
                        u = s + o,
                        a = r + u + 15;
                    0 === i && (e = parseFloat(this.element.css("padding-top")), t = parseFloat(this.element.css("padding-bottom")), n = e + t, a += n), this.element.css({
                        height: a,
                        "min-height": "",
                        "max-height": ""
                    })
                },
                refresh: function() {
                    this.options.autogrow && this.isTextarea && this._updateHeight()
                },
                _setOptions: function(e) {
                    this._super(e), e.autogrow !== t && this.isTextarea && (e.autogrow ? this._autogrow() : this._unbindAutogrow())
                }
            })
        }(e),
        function(e) {
            e.widget("mobile.selectmenu", e.extend({
                initSelector: "select:not( :jqmData(role='slider')):not( :jqmData(role='flipswitch') )",
                options: {
                    theme: null,
                    icon: "carat-d",
                    iconpos: "right",
                    inline: !1,
                    corners: !0,
                    shadow: !0,
                    iconshadow: !1,
                    overlayTheme: null,
                    dividerTheme: null,
                    hidePlaceholderMenuItems: !0,
                    closeText: "Close",
                    nativeMenu: !0,
                    preventFocusZoom: /iPhone|iPad|iPod/.test(navigator.platform) && navigator.userAgent.indexOf("AppleWebKit") > -1,
                    mini: !1
                },
                _button: function() {
                    return e("<div/>")
                },
                _setDisabled: function(e) {
                    return this.element.attr("disabled", e), this.button.attr("aria-disabled", e), this._setOption("disabled", e)
                },
                _focusButton: function() {
                    var e = this;
                    setTimeout(function() {
                        e.button.focus()
                    }, 40)
                },
                _selectOptions: function() {
                    return this.select.find("option")
                },
                _preExtension: function() {
                    var t = this.options.inline || this.element.jqmData("inline"),
                        n = this.options.mini || this.element.jqmData("mini"),
                        r = "";
                    ~this.element[0].className.indexOf("ui-btn-left") && (r = " ui-btn-left"), ~this.element[0].className.indexOf("ui-btn-right") && (r = " ui-btn-right"), t && (r += " ui-btn-inline"), n && (r += " ui-mini"), this.select = this.element.removeClass("ui-btn-left ui-btn-right").wrap("<div class='ui-select" + r + "'>"), this.selectId = this.select.attr("id") || "select-" + this.uuid, this.buttonId = this.selectId + "-button", this.label = e("label[for='" + this.selectId + "']"), this.isMultiple = this.select[0].multiple
                },
                _destroy: function() {
                    var e = this.element.parents(".ui-select");
                    e.length > 0 && (e.is(".ui-btn-left, .ui-btn-right") && this.element.addClass(e.hasClass("ui-btn-left") ? "ui-btn-left" : "ui-btn-right"), this.element.insertAfter(e), e.remove())
                },
                _create: function() {
                    this._preExtension(), this.button = this._button();
                    var n = this,
                        r = this.options,
                        i = r.icon ? r.iconpos || this.select.jqmData("iconpos") : !1,
                        s = this.button.insertBefore(this.select).attr("id", this.buttonId).addClass("ui-btn" + (r.icon ? " ui-icon-" + r.icon + " ui-btn-icon-" + i + (r.iconshadow ? " ui-shadow-icon" : "") : "") + (r.theme ? " ui-btn-" + r.theme : "") + (r.corners ? " ui-corner-all" : "") + (r.shadow ? " ui-shadow" : ""));
                    this.setButtonText(), r.nativeMenu && t.opera && t.opera.version && s.addClass("ui-select-nativeonly"), this.isMultiple && (this.buttonCount = e("<span>").addClass("ui-li-count ui-body-inherit").hide().appendTo(s.addClass("ui-li-has-count"))), (r.disabled || this.element.attr("disabled")) && this.disable(), this.select.change(function() {
                        n.refresh(), r.nativeMenu && this.blur()
                    }), this._handleFormReset(), this._on(this.button, {
                        keydown: "_handleKeydown"
                    }), this.build()
                },
                build: function() {
                    var t = this;
                    this.select.appendTo(t.button).bind("vmousedown", function() {
                        t.button.addClass(e.mobile.activeBtnClass)
                    }).bind("focus", function() {
                        t.button.addClass(e.mobile.focusClass)
                    }).bind("blur", function() {
                        t.button.removeClass(e.mobile.focusClass)
                    }).bind("focus vmouseover", function() {
                        t.button.trigger("vmouseover")
                    }).bind("vmousemove", function() {
                        t.button.removeClass(e.mobile.activeBtnClass)
                    }).bind("change blur vmouseout", function() {
                        t.button.trigger("vmouseout").removeClass(e.mobile.activeBtnClass)
                    }), t.button.bind("vmousedown", function() {
                        t.options.preventFocusZoom && e.mobile.zoom.disable(!0)
                    }), t.label.bind("click focus", function() {
                        t.options.preventFocusZoom && e.mobile.zoom.disable(!0)
                    }), t.select.bind("focus", function() {
                        t.options.preventFocusZoom && e.mobile.zoom.disable(!0)
                    }), t.button.bind("mouseup", function() {
                        t.options.preventFocusZoom && setTimeout(function() {
                            e.mobile.zoom.enable(!0)
                        }, 0)
                    }), t.select.bind("blur", function() {
                        t.options.preventFocusZoom && e.mobile.zoom.enable(!0)
                    })
                },
                selected: function() {
                    return this._selectOptions().filter(":selected")
                },
                selectedIndices: function() {
                    var e = this;
                    return this.selected().map(function() {
                        return e._selectOptions().index(this)
                    }).get()
                },
                setButtonText: function() {
                    var t = this,
                        r = this.selected(),
                        i = this.placeholder,
                        s = e(n.createElement("span"));
                    this.button.children("span").not(".ui-li-count").remove().end().end().prepend(function() {
                        return i = r.length ? r.map(function() {
                            return e(this).text()
                        }).get().join(", ") : t.placeholder, i ? s.text(i) : s.html("&nbsp;"), s.addClass(t.select.attr("class")).addClass(r.attr("class")).removeClass("ui-screen-hidden")
                    }())
                },
                setButtonCount: function() {
                    var e = this.selected();
                    this.isMultiple && this.buttonCount[e.length > 1 ? "show" : "hide"]().text(e.length)
                },
                _handleKeydown: function() {
                    this._delay("_refreshButton")
                },
                _reset: function() {
                    this.refresh()
                },
                _refreshButton: function() {
                    this.setButtonText(), this.setButtonCount()
                },
                refresh: function() {
                    this._refreshButton()
                },
                open: e.noop,
                close: e.noop,
                disable: function() {
                    this._setDisabled(!0), this.button.addClass("ui-state-disabled")
                },
                enable: function() {
                    this._setDisabled(!1), this.button.removeClass("ui-state-disabled")
                }
            }, e.mobile.behaviors.formReset))
        }(e),
        function(e) {
            e.mobile.links = function(t) {
                e(t).find("a").jqmEnhanceable().filter(":jqmData(rel='popup')[href][href!='']").each(function() {
                    var e = this,
                        t = e.getAttribute("href").substring(1);
                    t && (e.setAttribute("aria-haspopup", !0), e.setAttribute("aria-owns", t), e.setAttribute("aria-expanded", !1))
                }).end().not(".ui-btn, :jqmData(role='none'), :jqmData(role='nojs')").addClass("ui-link")
            }
        }(e),
        function(e, n) {
            function r(e, t, n, r) {
                var i = r;
                return i = t > e ? n + (e - t) / 2 : Math.min(Math.max(n, r - t / 2), n + e - t)
            }

            function i(e) {
                return {
                    x: e.scrollLeft(),
                    y: e.scrollTop(),
                    cx: e[0].innerWidth || e.width(),
                    cy: e[0].innerHeight || e.height()
                }
            }
            e.widget("mobile.popup", {
                options: {
                    wrapperClass: null,
                    theme: null,
                    overlayTheme: null,
                    shadow: !0,
                    corners: !0,
                    transition: "none",
                    positionTo: "origin",
                    tolerance: null,
                    closeLinkSelector: "a:jqmData(rel='back')",
                    closeLinkEvents: "click.popup",
                    navigateEvents: "navigate.popup",
                    closeEvents: "navigate.popup pagebeforechange.popup",
                    dismissible: !0,
                    enhanced: !1,
                    history: !e.mobile.browser.oldIE
                },
                _create: function() {
                    var t = this.element,
                        n = t.attr("id"),
                        r = this.options;
                    r.history = r.history && e.mobile.ajaxEnabled && e.mobile.hashListeningEnabled, e.extend(this, {
                        _scrollTop: 0,
                        _page: t.closest(".ui-page"),
                        _ui: null,
                        _fallbackTransition: "",
                        _currentTransition: !1,
                        _prerequisites: null,
                        _isOpen: !1,
                        _tolerance: null,
                        _resizeData: null,
                        _ignoreResizeTo: 0,
                        _orientationchangeInProgress: !1
                    }), 0 === this._page.length && (this._page = e("body")), r.enhanced ? this._ui = {
                        container: t.parent(),
                        screen: t.parent().prev(),
                        placeholder: e(this.document[0].getElementById(n + "-placeholder"))
                    } : (this._ui = this._enhance(t, n), this._applyTransition(r.transition)), this._setTolerance(r.tolerance)._ui.focusElement = this._ui.container, this._on(this._ui.screen, {
                        vclick: "_eatEventAndClose"
                    }), this._on(this.window, {
                        orientationchange: e.proxy(this, "_handleWindowOrientationchange"),
                        resize: e.proxy(this, "_handleWindowResize"),
                        keyup: e.proxy(this, "_handleWindowKeyUp")
                    }), this._on(this.document, {
                        focusin: "_handleDocumentFocusIn"
                    })
                },
                _enhance: function(t, n) {
                    var r = this.options,
                        i = r.wrapperClass,
                        s = {
                            screen: e("<div class='ui-screen-hidden ui-popup-screen " + this._themeClassFromOption("ui-overlay-", r.overlayTheme) + "'></div>"),
                            placeholder: e("<div style='display: none;'><!-- placeholder --></div>"),
                            container: e("<div class='ui-popup-container ui-popup-hidden ui-popup-truncate" + (i ? " " + i : "") + "'></div>")
                        },
                        o = this.document[0].createDocumentFragment();
                    return o.appendChild(s.screen[0]), o.appendChild(s.container[0]), n && (s.screen.attr("id", n + "-screen"), s.container.attr("id", n + "-popup"), s.placeholder.attr("id", n + "-placeholder").html("<!-- placeholder for " + n + " -->")), this._page[0].appendChild(o), s.placeholder.insertAfter(t), t.detach().addClass("ui-popup " + this._themeClassFromOption("ui-body-", r.theme) + " " + (r.shadow ? "ui-overlay-shadow " : "") + (r.corners ? "ui-corner-all " : "")).appendTo(s.container), s
                },
                _eatEventAndClose: function(e) {
                    return e.preventDefault(), e.stopImmediatePropagation(), this.options.dismissible && this.close(), !1
                },
                _resizeScreen: function() {
                    var e = this._ui.screen,
                        t = this._ui.container.outerHeight(!0),
                        n = e.removeAttr("style").height(),
                        r = this.document.height() - 1;
                    r > n ? e.height(r) : t > n && e.height(t)
                },
                _handleWindowKeyUp: function(t) {
                    return this._isOpen && t.keyCode === e.mobile.keyCode.ESCAPE ? this._eatEventAndClose(t) : void 0
                },
                _expectResizeEvent: function() {
                    var e = i(this.window);
                    if (this._resizeData) {
                        if (e.x === this._resizeData.windowCoordinates.x && e.y === this._resizeData.windowCoordinates.y && e.cx === this._resizeData.windowCoordinates.cx && e.cy === this._resizeData.windowCoordinates.cy) return !1;
                        clearTimeout(this._resizeData.timeoutId)
                    }
                    return this._resizeData = {
                        timeoutId: this._delay("_resizeTimeout", 200),
                        windowCoordinates: e
                    }, !0
                },
                _resizeTimeout: function() {
                    this._isOpen ? this._expectResizeEvent() || (this._ui.container.hasClass("ui-popup-hidden") && (this._ui.container.removeClass("ui-popup-hidden ui-popup-truncate"), this.reposition({
                        positionTo: "window"
                    }), this._ignoreResizeEvents()), this._resizeScreen(), this._resizeData = null, this._orientationchangeInProgress = !1) : (this._resizeData = null, this._orientationchangeInProgress = !1)
                },
                _stopIgnoringResizeEvents: function() {
                    this._ignoreResizeTo = 0
                },
                _ignoreResizeEvents: function() {
                    this._ignoreResizeTo && clearTimeout(this._ignoreResizeTo), this._ignoreResizeTo = this._delay("_stopIgnoringResizeEvents", 1e3)
                },
                _handleWindowResize: function() {
                    this._isOpen && 0 === this._ignoreResizeTo && (!this._expectResizeEvent() && !this._orientationchangeInProgress || this._ui.container.hasClass("ui-popup-hidden") || this._ui.container.addClass("ui-popup-hidden ui-popup-truncate").removeAttr("style"))
                },
                _handleWindowOrientationchange: function() {
                    !this._orientationchangeInProgress && this._isOpen && 0 === this._ignoreResizeTo && (this._expectResizeEvent(), this._orientationchangeInProgress = !0)
                },
                _handleDocumentFocusIn: function(t) {
                    var n, r = t.target,
                        i = this._ui;
                    if (this._isOpen) {
                        if (r !== i.container[0]) {
                            if (n = e(r), 0 === n.parents().filter(i.container[0]).length) return e(this.document[0].activeElement).one("focus", function() {
                                n.blur()
                            }), i.focusElement.focus(), t.preventDefault(), t.stopImmediatePropagation(), !1;
                            i.focusElement[0] === i.container[0] && (i.focusElement = n)
                        }
                        this._ignoreResizeEvents()
                    }
                },
                _themeClassFromOption: function(e, t) {
                    return t ? "none" === t ? "" : e + t : e + "inherit"
                },
                _applyTransition: function(t) {
                    return t && (this._ui.container.removeClass(this._fallbackTransition), "none" !== t && (this._fallbackTransition = e.mobile._maybeDegradeTransition(t), "none" === this._fallbackTransition && (this._fallbackTransition = ""), this._ui.container.addClass(this._fallbackTransition))), this
                },
                _setOptions: function(e) {
                    var t = this.options,
                        r = this.element,
                        i = this._ui.screen;
                    return e.wrapperClass !== n && this._ui.container.removeClass(t.wrapperClass).addClass(e.wrapperClass), e.theme !== n && r.removeClass(this._themeClassFromOption("ui-body-", t.theme)).addClass(this._themeClassFromOption("ui-body-", e.theme)), e.overlayTheme !== n && (i.removeClass(this._themeClassFromOption("ui-overlay-", t.overlayTheme)).addClass(this._themeClassFromOption("ui-overlay-", e.overlayTheme)), this._isOpen && i.addClass("in")), e.shadow !== n && r.toggleClass("ui-overlay-shadow", e.shadow), e.corners !== n && r.toggleClass("ui-corner-all", e.corners), e.transition !== n && (this._currentTransition || this._applyTransition(e.transition)), e.tolerance !== n && this._setTolerance(e.tolerance), e.disabled !== n && e.disabled && this.close(), this._super(e)
                },
                _setTolerance: function(t) {
                    var r, i = {
                        t: 30,
                        r: 15,
                        b: 30,
                        l: 15
                    };
                    if (t !== n) switch (r = String(t).split(","), e.each(r, function(e, t) {
                        r[e] = parseInt(t, 10)
                    }), r.length) {
                        case 1:
                            isNaN(r[0]) || (i.t = i.r = i.b = i.l = r[0]);
                            break;
                        case 2:
                            isNaN(r[0]) || (i.t = i.b = r[0]), isNaN(r[1]) || (i.l = i.r = r[1]);
                            break;
                        case 4:
                            isNaN(r[0]) || (i.t = r[0]), isNaN(r[1]) || (i.r = r[1]), isNaN(r[2]) || (i.b = r[2]), isNaN(r[3]) || (i.l = r[3])
                    }
                    return this._tolerance = i, this
                },
                _clampPopupWidth: function(e) {
                    var t, n = i(this.window),
                        r = {
                            x: this._tolerance.l,
                            y: n.y + this._tolerance.t,
                            cx: n.cx - this._tolerance.l - this._tolerance.r,
                            cy: n.cy - this._tolerance.t - this._tolerance.b
                        };
                    return e || this._ui.container.css("max-width", r.cx), t = {
                        cx: this._ui.container.outerWidth(!0),
                        cy: this._ui.container.outerHeight(!0)
                    }, {
                        rc: r,
                        menuSize: t
                    }
                },
                _calculateFinalLocation: function(e, t) {
                    var n, i = t.rc,
                        s = t.menuSize;
                    return n = {
                        left: r(i.cx, s.cx, i.x, e.x),
                        top: r(i.cy, s.cy, i.y, e.y)
                    }, n.top = Math.max(0, n.top), n.top -= Math.min(n.top, Math.max(0, n.top + s.cy - this.document.height())), n
                },
                _placementCoords: function(e) {
                    return this._calculateFinalLocation(e, this._clampPopupWidth())
                },
                _createPrerequisites: function(t, n, r) {
                    var i, s = this;
                    i = {
                        screen: e.Deferred(),
                        container: e.Deferred()
                    }, i.screen.then(function() {
                        i === s._prerequisites && t()
                    }), i.container.then(function() {
                        i === s._prerequisites && n()
                    }), e.when(i.screen, i.container).done(function() {
                        i === s._prerequisites && (s._prerequisites = null, r())
                    }), s._prerequisites = i
                },
                _animate: function(t) {
                    return this._ui.screen.removeClass(t.classToRemove).addClass(t.screenClassToAdd), t.prerequisites.screen.resolve(), t.transition && "none" !== t.transition && (t.applyTransition && this._applyTransition(t.transition), this._fallbackTransition) ? (this._ui.container.animationComplete(e.proxy(t.prerequisites.container, "resolve")).addClass(t.containerClassToAdd).removeClass(t.classToRemove), void 0) : (this._ui.container.removeClass(t.classToRemove), t.prerequisites.container.resolve(), void 0)
                },
                _desiredCoords: function(t) {
                    var n, r = null,
                        s = i(this.window),
                        o = t.x,
                        u = t.y,
                        f = t.positionTo;
                    if (f && "origin" !== f)
                        if ("window" === f) o = s.cx / 2 + s.x, u = s.cy / 2 + s.y;
                        else {
                            try {
                                r = e(f)
                            } catch (l) {
                                r = null
                            }
                            r && (r.filter(":visible"), 0 === r.length && (r = null))
                        }
                    return r && (n = r.offset(), o = n.left + r.outerWidth() / 2, u = n.top + r.outerHeight() / 2), ("number" !== e.type(o) || isNaN(o)) && (o = s.cx / 2 + s.x), ("number" !== e.type(u) || isNaN(u)) && (u = s.cy / 2 + s.y), {
                        x: o,
                        y: u
                    }
                },
                _reposition: function(e) {
                    e = {
                        x: e.x,
                        y: e.y,
                        positionTo: e.positionTo
                    }, this._trigger("beforeposition", n, e), this._ui.container.offset(this._placementCoords(this._desiredCoords(e)))
                },
                reposition: function(e) {
                    this._isOpen && this._reposition(e)
                },
                _openPrerequisitesComplete: function() {
                    var e = this.element.attr("id");
                    this._ui.container.addClass("ui-popup-active"), this._isOpen = !0, this._resizeScreen(), this._ui.container.attr("tabindex", "0").focus(), this._ignoreResizeEvents(), e && this.document.find("[aria-haspopup='true'][aria-owns='" + e + "']").attr("aria-expanded", !0), this._trigger("afteropen")
                },
                _open: function(t) {
                    var n = e.extend({}, this.options, t),
                        r = function() {
                            var e = navigator.userAgent,
                                t = e.match(/AppleWebKit\/([0-9\.]+)/),
                                n = !!t && t[1],
                                r = e.match(/Android (\d+(?:\.\d+))/),
                                i = !!r && r[1],
                                s = e.indexOf("Chrome") > -1;
                            return null !== r && "4.0" === i && n && n > 534.13 && !s ? !0 : !1
                        }();
                    this._createPrerequisites(e.noop, e.noop, e.proxy(this, "_openPrerequisitesComplete")), this._currentTransition = n.transition, this._applyTransition(n.transition), this._ui.screen.removeClass("ui-screen-hidden"), this._ui.container.removeClass("ui-popup-truncate"), this._reposition(n), this._ui.container.removeClass("ui-popup-hidden"), this.options.overlayTheme && r && this.element.closest(".ui-page").addClass("ui-popup-open"), this._animate({
                        additionalCondition: !0,
                        transition: n.transition,
                        classToRemove: "",
                        screenClassToAdd: "in",
                        containerClassToAdd: "in",
                        applyTransition: !1,
                        prerequisites: this._prerequisites
                    })
                },
                _closePrerequisiteScreen: function() {
                    this._ui.screen.removeClass("out").addClass("ui-screen-hidden")
                },
                _closePrerequisiteContainer: function() {
                    this._ui.container.removeClass("reverse out").addClass("ui-popup-hidden ui-popup-truncate").removeAttr("style")
                },
                _closePrerequisitesDone: function() {
                    var t = this._ui.container,
                        r = this.element.attr("id");
                    t.removeAttr("tabindex"), e.mobile.popup.active = n, e(":focus", t[0]).add(t[0]).blur(), r && this.document.find("[aria-haspopup='true'][aria-owns='" + r + "']").attr("aria-expanded", !1), this._trigger("afterclose")
                },
                _close: function(t) {
                    this._ui.container.removeClass("ui-popup-active"), this._page.removeClass("ui-popup-open"), this._isOpen = !1, this._createPrerequisites(e.proxy(this, "_closePrerequisiteScreen"), e.proxy(this, "_closePrerequisiteContainer"), e.proxy(this, "_closePrerequisitesDone")), this._animate({
                        additionalCondition: this._ui.screen.hasClass("in"),
                        transition: t ? "none" : this._currentTransition,
                        classToRemove: "in",
                        screenClassToAdd: "out",
                        containerClassToAdd: "reverse out",
                        applyTransition: !0,
                        prerequisites: this._prerequisites
                    })
                },
                _unenhance: function() {
                    this.options.enhanced || (this._setOptions({
                        theme: e.mobile.popup.prototype.options.theme
                    }), this.element.detach().insertAfter(this._ui.placeholder).removeClass("ui-popup ui-overlay-shadow ui-corner-all ui-body-inherit"), this._ui.screen.remove(), this._ui.container.remove(), this._ui.placeholder.remove())
                },
                _destroy: function() {
                    return e.mobile.popup.active === this ? (this.element.one("popupafterclose", e.proxy(this, "_unenhance")), this.close()) : this._unenhance(), this
                },
                _closePopup: function(n, r) {
                    var i, s, o = this.options,
                        u = !1;
                    n && n.isDefaultPrevented() || e.mobile.popup.active !== this || (t.scrollTo(0, this._scrollTop), n && "pagebeforechange" === n.type && r && (i = "string" == typeof r.toPage ? r.toPage : r.toPage.jqmData("url"), i = e.mobile.path.parseUrl(i), s = i.pathname + i.search + i.hash, this._myUrl !== e.mobile.path.makeUrlAbsolute(s) ? u = !0 : n.preventDefault()), this.window.off(o.closeEvents), this.element.undelegate(o.closeLinkSelector, o.closeLinkEvents), this._close(u))
                },
                _bindContainerClose: function() {
                    this.window.on(this.options.closeEvents, e.proxy(this, "_closePopup"))
                },
                widget: function() {
                    return this._ui.container
                },
                open: function(t) {
                    var n, r, i, s, o, u, f = this,
                        l = this.options;
                    return e.mobile.popup.active || l.disabled ? this : (e.mobile.popup.active = this, this._scrollTop = this.window.scrollTop(), l.history ? (u = e.mobile.navigate.history, r = e.mobile.dialogHashKey, i = e.mobile.activePage, s = i ? i.hasClass("ui-dialog") : !1, this._myUrl = n = u.getActive().url, (o = n.indexOf(r) > -1 && !s && u.activeIndex > 0) ? (f._open(t), f._bindContainerClose(), this) : (-1 !== n.indexOf(r) || s ? n = e.mobile.path.parseLocation().hash + r : n += n.indexOf("#") > -1 ? r : "#" + r, 0 === u.activeIndex && n === u.initialDst && (n += r), this.window.one("beforenavigate", function(e) {
                        e.preventDefault(), f._open(t), f._bindContainerClose()
                    }), this.urlAltered = !0, e.mobile.navigate(n, {
                        role: "dialog"
                    }), this)) : (f._open(t), f._bindContainerClose(), f.element.delegate(l.closeLinkSelector, l.closeLinkEvents, function(e) {
                        f.close(), e.preventDefault()
                    }), this))
                },
                close: function() {
                    return e.mobile.popup.active !== this ? this : (this._scrollTop = this.window.scrollTop(), this.options.history && this.urlAltered ? (e.mobile.back(), this.urlAltered = !1) : this._closePopup(), this)
                }
            }), e.mobile.popup.handleLink = function(t) {
                var n, r = e.mobile.path,
                    i = e(r.hashToSelector(r.parseUrl(t.attr("href")).hash)).first();
                i.length > 0 && i.data("mobile-popup") && (n = t.offset(), i.popup("open", {
                    x: n.left + t.outerWidth() / 2,
                    y: n.top + t.outerHeight() / 2,
                    transition: t.jqmData("transition"),
                    positionTo: t.jqmData("position-to")
                })), setTimeout(function() {
                    t.removeClass(e.mobile.activeBtnClass)
                }, 300)
            }, e.mobile.document.on("pagebeforechange", function(t, n) {
                "popup" === n.options.role && (e.mobile.popup.handleLink(n.options.link), t.preventDefault())
            })
        }(e),
        function(e, t) {
            var r = ".ui-disabled,.ui-state-disabled,.ui-li-divider,.ui-screen-hidden,:jqmData(role='placeholder')",
                i = function(e, t, n) {
                    var i = e[n + "All"]().not(r).first();
                    i.length && (t.blur().attr("tabindex", "-1"), i.find("a").first().focus())
                };
            e.widget("mobile.selectmenu", e.mobile.selectmenu, {
                _create: function() {
                    var e = this.options;
                    return e.nativeMenu = e.nativeMenu || this.element.parents(":jqmData(role='popup'),:mobile-popup").length > 0, this._super()
                },
                _handleSelectFocus: function() {
                    this.element.blur(), this.button.focus()
                },
                _handleKeydown: function(e) {
                    this._super(e), this._handleButtonVclickKeydown(e)
                },
                _handleButtonVclickKeydown: function(t) {
                    this.options.disabled || this.isOpen || ("vclick" === t.type || t.keyCode && (t.keyCode === e.mobile.keyCode.ENTER || t.keyCode === e.mobile.keyCode.SPACE)) && (this._decideFormat(), "overlay" === this.menuType ? this.button.attr("href", "#" + this.popupId).attr("data-" + (e.mobile.ns || "") + "rel", "popup") : this.button.attr("href", "#" + this.dialogId).attr("data-" + (e.mobile.ns || "") + "rel", "dialog"), this.isOpen = !0)
                },
                _handleListFocus: function(t) {
                    var n = "focusin" === t.type ? {
                        tabindex: "0",
                        event: "vmouseover"
                    } : {
                        tabindex: "-1",
                        event: "vmouseout"
                    };
                    e(t.target).attr("tabindex", n.tabindex).trigger(n.event)
                },
                _handleListKeydown: function(t) {
                    var n = e(t.target),
                        r = n.closest("li");
                    switch (t.keyCode) {
                        case 38:
                            return i(r, n, "prev"), !1;
                        case 40:
                            return i(r, n, "next"), !1;
                        case 13:
                        case 32:
                            return n.trigger("click"), !1
                    }
                },
                _handleMenuPageHide: function() {
                    this.thisPage.page("bindRemove")
                },
                _handleHeaderCloseClick: function() {
                    return "overlay" === this.menuType ? (this.close(), !1) : void 0
                },
                build: function() {
                    var n, r, i, s, o, u, f, l, c, h, p, d, v, m, g, y, w, E, S, x = this.options;
                    return x.nativeMenu ? this._super() : (S = this, n = this.selectId, r = n + "-listbox", i = n + "-dialog", s = this.label, o = this.element.closest(".ui-page"), u = this.element[0].multiple, f = n + "-menu", l = x.theme ? " data-" + e.mobile.ns + "theme='" + x.theme + "'" : "", c = x.overlayTheme ? " data-" + e.mobile.ns + "theme='" + x.overlayTheme + "'" : "", h = x.dividerTheme && u ? " data-" + e.mobile.ns + "divider-theme='" + x.dividerTheme + "'" : "", p = e("<div data-" + e.mobile.ns + "role='dialog' class='ui-selectmenu' id='" + i + "'" + l + c + ">" + "<div data-" + e.mobile.ns + "role='header'>" + "<div class='ui-title'>" + s.getEncodedText() + "</div>" + "</div>" + "<div data-" + e.mobile.ns + "role='content'></div>" + "</div>"), d = e("<div id='" + r + "' class='ui-selectmenu'>").insertAfter(this.select).popup({
                        theme: x.overlayTheme
                    }), v = e("<ul class='ui-selectmenu-list' id='" + f + "' role='listbox' aria-labelledby='" + this.buttonId + "'" + l + h + ">").appendTo(d), m = e("<div class='ui-header ui-bar-" + (x.theme ? x.theme : "inherit") + "'>").prependTo(d), g = e("<h1 class='ui-title'>").appendTo(m), this.isMultiple && (E = e("<a>", {
                        role: "button",
                        text: x.closeText,
                        href: "#",
                        "class": "ui-btn ui-corner-all ui-btn-left ui-btn-icon-notext ui-icon-delete"
                    }).appendTo(m)), e.extend(this, {
                        selectId: n,
                        menuId: f,
                        popupId: r,
                        dialogId: i,
                        thisPage: o,
                        menuPage: p,
                        label: s,
                        isMultiple: u,
                        theme: x.theme,
                        listbox: d,
                        list: v,
                        header: m,
                        headerTitle: g,
                        headerClose: E,
                        menuPageContent: y,
                        menuPageClose: w,
                        placeholder: ""
                    }), this.refresh(), this._origTabIndex === t && (this._origTabIndex = null === this.select[0].getAttribute("tabindex") ? !1 : this.select.attr("tabindex")), this.select.attr("tabindex", "-1"), this._on(this.select, {
                        focus: "_handleSelectFocus"
                    }), this._on(this.button, {
                        vclick: "_handleButtonVclickKeydown"
                    }), this.list.attr("role", "listbox"), this._on(this.list, {
                        focusin: "_handleListFocus",
                        focusout: "_handleListFocus",
                        keydown: "_handleListKeydown"
                    }), this.list.delegate("li:not(.ui-disabled,.ui-state-disabled,.ui-li-divider)", "click", function(t) {
                        var n = S.select[0].selectedIndex,
                            r = e.mobile.getAttribute(this, "option-index"),
                            i = S._selectOptions().eq(r)[0];
                        i.selected = S.isMultiple ? !i.selected : !0, S.isMultiple && e(this).find("a").toggleClass("ui-checkbox-on", i.selected).toggleClass("ui-checkbox-off", !i.selected), (S.isMultiple || n !== r) && S.select.trigger("change"), S.isMultiple ? S.list.find("li:not(.ui-li-divider)").eq(r).find("a").first().focus() : S.close(), t.preventDefault()
                    }), this._on(this.menuPage, {
                        pagehide: "_handleMenuPageHide"
                    }), this._on(this.listbox, {
                        popupafterclose: "close"
                    }), this.isMultiple && this._on(this.headerClose, {
                        click: "_handleHeaderCloseClick"
                    }), this)
                },
                _isRebuildRequired: function() {
                    var e = this.list.find("li"),
                        t = this._selectOptions().not(".ui-screen-hidden");
                    return t.text() !== e.text()
                },
                selected: function() {
                    return this._selectOptions().filter(":selected:not( :jqmData(placeholder='true') )")
                },
                refresh: function(t) {
                    var n, r;
                    return this.options.nativeMenu ? this._super(t) : (n = this, (t || this._isRebuildRequired()) && n._buildList(), r = this.selectedIndices(), n.setButtonText(), n.setButtonCount(), n.list.find("li:not(.ui-li-divider)").find("a").removeClass(e.mobile.activeBtnClass).end().attr("aria-selected", !1).each(function(t) {
                        if (e.inArray(t, r) > -1) {
                            var i = e(this);
                            i.attr("aria-selected", !0), n.isMultiple ? i.find("a").removeClass("ui-checkbox-off").addClass("ui-checkbox-on") : i.hasClass("ui-screen-hidden") ? i.next().find("a").addClass(e.mobile.activeBtnClass) : i.find("a").addClass(e.mobile.activeBtnClass)
                        }
                    }), void 0)
                },
                close: function() {
                    if (!this.options.disabled && this.isOpen) {
                        var e = this;
                        "page" === e.menuType ? (e.menuPage.dialog("close"), e.list.appendTo(e.listbox)) : e.listbox.popup("close"), e._focusButton(), e.isOpen = !1
                    }
                },
                open: function() {
                    this.button.click()
                },
                _focusMenuItem: function() {
                    var t = this.list.find("a." + e.mobile.activeBtnClass);
                    0 === t.length && (t = this.list.find("li:not(" + r + ") a.ui-btn")), t.first().focus()
                },
                _decideFormat: function() {
                    var t = this,
                        n = this.window,
                        r = t.list.parent(),
                        i = r.outerHeight(),
                        s = n.scrollTop(),
                        o = t.button.offset().top,
                        u = n.height();
                    i > u - 80 || !e.support.scrollTop ? (t.menuPage.appendTo(e.mobile.pageContainer).page(), t.menuPageContent = t.menuPage.find(".ui-content"), t.menuPageClose = t.menuPage.find(".ui-header a"), t.thisPage.unbind("pagehide.remove"), 0 === s && o > u && t.thisPage.one("pagehide", function() {
                        e(this).jqmData("lastScroll", o)
                    }), t.menuPage.one({
                        pageshow: e.proxy(this, "_focusMenuItem"),
                        pagehide: e.proxy(this, "close")
                    }), t.menuType = "page", t.menuPageContent.append(t.list), t.menuPage.find("div .ui-title").text(t.label.text())) : (t.menuType = "overlay", t.listbox.one({
                        popupafteropen: e.proxy(this, "_focusMenuItem")
                    }))
                },
                _buildList: function() {
                    var t, r, i, s, o, u, f, l, h, p, d, v, m, g, y = this,
                        b = this.options,
                        w = this.placeholder,
                        E = !0,
                        S = "false",
                        x = "data-" + e.mobile.ns,
                        T = x + "option-index",
                        N = x + "icon",
                        C = x + "role",
                        k = x + "placeholder",
                        L = n.createDocumentFragment(),
                        A = !1;
                    for (y.list.empty().filter(".ui-listview").listview("destroy"), t = this._selectOptions(), r = t.length, i = this.select[0], o = 0; r > o; o++, A = !1) u = t[o], f = e(u), f.hasClass("ui-screen-hidden") || (l = u.parentNode, h = f.text(), p = n.createElement("a"), d = [], p.setAttribute("href", "#"), p.appendChild(n.createTextNode(h)), l !== i && "optgroup" === l.nodeName.toLowerCase() && (v = l.getAttribute("label"), v !== s && (m = n.createElement("li"), m.setAttribute(C, "list-divider"), m.setAttribute("role", "option"), m.setAttribute("tabindex", "-1"), m.appendChild(n.createTextNode(v)), L.appendChild(m), s = v)), !E || u.getAttribute("value") && 0 !== h.length && !f.jqmData("placeholder") || (E = !1, A = !0, null === u.getAttribute(k) && (this._removePlaceholderAttr = !0), u.setAttribute(k, !0), b.hidePlaceholderMenuItems && d.push("ui-screen-hidden"), w !== h && (w = y.placeholder = h)), g = n.createElement("li"), u.disabled && (d.push("ui-state-disabled"), g.setAttribute("aria-disabled", !0)), g.setAttribute(T, o), g.setAttribute(N, S), A && g.setAttribute(k, !0), g.className = d.join(" "), g.setAttribute("role", "option"), p.setAttribute("tabindex", "-1"), this.isMultiple && e(p).addClass("ui-btn ui-checkbox-off ui-btn-icon-right"), g.appendChild(p), L.appendChild(g));
                    y.list[0].appendChild(L), this.isMultiple || w.length ? this.headerTitle.text(this.placeholder) : this.header.addClass("ui-screen-hidden"), y.list.listview()
                },
                _button: function() {
                    return this.options.nativeMenu ? this._super() : e("<a>", {
                        href: "#",
                        role: "button",
                        id: this.buttonId,
                        "aria-haspopup": "true",
                        "aria-owns": this.menuId
                    })
                },
                _destroy: function() {
                    this.options.nativeMenu || (this.close(), this._origTabIndex !== t && (this._origTabIndex !== !1 ? this.select.attr("tabindex", this._origTabIndex) : this.select.removeAttr("tabindex")), this._removePlaceholderAttr && this._selectOptions().removeAttr("data-" + e.mobile.ns + "placeholder"), this.listbox.remove(), this.menuPage.remove()), this._super()
                }
            })
        }(e),
        function(e, t) {
            function n(e, t) {
                var n = t ? t : [];
                return n.push("ui-btn"), e.theme && n.push("ui-btn-" + e.theme), e.icon && (n = n.concat(["ui-icon-" + e.icon, "ui-btn-icon-" + e.iconpos]), e.iconshadow && n.push("ui-shadow-icon")), e.inline && n.push("ui-btn-inline"), e.shadow && n.push("ui-shadow"), e.corners && n.push("ui-corner-all"), e.mini && n.push("ui-mini"), n
            }

            function r(e) {
                var n, r, i, o = !1,
                    u = !0,
                    a = {
                        icon: "",
                        inline: !1,
                        shadow: !1,
                        corners: !1,
                        iconshadow: !1,
                        mini: !1
                    },
                    l = [];
                for (e = e.split(" "), n = 0; n < e.length; n++) i = !0, r = s[e[n]], r !== t ? (i = !1, a[r] = !0) : 0 === e[n].indexOf("ui-btn-icon-") ? (i = !1, u = !1, a.iconpos = e[n].substring(12)) : 0 === e[n].indexOf("ui-icon-") ? (i = !1, a.icon = e[n].substring(8)) : 0 === e[n].indexOf("ui-btn-") && 8 === e[n].length ? (i = !1, a.theme = e[n].substring(7)) : "ui-btn" === e[n] && (i = !1, o = !0), i && l.push(e[n]);
                return u && (a.icon = ""), {
                    options: a,
                    unknownClasses: l,
                    alreadyEnhanced: o
                }
            }

            function i(e) {
                return "-" + e.toLowerCase()
            }
            var s = {
                    "ui-shadow": "shadow",
                    "ui-corner-all": "corners",
                    "ui-btn-inline": "inline",
                    "ui-shadow-icon": "iconshadow",
                    "ui-mini": "mini"
                },
                o = function() {
                    var n = e.mobile.getAttribute.apply(this, arguments);
                    return null == n ? t : n
                },
                u = /[A-Z]/g;
            e.fn.buttonMarkup = function(s, f) {
                var l, p, v, m, y, w = e.fn.buttonMarkup.defaults;
                for (l = 0; l < this.length; l++) {
                    if (v = this[l], p = f ? {
                            alreadyEnhanced: !1,
                            unknownClasses: []
                        } : r(v.className), m = e.extend({}, p.alreadyEnhanced ? p.options : {}, s), !p.alreadyEnhanced)
                        for (y in w) m[y] === t && (m[y] = o(v, y.replace(u, i)));
                    v.className = n(e.extend({}, w, m), p.unknownClasses).join(" "), "button" !== v.tagName.toLowerCase() && v.setAttribute("role", "button")
                }
                return this
            }, e.fn.buttonMarkup.defaults = {
                icon: "",
                iconpos: "left",
                theme: null,
                inline: !1,
                shadow: !0,
                corners: !0,
                iconshadow: !1,
                mini: !1
            }, e.extend(e.fn.buttonMarkup, {
                initSelector: "a:jqmData(role='button'), .ui-bar > a, .ui-bar > :jqmData(role='controlgroup') > a, button"
            })
        }(e),
        function(e, t) {
            e.widget("mobile.controlgroup", e.extend({
                options: {
                    enhanced: !1,
                    theme: null,
                    shadow: !1,
                    corners: !0,
                    excludeInvisible: !0,
                    type: "vertical",
                    mini: !1
                },
                _create: function() {
                    var t = this.element,
                        n = this.options;
                    e.fn.buttonMarkup && this.element.find(e.fn.buttonMarkup.initSelector).buttonMarkup(), e.each(this._childWidgets, e.proxy(function(t, n) {
                        e.mobile[n] && this.element.find(e.mobile[n].initSelector).not(e.mobile.page.prototype.keepNativeSelector())[n]()
                    }, this)), e.extend(this, {
                        _ui: null,
                        _initialRefresh: !0
                    }), this._ui = n.enhanced ? {
                        groupLegend: t.children(".ui-controlgroup-label").children(),
                        childWrapper: t.children(".ui-controlgroup-controls")
                    } : this._enhance()
                },
                _childWidgets: ["checkboxradio", "selectmenu", "button"],
                _themeClassFromOption: function(e) {
                    return e ? "none" === e ? "" : "ui-group-theme-" + e : ""
                },
                _enhance: function() {
                    var t = this.element,
                        n = this.options,
                        r = {
                            groupLegend: t.children("legend"),
                            childWrapper: t.addClass("ui-controlgroup ui-controlgroup-" + ("horizontal" === n.type ? "horizontal" : "vertical") + " " + this._themeClassFromOption(n.theme) + " " + (n.corners ? "ui-corner-all " : "") + (n.mini ? "ui-mini " : "")).wrapInner("<div class='ui-controlgroup-controls " + (n.shadow === !0 ? "ui-shadow" : "") + "'></div>").children()
                        };
                    return r.groupLegend.length > 0 && e("<div role='heading' class='ui-controlgroup-label'></div>").append(r.groupLegend).prependTo(t), r
                },
                _init: function() {
                    this.refresh()
                },
                _setOptions: function(e) {
                    var n, r, i = this.element;
                    return e.type !== t && (i.removeClass("ui-controlgroup-horizontal ui-controlgroup-vertical").addClass("ui-controlgroup-" + ("horizontal" === e.type ? "horizontal" : "vertical")), n = !0), e.theme !== t && i.removeClass(this._themeClassFromOption(this.options.theme)).addClass(this._themeClassFromOption(e.theme)), e.corners !== t && i.toggleClass("ui-corner-all", e.corners), e.mini !== t && i.toggleClass("ui-mini", e.mini), e.shadow !== t && this._ui.childWrapper.toggleClass("ui-shadow", e.shadow), e.excludeInvisible !== t && (this.options.excludeInvisible = e.excludeInvisible, n = !0), r = this._super(e), n && this.refresh(), r
                },
                container: function() {
                    return this._ui.childWrapper
                },
                refresh: function() {
                    var t = this.container(),
                        n = t.find(".ui-btn").not(".ui-slider-handle"),
                        r = this._initialRefresh;
                    e.mobile.checkboxradio && t.find(":mobile-checkboxradio").checkboxradio("refresh"), this._addFirstLastClasses(n, this.options.excludeInvisible ? this._getVisibles(n, r) : n, r), this._initialRefresh = !1
                },
                _destroy: function() {
                    var e, t, n = this.options;
                    return n.enhanced ? this : (e = this._ui, t = this.element.removeClass("ui-controlgroup ui-controlgroup-horizontal ui-controlgroup-vertical ui-corner-all ui-mini " + this._themeClassFromOption(n.theme)).find(".ui-btn").not(".ui-slider-handle"), this._removeFirstLastClasses(t), e.groupLegend.unwrap(), e.childWrapper.children().unwrap(), void 0)
                }
            }, e.mobile.behaviors.addFirstLastClasses))
        }(e),
        function(e, t) {
            e.widget("mobile.toolbar", {
                initSelector: ":jqmData(role='footer'), :jqmData(role='header')",
                options: {
                    theme: null,
                    addBackBtn: !1,
                    backBtnTheme: null,
                    backBtnText: "Back"
                },
                _create: function() {
                    var t, n, r = this.element.is(":jqmData(role='header')") ? "header" : "footer",
                        i = this.element.closest(".ui-page");
                    0 === i.length && (i = !1, this._on(this.document, {
                        pageshow: "refresh"
                    })), e.extend(this, {
                        role: r,
                        page: i,
                        leftbtn: t,
                        rightbtn: n,
                        backBtn: null
                    }), this.element.attr("role", "header" === r ? "banner" : "contentinfo").addClass("ui-" + r), this.refresh(), this._setOptions(this.options)
                },
                _setOptions: function(n) {
                    if (n.addBackBtn !== t && (this.options.addBackBtn && "header" === this.role && e(".ui-page").length > 1 && this.page[0].getAttribute("data-" + e.mobile.ns + "url") !== e.mobile.path.stripHash(location.hash) && !this.leftbtn ? this._addBackButton() : this.element.find(".ui-toolbar-back-btn").remove()), null != n.backBtnTheme && this.element.find(".ui-toolbar-back-btn").addClass("ui-btn ui-btn-" + n.backBtnTheme), n.backBtnText !== t && this.element.find(".ui-toolbar-back-btn .ui-btn-text").text(n.backBtnText), n.theme !== t) {
                        var r = this.options.theme ? this.options.theme : "inherit",
                            i = n.theme ? n.theme : "inherit";
                        this.element.removeClass("ui-bar-" + r).addClass("ui-bar-" + i)
                    }
                    this._super(n)
                },
                refresh: function() {
                    "header" === this.role && this._addHeaderButtonClasses(), this.page || (this._setRelative(), "footer" === this.role && this.element.appendTo("body")), this._addHeadingClasses(), this._btnMarkup()
                },
                _setRelative: function() {
                    e("[data-" + e.mobile.ns + "role='page']").css({
                        position: "relative"
                    })
                },
                _btnMarkup: function() {
                    this.element.children("a").attr("data-" + e.mobile.ns + "role", "button"), this.element.trigger("create")
                },
                _addHeaderButtonClasses: function() {
                    var e = this.element.children("a, button");
                    this.leftbtn = e.hasClass("ui-btn-left"), this.rightbtn = e.hasClass("ui-btn-right"), this.leftbtn = this.leftbtn || e.eq(0).not(".ui-btn-right").addClass("ui-btn-left").length, this.rightbtn = this.rightbtn || e.eq(1).addClass("ui-btn-right").length
                },
                _addBackButton: function() {
                    var t, n = this.options;
                    this.backBtn || (t = n.backBtnTheme || n.theme, this.backBtn = e("<a role='button' href='javascript:void(0);' class='ui-btn ui-corner-all ui-shadow ui-btn-left " + (t ? "ui-btn-" + t + " " : "") + "ui-toolbar-back-btn ui-icon-carat-l ui-btn-icon-left' " + "data-" + e.mobile.ns + "rel='back'>" + n.backBtnText + "</a>").prependTo(this.element))
                },
                _addHeadingClasses: function() {
                    this.element.children("h1, h2, h3, h4, h5, h6").addClass("ui-title").attr({
                        role: "heading",
                        "aria-level": "1"
                    })
                }
            })
        }(e),
        function(e, t) {
            e.widget("mobile.toolbar", e.mobile.toolbar, {
                options: {
                    position: null,
                    visibleOnPageShow: !0,
                    disablePageZoom: !0,
                    transition: "slide",
                    fullscreen: !1,
                    tapToggle: !0,
                    tapToggleBlacklist: "a, button, input, select, textarea, .ui-header-fixed, .ui-footer-fixed, .ui-flipswitch, .ui-popup, .ui-panel, .ui-panel-dismiss-open",
                    hideDuringFocus: "input, textarea, select",
                    updatePagePadding: !0,
                    trackPersistentToolbars: !0,
                    supportBlacklist: function() {
                        return !e.support.fixedPosition
                    }
                },
                _create: function() {
                    this._super(), "fixed" !== this.options.position || this.options.supportBlacklist() || this._makeFixed()
                },
                _makeFixed: function() {
                    this.element.addClass("ui-" + this.role + "-fixed"), this.updatePagePadding(), this._addTransitionClass(), this._bindPageEvents(), this._bindToggleHandlers(), this._setOptions(this.options)
                },
                _setOptions: function(n) {
                    if ("fixed" === n.position && "fixed" !== this.options.position && this._makeFixed(), "fixed" === this.options.position && !this.options.supportBlacklist()) {
                        var r = this.page ? this.page : e(".ui-page-active").length > 0 ? e(".ui-page-active") : e(".ui-page").eq(0);
                        n.fullscreen !== t && (n.fullscreen ? (this.element.addClass("ui-" + this.role + "-fullscreen"), r.addClass("ui-page-" + this.role + "-fullscreen")) : (this.element.removeClass("ui-" + this.role + "-fullscreen"), r.removeClass("ui-page-" + this.role + "-fullscreen").addClass("ui-page-" + this.role + "-fixed")))
                    }
                    this._super(n)
                },
                _addTransitionClass: function() {
                    var e = this.options.transition;
                    e && "none" !== e && ("slide" === e && (e = this.element.hasClass("ui-header") ? "slidedown" : "slideup"), this.element.addClass(e))
                },
                _bindPageEvents: function() {
                    var e = this.page ? this.element.closest(".ui-page") : this.document;
                    this._on(e, {
                        pagebeforeshow: "_handlePageBeforeShow",
                        webkitAnimationStart: "_handleAnimationStart",
                        animationstart: "_handleAnimationStart",
                        updatelayout: "_handleAnimationStart",
                        pageshow: "_handlePageShow",
                        pagebeforehide: "_handlePageBeforeHide"
                    })
                },
                _handlePageBeforeShow: function() {
                    var t = this.options;
                    t.disablePageZoom && e.mobile.zoom.disable(!0), t.visibleOnPageShow || this.hide(!0)
                },
                _handleAnimationStart: function() {
                    this.options.updatePagePadding && this.updatePagePadding(this.page ? this.page : ".ui-page-active")
                },
                _handlePageShow: function() {
                    this.updatePagePadding(this.page ? this.page : ".ui-page-active"), this.options.updatePagePadding && this._on(this.window, {
                        throttledresize: "updatePagePadding"
                    })
                },
                _handlePageBeforeHide: function(t, n) {
                    var r, i, s, o, u = this.options;
                    u.disablePageZoom && e.mobile.zoom.enable(!0), u.updatePagePadding && this._off(this.window, "throttledresize"), u.trackPersistentToolbars && (r = e(".ui-footer-fixed:jqmData(id)", this.page), i = e(".ui-header-fixed:jqmData(id)", this.page), s = r.length && n.nextPage && e(".ui-footer-fixed:jqmData(id='" + r.jqmData("id") + "')", n.nextPage) || e(), o = i.length && n.nextPage && e(".ui-header-fixed:jqmData(id='" + i.jqmData("id") + "')", n.nextPage) || e(), (s.length || o.length) && (s.add(o).appendTo(e.mobile.pageContainer), n.nextPage.one("pageshow", function() {
                        o.prependTo(this), s.appendTo(this)
                    })))
                },
                _visible: !0,
                updatePagePadding: function(n) {
                    var r = this.element,
                        i = "header" === this.role,
                        s = parseFloat(r.css(i ? "top" : "bottom"));
                    this.options.fullscreen || (n = n && n.type === t && n || this.page || r.closest(".ui-page"), n = this.page ? this.page : ".ui-page-active", e(n).css("padding-" + (i ? "top" : "bottom"), r.outerHeight() + s))
                },
                _useTransition: function(t) {
                    var n = this.window,
                        r = this.element,
                        i = n.scrollTop(),
                        s = r.height(),
                        o = this.page ? r.closest(".ui-page").height() : e(".ui-page-active").height(),
                        u = e.mobile.getScreenHeight();
                    return !t && (this.options.transition && "none" !== this.options.transition && ("header" === this.role && !this.options.fullscreen && i > s || "footer" === this.role && !this.options.fullscreen && o - s > i + u) || this.options.fullscreen)
                },
                show: function(e) {
                    var t = "ui-fixed-hidden",
                        n = this.element;
                    this._useTransition(e) ? n.removeClass("out " + t).addClass("in").animationComplete(function() {
                        n.removeClass("in")
                    }) : n.removeClass(t), this._visible = !0
                },
                hide: function(e) {
                    var t = "ui-fixed-hidden",
                        n = this.element,
                        r = "out" + ("slide" === this.options.transition ? " reverse" : "");
                    this._useTransition(e) ? n.addClass(r).removeClass("in").animationComplete(function() {
                        n.addClass(t).removeClass(r)
                    }) : n.addClass(t).removeClass(r), this._visible = !1
                },
                toggle: function() {
                    this[this._visible ? "hide" : "show"]()
                },
                _bindToggleHandlers: function() {
                    var t, n, r = this,
                        i = r.options,
                        s = !0,
                        o = this.page ? this.page : e(".ui-page");
                    o.bind("vclick", function(t) {
                        i.tapToggle && !e(t.target).closest(i.tapToggleBlacklist).length && r.toggle()
                    }).bind("focusin focusout", function(o) {
                        screen.width < 1025 && e(o.target).is(i.hideDuringFocus) && !e(o.target).closest(".ui-header-fixed, .ui-footer-fixed").length && ("focusout" !== o.type || s ? "focusin" === o.type && s && (clearTimeout(t), s = !1, n = setTimeout(function() {
                            r.hide()
                        }, 0)) : (s = !0, clearTimeout(n), t = setTimeout(function() {
                            r.show()
                        }, 0)))
                    })
                },
                _setRelative: function() {
                    "fixed" !== this.options.position && e("[data-" + e.mobile.ns + "role='page']").css({
                        position: "relative"
                    })
                },
                _destroy: function() {
                    var e = this.element,
                        t = e.hasClass("ui-header");
                    e.closest(".ui-page").css("padding-" + (t ? "top" : "bottom"), ""), e.removeClass("ui-header-fixed ui-footer-fixed ui-header-fullscreen ui-footer-fullscreen in out fade slidedown slideup ui-fixed-hidden"), e.closest(".ui-page").removeClass("ui-page-header-fixed ui-page-footer-fixed ui-page-header-fullscreen ui-page-footer-fullscreen")
                }
            })
        }(e),
        function(e) {
            e.widget("mobile.toolbar", e.mobile.toolbar, {
                _makeFixed: function() {
                    this._super(), this._workarounds()
                },
                _workarounds: function() {
                    var e = navigator.userAgent,
                        t = navigator.platform,
                        n = e.match(/AppleWebKit\/([0-9]+)/),
                        r = !!n && n[1],
                        i = null,
                        s = this;
                    if (t.indexOf("iPhone") > -1 || t.indexOf("iPad") > -1 || t.indexOf("iPod") > -1) i = "ios";
                    else {
                        if (!(e.indexOf("Android") > -1)) return;
                        i = "android"
                    }
                    if ("ios" === i) s._bindScrollWorkaround();
                    else {
                        if (!("android" === i && r && 534 > r)) return;
                        s._bindScrollWorkaround(), s._bindListThumbWorkaround()
                    }
                },
                _viewportOffset: function() {
                    var e = this.element,
                        t = e.hasClass("ui-header"),
                        n = Math.abs(e.offset().top - this.window.scrollTop());
                    return t || (n = Math.round(n - this.window.height() + e.outerHeight()) - 60), n
                },
                _bindScrollWorkaround: function() {
                    var e = this;
                    this._on(this.window, {
                        scrollstop: function() {
                            var t = e._viewportOffset();
                            t > 2 && e._visible && e._triggerRedraw()
                        }
                    })
                },
                _bindListThumbWorkaround: function() {
                    this.element.closest(".ui-page").addClass("ui-android-2x-fixed")
                },
                _triggerRedraw: function() {
                    var t = parseFloat(e(".ui-page-active").css("padding-bottom"));
                    e(".ui-page-active").css("padding-bottom", t + 1 + "px"), setTimeout(function() {
                        e(".ui-page-active").css("padding-bottom", t + "px")
                    }, 0)
                },
                destroy: function() {
                    this._super(), this.element.closest(".ui-page-active").removeClass("ui-android-2x-fix")
                }
            })
        }(e),
        function(e, t) {
            function n() {
                var e = i.clone(),
                    t = e.eq(0),
                    n = e.eq(1),
                    r = n.children(),
                    s = r.children();
                return {
                    arEls: n.add(t),
                    gd: t,
                    ct: n,
                    ar: r,
                    bg: s
                }
            }
            var r = e.mobile.browser.oldIE && e.mobile.browser.oldIE <= 8,
                i = e("<div class='ui-popup-arrow-guide'></div><div class='ui-popup-arrow-container" + (r ? " ie" : "") + "'>" + "<div class='ui-popup-arrow'>" + "<div class='ui-popup-arrow-background'></div>" + "</div>" + "</div>"),
                s = Math.sqrt(2) / 2;
            e.widget("mobile.popup", e.mobile.popup, {
                options: {
                    arrow: ""
                },
                _create: function() {
                    var e, t = this._super();
                    return this.options.arrow && (this._ui.arrow = e = this._addArrow()), t
                },
                _addArrow: function() {
                    var e, t = this.options,
                        r = n();
                    return e = this._themeClassFromOption("ui-body-", t.theme), r.ar.addClass(e + (t.shadow ? " ui-overlay-shadow" : "")), r.bg.addClass(e), r.arEls.hide().appendTo(this.element), r
                },
                _unenhance: function() {
                    var e = this._ui.arrow;
                    return e && e.arEls.remove(), this._super()
                },
                _tryAnArrow: function(e, t, n, r, i) {
                    var s, o, u, a = {},
                        f = {};
                    return r.arFull[e.dimKey] > r.guideDims[e.dimKey] ? i : (a[e.fst] = n[e.fst] + (r.arHalf[e.oDimKey] + r.menuHalf[e.oDimKey]) * e.offsetFactor - r.contentBox[e.fst] + (r.clampInfo.menuSize[e.oDimKey] - r.contentBox[e.oDimKey]) * e.arrowOffsetFactor, a[e.snd] = n[e.snd], s = r.result || this._calculateFinalLocation(a, r.clampInfo), o = {
                        x: s.left,
                        y: s.top
                    }, f[e.fst] = o[e.fst] + r.contentBox[e.fst] + e.tipOffset, f[e.snd] = Math.max(s[e.prop] + r.guideOffset[e.prop] + r.arHalf[e.dimKey], Math.min(s[e.prop] + r.guideOffset[e.prop] + r.guideDims[e.dimKey] - r.arHalf[e.dimKey], n[e.snd])), u = Math.abs(n.x - f.x) + Math.abs(n.y - f.y), (!i || u < i.diff) && (f[e.snd] -= r.arHalf[e.dimKey] + s[e.prop] + r.contentBox[e.snd], i = {
                        dir: t,
                        diff: u,
                        result: s,
                        posProp: e.prop,
                        posVal: f[e.snd]
                    }), i)
                },
                _getPlacementState: function(e) {
                    var t, n, r = this._ui.arrow,
                        i = {
                            clampInfo: this._clampPopupWidth(!e),
                            arFull: {
                                cx: r.ct.width(),
                                cy: r.ct.height()
                            },
                            guideDims: {
                                cx: r.gd.width(),
                                cy: r.gd.height()
                            },
                            guideOffset: r.gd.offset()
                        };
                    return t = this.element.offset(), r.gd.css({
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0
                    }), n = r.gd.offset(), i.contentBox = {
                        x: n.left - t.left,
                        y: n.top - t.top,
                        cx: r.gd.width(),
                        cy: r.gd.height()
                    }, r.gd.removeAttr("style"), i.guideOffset = {
                        left: i.guideOffset.left - t.left,
                        top: i.guideOffset.top - t.top
                    }, i.arHalf = {
                        cx: i.arFull.cx / 2,
                        cy: i.arFull.cy / 2
                    }, i.menuHalf = {
                        cx: i.clampInfo.menuSize.cx / 2,
                        cy: i.clampInfo.menuSize.cy / 2
                    }, i
                },
                _placementCoords: function(t) {
                    var n, i, o, u, l, c, h, p = this.options.arrow,
                        v = this._ui.arrow;
                    return v ? (v.arEls.show(), h = {}, n = this._getPlacementState(!0), o = {
                        l: {
                            fst: "x",
                            snd: "y",
                            prop: "top",
                            dimKey: "cy",
                            oDimKey: "cx",
                            offsetFactor: 1,
                            tipOffset: -n.arHalf.cx,
                            arrowOffsetFactor: 0
                        },
                        r: {
                            fst: "x",
                            snd: "y",
                            prop: "top",
                            dimKey: "cy",
                            oDimKey: "cx",
                            offsetFactor: -1,
                            tipOffset: n.arHalf.cx + n.contentBox.cx,
                            arrowOffsetFactor: 1
                        },
                        b: {
                            fst: "y",
                            snd: "x",
                            prop: "left",
                            dimKey: "cx",
                            oDimKey: "cy",
                            offsetFactor: -1,
                            tipOffset: n.arHalf.cy + n.contentBox.cy,
                            arrowOffsetFactor: 1
                        },
                        t: {
                            fst: "y",
                            snd: "x",
                            prop: "left",
                            dimKey: "cx",
                            oDimKey: "cy",
                            offsetFactor: 1,
                            tipOffset: -n.arHalf.cy,
                            arrowOffsetFactor: 0
                        }
                    }, e.each((p === !0 ? "l,t,r,b" : p).split(","), e.proxy(function(e, r) {
                        i = this._tryAnArrow(o[r], r, t, n, i)
                    }, this)), i ? (v.ct.removeClass("ui-popup-arrow-l ui-popup-arrow-t ui-popup-arrow-r ui-popup-arrow-b").addClass("ui-popup-arrow-" + i.dir).removeAttr("style").css(i.posProp, i.posVal).show(), r || (l = this.element.offset(), h[o[i.dir].fst] = v.ct.offset(), h[o[i.dir].snd] = {
                        left: l.left + n.contentBox.x,
                        top: l.top + n.contentBox.y
                    }, u = v.bg.removeAttr("style").css("cx" === o[i.dir].dimKey ? "width" : "height", n.contentBox[o[i.dir].dimKey]).offset(), c = {
                        dx: h.x.left - u.left,
                        dy: h.y.top - u.top
                    }, v.bg.css({
                        left: s * c.dy + s * c.dx,
                        top: s * c.dy - s * c.dx
                    })), i.result) : (v.arEls.hide(), this._super(t))) : this._super(t)
                },
                _setOptions: function(e) {
                    var n, r = this.options.theme,
                        i = this._ui.arrow,
                        s = this._super(e);
                    if (e.arrow !== t) {
                        if (!i && e.arrow) return this._ui.arrow = this._addArrow(), void 0;
                        i && !e.arrow && (i.arEls.remove(), this._ui.arrow = null)
                    }
                    return i = this._ui.arrow, i && (e.theme !== t && (r = this._themeClassFromOption("ui-body-", r), n = this._themeClassFromOption("ui-body-", e.theme), i.ar.removeClass(r).addClass(n), i.bg.removeClass(r).addClass(n)), e.shadow !== t && i.ar.toggleClass("ui-overlay-shadow", e.shadow)), s
                },
                _destroy: function() {
                    var e = this._ui.arrow;
                    return e && e.arEls.remove(), this._super()
                }
            })
        }(e),
        function(e, n) {
            e.widget("mobile.panel", {
                options: {
                    classes: {
                        panel: "ui-panel",
                        panelOpen: "ui-panel-open",
                        panelClosed: "ui-panel-closed",
                        panelFixed: "ui-panel-fixed",
                        panelInner: "ui-panel-inner",
                        modal: "ui-panel-dismiss",
                        modalOpen: "ui-panel-dismiss-open",
                        pageContainer: "ui-panel-page-container",
                        pageWrapper: "ui-panel-wrapper",
                        pageFixedToolbar: "ui-panel-fixed-toolbar",
                        pageContentPrefix: "ui-panel-page-content",
                        animate: "ui-panel-animate"
                    },
                    animate: !0,
                    theme: null,
                    position: "left",
                    dismissible: !0,
                    display: "reveal",
                    swipeClose: !0,
                    positionFixed: !1
                },
                _panelID: null,
                _closeLink: null,
                _parentPage: null,
                _page: null,
                _modal: null,
                _panelInner: null,
                _wrapper: null,
                _fixedToolbars: null,
                _create: function() {
                    var t = this.element,
                        n = t.closest(":jqmData(role='page')");
                    e.extend(this, {
                        _panelID: t.attr("id"),
                        _closeLink: t.find(":jqmData(rel='close')"),
                        _parentPage: n.length > 0 ? n : !1,
                        _page: this._getPage,
                        _panelInner: this._getPanelInner(),
                        _wrapper: this._getWrapper,
                        _fixedToolbars: this._getFixedToolbars
                    }), this._addPanelClasses(), e.support.cssTransform3d && this.options.animate && this.element.addClass(this.options.classes.animate), this._bindUpdateLayout(), this._bindCloseEvents(), this._bindLinkListeners(), this._bindPageEvents(), this.options.dismissible && this._createModal(), this._bindSwipeEvents()
                },
                _getPanelInner: function() {
                    var e = this.element.find("." + this.options.classes.panelInner);
                    return 0 === e.length && (e = this.element.children().wrapAll("<div class='" + this.options.classes.panelInner + "' />").parent()), e
                },
                _createModal: function() {
                    var t = this,
                        n = t._parentPage ? t._parentPage.parent() : t.element.parent();
                    t._modal = e("<div class='" + t.options.classes.modal + "' data-panelid='" + t._panelID + "'></div>").on("mousedown", function() {
                        t.close()
                    }).appendTo(n)
                },
                _getPage: function() {
                    var t = this._parentPage ? this._parentPage : e("." + e.mobile.activePageClass);
                    return t
                },
                _getWrapper: function() {
                    var e = this._page().find("." + this.options.classes.pageWrapper);
                    return 0 === e.length && (e = this._page().children(".ui-header:not(.ui-header-fixed), .ui-content:not(.ui-popup), .ui-footer:not(.ui-footer-fixed)").wrapAll("<div class='" + this.options.classes.pageWrapper + "'></div>").parent()), e
                },
                _getFixedToolbars: function() {
                    var t = e("body").children(".ui-header-fixed, .ui-footer-fixed"),
                        n = this._page().find(".ui-header-fixed, .ui-footer-fixed"),
                        r = t.add(n).addClass(this.options.classes.pageFixedToolbar);
                    return r
                },
                _getPosDisplayClasses: function(e) {
                    return e + "-position-" + this.options.position + " " + e + "-display-" + this.options.display
                },
                _getPanelClasses: function() {
                    var e = this.options.classes.panel + " " + this._getPosDisplayClasses(this.options.classes.panel) + " " + this.options.classes.panelClosed + " " + "ui-body-" + (this.options.theme ? this.options.theme : "inherit");
                    return this.options.positionFixed && (e += " " + this.options.classes.panelFixed), e
                },
                _addPanelClasses: function() {
                    this.element.addClass(this._getPanelClasses())
                },
                _bindCloseEvents: function() {
                    var e = this;
                    e._closeLink.on("click.panel", function(t) {
                        return t.preventDefault(), e.close(), !1
                    }), e.element.on("click.panel", "a:jqmData(ajax='false')", function() {
                        e.close()
                    })
                },
                _positionPanel: function() {
                    var n = this,
                        r = n._panelInner.outerHeight(),
                        i = r > e.mobile.getScreenHeight();
                    i || !n.options.positionFixed ? (i && (n._unfixPanel(), e.mobile.resetActivePageHeight(r)), t.scrollTo(0, e.mobile.defaultHomeScroll)) : n._fixPanel()
                },
                _bindFixListener: function() {
                    this._on(e(t), {
                        throttledresize: "_positionPanel"
                    })
                },
                _unbindFixListener: function() {
                    this._off(e(t), "throttledresize")
                },
                _unfixPanel: function() {
                    this.options.positionFixed && e.support.fixedPosition && this.element.removeClass(this.options.classes.panelFixed)
                },
                _fixPanel: function() {
                    this.options.positionFixed && e.support.fixedPosition && this.element.addClass(this.options.classes.panelFixed)
                },
                _bindUpdateLayout: function() {
                    var e = this;
                    e.element.on("updatelayout", function() {
                        e._open && e._positionPanel()
                    })
                },
                _bindLinkListeners: function() {
                    this._on("body", {
                        "click a": "_handleClick"
                    })
                },
                _handleClick: function(t) {
                    if (t.currentTarget.href.split("#")[1] === this._panelID && this._panelID !== n) {
                        t.preventDefault();
                        var r = e(t.target);
                        return r.hasClass("ui-btn") && (r.addClass(e.mobile.activeBtnClass), this.element.one("panelopen panelclose", function() {
                            r.removeClass(e.mobile.activeBtnClass)
                        })), this.toggle(), !1
                    }
                },
                _bindSwipeEvents: function() {
                    var e = this,
                        t = e._modal ? e.element.add(e._modal) : e.element;
                    e.options.swipeClose && ("left" === e.options.position ? t.on("swipeleft.panel", function() {
                        e.close()
                    }) : t.on("swiperight.panel", function() {
                        e.close()
                    }))
                },
                _bindPageEvents: function() {
                    var e = this;
                    this.document.on("panelbeforeopen", function(t) {
                        e._open && t.target !== e.element[0] && e.close()
                    }).on("keyup.panel", function(t) {
                        27 === t.keyCode && e._open && e.close()
                    }), e._parentPage ? this.document.on("pagehide", ":jqmData(role='page')", function() {
                        e._open && e.close(!0)
                    }) : this.document.on("pagebeforehide", function() {
                        e._open && e.close(!0)
                    })
                },
                _open: !1,
                _pageContentOpenClasses: null,
                _modalOpenClasses: null,
                open: function(t) {
                    if (!this._open) {
                        var n = this,
                            r = n.options,
                            i = function() {
                                n.document.off("panelclose"), n._page().jqmData("panel", "open"), e.support.cssTransform3d && r.animate && "overlay" !== r.display && (n._wrapper().addClass(r.classes.animate), n._fixedToolbars().addClass(r.classes.animate)), !t && e.support.cssTransform3d && r.animate ? n.document.on(n._transitionEndEvents, s) : setTimeout(s, 0), r.theme && "overlay" !== r.display && n._page().parent().addClass(r.classes.pageContainer + "-themed " + r.classes.pageContainer + "-" + r.theme), n.element.removeClass(r.classes.panelClosed).addClass(r.classes.panelOpen), n._positionPanel(), n._pageContentOpenClasses = n._getPosDisplayClasses(r.classes.pageContentPrefix), "overlay" !== r.display && (n._page().parent().addClass(r.classes.pageContainer), n._wrapper().addClass(n._pageContentOpenClasses), n._fixedToolbars().addClass(n._pageContentOpenClasses)), n._modalOpenClasses = n._getPosDisplayClasses(r.classes.modal) + " " + r.classes.modalOpen, n._modal && n._modal.addClass(n._modalOpenClasses).height(Math.max(n._modal.height(), n.document.height()))
                            },
                            s = function() {
                                n.document.off(n._transitionEndEvents, s), "overlay" !== r.display && (n._wrapper().addClass(r.classes.pageContentPrefix + "-open"), n._fixedToolbars().addClass(r.classes.pageContentPrefix + "-open")), n._bindFixListener(), n._trigger("open")
                            };
                        n._trigger("beforeopen"), "open" === n._page().jqmData("panel") ? n.document.on("panelclose", function() {
                            i()
                        }) : i(), n._open = !0
                    }
                },
                close: function(t) {
                    if (this._open) {
                        var n = this,
                            r = this.options,
                            i = function() {
                                !t && e.support.cssTransform3d && r.animate ? n.document.on(n._transitionEndEvents, s) : setTimeout(s, 0), n.element.removeClass(r.classes.panelOpen), "overlay" !== r.display && (n._wrapper().removeClass(n._pageContentOpenClasses), n._fixedToolbars().removeClass(n._pageContentOpenClasses)), n._modal && n._modal.removeClass(n._modalOpenClasses)
                            },
                            s = function() {
                                n.document.off(n._transitionEndEvents, s), r.theme && "overlay" !== r.display && n._page().parent().removeClass(r.classes.pageContainer + "-themed " + r.classes.pageContainer + "-" + r.theme), n.element.addClass(r.classes.panelClosed), "overlay" !== r.display && (n._page().parent().removeClass(r.classes.pageContainer), n._wrapper().removeClass(r.classes.pageContentPrefix + "-open"), n._fixedToolbars().removeClass(r.classes.pageContentPrefix + "-open")), e.support.cssTransform3d && r.animate && "overlay" !== r.display && (n._wrapper().removeClass(r.classes.animate), n._fixedToolbars().removeClass(r.classes.animate)), n._fixPanel(), n._unbindFixListener(), e.mobile.resetActivePageHeight(), n._page().jqmRemoveData("panel"), n._trigger("close")
                            };
                        n._trigger("beforeclose"), i(), n._open = !1
                    }
                },
                toggle: function() {
                    this[this._open ? "close" : "open"]()
                },
                _transitionEndEvents: "webkitTransitionEnd oTransitionEnd otransitionend transitionend msTransitionEnd",
                _destroy: function() {
                    var t, n = this.options,
                        r = e("body > :mobile-panel").length + e.mobile.activePage.find(":mobile-panel").length > 1;
                    "overlay" !== n.display && (t = e("body > :mobile-panel").add(e.mobile.activePage.find(":mobile-panel")), 0 === t.not(".ui-panel-display-overlay").not(this.element).length && this._wrapper().children().unwrap(), this._open && (this._fixedToolbars().removeClass(n.classes.pageContentPrefix + "-open"), e.support.cssTransform3d && n.animate && this._fixedToolbars().removeClass(n.classes.animate), this._page().parent().removeClass(n.classes.pageContainer), n.theme && this._page().parent().removeClass(n.classes.pageContainer + "-themed " + n.classes.pageContainer + "-" + n.theme))), r || (this.document.off("panelopen panelclose"), this._open && (this.document.off(this._transitionEndEvents), e.mobile.resetActivePageHeight())), this._open && this._page().jqmRemoveData("panel"), this._panelInner.children().unwrap(), this.element.removeClass([this._getPanelClasses(), n.classes.panelOpen, n.classes.animate].join(" ")).off("swipeleft.panel swiperight.panel").off("panelbeforeopen").off("panelhide").off("keyup.panel").off("updatelayout").off(this._transitionEndEvents), this._closeLink.off("click.panel"), this._modal && this._modal.remove()
                }
            })
        }(e),
        function(e, t) {
            e.widget("mobile.table", {
                options: {
                    classes: {
                        table: "ui-table"
                    },
                    enhanced: !1
                },
                _create: function() {
                    this.options.enhanced || this.element.addClass(this.options.classes.table), e.extend(this, {
                        headers: t,
                        allHeaders: t
                    }), this._refresh(!0)
                },
                _setHeaders: function() {
                    var e = this.element.find("thead tr");
                    this.headers = this.element.find("tr:eq(0)").children(), this.allHeaders = this.headers.add(e.children())
                },
                refresh: function() {
                    this._refresh()
                },
                rebuild: e.noop,
                _refresh: function() {
                    var t = this.element,
                        n = t.find("thead tr");
                    this._setHeaders(), n.each(function() {
                        var r = 0;
                        e(this).children().each(function() {
                            var i, s = parseInt(this.getAttribute("colspan"), 10),
                                o = ":nth-child(" + (r + 1) + ")";
                            if (this.setAttribute("data-" + e.mobile.ns + "colstart", r + 1), s)
                                for (i = 0; s - 1 > i; i++) r++, o += ", :nth-child(" + (r + 1) + ")";
                            e(this).jqmData("cells", t.find("tr").not(n.eq(0)).not(this).children(o)), r++
                        })
                    })
                }
            })
        }(e),
        function(e) {
            e.widget("mobile.table", e.mobile.table, {
                options: {
                    mode: "columntoggle",
                    columnBtnTheme: null,
                    columnPopupTheme: null,
                    columnBtnText: "Columns...",
                    classes: e.extend(e.mobile.table.prototype.options.classes, {
                        popup: "ui-table-columntoggle-popup",
                        columnBtn: "ui-table-columntoggle-btn",
                        priorityPrefix: "ui-table-priority-",
                        columnToggleTable: "ui-table-columntoggle"
                    })
                },
                _create: function() {
                    this._super(), "columntoggle" === this.options.mode && (e.extend(this, {
                        _menu: null
                    }), this.options.enhanced ? (this._menu = e(this.document[0].getElementById(this._id() + "-popup")).children().first(), this._addToggles(this._menu, !0), this._bindToggles(this._menu)) : (this._menu = this._enhanceColToggle(), this.element.addClass(this.options.classes.columnToggleTable)), this._setupEvents(), this._setToggleState())
                },
                _id: function() {
                    return this.element.attr("id") || this.widgetName + this.uuid
                },
                _setupEvents: function() {
                    this._on(this.window, {
                        throttledresize: "_setToggleState"
                    })
                },
                _bindToggles: function(e) {
                    var t = e.find("input");
                    this._on(t, {
                        change: "_menuInputChange"
                    })
                },
                _addToggles: function(t, n) {
                    var r, i = 0,
                        s = this.options,
                        o = t.controlgroup("container");
                    n ? r = t.find("input") : o.empty(), this.headers.not("td").each(function() {
                        var t = e(this),
                            u = e.mobile.getAttribute(this, "priority"),
                            l = t.add(t.jqmData("cells"));
                        u && (l.addClass(s.classes.priorityPrefix + u), (n ? r.eq(i++) : e("<label><input type='checkbox' checked />" + (t.children("abbr").first().attr("title") || t.text()) + "</label>").appendTo(o).children(0).checkboxradio({
                            theme: s.columnPopupTheme
                        })).jqmData("cells", l))
                    }), n || (t.controlgroup("refresh"), this._bindToggles(t))
                },
                _menuInputChange: function(t) {
                    var n = e(t.target),
                        r = n[0].checked;
                    n.jqmData("cells").toggleClass("ui-table-cell-hidden", !r).toggleClass("ui-table-cell-visible", r), n[0].getAttribute("locked") ? (n.removeAttr("locked"), this._unlockCells(n.jqmData("cells"))) : n.attr("locked", !0)
                },
                _unlockCells: function(e) {
                    e.removeClass("ui-table-cell-hidden ui-table-cell-visible")
                },
                _enhanceColToggle: function() {
                    var t, n, r, i, s = this.element,
                        o = this.options,
                        u = e.mobile.ns,
                        f = this.document[0].createDocumentFragment();
                    return t = this._id() + "-popup", n = e("<a href='#" + t + "' " + "class='" + o.classes.columnBtn + " ui-btn " + "ui-btn-" + (o.columnBtnTheme || "a") + " ui-corner-all ui-shadow ui-mini' " + "data-" + u + "rel='popup'>" + o.columnBtnText + "</a>"), r = e("<div class='" + o.classes.popup + "' id='" + t + "'></div>"), i = e("<fieldset></fieldset>").controlgroup(), this._addToggles(i, !1), i.appendTo(r), f.appendChild(r[0]), f.appendChild(n[0]), s.before(f), r.popup(), i
                },
                rebuild: function() {
                    this._super(), "columntoggle" === this.options.mode && this._refresh(!1)
                },
                _refresh: function(e) {
                    this._super(e), e || "columntoggle" !== this.options.mode || (this._unlockCells(this.allHeaders), this._addToggles(this._menu, e), this._setToggleState())
                },
                _setToggleState: function() {
                    this._menu.find("input").each(function() {
                        var t = e(this);
                        this.checked = "table-cell" === t.jqmData("cells").eq(0).css("display"), t.checkboxradio("refresh")
                    })
                },
                _destroy: function() {
                    this._super()
                }
            })
        }(e),
        function(e) {
            e.widget("mobile.table", e.mobile.table, {
                options: {
                    mode: "reflow",
                    classes: e.extend(e.mobile.table.prototype.options.classes, {
                        reflowTable: "ui-table-reflow",
                        cellLabels: "ui-table-cell-label"
                    })
                },
                _create: function() {
                    this._super(), "reflow" === this.options.mode && (this.options.enhanced || (this.element.addClass(this.options.classes.reflowTable), this._updateReflow()))
                },
                rebuild: function() {
                    this._super(), "reflow" === this.options.mode && this._refresh(!1)
                },
                _refresh: function(e) {
                    this._super(e), e || "reflow" !== this.options.mode || this._updateReflow()
                },
                _updateReflow: function() {
                    var t = this,
                        n = this.options;
                    e(t.allHeaders.get().reverse()).each(function() {
                        var r, i, s = e(this).jqmData("cells"),
                            o = e.mobile.getAttribute(this, "colstart"),
                            u = s.not(this).filter("thead th").length && " ui-table-cell-label-top",
                            f = e(this).text();
                        "" !== f && (u ? (r = parseInt(this.getAttribute("colspan"), 10), i = "", r && (i = "td:nth-child(" + r + "n + " + o + ")"), t._addLabels(s.filter(i), n.classes.cellLabels + u, f)) : t._addLabels(s, n.classes.cellLabels, f))
                    })
                },
                _addLabels: function(e, t, n) {
                    e.not(":has(b." + t + ")").prepend("<b class='" + t + "'>" + n + "</b>")
                }
            })
        }(e),
        function(e, n) {
            var r = function(t, n) {
                return -1 === ("" + (e.mobile.getAttribute(this, "filtertext") || e(this).text())).toLowerCase().indexOf(n)
            };
            e.widget("mobile.filterable", {
                initSelector: ":jqmData(filter='true')",
                options: {
                    filterReveal: !1,
                    filterCallback: r,
                    enhanced: !1,
                    input: null,
                    children: "> li, > option, > optgroup option, > tbody tr, > .ui-controlgroup-controls > .ui-btn, > .ui-controlgroup-controls > .ui-checkbox, > .ui-controlgroup-controls > .ui-radio"
                },
                _create: function() {
                    var t = this.options;
                    e.extend(this, {
                        _search: null,
                        _timer: 0
                    }), this._setInput(t.input), t.enhanced || this._filterItems((this._search && this._search.val() || "").toLowerCase())
                },
                _onKeyUp: function() {
                    var n, r, i = this._search;
                    if (i) {
                        if (n = i.val().toLowerCase(), r = e.mobile.getAttribute(i[0], "lastval") + "", r && r === n) return;
                        this._timer && (t.clearTimeout(this._timer), this._timer = 0), this._timer = this._delay(function() {
                            this._trigger("beforefilter", "beforefilter", {
                                input: i
                            }), i[0].setAttribute("data-" + e.mobile.ns + "lastval", n), this._filterItems(n), this._timer = 0
                        }, 250)
                    }
                },
                _getFilterableItems: function() {
                    var t = this.element,
                        n = this.options.children,
                        r = n ? e.isFunction(n) ? n() : n.nodeName ? e(n) : n.jquery ? n : this.element.find(n) : {
                            length: 0
                        };
                    return 0 === r.length && (r = t.children()), r
                },
                _filterItems: function(t) {
                    var n, i, s, o, u = [],
                        f = [],
                        l = this.options,
                        c = this._getFilterableItems();
                    if (null != t)
                        for (i = l.filterCallback || r, s = c.length, n = 0; s > n; n++) o = i.call(c[n], n, t) ? f : u, o.push(c[n]);
                    0 === f.length ? c[l.filterReveal ? "addClass" : "removeClass"]("ui-screen-hidden") : (e(f).addClass("ui-screen-hidden"), e(u).removeClass("ui-screen-hidden")), this._refreshChildWidget()
                },
                _refreshChildWidget: function() {
                    var t, n, r = ["collapsibleset", "selectmenu", "controlgroup", "listview"];
                    for (n = r.length - 1; n > -1; n--) t = r[n], e.mobile[t] && (t = this.element.data("mobile-" + t), t && e.isFunction(t.refresh) && t.refresh())
                },
                _setInput: function(n) {
                    var r = this._search;
                    this._timer && (t.clearTimeout(this._timer), this._timer = 0), r && (this._off(r, "keyup change input"), r = null), n && (r = n.jquery ? n : n.nodeName ? e(n) : this.document.find(n), this._on(r, {
                        keyup: "_onKeyUp",
                        change: "_onKeyUp",
                        input: "_onKeyUp"
                    })), this._search = r
                },
                _setOptions: function(e) {
                    var t = e.filterReveal !== n || e.filterCallback !== n || e.children !== n;
                    this._super(e), e.input !== n && (this._setInput(e.input), t = !0), t && this.refresh()
                },
                _destroy: function() {
                    var e = this.options,
                        t = this._getFilterableItems();
                    e.enhanced ? t.toggleClass("ui-screen-hidden", e.filterReveal) : t.removeClass("ui-screen-hidden")
                },
                refresh: function() {
                    this._timer && (t.clearTimeout(this._timer), this._timer = 0), this._filterItems((this._search && this._search.val() || "").toLowerCase())
                }
            })
        }(e),
        function(e, t) {
            var n = function(e, t) {
                    return function(n) {
                        t.call(this, n), e._syncTextInputOptions(n)
                    }
                },
                r = /(^|\s)ui-li-divider(\s|$)/,
                i = e.mobile.filterable.prototype.options.filterCallback;
            e.mobile.filterable.prototype.options.filterCallback = function(e, t) {
                return !this.className.match(r) && i.call(this, e, t)
            }, e.widget("mobile.filterable", e.mobile.filterable, {
                options: {
                    filterPlaceholder: "Filter items...",
                    filterTheme: null
                },
                _create: function() {
                    var t, n, r = this.element,
                        i = ["collapsibleset", "selectmenu", "controlgroup", "listview"],
                        s = {};
                    for (this._super(), e.extend(this, {
                            _widget: null
                        }), t = i.length - 1; t > -1; t--)
                        if (n = i[t], e.mobile[n]) {
                            if (this._setWidget(r.data("mobile-" + n))) break;
                            s[n + "create"] = "_handleCreate"
                        }
                    this._widget || this._on(r, s)
                },
                _handleCreate: function(e) {
                    this._setWidget(this.element.data("mobile-" + e.type.substring(0, e.type.length - 6)))
                },
                _setWidget: function(e) {
                    return !this._widget && e && (this._widget = e, this._widget._setOptions = n(this, this._widget._setOptions)), this._widget && (this._syncTextInputOptions(this._widget.options), "listview" === this._widget.widgetName && (this._widget.options.hidedividers = !0, this._widget.element.listview("refresh"))), !!this._widget
                },
                _isSearchInternal: function() {
                    return this._search && this._search.jqmData("ui-filterable-" + this.uuid + "-internal")
                },
                _setInput: function(t) {
                    var n = this.options,
                        r = !0,
                        i = {};
                    if (!t) {
                        if (this._isSearchInternal()) return;
                        r = !1, t = e("<input data-" + e.mobile.ns + "type='search' " + "placeholder='" + n.filterPlaceholder + "'></input>").jqmData("ui-filterable-" + this.uuid + "-internal", !0), e("<form class='ui-filterable'></form>").append(t).submit(function(e) {
                            e.preventDefault(), t.blur()
                        }).insertBefore(this.element), e.mobile.textinput && (null != this.options.filterTheme && (i.theme = n.filterTheme), t.textinput(i))
                    }
                    this._super(t), this._isSearchInternal() && r && this._search.attr("placeholder", this.options.filterPlaceholder)
                },
                _setOptions: function(n) {
                    var r = this._super(n);
                    return n.filterPlaceholder !== t && this._isSearchInternal() && this._search.attr("placeholder", n.filterPlaceholder), n.filterTheme !== t && this._search && e.mobile.textinput && this._search.textinput("option", "theme", n.filterTheme), r
                },
                _destroy: function() {
                    this._isSearchInternal() && this._search.remove(), this._super()
                },
                _syncTextInputOptions: function(n) {
                    var r, i = {};
                    if (this._isSearchInternal() && e.mobile.textinput) {
                        for (r in e.mobile.textinput.prototype.options) n[r] !== t && (i[r] = "theme" === r && null != this.options.filterTheme ? this.options.filterTheme : n[r]);
                        this._search.textinput("option", i)
                    }
                }
            })
        }(e),
        function(e, t) {
            function n() {
                return ++i
            }

            function r(e) {
                return e.hash.length > 1 && decodeURIComponent(e.href.replace(s, "")) === decodeURIComponent(location.href.replace(s, ""))
            }
            var i = 0,
                s = /#.*$/;
            e.widget("ui.tabs", {
                version: "@VERSION",
                delay: 300,
                options: {
                    active: null,
                    collapsible: !1,
                    event: "click",
                    heightStyle: "content",
                    hide: null,
                    show: null,
                    activate: null,
                    beforeActivate: null,
                    beforeLoad: null,
                    load: null
                },
                _create: function() {
                    var t = this,
                        n = this.options;
                    this.running = !1, this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all").toggleClass("ui-tabs-collapsible", n.collapsible).delegate(".ui-tabs-nav > li", "mousedown" + this.eventNamespace, function(t) {
                        e(this).is(".ui-state-disabled") && t.preventDefault()
                    }).delegate(".ui-tabs-anchor", "focus" + this.eventNamespace, function() {
                        e(this).closest("li").is(".ui-state-disabled") && this.blur()
                    }), this._processTabs(), n.active = this._initialActive(), e.isArray(n.disabled) && (n.disabled = e.unique(n.disabled.concat(e.map(this.tabs.filter(".ui-state-disabled"), function(e) {
                        return t.tabs.index(e)
                    }))).sort()), this.active = this.options.active !== !1 && this.anchors.length ? this._findActive(n.active) : e(), this._refresh(), this.active.length && this.load(n.active)
                },
                _initialActive: function() {
                    var t = this.options.active,
                        n = this.options.collapsible,
                        r = location.hash.substring(1);
                    return null === t && (r && this.tabs.each(function(n, i) {
                        return e(i).attr("aria-controls") === r ? (t = n, !1) : void 0
                    }), null === t && (t = this.tabs.index(this.tabs.filter(".ui-tabs-active"))), (null === t || -1 === t) && (t = this.tabs.length ? 0 : !1)), t !== !1 && (t = this.tabs.index(this.tabs.eq(t)), -1 === t && (t = n ? !1 : 0)), !n && t === !1 && this.anchors.length && (t = 0), t
                },
                _getCreateEventData: function() {
                    return {
                        tab: this.active,
                        panel: this.active.length ? this._getPanelForTab(this.active) : e()
                    }
                },
                _tabKeydown: function(t) {
                    var n = e(this.document[0].activeElement).closest("li"),
                        r = this.tabs.index(n),
                        i = !0;
                    if (!this._handlePageNav(t)) {
                        switch (t.keyCode) {
                            case e.ui.keyCode.RIGHT:
                            case e.ui.keyCode.DOWN:
                                r++;
                                break;
                            case e.ui.keyCode.UP:
                            case e.ui.keyCode.LEFT:
                                i = !1, r--;
                                break;
                            case e.ui.keyCode.END:
                                r = this.anchors.length - 1;
                                break;
                            case e.ui.keyCode.HOME:
                                r = 0;
                                break;
                            case e.ui.keyCode.SPACE:
                                return t.preventDefault(), clearTimeout(this.activating), this._activate(r), void 0;
                            case e.ui.keyCode.ENTER:
                                return t.preventDefault(), clearTimeout(this.activating), this._activate(r === this.options.active ? !1 : r), void 0;
                            default:
                                return
                        }
                        t.preventDefault(), clearTimeout(this.activating), r = this._focusNextTab(r, i), t.ctrlKey || (n.attr("aria-selected", "false"), this.tabs.eq(r).attr("aria-selected", "true"), this.activating = this._delay(function() {
                            this.option("active", r)
                        }, this.delay))
                    }
                },
                _panelKeydown: function(t) {
                    this._handlePageNav(t) || t.ctrlKey && t.keyCode === e.ui.keyCode.UP && (t.preventDefault(), this.active.focus())
                },
                _handlePageNav: function(t) {
                    return t.altKey && t.keyCode === e.ui.keyCode.PAGE_UP ? (this._activate(this._focusNextTab(this.options.active - 1, !1)), !0) : t.altKey && t.keyCode === e.ui.keyCode.PAGE_DOWN ? (this._activate(this._focusNextTab(this.options.active + 1, !0)), !0) : void 0
                },
                _findNextTab: function(t, n) {
                    function r() {
                        return t > i && (t = 0), 0 > t && (t = i), t
                    }
                    for (var i = this.tabs.length - 1; - 1 !== e.inArray(r(), this.options.disabled);) t = n ? t + 1 : t - 1;
                    return t
                },
                _focusNextTab: function(e, t) {
                    return e = this._findNextTab(e, t), this.tabs.eq(e).focus(), e
                },
                _setOption: function(e, t) {
                    return "active" === e ? (this._activate(t), void 0) : "disabled" === e ? (this._setupDisabled(t), void 0) : (this._super(e, t), "collapsible" === e && (this.element.toggleClass("ui-tabs-collapsible", t), t || this.options.active !== !1 || this._activate(0)), "event" === e && this._setupEvents(t), "heightStyle" === e && this._setupHeightStyle(t), void 0)
                },
                _tabId: function(e) {
                    return e.attr("aria-controls") || "ui-tabs-" + n()
                },
                _sanitizeSelector: function(e) {
                    return e ? e.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&") : ""
                },
                refresh: function() {
                    var t = this.options,
                        n = this.tablist.children(":has(a[href])");
                    t.disabled = e.map(n.filter(".ui-state-disabled"), function(e) {
                        return n.index(e)
                    }), this._processTabs(), t.active !== !1 && this.anchors.length ? this.active.length && !e.contains(this.tablist[0], this.active[0]) ? this.tabs.length === t.disabled.length ? (t.active = !1, this.active = e()) : this._activate(this._findNextTab(Math.max(0, t.active - 1), !1)) : t.active = this.tabs.index(this.active) : (t.active = !1, this.active = e()), this._refresh()
                },
                _refresh: function() {
                    this._setupDisabled(this.options.disabled), this._setupEvents(this.options.event), this._setupHeightStyle(this.options.heightStyle), this.tabs.not(this.active).attr({
                        "aria-selected": "false",
                        tabIndex: -1
                    }), this.panels.not(this._getPanelForTab(this.active)).hide().attr({
                        "aria-expanded": "false",
                        "aria-hidden": "true"
                    }), this.active.length ? (this.active.addClass("ui-tabs-active ui-state-active").attr({
                        "aria-selected": "true",
                        tabIndex: 0
                    }), this._getPanelForTab(this.active).show().attr({
                        "aria-expanded": "true",
                        "aria-hidden": "false"
                    })) : this.tabs.eq(0).attr("tabIndex", 0)
                },
                _processTabs: function() {
                    var t = this;
                    this.tablist = this._getList().addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").attr("role", "tablist"), this.tabs = this.tablist.find("> li:has(a[href])").addClass("ui-state-default ui-corner-top").attr({
                        role: "tab",
                        tabIndex: -1
                    }), this.anchors = this.tabs.map(function() {
                        return e("a", this)[0]
                    }).addClass("ui-tabs-anchor").attr({
                        role: "presentation",
                        tabIndex: -1
                    }), this.panels = e(), this.anchors.each(function(n, i) {
                        var s, o, u, f = e(i).uniqueId().attr("id"),
                            l = e(i).closest("li"),
                            c = l.attr("aria-controls");
                        r(i) ? (s = i.hash, o = t.element.find(t._sanitizeSelector(s))) : (u = t._tabId(l), s = "#" + u, o = t.element.find(s), o.length || (o = t._createPanel(u), o.insertAfter(t.panels[n - 1] || t.tablist)), o.attr("aria-live", "polite")), o.length && (t.panels = t.panels.add(o)), c && l.data("ui-tabs-aria-controls", c), l.attr({
                            "aria-controls": s.substring(1),
                            "aria-labelledby": f
                        }), o.attr("aria-labelledby", f)
                    }), this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").attr("role", "tabpanel")
                },
                _getList: function() {
                    return this.element.find("ol,ul").eq(0)
                },
                _createPanel: function(t) {
                    return e("<div>").attr("id", t).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").data("ui-tabs-destroy", !0)
                },
                _setupDisabled: function(t) {
                    e.isArray(t) && (t.length ? t.length === this.anchors.length && (t = !0) : t = !1);
                    for (var n, r = 0; n = this.tabs[r]; r++) t === !0 || -1 !== e.inArray(r, t) ? e(n).addClass("ui-state-disabled").attr("aria-disabled", "true") : e(n).removeClass("ui-state-disabled").removeAttr("aria-disabled");
                    this.options.disabled = t
                },
                _setupEvents: function(t) {
                    var n = {
                        click: function(e) {
                            e.preventDefault()
                        }
                    };
                    t && e.each(t.split(" "), function(e, t) {
                        n[t] = "_eventHandler"
                    }), this._off(this.anchors.add(this.tabs).add(this.panels)), this._on(this.anchors, n), this._on(this.tabs, {
                        keydown: "_tabKeydown"
                    }), this._on(this.panels, {
                        keydown: "_panelKeydown"
                    }), this._focusable(this.tabs), this._hoverable(this.tabs)
                },
                _setupHeightStyle: function(t) {
                    var n, r = this.element.parent();
                    "fill" === t ? (n = r.height(), n -= this.element.outerHeight() - this.element.height(), this.element.siblings(":visible").each(function() {
                        var t = e(this),
                            r = t.css("position");
                        "absolute" !== r && "fixed" !== r && (n -= t.outerHeight(!0))
                    }), this.element.children().not(this.panels).each(function() {
                        n -= e(this).outerHeight(!0)
                    }), this.panels.each(function() {
                        e(this).height(Math.max(0, n - e(this).innerHeight() + e(this).height()))
                    }).css("overflow", "auto")) : "auto" === t && (n = 0, this.panels.each(function() {
                        n = Math.max(n, e(this).height("").height())
                    }).height(n))
                },
                _eventHandler: function(t) {
                    var n = this.options,
                        r = this.active,
                        i = e(t.currentTarget),
                        s = i.closest("li"),
                        o = s[0] === r[0],
                        u = o && n.collapsible,
                        f = u ? e() : this._getPanelForTab(s),
                        l = r.length ? this._getPanelForTab(r) : e(),
                        c = {
                            oldTab: r,
                            oldPanel: l,
                            newTab: u ? e() : s,
                            newPanel: f
                        };
                    t.preventDefault(), s.hasClass("ui-state-disabled") || s.hasClass("ui-tabs-loading") || this.running || o && !n.collapsible || this._trigger("beforeActivate", t, c) === !1 || (n.active = u ? !1 : this.tabs.index(s), this.active = o ? e() : s, this.xhr && this.xhr.abort(), l.length || f.length || e.error("jQuery UI Tabs: Mismatching fragment identifier."), f.length && this.load(this.tabs.index(s), t), this._toggle(t, c))
                },
                _toggle: function(t, n) {
                    function r() {
                        s.running = !1, s._trigger("activate", t, n)
                    }

                    function i() {
                        n.newTab.closest("li").addClass("ui-tabs-active ui-state-active"), o.length && s.options.show ? s._show(o, s.options.show, r) : (o.show(), r())
                    }
                    var s = this,
                        o = n.newPanel,
                        u = n.oldPanel;
                    this.running = !0, u.length && this.options.hide ? this._hide(u, this.options.hide, function() {
                        n.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"), i()
                    }) : (n.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"), u.hide(), i()), u.attr({
                        "aria-expanded": "false",
                        "aria-hidden": "true"
                    }), n.oldTab.attr("aria-selected", "false"), o.length && u.length ? n.oldTab.attr("tabIndex", -1) : o.length && this.tabs.filter(function() {
                        return 0 === e(this).attr("tabIndex")
                    }).attr("tabIndex", -1), o.attr({
                        "aria-expanded": "true",
                        "aria-hidden": "false"
                    }), n.newTab.attr({
                        "aria-selected": "true",
                        tabIndex: 0
                    })
                },
                _activate: function(t) {
                    var n, r = this._findActive(t);
                    r[0] !== this.active[0] && (r.length || (r = this.active), n = r.find(".ui-tabs-anchor")[0], this._eventHandler({
                        target: n,
                        currentTarget: n,
                        preventDefault: e.noop
                    }))
                },
                _findActive: function(t) {
                    return t === !1 ? e() : this.tabs.eq(t)
                },
                _getIndex: function(e) {
                    return "string" == typeof e && (e = this.anchors.index(this.anchors.filter("[href$='" + e + "']"))), e
                },
                _destroy: function() {
                    this.xhr && this.xhr.abort(), this.element.removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible"), this.tablist.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").removeAttr("role"), this.anchors.removeClass("ui-tabs-anchor").removeAttr("role").removeAttr("tabIndex").removeUniqueId(), this.tabs.add(this.panels).each(function() {
                        e.data(this, "ui-tabs-destroy") ? e(this).remove() : e(this).removeClass("ui-state-default ui-state-active ui-state-disabled ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel").removeAttr("tabIndex").removeAttr("aria-live").removeAttr("aria-busy").removeAttr("aria-selected").removeAttr("aria-labelledby").removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("role")
                    }), this.tabs.each(function() {
                        var t = e(this),
                            n = t.data("ui-tabs-aria-controls");
                        n ? t.attr("aria-controls", n).removeData("ui-tabs-aria-controls") : t.removeAttr("aria-controls")
                    }), this.panels.show(), "content" !== this.options.heightStyle && this.panels.css("height", "")
                },
                enable: function(n) {
                    var r = this.options.disabled;
                    r !== !1 && (n === t ? r = !1 : (n = this._getIndex(n), r = e.isArray(r) ? e.map(r, function(e) {
                        return e !== n ? e : null
                    }) : e.map(this.tabs, function(e, t) {
                        return t !== n ? t : null
                    })), this._setupDisabled(r))
                },
                disable: function(n) {
                    var r = this.options.disabled;
                    if (r !== !0) {
                        if (n === t) r = !0;
                        else {
                            if (n = this._getIndex(n), -1 !== e.inArray(n, r)) return;
                            r = e.isArray(r) ? e.merge([n], r).sort() : [n]
                        }
                        this._setupDisabled(r)
                    }
                },
                load: function(t, n) {
                    t = this._getIndex(t);
                    var i = this,
                        s = this.tabs.eq(t),
                        o = s.find(".ui-tabs-anchor"),
                        u = this._getPanelForTab(s),
                        f = {
                            tab: s,
                            panel: u
                        };
                    r(o[0]) || (this.xhr = e.ajax(this._ajaxSettings(o, n, f)), this.xhr && "canceled" !== this.xhr.statusText && (s.addClass("ui-tabs-loading"), u.attr("aria-busy", "true"), this.xhr.success(function(e) {
                        setTimeout(function() {
                            u.html(e), i._trigger("load", n, f)
                        }, 1)
                    }).complete(function(e, t) {
                        setTimeout(function() {
                            "abort" === t && i.panels.stop(!1, !0), s.removeClass("ui-tabs-loading"), u.removeAttr("aria-busy"), e === i.xhr && delete i.xhr
                        }, 1)
                    })))
                },
                _ajaxSettings: function(t, n, r) {
                    var i = this;
                    return {
                        url: t.attr("href"),
                        beforeSend: function(t, s) {
                            return i._trigger("beforeLoad", n, e.extend({
                                jqXHR: t,
                                ajaxSettings: s
                            }, r))
                        }
                    }
                },
                _getPanelForTab: function(t) {
                    var n = e(t).attr("aria-controls");
                    return this.element.find(this._sanitizeSelector("#" + n))
                }
            })
        }(e),
        function() {}(e),
        function(e, t) {
            function n(e) {
                i = e.originalEvent, a = i.accelerationIncludingGravity, s = Math.abs(a.x), o = Math.abs(a.y), u = Math.abs(a.z), !t.orientation && (s > 7 || (u > 6 && 8 > o || 8 > u && o > 6) && s > 5) ? r.enabled && r.disable() : r.enabled || r.enable()
            }
            e.mobile.iosorientationfixEnabled = !0;
            var r, i, s, o, u, a, f = navigator.userAgent;
            return /iPhone|iPad|iPod/.test(navigator.platform) && /OS [1-5]_[0-9_]* like Mac OS X/i.test(f) && f.indexOf("AppleWebKit") > -1 ? (r = e.mobile.zoom, e.mobile.document.on("mobileinit", function() {
                e.mobile.iosorientationfixEnabled && e.mobile.window.bind("orientationchange.iosorientationfix", r.enable).bind("devicemotion.iosorientationfix", n)
            }), void 0) : (e.mobile.iosorientationfixEnabled = !1, void 0)
        }(e, this),
        function(e, t) {
            function r() {
                i.removeClass("ui-mobile-rendering")
            }
            var i = e("html"),
                s = e.mobile.window;
            e(t.document).trigger("mobileinit"), e.mobile.gradeA() && (e.mobile.ajaxBlacklist && (e.mobile.ajaxEnabled = !1), i.addClass("ui-mobile ui-mobile-rendering"), setTimeout(r, 5e3), e.extend(e.mobile, {
                initializePage: function() {
                    var t = e.mobile.path,
                        i = e(":jqmData(role='page'), :jqmData(role='dialog')"),
                        o = t.stripHash(t.stripQueryParams(t.parseLocation().hash)),
                        u = n.getElementById(o);
                    i.length || (i = e("body").wrapInner("<div data-" + e.mobile.ns + "role='page'></div>").children(0)), i.each(function() {
                        var t = e(this);
                        t[0].getAttribute("data-" + e.mobile.ns + "url") || t.attr("data-" + e.mobile.ns + "url", t.attr("id") || location.pathname + location.search)
                    }), e.mobile.firstPage = i.first(), e.mobile.pageContainer = e.mobile.firstPage.parent().addClass("ui-mobile-viewport").pagecontainer(), e.mobile.navreadyDeferred.resolve(), s.trigger("pagecontainercreate"), e.mobile.loading("show"), r(), e.mobile.hashListeningEnabled && e.mobile.path.isHashValid(location.hash) && (e(u).is(":jqmData(role='page')") || e.mobile.path.isPath(o) || o === e.mobile.dialogHashKey) ? e.event.special.navigate.isPushStateEnabled() ? (e.mobile.navigate.history.stack = [], e.mobile.navigate(e.mobile.path.isPath(location.hash) ? location.hash : location.href)) : s.trigger("hashchange", [!0]) : (e.mobile.path.isHashValid(location.hash) && (e.mobile.navigate.history.initialDst = o.replace("#", "")), e.event.special.navigate.isPushStateEnabled() && e.mobile.navigate.navigator.squash(t.parseLocation().href), e.mobile.changePage(e.mobile.firstPage, {
                        transition: "none",
                        reverse: !0,
                        changeHash: !1,
                        fromHashChange: !0
                    }))
                }
            }), e(function() {
                e.support.inlineSVG(), e.mobile.hideUrlBar && t.scrollTo(0, 1), e.mobile.defaultHomeScroll = e.support.scrollTop && 1 !== e.mobile.window.scrollTop() ? 1 : 0, e.mobile.autoInitializePage && e.mobile.initializePage(), e.mobile.hideUrlBar && s.load(e.mobile.silentScroll), e.support.cssPointerEvents || e.mobile.document.delegate(".ui-state-disabled,.ui-disabled", "vclick", function(e) {
                    e.preventDefault(), e.stopImmediatePropagation()
                })
            }))
        }(e, this)
    }),
    function() {
        var e = this,
            t = e._,
            n = {},
            r = Array.prototype,
            i = Object.prototype,
            s = Function.prototype,
            o = r.push,
            u = r.slice,
            a = r.concat,
            f = i.toString,
            l = i.hasOwnProperty,
            c = r.forEach,
            h = r.map,
            p = r.reduce,
            d = r.reduceRight,
            v = r.filter,
            m = r.every,
            g = r.some,
            y = r.indexOf,
            b = r.lastIndexOf,
            w = Array.isArray,
            E = Object.keys,
            S = s.bind,
            x = function(e) {
                if (e instanceof x) return e;
                if (!(this instanceof x)) return new x(e);
                this._wrapped = e
            };
        typeof exports != "undefined" ? (typeof module != "undefined" && module.exports && (exports = module.exports = x), exports._ = x) : e._ = x, x.VERSION = "1.4.4";
        var T = x.each = x.forEach = function(e, t, r) {
            if (e == null) return;
            if (c && e.forEach === c) e.forEach(t, r);
            else if (e.length === +e.length) {
                for (var i = 0, s = e.length; i < s; i++)
                    if (t.call(r, e[i], i, e) === n) return
            } else
                for (var o in e)
                    if (x.has(e, o) && t.call(r, e[o], o, e) === n) return
        };
        x.map = x.collect = function(e, t, n) {
            var r = [];
            return e == null ? r : h && e.map === h ? e.map(t, n) : (T(e, function(e, i, s) {
                r[r.length] = t.call(n, e, i, s)
            }), r)
        };
        var N = "Reduce of empty array with no initial value";
        x.reduce = x.foldl = x.inject = function(e, t, n, r) {
            var i = arguments.length > 2;
            e == null && (e = []);
            if (p && e.reduce === p) return r && (t = x.bind(t, r)), i ? e.reduce(t, n) : e.reduce(t);
            T(e, function(e, s, o) {
                i ? n = t.call(r, n, e, s, o) : (n = e, i = !0)
            });
            if (!i) throw new TypeError(N);
            return n
        }, x.reduceRight = x.foldr = function(e, t, n, r) {
            var i = arguments.length > 2;
            e == null && (e = []);
            if (d && e.reduceRight === d) return r && (t = x.bind(t, r)), i ? e.reduceRight(t, n) : e.reduceRight(t);
            var s = e.length;
            if (s !== +s) {
                var o = x.keys(e);
                s = o.length
            }
            T(e, function(u, a, f) {
                a = o ? o[--s] : --s, i ? n = t.call(r, n, e[a], a, f) : (n = e[a], i = !0)
            });
            if (!i) throw new TypeError(N);
            return n
        }, x.find = x.detect = function(e, t, n) {
            var r;
            return C(e, function(e, i, s) {
                if (t.call(n, e, i, s)) return r = e, !0
            }), r
        }, x.filter = x.select = function(e, t, n) {
            var r = [];
            return e == null ? r : v && e.filter === v ? e.filter(t, n) : (T(e, function(e, i, s) {
                t.call(n, e, i, s) && (r[r.length] = e)
            }), r)
        }, x.reject = function(e, t, n) {
            return x.filter(e, function(e, r, i) {
                return !t.call(n, e, r, i)
            }, n)
        }, x.every = x.all = function(e, t, r) {
            t || (t = x.identity);
            var i = !0;
            return e == null ? i : m && e.every === m ? e.every(t, r) : (T(e, function(e, s, o) {
                if (!(i = i && t.call(r, e, s, o))) return n
            }), !!i)
        };
        var C = x.some = x.any = function(e, t, r) {
            t || (t = x.identity);
            var i = !1;
            return e == null ? i : g && e.some === g ? e.some(t, r) : (T(e, function(e, s, o) {
                if (i || (i = t.call(r, e, s, o))) return n
            }), !!i)
        };
        x.contains = x.include = function(e, t) {
            return e == null ? !1 : y && e.indexOf === y ? e.indexOf(t) != -1 : C(e, function(e) {
                return e === t
            })
        }, x.invoke = function(e, t) {
            var n = u.call(arguments, 2),
                r = x.isFunction(t);
            return x.map(e, function(e) {
                return (r ? t : e[t]).apply(e, n)
            })
        }, x.pluck = function(e, t) {
            return x.map(e, function(e) {
                return e[t]
            })
        }, x.where = function(e, t, n) {
            return x.isEmpty(t) ? n ? null : [] : x[n ? "find" : "filter"](e, function(e) {
                for (var n in t)
                    if (t[n] !== e[n]) return !1;
                return !0
            })
        }, x.findWhere = function(e, t) {
            return x.where(e, t, !0)
        }, x.max = function(e, t, n) {
            if (!t && x.isArray(e) && e[0] === +e[0] && e.length < 65535) return Math.max.apply(Math, e);
            if (!t && x.isEmpty(e)) return -Infinity;
            var r = {
                computed: -Infinity,
                value: -Infinity
            };
            return T(e, function(e, i, s) {
                var o = t ? t.call(n, e, i, s) : e;
                o >= r.computed && (r = {
                    value: e,
                    computed: o
                })
            }), r.value
        }, x.min = function(e, t, n) {
            if (!t && x.isArray(e) && e[0] === +e[0] && e.length < 65535) return Math.min.apply(Math, e);
            if (!t && x.isEmpty(e)) return Infinity;
            var r = {
                computed: Infinity,
                value: Infinity
            };
            return T(e, function(e, i, s) {
                var o = t ? t.call(n, e, i, s) : e;
                o < r.computed && (r = {
                    value: e,
                    computed: o
                })
            }), r.value
        }, x.shuffle = function(e) {
            var t, n = 0,
                r = [];
            return T(e, function(e) {
                t = x.random(n++), r[n - 1] = r[t], r[t] = e
            }), r
        };
        var k = function(e) {
            return x.isFunction(e) ? e : function(t) {
                return t[e]
            }
        };
        x.sortBy = function(e, t, n) {
            var r = k(t);
            return x.pluck(x.map(e, function(e, t, i) {
                return {
                    value: e,
                    index: t,
                    criteria: r.call(n, e, t, i)
                }
            }).sort(function(e, t) {
                var n = e.criteria,
                    r = t.criteria;
                if (n !== r) {
                    if (n > r || n === void 0) return 1;
                    if (n < r || r === void 0) return -1
                }
                return e.index < t.index ? -1 : 1
            }), "value")
        };
        var L = function(e, t, n, r) {
            var i = {},
                s = k(t || x.identity);
            return T(e, function(t, o) {
                var u = s.call(n, t, o, e);
                r(i, u, t)
            }), i
        };
        x.groupBy = function(e, t, n) {
            return L(e, t, n, function(e, t, n) {
                (x.has(e, t) ? e[t] : e[t] = []).push(n)
            })
        }, x.countBy = function(e, t, n) {
            return L(e, t, n, function(e, t) {
                x.has(e, t) || (e[t] = 0), e[t]++
            })
        }, x.sortedIndex = function(e, t, n, r) {
            n = n == null ? x.identity : k(n);
            var i = n.call(r, t),
                s = 0,
                o = e.length;
            while (s < o) {
                var u = s + o >>> 1;
                n.call(r, e[u]) < i ? s = u + 1 : o = u
            }
            return s
        }, x.toArray = function(e) {
            return e ? x.isArray(e) ? u.call(e) : e.length === +e.length ? x.map(e, x.identity) : x.values(e) : []
        }, x.size = function(e) {
            return e == null ? 0 : e.length === +e.length ? e.length : x.keys(e).length
        }, x.first = x.head = x.take = function(e, t, n) {
            return e == null ? void 0 : t != null && !n ? u.call(e, 0, t) : e[0]
        }, x.initial = function(e, t, n) {
            return u.call(e, 0, e.length - (t == null || n ? 1 : t))
        }, x.last = function(e, t, n) {
            return e == null ? void 0 : t != null && !n ? u.call(e, Math.max(e.length - t, 0)) : e[e.length - 1]
        }, x.rest = x.tail = x.drop = function(e, t, n) {
            return u.call(e, t == null || n ? 1 : t)
        }, x.compact = function(e) {
            return x.filter(e, x.identity)
        };
        var A = function(e, t, n) {
            return T(e, function(e) {
                x.isArray(e) ? t ? o.apply(n, e) : A(e, t, n) : n.push(e)
            }), n
        };
        x.flatten = function(e, t) {
            return A(e, t, [])
        }, x.without = function(e) {
            return x.difference(e, u.call(arguments, 1))
        }, x.uniq = x.unique = function(e, t, n, r) {
            x.isFunction(t) && (r = n, n = t, t = !1);
            var i = n ? x.map(e, n, r) : e,
                s = [],
                o = [];
            return T(i, function(n, r) {
                if (t ? !r || o[o.length - 1] !== n : !x.contains(o, n)) o.push(n), s.push(e[r])
            }), s
        }, x.union = function() {
            return x.uniq(a.apply(r, arguments))
        }, x.intersection = function(e) {
            var t = u.call(arguments, 1);
            return x.filter(x.uniq(e), function(e) {
                return x.every(t, function(t) {
                    return x.indexOf(t, e) >= 0
                })
            })
        }, x.difference = function(e) {
            var t = a.apply(r, u.call(arguments, 1));
            return x.filter(e, function(e) {
                return !x.contains(t, e)
            })
        }, x.zip = function() {
            var e = u.call(arguments),
                t = x.max(x.pluck(e, "length")),
                n = new Array(t);
            for (var r = 0; r < t; r++) n[r] = x.pluck(e, "" + r);
            return n
        }, x.object = function(e, t) {
            if (e == null) return {};
            var n = {};
            for (var r = 0, i = e.length; r < i; r++) t ? n[e[r]] = t[r] : n[e[r][0]] = e[r][1];
            return n
        }, x.indexOf = function(e, t, n) {
            if (e == null) return -1;
            var r = 0,
                i = e.length;
            if (n) {
                if (typeof n != "number") return r = x.sortedIndex(e, t), e[r] === t ? r : -1;
                r = n < 0 ? Math.max(0, i + n) : n
            }
            if (y && e.indexOf === y) return e.indexOf(t, n);
            for (; r < i; r++)
                if (e[r] === t) return r;
            return -1
        }, x.lastIndexOf = function(e, t, n) {
            if (e == null) return -1;
            var r = n != null;
            if (b && e.lastIndexOf === b) return r ? e.lastIndexOf(t, n) : e.lastIndexOf(t);
            var i = r ? n : e.length;
            while (i--)
                if (e[i] === t) return i;
            return -1
        }, x.range = function(e, t, n) {
            arguments.length <= 1 && (t = e || 0, e = 0), n = arguments[2] || 1;
            var r = Math.max(Math.ceil((t - e) / n), 0),
                i = 0,
                s = new Array(r);
            while (i < r) s[i++] = e, e += n;
            return s
        }, x.bind = function(e, t) {
            if (e.bind === S && S) return S.apply(e, u.call(arguments, 1));
            var n = u.call(arguments, 2);
            return function() {
                return e.apply(t, n.concat(u.call(arguments)))
            }
        }, x.partial = function(e) {
            var t = u.call(arguments, 1);
            return function() {
                return e.apply(this, t.concat(u.call(arguments)))
            }
        }, x.bindAll = function(e) {
            var t = u.call(arguments, 1);
            return t.length === 0 && (t = x.functions(e)), T(t, function(t) {
                e[t] = x.bind(e[t], e)
            }), e
        }, x.memoize = function(e, t) {
            var n = {};
            return t || (t = x.identity),
                function() {
                    var r = t.apply(this, arguments);
                    return x.has(n, r) ? n[r] : n[r] = e.apply(this, arguments)
                }
        }, x.delay = function(e, t) {
            var n = u.call(arguments, 2);
            return setTimeout(function() {
                return e.apply(null, n)
            }, t)
        }, x.defer = function(e) {
            return x.delay.apply(x, [e, 1].concat(u.call(arguments, 1)))
        }, x.throttle = function(e, t) {
            var n, r, i, s, o = 0,
                u = function() {
                    o = new Date, i = null, s = e.apply(n, r)
                };
            return function() {
                var a = new Date,
                    f = t - (a - o);
                return n = this, r = arguments, f <= 0 ? (clearTimeout(i), i = null, o = a, s = e.apply(n, r)) : i || (i = setTimeout(u, f)), s
            }
        }, x.debounce = function(e, t, n) {
            var r, i;
            return function() {
                var s = this,
                    o = arguments,
                    u = function() {
                        r = null, n || (i = e.apply(s, o))
                    },
                    a = n && !r;
                return clearTimeout(r), r = setTimeout(u, t), a && (i = e.apply(s, o)), i
            }
        }, x.once = function(e) {
            var t = !1,
                n;
            return function() {
                return t ? n : (t = !0, n = e.apply(this, arguments), e = null, n)
            }
        }, x.wrap = function(e, t) {
            return function() {
                var n = [e];
                return o.apply(n, arguments), t.apply(this, n)
            }
        }, x.compose = function() {
            var e = arguments;
            return function() {
                var t = arguments;
                for (var n = e.length - 1; n >= 0; n--) t = [e[n].apply(this, t)];
                return t[0]
            }
        }, x.after = function(e, t) {
            return e <= 0 ? t() : function() {
                if (--e < 1) return t.apply(this, arguments)
            }
        }, x.keys = E || function(e) {
            if (e !== Object(e)) throw new TypeError("Invalid object");
            var t = [];
            for (var n in e) x.has(e, n) && (t[t.length] = n);
            return t
        }, x.values = function(e) {
            var t = [];
            for (var n in e) x.has(e, n) && t.push(e[n]);
            return t
        }, x.pairs = function(e) {
            var t = [];
            for (var n in e) x.has(e, n) && t.push([n, e[n]]);
            return t
        }, x.invert = function(e) {
            var t = {};
            for (var n in e) x.has(e, n) && (t[e[n]] = n);
            return t
        }, x.functions = x.methods = function(e) {
            var t = [];
            for (var n in e) x.isFunction(e[n]) && t.push(n);
            return t.sort()
        }, x.extend = function(e) {
            return T(u.call(arguments, 1), function(t) {
                if (t)
                    for (var n in t) e[n] = t[n]
            }), e
        }, x.pick = function(e) {
            var t = {},
                n = a.apply(r, u.call(arguments, 1));
            return T(n, function(n) {
                n in e && (t[n] = e[n])
            }), t
        }, x.omit = function(e) {
            var t = {},
                n = a.apply(r, u.call(arguments, 1));
            for (var i in e) x.contains(n, i) || (t[i] = e[i]);
            return t
        }, x.defaults = function(e) {
            return T(u.call(arguments, 1), function(t) {
                if (t)
                    for (var n in t) e[n] == null && (e[n] = t[n])
            }), e
        }, x.clone = function(e) {
            return x.isObject(e) ? x.isArray(e) ? e.slice() : x.extend({}, e) : e
        }, x.tap = function(e, t) {
            return t(e), e
        };
        var O = function(e, t, n, r) {
            if (e === t) return e !== 0 || 1 / e == 1 / t;
            if (e == null || t == null) return e === t;
            e instanceof x && (e = e._wrapped), t instanceof x && (t = t._wrapped);
            var i = f.call(e);
            if (i != f.call(t)) return !1;
            switch (i) {
                case "[object String]":
                    return e == String(t);
                case "[object Number]":
                    return e != +e ? t != +t : e == 0 ? 1 / e == 1 / t : e == +t;
                case "[object Date]":
                case "[object Boolean]":
                    return +e == +t;
                case "[object RegExp]":
                    return e.source == t.source && e.global == t.global && e.multiline == t.multiline && e.ignoreCase == t.ignoreCase
            }
            if (typeof e != "object" || typeof t != "object") return !1;
            var s = n.length;
            while (s--)
                if (n[s] == e) return r[s] == t;
            n.push(e), r.push(t);
            var o = 0,
                u = !0;
            if (i == "[object Array]") {
                o = e.length, u = o == t.length;
                if (u)
                    while (o--)
                        if (!(u = O(e[o], t[o], n, r))) break
            } else {
                var a = e.constructor,
                    l = t.constructor;
                if (a !== l && !(x.isFunction(a) && a instanceof a && x.isFunction(l) && l instanceof l)) return !1;
                for (var c in e)
                    if (x.has(e, c)) {
                        o++;
                        if (!(u = x.has(t, c) && O(e[c], t[c], n, r))) break
                    }
                if (u) {
                    for (c in t)
                        if (x.has(t, c) && !(o--)) break;
                    u = !o
                }
            }
            return n.pop(), r.pop(), u
        };
        x.isEqual = function(e, t) {
            return O(e, t, [], [])
        }, x.isEmpty = function(e) {
            if (e == null) return !0;
            if (x.isArray(e) || x.isString(e)) return e.length === 0;
            for (var t in e)
                if (x.has(e, t)) return !1;
            return !0
        }, x.isElement = function(e) {
            return !!e && e.nodeType === 1
        }, x.isArray = w || function(e) {
            return f.call(e) == "[object Array]"
        }, x.isObject = function(e) {
            return e === Object(e)
        }, T(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function(e) {
            x["is" + e] = function(t) {
                return f.call(t) == "[object " + e + "]"
            }
        }), x.isArguments(arguments) || (x.isArguments = function(e) {
            return !!e && !!x.has(e, "callee")
        }), typeof /./ != "function" && (x.isFunction = function(e) {
            return typeof e == "function"
        }), x.isFinite = function(e) {
            return isFinite(e) && !isNaN(parseFloat(e))
        }, x.isNaN = function(e) {
            return x.isNumber(e) && e != +e
        }, x.isBoolean = function(e) {
            return e === !0 || e === !1 || f.call(e) == "[object Boolean]"
        }, x.isNull = function(e) {
            return e === null
        }, x.isUndefined = function(e) {
            return e === void 0
        }, x.has = function(e, t) {
            return l.call(e, t)
        }, x.noConflict = function() {
            return e._ = t, this
        }, x.identity = function(e) {
            return e
        }, x.times = function(e, t, n) {
            var r = Array(e);
            for (var i = 0; i < e; i++) r[i] = t.call(n, i);
            return r
        }, x.random = function(e, t) {
            return t == null && (t = e, e = 0), e + Math.floor(Math.random() * (t - e + 1))
        };
        var M = {
            escape: {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#x27;",
                "/": "&#x2F;"
            }
        };
        M.unescape = x.invert(M.escape);
        var _ = {
            escape: new RegExp("[" + x.keys(M.escape).join("") + "]", "g"),
            unescape: new RegExp("(" + x.keys(M.unescape).join("|") + ")", "g")
        };
        x.each(["escape", "unescape"], function(e) {
            x[e] = function(t) {
                return t == null ? "" : ("" + t).replace(_[e], function(t) {
                    return M[e][t]
                })
            }
        }), x.result = function(e, t) {
            if (e == null) return null;
            var n = e[t];
            return x.isFunction(n) ? n.call(e) : n
        }, x.mixin = function(e) {
            T(x.functions(e), function(t) {
                var n = x[t] = e[t];
                x.prototype[t] = function() {
                    var e = [this._wrapped];
                    return o.apply(e, arguments), j.call(this, n.apply(x, e))
                }
            })
        };
        var D = 0;
        x.uniqueId = function(e) {
            var t = ++D + "";
            return e ? e + t : t
        }, x.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var P = /(.)^/,
            H = {
                "'": "'",
                "\\": "\\",
                "\r": "r",
                "\n": "n",
                "	": "t",
                "\u2028": "u2028",
                "\u2029": "u2029"
            },
            B = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        x.template = function(e, t, n) {
            var r;
            n = x.defaults({}, n, x.templateSettings);
            var i = new RegExp([(n.escape || P).source, (n.interpolate || P).source, (n.evaluate || P).source].join("|") + "|$", "g"),
                s = 0,
                o = "__p+='";
            e.replace(i, function(t, n, r, i, u) {
                return o += e.slice(s, u).replace(B, function(e) {
                    return "\\" + H[e]
                }), n && (o += "'+\n((__t=(" + n + "))==null?'':_.escape(__t))+\n'"), r && (o += "'+\n((__t=(" + r + "))==null?'':__t)+\n'"), i && (o += "';\n" + i + "\n__p+='"), s = u + t.length, t
            }), o += "';\n", n.variable || (o = "with(obj||{}){\n" + o + "}\n"), o = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + o + "return __p;\n";
            try {
                r = new Function(n.variable || "obj", "_", o)
            } catch (u) {
                throw u.source = o, u
            }
            if (t) return r(t, x);
            var a = function(e) {
                return r.call(this, e, x)
            };
            return a.source = "function(" + (n.variable || "obj") + "){\n" + o + "}", a
        }, x.chain = function(e) {
            return x(e).chain()
        };
        var j = function(e) {
            return this._chain ? x(e).chain() : e
        };
        x.mixin(x), T(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(e) {
            var t = r[e];
            x.prototype[e] = function() {
                var n = this._wrapped;
                return t.apply(n, arguments), (e == "shift" || e == "splice") && n.length === 0 && delete n[0], j.call(this, n)
            }
        }), T(["concat", "join", "slice"], function(e) {
            var t = r[e];
            x.prototype[e] = function() {
                return j.call(this, t.apply(this._wrapped, arguments))
            }
        }), x.extend(x.prototype, {
            chain: function() {
                return this._chain = !0, this
            },
            value: function() {
                return this._wrapped
            }
        })
    }.call(this), define("underscore", function(e) {
        return function() {
            var t, n;
            return t || e._
        }
    }(this)),
    function() {
        var e = this,
            t = e.Backbone,
            n = [],
            r = n.push,
            i = n.slice,
            s = n.splice,
            o;
        typeof exports != "undefined" ? o = exports : o = e.Backbone = {}, o.VERSION = "1.1.0";
        var u = e._;
        !u && typeof require != "undefined" && (u = require("underscore")), o.$ = e.jQuery || e.Zepto || e.ender || e.$, o.noConflict = function() {
            return e.Backbone = t, this
        }, o.emulateHTTP = !1, o.emulateJSON = !1;
        var a = o.Events = {
                on: function(e, t, n) {
                    if (!l(this, "on", e, [t, n]) || !t) return this;
                    this._events || (this._events = {});
                    var r = this._events[e] || (this._events[e] = []);
                    return r.push({
                        callback: t,
                        context: n,
                        ctx: n || this
                    }), this
                },
                once: function(e, t, n) {
                    if (!l(this, "once", e, [t, n]) || !t) return this;
                    var r = this,
                        i = u.once(function() {
                            r.off(e, i), t.apply(this, arguments)
                        });
                    return i._callback = t, this.on(e, i, n)
                },
                off: function(e, t, n) {
                    var r, i, s, o, a, f, c, h;
                    if (!this._events || !l(this, "off", e, [t, n])) return this;
                    if (!e && !t && !n) return this._events = {}, this;
                    o = e ? [e] : u.keys(this._events);
                    for (a = 0, f = o.length; a < f; a++) {
                        e = o[a];
                        if (s = this._events[e]) {
                            this._events[e] = r = [];
                            if (t || n)
                                for (c = 0, h = s.length; c < h; c++) i = s[c], (t && t !== i.callback && t !== i.callback._callback || n && n !== i.context) && r.push(i);
                            r.length || delete this._events[e]
                        }
                    }
                    return this
                },
                trigger: function(e) {
                    if (!this._events) return this;
                    var t = i.call(arguments, 1);
                    if (!l(this, "trigger", e, t)) return this;
                    var n = this._events[e],
                        r = this._events.all;
                    return n && c(n, t), r && c(r, arguments), this
                },
                stopListening: function(e, t, n) {
                    var r = this._listeningTo;
                    if (!r) return this;
                    var i = !t && !n;
                    !n && typeof t == "object" && (n = this), e && ((r = {})[e._listenId] = e);
                    for (var s in r) e = r[s], e.off(t, n, this), (i || u.isEmpty(e._events)) && delete this._listeningTo[s];
                    return this
                }
            },
            f = /\s+/,
            l = function(e, t, n, r) {
                if (!n) return !0;
                if (typeof n == "object") {
                    for (var i in n) e[t].apply(e, [i, n[i]].concat(r));
                    return !1
                }
                if (f.test(n)) {
                    var s = n.split(f);
                    for (var o = 0, u = s.length; o < u; o++) e[t].apply(e, [s[o]].concat(r));
                    return !1
                }
                return !0
            },
            c = function(e, t) {
                var n, r = -1,
                    i = e.length,
                    s = t[0],
                    o = t[1],
                    u = t[2];
                switch (t.length) {
                    case 0:
                        while (++r < i)(n = e[r]).callback.call(n.ctx);
                        return;
                    case 1:
                        while (++r < i)(n = e[r]).callback.call(n.ctx, s);
                        return;
                    case 2:
                        while (++r < i)(n = e[r]).callback.call(n.ctx, s, o);
                        return;
                    case 3:
                        while (++r < i)(n = e[r]).callback.call(n.ctx, s, o, u);
                        return;
                    default:
                        while (++r < i)(n = e[r]).callback.apply(n.ctx, t)
                }
            },
            h = {
                listenTo: "on",
                listenToOnce: "once"
            };
        u.each(h, function(e, t) {
            a[t] = function(t, n, r) {
                var i = this._listeningTo || (this._listeningTo = {}),
                    s = t._listenId || (t._listenId = u.uniqueId("l"));
                return i[s] = t, !r && typeof n == "object" && (r = this), t[e](n, r, this), this
            }
        }), a.bind = a.on, a.unbind = a.off, u.extend(o, a);
        var p = o.Model = function(e, t) {
            var n = e || {};
            t || (t = {}), this.cid = u.uniqueId("c"), this.attributes = {}, t.collection && (this.collection = t.collection), t.parse && (n = this.parse(n, t) || {}), n = u.defaults({}, n, u.result(this, "defaults")), this.set(n, t), this.changed = {}, this.initialize.apply(this, arguments)
        };
        u.extend(p.prototype, a, {
            changed: null,
            validationError: null,
            idAttribute: "id",
            initialize: function() {},
            toJSON: function(e) {
                return u.clone(this.attributes)
            },
            sync: function() {
                return o.sync.apply(this, arguments)
            },
            get: function(e) {
                return this.attributes[e]
            },
            escape: function(e) {
                return u.escape(this.get(e))
            },
            has: function(e) {
                return this.get(e) != null
            },
            set: function(e, t, n) {
                var r, i, s, o, a, f, l, c;
                if (e == null) return this;
                typeof e == "object" ? (i = e, n = t) : (i = {})[e] = t, n || (n = {});
                if (!this._validate(i, n)) return !1;
                s = n.unset, a = n.silent, o = [], f = this._changing, this._changing = !0, f || (this._previousAttributes = u.clone(this.attributes), this.changed = {}), c = this.attributes, l = this._previousAttributes, this.idAttribute in i && (this.id = i[this.idAttribute]);
                for (r in i) t = i[r], u.isEqual(c[r], t) || o.push(r), u.isEqual(l[r], t) ? delete this.changed[r] : this.changed[r] = t, s ? delete c[r] : c[r] = t;
                if (!a) {
                    o.length && (this._pending = !0);
                    for (var h = 0, p = o.length; h < p; h++) this.trigger("change:" + o[h], this, c[o[h]], n)
                }
                if (f) return this;
                if (!a)
                    while (this._pending) this._pending = !1, this.trigger("change", this, n);
                return this._pending = !1, this._changing = !1, this
            },
            unset: function(e, t) {
                return this.set(e, void 0, u.extend({}, t, {
                    unset: !0
                }))
            },
            clear: function(e) {
                var t = {};
                for (var n in this.attributes) t[n] = void 0;
                return this.set(t, u.extend({}, e, {
                    unset: !0
                }))
            },
            hasChanged: function(e) {
                return e == null ? !u.isEmpty(this.changed) : u.has(this.changed, e)
            },
            changedAttributes: function(e) {
                if (!e) return this.hasChanged() ? u.clone(this.changed) : !1;
                var t, n = !1,
                    r = this._changing ? this._previousAttributes : this.attributes;
                for (var i in e) {
                    if (u.isEqual(r[i], t = e[i])) continue;
                    (n || (n = {}))[i] = t
                }
                return n
            },
            previous: function(e) {
                return e == null || !this._previousAttributes ? null : this._previousAttributes[e]
            },
            previousAttributes: function() {
                return u.clone(this._previousAttributes)
            },
            fetch: function(e) {
                e = e ? u.clone(e) : {}, e.parse === void 0 && (e.parse = !0);
                var t = this,
                    n = e.success;
                return e.success = function(r) {
                    if (!t.set(t.parse(r, e), e)) return !1;
                    n && n(t, r, e), t.trigger("sync", t, r, e)
                }, F(this, e), this.sync("read", this, e)
            },
            save: function(e, t, n) {
                var r, i, s, o = this.attributes;
                e == null || typeof e == "object" ? (r = e, n = t) : (r = {})[e] = t, n = u.extend({
                    validate: !0
                }, n);
                if (r && !n.wait) {
                    if (!this.set(r, n)) return !1
                } else if (!this._validate(r, n)) return !1;
                r && n.wait && (this.attributes = u.extend({}, o, r)), n.parse === void 0 && (n.parse = !0);
                var a = this,
                    f = n.success;
                return n.success = function(e) {
                    a.attributes = o;
                    var t = a.parse(e, n);
                    n.wait && (t = u.extend(r || {}, t));
                    if (u.isObject(t) && !a.set(t, n)) return !1;
                    f && f(a, e, n), a.trigger("sync", a, e, n)
                }, F(this, n), i = this.isNew() ? "create" : n.patch ? "patch" : "update", i === "patch" && (n.attrs = r), s = this.sync(i, this, n), r && n.wait && (this.attributes = o), s
            },
            destroy: function(e) {
                e = e ? u.clone(e) : {};
                var t = this,
                    n = e.success,
                    r = function() {
                        t.trigger("destroy", t, t.collection, e)
                    };
                e.success = function(i) {
                    (e.wait || t.isNew()) && r(), n && n(t, i, e), t.isNew() || t.trigger("sync", t, i, e)
                };
                if (this.isNew()) return e.success(), !1;
                F(this, e);
                var i = this.sync("delete", this, e);
                return e.wait || r(), i
            },
            url: function() {
                var e = u.result(this, "urlRoot") || u.result(this.collection, "url") || j();
                return this.isNew() ? e : e + (e.charAt(e.length - 1) === "/" ? "" : "/") + encodeURIComponent(this.id)
            },
            parse: function(e, t) {
                return e
            },
            clone: function() {
                return new this.constructor(this.attributes)
            },
            isNew: function() {
                return this.id == null
            },
            isValid: function(e) {
                return this._validate({}, u.extend(e || {}, {
                    validate: !0
                }))
            },
            _validate: function(e, t) {
                if (!t.validate || !this.validate) return !0;
                e = u.extend({}, this.attributes, e);
                var n = this.validationError = this.validate(e, t) || null;
                return n ? (this.trigger("invalid", this, n, u.extend(t, {
                    validationError: n
                })), !1) : !0
            }
        });
        var d = ["keys", "values", "pairs", "invert", "pick", "omit"];
        u.each(d, function(e) {
            p.prototype[e] = function() {
                var t = i.call(arguments);
                return t.unshift(this.attributes), u[e].apply(u, t)
            }
        });
        var v = o.Collection = function(e, t) {
                t || (t = {}), t.model && (this.model = t.model), t.comparator !== void 0 && (this.comparator = t.comparator), this._reset(), this.initialize.apply(this, arguments), e && this.reset(e, u.extend({
                    silent: !0
                }, t))
            },
            m = {
                add: !0,
                remove: !0,
                merge: !0
            },
            g = {
                add: !0,
                remove: !1
            };
        u.extend(v.prototype, a, {
            model: p,
            initialize: function() {},
            toJSON: function(e) {
                return this.map(function(t) {
                    return t.toJSON(e)
                })
            },
            sync: function() {
                return o.sync.apply(this, arguments)
            },
            add: function(e, t) {
                return this.set(e, u.extend({
                    merge: !1
                }, t, g))
            },
            remove: function(e, t) {
                var n = !u.isArray(e);
                e = n ? [e] : u.clone(e), t || (t = {});
                var r, i, s, o;
                for (r = 0, i = e.length; r < i; r++) {
                    o = e[r] = this.get(e[r]);
                    if (!o) continue;
                    delete this._byId[o.id], delete this._byId[o.cid], s = this.indexOf(o), this.models.splice(s, 1), this.length--, t.silent || (t.index = s, o.trigger("remove", o, this, t)), this._removeReference(o)
                }
                return n ? e[0] : e
            },
            set: function(e, t) {
                t = u.defaults({}, t, m), t.parse && (e = this.parse(e, t));
                var n = !u.isArray(e);
                e = n ? e ? [e] : [] : u.clone(e);
                var r, i, s, o, a, f, l, c = t.at,
                    h = this.model,
                    d = this.comparator && c == null && t.sort !== !1,
                    v = u.isString(this.comparator) ? this.comparator : null,
                    g = [],
                    y = [],
                    b = {},
                    w = t.add,
                    E = t.merge,
                    S = t.remove,
                    x = !d && w && S ? [] : !1;
                for (r = 0, i = e.length; r < i; r++) {
                    a = e[r], a instanceof p ? s = o = a : s = a[h.prototype.idAttribute];
                    if (f = this.get(s)) S && (b[f.cid] = !0), E && (a = a === o ? o.attributes : a, t.parse && (a = f.parse(a, t)), f.set(a, t), d && !l && f.hasChanged(v) && (l = !0)), e[r] = f;
                    else if (w) {
                        o = e[r] = this._prepareModel(a, t);
                        if (!o) continue;
                        g.push(o), o.on("all", this._onModelEvent, this), this._byId[o.cid] = o, o.id != null && (this._byId[o.id] = o)
                    }
                    x && x.push(f || o)
                }
                if (S) {
                    for (r = 0, i = this.length; r < i; ++r) b[(o = this.models[r]).cid] || y.push(o);
                    y.length && this.remove(y, t)
                }
                if (g.length || x && x.length) {
                    d && (l = !0), this.length += g.length;
                    if (c != null)
                        for (r = 0, i = g.length; r < i; r++) this.models.splice(c + r, 0, g[r]);
                    else {
                        x && (this.models.length = 0);
                        var T = x || g;
                        for (r = 0, i = T.length; r < i; r++) this.models.push(T[r])
                    }
                }
                l && this.sort({
                    silent: !0
                });
                if (!t.silent) {
                    for (r = 0, i = g.length; r < i; r++)(o = g[r]).trigger("add", o, this, t);
                    (l || x && x.length) && this.trigger("sort", this, t)
                }
                return n ? e[0] : e
            },
            reset: function(e, t) {
                t || (t = {});
                for (var n = 0, r = this.models.length; n < r; n++) this._removeReference(this.models[n]);
                return t.previousModels = this.models, this._reset(), e = this.add(e, u.extend({
                    silent: !0
                }, t)), t.silent || this.trigger("reset", this, t), e
            },
            push: function(e, t) {
                return this.add(e, u.extend({
                    at: this.length
                }, t))
            },
            pop: function(e) {
                var t = this.at(this.length - 1);
                return this.remove(t, e), t
            },
            unshift: function(e, t) {
                return this.add(e, u.extend({
                    at: 0
                }, t))
            },
            shift: function(e) {
                var t = this.at(0);
                return this.remove(t, e), t
            },
            slice: function() {
                return i.apply(this.models, arguments)
            },
            get: function(e) {
                return e == null ? void 0 : this._byId[e.id] || this._byId[e.cid] || this._byId[e]
            },
            at: function(e) {
                return this.models[e]
            },
            where: function(e, t) {
                return u.isEmpty(e) ? t ? void 0 : [] : this[t ? "find" : "filter"](function(t) {
                    for (var n in e)
                        if (e[n] !== t.get(n)) return !1;
                    return !0
                })
            },
            findWhere: function(e) {
                return this.where(e, !0)
            },
            sort: function(e) {
                if (!this.comparator) throw new Error("Cannot sort a set without a comparator");
                return e || (e = {}), u.isString(this.comparator) || this.comparator.length === 1 ? this.models = this.sortBy(this.comparator, this) : this.models.sort(u.bind(this.comparator, this)), e.silent || this.trigger("sort", this, e), this
            },
            pluck: function(e) {
                return u.invoke(this.models, "get", e)
            },
            fetch: function(e) {
                e = e ? u.clone(e) : {}, e.parse === void 0 && (e.parse = !0);
                var t = e.success,
                    n = this;
                return e.success = function(r) {
                    var i = e.reset ? "reset" : "set";
                    n[i](r, e), t && t(n, r, e), n.trigger("sync", n, r, e)
                }, F(this, e), this.sync("read", this, e)
            },
            create: function(e, t) {
                t = t ? u.clone(t) : {};
                if (!(e = this._prepareModel(e, t))) return !1;
                t.wait || this.add(e, t);
                var n = this,
                    r = t.success;
                return t.success = function(e, t, i) {
                    i.wait && n.add(e, i), r && r(e, t, i)
                }, e.save(null, t), e
            },
            parse: function(e, t) {
                return e
            },
            clone: function() {
                return new this.constructor(this.models)
            },
            _reset: function() {
                this.length = 0, this.models = [], this._byId = {}
            },
            _prepareModel: function(e, t) {
                if (e instanceof p) return e.collection || (e.collection = this), e;
                t = t ? u.clone(t) : {}, t.collection = this;
                var n = new this.model(e, t);
                return n.validationError ? (this.trigger("invalid", this, n.validationError, t), !1) : n
            },
            _removeReference: function(e) {
                this === e.collection && delete e.collection, e.off("all", this._onModelEvent, this)
            },
            _onModelEvent: function(e, t, n, r) {
                if ((e === "add" || e === "remove") && n !== this) return;
                e === "destroy" && this.remove(t, r), t && e === "change:" + t.idAttribute && (delete this._byId[t.previous(t.idAttribute)], t.id != null && (this._byId[t.id] = t)), this.trigger.apply(this, arguments)
            }
        });
        var y = ["forEach", "each", "map", "collect", "reduce", "foldl", "inject", "reduceRight", "foldr", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "max", "min", "toArray", "size", "first", "head", "take", "initial", "rest", "tail", "drop", "last", "without", "difference", "indexOf", "shuffle", "lastIndexOf", "isEmpty", "chain"];
        u.each(y, function(e) {
            v.prototype[e] = function() {
                var t = i.call(arguments);
                return t.unshift(this.models), u[e].apply(u, t)
            }
        });
        var b = ["groupBy", "countBy", "sortBy"];
        u.each(b, function(e) {
            v.prototype[e] = function(t, n) {
                var r = u.isFunction(t) ? t : function(e) {
                    return e.get(t)
                };
                return u[e](this.models, r, n)
            }
        });
        var w = o.View = function(e) {
                this.cid = u.uniqueId("view"), e || (e = {}), u.extend(this, u.pick(e, S)), this._ensureElement(), this.initialize.apply(this, arguments), this.delegateEvents()
            },
            E = /^(\S+)\s*(.*)$/,
            S = ["model", "collection", "el", "id", "attributes", "className", "tagName", "events"];
        u.extend(w.prototype, a, {
            tagName: "div",
            $: function(e) {
                return this.$el.find(e)
            },
            initialize: function() {},
            render: function() {
                return this
            },
            remove: function() {
                return this.$el.remove(), this.stopListening(), this
            },
            setElement: function(e, t) {
                return this.$el && this.undelegateEvents(), this.$el = e instanceof o.$ ? e : o.$(e), this.el = this.$el[0], t !== !1 && this.delegateEvents(), this
            },
            delegateEvents: function(e) {
                if (!e && !(e = u.result(this, "events"))) return this;
                this.undelegateEvents();
                for (var t in e) {
                    var n = e[t];
                    u.isFunction(n) || (n = this[e[t]]);
                    if (!n) continue;
                    var r = t.match(E),
                        i = r[1],
                        s = r[2];
                    n = u.bind(n, this), i += ".delegateEvents" + this.cid, s === "" ? this.$el.on(i, n) : this.$el.on(i, s, n)
                }
                return this
            },
            undelegateEvents: function() {
                return this.$el.off(".delegateEvents" + this.cid), this
            },
            _ensureElement: function() {
                if (!this.el) {
                    var e = u.extend({}, u.result(this, "attributes"));
                    this.id && (e.id = u.result(this, "id")), this.className && (e["class"] = u.result(this, "className"));
                    var t = o.$("<" + u.result(this, "tagName") + ">").attr(e);
                    this.setElement(t, !1)
                } else this.setElement(u.result(this, "el"), !1)
            }
        }), o.sync = function(e, t, n) {
            var r = T[e];
            u.defaults(n || (n = {}), {
                emulateHTTP: o.emulateHTTP,
                emulateJSON: o.emulateJSON
            });
            var i = {
                type: r,
                dataType: "json"
            };
            n.url || (i.url = u.result(t, "url") || j()), n.data == null && t && (e === "create" || e === "update" || e === "patch") && (i.contentType = "application/json", i.data = JSON.stringify(n.attrs || t.toJSON(n))), n.emulateJSON && (i.contentType = "application/x-www-form-urlencoded", i.data = i.data ? {
                model: i.data
            } : {});
            if (n.emulateHTTP && (r === "PUT" || r === "DELETE" || r === "PATCH")) {
                i.type = "POST", n.emulateJSON && (i.data._method = r);
                var s = n.beforeSend;
                n.beforeSend = function(e) {
                    e.setRequestHeader("X-HTTP-Method-Override", r);
                    if (s) return s.apply(this, arguments)
                }
            }
            i.type !== "GET" && !n.emulateJSON && (i.processData = !1), i.type === "PATCH" && x && (i.xhr = function() {
                return new ActiveXObject("Microsoft.XMLHTTP")
            });
            var a = n.xhr = o.ajax(u.extend(i, n));
            return t.trigger("request", t, a, n), a
        };
        var x = typeof window != "undefined" && !!window.ActiveXObject && (!window.XMLHttpRequest || !(new XMLHttpRequest).dispatchEvent),
            T = {
                create: "POST",
                update: "PUT",
                patch: "PATCH",
                "delete": "DELETE",
                read: "GET"
            };
        o.ajax = function() {
            return o.$.ajax.apply(o.$, arguments)
        };
        var N = o.Router = function(e) {
                e || (e = {}), e.routes && (this.routes = e.routes), this._bindRoutes(), this.initialize.apply(this, arguments)
            },
            C = /\((.*?)\)/g,
            k = /(\(\?)?:\w+/g,
            L = /\*\w+/g,
            A = /[\-{}\[\]+?.,\\\^$|#\s]/g;
        u.extend(N.prototype, a, {
            initialize: function() {},
            route: function(e, t, n) {
                u.isRegExp(e) || (e = this._routeToRegExp(e)), u.isFunction(t) && (n = t, t = ""), n || (n = this[t]);
                var r = this;
                return o.history.route(e, function(i) {
                    var s = r._extractParameters(e, i);
                    n && n.apply(r, s), r.trigger.apply(r, ["route:" + t].concat(s)), r.trigger("route", t, s), o.history.trigger("route", r, t, s)
                }), this
            },
            navigate: function(e, t) {
                return o.history.navigate(e, t), this
            },
            _bindRoutes: function() {
                if (!this.routes) return;
                this.routes = u.result(this, "routes");
                var e, t = u.keys(this.routes);
                while ((e = t.pop()) != null) this.route(e, this.routes[e])
            },
            _routeToRegExp: function(e) {
                return e = e.replace(A, "\\$&").replace(C, "(?:$1)?").replace(k, function(e, t) {
                    return t ? e : "([^/]+)"
                }).replace(L, "(.*?)"), new RegExp("^" + e + "$")
            },
            _extractParameters: function(e, t) {
                var n = e.exec(t).slice(1);
                return u.map(n, function(e) {
                    return e ? decodeURIComponent(e) : null
                })
            }
        });
        var O = o.History = function() {
                this.handlers = [], u.bindAll(this, "checkUrl"), typeof window != "undefined" && (this.location = window.location, this.history = window.history)
            },
            M = /^[#\/]|\s+$/g,
            _ = /^\/+|\/+$/g,
            D = /msie [\w.]+/,
            P = /\/$/,
            H = /[?#].*$/;
        O.started = !1, u.extend(O.prototype, a, {
            interval: 50,
            getHash: function(e) {
                var t = (e || this).location.href.match(/#(.*)$/);
                return t ? t[1] : ""
            },
            getFragment: function(e, t) {
                if (e == null)
                    if (this._hasPushState || !this._wantsHashChange || t) {
                        e = this.location.pathname;
                        var n = this.root.replace(P, "");
                        e.indexOf(n) || (e = e.slice(n.length))
                    } else e = this.getHash();
                return e.replace(M, "")
            },
            start: function(e) {
                if (O.started) throw new Error("Backbone.history has already been started");
                O.started = !0, this.options = u.extend({
                    root: "/"
                }, this.options, e), this.root = this.options.root, this._wantsHashChange = this.options.hashChange !== !1, this._wantsPushState = !!this.options.pushState, this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
                var t = this.getFragment(),
                    n = document.documentMode,
                    r = D.exec(navigator.userAgent.toLowerCase()) && (!n || n <= 7);
                this.root = ("/" + this.root + "/").replace(_, "/"), r && this._wantsHashChange && (this.iframe = o.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow, this.navigate(t)), this._hasPushState ? o.$(window).on("popstate", this.checkUrl) : this._wantsHashChange && "onhashchange" in window && !r ? o.$(window).on("hashchange", this.checkUrl) : this._wantsHashChange && (this._checkUrlInterval = setInterval(this.checkUrl, this.interval)), this.fragment = t;
                var i = this.location,
                    s = i.pathname.replace(/[^\/]$/, "$&/") === this.root;
                if (this._wantsHashChange && this._wantsPushState) {
                    if (!this._hasPushState && !s) return this.fragment = this.getFragment(null, !0), this.location.replace(this.root + this.location.search + "#" + this.fragment), !0;
                    this._hasPushState && s && i.hash && (this.fragment = this.getHash().replace(M, ""), this.history.replaceState({}, document.title, this.root + this.fragment + i.search))
                }
                if (!this.options.silent) return this.loadUrl()
            },
            stop: function() {
                o.$(window).off("popstate", this.checkUrl).off("hashchange", this.checkUrl), clearInterval(this._checkUrlInterval), O.started = !1
            },
            route: function(e, t) {
                this.handlers.unshift({
                    route: e,
                    callback: t
                })
            },
            checkUrl: function(e) {
                var t = this.getFragment();
                t === this.fragment && this.iframe && (t = this.getFragment(this.getHash(this.iframe)));
                if (t === this.fragment) return !1;
                this.iframe && this.navigate(t), this.loadUrl()
            },
            loadUrl: function(e) {
                return e = this.fragment = this.getFragment(e), u.any(this.handlers, function(t) {
                    if (t.route.test(e)) return t.callback(e), !0
                })
            },
            navigate: function(e, t) {
                if (!O.started) return !1;
                if (!t || t === !0) t = {
                    trigger: !!t
                };
                var n = this.root + (e = this.getFragment(e || ""));
                e = e.replace(H, "");
                if (this.fragment === e) return;
                this.fragment = e, e === "" && n !== "/" && (n = n.slice(0, -1));
                if (this._hasPushState) this.history[t.replace ? "replaceState" : "pushState"]({}, document.title, n);
                else {
                    if (!this._wantsHashChange) return this.location.assign(n);
                    this._updateHash(this.location, e, t.replace), this.iframe && e !== this.getFragment(this.getHash(this.iframe)) && (t.replace || this.iframe.document.open().close(), this._updateHash(this.iframe.location, e, t.replace))
                }
                if (t.trigger) return this.loadUrl(e)
            },
            _updateHash: function(e, t, n) {
                if (n) {
                    var r = e.href.replace(/(javascript:|#).*$/, "");
                    e.replace(r + "#" + t)
                } else e.hash = "#" + t
            }
        }), o.history = new O;
        var B = function(e, t) {
            var n = this,
                r;
            e && u.has(e, "constructor") ? r = e.constructor : r = function() {
                return n.apply(this, arguments)
            }, u.extend(r, n, t);
            var i = function() {
                this.constructor = r
            };
            return i.prototype = n.prototype, r.prototype = new i, e && u.extend(r.prototype, e), r.__super__ = n.prototype, r
        };
        p.extend = v.extend = N.extend = w.extend = O.extend = B;
        var j = function() {
                throw new Error('A "url" property or function must be specified')
            },
            F = function(e, t) {
                var n = t.error;
                t.error = function(r) {
                    n && n(e, r, t), e.trigger("error", e, r, t)
                }
            }
    }.call(this), define("backbone", ["underscore", "jquery"], function(e) {
        return function() {
            var t, n;
            return t || e.Backbone
        }
    }(this));
var Handlebars = function() {
    var e = function() {
            function t(e) {
                this.string = e
            }
            var e;
            return t.prototype.toString = function() {
                return "" + this.string
            }, e = t, e
        }(),
        t = function(e) {
            function o(e) {
                return r[e] || "&amp;"
            }

            function u(e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
            }

            function c(e) {
                return e instanceof n ? e.toString() : !e && e !== 0 ? "" : (e = "" + e, s.test(e) ? e.replace(i, o) : e)
            }

            function h(e) {
                return !e && e !== 0 ? !0 : l(e) && e.length === 0 ? !0 : !1
            }
            var t = {},
                n = e,
                r = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#x27;",
                    "`": "&#x60;"
                },
                i = /[&<>"'`]/g,
                s = /[&<>"'`]/;
            t.extend = u;
            var a = Object.prototype.toString;
            t.toString = a;
            var f = function(e) {
                return typeof e == "function"
            };
            f(/x/) && (f = function(e) {
                return typeof e == "function" && a.call(e) === "[object Function]"
            });
            var f;
            t.isFunction = f;
            var l = Array.isArray || function(e) {
                return e && typeof e == "object" ? a.call(e) === "[object Array]" : !1
            };
            return t.isArray = l, t.escapeExpression = c, t.isEmpty = h, t
        }(e),
        n = function() {
            function n() {
                var e = Error.prototype.constructor.apply(this, arguments);
                for (var n = 0; n < t.length; n++) this[t[n]] = e[t[n]]
            }
            var e, t = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];
            return n.prototype = new Error, e = n, e
        }(),
        r = function(e, t) {
            function h(e, t) {
                this.helpers = e || {}, this.partials = t || {}, p(this)
            }

            function p(e) {
                e.registerHelper("helperMissing", function(e) {
                    if (arguments.length === 2) return undefined;
                    throw new Error("Missing helper: '" + e + "'")
                }), e.registerHelper("blockHelperMissing", function(t, n) {
                    var r = n.inverse || function() {},
                        i = n.fn;
                    return f(t) && (t = t.call(this)), t === !0 ? i(this) : t === !1 || t == null ? r(this) : a(t) ? t.length > 0 ? e.helpers.each(t, n) : r(this) : i(t)
                }), e.registerHelper("each", function(e, t) {
                    var n = t.fn,
                        r = t.inverse,
                        i = 0,
                        s = "",
                        o;
                    f(e) && (e = e.call(this)), t.data && (o = m(t.data));
                    if (e && typeof e == "object")
                        if (a(e))
                            for (var u = e.length; i < u; i++) o && (o.index = i, o.first = i === 0, o.last = i === e.length - 1), s += n(e[i], {
                                data: o
                            });
                        else
                            for (var l in e) e.hasOwnProperty(l) && (o && (o.key = l), s += n(e[l], {
                                data: o
                            }), i++);
                    return i === 0 && (s = r(this)), s
                }), e.registerHelper("if", function(e, t) {
                    return f(e) && (e = e.call(this)), !t.hash.includeZero && !e || r.isEmpty(e) ? t.inverse(this) : t.fn(this)
                }), e.registerHelper("unless", function(t, n) {
                    return e.helpers["if"].call(this, t, {
                        fn: n.inverse,
                        inverse: n.fn,
                        hash: n.hash
                    })
                }), e.registerHelper("with", function(e, t) {
                    f(e) && (e = e.call(this));
                    if (!r.isEmpty(e)) return t.fn(e)
                }), e.registerHelper("log", function(t, n) {
                    var r = n.data && n.data.level != null ? parseInt(n.data.level, 10) : 1;
                    e.log(r, t)
                })
            }

            function v(e, t) {
                d.log(e, t)
            }
            var n = {},
                r = e,
                i = t,
                s = "1.1.2";
            n.VERSION = s;
            var o = 4;
            n.COMPILER_REVISION = o;
            var u = {
                1: "<= 1.0.rc.2",
                2: "== 1.0.0-rc.3",
                3: "== 1.0.0-rc.4",
                4: ">= 1.0.0"
            };
            n.REVISION_CHANGES = u;
            var a = r.isArray,
                f = r.isFunction,
                l = r.toString,
                c = "[object Object]";
            n.HandlebarsEnvironment = h, h.prototype = {
                constructor: h,
                logger: d,
                log: v,
                registerHelper: function(e, t, n) {
                    if (l.call(e) === c) {
                        if (n || t) throw new i("Arg not supported with multiple helpers");
                        r.extend(this.helpers, e)
                    } else n && (t.not = n), this.helpers[e] = t
                },
                registerPartial: function(e, t) {
                    l.call(e) === c ? r.extend(this.partials, e) : this.partials[e] = t
                }
            };
            var d = {
                methodMap: {
                    0: "debug",
                    1: "info",
                    2: "warn",
                    3: "error"
                },
                DEBUG: 0,
                INFO: 1,
                WARN: 2,
                ERROR: 3,
                level: 3,
                log: function(e, t) {
                    if (d.level <= e) {
                        var n = d.methodMap[e];
                        typeof console != "undefined" && console[n] && console[n].call(console, t)
                    }
                }
            };
            n.logger = d, n.log = v;
            var m = function(e) {
                var t = {};
                return r.extend(t, e), t
            };
            return n.createFrame = m, n
        }(t, n),
        i = function(e, t, n) {
            function a(e) {
                var t = e && e[0] || 1,
                    n = o;
                if (t !== n) {
                    if (t < n) {
                        var r = u[n],
                            i = u[t];
                        throw new Error("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + r + ") or downgrade your runtime to an older version (" + i + ").")
                    }
                    throw new Error("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + e[1] + ").")
                }
            }

            function f(e, t) {
                if (!t) throw new Error("No environment passed to template");
                var n;
                t.compile ? n = function(e, n, r, i, s, o) {
                    var u = h.apply(this, arguments);
                    if (u) return u;
                    var a = {
                        helpers: i,
                        partials: s,
                        data: o
                    };
                    return s[n] = t.compile(e, {
                        data: o !== undefined
                    }, t), s[n](r, a)
                } : n = function(e, t) {
                    var n = h.apply(this, arguments);
                    if (n) return n;
                    throw new s("The partial " + t + " could not be compiled when running in runtime-only mode")
                };
                var r = {
                    escapeExpression: i.escapeExpression,
                    invokePartial: n,
                    programs: [],
                    program: function(e, t, n) {
                        var r = this.programs[e];
                        return n ? r = c(e, t, n) : r || (r = this.programs[e] = c(e, t)), r
                    },
                    merge: function(e, t) {
                        var n = e || t;
                        return e && t && e !== t && (n = {}, i.extend(n, t), i.extend(n, e)), n
                    },
                    programWithDepth: l,
                    noop: p,
                    compilerInfo: null
                };
                return function(n, i) {
                    i = i || {};
                    var s = i.partial ? i : t,
                        o, u;
                    i.partial || (o = i.helpers, u = i.partials);
                    var f = e.call(r, s, n, o, u, i.data);
                    return i.partial || a(r.compilerInfo), f
                }
            }

            function l(e, t, n) {
                var r = Array.prototype.slice.call(arguments, 3),
                    i = function(e, i) {
                        return i = i || {}, t.apply(this, [e, i.data || n].concat(r))
                    };
                return i.program = e, i.depth = r.length, i
            }

            function c(e, t, n) {
                var r = function(e, r) {
                    return r = r || {}, t(e, r.data || n)
                };
                return r.program = e, r.depth = 0, r
            }

            function h(e, t, n, r, i, o) {
                var u = {
                    partial: !0,
                    helpers: r,
                    partials: i,
                    data: o
                };
                if (e === undefined) throw new s("The partial " + t + " could not be found");
                if (e instanceof Function) return e(n, u)
            }

            function p() {
                return ""
            }
            var r = {},
                i = e,
                s = t,
                o = n.COMPILER_REVISION,
                u = n.REVISION_CHANGES;
            return r.template = f, r.programWithDepth = l, r.program = c, r.invokePartial = h, r.noop = p, r
        }(t, n, r),
        s = function(e, t, n, r, i) {
            var s, o = e,
                u = t,
                a = n,
                f = r,
                l = i,
                c = function() {
                    var e = new o.HandlebarsEnvironment;
                    return f.extend(e, o), e.SafeString = u, e.Exception = a, e.Utils = f, e.VM = l, e.template = function(t) {
                        return l.template(t, e)
                    }, e
                },
                h = c();
            return h.create = c, s = h, s
        }(r, e, n, t, i),
        o = function(e) {
            function r(e, t, n) {
                this.type = "program", this.statements = e, this.strip = {}, n ? (this.inverse = new r(n, t), this.strip.right = t.left) : t && (this.strip.left = t.right)
            }

            function i(e, t, n, r) {
                this.type = "mustache", this.hash = t, this.strip = r;
                var i = n[3] || n[2];
                this.escaped = i !== "{" && i !== "&";
                var s = this.id = e[0],
                    o = this.params = e.slice(1),
                    u = this.eligibleHelper = s.isSimple;
                this.isHelper = u && (o.length || t)
            }

            function s(e, t, n) {
                this.type = "partial", this.partialName = e, this.context = t, this.strip = n
            }

            function o(e, t, r, i) {
                if (e.id.original !== i.path.original) throw new n(e.id.original + " doesn't match " + i.path.original);
                this.type = "block", this.mustache = e, this.program = t, this.inverse = r, this.strip = {
                    left: e.strip.left,
                    right: i.strip.right
                }, (t || r).strip.left = e.strip.right, (r || t).strip.right = i.strip.left, r && !t && (this.isInverse = !0)
            }

            function u(e) {
                this.type = "content", this.string = e
            }

            function a(e) {
                this.type = "hash", this.pairs = e
            }

            function f(e) {
                this.type = "ID";
                var t = "",
                    r = [],
                    i = 0;
                for (var s = 0, o = e.length; s < o; s++) {
                    var u = e[s].part;
                    t += (e[s].separator || "") + u;
                    if (u === ".." || u === "." || u === "this") {
                        if (r.length > 0) throw new n("Invalid path: " + t);
                        u === ".." ? i++ : this.isScoped = !0
                    } else r.push(u)
                }
                this.original = t, this.parts = r, this.string = r.join("."), this.depth = i, this.isSimple = e.length === 1 && !this.isScoped && i === 0, this.stringModeValue = this.string
            }

            function l(e) {
                this.type = "PARTIAL_NAME", this.name = e.original
            }

            function c(e) {
                this.type = "DATA", this.id = e
            }

            function h(e) {
                this.type = "STRING", this.original = this.string = this.stringModeValue = e
            }

            function p(e) {
                this.type = "INTEGER", this.original = this.integer = e, this.stringModeValue = Number(e)
            }

            function d(e) {
                this.type = "BOOLEAN", this.bool = e, this.stringModeValue = e === "true"
            }

            function v(e) {
                this.type = "comment", this.comment = e
            }
            var t = {},
                n = e;
            return t.ProgramNode = r, t.MustacheNode = i, t.PartialNode = s, t.BlockNode = o, t.ContentNode = u, t.HashNode = a, t.IdNode = f, t.PartialNameNode = l, t.DataNode = c, t.StringNode = h, t.IntegerNode = p, t.BooleanNode = d, t.CommentNode = v, t
        }(n),
        u = function() {
            var e, t = function() {
                function t(e, t) {
                    return {
                        left: e[2] === "~",
                        right: t[0] === "~" || t[1] === "~"
                    }
                }

                function r() {
                    this.yy = {}
                }
                var e = {
                        trace: function() {},
                        yy: {},
                        symbols_: {
                            error: 2,
                            root: 3,
                            statements: 4,
                            EOF: 5,
                            program: 6,
                            simpleInverse: 7,
                            statement: 8,
                            openInverse: 9,
                            closeBlock: 10,
                            openBlock: 11,
                            mustache: 12,
                            partial: 13,
                            CONTENT: 14,
                            COMMENT: 15,
                            OPEN_BLOCK: 16,
                            inMustache: 17,
                            CLOSE: 18,
                            OPEN_INVERSE: 19,
                            OPEN_ENDBLOCK: 20,
                            path: 21,
                            OPEN: 22,
                            OPEN_UNESCAPED: 23,
                            CLOSE_UNESCAPED: 24,
                            OPEN_PARTIAL: 25,
                            partialName: 26,
                            partial_option0: 27,
                            inMustache_repetition0: 28,
                            inMustache_option0: 29,
                            dataName: 30,
                            param: 31,
                            STRING: 32,
                            INTEGER: 33,
                            BOOLEAN: 34,
                            hash: 35,
                            hash_repetition_plus0: 36,
                            hashSegment: 37,
                            ID: 38,
                            EQUALS: 39,
                            DATA: 40,
                            pathSegments: 41,
                            SEP: 42,
                            $accept: 0,
                            $end: 1
                        },
                        terminals_: {
                            2: "error",
                            5: "EOF",
                            14: "CONTENT",
                            15: "COMMENT",
                            16: "OPEN_BLOCK",
                            18: "CLOSE",
                            19: "OPEN_INVERSE",
                            20: "OPEN_ENDBLOCK",
                            22: "OPEN",
                            23: "OPEN_UNESCAPED",
                            24: "CLOSE_UNESCAPED",
                            25: "OPEN_PARTIAL",
                            32: "STRING",
                            33: "INTEGER",
                            34: "BOOLEAN",
                            38: "ID",
                            39: "EQUALS",
                            40: "DATA",
                            42: "SEP"
                        },
                        productions_: [0, [3, 2],
                            [3, 1],
                            [6, 2],
                            [6, 3],
                            [6, 2],
                            [6, 1],
                            [6, 1],
                            [6, 0],
                            [4, 1],
                            [4, 2],
                            [8, 3],
                            [8, 3],
                            [8, 1],
                            [8, 1],
                            [8, 1],
                            [8, 1],
                            [11, 3],
                            [9, 3],
                            [10, 3],
                            [12, 3],
                            [12, 3],
                            [13, 4],
                            [7, 2],
                            [17, 3],
                            [17, 1],
                            [31, 1],
                            [31, 1],
                            [31, 1],
                            [31, 1],
                            [31, 1],
                            [35, 1],
                            [37, 3],
                            [26, 1],
                            [26, 1],
                            [26, 1],
                            [30, 2],
                            [21, 1],
                            [41, 3],
                            [41, 1],
                            [27, 0],
                            [27, 1],
                            [28, 0],
                            [28, 2],
                            [29, 0],
                            [29, 1],
                            [36, 1],
                            [36, 2]
                        ],
                        performAction: function(n, r, i, s, o, u, a) {
                            var f = u.length - 1;
                            switch (o) {
                                case 1:
                                    return new s.ProgramNode(u[f - 1]);
                                case 2:
                                    return new s.ProgramNode([]);
                                case 3:
                                    this.$ = new s.ProgramNode([], u[f - 1], u[f]);
                                    break;
                                case 4:
                                    this.$ = new s.ProgramNode(u[f - 2], u[f - 1], u[f]);
                                    break;
                                case 5:
                                    this.$ = new s.ProgramNode(u[f - 1], u[f], []);
                                    break;
                                case 6:
                                    this.$ = new s.ProgramNode(u[f]);
                                    break;
                                case 7:
                                    this.$ = new s.ProgramNode([]);
                                    break;
                                case 8:
                                    this.$ = new s.ProgramNode([]);
                                    break;
                                case 9:
                                    this.$ = [u[f]];
                                    break;
                                case 10:
                                    u[f - 1].push(u[f]), this.$ = u[f - 1];
                                    break;
                                case 11:
                                    this.$ = new s.BlockNode(u[f - 2], u[f - 1].inverse, u[f - 1], u[f]);
                                    break;
                                case 12:
                                    this.$ = new s.BlockNode(u[f - 2], u[f - 1], u[f - 1].inverse, u[f]);
                                    break;
                                case 13:
                                    this.$ = u[f];
                                    break;
                                case 14:
                                    this.$ = u[f];
                                    break;
                                case 15:
                                    this.$ = new s.ContentNode(u[f]);
                                    break;
                                case 16:
                                    this.$ = new s.CommentNode(u[f]);
                                    break;
                                case 17:
                                    this.$ = new s.MustacheNode(u[f - 1][0], u[f - 1][1], u[f - 2], t(u[f - 2], u[f]));
                                    break;
                                case 18:
                                    this.$ = new s.MustacheNode(u[f - 1][0], u[f - 1][1], u[f - 2], t(u[f - 2], u[f]));
                                    break;
                                case 19:
                                    this.$ = {
                                        path: u[f - 1],
                                        strip: t(u[f - 2], u[f])
                                    };
                                    break;
                                case 20:
                                    this.$ = new s.MustacheNode(u[f - 1][0], u[f - 1][1], u[f - 2], t(u[f - 2], u[f]));
                                    break;
                                case 21:
                                    this.$ = new s.MustacheNode(u[f - 1][0], u[f - 1][1], u[f - 2], t(u[f - 2], u[f]));
                                    break;
                                case 22:
                                    this.$ = new s.PartialNode(u[f - 2], u[f - 1], t(u[f - 3], u[f]));
                                    break;
                                case 23:
                                    this.$ = t(u[f - 1], u[f]);
                                    break;
                                case 24:
                                    this.$ = [
                                        [u[f - 2]].concat(u[f - 1]), u[f]
                                    ];
                                    break;
                                case 25:
                                    this.$ = [
                                        [u[f]], null
                                    ];
                                    break;
                                case 26:
                                    this.$ = u[f];
                                    break;
                                case 27:
                                    this.$ = new s.StringNode(u[f]);
                                    break;
                                case 28:
                                    this.$ = new s.IntegerNode(u[f]);
                                    break;
                                case 29:
                                    this.$ = new s.BooleanNode(u[f]);
                                    break;
                                case 30:
                                    this.$ = u[f];
                                    break;
                                case 31:
                                    this.$ = new s.HashNode(u[f]);
                                    break;
                                case 32:
                                    this.$ = [u[f - 2], u[f]];
                                    break;
                                case 33:
                                    this.$ = new s.PartialNameNode(u[f]);
                                    break;
                                case 34:
                                    this.$ = new s.PartialNameNode(new s.StringNode(u[f]));
                                    break;
                                case 35:
                                    this.$ = new s.PartialNameNode(new s.IntegerNode(u[f]));
                                    break;
                                case 36:
                                    this.$ = new s.DataNode(u[f]);
                                    break;
                                case 37:
                                    this.$ = new s.IdNode(u[f]);
                                    break;
                                case 38:
                                    u[f - 2].push({
                                        part: u[f],
                                        separator: u[f - 1]
                                    }), this.$ = u[f - 2];
                                    break;
                                case 39:
                                    this.$ = [{
                                        part: u[f]
                                    }];
                                    break;
                                case 42:
                                    this.$ = [];
                                    break;
                                case 43:
                                    u[f - 1].push(u[f]);
                                    break;
                                case 46:
                                    this.$ = [u[f]];
                                    break;
                                case 47:
                                    u[f - 1].push(u[f])
                            }
                        },
                        table: [{
                            3: 1,
                            4: 2,
                            5: [1, 3],
                            8: 4,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 11],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            1: [3]
                        }, {
                            5: [1, 16],
                            8: 17,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 11],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            1: [2, 2]
                        }, {
                            5: [2, 9],
                            14: [2, 9],
                            15: [2, 9],
                            16: [2, 9],
                            19: [2, 9],
                            20: [2, 9],
                            22: [2, 9],
                            23: [2, 9],
                            25: [2, 9]
                        }, {
                            4: 20,
                            6: 18,
                            7: 19,
                            8: 4,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 21],
                            20: [2, 8],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            4: 20,
                            6: 22,
                            7: 19,
                            8: 4,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 21],
                            20: [2, 8],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            5: [2, 13],
                            14: [2, 13],
                            15: [2, 13],
                            16: [2, 13],
                            19: [2, 13],
                            20: [2, 13],
                            22: [2, 13],
                            23: [2, 13],
                            25: [2, 13]
                        }, {
                            5: [2, 14],
                            14: [2, 14],
                            15: [2, 14],
                            16: [2, 14],
                            19: [2, 14],
                            20: [2, 14],
                            22: [2, 14],
                            23: [2, 14],
                            25: [2, 14]
                        }, {
                            5: [2, 15],
                            14: [2, 15],
                            15: [2, 15],
                            16: [2, 15],
                            19: [2, 15],
                            20: [2, 15],
                            22: [2, 15],
                            23: [2, 15],
                            25: [2, 15]
                        }, {
                            5: [2, 16],
                            14: [2, 16],
                            15: [2, 16],
                            16: [2, 16],
                            19: [2, 16],
                            20: [2, 16],
                            22: [2, 16],
                            23: [2, 16],
                            25: [2, 16]
                        }, {
                            17: 23,
                            21: 24,
                            30: 25,
                            38: [1, 28],
                            40: [1, 27],
                            41: 26
                        }, {
                            17: 29,
                            21: 24,
                            30: 25,
                            38: [1, 28],
                            40: [1, 27],
                            41: 26
                        }, {
                            17: 30,
                            21: 24,
                            30: 25,
                            38: [1, 28],
                            40: [1, 27],
                            41: 26
                        }, {
                            17: 31,
                            21: 24,
                            30: 25,
                            38: [1, 28],
                            40: [1, 27],
                            41: 26
                        }, {
                            21: 33,
                            26: 32,
                            32: [1, 34],
                            33: [1, 35],
                            38: [1, 28],
                            41: 26
                        }, {
                            1: [2, 1]
                        }, {
                            5: [2, 10],
                            14: [2, 10],
                            15: [2, 10],
                            16: [2, 10],
                            19: [2, 10],
                            20: [2, 10],
                            22: [2, 10],
                            23: [2, 10],
                            25: [2, 10]
                        }, {
                            10: 36,
                            20: [1, 37]
                        }, {
                            4: 38,
                            8: 4,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 11],
                            20: [2, 7],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            7: 39,
                            8: 17,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 21],
                            20: [2, 6],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            17: 23,
                            18: [1, 40],
                            21: 24,
                            30: 25,
                            38: [1, 28],
                            40: [1, 27],
                            41: 26
                        }, {
                            10: 41,
                            20: [1, 37]
                        }, {
                            18: [1, 42]
                        }, {
                            18: [2, 42],
                            24: [2, 42],
                            28: 43,
                            32: [2, 42],
                            33: [2, 42],
                            34: [2, 42],
                            38: [2, 42],
                            40: [2, 42]
                        }, {
                            18: [2, 25],
                            24: [2, 25]
                        }, {
                            18: [2, 37],
                            24: [2, 37],
                            32: [2, 37],
                            33: [2, 37],
                            34: [2, 37],
                            38: [2, 37],
                            40: [2, 37],
                            42: [1, 44]
                        }, {
                            21: 45,
                            38: [1, 28],
                            41: 26
                        }, {
                            18: [2, 39],
                            24: [2, 39],
                            32: [2, 39],
                            33: [2, 39],
                            34: [2, 39],
                            38: [2, 39],
                            40: [2, 39],
                            42: [2, 39]
                        }, {
                            18: [1, 46]
                        }, {
                            18: [1, 47]
                        }, {
                            24: [1, 48]
                        }, {
                            18: [2, 40],
                            21: 50,
                            27: 49,
                            38: [1, 28],
                            41: 26
                        }, {
                            18: [2, 33],
                            38: [2, 33]
                        }, {
                            18: [2, 34],
                            38: [2, 34]
                        }, {
                            18: [2, 35],
                            38: [2, 35]
                        }, {
                            5: [2, 11],
                            14: [2, 11],
                            15: [2, 11],
                            16: [2, 11],
                            19: [2, 11],
                            20: [2, 11],
                            22: [2, 11],
                            23: [2, 11],
                            25: [2, 11]
                        }, {
                            21: 51,
                            38: [1, 28],
                            41: 26
                        }, {
                            8: 17,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 11],
                            20: [2, 3],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            4: 52,
                            8: 4,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 11],
                            20: [2, 5],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            14: [2, 23],
                            15: [2, 23],
                            16: [2, 23],
                            19: [2, 23],
                            20: [2, 23],
                            22: [2, 23],
                            23: [2, 23],
                            25: [2, 23]
                        }, {
                            5: [2, 12],
                            14: [2, 12],
                            15: [2, 12],
                            16: [2, 12],
                            19: [2, 12],
                            20: [2, 12],
                            22: [2, 12],
                            23: [2, 12],
                            25: [2, 12]
                        }, {
                            14: [2, 18],
                            15: [2, 18],
                            16: [2, 18],
                            19: [2, 18],
                            20: [2, 18],
                            22: [2, 18],
                            23: [2, 18],
                            25: [2, 18]
                        }, {
                            18: [2, 44],
                            21: 56,
                            24: [2, 44],
                            29: 53,
                            30: 60,
                            31: 54,
                            32: [1, 57],
                            33: [1, 58],
                            34: [1, 59],
                            35: 55,
                            36: 61,
                            37: 62,
                            38: [1, 63],
                            40: [1, 27],
                            41: 26
                        }, {
                            38: [1, 64]
                        }, {
                            18: [2, 36],
                            24: [2, 36],
                            32: [2, 36],
                            33: [2, 36],
                            34: [2, 36],
                            38: [2, 36],
                            40: [2, 36]
                        }, {
                            14: [2, 17],
                            15: [2, 17],
                            16: [2, 17],
                            19: [2, 17],
                            20: [2, 17],
                            22: [2, 17],
                            23: [2, 17],
                            25: [2, 17]
                        }, {
                            5: [2, 20],
                            14: [2, 20],
                            15: [2, 20],
                            16: [2, 20],
                            19: [2, 20],
                            20: [2, 20],
                            22: [2, 20],
                            23: [2, 20],
                            25: [2, 20]
                        }, {
                            5: [2, 21],
                            14: [2, 21],
                            15: [2, 21],
                            16: [2, 21],
                            19: [2, 21],
                            20: [2, 21],
                            22: [2, 21],
                            23: [2, 21],
                            25: [2, 21]
                        }, {
                            18: [1, 65]
                        }, {
                            18: [2, 41]
                        }, {
                            18: [1, 66]
                        }, {
                            8: 17,
                            9: 5,
                            11: 6,
                            12: 7,
                            13: 8,
                            14: [1, 9],
                            15: [1, 10],
                            16: [1, 12],
                            19: [1, 11],
                            20: [2, 4],
                            22: [1, 13],
                            23: [1, 14],
                            25: [1, 15]
                        }, {
                            18: [2, 24],
                            24: [2, 24]
                        }, {
                            18: [2, 43],
                            24: [2, 43],
                            32: [2, 43],
                            33: [2, 43],
                            34: [2, 43],
                            38: [2, 43],
                            40: [2, 43]
                        }, {
                            18: [2, 45],
                            24: [2, 45]
                        }, {
                            18: [2, 26],
                            24: [2, 26],
                            32: [2, 26],
                            33: [2, 26],
                            34: [2, 26],
                            38: [2, 26],
                            40: [2, 26]
                        }, {
                            18: [2, 27],
                            24: [2, 27],
                            32: [2, 27],
                            33: [2, 27],
                            34: [2, 27],
                            38: [2, 27],
                            40: [2, 27]
                        }, {
                            18: [2, 28],
                            24: [2, 28],
                            32: [2, 28],
                            33: [2, 28],
                            34: [2, 28],
                            38: [2, 28],
                            40: [2, 28]
                        }, {
                            18: [2, 29],
                            24: [2, 29],
                            32: [2, 29],
                            33: [2, 29],
                            34: [2, 29],
                            38: [2, 29],
                            40: [2, 29]
                        }, {
                            18: [2, 30],
                            24: [2, 30],
                            32: [2, 30],
                            33: [2, 30],
                            34: [2, 30],
                            38: [2, 30],
                            40: [2, 30]
                        }, {
                            18: [2, 31],
                            24: [2, 31],
                            37: 67,
                            38: [1, 68]
                        }, {
                            18: [2, 46],
                            24: [2, 46],
                            38: [2, 46]
                        }, {
                            18: [2, 39],
                            24: [2, 39],
                            32: [2, 39],
                            33: [2, 39],
                            34: [2, 39],
                            38: [2, 39],
                            39: [1, 69],
                            40: [2, 39],
                            42: [2, 39]
                        }, {
                            18: [2, 38],
                            24: [2, 38],
                            32: [2, 38],
                            33: [2, 38],
                            34: [2, 38],
                            38: [2, 38],
                            40: [2, 38],
                            42: [2, 38]
                        }, {
                            5: [2, 22],
                            14: [2, 22],
                            15: [2, 22],
                            16: [2, 22],
                            19: [2, 22],
                            20: [2, 22],
                            22: [2, 22],
                            23: [2, 22],
                            25: [2, 22]
                        }, {
                            5: [2, 19],
                            14: [2, 19],
                            15: [2, 19],
                            16: [2, 19],
                            19: [2, 19],
                            20: [2, 19],
                            22: [2, 19],
                            23: [2, 19],
                            25: [2, 19]
                        }, {
                            18: [2, 47],
                            24: [2, 47],
                            38: [2, 47]
                        }, {
                            39: [1, 69]
                        }, {
                            21: 56,
                            30: 60,
                            31: 70,
                            32: [1, 57],
                            33: [1, 58],
                            34: [1, 59],
                            38: [1, 28],
                            40: [1, 27],
                            41: 26
                        }, {
                            18: [2, 32],
                            24: [2, 32],
                            38: [2, 32]
                        }],
                        defaultActions: {
                            3: [2, 2],
                            16: [2, 1],
                            50: [2, 41]
                        },
                        parseError: function(t, n) {
                            throw new Error(t)
                        },
                        parse: function(t) {
                            function v(e) {
                                r.length = r.length - 2 * e, i.length = i.length - e, s.length = s.length - e
                            }

                            function m() {
                                var e;
                                return e = n.lexer.lex() || 1, typeof e != "number" && (e = n.symbols_[e] || e), e
                            }
                            var n = this,
                                r = [0],
                                i = [null],
                                s = [],
                                o = this.table,
                                u = "",
                                a = 0,
                                f = 0,
                                l = 0,
                                c = 2,
                                h = 1;
                            this.lexer.setInput(t), this.lexer.yy = this.yy, this.yy.lexer = this.lexer, this.yy.parser = this, typeof this.lexer.yylloc == "undefined" && (this.lexer.yylloc = {});
                            var p = this.lexer.yylloc;
                            s.push(p);
                            var d = this.lexer.options && this.lexer.options.ranges;
                            typeof this.yy.parseError == "function" && (this.parseError = this.yy.parseError);
                            var g, y, b, w, E, S, x = {},
                                T, N, C, k;
                            for (;;) {
                                b = r[r.length - 1];
                                if (this.defaultActions[b]) w = this.defaultActions[b];
                                else {
                                    if (g === null || typeof g == "undefined") g = m();
                                    w = o[b] && o[b][g]
                                }
                                if (typeof w == "undefined" || !w.length || !w[0]) {
                                    var L = "";
                                    if (!l) {
                                        k = [];
                                        for (T in o[b]) this.terminals_[T] && T > 2 && k.push("'" + this.terminals_[T] + "'");
                                        this.lexer.showPosition ? L = "Parse error on line " + (a + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + k.join(", ") + ", got '" + (this.terminals_[g] || g) + "'" : L = "Parse error on line " + (a + 1) + ": Unexpected " + (g == 1 ? "end of input" : "'" + (this.terminals_[g] || g) + "'"), this.parseError(L, {
                                            text: this.lexer.match,
                                            token: this.terminals_[g] || g,
                                            line: this.lexer.yylineno,
                                            loc: p,
                                            expected: k
                                        })
                                    }
                                }
                                if (w[0] instanceof Array && w.length > 1) throw new Error("Parse Error: multiple actions possible at state: " + b + ", token: " + g);
                                switch (w[0]) {
                                    case 1:
                                        r.push(g), i.push(this.lexer.yytext), s.push(this.lexer.yylloc), r.push(w[1]), g = null, y ? (g = y, y = null) : (f = this.lexer.yyleng, u = this.lexer.yytext, a = this.lexer.yylineno, p = this.lexer.yylloc, l > 0 && l--);
                                        break;
                                    case 2:
                                        N = this.productions_[w[1]][1], x.$ = i[i.length - N], x._$ = {
                                            first_line: s[s.length - (N || 1)].first_line,
                                            last_line: s[s.length - 1].last_line,
                                            first_column: s[s.length - (N || 1)].first_column,
                                            last_column: s[s.length - 1].last_column
                                        }, d && (x._$.range = [s[s.length - (N || 1)].range[0], s[s.length - 1].range[1]]), S = this.performAction.call(x, u, f, a, this.yy, w[1], i, s);
                                        if (typeof S != "undefined") return S;
                                        N && (r = r.slice(0, -1 * N * 2), i = i.slice(0, -1 * N), s = s.slice(0, -1 * N)), r.push(this.productions_[w[1]][0]), i.push(x.$), s.push(x._$), C = o[r[r.length - 2]][r[r.length - 1]], r.push(C);
                                        break;
                                    case 3:
                                        return !0
                                }
                            }
                            return !0
                        }
                    },
                    n = function() {
                        var e = {
                            EOF: 1,
                            parseError: function(t, n) {
                                if (!this.yy.parser) throw new Error(t);
                                this.yy.parser.parseError(t, n)
                            },
                            setInput: function(e) {
                                return this._input = e, this._more = this._less = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = {
                                    first_line: 1,
                                    first_column: 0,
                                    last_line: 1,
                                    last_column: 0
                                }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this
                            },
                            input: function() {
                                var e = this._input[0];
                                this.yytext += e, this.yyleng++, this.offset++, this.match += e, this.matched += e;
                                var t = e.match(/(?:\r\n?|\n).*/g);
                                return t ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), e
                            },
                            unput: function(e) {
                                var t = e.length,
                                    n = e.split(/(?:\r\n?|\n)/g);
                                this._input = e + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - t - 1), this.offset -= t;
                                var r = this.match.split(/(?:\r\n?|\n)/g);
                                this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), n.length - 1 && (this.yylineno -= n.length - 1);
                                var i = this.yylloc.range;
                                return this.yylloc = {
                                    first_line: this.yylloc.first_line,
                                    last_line: this.yylineno + 1,
                                    first_column: this.yylloc.first_column,
                                    last_column: n ? (n.length === r.length ? this.yylloc.first_column : 0) + r[r.length - n.length].length - n[0].length : this.yylloc.first_column - t
                                }, this.options.ranges && (this.yylloc.range = [i[0], i[0] + this.yyleng - t]), this
                            },
                            more: function() {
                                return this._more = !0, this
                            },
                            less: function(e) {
                                this.unput(this.match.slice(e))
                            },
                            pastInput: function() {
                                var e = this.matched.substr(0, this.matched.length - this.match.length);
                                return (e.length > 20 ? "..." : "") + e.substr(-20).replace(/\n/g, "")
                            },
                            upcomingInput: function() {
                                var e = this.match;
                                return e.length < 20 && (e += this._input.substr(0, 20 - e.length)), (e.substr(0, 20) + (e.length > 20 ? "..." : "")).replace(/\n/g, "")
                            },
                            showPosition: function() {
                                var e = this.pastInput(),
                                    t = (new Array(e.length + 1)).join("-");
                                return e + this.upcomingInput() + "\n" + t + "^"
                            },
                            next: function() {
                                if (this.done) return this.EOF;
                                this._input || (this.done = !0);
                                var e, t, n, r, i, s;
                                this._more || (this.yytext = "", this.match = "");
                                var o = this._currentRules();
                                for (var u = 0; u < o.length; u++) {
                                    n = this._input.match(this.rules[o[u]]);
                                    if (n && (!t || n[0].length > t[0].length)) {
                                        t = n, r = u;
                                        if (!this.options.flex) break
                                    }
                                }
                                if (t) {
                                    s = t[0].match(/(?:\r\n?|\n).*/g), s && (this.yylineno += s.length), this.yylloc = {
                                        first_line: this.yylloc.last_line,
                                        last_line: this.yylineno + 1,
                                        first_column: this.yylloc.last_column,
                                        last_column: s ? s[s.length - 1].length - s[s.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + t[0].length
                                    }, this.yytext += t[0], this.match += t[0], this.matches = t, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._input = this._input.slice(t[0].length), this.matched += t[0], e = this.performAction.call(this, this.yy, this, o[r], this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1);
                                    if (e) return e;
                                    return
                                }
                                return this._input === "" ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                                    text: "",
                                    token: null,
                                    line: this.yylineno
                                })
                            },
                            lex: function() {
                                var t = this.next();
                                return typeof t != "undefined" ? t : this.lex()
                            },
                            begin: function(t) {
                                this.conditionStack.push(t)
                            },
                            popState: function() {
                                return this.conditionStack.pop()
                            },
                            _currentRules: function() {
                                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules
                            },
                            topState: function() {
                                return this.conditionStack[this.conditionStack.length - 2]
                            },
                            pushState: function(t) {
                                this.begin(t)
                            }
                        };
                        return e.options = {}, e.performAction = function(t, n, r, i) {
                            function s(e, t) {
                                return n.yytext = n.yytext.substr(e, n.yyleng - t)
                            }
                            var o = i;
                            switch (r) {
                                case 0:
                                    n.yytext.slice(-2) === "\\\\" ? (s(0, 1), this.begin("mu")) : n.yytext.slice(-1) === "\\" ? (s(0, 1), this.begin("emu")) : this.begin("mu");
                                    if (n.yytext) return 14;
                                    break;
                                case 1:
                                    return 14;
                                case 2:
                                    return n.yytext.slice(-1) !== "\\" && this.popState(), n.yytext.slice(-1) === "\\" && s(0, 1), 14;
                                case 3:
                                    return s(0, 4), this.popState(), 15;
                                case 4:
                                    return 25;
                                case 5:
                                    return 16;
                                case 6:
                                    return 20;
                                case 7:
                                    return 19;
                                case 8:
                                    return 19;
                                case 9:
                                    return 23;
                                case 10:
                                    return 22;
                                case 11:
                                    this.popState(), this.begin("com");
                                    break;
                                case 12:
                                    return s(3, 5), this.popState(), 15;
                                case 13:
                                    return 22;
                                case 14:
                                    return 39;
                                case 15:
                                    return 38;
                                case 16:
                                    return 38;
                                case 17:
                                    return 42;
                                case 18:
                                    break;
                                case 19:
                                    return this.popState(), 24;
                                case 20:
                                    return this.popState(), 18;
                                case 21:
                                    return n.yytext = s(1, 2).replace(/\\"/g, '"'), 32;
                                case 22:
                                    return n.yytext = s(1, 2).replace(/\\'/g, "'"), 32;
                                case 23:
                                    return 40;
                                case 24:
                                    return 34;
                                case 25:
                                    return 34;
                                case 26:
                                    return 33;
                                case 27:
                                    return 38;
                                case 28:
                                    return n.yytext = s(1, 2), 38;
                                case 29:
                                    return "INVALID";
                                case 30:
                                    return 5
                            }
                        }, e.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s])))/, /^(?:false(?=([~}\s])))/, /^(?:-?[0-9]+(?=([~}\s])))/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/], e.conditions = {
                            mu: {
                                rules: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                                inclusive: !1
                            },
                            emu: {
                                rules: [2],
                                inclusive: !1
                            },
                            com: {
                                rules: [3],
                                inclusive: !1
                            },
                            INITIAL: {
                                rules: [0, 1, 30],
                                inclusive: !0
                            }
                        }, e
                    }();
                return e.lexer = n, r.prototype = e, e.Parser = r, new r
            }();
            return e = t, e
        }(),
        a = function(e, t) {
            function s(e) {
                return e.constructor === i.ProgramNode ? e : (r.yy = i, r.parse(e))
            }
            var n = {},
                r = e,
                i = t;
            return n.parser = r, n.parse = s, n
        }(u, o),
        f = function(e) {
            function s(e) {
                this.value = e
            }

            function o() {}
            var t, n = e.COMPILER_REVISION,
                r = e.REVISION_CHANGES,
                i = e.log;
            o.prototype = {
                nameLookup: function(e, t) {
                    var n, r;
                    return e.indexOf("depth") === 0 && (n = !0), /^[0-9]+$/.test(t) ? r = e + "[" + t + "]" : o.isValidJavaScriptVariableName(t) ? r = e + "." + t : r = e + "['" + t + "']", n ? "(" + e + " && " + r + ")" : r
                },
                appendToBuffer: function(e) {
                    return this.environment.isSimple ? "return " + e + ";" : {
                        appendToBuffer: !0,
                        content: e,
                        toString: function() {
                            return "buffer += " + e + ";"
                        }
                    }
                },
                initializeBuffer: function() {
                    return this.quotedString("")
                },
                namespace: "Handlebars",
                compile: function(e, t, n, r) {
                    this.environment = e, this.options = t || {}, i("debug", this.environment.disassemble() + "\n\n"), this.name = this.environment.name, this.isChild = !!n, this.context = n || {
                        programs: [],
                        environments: [],
                        aliases: {}
                    }, this.preamble(), this.stackSlot = 0, this.stackVars = [], this.registers = {
                        list: []
                    }, this.compileStack = [], this.inlineStack = [], this.compileChildren(e, t);
                    var s = e.opcodes,
                        o;
                    this.i = 0;
                    for (var u = s.length; this.i < u; this.i++) o = s[this.i], o.opcode === "DECLARE" ? this[o.name] = o.value : this[o.opcode].apply(this, o.args), o.opcode !== this.stripNext && (this.stripNext = !1);
                    return this.pushSource(""), this.createFunctionContext(r)
                },
                preamble: function() {
                    var e = [];
                    if (!this.isChild) {
                        var t = this.namespace,
                            n = "helpers = this.merge(helpers, " + t + ".helpers);";
                        this.environment.usePartial && (n = n + " partials = this.merge(partials, " + t + ".partials);"), this.options.data && (n += " data = data || {};"), e.push(n)
                    } else e.push("");
                    this.environment.isSimple ? e.push("") : e.push(", buffer = " + this.initializeBuffer()), this.lastContext = 0, this.source = e
                },
                createFunctionContext: function(e) {
                    var t = this.stackVars.concat(this.registers.list);
                    t.length > 0 && (this.source[1] = this.source[1] + ", " + t.join(", "));
                    if (!this.isChild)
                        for (var s in this.context.aliases) this.context.aliases.hasOwnProperty(s) && (this.source[1] = this.source[1] + ", " + s + "=" + this.context.aliases[s]);
                    this.source[1] && (this.source[1] = "var " + this.source[1].substring(2) + ";"), this.isChild || (this.source[1] += "\n" + this.context.programs.join("\n") + "\n"), this.environment.isSimple || this.pushSource("return buffer;");
                    var o = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];
                    for (var u = 0, a = this.environment.depths.list.length; u < a; u++) o.push("depth" + this.environment.depths.list[u]);
                    var f = this.mergeSource();
                    if (!this.isChild) {
                        var l = n,
                            c = r[l];
                        f = "this.compilerInfo = [" + l + ",'" + c + "'];\n" + f
                    }
                    if (e) return o.push(f), Function.apply(this, o);
                    var h = "function " + (this.name || "") + "(" + o.join(",") + ") {\n  " + f + "}";
                    return i("debug", h + "\n\n"), h
                },
                mergeSource: function() {
                    var e = "",
                        t;
                    for (var n = 0, r = this.source.length; n < r; n++) {
                        var i = this.source[n];
                        i.appendToBuffer ? t ? t = t + "\n    + " + i.content : t = i.content : (t && (e += "buffer += " + t + ";\n  ", t = undefined), e += i + "\n  ")
                    }
                    return e
                },
                blockValue: function() {
                    this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                    var e = ["depth0"];
                    this.setupParams(0, e), this.replaceStack(function(t) {
                        return e.splice(1, 0, t), "blockHelperMissing.call(" + e.join(", ") + ")"
                    })
                },
                ambiguousBlockValue: function() {
                    this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                    var e = ["depth0"];
                    this.setupParams(0, e);
                    var t = this.topStack();
                    e.splice(1, 0, t), e[e.length - 1] = "options", this.pushSource("if (!" + this.lastHelper + ") { " + t + " = blockHelperMissing.call(" + e.join(", ") + "); }")
                },
                appendContent: function(e) {
                    this.pendingContent && (e = this.pendingContent + e), this.stripNext && (e = e.replace(/^\s+/, "")), this.pendingContent = e
                },
                strip: function() {
                    this.pendingContent && (this.pendingContent = this.pendingContent.replace(/\s+$/, "")), this.stripNext = "strip"
                },
                append: function() {
                    this.flushInline();
                    var e = this.popStack();
                    this.pushSource("if(" + e + " || " + e + " === 0) { " + this.appendToBuffer(e) + " }"), this.environment.isSimple && this.pushSource("else { " + this.appendToBuffer("''") + " }")
                },
                appendEscaped: function() {
                    this.context.aliases.escapeExpression = "this.escapeExpression", this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"))
                },
                getContext: function(e) {
                    this.lastContext !== e && (this.lastContext = e)
                },
                lookupOnContext: function(e) {
                    this.push(this.nameLookup("depth" + this.lastContext, e, "context"))
                },
                pushContext: function() {
                    this.pushStackLiteral("depth" + this.lastContext)
                },
                resolvePossibleLambda: function() {
                    this.context.aliases.functionType = '"function"', this.replaceStack(function(e) {
                        return "typeof " + e + " === functionType ? " + e + ".apply(depth0) : " + e
                    })
                },
                lookup: function(e) {
                    this.replaceStack(function(t) {
                        return t + " == null || " + t + " === false ? " + t + " : " + this.nameLookup(t, e, "context")
                    })
                },
                lookupData: function() {
                    this.push("data")
                },
                pushStringParam: function(e, t) {
                    this.pushStackLiteral("depth" + this.lastContext), this.pushString(t), typeof e == "string" ? this.pushString(e) : this.pushStackLiteral(e)
                },
                emptyHash: function() {
                    this.pushStackLiteral("{}"), this.options.stringParams && (this.register("hashTypes", "{}"), this.register("hashContexts", "{}"))
                },
                pushHash: function() {
                    this.hash = {
                        values: [],
                        types: [],
                        contexts: []
                    }
                },
                popHash: function() {
                    var e = this.hash;
                    this.hash = undefined, this.options.stringParams && (this.register("hashContexts", "{" + e.contexts.join(",") + "}"), this.register("hashTypes", "{" + e.types.join(",") + "}")), this.push("{\n    " + e.values.join(",\n    ") + "\n  }")
                },
                pushString: function(e) {
                    this.pushStackLiteral(this.quotedString(e))
                },
                push: function(e) {
                    return this.inlineStack.push(e), e
                },
                pushLiteral: function(e) {
                    this.pushStackLiteral(e)
                },
                pushProgram: function(e) {
                    e != null ? this.pushStackLiteral(this.programExpression(e)) : this.pushStackLiteral(null)
                },
                invokeHelper: function(e, t) {
                    this.context.aliases.helperMissing = "helpers.helperMissing";
                    var n = this.lastHelper = this.setupHelper(e, t, !0),
                        r = this.nameLookup("depth" + this.lastContext, t, "context");
                    this.push(n.name + " || " + r), this.replaceStack(function(e) {
                        return e + " ? " + e + ".call(" + n.callParams + ") " + ": helperMissing.call(" + n.helperMissingParams + ")"
                    })
                },
                invokeKnownHelper: function(e, t) {
                    var n = this.setupHelper(e, t);
                    this.push(n.name + ".call(" + n.callParams + ")")
                },
                invokeAmbiguous: function(e, t) {
                    this.context.aliases.functionType = '"function"', this.pushStackLiteral("{}");
                    var n = this.setupHelper(0, e, t),
                        r = this.lastHelper = this.nameLookup("helpers", e, "helper"),
                        i = this.nameLookup("depth" + this.lastContext, e, "context"),
                        s = this.nextStack();
                    this.pushSource("if (" + s + " = " + r + ") { " + s + " = " + s + ".call(" + n.callParams + "); }"), this.pushSource("else { " + s + " = " + i + "; " + s + " = typeof " + s + " === functionType ? " + s + ".call(" + n.callParams + ") : " + s + "; }")
                },
                invokePartial: function(e) {
                    var t = [this.nameLookup("partials", e, "partial"), "'" + e + "'", this.popStack(), "helpers", "partials"];
                    this.options.data && t.push("data"), this.context.aliases.self = "this", this.push("self.invokePartial(" + t.join(", ") + ")")
                },
                assignToHash: function(e) {
                    var t = this.popStack(),
                        n, r;
                    this.options.stringParams && (r = this.popStack(), n = this.popStack());
                    var i = this.hash;
                    n && i.contexts.push("'" + e + "': " + n), r && i.types.push("'" + e + "': " + r), i.values.push("'" + e + "': (" + t + ")")
                },
                compiler: o,
                compileChildren: function(e, t) {
                    var n = e.children,
                        r, i;
                    for (var s = 0, o = n.length; s < o; s++) {
                        r = n[s], i = new this.compiler;
                        var u = this.matchExistingProgram(r);
                        u == null ? (this.context.programs.push(""), u = this.context.programs.length, r.index = u, r.name = "program" + u, this.context.programs[u] = i.compile(r, t, this.context), this.context.environments[u] = r) : (r.index = u, r.name = "program" + u)
                    }
                },
                matchExistingProgram: function(e) {
                    for (var t = 0, n = this.context.environments.length; t < n; t++) {
                        var r = this.context.environments[t];
                        if (r && r.equals(e)) return t
                    }
                },
                programExpression: function(e) {
                    this.context.aliases.self = "this";
                    if (e == null) return "self.noop";
                    var t = this.environment.children[e],
                        n = t.depths.list,
                        r, i = [t.index, t.name, "data"];
                    for (var s = 0, o = n.length; s < o; s++) r = n[s], r === 1 ? i.push("depth0") : i.push("depth" + (r - 1));
                    return (n.length === 0 ? "self.program(" : "self.programWithDepth(") + i.join(", ") + ")"
                },
                register: function(e, t) {
                    this.useRegister(e), this.pushSource(e + " = " + t + ";")
                },
                useRegister: function(e) {
                    this.registers[e] || (this.registers[e] = !0, this.registers.list.push(e))
                },
                pushStackLiteral: function(e) {
                    return this.push(new s(e))
                },
                pushSource: function(e) {
                    this.pendingContent && (this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))), this.pendingContent = undefined), e && this.source.push(e)
                },
                pushStack: function(e) {
                    this.flushInline();
                    var t = this.incrStack();
                    return e && this.pushSource(t + " = " + e + ";"), this.compileStack.push(t), t
                },
                replaceStack: function(e) {
                    var t = "",
                        n = this.isInline(),
                        r;
                    if (n) {
                        var i = this.popStack(!0);
                        if (i instanceof s) r = i.value;
                        else {
                            var o = this.stackSlot ? this.topStackName() : this.incrStack();
                            t = "(" + this.push(o) + " = " + i + "),", r = this.topStack()
                        }
                    } else r = this.topStack();
                    var u = e.call(this, r);
                    return n ? ((this.inlineStack.length || this.compileStack.length) && this.popStack(), this.push("(" + t + u + ")")) : (/^stack/.test(r) || (r = this.nextStack()), this.pushSource(r + " = (" + t + u + ");")), r
                },
                nextStack: function() {
                    return this.pushStack()
                },
                incrStack: function() {
                    return this.stackSlot++, this.stackSlot > this.stackVars.length && this.stackVars.push("stack" + this.stackSlot), this.topStackName()
                },
                topStackName: function() {
                    return "stack" + this.stackSlot
                },
                flushInline: function() {
                    var e = this.inlineStack;
                    if (e.length) {
                        this.inlineStack = [];
                        for (var t = 0, n = e.length; t < n; t++) {
                            var r = e[t];
                            r instanceof s ? this.compileStack.push(r) : this.pushStack(r)
                        }
                    }
                },
                isInline: function() {
                    return this.inlineStack.length
                },
                popStack: function(e) {
                    var t = this.isInline(),
                        n = (t ? this.inlineStack : this.compileStack).pop();
                    return !e && n instanceof s ? n.value : (t || this.stackSlot--, n)
                },
                topStack: function(e) {
                    var t = this.isInline() ? this.inlineStack : this.compileStack,
                        n = t[t.length - 1];
                    return !e && n instanceof s ? n.value : n
                },
                quotedString: function(e) {
                    return '"' + e.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"'
                },
                setupHelper: function(e, t, n) {
                    var r = [];
                    this.setupParams(e, r, n);
                    var i = this.nameLookup("helpers", t, "helper");
                    return {
                        params: r,
                        name: i,
                        callParams: ["depth0"].concat(r).join(", "),
                        helperMissingParams: n && ["depth0", this.quotedString(t)].concat(r).join(", ")
                    }
                },
                setupParams: function(e, t, n) {
                    var r = [],
                        i = [],
                        s = [],
                        o, u, a;
                    r.push("hash:" + this.popStack()), u = this.popStack(), a = this.popStack();
                    if (a || u) a || (this.context.aliases.self = "this", a = "self.noop"), u || (this.context.aliases.self = "this", u = "self.noop"), r.push("inverse:" + u), r.push("fn:" + a);
                    for (var f = 0; f < e; f++) o = this.popStack(), t.push(o), this.options.stringParams && (s.push(this.popStack()), i.push(this.popStack()));
                    return this.options.stringParams && (r.push("contexts:[" + i.join(",") + "]"), r.push("types:[" + s.join(",") + "]"), r.push("hashContexts:hashContexts"), r.push("hashTypes:hashTypes")), this.options.data && r.push("data:data"), r = "{" + r.join(",") + "}", n ? (this.register("options", r), t.push("options")) : t.push(r), t.join(", ")
                }
            };
            var u = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),
                a = o.RESERVED_WORDS = {};
            for (var f = 0, l = u.length; f < l; f++) a[u[f]] = !0;
            return o.isValidJavaScriptVariableName = function(e) {
                return !o.RESERVED_WORDS[e] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(e) ? !0 : !1
            }, t = o, t
        }(r),
        l = function(e, t, n, r) {
            function f() {}

            function l(e, t) {
                if (e == null || typeof e != "string" && e.constructor !== a.ProgramNode) throw new s("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + e);
                t = t || {}, "data" in t || (t.data = !0);
                var n = o(e),
                    r = (new f).compile(n, t);
                return (new u).compile(r, t)
            }

            function c(e, t, n) {
                function i() {
                    var r = o(e),
                        i = (new f).compile(r, t),
                        s = (new u).compile(i, t, undefined, !0);
                    return n.template(s)
                }
                if (e == null || typeof e != "string" && e.constructor !== a.ProgramNode) throw new s("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + e);
                t = t || {}, "data" in t || (t.data = !0);
                var r;
                return function(e, t) {
                    return r || (r = i()), r.call(this, e, t)
                }
            }
            var i = {},
                s = e,
                o = t.parse,
                u = n,
                a = r;
            return i.Compiler = f, f.prototype = {
                compiler: f,
                disassemble: function() {
                    var e = this.opcodes,
                        t, n = [],
                        r, i;
                    for (var s = 0, o = e.length; s < o; s++) {
                        t = e[s];
                        if (t.opcode === "DECLARE") n.push("DECLARE " + t.name + "=" + t.value);
                        else {
                            r = [];
                            for (var u = 0; u < t.args.length; u++) i = t.args[u], typeof i == "string" && (i = '"' + i.replace("\n", "\\n") + '"'), r.push(i);
                            n.push(t.opcode + " " + r.join(" "))
                        }
                    }
                    return n.join("\n")
                },
                equals: function(e) {
                    var t = this.opcodes.length;
                    if (e.opcodes.length !== t) return !1;
                    for (var n = 0; n < t; n++) {
                        var r = this.opcodes[n],
                            i = e.opcodes[n];
                        if (r.opcode !== i.opcode || r.args.length !== i.args.length) return !1;
                        for (var s = 0; s < r.args.length; s++)
                            if (r.args[s] !== i.args[s]) return !1
                    }
                    t = this.children.length;
                    if (e.children.length !== t) return !1;
                    for (n = 0; n < t; n++)
                        if (!this.children[n].equals(e.children[n])) return !1;
                    return !0
                },
                guid: 0,
                compile: function(e, t) {
                    this.opcodes = [], this.children = [], this.depths = {
                        list: []
                    }, this.options = t;
                    var n = this.options.knownHelpers;
                    this.options.knownHelpers = {
                        helperMissing: !0,
                        blockHelperMissing: !0,
                        each: !0,
                        "if": !0,
                        unless: !0,
                        "with": !0,
                        log: !0
                    };
                    if (n)
                        for (var r in n) this.options.knownHelpers[r] = n[r];
                    return this.accept(e)
                },
                accept: function(e) {
                    var t = e.strip || {},
                        n;
                    return t.left && this.opcode("strip"), n = this[e.type](e), t.right && this.opcode("strip"), n
                },
                program: function(e) {
                    var t = e.statements;
                    for (var n = 0, r = t.length; n < r; n++) this.accept(t[n]);
                    return this.isSimple = r === 1, this.depths.list = this.depths.list.sort(function(e, t) {
                        return e - t
                    }), this
                },
                compileProgram: function(e) {
                    var t = (new this.compiler).compile(e, this.options),
                        n = this.guid++,
                        r;
                    this.usePartial = this.usePartial || t.usePartial, this.children[n] = t;
                    for (var i = 0, s = t.depths.list.length; i < s; i++) {
                        r = t.depths.list[i];
                        if (r < 2) continue;
                        this.addDepth(r - 1)
                    }
                    return n
                },
                block: function(e) {
                    var t = e.mustache,
                        n = e.program,
                        r = e.inverse;
                    n && (n = this.compileProgram(n)), r && (r = this.compileProgram(r));
                    var i = this.classifyMustache(t);
                    i === "helper" ? this.helperMustache(t, n, r) : i === "simple" ? (this.simpleMustache(t), this.opcode("pushProgram", n), this.opcode("pushProgram", r), this.opcode("emptyHash"), this.opcode("blockValue")) : (this.ambiguousMustache(t, n, r), this.opcode("pushProgram", n), this.opcode("pushProgram", r), this.opcode("emptyHash"), this.opcode("ambiguousBlockValue")), this.opcode("append")
                },
                hash: function(e) {
                    var t = e.pairs,
                        n, r;
                    this.opcode("pushHash");
                    for (var i = 0, s = t.length; i < s; i++) n = t[i], r = n[1], this.options.stringParams ? (r.depth && this.addDepth(r.depth), this.opcode("getContext", r.depth || 0), this.opcode("pushStringParam", r.stringModeValue, r.type)) : this.accept(r), this.opcode("assignToHash", n[0]);
                    this.opcode("popHash")
                },
                partial: function(e) {
                    var t = e.partialName;
                    this.usePartial = !0, e.context ? this.ID(e.context) : this.opcode("push", "depth0"), this.opcode("invokePartial", t.name), this.opcode("append")
                },
                content: function(e) {
                    this.opcode("appendContent", e.string)
                },
                mustache: function(e) {
                    var t = this.options,
                        n = this.classifyMustache(e);
                    n === "simple" ? this.simpleMustache(e) : n === "helper" ? this.helperMustache(e) : this.ambiguousMustache(e), e.escaped && !t.noEscape ? this.opcode("appendEscaped") : this.opcode("append")
                },
                ambiguousMustache: function(e, t, n) {
                    var r = e.id,
                        i = r.parts[0],
                        s = t != null || n != null;
                    this.opcode("getContext", r.depth), this.opcode("pushProgram", t), this.opcode("pushProgram", n), this.opcode("invokeAmbiguous", i, s)
                },
                simpleMustache: function(e) {
                    var t = e.id;
                    t.type === "DATA" ? this.DATA(t) : t.parts.length ? this.ID(t) : (this.addDepth(t.depth), this.opcode("getContext", t.depth), this.opcode("pushContext")), this.opcode("resolvePossibleLambda")
                },
                helperMustache: function(e, t, n) {
                    var r = this.setupFullMustacheParams(e, t, n),
                        i = e.id.parts[0];
                    if (this.options.knownHelpers[i]) this.opcode("invokeKnownHelper", r.length, i);
                    else {
                        if (this.options.knownHelpersOnly) throw new Error("You specified knownHelpersOnly, but used the unknown helper " + i);
                        this.opcode("invokeHelper", r.length, i)
                    }
                },
                ID: function(e) {
                    this.addDepth(e.depth), this.opcode("getContext", e.depth);
                    var t = e.parts[0];
                    t ? this.opcode("lookupOnContext", e.parts[0]) : this.opcode("pushContext");
                    for (var n = 1, r = e.parts.length; n < r; n++) this.opcode("lookup", e.parts[n])
                },
                DATA: function(e) {
                    this.options.data = !0;
                    if (e.id.isScoped || e.id.depth) throw new s("Scoped data references are not supported: " + e.original);
                    this.opcode("lookupData");
                    var t = e.id.parts;
                    for (var n = 0, r = t.length; n < r; n++) this.opcode("lookup", t[n])
                },
                STRING: function(e) {
                    this.opcode("pushString", e.string)
                },
                INTEGER: function(e) {
                    this.opcode("pushLiteral", e.integer)
                },
                BOOLEAN: function(e) {
                    this.opcode("pushLiteral", e.bool)
                },
                comment: function() {},
                opcode: function(e) {
                    this.opcodes.push({
                        opcode: e,
                        args: [].slice.call(arguments, 1)
                    })
                },
                declare: function(e, t) {
                    this.opcodes.push({
                        opcode: "DECLARE",
                        name: e,
                        value: t
                    })
                },
                addDepth: function(e) {
                    if (isNaN(e)) throw new Error("EWOT");
                    if (e === 0) return;
                    this.depths[e] || (this.depths[e] = !0, this.depths.list.push(e))
                },
                classifyMustache: function(e) {
                    var t = e.isHelper,
                        n = e.eligibleHelper,
                        r = this.options;
                    if (n && !t) {
                        var i = e.id.parts[0];
                        r.knownHelpers[i] ? t = !0 : r.knownHelpersOnly && (n = !1)
                    }
                    return t ? "helper" : n ? "ambiguous" : "simple"
                },
                pushParams: function(e) {
                    var t = e.length,
                        n;
                    while (t--) n = e[t], this.options.stringParams ? (n.depth && this.addDepth(n.depth), this.opcode("getContext", n.depth || 0), this.opcode("pushStringParam", n.stringModeValue, n.type)) : this[n.type](n)
                },
                setupMustacheParams: function(e) {
                    var t = e.params;
                    return this.pushParams(t), e.hash ? this.hash(e.hash) : this.opcode("emptyHash"), t
                },
                setupFullMustacheParams: function(e, t, n) {
                    var r = e.params;
                    return this.pushParams(r), this.opcode("pushProgram", t), this.opcode("pushProgram", n), e.hash ? this.hash(e.hash) : this.opcode("emptyHash"), r
                }
            }, i.precompile = l, i.compile = c, i
        }(n, a, f, o),
        c = function(e, t, n, r, i) {
            var s, o = e,
                u = t,
                a = n.parser,
                f = n.parse,
                l = r.Compiler,
                c = r.compile,
                h = r.precompile,
                p = i,
                d = o.create,
                v = function() {
                    var e = d();
                    return e.compile = function(t, n) {
                        return c(t, n, e)
                    }, e.precompile = h, e.AST = u, e.Compiler = l, e.JavaScriptCompiler = p, e.Parser = a, e.parse = f, e
                };
            return o = v(), o.create = v, s = o, s
        }(s, o, a, l, f);
    return c
}();
define("handlebars", function(e) {
    return function() {
        var t, n;
        return t || e.Handlebars
    }
}(this)), define("templates", ["handlebars"], function(e) {
    return this.JST = this.JST || {}, this.JST.comicbed = e.template(function(e, t, n, r, i) {
        return this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {}, '<div id="header"\n     data-role="header"\n     data-position="fixed"\n     data-tap-toggle="false"\n     data-fullscreen="true"\n     tabindex="1"></div>\n<div data-role="content" id="content" tabindex="2"></div>\n<div id="footer"\n     data-role="footer"\n     data-position="fixed"\n     data-tap-toggle="false"\n     data-fullscreen="true"\n     tabindex="3"></div>\n<div id="error-dialog-holder"></div>\n<div id="help-dialog-holder"></div>\n<div id="progress-dialog-holder"></div>\n<div id="setting-dialog-holder"></div>\n'
    }), this.JST.dialog = e.template(function(e, t, n, r, i) {
        this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {};
        var s = "",
            o, u = "function",
            a = this.escapeExpression;
        return s += '<div id="', (o = n.id) ? o = o.call(t, {
            hash: {},
            data: i
        }) : (o = t.id, o = typeof o === u ? o.apply(t) : o), s += a(o) + '" data-role="popup" data-dismissible="false">\n</div>\n', s
    }), this.JST.error = e.template(function(e, t, n, r, i) {
        this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {};
        var s = "",
            o, u = "function",
            a = this.escapeExpression;
        return s += '<div data-role="header" class="ui-corner-top">\n  <h1>Error</h1>\n</div>\n<div data-role="content" class="ui-corner-bottom ui-content">\n  <p>', (o = n.message) ? o = o.call(t, {
            hash: {},
            data: i
        }) : (o = t.message, o = typeof o === u ? o.apply(t) : o), s += a(o) + '</p>\n  <a href="#" data-role="button" data-inline="true" data-rel="back">OK</a>\n</div>\n', s
    }), this.JST.footer = e.template(function(e, t, n, r, i) {
        function l(e, t) {
            var r = "",
                i;
            r += '\n<label id="page-slider-label" for="page-slider">', (i = n.currentPageNum) ? i = i.call(e, {
                hash: {},
                data: t
            }) : (i = e.currentPageNum, i = typeof i === u ? i.apply(e) : i), r += a(i) + "/", (i = n.totalPageNum) ? i = i.call(e, {
                hash: {},
                data: t
            }) : (i = e.totalPageNum, i = typeof i === u ? i.apply(e) : i), r += a(i) + '</label>\n<input class="', i = n["if"].call(e, e.reverse, {
                hash: {},
                inverse: f.noop,
                fn: f.program(2, c, t),
                data: t
            });
            if (i || i === 0) r += i;
            return r += '"\n       type="range"\n       name="slider"\n       id="page-slider"\n       value="', (i = n.alignedCurrentPageNum) ? i = i.call(e, {
                hash: {},
                data: t
            }) : (i = e.alignedCurrentPageNum, i = typeof i === u ? i.apply(e) : i), r += a(i) + '"\n       min="1"\n       max="', (i = n.totalPageNum) ? i = i.call(e, {
                hash: {},
                data: t
            }) : (i = e.totalPageNum, i = typeof i === u ? i.apply(e) : i), r += a(i) + '"\n       data-highlight="true" />\n', r
        }

        function c(e, t) {
            return "reverse-range"
        }
        this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {};
        var s = "",
            o, u = "function",
            a = this.escapeExpression,
            f = this;
        o = n["if"].call(t, t.opened, {
            hash: {},
            inverse: f.noop,
            fn: f.program(1, l, i),
            data: i
        });
        if (o || o === 0) s += o;
        return s += '\n<div style="height: 0px;width:0px; overflow:hidden;">\n  <input id="file-input" type="file" value="upload"/>\n</div>\n<div data-role="navbar">\n  <ul>\n    <li><button id="file-button"\n                data-role="button"\n                data-icon="file"\n                data-iconpos="bottom">File</button></li>\n    <li><button id="setting-button"\n                data-role="button"\n                data-icon="gear"\n                data-iconpos="bottom">Config</button></li>\n  </ul>\n</div>\n\n', s
    }), this.JST.header = e.template(function(e, t, n, r, i) {
        function l(e, t) {
            return "ui-disabled"
        }
        this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {};
        var s = "",
            o, u = "function",
            a = this.escapeExpression,
            f = this;
        s += '<h1 class="ui-title" role="heading" area-level="1">', (o = n.title) ? o = o.call(t, {
            hash: {},
            data: i
        }) : (o = t.title, o = typeof o === u ? o.apply(t) : o), s += a(o) + '</h1>\n<button id="help-button"\n        data-icon="question"\n        data-iconpos="notext"\n        class="ui-btn-left">Info</button>\n<button id="close-button"\n        data-icon="delete"\n        data-iconpos="notext"\n        class="ui-btn-right ', o = n.unless.call(t, t.opened, {
            hash: {},
            inverse: f.noop,
            fn: f.program(1, l, i),
            data: i
        });
        if (o || o === 0) s += o;
        return s += '">Close</button>\n', s
    }), this.JST.help = e.template(function(e, t, n, r, i) {
        return this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {}, '<div data-role="header" class="ui-corner-top">\n  <h1>Help</h1>\n</div>\n<div data-role="content" class="ui-corner-bottom ui-content">\n  <h3>Mouse Operations</h3>\n  <dl>\n    <dt>left/right click</dt><dd>move page</dd>\n  </dl>\n  <h3>Keyboard Shortcuts</h3>\n  <dl>\n    <dt>left/right-arrow key</dt><dd>move page</dd>\n    <dt>space</dt><dd>toggle view mode between one-page and two-pages</dd>\n    <dt>enter</dt><dd>toggle fullscreen</dd>\n  </dl>\n  <a href="#" data-role="button" data-inline="true" data-rel="back">OK</a>\n</div>\n'
    }), this.JST.progress = e.template(function(e, t, n, r, i) {
        this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {};
        var s = "",
            o, u = "function",
            a = this.escapeExpression;
        return s += '<div data-role="header" class="ui-corner-top">\n  <h1>Progress</h1>\n</div>\n<div data-role="content" class="ui-corner-bottom ui-content">\n  <p id="progress-dialog-message">', (o = n.message) ? o = o.call(t, {
            hash: {},
            data: i
        }) : (o = t.message, o = typeof o === u ? o.apply(t) : o), s += a(o) + '</p>\n\n  <div class="progress">\n    <div class="progress-bar progress-striped"\n         aria-valuetransitiongoal="', (o = n.progress) ? o = o.call(t, {
            hash: {},
            data: i
        }) : (o = t.progress, o = typeof o === u ? o.apply(t) : o), s += a(o) + '"\n         aria-valuemin="0" aria-valuemax="100">\n    </div>\n  </div>\n\n  <a href="#"\n     id="progress-dialog-cancel"\n     data-role="button"\n     data-inline="true"\n     data-rel="back">Cancel</a>\n</div>\n', s
    }), this.JST.screen = e.template(function(e, t, n, r, i) {
        function a(e, t) {
            var r = "",
                i;
            r += '\n<div class="input">\n  ', i = n["if"].call(e, e.isMobile, {
                hash: {},
                inverse: u.program(4, l, t),
                fn: u.program(2, f, t),
                data: t
            });
            if (i || i === 0) r += i;
            return r += "\n</div>\n", r
        }

        function f(e, t) {
            return '\n  <div id="mobile-touch-area">\n    <div id="mobile-touch-move-left"></div>\n    <div id="mobile-touch-toggle-menu"></div>\n    <div id="mobile-touch-move-right"></div>\n  </div>\n  '
        }

        function l(e, t) {
            return '\n  <div id="menu-remove-area"></div>\n  '
        }
        this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {};
        var s = "",
            o, u = this;
        s += '<div class="screen"></div>\n', o = n["if"].call(t, t.isCenter, {
            hash: {},
            inverse: u.noop,
            fn: u.program(1, a, i),
            data: i
        });
        if (o || o === 0) s += o;
        return s += "\n", s
    }), this.JST.screens = e.template(function(e, t, n, r, i) {
        return this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {}, '<div id="screen-scroller"><ul></ul></div>\n'
    }), this.JST.setting = e.template(function(e, t, n, r, i) {
        function a(e, t) {
            return 'checked="checked"'
        }

        function f(e, t) {
            var r = "",
                i;
            r += '\n    <input name="fullscreen-choice"\n           id="fullscreen-checkbox"\n           ', i = n["if"].call(e, e.fullscreenIsActive, {
                hash: {},
                inverse: u.noop,
                fn: u.program(1, a, t),
                data: t
            });
            if (i || i === 0) r += i;
            return r += '\n           type="checkbox">\n    <label id="fullscreen-checkbox-label"\n           for="fullscreen-checkbox">Fullscreen</label>\n    ', r
        }
        this.compilerInfo = [4, ">= 1.0.0"], n = this.merge(n, e.helpers), i = i || {};
        var s = "",
            o, u = this;
        s += '<div data-role="header" class="ui-corner-top">\n  <h1>Config</h1>\n</div>\n<div data-role="content" class="ui-corner-bottom ui-content">\n  <form>\n    <fieldset data-role="controlgroup" data-type="horizontal">\n      <legend>View mode</legend>\n      <input name="view-mode-radio-choice"\n             id="view-mode-radio-choice-one"\n             value="OnePage"\n             ', o = n["if"].call(t, t.OnePage, {
            hash: {},
            inverse: u.noop,
            fn: u.program(1, a, i),
            data: i
        });
        if (o || o === 0) s += o;
        s += '\n             type="radio">\n      <label id="view-mode-radio-choice-one-label"\n             for="view-mode-radio-choice-one">one page</label>\n      <input name="view-mode-radio-choice"\n             id="view-mode-radio-choice-two"\n             value="TwoPage"\n             ', o = n["if"].call(t, t.TwoPage, {
            hash: {},
            inverse: u.noop,
            fn: u.program(1, a, i),
            data: i
        });
        if (o || o === 0) s += o;
        s += '\n             type="radio">\n      <label id="view-mode-radio-choice-two-label"\n             for="view-mode-radio-choice-two">two pages</label>\n    </fieldset>\n    <fieldset data-role="controlgroup" data-type="horizontal">\n      <legend>Page direction</legend>\n      <input name="page-direction-radio-choice"\n             id="page-direction-radio-choice-L2R"\n             value="L2R"\n             ', o = n["if"].call(t, t.L2R, {
            hash: {},
            inverse: u.noop,
            fn: u.program(1, a, i),
            data: i
        });
        if (o || o === 0) s += o;
        s += '\n             type="radio">\n      <label id="page-direction-radio-choice-L2R-label"\n             for="page-direction-radio-choice-L2R">left to right</label>\n      <input name="page-direction-radio-choice"\n             id="page-direction-radio-choice-R2L"\n             value="R2L"\n             ', o = n["if"].call(t, t.R2L, {
            hash: {},
            inverse: u.noop,
            fn: u.program(1, a, i),
            data: i
        });
        if (o || o === 0) s += o;
        s += '\n             type="radio">\n      <label id="page-direction-radio-choice-R2L-label"\n             for="page-direction-radio-choice-R2L">right to left</label>\n    </fieldset>\n    <input name="range-request-choice"\n           id="range-request-checkbox"\n           ', o = n["if"].call(t, t.enablesRangeRequestInPdf, {
            hash: {},
            inverse: u.noop,
            fn: u.program(1, a, i),
            data: i
        });
        if (o || o === 0) s += o;
        s += '\n           type="checkbox">\n    <label id="range-request-checkbox-label"\n           for="range-request-checkbox">Range-Request when reading PDF files</label>\n    ', o = n["if"].call(t, t.fullscreenIsSupported, {
            hash: {},
            inverse: u.noop,
            fn: u.program(3, f, i),
            data: i
        });
        if (o || o === 0) s += o;
        return s += '\n\n  </form>\n</div>\n<div data-role="footer" class="ui-bar">\n  <div align="right">\n    <a href="#"\n       data-role="button"\n       data-icon="delete"\n       data-inline="true"\n       data-rel="back"\n       style="font-size:16px;">\n      Close\n    </a>\n  </div>\n</div>\n', s
    }), this.JST
}), define("utils/querystring", ["require", "exports"], function(e, t) {
    var n;
    return function(e) {
        function t(e) {
            var t = /\+/g,
                n = /([^&=]+)=?([^&]*)/g,
                r = function(e) {
                    return decodeURIComponent(e.replace(t, " "))
                },
                i = {},
                s;
            while (s = n.exec(e)) i[r(s[1])] = r(s[2]);
            return i
        }
        e.parse = t
    }(n || (n = {})), n
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/base", ["require", "exports", "backbone"], function(e, t, n) {
        var r = n,
            i = function(e) {
                function t(t) {
                    e.call(this, t)
                }
                return __extends(t, e), t.prototype.render = function() {
                    return this.$el.html(this.presenter()), this
                }, t.prototype.presenter = function() {
                    return ""
                }, t.prototype.close = function() {
                    this.$el.empty(), this.stopListening(), this.undelegateEvents(), this.el = null, this.$el = null
                }, t
            }(r.View);
        return i
    }),
    function(e) {
        typeof exports == "object" ? module.exports = e() : typeof define == "function" && define.amd ? define("promise", e) : typeof window != "undefined" ? window.Promise = e() : typeof global != "undefined" ? global.Promise = e() : typeof self != "undefined" && (self.Promise = e())
    }(function() {
        var e, t, n;
        return function r(e, t, n) {
            function i(o, u) {
                if (!t[o]) {
                    if (!e[o]) {
                        var a = typeof require == "function" && require;
                        if (!u && a) return a(o, !0);
                        if (s) return s(o, !0);
                        throw new Error("Cannot find module '" + o + "'")
                    }
                    var f = t[o] = {
                        exports: {}
                    };
                    e[o][0].call(f.exports, function(t) {
                        var n = e[o][1][t];
                        return i(n ? n : t)
                    }, f, f.exports, r, e, t, n)
                }
                return t[o].exports
            }
            var s = typeof require == "function" && require;
            for (var o = 0; o < n.length; o++) i(n[o]);
            return i
        }({
            1: [function(e, t, n) {
                t.exports = function(t, n, r) {
                    function s(e, t, r) {
                        var s = n(e, i, r, t === !0 ? e._boundTo : void 0);
                        return s.setHowMany(1), s.setUnwrap(), s.promise()
                    }
                    var i = e("./some_promise_array.js")(r);
                    t.any = function(n) {
                        return s(n, !1, t.any)
                    }, t.prototype.any = function() {
                        return s(this, !0, this.any)
                    }
                }
            }, {
                "./some_promise_array.js": 34
            }],
            2: [function(e, t, n) {
                t.exports = function() {
                    var e = function() {
                        function e(e) {
                            this.constructor$(e), this.message = e, this.name = "AssertionError"
                        }
                        return e.prototype = new Error, e.prototype.constructor = e, e.prototype.constructor$ = Error, e
                    }();
                    return function t(n, r) {
                        if (n === !0) return;
                        var i = new e(r);
                        throw Error.captureStackTrace && Error.captureStackTrace(i, t), console && console.error && console.error(i.stack + ""), i
                    }
                }()
            }, {}],
            3: [function(e, t, n) {
                function a() {
                    this._isTickUsed = !1, this._length = 0, this._lateBuffer = new s, this._functionBuffer = new s(75e3);
                    var e = this;
                    this.consumeFunctionBuffer = function() {
                        e._consumeFunctionBuffer()
                    }
                }
                var r = e("./assert.js"),
                    i = e("./schedule.js"),
                    s = e("./queue.js"),
                    o = e("./util.js").errorObj,
                    u = e("./util.js").tryCatch1;
                a.prototype.haveItemsQueued = function() {
                    return this._length > 0
                }, a.prototype.invokeLater = function(t, n, r) {
                    this._lateBuffer.push(t, n, r), this._queueTick()
                }, a.prototype.invoke = function(t, n, r) {
                    var i = this._functionBuffer;
                    i.push(t, n, r), this._length = i.length(), this._queueTick()
                }, a.prototype._consumeFunctionBuffer = function() {
                    var t = this._functionBuffer;
                    while (t.length() > 0) {
                        var n = t.shift(),
                            r = t.shift(),
                            i = t.shift();
                        n.call(r, i)
                    }
                    this._reset(), this._consumeLateBuffer()
                }, a.prototype._consumeLateBuffer = function() {
                    var t = this._lateBuffer;
                    while (t.length() > 0) {
                        var n = t.shift(),
                            r = t.shift(),
                            i = t.shift(),
                            s = u(n, r, i);
                        if (s === o) throw this._queueTick(), s.e
                    }
                }, a.prototype._queueTick = function() {
                    this._isTickUsed || (i(this.consumeFunctionBuffer), this._isTickUsed = !0)
                }, a.prototype._reset = function() {
                    this._isTickUsed = !1, this._length = 0
                }, t.exports = new a
            }, {
                "./assert.js": 2,
                "./queue.js": 26,
                "./schedule.js": 30,
                "./util.js": 36
            }],
            4: [function(e, t, n) {
                var r = e("./promise.js")();
                t.exports = r
            }, {
                "./promise.js": 18
            }],
            5: [function(e, t, n) {
                t.exports = function(e) {
                    function t(e) {
                        var t = typeof this == "string" ? this : "" + this;
                        return e[t]
                    }
                    e.prototype.call = function(t) {
                        var n = arguments.length,
                            r = new Array(n - 1);
                        for (var i = 1; i < n; ++i) r[i - 1] = arguments[i];
                        return this._then(function(e) {
                            return e[t].apply(e, r)
                        }, void 0, void 0, void 0, void 0, this.call)
                    }, e.prototype.get = function(n) {
                        return this._then(t, void 0, void 0, n, void 0, this.get)
                    }
                }
            }, {}],
            6: [function(e, t, n) {
                t.exports = function(t) {
                    var n = e("./errors.js"),
                        r = e("./async.js"),
                        i = n.CancellationError;
                    t.prototype.cancel = function() {
                        if (!this.isCancellable()) return this;
                        var t = this;
                        while (t._cancellationParent !== void 0) t = t._cancellationParent;
                        if (t === this) {
                            var n = new i;
                            this._attachExtraTrace(n), this._reject(n)
                        } else r.invoke(t.cancel, t, void 0);
                        return this
                    }, t.prototype.uncancellable = function() {
                        var n = new t;
                        return n._setTrace(this.uncancellable, this), n._unsetCancellable(), n._assumeStateOf(this, !0), n._boundTo = this._boundTo, n
                    }, t.prototype.fork = function(t, n, r) {
                        var i = this._then(t, n, r, void 0, void 0, this.fork);
                        return i._cancellationParent = void 0, i
                    }
                }
            }, {
                "./async.js": 3,
                "./errors.js": 10
            }],
            7: [function(e, t, n) {
                t.exports = function() {
                    function u(e, t) {
                        !o, this.captureStackTrace(e, t)
                    }
                    var t = e("./assert.js"),
                        n = e("./util.js").inherits,
                        r = new RegExp("\\b(?:Promise(?:Array|Spawn)?\\$_\\w+|tryCatch(?:1|2|Apply)|setTimeout|CatchFilter\\$_\\w+|makeNodePromisified|processImmediate|nextTick|Async\\$\\w+)\\b"),
                        i = null,
                        s = null,
                        o = !1;
                    n(u, Error), u.prototype.captureStackTrace = function(t, n) {
                        a(this, t, n)
                    }, u.possiblyUnhandledRejection = function(t) {
                        if (typeof console == "object") {
                            var n = t.stack,
                                r = "Possibly unhandled " + s(n, t);
                            typeof console.error == "function" || typeof console.error == "object" ? console.error(r) : (typeof console.log == "function" || typeof console.error == "object") && console.log(r)
                        }
                    }, o = u.prototype.captureStackTrace.name !== "CapturedTrace$captureStackTrace", u.combine = function(t, n) {
                        var s = t.length - 1;
                        for (var o = n.length - 1; o >= 0; --o) {
                            var u = n[o];
                            if (t[s] !== u) break;
                            t.pop(), s--
                        }
                        t.push("From previous event:");
                        var a = t.concat(n),
                            f = [];
                        for (var o = 0, l = a.length; o < l; ++o) {
                            if (r.test(a[o]) || o > 0 && !i.test(a[o]) && a[o] !== "From previous event:") continue;
                            f.push(a[o])
                        }
                        return f
                    }, u.isSupported = function() {
                        return typeof a == "function"
                    };
                    var a = function f() {
                        function e(e) {
                            var t = 41;
                            return e.length < t ? e : e.substr(0, t - 3) + "..."
                        }

                        function t(t) {
                            var n = t.toString(),
                                r = /\[object [a-zA-Z0-9$_]+\]/;
                            if (r.test(n)) try {
                                var i = JSON.stringify(t);
                                n = i
                            } catch (s) {}
                            return "(<" + e(n) + ">, no stack trace)"
                        }
                        if (typeof Error.stackTraceLimit == "number" && typeof Error.captureStackTrace == "function") {
                            i = /^\s*at\s*/, s = function(e, n) {
                                return typeof e == "string" ? e : n.name !== void 0 && n.message !== void 0 ? n.name + ". " + n.message : t(n)
                            };
                            var n = Error.captureStackTrace;
                            return function(t, r, i) {
                                var s = -1;
                                i || (s = Error.stackTraceLimit, Error.stackTraceLimit = Math.max(1, Math.min(1e4, s) / 3 | 0)), n(t, r), i || (Error.stackTraceLimit = s)
                            }
                        }
                        var r = new Error;
                        if (!o && typeof r.stack == "string" && typeof "".startsWith == "function" && r.stack.startsWith("stackDetection@") && f.name === "stackDetection") {
                            Object.defineProperty(Error, "stackTraceLimit", {
                                writable: !0,
                                enumerable: !1,
                                configurable: !1,
                                value: 25
                            }), i = /@/;
                            var u = /[@\n]/;
                            return s = function(e, n) {
                                    return typeof e == "string" ? n.name + ". " + n.message + "\n" + e : n.name !== void 0 && n.message !== void 0 ? n.name + ". " + n.message : t(n)
                                },
                                function(t, n) {
                                    var r = n.name,
                                        i = (new Error).stack,
                                        s = i.split(u),
                                        o, a = s.length;
                                    for (o = 0; o < a; o += 2)
                                        if (s[o] === r) break;
                                    s = s.slice(o + 2), a = s.length - 2;
                                    var f = "";
                                    for (o = 0; o < a; o += 2) f += s[o], f += "@", f += s[o + 1], f += "\n";
                                    t.stack = f
                                }
                        }
                        return s = function(e, n) {
                            return typeof e == "string" ? e : typeof n != "object" && typeof n != "function" || n.name === void 0 || n.message === void 0 ? t(n) : n.name + ". " + n.message
                        }, null
                    }();
                    return u
                }
            }, {
                "./assert.js": 2,
                "./util.js": 36
            }],
            8: [function(e, t, n) {
                function u(e, t, n) {
                    this._instances = e, this._callback = t, this._promise = n
                }

                function a(e, t) {
                    var n = {},
                        r = s(e, n, t);
                    if (r === o) return r;
                    var i = Object.keys(n);
                    return i.length ? (o.e = new TypeError("Catch filter must inherit from Error or be a simple predicate function"), o) : r
                }
                var r = e("./errors.js").ensureNotHandled,
                    i = e("./util.js"),
                    s = i.tryCatch1,
                    o = i.errorObj;
                u.prototype.doFilter = function(t) {
                    var n = this._callback;
                    for (var i = 0, u = this._instances.length; i < u; ++i) {
                        var f = this._instances[i],
                            l = f === Error || f != null && f.prototype instanceof Error;
                        if (l && t instanceof f) {
                            var c = s(n, this._promise._boundTo, t);
                            if (c === o) throw c.e;
                            return c
                        }
                        if (typeof f == "function" && !l) {
                            var h = a(f, t);
                            if (h === o) {
                                this._promise._attachExtraTrace(o.e), t = o.e;
                                break
                            }
                            if (h) {
                                var c = s(n, this._promise._boundTo, t);
                                if (c === o) throw c.e;
                                return c
                            }
                        }
                    }
                    throw r(t), t
                }, t.exports = u
            }, {
                "./errors.js": 10,
                "./util.js": 36
            }],
            9: [function(e, t, n) {
                t.exports = function(t) {
                    function f() {
                        this.errorObj = o, this.__id__ = 0, this.treshold = 1e3, this.thenableCache = new Array(this.treshold), this.promiseCache = new Array(this.treshold), this._compactQueued = !1
                    }

                    function h(e, n, i) {
                        if (n.promise != null) return n.promise;
                        var s = t.pending(i),
                            u = n.ref;
                        if (u === o) return s.reject(u.e), s.promise;
                        c.addCache(e, s.promise);
                        var f = !1,
                            l = a(u, e, function h(t) {
                                if (f) return;
                                f = !0, r.invoke(c.deleteCache, c, e);
                                var n = p(t);
                                n === t ? s.fulfill(t) : t === e ? s.promise._resolveFulfill(t) : n._then(s.fulfill, s.reject, void 0, s, void 0, h)
                            }, function(n) {
                                if (f) return;
                                f = !0, r.invoke(c.deleteCache, c, e), s.reject(n)
                            });
                        return l === o && !f && (s.reject(l.e), r.invoke(c.deleteCache, c, e)), s.promise
                    }

                    function p(e, n) {
                        if (u(e)) {
                            if (e instanceof t) return e;
                            var r = {
                                ref: null,
                                promise: null
                            };
                            if (c.is(e, r)) return n = typeof n == "function" ? n : p, h(e, r, n)
                        }
                        return e
                    }
                    var n = e("./assert.js"),
                        r = e("./async.js"),
                        i = e("./util.js"),
                        s = i.isPrimitive,
                        o = i.errorObj,
                        u = i.isObject,
                        a = i.tryCatch2;
                    f.prototype.couldBe = function(t) {
                        if (s(t)) return !1;
                        var n = t.__id_$thenable__;
                        return typeof n == "number" && this.thenableCache[n] !== void 0 ? !0 : "then" in t
                    }, f.prototype.is = function(t, n) {
                        var r = t.__id_$thenable__;
                        return typeof r == "number" && this.thenableCache[r] !== void 0 ? (n.ref = this.thenableCache[r], n.promise = this.promiseCache[r], !0) : this._thenableSlowCase(t, n)
                    }, f.prototype.addCache = function(t, n) {
                        var i = this.__id__;
                        this.__id__ = i + 1;
                        var s = this._descriptor(i);
                        Object.defineProperty(t, "__id_$thenable__", s), this.thenableCache[i] = t, this.promiseCache[i] = n, this.thenableCache.length > this.treshold && !this._compactQueued && (this._compactQueued = !0, r.invokeLater(this._compactCache, this, void 0))
                    }, f.prototype.deleteCache = function(t) {
                        var n = t.__id_$thenable__;
                        if (n === -1) return;
                        this.thenableCache[n] = void 0, this.promiseCache[n] = void 0, t.__id_$thenable__ = -1
                    };
                    var l = {
                        value: 0,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    };
                    f.prototype._descriptor = function(t) {
                        return l.value = t, l
                    }, f.prototype._compactCache = function() {
                        var t = this.thenableCache,
                            n = this.promiseCache,
                            r = 0,
                            i = 0;
                        for (var s = 0, o = t.length; s < o; ++s) {
                            var u = t[s];
                            u === void 0 ? r++ : (n[i] = n[s], u.__id_$thenable__ = i, t[i++] = u)
                        }
                        var a = t.length - r;
                        if (a === this.__id__) this.treshold *= 2;
                        else
                            for (var s = a, o = t.length; s < o; ++s) n[i] = t[s] = void 0;
                        this.__id__ = a, this._compactQueued = !1
                    }, f.prototype._thenableSlowCase = function(t, n) {
                        try {
                            var r = t.then;
                            return typeof r == "function" ? (n.ref = r, !0) : !1
                        } catch (i) {
                            return this.errorObj.e = i, n.ref = this.errorObj, !0
                        }
                    };
                    var c = new f(o);
                    t._couldBeThenable = function(e) {
                        return c.couldBe(e)
                    }, t.prototype._resolveThenable = function(n, i) {
                        if (i.promise != null) {
                            this._assumeStateOf(i.promise, !0);
                            return
                        }
                        if (i.ref === o) this._attachExtraTrace(i.ref.e), r.invoke(this._reject, this, i.ref.e);
                        else {
                            c.addCache(n, this);
                            var s = i.ref,
                                u = n,
                                f = this,
                                l = {},
                                h = !1,
                                d = function g(e) {
                                    if (h && this !== l) return;
                                    h = !0;
                                    var i = f._fulfill,
                                        s = p(e);
                                    if (s !== e || s instanceof t && s.isPending()) {
                                        e === n ? (r.invoke(i, f, e), r.invoke(c.deleteCache, c, u)) : s._then(g, v, void 0, l, void 0, g);
                                        return
                                    }
                                    if (s instanceof t) {
                                        var i = s.isFulfilled() ? f._fulfill : f._reject;
                                        e = e._resolvedValue, s = p(e);
                                        if (s !== e || s instanceof t && s !== e) {
                                            s._then(g, v, void 0, l, void 0, g);
                                            return
                                        }
                                    }
                                    r.invoke(i, f, e), r.invoke(c.deleteCache, c, u)
                                },
                                v = function y(e) {
                                    if (h && this !== l) return;
                                    var i = f._reject;
                                    h = !0;
                                    var s = p(e);
                                    if (s !== e || s instanceof t && s.isPending()) {
                                        e === n ? (r.invoke(i, f, e), r.invoke(c.deleteCache, c, u)) : s._then(d, y, void 0, l, void 0, d);
                                        return
                                    }
                                    if (s instanceof t) {
                                        var i = s.isFulfilled() ? f._fulfill : f._reject;
                                        e = e._resolvedValue, s = p(e);
                                        if (s !== e || s instanceof t && s.isPending()) {
                                            s._then(d, y, void 0, l, void 0, d);
                                            return
                                        }
                                    }
                                    r.invoke(i, f, e), r.invoke(c.deleteCache, c, u)
                                },
                                m = a(s, n, d, v);
                            m === o && !h && (this._attachExtraTrace(m.e), r.invoke(this._reject, this, m.e), r.invoke(c.deleteCache, c, n))
                        }
                    }, t.prototype._tryThenable = function(t) {
                        var n;
                        return c.is(t, n = {
                            ref: null,
                            promise: null
                        }) ? (this._resolveThenable(t, n), !0) : !1
                    }, t._cast = p
                }
            }, {
                "./assert.js": 2,
                "./async.js": 3,
                "./util.js": 36
            }],
            10: [function(e, t, n) {
                function l(e) {
                    return (e & 1) > 0
                }

                function c(e) {
                    return (e & 2) > 0
                }

                function h(e) {
                    return e | 1
                }

                function p(e) {
                    return e | 2
                }

                function d(e) {
                    return e & -3
                }

                function v(e) {
                    var t;
                    u(e) && (t = e.__promiseHandled__) !== void 0 && (e.__promiseHandled__ = d(t))
                }

                function m(e) {
                    try {
                        return a(e, "__promiseHandled__", 0), !0
                    } catch (t) {
                        return !1
                    }
                }

                function g(e) {
                    return e instanceof f
                }

                function y(e) {
                    if (g(e)) {
                        var t = e.__promiseHandled__;
                        return t === void 0 ? m(e) : !l(t)
                    }
                    return !1
                }

                function b(e, t) {
                    function n(n) {
                        this.message = typeof n == "string" ? n : t, this.name = e, f.captureStackTrace && f.captureStackTrace(this, this.constructor)
                    }
                    return o(n, f), n
                }

                function x(e) {
                    this.name = "RejectionError", this.message = e, this.cause = e, e instanceof f ? (this.message = e.message, this.stack = e.stack) : f.captureStackTrace && f.captureStackTrace(this, this.constructor)
                }
                var r = e("./global.js"),
                    i = r.Object.freeze,
                    s = e("./util.js"),
                    o = s.inherits,
                    u = s.isObject,
                    a = s.notEnumerableProp,
                    f = r.Error,
                    w = r.TypeError;
                typeof w != "function" && (w = b("TypeError", "type error"));
                var E = b("CancellationError", "cancellation error"),
                    S = b("TimeoutError", "timeout error");
                o(x, f);
                var T = "__BluebirdErrorTypes__",
                    N = r[T];
                N || (N = i({
                    CancellationError: E,
                    TimeoutError: S,
                    RejectionError: x
                }), a(r, T, N)), t.exports = {
                    Error: f,
                    TypeError: w,
                    CancellationError: N.CancellationError,
                    RejectionError: N.RejectionError,
                    TimeoutError: N.TimeoutError,
                    attachDefaultState: m,
                    ensureNotHandled: v,
                    withHandledUnmarked: d,
                    withHandledMarked: p,
                    withStackAttached: h,
                    isStackAttached: l,
                    isHandled: c,
                    canAttach: y
                }
            }, {
                "./global.js": 14,
                "./util.js": 36
            }],
            11: [function(e, t, n) {
                t.exports = function(t) {
                    function r(e) {
                        var r = new n(e),
                            i = t.rejected(r),
                            s = i._peekContext();
                        return s != null && s._attachExtraTrace(r), i
                    }
                    var n = e("./errors.js").TypeError;
                    return r
                }
            }, {
                "./errors.js": 10
            }],
            12: [function(e, t, n) {
                t.exports = function(t, n, r, i) {
                    function o(e) {
                        var t = this,
                            n = void 0;
                        typeof t != "function" && (n = t.receiver, t = t.fn);
                        var r = new Array(e.length),
                            i = 0;
                        if (n === void 0)
                            for (var s = 0, o = e.length; s < o; ++s) {
                                var u = e[s];
                                if (!(u !== void 0 || s in e)) continue;
                                t(u, s, o) && (r[i++] = u)
                            } else
                                for (var s = 0, o = e.length; s < o; ++s) {
                                    var u = e[s];
                                    if (!(u !== void 0 || s in e)) continue;
                                    t.call(n, u, s, o) && (r[i++] = u)
                                }
                        return r.length = i, r
                    }

                    function u(e, t, s, u) {
                        return typeof t != "function" ? i("fn is not a function") : (s === !0 && (t = {
                            fn: t,
                            receiver: e._boundTo
                        }), n(e, r, u, s === !0 ? e._boundTo : void 0).promise()._then(o, void 0, void 0, t, void 0, u))
                    }
                    var s = e("./assert.js");
                    t.filter = function(n, r) {
                        return u(n, r, !1, t.filter)
                    }, t.prototype.filter = function(t) {
                        return u(this, t, !0, this.filter)
                    }
                }
            }, {
                "./assert.js": 2
            }],
            13: [function(e, t, n) {
                t.exports = function(t, n) {
                    var r = e("./promise_spawn.js")(t),
                        i = e("./errors.js"),
                        s = i.TypeError;
                    t.coroutine = function(t) {
                        if (typeof t != "function") throw new s("generatorFunction must be a function");
                        var n = r;
                        return function i() {
                            var e = t.apply(this, arguments),
                                r = new n(void 0, void 0, i);
                            return r._generator = e, r._next(void 0), r.promise()
                        }
                    }, t.spawn = function(i) {
                        if (typeof i != "function") return n("generatorFunction must be a function");
                        var s = new r(i, this, t.spawn),
                            o = s.promise();
                        return s._run(t.spawn), o
                    }
                }
            }, {
                "./errors.js": 10,
                "./promise_spawn.js": 22
            }],
            14: [function(e, t, n) {
                t.exports = function() {
                    if (typeof this != "undefined") return this;
                    if (typeof process != "undefined" && typeof global != "undefined" && typeof process.execPath == "string") return global;
                    if (typeof window != "undefined" && typeof document != "undefined" && typeof navigator != "undefined" && navigator !== null && typeof navigator.appName == "string") return window
                }()
            }, {}],
            15: [function(e, t, n) {
                t.exports = function(t, n, r, i) {
                    function o(e) {
                        var i = this,
                            s = void 0;
                        typeof i != "function" && (s = i.receiver, i = i.fn);
                        var u = !1;
                        if (s === void 0)
                            for (var a = 0, f = e.length; a < f; ++a) {
                                if (!(e[a] !== void 0 || a in e)) continue;
                                var l = i(e[a], a, f);
                                if (!u && t.is(l)) {
                                    if (l.isFulfilled()) {
                                        e[a] = l._resolvedValue;
                                        continue
                                    }
                                    u = !0
                                }
                                e[a] = l
                            } else
                                for (var a = 0, f = e.length; a < f; ++a) {
                                    if (!(e[a] !== void 0 || a in e)) continue;
                                    var l = i.call(s, e[a], a, f);
                                    if (!u && t.is(l)) {
                                        if (l.isFulfilled()) {
                                            e[a] = l._resolvedValue;
                                            continue
                                        }
                                        u = !0
                                    }
                                    e[a] = l
                                }
                        return u ? n(e, r, o, void 0).promise() : e
                    }

                    function u(e, t, s, u) {
                        return typeof t != "function" ? i("fn is not a function") : (s === !0 && (t = {
                            fn: t,
                            receiver: e._boundTo
                        }), n(e, r, u, s === !0 ? e._boundTo : void 0).promise()._then(o, void 0, void 0, t, void 0, u))
                    }
                    var s = e("./assert.js");
                    t.prototype.map = function(t) {
                        return u(this, t, !0, this.map)
                    }, t.map = function(n, r) {
                        return u(n, r, !1, t.map)
                    }
                }
            }, {
                "./assert.js": 2
            }],
            16: [function(e, t, n) {
                t.exports = function(t) {
                    function a(e) {
                        throw e
                    }

                    function f(e, t) {
                        var n = this,
                            i = s(n, t, null, e);
                        i === u && r.invokeLater(a, void 0, i.e)
                    }

                    function l(e, t) {
                        var n = this,
                            i = o(n, t, e);
                        i === u && r.invokeLater(a, void 0, i.e)
                    }
                    var n = e("./util.js"),
                        r = e("./async.js"),
                        i = e("./assert.js"),
                        s = n.tryCatch2,
                        o = n.tryCatch1,
                        u = n.errorObj;
                    t.prototype.nodeify = function(t) {
                        return typeof t == "function" && this._then(f, l, void 0, t, this._isBound() ? this._boundTo : null, this.nodeify), this
                    }
                }
            }, {
                "./assert.js": 2,
                "./async.js": 3,
                "./util.js": 36
            }],
            17: [function(e, t, n) {
                t.exports = function(t) {
                    var n = e("./assert.js"),
                        r = e("./util.js"),
                        i = e("./async.js"),
                        s = r.tryCatch1,
                        o = r.errorObj;
                    t.prototype.progressed = function(t) {
                        return this._then(void 0, void 0, t, void 0, void 0, this.progressed)
                    }, t.prototype._progress = function(t) {
                        if (this._isFollowingOrFulfilledOrRejected()) return;
                        this._resolveProgress(t)
                    }, t.prototype._progressAt = function(t) {
                        return t === 0 ? this._progress0 : this[t + 2 - 5]
                    }, t.prototype._resolveProgress = function(n) {
                        var r = this._length();
                        for (var u = 0; u < r; u += 5) {
                            var a = this._progressAt(u),
                                f = this._promiseAt(u);
                            if (!t.is(f)) {
                                a.call(this._receiverAt(u), n, f);
                                continue
                            }
                            var l = n;
                            a !== void 0 ? (this._pushContext(), l = s(a, this._receiverAt(u), n), this._popContext(), l === o ? l.e != null && l.e.name === "StopProgressPropagation" ? l.e.__promiseHandled__ = 2 : (f._attachExtraTrace(l.e), i.invoke(f._progress, f, l.e)) : t.is(l) ? l._then(f._progress, null, null, f, void 0, this._progress) : i.invoke(f._progress, f, l)) : i.invoke(f._progress, f, l)
                        }
                    }
                }
            }, {
                "./assert.js": 2,
                "./async.js": 3,
                "./util.js": 36
            }],
            18: [function(e, t, n) {
                t.exports = function() {
                    function O(e) {
                        return typeof e != "object" ? !1 : e instanceof M
                    }

                    function M(e) {
                        this._bitField = 67108864, this._fulfill0 = void 0, this._reject0 = void 0, this._progress0 = void 0, this._promise0 = void 0, this._receiver0 = void 0, this._resolvedValue = void 0, this._cancellationParent = void 0, this._boundTo = void 0, H && (this._traceParent = this._peekContext()), typeof e == "function" && this._resolveResolver(e)
                    }

                    function _(e) {
                        throw e
                    }

                    function D(e, t) {
                        return this.isFulfilled() ? e._then(function() {
                            return t
                        }, _, void 0, this, void 0, D) : e._then(function() {
                            throw S(t), t
                        }, _, void 0, this, void 0, D)
                    }

                    function P(e, t, n) {
                        return F(e, o, n, t === !0 ? e._boundTo : void 0).promise()
                    }

                    function F(e, t, n, r) {
                        return O(e) || l(e) ? new t(e, typeof n == "function" ? n : F, r) : new t([L("expecting an array or a promise")], n, r)
                    }
                    var t = e("./global.js"),
                        n = e("./assert.js"),
                        r = e("./util.js"),
                        i = e("./async.js"),
                        s = e("./errors.js"),
                        o = e("./promise_array.js")(M),
                        u = e("./captured_trace.js")(),
                        a = e("./catch_filter.js"),
                        f = e("./promise_resolver.js"),
                        l = r.isArray,
                        c = r.notEnumerableProp,
                        h = r.isObject,
                        p = r.ensurePropertyExpansion,
                        d = r.errorObj,
                        v = r.tryCatch1,
                        m = r.tryCatch2,
                        g = r.tryCatchApply,
                        y = s.TypeError,
                        b = s.CancellationError,
                        w = s.TimeoutError,
                        E = s.RejectionError,
                        S = s.ensureNotHandled,
                        x = s.withHandledMarked,
                        T = s.withStackAttached,
                        N = s.isStackAttached,
                        C = s.isHandled,
                        k = s.canAttach,
                        L = e("./errors_api_rejection")(M),
                        A = {};
                    M.prototype.bind = function(t) {
                        var n = new M;
                        return n._setTrace(this.bind, this), n._assumeStateOf(this, !0), n._setBoundTo(t), n
                    }, M.prototype.toString = function() {
                        return "[object Promise]"
                    }, M.prototype.caught = M.prototype["catch"] = function(t) {
                        var n = arguments.length;
                        if (n > 1) {
                            var r = new Array(n - 1),
                                s = 0,
                                o;
                            for (o = 0; o < n - 1; ++o) {
                                var u = arguments[o];
                                if (typeof u != "function") {
                                    var f = new y("A catch filter must be an error constructor or a filter function");
                                    this._attachExtraTrace(f), i.invoke(this._reject, this, f);
                                    return
                                }
                                r[s++] = u
                            }
                            r.length = s, t = arguments[o], this._resetTrace(this.caught);
                            var l = new a(r, t, this);
                            return this._then(void 0, l.doFilter, void 0, l, void 0, this.caught)
                        }
                        return this._then(void 0, t, void 0, void 0, void 0, this.caught)
                    }, M.prototype.lastly = M.prototype["finally"] = function(t) {
                        var n = function(e) {
                            var n = this._isBound() ? t.call(this._boundTo) : t();
                            if (O(n)) return D.call(this, n, e);
                            if (this.isRejected()) throw S(e), e;
                            return e
                        };
                        return this._then(n, n, void 0, this, void 0, this.lastly)
                    }, M.prototype.then = function(t, n, r) {
                        return this._then(t, n, r, void 0, void 0, this.then)
                    }, M.prototype.done = function(t, n, r) {
                        var i = this._then(t, n, r, void 0, void 0, this.done);
                        i._setIsFinal()
                    }, M.prototype.spread = function(t, n) {
                        return this._then(t, n, void 0, A, void 0, this.spread)
                    }, M.prototype.isFulfilled = function() {
                        return (this._bitField & 268435456) > 0
                    }, M.prototype.isRejected = function() {
                        return (this._bitField & 134217728) > 0
                    }, M.prototype.isPending = function() {
                        return !this.isResolved()
                    }, M.prototype.isResolved = function() {
                        return (this._bitField & 402653184) > 0
                    }, M.prototype.isCancellable = function() {
                        return !this.isResolved() && this._cancellable()
                    }, M.prototype.toJSON = function() {
                        var t = {
                            isFulfilled: !1,
                            isRejected: !1,
                            fulfillmentValue: void 0,
                            rejectionReason: void 0
                        };
                        return this.isFulfilled() ? (t.fulfillmentValue = this._resolvedValue, t.isFulfilled = !0) : this.isRejected() && (t.rejectionReason = this._resolvedValue, t.isRejected = !0), t
                    }, M.prototype.all = function() {
                        return P(this, !0, this.all)
                    }, M.is = O, M.all = function(t) {
                        return P(t, !1, M.all)
                    }, M.join = function() {
                        var t = new Array(arguments.length);
                        for (var n = 0, r = t.length; n < r; ++n) t[n] = arguments[n];
                        return F(t, o, M.join, void 0).promise()
                    }, M.fulfilled = function(t, n) {
                        var r = new M;
                        return r._setTrace(typeof n == "function" ? n : M.fulfilled, void 0), r._tryAssumeStateOf(t, !1) ? r : (r._cleanValues(), r._setFulfilled(), r._resolvedValue = t, r)
                    }, M.rejected = function(t) {
                        var n = new M;
                        return n._setTrace(M.rejected, void 0), n._cleanValues(), n._setRejected(), n._resolvedValue = t, n
                    }, M["try"] = M.attempt = function(t, n, r) {
                        if (typeof t != "function") return L("fn must be a function");
                        var i = l(n) ? g(t, n, r) : v(t, r, n),
                            s = new M;
                        s._setTrace(M.attempt, void 0);
                        if (i === d) return s._cleanValues(), s._setRejected(), s._resolvedValue = i.e, s;
                        var o = M._cast(i);
                        return o instanceof M ? s._assumeStateOf(o, !0) : (s._cleanValues(), s._setFulfilled(), s._resolvedValue = i), s
                    }, M.pending = function(t) {
                        var n = new M;
                        return n._setTrace(typeof t == "function" ? t : M.pending, void 0), new f(n)
                    }, M.bind = function(t) {
                        var n = new M;
                        return n._setTrace(M.bind, void 0), n._setFulfilled(), n._setBoundTo(t), n
                    }, M.cast = function(t, n) {
                        var r = M._cast(t, n);
                        return r instanceof M ? r : M.fulfilled(r, n)
                    }, M.onPossiblyUnhandledRejection = function(t) {
                        typeof t == "function" ? u.possiblyUnhandledRejection = t : u.possiblyUnhandledRejection = void 0
                    };
                    var H = !0;
                    M.longStackTraces = function() {
                        if (i.haveItemsQueued() && H === !1) throw new Error("Cannot enable long stack traces after promises have been created");
                        H = !0
                    }, M.hasLongStackTraces = function() {
                        return H
                    }, M.prototype._then = function(t, n, r, s, o, u) {
                        var a = o !== void 0,
                            f = a ? o : new M;
                        if (H && !a) {
                            var l = this._peekContext() === this._traceParent;
                            f._traceParent = l ? this._traceParent : this, f._setTrace(typeof u == "function" ? u : this._then, this)
                        }
                        a || (f._boundTo = this._boundTo);
                        var c = this._addCallbacks(t, n, r, f, s);
                        this.isResolved() ? i.invoke(this._resolveLast, this, c) : !a && this.isCancellable() && (f._cancellationParent = this);
                        if (this._isDelegated()) {
                            this._unsetDelegated();
                            var h = this._resolvedValue;
                            this._tryThenable(h) || i.invoke(this._fulfill, this, h)
                        }
                        return f
                    }, M.prototype._length = function() {
                        return this._bitField & 16777215
                    }, M.prototype._isFollowingOrFulfilledOrRejected = function() {
                        return (this._bitField & 939524096) > 0
                    }, M.prototype._setLength = function(t) {
                        this._bitField = this._bitField & -16777216 | t & 16777215
                    }, M.prototype._cancellable = function() {
                        return (this._bitField & 67108864) > 0
                    }, M.prototype._setFulfilled = function() {
                        this._bitField = this._bitField | 268435456
                    }, M.prototype._setRejected = function() {
                        this._bitField = this._bitField | 134217728
                    }, M.prototype._setFollowing = function() {
                        this._bitField = this._bitField | 536870912
                    }, M.prototype._setDelegated = function() {
                        this._bitField = this._bitField | -1073741824
                    }, M.prototype._setIsFinal = function() {
                        this._bitField = this._bitField | 33554432
                    }, M.prototype._isFinal = function() {
                        return (this._bitField & 33554432) > 0
                    }, M.prototype._isDelegated = function() {
                        return (this._bitField & -1073741824) === -1073741824
                    }, M.prototype._unsetDelegated = function() {
                        this._bitField = this._bitField & 1073741823
                    }, M.prototype._setCancellable = function() {
                        this._bitField = this._bitField | 67108864
                    }, M.prototype._unsetCancellable = function() {
                        this._bitField = this._bitField & -67108865
                    }, M.prototype._receiverAt = function(t) {
                        var n;
                        return t === 0 ? n = this._receiver0 : n = this[t + 4 - 5], this._isBound() && n === void 0 ? this._boundTo : n
                    }, M.prototype._promiseAt = function(t) {
                        return t === 0 ? this._promise0 : this[t + 3 - 5]
                    }, M.prototype._fulfillAt = function(t) {
                        return t === 0 ? this._fulfill0 : this[t + 0 - 5]
                    }, M.prototype._rejectAt = function(t) {
                        return t === 0 ? this._reject0 : this[t + 1 - 5]
                    }, M.prototype._unsetAt = function(t) {
                        t === 0 ? this._fulfill0 = this._reject0 = this._progress0 = this._promise0 = this._receiver0 = void 0 : this[t - 5 + 0] = this[t - 5 + 1] = this[t - 5 + 2] = this[t - 5 + 3] = this[t - 5 + 4] = void 0
                    }, M.prototype._resolveResolver = function(t) {
                        this._setTrace(this._resolveResolver, void 0);
                        var n = new f(this);
                        this._pushContext();
                        var r = m(t, this, function(t) {
                            n.fulfill(t)
                        }, function(t) {
                            n.reject(t)
                        });
                        this._popContext(), r === d && n.reject(r.e)
                    }, M.prototype._addCallbacks = function(t, n, r, i, s) {
                        t = typeof t == "function" ? t : void 0, n = typeof n == "function" ? n : void 0, r = typeof r == "function" ? r : void 0;
                        var o = this._length();
                        return o === 0 ? (this._fulfill0 = t, this._reject0 = n, this._progress0 = r, this._promise0 = i, this._receiver0 = s, this._setLength(o + 5), o) : (this[o - 5 + 0] = t, this[o - 5 + 1] = n, this[o - 5 + 2] = r, this[o - 5 + 3] = i, this[o - 5 + 4] = s, this._setLength(o + 5), o)
                    }, M.prototype._spreadSlowCase = function(t, n, r, i) {
                        n._assumeStateOf(F(r, o, this._spreadSlowCase, i).promise()._then(function() {
                            return t.apply(i, arguments)
                        }, void 0, void 0, A, void 0, this._spreadSlowCase), !1)
                    }, M.prototype._setBoundTo = function(t) {
                        this._boundTo = t
                    }, M.prototype._isBound = function() {
                        return this._boundTo !== void 0
                    };
                    var B = a.prototype.doFilter;
                    M.prototype._resolvePromise = function(t, n, r, s) {
                        var o = this.isRejected();
                        if (o && typeof r == "object" && r !== null) {
                            var u = r.__promiseHandled__;
                            u === void 0 ? c(r, "__promiseHandled__", 2) : r.__promiseHandled__ = x(u)
                        }
                        if (!O(s)) return t.call(n, r, s);
                        var a;
                        if (!o && n === A) {
                            if (!l(r)) {
                                this._spreadSlowCase(t, s, r, this._boundTo);
                                return
                            }
                            for (var f = 0, h = r.length; f < h; ++f)
                                if (O(r[f])) {
                                    this._spreadSlowCase(t, s, r, this._boundTo);
                                    return
                                }
                            s._pushContext(), a = g(t, r, this._boundTo)
                        } else s._pushContext(), a = v(t, n, r);
                        s._popContext();
                        if (a === d) S(a.e), t !== B && s._attachExtraTrace(a.e), i.invoke(s._reject, s, a.e);
                        else if (a === s) {
                            var p = new y("Circular thenable chain");
                            this._attachExtraTrace(p), i.invoke(s._reject, s, p)
                        } else {
                            if (s._tryAssumeStateOf(a, !0)) return;
                            if (M._couldBeThenable(a)) {
                                if (s._length() === 0) {
                                    s._resolvedValue = a, s._setDelegated();
                                    return
                                }
                                if (s._tryThenable(a)) return
                            }
                            i.invoke(s._fulfill, s, a)
                        }
                    }, M.prototype._assumeStateOf = function(t, n) {
                        this._setFollowing(), t.isPending() ? (t._cancellable() && (this._cancellationParent = t), t._then(this._resolveFulfill, this._resolveReject, this._resolveProgress, this, void 0, this._tryAssumeStateOf)) : t.isFulfilled() ? n === !0 ? i.invoke(this._resolveFulfill, this, t._resolvedValue) : this._resolveFulfill(t._resolvedValue) : n === !0 ? i.invoke(this._resolveReject, this, t._resolvedValue) : this._resolveReject(t._resolvedValue), H && t._traceParent == null && (t._traceParent = this)
                    }, M.prototype._tryAssumeStateOf = function(t, n) {
                        return !O(t) || this._isFollowingOrFulfilledOrRejected() ? !1 : (this._assumeStateOf(t, n), !0)
                    }, M.prototype._resetTrace = function(t) {
                        if (H) {
                            var n = this._peekContext(),
                                r = n === void 0;
                            this._trace = new u(typeof t == "function" ? t : this._resetTrace, r)
                        }
                    }, M.prototype._setTrace = function(t, n) {
                        if (H) {
                            var r = this._peekContext(),
                                i = r === void 0;
                            n !== void 0 && n._traceParent === r ? this._trace = n._trace : this._trace = new u(typeof t == "function" ? t : this._setTrace, i)
                        }
                        return this
                    }, M.prototype._attachExtraTrace = function(t) {
                        if (H && k(t)) {
                            var n = this,
                                r = t.stack;
                            r = typeof r == "string" ? r.split("\n") : [];
                            var i = 1;
                            while (n != null && n._trace != null) r = u.combine(r, n._trace.stack.split("\n")), n = n._traceParent;
                            var s = Error.stackTraceLimit + i,
                                o = r.length;
                            o > s && (r.length = s), r.length <= i ? t.stack = "(No stack trace)" : t.stack = r.join("\n"), t.__promiseHandled__ = T(t.__promiseHandled__)
                        }
                    }, M.prototype._notifyUnhandledRejection = function(t) {
                        C(t.__promiseHandled__) || (t.__promiseHandled__ = x(t.__promiseHandled__), u.possiblyUnhandledRejection(t, this))
                    }, M.prototype._unhandledRejection = function(t) {
                        C(t.__promiseHandled__) || i.invokeLater(this._notifyUnhandledRejection, this, t)
                    }, M.prototype._cleanValues = function() {
                        this._cancellationParent = void 0
                    }, M.prototype._fulfill = function(t) {
                        if (this._isFollowingOrFulfilledOrRejected()) return;
                        this._resolveFulfill(t)
                    }, M.prototype._reject = function(t) {
                        if (this._isFollowingOrFulfilledOrRejected()) return;
                        this._resolveReject(t)
                    }, M.prototype._doResolveAt = function(t) {
                        var n = this.isFulfilled() ? this._fulfillAt(t) : this._rejectAt(t),
                            r = this._resolvedValue,
                            i = this._receiverAt(t),
                            s = this._promiseAt(t);
                        this._unsetAt(t), this._resolvePromise(n, i, r, s)
                    }, M.prototype._resolveFulfill = function(t) {
                        this._cleanValues(), this._setFulfilled(), this._resolvedValue = t;
                        var n = this._length();
                        this._setLength(0);
                        for (var r = 0; r < n; r += 5)
                            if (this._fulfillAt(r) !== void 0) i.invoke(this._doResolveAt, this, r);
                            else {
                                var s = this._promiseAt(r);
                                this._unsetAt(r), i.invoke(s._fulfill, s, t)
                            }
                    }, M.prototype._resolveLast = function(t) {
                        this._setLength(0);
                        var n;
                        this.isFulfilled() ? n = this._fulfillAt(t) : n = this._rejectAt(t);
                        if (n !== void 0) i.invoke(this._doResolveAt, this, t);
                        else {
                            var r = this._promiseAt(t),
                                s = this._resolvedValue;
                            this._unsetAt(t), this.isFulfilled() ? i.invoke(r._fulfill, r, s) : i.invoke(r._reject, r, s)
                        }
                    }, M.prototype._resolveReject = function(t) {
                        this._cleanValues(), this._setRejected(), this._resolvedValue = t;
                        if (this._isFinal()) {
                            i.invokeLater(_, void 0, t);
                            return
                        }
                        var n = this._length();
                        this._setLength(0);
                        var r = !1;
                        for (var s = 0; s < n; s += 5)
                            if (this._rejectAt(s) !== void 0) r = !0, i.invoke(this._doResolveAt, this, s);
                            else {
                                var o = this._promiseAt(s);
                                this._unsetAt(s), r || (r = o._length() > 0), i.invoke(o._reject, o, t)
                            }
                        if (!r && u.possiblyUnhandledRejection !== void 0 && h(t)) {
                            var a = t.__promiseHandled__,
                                f = t;
                            if (a === void 0) f = p(t, "__promiseHandled__", 0), a = 0;
                            else if (C(a)) return;
                            N(a) || this._attachExtraTrace(f), i.invoke(this._unhandledRejection, this, f)
                        }
                    };
                    var j = [];
                    M.prototype._peekContext = function() {
                        var t = j.length - 1;
                        return t >= 0 ? j[t] : void 0
                    }, M.prototype._pushContext = function() {
                        if (!H) return;
                        j.push(this)
                    }, M.prototype._popContext = function() {
                        if (!H) return;
                        j.pop()
                    };
                    var I = t.Promise;
                    return M.noConflict = function() {
                        return t.Promise === M && (t.Promise = I), M
                    }, u.isSupported() || (M.longStackTraces = function() {}, H = !1), M.CancellationError = b, M.TimeoutError = w, M.TypeError = y, M.RejectionError = E, e("./synchronous_inspection.js")(M), e("./any.js")(M, F, o), e("./race.js")(M, F, o), e("./call_get.js")(M), e("./filter.js")(M, F, o, L), e("./generators.js")(M, L), e("./map.js")(M, F, o, L), e("./nodeify.js")(M), e("./promisify.js")(M), e("./props.js")(M, o), e("./reduce.js")(M, F, o, L), e("./settle.js")(M, F, o), e("./some.js")(M, F, o, L), e("./progress.js")(M), e("./cancel.js")(M), e("./complex_thenables.js")(M), M.prototype = M.prototype, M
                }
            }, {
                "./any.js": 1,
                "./assert.js": 2,
                "./async.js": 3,
                "./call_get.js": 5,
                "./cancel.js": 6,
                "./captured_trace.js": 7,
                "./catch_filter.js": 8,
                "./complex_thenables.js": 9,
                "./errors.js": 10,
                "./errors_api_rejection": 11,
                "./filter.js": 12,
                "./generators.js": 13,
                "./global.js": 14,
                "./map.js": 15,
                "./nodeify.js": 16,
                "./progress.js": 17,
                "./promise_array.js": 19,
                "./promise_resolver.js": 21,
                "./promisify.js": 23,
                "./props.js": 25,
                "./race.js": 27,
                "./reduce.js": 29,
                "./settle.js": 31,
                "./some.js": 33,
                "./synchronous_inspection.js": 35,
                "./util.js": 36
            }],
            19: [function(e, t, n) {
                t.exports = function(t) {
                    function a(e) {
                        switch (e) {
                            case 0:
                                return void 0;
                            case 1:
                                return [];
                            case 2:
                                return {}
                        }
                    }

                    function f(e, n, r) {
                        this._values = e, this._resolver = t.pending(n), r !== void 0 && this._resolver.promise._setBoundTo(r), this._length = 0, this._totalResolved = 0, this._init(void 0, 1)
                    }
                    var n = e("./assert.js"),
                        r = e("./errors.js").ensureNotHandled,
                        i = e("./util.js"),
                        s = e("./async.js"),
                        o = {}.hasOwnProperty,
                        u = i.isArray;
                    return f.PropertiesPromiseArray = function() {}, f.prototype.length = function() {
                        return this._length
                    }, f.prototype.promise = function() {
                        return this._resolver.promise
                    }, f.prototype._init = function(n, r) {
                        var i = this._values;
                        if (t.is(i)) {
                            if (!i.isFulfilled()) {
                                if (i.isPending()) {
                                    i._then(this._init, this._reject, void 0, this, r, this.constructor);
                                    return
                                }
                                this._reject(i._resolvedValue);
                                return
                            }
                            i = i._resolvedValue;
                            if (!u(i)) {
                                this._fulfill(a(r));
                                return
                            }
                            this._values = i
                        }
                        if (i.length === 0) {
                            this._fulfill(a(r));
                            return
                        }
                        var l = i.length,
                            c = l,
                            h;
                        this instanceof f.PropertiesPromiseArray ? h = this._values : h = new Array(l);
                        var p = !1;
                        for (var d = 0; d < l; ++d) {
                            var v = i[d];
                            if (v === void 0 && !o.call(i, d)) {
                                c--;
                                continue
                            }
                            var m = t._cast(v);
                            m instanceof t && m.isPending() ? m._then(this._promiseFulfilled, this._promiseRejected, this._promiseProgressed, this, d, this._scanDirectValues) : p = !0, h[d] = m
                        }
                        if (c === 0) {
                            r === 1 ? this._fulfill(h) : this._fulfill(a(r));
                            return
                        }
                        this._values = h, this._length = c;
                        if (p) {
                            var g = c === l ? this._scanDirectValues : this._scanDirectValuesHoled;
                            s.invoke(g, this, l)
                        }
                    }, f.prototype._resolvePromiseAt = function(n) {
                        var r = this._values[n];
                        t.is(r) ? r.isFulfilled() ? this._promiseFulfilled(r._resolvedValue, n) : r.isRejected() && this._promiseRejected(r._resolvedValue, n) : this._promiseFulfilled(r, n)
                    }, f.prototype._scanDirectValuesHoled = function(t) {
                        for (var n = 0; n < t; ++n) {
                            if (this._isResolved()) break;
                            o.call(this._values, n) && this._resolvePromiseAt(n)
                        }
                    }, f.prototype._scanDirectValues = function(t) {
                        for (var n = 0; n < t; ++n) {
                            if (this._isResolved()) break;
                            this._resolvePromiseAt(n)
                        }
                    }, f.prototype._isResolved = function() {
                        return this._values === null
                    }, f.prototype._fulfill = function(t) {
                        this._values = null, this._resolver.fulfill(t)
                    }, f.prototype._reject = function(t) {
                        r(t), this._values = null, this._resolver.reject(t)
                    }, f.prototype._promiseProgressed = function(t, n) {
                        if (this._isResolved()) return;
                        this._resolver.progress({
                            index: n,
                            value: t
                        })
                    }, f.prototype._promiseFulfilled = function(t, n) {
                        if (this._isResolved()) return;
                        this._values[n] = t;
                        var r = ++this._totalResolved;
                        r >= this._length && this._fulfill(this._values)
                    }, f.prototype._promiseRejected = function(t) {
                        if (this._isResolved()) return;
                        this._totalResolved++, this._reject(t)
                    }, f
                }
            }, {
                "./assert.js": 2,
                "./async.js": 3,
                "./errors.js": 10,
                "./util.js": 36
            }],
            20: [function(e, t, n) {
                function i(e) {
                    e !== void 0 ? (this._bitField = e._bitField, this._resolvedValue = e.isResolved() ? e._resolvedValue : void 0) : (this._bitField = 0, this._resolvedValue = void 0)
                }
                var r = e("./errors.js").TypeError;
                i.prototype.isFulfilled = function() {
                    return (this._bitField & 268435456) > 0
                }, i.prototype.isRejected = function() {
                    return (this._bitField & 134217728) > 0
                }, i.prototype.isPending = function() {
                    return (this._bitField & 402653184) === 0
                }, i.prototype.value = function() {
                    if (!this.isFulfilled()) throw new r("cannot get fulfillment value of a non-fulfilled promise");
                    return this._resolvedValue
                }, i.prototype.error = function() {
                    if (!this.isRejected()) throw new r("cannot get rejection reason of a non-rejected promise");
                    return this._resolvedValue
                }, t.exports = i
            }, {
                "./errors.js": 10
            }],
            21: [function(e, t, n) {
                function l(e) {
                    return e instanceof Error && Object.getPrototypeOf(e) === Error.prototype
                }

                function c(e) {
                    return l(e) ? new u(e) : e
                }

                function h(e) {
                    function t(t, n) {
                        if (t) e.reject(c(i(t)));
                        else {
                            if (arguments.length > 2) {
                                var r = arguments.length,
                                    s = new Array(r - 1);
                                for (var o = 1; o < r; ++o) s[o - 1] = arguments[o];
                                n = s
                            }
                            e.fulfill(n)
                        }
                    }
                    return t
                }
                var r = e("./util.js"),
                    i = r.maybeWrapAsError,
                    s = e("./errors.js"),
                    o = s.TimeoutError,
                    u = s.RejectionError,
                    a = e("./async.js"),
                    f = r.haveGetters,
                    p;
                f ? p = function(t) {
                    this.promise = t
                } : p = function(t) {
                    this.promise = t, this.asCallback = h(this)
                }, f && Object.defineProperty(p.prototype, "asCallback", {
                    get: function() {
                        return h(this)
                    }
                }), p._nodebackForResolver = h, p.prototype.toString = function() {
                    return "[object PromiseResolver]"
                }, p.prototype.fulfill = function(t) {
                    if (this.promise._tryAssumeStateOf(t, !1)) return;
                    a.invoke(this.promise._fulfill, this.promise, t)
                }, p.prototype.reject = function(t) {
                    this.promise._attachExtraTrace(t), a.invoke(this.promise._reject, this.promise, t)
                }, p.prototype.progress = function(t) {
                    a.invoke(this.promise._progress, this.promise, t)
                }, p.prototype.cancel = function() {
                    a.invoke(this.promise.cancel, this.promise, void 0)
                }, p.prototype.timeout = function() {
                    this.reject(new o("timeout"))
                }, p.prototype.isResolved = function() {
                    return this.promise.isResolved()
                }, p.prototype.toJSON = function() {
                    return this.promise.toJSON()
                }, t.exports = p
            }, {
                "./async.js": 3,
                "./errors.js": 10,
                "./util.js": 36
            }],
            22: [function(e, t, n) {
                t.exports = function(t) {
                    function a(e, n, r) {
                        this._resolver = t.pending(r), this._generatorFunction = e, this._receiver = n, this._generator = void 0
                    }
                    var n = e("./errors.js"),
                        r = n.TypeError,
                        i = n.ensureNotHandled,
                        s = e("./util.js"),
                        o = s.errorObj,
                        u = s.tryCatch1;
                    return a.prototype.promise = function() {
                        return this._resolver.promise
                    }, a.prototype._run = function() {
                        this._generator = this._generatorFunction.call(this._receiver), this._receiver = this._generatorFunction = void 0, this._next(void 0)
                    }, a.prototype._continue = function f(e) {
                        if (e === o) {
                            this._generator = void 0, this._resolver.reject(e.e);
                            return
                        }
                        var n = e.value;
                        if (e.done === !0) this._generator = void 0, this._resolver.fulfill(n);
                        else {
                            var i = t._cast(n, f);
                            if (!(i instanceof t)) {
                                this._throw(new r("A value was yielded that could not be treated as a promise"));
                                return
                            }
                            i._then(this._next, this._throw, void 0, this, null, void 0)
                        }
                    }, a.prototype._throw = function(t) {
                        i(t), this.promise()._attachExtraTrace(t), this._continue(u(this._generator["throw"], this._generator, t))
                    }, a.prototype._next = function(t) {
                        this._continue(u(this._generator.next, this._generator, t))
                    }, a
                }
            }, {
                "./errors.js": 10,
                "./util.js": 36
            }],
            23: [function(e, t, n) {
                t.exports = function(t) {
                    function p(e, r, i) {
                        function o(t) {
                            var i = new Array(t);
                            for (var s = 0, o = i.length; s < o; ++s) i[s] = "a" + (s + 1);
                            var u = t > 0 ? "," : "";
                            return typeof e == "string" && r === n ? "this['" + e + "'](" + i.join(",") + u + " fn);" + "break;" : (r === void 0 ? "callback(" + i.join(",") + u + " fn);" : "callback.call(" + (r === n ? "this" : "receiver") + ", " + i.join(",") + u + " fn);") + "break;"
                        }

                        function f() {
                            return "var args = new Array( len + 1 );var i = 0;for( var i = 0; i < len; ++i ) {    args[i] = arguments[i];}args[i] = fn;"
                        }
                        var l = typeof i == "string" ? i + "Async" : "promisified";
                        return (new Function("Promise", "callback", "receiver", "withAppended", "maybeWrapAsError", "nodebackForResolver", "var ret = function " + l + '( a1, a2, a3, a4, a5 ) {"use strict";' + "var len = arguments.length;" + "var resolver = Promise.pending( " + l + " );" + "var fn = nodebackForResolver( resolver );" + "try{" + "switch( len ) {" + "case 1:" + o(1) + "case 2:" + o(2) + "case 3:" + o(3) + "case 0:" + o(0) + "case 4:" + o(4) + "case 5:" + o(5) + "default: " + f() + (typeof e == "string" ? "this['" + e + "'].apply(" : "callback.apply(") + (r === n ? "this" : "receiver") + ", args ); break;" + "}" + "}" + "catch(e){ " + "" + "resolver.reject( maybeWrapAsError( e ) );" + "}" + "return resolver.promise;" + "" + "}; ret.__isPromisified__ = true; return ret;"))(t, e, r, u, a, s)
                    }

                    function d(e, r) {
                        function i() {
                            var o = r;
                            r === n && (o = this), typeof e == "string" && (e = o[e]);
                            var f = t.pending(i),
                                l = s(f);
                            try {
                                e.apply(o, u(arguments, l))
                            } catch (c) {
                                f.reject(a(c))
                            }
                            return f.promise
                        }
                        return i.__isPromisified__ = !0, i
                    }

                    function m() {}

                    function g(e) {
                        return e.__isPromisified__ === !0
                    }

                    function w(e, t, r) {
                        if (r) {
                            var i = 0,
                                s = {};
                            for (var o in e)
                                if (!b.test(o) && !y.call(e, o + "__beforePromisified__") && typeof e[o] == "function") {
                                    var u = e[o];
                                    if (!g(u)) {
                                        i++;
                                        var a = o + "__beforePromisified__",
                                            f = o + "Async";
                                        l(e, a, u), s[f] = v(a, n, o)
                                    }
                                }
                            if (i > 0) {
                                for (var o in s) y.call(s, o) && (e[o] = s[o]);
                                m.prototype = e
                            }
                            return e
                        }
                        return v(e, t, void 0)
                    }
                    var n = {},
                        r = e("./util.js"),
                        i = e("./errors.js"),
                        s = e("./promise_resolver.js")._nodebackForResolver,
                        o = i.RejectionError,
                        u = r.withAppended,
                        a = r.maybeWrapAsError,
                        f = r.canEvaluate,
                        l = r.notEnumerableProp,
                        c = r.deprecated,
                        h = e("./assert.js");
                    t.prototype.error = function(e) {
                        return this.caught(o, e)
                    };
                    var v = f ? p : d,
                        y = {}.hasOwnProperty,
                        b = new RegExp("__beforePromisified__$");
                    t.promisify = function(t, r) {
                        if (typeof t == "object" && t !== null) return c("Promise.promisify for promisifying entire objects is deprecated. Use Promise.promisifyAll instead."), w(t, r, !0);
                        if (typeof t != "function") throw new TypeError("callback must be a function");
                        return g(t) ? t : w(t, arguments.length < 2 ? n : r, !1)
                    }, t.promisifyAll = function(t) {
                        if (typeof t != "function" && typeof t != "object") throw new TypeError("Cannot promisify " + typeof t);
                        return w(t, void 0, !0)
                    }
                }
            }, {
                "./assert.js": 2,
                "./errors.js": 10,
                "./promise_resolver.js": 21,
                "./util.js": 36
            }],
            24: [function(e, t, n) {
                t.exports = function(t, n) {
                    function o(e, t, n) {
                        var r = Object.keys(e),
                            i = new Array(r.length);
                        for (var s = 0, o = i.length; s < o; ++s) i[s] = e[r[s]];
                        this.constructor$(i, t, n);
                        if (!this._isResolved())
                            for (var s = 0, o = r.length; s < o; ++s) i.push(r[s])
                    }
                    var r = e("./assert.js"),
                        i = e("./util.js"),
                        s = i.inherits;
                    return s(o, n), o.prototype._init = function() {
                        this._init$(void 0, 2)
                    }, o.prototype._promiseFulfilled = function(t, n) {
                        if (this._isResolved()) return;
                        this._values[n] = t;
                        var r = ++this._totalResolved;
                        if (r >= this._length) {
                            var i = {},
                                s = this.length();
                            for (var o = 0, u = this.length(); o < u; ++o) i[this._values[o + s]] = this._values[o];
                            this._fulfill(i)
                        }
                    }, o.prototype._promiseProgressed = function(t, n) {
                        if (this._isResolved()) return;
                        this._resolver.progress({
                            key: this._values[n + this.length()],
                            value: t
                        })
                    }, n.PropertiesPromiseArray = o, o
                }
            }, {
                "./assert.js": 2,
                "./util.js": 36
            }],
            25: [function(e, t, n) {
                t.exports = function(t, n) {
                    function o(e, n, i) {
                        var o;
                        return s(e) ? o = t.fulfilled(e, i) : t.is(e) ? o = e._then(t.props, void 0, void 0, void 0, void 0, i) : (o = (new r(e, i, n === !0 ? e._boundTo : void 0)).promise(), n = !1), n === !0 && (o._boundTo = e._boundTo), o
                    }
                    var r = e("./properties_promise_array.js")(t, n),
                        i = e("./util.js"),
                        s = i.isPrimitive;
                    t.prototype.props = function() {
                        return o(this, !0, this.props)
                    }, t.props = function(n) {
                        return o(n, !1, t.props)
                    }
                }
            }, {
                "./properties_promise_array.js": 24,
                "./util.js": 36
            }],
            26: [function(e, t, n) {
                function i(e, t, n, r, i) {
                    for (var s = 0; s < i; ++s) n[s + r] = e[s + t]
                }

                function s(e) {
                    return e >>>= 0, e -= 1, e |= e >> 1, e |= e >> 2, e |= e >> 4, e |= e >> 8, e |= e >> 16, e + 1
                }

                function o(e) {
                    return typeof e != "number" ? 16 : s(Math.min(Math.max(16, e), 1073741824))
                }

                function u(e) {
                    this._capacity = o(e), this._length = 0, this._front = 0, this._makeCapacity()
                }
                var r = e("./assert.js");
                u.prototype._willBeOverCapacity = function(t) {
                    return this._capacity < t
                }, u.prototype._pushOne = function(t) {
                    var n = this.length();
                    this._checkCapacity(n + 1);
                    var r = this._front + n & this._capacity - 1;
                    this[r] = t, this._length = n + 1
                }, u.prototype.push = function(t, n, r) {
                    var i = this.length() + 3;
                    if (this._willBeOverCapacity(i)) {
                        this._pushOne(t), this._pushOne(n), this._pushOne(r);
                        return
                    }
                    var s = this._front + i - 3;
                    this._checkCapacity(i);
                    var o = this._capacity - 1;
                    this[s + 0 & o] = t, this[s + 1 & o] = n, this[s + 2 & o] = r, this._length = i
                }, u.prototype.shift = function() {
                    var t = this._front,
                        n = this[t];
                    return this[t] = void 0, this._front = t + 1 & this._capacity - 1, this._length--, n
                }, u.prototype.length = function() {
                    return this._length
                }, u.prototype._makeCapacity = function() {
                    var t = this._capacity;
                    for (var n = 0; n < t; ++n) this[n] = void 0
                }, u.prototype._checkCapacity = function(t) {
                    this._capacity < t && this._resizeTo(this._capacity << 3)
                }, u.prototype._resizeTo = function(t) {
                    var n = this._front,
                        r = this._capacity,
                        s = new Array(r),
                        o = this.length();
                    i(this, 0, s, 0, r), this._capacity = t, this._makeCapacity(), this._front = 0;
                    if (n + o <= r) i(s, n, this, 0, o);
                    else {
                        var u = o - (n + o & r - 1);
                        i(s, n, this, 0, u), i(s, 0, this, u, o - u)
                    }
                }, t.exports = u
            }, {
                "./assert.js": 2
            }],
            27: [function(e, t, n) {
                t.exports = function(t, n, r) {
                    function s(e, t, r) {
                        return n(e, i, r, t === !0 ? e._boundTo : void 0).promise()
                    }
                    var i = e("./race_promise_array.js")(t, r);
                    t.race = function(n) {
                        return s(n, !1, t.race)
                    }, t.prototype.race = function() {
                        return s(this, !0, this.race)
                    }
                }
            }, {
                "./race_promise_array.js": 28
            }],
            28: [function(e, t, n) {
                t.exports = function(t, n) {
                    function s(e, t, n) {
                        this.constructor$(e, t, n)
                    }
                    var r = e("./util.js"),
                        i = r.inherits;
                    return i(s, n), s.prototype._init = function() {
                        this._init$(void 0, 0)
                    }, s.prototype._promiseFulfilled = function(t) {
                        if (this._isResolved()) return;
                        this._fulfill(t)
                    }, s.prototype._promiseRejected = function(t) {
                        if (this._isResolved()) return;
                        this._reject(t)
                    }, s
                }
            }, {
                "./util.js": 36
            }],
            29: [function(e, t, n) {
                t.exports = function(t, n, r, i) {
                    function o(e, t) {
                        var n = this,
                            r = void 0;
                        typeof n != "function" && (r = n.receiver, n = n.fn);
                        var i = e.length,
                            s = void 0,
                            o = 0;
                        if (t !== void 0) s = t, o = 0;
                        else {
                            o = 1;
                            if (i > 0)
                                for (var u = 0; u < i; ++u) {
                                    if (e[u] !== void 0 || u in e) {
                                        s = e[u], o = u + 1;
                                        break
                                    }
                                    continue
                                }
                        }
                        if (r === void 0)
                            for (var u = o; u < i; ++u) {
                                if (!(e[u] !== void 0 || u in e)) continue;
                                s = n(s, e[u], u, i)
                            } else
                                for (var u = o; u < i; ++u) {
                                    if (!(e[u] !== void 0 || u in e)) continue;
                                    s = n.call(r, s, e[u], u, i)
                                }
                        return s
                    }

                    function u(e) {
                        var t = this.fn,
                            n = this.initialValue;
                        return o.call(t, e, n)
                    }

                    function a(e, t, n, r, i) {
                        return n._then(function s(n) {
                            return f(e, t, n, r, s)
                        }, void 0, void 0, void 0, void 0, i)
                    }

                    function f(e, s, f, l, c) {
                        if (typeof s != "function") return i("fn is not a function");
                        l === !0 && (s = {
                            fn: s,
                            receiver: e._boundTo
                        });
                        if (f !== void 0) {
                            if (t.is(f)) {
                                if (!f.isFulfilled()) return a(e, s, f, l, c);
                                f = f._resolvedValue
                            }
                            return n(e, r, c, l === !0 ? e._boundTo : void 0).promise()._then(u, void 0, void 0, {
                                fn: s,
                                initialValue: f
                            }, void 0, t.reduce)
                        }
                        return n(e, r, c, l === !0 ? e._boundTo : void 0).promise()._then(o, void 0, void 0, s, void 0, c)
                    }
                    var s = e("./assert.js");
                    t.reduce = function(n, r, i) {
                        return f(n, r, i, !1, t.reduce)
                    }, t.prototype.reduce = function(t, n) {
                        return f(this, t, n, !0, this.reduce)
                    }
                }
            }, {
                "./assert.js": 2
            }],
            30: [function(e, t, n) {
                var r = e("./global.js"),
                    i = e("./assert.js"),
                    s;
                if (typeof process != "undefined" && process !== null && typeof process.cwd == "function") typeof r.setImmediate != "undefined" ? s = function(t) {
                    r.setImmediate(t)
                } : s = function(t) {
                    process.nextTick(t)
                };
                else if (typeof MutationObserver != "function" && typeof WebkitMutationObserver != "function" && typeof WebKitMutationObserver != "function" || typeof document == "undefined" || typeof document.createElement != "function")
                    if (typeof r.postMessage == "function" && typeof r.importScripts != "function" && typeof r.addEventListener == "function" && typeof r.removeEventListener == "function") {
                        var o = "bluebird_message_key_" + Math.random();
                        s = function() {
                            function t(t) {
                                if (t.source === r && t.data === o) {
                                    var n = e;
                                    e = void 0, n()
                                }
                            }
                            var e = void 0;
                            return r.addEventListener("message", t, !1),
                                function(n) {
                                    e = n, r.postMessage(o, "*")
                                }
                        }()
                    } else typeof MessageChannel == "function" ? s = function() {
                        var e = void 0,
                            t = new MessageChannel;
                        return t.port1.onmessage = function() {
                                var n = e;
                                e = void 0, n()
                            },
                            function(r) {
                                e = r, t.port2.postMessage(null)
                            }
                    }() : r.setTimeout ? s = function(t) {
                        setTimeout(t, 4)
                    } : s = function(t) {
                        t()
                    };
                else s = function() {
                    var e = r.MutationObserver || r.WebkitMutationObserver || r.WebKitMutationObserver,
                        t = document.createElement("div"),
                        n = void 0,
                        i = new e(function() {
                            var t = n;
                            n = void 0, t()
                        }),
                        s = !0;
                    return i.observe(t, {
                            attributes: !0,
                            childList: !0,
                            characterData: !0
                        }),
                        function(r) {
                            n = r, s = !s, t.setAttribute("class", s ? "foo" : "bar")
                        }
                }();
                t.exports = s
            }, {
                "./assert.js": 2,
                "./global.js": 14
            }],
            31: [function(e, t, n) {
                t.exports = function(t, n, r) {
                    function s(e, t, r) {
                        return n(e, i, r, t === !0 ? e._boundTo : void 0).promise()
                    }
                    var i = e("./settled_promise_array.js")(t, r);
                    t.settle = function(n) {
                        return s(n, !1, t.settle)
                    }, t.prototype.settle = function() {
                        return s(this, !0, this.settle)
                    }
                }
            }, {
                "./settled_promise_array.js": 32
            }],
            32: [function(e, t, n) {
                t.exports = function(t, n) {
                    function u(e, t, n) {
                        this.constructor$(e, t, n)
                    }
                    var r = e("./assert.js"),
                        i = e("./promise_inspection.js"),
                        s = e("./util.js"),
                        o = s.inherits;
                    return o(u, n), u.prototype._promiseResolved = function(t, n) {
                        this._values[t] = n;
                        var r = ++this._totalResolved;
                        r >= this._length && this._fulfill(this._values)
                    }, u.prototype._promiseFulfilled = function(t, n) {
                        if (this._isResolved()) return;
                        var r = new i;
                        r._bitField = 268435456, r._resolvedValue = t, this._promiseResolved(n, r)
                    }, u.prototype._promiseRejected = function(t, n) {
                        if (this._isResolved()) return;
                        var r = new i;
                        r._bitField = 134217728, r._resolvedValue = t, this._promiseResolved(n, r)
                    }, u
                }
            }, {
                "./assert.js": 2,
                "./promise_inspection.js": 20,
                "./util.js": 36
            }],
            33: [function(e, t, n) {
                t.exports = function(t, n, r, i) {
                    function u(e, t, r, o) {
                        if ((t | 0) !== t) return i("howMany must be an integer");
                        var u = n(e, s, o, r === !0 ? e._boundTo : void 0);
                        return u.setHowMany(t), u.promise()
                    }
                    var s = e("./some_promise_array.js")(r),
                        o = e("./assert.js");
                    t.some = function(n, r) {
                        return u(n, r, !1, t.some)
                    }, t.prototype.some = function(t) {
                        return u(this, t, !0, this.some)
                    }
                }
            }, {
                "./assert.js": 2,
                "./some_promise_array.js": 34
            }],
            34: [function(e, t, n) {
                t.exports = function(t) {
                    function s(e, t, n) {
                        this.constructor$(e, t, n), this._howMany = 0, this._unwrap = !1
                    }
                    var n = e("./util.js"),
                        r = n.inherits,
                        i = n.isArray;
                    return r(s, t), s.prototype._init = function() {
                        this._init$(void 0, 1);
                        var t = i(this._values);
                        this._holes = t ? this._values.length - this.length() : 0, !this._isResolved() && t && (this._howMany = Math.max(0, Math.min(this._howMany, this.length())), this.howMany() > this._canPossiblyFulfill() && this._reject([]))
                    }, s.prototype.setUnwrap = function() {
                        this._unwrap = !0
                    }, s.prototype.howMany = function() {
                        return this._howMany
                    }, s.prototype.setHowMany = function(t) {
                        if (this._isResolved()) return;
                        this._howMany = t
                    }, s.prototype._promiseFulfilled = function(t) {
                        if (this._isResolved()) return;
                        this._addFulfilled(t), this._fulfilled() === this.howMany() && (this._values.length = this.howMany(), this.howMany() === 1 && this._unwrap ? this._fulfill(this._values[0]) : this._fulfill(this._values))
                    }, s.prototype._promiseRejected = function(t) {
                        if (this._isResolved()) return;
                        this._addRejected(t), this.howMany() > this._canPossiblyFulfill() && (this._values.length === this.length() ? this._reject([]) : this._reject(this._values.slice(this.length() + this._holes)))
                    }, s.prototype._fulfilled = function() {
                        return this._totalResolved
                    }, s.prototype._rejected = function() {
                        return this._values.length - this.length() - this._holes
                    }, s.prototype._addRejected = function(t) {
                        this._values.push(t)
                    }, s.prototype._addFulfilled = function(t) {
                        this._values[this._totalResolved++] = t
                    }, s.prototype._canPossiblyFulfill = function() {
                        return this.length() - this._rejected()
                    }, s
                }
            }, {
                "./util.js": 36
            }],
            35: [function(e, t, n) {
                t.exports = function(t) {
                    var n = e("./promise_inspection.js");
                    t.prototype.inspect = function() {
                        return new n(this)
                    }
                }
            }, {
                "./promise_inspection.js": 20
            }],
            36: [function(e, t, n) {
                function a(e) {
                    typeof console != "undefined" && console !== null && typeof console.warn == "function" && console.warn("Bluebird: " + e)
                }

                function c(e, t, n) {
                    try {
                        return e.call(t, n)
                    } catch (r) {
                        return l.e = r, l
                    }
                }

                function h(e, t, n, r) {
                    try {
                        return e.call(t, n, r)
                    } catch (i) {
                        return l.e = i, l
                    }
                }

                function p(e, t, n) {
                    try {
                        return e.apply(n, t)
                    } catch (r) {
                        return l.e = r, l
                    }
                }

                function v(e) {
                    return typeof e == "string" ? e : "" + e
                }

                function m(e) {
                    return e == null || e === !0 || e === !1 || typeof e == "string" || typeof e == "number"
                }

                function g(e) {
                    return !m(e)
                }

                function y(e) {
                    return m(e) ? new Error(v(e)) : e
                }

                function b(e, t) {
                    var n = e.length,
                        r = new Array(n + 1),
                        i;
                    for (i = 0; i < n; ++i) r[i] = e[i];
                    return r[i] = t, r
                }

                function w(e, t, n) {
                    var r = {
                        value: n,
                        configurable: !0,
                        enumerable: !1,
                        writable: !0
                    };
                    return Object.defineProperty(e, t, r), e
                }
                var r = e("./global.js"),
                    i = e("./assert.js"),
                    s = function() {
                        try {
                            var e = {};
                            return Object.defineProperty(e, "f", {
                                get: function() {
                                    return 3
                                }
                            }), e.f === 3
                        } catch (t) {
                            return !1
                        }
                    }(),
                    o = function(e, t, n) {
                        try {
                            return w(e, t, n), e
                        } catch (r) {
                            var i = {},
                                s = Object.keys(e);
                            for (var o = 0, u = s.length; o < u; ++o) try {
                                var a = s[o];
                                i[a] = e[a]
                            } catch (f) {
                                i[a] = f
                            }
                            return w(i, t, n), i
                        }
                    },
                    u = function() {
                        return typeof window != "undefined" && window !== null && typeof window.document != "undefined" && typeof navigator != "undefined" && navigator !== null && typeof navigator.appName == "string" && window === r ? !1 : !0
                    }(),
                    f = Array.isArray || function(e) {
                        return e instanceof Array
                    },
                    l = {
                        e: {}
                    },
                    d = function(e, t) {
                        function r() {
                            this.constructor = e, this.constructor$ = t;
                            for (var r in t.prototype) n.call(t.prototype, r) && r.charAt(r.length - 1) !== "$" && (this[r + "$"] = t.prototype[r])
                        }
                        var n = {}.hasOwnProperty;
                        return r.prototype = t.prototype, e.prototype = new r, e.prototype
                    };
                t.exports = {
                    isArray: f,
                    haveGetters: s,
                    notEnumerableProp: w,
                    isPrimitive: m,
                    isObject: g,
                    ensurePropertyExpansion: o,
                    canEvaluate: u,
                    deprecated: a,
                    errorObj: l,
                    tryCatch1: c,
                    tryCatch2: h,
                    tryCatchApply: p,
                    inherits: d,
                    withAppended: b,
                    asString: v,
                    maybeWrapAsError: y
                }
            }, {
                "./assert.js": 2,
                "./global.js": 14
            }]
        }, {}, [4])(4)
    }), define("utils/promise", ["require", "exports", "promise"], function(e, t, n) {
        var r = n,
            i;
        return function(e) {
            function t(e) {
                return function(t) {
                    return new r(function(n, r) {
                        setTimeout(function() {
                            n(t)
                        }, e)
                    })
                }
            }

            function n(e) {
                return new r(function(t, n) {
                    requirejs([e], function(e) {
                        t(e)
                    }, function(e) {
                        n(e)
                    })
                })
            }

            function i(e) {
                return new r(function(t, n) {
                    var r = new FileReader;
                    r.onload = function() {
                        var e = r.result;
                        t(e)
                    }, r.onerror = function(e) {
                        n(e)
                    }, r.readAsArrayBuffer(e)
                })
            }

            function s(e, t) {
                typeof t == "undefined" && (t = {});
                var n = r.pending(),
                    i = new XMLHttpRequest;
                i.open("GET", e), i.responseType = "arraybuffer";
                for (var s in t) t.hasOwnProperty(s) && i.setRequestHeader(s, t[s]);
                i.onload = function(e) {
                    if (i.readyState !== 4 || !i.response) {
                        n.reject({
                            status: i.status,
                            statusText: i.statusText
                        });
                        return
                    }
                    n.progress({
                        message: "Downloading ...",
                        progress: 100
                    });
                    var t = i.response;
                    n.fulfill(t)
                }, i.onprogress = function(e) {
                    if (e.lengthComputable) {
                        var t = Math.round(e.loaded / e.total * 100);
                        n.progress({
                            message: "Downloading ...",
                            progress: t
                        })
                    }
                }, i.onerror = function(e) {
                    n.reject(e)
                }, i.send();
                var o = n.promise.catch(r.CancellationError, function(e) {
                    return i.abort(), r.rejected(e)
                });
                return o
            }
            e.wait = t, e.require = n, e.readFileAsArrayBuffer = i, e.getArrayBufferByXHR = s
        }(i || (i = {})), i
    });
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("models/progress", ["require", "exports", "backbone"], function(e, t, n) {
    var r = n,
        i;
    (function(e) {
        function t() {
            return new s
        }
        e.create = t
    })(i || (i = {}));
    var s = function(e) {
        function t() {
            e.apply(this, arguments)
        }
        return __extends(t, e), t.prototype.defaults = function() {
            return {
                message: "",
                progress: 0,
                done: !1
            }
        }, t.prototype.message = function() {
            return this.get("message")
        }, t.prototype.progress = function() {
            return this.get("progress")
        }, t.prototype.done = function() {
            return this.get("done")
        }, t.prototype.update = function(e) {
            this.set(e)
        }, t
    }(r.Model);
    return i
}), define("models/unarchiver", ["require", "exports", "promise", "utils/promise", "models/progress"], function(e, t, n, r, i) {
    var s = n,
        o = r,
        u = i,
        a;
    (function(e) {
        function t(e) {
            return new l(e)
        }
        e.createFactory = t
    })(a || (a = {}));
    var f;
    (function(e) {
        e[e.Pdf = 0] = "Pdf", e[e.Zip = 1] = "Zip", e[e.Rar = 2] = "Rar", e[e.Other = 3] = "Other"
    })(f || (f = {}));
    var l = function() {
        function e(e) {
            this._setting = e
        }
        return e.prototype.getUnarchiverFromFile = function(e) {
            var t = window.URL.createObjectURL(e),
                n = {
                    mimeType: e.type
                };
            return this.getUnarchiverFromURL(t, n)
        }, e.prototype.getUnarchiverFromURL = function(e, t) {
            typeof t == "undefined" && (t = {});
            var n = this,
                r = f.Other;
            if ("mimeType" in t) switch (t.mimeType) {
                case "application/pdf":
                    r = f.Pdf;
                    break;
                case "application/zip":
                case "application/x-zip":
                    r = f.Zip;
                    break;
                case "application/rar":
                case "application/x-rar":
                case "application/x-rar-compressed":
                    r = f.Rar;
                    break;
                default:
            }
            if (r === f.Other) {
                var i = e.split("?").shift().split(".").pop();
                t.name && (i = t.name.split("?").shift().split(".").pop());
                switch (i) {
                    case "pdf":
                        r = f.Pdf;
                        break;
                    case "zip":
                    case "cbz":
                        r = f.Zip;
                        break;
                    case "rar":
                    case "cbr":
                        r = f.Rar;
                        break;
                    default:
                }
            }
            var u = "";
            switch (r) {
                case f.Pdf:
                    var u = "models/pdf_unarchiver";
                    break;
                case f.Zip:
                    var u = "models/zip_unarchiver";
                    break;
                case f.Rar:
                    var u = "models/rar_unarchiver";
                    break;
                default:
                    var a = t.name ? t.name : e;
                    return s.rejected({
                        message: "Unsupported File Format: " + a
                    })
            }
            return o.require(u).then(function(r) {
                return r.createFromURL(e, n._setting, t)
            })
        }, e
    }();
    return a
}), define("models/page", ["require", "exports"], function(e, t) {
    var n;
    return function(e) {
        function t(e, t, n) {
            return {
                name: function() {
                    return e
                },
                pageNum: function() {
                    return t
                },
                content: n
            }
        }
        e.createPage = t
    }(n || (n = {})), n
}), define("collections/pages", ["require", "exports", "models/page"], function(e, t, n) {
    var r = n,
        i;
    return function(e) {
        function t(e) {
            return {
                length: e.length,
                at: function(t) {
                    return e[t]
                }
            }
        }
        e.createCollection = t
    }(i || (i = {})), i
}), define("models/book", ["require", "exports", "promise", "models/unarchiver", "models/page", "collections/pages"], function(e, t, n, r, i, s) {
    var o = n,
        u = r,
        a = i,
        f = s,
        l;
    (function(e) {
        function t(e) {
            return new c(e)
        }
        e.createFactory = t
    })(l || (l = {}));
    var c = function() {
        function e(e) {
            this.unarchiverFactory = e
        }
        return e.prototype.createFromURL = function(e, t) {
            return this.unarchiverFactory.getUnarchiverFromURL(e, t).then(function(e) {
                var t = e.filenames();
                if (t.length === 0) throw {
                    message: "Image file not found"
                };
                var n = [];
                for (var r = 0, i = t.length; r < i; ++r)(function(t) {
                    n.push(a.createPage(t, r + 1, function() {
                        return e.unpack(t)
                    }))
                })(t[r]);
                var s = f.createCollection(n);
                return {
                    title: function() {
                        return e.archiveName()
                    },
                    close: function() {
                        e.close()
                    },
                    pages: function() {
                        return s
                    }
                }
            })
        }, e
    }();
    return l
}), define("models/sort", ["require", "exports", "models/book", "models/page", "collections/pages"], function(e, t, n, r, i) {
    function f(e, t) {
        return e > t ? 1 : e < t ? -1 : 0
    }

    function l(e, t) {
        var n = [],
            r = [];
        e.replace(/(\d+)|(\D+)/g, function(e, t, r) {
            return n.push({
                num: t || 0,
                str: r || ""
            }), ""
        }), t.replace(/(\d+)|(\D+)/g, function(e, t, n) {
            return r.push({
                num: t || 0,
                str: n || ""
            }), ""
        });
        while (n.length > 0 && r.length > 0) {
            var i = n.shift(),
                s = r.shift(),
                o = i.num - s.num || f(i.str, s.str);
            if (o) return o
        }
        return n.length - r.length
    }
    var s = n,
        o = r,
        u = i,
        a;
    (function(e) {
        function n() {
            return new c
        }(function(e) {
            e[e.NameDictionary = 0] = "NameDictionary", e[e.NameNatural = 1] = "NameNatural", e[e.Entry = 2] = "Entry"
        })(e.Order || (e.Order = {}));
        var t = e.Order;
        e.createPageSorter = n
    })(a || (a = {}));
    var c = function() {
        function e() {}
        return e.prototype.sort = function(e, t) {
            var n = [],
                r = e.pages();
            for (var i = 0, s = r.length; i < s; ++i) n.push(r.at(i));
            switch (t.order()) {
                case a.Order.NameNatural:
                    n.sort(function(e, t) {
                        return l(e.name(), t.name())
                    });
                    break;
                case a.Order.NameDictionary:
                    n.sort(function(e, t) {
                        return f(e.name(), t.name())
                    });
                    break;
                default:
            }
            t.reverse() && n.reverse();
            var o = u.createCollection(n);
            return {
                title: function() {
                    return e.title()
                },
                close: function() {
                    e.close()
                },
                pages: function() {
                    return o
                }
            }
        }, e
    }();
    return a
}), define("models/scaler", ["require", "exports", "models/page"], function(e, t, n) {
    var r = n,
        i;
    (function(e) {
        function n(e) {
            return new s(e)
        }(function(e) {
            e[e.AlignVertical = 0] = "AlignVertical"
        })(e.ScaleMode || (e.ScaleMode = {}));
        var t = e.ScaleMode;
        e.create = n
    })(i || (i = {}));
    var s = function() {
        function e(e) {
            this._setting = e
        }
        return e.prototype.scale = function(e, t) {
            e.length === 1 ? this.scaleOnePage(e, t) : this.scaleTwoPage(e, t)
        }, e.prototype.scaleOnePage = function(e, t) {
            var n = e[0],
                r = n.width,
                i = n.height,
                s = Math.min(t.width / r, t.height / i),
                o = Math.floor(s * r),
                u = Math.floor(s * i),
                a = Math.floor((t.height - u) / 2),
                f = Math.floor((t.width - o) / 2);
            n.style.cssText = "position: absolute;top: " + a + "px;" + "left: " + f + "px;" + "width: " + o + "px;" + "height: " + u + "px;"
        }, e.prototype.scaleTwoPage = function(e, t) {
            var n = e[1],
                r = e[0],
                i = n.height,
                s = n.width,
                o = r.height,
                u = r.width,
                a = 1,
                f = i / o,
                l = a * s + f * u,
                c = i,
                h = Math.min(t.width / l, t.height / c),
                p = Math.floor(s * a * h),
                d = Math.floor(i * a * h),
                v = Math.floor(u * f * h),
                m = Math.floor(o * f * h),
                g = Math.floor((t.height - d) / 2),
                y = Math.floor((t.width - p - v) / 2),
                b = Math.floor((t.height - m) / 2),
                w = Math.floor(y + p);
            n.style.cssText = "position: absolute;top: " + g + "px;" + "left: " + y + "px;" + "width: " + p + "px;" + "height: " + d + "px;", r.style.cssText = "position: absolute;top: " + b + "px;" + "left: " + w + "px;" + "width: " + v + "px;" + "height: " + m + "px;"
        }, e
    }();
    return i
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("models/screen", ["require", "exports", "backbone", "promise", "models/page", "collections/pages", "models/scaler"], function(e, t, n, r, i, s, o) {
    var u = n,
        a = r,
        f = i,
        l = s,
        c = o,
        h;
    (function(e) {
        function s(e, t, n) {
            return new p(e, t, n)
        }

        function o(e, t) {
            return {
                create: function(n) {
                    return s(n, e, t)
                }
            }
        }(function(e) {
            e[e.Success = 0] = "Success", e[e.Error = 1] = "Error", e[e.Interrupted = 2] = "Interrupted", e[e.Loading = 3] = "Loading"
        })(e.Status || (e.Status = {}));
        var t = e.Status;
        (function(e) {
            e[e.OnePage = 1] = "OnePage", e[e.TwoPage = 2] = "TwoPage"
        })(e.ViewMode || (e.ViewMode = {}));
        var n = e.ViewMode;
        (function(e) {
            e[e.Forward = 1] = "Forward", e[e.Backward = -1] = "Backward"
        })(e.ReadingDirection || (e.ReadingDirection = {}));
        var r = e.ReadingDirection;
        (function(e) {
            e[e.L2R = 1] = "L2R", e[e.R2L = -1] = "R2L"
        })(e.PageDirection || (e.PageDirection = {}));
        var i = e.PageDirection;
        e.createScreen = s, e.createFactory = o
    })(h || (h = {}));
    var p = function(e) {
        function t(t, n, r) {
            this._builder = n, this._size = t, this._setting = r, this._pages = [], this._pageContents = [], this._previousUpdatePromise = a.fulfilled({}), e.call(this)
        }
        return __extends(t, e), t.prototype.defaults = function() {
            return {
                status: h.Status.Loading,
                content: null
            }
        }, t.prototype.cancel = function() {
            this._previousUpdatePromise.cancel()
        }, t.prototype.updateContent = function(e) {
            this._pageContents = e, this._setting.pageDirection() === h.PageDirection.L2R && (e = e.slice(0), e.reverse()), this._builder.scale(e, this._size), this.trigger("change:content")
        }, t.prototype.status = function() {
            return this.get("status")
        }, t.prototype.content = function() {
            var e = document.createDocumentFragment();
            for (var t = 0, n = this._pageContents.length; t < n; ++t) e.appendChild(this._pageContents[t]);
            return e
        }, t.prototype.setStatus = function(e) {
            this.set("status", e)
        }, t.prototype.pages = function() {
            return this._pages
        }, t.prototype.setPages = function(e) {
            this._pages = e
        }, t.prototype.resize = function(e, t) {
            this._size = {
                width: e,
                height: t
            };
            if (this.status() !== h.Status.Success) return;
            this.updateContent(this._pageContents)
        }, t.prototype.update = function(e, t) {
            var n = this;
            this._previousUpdatePromise.cancel(), this.setStatus(h.Status.Loading);
            var r = !1,
                i = t.currentPageNum,
                s = t.readingDirection,
                o = [],
                u = e.at(i).content().then(function(e) {
                    r = !0, o.push(e)
                }),
                f = [e.at(i)];
            return this._setting.viewMode() === h.ViewMode.TwoPage && (u = u.then(function() {
                var t = o[0],
                    r = i + s;
                return r < 0 || e.length <= r || n._setting.detectsSpreadPage() && n._setting.isSpreadPage(t) ? a.fulfilled(null) : e.at(r).content().then(function(t) {
                    if (!n._setting.detectsSpreadPage() || !n._setting.isSpreadPage(t)) s === h.ReadingDirection.Backward ? (o.unshift(t), f.unshift(e.at(r))) : (o.push(t), f.push(e.at(r)));
                    return a.fulfilled(null)
                })
            })), this._previousUpdatePromise = u.then(function() {
                n._pages = f, n.updateContent(o), n.setStatus(h.Status.Success)
            }).catch(function(e) {
                if (e && e && "name" in e && e.name === "CancellationError") return n.setStatus(h.Status.Error), a.rejected(e);
                n._pages = f, r ? (n.updateContent(o), n.setStatus(h.Status.Interrupted)) : n.setStatus(h.Status.Error)
            }), this._previousUpdatePromise.uncancellable()
        }, t
    }(u.Model);
    return h
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("models/cache", ["require", "exports", "backbone", "promise", "models/screen", "models/page", "collections/pages", "models/unarchiver"], function(e, t, n, r, i, s, o, u) {
    var a = n,
        f = r,
        l = i,
        c = s,
        h = o,
        p = u,
        d;
    (function(e) {
        function t(e, t, n) {
            return new y(e, t, n)
        }

        function n(e, t, n) {
            return new g(e, t, n)
        }
        e.createScreenFactory = t, e.createUnarchiverFactory = n
    })(d || (d = {}));
    var v = function() {
            function e(e) {
                this._cacheSetting = e, this._cache = {}, this._updateNames = []
            }
            return e.prototype.find = function(e) {
                return e in this._cache ? this._cache[e] : null
            }, e.prototype.update = function(e, t) {
                var n = this._cache,
                    r = this._updateNames;
                n[e] = t;
                var i = r.indexOf(e);
                i !== -1 && r.splice(i, 1), r.unshift(e), r = r.slice(0, this._cacheSetting.cachePageNum()), this._updateNames = r;
                var s = [];
                for (var o in n) n.hasOwnProperty(o) && r.indexOf(o) === -1 && s.push(o);
                for (var u = 0, a = s.length; u < a; ++u) delete n[s[u]]
            }, e.prototype.clean = function() {
                this._cache = {}
            }, e
        }(),
        m = function() {
            function e(e, t, n) {
                this._inner = e, this._unarchiverSetting = t, this._cacheSetting = n, this._cache = new v(this._cacheSetting), this._unarchiverSetting.on("change", this._cache.clean, this), this._previousUnpackPromise = f.fulfilled(null)
            }
            return e.prototype.archiveName = function() {
                return this._inner.archiveName()
            }, e.prototype.filenames = function() {
                return this._inner.filenames()
            }, e.prototype.unpack = function(e) {
                var t = this,
                    n = this._cache.find(e);
                return n ? (this._cache.update(e, n), f.fulfilled(n)) : (this._previousUnpackPromise.cancel(), this._previousUnpackPromise = this._inner.unpack(e).then(function(n) {
                    return t._cache.update(e, n), n
                }), this._previousUnpackPromise.uncancellable())
            }, e.prototype.close = function() {
                this._cache.clean(), this._unarchiverSetting.off("change", this._cache.clean, this), this._inner.close()
            }, e
        }(),
        g = function() {
            function e(e, t, n) {
                this._factory = e, this._unarchiverSetting = t, this._cacheSetting = n
            }
            return e.prototype.getUnarchiverFromURL = function(e, t) {
                var n = this;
                return this._factory.getUnarchiverFromURL(e, t).then(function(e) {
                    return new m(e, n._unarchiverSetting, n._cacheSetting)
                })
            }, e.prototype.getUnarchiverFromFile = function(e) {
                var t = this;
                return this._factory.getUnarchiverFromFile(e).then(function(e) {
                    return new m(e, t._unarchiverSetting, t._cacheSetting)
                })
            }, e
        }(),
        y = function() {
            function e(e, t, n) {
                this._innerFactory = e, this._screenSetting = t, this._cacheSetting = n, window.cache = this._cache = new b(this._screenSetting, this._cacheSetting)
            }
            return e.prototype.create = function(e) {
                return new w(e, this._innerFactory, this._cache)
            }, e
        }(),
        b = function() {
            function e(e, t) {
                var n = this;
                this._screenSetting = e, this._cacheSetting = t, this._cacheUsedPages = [], this.initialize(null), this._screenSetting.on("change", function() {
                    n.initialize(null)
                })
            }
            return e.prototype.initialize = function(e) {
                this._cache = {}, this._pages = e
            }, e.prototype.cacheUsed = function(e) {
                var t = this._cacheUsedPages,
                    n = t.indexOf(e);
                n !== -1 && t.splice(n, 1), t.unshift(e), this._cacheUsedPages = t.slice(0, this._cacheSetting.cacheScreenNum());
                var r = [];
                for (var i in this._cache) this._cache.hasOwnProperty(i) && this._cacheUsedPages.indexOf(Number(i)) === -1 && r.push(i);
                for (var s = 0, o = r.length; s < o; ++s) delete this._cache[r[s]]
            }, e.prototype.find = function(e, t) {
                this._pages !== e && this.initialize(e);
                var n = t.currentPageNum,
                    r = t.readingDirection;
                if (String(n) in this._cache && String(r) in this._cache[n]) return this.cacheUsed(n), this._cache[n][r];
                var i = -1 * r | 0;
                if (this._screenSetting.viewMode() === l.ViewMode.OnePage) {
                    if (String(n) in this._cache && String(i) in this._cache[n]) return this.cacheUsed(n), this._cache[n][i]
                } else {
                    var s = n + r;
                    if (0 <= s && s < e.length && String(s) in this._cache && String(i) in this._cache[s] && this._cache[s][i].pages().length === 2) return this.cacheUsed(s), this._cache[s][i]
                }
                return null
            }, e.prototype.removeCacheByPageNum = function(e) {
                var t = e + 1,
                    n = e - 1,
                    r = l.ReadingDirection.Forward,
                    i = l.ReadingDirection.Backward;
                String(t) in this._cache && String(i) in this._cache[t] && this._cache[t][i].pages().length === 2 && delete this._cache[t][i], String(n) in this._cache && String(r) in this._cache[n] && this._cache[n][r].pages().length === 2 && delete this._cache[n][r]
            }, e.prototype.update = function(e, t) {
                var n = t.currentPageNum,
                    r = t.readingDirection,
                    i = e.pages().length;
                this.removeCacheByPageNum(n), i === 2 && this.removeCacheByPageNum(n + r), this._cache[n] = {}, this._cache[n][r] = e, this.cacheUsed(n)
            }, e
        }(),
        w = function(e) {
            function t(t, n, r) {
                this._size = t, this._cache = r, this._factory = n, this._previousUpdatePromise = f.fulfilled({}), this.updateInnerModel(n.create(t)), e.call(this)
            }
            return __extends(t, e), t.prototype.cancel = function() {
                this._innerScreen.cancel(), this._previousUpdatePromise.cancel()
            }, t.prototype.updateInnerModel = function(e) {
                var t = this;
                this.stopListening(this._innerScreen), this._innerScreen = e, this.listenTo(this._innerScreen, "all", function(e) {
                    t.trigger(e)
                })
            }, t.prototype.status = function() {
                return this._innerScreen.status()
            }, t.prototype.content = function() {
                return this._innerScreen.content()
            }, t.prototype.pages = function() {
                return this._innerScreen.pages()
            }, t.prototype.resize = function(e, t) {
                this._size = {
                    width: e,
                    height: t
                }, this._innerScreen.resize(e, t)
            }, t.prototype.update = function(e, t) {
                var n = this;
                this._previousUpdatePromise.cancel();
                var r = this._cache.find(e, t);
                return r !== null ? (this.updateInnerModel(r), this.resize(this._size.width, this._size.height), this.trigger("change"), f.fulfilled({})) : (this.updateInnerModel(this._factory.create(this._size)), this.trigger("change"), this._previousUpdatePromise = this._innerScreen.update(e, t).then(function(e) {
                    return n.status() === l.Status.Success && n._cache.update(n._innerScreen, t), e
                }), this._previousUpdatePromise.uncancellable())
            }, t
        }(a.Model);
    return d
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("collections/screens", ["require", "exports", "promise", "backbone", "models/page", "collections/pages", "models/screen"], function(e, t, n, r, i, s, o) {
    var u = n,
        a = r,
        f = i,
        l = s,
        c = o,
        h;
    (function(e) {
        function t(e, t) {
            return new d(e, t)
        }
        e.create = t
    })(h || (h = {}));
    var p = function(e) {
            function t() {
                e.apply(this, arguments)
            }
            return __extends(t, e), t
        }(a.Collection),
        d = function(e) {
            function t(t, n) {
                this._size = t, this._factory = n, this._currentScreen = this._factory.create(this._size), this._prevScreens = new p, this._nextScreens = new p, this._prevScreens.add(this._factory.create(this._size)), this._nextScreens.add(this._factory.create(this._size)), this._previousUpdatePromise = u.fulfilled(null), e.call(this)
            }
            return __extends(t, e), t.prototype.current = function() {
                return this._currentScreen
            }, t.prototype.prev = function() {
                return this._prevScreens.length > 0 ? this._prevScreens.at(0) : null
            }, t.prototype.next = function() {
                return this._nextScreens.length > 0 ? this._nextScreens.at(0) : null
            }, t.prototype.currentScreen = function() {
                return this._currentScreen
            }, t.prototype.prevScreens = function() {
                return this._prevScreens
            }, t.prototype.nextScreens = function() {
                return this._nextScreens
            }, t.prototype.update = function(e, t) {
                var n = this;
                this._previousUpdatePromise.cancel(), this._currentScreen.cancel();
                for (var r = 0, i = this._prevScreens.length; r < i; ++r) this._prevScreens.at(r).cancel();
                for (var r = 0, i = this._nextScreens.length; r < i; ++r) this._nextScreens.at(r).cancel();
                var s = t.currentPageNum - 1,
                    o = t.currentPageNum + 1;
                s < 0 ? this._prevScreens.reset([]) : this._prevScreens.length === 0 && this._prevScreens.add(this._factory.create(this._size)), e.length <= o ? this._nextScreens.reset([]) : this._nextScreens.length === 0 && this._nextScreens.add(this._factory.create(this._size)), this.trigger("change");
                var a = 1;
                return this._previousUpdatePromise = this._currentScreen.update(e, t).then(function() {
                    a = n._currentScreen.pages().length;
                    if (n._prevScreens.length === 0) return u.fulfilled(null);
                    var r = s;
                    t.readingDirection === c.ReadingDirection.Backward && (r = t.currentPageNum - a);
                    if (r < 0) return n._prevScreens.reset([]), u.fulfilled(null);
                    var i = {
                        currentPageNum: r,
                        readingDirection: c.ReadingDirection.Backward
                    };
                    return n._prevScreens.at(0).update(e, i)
                }).then(function() {
                    if (n._nextScreens.length === 0) return u.fulfilled(null);
                    var r = o;
                    t.readingDirection === c.ReadingDirection.Forward && (r = t.currentPageNum + a);
                    if (e.length <= r) return n._nextScreens.reset([]), u.fulfilled(null);
                    var i = {
                        currentPageNum: r,
                        readingDirection: c.ReadingDirection.Forward
                    };
                    return n._nextScreens.at(0).update(e, i).then(function() {})
                }), this._previousUpdatePromise
            }, t.prototype.resize = function(e, t) {
                this._size = {
                    width: e,
                    height: t
                }, this._currentScreen.resize(e, t), this._prevScreens.each(function(n) {
                    n.resize(e, t)
                }), this._nextScreens.each(function(n) {
                    n.resize(e, t)
                })
            }, t
        }(a.Model);
    return h
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("models/prefetch", ["require", "exports", "backbone", "promise", "utils/promise", "models/page", "collections/pages", "models/screen", "collections/screens"], function(e, t, n, r, i, s, o, u, a) {
    var f = n,
        l = r,
        c = i,
        h = s,
        p = o,
        d = u,
        v = a,
        m;
    (function(e) {
        function t(e, t) {
            return new g(e, t)
        }
        e.createPagePrefetchScreens = t
    })(m || (m = {}));
    var g = function(e) {
        function t(t, n) {
            this._inner = t, this._setting = n, this._prefetchPromise = l.fulfilled(null), e.call(this)
        }
        return __extends(t, e), t.prototype.initialize = function() {
            var e = this;
            this.listenTo(this._inner, "all", function(t) {
                e.trigger(t)
            })
        }, t.prototype.currentScreen = function() {
            return this._inner.currentScreen()
        }, t.prototype.prevScreens = function() {
            return this._inner.prevScreens()
        }, t.prototype.nextScreens = function() {
            return this._inner.nextScreens()
        }, t.prototype.current = function() {
            return this._inner.current()
        }, t.prototype.prev = function() {
            return this._inner.prev()
        }, t.prototype.next = function() {
            return this._inner.next()
        }, t.prototype.update = function(e, t) {
            var n = this;
            this._prefetchPromise.cancel();
            var r = this._inner.update(e, t);
            this._prefetchPromise = r.uncancellable();
            var i = t.currentPageNum,
                s = this._setting.pagePrefetchNum();
            for (var o = i, u = e.length; 0 <= o && o < u && Math.abs(o - i) <= s; o += t.readingDirection)(function(t) {
                n._prefetchPromise = n._prefetchPromise.then(function() {
                    return e.at(t).content()
                }).then(function(e) {}).then(c.wait(1))
            })(o);
            return this._prefetchPromise.catch(function(e) {}), r
        }, t.prototype.resize = function(e, t) {
            this._inner.resize(e, t)
        }, t
    }(f.Model);
    return m
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("models/setting", ["require", "exports", "underscore", "backbone", "models/sort", "models/cache", "models/page", "models/screen", "models/scaler", "models/unarchiver", "models/prefetch"], function(e, t, n, r, i, s, o, u, a, f, l) {
    var c = n,
        h = r,
        p = i,
        d = s,
        v = o,
        m = u,
        g = a,
        y = f,
        b = l,
        w;
    (function(e) {
        function t(e) {
            return new k(e)
        }
        e.create = t
    })(w || (w = {}));
    var E = function(e) {
            function t() {
                e.apply(this, arguments)
            }
            return __extends(t, e), t.prototype.defaults = function() {
                return {
                    detectsSpreadPage: !0,
                    viewMode: m.ViewMode.TwoPage,
                    pageDirection: m.PageDirection.R2L
                }
            }, t.prototype.detectsSpreadPage = function() {
                return this.get("detectsSpreadPage")
            }, t.prototype.viewMode = function() {
                return this.get("viewMode")
            }, t.prototype.pageDirection = function() {
                return this.get("pageDirection")
            }, t.prototype.isSpreadPage = function(e) {
                return e.width > e.height
            }, t.prototype.setDetectsSpreadPage = function(e) {
                this.set("detectsSpreadPage", e)
            }, t.prototype.setViewMode = function(e) {
                this.set("viewMode", e)
            }, t.prototype.setPageDirection = function(e) {
                this.set("pageDirection", e)
            }, t.prototype.toggleViewMode = function() {
                this.viewMode() === m.ViewMode.OnePage ? this.set("viewMode", m.ViewMode.TwoPage) : this.set("viewMode", m.ViewMode.OnePage)
            }, t
        }(h.Model),
        S = function(e) {
            function t() {
                e.apply(this, arguments)
            }
            return __extends(t, e), t.prototype.defaults = function() {
                return {
                    cacheScreenNum: 7,
                    cachePageNum: 25
                }
            }, t.prototype.cacheScreenNum = function() {
                return this.get("cacheScreenNum")
            }, t.prototype.cachePageNum = function() {
                return this.get("cachePageNum")
            }, t.prototype.setCacheScreenNum = function(e) {
                this.set("cacheScreenNum", e)
            }, t.prototype.setCachePageNum = function(e) {
                this.set("cachePageNum", e)
            }, t
        }(h.Model),
        x = function(e) {
            function t() {
                e.apply(this, arguments)
            }
            return __extends(t, e), t.prototype.pagePrefetchNum = function() {
                return 10
            }, t
        }(h.Model),
        T = function(e) {
            function t() {
                e.apply(this, arguments)
            }
            return __extends(t, e), t.prototype.scaleMode = function() {
                return g.ScaleMode.AlignVertical
            }, t
        }(h.Model),
        N = function(e) {
            function t() {
                e.apply(this, arguments)
            }
            return __extends(t, e), t.prototype.pageFileExtensions = function() {
                return ["jpg", "jpeg", "png", "bmp", "gif", "tif", "tiff"]
            }, t.prototype.defaults = function() {
                return {
                    pdfjsCanvasScale: 2,
                    detectsImageXObjectPageInPdf: !0,
                    enablesRangeRequestInPdf: !0
                }
            }, t.prototype.pdfjsCanvasScale = function() {
                return this.get("pdfjsCanvasScale")
            }, t.prototype.detectsImageXObjectPageInPdf = function() {
                return this.get("detectsImageXObjectPageInPdf")
            }, t.prototype.enablesRangeRequestInPdf = function() {
                return this.get("enablesRangeRequestInPdf")
            }, t.prototype.setPdfjsCanvasScale = function(e) {
                this.set("pdfjsCanvasScale", e)
            }, t.prototype.setDetectsImageXObjectPageInPdf = function(e) {
                this.set("detectsImageXObjectPageInPdf", e)
            }, t.prototype.setEnablesRangeRequestInPdf = function(e) {
                this.set("enablesRangeRequestInPdf", e)
            }, t
        }(h.Model),
        C = function(e) {
            function t() {
                e.apply(this, arguments)
            }
            return __extends(t, e), t.prototype.defaults = function() {
                return {
                    order: p.Order.NameNatural,
                    reverse: !1
                }
            }, t.prototype.order = function() {
                return this.get("order")
            }, t.prototype.reverse = function() {
                return this.get("reverse")
            }, t.prototype.setOrder = function(e) {
                this.set("order", e)
            }, t.prototype.setReverse = function(e) {
                this.set("reverse", e)
            }, t
        }(h.Model),
        k = function() {
            function e(e) {
                this._screenSetting = new E, this._scalerSetting = new T, this._unarchiverSetting = new N, this._cacheSetting = new S, this._sortSetting = new C, this._prefetchSetting = new x, "sort.reverse" in e && e["sort.reverse"] !== "false" && this._sortSetting.setReverse(!0);
                if ("sort.order" in e) {
                    var t = p.Order[e["sort.order"]];
                    typeof t != "undefined" && this._sortSetting.setOrder(t)
                }
                if ("unarchiver.pdfjsCanvasScale" in e) {
                    var n = e["unarchiver.pdfjsCanvasScale"] || 1;
                    this._unarchiverSetting.setPdfjsCanvasScale(n)
                }
                "unarchiver.detectsImageXObjectPageInPdf" in e && e["unarchiver.detectsImageXObjectPageInPdf"] !== "false" && this._unarchiverSetting.setDetectsImageXObjectPageInPdf(!0), "unarchiver.enablesRangeRequestInPdf" in e && e["unarchiver.enablesRangeRequestInPdf"] === "false" && this._unarchiverSetting.setEnablesRangeRequestInPdf(!1), "screen.detectsSpreadPage" in e && e["screen.detectsSpreadPage"] !== "false" && this._screenSetting.setDetectsSpreadPage(!0);
                if ("screen.viewMode" in e) {
                    var r = m.ViewMode[e["screen.viewMode"]];
                    typeof r != "undefined" && this._screenSetting.setViewMode(r)
                }
                if ("screen.pageDirection" in e) {
                    var i = m.PageDirection[e["screen.pageDirection"]];
                    typeof i != "undefined" && this._screenSetting.setPageDirection(i)
                }
                if ("cache.cachePageNum" in e) {
                    var s = parseInt(e["cache.cachePageNum"], 10);
                    s && this._cacheSetting.setCachePageNum(s)
                }
                if ("cache.cacheScreenNum" in e) {
                    var s = parseInt(e["cache.cacheScreenNum"], 10);
                    s && this._cacheSetting.setCacheScreenNum(s)
                }
            }
            return e.prototype.screenSetting = function() {
                return this._screenSetting
            }, e.prototype.unarchiverSetting = function() {
                return this._unarchiverSetting
            }, e.prototype.scalerSetting = function() {
                return this._scalerSetting
            }, e.prototype.cacheSetting = function() {
                return this._cacheSetting
            }, e.prototype.sortSetting = function() {
                return this._sortSetting
            }, e.prototype.prefetchSetting = function() {
                return this._prefetchSetting
            }, e
        }();
    return w
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("models/reader", ["require", "exports", "models/screen", "collections/screens", "models/book", "promise", "utils/promise", "models/progress", "models/setting", "models/sort"], function(e, t, n, r, i, s, o, u, a, f) {
    var l = n,
        c = r,
        h = i,
        p = s,
        d = o,
        v = u,
        m = a,
        g = f,
        y;
    (function(e) {
        function n(e, t, n, r) {
            return new b(e, t, n, r)
        }(function(e) {
            e[e.Closed = 0] = "Closed", e[e.Opening = 1] = "Opening", e[e.Opened = 2] = "Opened", e[e.Error = 3] = "Error"
        })(e.Status || (e.Status = {}));
        var t = e.Status;
        e.create = n
    })(y || (y = {}));
    var b = function(e) {
        function t(t, n, r, i) {
            this._bookFactory = t, this._screens = n, this._pageSorter = r, this._setting = i, this._book = null, this._promise = null, this._progress = v.create(), e.call(this)
        }
        return __extends(t, e), t.prototype.initialize = function() {
            var e = this;
            this.listenTo(this._setting.screenSetting(), "change", function() {
                if (!e._book) return;
                e.update(e.currentPageNum(), e.readingDirection())
            })
        }, t.prototype.defaults = function() {
            return {
                status: y.Status.Closed,
                currentPageNum: 0,
                totalPageNum: 0,
                readingDirection: l.ReadingDirection.Forward,
                message: ""
            }
        }, t.prototype.title = function() {
            return this._book !== null ? this._book.title() : ""
        }, t.prototype.status = function() {
            return this.get("status")
        }, t.prototype.message = function() {
            return this.get("message")
        }, t.prototype.currentPageNum = function() {
            return this.get("currentPageNum")
        }, t.prototype.totalPageNum = function() {
            return this.get("totalPageNum")
        }, t.prototype.readingDirection = function() {
            return this.get("readingDirection")
        }, t.prototype.setStatus = function(e) {
            this.set("status", e)
        }, t.prototype.setMessage = function(e) {
            this.set("message", e)
        }, t.prototype.setCurrentPageNum = function(e) {
            this.set("currentPageNum", e)
        }, t.prototype.setTotalPageNum = function(e) {
            this.set("totalPageNum", e)
        }, t.prototype.setReadingDirection = function(e) {
            this.set("readingDirection", e)
        }, t.prototype.progress = function() {
            return this._progress
        }, t.prototype.openFile = function(e) {
            var t = window.URL.createObjectURL(e);
            return this.openURL(t, {
                name: e.name,
                mimeType: e.type
            })
        }, t.prototype.openURL = function(e, t) {
            var n = this;
            return this.close(), this.setStatus(y.Status.Opening), this._progress.update({
                message: "Downloading ...",
                progress: 0,
                done: !1
            }), this._promise = this._bookFactory.createFromURL(e, t).then(function(e) {
                return n._progress.update({
                    progress: 100
                }), n._book = n._pageSorter.sort(e, n._setting.sortSetting()), n.resetReadingInfo(), n.setStatus(y.Status.Opened), n.goToPage(n.currentPageNum()), n._screens
            }).progressed(function(e) {
                n._progress.update(e)
            }).catch(function(e) {
                return e.name === "CancellationError" ? n.setStatus(y.Status.Closed) : (n.setMessage(e.message || e), n.setStatus(y.Status.Error)), p.rejected(e)
            }), this._promise.uncancellable()
        }, t.prototype.close = function() {
            this._book = null, this._promise !== null && this._promise.cancel(), this.setStatus(y.Status.Closed)
        }, t.prototype.goNextScreen = function() {
            if (this.status() !== y.Status.Opened) return;
            var e = this.currentPageNum() + 1;
            if (this.readingDirection() === l.ReadingDirection.Forward) {
                var t = this._screens.currentScreen().pages().length;
                e = this.currentPageNum() + Math.max(1, t)
            }
            if (!this.isValidPageNum(e)) return;
            this.update(e, l.ReadingDirection.Forward)
        }, t.prototype.goPrevScreen = function() {
            if (this.status() !== y.Status.Opened) return;
            var e = this.currentPageNum() - 1;
            if (this.readingDirection() === l.ReadingDirection.Backward) {
                var t = this._screens.currentScreen().pages().length;
                e = this.currentPageNum() - Math.max(1, t)
            }
            if (!this.isValidPageNum(e)) return;
            this.update(e, l.ReadingDirection.Backward)
        }, t.prototype.goToPage = function(e) {
            if (this.status() !== y.Status.Opened) return;
            var t = this._book.pages();
            if (!this.isValidPageNum(e)) return;
            this.update(e, l.ReadingDirection.Forward)
        }, t.prototype.screens = function() {
            return this._screens
        }, t.prototype.resize = function(e, t) {
            if (this.status() !== y.Status.Opened) return;
            this._screens.resize(e, t)
        }, t.prototype.update = function(e, t) {
            this._screens.update(this._book.pages(), {
                currentPageNum: e,
                readingDirection: t
            }).catch(p.CancellationError, function(e) {}), this.setCurrentPageNum(e), this.setReadingDirection(t)
        }, t.prototype.isValidPageNum = function(e) {
            var t = this._book.pages();
            return 0 <= e && e < t.length
        }, t.prototype.resetReadingInfo = function() {
            this.setCurrentPageNum(0), this.setTotalPageNum(this._book.pages().length), this.setReadingDirection(l.ReadingDirection.Forward)
        }, t
    }(Backbone.Model);
    return y
}), define("models/factory", ["require", "exports", "models/setting", "models/unarchiver", "models/reader", "models/book", "models/scaler", "models/screen", "models/cache", "collections/screens", "models/sort", "models/prefetch"], function(e, t, n, r, i, s, o, u, a, f, l, c) {
    var h = n,
        p = r,
        d = i,
        v = s,
        m = o,
        g = u,
        y = a,
        b = f,
        w = l,
        E = c,
        S;
    return function(e) {
        function t(e) {
            return h.create(e)
        }

        function n(e, t) {
            var n = y.createUnarchiverFactory(p.createFactory(t.unarchiverSetting()), t.unarchiverSetting(), t.cacheSetting()),
                r = v.createFactory(n),
                i = m.create(t.scalerSetting()),
                s = y.createScreenFactory(g.createFactory(i, t.screenSetting()), t.screenSetting(), t.cacheSetting()),
                o = E.createPagePrefetchScreens(b.create(e, s), t.prefetchSetting()),
                u = w.createPageSorter(),
                a = d.create(r, o, u, t);
            return a
        }
        e.createSetting = t, e.createReader = n
    }(S || (S = {})), S
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/composite", ["require", "exports", "jquery", "underscore", "backbone", "views/base"], function(e, t, n, r, i, s) {
    var o = n,
        u = r,
        a = i,
        f = s,
        l = function(e) {
            function t(t) {
                this.subViews = {}, e.call(this, t)
            }
            return __extends(t, e), t.prototype.render = function() {
                var t = this;
                return e.prototype.render.call(this), u.each(this.subViews, function(e, n) {
                    e.setElement(t.$(n)).render()
                }), this
            }, t.prototype.assign = function(e, t) {
                e in this.subViews && this.dissociate(e), this.subViews[e] = t
            }, t.prototype.dissociate = function(e) {
                var t = this.subViews[e];
                t && t.close(), delete this.subViews[e]
            }, t.prototype.close = function() {
                e.prototype.close.call(this), u.each(this.subViews, function(e, t) {
                    e.close()
                }), this.subViews = null
            }, t
        }(f);
    return l
});
var IScroll = function(e, t, n) {
    function r(e, n) {
        this.wrapper = "string" == typeof e ? t.querySelector(e) : e, this.scroller = this.wrapper.children[0], this.scrollerStyle = this.scroller.style, this.options = {
            resizeIndicator: !0,
            mouseWheelSpeed: 20,
            snapThreshold: .334,
            startX: 0,
            startY: 0,
            scrollY: !0,
            directionLockThreshold: 5,
            momentum: !0,
            bounce: !0,
            bounceTime: 600,
            bounceEasing: "",
            preventDefault: !0,
            preventDefaultException: {
                tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/
            },
            HWCompositing: !0,
            useTransition: !0,
            useTransform: !0
        };
        for (var r in n) this.options[r] = n[r];
        this.translateZ = this.options.HWCompositing && u.hasPerspective ? " translateZ(0)" : "", this.options.useTransition = u.hasTransition && this.options.useTransition, this.options.useTransform = u.hasTransform && this.options.useTransform, this.options.eventPassthrough = this.options.eventPassthrough === !0 ? "vertical" : this.options.eventPassthrough, this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault, this.options.scrollY = "vertical" == this.options.eventPassthrough ? !1 : this.options.scrollY, this.options.scrollX = "horizontal" == this.options.eventPassthrough ? !1 : this.options.scrollX, this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough, this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold, this.options.bounceEasing = "string" == typeof this.options.bounceEasing ? u.ease[this.options.bounceEasing] || u.ease.circular : this.options.bounceEasing, this.options.resizePolling = void 0 === this.options.resizePolling ? 60 : this.options.resizePolling, this.options.tap === !0 && (this.options.tap = "tap"), this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1, this.x = 0, this.y = 0, this.directionX = 0, this.directionY = 0, this._events = {}, this._init(), this.refresh(), this.scrollTo(this.options.startX, this.options.startY), this.enable()
    }

    function i(e, n, r) {
        var i = t.createElement("div"),
            s = t.createElement("div");
        return r === !0 && (i.style.cssText = "position:absolute;z-index:9999", s.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px"), s.className = "iScrollIndicator", "h" == e ? (r === !0 && (i.style.cssText += ";height:7px;left:2px;right:2px;bottom:0", s.style.height = "100%"), i.className = "iScrollHorizontalScrollbar") : (r === !0 && (i.style.cssText += ";width:7px;bottom:2px;top:2px;right:1px", s.style.width = "100%"), i.className = "iScrollVerticalScrollbar"), n || (i.style.pointerEvents = "none"), i.appendChild(s), i
    }

    function s(n, r) {
        this.wrapper = "string" == typeof r.el ? t.querySelector(r.el) : r.el, this.indicator = this.wrapper.children[0], this.indicatorStyle = this.indicator.style, this.scroller = n, this.options = {
            listenX: !0,
            listenY: !0,
            interactive: !1,
            resize: !0,
            defaultScrollbars: !1,
            speedRatioX: 0,
            speedRatioY: 0
        };
        for (var i in r) this.options[i] = r[i];
        this.sizeRatioX = 1, this.sizeRatioY = 1, this.maxPosX = 0, this.maxPosY = 0, this.options.interactive && (this.options.disableTouch || (u.addEvent(this.indicator, "touchstart", this), u.addEvent(e, "touchend", this)), this.options.disablePointer || (u.addEvent(this.indicator, "MSPointerDown", this), u.addEvent(e, "MSPointerUp", this)), this.options.disableMouse || (u.addEvent(this.indicator, "mousedown", this), u.addEvent(e, "mouseup", this)))
    }
    var o = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame || e.oRequestAnimationFrame || e.msRequestAnimationFrame || function(t) {
            e.setTimeout(t, 1e3 / 60)
        },
        u = function() {
            function r(e) {
                return o === !1 ? !1 : "" === o ? e : o + e.charAt(0).toUpperCase() + e.substr(1)
            }
            var i = {},
                s = t.createElement("div").style,
                o = function() {
                    for (var e, t = ["t", "webkitT", "MozT", "msT", "OT"], n = 0, r = t.length; r > n; n++)
                        if (e = t[n] + "ransform", e in s) return t[n].substr(0, t[n].length - 1);
                    return !1
                }();
            i.getTime = Date.now || function() {
                return (new Date).getTime()
            }, i.extend = function(e, t) {
                for (var n in t) e[n] = t[n]
            }, i.addEvent = function(e, t, n, r) {
                e.addEventListener(t, n, !!r)
            }, i.removeEvent = function(e, t, n, r) {
                e.removeEventListener(t, n, !!r)
            }, i.momentum = function(e, t, r, i, s) {
                var o, u, a = e - t,
                    f = n.abs(a) / r,
                    l = 6e-4;
                return o = e + f * f / (2 * l) * (0 > a ? -1 : 1), u = f / l, i > o ? (o = s ? i - s / 2.5 * (f / 8) : i, a = n.abs(o - e), u = a / f) : o > 0 && (o = s ? s / 2.5 * (f / 8) : 0, a = n.abs(e) + o, u = a / f), {
                    destination: n.round(o),
                    duration: u
                }
            };
            var u = r("transform");
            return i.extend(i, {
                hasTransform: u !== !1,
                hasPerspective: r("perspective") in s,
                hasTouch: "ontouchstart" in e,
                hasPointer: navigator.msPointerEnabled,
                hasTransition: r("transition") in s
            }), i.isAndroidBrowser = /Android/.test(e.navigator.appVersion) && /Version\/\d/.test(e.navigator.appVersion), i.extend(i.style = {}, {
                transform: u,
                transitionTimingFunction: r("transitionTimingFunction"),
                transitionDuration: r("transitionDuration"),
                transformOrigin: r("transformOrigin")
            }), i.hasClass = function(e, t) {
                var n = new RegExp("(^|\\s)" + t + "(\\s|$)");
                return n.test(e.className)
            }, i.addClass = function(e, t) {
                if (!i.hasClass(e, t)) {
                    var n = e.className.split(" ");
                    n.push(t), e.className = n.join(" ")
                }
            }, i.removeClass = function(e, t) {
                if (i.hasClass(e, t)) {
                    var n = new RegExp("(^|\\s)" + t + "(\\s|$)", "g");
                    e.className = e.className.replace(n, " ")
                }
            }, i.offset = function(e) {
                for (var t = -e.offsetLeft, n = -e.offsetTop; e = e.offsetParent;) t -= e.offsetLeft, n -= e.offsetTop;
                return {
                    left: t,
                    top: n
                }
            }, i.preventDefaultException = function(e, t) {
                for (var n in t)
                    if (t[n].test(e[n])) return !0;
                return !1
            }, i.extend(i.eventType = {}, {
                touchstart: 1,
                touchmove: 1,
                touchend: 1,
                mousedown: 2,
                mousemove: 2,
                mouseup: 2,
                MSPointerDown: 3,
                MSPointerMove: 3,
                MSPointerUp: 3
            }), i.extend(i.ease = {}, {
                quadratic: {
                    style: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    fn: function(e) {
                        return e * (2 - e)
                    }
                },
                circular: {
                    style: "cubic-bezier(0.1, 0.57, 0.1, 1)",
                    fn: function(e) {
                        return n.sqrt(1 - --e * e)
                    }
                },
                back: {
                    style: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    fn: function(e) {
                        var t = 4;
                        return (e -= 1) * e * ((t + 1) * e + t) + 1
                    }
                },
                bounce: {
                    style: "",
                    fn: function(e) {
                        return (e /= 1) < 1 / 2.75 ? 7.5625 * e * e : 2 / 2.75 > e ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : 2.5 / 2.75 > e ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
                    }
                },
                elastic: {
                    style: "",
                    fn: function(e) {
                        var t = .22,
                            r = .4;
                        return 0 === e ? 0 : 1 == e ? 1 : r * n.pow(2, -10 * e) * n.sin((e - t / 4) * 2 * n.PI / t) + 1
                    }
                }
            }), i.tap = function(e, n) {
                var r = t.createEvent("Event");
                r.initEvent(n, !0, !0), r.pageX = e.pageX, r.pageY = e.pageY, e.target.dispatchEvent(r)
            }, i.click = function(e) {
                var n, r = e.target;
                "SELECT" != r.tagName && "INPUT" != r.tagName && "TEXTAREA" != r.tagName && (n = t.createEvent("MouseEvents"), n.initMouseEvent("click", !0, !0, e.view, 1, r.screenX, r.screenY, r.clientX, r.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null), n._constructed = !0, r.dispatchEvent(n))
            }, i
        }();
    return r.prototype = {
        version: "5.0.6",
        _init: function() {
            this._initEvents(), (this.options.scrollbars || this.options.indicators) && this._initIndicators(), this.options.mouseWheel && this._initWheel(), this.options.snap && this._initSnap(), this.options.keyBindings && this._initKeys()
        },
        destroy: function() {
            this._initEvents(!0), this._execEvent("destroy")
        },
        _transitionEnd: function(e) {
            e.target == this.scroller && (this._transitionTime(0), this.resetPosition(this.options.bounceTime) || this._execEvent("scrollEnd"))
        },
        _start: function(e) {
            if (!(1 != u.eventType[e.type] && 0 !== e.button || !this.enabled || this.initiated && u.eventType[e.type] !== this.initiated)) {
                !this.options.preventDefault || u.isAndroidBrowser || u.preventDefaultException(e.target, this.options.preventDefaultException) || e.preventDefault();
                var t, r = e.touches ? e.touches[0] : e;
                this.initiated = u.eventType[e.type], this.moved = !1, this.distX = 0, this.distY = 0, this.directionX = 0, this.directionY = 0, this.directionLocked = 0, this._transitionTime(), this.isAnimating = !1, this.startTime = u.getTime(), this.options.useTransition && this.isInTransition && (t = this.getComputedPosition(), this._translate(n.round(t.x), n.round(t.y)), this._execEvent("scrollEnd"), this.isInTransition = !1), this.startX = this.x, this.startY = this.y, this.absStartX = this.x, this.absStartY = this.y, this.pointX = r.pageX, this.pointY = r.pageY, this._execEvent("beforeScrollStart")
            }
        },
        _move: function(e) {
            if (this.enabled && u.eventType[e.type] === this.initiated) {
                this.options.preventDefault && e.preventDefault();
                var t, r, i, s, o = e.touches ? e.touches[0] : e,
                    a = o.pageX - this.pointX,
                    f = o.pageY - this.pointY,
                    l = u.getTime();
                if (this.pointX = o.pageX, this.pointY = o.pageY, this.distX += a, this.distY += f, i = n.abs(this.distX), s = n.abs(this.distY), !(l - this.endTime > 300 && 10 > i && 10 > s)) {
                    if (this.directionLocked || this.options.freeScroll || (this.directionLocked = i > s + this.options.directionLockThreshold ? "h" : s >= i + this.options.directionLockThreshold ? "v" : "n"), "h" == this.directionLocked) {
                        if ("vertical" == this.options.eventPassthrough) e.preventDefault();
                        else if ("horizontal" == this.options.eventPassthrough) return this.initiated = !1, void 0;
                        f = 0
                    } else if ("v" == this.directionLocked) {
                        if ("horizontal" == this.options.eventPassthrough) e.preventDefault();
                        else if ("vertical" == this.options.eventPassthrough) return this.initiated = !1, void 0;
                        a = 0
                    }
                    a = this.hasHorizontalScroll ? a : 0, f = this.hasVerticalScroll ? f : 0, t = this.x + a, r = this.y + f, (t > 0 || t < this.maxScrollX) && (t = this.options.bounce ? this.x + a / 3 : t > 0 ? 0 : this.maxScrollX), (r > 0 || r < this.maxScrollY) && (r = this.options.bounce ? this.y + f / 3 : r > 0 ? 0 : this.maxScrollY), this.directionX = a > 0 ? -1 : 0 > a ? 1 : 0, this.directionY = f > 0 ? -1 : 0 > f ? 1 : 0, this.moved || this._execEvent("scrollStart"), this.moved = !0, this._translate(t, r), l - this.startTime > 300 && (this.startTime = l, this.startX = this.x, this.startY = this.y)
                }
            }
        },
        _end: function(e) {
            if (this.enabled && u.eventType[e.type] === this.initiated) {
                this.options.preventDefault && !u.preventDefaultException(e.target, this.options.preventDefaultException) && e.preventDefault();
                var t, r, i = (e.changedTouches ? e.changedTouches[0] : e, u.getTime() - this.startTime),
                    s = n.round(this.x),
                    o = n.round(this.y),
                    a = n.abs(s - this.startX),
                    f = n.abs(o - this.startY),
                    l = 0,
                    c = "";
                if (this.scrollTo(s, o), this.isInTransition = 0, this.initiated = 0, this.endTime = u.getTime(), !this.resetPosition(this.options.bounceTime)) {
                    if (!this.moved) return this.options.tap && u.tap(e, this.options.tap), this.options.click && u.click(e), void 0;
                    if (this._events.flick && 200 > i && 100 > a && 100 > f) return this._execEvent("flick"), void 0;
                    if (this.options.momentum && 300 > i && (t = this.hasHorizontalScroll ? u.momentum(this.x, this.startX, i, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0) : {
                            destination: s,
                            duration: 0
                        }, r = this.hasVerticalScroll ? u.momentum(this.y, this.startY, i, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0) : {
                            destination: o,
                            duration: 0
                        }, s = t.destination, o = r.destination, l = n.max(t.duration, r.duration), this.isInTransition = 1), this.options.snap) {
                        var p = this._nearestSnap(s, o);
                        this.currentPage = p, l = this.options.snapSpeed || n.max(n.max(n.min(n.abs(s - p.x), 1e3), n.min(n.abs(o - p.y), 1e3)), 300), s = p.x, o = p.y, this.directionX = 0, this.directionY = 0, c = this.options.bounceEasing
                    }
                    return s != this.x || o != this.y ? ((s > 0 || s < this.maxScrollX || o > 0 || o < this.maxScrollY) && (c = u.ease.quadratic), this.scrollTo(s, o, l, c), void 0) : (this._execEvent("scrollEnd"), void 0)
                }
            }
        },
        _resize: function() {
            var e = this;
            clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
                e.refresh()
            }, this.options.resizePolling)
        },
        resetPosition: function(e) {
            var t = this.x,
                n = this.y;
            return e = e || 0, !this.hasHorizontalScroll || this.x > 0 ? t = 0 : this.x < this.maxScrollX && (t = this.maxScrollX), !this.hasVerticalScroll || this.y > 0 ? n = 0 : this.y < this.maxScrollY && (n = this.maxScrollY), t == this.x && n == this.y ? !1 : (this.scrollTo(t, n, e, this.options.bounceEasing), !0)
        },
        disable: function() {
            this.enabled = !1
        },
        enable: function() {
            this.enabled = !0
        },
        refresh: function() {
            this.wrapper.offsetHeight, this.wrapperWidth = this.wrapper.clientWidth, this.wrapperHeight = this.wrapper.clientHeight, this.scrollerWidth = this.scroller.offsetWidth, this.scrollerHeight = this.scroller.offsetHeight, this.maxScrollX = this.wrapperWidth - this.scrollerWidth, this.maxScrollY = this.wrapperHeight - this.scrollerHeight, this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0, this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0, this.hasHorizontalScroll || (this.maxScrollX = 0, this.scrollerWidth = this.wrapperWidth), this.hasVerticalScroll || (this.maxScrollY = 0, this.scrollerHeight = this.wrapperHeight), this.endTime = 0, this.directionX = 0, this.directionY = 0, this.wrapperOffset = u.offset(this.wrapper), this._execEvent("refresh"), this.resetPosition()
        },
        on: function(e, t) {
            this._events[e] || (this._events[e] = []), this._events[e].push(t)
        },
        _execEvent: function(e) {
            if (this._events[e]) {
                var t = 0,
                    n = this._events[e].length;
                if (n)
                    for (; n > t; t++) this._events[e][t].call(this)
            }
        },
        scrollBy: function(e, t, n, r) {
            e = this.x + e, t = this.y + t, n = n || 0, this.scrollTo(e, t, n, r)
        },
        scrollTo: function(e, t, n, r) {
            r = r || u.ease.circular, !n || this.options.useTransition && r.style ? (this._transitionTimingFunction(r.style), this._transitionTime(n), this._translate(e, t)) : this._animate(e, t, n, r.fn)
        },
        scrollToElement: function(e, t, r, i, s) {
            if (e = e.nodeType ? e : this.scroller.querySelector(e)) {
                var o = u.offset(e);
                o.left -= this.wrapperOffset.left, o.top -= this.wrapperOffset.top, r === !0 && (r = n.round(e.offsetWidth / 2 - this.wrapper.offsetWidth / 2)), i === !0 && (i = n.round(e.offsetHeight / 2 - this.wrapper.offsetHeight / 2)), o.left -= r || 0, o.top -= i || 0, o.left = o.left > 0 ? 0 : o.left < this.maxScrollX ? this.maxScrollX : o.left, o.top = o.top > 0 ? 0 : o.top < this.maxScrollY ? this.maxScrollY : o.top, t = void 0 === t || null === t || "auto" === t ? n.max(n.abs(this.x - o.left), n.abs(this.y - o.top)) : t, this.scrollTo(o.left, o.top, t, s)
            }
        },
        _transitionTime: function(e) {
            if (e = e || 0, this.scrollerStyle[u.style.transitionDuration] = e + "ms", this.indicators)
                for (var t = this.indicators.length; t--;) this.indicators[t].transitionTime(e)
        },
        _transitionTimingFunction: function(e) {
            if (this.scrollerStyle[u.style.transitionTimingFunction] = e, this.indicators)
                for (var t = this.indicators.length; t--;) this.indicators[t].transitionTimingFunction(e)
        },
        _translate: function(e, t) {
            if (this.options.useTransform ? this.scrollerStyle[u.style.transform] = "translate(" + e + "px," + t + "px)" + this.translateZ : (e = n.round(e), t = n.round(t), this.scrollerStyle.left = e + "px", this.scrollerStyle.top = t + "px"), this.x = e, this.y = t, this.indicators)
                for (var r = this.indicators.length; r--;) this.indicators[r].updatePosition()
        },
        _initEvents: function(t) {
            var n = t ? u.removeEvent : u.addEvent,
                r = this.options.bindToWrapper ? this.wrapper : e;
            n(e, "orientationchange", this), n(e, "resize", this), this.options.click && n(this.wrapper, "click", this, !0), this.options.disableMouse || (n(this.wrapper, "mousedown", this), n(r, "mousemove", this), n(r, "mousecancel", this), n(r, "mouseup", this)), u.hasPointer && !this.options.disablePointer && (n(this.wrapper, "MSPointerDown", this), n(r, "MSPointerMove", this), n(r, "MSPointerCancel", this), n(r, "MSPointerUp", this)), u.hasTouch && !this.options.disableTouch && (n(this.wrapper, "touchstart", this), n(r, "touchmove", this), n(r, "touchcancel", this), n(r, "touchend", this)), n(this.scroller, "transitionend", this), n(this.scroller, "webkitTransitionEnd", this), n(this.scroller, "oTransitionEnd", this), n(this.scroller, "MSTransitionEnd", this)
        },
        getComputedPosition: function() {
            var t, n, r = e.getComputedStyle(this.scroller, null);
            return this.options.useTransform ? (r = r[u.style.transform].split(")")[0].split(", "), t = +(r[12] || r[4]), n = +(r[13] || r[5])) : (t = +r.left.replace(/[^-\d]/g, ""), n = +r.top.replace(/[^-\d]/g, "")), {
                x: t,
                y: n
            }
        },
        _initIndicators: function() {
            var e, t = this.options.interactiveScrollbars,
                n = ("object" != typeof this.options.scrollbars, "string" != typeof this.options.scrollbars),
                r = [];
            this.indicators = [], this.options.scrollbars && (this.options.scrollY && (e = {
                el: i("v", t, this.options.scrollbars),
                interactive: t,
                defaultScrollbars: !0,
                customStyle: n,
                resize: this.options.resizeIndicator,
                listenX: !1
            }, this.wrapper.appendChild(e.el), r.push(e)), this.options.scrollX && (e = {
                el: i("h", t, this.options.scrollbars),
                interactive: t,
                defaultScrollbars: !0,
                customStyle: n,
                resize: this.options.resizeIndicator,
                listenY: !1
            }, this.wrapper.appendChild(e.el), r.push(e))), this.options.indicators && (r = r.concat(this.options.indicators));
            for (var o = r.length; o--;) this.indicators[o] = new s(this, r[o]);
            this.on("refresh", function() {
                if (this.indicators)
                    for (var e = this.indicators.length; e--;) this.indicators[e].refresh()
            }), this.on("destroy", function() {
                if (this.indicators)
                    for (var e = this.indicators.length; e--;) this.indicators[e].destroy();
                delete this.indicators
            })
        },
        _initWheel: function() {
            u.addEvent(this.wrapper, "mousewheel", this), u.addEvent(this.wrapper, "DOMMouseScroll", this), this.on("destroy", function() {
                u.removeEvent(this.wrapper, "mousewheel", this), u.removeEvent(this.wrapper, "DOMMouseScroll", this)
            })
        },
        _wheel: function(e) {
            if (this.enabled) {
                e.preventDefault();
                var t, r, i, s, o = this;
                if (clearTimeout(this.wheelTimeout), this.wheelTimeout = setTimeout(function() {
                        o._execEvent("scrollEnd")
                    }, 400), "wheelDeltaX" in e) t = e.wheelDeltaX / 120, r = e.wheelDeltaY / 120;
                else if ("wheelDelta" in e) t = r = e.wheelDelta / 120;
                else {
                    if (!("detail" in e)) return;
                    t = r = -e.detail / 3
                }
                if (t *= this.options.mouseWheelSpeed, r *= this.options.mouseWheelSpeed, this.hasVerticalScroll || (t = r, r = 0), this.options.snap) return i = this.currentPage.pageX, s = this.currentPage.pageY, t > 0 ? i-- : 0 > t && i++, r > 0 ? s-- : 0 > r && s++, this.goToPage(i, s), void 0;
                i = this.x + n.round(this.hasHorizontalScroll ? t * this.options.invertWheelDirection : 0), s = this.y + n.round(this.hasVerticalScroll ? r * this.options.invertWheelDirection : 0), i > 0 ? i = 0 : i < this.maxScrollX && (i = this.maxScrollX), s > 0 ? s = 0 : s < this.maxScrollY && (s = this.maxScrollY), this.scrollTo(i, s, 0)
            }
        },
        _initSnap: function() {
            this.currentPage = {}, "string" == typeof this.options.snap && (this.options.snap = this.scroller.querySelectorAll(this.options.snap)), this.on("refresh", function() {
                var e, t, r, i, s, o, u = 0,
                    a = 0,
                    f = 0,
                    l = this.options.snapStepX || this.wrapperWidth,
                    c = this.options.snapStepY || this.wrapperHeight;
                if (this.pages = [], this.wrapperWidth && this.wrapperHeight && this.scrollerWidth && this.scrollerHeight) {
                    if (this.options.snap === !0)
                        for (r = n.round(l / 2), i = n.round(c / 2); f > -this.scrollerWidth;) {
                            for (this.pages[u] = [], e = 0, s = 0; s > -this.scrollerHeight;) this.pages[u][e] = {
                                x: n.max(f, this.maxScrollX),
                                y: n.max(s, this.maxScrollY),
                                width: l,
                                height: c,
                                cx: f - r,
                                cy: s - i
                            }, s -= c, e++;
                            f -= l, u++
                        } else
                            for (o = this.options.snap, e = o.length, t = -1; e > u; u++)(0 === u || o[u].offsetLeft <= o[u - 1].offsetLeft) && (a = 0, t++), this.pages[a] || (this.pages[a] = []), f = n.max(-o[u].offsetLeft, this.maxScrollX), s = n.max(-o[u].offsetTop, this.maxScrollY), r = f - n.round(o[u].offsetWidth / 2), i = s - n.round(o[u].offsetHeight / 2), this.pages[a][t] = {
                                x: f,
                                y: s,
                                width: o[u].offsetWidth,
                                height: o[u].offsetHeight,
                                cx: r,
                                cy: i
                            }, f > this.maxScrollX && a++;
                    this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0), 0 === this.options.snapThreshold % 1 ? (this.snapThresholdX = this.options.snapThreshold, this.snapThresholdY = this.options.snapThreshold) : (this.snapThresholdX = n.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold), this.snapThresholdY = n.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold))
                }
            }), this.on("flick", function() {
                var e = this.options.snapSpeed || n.max(n.max(n.min(n.abs(this.x - this.startX), 1e3), n.min(n.abs(this.y - this.startY), 1e3)), 300);
                this.goToPage(this.currentPage.pageX + this.directionX, this.currentPage.pageY + this.directionY, e)
            })
        },
        _nearestSnap: function(e, t) {
            if (!this.pages.length) return {
                x: 0,
                y: 0,
                pageX: 0,
                pageY: 0
            };
            var r = 0,
                i = this.pages.length,
                s = 0;
            if (n.abs(e - this.absStartX) < this.snapThresholdX && n.abs(t - this.absStartY) < this.snapThresholdY) return this.currentPage;
            for (e > 0 ? e = 0 : e < this.maxScrollX && (e = this.maxScrollX), t > 0 ? t = 0 : t < this.maxScrollY && (t = this.maxScrollY); i > r; r++)
                if (e >= this.pages[r][0].cx) {
                    e = this.pages[r][0].x;
                    break
                }
            for (i = this.pages[r].length; i > s; s++)
                if (t >= this.pages[0][s].cy) {
                    t = this.pages[0][s].y;
                    break
                }
            return r == this.currentPage.pageX && (r += this.directionX, 0 > r ? r = 0 : r >= this.pages.length && (r = this.pages.length - 1), e = this.pages[r][0].x), s == this.currentPage.pageY && (s += this.directionY, 0 > s ? s = 0 : s >= this.pages[0].length && (s = this.pages[0].length - 1), t = this.pages[0][s].y), {
                x: e,
                y: t,
                pageX: r,
                pageY: s
            }
        },
        goToPage: function(e, t, r, i) {
            i = i || this.options.bounceEasing, e >= this.pages.length ? e = this.pages.length - 1 : 0 > e && (e = 0), t >= this.pages[e].length ? t = this.pages[e].length - 1 : 0 > t && (t = 0);
            var s = this.pages[e][t].x,
                o = this.pages[e][t].y;
            r = void 0 === r ? this.options.snapSpeed || n.max(n.max(n.min(n.abs(s - this.x), 1e3), n.min(n.abs(o - this.y), 1e3)), 300) : r, this.currentPage = {
                x: s,
                y: o,
                pageX: e,
                pageY: t
            }, this.scrollTo(s, o, r, i)
        },
        next: function(e, t) {
            var n = this.currentPage.pageX,
                r = this.currentPage.pageY;
            n++, n >= this.pages.length && this.hasVerticalScroll && (n = 0, r++), this.goToPage(n, r, e, t)
        },
        prev: function(e, t) {
            var n = this.currentPage.pageX,
                r = this.currentPage.pageY;
            n--, 0 > n && this.hasVerticalScroll && (n = 0, r--), this.goToPage(n, r, e, t)
        },
        _initKeys: function() {
            var t, n = {
                pageUp: 33,
                pageDown: 34,
                end: 35,
                home: 36,
                left: 37,
                up: 38,
                right: 39,
                down: 40
            };
            if ("object" == typeof this.options.keyBindings)
                for (t in this.options.keyBindings) "string" == typeof this.options.keyBindings[t] && (this.options.keyBindings[t] = this.options.keyBindings[t].toUpperCase().charCodeAt(0));
            else this.options.keyBindings = {};
            for (t in n) this.options.keyBindings[t] = this.options.keyBindings[t] || n[t];
            u.addEvent(e, "keydown", this), this.on("destroy", function() {
                u.removeEvent(e, "keydown", this)
            })
        },
        _key: function(e) {
            if (this.enabled) {
                var t, r = this.options.snap,
                    i = r ? this.currentPage.pageX : this.x,
                    s = r ? this.currentPage.pageY : this.y,
                    o = u.getTime(),
                    a = this.keyTime || 0,
                    f = .25;
                switch (this.options.useTransition && this.isInTransition && (t = this.getComputedPosition(), this._translate(n.round(t.x), n.round(t.y)), this.isInTransition = !1), this.keyAcceleration = 200 > o - a ? n.min(this.keyAcceleration + f, 50) : 0, e.keyCode) {
                    case this.options.keyBindings.pageUp:
                        this.hasHorizontalScroll && !this.hasVerticalScroll ? i += r ? 1 : this.wrapperWidth : s += r ? 1 : this.wrapperHeight;
                        break;
                    case this.options.keyBindings.pageDown:
                        this.hasHorizontalScroll && !this.hasVerticalScroll ? i -= r ? 1 : this.wrapperWidth : s -= r ? 1 : this.wrapperHeight;
                        break;
                    case this.options.keyBindings.end:
                        i = r ? this.pages.length - 1 : this.maxScrollX, s = r ? this.pages[0].length - 1 : this.maxScrollY;
                        break;
                    case this.options.keyBindings.home:
                        i = 0, s = 0;
                        break;
                    case this.options.keyBindings.left:
                        i += r ? -1 : 5 + this.keyAcceleration >> 0;
                        break;
                    case this.options.keyBindings.up:
                        s += r ? 1 : 5 + this.keyAcceleration >> 0;
                        break;
                    case this.options.keyBindings.right:
                        i -= r ? -1 : 5 + this.keyAcceleration >> 0;
                        break;
                    case this.options.keyBindings.down:
                        s -= r ? 1 : 5 + this.keyAcceleration >> 0;
                        break;
                    default:
                        return
                }
                if (r) return this.goToPage(i, s), void 0;
                i > 0 ? (i = 0, this.keyAcceleration = 0) : i < this.maxScrollX && (i = this.maxScrollX, this.keyAcceleration = 0), s > 0 ? (s = 0, this.keyAcceleration = 0) : s < this.maxScrollY && (s = this.maxScrollY, this.keyAcceleration = 0), this.scrollTo(i, s, 0), this.keyTime = o
            }
        },
        _animate: function(e, t, n, r) {
            function i() {
                var d, v, m, g = u.getTime();
                return g >= c ? (s.isAnimating = !1, s._translate(e, t), s.resetPosition(s.options.bounceTime) || s._execEvent("scrollEnd"), void 0) : (g = (g - l) / n, m = r(g), d = (e - a) * m + a, v = (t - f) * m + f, s._translate(d, v), s.isAnimating && o(i), void 0)
            }
            var s = this,
                a = this.x,
                f = this.y,
                l = u.getTime(),
                c = l + n;
            this.isAnimating = !0, i()
        },
        handleEvent: function(e) {
            switch (e.type) {
                case "touchstart":
                case "MSPointerDown":
                case "mousedown":
                    this._start(e);
                    break;
                case "touchmove":
                case "MSPointerMove":
                case "mousemove":
                    this._move(e);
                    break;
                case "touchend":
                case "MSPointerUp":
                case "mouseup":
                case "touchcancel":
                case "MSPointerCancel":
                case "mousecancel":
                    this._end(e);
                    break;
                case "orientationchange":
                case "resize":
                    this._resize();
                    break;
                case "transitionend":
                case "webkitTransitionEnd":
                case "oTransitionEnd":
                case "MSTransitionEnd":
                    this._transitionEnd(e);
                    break;
                case "DOMMouseScroll":
                case "mousewheel":
                    this._wheel(e);
                    break;
                case "keydown":
                    this._key(e);
                    break;
                case "click":
                    e._constructed || (e.preventDefault(), e.stopPropagation())
            }
        }
    }, s.prototype = {
        handleEvent: function(e) {
            switch (e.type) {
                case "touchstart":
                case "MSPointerDown":
                case "mousedown":
                    this._start(e);
                    break;
                case "touchmove":
                case "MSPointerMove":
                case "mousemove":
                    this._move(e);
                    break;
                case "touchend":
                case "MSPointerUp":
                case "mouseup":
                case "touchcancel":
                case "MSPointerCancel":
                case "mousecancel":
                    this._end(e)
            }
        },
        destroy: function() {
            this.options.interactive && (u.removeEvent(this.indicator, "touchstart", this), u.removeEvent(this.indicator, "MSPointerDown", this), u.removeEvent(this.indicator, "mousedown", this), u.removeEvent(e, "touchmove", this), u.removeEvent(e, "MSPointerMove", this), u.removeEvent(e, "mousemove", this), u.removeEvent(e, "touchend", this), u.removeEvent(e, "MSPointerUp", this), u.removeEvent(e, "mouseup", this)), this.options.defaultScrollbars && this.wrapper.parentNode.removeChild(this.wrapper)
        },
        _start: function(t) {
            var n = t.touches ? t.touches[0] : t;
            t.preventDefault(), t.stopPropagation(), this.transitionTime(0), this.initiated = !0, this.moved = !1, this.lastPointX = n.pageX, this.lastPointY = n.pageY, this.startTime = u.getTime(), this.options.disableTouch || u.addEvent(e, "touchmove", this), this.options.disablePointer || u.addEvent(e, "MSPointerMove", this), this.options.disableMouse || u.addEvent(e, "mousemove", this), this.scroller._execEvent("beforeScrollStart")
        },
        _move: function(e) {
            var t, n, r, i, s = e.touches ? e.touches[0] : e;
            u.getTime(), this.moved || this.scroller._execEvent("scrollStart"), this.moved = !0, t = s.pageX - this.lastPointX, this.lastPointX = s.pageX, n = s.pageY - this.lastPointY, this.lastPointY = s.pageY, r = this.x + t, i = this.y + n, this._pos(r, i), e.preventDefault(), e.stopPropagation()
        },
        _end: function(t) {
            if (this.initiated) {
                if (this.initiated = !1, t.preventDefault(), t.stopPropagation(), u.removeEvent(e, "touchmove", this), u.removeEvent(e, "MSPointerMove", this), u.removeEvent(e, "mousemove", this), this.scroller.options.snap) {
                    var r = this.scroller._nearestSnap(this.scroller.x, this.scroller.y),
                        i = this.options.snapSpeed || n.max(n.max(n.min(n.abs(this.scroller.x - r.x), 1e3), n.min(n.abs(this.scroller.y - r.y), 1e3)), 300);
                    (this.scroller.x != r.x || this.scroller.y != r.y) && (this.scroller.directionX = 0, this.scroller.directionY = 0, this.scroller.currentPage = r, this.scroller.scrollTo(r.x, r.y, i, this.scroller.options.bounceEasing))
                }
                this.moved && this.scroller._execEvent("scrollEnd")
            }
        },
        transitionTime: function(e) {
            e = e || 0, this.indicatorStyle[u.style.transitionDuration] = e + "ms"
        },
        transitionTimingFunction: function(e) {
            this.indicatorStyle[u.style.transitionTimingFunction] = e
        },
        refresh: function() {
            this.transitionTime(0), this.indicatorStyle.display = this.options.listenX && !this.options.listenY ? this.scroller.hasHorizontalScroll ? "block" : "none" : this.options.listenY && !this.options.listenX ? this.scroller.hasVerticalScroll ? "block" : "none" : this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? "block" : "none", this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ? (u.addClass(this.wrapper, "iScrollBothScrollbars"), u.removeClass(this.wrapper, "iScrollLoneScrollbar"), this.options.defaultScrollbars && this.options.customStyle && (this.options.listenX ? this.wrapper.style.right = "8px" : this.wrapper.style.bottom = "8px")) : (u.removeClass(this.wrapper, "iScrollBothScrollbars"), u.addClass(this.wrapper, "iScrollLoneScrollbar"), this.options.defaultScrollbars && this.options.customStyle && (this.options.listenX ? this.wrapper.style.right = "2px" : this.wrapper.style.bottom = "2px")), this.wrapper.offsetHeight, this.options.listenX && (this.wrapperWidth = this.wrapper.clientWidth, this.options.resize ? (this.indicatorWidth = n.max(n.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8), this.indicatorStyle.width = this.indicatorWidth + "px") : this.indicatorWidth = this.indicator.clientWidth, this.maxPosX = this.wrapperWidth - this.indicatorWidth, this.sizeRatioX = this.options.speedRatioX || this.scroller.maxScrollX && this.maxPosX / this.scroller.maxScrollX), this.options.listenY && (this.wrapperHeight = this.wrapper.clientHeight, this.options.resize ? (this.indicatorHeight = n.max(n.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8), this.indicatorStyle.height = this.indicatorHeight + "px") : this.indicatorHeight = this.indicator.clientHeight, this.maxPosY = this.wrapperHeight - this.indicatorHeight, this.sizeRatioY = this.options.speedRatioY || this.scroller.maxScrollY && this.maxPosY / this.scroller.maxScrollY), this.updatePosition()
        },
        updatePosition: function() {
            var e = n.round(this.sizeRatioX * this.scroller.x) || 0,
                t = n.round(this.sizeRatioY * this.scroller.y) || 0;
            this.options.ignoreBoundaries || (0 > e ? e = 0 : e > this.maxPosX && (e = this.maxPosX), 0 > t ? t = 0 : t > this.maxPosY && (t = this.maxPosY)), this.x = e, this.y = t, this.scroller.options.useTransform ? this.indicatorStyle[u.style.transform] = "translate(" + e + "px," + t + "px)" + this.scroller.translateZ : (this.indicatorStyle.left = e + "px", this.indicatorStyle.top = t + "px")
        },
        _pos: function(e, t) {
            0 > e ? e = 0 : e > this.maxPosX && (e = this.maxPosX), 0 > t ? t = 0 : t > this.maxPosY && (t = this.maxPosY), e = this.options.listenX ? n.round(e / this.sizeRatioX) : this.scroller.x, t = this.options.listenY ? n.round(t / this.sizeRatioY) : this.scroller.y, this.scroller.scrollTo(e, t)
        }
    }, r.ease = u.ease, r
}(window, document, Math);
define("iscroll", function(e) {
        return function() {
            var t, n;
            return t || e.IScroll
        }
    }(this)),
    function(e, t) {
        typeof exports == "object" ? module.exports = t() : typeof define == "function" && define.amd ? define("spin", t) : e.Spinner = t()
    }(this, function() {
        function r(e, t) {
            var n = document.createElement(e || "div"),
                r;
            for (r in t) n[r] = t[r];
            return n
        }

        function i(e) {
            for (var t = 1, n = arguments.length; t < n; t++) e.appendChild(arguments[t]);
            return e
        }

        function o(e, r, i, o) {
            var u = ["opacity", r, ~~(e * 100), i, o].join("-"),
                a = .01 + i / o * 100,
                f = Math.max(1 - (1 - e) / r * (100 - a), e),
                l = n.substring(0, n.indexOf("Animation")).toLowerCase(),
                c = l && "-" + l + "-" || "";
            return t[u] || (s.insertRule("@" + c + "keyframes " + u + "{" + "0%{opacity:" + f + "}" + a + "%{opacity:" + e + "}" + (a + .01) + "%{opacity:1}" + (a + r) % 100 + "%{opacity:" + e + "}" + "100%{opacity:" + f + "}" + "}", s.cssRules.length), t[u] = 1), u
        }

        function u(t, n) {
            var r = t.style,
                i, s;
            n = n.charAt(0).toUpperCase() + n.slice(1);
            for (s = 0; s < e.length; s++) {
                i = e[s] + n;
                if (r[i] !== undefined) return i
            }
            if (r[n] !== undefined) return n
        }

        function a(e, t) {
            for (var n in t) e.style[u(e, n) || n] = t[n];
            return e
        }

        function f(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = arguments[t];
                for (var r in n) e[r] === undefined && (e[r] = n[r])
            }
            return e
        }

        function l(e) {
            var t = {
                x: e.offsetLeft,
                y: e.offsetTop
            };
            while (e = e.offsetParent) t.x += e.offsetLeft, t.y += e.offsetTop;
            return t
        }

        function c(e, t) {
            return typeof e == "string" ? e : e[t % e.length]
        }

        function p(e) {
            if (typeof this == "undefined") return new p(e);
            this.opts = f(e || {}, p.defaults, h)
        }

        function d() {
            function e(e, t) {
                return r("<" + e + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', t)
            }
            s.addRule(".spin-vml", "behavior:url(#default#VML)"), p.prototype.lines = function(t, n) {
                function o() {
                    return a(e("group", {
                        coordsize: s + " " + s,
                        coordorigin: -r + " " + -r
                    }), {
                        width: s,
                        height: s
                    })
                }

                function h(t, s, u) {
                    i(f, i(a(o(), {
                        rotation: 360 / n.lines * t + "deg",
                        left: ~~s
                    }), i(a(e("roundrect", {
                        arcsize: n.corners
                    }), {
                        width: r,
                        height: n.width,
                        left: n.radius,
                        top: -n.width >> 1,
                        filter: u
                    }), e("fill", {
                        color: c(n.color, t),
                        opacity: n.opacity
                    }), e("stroke", {
                        opacity: 0
                    }))))
                }
                var r = n.length + n.width,
                    s = 2 * r,
                    u = -(n.width + n.length) * 2 + "px",
                    f = a(o(), {
                        position: "absolute",
                        top: u,
                        left: u
                    }),
                    l;
                if (n.shadow)
                    for (l = 1; l <= n.lines; l++) h(l, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
                for (l = 1; l <= n.lines; l++) h(l);
                return i(t, f)
            }, p.prototype.opacity = function(e, t, n, r) {
                var i = e.firstChild;
                r = r.shadow && r.lines || 0, i && t + r < i.childNodes.length && (i = i.childNodes[t + r], i = i && i.firstChild, i = i && i.firstChild, i && (i.opacity = n))
            }
        }
        var e = ["webkit", "Moz", "ms", "O"],
            t = {},
            n, s = function() {
                var e = r("style", {
                    type: "text/css"
                });
                return i(document.getElementsByTagName("head")[0], e), e.sheet || e.styleSheet
            }(),
            h = {
                lines: 12,
                length: 7,
                width: 5,
                radius: 10,
                rotate: 0,
                corners: 1,
                color: "#000",
                direction: 1,
                speed: 1,
                trail: 100,
                opacity: .25,
                fps: 20,
                zIndex: 2e9,
                className: "spinner",
                top: "auto",
                left: "auto",
                position: "relative"
            };
        p.defaults = {}, f(p.prototype, {
            spin: function(e) {
                this.stop();
                var t = this,
                    i = t.opts,
                    s = t.el = a(r(0, {
                        className: i.className
                    }), {
                        position: i.position,
                        width: 0,
                        zIndex: i.zIndex
                    }),
                    o = i.radius + i.length + i.width,
                    u, f;
                e && (e.insertBefore(s, e.firstChild || null), f = l(e), u = l(s), a(s, {
                    left: (i.left == "auto" ? f.x - u.x + (e.offsetWidth >> 1) : parseInt(i.left, 10) + o) + "px",
                    top: (i.top == "auto" ? f.y - u.y + (e.offsetHeight >> 1) : parseInt(i.top, 10) + o) + "px"
                })), s.setAttribute("role", "progressbar"), t.lines(s, t.opts);
                if (!n) {
                    var c = 0,
                        h = (i.lines - 1) * (1 - i.direction) / 2,
                        p, d = i.fps,
                        v = d / i.speed,
                        m = (1 - i.opacity) / (v * i.trail / 100),
                        g = v / i.lines;
                    (function y() {
                        c++;
                        for (var e = 0; e < i.lines; e++) p = Math.max(1 - (c + (i.lines - e) * g) % v * m, i.opacity), t.opacity(s, e * i.direction + h, p, i);
                        t.timeout = t.el && setTimeout(y, ~~(1e3 / d))
                    })()
                }
                return t
            },
            stop: function() {
                var e = this.el;
                return e && (clearTimeout(this.timeout), e.parentNode && e.parentNode.removeChild(e), this.el = undefined), this
            },
            lines: function(e, t) {
                function l(e, n) {
                    return a(r(), {
                        position: "absolute",
                        width: t.length + t.width + "px",
                        height: t.width + "px",
                        background: e,
                        boxShadow: n,
                        transformOrigin: "left",
                        transform: "rotate(" + ~~(360 / t.lines * s + t.rotate) + "deg) translate(" + t.radius + "px" + ",0)",
                        borderRadius: (t.corners * t.width >> 1) + "px"
                    })
                }
                var s = 0,
                    u = (t.lines - 1) * (1 - t.direction) / 2,
                    f;
                for (; s < t.lines; s++) f = a(r(), {
                    position: "absolute",
                    top: 1 + ~(t.width / 2) + "px",
                    transform: t.hwaccel ? "translate3d(0,0,0)" : "",
                    opacity: t.opacity,
                    animation: n && o(t.opacity, t.trail, u + s * t.direction, t.lines) + " " + 1 / t.speed + "s linear infinite"
                }), t.shadow && i(f, a(l("#000", "0 0 4px #000"), {
                    top: "2px"
                })), i(e, i(f, l(c(t.color, s), "0 0 1px rgba(0,0,0,.1)")));
                return e
            },
            opacity: function(e, t, n) {
                t < e.childNodes.length && (e.childNodes[t].style.opacity = n)
            }
        });
        var v = a(r("group"), {
            behavior: "url(#default#VML)"
        });
        return !u(v, "transform") && v.adj ? d() : n = u(v, "animation"), p
    }), define("utils/device", ["require", "exports"], function(e, t) {
        var n;
        return function(e) {
            function t() {
                return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())
            }
            e.isMobile = t
        }(n || (n = {})), n
    });
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/screen", ["require", "exports", "views/base", "models/screen", "spin", "utils/device"], function(e, t, n, r, i, s) {
    var o = n,
        u = r,
        a = i,
        f = s,
        l = function(e) {
            function t(t) {
                this._isCenter = t.isCenter, this._screen = t.screen, this._spinner = new a, this._template = t.template, e.call(this, t)
            }
            return __extends(t, e), t.prototype.initialize = function() {
                this.listenTo(this._screen, "change", this.render)
            }, t.prototype.resize = function(e, t) {
                this._screen.resize(e, t), this.$el.width(e), this.$el.height(t)
            }, t.prototype.presenter = function() {
                return this._template({
                    isMobile: f.isMobile(),
                    isCenter: this._isCenter
                })
            }, t.prototype.render = function() {
                e.prototype.render.call(this);
                var t = this.$(".screen");
                switch (this._screen.status()) {
                    case u.Status.Success:
                    case u.Status.Interrupted:
                        this._spinner !== null && this._spinner.stop(), t.append(this._screen.content());
                        break;
                    case u.Status.Loading:
                        this._spinner.spin(this.$el.get(0));
                        break;
                    case u.Status.Error:
                }
                return this
            }, t
        }(o);
    return l
}), define("utils/fullscreen", ["require", "exports"], function(e, t) {
    var n;
    return function(e) {
        function t() {
            var e = document;
            return !!e.mozFullScreenEnabled || !!e.webkitFullscreenEnabled
        }

        function n() {
            var e = document;
            return !!e.mozFullScreen || !!e.webkitIsFullScreen
        }

        function r(e) {
            var t = e,
                r = document;
            n() ? r.mozCancelFullScreen ? r.mozCancelFullScreen() : r.webkitCancelFullScreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
        e.isSupported = t, e.isActive = n, e.toggle = r
    }(n || (n = {})), n
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/screens", ["require", "exports", "iscroll", "views/base", "views/screen", "models/setting", "models/screen", "collections/screens", "models/reader", "utils/fullscreen", "templates", "utils/device"], function(e, t, n, r, i, s, o, u, a, f, l, c) {
    var h = n,
        p = r,
        d = i,
        v = s,
        m = o,
        g = u,
        y = a,
        b = f,
        w = l,
        E = c,
        S;
    (function(e) {
        e[e.Enter = 13] = "Enter", e[e.Space = 32] = "Space", e[e.Left = 37] = "Left", e[e.Up = 38] = "Up", e[e.Right = 39] = "Right", e[e.Down = 40] = "Down"
    })(S || (S = {}));
    var x = function(e) {
        function t(t) {
            this._screens = t.screens, this._template = t.template, this._setting = t.setting, this._mover = t.mover, this._childViews = [], this._current = this._screens.currentScreen(), this._prevs = this._screens.prevScreens(), this._nexts = this._screens.nextScreens(), this._scroll = null, this.events = {
                click: "onLeftClick",
                contextmenu: "onRightClick",
                keydown: "onKeyDown"
            }, E.isMobile() && (this.events = {
                "tap #mobile-touch-move-left": "onMobileLeft",
                "tap #mobile-touch-move-right": "onMobileRight"
            }), e.call(this, t)
        }
        return __extends(t, e), t.prototype.initialize = function() {
            var e = this;
            this.listenTo(this._prevs, "add remove reset sort", this.render), this.listenTo(this._nexts, "add remove reset sort", this.render), this.listenTo(this._setting, "change", this.render), $(window).on("resize", function() {
                e.onResize()
            })
        }, t.prototype.onResize = function() {
            var e = this.$el.width(),
                t = this.$el.height(),
                n = this._childViews.length;
            this.$("ul").width(e * n);
            for (var r = 0; r < n; ++r) this._childViews[r].resize(e, t);
            this._scroll !== null && (this._scroll.refresh(), this.goCenterPage())
        }, t.prototype.goCenterPage = function() {
            var e = this._nexts.length;
            this._setting.pageDirection() === m.PageDirection.L2R && (e = this._prevs.length), this._scroll.goToPage(e, 0, 0)
        }, t.prototype.render = function() {
            this.$el.html(this._template({}));
            var e = [this._current];
            for (var t = 0, n = this._prevs.length; t < n; ++t) e.push(this._prevs.at(0));
            for (var t = 0, n = this._nexts.length; t < n; ++t) e.unshift(this._nexts.at(0));
            var r = this._nexts.length;
            this._setting.pageDirection() === m.PageDirection.L2R && (e.reverse(), r = this._prevs.length);
            for (var t = 0, n = e.length; t < n; ++t) {
                var i = new d({
                    isCenter: t === r,
                    tagName: "li",
                    screen: e[t],
                    template: w.screen
                });
                i.resize(this.$el.width(), this.$el.height()), this.$("ul").append(i.render().el), this._childViews.push(i)
            }
            return this.$("ul").width(this.$el.width() * e.length), this.createScroll(r), this
        }, t.prototype.close = function() {
            e.prototype.close.call(this), $(window).off("resize"), this.removeChildViews(), this._scroll !== null && (this._scroll.destroy(), this._scroll = null)
        }, t.prototype.createScroll = function(e) {
            var t = this;
            this._scroll !== null && this._scroll.destroy(), this._scroll = new h(this.$("#screen-scroller").get(0), {
                snap: !0,
                momentum: !1,
                scrollX: !0,
                scrollY: !0,
                click: !0,
                bounce: !1,
                snapThreshold: .1
            }), this.goCenterPage(), this._scroll.on("scrollEnd", function() {
                var n = t._scroll.currentPage.pageX;
                if (e === n) return;
                var r = t._setting.pageDirection();
                e > n && r === m.PageDirection.R2L || e < n && r === m.PageDirection.L2R ? t._mover.goNextScreen() : t._mover.goPrevScreen(), t.goCenterPage()
            })
        }, t.prototype.removeChildViews = function() {
            for (var e = 0, t = this._childViews.length; e < t; ++e) this._childViews[e].close();
            this._childViews = []
        }, t.prototype.goNext = function() {
            this._mover.goNextScreen()
        }, t.prototype.goPrev = function() {
            this._mover.goPrevScreen()
        }, t.prototype.onMobileLeft = function(e) {
            var t = this._setting.pageDirection();
            t === m.PageDirection.R2L ? this.onLeftClick() : this.onRightClick(e)
        }, t.prototype.onMobileRight = function(e) {
            var t = this._setting.pageDirection();
            t === m.PageDirection.L2R ? this.onLeftClick() : this.onRightClick(e)
        }, t.prototype.onLeftClick = function() {
            this.$el.focus(), this._scroll !== null && !this._scroll.moved && this.goNext()
        }, t.prototype.onRightClick = function(e) {
            this.$el.focus(), e.preventDefault(), this._scroll !== null && !this._scroll.moved && this.goPrev()
        }, t.prototype.onKeyDown = function(e) {
            this.$el.focus();
            switch (e.keyCode) {
                case S.Enter:
                    b.toggle(document.body);
                    break;
                case S.Space:
                    this._setting.toggleViewMode();
                    break;
                case S.Left:
                    this._setting.pageDirection() === m.PageDirection.R2L ? this.goNext() : this.goPrev();
                    break;
                case S.Right:
                    this._setting.pageDirection() === m.PageDirection.L2R ? this.goNext() : this.goPrev()
            }
        }, t
    }(p);
    return x
}), ! function(e) {
    var t = function(n, r) {
        this.$element = e(n), this.options = e.extend({}, t.defaults, r)
    };
    t.defaults = {
        transition_delay: 300,
        refresh_speed: 50,
        display_text: "none",
        use_percentage: !0,
        percent_format: function(e) {
            return e + "%"
        },
        amount_format: function(e, t) {
            return e + " / " + t
        },
        update: e.noop,
        done: e.noop,
        fail: e.noop
    }, t.prototype.transition = function() {
        var n = this.$element,
            r = n.parent(),
            i = this.$back_text,
            s = this.$front_text,
            o = this.options,
            u = n.attr("aria-valuetransitiongoal"),
            f = n.attr("aria-valuemin") || 0,
            l = n.attr("aria-valuemax") || 100,
            c = r.hasClass("vertical"),
            h = o.update && "function" == typeof o.update ? o.update : t.defaults.update,
            p = o.done && "function" == typeof o.done ? o.done : t.defaults.done,
            d = o.fail && "function" == typeof o.fail ? o.fail : t.defaults.fail;
        if (!u) return d("aria-valuetransitiongoal not set"), void 0;
        var v = Math.round(100 * (u - f) / (l - f));
        if ("center" === o.display_text && !i && !s) {
            this.$back_text = i = e("<span>", {
                "class": "progressbar-back-text"
            }).prependTo(r), this.$front_text = s = e("<span>", {
                "class": "progressbar-front-text"
            }).prependTo(n);
            var m;
            c ? (m = r.css("height"), i.css({
                height: m,
                "line-height": m
            }), s.css({
                height: m,
                "line-height": m
            }), e(window).resize(function() {
                m = r.css("height"), i.css({
                    height: m,
                    "line-height": m
                }), s.css({
                    height: m,
                    "line-height": m
                })
            })) : (m = r.css("width"), s.css({
                width: m
            }), e(window).resize(function() {
                m = r.css("width"), s.css({
                    width: m
                })
            }))
        }
        setTimeout(function() {
            var e, t, a, d, m;
            c ? n.css("height", v + "%") : n.css("width", v + "%");
            var y = setInterval(function() {
                c ? (a = n.height(), d = r.height()) : (a = n.width(), d = r.width()), e = Math.round(100 * a / d), t = Math.round(a / d * (l - f)), e >= v && (e = v, t = u, p(), clearInterval(y)), "none" !== o.display_text && (m = o.use_percentage ? o.percent_format(e) : o.amount_format(t, l), "fill" === o.display_text ? n.text(m) : "center" === o.display_text && (i.text(m), s.text(m))), n.attr("aria-valuenow", t), h(e)
            }, o.refresh_speed)
        }, o.transition_delay)
    };
    var n = e.fn.progressbar;
    e.fn.progressbar = function(n) {
        return this.each(function() {
            var r = e(this),
                i = r.data("bs.progressbar"),
                s = "object" == typeof n && n;
            i || r.data("bs.progressbar", i = new t(this, s)), i.transition()
        })
    }, e.fn.progressbar.Constructor = t, e.fn.progressbar.noConflict = function() {
        return e.fn.progressbar = n, this
    }
}(window.jQuery), define("progressbar", ["jquery"], function() {});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/progress", ["require", "exports", "backbone", "progressbar", "views/base", "models/reader", "models/progress"], function(e, t, n, r, i, s, o) {
    var u = n,
        a = r,
        f = i,
        l = s,
        c = o,
        h = function(e) {
            function t(t) {
                this._options = t, this._reader = t.reader, this._progress = this._reader.progress(), this._template = t.template, this.events = {
                    "click #progress-dialog-cancel": "onClickCancel"
                }, e.call(this)
            }
            return __extends(t, e), t.prototype.onClickCancel = function() {
                this._reader.close()
            }, t.prototype.initialize = function() {
                var e = this;
                this.listenTo(this._progress, "change", function() {
                    e.update()
                })
            }, t.prototype.presenter = function() {
                return this._template({
                    message: this._progress.message(),
                    progress: this._progress.progress()
                })
            }, t.prototype.render = function() {
                return e.prototype.render.call(this), this.$(".progress-bar").progressbar({
                    transition_delay: 0
                }), this
            }, t.prototype.update = function() {
                this.$("#progress-dialog-message").html(this._progress.message()), this.$(".progress-bar").get(0).setAttribute("aria-valuetransitiongoal", this._progress.progress()), this.$(".progress-bar").progressbar({
                    transition_delay: 0
                })
            }, t
        }(f);
    return h
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/header", ["require", "exports", "backbone", "models/reader", "views/base"], function(e, t, n, r, i) {
    var s = n,
        o = r,
        u = i,
        a = function(e) {
            function t(t) {
                this._options = t, this._reader = t.reader, this._template = t.template, this.events = {
                    "click #info-button": "onClickInfo",
                    "click #close-button": "onClickClose"
                }, e.call(this, t)
            }
            return __extends(t, e), t.prototype.initialize = function() {
                var e = this;
                this.listenTo(this._reader, "change:title change:status", function() {
                    e.render(), e.$el.trigger("create")
                })
            }, t.prototype.presenter = function() {
                return this._template({
                    title: this._reader.title(),
                    opened: this._reader.status() === o.Status.Opened
                })
            }, t.prototype.onClickInfo = function() {}, t.prototype.onClickClose = function() {
                this._reader.close()
            }, t
        }(u);
    return a
}), define("utils/dropbox", ["require", "exports", "promise", "utils/promise"], function(e, t, n, r) {
    var i = n,
        s = r,
        o;
    return function(e) {
        function t(e) {
            return typeof e == "undefined" && (e = "djpng2jxhbnkgwm"), {
                pick: function() {
                    return "Dropbox" in window ? n(Dropbox) : s.require("dropbox").then(function(t) {
                        return t.init({
                            appKey: e
                        }), n(t)
                    })
                }
            }
        }

        function n(e) {
            return new i(function(t, n) {
                e.choose({
                    success: function(e) {
                        e.length === 0 && n("dropbox chooser failed");
                        var r = e[0];
                        t({
                            name: r.name,
                            url: r.link,
                            bytes: r.bytes
                        })
                    },
                    cancel: function() {
                        n("dropbox chooser canceled")
                    },
                    linkType: "direct",
                    multiselect: !1
                })
            })
        }
        e.createPicker = t
    }(o || (o = {})), o
}), define("utils/gdrive", ["require", "exports", "promise", "utils/promise"], function(e, t, n, r) {
    var i = n,
        s = r,
        o;
    return function(e) {
        function o(e, r) {
            return new i(function(i, s) {
                e.auth.authorize({
                    client_id: t,
                    scope: [n],
                    immediate: r
                }, function(e) {
                    e && !e.error ? i(null) : (console.log(e), s("ERROR: google drive authorize"))
                })
            })
        }

        function u(e, t, n) {
            return new i(function(r, i) {
                var s = t,
                    o = function() {
                        setTimeout(function() {
                            if ("auth" in e && "authorize" in e.auth) {
                                r(null);
                                return
                            }
                            s -= 1;
                            if (s <= 0) {
                                i("gapi.auth.authorize");
                                return
                            }
                            o()
                        }, n)
                    };
                o()
            })
        }

        function a(e) {
            return (new i(function(t, n) {
                var i = (new google.picker.PickerBuilder).enableFeature(google.picker.Feature.NAV_HIDDEN).setOAuthToken(e.auth.getToken().access_token).setDeveloperKey(r).addView(google.picker.ViewId.DOCS).setCallback(function(e) {
                    e.action === google.picker.Action.CANCEL && n("picker cancel");
                    if (e.action !== google.picker.Action.PICKED) return;
                    t(e)
                }).build();
                i.setVisible(!0)
            })).then(function(t) {
                return new i(function(n, r) {
                    var i = t.docs[0],
                        s = i.id,
                        o = e.client.drive.files.get({
                            fileId: s
                        });
                    o.execute(function(t) {
                        var r = t.downloadUrl,
                            s = {
                                Authorization: "Bearer " + e.auth.getToken().access_token
                            };
                        n({
                            name: t.title,
                            url: r,
                            httpHeaders: s,
                            mimeType: i.mimeType,
                            isGoogleDrive: !0
                        })
                    })
                })
            })
        }

        function f() {
            return {
                pick: function() {
                    return "google" in window && "gapi" in window && google && google.picker && gapi && gapi.auth ? a(gapi) : s.require("gapi").then(function(e) {
                        return s.require("gclient")
                    }).then(function(e) {
                        return gapi = e, u(gapi, 10, 200)
                    }).then(function() {
                        return o(gapi, !0)
                    }).catch(function(e) {
                        if (e === "gapi.auth.authorize") throw e;
                        return o(gapi, !1)
                    }).then(function() {
                        return new i(function(e, t) {
                            gapi.client.load("drive", "v2", function() {
                                e(null)
                            })
                        })
                    }).then(function() {
                        return new i(function(e, t) {
                            gapi.load("picker", {
                                callback: e
                            })
                        })
                    }).then(function() {
                        return a(gapi)
                    })
                }
            }
        }
        var t = "125417905454-mafatglh0qhtssiq9cl2uieqkrjd6s0r.apps.googleusercontent.com",
            n = "https://www.googleapis.com/auth/drive.readonly",
            r = "AIzaSyCnf2EefO8vRhA1Mu5iRJrX4bNO9zUD-EE";
        e.createPicker = f
    }(o || (o = {})), o
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/footer", ["require", "exports", "backbone", "views/base", "models/reader", "templates", "models/screen", "utils/dropbox", "utils/gdrive"], function(e, t, n, r, i, s, o, u, a) {
    var f = n,
        l = r,
        c = i,
        h = s,
        p = o,
        d = u,
        v = a,
        m = function(e) {
            function t(t) {
                this._options = t, this._reader = t.reader, this._template = t.template, this._setting = t.setting, this._chooserOpened = !1, this.events = {
                    "change #page-slider": "onChangePageSlider",
                    "slidestop #page-slider": "onPageSliderStop",
                    "click #file-button": "onClickFileButton",
                    "change #file-input": "onChangeFileInput",
                    "click #dropbox-button": "onClickDropBox",
                    "click #google-drive-button": "onClickGoogleDrive"
                }, e.call(this, t)
            }
            return __extends(t, e), t.prototype.onPageSliderStop = function() {
                var e = this.$("#page-slider").val();
                this._setting.pageDirection() === p.PageDirection.R2L && (e = this._reader.totalPageNum() - e + 1), this._reader.goToPage(e - 1)
            }, t.prototype.onChangePageSlider = function() {
                var e = this.$("#page-slider").val();
                this._setting.pageDirection() === p.PageDirection.R2L && (e = this._reader.totalPageNum() - e + 1), this.$("#page-slider-label").html(e + "/" + this._reader.totalPageNum())
            }, t.prototype.onClickFileButton = function() {
                if (this._chooserOpened) return;
                this.$("#file-input").click()
            }, t.prototype.onChangeFileInput = function(e) {
                var t = e.originalEvent,
                    n = t.target.files;
                n.length !== 0 && this._reader.openFile(n[0])
            }, t.prototype.onClickGoogleDrive = function() {
                var e = this;
                if (this._chooserOpened) return;
                this._chooserOpened = !0, v.createPicker().pick().then(function(t) {
                    e._reader.openURL(t.url, t)
                }).finally(function() {
                    e._chooserOpened = !1
                })
            }, t.prototype.onClickDropBox = function() {
                var e = this;
                if (this._chooserOpened) return;
                this._chooserOpened = !0, d.createPicker().pick().then(function(t) {
                    e._reader.openURL(t.url, t)
                }).finally(function() {
                    e._chooserOpened = !1
                })
            }, t.prototype.initialize = function() {
                var e = this;
                this.listenTo(this._reader, "change", function() {
                    e.render(), e.$el.trigger("create")
                }), this.listenTo(this._setting, "change", function() {
                    e.render(), e.$el.trigger("create")
                })
            }, t.prototype.presenter = function() {
                var e = this._reader.status() === c.Status.Opened,
                    t = this._reader.totalPageNum(),
                    n = this._reader.currentPageNum() + 1,
                    r = n,
                    i = this._setting.pageDirection() === p.PageDirection.R2L;
                return i && (r = t - r + 1), this._template({
                    opened: e,
                    alignedCurrentPageNum: r,
                    currentPageNum: n,
                    totalPageNum: t,
                    reverse: i
                })
            }, t
        }(l);
    return m
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/dialog", ["require", "exports", "backbone", "views/base", "views/composite"], function(e, t, n, r, i) {
    var s = n,
        o = r,
        u = i,
        a = function(e) {
            function t(t) {
                this._options = t, this._template = t.template, this._innerView = t.innerView, e.call(this, t)
            }
            return __extends(t, e), t.prototype.initialize = function() {
                this.assign("#" + this._options.id, this._innerView)
            }, t.prototype.presenter = function() {
                return this._template({
                    id: this._options.id
                })
            }, t.prototype.render = function() {
                return e.prototype.render.call(this), this.$el.trigger("create"), this
            }, t
        }(u);
    return a
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/error", ["require", "exports", "backbone", "models/reader", "views/base"], function(e, t, n, r, i) {
    var s = n,
        o = r,
        u = i,
        a = function(e) {
            function t(t) {
                this._options = t, this._template = t.template, this._reader = t.reader, e.call(this, t)
            }
            return __extends(t, e), t.prototype.initialize = function() {
                var e = this;
                this.listenTo(this._reader, "change:message", function() {
                    e.render(), e.$el.trigger("create")
                })
            }, t.prototype.presenter = function() {
                return this._template({
                    message: this._reader.message()
                })
            }, t
        }(u);
    return a
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/help", ["require", "exports", "backbone", "views/base", "utils/device"], function(e, t, n, r, i) {
    var s = n,
        o = r,
        u = i,
        a = function(e) {
            function t(t) {
                this._options = t, this._template = t.template, e.call(this, t)
            }
            return __extends(t, e), t.prototype.presenter = function() {
                return this._template({
                    isMobile: u.isMobile()
                })
            }, t
        }(o);
    return a
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/setting", ["require", "exports", "backbone", "views/base", "models/setting", "models/screen", "models/unarchiver", "utils/fullscreen"], function(e, t, n, r, i, s, o, u) {
    var a = n,
        f = r,
        l = i,
        c = s,
        h = o,
        p = u,
        d = function(e) {
            function t(t) {
                this._options = t, this._template = t.template, this._setting = t.setting, this.events = {
                    "click #range-request-checkbox-label": "onRangeClick",
                    "click #view-mode-radio-choice-one-label": "onOnePageClick",
                    "click #view-mode-radio-choice-two-label": "onTwoPageClick",
                    "click #page-direction-radio-choice-L2R-label": "onL2RClick",
                    "click #page-direction-radio-choice-R2L-label": "onR2LClick",
                    "click #fullscreen-checkbox-label": "onFullscreenClick",
                    "touchstart #range-request-checkbox-label": "onRangeClick",
                    "touchstart #view-mode-radio-choice-one-label": "onOnePageClick",
                    "touchstart #view-mode-radio-choice-two-label": "onTwoPageClick",
                    "touchstart #page-direction-radio-choice-L2R-label": "onL2RClick",
                    "touchstart #page-direction-radio-choice-R2L-label": "onR2LClick",
                    "touchstart #fullscreen-checkbox-label": "onFullscreenClick"
                }, e.call(this, t)
            }
            return __extends(t, e), t.prototype.initialize = function() {
                var e = this;
                this.listenTo(this._setting.screenSetting(), "change", function() {
                    e.render()
                }), this.listenTo(this._setting.unarchiverSetting(), "change", function() {
                    e.render()
                }), $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange", function() {
                    e.render(), setTimeout(function() {
                        e.$el.popup("reposition", "positionTo: window")
                    }, 800)
                })
            }, t.prototype.presenter = function() {
                var e = this._setting,
                    t = e.screenSetting().pageDirection() === c.PageDirection.L2R,
                    n = !t,
                    r = e.screenSetting().viewMode() === c.ViewMode.OnePage,
                    i = !r,
                    s = e.unarchiverSetting().enablesRangeRequestInPdf();
                return this._template({
                    L2R: t,
                    R2L: n,
                    OnePage: r,
                    TwoPage: i,
                    enablesRangeRequestInPdf: s,
                    fullscreenIsSupported: p.isSupported(),
                    fullscreenIsActive: p.isActive()
                })
            }, t.prototype.render = function() {
                return e.prototype.render.call(this), this.$el.trigger("create"), this
            }, t.prototype.onFullscreenClick = function(e) {
                e.stopPropagation(), e.preventDefault(), p.toggle(document.body)
            }, t.prototype.onRangeClick = function(e) {
                e.stopPropagation(), e.preventDefault();
                var t = this._setting.unarchiverSetting(),
                    n = t.enablesRangeRequestInPdf();
                t.setEnablesRangeRequestInPdf(!n)
            }, t.prototype.onTwoPageClick = function() {
                this._setting.screenSetting().setViewMode(c.ViewMode.TwoPage)
            }, t.prototype.onOnePageClick = function() {
                this._setting.screenSetting().setViewMode(c.ViewMode.OnePage)
            }, t.prototype.onL2RClick = function() {
                this._setting.screenSetting().setPageDirection(c.PageDirection.L2R)
            }, t.prototype.onR2LClick = function() {
                this._setting.screenSetting().setPageDirection(c.PageDirection.R2L)
            }, t.prototype.close = function() {
                $(document).off("webkitfullscreenchange mozfullscreenchange fullscreenchange"), e.prototype.close.call(this)
            }, t
        }(f);
    return d
}), define("utils/strings", ["require", "exports"], function(e, t) {
    var n;
    return function(e) {
        function t(e, t) {
            return e.indexOf(t) == 0
        }

        function n(e, t) {
            return e.indexOf(t, e.length - t.length) !== -1
        }
        e.startsWith = t, e.endsWith = n
    }(n || (n = {})), n
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("views/comicbed", ["require", "exports", "jquery", "models/factory", "models/reader", "models/setting", "views/composite", "views/screens", "views/progress", "views/header", "views/footer", "views/dialog", "views/error", "views/help", "views/setting", "templates", "utils/strings"], function(e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m) {
    var g = n,
        y = r,
        b = i,
        w = s,
        E = o,
        S = u,
        x = a,
        T = f,
        N = l,
        C = c,
        k = h,
        L = p,
        A = d,
        O = v,
        M = m,
        _ = function(e) {
            function t(t, n) {
                this._template = t, this._queryOptions = n, this.attributes = {
                    "data-role": "page"
                }, this.id = "comicbed", this.events = {
                    drop: "onDrop",
                    dragover: "onDragOver",
                    "mouseleave #menu-remove-area": "onEnterMenu",
                    "mouseenter #menu-remove-area": "onLeaveMenu",
                    "tap #mobile-touch-toggle-menu": "onToggleMenu",
                    "click #help-button": "onHelpButtonClick",
                    "click #setting-button": "onSettingButtonClick"
                }, e.call(this, {})
            }
            return __extends(t, e), t.prototype.initialize = function() {
                var e = this;
                this._setting = y.createSetting(this._queryOptions), this._reader = y.createReader({
                    width: this.$el.width(),
                    height: this.$el.height()
                }, this._setting), this.assign("#header", new T({
                    template: O.header,
                    reader: this._reader
                })), this.assign("#footer", new N({
                    template: O.footer,
                    reader: this._reader,
                    setting: this._setting.screenSetting()
                })), this.assign("#error-dialog-holder", new C({
                    id: "error-dialog",
                    template: O.dialog,
                    innerView: new k({
                        template: O.error,
                        reader: this._reader
                    })
                })), this.assign("#help-dialog-holder", new C({
                    id: "help-dialog",
                    template: O.dialog,
                    innerView: new L({
                        template: O.help
                    })
                })), this.assign("#progress-dialog-holder", new C({
                    id: "progress-dialog",
                    template: O.dialog,
                    innerView: new x({
                        template: O.progress,
                        reader: this._reader
                    })
                })), this.assign("#setting-dialog-holder", new C({
                    id: "setting-dialog",
                    template: O.dialog,
                    innerView: new A({
                        template: O.setting,
                        setting: this._setting
                    })
                })), this.listenTo(this._reader, "change:status", function() {
                    var t = e._reader.status();
                    switch (t) {
                        case b.Status.Opening:
                            e.$("#progress-dialog").popup("open");
                            break;
                        case b.Status.Opened:
                            e.$("#progress-dialog").popup("close"), e.assign("#content", new S({
                                el: e.$("#content"),
                                screens: e._reader.screens(),
                                setting: e._setting.screenSetting(),
                                mover: e._reader,
                                template: O.screens
                            }));
                            break;
                        case b.Status.Error:
                            e.$("#progress-dialog").popup("close"), e.$("#error-dialog").popup("open");
                        case b.Status.Closed:
                            e.dissociate("#content"), e.onEnterMenu(), e.$("#progress-dialog").popup("close")
                    }
                }), this.listenToOnce(this, "initialized", function() {
                    if ("url" in e._queryOptions) {
                        var t = document.location,
                            n = encodeURI(e._queryOptions.url),
                            r = t.protocol + "//" + t.host;
                      e._reader.openURL(n)
                    }
                })
            }, t.prototype.onEnterMenu = function() {
                this.$("#header, #footer").slideDown()
            }, t.prototype.onLeaveMenu = function() {
                this.$("#header, #footer").slideUp()
            }, t.prototype.onToggleMenu = function() {
                this.$("#header, #footer").slideToggle()
            }, t.prototype.presenter = function() {
                return this._template({})
            }, t.prototype.onDragOver = function(e) {
                var t = e.originalEvent;
                t.stopPropagation(), t.preventDefault()
            }, t.prototype.onDrop = function(e) {
                var t = e.originalEvent;
                t.stopPropagation(), t.preventDefault();
                var n = t.dataTransfer.files;
                if (n.length === 0) return;
                this._reader.openFile(n[0])
            }, t.prototype.onHelpButtonClick = function() {
                this.$("#help-dialog").popup("open")
            }, t.prototype.onSettingButtonClick = function() {
                this.$("#setting-dialog").popup("open")
            }, t
        }(E);
    return _
});
var __extends = this.__extends || function(e, t) {
    function r() {
        this.constructor = e
    }
    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
    r.prototype = t.prototype, e.prototype = new r
};
define("routers/router", ["require", "exports", "jquery", "jquerymobile", "underscore", "backbone", "templates", "utils/querystring", "views/base", "views/comicbed"], function(e, t, n, r, i, s, o, u, a, f) {
    var l = n,
        c = r,
        h = i,
        p = s,
        d = o,
        v = u,
        m = a,
        g = f,
        y = function(e) {
            function t() {
                this.routes = {
                    "(?*querystring)": "index"
                }, this.currentView = null, e.call(this)
            }
            return __extends(t, e), t.prototype.index = function(e) {
                h.isEmpty(e) && (e = ""), h.isNull(this.currentView) || this.currentView.close();
                var t = v.parse(e);
                this.currentView = new g(d.comicbed, t), l(document.body).html(this.currentView.render().el), l(document.body).trigger("create"), c.changePage(this.currentView.$el, {
                    reverse: !1,
                    changeHash: !1
                }), this.currentView.trigger("initialized")
            }, t
        }(p.Router);
    return y
}), require(["config"], function() {
    var e = window;
    e.URL = e.URL || e.webkitURL, require(["jquery"], function(e) {
        e(document).bind("mobileinit", function() {
            e.mobile.ajaxEnabled = !1, e.mobile.linkBindingEnabled = !1, e.mobile.hashListeningEnabled = !1, e.mobile.pushStateEnabled = !1
        }), require(["jquerymobile"], function(e) {
            require(["backbone", "routers/router"], function(e, t) {
                var n = new t;
                e.history.start()
            })
        })
    })
}), define("main", function() {});