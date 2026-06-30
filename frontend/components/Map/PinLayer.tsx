import React from 'react';
import { Pin } from '../../types';
import { CATEGORY_STYLES, DEFAULT_STYLE } from '../../data/categories';
import { useMapStore } from '../../store/mapStore';

interface PinLayerProps {
  pins: Pin[];
  onSelectPin: (pin: Pin) => void;
}

export const PinLayer: React.FC<PinLayerProps> = ({ pins, onSelectPin }) => {
  const { selectedPin } = useMapStore();

  return (
    <div id="pins-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
      {pins.map((p) => {
        const c = CATEGORY_STYLES[p.cat] || DEFAULT_STYLE;
        const scale = p.reviews > 6000 ? 1.15 : p.reviews > 3000 ? 1.0 : 0.88;
        const isSelected = selectedPin?.id === p.id;

        return (
          <div
            key={p.id}
            className={`pin ${isSelected ? 'sel' : ''}`}
            id={`pin-${p.id}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -100%) scale(${isSelected ? 1.2 : scale})`
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPin(p);
            }}
          >
            {(p.rank || p.tags.includes('EatMap Best')) && <span className="pin-top">TOP</span>}
            <div
              className="ppill"
              style={{
                background: c.bg,
                color: c.text,
                borderColor: c.tail
              }}
            >
              {p.emoji} ★{p.rating} · {p.name.split(' ')[0]}
              <div
                className="ptail"
                style={{
                  background: c.bg,
                  borderColor: c.tail
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
