import { useState, useMemo, useEffect } from 'react';
import { Pin } from '../types';

export function useSearch(pins: Pin[], onSelectPin: (pin: Pin) => void) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [srchIdx, setSrchIdx] = useState(-1);

  // Filtered results based on search input
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pins;
    return pins.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [pins, query]);

  // Open / Close search functions
  const openSearch = () => {
    setSearchOpen(true);
    setQuery('');
    setSrchIdx(-1);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setSrchIdx(-1);
  };

  // Keyboard shortcut triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }

      // Close on Escape
      if (e.key === 'Escape') {
        closeSearch();
      }

      // If search is open, handle search index selections
      if (searchOpen && filteredResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSrchIdx((prev) => Math.min(prev + 1, filteredResults.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSrchIdx((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (srchIdx >= 0 && filteredResults[srchIdx]) {
            onSelectPin(filteredResults[srchIdx]);
            closeSearch();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, filteredResults, srchIdx, onSelectPin]);

  return {
    searchOpen,
    query,
    srchIdx,
    filteredResults,
    setQuery,
    setSrchIdx,
    openSearch,
    closeSearch
  };
}
