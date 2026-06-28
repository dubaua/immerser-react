import { type ComponentPropsWithoutRef } from 'react';
import type { DeniedStyleProp } from './types';
type Props = {
    /** Classname applied to generated copies of this link while any one of them is hovered. */
    hoverClassName: string;
    /** Stable hover group id for this source link. `Immerser` copies the link into every layer mask,
     * so use the same `synchroId` for links that should share hover state,
     * and different values for independent hover groups. */
    synchroId: string;
} & Omit<ComponentPropsWithoutRef<'a'>, 'style'> & DeniedStyleProp;
/**
 * Anchor with synchronized hover state across layer clones.
 * One source link is rendered into multiple layer-mask copies;
 * `synchroId` keeps only those generated copies in the same hover group.
 * This mirrors the core `data-immerser-synchro-hover` feature without relying on cloned DOM event wiring.
 *
 * @public
 */
export declare const ImmerserSynchroLink: {
    ({ className, hoverClassName, onMouseEnter, onMouseLeave, synchroId, ...rest }: Props): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export {};
