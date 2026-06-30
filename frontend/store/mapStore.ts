import { create } from 'zustand';
import { Pin, Occasion } from '../types';

interface MapState {
  eatMap: any | null;
  zoomLevel: number;
  selectedPin: Pin | null;
  activeCategory: string;
  activeOccasion: Occasion | null;
  showPopHeatmap: boolean;
  showDenHeatmap: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  activeRoute: any | null;
  
  setEatMap: (map: any) => void;
  setZoomLevel: (zoom: number) => void;
  setSelectedPin: (pin: Pin | null) => void;
  setActiveCategory: (cat: string) => void;
  setActiveOccasion: (occ: Occasion | null) => void;
  setShowPopHeatmap: (show: boolean) => void;
  setShowDenHeatmap: (show: boolean) => void;
  setUserLocation: (loc: { latitude: number; longitude: number } | null) => void;
  setActiveRoute: (route: any | null) => void;
}


export const useMapStore = create<MapState>((set) => ({
  eatMap: null,
  zoomLevel: 12,
  selectedPin: null,
  activeCategory: 'all',
  activeOccasion: null,
  showPopHeatmap: false,
  showDenHeatmap: false,
  userLocation: null,
  activeRoute: null,
  
  setEatMap: (eatMap) => set({ eatMap }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setSelectedPin: (selectedPin) => set({ selectedPin, activeRoute: null }), // Clear route when pin changes
  setActiveCategory: (activeCategory) => set({ activeCategory, activeOccasion: null, activeRoute: null }), 
  setActiveOccasion: (activeOccasion) => set({ activeOccasion, activeCategory: 'all', activeRoute: null }), 
  setShowPopHeatmap: (showPopHeatmap) => set({ showPopHeatmap }),
  setShowDenHeatmap: (showDenHeatmap) => set({ showDenHeatmap }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setActiveRoute: (activeRoute) => set({ activeRoute })
}));
