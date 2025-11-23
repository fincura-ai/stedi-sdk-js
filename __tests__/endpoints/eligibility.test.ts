import { eligibility } from '../../src/endpoints/eligibility.js';
import { type StediEligibilityInput } from '../../src/lib/types.js';

describe('eligibility', () => {
  const mockClient = {
    downloadFile: jest.fn(),
    request: jest.fn(),
  };

  const testBaseUrl = 'https://test-api.example.com';
  const eligibilityService = eligibility(mockClient, testBaseUrl);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should call the client with the correct parameters', async () => {
      // Mock implementation
      const mockResponse = { id: 'test-eligibility-id' };
      mockClient.request.mockResolvedValue(mockResponse);

      // Test input
      const input: StediEligibilityInput = {
        controlNumber: '123456',
        provider: {
          npi: '1234567866',
          organizationName: 'Test Provider',
        },
        subscriber: {
          dateOfBirth: '1990-01-01',
          firstName: 'John',
          lastName: 'Doe',
          memberId: 'MEM123456',
        },
        tradingPartnerName: 'Test Partner',
        tradingPartnerServiceId: 'TP123',
      };

      // Execute
      const result = await eligibilityService.check(input);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'POST',
        '/change/medicalnetwork/eligibility/v3',
        {
          data: {
            ...input,
            encounter: {
              serviceTypeCodes: [
                '27',
                '28',
                '30',
                '35',
                '36',
                '37',
                '38',
                '39',
                '40',
                '41',
              ],
            },
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
