/**
 * Custom error classes with additional context properties
 * Following CodeCanyon requirements: Augment Error objects with properties that explain details
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized", context?: Record<string, unknown>) {
    super(message, 401, "UNAUTHORIZED", context);
    this.name = "UnauthorizedError";
  }
}

export class InsufficientCreditsError extends ApiError {
  constructor(
    required: number,
    available: number,
    context?: Record<string, unknown>
  ) {
    super(
      `Insufficient credits. You need ${required} credits but only have ${available}.`,
      400,
      "INSUFFICIENT_CREDITS",
      { required, available, ...context }
    );
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Wrap a lower-level error with additional context
 * Following CodeCanyon requirement: If you pass a lower-level error to your caller, consider wrapping it instead
 */
export function wrapError(
  error: unknown,
  message: string,
  context?: Record<string, unknown>
): Error {
  if (error instanceof Error) {
    const wrappedError = new Error(message);
    wrappedError.name = error.name;
    wrappedError.stack = error.stack;
    (wrappedError as any).originalError = error;
    (wrappedError as any).context = context;
    return wrappedError;
  }
  return new Error(`${message}: ${String(error)}`);
}

