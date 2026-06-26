import { useContext } from 'react';

import { ImmerserContext } from './ImmerserContext';
import type { ImmerserContextValue } from '../types';
import { reportOutsideProviderUsage } from '../utils/report-outside-provider-usage';

export const useImmerserContext = (componentName: string) => {
  const context = useContext(ImmerserContext);

  if (context === null) {
    reportOutsideProviderUsage(componentName);
  }

  return context as ImmerserContextValue;
};
