export interface CategoryStyle {
  bg: string;
  text: string;
  tail: string;
  thumb: string;
}

export const CATEGORIES = [
  { id: 'all', name: 'All Spots', emoji: '🍽' },
  { id: 'biryani', name: 'Biryani', emoji: '🍛' },
  { id: 'cafe', name: 'Cafes', emoji: '☕' },
  { id: 'tiffin', name: 'Tiffins', emoji: '🥘' },
  { id: 'rooftop', name: 'Rooftops', emoji: '🌃' },
  { id: 'street', name: 'Street Food', emoji: '🌮' },
  { id: 'pub', name: 'Pubs & Bars', emoji: '🍺' }
];

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  biryani: { bg: 'rgba(245,158,11,0.16)', text: '#fbbf24', tail: 'rgba(245,158,11,0.4)', thumb: 'rgba(245,158,11,0.12)' },
  cafe:    { bg: 'rgba(6,182,212,0.13)',  text: '#22d3ee', tail: 'rgba(6,182,212,0.35)',  thumb: 'rgba(6,182,212,0.10)' },
  tiffin:  { bg: 'rgba(244,63,94,0.13)',  text: '#fb7185', tail: 'rgba(244,63,94,0.35)',  thumb: 'rgba(244,63,94,0.10)' },
  rooftop: { bg: 'rgba(124,92,252,0.13)', text: '#a78bfa', tail: 'rgba(124,92,252,0.35)', thumb: 'rgba(124,92,252,0.10)' },
  street:  { bg: 'rgba(132,204,22,0.13)', text: '#a3e635', tail: 'rgba(132,204,22,0.35)', thumb: 'rgba(132,204,22,0.10)' },
  pub:     { bg: 'rgba(59,130,246,0.13)',  text: '#60a5fa', tail: 'rgba(59,130,246,0.35)',  thumb: 'rgba(59,130,246,0.10)' }
};

export const DEFAULT_STYLE: CategoryStyle = {
  bg: 'rgba(255,255,255,0.08)',
  text: '#f0f0f0',
  tail: 'rgba(255,255,255,0.12)',
  thumb: 'rgba(255,255,255,0.05)'
};
