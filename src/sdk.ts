import { eligibility } from './endpoints/eligibility.js';
import { enrollment } from './endpoints/enrollment.js';
import { payers } from './endpoints/payers.js';
import { provider } from './endpoints/provider.js';
import { transactions } from './endpoints/transactions.js';
import { stediHttpClient } from './lib/client.js';

/**
 * Assemble a Stedi client from an API key, wiring every endpoint to the
 * underlying HTTP transport.
 *
 * @param apiKey - Stedi API key.
 * @returns A {@link StediClient}.
 */
export const buildStediClient = (apiKey: string) => {
  const coreBaseUrl = 'https://core.us.stedi.com/2023-08-01';
  const healthcareBaseUrl = 'https://healthcare.us.stedi.com/2024-04-01';
  const enrollmentsBaseUrl = 'https://enrollments.us.stedi.com/2024-09-01';

  const httpClient = stediHttpClient(apiKey);
  return {
    downloadFile: httpClient.downloadFile,
    eligibility: eligibility(httpClient, healthcareBaseUrl),
    enrollment: enrollment(httpClient, enrollmentsBaseUrl),
    payers: payers(httpClient, healthcareBaseUrl),
    provider: provider(httpClient, enrollmentsBaseUrl),
    transactions: transactions(httpClient, coreBaseUrl),
  };
};

export type StediClient = ReturnType<typeof buildStediClient>;
