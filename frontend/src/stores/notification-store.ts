"use client";

import { create } from 'zustand';
import type { Notification } from '@/types/grid';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'Theft Alert Detected',
      message: 'Anomalous consumption pattern detected at Meter SM-4521 in Sector 7.',
      type: 'error',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      read: false,
    },
    {
      id: '2',
      title: 'Transformer Warning',
      message: 'Transformer TR-089 temperature exceeding threshold. Current: 78°C.',
      type: 'warning',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false,
    },
    {
      id: '3',
      title: 'QAOA Optimization Complete',
      message: 'Grid routing optimized. Efficiency improved by 3.2%.',
      type: 'success',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      read: false,
    },
    {
      id: '4',
      title: 'Renewable Output Peak',
      message: 'Solar panel array output reached 45MW — new daily record.',
      type: 'info',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      read: true,
    },
  ],
  unreadCount: 3,
  addNotification: (notification) => set((state) => {
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    return {
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
