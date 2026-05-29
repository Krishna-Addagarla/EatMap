import React from 'react';
import { useMapStore } from '../../store/mapStore';

export const HeatmapLayer: React.FC = () => {
  const { showPopHeatmap, showDenHeatmap } = useMapStore();

  return (
    <>
      {/* Popularity Heatmap (Amber Blobs) */}
      <div
        className="hm-layer"
        style={{ opacity: showPopHeatmap ? 1 : 0 }}
      >
        <div className="blob" style={{ width: '280px', height: '280px', background: '#fbbf24', left: '50%', top: '20%', opacity: 0.25 }}></div>
        <div className="blob" style={{ width: '220px', height: '220px', background: '#fbbf24', left: '10%', top: '65%', opacity: 0.22 }}></div>
        <div className="blob" style={{ width: '180px', height: '180px', background: '#fbbf24', left: '35%', top: '45%', opacity: 0.18 }}></div>
      </div>

      {/* Density Heatmap (Multicolor Blobs) */}
      <div
        className="hm-layer"
        style={{ opacity: showDenHeatmap ? 1 : 0 }}
      >
        <div className="blob" style={{ width: '340px', height: '340px', background: '#22d3ee', left: '55%', top: '22%', opacity: 0.25 }}></div>
        <div className="blob" style={{ width: '200px', height: '200px', background: '#a78bfa', left: '15%', top: '70%', opacity: 0.22 }}></div>
        <div className="blob" style={{ width: '160px', height: '160px', background: '#fb7185', left: '70%', top: '48%', opacity: 0.18 }}></div>
      </div>
    </>
  );
};
