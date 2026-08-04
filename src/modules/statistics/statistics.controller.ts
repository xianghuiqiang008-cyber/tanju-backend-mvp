import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MERCHANT')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取平台概览数据' })
  async getPlatformOverview() {
    return {
      code: 200,
      message: 'Platform overview retrieved',
      data: await this.statisticsService.getPlatformOverview(),
    };
  }

  @Get('order-trend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MERCHANT')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单趋势' })
  async getOrderTrend(@Query('days') days: number = 7) {
    return {
      code: 200,
      message: 'Order trend retrieved',
      data: await this.statisticsService.getOrderTrend(days),
    };
  }

  @Get('merchant-ranking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取商户排行' })
  async getMerchantRanking(@Query('limit') limit: number = 10) {
    return {
      code: 200,
      message: 'Merchant ranking retrieved',
      data: await this.statisticsService.getMerchantRanking(limit),
    };
  }

  @Get('user-statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户统计' })
  async getUserStatistics() {
    return {
      code: 200,
      message: 'User statistics retrieved',
      data: await this.statisticsService.getUserStatistics(),
    };
  }

  @Get('payment-methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取支付方式统计' })
  async getPaymentMethodStats() {
    return {
      code: 200,
      message: 'Payment method statistics retrieved',
      data: await this.statisticsService.getPaymentMethodStats(),
    };
  }

  @Get('order-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单状态分布' })
  async getOrderStatusDistribution() {
    return {
      code: 200,
      message: 'Order status distribution retrieved',
      data: await this.statisticsService.getOrderStatusDistribution(),
    };
  }

  @Get('merchant-verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取商户认证统计' })
  async getMerchantVerificationStats() {
    return {
      code: 200,
      message: 'Merchant verification statistics retrieved',
      data: await this.statisticsService.getMerchantVerificationStats(),
    };
  }

  @Get('coupon-usage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MERCHANT')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取优惠券使用统计' })
  async getCouponUsageStats() {
    return {
      code: 200,
      message: 'Coupon usage statistics retrieved',
      data: await this.statisticsService.getCouponUsageStats(),
    };
  }

  @Get('delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取配送统计' })
  async getDeliveryStats() {
    return {
      code: 200,
      message: 'Delivery statistics retrieved',
      data: await this.statisticsService.getDeliveryStats(),
    };
  }

  @Get('finance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取财务统计' })
  async getFinanceStats() {
    return {
      code: 200,
      message: 'Finance statistics retrieved',
      data: await this.statisticsService.getFinanceStats(),
    };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取综合仪表板' })
  async getDashboard() {
    return {
      code: 200,
      message: 'Dashboard data retrieved',
      data: await this.statisticsService.getDashboard(),
    };
  }
}
