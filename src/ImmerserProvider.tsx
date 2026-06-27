import ImmerserController, { type Options } from 'immerser';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ImmerserConfigContext } from './context/ImmerserConfigContext';
import { ImmerserContext } from './context/ImmerserContext';
import { ImmerserSynchroContext } from './context/immerser-synchro-context';
import { isDevEnv } from './utils/is-dev-env';
import { reportDebug } from './utils/report-debug';

type Props = {
  /** React tree that declares an immerser root, its absolute solids and scroll layers. */
  children?: ReactNode;
  /**
   * React-only per-layer solid modifiers keyed by layer id.
   * This is intentionally not passed to the core controller, even though the core has a similarly named option.
   * The React adapter uses it to derive layer order and render masked solid clones itself.
   */
  solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<Omit<Options, 'hasExternalRenderer' | 'pagerLinkActiveClassname' | 'solidClassnamesByLayerId'>>;

/**
 * Owns the core `Immerser` controller lifecycle and shares its scroll state with React components.
 * Accepts `Immerser` constructor options as props, except options owned by the React adapter:
 * `hasExternalRenderer`, `pagerLinkActiveClassname` and `solidClassnamesByLayerId`.
 * See [core options docs](https://github.com/dubaua/immerser#options).
 * `solidClassnamesByLayerId` keys must match `ImmerserLayer` ids.
 * `solidClassnamesByLayerId` keeps the same shape as the constructor option,
 * but the adapter uses it to render solid copies inside each layer mask and does not forward it as-is.
 * Render-related core options are hidden because React provides external mask markup and solid clones.
 * This keeps DOM measurement, mask rendering and scroll listeners in one place
 * while the rest of the API stays declarative.
 */
export const ImmerserProvider = ({ children, solidClassnamesByLayerId, selectorRoot, ...options }: Props) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSynchroId, setActiveSynchroId] = useState<string | null>(null);
  const [rendererRootNode, setRendererRootNode] = useState<HTMLDivElement | null>(null);

  const activeIndexRef = useRef(activeIndex);
  const controllerRef = useRef<ImmerserController | null>(null);
  const latestControllerOptionsRef = useRef(options);

  latestControllerOptionsRef.current = options;

  const layerIds = useMemo(() => Object.keys(solidClassnamesByLayerId), [solidClassnamesByLayerId]);
  const layerIdsKey = layerIds.join('|');
  const { debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold } =
    options;

  const isDebug = debug ?? isDevEnv();

  function syncState(nextController: ImmerserController) {
    if (activeIndexRef.current === nextController.activeIndex) {
      return;
    }

    reportDebug(isDebug, 'sync state', () => ({
      activeIndex: nextController.activeIndex,
      layerProgressArray: nextController.layerProgressArray,
      previousActiveIndex: activeIndexRef.current,
    }));

    activeIndexRef.current = nextController.activeIndex;
    setActiveIndex(nextController.activeIndex);
  }

  useLayoutEffect(() => {
    if (!rendererRootNode) {
      reportDebug(isDebug, 'skip controller init: renderer root is not ready');
      return;
    }

    reportDebug(isDebug, 'init controller', () => ({
      layerCount: layerIds.length,
      layerIds,
      options: latestControllerOptionsRef.current,
      selectorRootSource: selectorRoot ? 'prop' : rendererRootNode.parentNode ? 'renderer parent' : 'document',
    }));

    const controller = new ImmerserController({
      ...latestControllerOptionsRef.current,
      // React renders masks and solid clones, so the core must only measure and drive them.
      hasExternalRenderer: true,
      selectorRoot: selectorRoot ?? rendererRootNode.parentNode ?? document,
    });

    //@ts-ignore
    isDebug && (window.immerser = controller);

    controllerRef.current = controller;
    controller.on('stateChange', syncState);
    syncState(controller);

    return () => {
      reportDebug(isDebug, 'destroy controller', () => ({
        activeIndex: controller.activeIndex,
        isMounted: controller.isMounted,
      }));

      controller.destroy();

      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      if (activeIndexRef.current !== -1) {
        activeIndexRef.current = -1;
        setActiveIndex(-1);
      }
    };
  }, [rendererRootNode, selectorRoot]);

  useLayoutEffect(() => {
    reportDebug(isDebug, 'render controller', () => ({
      hasController: Boolean(controllerRef.current),
      layerCount: layerIds.length,
      layerIds,
    }));

    controllerRef.current?.render();
  }, [layerIdsKey]);

  useEffect(() => {
    const nextOptions = latestControllerOptionsRef.current;

    reportDebug(isDebug, 'update controller options', () => ({
      hasController: Boolean(controllerRef.current),
      options: nextOptions,
    }));

    controllerRef.current?.updateOptions(nextOptions);
  }, [debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold]);

  const configContextValue = useMemo(
    () => ({
      layerIds,
      setRendererRootNode,
      solidClassnamesByLayerId,
    }),
    [layerIds, solidClassnamesByLayerId],
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
