import type { Map as MapLibreMap } from 'maplibre-gl';
import type { ColorScheme } from '../../lib/theme';

/**
 * design.md §10：弱化底图噪声，让雪场标记成为视觉焦点。
 * positron（浅）与 dark（深）的图层 id 命名不同，所以两套都列上。
 */
const HIDDEN_LAYERS = /^(label_other|label_village|place_other|place_suburb|place_village|highway-shield|road_shield|road_oneway|highway-name-path|highway-name-minor|highway_name_other)/;

/** design.md §10：浅色底图的水体用低饱和灰蓝，避免和 pass 的蓝/橙语义色打架 */
const LIGHT_WATER = '#DCE3E8';

export function tuneBasemap(map: MapLibreMap, scheme: ColorScheme): void {
  for (const layer of map.getStyle().layers) {
    if (HIDDEN_LAYERS.test(layer.id)) map.setLayoutProperty(layer.id, 'visibility', 'none');
  }
  if (scheme === 'light' && map.getLayer('water')) {
    map.setPaintProperty('water', 'fill-color', LIGHT_WATER);
  }
}
