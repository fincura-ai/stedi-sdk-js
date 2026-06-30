import { StediApiError } from '../src/lib/errors.js';
import {
  type StediEnrollmentInput,
  type StediEnrollmentResponse,
  type StediListEnrollmentsResponse,
  type StediProviderInput,
  type StediProviderListResponse,
  type StediProviderResponse,
} from '../src/lib/types.js';
import { mergeListItems } from '../src/store.js';
import { withTestMode } from '../src/test-mode.js';

const providerInput: StediProviderInput = {
  contacts: [
    {
      city: 'Springfield',
      email: 'admin@example.com',
      organizationName: 'Example Clinic',
      phone: '555-123-4567',
      state: 'IL',
      streetAddress1: '123 Main St',
      zipCode: '62701',
    },
  ],
  name: 'Example Clinic',
  npi: '1234567890',
  taxId: '123456789',
  taxIdType: 'EIN',
};

const providerId = `in-memory-provider-${providerInput.npi}`;

const enrollmentInput: StediEnrollmentInput = {
  payer: { idOrAlias: 'INMEMORY001' },
  primaryContact: {
    city: 'Springfield',
    email: 'admin@example.com',
    organizationName: 'Example Clinic',
    phone: '555-123-4567',
    state: 'IL',
    streetAddress1: '123 Main St',
    zipCode: '62701',
  },
  provider: { id: providerId },
  source: 'API',
  status: 'SUBMITTED',
  transactions: { claimPayment: { enroll: true } },
  userEmail: 'admin@example.com',
};

const stediProvider: StediProviderResponse = {
  contacts: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  id: 'stedi-provider-1',
  name: 'Stedi Clinic',
  npi: '1111111111',
  taxId: '111111111',
  taxIdType: 'EIN',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const stediEnrollment: StediEnrollmentResponse = {
  createdAt: '2024-01-01T00:00:00.000Z',
  id: 'stedi-enrollment-1',
  payer: { stediPayerId: 'PAYER1' },
  provider: { id: 'stedi-provider-1' },
  source: 'API',
  status: 'LIVE',
  transactions: {},
  updatedAt: '2024-01-01T00:00:00.000Z',
  userEmail: 'stedi@example.com',
};

const createMockSdk = () => ({
  downloadFile: jest.fn().mockResolvedValue('EDI content'),
  eligibility: {
    check: jest.fn().mockResolvedValue({ controlNumber: '123' }),
  },
  enrollment: {
    create: jest.fn(),
    get: jest.fn().mockImplementation(async (id: string) => {
      if (id === stediEnrollment.id) {
        return stediEnrollment;
      }

      throw new StediApiError('Not found', 404, undefined);
    }),
    list: jest.fn().mockResolvedValue({
      items: [stediEnrollment],
      totalCount: 1,
    } satisfies StediListEnrollmentsResponse),
  },
  payers: {
    get: jest.fn().mockResolvedValue([]),
    search: jest.fn().mockResolvedValue([]),
  },
  provider: {
    create: jest.fn(),
    get: jest.fn().mockImplementation(async (id: string) => {
      if (id === stediProvider.id) {
        return stediProvider;
      }

      throw new StediApiError('Not found', 404, undefined);
    }),
    list: jest.fn().mockResolvedValue({
      items: [
        {
          id: stediProvider.id,
          name: stediProvider.name,
          npi: stediProvider.npi,
          taxId: stediProvider.taxId,
          taxIdType: stediProvider.taxIdType,
        },
      ],
    } satisfies StediProviderListResponse),
  },
  transactions: {
    get: jest.fn().mockResolvedValue({ id: 'txn-1' }),
    list: jest.fn().mockResolvedValue({ items: [] }),
    search: jest.fn().mockResolvedValue({ items: [] }),
  },
});

describe('mergeListItems', () => {
  it('prefers stored items on id conflict', () => {
    const merged = mergeListItems(
      [{ id: 'a', name: 'stedi' }],
      [{ id: 'a', name: 'stored' }],
    );

    expect(merged).toEqual([{ id: 'a', name: 'stored' }]);
  });
});

describe('withTestMode', () => {
  describe('writes', () => {
    it('provider.create stores locally and does not call Stedi', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      const created = await sdk.provider.create(providerInput);

      expect(created.id).toBe(providerId);
      expect(base.provider.create).not.toHaveBeenCalled();
    });

    it('enrollment.create stores locally and does not call Stedi', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      await sdk.provider.create(providerInput);
      const created = await sdk.enrollment.create(enrollmentInput);

      expect(created.id).toBe(
        `in-memory-enrollment-${providerId}-${enrollmentInput.payer.idOrAlias}`,
      );
      expect(created.provider.taxId).toBe(providerInput.taxId);
      expect(base.enrollment.create).not.toHaveBeenCalled();
    });

    it('provider.create is idempotent on duplicate NPI', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      const first = await sdk.provider.create(providerInput);
      const second = await sdk.provider.create(providerInput);

      expect(second).toEqual(first);
      expect(second.id).toBe(first.id);
    });
  });

  describe('get', () => {
    it('returns stored provider without calling Stedi', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      const created = await sdk.provider.create(providerInput);
      const fetched = await sdk.provider.get(providerId);

      expect(fetched).toEqual(created);
      expect(base.provider.get).not.toHaveBeenCalled();
    });

    it('falls back to Stedi for unknown provider id', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      const fetched = await sdk.provider.get(stediProvider.id);

      expect(fetched).toEqual(stediProvider);
      expect(base.provider.get).toHaveBeenCalledWith(stediProvider.id);
    });

    it('returns stored enrollment without calling Stedi', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      await sdk.provider.create(providerInput);
      const created = await sdk.enrollment.create(enrollmentInput);
      const fetched = await sdk.enrollment.get(created.id);

      expect(fetched).toEqual(created);
      expect(base.enrollment.get).not.toHaveBeenCalled();
    });

    it('falls back to Stedi for unknown enrollment id', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      const fetched = await sdk.enrollment.get(stediEnrollment.id);

      expect(fetched).toEqual(stediEnrollment);
      expect(base.enrollment.get).toHaveBeenCalledWith(stediEnrollment.id);
    });
  });

  describe('list merge', () => {
    it('merges stored providers with Stedi list results', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      const created = await sdk.provider.create(providerInput);
      const listed = await sdk.provider.list();

      expect(listed.items).toHaveLength(2);
      expect(listed.items.map((item) => item.id).toSorted()).toEqual(
        [created.id, stediProvider.id].toSorted(),
      );
      expect(base.provider.list).toHaveBeenCalled();
    });

    it('merges stored enrollments with Stedi list results', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      await sdk.provider.create(providerInput);
      const created = await sdk.enrollment.create(enrollmentInput);
      const listed = await sdk.enrollment.list();

      expect(listed.items).toHaveLength(2);
      expect(listed.items.map((item) => item.id).toSorted()).toEqual(
        [created.id, stediEnrollment.id].toSorted(),
      );
      expect(base.enrollment.list).toHaveBeenCalled();
    });

    it('filters stored providers by providerNpis and providerTaxIds', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      await sdk.provider.create(providerInput);
      await sdk.provider.create({
        ...providerInput,
        name: 'Other Clinic',
        npi: '9999999999',
        taxId: '999999999',
      });

      const byNpi = await sdk.provider.list({
        providerNpis: [providerInput.npi],
      });
      expect(byNpi.items.some((item) => item.npi === providerInput.npi)).toBe(
        true,
      );
      expect(byNpi.items.some((item) => item.npi === '9999999999')).toBe(false);
    });

    it('filters stored enrollments by payerIds and status', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      await sdk.provider.create(providerInput);
      await sdk.enrollment.create(enrollmentInput);

      const matching = await sdk.enrollment.list({
        payerIds: ['INMEMORY001'],
        status: ['SUBMITTED'],
      });
      expect(
        matching.items.some(
          (item) => item.payer.stediPayerId === 'INMEMORY001',
        ),
      ).toBe(true);

      const nonMatching = await sdk.enrollment.list({ status: ['LIVE'] });
      expect(
        nonMatching.items.every((item) => item.id === stediEnrollment.id),
      ).toBe(true);
    });
  });

  describe('pass-through', () => {
    it('delegates eligibility.check to the underlying SDK', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      const input = {
        controlNumber: '123',
        provider: { npi: '1', organizationName: 'Clinic' },
        tradingPartnerName: 'PAYER',
        tradingPartnerServiceId: 'svc',
      };

      await sdk.eligibility.check(input);

      expect(base.eligibility.check).toHaveBeenCalledWith(input);
    });

    it('delegates payers, transactions, and downloadFile to the underlying SDK', async () => {
      const base = createMockSdk();
      const sdk = withTestMode(base);

      await sdk.payers.get();
      await sdk.payers.search({ query: 'aetna' });
      await sdk.transactions.get('txn-1');
      await sdk.transactions.list();
      await sdk.transactions.search();
      await sdk.downloadFile('https://core.us.stedi.com/file');

      expect(base.payers.get).toHaveBeenCalled();
      expect(base.payers.search).toHaveBeenCalledWith({ query: 'aetna' });
      expect(base.transactions.get).toHaveBeenCalledWith('txn-1');
      expect(base.transactions.list).toHaveBeenCalled();
      expect(base.transactions.search).toHaveBeenCalled();
      expect(base.downloadFile).toHaveBeenCalledWith(
        'https://core.us.stedi.com/file',
      );
    });
  });
});

describe('auth fallback', () => {
  const eligibilityInput = {
    controlNumber: '123',
    provider: { npi: '1', organizationName: 'Clinic' },
    tradingPartnerName: 'PAYER',
    tradingPartnerServiceId: 'svc',
  };

  it('serves mock payers when Stedi rejects the key (401)', async () => {
    const base = createMockSdk();
    base.payers.get.mockRejectedValue(
      new StediApiError('Unauthorized', 401, undefined),
    );
    const sdk = withTestMode(base);

    const payers = await sdk.payers.get();

    expect(payers.length).toBeGreaterThan(0);
  });

  it('serves a mock eligibility response when the key is rejected (403)', async () => {
    const base = createMockSdk();
    base.eligibility.check.mockRejectedValue(
      new StediApiError('Forbidden', 403, undefined),
    );
    const sdk = withTestMode(base);

    const result = await sdk.eligibility.check(eligibilityInput);

    expect(result.controlNumber).toBe('123');
    expect(result.benefitsInformation).toEqual([]);
  });

  it('remembers the rejection and stops calling Stedi on later reads', async () => {
    const base = createMockSdk();
    base.payers.get.mockRejectedValue(
      new StediApiError('Unauthorized', 401, undefined),
    );
    const sdk = withTestMode(base);

    await sdk.payers.get();
    await sdk.transactions.list();
    await sdk.eligibility.check(eligibilityInput);

    expect(base.transactions.list).not.toHaveBeenCalled();
    expect(base.eligibility.check).not.toHaveBeenCalled();
  });

  it('falls back to the in-memory store for provider list', async () => {
    const base = createMockSdk();
    base.payers.get.mockRejectedValue(
      new StediApiError('Unauthorized', 401, undefined),
    );
    base.provider.list.mockRejectedValue(
      new StediApiError('Unauthorized', 401, undefined),
    );
    const sdk = withTestMode(base);

    await sdk.payers.get();
    const created = await sdk.provider.create(providerInput);
    const listed = await sdk.provider.list();

    expect(listed.items).toEqual([
      {
        id: created.id,
        name: created.name,
        npi: created.npi,
        taxId: created.taxId,
        taxIdType: created.taxIdType,
      },
    ]);
    expect(base.provider.list).not.toHaveBeenCalled();
  });

  it('does not fall back on non-auth errors', async () => {
    const base = createMockSdk();
    base.payers.get.mockRejectedValue(
      new StediApiError('Server error', 500, undefined),
    );
    const sdk = withTestMode(base);

    await expect(sdk.payers.get()).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('createStediClient', () => {
  it('requires an explicit mode argument', async () => {
    const { createStediClient } = await import('../src/index.js');

    expect(createStediClient.length).toBe(2);
  });
});
