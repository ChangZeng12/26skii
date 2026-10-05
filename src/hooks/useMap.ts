import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

export const MapContext = createContext<MapLibreMap | null>(null);

export const useMap = (): MapLibreMap | null => useContext(MapContext);

const noopSubscribe = () => () => {};

/**
 * 订阅地图缩放并返回 select(zoom) 的结果。React 只在返回值变化时重渲染，
 * 所以返回离散值（比如缩放档位）时，连续缩放不会造成逐帧渲染。
 */
export function useMapZoom<T>(select: (zoom: number) => T, fallback: T): T {
  const map = useMap();
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!map) return () => {};
      map.on('zoom', onChange);
      return () => { map.off('zoom', onChange); };
    },
    [map],
  );
  return useSyncExternalStore(map ? subscribe : noopSubscribe, () => (map ? select(map.getZoom()) : fallback));
}
