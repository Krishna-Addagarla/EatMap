import { Pin, UserList, CommunityList } from '../types';

export const INITIAL_PINS: Pin[] = [
  {
    id: 1,
    name: 'Paradise',
    cat: 'biryani',
    emoji: '🍛',
    rating: 4.9,
    reviews: 8900,
    score: 9.4,
    x: 57,
    y: 26,
    area: 'Secunderabad',
    food: 4.9,
    ambience: 3.8,
    service: 4.5,
    value: 4.8,
    wait: 3.2,
    tags: ['dum biryani', 'iconic', 'must-try', 'Open now', 'Legend'],
    ai: "People swear by the dum biryani — it's the real deal. Ambience is old-school and functional. Long queues on weekends but always worth it. Skip the dessert.",
    photos: ['🍛 Food', '🏠 Interior', '✨ Ambience', '📋 Menu', '📍 Street view'],
    latitude: 17.4435,
    longitude: 78.4983
  },
  {
    id: 2,
    name: 'Nimrah Cafe',
    cat: 'cafe',
    emoji: '☕',
    rating: 4.7,
    reviews: 3200,
    score: 8.9,
    x: 10,
    y: 78,
    area: 'Old City',
    food: 4.7,
    ambience: 4.2,
    service: 4.1,
    value: 4.9,
    wait: 3.8,
    tags: ['irani chai', 'osmania biscuits', 'iconic', 'Open till late'],
    ai: 'The OG Irani chai experience. Osmania biscuits are mandatory. Gets packed post-midnight. Cash only — and that is the charm.',
    photos: ['☕ Chai', '🏠 Interior', '🍪 Snacks', '📍 Street view'],
    latitude: 17.3616,
    longitude: 78.4747
  },
  {
    id: 3,
    name: 'Farzi Cafe',
    cat: 'rooftop',
    emoji: '🌃',
    rating: 4.5,
    reviews: 2100,
    score: 8.7,
    x: 38,
    y: 48,
    area: 'Banjara Hills',
    food: 4.4,
    ambience: 4.8,
    service: 4.3,
    value: 3.9,
    wait: 4.0,
    tags: ['rooftop', 'molecular', 'cocktails', 'upscale'],
    ai: "Stunning views + molecular gastronomy = a solid date night. Cocktails are the real highlight. Book in advance on weekends.",
    photos: ['🌃 View', '🍽 Food', '🍹 Cocktails', '✨ Ambience'],
    latitude: 17.4156,
    longitude: 78.4372
  },
  {
    id: 4,
    name: 'Chutneys',
    cat: 'tiffin',
    emoji: '🥘',
    rating: 4.8,
    reviews: 5400,
    score: 9.1,
    x: 22,
    y: 32,
    area: 'Jubilee Hills',
    food: 4.8,
    ambience: 4.0,
    service: 4.4,
    value: 4.7,
    wait: 3.5,
    tags: ['dosas', 'tiffin', 'breakfast', 'family-friendly', 'Open early'],
    ai: "Hyderabad's gold standard for South Indian breakfast. The pesarattu is extraordinary. Go early — post-9am waits stretch 40 min on weekends.",
    photos: ['🥘 Tiffin', '🍽 Dosa', '🏠 Interior', '📍 Street'],
    latitude: 17.4326,
    longitude: 78.4090
  },
  {
    id: 5,
    name: '10 Downing St',
    cat: 'pub',
    emoji: '🍺',
    rating: 4.3,
    reviews: 1800,
    score: 8.2,
    x: 64,
    y: 60,
    area: 'Hitech City',
    food: 4.1,
    ambience: 4.6,
    service: 4.2,
    value: 3.8,
    wait: 4.1,
    tags: ['pub', 'live music', 'cocktails', 'rooftop bar'],
    ai: "The go-to after-work spot in Hitech City. Live music on Thursdays is excellent. Arrive before 8 on weekends.",
    photos: ['🍺 Bar', '🎵 Stage', '🌃 Rooftop', '🍔 Food'],
    latitude: 17.4474,
    longitude: 78.3784
  },
  {
    id: 6,
    name: 'Shah Ghouse',
    cat: 'biryani',
    emoji: '🍛',
    rating: 4.6,
    reviews: 6700,
    score: 9.0,
    x: 8,
    y: 65,
    area: 'Old City',
    food: 4.8,
    ambience: 3.2,
    service: 3.9,
    value: 4.9,
    wait: 3.0,
    tags: ['biryani', 'haleem', 'Old City', 'budget'],
    ai: "No-frills, no pretense — just exceptional biryani. The haleem during Ramadan is a separate religion. Cash only, worth every bit of chaos.",
    photos: ['🍛 Biryani', '🥣 Haleem', '📍 Exterior'],
    latitude: 17.3578,
    longitude: 78.4740
  },
  {
    id: 7,
    name: 'Ministry of Chai',
    cat: 'cafe',
    emoji: '☕',
    rating: 4.4,
    reviews: 980,
    score: 8.3,
    x: 74,
    y: 44,
    area: 'Madhapur',
    food: 4.3,
    ambience: 4.5,
    service: 4.2,
    value: 4.1,
    wait: 4.4,
    tags: ['cafe', 'chai', 'WFH-friendly', 'wifi'],
    ai: "Perfect WFH cafe. Great chai, fast wifi, staff won't glare if you're there 4 hours. Cold brew is surprisingly solid.",
    photos: ['☕ Chai', '💻 Ambience', '🏠 Interior', '🍰 Snacks'],
    latitude: 17.4483,
    longitude: 78.3915
  },
  {
    id: 8,
    name: 'Gokul Chat',
    cat: 'street',
    emoji: '🌮',
    rating: 4.6,
    reviews: 4200,
    score: 8.8,
    x: 44,
    y: 72,
    area: 'Banjara Hills',
    food: 4.8,
    ambience: 2.9,
    service: 3.6,
    value: 5.0,
    wait: 3.3,
    tags: ['street food', 'pani puri', 'cash only', 'legendary'],
    ai: "A Hyderabad institution. The bhel puri is dangerously addictive. Standing-only, cash only — none of that matters once you taste it.",
    photos: ['🌮 Chat', '🍢 Snacks', '📍 Street'],
    latitude: 17.4165,
    longitude: 78.4482
  },
  {
    id: 9,
    name: "AB's Barbecue",
    cat: 'rooftop',
    emoji: '🌃',
    rating: 4.2,
    reviews: 1450,
    score: 8.0,
    x: 82,
    y: 52,
    area: 'Gachibowli',
    food: 4.2,
    ambience: 4.5,
    service: 4.0,
    value: 3.9,
    wait: 4.2,
    tags: ['rooftop', 'bar', 'date night', 'cocktails'],
    ai: "Good rooftop in Gachibowli. Cocktail menu is creative, sunset views over the tech corridor are worth it.",
    photos: ['🌃 View', '🍹 Cocktails', '✨ Ambience'],
    latitude: 17.4401,
    longitude: 78.3489
  },
  {
    id: 10,
    name: 'Bawarchi',
    cat: 'biryani',
    emoji: '🍛',
    rating: 4.4,
    reviews: 7100,
    score: 8.6,
    x: 28,
    y: 62,
    area: 'Ameerpet',
    food: 4.5,
    ambience: 3.3,
    service: 3.8,
    value: 4.7,
    wait: 3.4,
    tags: ['biryani', 'Ameerpet', 'old school', 'no-frills'],
    ai: "The OG biryani joint that Paradise fans debate endlessly. Consistently excellent over decades — that alone earns it legendary status.",
    photos: ['🍛 Biryani', '🏠 Interior', '📍 Street'],
    latitude: 17.4375,
    longitude: 78.4483
  },
  {
    id: 11,
    name: 'Cream Stone',
    cat: 'cafe',
    emoji: '☕',
    rating: 4.3,
    reviews: 2300,
    score: 8.1,
    x: 48,
    y: 36,
    area: 'Banjara Hills',
    food: 4.4,
    ambience: 4.1,
    service: 4.0,
    value: 4.2,
    wait: 4.0,
    tags: ['dessert cafe', 'ice cream', 'date spot', 'Open late'],
    ai: "Hyderabad's favourite dessert cafe. Custom ice cream combos are absurdly good. Great date spot.",
    photos: ['🍦 Dessert', '🏠 Interior', '📍 Exterior'],
    latitude: 17.4138,
    longitude: 78.4384
  },
  {
    id: 12,
    name: 'Rayalaseema Ruchulu',
    cat: 'tiffin',
    emoji: '🥘',
    rating: 4.5,
    reviews: 3800,
    score: 8.7,
    x: 68,
    y: 32,
    area: 'Madhapur',
    food: 4.7,
    ambience: 3.6,
    service: 4.2,
    value: 4.8,
    wait: 3.6,
    tags: ['Andhra food', 'biryani', 'tiffin', 'spicy'],
    ai: "Fiery Andhra food done right — the gongura mutton alone is worth the trip. No-frills, generous portions, wallet-friendly.",
    photos: ['🥘 Food', '🍽 Thali', '📍 Street'],
    latitude: 17.4487,
    longitude: 78.3918
  }
];

export const INITIAL_USER_LISTS: UserList[] = [
  { name: 'Best Biryanis 2025', emoji: '🍛', count: 7, vis: 'public', desc: 'My all-time faves' },
  { name: 'WFH Cafe Circuit', emoji: '💻', count: 5, vis: 'public', desc: 'WiFi + great chai' },
  { name: 'Date Night Spots', emoji: '💑', count: 4, vis: 'private', desc: 'Personal faves' }
];

export const INITIAL_COMMUNITY_LISTS: CommunityList[] = [
  { name: 'Hidden Gems HYD', emoji: '💎', count: 11, vis: 'public', saves: 234, desc: 'Off-the-beaten-path' },
  { name: 'Old City Must-Do', emoji: '🏰', count: 9, vis: 'public', saves: 187, desc: 'Authentic HYD' },
  { name: 'IT Crowd Lunch', emoji: '🏢', count: 13, vis: 'public', saves: 142, desc: 'Hitech City & Madhapur' }
];

export const EMOJIS = ['🍛', '☕', '🌮', '🍺', '🌃', '💑', '🎉', '🌙', '🍰', '💎', '🏆', '🔥', '❤️', '⭐', '🗺️', '🍜', '🥗', '🥘', '🎂', '🏙️'];

export const HYD_CENTER: [number, number] = [78.4867, 17.3850];

export const AREA_COORDS: Record<string, { lat: number; lng: number; x: number; y: number }> = {
  "Banjara Hills": { lat: 17.4156, lng: 78.4372, x: 38, y: 48 },
  "Jubilee Hills": { lat: 17.4326, lng: 78.4090, x: 22, y: 32 },
  "Madhapur": { lat: 17.4483, lng: 78.3915, x: 74, y: 44 },
  "Hitech City": { lat: 17.4474, lng: 78.3784, x: 64, y: 60 },
  "Gachibowli": { lat: 17.4401, lng: 78.3489, x: 82, y: 52 },
  "Kondapur": { lat: 17.4697, lng: 78.3578, x: 79, y: 38 },
  "Kukatpally": { lat: 17.4948, lng: 78.3996, x: 62, y: 18 },
  "Ameerpet": { lat: 17.4375, lng: 78.4483, x: 28, y: 62 },
  "Secunderabad": { lat: 17.4435, lng: 78.4983, x: 57, y: 26 },
  "Old City": { lat: 17.3616, lng: 78.4747, x: 10, y: 78 },
  "Begumpet": { lat: 17.4447, lng: 78.4664, x: 45, y: 37 },
  "Abids": { lat: 17.3898, lng: 78.4766, x: 31, y: 74 },
  "Koti": { lat: 17.3850, lng: 78.4867, x: 36, y: 72 },
  "Dilsukhnagar": { lat: 17.3688, lng: 78.5247, x: 54, y: 80 },
  "Manikonda": { lat: 17.4000, lng: 78.3762, x: 76, y: 64 },
  "Nallagandla": { lat: 17.4752, lng: 78.3091, x: 91, y: 42 },
  "Tolichowki": { lat: 17.3984, lng: 78.4110, x: 21, y: 61 },
  "Mehdipatnam": { lat: 17.3940, lng: 78.4427, x: 24, y: 70 },
  "Sainikpuri": { lat: 17.4986, lng: 78.5527, x: 72, y: 13 },
  "Kompally": { lat: 17.5385, lng: 78.4814, x: 49, y: 9 }
};

export function getFallbackCoords(lat: number, lng: number): { x: number; y: number } {
  let closestArea = "Banjara Hills";
  let minDistance = Infinity;
  for (const [name, coords] of Object.entries(AREA_COORDS)) {
    const d = Math.pow(coords.lat - lat, 2) + Math.pow(coords.lng - lng, 2);
    if (d < minDistance) {
      minDistance = d;
      closestArea = name;
    }
  }
  const area = AREA_COORDS[closestArea];
  const latDiff = lat - area.lat;
  const lngDiff = lng - area.lng;
  
  const dx = lngDiff * 150;
  const dy = -latDiff * 150;
  return {
    x: Math.max(5, Math.min(95, area.x + dx)),
    y: Math.max(6, Math.min(88, area.y + dy))
  };
}
