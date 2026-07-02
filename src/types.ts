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
  registerLayer: (id: string) => void;
  unregisterLayer: (id: string) => void;
  registerMaskInner: (id: string, node: HTMLElement | null) => void;
  setRendererRootNode: (node: HTMLDivElement | null) => void;
  solidClassnamesByLayerId: SolidClassnamesByLayerId;
};

export type SolidElementProps = {
  children?: ReactNode;
  className?: string;
  name?: string;
};
