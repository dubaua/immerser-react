import { createContext } from 'react';

import type { ImmerserConfigContextValue } from '../types';

export const ImmerserConfigContext = createContext<ImmerserConfigContextValue | null>(null);
