import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'tanju-backend-mvp',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
