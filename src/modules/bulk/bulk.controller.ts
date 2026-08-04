import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BulkService } from './bulk.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bulk Operations')
@Controller('bulk')
export class BulkController {
  constructor(private readonly bulkService: BulkService) {}

  @Post('merchants/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量审核商户' })
  async bulkApproveMerchants(@Body() body: { merchantIds: number[]; approvedBy: string }) {
    return {
      code: 200,
      message: 'Merchants approved',
      data: await this.bulkService.bulkApproveMerchants(body.merchantIds, body.approvedBy),
    };
  }

  @Post('merchants/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量拒绝商户' })
  async bulkRejectMerchants(
    @Body() body: { merchantIds: number[]; reason: string; rejectedBy: string },
  ) {
    return {
      code: 200,
      message: 'Merchants rejected',
      data: await this.bulkService.bulkRejectMerchants(body.merchantIds, body.reason, body.rejectedBy),
    };
  }

  @Post('coupons/distribute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MERCHANT')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量发放优惠券给用户' })
  async bulkDistributeCoupons(@Body() body: { userIds: number[]; couponId: number }) {
    return {
      code: 200,
      message: 'Coupons distributed',
      data: await this.bulkService.bulkDistributeCoupons(body.userIds, body.couponId),
    };
  }

  @Post('coupons/distribute-to-merchants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量为商户创建优惠券' })
  async bulkDistributeCouponsToMerchants(
    @Body() body: { merchantIds: number[]; couponData: any },
  ) {
    return {
      code: 200,
      message: 'Coupons created for merchants',
      data: await this.bulkService.bulkDistributeCouponsToMerchants(
        body.merchantIds,
        body.couponData,
      ),
    };
  }

  @Post('users/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量导入用户' })
  async bulkImportUsers(@Body() body: { users: Array<{ phone: string; nickname?: string }> }) {
    return {
      code: 200,
      message: 'Users imported',
      data: await this.bulkService.bulkImportUsers(body.users),
    };
  }

  @Post('merchants/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量导入商户' })
  async bulkImportMerchants(
    @Body() body: { merchants: Array<{ name: string; stallNo: string; category?: string }> },
  ) {
    return {
      code: 200,
      message: 'Merchants imported',
      data: await this.bulkService.bulkImportMerchants(body.merchants),
    };
  }

  @Post('notifications/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量发送通知' })
  async bulkSendNotifications(
    @Body() body: { userIds: number[]; notification: { type: string; title: string; content: string } },
  ) {
    return {
      code: 200,
      message: 'Notifications sent',
      data: await this.bulkService.bulkSendNotifications(body.userIds, body.notification),
    };
  }

  @Post('users/points/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量更新用户积分' })
  async bulkUpdateUserPoints(@Body() body: { updates: Array<{ userId: number; points: number }> }) {
    return {
      code: 200,
      message: 'User points updated',
      data: await this.bulkService.bulkUpdateUserPoints(body.updates),
    };
  }

  @Post('orders/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量关闭订单' })
  async bulkCloseOrders(@Body() body: { orderIds: number[]; reason: string }) {
    return {
      code: 200,
      message: 'Orders closed',
      data: await this.bulkService.bulkCloseOrders(body.orderIds, body.reason),
    };
  }

  @Post('withdrawals/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量审批提现申请' })
  async bulkApproveWithdrawals(@Body() body: { withdrawalIds: number[]; approvedBy: string }) {
    return {
      code: 200,
      message: 'Withdrawals approved',
      data: await this.bulkService.bulkApproveWithdrawals(body.withdrawalIds, body.approvedBy),
    };
  }
}
