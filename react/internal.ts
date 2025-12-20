import { createContext, useContext } from 'react';

const ImmerserContext = createContext<boolean | null>(null);

const isDevEnv = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return Boolean(import.meta.env.DEV);
  }

  return true;
};

const reportOutsideImmerserUsage = (componentName: string) => {
  const message = `${componentName} must be used inside <Immerser>.`;

  if (isDevEnv()) {
    throw new Error(message);
  }

  console.error(message);
};

const useImmerserContext = (componentName: string) => {
  const isInside = useContext(ImmerserContext);

  if (!isInside) {
    reportOutsideImmerserUsage(componentName);
  }
};

export { ImmerserContext, isDevEnv, useImmerserContext };
