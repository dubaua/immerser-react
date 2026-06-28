import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import type { DeniedStyleProp } from './types';
type Props<T extends ElementType = 'div'> = {
    /** Solid id used to read the matching classname from each layer configuration. */
    name: string;
    /** Element or component used to render the solid inside `Immerser` root; defaults to `div`. */
    as?: T;
    /** Interactive content that is absolutely positioned inside every layer mask. */
    children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'name' | 'style'> & DeniedStyleProp;
/**
 * Declares content positioned inside the `Immerser` root, usually absolutely positioned within that root.
 * React renders a copy into each mask and applies layer-specific classnames by solid name.
 *
 * @public
 */
export declare const ImmerserSolid: {
    <T extends ElementType = "div">({ as, children, className, name, style: _style, ...rest }: Props<T>): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export {};
