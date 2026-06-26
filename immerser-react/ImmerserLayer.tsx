import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { type DeniedStyleProp, useImmerserContext } from './internal';

export type ImmerserLayerProps<T extends ElementType = 'div'> = {
  as?: T;
  children?: ReactNode;
  id: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'id' | 'style'> &
  DeniedStyleProp;

const ImmerserLayer = <T extends ElementType = 'div'>({
  as,
  children,
  id,
  style: _style,
  ...rest
}: ImmerserLayerProps<T>) => {
  useImmerserContext('ImmerserLayer');

  const Component = as ?? 'div';

  return (
    <Component id={id} {...rest} data-immerser-layer>
      {children}
    </Component>
  );
};

ImmerserLayer.displayName = 'ImmerserLayer';

export { ImmerserLayer };
