import { NextResponse } from 'next/server';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Not Found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message = 'Conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends APIError {
  constructor(message = 'Too Many Requests') {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends APIError {
  constructor(message = 'Internal Server Error', details?: any) {
    super(500, message, details);
    this.name = 'InternalServerError';
  }
}

export function handleError(error: any): NextResponse {
  console.error('[v0] Error:', error);

  // Handle API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details && { details: error.details }),
        statusCode: error.statusCode,
      },
      { status: error.statusCode }
    );
  }

  // Handle Supabase errors
  if (error?.code === 'PGRST116') {
    return NextResponse.json(
      {
        error: 'Resource not found',
        statusCode: 404,
      },
      { status: 404 }
    );
  }

  if (error?.code === '23505') {
    // Unique constraint violation
    return NextResponse.json(
      {
        error: 'Resource already exists',
        statusCode: 409,
      },
      { status: 409 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        details: error?.message || String(error),
      }),
      statusCode: 500,
    },
    { status: 500 }
  );
}

export function validateString(value: any, fieldName: string, options: { min?: number; max?: number } = {}): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  if (options.min && value.length < options.min) {
    throw new ValidationError(`${fieldName} must be at least ${options.min} characters`);
  }

  if (options.max && value.length > options.max) {
    throw new ValidationError(`${fieldName} must be at most ${options.max} characters`);
  }

  return value;
}

export function validateNumber(value: any, fieldName: string, options: { min?: number; max?: number } = {}): number {
  const num = Number(value);

  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }

  if (options.min !== undefined && num < options.min) {
    throw new ValidationError(`${fieldName} must be at least ${options.min}`);
  }

  if (options.max !== undefined && num > options.max) {
    throw new ValidationError(`${fieldName} must be at most ${options.max}`);
  }

  return num;
}

export function validateEmail(email: string): string {
  const trimmed = validateString(email, 'Email', { min: 5, max: 255 });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    throw new ValidationError('Invalid email format');
  }

  return trimmed;
}

export function validateUUID(value: any, fieldName: string): string {
  const str = validateString(value, fieldName);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(str)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`);
  }

  return str;
}

export function validateRequired(value: any, fieldName: string): any {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }

  return value;
}
