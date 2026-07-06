import { Controller, Get, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取未读通知' })
  async getUnreadNotifications(
    @Query('skip') skip = 0,
    @Query('take') take = 20,
    @Request() req: any,
  ) {
    return {
      code: 200,
      message: 'Unread notifications found',
      data: await this.notificationService.getUnreadNotifications(
        req.user.userId,
        skip,
        take,
      ),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有通知' })
  async getAllNotifications(
    @Query('skip') skip = 0,
    @Query('take') take = 20,
    @Request() req: any,
  ) {
    return {
      code: 200,
      message: 'Notifications found',
      data: await this.notificationService.getAllNotifications(
        req.user.userId,
        skip,
        take,
      ),
    };
  }

  @Put(':notificationId/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记通知为已读' })
  async markAsRead(@Param('notificationId') notificationId: string) {
    return {
      code: 200,
      message: 'Notification marked as read',
      data: await this.notificationService.markAsRead(parseInt(notificationId)),
    };
  }

  @Put('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记所有通知为已读' })
  async markAllAsRead(@Request() req: any) {
    return {
      code: 200,
      message: 'All notifications marked as read',
      data: await this.notificationService.markAllAsRead(req.user.userId),
    };
  }

  @Delete(':notificationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除通知' })
  async deleteNotification(@Param('notificationId') notificationId: string) {
    return {
      code: 200,
      message: 'Notification deleted',
      data: await this.notificationService.deleteNotification(
        parseInt(notificationId),
      ),
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取通知统计' })
  async getNotificationStats(@Request() req: any) {
    return {
      code: 200,
      message: 'Notification stats',
      data: await this.notificationService.getNotificationStats(req.user.userId),
    };
  }
}
