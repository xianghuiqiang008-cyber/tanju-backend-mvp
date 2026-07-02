import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async create(createUserDto: CreateUserDto) {
    const { phone, nickname, password } = createUserDto;
    
    // TODO: 实现密码加密逻辑
    const user = await this.prisma.user.create({
      data: {
        phone,
        nickname,
      },
    });

    return user;
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      include: {
        addresses: true,
        orders: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: true,
      },
    });
  }

  async update(id: number, updateData: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
