import ImmerserController, { type Options } from 'immerser';
import { forwardRef, useEffect, useRef, type HTMLAttributes, type PropsWithChildren } from 'react';

import { ImmerserContext, isDevEnv } from './internal';

export type ImmerserProps = PropsWithChildren<
  {
    options?: Partial<Options>;
    warnOnMissingLayers?: boolean;
  } & HTMLAttributes<HTMLDivElement>
>;

const Immerser = forwardRef<ImmerserController, ImmerserProps>(
  ({ options, warnOnMissingLayers = true, children, ...rest }, ref) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<ImmerserController | null>(null);
    const optionsRef = useRef(options);
    const warnOnMissingLayersRef = useRef(warnOnMissingLayers);

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
      instanceRef.current = controller;

      if (ref) {
        if (typeof ref === 'function') {
          ref(controller);
        } else {
          ref.current = controller;
        }
      }

      return () => {
        controller.destroy();
        instanceRef.current = null;

        if (ref) {
          if (typeof ref === 'function') {
            ref(null);
          } else {
            ref.current = null;
          }
        }
      };
    }, [ref]);

    return (
      <ImmerserContext.Provider value={true}>
        <div ref={rootRef} {...rest} data-immerser>
          {children}
        </div>
      </ImmerserContext.Provider>
    );
  },
);

Immerser.displayName = 'Immerser';

export default Immerser;
