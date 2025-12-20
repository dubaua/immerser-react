import ImmerserController, { type Options } from 'immerser';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';

import { ImmerserContext, isDevEnv } from './internal';

export type ImmerserProps = PropsWithChildren<
  {
    options?: Partial<Options>;
    warnOnMissingLayers?: boolean;
  } & HTMLAttributes<HTMLDivElement>
>;

const Immerser = forwardRef<ImmerserController | null, ImmerserProps>(
  ({ options, warnOnMissingLayers = true, children, ...rest }, ref) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<ImmerserController | null>(null);
    const optionsRef = useRef(options);
    const warnOnMissingLayersRef = useRef(warnOnMissingLayers);

    useImperativeHandle(ref, () => instance, [instance]);

    useEffect(() => {
      if (!rootRef.current) {
        return;
      }

      if (warnOnMissingLayersRef.current && isDevEnv()) {
        const layerNodes = rootRef.current.querySelectorAll('[data-immerser-layer]');

        if (!layerNodes.length) {
          console.warn('Immerser requires at least one ImmerserLayer.');
        }
      }

      const controller = new ImmerserController(optionsRef.current);
      setInstance(controller);

      return () => {
        controller.destroy();
        setInstance(null);
      };
    }, []);

    return (
      <ImmerserContext.Provider value={true}>
        <div ref={rootRef} {...rest} data-immerser="">
          {children}
        </div>
      </ImmerserContext.Provider>
    );
  }
);

Immerser.displayName = 'Immerser';

export default Immerser;
