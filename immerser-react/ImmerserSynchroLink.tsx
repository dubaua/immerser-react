import classNames from 'classnames';
import { useContext, type ComponentPropsWithoutRef, type MouseEvent } from 'react';

import { ImmerserSynchroContext } from './context/immerser-synchro-context';
import type { DeniedStyleProp } from './types';

type Props = {
  /** Classname shared by every link with the same synchro id while one of them is hovered. */
  hoverClassName: string;
  /** Logical hover group id used to keep cloned links visually synchronized. */
  synchroId: string;
} & Omit<ComponentPropsWithoutRef<'a'>, 'style'> &
  DeniedStyleProp;

/**
 * Anchor with synchronized hover state across layer clones.
 * This mirrors the core data-immerser-synchro-hover feature without relying on cloned DOM event wiring.
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
