import { useCallback } from 'react';
import type { SelectionSource } from '../../state/app-reducer';
import { RESORTS } from '../../lib/data';
import { matchesFilter } from '../../state/app-reducer';
import { useAppDispatch, useAppState } from '../../state/context';
import { MapMarker } from './MapMarker';
import { ResortPin } from './ResortPin';

export function ResortLayer() {
  const { passFilter, selection } = useAppState();
  const dispatch = useAppDispatch();
  const select = useCallback(
    (resortId: string, source: SelectionSource) => dispatch({ type: 'selectResort', resortId, source }),
    [dispatch],
  );

  return (
    <>
      {RESORTS.map((resort) => (
        <MapMarker key={resort.id} lngLat={resort.coords} layer="resort">
          <ResortPin
            resort={resort}
            selected={selection?.resortId === resort.id}
            dimmed={!matchesFilter(resort.access.pass, passFilter)}
            onSelect={select}
          />
        </MapMarker>
      ))}
    </>
  );
}
