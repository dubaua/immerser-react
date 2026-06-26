export const isDevEnv = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return Boolean(import.meta.env.DEV);
  }

  return true;
};
