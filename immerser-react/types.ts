import type { SolidClassnamesByLayerId } from 'immerser';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

export type DeniedStyleProp = {
  /**
   * Inline styles are not supported by Immerser React components.
   * Immerser owns the style attribute and removes it during runtime cleanup.
   */
  style?: never;
};

export type ImmerserContextValue = {
  activeIndex: number;
  debug: boolean;
  isMounted: boolean;
  layerIds: string[];
  rootNode: HTMLElement | null;
  setRendererRootNode: Dispatch<SetStateAction<HTMLDivElement | null>>;
  solidClassnamesByLayerId: SolidClassnamesByLayerId;
};

export type SolidElementProps = {
  children?: ReactNode;
  className?: string;
  name?: string;
};
