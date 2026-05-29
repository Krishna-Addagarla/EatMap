import React from 'react';
import { Pin } from '../../types';
import { CATEGORY_STYLES } from '../../data/categories';

interface SearchOverlayProps {
  isOpen: boolean;
  query: string;
  srchIdx: number;
  results: Pin[];
  onClose: () => void;
  onQueryChange: (q: string) => void;
  onPickResult: (pin: Pin) => void;
  onPickCategory: (cat: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  query,
  srchIdx,
  results,
  onClose,
  onQueryChange,
  onPickResult,
  onPickCategory
}) => {
  if (!isOpen) return null;

  return (
    <div className="srch-ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="srch-modal">
        <div className="srch-bar">
          <input
            className="srch-input"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search biryani, rooftop bars, cafes, street food in Hyderabad..."
            autoFocus
          />
          <span className="srch-esc" onClick={onClose}>ESC</span>
        </div>

        <div className="srch-cats">
          {['biryani', 'cafe', 'rooftop', 'tiffin', 'street', 'pub'].map((cat) => (
            <span
              key={cat}
              className="srch-cat"
              onClick={() => {
                onPickCategory(cat);
                onClose();
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          ))}
        </div>

        <div className="srch-sec">Results ({results.length})</div>
        
        <div className="srch-results">
          {results.map((p, idx) => {
            const style = CATEGORY_STYLES[p.cat] || { thumb: 'rgba(255,255,255,0.05)' };
            const isFocused = idx === srchIdx;
            
            return (
              <div
                key={p.id}
                className={`srch-item ${isFocused ? 'kbd-focus' : ''}`}
                onClick={() => onPickResult(p)}
              >
                <div className="srch-em" style={{ background: style.thumb }}>
                  {p.emoji}
                </div>
                <div className="srch-info">
                  <div className="srch-name">{p.name}</div>
                  <div className="srch-meta">
                    {p.cat.charAt(0).toUpperCase() + p.cat.slice(1)} · {p.area} · {p.reviews.toLocaleString()} reviews
                  </div>
                </div>
                <div className="srch-rating">★ {p.rating}</div>
              </div>
            );
          })}
          {results.length === 0 && (
            <div style={{ color: 'var(--text3)', fontSize: '13px', padding: '12px 14px' }}>
              No spots match your search query. Try another term!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
