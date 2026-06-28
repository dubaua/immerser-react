import type { ComponentPropsWithoutRef, ElementType } from 'react';
type Props<T extends ElementType = 'nav'> = {
    /** Classname applied to the generated link for the currently active layer. */
    activeClassName: string;
    /** Element used for the pager wrapper; defaults to `nav`. */
    as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'activeClassName' | 'children' | 'style'>;
/**
 * Builds a pager solid inside the `Immerser` root from provider layer ids.
 * Renders one link per configured layer as a solid named `pager`, ordered by `solidClassnamesByLayerId` keys.
 * Add `pager` classnames to layer configs when the pager needs per-layer visual changes.
 * It mirrors core pager behavior in React so active state comes from context instead of DOM class mutation.
 *
 * @public
 */
export declare const ImmerserPager: {
    ({ activeClassName, className, as, ...rest }: Props): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export {};
