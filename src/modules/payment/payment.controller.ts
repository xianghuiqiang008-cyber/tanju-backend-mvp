import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, PaymentCallbackDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return {
      code: 201,
      message: 'Payment created successfully',
      data: await this.paymentService.create(createPaymentDto),
    };
  }

  @Get('order/:mainOrderId')
  async findByOrderId(@Param('mainOrderId') mainOrderId: string) {
    return {
      code: 200,
      message: 'Payment found',
      data: await this.paymentService.findByOrderId(parseInt(mainOrderId)),
    };
  }

  @Get('stats')
  async getStats() {
    return {
      code: 200,
      message: 'Payment stats',
      data: await this.paymentService.getStats(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return {
      code: 200,
      message: 'Payment found',
      data: await this.paymentService.findById(parseInt(id)),
    };
  }

  @Post('callback')
  async handleCallback(@Body() paymentCallbackDto: PaymentCallbackDto) {
    return {
      code: 200,
      message: 'Payment callback processed',
      data: await this.paymentService.handleCallback(paymentCallbackDto),
    };
  }
}
