import { create } from 'zustand';

interface ServerErrorStore {
  serverError: boolean;
  setServerError: (error: boolean) => void;
}

export const useServerErrorStore = create<ServerErrorStore>((set) => ({
  serverError: false,
  setServerError: (error) => set({ serverError: error }),
}));
