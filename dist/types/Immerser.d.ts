import { type HTMLAttributes } from 'react';
import type { DeniedStyleProp } from './types';
type Props = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & DeniedStyleProp;
/**
 * Renders the fixed immerser root and the per-layer mask structure driven by the core controller.
 * Direct children must be `ImmerserSolid` or `ImmerserPager` so each layer can receive its own solid classnames.
 * In React mode, the core measures layer masks and moves their transitions; React owns the mask markup itself.
 *
 * @public
 */
export declare const Immerser: {
    ({ children, style: _style, ...rest }: Props): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export {};
