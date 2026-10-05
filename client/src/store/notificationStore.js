import { create } from "zustand";
import { notificationAPI } from "../services/api";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await notificationAPI.getAll();
      set({
        notifications: data.data || [],
        unreadCount: data.unreadCount || 0,
        isLoading: false,
      });
    } catch (_) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      set((s) => {
        const notif = s.notifications.find((n) => n.id === id);
        const wasUnread = notif && !notif.lu;
        return {
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, lu: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
        };
      });
    } catch (_) {}
  },

  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllAsRead();
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, lu: true })),
        unreadCount: 0,
      }));
    } catch (_) {}
  },

  addIncomingNotification: (notification) => {
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },
}));

export default useNotificationStore;
