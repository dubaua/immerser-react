import { ComponentPropsWithoutRef } from 'react';
import { ElementType } from 'react';
import { HTMLAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { Options } from 'immerser';
import { ReactNode } from 'react';
import { RuntimeOptions } from 'immerser';

declare type CustomRenderModeProps = {
    /** Renders custom content for each configured layer. */
    renderLink: (props: RenderLinkProps) => ReactNode;
    activeClassName?: never;
    linkClassName?: never;
    hoverClassName?: never;
};

declare type DefaultModeProps = {
    /** Classname applied to the generated link for the currently active layer. */
    activeClassName: string;
    /** Classname applied to each generated pager link. */
    linkClassName: string;
    /** Classname applied to generated link copies while any of them is hovered. */
    hoverClassName?: string;
    renderLink?: never;
};

declare type DeniedStyleProp = {
    /**
     * Inline styles are not supported by Immerser React components.
     * The adapter reserves the style attribute for technical Immerser styles.
     */
    style?: never;
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
 * Builds a pager solid inside `ImmerserRoot` from provider layer ids.
 * Renders one link per DOM layer as a solid named `pager`, ordered by `ImmerserLayer` DOM order.
 * Add `pager` classnames to layer configs when the pager needs per-layer visual changes.
 * It mirrors core pager behavior in React so active state comes from context instead of DOM class mutation.
 * In default mode each generated link receives `linkClassName`, `href="#layerId"`,
 * `hoverClassName` with `_hover` as the default, and `synchroId="pager-${layerIndex}"`.
 * Custom render mode receives `isActive`, `layerId` and `layerIndex`
 * and does not add those generated-link props.
 *
 * @public
 */
export declare const ImmerserPager: {
    ({ activeClassName, className, linkClassName, as, hoverClassName, renderLink, ...rest }: Props_4): JSX.Element;
    displayName: string;
};

/**
 * Owns the core `Immerser` controller lifecycle and shares its scroll state with React components.
 * Provider props are adapter-specific props plus `Partial<RuntimeOptions>` from `immerser`.
 * `RuntimeOptions` is the source of hot core options accepted by the React adapter.
 * Event handlers passed through `on` are init-only and registered when the controller is created.
 * `selectorRoot` recreates the core controller when changed.
 * Runtime options are forwarded through `updateOptions`.
 * See [core options docs](https://github.com/dubaua/immerser#options).
 * `solidClassnamesByLayerId` keys must match `ImmerserLayer` ids.
 * `solidClassnamesByLayerId` keeps the same shape as the constructor option,
 * but the adapter uses it to render solid copies inside each layer mask and does not forward it as-is.
 * Init-only and adapter-owned core options are not exposed:
 * `autoMount`, `hasExternalScroll`, `hasExternalRenderer`, `pagerLinkActiveClassname`
 * and the core `solidClassnamesByLayerId` contract.
 * This keeps DOM measurement, mask rendering and scroll listeners in one place
 * while the rest of the API stays declarative.
 *
 * @public
 */
export declare const ImmerserProvider: {
    ({ children, on, solidClassnamesByLayerId, selectorRoot, ...options }: Props): JSX.Element;
    displayName: string;
};

/**
 * Renders the fixed root container and the per-layer mask structure driven by the core controller.
 * Direct children must be `ImmerserSolid` or `ImmerserPager` so each layer can receive its own solid classnames.
 * Fragments and wrapper components are not accepted as direct children.
 * In React mode, the core measures layer masks and moves their transitions; React owns the mask markup itself.
 *
 * @public
 */
export declare const ImmerserRoot: {
    ({ children, style: _style, ...rest }: Props_2): JSX.Element;
    displayName: string;
};

/**
 * Declares content positioned inside `ImmerserRoot`, usually absolutely positioned within that root.
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
     * Initial event handlers registered when the core controller is created.
     * Changing this prop does not update the current controller.
     */
    on?: Options['on'];
    /** Parent node used for selector discovery. Changing it recreates the core controller. */
    selectorRoot?: Options['selectorRoot'];
    /**
     * React-only per-layer solid modifiers keyed by layer id.
     * This is intentionally not passed to the core controller, even though the core has a similarly named option.
     * The React adapter uses it to render masked solid clones itself.
     */
    solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<RuntimeOptions>;

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
    /** Element used for the pager wrapper; defaults to `nav`. */
    as?: T;
} & (DefaultModeProps | CustomRenderModeProps) & Omit<ComponentPropsWithoutRef<T>, 'activeClassName' | 'children' | 'style'>;

declare type Props_5<T extends ElementType = 'div'> = {
    /** Solid id used to read the matching classname from each layer configuration. */
    name: string;
    /** Element or component used to render the solid inside `ImmerserRoot`; defaults to `div`. */
    as?: T;
    /** Interactive content rendered inside every layer mask. Position it with your own CSS. */
    children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'name' | 'style'> & DeniedStyleProp;

declare type Props_6 = {
    /** Classname applied to generated copies of this link while any one of them is hovered. */
    hoverClassName: string;
    /** Stable hover group id for this source link. `ImmerserRoot` copies the link into every layer mask,
     * so use the same `synchroId` for links that should share hover state,
     * and different values for independent hover groups. */
    synchroId: string;
} & Omit<ComponentPropsWithoutRef<'a'>, 'style'> & DeniedStyleProp;

declare type RenderLinkProps = {
    isActive: boolean;
    layerId: string;
    layerIndex: number;
};

export { }
