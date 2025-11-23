import { type StediClient } from '../lib/client.js';
import {
  type StediEligibilityInput,
  type StediEligibilityResponse,
} from '../lib/types.js';

export const eligibility = (client: StediClient, baseUrl: string) => {
  return {
    /**
     * Sends a real-time eligibility check to payers.
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/post-healthcare-eligibility
     *
     * @param input - The eligibility check parameters including subscriber, provider, and trading partner information.
     * @returns A promise that resolves to the eligibility response with benefits information.
     */
    check: async (
      input: StediEligibilityInput,
    ): Promise<StediEligibilityResponse> => {
      const data = {
        ...input,
        encounter: {
          serviceTypeCodes: [
            '27',
            '28',
            '30',
            '35',
            '36',
            '37',
            '38',
            '39',
            '40',
            '41',
          ],
        },
      };

      return await client.request(
        baseUrl,
        'POST',
        '/change/medicalnetwork/eligibility/v3',
        {
          data,
        },
      );
    },
  };
};
