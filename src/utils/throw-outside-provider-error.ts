/** @internal */
export const throwOutsideProviderError = (componentName: string) => {
  const message = `${componentName} must be used inside <ImmerserProvider>.`;

  throw new Error(message);
};
