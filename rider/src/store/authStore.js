import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  rider: null,
  token: localStorage.getItem('dfc_rider_token') || null,
  isAuthenticated: !!localStorage.getItem('dfc_rider_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/rider/login', { email, password });
      const { token, data } = res.data;
      localStorage.setItem('dfc_rider_token', token);
      set({
        token,
        rider: data.rider,
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
    localStorage.removeItem('dfc_rider_token');
    set({ token: null, rider: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const res = await api.get('/auth/rider/me');
      set({ rider: res.data.data.rider, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },
}));

export default useAuthStore;
