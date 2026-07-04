import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ReferralService {
  private prisma = new PrismaClient();

  /**
   * 生成推荐码
   */
  generateReferralCode(userId: number): string {
    const timestamp = Date.now().toString(36);
    const userIdStr = userId.toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${userIdStr}${timestamp}${random}`.toUpperCase();
  }

  /**
   * 为用户创建推荐码
   */
  async createReferralCode(userId: number) {
    const referralCode = this.generateReferralCode(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { referralCode },
    });
  }

  /**
   * 处理推荐注册
   */
  async handleReferralSignup(newUserId: number, referralCode: string) {
    // 查找推荐人
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // 更新新用户的推荐人信息
    await this.prisma.user.update({
      where: { id: newUserId },
      data: { referrerId: referrer.id },
    });

    // 记录推荐关系
    const referral = await this.prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredUserId: newUserId,
        status: 'PENDING',
      },
    });

    return referral;
  }

  /**
   * 完成推荐奖励（当被推荐人完成首单时）
   */
  async completeReferralReward(referralId: number, rewardAmount: number) {
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      throw new Error('Referral not found');
    }

    // 更新推荐记录
    const updatedReferral = await this.prisma.referral.update({
      where: { id: referralId },
      data: {
        reward: rewardAmount,
        status: 'COMPLETED',
      },
    });

    // 给推荐人增加积分
    await this.prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        points: {
          increment: Math.floor(rewardAmount * 100), // 1元 = 100积分
        },
      },
    });

    return updatedReferral;
  }

  /**
   * 获取用户的推荐统计
   */
  async getReferralStats(userId: number) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
    });

    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED');
    const totalReward = completedReferrals.reduce((sum, r) => sum + Number(r.reward), 0);

    return {
      totalReferrals: referrals.length,
      completedReferrals: completedReferrals.length,
      pendingReferrals: referrals.length - completedReferrals.length,
      totalReward,
    };
  }

  /**
   * 获取用户的推荐列表
   */
  async getReferralList(userId: number, skip = 0, take = 20) {
    return this.prisma.referral.findMany({
      where: { referrerId: userId },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取推荐排行榜
   */
  async getReferralLeaderboard(limit = 10) {
    const referrals = await this.prisma.referral.findMany();

    // 按推荐人分组统计
    const leaderboard = {};
    referrals.forEach(r => {
      if (!leaderboard[r.referrerId]) {
        leaderboard[r.referrerId] = {
          referrerId: r.referrerId,
          totalReferrals: 0,
          completedReferrals: 0,
          totalReward: 0,
        };
      }

      leaderboard[r.referrerId].totalReferrals++;
      if (r.status === 'COMPLETED') {
        leaderboard[r.referrerId].completedReferrals++;
        leaderboard[r.referrerId].totalReward += Number(r.reward);
      }
    });

    // 按完成数和奖励排序
    const sorted = Object.values(leaderboard)
      .sort((a: any, b: any) => {
        if (b.completedReferrals !== a.completedReferrals) {
          return b.completedReferrals - a.completedReferrals;
        }
        return b.totalReward - a.totalReward;
      })
      .slice(0, limit);

    return sorted;
  }
}
