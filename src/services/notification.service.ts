import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  module: string;
  referenceId: string | null;
  userId: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  }

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }
}

export default new NotificationService();
