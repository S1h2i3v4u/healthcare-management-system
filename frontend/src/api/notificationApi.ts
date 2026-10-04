import axiosClient from './axiosClient';
import type { ApiResponse, AppNotification } from '@/types';

export async function getMyNotifications(): Promise<AppNotification[]> {
  const response = await axiosClient.get<ApiResponse<AppNotification[]>>('/notifications/my');
  return response.data.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await axiosClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
  return response.data.data.unreadCount;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await axiosClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await axiosClient.put('/notifications/read-all');
}