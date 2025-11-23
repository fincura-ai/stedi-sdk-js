import { payers } from '../../src/endpoints/payers.js';

describe('payers', () => {
  const mockClient = {
    downloadFile: jest.fn(),
    request: jest.fn(),
  };

  const testBaseUrl = 'https://test-api.example.com';
  const payersService = payers(mockClient, testBaseUrl);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should call the client with the correct parameters', async () => {
      // Mock implementation
      const mockResponse = {
        items: [
          {
            aliases: ['Payer1', 'Alias1'],
            displayName: 'Test Payer',
            names: ['Test Payer Inc.'],
            primaryPayerId: 'PAY123',
            stediId: 'STEDI123',
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
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await payersService.get();

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/payers',
      );
      expect(result).toEqual(mockResponse.items);
    });
  });

  describe('search', () => {
    const mockPayerItem = {
      aliases: ['00710', '710', 'MIBCSI'],
      displayName: 'Blue Cross Blue Shield of Michigan',
      names: ['Blue Cross Blue Shield Michigan Professional'],
      primaryPayerId: '00710',
      stediId: 'KRPCH',
      transactionSupport: {
        claimPayment: 'ENROLLMENT_REQUIRED',
        claimStatus: 'SUPPORTED',
        coordinationOfBenefits: 'SUPPORTED',
        dentalClaimSubmission: 'NOT_SUPPORTED',
        eligibilityCheck: 'SUPPORTED',
        institutionalClaimSubmission: 'SUPPORTED',
        professionalClaimSubmission: 'SUPPORTED',
        unsolicitedClaimAttachment: 'NOT_SUPPORTED',
      },
    };

    it('should handle string parameters', async () => {
      const queryParameters = { query: 'Blue Cross' };
      const mockResponse = {
        items: [
          {
            payer: mockPayerItem,
            score: 11.279_371,
          },
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await payersService.search(queryParameters);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/payers/search',
        {
          params: queryParameters,
        },
      );
      expect(result).toEqual([mockPayerItem]);
    });

    it('should handle number parameters', async () => {
      const queryParameters = {
        pageSize: 10,
        pageToken: '123',
        query: 'Aetna',
      };
      const mockResponse = {
        items: [
          {
            payer: mockPayerItem,
            score: 8.5,
          },
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await payersService.search(queryParameters);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/payers/search',
        {
          params: queryParameters,
        },
      );
      expect(result).toEqual([mockPayerItem]);
    });

    it('should handle array of strings parameters', async () => {
      const queryParameters = {
        coverageTypes: ['medical', 'dental'],
      };
      const mockResponse = {
        items: [
          {
            payer: mockPayerItem,
            score: 7.8,
          },
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await payersService.search(queryParameters);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/payers/search',
        {
          params: queryParameters,
        },
      );
      expect(result).toEqual([mockPayerItem]);
    });

    it('should handle mixed parameter types', async () => {
      const queryParameters = {
        coverageTypes: ['medical'],
        eligibilityCheck: 'SUPPORTED',
        pageSize: 5,
        query: 'United Healthcare',
      };
      const mockResponse = {
        items: [
          {
            payer: mockPayerItem,
            score: 9.2,
          },
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await payersService.search(queryParameters);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/payers/search',
        {
          params: queryParameters,
        },
      );
      expect(result).toEqual([mockPayerItem]);
    });

    it('should handle empty search results', async () => {
      const queryParameters = { query: 'nonexistent payer' };
      const mockResponse = {
        items: [],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await payersService.search(queryParameters);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/payers/search',
        {
          params: queryParameters,
        },
      );
      expect(result).toEqual([]);
    });

    it('should handle multiple search results and map them correctly', async () => {
      const queryParameters = { query: 'Blue' };
      const mockPayer2 = {
        ...mockPayerItem,
        displayName: 'Blue Cross Blue Shield of Texas',
        primaryPayerId: '00282',
        stediId: 'HCVQT',
      };
      const mockResponse = {
        items: [
          {
            payer: mockPayerItem,
            score: 11.279_371,
          },
          {
            payer: mockPayer2,
            score: 10.5,
          },
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await payersService.search(queryParameters);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/payers/search',
        {
          params: queryParameters,
        },
      );
      expect(result).toEqual([mockPayerItem, mockPayer2]);
      expect(result).toHaveLength(2);
    });
  });
});
