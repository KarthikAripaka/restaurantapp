import { create } from 'zustand';
import api from '../services/api';

const useRidersStore = create((set) => ({
  riders: [],
  isLoading: false,

  fetchRiders: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/dashboard/riders');
      set({ riders: res.data.data.riders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

export default useRidersStore;

