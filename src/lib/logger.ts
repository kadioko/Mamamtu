type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private serviceName = 'mamamtu';

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      service: this.serviceName,
      env: process.env.NODE_ENV || 'development',
    });
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const formattedLog = this.formatLog(entry);

    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };
      const reset = '\x1b[0m';
      const color = colors[level];
      
      console[level === 'debug' ? 'log' : level](
        `${color}[${level.toUpperCase()}]${reset} ${message}`,
        context ? context : '',
        error ? `\n${error.stack}` : ''
      );
    } else {
      // In production, output structured JSON logs
      console[level === 'debug' ? 'log' : level](formattedLog);
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const err = error instanceof Error ? error : undefined;
    this.log('error', message, context, err);
  }

  // HTTP request logging
  request(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    this.info(`${method} ${path} ${statusCode} ${duration}ms`, {
      ...context,
      http: { method, path, statusCode, duration },
    });
  }

  // Database query logging
  query(operation: string, model: string, duration: number, context?: LogContext) {
    this.debug(`DB ${operation} on ${model} (${duration}ms)`, {
      ...context,
      db: { operation, model, duration },
    });
  }

  // Authentication logging
  auth(action: string, userId?: string, context?: LogContext) {
    this.info(`Auth: ${action}`, {
      ...context,
      auth: { action, userId },
    });
  }

  // Audit logging for sensitive operations
  audit(action: string, userId: string, resource: string, resourceId?: string, context?: LogContext) {
    this.info(`Audit: ${action}`, {
      ...context,
      audit: { action, userId, resource, resourceId, timestamp: new Date().toISOString() },
    });
  }
}

export const logger = new Logger();
export default logger;
