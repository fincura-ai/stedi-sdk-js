/**
 * Shape of a standard Stedi API error response body.
 *
 * The machine-readable code appears as `error` (per the docs) or `code`
 * (observed on some endpoints like enrollments). `message` is always
 * human-readable. When multiple issues are reported the `errors` array
 * is present, but `error`/`code` and `message` are at the top level.
 */
export type StediErrorBody = {
  code?: string;
  error?: string;
  errors?: ReadonlyArray<{ error: string; message: string }>;
  message: string;
};

/**
 * Extract a machine-readable error code from `error` or `code`,
 * whichever is present (preferring `error`).
 */
const extractErrorCode = (body: unknown): string | undefined => {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  const record = body as Record<string, unknown>;

  if (typeof record.error === 'string') {
    return record.error;
  }

  if (typeof record.code === 'string') {
    return record.code;
  }

  return undefined;
};

const extractResponseMessage = (body: unknown): string | undefined => {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  const candidate = (body as Record<string, unknown>).message;
  return typeof candidate === 'string' ? candidate : undefined;
};

export class StediApiError extends Error {
  /**
   * Machine-readable error code from the Stedi response, if available.
   * Extracted from the `error` or `code` field of the response body.
   */
  public readonly errorCode: string | undefined;

  public readonly responseBody: unknown;

  /**
   * The upstream `message` field from the Stedi response body, if present.
   */
  public readonly responseMessage: string | undefined;

  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number,
    responseBody: unknown,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'StediApiError';
    this.errorCode = extractErrorCode(responseBody);
    this.responseBody = responseBody;
    this.responseMessage = extractResponseMessage(responseBody);
    this.statusCode = statusCode;
  }
}
