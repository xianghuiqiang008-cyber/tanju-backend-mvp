import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        phone: '13800138000',
        password: 'password123',
        nickname: 'Test User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      // 模拟 Prisma 返回
      jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(service['prisma'].user, 'create').mockResolvedValue({
        id: 1,
        phone: registerDto.phone,
        nickname: registerDto.nickname,
        password: 'hashed-password',
        role: 'USER',
      } as any);

      const result = await service.register(
        registerDto.phone,
        registerDto.password,
        registerDto.nickname,
      );

      expect(result).toEqual({
        id: 1,
        phone: registerDto.phone,
        nickname: registerDto.nickname,
      });
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        phone: '13800138000',
        password: 'password123',
      };

      jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue({
        id: 1,
        phone: registerDto.phone,
      } as any);

      await expect(
        service.register(registerDto.phone, registerDto.password),
      ).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const loginDto = {
        phone: '13800138000',
        password: 'password123',
      };

      const user = {
        id: 1,
        phone: loginDto.phone,
        password: 'hashed-password',
        nickname: 'Test User',
        role: 'USER',
        email: 'test@example.com',
      };

      jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto.phone, loginDto.password);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe(1);
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login('13800138000', 'password123'),
      ).rejects.toThrow('User not found');
    });

    it('should throw error if password is incorrect', async () => {
      const user = {
        id: 1,
        phone: '13800138000',
        password: 'hashed-password',
      };

      jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('13800138000', 'wrong-password'),
      ).rejects.toThrow('Invalid password');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const token = 'valid-token';
      const decoded = { sub: 1, username: 'test' };

      (jwtService.verify as jest.Mock).mockReturnValue(decoded);

      const result = await service.validateToken(token);

      expect(result).toEqual(decoded);
    });

    it('should throw error for invalid token', async () => {
      const token = 'invalid-token';

      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow('Invalid token');
    });
  });
});
