import { create } from 'zustand';
import { Pin, UserList, CommunityList } from '../types';
import { INITIAL_USER_LISTS, INITIAL_COMMUNITY_LISTS } from '../data/seed';

interface ListState {
  myLists: UserList[];
  communityLists: CommunityList[];
  createListModalOpen: boolean;
  atlPickerOpen: boolean;
  atlPin: Pin | null;
  selectedEmoji: string;
  listVis: 'public' | 'private';

  setMyLists: (lists: UserList[]) => void;
  setCommunityLists: (lists: CommunityList[]) => void;
  openCreateListModal: () => void;
  closeCreateListModal: () => void;
  openAtlPicker: (pin: Pin) => void;
  closeAtlPicker: () => void;
  setSelectedEmoji: (emoji: string) => void;
  setListVis: (vis: 'public' | 'private') => void;
  addMyList: (list: UserList) => void;
  incrementListCount: (index: number) => void;
  addPinToList: (index: number, pinId: number) => void;
}

export const useListStore = create<ListState>((set) => ({
  myLists: INITIAL_USER_LISTS,
  communityLists: INITIAL_COMMUNITY_LISTS,
  createListModalOpen: false,
  atlPickerOpen: false,
  atlPin: null,
  selectedEmoji: '🍛',
  listVis: 'public',

  setMyLists: (myLists) => set({ myLists }),
  setCommunityLists: (communityLists) => set({ communityLists }),
  openCreateListModal: () => set({ createListModalOpen: true }),
  closeCreateListModal: () => set({ createListModalOpen: false, selectedEmoji: '🍛', listVis: 'public' }),
  openAtlPicker: (atlPin) => set({ atlPickerOpen: true, atlPin }),
  closeAtlPicker: () => set({ atlPickerOpen: false, atlPin: null }),
  setSelectedEmoji: (selectedEmoji) => set({ selectedEmoji }),
  setListVis: (listVis) => set({ listVis }),
  addMyList: (list) => set((state) => ({ myLists: [list, ...state.myLists] })),
  incrementListCount: (index) => set((state) => {
    const updated = [...state.myLists];
    if (updated[index]) {
      updated[index] = { ...updated[index], count: updated[index].count + 1 };
    }
    return { myLists: updated };
  }),
  addPinToList: (index, pinId) => set((state) => {
    const updated = [...state.myLists];
    if (updated[index]) {
      const items = updated[index].items || [];
      if (!items.includes(pinId)) {
        const newItems = [...items, pinId];
        updated[index] = {
          ...updated[index],
          items: newItems,
          count: newItems.length
        };
      }
    }
    return { myLists: updated };
  })
}));
