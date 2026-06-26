import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { InteractiveStyles } from 'immerser';
import type { DeniedStyleProp } from './types';
import { useImmerserConfigContext } from './context/use-immerser-config-context';

type Props<T extends ElementType = 'div'> = {
  name: string;
  as?: T;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'name' | 'style'> &
  DeniedStyleProp;

export const ImmerserSolid = <T extends ElementType = 'div'>({
  as,
  children,
  className,
  name,
  style: _style,
  ...rest
}: Props<T>) => {
  useImmerserConfigContext('ImmerserSolid');

  const Component = as ?? 'div';

  return (
    <Component {...rest} className={className} data-immerser-solid={name} style={InteractiveStyles}>
      {children}
    </Component>
  );
};

ImmerserSolid.displayName = 'ImmerserSolid';
