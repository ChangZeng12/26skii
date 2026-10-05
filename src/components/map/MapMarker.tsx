import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Marker } from 'maplibre-gl';
import type { LngLatTuple } from '../../data/schema';
import { useMap } from '../../hooks/useMap';

interface MapMarkerProps {
  lngLat: LngLatTuple;
  /** 写到标记元素的 data-layer 上，map.css 用它决定图层叠放顺序 */
  layer: 'resort' | 'origin';
  children: ReactNode;
}

/** 把 React 子树渲染进 MapLibre 的 DOM 标记：定位交给 MapLibre，样式与交互留在 React/CSS */
export function MapMarker({ lngLat, layer, children }: MapMarkerProps) {
  const map = useMap();
  const [element] = useState(() => {
    const el = document.createElement('div');
    el.dataset.layer = layer;
    return el;
  });
  const [lon, lat] = lngLat;

  useEffect(() => {
    if (!map) return;
    const marker = new Marker({ element, anchor: 'center' }).setLngLat([lon, lat]).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, element, lon, lat]);

  return createPortal(children, element);
}
