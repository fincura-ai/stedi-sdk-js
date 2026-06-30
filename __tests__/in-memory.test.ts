import {
  clearInMemoryStediStore,
  createInMemoryStediClient,
  createInMemoryStediStore,
} from '../src/in-memory.js';
import { StediApiError } from '../src/lib/errors.js';
import {
  type StediEligibilityInput,
  type StediEnrollmentInput,
  type StediPayerItem,
  type StediProviderInput,
} from '../src/lib/types.js';

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

const seedPayers: StediPayerItem[] = [
  {
    aliases: ['BCBS'],
    displayName: 'Blue Shield',
    names: ['Blue Shield'],
    primaryPayerId: '11111',
    stediId: 'PAYER_BLUE',
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
    aliases: ['AET'],
    displayName: 'Aetna Health',
    names: ['Aetna Health'],
    primaryPayerId: '22222',
    stediId: 'PAYER_AETNA',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'NOT_SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
];

describe('createInMemoryStediClient', () => {
  describe('provider', () => {
    it('create -> get / list returns the created provider', async () => {
      const client = createInMemoryStediClient();

      const created = await client.provider.create(providerInput);

      expect(created.id).toBe(providerId);
      expect(created.npi).toBe(providerInput.npi);
      expect(created.name).toBe(providerInput.name);
      expect(created.contacts).toEqual(providerInput.contacts);

      const fetched = await client.provider.get(providerId);
      expect(fetched).toEqual(created);

      const listed = await client.provider.list();
      expect(listed.items).toEqual([
        {
          id: providerId,
          name: providerInput.name,
          npi: providerInput.npi,
          taxId: providerInput.taxId,
          taxIdType: providerInput.taxIdType,
        },
      ]);
    });

    it('is idempotent on duplicate NPI (same id, no double entry)', async () => {
      const client = createInMemoryStediClient();

      const first = await client.provider.create(providerInput);
      const second = await client.provider.create(providerInput);

      expect(second.id).toBe(first.id);
      expect(second).toEqual(first);

      const listed = await client.provider.list();
      expect(listed.items).toHaveLength(1);
    });

    it('list filters by providerNpis and providerTaxIds', async () => {
      const client = createInMemoryStediClient();
      await client.provider.create(providerInput);
      await client.provider.create({
        ...providerInput,
        name: 'Other Clinic',
        npi: '9999999999',
        taxId: '999999999',
      });

      const byNpi = await client.provider.list({
        providerNpis: [providerInput.npi],
      });
      expect(byNpi.items).toHaveLength(1);
      expect(byNpi.items[0]?.npi).toBe(providerInput.npi);

      const byTaxId = await client.provider.list({
        providerTaxIds: ['999999999'],
      });
      expect(byTaxId.items).toHaveLength(1);
      expect(byTaxId.items[0]?.npi).toBe('9999999999');
    });

    it('get throws a 404 StediApiError for an unknown id', async () => {
      const client = createInMemoryStediClient();

      await expect(client.provider.get('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
      await expect(client.provider.get('missing')).rejects.toBeInstanceOf(
        StediApiError,
      );
    });
  });

  describe('enrollment', () => {
    it('create -> list filtered by providerTaxIds, and get by id', async () => {
      const client = createInMemoryStediClient();
      await client.provider.create(providerInput);

      const created = await client.enrollment.create(enrollmentInput);

      expect(created.id).toBe(
        `in-memory-enrollment-${providerId}-${enrollmentInput.payer.idOrAlias}`,
      );
      expect(created.status).toBe('SUBMITTED');
      expect(created.payer.stediPayerId).toBe(enrollmentInput.payer.idOrAlias);
      // Enriched from the linked provider in the store.
      expect(created.provider.taxId).toBe(providerInput.taxId);

      const matching = await client.enrollment.list({
        providerTaxIds: [providerInput.taxId],
      });
      expect(matching.items).toHaveLength(1);
      expect(matching.items[0]?.id).toBe(created.id);

      const nonMatching = await client.enrollment.list({
        providerTaxIds: ['000000000'],
      });
      expect(nonMatching.items).toHaveLength(0);

      const fetched = await client.enrollment.get(created.id);
      expect(fetched).toEqual(created);
    });

    it('list filters by payerIds and status', async () => {
      const client = createInMemoryStediClient();
      await client.provider.create(providerInput);
      await client.enrollment.create(enrollmentInput);

      expect(
        (await client.enrollment.list({ payerIds: ['INMEMORY001'] })).items,
      ).toHaveLength(1);
      expect(
        (await client.enrollment.list({ payerIds: ['NOPE'] })).items,
      ).toHaveLength(0);
      expect(
        (await client.enrollment.list({ status: ['SUBMITTED'] })).items,
      ).toHaveLength(1);
      expect(
        (await client.enrollment.list({ status: ['LIVE'] })).items,
      ).toHaveLength(0);
    });

    it('get throws a 404 StediApiError for an unknown id', async () => {
      const client = createInMemoryStediClient();

      await expect(client.enrollment.get('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('shared store', () => {
    it('two clients sharing a store observe the same data', async () => {
      const store = createInMemoryStediStore();
      const universalClient = createInMemoryStediClient({ store });
      const orgClient = createInMemoryStediClient({ store });

      await universalClient.provider.create(providerInput);

      const fromOther = await orgClient.provider.get(providerId);
      expect(fromOther.id).toBe(providerId);
    });

    it('two clients with distinct stores are isolated', async () => {
      const clientA = createInMemoryStediClient();
      const clientB = createInMemoryStediClient();

      await clientA.provider.create(providerInput);

      expect((await clientA.provider.list()).items).toHaveLength(1);
      expect((await clientB.provider.list()).items).toHaveLength(0);
    });

    it('clearInMemoryStediStore empties a shared store in place', async () => {
      const store = createInMemoryStediStore();
      const client = createInMemoryStediClient({ store });
      await client.provider.create(providerInput);

      clearInMemoryStediStore(store);

      expect((await client.provider.list()).items).toHaveLength(0);
    });
  });

  describe('payers', () => {
    it('get returns the seeded payers', async () => {
      const client = createInMemoryStediClient({ seedPayers });

      expect(await client.payers.get()).toEqual(seedPayers);
    });

    it('get returns generic default payers when none are seeded', async () => {
      const client = createInMemoryStediClient();

      const payers = await client.payers.get();
      expect(payers.length).toBeGreaterThan(0);
    });

    it('search filters by query', async () => {
      const client = createInMemoryStediClient({ seedPayers });

      const results = await client.payers.search({ query: 'blue' });
      expect(results).toHaveLength(1);
      expect(results[0]?.stediId).toBe('PAYER_BLUE');
    });

    it('search filters by eligibilityCheck', async () => {
      const client = createInMemoryStediClient({ seedPayers });

      const results = await client.payers.search({
        eligibilityCheck: 'NOT_SUPPORTED',
      });
      expect(results).toHaveLength(1);
      expect(results[0]?.stediId).toBe('PAYER_AETNA');
    });
  });

  describe('eligibility', () => {
    const eligibilityInput: StediEligibilityInput = {
      controlNumber: '123456789',
      provider: { npi: '1234567890', organizationName: 'Example Clinic' },
      tradingPartnerName: 'INMEMORY',
      tradingPartnerServiceId: 'INMEMORY001',
    };

    it('check returns what buildEligibilityResponse produces', async () => {
      const client = createInMemoryStediClient({
        buildEligibilityResponse: (input) => ({
          benefitsInformation: [{ code: '1', name: 'Active Coverage' }],
          controlNumber: input.controlNumber,
          eligibilitySearchId: 'custom-search-id',
          errors: [],
          meta: {
            applicationMode: 'test',
            outboundTraceId: 'trace',
            senderId: 'sender',
            submitterId: 'submitter',
            traceId: 'trace',
          },
          payer: { name: 'Custom Payer' },
          planDateInformation: {},
          planInformation: {},
          provider: {
            entityIdentifier: '',
            entityType: '',
            npi: input.provider.npi,
            providerName: input.provider.organizationName,
          },
          reassociationKey: 'custom-key',
          subscriber: {},
          tradingPartnerServiceId: input.tradingPartnerServiceId,
        }),
      });

      const result = await client.eligibility.check(eligibilityInput);

      expect(result.eligibilitySearchId).toBe('custom-search-id');
      expect(result.controlNumber).toBe(eligibilityInput.controlNumber);
      expect(result.payer.name).toBe('Custom Payer');
    });

    it('check returns a schema-valid default response', async () => {
      const client = createInMemoryStediClient();

      const result = await client.eligibility.check(eligibilityInput);

      expect(result.controlNumber).toBe(eligibilityInput.controlNumber);
      expect(result.benefitsInformation).toEqual([]);
      expect(result.provider.npi).toBe(eligibilityInput.provider.npi);
    });
  });

  describe('transactions', () => {
    it('list returns an empty page by default', async () => {
      const client = createInMemoryStediClient();

      expect(await client.transactions.list()).toEqual({ items: [] });
      expect(await client.transactions.search()).toEqual({ items: [] });
    });

    it('list / search return the injected page', async () => {
      const page = { items: [], nextPageToken: 'next' };
      const client = createInMemoryStediClient({
        buildTransactionPage: () => page,
      });

      expect(await client.transactions.list()).toEqual(page);
      expect(await client.transactions.search()).toEqual(page);
    });

    it('get throws a 404 StediApiError', async () => {
      const client = createInMemoryStediClient();

      await expect(client.transactions.get('txn-1')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('downloadFile', () => {
    it('returns a placeholder EDI string', async () => {
      const client = createInMemoryStediClient();

      const content = await client.downloadFile('https://stedi.com/file');
      expect(typeof content).toBe('string');
      expect(content).toContain('ISA*');
    });
  });

  describe('injected clock', () => {
    it('produces deterministic createdAt / updatedAt', async () => {
      const timestamp = '2020-01-01T00:00:00.000Z';
      const client = createInMemoryStediClient({ now: () => timestamp });

      const provider = await client.provider.create(providerInput);
      expect(provider.createdAt).toBe(timestamp);
      expect(provider.updatedAt).toBe(timestamp);

      const enrollment = await client.enrollment.create(enrollmentInput);
      expect(enrollment.createdAt).toBe(timestamp);
      expect(enrollment.updatedAt).toBe(timestamp);
    });
  });
});
