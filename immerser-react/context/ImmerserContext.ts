import { createContext } from 'react';

import type { ImmerserContextValue } from '../types';

/** Active layer index reported by the core controller, or null before a provider is mounted. */
export const ImmerserContext = createContext<ImmerserContextValue | null>(null);
