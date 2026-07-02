import { useContext } from 'react';

import { ImmerserContext } from './immerser-context';
import type { ImmerserContextValue } from '../types';
import { throwOutsideProviderError } from '../utils/throw-outside-provider-error';

/** @internal */
export const useImmerserContext = (componentName: string) => {
  const context = useContext(ImmerserContext);

  if (context === null) {
    throwOutsideProviderError(componentName);
  }

  return context as ImmerserContextValue;
};
