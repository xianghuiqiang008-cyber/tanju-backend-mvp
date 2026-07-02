import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return {
      code: 201,
      message: 'Product created successfully',
      data: await this.productService.create(createProductDto),
    };
  }

  @Get()
  async findAll(@Query('skip') skip = 0, @Query('take') take = 10) {
    return {
      code: 200,
      message: 'Products found',
      data: await this.productService.findAll(skip, take),
    };
  }

  @Get('merchant/:merchantId')
  async findByMerchantId(@Param('merchantId') merchantId: string) {
    return {
      code: 200,
      message: 'Products found',
      data: await this.productService.findByMerchantId(parseInt(merchantId)),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return {
      code: 200,
      message: 'Product found',
      data: await this.productService.findById(parseInt(id)),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return {
      code: 200,
      message: 'Product updated successfully',
      data: await this.productService.update(parseInt(id), updateData),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productService.delete(parseInt(id));
    return {
      code: 200,
      message: 'Product deleted successfully',
    };
  }
}
