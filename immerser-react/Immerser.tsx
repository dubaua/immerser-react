import { CroppedFullAbsoluteStyles, NotInteractiveStyles } from 'immerser';
import {
  Children,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { ImmerserSolid } from './ImmerserSolid';
import { type DeniedStyleProp, useImmerserContext } from './internal';

export type ImmerserProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & DeniedStyleProp;

type SolidElementProps = {
  children?: ReactNode;
  className?: string;
  layerClassName?: string;
  name: string;
};

const maskStyle = {
  ...CroppedFullAbsoluteStyles,
  transform: '',
} satisfies React.CSSProperties;

const renderSolidsForLayer = (children: ReactNode, solidClassnames: Record<string, string> = {}): ReactNode =>
  Children.map(children, (child) => {
    if (child === null || child === undefined || child === false) {
      return child;
    }

    if (!isValidElement<SolidElementProps>(child) || child.type !== ImmerserSolid) {
      throw new Error('ImmerserRoot accepts only ImmerserSolid as direct children.');
    }

    return cloneElement(child, {
      layerClassName: solidClassnames[child.props.name],
    });
  });

const Immerser = ({ children, style: _style, ...rest }: ImmerserProps) => {
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

export { Immerser };
