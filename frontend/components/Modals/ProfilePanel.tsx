import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { useListStore } from '../../store/listStore';

export const ProfilePanel: React.FC = () => {
  const { profileOpen, closeProfile, userName, visitedPins, showToast } = useUserStore();
  const myLists = useListStore((state) => state.myLists);

  const [pricePref, setPricePref] = useState('$$');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['Biryani', 'Chai']);

  if (!profileOpen) return null;

  const totalPlacesSaved = myLists.reduce((sum, list) => sum + list.count, 0);

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleSave = () => {
    closeProfile();
    showToast('Taste profile saved!');
  };

  const cuisines = ['Biryani', 'Irani Chai', 'South Indian', 'Continental', 'Street Food', 'Pubs'];

  return (
    <div className={`profile-panel ${profileOpen ? 'open' : ''}`}>
      <div className="pp-head">
        <button className="pp-back" onClick={closeProfile}>←</button>
        <div className="pp-title">My Taste Profile</div>
      </div>
      
      <div className="pp-body">
        <div className="pp-avatar">👤</div>
        <div className="pp-name">{userName || 'Foodie Explorer'}</div>
        
        <div className="pp-stats">
          <div className="pp-stat">
            <div className="pp-stat-n">{totalPlacesSaved}</div>
            <div className="pp-stat-l">Saves</div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-n">{visitedPins.length}</div>
            <div className="pp-stat-l">Visits</div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-n">{myLists.length}</div>
            <div className="pp-stat-l">Lists</div>
          </div>
        </div>

        <div className="pref-sec">
          <div className="pref-t">Price preference</div>
          <div className="pref-chips">
            {['$', '$$', '$$$', '$$$$'].map((tier) => (
              <div
                key={tier}
                className={`pref-chip ${pricePref === tier ? 'sel' : ''}`}
                onClick={() => setPricePref(tier)}
              >
                {tier}
              </div>
            ))}
          </div>
        </div>

        <div className="pref-sec">
          <div className="pref-t">Favourite cuisines</div>
          <div className="pref-chips">
            {cuisines.map((cuis) => {
              const isSelected = selectedCuisines.includes(cuis);
              return (
                <div
                  key={cuis}
                  className={`pref-chip ${isSelected ? 'sel' : ''}`}
                  onClick={() => toggleCuisine(cuis)}
                >
                  {cuis}
                </div>
              );
            })}
          </div>
        </div>

        <button className="pp-save" onClick={handleSave}>
          Save taste profile
        </button>
      </div>
    </div>
  );
};
