import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { RiderService } from './rider.service';

@Controller('riders')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @Post()
  async create(@Body() createRiderDto: any) {
    return {
      code: 201,
      message: 'Rider created successfully',
      data: await this.riderService.create(createRiderDto),
    };
  }

  @Get()
  async findAll(@Query('skip') skip = 0, @Query('take') take = 10) {
    return {
      code: 200,
      message: 'Riders found',
      data: await this.riderService.findAll(skip, take),
    };
  }

  @Get('stats')
  async getStats() {
    return {
      code: 200,
      message: 'Rider stats',
      data: await this.riderService.getStats(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return {
      code: 200,
      message: 'Rider found',
      data: await this.riderService.findById(parseInt(id)),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return {
      code: 200,
      message: 'Rider updated successfully',
      data: await this.riderService.update(parseInt(id), updateData),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.riderService.delete(parseInt(id));
    return {
      code: 200,
      message: 'Rider deleted successfully',
    };
  }
}
