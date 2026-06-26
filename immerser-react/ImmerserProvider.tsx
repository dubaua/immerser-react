import ImmerserController, { type Options } from 'immerser';
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type ReactNode,
} from 'react';

import { ImmerserContext } from './context/ImmerserContext';
import { isDevEnv } from './utils/isDevEnv';

type Props = {
  children?: ReactNode;
} & Partial<Options>;

const assignRef = (ref: ForwardedRef<ImmerserController | null>, value: ImmerserController | null) => {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  ref.current = value;
};

export const ImmerserProvider = forwardRef<ImmerserController | null, Props>(
  (
    {
      children,
      on,
      solidClassnamesByLayerId = {},
      selectorRoot,
      hasExternalRenderer: _hasExternalRenderer,
      ...rest
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null);
    const controllerRef = useRef<ImmerserController | null>(null);
    const optionsRef = useRef<Partial<Options>>({});
    const layerIds = useMemo(() => Object.keys(solidClassnamesByLayerId), [solidClassnamesByLayerId]);

    optionsRef.current = {
      ...rest,
      hasExternalRenderer: true,
      on: {
        ...on,
        activeLayerChange(activeLayerIndex, immerser) {
          setActiveIndex(immerser.activeIndex);
          on?.activeLayerChange?.(activeLayerIndex, immerser);
        },
      },
      selectorRoot: selectorRoot ?? rootNode?.parentNode ?? document,
      solidClassnamesByLayerId,
    };

    useLayoutEffect(() => {
      if (!rootNode) {
        return;
      }

      if (layerIds.length === 0 && isDevEnv()) {
        console.warn('ImmerserProvider requires at least one layer id in solidClassnamesByLayerId.');
      }

      const controller = new ImmerserController(optionsRef.current);
      controllerRef.current = controller;
      setActiveIndex(controller.activeIndex);
      assignRef(ref, controller);

      return () => {
        controller.destroy();
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
        setActiveIndex(-1);
        assignRef(ref, null);
      };
    }, [ref, rootNode, layerIds.join('|')]);

    useEffect(() => {
      const runtimeOptions = Object.fromEntries(
        Object.entries({
          debug: rest.debug,
          fromViewportWidth: rest.fromViewportWidth,
          hasToUpdateHash: rest.hasToUpdateHash,
          pagerThreshold: rest.pagerThreshold,
          scrollAdjustDelay: rest.scrollAdjustDelay,
          scrollAdjustThreshold: rest.scrollAdjustThreshold,
        }).filter(([, value]) => value !== undefined),
      );

      controllerRef.current?.updateOptions(runtimeOptions);
    }, [
      rest.debug,
      rest.fromViewportWidth,
      rest.hasToUpdateHash,
      rest.pagerThreshold,
      rest.scrollAdjustDelay,
      rest.scrollAdjustThreshold,
    ]);

    useEffect(() => {
      controllerRef.current?.render();
    });

    const contextValue = useMemo(
      () => ({
        activeIndex,
        layerIds,
        setRootNode,
        solidClassnamesByLayerId,
      }),
      [activeIndex, layerIds, solidClassnamesByLayerId],
    );

    return <ImmerserContext.Provider value={contextValue}>{children}</ImmerserContext.Provider>;
  },
);

ImmerserProvider.displayName = 'ImmerserProvider';
