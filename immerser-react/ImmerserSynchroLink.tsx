import type { ComponentPropsWithoutRef, MouseEvent } from 'react';

import type { DeniedStyleProp } from './types';

type Props = {
  hoverClassName: string;
  synchroId: string;
} & Omit<ComponentPropsWithoutRef<'a'>, 'style'> &
  DeniedStyleProp;

const synchroLinkIdAttribute = 'data-immerser-synchro-link-id';

export const ImmerserSynchroLink = ({ hoverClassName, onMouseEnter, onMouseLeave, synchroId, ...rest }: Props) => {
  function handleMouseEnter(event: MouseEvent<HTMLAnchorElement>) {
    document
      .querySelectorAll<HTMLAnchorElement>(`[${synchroLinkIdAttribute}="${CSS.escape(synchroId)}"]`)
      .forEach((synchroLinkNode) => synchroLinkNode.classList.add(hoverClassName));

    onMouseEnter?.(event);
  }

  function handleMouseLeave(event: MouseEvent<HTMLAnchorElement>) {
    document
      .querySelectorAll<HTMLAnchorElement>(`[${synchroLinkIdAttribute}="${CSS.escape(synchroId)}"]`)
      .forEach((synchroLinkNode) => synchroLinkNode.classList.remove(hoverClassName));

    onMouseLeave?.(event);
  }

  return (
    <a
      {...rest}
      data-immerser-synchro-link-id={synchroId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

ImmerserSynchroLink.displayName = 'ImmerserSynchroLink';
