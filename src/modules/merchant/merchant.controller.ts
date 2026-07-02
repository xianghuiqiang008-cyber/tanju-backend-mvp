import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { MerchantService } from './merchant.service';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post()
  async create(@Body() createMerchantDto: any) {
    return {
      code: 201,
      message: 'Merchant created successfully',
      data: await this.merchantService.create(createMerchantDto),
    };
  }

  @Get()
  async findAll(@Query('skip') skip = 0, @Query('take') take = 10) {
    return {
      code: 200,
      message: 'Merchants found',
      data: await this.merchantService.findAll(skip, take),
    };
  }

  @Get('stats')
  async getStats() {
    return {
      code: 200,
      message: 'Merchant stats',
      data: await this.merchantService.getStats(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return {
      code: 200,
      message: 'Merchant found',
      data: await this.merchantService.findById(parseInt(id)),
    };
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return {
      code: 200,
      message: 'Merchant status updated successfully',
      data: await this.merchantService.updateStatus(parseInt(id), body.status),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return {
      code: 200,
      message: 'Merchant updated successfully',
      data: await this.merchantService.update(parseInt(id), updateData),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.merchantService.delete(parseInt(id));
    return {
      code: 200,
      message: 'Merchant deleted successfully',
    };
  }
}
