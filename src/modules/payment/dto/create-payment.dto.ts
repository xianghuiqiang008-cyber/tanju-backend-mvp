export class CreatePaymentDto {
  mainOrderId: number;
  amount: number;
  method: string; // WECHAT, ALIPAY
}

export class PaymentCallbackDto {
  transactionId: string;
  status: string; // SUCCESS, FAILED
  amount: number;
}
