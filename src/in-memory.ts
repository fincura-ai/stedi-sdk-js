import { type StediClient } from './index.js';
import { StediApiError } from './lib/errors.js';
import {
  type StediEligibilityInput,
  type StediEligibilityResponse,
  type StediEnrollmentInput,
  type StediEnrollmentResponse,
  type StediListEnrollmentsParams,
  type StediListEnrollmentsResponse,
  type StediListProvidersParams,
  type StediPayerItem,
  type StediPayerResponse,
  type StediProviderInput,
  type StediProviderListResponse,
  type StediProviderResponse,
  type StediTransactionGetResponse,
  type StediTransactionListResponse,
} from './lib/types.js';

/**
 * In-memory storage backing a fake Stedi client.
 *
 * The store is the unit of read-after-write consistency: pass the same store to
 * several `createInMemoryStediClient` calls and they all observe the same data;
 * give each a fresh store (the default) and they stay isolated.
 *
 * @property enrollments - Created enrollments, keyed by their deterministic in-memory id.
 * @property providers - Created providers, keyed by their deterministic in-memory id.
 */
export type InMemoryStediStore = {
  enrollments: Map<string, StediEnrollmentResponse>;
  providers: Map<string, StediProviderResponse>;
};

/**
 * Options for {@link createInMemoryStediClient}. Everything specific to a
 * consumer (payers, fixtures, clock) is injected here; the SDK ships only
 * generic, environment-agnostic defaults.
 *
 * @property buildEligibilityResponse - Builds the response returned by `eligibility.check`. Defaults to a deterministic, schema-valid minimal response.
 * @property buildTransactionPage - Builds the page returned by `transactions.list` / `transactions.search`. Defaults to an empty page (`{ items: [] }`).
 * @property now - Clock used for deterministic `createdAt` / `updatedAt` timestamps. Defaults to `() => new Date().toISOString()`.
 * @property seedPayers - Payers returned by `payers.get` and filtered by `payers.search`. Defaults to a couple of generic, plausible payers.
 * @property store - Shared store enabling read-after-write consistency across clients. Defaults to a fresh, isolated store per call.
 */
export type InMemoryStediClientOptions = {
  buildEligibilityResponse?: (
    input: StediEligibilityInput,
  ) => StediEligibilityResponse;

  buildTransactionPage?: () => StediTransactionListResponse;

  now?: () => string;

  seedPayers?: StediPayerItem[];

  store?: InMemoryStediStore;
};

/**
 * Placeholder EDI payload returned by the in-memory `downloadFile`.
 */
const PLACEHOLDER_EDI =
  'ISA*00*          *00*          *ZZ*INMEMORY        *ZZ*INMEMORY        *250101*0000*^*00501*000000001*0*T*:~' +
  'GS*HB*INMEMORY*INMEMORY*20250101*0000*1*X*005010X279A1~' +
  'ST*271*0001~SE*1*0001~GE*1*1~IEA*1*000000001~';

/**
 * Generic, plausible payers used when no `seedPayers` are provided.
 */
const DEFAULT_SEED_PAYERS: StediPayerItem[] = [
  {
    aliases: ['vanguard', 'benefits', 'corp'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Vanguard Benefits Corp',
    names: ['Vanguard Benefits', 'VANGUARD CARE'],
    primaryPayerId: 'demo_63088',
    stediId: '_GUAR',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
  {
    aliases: ['group', 'benefits', 'nimbus'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Nimbus Benefits Group',
    names: ['Nimbus', 'NIMBUS BENEFITS'],
    primaryPayerId: 'demo_62308',
    stediId: '_CIGN',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
  {
    aliases: ['healthcoverage', 'meridian'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Meridian HealthCoverage',
    names: ['Meridian Health', 'MHC Dental'],
    primaryPayerId: 'demo_87726',
    stediId: '_UHCD',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
  {
    aliases: ['cobalt', 'plan', 'wellness'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Cobalt Wellness Plan',
    names: ['Cobalt', 'COBALT WELLNESS'],
    primaryPayerId: 'demo_60054',
    stediId: '_AETN',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
  {
    aliases: ['zephyr', 'dental', 'coverage'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Zephyr Dental Coverage',
    names: ['Zephyr CA', 'ZDC'],
    primaryPayerId: 'demo_94265',
    stediId: '_DDCA',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
  {
    aliases: ['pinnacle', 'care', 'partners'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Pinnacle Care Partners',
    names: ['Pinnacle', 'PINNACLE CARE'],
    primaryPayerId: 'demo_65978',
    stediId: '_METL',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
];

/**
 * Deterministic, schema-valid minimal eligibility response derived from the input.
 *
 * @param input - The eligibility check parameters.
 * @returns A minimal {@link StediEligibilityResponse}.
 */
const defaultBuildEligibilityResponse = (
  input: StediEligibilityInput,
): StediEligibilityResponse => ({
  benefitsInformation: [],
  controlNumber: input.controlNumber,
  eligibilitySearchId: `in-memory-eligibility-${input.controlNumber}`,
  errors: [],
  meta: {
    applicationMode: 'inmemory',
    outboundTraceId: `in-memory-${input.controlNumber}`,
    senderId: 'in-memory',
    submitterId: 'in-memory',
    traceId: `in-memory-${input.controlNumber}`,
  },
  payer: {},
  planDateInformation: {},
  planInformation: {},
  provider: {
    entityIdentifier: '',
    entityType: '',
    npi: input.provider.npi,
    providerName: input.provider.organizationName,
  },
  reassociationKey: `in-memory-${input.controlNumber}`,
  subscriber: {},
  tradingPartnerServiceId: input.tradingPartnerServiceId,
});

/**
 * Empty transaction page used when no `buildTransactionPage` is provided.
 *
 * @returns An empty {@link StediTransactionListResponse}.
 */
const defaultBuildTransactionPage = (): StediTransactionListResponse => ({
  items: [],
});

/**
 * Create an empty, isolated in-memory store.
 *
 * @returns A fresh {@link InMemoryStediStore}.
 */
export const createInMemoryStediStore = (): InMemoryStediStore => ({
  enrollments: new Map(),
  providers: new Map(),
});

/**
 * Clear every entity from a store in place.
 *
 * Optional convenience for reusing a single shared store across test cases.
 * Creating a fresh store with {@link createInMemoryStediStore} is the primary
 * way to isolate state.
 *
 * @param store - The store to clear.
 */
export const clearInMemoryStediStore = (store: InMemoryStediStore): void => {
  store.enrollments.clear();
  store.providers.clear();
};

/**
 * Create an in-memory double of the Stedi client.
 *
 * The returned client satisfies the exact {@link StediClient} contract but never
 * performs any network or filesystem I/O: writes land in the injected (or
 * default) {@link InMemoryStediStore} and reads come back from it. It carries no
 * notion of environment, production, or any consumer-specific data — the
 * real-vs-fake decision and business fixtures remain the consumer's
 * responsibility.
 *
 * @param [options] - Store, seed payers, response builders and clock overrides.
 * @returns A {@link StediClient} backed entirely by memory.
 */
export const createInMemoryStediClient = (
  options?: InMemoryStediClientOptions,
): StediClient => {
  const store = options?.store ?? createInMemoryStediStore();
  const seedPayers = options?.seedPayers ?? DEFAULT_SEED_PAYERS;
  const buildEligibilityResponse =
    options?.buildEligibilityResponse ?? defaultBuildEligibilityResponse;
  const buildTransactionPage =
    options?.buildTransactionPage ?? defaultBuildTransactionPage;
  const now = options?.now ?? (() => new Date().toISOString());

  return {
    downloadFile: async (): Promise<string> => PLACEHOLDER_EDI,

    eligibility: {
      check: async (
        input: StediEligibilityInput,
      ): Promise<StediEligibilityResponse> => buildEligibilityResponse(input),
    },

    enrollment: {
      create: async (
        input: StediEnrollmentInput,
      ): Promise<StediEnrollmentResponse> => {
        const id = `in-memory-enrollment-${input.provider.id}-${input.payer.idOrAlias}`;
        const linkedProvider = store.providers.get(input.provider.id);
        const existing = store.enrollments.get(id);
        const timestamp = now();

        const created: StediEnrollmentResponse = {
          createdAt: existing?.createdAt ?? timestamp,
          id,
          payer: {
            stediPayerId: input.payer.idOrAlias,
            submittedPayerIdOrAlias: input.payer.idOrAlias,
          },
          primaryContact: input.primaryContact,
          provider: {
            id: input.provider.id,
            name: linkedProvider?.name,
            npi: linkedProvider?.npi,
            taxId: linkedProvider?.taxId,
            taxIdType: linkedProvider?.taxIdType,
          },
          source: input.source,
          status: input.status,
          transactions: input.transactions,
          updatedAt: timestamp,
          userEmail: input.userEmail,
        };

        store.enrollments.set(id, created);

        return created;
      },

      get: async (enrollmentId: string): Promise<StediEnrollmentResponse> => {
        const found = store.enrollments.get(enrollmentId);

        if (!found) {
          throw new StediApiError('Not found', 404, undefined);
        }

        return found;
      },

      list: async (
        params: StediListEnrollmentsParams = {},
      ): Promise<StediListEnrollmentsResponse> => {
        const { payerIds, providerTaxIds, status } = params;

        const items = [...store.enrollments.values()].filter((enrollment) => {
          if (
            providerTaxIds &&
            (enrollment.provider.taxId === undefined ||
              !providerTaxIds.includes(enrollment.provider.taxId))
          ) {
            return false;
          }

          if (payerIds && !payerIds.includes(enrollment.payer.stediPayerId)) {
            return false;
          }

          if (status && !status.includes(enrollment.status)) {
            return false;
          }

          return true;
        });

        return { items, totalCount: items.length };
      },
    },

    payers: {
      get: async (): Promise<StediPayerResponse['items']> => [...seedPayers],

      search: async (
        queryParameters: Record<string, string[] | number | string>,
      ): Promise<StediPayerResponse['items']> => {
        const query =
          typeof queryParameters.query === 'string'
            ? queryParameters.query.toLowerCase()
            : undefined;
        const eligibilityCheck =
          typeof queryParameters.eligibilityCheck === 'string'
            ? queryParameters.eligibilityCheck
            : undefined;

        return seedPayers.filter((payer) => {
          if (query !== undefined) {
            const haystack = [
              payer.displayName,
              payer.primaryPayerId,
              payer.stediId,
              ...payer.names,
              ...payer.aliases,
            ]
              .join(' ')
              .toLowerCase();

            if (!haystack.includes(query)) {
              return false;
            }
          }

          if (
            eligibilityCheck !== undefined &&
            payer.transactionSupport.eligibilityCheck !== eligibilityCheck
          ) {
            return false;
          }

          return true;
        });
      },
    },

    provider: {
      create: async (
        input: StediProviderInput,
      ): Promise<StediProviderResponse> => {
        const id = `in-memory-provider-${input.npi}`;
        const existing = store.providers.get(id);

        // Idempotent on duplicate NPI: same id, no double entry. Mirrors
        // Stedi's 409-on-duplicate semantics by returning the existing record.
        if (existing) {
          return existing;
        }

        const timestamp = now();
        const created: StediProviderResponse = {
          contacts: input.contacts,
          createdAt: timestamp,
          id,
          name: input.name,
          npi: input.npi,
          taxId: input.taxId,
          taxIdType: input.taxIdType,
          updatedAt: timestamp,
        };

        store.providers.set(id, created);

        return created;
      },

      get: async (providerId: string): Promise<StediProviderResponse> => {
        const found = store.providers.get(providerId);

        if (!found) {
          throw new StediApiError('Not found', 404, undefined);
        }

        return found;
      },

      list: async (
        params: StediListProvidersParams = {},
      ): Promise<StediProviderListResponse> => {
        const { providerNpis, providerTaxIds } = params;

        const items = [...store.providers.values()]
          .filter(
            (provider) => !providerNpis || providerNpis.includes(provider.npi),
          )
          .filter(
            (provider) =>
              !providerTaxIds || providerTaxIds.includes(provider.taxId),
          )
          .map((provider) => ({
            id: provider.id,
            name: provider.name,
            npi: provider.npi,
            taxId: provider.taxId,
            taxIdType: provider.taxIdType,
          }));

        return { items };
      },
    },

    transactions: {
      get: async (): Promise<StediTransactionGetResponse> => {
        throw new StediApiError('Not found', 404, undefined);
      },

      list: async (): Promise<StediTransactionListResponse> =>
        buildTransactionPage(),

      search: async (): Promise<StediTransactionListResponse> =>
        buildTransactionPage(),
    },
  };
};
