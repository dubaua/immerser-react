import { createContext, type Dispatch, type SetStateAction } from 'react';

/** Shared hover group state used to keep duplicated interactive solids visually in sync. */
export const ImmerserSynchroContext = createContext<{
  activeSynchroId: string | null;
  setActiveSynchroId: Dispatch<SetStateAction<string | null>>;
}>({
  activeSynchroId: null,
  setActiveSynchroId: () => {},
});
