import { Notification } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const notificationService = {
  async getForUser(userId: string): Promise<Notification[]> {
    await new Promise((r) => setTimeout(r, 150));
    return mockStorage.getNotifications(userId);
  },

  async markAsRead(id: string): Promise<void> {
    mockStorage.markNotificationAsRead(id);
  },
};
