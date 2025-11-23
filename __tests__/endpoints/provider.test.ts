import { provider } from '../../src/endpoints/provider.js';
import { type StediProviderInput } from '../../src/lib/types.js';

describe('provider', () => {
  const mockClient = {
    downloadFile: jest.fn(),
    request: jest.fn(),
  };

  const testBaseUrl = 'https://test-api.example.com';
  const providerService = provider(mockClient, testBaseUrl);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should call the client with the correct parameters', async () => {
      // Mock implementation
      const mockResponse = { id: 'test-eligibility-id' };
      mockClient.request.mockResolvedValue(mockResponse);

      // Test input
      const input: StediProviderInput = {
        contacts: [
          {
            city: 'Testville',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '555-123-4567',
            state: 'TS',
            streetAddress1: '123 Test St',
            zipCode: '12345',
          },
        ],
        name: 'Test Provider',
        npi: '1234567866',
        taxId: '1234567866',
        taxIdType: 'EIN',
      };

      // Execute
      const result = await providerService.create(input);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'POST',
        '/providers',
        {
          data: input,
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
