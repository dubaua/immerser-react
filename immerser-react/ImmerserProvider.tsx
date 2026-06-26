import ImmerserController, { type Options } from 'immerser';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ImmerserContext } from './context/ImmerserContext';
import { isDevEnv } from './utils/is-dev-env';

type Props = {
  children?: ReactNode;
  solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<Omit<Options, 'hasExternalRenderer' | 'pagerLinkActiveClassname' | 'solidClassnamesByLayerId'>>;

export const ImmerserProvider = ({ children, solidClassnamesByLayerId, selectorRoot, ...options }: Props) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debug, setDebug] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [rootNode, setRootNode] = useState<HTMLElement | null>(null);
  const [rendererRootNode, setRendererRootNode] = useState<HTMLDivElement | null>(null);

  const controllerRef = useRef<ImmerserController | null>(null);
  const optionsRef = useRef(options);

  optionsRef.current = options;

  const layerIds = useMemo(() => Object.keys(solidClassnamesByLayerId), [solidClassnamesByLayerId]);
  const layerIdsKey = layerIds.join('|');

  const syncState = useCallback((controller: ImmerserController) => {
    setActiveIndex((value) => (value === controller.activeIndex ? value : controller.activeIndex));
    setDebug((value) => (value === controller.debug ? value : controller.debug));
    setIsMounted((value) => (value === controller.isMounted ? value : controller.isMounted));
    setRootNode((value) => (value === controller.rootNode ? value : controller.rootNode));
  }, []);

  useEffect(() => {
    if (layerIds.length === 0 && isDevEnv()) {
      console.warn('ImmerserProvider requires at least one layer id in solidClassnamesByLayerId.');
    }
  }, [layerIds.length]);

  useLayoutEffect(() => {
    if (!rendererRootNode) {
      return;
    }

    const controller = new ImmerserController({
      ...optionsRef.current,
      hasExternalRenderer: true,
      selectorRoot: selectorRoot ?? rendererRootNode.parentNode ?? document,
    });

    controllerRef.current = controller;
    controller.on('stateChange', syncState);
    syncState(controller);

    return () => {
      controller.off('stateChange', syncState);
      controller.destroy();

      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      setActiveIndex(-1);
      setDebug(false);
      setIsMounted(false);
      setRootNode(null);
    };
  }, [rendererRootNode, selectorRoot, syncState]);

  useLayoutEffect(() => {
    controllerRef.current?.render();
  }, [layerIdsKey]);

  useEffect(() => {
    controllerRef.current?.updateOptions(options);
  }, [options]);

  const contextValue = useMemo(
    () => ({
      activeIndex,
      debug,
      isMounted,
      layerIds,
      rootNode,
      setRendererRootNode,
      solidClassnamesByLayerId,
    }),
    [activeIndex, debug, isMounted, layerIds, rootNode, solidClassnamesByLayerId],
  );

  return <ImmerserContext.Provider value={contextValue}>{children}</ImmerserContext.Provider>;
};

ImmerserProvider.displayName = 'ImmerserProvider';
