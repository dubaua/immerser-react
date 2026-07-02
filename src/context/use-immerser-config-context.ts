import { useContext } from 'react';

import { ImmerserConfigContext } from './immerser-config-context';
import type { ImmerserConfigContextValue } from '../types';
import { throwOutsideProviderError } from '../utils/throw-outside-provider-error';

/** @internal */
export const useImmerserConfigContext = (componentName: string) => {
  const context = useContext(ImmerserConfigContext);

  if (!context) {
    throwOutsideProviderError(componentName);
  }

  return context as ImmerserConfigContextValue;
};
