import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return {
      code: 201,
      message: 'Order created successfully',
      data: await this.orderService.create(createOrderDto),
    };
  }

  @Get()
  async findAll(@Query('skip') skip = 0, @Query('take') take = 10) {
    return {
      code: 200,
      message: 'Orders found',
      data: await this.orderService.findAll(skip, take),
    };
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string, @Query('skip') skip = 0, @Query('take') take = 10) {
    return {
      code: 200,
      message: 'Orders found',
      data: await this.orderService.findByUserId(parseInt(userId), skip, take),
    };
  }

  @Get('stats')
  async getStats() {
    return {
      code: 200,
      message: 'Order stats',
      data: await this.orderService.getStats(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return {
      code: 200,
      message: 'Order found',
      data: await this.orderService.findById(parseInt(id)),
    };
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return {
      code: 200,
      message: 'Order status updated successfully',
      data: await this.orderService.updateStatus(parseInt(id), updateOrderStatusDto),
    };
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string) {
    return {
      code: 200,
      message: 'Order cancelled successfully',
      data: await this.orderService.cancel(parseInt(id)),
    };
  }
}
