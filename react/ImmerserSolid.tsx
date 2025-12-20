import {
  forwardRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from 'react';

import { useImmerserContext } from './internal';

type PolymorphicRef<T extends ElementType> = ComponentPropsWithRef<T>['ref'];

type ImmerserSolidProps<T extends ElementType> = {
  as?: T;
  name: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

const ImmerserSolid = forwardRef(
  <T extends ElementType = 'div'>(
    { as, name, children, ...rest }: ImmerserSolidProps<T>,
    ref: PolymorphicRef<T>
  ) => {
    useImmerserContext('ImmerserSolid');

    const Component = as ?? 'div';

    return (
      <Component ref={ref} {...rest} data-immerser-solid={name}>
        {children}
      </Component>
    );
  }
);

ImmerserSolid.displayName = 'ImmerserSolid';

export type { ImmerserSolidProps };
export default ImmerserSolid;
