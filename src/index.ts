import { eligibility } from './endpoints/eligibility.js';
import { enrollment } from './endpoints/enrollment.js';
import { payers } from './endpoints/payers.js';
import { provider } from './endpoints/provider.js';
import { transactions } from './endpoints/transactions.js';
import { stediClient } from './lib/client.js';

export {
  createConsoleLogger,
  createNoOpLogger,
  type Logger,
  setLogger,
} from './lib/logger.js';
export * from './lib/types.js';

export const createStediClient = (apiKey: string) => {
  const coreBaseUrl = 'https://core.us.stedi.com/2023-08-01';
  const healthcareBaseUrl = 'https://healthcare.us.stedi.com/2024-04-01';
  const enrollmentsBaseUrl = 'https://enrollments.us.stedi.com/2024-09-01';

  const client = stediClient(apiKey);
  return {
    downloadFile: client.downloadFile,
    eligibility: eligibility(client, healthcareBaseUrl),
    enrollment: enrollment(client, enrollmentsBaseUrl),
    payers: payers(client, healthcareBaseUrl),
    provider: provider(client, enrollmentsBaseUrl),
    transactions: transactions(client, coreBaseUrl),
  };
};

export type StediClient = ReturnType<typeof createStediClient>;

export default createStediClient;
