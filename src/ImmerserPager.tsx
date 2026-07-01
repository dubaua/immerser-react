import classNames from 'classnames';
import { Fragment, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';

import { ImmerserSolid } from './ImmerserSolid';
import { ImmerserSynchroLink } from './ImmerserSynchroLink';
import { useImmerserConfigContext } from './context/use-immerser-config-context';
import { useImmerserContext } from './context/use-immerser-context';

type RenderLinkProps = {
  isActive: boolean;
  layerId: string;
  layerIndex: number;
};

type DefaultModeProps = {
  /** Classname applied to the generated link for the currently active layer. */
  activeClassName: string;
  /** Classname applied to each generated pager link. */
  linkClassName: string;
  /** Classname applied to generated link copies while any of them is hovered. */
  hoverClassName?: string;
  renderLink?: never;
};

type CustomRenderModeProps = {
  /** Renders custom content for each configured layer. */
  renderLink: (props: RenderLinkProps) => ReactNode;
  activeClassName?: never;
  linkClassName?: never;
  hoverClassName?: never;
};

type Props<T extends ElementType = 'nav'> = {
  /** Element used for the pager wrapper; defaults to `nav`. */
  as?: T;
} & (DefaultModeProps | CustomRenderModeProps) &
  Omit<ComponentPropsWithoutRef<T>, 'activeClassName' | 'children' | 'style'>;

/**
 * Builds a pager solid inside the `Immerser` root from provider layer ids.
 * Renders one link per configured layer as a solid named `pager`, ordered by `solidClassnamesByLayerId` keys.
 * Add `pager` classnames to layer configs when the pager needs per-layer visual changes.
 * It mirrors core pager behavior in React so active state comes from context instead of DOM class mutation.
 *
 * @public
 */
export const ImmerserPager = ({
  activeClassName,
  className,
  linkClassName,
  as = 'nav',
  hoverClassName = '_hover',
  renderLink,
  ...rest
}: Props) => {
  const { layerIds } = useImmerserConfigContext('ImmerserPager');
  const activeIndex = useImmerserContext('ImmerserPager');

  return (
    <ImmerserSolid {...rest} as={as} className={className} data-immerser-pager="" name="pager">
      {layerIds.map((layerId, layerIndex) => {
        const isActive = layerIndex === activeIndex;

        if (renderLink) {
          return <Fragment key={layerId}>{renderLink({ isActive, layerId, layerIndex })}</Fragment>;
        }

        return (
          <ImmerserSynchroLink
            key={layerId}
            className={classNames(linkClassName, {
              [activeClassName]: isActive,
            })}
            href={`#${layerId}`}
            hoverClassName={hoverClassName}
            synchroId={`pager-${layerIndex}`}
          />
        );
      })}
    </ImmerserSolid>
  );
};

ImmerserPager.displayName = 'ImmerserPager';
