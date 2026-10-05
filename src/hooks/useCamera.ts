import { useMemo } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { LngLatTuple } from '../data/schema';
import { boundsOf, isInsidePadding, occlusionPadding, type Bounds, type Padding } from '../lib/geo';
import { CAMERA_GAP_PX, FLY_DURATION_MS } from '../components/map/map-config';
import { useMap } from './useMap';
import { prefersReducedMotion } from './useMediaQuery';

export interface Camera {
  fitCoords: (coords: readonly LngLatTuple[], maxZoom: number) => void;
  /** 目标点被浮层挡住时才平移，避免用户在地图上点一下标记、视野就乱跳 */
  ensureVisible: (center: LngLatTuple) => void;
  zoomBy: (delta: number) => void;
}

/** 浮在地图上的面板用 data-occludes 标记，相机据此避让。传容器而不是 map：创建 map 之前也要用 */
export function currentPadding(container: HTMLElement): Padding {
  const { width, height } = container.getBoundingClientRect();
  const rects = [...document.querySelectorAll('[data-occludes]')].map((el) => el.getBoundingClientRect());
  return occlusionPadding({ width, height }, rects, CAMERA_GAP_PX);
}

const paddingOf = (map: MapLibreMap): Padding => currentPadding(map.getContainer());

/** easeTo 用 offset 而不是 padding：padding 会被 MapLibre 持久化到 transform 上，影响之后的缩放中心 */
const offsetFor = (p: Padding): [number, number] => [(p.left - p.right) / 2, (p.top - p.bottom) / 2];

export function useCamera(): Camera | null {
  const map = useMap();
  return useMemo(() => {
    if (!map) return null;
    const animate = () => !prefersReducedMotion();
    const fitBounds = (bounds: Bounds, maxZoom?: number) =>
      map.fitBounds(bounds, { padding: paddingOf(map), maxZoom, animate: animate(), duration: FLY_DURATION_MS });

    return {
      fitCoords: (coords, maxZoom) => fitBounds(boundsOf(coords), maxZoom),
      ensureVisible: (center) => {
        const padding = paddingOf(map);
        const { width, height } = map.getContainer().getBoundingClientRect();
        if (isInsidePadding(map.project(center), { width, height }, padding)) return;
        map.easeTo({ center, offset: offsetFor(padding), animate: animate() });
      },
      zoomBy: (delta) => map.easeTo({ zoom: map.getZoom() + delta, animate: animate() }),
    };
  }, [map]);
}
