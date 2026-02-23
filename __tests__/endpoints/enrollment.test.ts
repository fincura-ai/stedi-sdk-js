import { enrollment } from '../../src/endpoints/enrollment.js';
import {
  type StediEnrollmentInput,
  type StediListEnrollmentsParams,
} from '../../src/lib/types.js';

describe('enrollment', () => {
  const mockClient = {
    downloadFile: jest.fn(),
    request: jest.fn(),
  };

  const testBaseUrl = 'https://test-api.example.com';
  const enrollmentService = enrollment(mockClient, testBaseUrl);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an enrollment with individual contact', async () => {
      const mockResponse = { id: 'test-eligibility-id' };
      mockClient.request.mockResolvedValue(mockResponse);

      const input: StediEnrollmentInput = {
        payer: {
          idOrAlias: 'test-payer-id-or-alias',
        },
        primaryContact: {
          city: 'test-city',
          email: 'test-email',
          firstName: 'test-first-name',
          lastName: 'test-last-name',
          phone: 'test-phone',
          state: 'test-state',
          streetAddress1: 'test-street-address-1',
          zipCode: 'test-zip-code',
        },
        provider: {
          id: 'test-provider-id',
        },
        source: 'test-source',
        status: 'DRAFT',
        transactions: {
          claimPayment: {
            enroll: true,
          },
        },
        userEmail: 'test-user-email',
      };

      // Execute
      const result = await enrollmentService.create(input);

      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'POST',
        '/enrollments',
        {
          data: input,
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create an enrollment with organization contact', async () => {
      const mockResponse = { id: 'test-eligibility-id' };
      mockClient.request.mockResolvedValue(mockResponse);

      const input: StediEnrollmentInput = {
        payer: {
          idOrAlias: 'test-payer-id-or-alias',
        },
        primaryContact: {
          city: 'test-city',
          email: 'test-email',
          organizationName: 'Test Organization LLC',
          phone: 'test-phone',
          state: 'test-state',
          streetAddress1: 'test-street-address-1',
          zipCode: 'test-zip-code',
        },
        provider: {
          id: 'test-provider-id',
        },
        source: 'test-source',
        status: 'DRAFT',
        transactions: {
          claimPayment: {
            enroll: true,
          },
        },
        userEmail: 'test-user-email',
      };

      const result = await enrollmentService.create(input);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'POST',
        '/enrollments',
        {
          data: input,
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('get', () => {
    it('should call the client with the correct parameters', async () => {
      // Mock implementation
      const mockResponse = { id: 'test-enrollment-id' };
      mockClient.request.mockResolvedValue(mockResponse);

      // Test input
      const enrollmentId = 'test-enrollment-id';

      // Execute
      const result = await enrollmentService.get(enrollmentId);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        `/enrollments/${enrollmentId}`,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('list', () => {
    it('should call the client with no parameters when none provided', async () => {
      // Mock implementation
      const mockResponse = {
        items: [{ id: 'test-enrollment-id' }],
        nextPageToken: 'test-next-page-token',
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await enrollmentService.list();

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/enrollments',
        {
          params: {},
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call the client with the correct parameters', async () => {
      // Mock implementation
      const mockResponse = {
        items: [{ id: 'test-enrollment-id' }],
        nextPageToken: 'test-next-page-token',
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Test input
      const params: StediListEnrollmentsParams = {
        createdFrom: '2025-01-01T00:00:00Z',
        createdTo: '2025-12-31T23:59:59Z',
        filter: 'test-filter',
        importId: 'test-import-id',
        pageSize: 50,
        pageToken: 'test-page-token',
        payerIds: ['test-payer-id-1', 'test-payer-id-2'],
        providerNames: ['test-provider-name'],
        providerNpis: ['1234567890'],
        providerTaxIds: ['123456789'],
        sortBy: ['updatedAt:desc', 'id:asc'],
        sources: ['API', 'UI'],
        status: ['LIVE', 'SUBMITTED'],
        statusUpdatedFrom: '2025-01-01T00:00:00Z',
        statusUpdatedTo: '2025-12-31T23:59:59Z',
        transactions: ['eligibilityCheck', 'claimStatus'],
      };

      // Execute
      const result = await enrollmentService.list(params);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/enrollments',
        {
          params,
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
