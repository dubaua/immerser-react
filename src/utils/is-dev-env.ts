export const isDevEnv = () => {
  const env = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env;

  if (env) {
    return Boolean(env.DEV);
  }

  return true;
};
