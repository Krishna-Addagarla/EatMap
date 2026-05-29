import React, { useState } from 'react';
import { useListStore } from '../../store/listStore';
import { useUserStore } from '../../store/userStore';
import { apiFetch } from '../../services/api';
import { EMOJIS } from '../../data/seed';

export const CreateListModal: React.FC = () => {
  const { 
    createListModalOpen, 
    closeCreateListModal, 
    selectedEmoji, 
    setSelectedEmoji, 
    listVis, 
    setListVis, 
    addMyList 
  } = useListStore();

  const { token, showToast } = useUserStore();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!createListModalOpen) return null;

  const handleCreate = async () => {
    const listName = name.trim();
    if (!listName) {
      showToast('Please enter a list name');
      return;
    }

    setIsSaving(true);
    try {
      const listDesc = desc.trim() || 'New list';
      
      if (token) {
        // Authenticated creation
        const created = await apiFetch<any>('/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: listName,
            emoji: selectedEmoji,
            visibility: listVis,
            description: listDesc
          })
        });
        addMyList({
          apiId: created.id,
          name: created.name,
          emoji: created.emoji,
          count: 0,
          vis: created.visibility,
          desc: created.description || 'New list'
        });
      } else {
        // Local temporary creation
        addMyList({
          name: listName,
          emoji: selectedEmoji,
          count: 0,
          vis: listVis,
          desc: listDesc
        });
      }
      
      closeCreateListModal();
      showToast(`List created: ${listName}`);
      setName('');
      setDesc('');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && closeCreateListModal()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Create a list</div>
        <button className="modal-x" onClick={closeCreateListModal}>✕</button>
        
        <div className="field">
          <label>List name</label>
          <input
            className="finp"
            type="text"
            placeholder="e.g. Weekend Brunch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            className="finp"
            placeholder="What's this list about?"
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <div className="field">
          <label>Choose emoji</label>
          <div className="emgrid">
            {EMOJIS.map((em) => (
              <div
                key={em}
                className={`emsel ${em === selectedEmoji ? 'sel' : ''}`}
                onClick={() => setSelectedEmoji(em)}
              >
                {em}
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Visibility</label>
          <div className="vis-togs">
            <button
              className={`vtog ${listVis === 'public' ? 'sel' : ''}`}
              onClick={() => setListVis('public')}
            >
              🌐 Public
            </button>
            <button
              className={`vtog ${listVis === 'private' ? 'sel' : ''}`}
              onClick={() => setListVis('private')}
            >
              🔒 Private
            </button>
          </div>
        </div>

        <div className="modal-foot">
          <button className="mbtn" onClick={closeCreateListModal}>Cancel</button>
          <button className="mbtn primary" onClick={handleCreate} disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create list'}
          </button>
        </div>
      </div>
    </div>
  );
};
