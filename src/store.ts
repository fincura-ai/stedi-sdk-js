import {
  type StediEnrollmentInput,
  type StediEnrollmentResponse,
  type StediListEnrollmentsParams,
  type StediListProvidersParams,
  type StediProviderInput,
  type StediProviderListItem,
  type StediProviderResponse,
} from './lib/types.js';

/**
 * In-memory storage for provider/enrollment writes in test mode.
 *
 * @property enrollments - Created enrollments, keyed by their deterministic id.
 * @property providers - Created providers, keyed by their deterministic id.
 */
export type InMemoryStediStore = {
  enrollments: Map<string, StediEnrollmentResponse>;
  providers: Map<string, StediProviderResponse>;
};

/**
 * Create an empty in-memory store.
 *
 * @returns A fresh {@link InMemoryStediStore}.
 */
export const createStore = (): InMemoryStediStore => ({
  enrollments: new Map(),
  providers: new Map(),
});

/**
 * Build or return an existing provider record in the store.
 *
 * @param input - Provider creation input.
 * @param store - The in-memory store.
 * @returns The created or existing provider response.
 */
export const buildProviderRecord = (
  input: StediProviderInput,
  store: InMemoryStediStore,
): StediProviderResponse => {
  const id = `in-memory-provider-${input.npi}`;
  const existing = store.providers.get(id);

  if (existing) {
    return existing;
  }

  const timestamp = new Date().toISOString();
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
};

/**
 * Build or update an enrollment record in the store.
 *
 * @param input - Enrollment creation input.
 * @param store - The in-memory store.
 * @returns The created enrollment response.
 */
export const buildEnrollmentRecord = (
  input: StediEnrollmentInput,
  store: InMemoryStediStore,
): StediEnrollmentResponse => {
  const id = `in-memory-enrollment-${input.provider.id}-${input.payer.idOrAlias}`;
  const linkedProvider = store.providers.get(input.provider.id);
  const existing = store.enrollments.get(id);
  const timestamp = new Date().toISOString();

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
};

/**
 * Filter enrollments from the store using list query parameters.
 *
 * @param store - The in-memory store.
 * @param params - Optional list filters.
 * @returns Matching enrollments.
 */
export const filterStoredEnrollments = (
  store: InMemoryStediStore,
  params: StediListEnrollmentsParams = {},
): StediEnrollmentResponse[] => {
  const { payerIds, providerTaxIds, status } = params;

  return [...store.enrollments.values()].filter((enrollment) => {
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
};

/**
 * Filter providers from the store and map to list items.
 *
 * @param store - The in-memory store.
 * @param params - Optional list filters.
 * @returns Matching provider list items.
 */
export const filterStoredProviders = (
  store: InMemoryStediStore,
  params: StediListProvidersParams = {},
): StediProviderListItem[] => {
  const { providerNpis, providerTaxIds } = params;

  return [...store.providers.values()]
    .filter((provider) => !providerNpis || providerNpis.includes(provider.npi))
    .filter(
      (provider) => !providerTaxIds || providerTaxIds.includes(provider.taxId),
    )
    .map((provider) => ({
      id: provider.id,
      name: provider.name,
      npi: provider.npi,
      taxId: provider.taxId,
      taxIdType: provider.taxIdType,
    }));
};

/**
 * Merge real and stored list items, with stored items winning on id conflict.
 *
 * @param realItems - Items returned from Stedi.
 * @param storedItems - Items from the in-memory store.
 * @returns De-duplicated merged items.
 */
export const mergeListItems = <T extends { id: string }>(
  realItems: T[],
  storedItems: T[],
): T[] => {
  const byId = new Map<string, T>();

  for (const item of realItems) {
    byId.set(item.id, item);
  }

  for (const item of storedItems) {
    byId.set(item.id, item);
  }

  return [...byId.values()];
};
