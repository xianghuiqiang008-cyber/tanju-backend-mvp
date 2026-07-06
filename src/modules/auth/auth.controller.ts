import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() body: { phone: string; password: string; nickname?: string }) {
    return {
      code: 201,
      message: 'User registered successfully',
      data: await this.authService.register(body.phone, body.password, body.nickname),
    };
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() body: { phone: string; password: string }) {
    return {
      code: 200,
      message: 'Login successful',
      data: await this.authService.login(body.phone, body.password),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getCurrentUser(@Request() req: any) {
    return {
      code: 200,
      message: 'User info retrieved',
      data: await this.authService.getCurrentUser(req.user.userId),
    };
  }
}
