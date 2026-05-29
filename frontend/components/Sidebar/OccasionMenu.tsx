import React from 'react';
import { Occasion } from '../../types';
import { OCCASIONS } from '../../data/occasions';

interface OccasionMenuProps {
  activeOccasion: Occasion | null;
  onSelectOccasion: (occ: Occasion) => void;
}

export const OccasionMenu: React.FC<OccasionMenuProps> = ({
  activeOccasion,
  onSelectOccasion
}) => {
  return (
    <>
      <div className="slabel">Occasions</div>
      {OCCASIONS.map((occ) => {
        const isActive = activeOccasion?.name === occ.name;
        return (
          <div
            key={occ.name}
            className={`ni ${isActive ? 'active' : ''}`}
            onClick={() => onSelectOccasion(occ)}
          >
            <span className="ic">{occ.emoji}</span>
            <span className="lbl">{occ.name.replace(occ.emoji, '').trim()}</span>
          </div>
        );
      })}
    </>
  );
};
