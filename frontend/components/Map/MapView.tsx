import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Pin } from '../../types';
import { useMap } from '../../hooks/useMap';
import { useMapStore } from '../../store/mapStore';
import { useUserStore } from '../../store/userStore';
import { CATEGORY_STYLES, DEFAULT_STYLE } from '../../data/categories';
import { HYD_CENTER, getFallbackCoords } from '../../data/seed';
import { PinLayer } from './PinLayer';
import { HeatmapLayer } from './HeatmapLayer';
import { MapControls } from './MapControls';
import { getZoomScale } from '../../utils/mapHelpers';

interface MapViewProps {
  pins: Pin[];
  onSelectPin: (pin: Pin) => void;
}

export const MapView: React.FC<MapViewProps> = ({ pins, onSelectPin }) => {
  const { selectedPin, eatMap, zoomLevel, userLocation, activeRoute } = useMapStore();
  const { showToast } = useUserStore();

  const {
    containerRef,
    useFallback,
    isDragging,
    panOffset,
    handleMouseDown,
    handleZoomIn,
    handleZoomOut,
    triggerGeolocation
  } = useMap();

  const markersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Handle MapLibre GL User Location Marker
  useEffect(() => {
    if (!eatMap || useFallback) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userLocation.longitude, userLocation.latitude]);
      } else {
        const el = document.createElement('div');
        el.className = 'user-loc-pin';
        
        const dot = document.createElement('div');
        dot.className = 'user-loc-dot';
        
        const pulse = document.createElement('div');
        pulse.className = 'user-loc-pulse';
        
        el.appendChild(dot);
        el.appendChild(pulse);

        try {
          const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(eatMap);
          userMarkerRef.current = marker;
        } catch (err) {
          console.warn('Failed to add user location marker to map:', err);
        }
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [eatMap, userLocation, useFallback]);

  // Handle MapLibre GL Active Route Drawing
  useEffect(() => {
    if (!eatMap || useFallback) return;

    const sourceId = 'directions-route';
    const layerId = 'directions-route-line';

    // Remove existing layer and source if they exist
    if (eatMap.getLayer(layerId)) eatMap.removeLayer(layerId);
    if (eatMap.getSource(sourceId)) eatMap.removeSource(sourceId);

    if (!activeRoute) return;

    try {
      eatMap.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: activeRoute
        }
      });

      eatMap.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10b981', // Emerald green glowing route line
          'line-width': 5,
          'line-opacity': 0.85
        }
      });

      // Fit map view bounds to encompass both the user location and the selected restaurant
      if (userLocation && selectedPin) {
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([userLocation.longitude, userLocation.latitude]);
        bounds.extend([selectedPin.longitude, selectedPin.latitude]);
        
        // Add map margins/padding to avoid visual clash with DetailPanel
        eatMap.fitBounds(bounds, {
          padding: { top: 60, bottom: 250, left: 180, right: 60 },
          duration: 1000
        });
      }
    } catch (err) {
      console.warn('Failed to add directions route to MapLibre:', err);
    }

    return () => {
      if (eatMap) {
        if (eatMap.getLayer(layerId)) eatMap.removeLayer(layerId);
        if (eatMap.getSource(sourceId)) eatMap.removeSource(sourceId);
      }
    };
  }, [eatMap, activeRoute, useFallback, userLocation, selectedPin]);

  // Handle MapLibre GL Pin Markers Lifecycle
  useEffect(() => {
    if (!eatMap || useFallback) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    pins.forEach((p) => {
      const c = CATEGORY_STYLES[p.cat] || DEFAULT_STYLE;
      const scale = p.reviews > 6000 ? 1.15 : p.reviews > 3000 ? 1.0 : 0.88;
      const isSelected = selectedPin?.id === p.id;

      // Create DOM element for marker
      const el = document.createElement('div');
      el.className = `pin ${isSelected ? 'sel' : ''}`;
      el.id = `pin-${p.id}`;
      el.style.transform = `scale(${isSelected ? 1.2 : scale})`;
      
      const ppill = document.createElement('div');
      ppill.className = 'ppill';
      ppill.style.background = c.bg;
      ppill.style.color = c.text;
      ppill.style.borderColor = c.tail;
      ppill.innerHTML = `${p.emoji} ★${p.rating} · ${p.name.split(' ')[0]}`;

      if (p.rank || p.tags.includes('EatMap Best')) {
        const topBadge = document.createElement('span');
        topBadge.className = 'pin-top';
        topBadge.textContent = 'TOP';
        el.appendChild(topBadge);
      }

      const ptail = document.createElement('div');
      ptail.className = 'ptail';
      ptail.style.background = c.bg;
      ptail.style.borderColor = c.tail;

      ppill.appendChild(ptail);
      el.appendChild(ppill);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPin(p);
      });

      try {
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(p.longitude && p.latitude ? [p.longitude, p.latitude] : HYD_CENTER)
          .addTo(eatMap);
        markersRef.current.set(p.id, marker);
      } catch (err) {
        console.warn('Failed to add MapLibre marker for pin:', p.name, err);
      }
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
    };
  }, [eatMap, pins, selectedPin, useFallback]);

  // Alert fallback mode to users
  useEffect(() => {
    if (useFallback) {
      showToast('Map tiles offline. Showing fallback layout.');
    }
  }, [useFallback]);

  // Compute scale transformations for fallback SVG items
  const fallbackScale = getZoomScale(zoomLevel);
  const fallbackTransform = `translate(${panOffset.x}px, ${panOffset.y}px)`;

  return (
    <div
      className={`map-area ${isDragging ? 'dragging' : ''}`}
      id="mapArea"
      onMouseDown={handleMouseDown}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* Real Map Canvas */}
      <div
        id="realMap"
        className="eatmap-map"
        ref={containerRef}
        style={{ display: useFallback ? 'none' : 'block', width: '100%', height: '100%' }}
      ></div>

      {/* Fallback SVG Map Backdrop */}
      {useFallback && (
        <svg
          className="map-svg"
          viewBox="0 0 1400 800"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${fallbackScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s'
          }}
        >
          <rect width="1400" height="800" fill="#080808" />
          <g stroke="#111" strokeWidth="16" fill="none">
            <line x1="0" y1="220" x2="1400" y2="195" />
            <line x1="0" y1="480" x2="1400" y2="460" />
            <line x1="220" y1="0" x2="200" y2="800" />
            <line x1="570" y1="0" x2="555" y2="800" />
            <line x1="900" y1="0" x2="920" y2="800" />
            <line x1="1200" y1="0" x2="1185" y2="800" />
          </g>
          <g stroke="#0e0e0e" strokeWidth="6" fill="none">
            <line x1="0" y1="100" x2="1400" y2="110" />
            <line x1="0" y1="350" x2="1400" y2="330" />
            <line x1="0" y1="640" x2="1400" y2="620" />
            <line x1="100" y1="0" x2="105" y2="800" />
            <line x1="390" y1="0" x2="395" y2="800" />
            <line x1="740" y1="0" x2="745" y2="800" />
            <line x1="1055" y1="0" x2="1060" y2="800" />
          </g>
          <g stroke="#0c0c0c" strokeWidth="3" fill="none" opacity=".8">
            <line x1="0" y1="160" x2="1400" y2="155" />
            <line x1="0" y1="290" x2="1400" y2="280" />
            <line x1="0" y1="420" x2="1400" y2="410" />
            <line x1="0" y1="560" x2="1400" y2="545" />
            <line x1="160" y1="0" x2="162" y2="800" />
            <line x1="480" y1="0" x2="482" y2="800" />
            <line x1="660" y1="0" x2="662" y2="800" />
            <line x1="825" y1="0" x2="827" y2="800" />
            <line x1="1000" y1="0" x2="1002" y2="800" />
          </g>
          <ellipse cx="1010" cy="185" rx="95" ry="65" fill="#050b10" stroke="#081420" strokeWidth="1.5" />
          <text
            x="1010"
            y="189"
            textAnchor="middle"
            fill="rgba(34,211,238,0.12)"
            fontSize="10"
            fontFamily="IBM Plex Mono"
          >
            HUSSAIN SAGAR
          </text>
          <ellipse cx="750" cy="340" rx="52" ry="32" fill="#0a0a0a" opacity=".7" />
          <ellipse cx="230" cy="560" rx="38" ry="24" fill="#0a0a0a" opacity=".55" />
          <g fill="#111" opacity=".5">
            <circle cx="555" cy="210" r="20" />
            <circle cx="900" cy="460" r="16" />
            <circle cx="220" cy="460" r="14" />
            <circle cx="555" cy="460" r="12" />
          </g>
        </svg>
      )}

      {/* Fallback Static Grid Overlay */}
      {useFallback && <div className="grid"></div>}

      {/* Fallback Area Labels */}
      {useFallback && (
        <>
          <div className="alabel" style={{ left: '22%', top: '32%', transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${fallbackScale})`, transformOrigin: 'center center' }}>Jubilee Hills</div>
          <div className="alabel" style={{ left: '38%', top: '48%', transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${fallbackScale})`, transformOrigin: 'center center' }}>Banjara Hills</div>
          <div className="alabel" style={{ left: '45%', top: '37%', transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${fallbackScale})`, transformOrigin: 'center center' }}>Begumpet</div>
          <div className="alabel" style={{ left: '57%', top: '26%', transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${fallbackScale})`, transformOrigin: 'center center' }}>Secunderabad</div>
          <div className="alabel" style={{ left: '10%', top: '78%', transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${fallbackScale})`, transformOrigin: 'center center' }}>Old City</div>
        </>
      )}

      {/* Heatmap Blobs Overlay */}
      <HeatmapLayer />

      {/* Fallback Pins Layer wrapper */}
      {useFallback && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: fallbackTransform,
            transformOrigin: 'center center',
            transition: 'transform 0.05s'
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', transform: `scale(${fallbackScale})`, transformOrigin: 'center center' }}>
            <PinLayer pins={pins} onSelectPin={onSelectPin} />
            
            {/* Fallback User Location Pin */}
            {userLocation && (
              <div
                className="user-loc-pin fallback"
                style={{
                  left: `${getFallbackCoords(userLocation.latitude, userLocation.longitude).x}%`,
                  top: `${getFallbackCoords(userLocation.latitude, userLocation.longitude).y}%`,
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 40
                }}
              >
                <div className="user-loc-dot"></div>
                <div className="user-loc-pulse"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zoom scale Controls */}
      <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onGeolocate={triggerGeolocation} />
    </div>
  );
};
