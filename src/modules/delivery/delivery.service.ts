import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeliveryService {
  private prisma = new PrismaClient();

  async create(subOrderId: number) {
    return this.prisma.delivery.create({
      data: {
        subOrderId,
        status: 'PENDING_ASSIGN',
      },
    });
  }

  async findById(id: number) {
    return this.prisma.delivery.findUnique({
      where: { id },
      include: {
        subOrder: {
          include: {
            mainOrder: true,
            merchant: true,
          },
        },
        rider: true,
      },
    });
  }

  async findBySubOrderId(subOrderId: number) {
    return this.prisma.delivery.findUnique({
      where: { subOrderId },
      include: {
        subOrder: true,
        rider: true,
      },
    });
  }

  async assignRider(id: number, riderId: number) {
    return this.prisma.delivery.update({
      where: { id },
      data: {
        riderId,
        status: 'ASSIGNED',
      },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.delivery.update({
      where: { id },
      data: { status },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.delivery.findMany({
      skip,
      take,
      include: {
        subOrder: true,
        rider: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStats() {
    const totalDeliveries = await this.prisma.delivery.count();
    const pendingDeliveries = await this.prisma.delivery.count({
      where: { status: 'PENDING_ASSIGN' },
    });
    const inProgressDeliveries = await this.prisma.delivery.count({
      where: { status: { in: ['ASSIGNED', 'PICKING', 'DELIVERING'] } },
    });
    const completedDeliveries = await this.prisma.delivery.count({
      where: { status: 'COMPLETED' },
    });

    return {
      totalDeliveries,
      pendingDeliveries,
      inProgressDeliveries,
      completedDeliveries,
    };
  }
}
