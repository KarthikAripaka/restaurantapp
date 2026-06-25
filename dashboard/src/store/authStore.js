import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  restaurant: null,
  token: localStorage.getItem('dfc_token') || null,
  isAuthenticated: !!localStorage.getItem('dfc_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, data } = res.data;
      localStorage.setItem('dfc_token', token);
      set({
        token,
        restaurant: data.restaurant,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('dfc_token');
    set({ token: null, restaurant: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const res = await api.get('/auth/me');
      set({ restaurant: res.data.data.restaurant, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  updateRestaurant: (data) => set({ restaurant: { ...get().restaurant, ...data } }),
}));

export default useAuthStore;
