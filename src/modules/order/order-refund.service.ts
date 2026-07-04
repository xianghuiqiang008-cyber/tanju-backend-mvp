import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrderRefundService {
  private prisma = new PrismaClient();

  /**
   * 创建退款申请
   */
  async createRefund(mainOrderId: number, reason: string, amount?: number) {
    const order = await this.prisma.mainOrder.findUnique({
      where: { id: mainOrderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PAID') {
      throw new Error('Only paid orders can be refunded');
    }

    const refundAmount = amount || Number(order.totalAmount);

    if (refundAmount > Number(order.totalAmount)) {
      throw new Error('Refund amount exceeds order total');
    }

    const refundNo = `RF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const refund = await this.prisma.orderRefund.create({
      data: {
        mainOrderId,
        refundNo,
        amount: refundAmount,
        reason,
        status: 'PENDING',
      },
    });

    // 更新订单退款状态
    await this.prisma.mainOrder.update({
      where: { id: mainOrderId },
      data: {
        refundStatus: 'PENDING',
        refundAmount: refundAmount,
      },
    });

    return refund;
  }

  /**
   * 审批退款申请
   */
  async approveRefund(refundId: number, approved: boolean, approvedBy: string) {
    const refund = await this.prisma.orderRefund.findUnique({
      where: { id: refundId },
      include: {
        mainOrder: {
          include: {
            payment: true,
            subOrders: {
              include: {
                merchant: true,
              },
            },
          },
        },
      },
    });

    if (!refund) {
      throw new Error('Refund not found');
    }

    if (approved) {
      // 执行退款逻辑
      const updatedRefund = await this.prisma.orderRefund.update({
        where: { id: refundId },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      // 更新订单状态
      await this.prisma.mainOrder.update({
        where: { id: refund.mainOrderId },
        data: {
          refundStatus: 'APPROVED',
        },
      });

      // 退款给商户（需要扣除已分配的平台费用）
      for (const subOrder of refund.mainOrder.subOrders) {
        const merchantRefund =
          Number(refund.amount) *
          (1 - subOrder.merchant.platformFeeRate);

        await this.prisma.merchant.update({
          where: { id: subOrder.merchantId },
          data: {
            balance: {
              decrement: merchantRefund,
            },
          },
        });
      }

      return updatedRefund;
    } else {
      // 拒绝退款
      const updatedRefund = await this.prisma.orderRefund.update({
        where: { id: refundId },
        data: {
          status: 'REJECTED',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      // 更新订单状态
      await this.prisma.mainOrder.update({
        where: { id: refund.mainOrderId },
        data: {
          refundStatus: 'REJECTED',
        },
      });

      return updatedRefund;
    }
  }

  /**
   * 获取退款列表
   */
  async findAll(skip = 0, take = 10) {
    return this.prisma.orderRefund.findMany({
      skip,
      take,
      include: {
        mainOrder: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取订单的退款信息
   */
  async findByOrderId(mainOrderId: number) {
    return this.prisma.orderRefund.findUnique({
      where: { mainOrderId },
      include: {
        mainOrder: true,
      },
    });
  }

  /**
   * 获取退款统计
   */
  async getRefundStats() {
    const totalRefunds = await this.prisma.orderRefund.count();
    const pendingRefunds = await this.prisma.orderRefund.count({
      where: { status: 'PENDING' },
    });
    const approvedRefunds = await this.prisma.orderRefund.count({
      where: { status: 'APPROVED' },
    });

    const totalRefundAmount = await this.prisma.orderRefund.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'APPROVED',
      },
    });

    return {
      totalRefunds,
      pendingRefunds,
      approvedRefunds,
      totalRefundAmount: totalRefundAmount._sum.amount || 0,
    };
  }
}
