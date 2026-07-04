import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class FinanceService {
  private prisma = new PrismaClient();

  /**
   * 计算订单的平台抽佣和商户应得
   * @param mainOrderId 主订单ID
   * @returns 分账结果
   */
  async calculateOrderSplit(mainOrderId: number) {
    const order = await this.prisma.mainOrder.findUnique({
      where: { id: mainOrderId },
      include: {
        subOrders: {
          include: {
            merchant: true,
          },
        },
        payment: true,
      },
    });

    if (!order || !order.payment) {
      throw new Error('Order or payment not found');
    }

    const totalAmount = order.totalAmount;
    let platformFeeTotal = 0;
    let merchantAmountTotal = 0;

    // 按商家分别计算抽佣
    for (const subOrder of order.subOrders) {
      const merchantFeeRate = subOrder.merchant.platformFeeRate || 0.05;
      const platformFee = Number(totalAmount) * merchantFeeRate;
      const merchantAmount = Number(totalAmount) - platformFee;

      platformFeeTotal += platformFee;
      merchantAmountTotal += merchantAmount;

      // 更新商家余额
      await this.prisma.merchant.update({
        where: { id: subOrder.merchantId },
        data: {
          balance: {
            increment: merchantAmount,
          },
          totalRevenue: {
            increment: totalAmount,
          },
          totalOrders: {
            increment: 1,
          },
        },
      });
    }

    // 更新订单的分账信息
    await this.prisma.mainOrder.update({
      where: { id: mainOrderId },
      data: {
        platformFee: platformFeeTotal,
        merchantAmount: merchantAmountTotal,
      },
    });

    return {
      totalAmount,
      platformFee: platformFeeTotal,
      merchantAmount: merchantAmountTotal,
    };
  }

  /**
   * 获取商家的余额和统计信息
   */
  async getMerchantFinance(merchantId: number) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        balance: true,
        totalRevenue: true,
        totalOrders: true,
        platformFeeRate: true,
      },
    });

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    return merchant;
  }

  /**
   * 创建商家提现申请
   */
  async createWithdrawal(merchantId: number, amount: number, bankAccount: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    if (merchant.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const withdrawalNo = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        merchantId,
        withdrawalNo,
        amount,
        bankAccount,
        status: 'PENDING',
      },
    });

    // 冻结余额
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    return withdrawal;
  }

  /**
   * 审批提现申请
   */
  async approveWithdrawal(withdrawalId: number, approved: boolean) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (approved) {
      // 实际提现处理（这里仅更新状态，实际支付由第三方服务处理）
      return this.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    } else {
      // 退款到商家余额
      await this.prisma.merchant.update({
        where: { id: withdrawal.merchantId },
        data: {
          balance: {
            increment: withdrawal.amount,
          },
        },
      });

      return this.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'FAILED',
        },
      });
    }
  }

  /**
   * 获取平台财务统计
   */
  async getPlatformStats() {
    const totalRevenue = await this.prisma.mainOrder.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: 'PAID',
      },
    });

    const totalPlatformFee = await this.prisma.mainOrder.aggregate({
      _sum: {
        platformFee: true,
      },
    });

    const totalMerchantAmount = await this.prisma.mainOrder.aggregate({
      _sum: {
        merchantAmount: true,
      },
    });

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalPlatformFee: totalPlatformFee._sum.platformFee || 0,
      totalMerchantAmount: totalMerchantAmount._sum.merchantAmount || 0,
    };
  }
}
