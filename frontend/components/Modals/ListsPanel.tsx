import React, { useState } from 'react';
import { Pin, CommunityList } from '../../types';
import { useListStore } from '../../store/listStore';
import { useUserStore } from '../../store/userStore';
import { CommunityListDetailPanel } from './CommunityListDetailPanel';

interface ListsPanelProps {
  isOpen: boolean;
  pins: Pin[];
  onClose: () => void;
  onSelectPin: (pin: Pin) => void;
}

export const ListsPanel: React.FC<ListsPanelProps> = ({
  isOpen,
  pins,
  onClose,
  onSelectPin
}) => {
  const { myLists, communityLists, openCreateListModal } = useListStore();
  const { showToast } = useUserStore();
  
  const [selectedClist, setSelectedClist] = useState<CommunityList | null>(null);

  if (!isOpen) return null;

  return (
    <div className={`lists-panel ${isOpen ? 'open' : ''}`}>
      <div className="lp-head">
        <button className="lp-back" onClick={onClose}>←</button>
        <div className="lp-title">My EatMap</div>
        <div className="lp-acts">
          <button className="lp-btn primary" onClick={openCreateListModal}>
            Create list
          </button>
        </div>
      </div>

      <div className="lp-body">
        <div className="slabel" style={{ paddingLeft: 0 }}>My Lists</div>
        {myLists.map((list, idx) => (
          <div
            key={idx}
            className="list-card"
            onClick={() => showToast(`Opening list: ${list.name}`)}
          >
            <div className="list-em">{list.emoji}</div>
            <div className="list-info">
              <div className="list-name">{list.name}</div>
              <div className="list-meta">{list.count} places · {list.desc}</div>
              <span className={`lbadge ${list.vis === 'public' ? 'lb-pub' : 'lb-priv'}`}>
                {list.vis === 'public' ? '🌐 Public' : '🔒 Private'}
              </span>
            </div>
            <div className="list-count">{list.count}</div>
          </div>
        ))}

        <div className="slabel" style={{ paddingLeft: 0, marginTop: '20px' }}>Community Playlists</div>
        {communityLists.map((list, idx) => (
          <div
            key={idx}
            className="list-card"
            onClick={() => setSelectedClist(list)}
          >
            <div className="list-em">{list.emoji}</div>
            <div className="list-info">
              <div className="list-name">{list.name}</div>
              <div className="list-meta">{list.count} places · {list.saves} saves · {list.desc}</div>
              <span className="lbadge lb-pub">🌐 Public</span>
            </div>
            <div className="list-count">{list.count}</div>
          </div>
        ))}
      </div>

      {/* Slide-in Secondary Detail Panel for Community Lists */}
      <CommunityListDetailPanel
        list={selectedClist}
        pins={pins}
        onClose={() => setSelectedClist(null)}
        onSelectPin={onSelectPin}
      />
    </div>
  );
};
