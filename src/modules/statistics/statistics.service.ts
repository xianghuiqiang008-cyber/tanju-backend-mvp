import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StatisticsService {
  private prisma = new PrismaClient();

  /**
   * 获取平台概览数据
   */
  async getPlatformOverview() {
    const [totalOrders, totalRevenue, totalUsers, activeMerchants] = await Promise.all([
      this.prisma.mainOrder.count(),
      this.prisma.mainOrder.aggregate({
        _sum: { totalAmount: true },
      }),
      this.prisma.user.count({
        where: { role: 'USER' },
      }),
      this.prisma.merchant.count({
        where: { status: 'OPEN' },
      }),
    ]);

    const platformFeeStats = await this.prisma.mainOrder.aggregate({
      _sum: { platformFee: true },
    });

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalUsers,
      activeMerchants,
      platformNetIncome: platformFeeStats._sum.platformFee || 0,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取订单趋势（按日期）
   */
  async getOrderTrend(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.mainOrder.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return orders.map((item) => ({
      date: item.createdAt,
      orderCount: item._count.id,
      revenue: item._sum.totalAmount || 0,
    }));
  }

  /**
   * 获取商户排行
   */
  async getMerchantRanking(limit: number = 10) {
    const merchants = await this.prisma.merchant.findMany({
      select: {
        id: true,
        name: true,
        totalOrders: true,
        totalRevenue: true,
        rating: true,
        balance: true,
      },
      orderBy: {
        totalRevenue: 'desc',
      },
      take: limit,
    });

    return merchants.map((merchant, index) => ({
      rank: index + 1,
      ...merchant,
    }));
  }

  /**
   * 获取用户统计
   */
  async getUserStatistics() {
    const [totalUsers, activeUsers, newUsersToday, returningUsers] = await Promise.all([
      this.prisma.user.count({
        where: { role: 'USER' },
      }),
      this.prisma.user.count({
        where: {
          role: 'USER',
          orders: {
            some: {
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'USER',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'USER',
          orders: {
            some: {
              createdAt: {
                lt: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      returningUsers,
      activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
    };
  }

  /**
   * 获取支付方式统计
   */
  async getPaymentMethodStats() {
    const paymentStats = await this.prisma.payment.groupBy({
      by: ['method'],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    return paymentStats.map((stat) => ({
      method: stat.method,
      count: stat._count.id,
      totalAmount: stat._sum.amount || 0,
    }));
  }

  /**
   * 获取订单状态分布
   */
  async getOrderStatusDistribution() {
    const statusStats = await this.prisma.mainOrder.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return statusStats.map((stat) => ({
      status: stat.status,
      count: stat._count.id,
    }));
  }

  /**
   * 获取商户认证统计
   */
  async getMerchantVerificationStats() {
    const [totalMerchants, verifiedMerchants, pendingMerchants, rejectedMerchants] = await Promise.all([
      this.prisma.merchant.count(),
      this.prisma.merchant.count({
        where: { licenseStatus: 'APPROVED' },
      }),
      this.prisma.merchant.count({
        where: { licenseStatus: 'PENDING' },
      }),
      this.prisma.merchant.count({
        where: { licenseStatus: 'REJECTED' },
      }),
    ]);

    return {
      totalMerchants,
      verifiedMerchants,
      pendingMerchants,
      rejectedMerchants,
      verificationRate: totalMerchants > 0 ? ((verifiedMerchants / totalMerchants) * 100).toFixed(2) : 0,
    };
  }

  /**
   * 获取优惠券使用统计
   */
  async getCouponUsageStats() {
    const [totalCoupons, activeCoupons, usedCoupons, expiredCoupons] = await Promise.all([
      this.prisma.coupon.count(),
      this.prisma.coupon.count({
        where: {
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
      }),
      this.prisma.userCoupon.count({
        where: { isUsed: true },
      }),
      this.prisma.coupon.count({
        where: {
          endDate: {
            lt: new Date(),
          },
        },
      }),
    ]);

    return {
      totalCoupons,
      activeCoupons,
      usedCoupons,
      expiredCoupons,
      usageRate: totalCoupons > 0 ? ((usedCoupons / totalCoupons) * 100).toFixed(2) : 0,
    };
  }

  /**
   * 获取配送统计
   */
  async getDeliveryStats() {
    const [totalDeliveries, completedDeliveries, pendingDeliveries] = await Promise.all([
      this.prisma.delivery.count(),
      this.prisma.delivery.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.delivery.count({
        where: { status: 'PENDING_ASSIGN' },
      }),
    ]);

    const avgDeliveryTime = await this.prisma.delivery.aggregate({
      _avg: {
        // 计算配送时间（假设 deliveryTime - pickupTime）
        // 这里需要在数据库中计算，Prisma 可能需要原生查询
      },
    });

    return {
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      completionRate: totalDeliveries > 0 ? ((completedDeliveries / totalDeliveries) * 100).toFixed(2) : 0,
    };
  }

  /**
   * 获取财务统计
   */
  async getFinanceStats() {
    const [totalRevenue, platformFee, merchantIncome, totalWithdrawals] = await Promise.all([
      this.prisma.mainOrder.aggregate({
        _sum: { totalAmount: true },
      }),
      this.prisma.mainOrder.aggregate({
        _sum: { platformFee: true },
      }),
      this.prisma.mainOrder.aggregate({
        _sum: { merchantAmount: true },
      }),
      this.prisma.withdrawal.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      platformFee: platformFee._sum.platformFee || 0,
      merchantIncome: merchantIncome._sum.merchantAmount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      platformNetIncome: (platformFee._sum.platformFee || 0) - (totalWithdrawals._sum.amount || 0),
    };
  }

  /**
   * 获取综合仪表板数据
   */
  async getDashboard() {
    const [overview, orderTrend, merchantRanking, userStats, paymentStats, financeStats] = await Promise.all([
      this.getPlatformOverview(),
      this.getOrderTrend(7),
      this.getMerchantRanking(5),
      this.getUserStatistics(),
      this.getPaymentMethodStats(),
      this.getFinanceStats(),
    ]);

    return {
      overview,
      orderTrend,
      merchantRanking,
      userStats,
      paymentStats,
      financeStats,
      timestamp: new Date().toISOString(),
    };
  }
}
