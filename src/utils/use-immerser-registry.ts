import { useCallback, useRef, useState } from 'react';

/**
 * Tracks layer ids, mask inner nodes and readiness for the external renderer DOM.
 */
export const useImmerserRegistry = () => {
  const maskInnerNodesRef = useRef(new Map<string, HTMLElement>());
  const [layerIds, setLayerIds] = useState<string[]>([]);
  const [, setReadyVersion] = useState(0);

  const isReady =
    layerIds.length > 0 &&
    maskInnerNodesRef.current.size === layerIds.length &&
    layerIds.every((layerId) => maskInnerNodesRef.current.has(layerId));

  const registerLayer = useCallback((id: string) => {
    setLayerIds((currentLayerIds) => {
      if (currentLayerIds.includes(id)) {
        return currentLayerIds;
      }

      return [...currentLayerIds, id];
    });
  }, []);

  const unregisterLayer = useCallback((id: string) => {
    setLayerIds((currentLayerIds) => currentLayerIds.filter((layerId) => layerId !== id));
  }, []);

  const registerMaskInner = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      if (maskInnerNodesRef.current.get(id) === node) {
        return;
      }

      maskInnerNodesRef.current.set(id, node);
    } else {
      if (!maskInnerNodesRef.current.has(id)) {
        return;
      }

      maskInnerNodesRef.current.delete(id);
    }

    setReadyVersion((version) => version + 1);
  }, []);

  return {
    isReady,
    layerIds,
    maskInnerNodesRef,
    registerLayer,
    unregisterLayer,
    registerMaskInner,
  };
};
