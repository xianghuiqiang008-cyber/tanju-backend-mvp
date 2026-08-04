/**
 * 业务状态码定义
 * 范围：1000-9999
 */
export const BUSINESS_STATUS_CODES = {
  // 成功类 (1000-1999)
  SUCCESS: { code: 200, message: '成功' },
  CREATED: { code: 201, message: '创建成功' },
  UPDATED: { code: 200, message: '更新成功' },
  DELETED: { code: 200, message: '删除成功' },

  // 用户相关 (2000-2999)
  USER_NOT_FOUND: { code: 404, message: '用户不存在' },
  USER_ALREADY_EXISTS: { code: 400, message: '用户已存在' },
  USER_UNAUTHORIZED: { code: 401, message: '用户未授权' },
  USER_FORBIDDEN: { code: 403, message: '用户无权限' },
  INVALID_CREDENTIALS: { code: 401, message: '用户名或密码错误' },
  PHONE_ALREADY_REGISTERED: { code: 400, message: '手机号已注册' },

  // 订单相关 (3000-3999)
  ORDER_NOT_FOUND: { code: 404, message: '订单不存在' },
  ORDER_ALREADY_PAID: { code: 400, message: '订单已支付' },
  ORDER_CANNOT_CANCEL: { code: 400, message: '订单无法取消' },
  ORDER_AMOUNT_INVALID: { code: 400, message: '订单金额无效' },
  INSUFFICIENT_STOCK: { code: 400, message: '库存不足' },

  // 支付相关 (4000-4999)
  PAYMENT_FAILED: { code: 400, message: '支付失败' },
  PAYMENT_PENDING: { code: 400, message: '支付处理中' },
  PAYMENT_SIGNATURE_INVALID: { code: 400, message: '支付签名验证失败' },
  DUPLICATE_PAYMENT: { code: 400, message: '重复支付' },

  // 商户相关 (5000-5999)
  MERCHANT_NOT_FOUND: { code: 404, message: '商户不存在' },
  MERCHANT_NOT_VERIFIED: { code: 400, message: '商户未认证' },
  MERCHANT_CLOSED: { code: 400, message: '商户已关闭' },
  INSUFFICIENT_BALANCE: { code: 400, message: '余额不足' },

  // 优惠券相关 (6000-6999)
  COUPON_NOT_FOUND: { code: 404, message: '优惠券不存在' },
  COUPON_EXPIRED: { code: 400, message: '优惠券已过期' },
  COUPON_OUT_OF_STOCK: { code: 400, message: '优惠券已领完' },
  COUPON_ALREADY_CLAIMED: { code: 400, message: '优惠券已领取' },
  COUPON_NOT_APPLICABLE: { code: 400, message: '优惠券不适用于此订单' },

  // 配送相关 (7000-7999)
  DELIVERY_NOT_FOUND: { code: 404, message: '配送单不存在' },
  RIDER_NOT_AVAILABLE: { code: 400, message: '骑手不可用' },
  DELIVERY_CANNOT_CANCEL: { code: 400, message: '配送单无法取消' },

  // 财务相关 (8000-8999)
  WITHDRAWAL_FAILED: { code: 400, message: '提现失败' },
  WITHDRAWAL_PENDING: { code: 400, message: '提现处理中' },
  INVALID_BANK_ACCOUNT: { code: 400, message: '银行账户无效' },

  // 系统相关 (9000-9999)
  INTERNAL_ERROR: { code: 500, message: '系统内部错误' },
  INVALID_PARAMETERS: { code: 400, message: '参数无效' },
  RESOURCE_NOT_FOUND: { code: 404, message: '资源不存在' },
  RATE_LIMIT_EXCEEDED: { code: 429, message: '请求过于频繁' },
  SERVICE_UNAVAILABLE: { code: 503, message: '服务暂时不可用' },
};

/**
 * 获取状态码信息
 */
export function getStatusCodeInfo(code: string): { code: number; message: string } {
  return BUSINESS_STATUS_CODES[code] || BUSINESS_STATUS_CODES.INTERNAL_ERROR;
}
