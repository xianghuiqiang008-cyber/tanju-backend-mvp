import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private prisma = new PrismaClient();

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalJson = res.json;

    res.json = function (body: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // 记录敏感操作（POST、PUT、DELETE）
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        this.recordAuditLog(req, statusCode, body, duration);
      }

      return originalJson.call(this, body);
    };

    next();
  }

  private async recordAuditLog(
    req: Request,
    statusCode: number,
    responseBody: any,
    duration: number,
  ) {
    try {
      const action = this.getActionFromMethod(req.method);
      const resource = this.getResourceFromPath(req.path);
      const resourceId = this.extractResourceId(req.path);

      // 不记录敏感信息（密码、手机号等）
      const sanitizedBody = this.sanitizeData(req.body);

      await this.prisma.auditLog.create({
        data: {
          action,
          resource,
          resourceId,
          oldValue: JSON.stringify(req.body),
          newValue: JSON.stringify(responseBody),
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          status: statusCode >= 200 && statusCode < 300 ? 'SUCCESS' : 'FAILED',
        },
      });
    } catch (error) {
      console.error('Failed to record audit log:', error);
    }
  }

  private getActionFromMethod(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UNKNOWN';
    }
  }

  private getResourceFromPath(path: string): string {
    const parts = path.split('/').filter(p => p);
    return parts[1] || 'UNKNOWN';
  }

  private extractResourceId(path: string): number | null {
    const match = path.match(/\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'phone', 'bankAccount', 'apiKey', 'secret'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
