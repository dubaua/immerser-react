import classNames from 'classnames';
import { useContext, type ComponentPropsWithoutRef, type MouseEvent } from 'react';

import { ImmerserSynchroContext } from './context/immerser-synchro-context';
import type { DeniedStyleProp } from './types';

type Props = {
  hoverClassName: string;
  synchroId: string;
} & Omit<ComponentPropsWithoutRef<'a'>, 'style'> &
  DeniedStyleProp;

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
