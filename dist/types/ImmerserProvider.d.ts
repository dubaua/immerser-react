import { type Options } from 'immerser';
import { type ReactNode } from 'react';
type Props = {
    /** React tree that declares an immerser root, its absolute solids and scroll layers. */
    children?: ReactNode;
    /**
     * React-only per-layer solid modifiers keyed by layer id.
     * This is intentionally not passed to the core controller, even though the core has a similarly named option.
     * The React adapter uses it to derive layer order and render masked solid clones itself.
     */
    solidClassnamesByLayerId: Options['solidClassnamesByLayerId'];
} & Partial<Omit<Options, 'hasExternalRenderer' | 'pagerLinkActiveClassname' | 'solidClassnamesByLayerId'>>;
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
    ({ children, solidClassnamesByLayerId, selectorRoot, ...options }: Props): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export {};
