import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private prisma = new PrismaClient();

  async create(createOrderDto: CreateOrderDto) {
    const { userId, items, deliveryAddressId } = createOrderDto;
    
    // 生成订单号
    const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 计算总金额
    let totalAmount = 0;
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product) {
        totalAmount += Number(product.price) * item.quantity;
      }
    }

    // 创建主订单
    const mainOrder = await this.prisma.mainOrder.create({
      data: {
        orderNo,
        userId,
        totalAmount,
        status: 'PENDING_PAYMENT',
      },
    });

    // 按商家分组创建子订单
    const groupedByMerchant = items.reduce((acc, item) => {
      if (!acc[item.merchantId]) {
        acc[item.merchantId] = [];
      }
      acc[item.merchantId].push(item);
      return acc;
    }, {});

    for (const merchantId in groupedByMerchant) {
      const subOrderNo = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await this.prisma.subOrder.create({
        data: {
          subOrderNo,
          mainOrderId: mainOrder.id,
          merchantId: parseInt(merchantId),
          status: 'PENDING_ACCEPT',
        },
      });
    }

    return this.findById(mainOrder.id);
  }

  async findById(id: number) {
    return this.prisma.mainOrder.findUnique({
      where: { id },
      include: {
        user: true,
        subOrders: {
          include: {
            merchant: true,
            delivery: true,
          },
        },
        payment: true,
      },
    });
  }

  async findByUserId(userId: number, skip = 0, take = 10) {
    return this.prisma.mainOrder.findMany({
      where: { userId },
      skip,
      take,
      include: {
        subOrders: {
          include: {
            merchant: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.mainOrder.findMany({
      skip,
      take,
      include: {
        user: true,
        subOrders: {
          include: {
            merchant: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status } = updateOrderStatusDto;
    
    return this.prisma.mainOrder.update({
      where: { id },
      data: { status },
      include: {
        subOrders: true,
        payment: true,
      },
    });
  }

  async cancel(id: number) {
    return this.updateStatus(id, { status: 'CANCELLED' });
  }

  async getStats() {
    const totalOrders = await this.prisma.mainOrder.count();
    const paidOrders = await this.prisma.mainOrder.count({
      where: { status: 'PAID' },
    });
    const pendingOrders = await this.prisma.mainOrder.count({
      where: { status: 'PENDING_PAYMENT' },
    });

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
    };
  }
}
