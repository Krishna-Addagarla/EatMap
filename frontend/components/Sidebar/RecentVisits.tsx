import React from 'react';
import { Pin } from '../../types';
import { useUserStore } from '../../store/userStore';

interface RecentVisitsProps {
  pins: Pin[];
  onSelectPin: (pin: Pin) => void;
}

export const RecentVisits: React.FC<RecentVisitsProps> = ({ pins, onSelectPin }) => {
  const recentIds = useUserStore((state) => state.recentVisits);
  
  const recentPins = recentIds
    .map((id) => pins.find((p) => p.id === id))
    .filter((p): p is Pin => !!p);

  return (
    <>
      <div className="slabel">Recently viewed</div>
      <div className="recent-section" id="recentSection">
        {recentPins.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text3)', padding: '4px 0' }}>
            No recent visits yet
          </div>
        ) : (
          recentPins.map((p) => (
            <div key={p.id} className="recent-item" onClick={() => onSelectPin(p)}>
              <span className="recent-em">{p.emoji}</span>
              <span className="recent-name">{p.name}</span>
              <span className="recent-rating">★{p.rating}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
};
