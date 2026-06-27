import ImmerserController, { type Options } from 'immerser';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ImmerserConfigContext } from './context/ImmerserConfigContext';
import { ImmerserContext } from './context/ImmerserContext';
import { ImmerserSynchroContext } from './context/immerser-synchro-context';

type Props = {
  children?: ReactNode;
  solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<Omit<Options, 'hasExternalRenderer' | 'pagerLinkActiveClassname' | 'solidClassnamesByLayerId'>>;

export const ImmerserProvider = ({ children, solidClassnamesByLayerId, selectorRoot, ...options }: Props) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSynchroId, setActiveSynchroId] = useState<string | null>(null);
  const [rendererRootNode, setRendererRootNode] = useState<HTMLDivElement | null>(null);

  const activeIndexRef = useRef(activeIndex);
  const controllerRef = useRef<ImmerserController | null>(null);
  const optionsRef = useRef(options);

  optionsRef.current = options;

  const layerIds = useMemo(() => Object.keys(solidClassnamesByLayerId), [solidClassnamesByLayerId]);
  const layerIdsKey = layerIds.join('|');

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
      ...optionsRef.current,
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
  }, [options]);

  const configContextValue = useMemo(
    () => ({
      layerIds,
      setRendererRootNode,
      solidClassnamesByLayerId,
    }),
    [layerIds, solidClassnamesByLayerId],
  );

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
