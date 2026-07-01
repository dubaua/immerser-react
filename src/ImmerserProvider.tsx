import ImmerserController, { type Options, type RuntimeOptions } from 'immerser';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ImmerserConfigContext } from './context/immerser-config-context';
import { ImmerserContext } from './context/immerser-context';
import { ImmerserSynchroContext } from './context/immerser-synchro-context';
import { reportDebug } from './utils/report-debug';
import { useMaskInnerRegistry } from './utils/use-mask-inner-registry';

type Props = {
  /** React tree that declares an immerser root, its absolute solids and scroll layers. */
  children?: ReactNode;
  /**
   * Initial event handlers registered when the core controller is created.
   * Changing this prop does not update the current controller.
   */
  on?: Options['on'];
  /** Parent node used for selector discovery. Changing it recreates the core controller. */
  selectorRoot?: Options['selectorRoot'];
  /**
   * React-only per-layer solid modifiers keyed by layer id.
   * This is intentionally not passed to the core controller, even though the core has a similarly named option.
   * The React adapter uses it to render masked solid clones itself.
   */
  solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<RuntimeOptions>;

/**
 * Owns the core `Immerser` controller lifecycle and shares its scroll state with React components.
 * Provider props are adapter-specific props plus `Partial<RuntimeOptions>` from `immerser`.
 * `RuntimeOptions` is the source of hot core options accepted by the React adapter.
 * Event handlers passed through `on` are init-only and registered when the controller is created.
 * `selectorRoot` recreates the core controller when changed.
 * Runtime options are forwarded through `updateOptions`.
 * See [core options docs](https://github.com/dubaua/immerser#options).
 * `solidClassnamesByLayerId` keys must match `ImmerserLayer` ids.
 * `solidClassnamesByLayerId` keeps the same shape as the constructor option,
 * but the adapter uses it to render solid copies inside each layer mask and does not forward it as-is.
 * Init-only and adapter-owned core options are not exposed:
 * `autoMount`, `hasExternalScroll`, `hasExternalRenderer`, `pagerLinkActiveClassname`
 * and the core `solidClassnamesByLayerId` contract.
 * This keeps DOM measurement, mask rendering and scroll listeners in one place
 * while the rest of the API stays declarative.
 *
 * @public
 */
export const ImmerserProvider = ({ children, on, solidClassnamesByLayerId, selectorRoot, ...options }: Props) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSynchroId, setActiveSynchroId] = useState<string | null>(null);
  const [layerIds, setLayerIds] = useState<string[]>(() => Object.keys(solidClassnamesByLayerId));
  const [rendererRootNode, setRendererRootNode] = useState<HTMLDivElement | null>(null);

  const activeIndexRef = useRef(activeIndex);
  const controllerRef = useRef<ImmerserController | null>(null);
  const latestControllerOptionsRef = useRef(options);
  const latestStructureSignatureRef = useRef('');
  const maskInnerRegistry = useMaskInnerRegistry(layerIds);

  const { debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold } =
    options;

  const isDebug = Boolean(debug);
  const latestIsDebugRef = useRef(isDebug);
  const latestLayerIdsRef = useRef(layerIds);

  latestControllerOptionsRef.current = options;
  latestIsDebugRef.current = isDebug;
  latestLayerIdsRef.current = layerIds;

  function syncState(nextController: ImmerserController) {
    if (latestStructureSignatureRef.current !== nextController.structureSignature) {
      const nextLayerIds = Array.from(nextController.layerIds);

      latestStructureSignatureRef.current = nextController.structureSignature;
      latestLayerIdsRef.current = nextLayerIds;
      setLayerIds(nextLayerIds);
    }

    if (activeIndexRef.current === nextController.activeIndex) {
      return;
    }

    reportDebug(latestIsDebugRef.current, 'sync state', () => ({
      activeIndex: nextController.activeIndex,
      layerProgressArray: nextController.layerProgressArray,
      previousActiveIndex: activeIndexRef.current,
    }));

    activeIndexRef.current = nextController.activeIndex;
    setActiveIndex(nextController.activeIndex);
  }

  useLayoutEffect(() => {
    if (!rendererRootNode) {
      reportDebug(latestIsDebugRef.current, 'skip controller init: renderer root is not ready');
      return;
    }

    if (!maskInnerRegistry.isReady) {
      reportDebug(latestIsDebugRef.current, 'skip controller init: mask inner nodes are not ready', () => ({
        layerCount: latestLayerIdsRef.current.length,
        layerIds: latestLayerIdsRef.current,
        maskInnerCount: maskInnerRegistry.nodesRef.current.size,
        maskInnerIds: Array.from(maskInnerRegistry.nodesRef.current.keys()),
      }));
      return;
    }

    reportDebug(latestIsDebugRef.current, 'init controller', () => ({
      layerCount: latestLayerIdsRef.current.length,
      layerIds: latestLayerIdsRef.current,
      options: latestControllerOptionsRef.current,
      selectorRootSource: selectorRoot ? 'prop' : rendererRootNode.parentNode ? 'renderer parent' : 'document',
    }));

    const controller = new ImmerserController({
      ...latestControllerOptionsRef.current,
      // React renders masks and solid clones, so the core must only measure and drive them.
      hasExternalRenderer: true,
      on,
      selectorRoot: selectorRoot ?? rendererRootNode.parentNode ?? document,
    });

    controllerRef.current = controller;
    controller.on('stateChange', syncState);
    syncState(controller);

    return () => {
      reportDebug(latestIsDebugRef.current, 'destroy controller', () => ({
        activeIndex: controller.activeIndex,
        isMounted: controller.isMounted,
      }));

      controller.destroy();

      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      latestStructureSignatureRef.current = '';
      latestLayerIdsRef.current = [];
      setLayerIds([]);

      if (activeIndexRef.current !== -1) {
        activeIndexRef.current = -1;
        setActiveIndex(-1);
      }
    };
  }, [rendererRootNode, selectorRoot, maskInnerRegistry.isReady]);

  useLayoutEffect(() => {
    reportDebug(latestIsDebugRef.current, 'render controller', () => ({
      hasController: Boolean(controllerRef.current),
      layerCount: latestLayerIdsRef.current.length,
      layerIds: latestLayerIdsRef.current,
    }));

    controllerRef.current?.render();
  }, [children, solidClassnamesByLayerId]);

  useEffect(() => {
    const nextOptions = latestControllerOptionsRef.current;

    reportDebug(latestIsDebugRef.current, 'update controller options', () => ({
      hasController: Boolean(controllerRef.current),
      options: nextOptions,
    }));

    controllerRef.current?.updateOptions(nextOptions);
  }, [debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold]);

  const configContextValue = useMemo(
    () => ({
      layerIds,
      registerMaskInner: maskInnerRegistry.register,
      setRendererRootNode,
      solidClassnamesByLayerId,
    }),
    [layerIds, maskInnerRegistry.register, solidClassnamesByLayerId],
  );

  // Keep the context value reference stable between provider renders.
  // React state setters are stable, but the object literal is not.
  const synchroContextValue = useMemo(
    () => ({
      activeSynchroId,
      setActiveSynchroId,
    }),
    [activeSynchroId],
  );

  return (
    <ImmerserConfigContext.Provider value={configContextValue}>
      <ImmerserContext.Provider value={activeIndex}>
        <ImmerserSynchroContext.Provider value={synchroContextValue}>{children}</ImmerserSynchroContext.Provider>
      </ImmerserContext.Provider>
    </ImmerserConfigContext.Provider>
  );
};

ImmerserProvider.displayName = 'ImmerserProvider';
