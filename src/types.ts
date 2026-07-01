import type { SolidClassnamesByLayerId } from 'immerser';
import type { ReactNode } from 'react';

export type DeniedStyleProp = {
  /**
   * Inline styles are not supported by Immerser React components.
   * The adapter reserves the style attribute for technical Immerser styles.
   */
  style?: never;
};

export type ImmerserContextValue = number;

export type ImmerserConfigContextValue = {
  layerIds: string[];
  setRendererRootNode: (node: HTMLDivElement | null) => void;
  solidClassnamesByLayerId: SolidClassnamesByLayerId;
};

export type SolidElementProps = {
  children?: ReactNode;
  className?: string;
  name?: string;
};
