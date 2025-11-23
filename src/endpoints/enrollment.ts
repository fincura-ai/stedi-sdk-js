import { type StediClient } from '../lib/client.js';
import {
  type StediEnrollmentInput,
  type StediEnrollmentResponse,
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
  };
};
