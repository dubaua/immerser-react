import ImmerserController from 'immerser';
import { ForwardedRef } from 'react';

export const assignRef = (ref: ForwardedRef<ImmerserController | null>, value: ImmerserController | null) => {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  ref.current = value;
};
