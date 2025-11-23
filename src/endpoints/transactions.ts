import { type StediClient } from '../lib/client.js';
import {
  type StediTransactionGetResponse,
  type StediTransactionListResponse,
} from '../lib/types.js';

export const transactions = (client: StediClient, baseUrl: string) => {
  return {
    /**
     * Get a transaction.
     *
     * @see https://www.stedi.com/docs/api-reference/edi-platform/core/get-transactions
     *
     * @param transactionId - The ID of the transaction to get.
     * @returns A promise that resolves to the transaction.
     */
    get: async (
      transactionId: string,
    ): Promise<StediTransactionGetResponse> => {
      const response = await client.request<StediTransactionGetResponse>(
        baseUrl,
        'GET',
        `/transactions/${transactionId}`,
      );

      return response;
    },

    /**
     * Fecth a list of transactions.
     *
     * @see https://www.stedi.com/docs/api-reference/edi-platform/core/get-list-transactions
     *
     * @returns A promise that resolves to the transactions.
     */
    list: async (
      params: {
        pageSize?: number;
        pageToken?: string;
      } = {},
    ): Promise<StediTransactionListResponse> => {
      const response = await client.request<StediTransactionListResponse>(
        baseUrl,
        'GET',
        '/transactions',
        {
          params,
        },
      );

      return response;
    },

    /**
     * Search for specific transactions.
     *
     * @see https://www.stedi.com/docs/api-reference/edi-platform/core/get-list-transactions
     *
     * @returns A promise that resolves to the transactions.
     */
    search: async (
      params: {
        businessIdentifier?: string;
      } = {},
    ): Promise<StediTransactionListResponse> => {
      const response = await client.request<StediTransactionListResponse>(
        baseUrl,
        'GET',
        '/transactions',
        {
          params,
        },
      );

      return response;
    },
  };
};
