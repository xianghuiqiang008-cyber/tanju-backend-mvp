import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

  /**
   * 用户注册
   */
  async register(phone: string, password: string, nickname?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname,
        role: 'USER',
      },
    });

    return {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
    };
  }

  /**
   * 用户登录
   */
  async login(phone: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      username: user.phone,
      role: user.role,
      email: user.email,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  /**
   * 验证 JWT Token
   */
  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        nickname: true,
        email: true,
        role: true,
        points: true,
        level: true,
        isVerified: true,
      },
    });
  }

  /**
   * 更新用户角色（仅管理员）
   */
  async updateUserRole(userId: number, role: string) {
    const validRoles = ['USER', 'MERCHANT', 'RIDER', 'ADMIN'];

    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
