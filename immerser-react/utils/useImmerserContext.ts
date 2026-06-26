import { useContext } from 'react';

import { ImmerserContext } from '../context/ImmerserContext';
import type { ImmerserContextValue } from '../types';
import { isDevEnv } from './isDevEnv';

const reportOutsideProviderUsage = (componentName: string) => {
  const message = `${componentName} must be used inside <ImmerserProvider>.`;

  if (isDevEnv()) {
    throw new Error(message);
  }

  console.error(message);
};

export const useImmerserContext = (componentName: string) => {
  const context = useContext(ImmerserContext);

  if (!context) {
    reportOutsideProviderUsage(componentName);
  }

  return context as ImmerserContextValue;
};
