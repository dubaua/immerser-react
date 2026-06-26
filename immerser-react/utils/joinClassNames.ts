export const joinClassNames = (...classnames: Array<string | undefined>) =>
  classnames.filter(Boolean).join(' ') || undefined;
