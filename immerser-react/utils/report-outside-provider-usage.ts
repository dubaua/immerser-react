import { isDevEnv } from './is-dev-env';

export const reportOutsideProviderUsage = (componentName: string) => {
  const message = `${componentName} must be used inside <ImmerserProvider>.`;

  if (isDevEnv()) {
    throw new Error(message);
  }

  console.error(message);
};
