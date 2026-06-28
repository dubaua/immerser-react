import { CroppedFullAbsoluteStyles, NotInteractiveStyles } from 'immerser';
import { useLayoutEffect, useRef, type HTMLAttributes } from 'react';

import type { DeniedStyleProp } from './types';
import { renderSolidsForLayer } from './utils/render-solids-for-layer';
import { useImmerserConfigContext } from './context/use-immerser-config-context';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & DeniedStyleProp;

const maskStyle = {
  ...CroppedFullAbsoluteStyles,
  transform: '',
} satisfies React.CSSProperties;

/**
 * Renders the fixed immerser root and the per-layer mask structure driven by the core controller.
 * Direct children must be `ImmerserSolid` or `ImmerserPager` so each layer can receive its own solid classnames.
 * In React mode, the core measures layer masks and moves their transitions; React owns the mask markup itself.
 *
 * @public
 */
export const Immerser = ({ children, style: _style, ...rest }: Props) => {
  const { layerIds, setRendererRootNode, solidClassnamesByLayerId } = useImmerserConfigContext('Immerser');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    setRendererRootNode(rootRef.current);

    return () => {
      setRendererRootNode(null);
    };
  }, [setRendererRootNode]);

  return (
    <div ref={rootRef} {...rest} data-immerser style={NotInteractiveStyles}>
      {layerIds.map((layerId, layerIndex) => (
        <div
          key={layerId}
          aria-hidden={layerIndex === 0 ? undefined : true}
          data-immerser-layer-id={layerId}
          data-immerser-mask
          style={maskStyle}
        >
          <div data-immerser-mask-inner style={maskStyle}>
            {renderSolidsForLayer(children, solidClassnamesByLayerId[layerId])}
          </div>
        </div>
      ))}
    </div>
  );
};

Immerser.displayName = 'Immerser';
