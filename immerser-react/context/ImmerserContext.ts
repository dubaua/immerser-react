import { createContext } from 'react';

import type { ImmerserContextValue } from '../types';

export const ImmerserContext = createContext<ImmerserContextValue | null>(null);
