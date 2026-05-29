import React from 'react';
import { useMapStore } from '../../store/mapStore';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGeolocate: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut, onGeolocate }) => {
  const zoomLevel = useMapStore((state) => state.zoomLevel);

  return (
    <div className="zoom-ctrl">
      <button className="zoom-btn" onClick={onZoomIn}>+</button>
      <div className="zoom-level">
        <span>{zoomLevel}</span>z
      </div>
      <button className="zoom-btn" onClick={onZoomOut}>−</button>
      <button className="zoom-btn" style={{ marginTop: '8px', fontSize: '15px' }} onClick={onGeolocate} title="Find my location">🎯</button>
    </div>
  );
};
