import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;

        // 如果已经是标准格式，直接返回
        if (data && data.code !== undefined && data.message !== undefined) {
          return data;
        }

        // 转换为标准格式
        return {
          code: 200,
          message: 'Success',
          data,
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`,
        };
      }),
    );
  }
}
