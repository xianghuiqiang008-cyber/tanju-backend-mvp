import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    mainOrder: {
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
    subOrder: {
      findMany: jest.fn(),
    },
    merchant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    withdrawal: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

describe('FinanceService', () => {
  let service: FinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceService],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateOrderSplit', () => {
    it('should calculate order split correctly', async () => {
      const mainOrderId = 1;
      const totalAmount = 100;
      const platformFeeRate = 0.05;

      const mockOrder = {
        id: mainOrderId,
        totalAmount,
        subOrders: [
          {
            id: 1,
            merchantId: 1,
            merchant: {
              id: 1,
              platformFeeRate,
            },
          },
        ],
        payment: {
          id: 1,
          status: 'SUCCESS',
        },
      };

      jest
        .spyOn(service['prisma'].mainOrder, 'findUnique')
        .mockResolvedValue(mockOrder as any);

      jest
        .spyOn(service['prisma'].merchant, 'update')
        .mockResolvedValue({} as any);

      jest
        .spyOn(service['prisma'].mainOrder, 'update')
        .mockResolvedValue({} as any);

      const result = await service.calculateOrderSplit(mainOrderId);

      expect(result.totalAmount).toBe(totalAmount);
      expect(result.platformFee).toBe(totalAmount * platformFeeRate);
      expect(result.merchantAmount).toBe(totalAmount * (1 - platformFeeRate));
    });

    it('should throw error if order not found', async () => {
      jest
        .spyOn(service['prisma'].mainOrder, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.calculateOrderSplit(999)).rejects.toThrow(
        'Order or payment not found',
      );
    });

    it('should handle multiple sub-orders', async () => {
      const mainOrderId = 1;
      const totalAmount = 200;

      const mockOrder = {
        id: mainOrderId,
        totalAmount,
        subOrders: [
          {
            id: 1,
            merchantId: 1,
            merchant: { id: 1, platformFeeRate: 0.05 },
          },
          {
            id: 2,
            merchantId: 2,
            merchant: { id: 2, platformFeeRate: 0.1 },
          },
        ],
        payment: { id: 1, status: 'SUCCESS' },
      };

      jest
        .spyOn(service['prisma'].mainOrder, 'findUnique')
        .mockResolvedValue(mockOrder as any);

      jest
        .spyOn(service['prisma'].merchant, 'update')
        .mockResolvedValue({} as any);

      jest
        .spyOn(service['prisma'].mainOrder, 'update')
        .mockResolvedValue({} as any);

      const result = await service.calculateOrderSplit(mainOrderId);

      expect(result.totalAmount).toBe(totalAmount);
      // 两个商户的平台费总和
      const expectedPlatformFee = totalAmount * 0.05 + totalAmount * 0.1;
      expect(result.platformFee).toBe(expectedPlatformFee);
    });
  });

  describe('getMerchantFinance', () => {
    it('should return merchant finance info', async () => {
      const merchantId = 1;
      const mockMerchant = {
        id: merchantId,
        name: 'Test Merchant',
        balance: 1000,
        totalRevenue: 5000,
        totalOrders: 50,
        platformFeeRate: 0.05,
      };

      jest
        .spyOn(service['prisma'].merchant, 'findUnique')
        .mockResolvedValue(mockMerchant as any);

      const result = await service.getMerchantFinance(merchantId);

      expect(result.id).toBe(merchantId);
      expect(result.balance).toBe(1000);
      expect(result.totalRevenue).toBe(5000);
    });

    it('should throw error if merchant not found', async () => {
      jest
        .spyOn(service['prisma'].merchant, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.getMerchantFinance(999)).rejects.toThrow(
        'Merchant not found',
      );
    });
  });

  describe('createWithdrawal', () => {
    it('should create withdrawal request', async () => {
      const merchantId = 1;
      const amount = 500;
      const bankAccount = '1234567890';

      const mockMerchant = {
        id: merchantId,
        balance: 1000,
      };

      jest
        .spyOn(service['prisma'].merchant, 'findUnique')
        .mockResolvedValue(mockMerchant as any);

      jest
        .spyOn(service['prisma'].withdrawal, 'create')
        .mockResolvedValue({
          id: 1,
          merchantId,
          amount,
          status: 'PENDING',
        } as any);

      jest
        .spyOn(service['prisma'].merchant, 'update')
        .mockResolvedValue({} as any);

      const result = await service.createWithdrawal(
        merchantId,
        amount,
        bankAccount,
      );

      expect(result.status).toBe('PENDING');
      expect(result.amount).toBe(amount);
    });

    it('should throw error if insufficient balance', async () => {
      const merchantId = 1;
      const amount = 2000;

      const mockMerchant = {
        id: merchantId,
        balance: 1000,
      };

      jest
        .spyOn(service['prisma'].merchant, 'findUnique')
        .mockResolvedValue(mockMerchant as any);

      await expect(
        service.createWithdrawal(merchantId, amount, '1234567890'),
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('getPlatformStats', () => {
    it('should return platform statistics', async () => {
      jest
        .spyOn(service['prisma'].mainOrder, 'aggregate')
        .mockResolvedValueOnce({
          _sum: { totalAmount: 10000 },
        } as any)
        .mockResolvedValueOnce({
          _sum: { platformFee: 500 },
        } as any)
        .mockResolvedValueOnce({
          _sum: { merchantAmount: 9500 },
        } as any);

      const result = await service.getPlatformStats();

      expect(result.totalRevenue).toBe(10000);
      expect(result.totalPlatformFee).toBe(500);
      expect(result.totalMerchantAmount).toBe(9500);
    });
  });
});
