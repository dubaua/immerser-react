import ImmerserController, { type Options } from 'immerser';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ImmerserConfigContext } from './context/ImmerserConfigContext';
import { ImmerserContext } from './context/ImmerserContext';
import { ImmerserSynchroContext } from './context/immerser-synchro-context';

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
 * Owns the core Immerser controller lifecycle and shares its scroll state with React components.
 * Render-related core options are hidden because React provides external mask markup and solid clones.
 * This keeps DOM measurement, mask rendering and scroll listeners in one place while the rest of the API stays declarative.
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

  function syncState(nextController: ImmerserController) {
    if (activeIndexRef.current === nextController.activeIndex) {
      return;
    }

    console.log('sync state');
    activeIndexRef.current = nextController.activeIndex;
    setActiveIndex(nextController.activeIndex);
  }

  useLayoutEffect(() => {
    console.log('main effect');

    if (!rendererRootNode) {
      return;
    }

    const controller = new ImmerserController({
      ...latestControllerOptionsRef.current,
      // React renders masks and solid clones, so the core must only measure and drive them.
      hasExternalRenderer: true,
      selectorRoot: selectorRoot ?? rendererRootNode.parentNode ?? document,
    });

    controllerRef.current = controller;
    controller.on('stateChange', syncState);
    syncState(controller);

    return () => {
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
    console.log('rerender effect');

    controllerRef.current?.render();
  }, [layerIdsKey]);

  useEffect(() => {
    console.log('update options effect');
    controllerRef.current?.updateOptions(options);
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
