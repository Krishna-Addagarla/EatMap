import React from 'react';
import { Pin, Occasion } from '../../types';
import { useMapStore } from '../../store/mapStore';
import { useListStore } from '../../store/listStore';
import { useUserStore } from '../../store/userStore';
import { OccasionMenu } from './OccasionMenu';
import { RecentVisits } from './RecentVisits';

interface SidebarProps {
  pins: Pin[];
  onOpenListsPanel: () => void;
  onSelectPin: (pin: Pin) => void;
  onSelectOccasion: (occ: Occasion) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pins,
  onOpenListsPanel,
  onSelectPin,
  onSelectOccasion
}) => {
  const { activeCategory, activeOccasion, setActiveCategory } = useMapStore();
  const { openCreateListModal, myLists, communityLists } = useListStore();
  const visitedPins = useUserStore((state) => state.visitedPins);

  const handleDiscoverClick = () => {
    setActiveCategory('all');
  };

  const isDiscoverActive = activeCategory === 'all' && !activeOccasion;

  return (
    <div className="sidebar">
      <div className="slabel">Navigate</div>
      <div 
        className={`ni ${isDiscoverActive ? 'active' : ''}`} 
        id="ni-discover" 
        onClick={handleDiscoverClick}
      >
        <span className="ic">◉</span>
        <span className="lbl">Discover</span>
      </div>

      <div className="sdiv"></div>
      
      <OccasionMenu 
        activeOccasion={activeOccasion} 
        onSelectOccasion={onSelectOccasion} 
      />

      <div className="sdiv"></div>
      
      <div className="slabel">My EatMap</div>
      <div className="ni" onClick={onOpenListsPanel}>
        <span className="ic">📋</span>
        <span className="lbl">Public lists</span>
        <span className="nbadge">{communityLists.length}</span>
      </div>
      <div className="ni" onClick={onOpenListsPanel}>
        <span className="ic">⭐</span>
        <span className="lbl">Favorites</span>
        <span className="nbadge">{myLists.length}</span>
      </div>
      <div className="ni" onClick={onOpenListsPanel}>
        <span className="ic">🕐</span>
        <span className="lbl">Recent visits</span>
      </div>
      <div className="ni" onClick={onOpenListsPanel}>
        <span className="ic">✅</span>
        <span className="lbl">Been there</span>
        <span className="nbadge">{visitedPins.length}</span>
      </div>
      <div className="ni" onClick={openCreateListModal}>
        <span className="ic">➕</span>
        <span className="lbl">Create a list</span>
      </div>

      <div className="sdiv"></div>
      
      <RecentVisits pins={pins} onSelectPin={onSelectPin} />
    </div>
  );
};
