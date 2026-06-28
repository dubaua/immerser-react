import classNames from 'classnames';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { ImmerserSolid } from './ImmerserSolid';
import { ImmerserSynchroLink } from './ImmerserSynchroLink';
import { useImmerserConfigContext } from './context/use-immerser-config-context';
import { useImmerserContext } from './context/use-immerser-context';

type Props<T extends ElementType = 'nav'> = {
  /** Classname applied to the generated link for the currently active layer. */
  activeClassName: string;
  /** Element used for the pager wrapper; defaults to `nav`. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'activeClassName' | 'children' | 'style'>;

/**
 * Builds a pager solid inside the `Immerser` root from provider layer ids.
 * Renders one link per configured layer as a solid named `pager`, ordered by `solidClassnamesByLayerId` keys.
 * Add `pager` classnames to layer configs when the pager needs per-layer visual changes.
 * It mirrors core pager behavior in React so active state comes from context instead of DOM class mutation.
 *
 * @public
 */
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
