import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RiderService {
  private prisma = new PrismaClient();

  async create(createRiderDto: any) {
    const { name, phone } = createRiderDto;
    
    return this.prisma.rider.create({
      data: {
        name,
        phone,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.rider.findUnique({
      where: { id },
      include: {
        deliveries: {
          include: {
            subOrder: true,
          },
        },
      },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.rider.findMany({
      skip,
      take,
      include: {
        deliveries: true,
      },
    });
  }

  async update(id: number, updateData: any) {
    return this.prisma.rider.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number) {
    return this.prisma.rider.delete({
      where: { id },
    });
  }

  async getStats() {
    const totalRiders = await this.prisma.rider.count();
    
    return {
      totalRiders,
    };
  }
}
