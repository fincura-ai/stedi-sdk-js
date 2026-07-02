import { StediApiError } from './lib/errors.js';
import {
  type StediEligibilityInput,
  type StediEligibilityResponse,
  type StediEnrollmentInput,
  type StediEnrollmentResponse,
  type StediListEnrollmentsParams,
  type StediListEnrollmentsResponse,
  type StediListProvidersParams,
  type StediPayerResponse,
  type StediProviderInput,
  type StediProviderListResponse,
  type StediProviderResponse,
  type StediTransactionGetResponse,
  type StediTransactionListResponse,
} from './lib/types.js';
import {
  buildMockEligibilityResponse,
  buildMockTransactionPage,
  DEFAULT_SEED_PAYERS,
  PLACEHOLDER_EDI,
  searchMockPayers,
} from './mock-defaults.js';
import { type StediClient } from './sdk.js';
import {
  buildEnrollmentRecord,
  buildProviderRecord,
  createStore,
  filterStoredEnrollments,
  filterStoredProviders,
  type InMemoryStediStore,
  mergeListItems,
} from './store.js';

/**
 * Whether a thrown error is a Stedi auth rejection (invalid/fake/wrong key).
 *
 * @param error - The caught error.
 * @returns `true` for 401/403 responses from Stedi.
 */
const isAuthError = (error: unknown): boolean =>
  error instanceof StediApiError &&
  (error.statusCode === 401 || error.statusCode === 403);

/**
 * Mutable flag tracking whether this client has fallen back to full mock mode.
 */
type MockState = { mocked: boolean };

/**
 * Run a Stedi read, falling back to a mock value if the key was (or is) rejected.
 *
 * Once an auth rejection is seen, the client stays in full-mock mode for all
 * subsequent reads so we never repeat failing network calls.
 *
 * @param state - Shared mock state for the client.
 * @param callStedi - The real Stedi read.
 * @param buildMock - The mock value to serve when in full-mock mode.
 * @returns The Stedi result, or the mock value when the key is rejected.
 */
const readWithMockFallback = async <T>(
  state: MockState,
  callStedi: () => Promise<T>,
  buildMock: () => T,
): Promise<T> => {
  if (state.mocked) {
    return buildMock();
  }

  try {
    return await callStedi();
  } catch (error) {
    if (isAuthError(error)) {
      state.mocked = true;
      return buildMock();
    }

    throw error;
  }
};

/**
 * Build a provider list response from the in-memory store alone.
 *
 * @param store - The in-memory store.
 * @param params - Optional list filters.
 * @returns A {@link StediProviderListResponse}.
 */
const mockProviderList = (
  store: InMemoryStediStore,
  params: StediListProvidersParams,
): StediProviderListResponse => ({
  items: filterStoredProviders(store, params),
});

/**
 * Build an enrollment list response from the in-memory store alone.
 *
 * @param store - The in-memory store.
 * @param params - Optional list filters.
 * @returns A {@link StediListEnrollmentsResponse}.
 */
const mockEnrollmentList = (
  store: InMemoryStediStore,
  params: StediListEnrollmentsParams,
): StediListEnrollmentsResponse => {
  const items = filterStoredEnrollments(store, params);
  return { items, totalCount: items.length };
};

/**
 * Apply test mode to a Stedi SDK instance.
 *
 * Provider and enrollment creates are stored in memory (Stedi test mode does not
 * support transaction enrollment). Reads merge stored records with Stedi
 * responses. If Stedi rejects the API key (a fake/invalid/wrong key), the client
 * silently falls back to serving fully mocked data for all reads.
 *
 * @param client - The Stedi client to wrap.
 * @returns A {@link StediClient} with resilient test-mode behavior.
 */
export const withTestMode = (client: StediClient): StediClient => {
  const store = createStore();
  const state: MockState = { mocked: false };

  return {
    downloadFile: async (url: string): Promise<string> =>
      readWithMockFallback(
        state,
        async () => client.downloadFile(url),
        () => PLACEHOLDER_EDI,
      ),

    eligibility: {
      check: async (
        input: StediEligibilityInput,
      ): Promise<StediEligibilityResponse> =>
        readWithMockFallback(
          state,
          async () => client.eligibility.check(input),
          () => buildMockEligibilityResponse(input),
        ),
    },

    enrollment: {
      create: async (
        input: StediEnrollmentInput,
      ): Promise<StediEnrollmentResponse> =>
        buildEnrollmentRecord(input, store),

      get: async (enrollmentId: string): Promise<StediEnrollmentResponse> => {
        const stored = store.enrollments.get(enrollmentId);
        if (stored) {
          return stored;
        }

        return readWithMockFallback(
          state,
          async () => client.enrollment.get(enrollmentId),
          () => {
            throw new StediApiError('Not found', 404, undefined);
          },
        );
      },

      list: async (
        params: StediListEnrollmentsParams = {},
      ): Promise<StediListEnrollmentsResponse> => {
        const storedItems = filterStoredEnrollments(store, params);

        const response = await readWithMockFallback(
          state,
          async () => client.enrollment.list(params),
          () => mockEnrollmentList(store, params),
        );

        const items = mergeListItems(response.items, storedItems);
        return { ...response, items, totalCount: items.length };
      },
    },

    payers: {
      get: async (): Promise<StediPayerResponse['items']> =>
        readWithMockFallback(
          state,
          async () => client.payers.get(),
          () => [...DEFAULT_SEED_PAYERS],
        ),

      search: async (
        queryParameters: Record<string, string[] | number | string>,
      ): Promise<StediPayerResponse['items']> =>
        readWithMockFallback(
          state,
          async () => client.payers.search(queryParameters),
          () => searchMockPayers(queryParameters),
        ),
    },

    provider: {
      create: async (
        input: StediProviderInput,
      ): Promise<StediProviderResponse> => buildProviderRecord(input, store),

      get: async (providerId: string): Promise<StediProviderResponse> => {
        const stored = store.providers.get(providerId);
        if (stored) {
          return stored;
        }

        return readWithMockFallback(
          state,
          async () => client.provider.get(providerId),
          () => {
            throw new StediApiError('Not found', 404, undefined);
          },
        );
      },

      list: async (
        params: StediListProvidersParams = {},
      ): Promise<StediProviderListResponse> => {
        const storedItems = filterStoredProviders(store, params);

        const response = await readWithMockFallback(
          state,
          async () => client.provider.list(params),
          () => mockProviderList(store, params),
        );

        const items = mergeListItems(response.items, storedItems);
        return { ...response, items };
      },
    },

    transactions: {
      get: async (
        transactionId: string,
      ): Promise<StediTransactionGetResponse> =>
        readWithMockFallback(
          state,
          async () => client.transactions.get(transactionId),
          () => {
            throw new StediApiError('Not found', 404, undefined);
          },
        ),

      list: async (
        ...args: Parameters<StediClient['transactions']['list']>
      ): Promise<StediTransactionListResponse> =>
        readWithMockFallback(
          state,
          async () => client.transactions.list(...args),
          () => buildMockTransactionPage(),
        ),

      search: async (
        ...args: Parameters<StediClient['transactions']['search']>
      ): Promise<StediTransactionListResponse> =>
        readWithMockFallback(
          state,
          async () => client.transactions.search(...args),
          () => buildMockTransactionPage(),
        ),
    },
  };
};
