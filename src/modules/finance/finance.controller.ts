import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('orders/:mainOrderId/split')
  async calculateOrderSplit(@Param('mainOrderId') mainOrderId: string) {
    return {
      code: 200,
      message: 'Order split calculated',
      data: await this.financeService.calculateOrderSplit(parseInt(mainOrderId)),
    };
  }

  @Get('merchants/:merchantId/finance')
  async getMerchantFinance(@Param('merchantId') merchantId: string) {
    return {
      code: 200,
      message: 'Merchant finance info',
      data: await this.financeService.getMerchantFinance(parseInt(merchantId)),
    };
  }

  @Post('withdrawals')
  async createWithdrawal(
    @Body() body: { merchantId: number; amount: number; bankAccount: string },
  ) {
    return {
      code: 201,
      message: 'Withdrawal created',
      data: await this.financeService.createWithdrawal(
        body.merchantId,
        body.amount,
        body.bankAccount,
      ),
    };
  }

  @Put('withdrawals/:withdrawalId/approve')
  async approveWithdrawal(
    @Param('withdrawalId') withdrawalId: string,
    @Body() body: { approved: boolean },
  ) {
    return {
      code: 200,
      message: 'Withdrawal processed',
      data: await this.financeService.approveWithdrawal(
        parseInt(withdrawalId),
        body.approved,
      ),
    };
  }

  @Get('stats')
  async getPlatformStats() {
    return {
      code: 200,
      message: 'Platform finance stats',
      data: await this.financeService.getPlatformStats(),
    };
  }
}
