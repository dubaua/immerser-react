import {
  forwardRef,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import type { SolidClassnames } from 'immerser';

import { useImmerserContext } from './internal';

export type ImmerserLayerProps = PropsWithChildren<
  {
    id: string;
    solidClasses?: SolidClassnames;
  } & HTMLAttributes<HTMLDivElement>
>;

const ImmerserLayer = forwardRef<HTMLDivElement, ImmerserLayerProps>(
  ({ id, solidClasses, children, ...rest }, ref) => {
    useImmerserContext('ImmerserLayer');

    const configValue = solidClasses ? JSON.stringify(solidClasses) : undefined;

    return (
      <div
        ref={ref}
        id={id}
        {...rest}
        data-immerser-layer=""
        data-immerser-layer-config={configValue}
      >
        {children}
      </div>
    );
  }
);

ImmerserLayer.displayName = 'ImmerserLayer';

export default ImmerserLayer;
