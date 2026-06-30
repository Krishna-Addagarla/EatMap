import React from 'react';
import { Pin } from '../../types';
import { CATEGORY_STYLES, DEFAULT_STYLE } from '../../data/categories';

interface BestRestaurantsRailProps {
  pins: Pin[];
  onSelectPin: (pin: Pin) => void;
}

export const BestRestaurantsRail: React.FC<BestRestaurantsRailProps> = ({ pins, onSelectPin }) => {
  const bestPins = pins
    .filter((pin) => pin.rank || pin.tags.includes('EatMap Best') || pin.tags.includes('EatMap Nightlife'))
    .sort((a, b) => {
      const collectionCompare = (a.collection || '').localeCompare(b.collection || '');
      return collectionCompare || (a.rank || 99) - (b.rank || 99);
    });

  if (!bestPins.length) return null;

  return (
    <section className="best-rail" aria-label="Best restaurants in Hyderabad">
      <div className="best-rail-head">
        <div>
          <div className="best-kicker">Curated guide</div>
          <div className="best-title">Best restaurants & nightlife in Hyderabad</div>
        </div>
        <div className="best-count">{bestPins.length} picks</div>
      </div>

      <div className="best-strip">
        {bestPins.map((pin) => {
          const style = CATEGORY_STYLES[pin.cat] || DEFAULT_STYLE;
          const cuisine = pin.cuisines?.slice(0, 2).join(', ') || pin.cat;

          return (
            <button key={pin.id} className="best-card" onClick={() => onSelectPin(pin)}>
              <span className="best-rank">#{pin.rank}</span>
              <span className="best-em" style={{ background: style.thumb, color: style.text }}>
                {pin.emoji}
              </span>
              <span className="best-info">
                <span className="best-name">{pin.name}</span>
                <span className="best-meta">{pin.collection || pin.area} · {cuisine}</span>
                <span className="best-foot">
                  <span>★ {pin.rating}</span>
                  {pin.costForTwo && <span>{pin.costForTwo}</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
