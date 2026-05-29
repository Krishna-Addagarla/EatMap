import React from 'react';
import { Pin } from '../../types';
import { CATEGORY_STYLES, DEFAULT_STYLE } from '../../data/categories';

interface PhotoStripProps {
  pin: Pin;
}

export const PhotoStrip: React.FC<PhotoStripProps> = ({ pin }) => {
  const style = CATEGORY_STYLES[pin.cat] || DEFAULT_STYLE;

  return (
    <>
      <div className="sec-lbl">Photos</div>
      <div className="photos-row">
        {pin.photos.map((ph, idx) => (
          <div
            key={idx}
            className="pcard"
            style={{ background: style.thumb }}
          >
            <div className="pcard-em">{pin.emoji}</div>
            <div className="pcard-lbl">{ph}</div>
          </div>
        ))}
      </div>
    </>
  );
};
