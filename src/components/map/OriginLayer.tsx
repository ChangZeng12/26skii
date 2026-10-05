import { useMemo } from 'react';
import { ORIGINS } from '../../lib/data';
import { centroid, groupByProximity, mercatorPixels } from '../../lib/geo';
import { useCamera } from '../../hooks/useCamera';
import { useMapZoom } from '../../hooks/useMap';
import { ORIGIN_MERGE_PX } from './map-config';
import { MapMarker } from './MapMarker';
import { OriginPin } from './OriginPin';

/** 展开合并标记时的最大缩放：够把巴尔的摩与阿灵顿（约 36 英里）分开 */
const EXPAND_MAX_ZOOM = 9;

export function OriginLayer() {
  const camera = useCamera();
  const zoom = useMapZoom((z) => z, 0);
  const groups = useMemo(
    () => groupByProximity(ORIGINS, (o) => mercatorPixels(o.coords, zoom), ORIGIN_MERGE_PX),
    [zoom],
  );

  return (
    <>
      {groups.map((members) => {
        const coords = members.map((o) => o.coords);
        return (
          // key 由成员决定：合并关系不变时标记不会重建
          <MapMarker key={members.map((o) => o.id).join('+')} lngLat={centroid(coords)} layer="origin">
            <OriginPin
              members={members}
              onExpand={members.length > 1 && camera ? () => camera.fitCoords(coords, EXPAND_MAX_ZOOM) : undefined}
            />
          </MapMarker>
        );
      })}
    </>
  );
}
