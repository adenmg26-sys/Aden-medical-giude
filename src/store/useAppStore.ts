import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  savedProviders: number[];
  toggleSavedProvider: (id: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (lang) => set({ language: lang }),
      savedProviders: [],
      toggleSavedProvider: (id) =>
        set((state) => ({
          savedProviders: state.savedProviders.includes(id)
            ? state.savedProviders.filter((pId) => pId !== id)
            : [...state.savedProviders, id],
        })),
    }),
    {
      name: 'amg-storage',
    }
  )
);
