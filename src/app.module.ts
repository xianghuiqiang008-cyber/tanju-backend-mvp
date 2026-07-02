import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { RiderModule } from './modules/rider/rider.module';
import { CartModule } from './modules/cart/cart.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    UserModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    MerchantModule,
    DeliveryModule,
    RiderModule,
    CartModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
