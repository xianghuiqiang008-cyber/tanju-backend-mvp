import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  private readonly maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);
  private readonly buckets = new Map<string, Bucket>();

  use(request: Request, response: Response, next: NextFunction): void {
    const key = this.getClientKey(request);
    const now = Date.now();
    const current = this.buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + this.windowMs }
      : current;

    bucket.count += 1;
    this.buckets.set(key, bucket);

    response.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
    response.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - bucket.count).toString());
    response.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000).toString());

    if (bucket.count > this.maxRequests) {
      response.status(429).json({
        code: 429,
        message: '请求过于频繁，请稍后再试',
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      });
      return;
    }

    if (this.buckets.size > 10_000) {
      for (const [bucketKey, value] of this.buckets) {
        if (value.resetAt <= now) this.buckets.delete(bucketKey);
      }
    }

    next();
  }

  private getClientKey(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    const address = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
    return (address || request.ip || request.socket.remoteAddress || 'unknown').trim();
  }
}
