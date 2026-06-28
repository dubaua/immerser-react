import type { SolidClassnamesByLayerId } from 'immerser';
import type { ReactNode } from 'react';
export type DeniedStyleProp = {
    /**
     * Inline styles are not supported by Immerser React components.
     * Immerser owns the style attribute and removes it during runtime cleanup.
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
