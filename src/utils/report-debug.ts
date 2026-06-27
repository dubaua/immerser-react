type DebugPayloadFactory = () => Record<string, unknown>;

/** Uses a payload factory to avoid building debug payload objects when debug logging is disabled. */
export const reportDebug = (isDebug: boolean, message: string, getPayload?: DebugPayloadFactory) => {
  if (!isDebug) {
    return;
  }

  const resolvedPayload = getPayload?.();

  if (resolvedPayload === undefined) {
    console.log(`[immerser-react]: ${message}`);
    return;
  }

  console.log(`[immerser-react]: ${message}`, resolvedPayload);
};
