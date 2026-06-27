import classNames from 'classnames';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { ImmerserSolid } from './ImmerserSolid';
import { ImmerserSynchroLink } from './ImmerserSynchroLink';
import { useImmerserConfigContext } from './context/use-immerser-config-context';
import { useImmerserContext } from './context/use-immerser-context';

type Props<T extends ElementType = 'nav'> = {
  activeClassName: string;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'activeClassName' | 'children' | 'style'>;

export const ImmerserPager = ({ activeClassName, className, as = 'nav', ...rest }: Props) => {
  const { layerIds } = useImmerserConfigContext('ImmerserPager');
  const activeIndex = useImmerserContext('ImmerserPager');

  return (
    <ImmerserSolid {...rest} as={as} className={className} data-immerser-pager="" name="pager">
      {layerIds.map((layerId, layerIndex) => (
        <ImmerserSynchroLink
          key={layerId}
          className={classNames('pager__link', {
            [activeClassName]: layerIndex === activeIndex,
          })}
          href={`#${layerId}`}
          hoverClassName="_hover"
          synchroId={`pager-${layerIndex}`}
        />
      ))}
    </ImmerserSolid>
  );
};

ImmerserPager.displayName = 'ImmerserPager';
