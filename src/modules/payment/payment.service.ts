import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePaymentDto, PaymentCallbackDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private prisma = new PrismaClient();

  async create(createPaymentDto: CreatePaymentDto) {
    const { mainOrderId, amount, method } = createPaymentDto;
    
    // 检查订单是否存在
    const order = await this.prisma.mainOrder.findUnique({
      where: { id: mainOrderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // 创建支付记录
    const payment = await this.prisma.payment.create({
      data: {
        mainOrderId,
        amount,
        method,
        status: 'PENDING',
      },
    });

    return payment;
  }

  async findByOrderId(mainOrderId: number) {
    return this.prisma.payment.findUnique({
      where: { mainOrderId },
      include: {
        mainOrder: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        mainOrder: true,
      },
    });
  }

  async handleCallback(paymentCallbackDto: PaymentCallbackDto) {
    const { transactionId, status, amount } = paymentCallbackDto;

    // TODO: 验证签名和金额
    
    // 查找支付记录
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // 更新支付状态
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        transactionId,
        paidAt: status === 'SUCCESS' ? new Date() : null,
      },
    });

    // 如果支付成功，更新订单状态
    if (status === 'SUCCESS') {
      await this.prisma.mainOrder.update({
        where: { id: payment.mainOrderId },
        data: { status: 'PAID' },
      });
    }

    return updatedPayment;
  }

  async getStats() {
    const totalPayments = await this.prisma.payment.count();
    const successfulPayments = await this.prisma.payment.count({
      where: { status: 'SUCCESS' },
    });
    const failedPayments = await this.prisma.payment.count({
      where: { status: 'FAILED' },
    });

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
    };
  }
}
