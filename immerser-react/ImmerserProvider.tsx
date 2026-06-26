import ImmerserController, { type Options } from 'immerser';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ImmerserConfigContext } from './context/ImmerserConfigContext';
import { ImmerserContext } from './context/ImmerserContext';
import { isDevEnv } from './utils/is-dev-env';

type Props = {
  children?: ReactNode;
  solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<Omit<Options, 'hasExternalRenderer' | 'pagerLinkActiveClassname' | 'solidClassnamesByLayerId'>>;

export const ImmerserProvider = ({ children, solidClassnamesByLayerId, selectorRoot, ...options }: Props) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rendererRootNode, setRendererRootNode] = useState<HTMLDivElement | null>(null);

  const activeIndexRef = useRef(activeIndex);
  const controllerRef = useRef<ImmerserController | null>(null);
  const optionsRef = useRef(options);
  const rendererRootNodeRef = useRef(rendererRootNode);
  const updateRendererRootNodeRef = useRef((nextRendererRootNode: HTMLDivElement | null) => {
    if (rendererRootNodeRef.current === nextRendererRootNode) {
      return;
    }

    rendererRootNodeRef.current = nextRendererRootNode;
    setRendererRootNode(nextRendererRootNode);
  });

  optionsRef.current = options;

  const layerIds = useMemo(() => Object.keys(solidClassnamesByLayerId), [solidClassnamesByLayerId]);
  const layerIdsKey = layerIds.join('|');

  useEffect(() => {
    console.log('effect validator');

    if (layerIds.length === 0 && isDevEnv()) {
      console.warn('ImmerserProvider requires at least one layer id in solidClassnamesByLayerId.');
    }
  }, [layerIds.length]);

  useLayoutEffect(() => {
    console.log('main effect');

    if (!rendererRootNode) {
      return;
    }

    const controller = new ImmerserController({
      ...optionsRef.current,
      hasExternalRenderer: true,
      selectorRoot: selectorRoot ?? rendererRootNode.parentNode ?? document,
    });

    function syncState(nextController: ImmerserController) {
      if (activeIndexRef.current === nextController.activeIndex) {
        return;
      }

      console.log('sync state');
      activeIndexRef.current = nextController.activeIndex;
      setActiveIndex(nextController.activeIndex);
    }

    controllerRef.current = controller;
    controller.on('stateChange', syncState);
    syncState(controller);

    return () => {
      controller.off('stateChange', syncState);
      controller.destroy();

      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      if (activeIndexRef.current !== -1) {
        console.log('sync state');
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
  }, [options]);

  const configContextValue = useMemo(
    () => ({
      layerIds,
      setRendererRootNode: updateRendererRootNodeRef.current,
      solidClassnamesByLayerId,
    }),
    [layerIds, solidClassnamesByLayerId],
  );

  return (
    <ImmerserConfigContext.Provider value={configContextValue}>
      <ImmerserContext.Provider value={activeIndex}>{children}</ImmerserContext.Provider>
    </ImmerserConfigContext.Provider>
  );
};

ImmerserProvider.displayName = 'ImmerserProvider';
