import { createContext } from 'react';

import type { ImmerserConfigContextValue } from '../types';

/**
 * Static render configuration shared by the provider with layer, solid and pager components.
 *
 * @internal
 */
export const ImmerserConfigContext = createContext<ImmerserConfigContextValue | null>(null);
