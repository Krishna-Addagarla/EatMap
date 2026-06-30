import React, { useState } from 'react';
import { useListStore } from '../../store/listStore';
import { useUserStore } from '../../store/userStore';
import { apiFetch } from '../../services/api';

export const AddToListPicker: React.FC = () => {
  const { 
    atlPickerOpen, 
    atlPin, 
    closeAtlPicker, 
    myLists, 
    addPinToList
  } = useListStore();

  const { token, showToast } = useUserStore();
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  if (!atlPickerOpen || !atlPin) return null;

  const handleToggle = (index: number) => {
    const updated = new Set(checkedIndices);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setCheckedIndices(updated);
  };

  const handleDone = async () => {
    if (checkedIndices.size === 0) {
      showToast('Pick at least one list');
      return;
    }

    try {
      if (token && atlPin.apiId) {
        // Authenticated save to lists
        for (const idx of checkedIndices) {
          const list = myLists[idx];
          if (list?.apiId) {
            await apiFetch(`/lists/${list.apiId}/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ place_id: atlPin.apiId })
            });
            addPinToList(idx, atlPin.id);
          }
        }
      } else {
        // Local save
        checkedIndices.forEach((idx) => {
          addPinToList(idx, atlPin.id);
        });
      }
      
      showToast(`Added to ${checkedIndices.size} list${checkedIndices.size > 1 ? 's' : ''}!`);
      setCheckedIndices(new Set());
      closeAtlPicker();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  return (
    <div className="atl-bg" onClick={(e) => e.target === e.currentTarget && closeAtlPicker()}>
      <div className="atl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="atl-title">Add to list</div>
        <div className="atl-sub">Save "{atlPin.name}" to a list</div>
        <button className="atl-x" onClick={closeAtlPicker}>✕</button>

        <div className="atl-list">
          {myLists.map((l, idx) => {
            const isChecked = checkedIndices.has(idx);
            return (
              <div
                key={idx}
                className={`atl-item ${isChecked ? 'checked' : ''}`}
                onClick={() => handleToggle(idx)}
              >
                <div className="atl-em">{l.emoji}</div>
                <div className="atl-info">
                  <div className="atl-name">{l.name}</div>
                  <div className="atl-cnt">{l.count} places</div>
                </div>
                <div className="atl-check">
                  {isChecked ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="atl-newbtn"
          onClick={() => {
            closeAtlPicker();
            useListStore.setState({ createListModalOpen: true });
          }}
        >
          ➕ Create new list
        </button>
        <button className="atl-done" onClick={handleDone}>Done</button>
      </div>
    </div>
  );
};
