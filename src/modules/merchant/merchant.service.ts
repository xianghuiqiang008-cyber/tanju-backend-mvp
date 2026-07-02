import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MerchantService {
  private prisma = new PrismaClient();

  async create(createMerchantDto: any) {
    const { name, stallNo } = createMerchantDto;
    
    return this.prisma.merchant.create({
      data: {
        name,
        stallNo,
        status: 'CLOSED',
      },
    });
  }

  async findById(id: number) {
    return this.prisma.merchant.findUnique({
      where: { id },
      include: {
        products: true,
        subOrders: true,
      },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.merchant.findMany({
      skip,
      take,
      include: {
        products: true,
      },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.merchant.update({
      where: { id },
      data: { status },
    });
  }

  async update(id: number, updateData: any) {
    return this.prisma.merchant.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number) {
    return this.prisma.merchant.delete({
      where: { id },
    });
  }

  async getStats() {
    const totalMerchants = await this.prisma.merchant.count();
    const openMerchants = await this.prisma.merchant.count({
      where: { status: 'OPEN' },
    });
    const closedMerchants = await this.prisma.merchant.count({
      where: { status: 'CLOSED' },
    });

    return {
      totalMerchants,
      openMerchants,
      closedMerchants,
    };
  }
}
