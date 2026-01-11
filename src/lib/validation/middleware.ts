import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '@/lib/logger';

export class ValidationError extends Error {
  constructor(message: string, public issues: ZodError['issues']) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequest(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      let data;

      switch (source) {
        case 'body':
          if (request.method === 'GET' || request.method === 'DELETE') {
            return { data: {} };
          }
          const body = await request.json().catch(() => ({}));
          data = body;
          break;

        case 'query':
          const params = new URL(request.url).searchParams;
          const queryObject: Record<string, any> = {};
          params.forEach((value, key) => {
            // Handle array parameters (e.g., tags[]=tag1&tags[]=tag2)
            if (key.endsWith('[]')) {
              const arrayKey = key.slice(0, -2);
              if (!queryObject[arrayKey]) {
                queryObject[arrayKey] = [];
              }
              queryObject[arrayKey].push(value);
            } else if (queryObject[key]) {
              // Convert to array if multiple values
              if (Array.isArray(queryObject[key])) {
                queryObject[key].push(value);
              } else {
                queryObject[key] = [queryObject[key], value];
              }
            } else {
              queryObject[key] = value;
            }
          });
          data = queryObject;
          break;

        case 'params':
          data = context?.params || {};
          break;

        default:
          throw new Error(`Invalid validation source: ${source}`);
      }

      const validatedData = await schema.parseAsync(data);
      return { data: validatedData };

    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = new ValidationError('Validation failed', error.issues);
        
        // Log validation errors
        logger.warn('Request validation failed', {
          source,
          issues: error.issues,
          url: request.url,
          method: request.method,
        });

        // Return formatted error response
        return {
          error: validationError,
          response: NextResponse.json(
            {
              error: 'Validation failed',
              issues: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
                code: issue.code,
              })),
            },
            { status: 400 }
          ),
        };
      }

      // Log unexpected errors
      logger.error('Unexpected validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        url: request.url,
        method: request.method,
      });

      return {
        error: error instanceof Error ? error : new Error('Unknown validation error'),
        response: NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        ),
      };
    }
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return validateRequest(schema, 'body');
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return validateRequest(schema, 'query');
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return validateRequest(schema, 'params');
}

// Helper function to create validation middleware for API routes
export function createValidationMiddleware<T>(
  schema: ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    const result = await validateRequest(schema, source)(request, context);
    
    if (result.error) {
      throw result.error;
    }
    
    return result.data;
  };
}

// Higher-order function for API route handlers
export function withValidation<T>(
  schema: ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return function <U extends any[], V>(
    handler: (request: NextRequest, context: any, data: T) => Promise<V>
  ) {
    return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
      const result = await validateRequest(schema, source)(request, context);
      
      if (result.error || result.response) {
        return result.response;
      }
      
      return handler(request, context, result.data);
    };
  };
}

// Utility to extract validation errors for user feedback
export function formatValidationErrors(issues: ZodError['issues']) {
  const errors: Record<string, string[]> = {};

  issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return errors;
}

// Custom error messages for common validation scenarios
export const getCustomErrorMessage = (issue: ZodError['issues'][0]): string => {
  const { code, path } = issue;

  switch (code) {
    case 'invalid_string':
      if (path.includes('email')) return 'Please enter a valid email address';
      if (path.includes('phone')) return 'Please enter a valid phone number';
      if (path.includes('password')) return 'Password does not meet requirements';
      return 'Invalid format';

    case 'too_small':
      if (path.includes('password')) return 'Password must be at least 8 characters';
      return 'This field is required';

    case 'too_big':
      return 'This field is too long';

    case 'invalid_type':
      if (path.includes('date')) return 'Please enter a valid date';
      if (path.includes('number')) return 'Please enter a valid number';
      return 'Invalid data type';

    case 'invalid_enum_value':
      return 'Please select a valid option';

    case 'invalid_date':
      return 'Please enter a valid date';

    default:
      return issue.message;
  }
};
