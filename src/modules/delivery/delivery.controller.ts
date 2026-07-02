import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  async create(@Body() body: { subOrderId: number }) {
    return {
      code: 201,
      message: 'Delivery created successfully',
      data: await this.deliveryService.create(body.subOrderId),
    };
  }

  @Get()
  async findAll(@Query('skip') skip = 0, @Query('take') take = 10) {
    return {
      code: 200,
      message: 'Deliveries found',
      data: await this.deliveryService.findAll(skip, take),
    };
  }

  @Get('stats')
  async getStats() {
    return {
      code: 200,
      message: 'Delivery stats',
      data: await this.deliveryService.getStats(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return {
      code: 200,
      message: 'Delivery found',
      data: await this.deliveryService.findById(parseInt(id)),
    };
  }

  @Get('suborder/:subOrderId')
  async findBySubOrderId(@Param('subOrderId') subOrderId: string) {
    return {
      code: 200,
      message: 'Delivery found',
      data: await this.deliveryService.findBySubOrderId(parseInt(subOrderId)),
    };
  }

  @Put(':id/assign')
  async assignRider(@Param('id') id: string, @Body() body: { riderId: number }) {
    return {
      code: 200,
      message: 'Rider assigned successfully',
      data: await this.deliveryService.assignRider(parseInt(id), body.riderId),
    };
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return {
      code: 200,
      message: 'Delivery status updated successfully',
      data: await this.deliveryService.updateStatus(parseInt(id), body.status),
    };
  }
}
