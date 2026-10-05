import { create } from "zustand";
import { notificationAPI } from "../services/api";

const isNotificationUnread = (notif) => {
  if (!notif) return false;
  return (
    notif.lu === false ||
    notif.lu === 0 ||
    notif.lu === "0" ||
    notif.lu === "false" ||
    !notif.lu
  );
};

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
      const list = data.data || [];
      const computedUnread = list.filter(isNotificationUnread).length;
      set({
        notifications: list,
        unreadCount:
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : computedUnread,
        isLoading: false,
      });
    } catch (_) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    const targetId = Number(id);
    // Optimistic instant UI update
    set((s) => {
      const notif = s.notifications.find((n) => Number(n.id) === targetId);
      const wasUnread = isNotificationUnread(notif);
      return {
        notifications: s.notifications.map((n) =>
          Number(n.id) === targetId ? { ...n, lu: true } : n
        ),
        unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    });
    try {
      const res = await notificationAPI.markAsRead(targetId);
      if (res?.data?.unreadCount !== undefined) {
        set({ unreadCount: res.data.unreadCount });
      }
    } catch (err) {
      console.error("Erreur markAsRead:", err);
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    // Optimistic instant UI update
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, lu: true })),
      unreadCount: 0,
    }));
    try {
      const res = await notificationAPI.markAllAsRead();
      if (res?.data?.unreadCount !== undefined) {
        set({ unreadCount: res.data.unreadCount });
      }
    } catch (err) {
      console.error("Erreur markAllAsRead:", err);
      get().fetchNotifications();
    }
  },

  deleteNotification: async (id) => {
    const targetId = Number(id);
    set((s) => {
      const notif = s.notifications.find((n) => Number(n.id) === targetId);
      const wasUnread = isNotificationUnread(notif);
      return {
        notifications: s.notifications.filter((n) => Number(n.id) !== targetId),
        unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    });
    try {
      const res = await notificationAPI.delete(targetId);
      if (res?.data?.unreadCount !== undefined) {
        set({ unreadCount: res.data.unreadCount });
      }
    } catch (err) {
      console.error("Erreur deleteNotification:", err);
      get().fetchNotifications();
    }
  },

  addIncomingNotification: (notification) => {
    if (!notification || !notification.id) return;
    const targetId = Number(notification.id);
    set((s) => {
      if (s.notifications.some((n) => Number(n.id) === targetId)) {
        return s;
      }
      return {
        notifications: [notification, ...s.notifications],
        unreadCount: s.unreadCount + 1,
      };
    });
  },
}));

export default useNotificationStore;
