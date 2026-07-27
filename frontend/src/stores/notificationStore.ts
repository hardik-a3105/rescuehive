import { create } from "zustand";
import type { AppNotification } from "@/types/domain";
import { generateNotifications } from "@/utils/mockData";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  push: (n: AppNotification) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const seed = generateNotifications(10);

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: seed,
  unreadCount: seed.filter((n) => !n.read).length,
  push: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    })),
}));
