import { useEffect, useState, useMemo } from 'react';
import { Pin } from '../types';
import { INITIAL_PINS } from '../data/seed';
import { apiFetch } from '../services/api';
import { useMapStore } from '../store/mapStore';
import { useListStore } from '../store/listStore';
import { useUserStore } from '../store/userStore';

export function usePins() {
  const [pins, setPins] = useState<Pin[]>(INITIAL_PINS);
  const [isLoading, setIsLoading] = useState(false);
  const activeCategory = useMapStore((state) => state.activeCategory);
  const activeOccasion = useMapStore((state) => state.activeOccasion);
  const setMyLists = useListStore((state) => state.setMyLists);
  const token = useUserStore((state) => state.token);

  // Load lists from backend
  const loadMyLists = async () => {
    try {
      const lists = await apiFetch<any[]>('/lists');
      setMyLists(
        lists.map((l) => ({
          apiId: l.id,
          name: l.name,
          emoji: l.emoji,
          count: l.items?.length || 0,
          vis: l.visibility,
          desc: l.description || 'Saved places'
        }))
      );
    } catch (err: any) {
      console.info('Could not load lists from backend:', err.message);
    }
  };

  // Fetch places (pins)
  const bootstrapData = async () => {
    setIsLoading(true);
    try {
      const places = await apiFetch<any[]>('/places');
      if (Array.isArray(places) && places.length) {
        const parsedPins: Pin[] = places.map((place, index) => {
          const clientId = index + 1;
          const rankMatch = place.external_id?.match(/-(\d+)$/);
          const isNightlife = place.external_id?.includes('nightlife');
          return {
            id: clientId,
            apiId: place.id,
            name: place.name,
            cat: place.category,
            emoji: place.emoji || '🍽',
            rating: place.rating,
            reviews: place.reviews_count,
            score: place.score,
            x: place.map_x,
            y: place.map_y,
            area: place.area,
            food: place.food_score,
            ambience: place.ambience_score,
            service: place.service_score,
            value: place.value_score,
            wait: place.wait_score,
            tags: place.tags || [],
            ai: place.ai_summary || 'A community-rated EatMap place.',
            photos: place.photo_urls && place.photo_urls.length
              ? place.photo_urls
              : [`${place.emoji || '🍽'} Food`, `${place.emoji || '🍽'} Ambience`],
            latitude: place.latitude,
            longitude: place.longitude,
            source: place.external_provider ? 'EatMap Curated' : undefined,
            sourceUrl: place.external_provider === 'zomato'
              ? isNightlife
                ? 'https://www.zomato.com/hyderabad/best-drinks-and-nightlife-restaurants'
                : 'https://www.zomato.com/hyderabad/best-restaurants'
              : undefined,
            cuisines: place.cuisines || [],
            restaurantType: place.restaurant_type,
            rank: rankMatch ? Number(rankMatch[1]) : undefined,
            costForTwo: place.tags?.find((tag: string) => tag.startsWith('Cost: '))?.replace('Cost: ', ''),
            hours: place.tags?.find((tag: string) => tag.startsWith('Hours: '))?.replace('Hours: ', ''),
            distance: place.tags?.find((tag: string) => tag.startsWith('Distance: '))?.replace('Distance: ', ''),
            collection: place.tags?.find((tag: string) => tag.startsWith('Collection: '))?.replace('Collection: ', '')
          };
        });
        setPins(parsedPins);
      }
      
      if (token) {
        await loadMyLists();
      }
    } catch (err: any) {
      console.info('Using local demo data (FastAPI server offline):', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch lists if token changes
  useEffect(() => {
    if (token) {
      loadMyLists();
    }
  }, [token]);

  // Initial bootstrap
  useEffect(() => {
    bootstrapData();
  }, []);

  // Filter pins based on category / occasion
  const filteredPins = useMemo(() => {
    let result = pins;

    // Filter by Category
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.cat === activeCategory);
    }

    // Filter by Occasion
    if (activeOccasion) {
      // Occasions map to tags or category matching
      // Line 495+:
      // Date spots -> Romantic restaurants & rooftops
      // Party places -> High-energy venues & lounges
      // Dinner -> Top dinner restaurants
      // Team lunch -> Great for groups & outings
      // Rooftop -> Sky-high restaurants & bars
      // Family dinner -> Spacious & family-friendly
      // Street food -> Best street food clusters
      // Pub night -> Bars, pubs & nightlife
      // Birthday -> Celebration-worthy venues
      // Solo / work -> WFH-friendly cafes & quiet corners
      const tagMap: Record<string, string[]> = {
        '💑 Date spots': ['romantic', 'date spot', 'date night', 'rooftop'],
        '🎉 Party places': ['party', 'bar', 'live music', 'cocktails'],
        '🌙 Dinner': ['dinner', 'family-friendly', 'Legend'],
        '👥 Team lunch': ['team lunch', 'lunch', 'family-friendly'],
        '🏙 Rooftop': ['rooftop', 'rooftop bar'],
        '👨‍👩‍👧 Family dinner': ['family-friendly', 'breakfast'],
        '🌮 Street food run': ['street food', 'tiffin', 'budget'],
        '🍺 Pub night': ['pub', 'bar', 'cocktails'],
        '🎂 Birthday': ['celebration', 'party', 'upscale'],
        '💻 Solo / work': ['WFH-friendly', 'cafe', 'wifi']
      };

      const keys = tagMap[activeOccasion.name] || [];
      result = result.filter((p) => {
        const matchesTag = p.tags.some((t) => keys.some((k) => t.toLowerCase().includes(k.toLowerCase())));
        const matchesCategory = keys.some((k) => p.cat.toLowerCase().includes(k.toLowerCase()));
        return matchesTag || matchesCategory;
      });
    }

    return result;
  }, [pins, activeCategory, activeOccasion]);

  return {
    pins,
    filteredPins,
    isLoading,
    refresh: bootstrapData,
    loadMyLists
  };
}
