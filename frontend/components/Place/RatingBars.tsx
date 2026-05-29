import React, { useEffect, useState } from 'react';
import { Pin } from '../../types';

interface RatingBarsProps {
  pin: Pin;
}

export const RatingBars: React.FC<RatingBarsProps> = ({ pin }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Delay slightly to trigger transition
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [pin]);

  const bars = [
    { label: '🍛 Food Quality', val: pin.food, color: '#22d3ee' },
    { label: '✨ Ambience', val: pin.ambience, color: '#a78bfa' },
    { label: '🤝 Service', val: pin.service, color: '#fb7185' },
    { label: '💰 Value for Money', val: pin.value, color: '#a3e635' },
    { label: '⏱ Wait Time', val: pin.wait, color: '#fbbf24' }
  ];

  return (
    <div style={{ marginBottom: '14px' }}>
      <div className="sec-lbl">Rating Breakdown</div>
      {bars.map((b) => (
        <div key={b.label} className="rrow">
          <div className="rlbl">{b.label}</div>
          <div className="rtrack">
            <div
              className="rfill"
              style={{
                width: animate ? `${(b.val / 5) * 100}%` : '0%',
                background: b.color
              }}
            ></div>
          </div>
          <div className="rval">{b.val}</div>
        </div>
      ))}
    </div>
  );
};
