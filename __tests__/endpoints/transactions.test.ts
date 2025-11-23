import { transactions } from '../../src/endpoints/transactions.js';
import {
  type StediTransactionGetResponse,
  type StediTransactionListResponse,
} from '../../src/lib/types.js';

describe('transactions', () => {
  const mockClient = {
    downloadFile: jest.fn(),
    request: jest.fn(),
  };

  const testBaseUrl = 'https://test-api.example.com';
  const transactionsService = transactions(mockClient, testBaseUrl);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should call the client with the correct parameters for getting a single transaction', async () => {
      // Mock implementation
      const mockResponse: StediTransactionGetResponse = {
        artifacts: [
          {
            artifactType: 'application/edi-x12',
            model: 'transaction',
            sizeBytes: 1_024,
            url: 'https://api.stedi.com/files/2023/test.edi',
            usage: 'input',
          },
        ],
        direction: 'INBOUND',
        fileExecutionId: 'exec-123',
        mode: 'production',
        partnership: {
          partnershipId: 'partnership-123',
          partnershipType: 'x12',
          receiver: {
            profileId: 'receiver-123',
          },
          sender: {
            profileId: 'sender-123',
          },
        },
        processedAt: '2023-01-01T00:00:00Z',
        status: 'succeeded',
        transactionId: 'transaction-123',
      };
      mockClient.request.mockResolvedValue(mockResponse);

      const transactionId = 'transaction-123';

      // Execute
      const result = await transactionsService.get(transactionId);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        `/transactions/${transactionId}`,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('list', () => {
    it('should call the client with the correct parameters and no query params', async () => {
      // Mock implementation
      const mockResponse: StediTransactionListResponse = {
        items: [
          {
            artifacts: [
              {
                artifactType: 'application/edi-x12',
                model: 'transaction',
                sizeBytes: 1_024,
                url: 'https://api.stedi.com/files/2023/test.edi',
                usage: 'input',
              },
            ],
            direction: 'INBOUND',
            fileExecutionId: 'exec-123',
            mode: 'production',
            partnership: {
              partnershipId: 'partnership-123',
              partnershipType: 'x12',
              receiver: {
                profileId: 'receiver-123',
              },
              sender: {
                profileId: 'sender-123',
              },
            },
            processedAt: '2023-01-01T00:00:00Z',
            status: 'succeeded',
            transactionId: 'transaction-123',
          },
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Execute
      const result = await transactionsService.list();

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/transactions',
        {
          params: {},
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call the client with the correct parameters and query params', async () => {
      // Mock implementation
      const mockResponse: StediTransactionListResponse = {
        items: [
          {
            artifacts: [
              {
                artifactType: 'application/edi-x12',
                model: 'transaction',
                sizeBytes: 1_024,
                url: 'https://api.stedi.com/files/2023/test.edi',
                usage: 'input',
              },
            ],
            direction: 'INBOUND',
            fileExecutionId: 'exec-123',
            mode: 'production',
            partnership: {
              partnershipId: 'partnership-123',
              partnershipType: 'x12',
              receiver: {
                profileId: 'receiver-123',
              },
              sender: {
                profileId: 'sender-123',
              },
            },
            processedAt: '2023-01-01T00:00:00Z',
            status: 'succeeded',
            transactionId: 'transaction-123',
          },
        ],
      };
      mockClient.request.mockResolvedValue(mockResponse);

      // Test input
      const params = {
        pageSize: 10,
        pageToken: 'next-page-token',
      };

      // Execute
      const result = await transactionsService.list(params);

      // Verify
      expect(mockClient.request).toHaveBeenCalledWith(
        testBaseUrl,
        'GET',
        '/transactions',
        {
          params,
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
