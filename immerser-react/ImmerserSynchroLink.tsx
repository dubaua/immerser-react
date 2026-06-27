import { useContext, type ComponentPropsWithoutRef, type MouseEvent } from 'react';

import { ImmerserSynchroContext } from './context/immerser-synchro-context';
import type { DeniedStyleProp } from './types';
import { joinClassNames } from './utils/join-class-names';

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

  const linkClassName = joinClassNames(className, activeSynchroId === synchroId ? hoverClassName : undefined);

  return (
    <a {...rest} className={linkClassName} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
  );
};

ImmerserSynchroLink.displayName = 'ImmerserSynchroLink';
