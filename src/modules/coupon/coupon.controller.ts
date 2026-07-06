import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MERCHANT')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建优惠券（仅管理员和商户）' })
  async createCoupon(@Body() body: any) {
    return {
      code: 201,
      message: 'Coupon created',
      data: await this.couponService.createCoupon(body),
    };
  }

  @Get()
  @ApiOperation({ summary: '获取优惠券列表' })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 20,
    @Query('merchantId') merchantId?: string,
    @Query('type') type?: string,
  ) {
    const filters = {
      merchantId: merchantId ? parseInt(merchantId) : undefined,
      type,
    };

    return {
      code: 200,
      message: 'Coupons found',
      data: await this.couponService.findAll(skip, take, filters),
    };
  }

  @Post('claim/:couponCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户领取优惠券' })
  async claimCoupon(
    @Param('couponCode') couponCode: string,
    @Request() req: any,
  ) {
    return {
      code: 201,
      message: 'Coupon claimed',
      data: await this.couponService.claimCoupon(req.user.userId, couponCode),
    };
  }

  @Post('use/:couponId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '使用优惠券' })
  async useCoupon(
    @Param('couponId') couponId: string,
    @Body() body: { orderAmount: number },
    @Request() req: any,
  ) {
    return {
      code: 200,
      message: 'Coupon used',
      data: await this.couponService.useCoupon(
        req.user.userId,
        parseInt(couponId),
        body.orderAmount,
      ),
    };
  }

  @Get('my-coupons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的优惠券' })
  async getUserCoupons(
    @Query('skip') skip = 0,
    @Query('take') take = 20,
    @Request() req: any,
  ) {
    return {
      code: 200,
      message: 'User coupons found',
      data: await this.couponService.getUserCoupons(req.user.userId, skip, take),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取优惠券统计' })
  async getCouponStats() {
    return {
      code: 200,
      message: 'Coupon stats',
      data: await this.couponService.getCouponStats(),
    };
  }
}
