import React from 'react';
import { useUserStore } from '../../store/userStore';

interface TopBarProps {
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch }) => {
  const { token, openAuthModal, openProfile, logout } = useUserStore();

  return (
    <div className="topbar">
      <a className="logo" href="#">
        <span className="logo-eat">Eat</span>
        <span className="logo-map">Map</span>
      </a>
      <div className="divline"></div>
      <div className="city-badge">HYD ▾</div>
      
      <div className="search-wrap">
        <div className="search-pill" onClick={onOpenSearch}>
          <span className="si">⌕</span>
          <span className="sp">Search biryani, rooftop bars, cafes, street food in Hyderabad...</span>
          <span className="kbd">⌘K</span>
        </div>
      </div>

      <div className="auth">
        {token ? (
          <>
            <button className="btn-si" onClick={openProfile}>
              My Profile
            </button>
            <button className="btn-gs" onClick={logout} style={{ boxShadow: 'none', background: '#333', color: '#fff' }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <button className="btn-si" id="btnSignIn" onClick={() => openAuthModal('signin')}>
              Sign in
            </button>
            <button className="btn-gs" onClick={() => openAuthModal('signup')}>
              Get started
            </button>
          </>
        )}
      </div>
    </div>
  );
};
