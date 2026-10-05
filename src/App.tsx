import { useState } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { MapCanvas } from './components/map/MapCanvas';
import { MapControls } from './components/map/MapControls';
import { OriginLayer } from './components/map/OriginLayer';
import { ResortLayer } from './components/map/ResortLayer';
import { ThemeToggle } from './components/map/ThemeToggle';
import { FilterPill } from './components/panels/FilterPill';
import { Legend } from './components/panels/Legend';
import { LegendToggle } from './components/panels/LegendToggle';
import { ResortCard } from './components/panels/ResortCard';
import { MapContext } from './hooks/useMap';
import { AppStateProvider } from './state/AppStateProvider';

export function App() {
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  return (
    <AppStateProvider>
      <MapContext value={map}>
        <MapCanvas onMapChange={setMap} />
        {map && (
          <>
            <ResortLayer />
            <OriginLayer />
          </>
        )}
        <FilterPill />
        {/* 右上角：缩放控件 + 明暗切换（+ 手机宽度下的图例开关），竖排在同一列 */}
        <div className="corner-controls">
          <MapControls />
          <ThemeToggle />
          <LegendToggle open={legendOpen} onToggle={() => setLegendOpen((open) => !open)} />
        </div>
        <Legend open={legendOpen} />
        <ResortCard />
      </MapContext>
    </AppStateProvider>
  );
}
