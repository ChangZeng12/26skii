import { useEffect, useRef } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import './maplibre-setup';
import { tuneBasemap } from './basemap';
import { BASEMAP_STYLE, zoomTier } from './map-config';
import { CONTIGUOUS_US_BOUNDS } from '../../lib/geo';
import { currentPadding } from '../../hooks/useCamera';
import { useMap, useMapZoom } from '../../hooks/useMap';
import { currentColorScheme, useColorScheme } from '../../hooks/useTheme';
import type { ColorScheme } from '../../lib/theme';
import { useAppDispatch } from '../../state/context';

interface MapCanvasProps {
  onMapChange: (map: MapLibreMap | null) => void;
}

export function MapCanvas({ onMapChange }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  /** 当前底图对应的配色；style.load 回调里要用，所以放 ref 而不是闭包 */
  const schemeRef = useRef<ColorScheme>('light');
  const dispatch = useAppDispatch();
  const map = useMap();
  const scheme = useColorScheme();
  const tier = useMapZoom(zoomTier, 'far');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    schemeRef.current = currentColorScheme();
    const instance = new MapLibreMap({
      container,
      style: BASEMAP_STYLE[schemeRef.current],
      bounds: CONTIGUOUS_US_BOUNDS,
      // 面板已在同一次提交中渲染，此时就能量到它们挡住的区域
      fitBoundsOptions: { padding: currentPadding(container) },
      renderWorldCopies: false,
      // 规划用的平面地图：旋转和倾斜只会让人迷失方向
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
      // 地图上不放署名控件（用户要求）；OpenStreetMap / OpenFreeMap 要求的署名在右下角图例的底部（Legend）
      attributionControl: false,
    });
    instance.touchZoomRotate.disableRotation();
    instance.keyboard.disableRotation();
    instance.on('style.load', () => tuneBasemap(instance, schemeRef.current));
    instance.on('click', (event) => {
      // 标记是叠在 canvas 上的 DOM，点标记也会冒泡成 map click；只有点到空白地图才取消选中
      if (event.originalEvent.target === instance.getCanvas()) dispatch({ type: 'clearSelection' });
    });
    onMapChange(instance);
    return () => {
      onMapChange(null);
      instance.remove();
    };
  }, [dispatch, onMapChange]);

  useEffect(() => {
    if (!map || schemeRef.current === scheme) return;
    schemeRef.current = scheme;
    map.setStyle(BASEMAP_STYLE[scheme]);
  }, [map, scheme]);

  return <div ref={containerRef} className="map" data-zoom-tier={tier} role="region" aria-label="美国雪场地图" />;
}
