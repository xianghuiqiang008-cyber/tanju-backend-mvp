import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BulkService {
  private prisma = new PrismaClient();

  /**
   * 批量审核商户
   */
  async bulkApproveMerchants(merchantIds: number[], approvedBy: string) {
    const result = await this.prisma.merchant.updateMany({
      where: {
        id: {
          in: merchantIds,
        },
      },
      data: {
        licenseStatus: 'APPROVED',
        status: 'OPEN',
      },
    });

    return {
      successCount: result.count,
      failureCount: merchantIds.length - result.count,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量拒绝商户
   */
  async bulkRejectMerchants(merchantIds: number[], reason: string, rejectedBy: string) {
    const result = await this.prisma.merchant.updateMany({
      where: {
        id: {
          in: merchantIds,
        },
      },
      data: {
        licenseStatus: 'REJECTED',
        status: 'CLOSED',
      },
    });

    return {
      successCount: result.count,
      failureCount: merchantIds.length - result.count,
      reason,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量发放优惠券给用户
   */
  async bulkDistributeCoupons(userIds: number[], couponId: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    if (coupon.usedQuantity + userIds.length > coupon.quantity) {
      throw new Error('Insufficient coupon quantity');
    }

    const existingUserCoupons = await this.prisma.userCoupon.findMany({
      where: {
        couponId,
        userId: {
          in: userIds,
        },
      },
    });

    const existingUserIds = existingUserCoupons.map((uc) => uc.userId);
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return {
        successCount: 0,
        failureCount: userIds.length,
        message: 'All users have already claimed this coupon',
        timestamp: new Date().toISOString(),
      };
    }

    const userCoupons = newUserIds.map((userId) => ({
      userId,
      couponId,
    }));

    const result = await this.prisma.userCoupon.createMany({
      data: userCoupons,
      skipDuplicates: true,
    });

    return {
      successCount: result.count,
      failureCount: userIds.length - result.count,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量发放优惠券给商户（定向）
   */
  async bulkDistributeCouponsToMerchants(merchantIds: number[], couponData: any) {
    const coupons = [];

    for (const merchantId of merchantIds) {
      const coupon = await this.prisma.coupon.create({
        data: {
          ...couponData,
          merchantId,
          code: `${couponData.code}-${merchantId}-${Date.now()}`,
        },
      });
      coupons.push(coupon);
    }

    return {
      successCount: coupons.length,
      failureCount: merchantIds.length - coupons.length,
      coupons,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量导入用户
   */
  async bulkImportUsers(users: Array<{ phone: string; nickname?: string }>) {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        const existingUser = await this.prisma.user.findUnique({
          where: { phone: user.phone },
        });

        if (existingUser) {
          failureCount++;
          results.push({
            phone: user.phone,
            status: 'failed',
            reason: 'User already exists',
          });
          continue;
        }

        const newUser = await this.prisma.user.create({
          data: {
            phone: user.phone,
            nickname: user.nickname,
            role: 'USER',
          },
        });

        successCount++;
        results.push({
          phone: user.phone,
          status: 'success',
          userId: newUser.id,
        });
      } catch (error) {
        failureCount++;
        results.push({
          phone: user.phone,
          status: 'failed',
          reason: error.message,
        });
      }
    }

    return {
      successCount,
      failureCount,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量导入商户
   */
  async bulkImportMerchants(merchants: Array<{ name: string; stallNo: string; category?: string }>) {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const merchant of merchants) {
      try {
        const existingMerchant = await this.prisma.merchant.findUnique({
          where: { stallNo: merchant.stallNo },
        });

        if (existingMerchant) {
          failureCount++;
          results.push({
            stallNo: merchant.stallNo,
            status: 'failed',
            reason: 'Merchant already exists',
          });
          continue;
        }

        const newMerchant = await this.prisma.merchant.create({
          data: {
            name: merchant.name,
            stallNo: merchant.stallNo,
            category: merchant.category,
            status: 'CLOSED',
            licenseStatus: 'PENDING',
          },
        });

        successCount++;
        results.push({
          stallNo: merchant.stallNo,
          status: 'success',
          merchantId: newMerchant.id,
        });
      } catch (error) {
        failureCount++;
        results.push({
          stallNo: merchant.stallNo,
          status: 'failed',
          reason: error.message,
        });
      }
    }

    return {
      successCount,
      failureCount,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量发送通知
   */
  async bulkSendNotifications(
    userIds: number[],
    notification: { type: string; title: string; content: string },
  ) {
    const notifications = userIds.map((userId) => ({
      userId,
      ...notification,
    }));

    const result = await this.prisma.notification.createMany({
      data: notifications,
    });

    return {
      successCount: result.count,
      failureCount: userIds.length - result.count,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量更新用户积分
   */
  async bulkUpdateUserPoints(updates: Array<{ userId: number; points: number }>) {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const update of updates) {
      try {
        const user = await this.prisma.user.update({
          where: { id: update.userId },
          data: {
            points: {
              increment: update.points,
            },
          },
        });

        successCount++;
        results.push({
          userId: update.userId,
          status: 'success',
          newPoints: user.points,
        });
      } catch (error) {
        failureCount++;
        results.push({
          userId: update.userId,
          status: 'failed',
          reason: error.message,
        });
      }
    }

    return {
      successCount,
      failureCount,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量关闭订单
   */
  async bulkCloseOrders(orderIds: number[], reason: string) {
    const result = await this.prisma.mainOrder.updateMany({
      where: {
        id: {
          in: orderIds,
        },
        status: {
          in: ['PENDING_PAYMENT', 'PENDING_ACCEPT'],
        },
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return {
      successCount: result.count,
      failureCount: orderIds.length - result.count,
      reason,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 批量审批提现申请
   */
  async bulkApproveWithdrawals(withdrawalIds: number[], approvedBy: string) {
    const result = await this.prisma.withdrawal.updateMany({
      where: {
        id: {
          in: withdrawalIds,
        },
        status: 'PENDING',
      },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    return {
      successCount: result.count,
      failureCount: withdrawalIds.length - result.count,
      approvedBy,
      timestamp: new Date().toISOString(),
    };
  }
}
