import { type StediClient } from '../lib/client.js';
import {
  type StediEnrollmentInput,
  type StediEnrollmentResponse,
  type StediListEnrollmentsParams,
  type StediListEnrollmentsResponse,
} from '../lib/types.js';

export const enrollment = (client: StediClient, baseUrl: string) => {
  return {
    /**
     * Create a Stedi enrollment for a provider
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/post-enrollment-create-enrollment
     *
     * @param input - The enrollment information.
     * @returns A promise that resolves to the enrollment response.
     */
    create: async (
      input: StediEnrollmentInput,
    ): Promise<StediEnrollmentResponse> => {
      return await client.request(baseUrl, 'POST', '/enrollments', {
        data: input,
      });
    },

    /**
     * Get a single enrollment by ID.
     *
     * @see https://www.stedi.com/docs/api-reference/healthcare/get-enrollment
     *
     * @param enrollmentId - The ID of the enrollment to retrieve.
     * @returns A promise that resolves to the enrollment.
     */
    get: async (enrollmentId: string): Promise<StediEnrollmentResponse> => {
      return await client.request<StediEnrollmentResponse>(
        baseUrl,
        'GET',
        `/enrollments/${enrollmentId}`,
      );
    },

    /**
     * List transaction enrollment records with optional filtering and pagination.
     *
     * @see https://www.stedi.com/docs/healthcare/api-reference/get-enrollment-list-enrollments
     *
     * @param params - Optional filtering and pagination parameters.
     * @returns A promise that resolves to the list of enrollments.
     */
    list: async (
      params: StediListEnrollmentsParams = {},
    ): Promise<StediListEnrollmentsResponse> => {
      return await client.request<StediListEnrollmentsResponse>(
        baseUrl,
        'GET',
        '/enrollments',
        {
          params,
        },
      );
    },
  };
};
