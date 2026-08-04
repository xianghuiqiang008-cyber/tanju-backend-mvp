import { Module } from '@nestjs/common';
import { BulkService } from './bulk.service';
import { BulkController } from './bulk.controller';

@Module({
  controllers: [BulkController],
  providers: [BulkService],
  exports: [BulkService],
})
export class BulkModule {}
