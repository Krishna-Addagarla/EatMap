import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapStore } from '../store/mapStore';
import { HYD_CENTER, getFallbackCoords } from '../data/seed';
import { useUserStore } from '../store/userStore';

export function useMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapStore = useMapStore();
  const [useFallback, setUseFallback] = useState(false);
  
  // Drag simulation states for fallback map view
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!containerRef.current) return;

    let mapInstance: maplibregl.Map | null = null;
    let loadTimeout: NodeJS.Timeout;

    // Start an 8-second safety timer. If MapLibre doesn't load within this time, trigger SVG fallback.
    loadTimeout = setTimeout(() => {
      if (!mapStore.eatMap) {
        console.warn('MapLibre took too long to load tiles. Falling back to SVG view.');
        useUserStore.getState().showToast('Map loading timed out. Showing fallback layout.');
        setUseFallback(true);
      }
    }, 8000);
    
    try {
      mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: HYD_CENTER,
        zoom: 11.4,
        minZoom: 9,
        maxZoom: 18,
        pitch: 30,
        bearing: -8,
        attributionControl: { compact: true }
      });

      mapInstance.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'bottom-right'
      );

      mapInstance.on('error', (e: any) => {
        const msg = String(e?.error?.message || '');
        if (msg.includes('styles/dark') && mapInstance) {
          mapInstance.setStyle('https://tiles.openfreemap.org/styles/liberty');
        } else {
          console.warn('MapLibre encountered a rendering error:', msg);
        }
      });

      mapInstance.on('load', () => {
        clearTimeout(loadTimeout);
        if (mapInstance) {
          mapStore.setEatMap(mapInstance);
          setUseFallback(false);
        }
      });

      mapInstance.on('zoom', () => {
        if (mapInstance) {
          mapStore.setZoomLevel(Math.round(mapInstance.getZoom()));
        }
      });

    } catch (err: any) {
      console.warn('MapLibre GL failed to initialize. Using SVG fallback view:', err);
      useUserStore.getState().showToast(`Map failed: ${err?.message || String(err)}`);
      clearTimeout(loadTimeout);
      setUseFallback(true);
    }

    return () => {
      clearTimeout(loadTimeout);
      if (mapInstance) {
        mapInstance.remove();
        mapStore.setEatMap(null);
      }
    };
  }, []);

  // Center map on selected pin
  useEffect(() => {
    if (!mapStore.selectedPin) return;

    if (mapStore.eatMap) {
      const { longitude, latitude } = mapStore.selectedPin;
      if (longitude && latitude) {
        mapStore.eatMap.flyTo({
          center: [longitude, latitude],
          zoom: Math.max(mapStore.eatMap.getZoom(), 13.2),
          speed: 0.9,
          essential: true
        });
      }
    } else if (useFallback && containerRef.current) {
      const { x, y } = mapStore.selectedPin;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w && h) {
        // Calculate offset to place the pin at the center of the viewport
        const dx = w / 2 - (x / 100) * w;
        const dy = h / 2 - (y / 100) * h;
        setPanOffset({ x: dx, y: dy });
        setLastPan({ x: dx, y: dy });
      }
    }
  }, [mapStore.selectedPin, useFallback]);

  // Drag Simulation event handlers for fallback SVG map
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mapStore.eatMap) return; // Do not run drag simulation if MapLibre is active

    // Avoid starting drag on child component overlays
    const target = e.target as HTMLElement;
    if (target.closest('.pin, .filter-panel, .legend, .zoom-ctrl, .fab, .chat-panel, .dp, .occ-banner, .lists-panel, .profile-panel, .clist-panel')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - lastPan.x,
      y: e.clientY - lastPan.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanOffset({ x: dx, y: dy });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setLastPan(panOffset);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, panOffset]);

  const handleZoomIn = () => {
    if (mapStore.eatMap) {
      mapStore.eatMap.zoomIn();
    } else {
      mapStore.setZoomLevel(Math.min(mapStore.zoomLevel + 1, 18));
    }
  };

  const handleZoomOut = () => {
    if (mapStore.eatMap) {
      mapStore.eatMap.zoomOut();
    } else {
      mapStore.setZoomLevel(Math.max(mapStore.zoomLevel - 1, 8));
    }
  };

  const showToast = useUserStore((state) => state.showToast);

  const triggerGeolocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }

    showToast('Locating you...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapStore.setUserLocation({ latitude, longitude });
        
        showToast('Location updated!');

        if (mapStore.eatMap) {
          mapStore.eatMap.flyTo({
            center: [longitude, latitude],
            zoom: 14.2,
            speed: 1.0,
            essential: true
          });
        } else if (useFallback && containerRef.current) {
          const { x, y } = getFallbackCoords(latitude, longitude);
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          if (w && h) {
            const dx = w / 2 - (x / 100) * w;
            const dy = h / 2 - (y / 100) * h;
            setPanOffset({ x: dx, y: dy });
            setLastPan({ x: dx, y: dy });
          }
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        showToast('Unable to retrieve location. Make sure GPS/permission is enabled.');
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  return {
    containerRef,
    useFallback,
    isDragging,
    panOffset,
    handleMouseDown,
    handleZoomIn,
    handleZoomOut,
    triggerGeolocation
  };
}
