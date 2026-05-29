import React from 'react';
import { Pin, CommunityList } from '../../types';
import { useUserStore } from '../../store/userStore';
import { CATEGORY_STYLES, DEFAULT_STYLE } from '../../data/categories';

interface CommunityListDetailPanelProps {
  list: CommunityList | null;
  pins: Pin[];
  onClose: () => void;
  onSelectPin: (pin: Pin) => void;
}

export const CommunityListDetailPanel: React.FC<CommunityListDetailPanelProps> = ({
  list,
  pins,
  onClose,
  onSelectPin
}) => {
  const { showToast } = useUserStore();

  if (!list) return null;

  // Mock mapping of list items to original pins
  const clistSpots: Record<string, Array<{ id: number; note: string }>> = {
    'Hidden Gems HYD': [
      { id: 8, note: 'Best street food in the city' },
      { id: 2, note: 'Old City institution' },
      { id: 7, note: 'Hidden WFH gem' }
    ],
    'Old City Must-Do': [
      { id: 6, note: 'Must-try biryani' },
      { id: 2, note: 'Irani chai experience' },
      { id: 8, note: 'Street food paradise' }
    ],
    'IT Crowd Lunch': [
      { id: 7, note: 'Best WFH cafe' },
      { id: 5, note: 'After-work drinks' },
      { id: 9, note: 'Rooftop views' },
      { id: 12, note: 'Andhra lunch special' }
    ]
  };

  const items = clistSpots[list.name] || [];
  const spotsData = items
    .map((item) => {
      const pin = pins.find((p) => p.id === item.id);
      return pin ? { ...pin, note: item.note } : null;
    })
    .filter((s): s is Pin & { note: string } => !!s);

  return (
    <div className={`clist-panel ${list ? 'open' : ''}`}>
      <div className="clist-head">
        <button className="lp-back" onClick={onClose}>←</button>
        <div>
          <div className="clist-title">{list.emoji} {list.name}</div>
          <div className="clist-sub">{list.count} places · {list.saves} saves</div>
        </div>
        <button className="clist-save-btn" onClick={() => showToast('✅ List saved to My EatMap!')}>
          Save list
        </button>
      </div>

      <div className="clist-body">
        <div className="clist-stats">
          <div className="clist-stat">
            <div className="clist-stat-n">{list.count}</div>
            <div className="clist-stat-l">Spots</div>
          </div>
          <div className="clist-stat">
            <div className="clist-stat-n">{list.saves}</div>
            <div className="clist-stat-l">Saves</div>
          </div>
          <div className="clist-stat">
            <div className="clist-stat-n">4.6</div>
            <div className="clist-stat-l">Avg rating</div>
          </div>
        </div>

        <div id="clistSpotsEl">
          {spotsData.map((spot) => {
            const style = CATEGORY_STYLES[spot.cat] || DEFAULT_STYLE;
            return (
              <div
                key={spot.id}
                className="clist-spot"
                onClick={() => {
                  onSelectPin(spot);
                  onClose();
                }}
              >
                <div className="clist-spot-em" style={{ background: style.thumb }}>
                  {spot.emoji}
                </div>
                <div className="clist-spot-info">
                  <div className="clist-spot-name">{spot.name}</div>
                  <div className="clist-spot-meta">{spot.area} · {spot.note}</div>
                </div>
                <div className="clist-spot-rating">★{spot.rating}</div>
              </div>
            );
          })}
          {spotsData.length === 0 && (
            <div style={{ color: 'var(--text3)', fontSize: '12px', padding: '12px 0' }}>
              No spots added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
