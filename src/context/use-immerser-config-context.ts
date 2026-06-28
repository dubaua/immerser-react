import { useContext } from 'react';

import { ImmerserConfigContext } from './immerser-config-context';
import type { ImmerserConfigContextValue } from '../types';
import { reportOutsideProviderUsage } from '../utils/report-outside-provider-usage';

export const useImmerserConfigContext = (componentName: string) => {
  const context = useContext(ImmerserConfigContext);

  if (!context) {
    reportOutsideProviderUsage(componentName);
  }

  return context as ImmerserConfigContextValue;
};
