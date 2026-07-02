import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      code: 201,
      message: 'User created successfully',
      data: await this.userService.create(createUserDto),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(parseInt(id));
    return {
      code: 200,
      message: 'User found',
      data: user,
    };
  }

  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    const user = await this.userService.findByPhone(phone);
    return {
      code: 200,
      message: 'User found',
      data: user,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    const user = await this.userService.update(parseInt(id), updateData);
    return {
      code: 200,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.userService.delete(parseInt(id));
    return {
      code: 200,
      message: 'User deleted successfully',
    };
  }
}
