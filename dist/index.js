import { jsx as i } from "react/jsx-runtime";
import z, { InteractiveStyles as G, CroppedFullAbsoluteStyles as J, NotInteractiveStyles as Q } from "immerser";
import { createContext as N, useState as g, useRef as f, useMemo as S, useLayoutEffect as C, useEffect as U, useContext as P, Children as X, isValidElement as Y, cloneElement as Z } from "react";
import R from "classnames";
const _ = N(null), j = N(null), O = N({
  activeSynchroId: null,
  setActiveSynchroId: () => {
  }
}), I = (t, r, e) => {
  if (!t)
    return;
  const o = e == null ? void 0 : e();
  if (o === void 0) {
    console.log(`[immerser-react]: ${r}`);
    return;
  }
  console.log(`[immerser-react]: ${r}`, o);
}, M = ({ children: t, solidClassnamesByLayerId: r, selectorRoot: e, ...o }) => {
  const [s, c] = g(-1), [a, m] = g(null), [u, x] = g(null), d = f(s), l = f(null), v = f(o);
  v.current = o;
  const p = S(() => Object.keys(r), [r]), D = p.join("|"), { debug: w, fromViewportWidth: F, updateLocationHash: T, pagerThreshold: B, scrollAdjustDelay: H, scrollAdjustThreshold: K } = o, y = !!w;
  function k(n) {
    d.current !== n.activeIndex && (I(y, "sync state", () => ({
      activeIndex: n.activeIndex,
      layerProgressArray: n.layerProgressArray,
      previousActiveIndex: d.current
    })), d.current = n.activeIndex, c(n.activeIndex));
  }
  C(() => {
    if (!u) {
      I(y, "skip controller init: renderer root is not ready");
      return;
    }
    I(y, "init controller", () => ({
      layerCount: p.length,
      layerIds: p,
      options: v.current,
      selectorRootSource: e ? "prop" : u.parentNode ? "renderer parent" : "document"
    }));
    const n = new z({
      ...v.current,
      // React renders masks and solid clones, so the core must only measure and drive them.
      hasExternalRenderer: !0,
      selectorRoot: e ?? u.parentNode ?? document
    });
    return y && (window.immerser = n), l.current = n, n.on("stateChange", k), k(n), () => {
      I(y, "destroy controller", () => ({
        activeIndex: n.activeIndex,
        isMounted: n.isMounted
      })), n.destroy(), l.current === n && (l.current = null), d.current !== -1 && (d.current = -1, c(-1));
    };
  }, [u, e]), C(() => {
    var n;
    I(y, "render controller", () => ({
      hasController: !!l.current,
      layerCount: p.length,
      layerIds: p
    })), (n = l.current) == null || n.render();
  }, [D]), U(() => {
    var b;
    const n = v.current;
    I(y, "update controller options", () => ({
      hasController: !!l.current,
      options: n
    })), (b = l.current) == null || b.updateOptions(n);
  }, [w, F, T, B, H, K]);
  const W = S(
    () => ({
      layerIds: p,
      setRendererRootNode: x,
      solidClassnamesByLayerId: r
    }),
    [p, r]
  ), q = S(
    () => ({
      activeSynchroId: a,
      setActiveSynchroId: m
    }),
    [a]
  );
  return /* @__PURE__ */ i(_.Provider, { value: W, children: /* @__PURE__ */ i(j.Provider, { value: s, children: /* @__PURE__ */ i(O.Provider, { value: q, children: t }) }) });
};
M.displayName = "ImmerserProvider";
const $ = (t) => {
  const r = `${t} must be used inside <ImmerserProvider>.`;
  throw new Error(r);
}, h = (t) => {
  const r = P(_);
  return r || $(t), r;
}, A = ({
  as: t,
  children: r,
  className: e,
  name: o,
  style: s,
  ...c
}) => (h("ImmerserSolid"), /* @__PURE__ */ i(t ?? "div", { ...c, className: e, "data-immerser-solid": o, style: G, children: r }));
A.displayName = "ImmerserSolid";
const L = ({
  className: t,
  hoverClassName: r,
  onMouseEnter: e,
  onMouseLeave: o,
  synchroId: s,
  ...c
}) => {
  const { activeSynchroId: a, setActiveSynchroId: m } = P(O);
  function u(d) {
    m(s), e == null || e(d);
  }
  function x(d) {
    m((l) => l === s ? null : l), o == null || o(d);
  }
  return /* @__PURE__ */ i(
    "a",
    {
      ...c,
      className: R(t, {
        [r]: a === s
      }),
      onMouseEnter: u,
      onMouseLeave: x
    }
  );
};
L.displayName = "ImmerserSynchroLink";
const ee = (t) => {
  const r = P(j);
  return r === null && $(t), r;
}, V = ({ activeClassName: t, className: r, as: e = "nav", ...o }) => {
  const { layerIds: s } = h("ImmerserPager"), c = ee("ImmerserPager");
  return /* @__PURE__ */ i(A, { ...o, as: e, className: r, "data-immerser-pager": "", name: "pager", children: s.map((a, m) => /* @__PURE__ */ i(
    L,
    {
      className: R("pager__link", {
        [t]: m === c
      }),
      href: `#${a}`,
      hoverClassName: "_hover",
      synchroId: `pager-${m}`
    },
    a
  )) });
};
V.displayName = "ImmerserPager";
const re = (t, r = {}) => X.map(t, (e) => {
  if (e == null || e === !1)
    return e;
  if (!Y(e) || e.type !== A && e.type !== V)
    throw new Error("Immerser accepts only ImmerserSolid or ImmerserPager as direct children.");
  const o = e.props.name ?? "pager";
  return Z(e, {
    className: R(e.props.className, r[o])
  });
}), E = {
  ...J,
  transform: ""
}, te = ({ children: t, style: r, ...e }) => {
  const { layerIds: o, setRendererRootNode: s, solidClassnamesByLayerId: c } = h("Immerser"), a = f(null);
  return C(() => (s(a.current), () => {
    s(null);
  }), [s]), /* @__PURE__ */ i("div", { ref: a, ...e, "data-immerser": !0, style: Q, children: o.map((m, u) => /* @__PURE__ */ i(
    "div",
    {
      "aria-hidden": u === 0 ? void 0 : !0,
      "data-immerser-layer-id": m,
      "data-immerser-mask": !0,
      style: E,
      children: /* @__PURE__ */ i("div", { "data-immerser-mask-inner": !0, style: E, children: re(t, c[m]) })
    },
    m
  )) });
};
te.displayName = "Immerser";
const ne = ({
  as: t,
  children: r,
  id: e,
  style: o,
  ...s
}) => (h("ImmerserLayer"), /* @__PURE__ */ i(t ?? "div", { id: e, ...s, "data-immerser-layer": !0, children: r }));
ne.displayName = "ImmerserLayer";
export {
  te as Immerser,
  ne as ImmerserLayer,
  V as ImmerserPager,
  M as ImmerserProvider,
  A as ImmerserSolid,
  L as ImmerserSynchroLink
};
