type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

function contextToStrings(context: LogContext): string[] {
  return Object.entries(context).map(([k, v]) => `${k}=${v}`);
}

class Logger {
  private context: LogContext;
  private serviceName = 'mamamtu';

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private get isProduction() { return process.env.NODE_ENV === 'production'; }

  private emit(level: LogLevel, message: unknown, ...extra: unknown[]) {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase();

    if (this.isProduction) {
      const entry: Record<string, unknown> = {
        level,
        timestamp,
        ...this.context,
        message,
      };
      extra.forEach((arg) => {
        if (arg !== undefined && arg !== null && typeof arg === 'object' && !Array.isArray(arg) && !(arg instanceof Error)) {
          Object.assign(entry, arg);
        }
      });
      console[level](entry);
    } else {
      const contextParts = contextToStrings(this.context);
      const prefix = `[${timestamp}] [${levelStr}]`;
      const filteredExtra = extra.filter(a => a !== undefined && a !== '');
      console[level](prefix, ...contextParts, message, ...filteredExtra);
    }
  }

  withContext(ctx: LogContext): Logger {
    return new Logger({ ...this.context, ...ctx });
  }

  debug(message: unknown, ...extra: unknown[]) {
    if (!this.isProduction) {
      this.emit('debug', message, ...extra);
    }
  }

  info(message: unknown, ...extra: unknown[]) {
    this.emit('info', message, ...extra);
  }

  warn(message: unknown, ...extra: unknown[]) {
    this.emit('warn', message, ...extra);
  }

  error(message: unknown, ...extra: unknown[]) {
    this.emit('error', message, ...extra);
  }

  // HTTP request logging
  request(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    this.withContext({ ...context, method, path, statusCode, duration })
      .info(`${method} ${path} ${statusCode} ${duration}ms`);
  }

  // Database query logging
  query(operation: string, model: string, duration: number, context?: LogContext) {
    this.withContext({ ...context, operation, model, duration })
      .debug(`DB ${operation} on ${model} (${duration}ms)`);
  }

  // Authentication logging
  auth(action: string, userId?: string, context?: LogContext) {
    this.withContext({ ...context, action, userId }).info(`Auth: ${action}`);
  }

  // Audit logging for sensitive operations
  audit(action: string, userId: string, resource: string, resourceId?: string, context?: LogContext) {
    this.withContext({ ...context, action, userId, resource, resourceId })
      .info(`Audit: ${action}`);
  }
}

export const logger = new Logger();
export default logger;
