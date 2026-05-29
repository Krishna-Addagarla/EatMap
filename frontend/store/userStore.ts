import { create } from 'zustand';

interface UserState {
  token: string;
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  profileOpen: boolean;
  userEmail: string;
  userName: string;
  visitedPins: number[];
  pinStars: Record<number, number>; // pinId -> rating
  toastMessage: string;
  toastShow: boolean;
  recentVisits: number[]; // Array of pinIds in chronological order
  
  setToken: (token: string) => void;
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'signin' | 'signup') => void;
  openProfile: () => void;
  closeProfile: () => void;
  setUserEmail: (email: string) => void;
  setUserName: (name: string) => void;
  markVisited: (pinId: number) => void;
  setStarRating: (pinId: number, stars: number) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  addRecentVisit: (pinId: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('eatmapToken') || '',
  authModalOpen: false,
  authModalTab: 'signin',
  profileOpen: false,
  userEmail: '',
  userName: '',
  visitedPins: [],
  pinStars: {},
  toastMessage: '',
  toastShow: false,
  recentVisits: [],

  setToken: (token) => {
    localStorage.setItem('eatmapToken', token);
    set({ token });
  },
  openAuthModal: (tab = 'signin') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setAuthModalTab: (authModalTab) => set({ authModalTab }),
  openProfile: () => set({ profileOpen: true }),
  closeProfile: () => set({ profileOpen: false }),
  setUserEmail: (userEmail) => set({ userEmail }),
  setUserName: (userName) => set({ userName }),
  markVisited: (pinId) => set((state) => {
    if (state.visitedPins.includes(pinId)) return {};
    return { visitedPins: [...state.visitedPins, pinId] };
  }),
  setStarRating: (pinId, stars) => set((state) => ({
    pinStars: { ...state.pinStars, [pinId]: stars }
  })),
  showToast: (toastMessage) => {
    set({ toastMessage, toastShow: true });
  },
  hideToast: () => set({ toastShow: false }),
  addRecentVisit: (pinId) => set((state) => {
    const list = state.recentVisits.filter(id => id !== pinId);
    list.unshift(pinId);
    return { recentVisits: list.slice(0, 5) };
  }),
  logout: () => {
    localStorage.removeItem('eatmapToken');
    set({ token: '', userEmail: '', userName: '', profileOpen: false });
  }
}));
