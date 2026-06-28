import { jsx as i } from "react/jsx-runtime";
import z, { InteractiveStyles as G, CroppedFullAbsoluteStyles as J, NotInteractiveStyles as Q } from "immerser";
import { createContext as N, useState as g, useRef as f, useMemo as S, useLayoutEffect as C, useEffect as X, useContext as _, Children as Y, isValidElement as Z, cloneElement as M } from "react";
import P from "classnames";
const b = N(null), D = N(null), V = N({
  activeSynchroId: null,
  setActiveSynchroId: () => {
  }
}), ee = { DEV: !1 }, j = () => {
  const t = ee;
  return t ? !!t.DEV : !0;
}, y = (t, r, e) => {
  if (!t)
    return;
  const o = e == null ? void 0 : e();
  if (o === void 0) {
    console.log(`[immerser-react]: ${r}`);
    return;
  }
  console.log(`[immerser-react]: ${r}`, o);
}, re = ({ children: t, solidClassnamesByLayerId: r, selectorRoot: e, ...o }) => {
  const [s, c] = g(-1), [a, m] = g(null), [d, x] = g(null), u = f(s), l = f(null), I = f(o);
  I.current = o;
  const p = S(() => Object.keys(r), [r]), F = p.join("|"), { debug: A, fromViewportWidth: T, updateLocationHash: B, pagerThreshold: H, scrollAdjustDelay: K, scrollAdjustThreshold: U } = o, v = A ?? j();
  function k(n) {
    u.current !== n.activeIndex && (y(v, "sync state", () => ({
      activeIndex: n.activeIndex,
      layerProgressArray: n.layerProgressArray,
      previousActiveIndex: u.current
    })), u.current = n.activeIndex, c(n.activeIndex));
  }
  C(() => {
    if (!d) {
      y(v, "skip controller init: renderer root is not ready");
      return;
    }
    y(v, "init controller", () => ({
      layerCount: p.length,
      layerIds: p,
      options: I.current,
      selectorRootSource: e ? "prop" : d.parentNode ? "renderer parent" : "document"
    }));
    const n = new z({
      ...I.current,
      // React renders masks and solid clones, so the core must only measure and drive them.
      hasExternalRenderer: !0,
      selectorRoot: e ?? d.parentNode ?? document
    });
    return v && (window.immerser = n), l.current = n, n.on("stateChange", k), k(n), () => {
      y(v, "destroy controller", () => ({
        activeIndex: n.activeIndex,
        isMounted: n.isMounted
      })), n.destroy(), l.current === n && (l.current = null), u.current !== -1 && (u.current = -1, c(-1));
    };
  }, [d, e]), C(() => {
    var n;
    y(v, "render controller", () => ({
      hasController: !!l.current,
      layerCount: p.length,
      layerIds: p
    })), (n = l.current) == null || n.render();
  }, [F]), X(() => {
    var w;
    const n = I.current;
    y(v, "update controller options", () => ({
      hasController: !!l.current,
      options: n
    })), (w = l.current) == null || w.updateOptions(n);
  }, [A, T, B, H, K, U]);
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
  return /* @__PURE__ */ i(b.Provider, { value: W, children: /* @__PURE__ */ i(D.Provider, { value: s, children: /* @__PURE__ */ i(V.Provider, { value: q, children: t }) }) });
};
re.displayName = "ImmerserProvider";
const O = (t) => {
  const r = `${t} must be used inside <ImmerserProvider>.`;
  if (j())
    throw new Error(r);
  console.error(r);
}, h = (t) => {
  const r = _(b);
  return r || O(t), r;
}, R = ({
  as: t,
  children: r,
  className: e,
  name: o,
  style: s,
  ...c
}) => (h("ImmerserSolid"), /* @__PURE__ */ i(t ?? "div", { ...c, className: e, "data-immerser-solid": o, style: G, children: r }));
R.displayName = "ImmerserSolid";
const $ = ({
  className: t,
  hoverClassName: r,
  onMouseEnter: e,
  onMouseLeave: o,
  synchroId: s,
  ...c
}) => {
  const { activeSynchroId: a, setActiveSynchroId: m } = _(V);
  function d(u) {
    m(s), e == null || e(u);
  }
  function x(u) {
    m((l) => l === s ? null : l), o == null || o(u);
  }
  return /* @__PURE__ */ i(
    "a",
    {
      ...c,
      className: P(t, {
        [r]: a === s
      }),
      onMouseEnter: d,
      onMouseLeave: x
    }
  );
};
$.displayName = "ImmerserSynchroLink";
const te = (t) => {
  const r = _(D);
  return r === null && O(t), r;
}, L = ({ activeClassName: t, className: r, as: e = "nav", ...o }) => {
  const { layerIds: s } = h("ImmerserPager"), c = te("ImmerserPager");
  return /* @__PURE__ */ i(R, { ...o, as: e, className: r, "data-immerser-pager": "", name: "pager", children: s.map((a, m) => /* @__PURE__ */ i(
    $,
    {
      className: P("pager__link", {
        [t]: m === c
      }),
      href: `#${a}`,
      hoverClassName: "_hover",
      synchroId: `pager-${m}`
    },
    a
  )) });
};
L.displayName = "ImmerserPager";
const ne = (t, r = {}) => Y.map(t, (e) => {
  if (e == null || e === !1)
    return e;
  if (!Z(e) || e.type !== R && e.type !== L)
    throw new Error("Immerser accepts only ImmerserSolid or ImmerserPager as direct children.");
  const o = e.props.name ?? "pager";
  return M(e, {
    className: P(e.props.className, r[o])
  });
}), E = {
  ...J,
  transform: ""
}, oe = ({ children: t, style: r, ...e }) => {
  const { layerIds: o, setRendererRootNode: s, solidClassnamesByLayerId: c } = h("Immerser"), a = f(null);
  return C(() => (s(a.current), () => {
    s(null);
  }), [s]), /* @__PURE__ */ i("div", { ref: a, ...e, "data-immerser": !0, style: Q, children: o.map((m, d) => /* @__PURE__ */ i(
    "div",
    {
      "aria-hidden": d === 0 ? void 0 : !0,
      "data-immerser-layer-id": m,
      "data-immerser-mask": !0,
      style: E,
      children: /* @__PURE__ */ i("div", { "data-immerser-mask-inner": !0, style: E, children: ne(t, c[m]) })
    },
    m
  )) });
};
oe.displayName = "Immerser";
const se = ({
  as: t,
  children: r,
  id: e,
  style: o,
  ...s
}) => (h("ImmerserLayer"), /* @__PURE__ */ i(t ?? "div", { id: e, ...s, "data-immerser-layer": !0, children: r }));
se.displayName = "ImmerserLayer";
export {
  oe as Immerser,
  se as ImmerserLayer,
  L as ImmerserPager,
  re as ImmerserProvider,
  R as ImmerserSolid,
  $ as ImmerserSynchroLink
};
