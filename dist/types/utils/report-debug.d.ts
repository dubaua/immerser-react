type DebugPayloadFactory = () => Record<string, unknown>;
/** Uses a payload factory to avoid building debug payload objects when debug logging is disabled. */
export declare const reportDebug: (isDebug: boolean, message: string, getPayload?: DebugPayloadFactory) => void;
export {};
