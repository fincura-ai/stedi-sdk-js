import { type StediClient } from '../lib/client.js';
import {
  type StediPayerResponse,
  type StediPayerSearchResponse,
} from '../lib/types.js';

export const payers = (client: StediClient, baseUrl: string) => {
  return {
    /**
     * Get all payers.
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/get-payers
     *
     * @returns A promise that resolves to all Stedi's supported payers.
     */
    get: async (): Promise<StediPayerResponse['items']> => {
      const response = await client.request<StediPayerResponse>(
        baseUrl,
        'GET',
        '/payers',
      );

      return response.items;
    },

    /**
     * Search for payers.
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/get-search-payers
     *
     * @param queryParameters - The query parameters to search for.
     * @returns A promise that resolves to the filtered payers.
     */
    search: async (
      queryParameters: Record<string, string[] | number | string>,
    ): Promise<StediPayerResponse['items']> => {
      const response = await client.request<StediPayerSearchResponse>(
        baseUrl,
        'GET',
        '/payers/search',
        {
          params: queryParameters,
        },
      );

      return response.items.map((item) => item.payer);
    },
  };
};
