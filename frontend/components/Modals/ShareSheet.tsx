import React from 'react';
import { Pin } from '../../types';
import { useUserStore } from '../../store/userStore';
import { getSpotSlug } from '../../utils/slugify';

interface ShareSheetProps {
  isOpen: boolean;
  pin: Pin | null;
  onClose: () => void;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({ isOpen, pin, onClose }) => {
  const { showToast } = useUserStore();

  if (!isOpen) return null;

  const slug = pin ? getSpotSlug(pin.name, pin.area) : 'list';
  const link = `https://eatmap.in/spot/${slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link)
      .then(() => showToast('🔗 Link copied!'))
      .catch(() => showToast(`🔗 Copy: ${link}`));
  };

  return (
    <div className="share-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="share-handle"></div>
        <div className="share-title">
          {pin ? `Share: ${pin.name}` : 'Share this list'}
        </div>
        <div className="share-sub">
          {pin ? `${pin.area} · ★${pin.rating}` : 'Share your curated list'}
        </div>
        
        <div className="share-link-row">
          <div className="share-link-box">{link}</div>
          <button className="share-copy" onClick={copyToClipboard}>Copy</button>
        </div>

        <div className="share-options">
          <div className="share-opt" onClick={() => showToast('Shared to WhatsApp!')}>
            <div className="share-opt-icon">💬</div>
            <div className="share-opt-label">WhatsApp</div>
          </div>
          <div className="share-opt" onClick={() => showToast('Shared to Instagram!')}>
            <div className="share-opt-icon">📸</div>
            <div className="share-opt-label">Instagram</div>
          </div>
          <div className="share-opt" onClick={() => showToast('Shared to Twitter!')}>
            <div className="share-opt-icon">🐦</div>
            <div className="share-opt-label">Twitter</div>
          </div>
          <div className="share-opt" onClick={copyToClipboard}>
            <div className="share-opt-icon">🔗</div>
            <div className="share-opt-label">More</div>
          </div>
        </div>
      </div>
    </div>
  );
};
