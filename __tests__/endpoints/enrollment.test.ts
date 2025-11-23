import { enrollment } from '../../src/endpoints/enrollment.js';
import { type StediEnrollmentInput } from '../../src/lib/types.js';

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

  describe('check', () => {
    it('should call the client with the correct parameters', async () => {
      // Mock implementation
      const mockResponse = { id: 'test-eligibility-id' };
      mockClient.request.mockResolvedValue(mockResponse);

      // Test input
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
});
