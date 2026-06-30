import { buildStediClient, type StediClient } from './sdk.js';
import { withTestMode } from './test-mode.js';

export { StediApiError, type StediErrorBody } from './lib/errors.js';
export {
  createConsoleLogger,
  createNoOpLogger,
  type Logger,
  setLogger,
} from './lib/logger.js';
export * from './lib/types.js';
export { type StediClient } from './sdk.js';

export type StediMode = 'live' | 'test';

/**
 * Create a Stedi API client.
 *
 * @param apiKey - Stedi API key.
 * @param mode - `'live'` sends every request to Stedi. `'test'` fakes
 *   `provider.create` and `enrollment.create` in memory (unsupported in Stedi
 *   test mode) and merges those records into real Stedi reads. If Stedi rejects
 *   the API key, `'test'` silently serves fully mocked data instead.
 * @returns A {@link StediClient}.
 */
export const createStediClient = (
  apiKey: string,
  mode: StediMode,
): StediClient => {
  const client = buildStediClient(apiKey);

  return mode === 'test' ? withTestMode(client) : client;
};

export default createStediClient;
