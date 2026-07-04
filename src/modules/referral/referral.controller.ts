import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post('codes/:userId')
  async createReferralCode(@Param('userId') userId: string) {
    return {
      code: 201,
      message: 'Referral code created',
      data: await this.referralService.createReferralCode(parseInt(userId)),
    };
  }

  @Post('signup')
  async handleReferralSignup(
    @Body() body: { newUserId: number; referralCode: string },
  ) {
    return {
      code: 201,
      message: 'Referral signup processed',
      data: await this.referralService.handleReferralSignup(
        body.newUserId,
        body.referralCode,
      ),
    };
  }

  @Post(':referralId/complete')
  async completeReferralReward(
    @Param('referralId') referralId: string,
    @Body() body: { rewardAmount: number },
  ) {
    return {
      code: 200,
      message: 'Referral reward completed',
      data: await this.referralService.completeReferralReward(
        parseInt(referralId),
        body.rewardAmount,
      ),
    };
  }

  @Get('users/:userId/stats')
  async getReferralStats(@Param('userId') userId: string) {
    return {
      code: 200,
      message: 'Referral stats',
      data: await this.referralService.getReferralStats(parseInt(userId)),
    };
  }

  @Get('users/:userId/list')
  async getReferralList(
    @Param('userId') userId: string,
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ) {
    return {
      code: 200,
      message: 'Referral list',
      data: await this.referralService.getReferralList(
        parseInt(userId),
        skip,
        take,
      ),
    };
  }

  @Get('leaderboard')
  async getReferralLeaderboard(@Query('limit') limit = 10) {
    return {
      code: 200,
      message: 'Referral leaderboard',
      data: await this.referralService.getReferralLeaderboard(limit),
    };
  }
}
