import { jsx } from "react/jsx-runtime";
import ImmerserController, { InteractiveStyles, CroppedFullAbsoluteStyles, NotInteractiveStyles } from "immerser";
import { createContext, useRef, useState, useCallback, useLayoutEffect, useEffect, useMemo, useContext, Fragment, Children, isValidElement, cloneElement } from "react";
import classNames from "classnames";
const ImmerserConfigContext = createContext(null);
const ImmerserContext = createContext(null);
const ImmerserSynchroContext = createContext({
  activeSynchroId: null,
  setActiveSynchroId: () => {
  }
});
const reportDebug = (isDebug, message, getPayload) => {
  if (!isDebug) {
    return;
  }
  const resolvedPayload = getPayload == null ? void 0 : getPayload();
  if (resolvedPayload === void 0) {
    console.log(`[immerser-react]: ${message}`);
    return;
  }
  console.log(`[immerser-react]: ${message}`, resolvedPayload);
};
const useImmerserRegistry = () => {
  const maskInnerNodesRef = useRef(/* @__PURE__ */ new Map());
  const [layerIds, setLayerIds] = useState([]);
  const [, setReadyVersion] = useState(0);
  const isReady = layerIds.length > 0 && maskInnerNodesRef.current.size === layerIds.length && layerIds.every((layerId) => maskInnerNodesRef.current.has(layerId));
  const registerLayer = useCallback((id) => {
    setLayerIds((currentLayerIds) => {
      if (currentLayerIds.includes(id)) {
        return currentLayerIds;
      }
      return [...currentLayerIds, id];
    });
  }, []);
  const unregisterLayer = useCallback((id) => {
    setLayerIds((currentLayerIds) => currentLayerIds.filter((layerId) => layerId !== id));
  }, []);
  const registerMaskInner = useCallback((id, node) => {
    if (node) {
      if (maskInnerNodesRef.current.get(id) === node) {
        return;
      }
      maskInnerNodesRef.current.set(id, node);
    } else {
      if (!maskInnerNodesRef.current.has(id)) {
        return;
      }
      maskInnerNodesRef.current.delete(id);
    }
    setReadyVersion((version) => version + 1);
  }, []);
  return {
    isReady,
    layerIds,
    maskInnerNodesRef,
    registerLayer,
    unregisterLayer,
    registerMaskInner
  };
};
const ImmerserProvider = ({ children, on, solidClassnamesByLayerId, selectorRoot, ...options }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSynchroId, setActiveSynchroId] = useState(null);
  const [rendererRootNode, setRendererRootNode] = useState(null);
  const activeIndexRef = useRef(activeIndex);
  const controllerRef = useRef(null);
  const controllerInitCountRef = useRef(0);
  const latestControllerOptionsRef = useRef(options);
  const immerserRegistry = useImmerserRegistry();
  const layerIds = immerserRegistry.layerIds;
  const { debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold } = options;
  const isDebug = Boolean(debug);
  const latestIsDebugRef = useRef(isDebug);
  const latestLayerIdsRef = useRef(layerIds);
  latestControllerOptionsRef.current = options;
  latestIsDebugRef.current = isDebug;
  latestLayerIdsRef.current = layerIds;
  function syncState(nextController) {
    if (nextController.activeIndex === -1 && nextController.layerProgressArray.length === 0 && latestLayerIdsRef.current.length > 0) {
      return;
    }
    if (activeIndexRef.current === nextController.activeIndex) {
      return;
    }
    reportDebug(latestIsDebugRef.current, "sync state", () => ({
      activeIndex: nextController.activeIndex,
      layerProgressArray: nextController.layerProgressArray,
      previousActiveIndex: activeIndexRef.current
    }));
    activeIndexRef.current = nextController.activeIndex;
    setActiveIndex(nextController.activeIndex);
  }
  useLayoutEffect(() => {
    return () => {
      const controller = controllerRef.current;
      if (!controller) {
        return;
      }
      reportDebug(latestIsDebugRef.current, "destroy controller", () => ({
        activeIndex: controller.activeIndex,
        isMounted: controller.isMounted
      }));
      controller.destroy();
      controllerRef.current = null;
      if (activeIndexRef.current !== -1) {
        activeIndexRef.current = -1;
        setActiveIndex(-1);
      }
    };
  }, [rendererRootNode, selectorRoot]);
  useLayoutEffect(() => {
    if (controllerRef.current) {
      return;
    }
    if (!rendererRootNode) {
      reportDebug(latestIsDebugRef.current, "skip controller init: renderer root is not ready");
      return;
    }
    if (!immerserRegistry.isReady) {
      reportDebug(latestIsDebugRef.current, "skip controller init: mask inner nodes are not ready", () => ({
        layerCount: latestLayerIdsRef.current.length,
        layerIds: latestLayerIdsRef.current,
        maskInnerCount: immerserRegistry.maskInnerNodesRef.current.size,
        maskInnerIds: Array.from(immerserRegistry.maskInnerNodesRef.current.keys())
      }));
      return;
    }
    const controllerNumber = controllerInitCountRef.current + 1;
    controllerInitCountRef.current = controllerNumber;
    if (controllerNumber > 1) {
      console.log("[immerser-react]: controller recreated", { controllerNumber });
    }
    reportDebug(latestIsDebugRef.current, "init controller", () => ({
      layerCount: latestLayerIdsRef.current.length,
      layerIds: latestLayerIdsRef.current,
      options: latestControllerOptionsRef.current,
      selectorRootSource: selectorRoot ? "prop" : rendererRootNode.parentNode ? "renderer parent" : "document"
    }));
    const controller = new ImmerserController({
      ...latestControllerOptionsRef.current,
      // React renders masks and solid clones, so the core must only measure and drive them.
      hasExternalRenderer: true,
      on,
      selectorRoot: selectorRoot ?? rendererRootNode.parentNode ?? document
    });
    controllerRef.current = controller;
    controller.on("stateChange", syncState);
    syncState(controller);
  }, [rendererRootNode, selectorRoot, immerserRegistry.isReady]);
  useLayoutEffect(() => {
    var _a;
    if (!immerserRegistry.isReady) {
      reportDebug(latestIsDebugRef.current, "skip controller render: mask inner nodes are not ready", () => ({
        hasController: Boolean(controllerRef.current),
        layerCount: latestLayerIdsRef.current.length,
        layerIds: latestLayerIdsRef.current,
        maskInnerCount: immerserRegistry.maskInnerNodesRef.current.size,
        maskInnerIds: Array.from(immerserRegistry.maskInnerNodesRef.current.keys())
      }));
      return;
    }
    reportDebug(latestIsDebugRef.current, "render controller", () => ({
      hasController: Boolean(controllerRef.current),
      layerCount: latestLayerIdsRef.current.length,
      layerIds: latestLayerIdsRef.current
    }));
    (_a = controllerRef.current) == null ? void 0 : _a.render();
  }, [children, layerIds, immerserRegistry.isReady, solidClassnamesByLayerId]);
  useEffect(() => {
    var _a;
    const nextOptions = latestControllerOptionsRef.current;
    reportDebug(latestIsDebugRef.current, "update controller options", () => ({
      hasController: Boolean(controllerRef.current),
      options: nextOptions
    }));
    (_a = controllerRef.current) == null ? void 0 : _a.updateOptions(nextOptions);
  }, [debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold]);
  const configContextValue = useMemo(
    () => ({
      layerIds,
      registerLayer: immerserRegistry.registerLayer,
      registerMaskInner: immerserRegistry.registerMaskInner,
      setRendererRootNode,
      solidClassnamesByLayerId,
      unregisterLayer: immerserRegistry.unregisterLayer
    }),
    [
      layerIds,
      immerserRegistry.registerLayer,
      immerserRegistry.registerMaskInner,
      immerserRegistry.unregisterLayer,
      solidClassnamesByLayerId
    ]
  );
  const synchroContextValue = useMemo(
    () => ({
      activeSynchroId,
      setActiveSynchroId
    }),
    [activeSynchroId]
  );
  return /* @__PURE__ */ jsx(ImmerserConfigContext.Provider, { value: configContextValue, children: /* @__PURE__ */ jsx(ImmerserContext.Provider, { value: activeIndex, children: /* @__PURE__ */ jsx(ImmerserSynchroContext.Provider, { value: synchroContextValue, children }) }) });
};
ImmerserProvider.displayName = "ImmerserProvider";
const throwOutsideProviderError = (componentName) => {
  const message = `${componentName} must be used inside <ImmerserProvider>.`;
  throw new Error(message);
};
const useImmerserConfigContext = (componentName) => {
  const context = useContext(ImmerserConfigContext);
  if (!context) {
    throwOutsideProviderError(componentName);
  }
  return context;
};
const ImmerserSolid = ({
  as,
  children,
  className,
  name,
  style: _style,
  ...rest
}) => {
  useImmerserConfigContext("ImmerserSolid");
  const Component = as ?? "div";
  return /* @__PURE__ */ jsx(Component, { ...rest, className, "data-immerser-solid": name, style: InteractiveStyles, children });
};
ImmerserSolid.displayName = "ImmerserSolid";
const ImmerserSynchroLink = ({
  className,
  hoverClassName,
  onMouseEnter,
  onMouseLeave,
  synchroId,
  ...rest
}) => {
  const { activeSynchroId, setActiveSynchroId } = useContext(ImmerserSynchroContext);
  function handleMouseEnter(event) {
    setActiveSynchroId(synchroId);
    onMouseEnter == null ? void 0 : onMouseEnter(event);
  }
  function handleMouseLeave(event) {
    setActiveSynchroId((currentSynchroId) => currentSynchroId === synchroId ? null : currentSynchroId);
    onMouseLeave == null ? void 0 : onMouseLeave(event);
  }
  return /* @__PURE__ */ jsx(
    "a",
    {
      ...rest,
      className: classNames(className, {
        [hoverClassName]: activeSynchroId === synchroId
      }),
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  );
};
ImmerserSynchroLink.displayName = "ImmerserSynchroLink";
const useImmerserContext = (componentName) => {
  const context = useContext(ImmerserContext);
  if (context === null) {
    throwOutsideProviderError(componentName);
  }
  return context;
};
const ImmerserPager = ({
  activeClassName,
  className,
  linkClassName,
  as = "nav",
  hoverClassName = "_hover",
  renderLink,
  ...rest
}) => {
  const { layerIds } = useImmerserConfigContext("ImmerserPager");
  const activeIndex = useImmerserContext("ImmerserPager");
  return /* @__PURE__ */ jsx(ImmerserSolid, { ...rest, as, className, "data-immerser-pager": "", name: "pager", children: layerIds.map((layerId, layerIndex) => {
    const isActive = layerIndex === activeIndex;
    if (renderLink) {
      return /* @__PURE__ */ jsx(Fragment, { children: renderLink({ isActive, layerId, layerIndex }) }, layerId);
    }
    return /* @__PURE__ */ jsx(
      ImmerserSynchroLink,
      {
        className: classNames(linkClassName, {
          [activeClassName]: isActive
        }),
        href: `#${layerId}`,
        hoverClassName,
        synchroId: `pager-${layerIndex}`
      },
      layerId
    );
  }) });
};
ImmerserPager.displayName = "ImmerserPager";
const renderSolidsForLayer = (children, solidClassnames = {}) => Children.map(children, (child) => {
  if (child === null || child === void 0 || child === false) {
    return child;
  }
  if (!isValidElement(child) || child.type !== ImmerserSolid && child.type !== ImmerserPager) {
    throw new Error("Immerser accepts only ImmerserSolid or ImmerserPager as direct children.");
  }
  const name = child.props.name ?? "pager";
  return cloneElement(child, {
    className: classNames(child.props.className, solidClassnames[name])
  });
});
const maskStyle = {
  ...CroppedFullAbsoluteStyles
};
const Immerser = ({ children, style: _style, ...rest }) => {
  const { layerIds, registerMaskInner, setRendererRootNode, solidClassnamesByLayerId } = useImmerserConfigContext("Immerser");
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    setRendererRootNode(rootRef.current);
    return () => {
      setRendererRootNode(null);
    };
  }, [setRendererRootNode]);
  return /* @__PURE__ */ jsx("div", { ref: rootRef, ...rest, "data-immerser": "", style: NotInteractiveStyles, children: layerIds.map((layerId, layerIndex) => /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": layerIndex === 0 ? void 0 : true,
      "data-immerser-layer-id": layerId,
      "data-immerser-mask": "",
      style: maskStyle,
      children: /* @__PURE__ */ jsx("div", { ref: (node) => registerMaskInner(layerId, node), "data-immerser-mask-inner": "", style: maskStyle, children: renderSolidsForLayer(children, solidClassnamesByLayerId[layerId]) })
    },
    layerId
  )) });
};
Immerser.displayName = "Immerser";
const ImmerserLayer = ({
  as,
  children,
  id,
  style: _style,
  ...rest
}) => {
  const { registerLayer, unregisterLayer } = useImmerserConfigContext("ImmerserLayer");
  const Component = as ?? "div";
  useLayoutEffect(() => {
    registerLayer(id);
    return () => {
      unregisterLayer(id);
    };
  }, [id, registerLayer, unregisterLayer]);
  return /* @__PURE__ */ jsx(Component, { id, ...rest, "data-immerser-layer": true, children });
};
ImmerserLayer.displayName = "ImmerserLayer";
export {
  Immerser,
  ImmerserLayer,
  ImmerserPager,
  ImmerserProvider,
  ImmerserSolid,
  ImmerserSynchroLink
};
