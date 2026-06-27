import { createContext, type Dispatch, type SetStateAction } from 'react';

export const ImmerserSynchroContext = createContext<{
  activeSynchroId: string | null;
  setActiveSynchroId: Dispatch<SetStateAction<string | null>>;
}>({
  activeSynchroId: null,
  setActiveSynchroId: () => {},
});
