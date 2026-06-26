import { CroppedFullAbsoluteStyles, NotInteractiveStyles } from 'immerser';
import { useLayoutEffect, useRef, type HTMLAttributes } from 'react';

import type { DeniedStyleProp } from './types';
import { renderSolidsForLayer } from './utils/renderSolidsForLayer';
import { useImmerserContext } from './utils/useImmerserContext';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & DeniedStyleProp;

const maskStyle = {
  ...CroppedFullAbsoluteStyles,
  transform: '',
} satisfies React.CSSProperties;

export const Immerser = ({ children, style: _style, ...rest }: Props) => {
  const { layerIds, setRootNode, solidClassnamesByLayerId } = useImmerserContext('Immerser');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    setRootNode(rootRef.current);

    return () => {
      setRootNode(null);
    };
  }, [setRootNode]);

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
