export interface Pin {
  id: number;
  apiId?: string;
  name: string;
  cat: string;
  emoji: string;
  rating: number;
  reviews: number;
  score: number;
  x: number;
  y: number;
  area: string;
  food: number;
  ambience: number;
  service: number;
  value: number;
  wait: number;
  tags: string[];
  ai: string;
  photos: string[];
  latitude: number;
  longitude: number;
  source?: string;
  sourceUrl?: string;
  rank?: number;
  cuisines?: string[];
  costForTwo?: string;
  hours?: string;
  distance?: string;
  restaurantType?: string;
  collection?: string;
}

export interface UserList {
  apiId?: number;
  name: string;
  emoji: string;
  count: number;
  vis: 'public' | 'private';
  desc: string;
}

export interface CommunityList {
  name: string;
  emoji: string;
  count: number;
  vis: 'public';
  saves: number;
  desc: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface Occasion {
  name: string;
  emoji: string;
  sub: string;
}
