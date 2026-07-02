import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  private prisma = new PrismaClient();

  async create(createProductDto: CreateProductDto) {
    const { merchantId, name, price, description } = createProductDto;
    
    return this.prisma.product.create({
      data: {
        merchantId,
        name,
        price,
        description,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        merchant: true,
      },
    });
  }

  async findByMerchantId(merchantId: number) {
    return this.prisma.product.findMany({
      where: { merchantId },
      include: {
        merchant: true,
      },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.product.findMany({
      skip,
      take,
      include: {
        merchant: true,
      },
    });
  }

  async update(id: number, updateData: any) {
    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
