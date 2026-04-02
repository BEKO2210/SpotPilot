import { create } from 'zustand';
import { Provider } from '../types';

interface SettingsState {
  provider: Provider | null;
  setProvider: (provider: Provider | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider })
}));
