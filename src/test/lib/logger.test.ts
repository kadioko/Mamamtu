import { logger } from '@/lib/logger';

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const originalConsole = global.console;

beforeEach(() => {
  global.console = mockConsole as any;
  jest.clearAllMocks();
});

afterEach(() => {
  global.console = originalConsole;
});

describe('Logger', () => {
  describe('Basic logging methods', () => {
    it('logs debug messages', () => {
      const message = 'Debug message';
      logger.debug(message);
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG'),
        expect.stringContaining(message)
      );
    });

    it('logs info messages', () => {
      const message = 'Info message';
      logger.info(message);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining(message)
      );
    });

    it('logs warning messages', () => {
      const message = 'Warning message';
      logger.warn(message);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN'),
        expect.stringContaining(message)
      );
    });

    it('logs error messages', () => {
      const message = 'Error message';
      logger.error(message);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining(message)
      );
    });
  });

  describe('Context handling', () => {
    it('creates logger with context', () => {
      const contextLogger = logger.withContext({ userId: '123' });
      
      contextLogger.info('Test message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('userId=123'),
        expect.stringContaining('Test message')
      );
    });

    it('merges multiple contexts', () => {
      const contextLogger = logger.withContext({ userId: '123' });
      const nestedLogger = contextLogger.withContext({ action: 'login' });
      
      nestedLogger.info('Test message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('userId=123'),
        expect.stringContaining('action=login'),
        expect.stringContaining('Test message')
      );
    });

    it('handles empty context', () => {
      const contextLogger = logger.withContext({});
      
      contextLogger.info('Test message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('Test message')
      );
    });
  });

  describe('Message formatting', () => {
    it('formats messages with timestamp', () => {
      logger.info('Test message');
      
      const call = mockConsole.info.mock.calls[0][0];
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/); // ISO timestamp
    });

    it('formats messages with level', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(mockConsole.debug.mock.calls[0][0]).toContain('DEBUG');
      expect(mockConsole.info.mock.calls[0][0]).toContain('INFO');
      expect(mockConsole.warn.mock.calls[0][0]).toContain('WARN');
      expect(mockConsole.error.mock.calls[0][0]).toContain('ERROR');
    });

    it('handles multiple arguments', () => {
      const error = new Error('Test error');
      logger.error('Something went wrong', error, { extra: 'data' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining('Something went wrong'),
        error,
        { extra: 'data' }
      );
    });

    it('handles object messages', () => {
      const obj = { user: 'test', action: 'login' };
      logger.info(obj);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        obj
      );
    });

    it('handles null/undefined messages', () => {
      logger.info(null as any);
      logger.warn(undefined as any);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        null
      );
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN'),
        undefined
      );
    });
  });

  describe('Production vs Development', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('outputs structured logs in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.info('Test message', { userId: '123' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Test message',
          userId: '123',
          timestamp: expect.any(String),
        })
      );
    });

    it('outputs readable logs in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.info('Test message', { userId: '123' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('userId=123'),
        expect.stringContaining('Test message')
      );
    });
  });

  describe('Performance', () => {
    it('does not throw errors with circular references', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      expect(() => {
        logger.info('Circular reference', circular);
      }).not.toThrow();
    });

    it('handles large objects efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      
      expect(() => {
        logger.info('Large array', largeArray);
      }).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('logs Error objects correctly', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      logger.error('Error occurred', error);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining('Error occurred'),
        error
      );
    });

    it('handles errors without stack', () => {
      const error = new Error('Test error');
      delete (error as any).stack;
      
      logger.error('Error occurred', error);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining('Error occurred'),
        error
      );
    });
  });

  describe('Context isolation', () => {
    it('isolates context between loggers', () => {
      const logger1 = logger.withContext({ service: 'auth' });
      const logger2 = logger.withContext({ service: 'api' });
      
      logger1.info('Auth message');
      logger2.info('API message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('service=auth'),
        expect.stringContaining('Auth message')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('service=api'),
        expect.stringContaining('API message')
      );
    });

    it('does not modify original logger', () => {
      const contextLogger = logger.withContext({ userId: '123' });
      
      logger.info('Original message');
      contextLogger.info('Context message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.not.stringContaining('userId=123'),
        expect.stringContaining('Original message')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('userId=123'),
        expect.stringContaining('Context message')
      );
    });
  });
});
