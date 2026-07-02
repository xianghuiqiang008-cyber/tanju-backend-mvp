export class CreateOrderDto {
  userId: number;
  items: Array<{
    productId: number;
    quantity: number;
    merchantId: number;
  }>;
  deliveryAddressId: number;
}

export class UpdateOrderStatusDto {
  status: string; // PENDING_PAYMENT, PAID, CANCELLED, etc.
}
