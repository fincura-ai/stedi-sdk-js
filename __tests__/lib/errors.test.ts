import { StediApiError } from '../../src/lib/errors.js';

describe('StediApiError', () => {
  it('should be an instance of Error', () => {
    const error = new StediApiError('test', 400, null);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(StediApiError);
  });

  it('should set name to StediApiError', () => {
    const error = new StediApiError('test', 400, null);
    expect(error.name).toBe('StediApiError');
  });

  it('should store message, statusCode, and responseBody', () => {
    const body = {
      error: 'VALIDATION_ERROR',
      fieldList: [{ message: 'required', path: 'subscriberId' }],
      message: 'Validation failed',
    };
    const error = new StediApiError(
      'Request to Stedi API failed: Validation failed',
      400,
      body,
    );

    expect(error.message).toBe(
      'Request to Stedi API failed: Validation failed',
    );
    expect(error.statusCode).toBe(400);
    expect(error.responseBody).toEqual(body);
  });

  it('should preserve the cause when provided', () => {
    const cause = new Error('original');
    const error = new StediApiError('wrapped', 500, null, cause);

    expect(error.cause).toBe(cause);
  });

  it('should have undefined cause when not provided', () => {
    const error = new StediApiError('test', 422, { detail: 'unprocessable' });
    expect(error.cause).toBeUndefined();
  });

  it('should allow distinguishing 4xx from 5xx', () => {
    const clientError = new StediApiError('bad request', 400, null);
    const serverError = new StediApiError('internal', 500, null);

    expect(clientError.statusCode).toBeGreaterThanOrEqual(400);
    expect(clientError.statusCode).toBeLessThan(500);
    expect(serverError.statusCode).toBeGreaterThanOrEqual(500);
  });

  it('should use 0 as statusCode for network errors with no response', () => {
    const error = new StediApiError('network error', 0, undefined);
    expect(error.statusCode).toBe(0);
    expect(error.responseBody).toBeUndefined();
  });

  it('should produce a useful string representation', () => {
    const error = new StediApiError('something broke', 502, null);
    expect(String(error)).toBe('StediApiError: something broke');
  });

  describe('errorCode', () => {
    it('should extract errorCode from a standard Stedi error body', () => {
      const body = {
        error: 'INVALID_REQUEST',
        message: 'The request was invalid',
      };
      const error = new StediApiError('failed', 400, body);

      expect(error.errorCode).toBe('INVALID_REQUEST');
    });

    it('should extract errorCode when the body includes an errors array', () => {
      const body = {
        error: 'MULTIPLE_ERRORS',
        errors: [
          { error: 'FIELD_REQUIRED', message: 'subscriberId is required' },
          {
            error: 'FIELD_INVALID',
            message: 'dateOfBirth is not a valid date',
          },
        ],
        message: 'Multiple validation errors',
      };
      const error = new StediApiError('failed', 400, body);

      expect(error.errorCode).toBe('MULTIPLE_ERRORS');
      expect((error.responseBody as { errors: unknown[] }).errors).toHaveLength(
        2,
      );
    });

    it('should be undefined when responseBody is null', () => {
      const error = new StediApiError('failed', 500, null);
      expect(error.errorCode).toBeUndefined();
    });

    it('should be undefined when responseBody is undefined', () => {
      const error = new StediApiError('failed', 0, undefined);
      expect(error.errorCode).toBeUndefined();
    });

    it('should extract errorCode from the code field (enrollment-style responses)', () => {
      const body = {
        code: 'access_denied',
        message: 'Access Denied',
      };
      const error = new StediApiError('failed', 403, body);

      expect(error.errorCode).toBe('access_denied');
    });

    it('should prefer error over code when both are present', () => {
      const body = {
        code: 'fallback_code',
        error: 'primary_error',
        message: 'both fields',
      };
      const error = new StediApiError('failed', 400, body);

      expect(error.errorCode).toBe('primary_error');
    });

    it('should fall back to code when error is not a string', () => {
      const body = {
        code: 'valid_code',
        error: 42,
        message: 'mixed types',
      };
      const error = new StediApiError('failed', 400, body);

      expect(error.errorCode).toBe('valid_code');
    });

    it('should be undefined when responseBody has no error or code field', () => {
      const error = new StediApiError('failed', 400, { message: 'oops' });
      expect(error.errorCode).toBeUndefined();
    });

    it('should be undefined when error field is not a string and no code', () => {
      const error = new StediApiError('failed', 400, { error: 42 });
      expect(error.errorCode).toBeUndefined();
    });

    it('should be undefined for an empty object body', () => {
      const error = new StediApiError('failed', 400, {});
      expect(error.errorCode).toBeUndefined();
    });
  });

  describe('responseMessage', () => {
    it('should extract the upstream message from the response body', () => {
      const body = {
        message:
          'Provider already exists in this account: NPI 1750064648, Tax ID Some("814816977")',
      };
      const error = new StediApiError(
        'Request to Stedi API failed: ...',
        400,
        body,
      );

      expect(error.responseMessage).toBe(body.message);
    });

    it('should work alongside errorCode when both are present', () => {
      const body = {
        code: 'access_denied',
        message: 'Access Denied',
      };
      const error = new StediApiError('failed', 403, body);

      expect(error.errorCode).toBe('access_denied');
      expect(error.responseMessage).toBe('Access Denied');
    });

    it('should extract from validation error bodies with fieldList', () => {
      const body = {
        fieldList: [{ message: 'Invalid UUID', path: 'provider_id' }],
        message: 'Invalid UUID',
      };
      const error = new StediApiError('failed', 400, body);

      expect(error.responseMessage).toBe('Invalid UUID');
    });

    it('should be undefined when responseBody is null', () => {
      const error = new StediApiError('failed', 500, null);
      expect(error.responseMessage).toBeUndefined();
    });

    it('should be undefined when responseBody is undefined', () => {
      const error = new StediApiError('failed', 0, undefined);
      expect(error.responseMessage).toBeUndefined();
    });

    it('should be undefined when responseBody has no message field', () => {
      const error = new StediApiError('failed', 400, { error: 'BAD' });
      expect(error.responseMessage).toBeUndefined();
    });

    it('should be undefined when message field is not a string', () => {
      const error = new StediApiError('failed', 400, { message: 42 });
      expect(error.responseMessage).toBeUndefined();
    });

    it('should be undefined for an empty object body', () => {
      const error = new StediApiError('failed', 400, {});
      expect(error.responseMessage).toBeUndefined();
    });

    it('should enable clean duplicate-provider detection', () => {
      const body = {
        message:
          'Provider already exists in this account: NPI 1750064648, Tax ID Some("814816977")',
      };
      const error = new StediApiError(
        'Request to Stedi API failed: ...',
        400,
        body,
      );

      const isDuplicate =
        error.statusCode === 400 &&
        error.responseMessage?.includes('already exists') === true;

      expect(isDuplicate).toBe(true);
    });
  });
});
