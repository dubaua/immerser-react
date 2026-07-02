import ImmerserController, { type Options, type RuntimeOptions } from 'immerser';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ImmerserConfigContext } from './context/immerser-config-context';
import { ImmerserContext } from './context/immerser-context';
import { ImmerserSynchroContext } from './context/immerser-synchro-context';

import { useImmerserRegistry } from './utils/use-immerser-registry';

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
  const [rendererRootNode, setRendererRootNode] = useState<HTMLDivElement | null>(null);

  const activeIndexRef = useRef(activeIndex);
  const controllerRef = useRef<ImmerserController | null>(null);
  const latestControllerOptionsRef = useRef(options);
  const immerserRegistry = useImmerserRegistry();
  const layerIds = immerserRegistry.layerIds;

  const { debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold } =
    options;

  const latestLayerIdsRef = useRef(layerIds);

  latestControllerOptionsRef.current = options;
  latestLayerIdsRef.current = layerIds;

  function syncState(nextController: ImmerserController) {
    if (
      (nextController.activeIndex === -1 &&
        nextController.layerProgressArray.length === 0 &&
        latestLayerIdsRef.current.length > 0) ||
      activeIndexRef.current === nextController.activeIndex
    ) {
      return;
    }

    activeIndexRef.current = nextController.activeIndex;
    setActiveIndex(nextController.activeIndex);
  }

  useLayoutEffect(() => {
    return () => {
      const controller = controllerRef.current;

      if (!controller) {
        return;
      }

      controller.destroy();
      controllerRef.current = null;

      if (activeIndexRef.current !== -1) {
        activeIndexRef.current = -1;
        setActiveIndex(-1);
      }
    };
  }, [rendererRootNode, selectorRoot]);

  useLayoutEffect(() => {
    if (controllerRef.current || !rendererRootNode || !immerserRegistry.isReady) {
      return;
    }

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
  }, [rendererRootNode, selectorRoot, immerserRegistry.isReady]);

  useLayoutEffect(() => {
    if (!immerserRegistry.isReady) {
      return;
    }

    controllerRef.current?.render();
  }, [children, layerIds, immerserRegistry.isReady, solidClassnamesByLayerId]);

  useEffect(() => {
    const nextOptions = latestControllerOptionsRef.current;

    controllerRef.current?.updateOptions(nextOptions);
  }, [debug, fromViewportWidth, updateLocationHash, pagerThreshold, scrollAdjustDelay, scrollAdjustThreshold]);

  const configContextValue = useMemo(
    () => ({
      layerIds,
      registerLayer: immerserRegistry.registerLayer,
      registerMaskInner: immerserRegistry.registerMaskInner,
      setRendererRootNode,
      solidClassnamesByLayerId,
      unregisterLayer: immerserRegistry.unregisterLayer,
    }),
    [
      layerIds,
      immerserRegistry.registerLayer,
      immerserRegistry.registerMaskInner,
      immerserRegistry.unregisterLayer,
      solidClassnamesByLayerId,
    ],
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
