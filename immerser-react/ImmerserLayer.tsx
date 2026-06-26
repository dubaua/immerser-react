import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import type { DeniedStyleProp } from './types';
import { useImmerserConfigContext } from './context/use-immerser-config-context';

type Props<T extends ElementType = 'div'> = {
  as?: T;
  children?: ReactNode;
  id: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'id' | 'style'> &
  DeniedStyleProp;

export const ImmerserLayer = <T extends ElementType = 'div'>({
  as,
  children,
  id,
  style: _style,
  ...rest
}: Props<T>) => {
  useImmerserConfigContext('ImmerserLayer');

  const Component = as ?? 'div';

  return (
    <Component id={id} {...rest} data-immerser-layer>
      {children}
    </Component>
  );
};

ImmerserLayer.displayName = 'ImmerserLayer';
