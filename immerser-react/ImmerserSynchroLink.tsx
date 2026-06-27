import classNames from 'classnames';
import { useContext, type ComponentPropsWithoutRef, type MouseEvent } from 'react';

import { ImmerserSynchroContext } from './context/immerser-synchro-context';
import type { DeniedStyleProp } from './types';

type Props = {
  /** Classname applied to generated copies of this link while any one of them is hovered. */
  hoverClassName: string;
  /** Stable hover group id for this source link. `Immerser` copies the link into every layer mask,
   * so use the same `synchroId` for links that should share hover state,
   * and different values for independent hover groups. */
  synchroId: string;
} & Omit<ComponentPropsWithoutRef<'a'>, 'style'> &
  DeniedStyleProp;

/**
 * Anchor with synchronized hover state across layer clones.
 * One source link is rendered into multiple layer-mask copies;
 * `synchroId` keeps only those generated copies in the same hover group.
 * This mirrors the core `data-immerser-synchro-hover` feature without relying on cloned DOM event wiring.
 */
export const ImmerserSynchroLink = ({
  className,
  hoverClassName,
  onMouseEnter,
  onMouseLeave,
  synchroId,
  ...rest
}: Props) => {
  const { activeSynchroId, setActiveSynchroId } = useContext(ImmerserSynchroContext);

  function handleMouseEnter(event: MouseEvent<HTMLAnchorElement>) {
    setActiveSynchroId(synchroId);
    onMouseEnter?.(event);
  }

  function handleMouseLeave(event: MouseEvent<HTMLAnchorElement>) {
    setActiveSynchroId((currentSynchroId) => (currentSynchroId === synchroId ? null : currentSynchroId));
    onMouseLeave?.(event);
  }

  return (
    <a
      {...rest}
      className={classNames(className, {
        [hoverClassName]: activeSynchroId === synchroId,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

ImmerserSynchroLink.displayName = 'ImmerserSynchroLink';
