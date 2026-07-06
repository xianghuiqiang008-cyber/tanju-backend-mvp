import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CouponService {
  private prisma = new PrismaClient();

  /**
   * 创建优惠券
   */
  async createCoupon(data: {
    code: string;
    name: string;
    type: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    quantity: number;
    startDate: Date;
    endDate: Date;
    merchantId?: number;
  }) {
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    return this.prisma.coupon.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  /**
   * 获取优惠券列表
   */
  async findAll(skip = 0, take = 20, filters?: any) {
    const where: any = {
      isActive: true,
      endDate: {
        gte: new Date(),
      },
    };

    if (filters?.merchantId) {
      where.merchantId = filters.merchantId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.coupon.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 用户领取优惠券
   */
  async claimCoupon(userId: number, couponCode: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    if (!coupon.isActive) {
      throw new Error('Coupon is not active');
    }

    if (coupon.usedQuantity >= coupon.quantity) {
      throw new Error('Coupon is out of stock');
    }

    if (new Date() > coupon.endDate) {
      throw new Error('Coupon has expired');
    }

    // 检查用户是否已领取
    const existingUserCoupon = await this.prisma.userCoupon.findFirst({
      where: {
        userId,
        couponId: coupon.id,
      },
    });

    if (existingUserCoupon) {
      throw new Error('User has already claimed this coupon');
    }

    const userCoupon = await this.prisma.userCoupon.create({
      data: {
        userId,
        couponId: coupon.id,
      },
    });

    return userCoupon;
  }

  /**
   * 验证并使用优惠券
   */
  async useCoupon(userId: number, couponId: number, orderAmount: number) {
    const userCoupon = await this.prisma.userCoupon.findFirst({
      where: {
        userId,
        couponId,
        isUsed: false,
      },
      include: {
        coupon: true,
      },
    });

    if (!userCoupon) {
      throw new Error('User coupon not found or already used');
    }

    const coupon = userCoupon.coupon;

    // 检查订单金额是否满足最低要求
    if (orderAmount < Number(coupon.minOrderAmount)) {
      throw new Error(
        `Order amount must be at least ${coupon.minOrderAmount}`,
      );
    }

    // 计算折扣
    let discountAmount = 0;

    if (coupon.type === 'DISCOUNT') {
      // 折扣券：按比例折扣
      discountAmount = orderAmount * Number(coupon.discountValue);
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(
          discountAmount,
          Number(coupon.maxDiscountAmount),
        );
      }
    } else if (coupon.type === 'FULL_REDUCTION') {
      // 满减券：直接减少金额
      discountAmount = Number(coupon.discountValue);
    }

    // 标记优惠券为已使用
    await this.prisma.userCoupon.update({
      where: { id: userCoupon.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // 更新优惠券使用数量
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedQuantity: {
          increment: 1,
        },
      },
    });

    return {
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    };
  }

  /**
   * 获取用户的优惠券列表
   */
  async getUserCoupons(userId: number, skip = 0, take = 20) {
    return this.prisma.userCoupon.findMany({
      where: { userId },
      include: {
        coupon: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取优惠券统计
   */
  async getCouponStats() {
    const totalCoupons = await this.prisma.coupon.count();
    const activeCoupons = await this.prisma.coupon.count({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
    });

    const totalUsed = await this.prisma.coupon.aggregate({
      _sum: {
        usedQuantity: true,
      },
    });

    return {
      totalCoupons,
      activeCoupons,
      totalUsed: totalUsed._sum.usedQuantity || 0,
    };
  }
}
