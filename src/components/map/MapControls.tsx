import { useCamera } from '../../hooks/useCamera';
import { GlassPanel } from '../glass/GlassPanel';
import { Icon } from '../Icon';

export function MapControls() {
  const camera = useCamera();
  return (
    <GlassPanel as="nav" tier="float" className="map-controls" aria-label="地图缩放">
      <button type="button" className="map-controls__button" aria-label="放大" title="放大" onClick={() => camera?.zoomBy(1)}>
        <Icon name="plus" />
      </button>
      <button type="button" className="map-controls__button" aria-label="缩小" title="缩小" onClick={() => camera?.zoomBy(-1)}>
        <Icon name="minus" />
      </button>
    </GlassPanel>
  );
}
