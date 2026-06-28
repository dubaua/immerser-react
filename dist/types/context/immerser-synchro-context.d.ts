import { type Dispatch, type SetStateAction } from 'react';
/** Shared hover group state used to keep duplicated interactive solids visually in sync. */
export declare const ImmerserSynchroContext: import("react").Context<{
    activeSynchroId: string | null;
    setActiveSynchroId: Dispatch<SetStateAction<string | null>>;
}>;
