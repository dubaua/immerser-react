import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import type { DeniedStyleProp } from './types';
import { useImmerserConfigContext } from './context/use-immerser-config-context';

type Props<T extends ElementType = 'div'> = {
  /** Element used for the layer; defaults to `div`. */
  as?: T;
  /** Layer content that defines the page section measured by the core controller. */
  children?: ReactNode;
  /** Stable layer id used for hash links, pager links and solid classname lookup.
   * Must match a `solidClassnamesByLayerId` key. */
  id: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'id' | 'style'> &
  DeniedStyleProp;

/**
 * Marks a real section as an immerser layer.
 * The core uses these nodes to calculate layer bounds, progress and active index.
 * Render one layer component for every scroll section that should drive solid class changes.
 */
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
