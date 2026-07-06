import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class NotificationService {
  private prisma = new PrismaClient();

  /**
   * 创建通知
   */
  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    content: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  /**
   * 获取用户的未读通知
   */
  async getUnreadNotifications(userId: number, skip = 0, take = 20) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取用户的所有通知
   */
  async getAllNotifications(userId: number, skip = 0, take = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: number) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(userId: number) {
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    const totalCount = await this.prisma.notification.count({
      where: { userId },
    });

    return {
      unreadCount,
      totalCount,
    };
  }
}
