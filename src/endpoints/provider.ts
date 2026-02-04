import { type StediClient } from '../lib/client.js';
import {
  type StediProviderInput,
  type StediProviderListResponse,
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

    /**
     * Get a Stedi provider by ID
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/get-enrollment-provider
     *
     * @param providerId - The ID of the provider to retrieve.
     * @returns A promise that resolves to the provider response.
     */
    get: async (providerId: string): Promise<StediProviderResponse> => {
      return await client.request(
        baseUrl,
        'GET',
        `/providers/${providerId}`,
        {},
      );
    },

    /**
     * List all Stedi providers
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/get-enrollment-providers
     *
     * @returns A promise that resolves to the list of providers.
     */
    list: async (): Promise<StediProviderListResponse> => {
      return await client.request(baseUrl, 'GET', '/providers', {});
    },
  };
};
