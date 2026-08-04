import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
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
import { FinanceModule } from './modules/finance/finance.module';
import { AuditModule } from './modules/audit/audit.module';
import { ReferralModule } from './modules/referral/referral.module';
import { AuthModule } from './modules/auth/auth.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { BulkModule } from './modules/bulk/bulk.module';
import { AuditMiddleware } from './common/middleware/audit.middleware';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UserModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    MerchantModule,
    DeliveryModule,
    RiderModule,
    CartModule,
    NotificationModule,
    FinanceModule,
    AuditModule,
    ReferralModule,
    CouponModule,
    StatisticsModule,
    BulkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}
