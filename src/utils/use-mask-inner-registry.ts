import { useCallback, useRef, useState } from 'react';

/**
 * Keeps mask inner nodes registered by layer id and rerenders when registry readiness may change.
 */
export const useMaskInnerRegistry = (layerIds: string[]) => {
  const [, setReadyVersion] = useState(0);
  const nodesRef = useRef(new Map<string, HTMLElement>());

  const isReady =
    layerIds.length > 0 &&
    nodesRef.current.size === layerIds.length &&
    layerIds.every((layerId) => nodesRef.current.has(layerId));

  const register = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      if (nodesRef.current.get(id) === node) {
        return;
      }

      nodesRef.current.set(id, node);
    } else {
      if (!nodesRef.current.has(id)) {
        return;
      }

      nodesRef.current.delete(id);
    }

    setReadyVersion((version) => version + 1);
  }, []);

  return {
    isReady,
    nodesRef,
    register,
  };
};
