import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('logs')
  async createLog(@Body() data: any) {
    return {
      code: 201,
      message: 'Audit log created',
      data: await this.auditService.createLog(data),
    };
  }

  @Get('logs')
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 50,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('userId') userId?: string,
  ) {
    const filters = {
      action,
      resource,
      userId: userId ? parseInt(userId) : undefined,
    };

    return {
      code: 200,
      message: 'Audit logs found',
      data: await this.auditService.findAll(skip, take, filters),
    };
  }

  @Get('users/:userId/history')
  async getUserHistory(
    @Param('userId') userId: string,
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ) {
    return {
      code: 200,
      message: 'User history found',
      data: await this.auditService.getUserHistory(parseInt(userId), skip, take),
    };
  }

  @Get('merchants/:merchantId/history')
  async getMerchantHistory(
    @Param('merchantId') merchantId: string,
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ) {
    return {
      code: 200,
      message: 'Merchant history found',
      data: await this.auditService.getMerchantHistory(
        parseInt(merchantId),
        skip,
        take,
      ),
    };
  }

  @Get('orders/:mainOrderId/history')
  async getOrderHistory(@Param('mainOrderId') mainOrderId: string) {
    return {
      code: 200,
      message: 'Order history found',
      data: await this.auditService.getOrderHistory(parseInt(mainOrderId)),
    };
  }

  @Get('report')
  async generateAuditReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return {
      code: 200,
      message: 'Audit report generated',
      data: await this.auditService.generateAuditReport(
        new Date(startDate),
        new Date(endDate),
      ),
    };
  }

  @Get('anomalies')
  async detectAnomalies(@Query('timeWindow') timeWindow = 60) {
    return {
      code: 200,
      message: 'Anomalies detected',
      data: await this.auditService.detectAnomalies(timeWindow),
    };
  }
}
