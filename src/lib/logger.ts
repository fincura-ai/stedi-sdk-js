/**
 * Logger interface for the Stedi SDK.
 * Consumers can implement this interface to integrate their own logging solutions.
 */
export type Logger = {
  /**
   * Log a debug message.
   *
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  debug: (message: string, meta?: Record<string, unknown>) => void;

  /**
   * Log an info message.
   *
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  info: (message: string, meta?: Record<string, unknown>) => void;

  /**
   * Log a warning message.
   *
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  warn: (message: string, meta?: Record<string, unknown>) => void;

  /**
   * Log an error message.
   *
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  error: (message: string, meta?: Record<string, unknown>) => void;
};

/**
 * Creates a no-op logger that doesn't output anything.
 * This is the default logger to keep the SDK silent in production.
 *
 * @returns A logger that performs no operations
 */
export const createNoOpLogger = (): Logger => ({
  debug: () => {
    // No-op
  },
  error: () => {
    // No-op
  },
  info: () => {
    // No-op
  },
  warn: () => {
    // No-op
  },
});

/**
 * Helper function to format metadata for console output.
 *
 * @param meta - Optional metadata to format
 * @returns Formatted metadata string
 */
const formatMeta = (meta?: Record<string, unknown>): string =>
  meta && Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';

/**
 * Creates a console-based logger for development and debugging.
 * All logs are prefixed with [stedi-sdk] for easy identification.
 *
 * @param minLevel - The minimum log level to output (default: 'info')
 * @returns A logger that outputs to the console
 */
export const createConsoleLogger = (
  minLevel: 'debug' | 'error' | 'info' | 'warn' = 'info',
): Logger => {
  const levels = { debug: 0, error: 3, info: 1, warn: 2 };
  const minLevelValue = levels[minLevel];

  return {
    debug: (message, meta) => {
      if (levels.debug >= minLevelValue) {
        const metaStr = formatMeta(meta);
        // eslint-disable-next-line no-console
        console.debug(`[stedi-sdk] DEBUG: ${message}`, metaStr);
      }
    },
    error: (message, meta) => {
      if (levels.error >= minLevelValue) {
        const metaStr = formatMeta(meta);
        // eslint-disable-next-line no-console
        console.error(`[stedi-sdk] ERROR: ${message}`, metaStr);
      }
    },
    info: (message, meta) => {
      if (levels.info >= minLevelValue) {
        const metaStr = formatMeta(meta);
        // eslint-disable-next-line no-console
        console.info(`[stedi-sdk] INFO: ${message}`, metaStr);
      }
    },
    warn: (message, meta) => {
      if (levels.warn >= minLevelValue) {
        const metaStr = formatMeta(meta);
        // eslint-disable-next-line no-console
        console.warn(`[stedi-sdk] WARN: ${message}`, metaStr);
      }
    },
  };
};

// Internal logger instance (no-op by default)
let logger: Logger = createNoOpLogger();

/**
 * Sets a custom logger for the SDK.
 * This allows consumers to plug in their own logging implementation
 * (e.g., Winston, Pino, Bunyan, or any custom logger).
 *
 * @param customLogger - A logger implementation conforming to the Logger interface
 * @example
 *   ```typescript
 *   import { setLogger, createConsoleLogger } from '@fincuratech/stedi-sdk-js';
 *
 *   // Enable console logging for debugging
 *   setLogger(createConsoleLogger('debug'));
 *   ```
 * @example
 *   ```typescript
 *   import { setLogger } from '@fincuratech/stedi-sdk-js';
 *   import winston from 'winston';
 *
 *   const winstonLogger = winston.createLogger({
 *     level: 'info',
 *     format: winston.format.json(),
 *     transports: [new winston.transports.Console()],
 *   });
 *
 *   // Adapt Winston to the Logger interface
 *   setLogger({
 *     debug: (msg, meta) => winstonLogger.debug(msg, meta),
 *     info: (msg, meta) => winstonLogger.info(msg, meta),
 *     warn: (msg, meta) => winstonLogger.warn(msg, meta),
 *     error: (msg, meta) => winstonLogger.error(msg, meta),
 *   });
 *   ```
 */
export const setLogger = (customLogger: Logger): void => {
  logger = customLogger;
};

/**
 * Gets the current logger instance.
 * This is used internally by the SDK.
 *
 * @returns The current logger instance
 */
export const getLogger = (): Logger => logger;
