import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuditService {
  private prisma = new PrismaClient();

  /**
   * 记录审计日志
   */
  async createLog(data: {
    userId?: number;
    merchantId?: number;
    riderId?: number;
    mainOrderId?: number;
    action: string;
    resource: string;
    resourceId?: number;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    status?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        status: data.status || 'SUCCESS',
      },
    });
  }

  /**
   * 查询审计日志
   */
  async findAll(skip = 0, take = 50, filters?: any) {
    const where: any = {};

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.resource) {
      where.resource = filters.resource;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取用户的操作历史
   */
  async getUserHistory(userId: number, skip = 0, take = 20) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取商户的操作历史
   */
  async getMerchantHistory(merchantId: number, skip = 0, take = 20) {
    return this.prisma.auditLog.findMany({
      where: { merchantId },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取订单的操作历史
   */
  async getOrderHistory(mainOrderId: number) {
    return this.prisma.auditLog.findMany({
      where: { mainOrderId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * 生成审计报告
   */
  async generateAuditReport(startDate: Date, endDate: Date) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 按操作类型统计
    const actionStats = {};
    logs.forEach(log => {
      if (!actionStats[log.action]) {
        actionStats[log.action] = 0;
      }
      actionStats[log.action]++;
    });

    // 按资源类型统计
    const resourceStats = {};
    logs.forEach(log => {
      if (!resourceStats[log.resource]) {
        resourceStats[log.resource] = 0;
      }
      resourceStats[log.resource]++;
    });

    // 失败操作统计
    const failedOperations = logs.filter(log => log.status === 'FAILED');

    return {
      totalLogs: logs.length,
      actionStats,
      resourceStats,
      failedOperations: failedOperations.length,
      failedOperationDetails: failedOperations,
      period: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * 检测异常操作
   */
  async detectAnomalies(timeWindowMinutes = 60) {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const recentLogs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: cutoffTime,
        },
      },
    });

    const anomalies = [];

    // 检测：同一用户短时间内大量操作
    const userOperationCount = {};
    recentLogs.forEach(log => {
      if (log.userId) {
        userOperationCount[log.userId] = (userOperationCount[log.userId] || 0) + 1;
      }
    });

    for (const [userId, count] of Object.entries(userOperationCount)) {
      if (count > 100) {
        anomalies.push({
          type: 'HIGH_OPERATION_FREQUENCY',
          userId: parseInt(userId as string),
          count,
          severity: 'HIGH',
        });
      }
    }

    // 检测：大量失败操作
    const failedCount = recentLogs.filter(log => log.status === 'FAILED').length;
    if (failedCount > 50) {
      anomalies.push({
        type: 'HIGH_FAILURE_RATE',
        failedCount,
        totalCount: recentLogs.length,
        severity: 'MEDIUM',
      });
    }

    return anomalies;
  }
}
