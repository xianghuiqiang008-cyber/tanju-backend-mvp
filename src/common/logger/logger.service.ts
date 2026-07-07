import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('LoggerService');
  private readonly logDir = path.join(process.cwd(), 'logs');

  constructor() {
    this.ensureLogDir();
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLog(level: string, context: string, message: string, data?: any) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      ...(data && { data }),
    });
  }

  private writeLog(level: string, context: string, message: string, data?: any) {
    const logEntry = this.formatLog(level, context, message, data);
    const fileName = `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`;
    const filePath = path.join(this.logDir, fileName);

    try {
      fs.appendFileSync(filePath, logEntry + '\n');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  info(context: string, message: string, data?: any) {
    this.logger.log(`[${context}] ${message}`);
    this.writeLog('INFO', context, message, data);
  }

  warn(context: string, message: string, data?: any) {
    this.logger.warn(`[${context}] ${message}`);
    this.writeLog('WARN', context, message, data);
  }

  error(context: string, message: string, error?: any) {
    this.logger.error(`[${context}] ${message}`);
    this.writeLog('ERROR', context, message, {
      error: error?.message || error,
      stack: error?.stack,
    });
  }

  debug(context: string, message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`[${context}] ${message}`);
      this.writeLog('DEBUG', context, message, data);
    }
  }

  /**
   * 记录 API 请求
   */
  logRequest(method: string, url: string, statusCode: number, duration: number) {
    this.info('HTTP', `${method} ${url}`, {
      statusCode,
      duration: `${duration}ms`,
    });
  }

  /**
   * 记录数据库操作
   */
  logDatabase(operation: string, model: string, duration: number, success: boolean) {
    const level = success ? 'info' : 'warn';
    this[level]('DATABASE', `${operation} on ${model}`, {
      duration: `${duration}ms`,
      success,
    });
  }

  /**
   * 记录业务事件
   */
  logBusinessEvent(event: string, userId?: number, data?: any) {
    this.info('BUSINESS', event, {
      userId,
      ...data,
    });
  }
}
