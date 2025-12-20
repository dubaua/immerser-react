import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from 'react';

import { useImmerserContext } from './internal';

type ImmerserSolidProps<T extends ElementType> = {
  as?: T;
  name: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

const ImmerserSolid = <T extends ElementType = 'div'>({
  as,
  name,
  children,
  ...rest
}: ImmerserSolidProps<T>) => {
  useImmerserContext('ImmerserSolid');

  const Component = as ?? 'div';

  return (
    <Component {...rest} data-immerser-solid={name}>
      {children}
    </Component>
  );
};

ImmerserSolid.displayName = 'ImmerserSolid';

export type { ImmerserSolidProps };
export { ImmerserSolid };
