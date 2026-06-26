import type ImmerserController from 'immerser';
import type { SolidClassnamesByLayerId } from 'immerser';
import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export type DeniedStyleProp = {
  /**
   * Inline styles are not supported by Immerser React components.
   * Immerser owns the style attribute and removes it during runtime cleanup.
   */
  style?: never;
};

export type ImmerserContextValue = {
  controller: ImmerserController | null;
  layerIds: string[];
  setRootNode: Dispatch<SetStateAction<HTMLDivElement | null>>;
  solidClassnamesByLayerId: SolidClassnamesByLayerId;
};

const ImmerserContext = createContext<ImmerserContextValue | null>(null);

const isDevEnv = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return Boolean(import.meta.env.DEV);
  }

  return true;
};

const reportOutsideProviderUsage = (componentName: string) => {
  const message = `${componentName} must be used inside <ImmerserProvider>.`;

  if (isDevEnv()) {
    throw new Error(message);
  }

  console.error(message);
};

const useImmerserContext = (componentName: string) => {
  const context = useContext(ImmerserContext);

  if (!context) {
    reportOutsideProviderUsage(componentName);
  }

  return context as ImmerserContextValue;
};

const joinClassNames = (...classnames: Array<string | undefined>) => classnames.filter(Boolean).join(' ') || undefined;

export { ImmerserContext, isDevEnv, joinClassNames, useImmerserContext };
