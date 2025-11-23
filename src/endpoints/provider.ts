import { type StediClient } from '../lib/client.js';
import {
  type StediProviderInput,
  type StediProviderResponse,
} from '../lib/types.js';

export const provider = (client: StediClient, baseUrl: string) => {
  return {
    /**
     * Create a Stedi provider
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/post-enrollment-create-provider
     *
     * @param input - The provider information.
     * @returns A promise that resolves to the provider response.
     */
    create: async (
      input: StediProviderInput,
    ): Promise<StediProviderResponse> => {
      return await client.request(baseUrl, 'POST', '/providers', {
        data: input,
      });
    },
  };
};
