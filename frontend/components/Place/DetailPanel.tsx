import React from 'react';
import { Pin } from '../../types';
import { useUserStore } from '../../store/userStore';
import { useListStore } from '../../store/listStore';
import { CATEGORY_STYLES, DEFAULT_STYLE } from '../../data/categories';
import { RatingBars } from './RatingBars';
import { PhotoStrip } from './PhotoStrip';
import { apiFetch } from '../../services/api';

interface DetailPanelProps {
  pin: Pin | null;
  onClose: () => void;
  onShare: (pin: Pin) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  pin,
  onClose,
  onShare
}) => {
  const { visitedPins, pinStars, markVisited, setStarRating, showToast, token } = useUserStore();
  const { openAtlPicker, myLists, addMyList, addPinToList } = useListStore();


  if (!pin) return <div className="dp"></div>;

  const style = CATEGORY_STYLES[pin.cat] || DEFAULT_STYLE;
  const isVisited = visitedPins.includes(pin.id);
  const myStars = pinStars[pin.id] || 0;

  const isFavorite = myLists.some((l) => (l.name === 'Favorites' || l.emoji === '⭐') && l.items?.includes(pin.id));

  const handleMarkVisited = () => {
    markVisited(pin.id);
    showToast('Marked as visited!');
  };

  const handleSaveFavorite = async () => {
    if (isFavorite) {
      showToast('Already saved to Favorites!');
      return;
    }

    if (token && pin.apiId) {
      try {
        await apiFetch(`/lists/favorites/${pin.apiId}`, {
          method: 'POST'
        });
      } catch (err: any) {
        showToast(err.message);
        return;
      }
    }
    
    const favListIndex = myLists.findIndex((l) => l.name === 'Favorites' || l.emoji === '⭐');
    if (favListIndex !== -1) {
      addPinToList(favListIndex, pin.id);
    } else {
      addMyList({
        name: 'Favorites',
        emoji: '⭐',
        count: 1,
        vis: 'private',
        desc: 'My saved places',
        items: [pin.id]
      });
    }
    showToast('⭐ Saved to Favorites!');
  };

  const handleSetStars = async (val: number) => {
    setStarRating(pin.id, val);
    
    if (token && pin.apiId) {
      try {
        await apiFetch(`/places/${pin.apiId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: val })
        });
      } catch (err: any) {
        showToast(err.message);
        return;
      }
    }
    showToast(`Rated ${val}★ — thanks!`);
  };

  const handleDirections = () => {
    if (pin.latitude && pin.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${pin.latitude},${pin.longitude}`, '_blank');
      showToast('📍 Opening directions in Google Maps!');
    } else {
      showToast('❌ Location coordinates not available');
    }
  };

  const hasOpen = pin.tags.includes('Open now');
  const legendBadge = pin.tags.find((t) => ['Legend', 'New', 'Trending'].includes(t));
  const cuisineText = pin.cuisines?.length ? pin.cuisines.join(', ') : pin.cat;

  return (
    <div className={`dp ${pin ? 'open' : ''}`}>
      <div className="dp-handle">
        <div className="dp-bar"></div>
      </div>
      
      <button className="dp-close" onClick={onClose}>✕</button>

      <div className="dp-scroll">
        <div className="dp-header">
          <div className="dp-thumb" style={{ background: style.thumb }}>
            {pin.emoji}
          </div>
          <div>
            <div className="dp-name">{pin.name}</div>
            <div className="dp-sub">
              ★ {pin.rating} · {pin.reviews.toLocaleString()} reviews · {pin.area}
            </div>
            <div className="dp-tags">
              {pin.tags.slice(0, 4).map((t) => (
                <span key={t} className="dtag">{t}</span>
              ))}
              {hasOpen && <span className="dtag dtag-g">● Open now</span>}
              {legendBadge && <span className="dtag dtag-a">👑 {legendBadge}</span>}
              {pin.rank && <span className="dtag dtag-a">Rank #{pin.rank}</span>}
            </div>
          </div>
          <div className="score-box">
            <div className="score-num">{pin.score}</div>
            <div className="score-lbl">EatMap Score</div>
          </div>
        </div>

        <div className="dp-facts">
          <div className="fact">
            <div className="fact-lbl">Cuisine</div>
            <div className="fact-val">{cuisineText}</div>
          </div>
          {pin.costForTwo && (
            <div className="fact">
              <div className="fact-lbl">Cost</div>
              <div className="fact-val">{pin.costForTwo}</div>
            </div>
          )}
          {pin.hours && (
            <div className="fact">
              <div className="fact-lbl">Hours</div>
              <div className="fact-val">{pin.hours}</div>
            </div>
          )}
          {pin.distance && (
            <div className="fact">
              <div className="fact-lbl">Distance</div>
              <div className="fact-val">{pin.distance}</div>
            </div>
          )}
          {pin.collection && (
            <div className="fact">
              <div className="fact-lbl">Collection</div>
              <div className="fact-val">{pin.collection}</div>
            </div>
          )}
        </div>

        <div className="dp-actions">
          <button className="dact primary" onClick={handleDirections}>📍 Directions</button>
          <button className={`dact ${isFavorite ? 'active-fav' : ''}`} onClick={handleSaveFavorite}>
            {isFavorite ? '⭐ Saved' : '☆ Save'}
          </button>
          <button className="dact" onClick={() => openAtlPicker(pin)}>
            ➕ Add to list
          </button>
          <button className="dact" onClick={() => onShare(pin)}>
            🔗 Share
          </button>
        </div>

        <div className="been-bar">

          <div className="been-lbl">Have you visited?</div>
          <button
            className={`been-btn ${isVisited ? 'done' : ''}`}
            onClick={handleMarkVisited}
          >
            {isVisited ? 'Visited!' : 'Mark as visited'}
          </button>
          
          {isVisited && (
            <div className="star-row" style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`star ${myStars >= i ? 'lit' : ''}`}
                  onClick={() => handleSetStars(i)}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>

        <RatingBars pin={pin} />
        <PhotoStrip pin={pin} />

        <div className="ai-box">
          <div className="ai-box-head">🤖 EatMap AI · Claude Powered</div>
          <div className="ai-box-txt">"{pin.ai}"</div>
        </div>
      </div>
    </div>
  );
};
