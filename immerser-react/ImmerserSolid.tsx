import { InteractiveStyles } from 'immerser';
import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';

import { type DeniedStyleProp, joinClassNames, useImmerserContext } from './internal';

type ImmerserSolidOwnProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  layerClassName?: string;
  name: string;
};

export type ImmerserSolidProps<T extends ElementType = 'div'> = ImmerserSolidOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ImmerserSolidOwnProps<T> | 'children' | 'style'> &
  DeniedStyleProp;

const ImmerserSolid = <T extends ElementType = 'div'>({
  as,
  children,
  className,
  layerClassName,
  name,
  style: _style,
  ...rest
}: ImmerserSolidProps<T>) => {
  useImmerserContext('ImmerserSolid');

  const Component = as ?? 'div';

  return (
    <Component
      {...rest}
      className={joinClassNames(className, layerClassName)}
      data-immerser-solid={name}
      style={InteractiveStyles}
    >
      {children}
    </Component>
  );
};

ImmerserSolid.displayName = 'ImmerserSolid';

export { ImmerserSolid };
