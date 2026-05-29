import React, { useEffect, useState } from 'react';
import { usePins } from '../hooks/usePins';
import { useSearch } from '../hooks/useSearch';
import { useChat } from '../hooks/useChat';
import { useMapStore } from '../store/mapStore';
import { useUserStore } from '../store/userStore';
import { CATEGORIES, CATEGORY_STYLES } from '../data/categories';
import { Pin } from '../types';

import { TopBar } from '../components/Layout/TopBar';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { MapView } from '../components/Map/MapView';
import { DetailPanel } from '../components/Place/DetailPanel';
import { ChatPanel } from '../components/Chat/ChatPanel';
import { SearchOverlay } from '../components/Search/SearchOverlay';

// Modals
import { AuthModal } from '../components/Modals/AuthModal';
import { CreateListModal } from '../components/Modals/CreateListModal';
import { ShareSheet } from '../components/Modals/ShareSheet';
import { AddToListPicker } from '../components/Modals/AddToListPicker';
import { ProfilePanel } from '../components/Modals/ProfilePanel';
import { ListsPanel } from '../components/Modals/ListsPanel';

export const HomePage: React.FC = () => {
  const { pins, filteredPins } = usePins();
  const {
    selectedPin,
    setSelectedPin,
    activeCategory,
    activeOccasion,
    setActiveCategory,
    setActiveOccasion,
    showPopHeatmap,
    showDenHeatmap,
    setShowPopHeatmap,
    setShowDenHeatmap
  } = useMapStore();

  const {
    toastMessage,
    toastShow,
    hideToast,
    addRecentVisit
  } = useUserStore();

  const [listsPanelOpen, setListsPanelOpen] = useState(false);
  const [sharePin, setSharePin] = useState<Pin | null>(null);

  // Sync recent views when pin selected
  const handleSelectPin = (pin: Pin) => {
    setSelectedPin(pin);
    addRecentVisit(pin.id);
  };

  // Search logic setup
  const {
    searchOpen,
    query,
    srchIdx,
    filteredResults,
    setQuery,
    openSearch,
    closeSearch
  } = useSearch(pins, handleSelectPin);

  // AI Chat assistant hooks
  const {
    chatOpen,
    messages,
    isTyping,
    setChatOpen,
    sendMessage
  } = useChat(pins);

  // Auto-hide Toast handler
  useEffect(() => {
    if (toastShow) {
      const timer = setTimeout(() => {
        hideToast();
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [toastShow]);

  return (
    <div className="app">
      {/* Top Banner Navigation */}
      <TopBar onOpenSearch={openSearch} />

      {/* Main Body Split Panel */}
      <div className="main">
        
        {/* Sidebar Nav */}
        <Sidebar
          pins={pins}
          onOpenListsPanel={() => setListsPanelOpen(true)}
          onSelectPin={handleSelectPin}
          onSelectOccasion={setActiveOccasion}
        />

        {/* Map Workspace */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          {/* Active Occasion Filtering Info Bar */}
          {activeOccasion && (
            <div className="occ-banner">
              <div>
                <div className="occ-title">{activeOccasion.name}</div>
                <div className="occ-sub">{activeOccasion.sub}</div>
              </div>
              <button className="occ-clear" onClick={() => setActiveOccasion(null)}>
                Clear filter
              </button>
            </div>
          )}

          {/* Interactive Map */}
          <MapView pins={filteredPins} onSelectPin={handleSelectPin} />

          {/* Floating chatbot toggle button */}
          <button className="fab" onClick={() => setChatOpen(!chatOpen)}>
            💬
          </button>

          {/* Claude assistant chat widget */}
          <ChatPanel
            isOpen={chatOpen}
            messages={messages}
            isTyping={isTyping}
            onClose={() => setChatOpen(false)}
            onSendMessage={sendMessage}
          />

          {/* Top-Right Toggle & Category Filter card */}
          <div className="filter-panel">
            <div className="filter-card">
              <div className="filter-card-title">Layers</div>
              
              <div className="layer-row" onClick={() => setShowPopHeatmap(!showPopHeatmap)}>
                <div className="layer-left">
                  <span className="layer-dot" style={{ background: '#fbbf24' }}></span>
                  Popularity
                </div>
                <div className={`toggle ${showPopHeatmap ? 'on' : ''}`}></div>
              </div>
              
              <div className="layer-row" onClick={() => setShowDenHeatmap(!showDenHeatmap)}>
                <div className="layer-left">
                  <span className="layer-dot" style={{ background: '#22d3ee' }}></span>
                  Density
                </div>
                <div className={`toggle ${showDenHeatmap ? 'on' : ''}`}></div>
              </div>
            </div>

            <div className="filter-card">
              <div className="filter-card-title">Category</div>
              <div className="cat-chips">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const cStyle = CATEGORY_STYLES[cat.id] || { text: '#fff' };
                  
                  return (
                    <div
                      key={cat.id}
                      className={`cchip ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <span className="cdot" style={{ background: isActive ? 'var(--green)' : cStyle.text }}></span>
                      {cat.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Map Legend */}
          <div className="legend">
            <div className="ltitle">Categories</div>
            <div className="litem">
              <span className="ldotleg" style={{ background: '#fbbf24' }}></span>Biryani
            </div>
            <div className="litem">
              <span className="ldotleg" style={{ background: '#22d3ee' }}></span>Cafes
            </div>
            <div className="litem">
              <span className="ldotleg" style={{ background: '#fb7185' }}></span>Tiffin
            </div>
            <div className="litem">
              <span className="ldotleg" style={{ background: '#a78bfa' }}></span>Rooftop
            </div>
            <div className="litem">
              <span className="ldotleg" style={{ background: '#a3e635' }}></span>Street
            </div>
            <div className="litem">
              <span className="ldotleg" style={{ background: '#60a5fa' }}></span>Pubs
            </div>
          </div>

          {/* Details slide up panel */}
          <DetailPanel
            pin={selectedPin}
            onClose={() => setSelectedPin(null)}
            onShare={(p) => setSharePin(p)}
          />

        </div>

      </div>

      {/* Global Modals Overlays */}
      <SearchOverlay
        isOpen={searchOpen}
        query={query}
        srchIdx={srchIdx}
        results={filteredResults}
        onClose={closeSearch}
        onQueryChange={setQuery}
        onPickResult={(p) => {
          handleSelectPin(p);
          closeSearch();
        }}
        onPickCategory={(cat) => {
          setActiveCategory(cat);
          closeSearch();
        }}
      />

      <AuthModal />
      <CreateListModal />
      <AddToListPicker />
      
      <ProfilePanel />
      
      <ListsPanel
        isOpen={listsPanelOpen}
        pins={pins}
        onClose={() => setListsPanelOpen(false)}
        onSelectPin={handleSelectPin}
      />

      <ShareSheet
        isOpen={!!sharePin}
        pin={sharePin}
        onClose={() => setSharePin(null)}
      />

      {/* Global Toast Alert Box */}
      <div className={`toast ${toastShow ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
};
export default HomePage;
