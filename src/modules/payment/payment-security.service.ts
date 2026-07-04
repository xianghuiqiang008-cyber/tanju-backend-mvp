import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PaymentSecurityService {
  /**
   * 验证微信支付签名
   * @param data 支付数据
   * @param signature 签名
   * @param apiKey API密钥
   * @returns 签名是否有效
   */
  verifyWechatSignature(data: any, signature: string, apiKey: string): boolean {
    // 按字典序排序参数
    const sortedKeys = Object.keys(data).sort();
    let stringToSign = '';

    for (const key of sortedKeys) {
      if (key !== 'sign' && data[key]) {
        stringToSign += `${key}=${data[key]}&`;
      }
    }

    stringToSign += `key=${apiKey}`;

    // MD5签名
    const computedSignature = crypto
      .createHash('md5')
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();

    return computedSignature === signature.toUpperCase();
  }

  /**
   * 验证支付宝签名
   * @param data 支付数据
   * @param signature 签名
   * @param publicKey 支付宝公钥
   * @returns 签名是否有效
   */
  verifyAlipaySignature(data: any, signature: string, publicKey: string): boolean {
    // 按字典序排序参数
    const sortedKeys = Object.keys(data).sort();
    let stringToSign = '';

    for (const key of sortedKeys) {
      if (key !== 'sign' && data[key]) {
        stringToSign += `${key}=${data[key]}&`;
      }
    }

    stringToSign = stringToSign.slice(0, -1); // 移除最后的&

    // RSA验证
    const verifier = crypto.createVerify('sha1');
    verifier.update(stringToSign, 'utf8');

    return verifier.verify(publicKey, signature, 'base64');
  }

  /**
   * 检测重复支付
   * @param transactionId 交易ID
   * @param amount 金额
   * @param recentPayments 最近的支付记录
   * @returns 是否为重复支付
   */
  isDuplicatePayment(
    transactionId: string,
    amount: number,
    recentPayments: any[],
  ): boolean {
    // 检查是否存在相同的交易ID
    const duplicateTransaction = recentPayments.find(
      p => p.transactionId === transactionId,
    );

    if (duplicateTransaction) {
      return true;
    }

    // 检查是否在短时间内有相同金额的支付（防止快速重复点击）
    const now = Date.now();
    const recentDuplicate = recentPayments.find(
      p =>
        p.amount === amount &&
        now - new Date(p.createdAt).getTime() < 60000, // 60秒内
    );

    return !!recentDuplicate;
  }

  /**
   * 生成安全的支付请求签名
   * @param data 支付数据
   * @param apiKey API密钥
   * @returns 签名
   */
  generatePaymentSignature(data: any, apiKey: string): string {
    const sortedKeys = Object.keys(data).sort();
    let stringToSign = '';

    for (const key of sortedKeys) {
      if (data[key]) {
        stringToSign += `${key}=${data[key]}&`;
      }
    }

    stringToSign += `key=${apiKey}`;

    return crypto
      .createHash('md5')
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * 验证金额是否匹配
   * @param expectedAmount 期望金额
   * @param actualAmount 实际金额
   * @param tolerance 容差（分）
   * @returns 金额是否匹配
   */
  verifyAmount(expectedAmount: number, actualAmount: number, tolerance = 0): boolean {
    const diff = Math.abs(expectedAmount - actualAmount);
    return diff <= tolerance;
  }

  /**
   * 检测异常交易
   * @param amount 金额
   * @param userHistory 用户历史交易
   * @returns 是否为异常交易
   */
  isAnomalousTransaction(amount: number, userHistory: any[]): boolean {
    if (userHistory.length === 0) {
      return false;
    }

    // 计算平均交易金额
    const avgAmount =
      userHistory.reduce((sum, p) => sum + p.amount, 0) / userHistory.length;

    // 如果交易金额超过平均值的5倍，标记为异常
    return amount > avgAmount * 5;
  }
}
