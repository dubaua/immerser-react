import { ComponentPropsWithoutRef } from 'react';
import type { ElementType } from 'react';
import { HTMLAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { Options } from 'immerser';
import { ReactNode } from 'react';

declare type DeniedStyleProp = {
    /**
     * Inline styles are not supported by Immerser React components.
     * Immerser owns the style attribute and removes it during runtime cleanup.
     */
    style?: never;
};

/**
 * Renders the fixed immerser root and the per-layer mask structure driven by the core controller.
 * Direct children must be `ImmerserSolid` or `ImmerserPager` so each layer can receive its own solid classnames.
 * In React mode, the core measures layer masks and moves their transitions; React owns the mask markup itself.
 *
 * @public
 */
export declare const Immerser: {
    ({ children, style: _style, ...rest }: Props_2): JSX.Element;
    displayName: string;
};

/**
 * Marks a real section as an immerser layer.
 * The core uses these nodes to calculate layer bounds, progress and active index.
 * Render one layer component for every scroll section that should drive solid class changes.
 *
 * @public
 */
export declare const ImmerserLayer: {
    <T extends ElementType = "div">({ as, children, id, style: _style, ...rest }: Props_3<T>): JSX.Element;
    displayName: string;
};

/**
 * Builds a pager solid inside the `Immerser` root from provider layer ids.
 * Renders one link per configured layer as a solid named `pager`, ordered by `solidClassnamesByLayerId` keys.
 * Add `pager` classnames to layer configs when the pager needs per-layer visual changes.
 * It mirrors core pager behavior in React so active state comes from context instead of DOM class mutation.
 *
 * @public
 */
export declare const ImmerserPager: {
    ({ activeClassName, className, as, ...rest }: Props_4): JSX.Element;
    displayName: string;
};

/**
 * Owns the core `Immerser` controller lifecycle and shares its scroll state with React components.
 * Accepts `Immerser` constructor options as props, except options owned by the React adapter:
 * `hasExternalRenderer`, `pagerLinkActiveClassname` and `solidClassnamesByLayerId`.
 * See [core options docs](https://github.com/dubaua/immerser#options).
 * `solidClassnamesByLayerId` keys must match `ImmerserLayer` ids.
 * `solidClassnamesByLayerId` keeps the same shape as the constructor option,
 * but the adapter uses it to render solid copies inside each layer mask and does not forward it as-is.
 * Render-related core options are hidden because React provides external mask markup and solid clones.
 * This keeps DOM measurement, mask rendering and scroll listeners in one place
 * while the rest of the API stays declarative.
 *
 * @public
 */
export declare const ImmerserProvider: {
    ({ children, solidClassnamesByLayerId, selectorRoot, ...options }: Props): JSX.Element;
    displayName: string;
};

/**
 * Declares content positioned inside the `Immerser` root, usually absolutely positioned within that root.
 * React renders a copy into each mask and applies layer-specific classnames by solid name.
 *
 * @public
 */
export declare const ImmerserSolid: {
    <T extends ElementType = "div">({ as, children, className, name, style: _style, ...rest }: Props_5<T>): JSX.Element;
    displayName: string;
};

/**
 * Anchor with synchronized hover state across layer clones.
 * One source link is rendered into multiple layer-mask copies;
 * `synchroId` keeps only those generated copies in the same hover group.
 * This mirrors the core `data-immerser-synchro-hover` feature without relying on cloned DOM event wiring.
 *
 * @public
 */
export declare const ImmerserSynchroLink: {
    ({ className, hoverClassName, onMouseEnter, onMouseLeave, synchroId, ...rest }: Props_6): JSX.Element;
    displayName: string;
};

declare type Props = {
    /** React tree that declares an immerser root, its absolute solids and scroll layers. */
    children?: ReactNode;
    /**
     * React-only per-layer solid modifiers keyed by layer id.
     * This is intentionally not passed to the core controller, even though the core has a similarly named option.
     * The React adapter uses it to derive layer order and render masked solid clones itself.
     */
    solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<Omit<Options, 'hasExternalRenderer' | 'pagerLinkActiveClassname' | 'solidClassnamesByLayerId'>>;

declare type Props_2 = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & DeniedStyleProp;

declare type Props_3<T extends ElementType = 'div'> = {
    /** Element used for the layer; defaults to `div`. */
    as?: T;
    /** Layer content that defines the page section measured by the core controller. */
    children?: ReactNode;
    /** Stable layer id used for hash links, pager links and solid classname lookup.
     * Must match a `solidClassnamesByLayerId` key. */
    id: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'id' | 'style'> & DeniedStyleProp;

declare type Props_4<T extends ElementType = 'nav'> = {
    /** Classname applied to the generated link for the currently active layer. */
    activeClassName: string;
    /** Element used for the pager wrapper; defaults to `nav`. */
    as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'activeClassName' | 'children' | 'style'>;

declare type Props_5<T extends ElementType = 'div'> = {
    /** Solid id used to read the matching classname from each layer configuration. */
    name: string;
    /** Element or component used to render the solid inside `Immerser` root; defaults to `div`. */
    as?: T;
    /** Interactive content that is absolutely positioned inside every layer mask. */
    children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'name' | 'style'> & DeniedStyleProp;

declare type Props_6 = {
    /** Classname applied to generated copies of this link while any one of them is hovered. */
    hoverClassName: string;
    /** Stable hover group id for this source link. `Immerser` copies the link into every layer mask,
     * so use the same `synchroId` for links that should share hover state,
     * and different values for independent hover groups. */
    synchroId: string;
} & Omit<ComponentPropsWithoutRef<'a'>, 'style'> & DeniedStyleProp;

export { }
