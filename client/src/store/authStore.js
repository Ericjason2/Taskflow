import { create } from 'zustand';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('tf_user') || 'null'),
  token: localStorage.getItem('tf_token') || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('tf_token'),

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('tf_token', data.token);
      localStorage.setItem('tf_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      connectSocket();
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Erreur de connexion' };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('tf_token', data.token);
      localStorage.setItem('tf_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      connectSocket();
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Erreur inscription' };
    }
  },

  logout: () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('tf_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  refreshUser: async () => {
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('tf_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch (_) {}
  },
}));

export default useAuthStore;
