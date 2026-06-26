import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { ImmerserSolid } from './ImmerserSolid';
import { joinClassNames } from './utils/joinClassNames';
import { useImmerserContext } from './utils/useImmerserContext';

type Props<T extends ElementType = 'nav'> = {
  activeClassName: string;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'activeClassName' | 'children' | 'style'>;

export const ImmerserPager = ({ activeClassName, className, as = 'nav', ...rest }: Props) => {
  const { activeIndex, layerIds } = useImmerserContext('ImmerserPager');

  return (
    <ImmerserSolid {...rest} as={as} className={className} data-immerser-pager="" name="pager">
      {layerIds.map((layerId, layerIndex) => (
        <a
          key={layerId}
          className={joinClassNames('pager__link', layerIndex === activeIndex ? activeClassName : undefined)}
          href={`#${layerId}`}
        />
      ))}
    </ImmerserSolid>
  );
};

ImmerserPager.displayName = 'ImmerserPager';
