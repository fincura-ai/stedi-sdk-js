import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { stediClient } from '../../src/lib/client.js';

// Mock dependencies
jest.mock('axios');
jest.mock('../../src/lib/logger', () => ({
  getLogger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

const testBaseUrl = 'https://test-api.example.com';

describe('stediClient', () => {
  const mockApiKey = 'test-api-key';
  let client: ReturnType<typeof stediClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = stediClient(mockApiKey);
  });

  describe('request', () => {
    it('should make a request with the correct parameters', async () => {
      // Mock implementation
      const mockResponse = { data: { result: 'success' } };
      (axios.request as jest.Mock).mockResolvedValue(mockResponse);

      // Execute
      const result = await client.request(testBaseUrl, 'GET', 'test-path', {
        data: { key: 'value' },
      });

      // Verify
      expect(axios.request).toHaveBeenCalledWith({
        data: { key: 'value' },
        headers: {
          Authorization: mockApiKey,
          'Content-Type': 'application/json',
        },
        method: 'GET',
        url: `${testBaseUrl}/test-path`,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle axios errors correctly', async () => {
      const mockError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        { headers: {} } as unknown as InternalAxiosRequestConfig,
        {},
        {
          config: { headers: {} } as unknown as InternalAxiosRequestConfig,
          data: {
            message: 'API error message',
          },
          headers: {},
          status: 400,
          statusText: 'Bad Request',
        },
      );
      mockError.isAxiosError = true;
      mockError.response = {
        config: { headers: {} } as unknown as InternalAxiosRequestConfig,
        data: {
          message: 'API error message',
        },
        headers: {},
        status: 400,
        statusText: 'Bad Request',
      };

      (axios.request as jest.Mock).mockRejectedValue(mockError);

      // Execute and verify
      await expect(
        client.request(testBaseUrl, 'GET', 'test-path'),
      ).rejects.toThrow('Request to Stedi API failed: API error message');
    });

    it('should handle non-axios errors by rethrowing them', async () => {
      // Mock implementation
      const mockError = new Error('Generic error');
      (axios.request as jest.Mock).mockRejectedValue(mockError);

      // Execute and verify
      await expect(
        client.request(testBaseUrl, 'GET', 'test-path'),
      ).rejects.toThrow(mockError);
    });
  });

  describe('downloadFile', () => {
    it('should download a file from a valid Stedi URL and convert buffer to string', async () => {
      // Mock implementation
      const mockFileContent = Buffer.from('test file content');
      (axios.get as jest.Mock).mockResolvedValue({ data: mockFileContent });

      // Execute
      const validUrl = 'https://api.stedi.com/files/2023/test.txt';
      const result = await client.downloadFile(validUrl);

      // Verify
      expect(axios.get).toHaveBeenCalledWith(validUrl, {
        headers: {
          Authorization: mockApiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      });
      // Verify buffer was converted to string
      expect(result).toEqual('test file content');
      expect(typeof result).toBe('string');
    });

    it('should return non-buffer data as-is', async () => {
      // Mock implementation with non-buffer data
      const mockJsonData = { key: 'value' };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockJsonData });

      // Execute
      const validUrl = 'https://api.stedi.com/files/2023/data.json';
      const result = await client.downloadFile(validUrl);

      // Verify
      expect(axios.get).toHaveBeenCalledWith(validUrl, {
        headers: {
          Authorization: mockApiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      });
      // Verify non-buffer data is returned as-is
      expect(result).toEqual(mockJsonData);
    });

    it('should download a file from a valid Stedi subdomain URL', async () => {
      // Mock implementation
      const mockFileContent = Buffer.from('test file content');
      (axios.get as jest.Mock).mockResolvedValue({ data: mockFileContent });

      // Execute
      const validSubdomainUrl = 'https://files.stedi.com/2023/test.txt';
      const result = await client.downloadFile(validSubdomainUrl);

      // Verify
      expect(axios.get).toHaveBeenCalledWith(validSubdomainUrl, {
        headers: {
          Authorization: mockApiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      });
      // Verify buffer was converted to string
      expect(result).toEqual('test file content');
      expect(typeof result).toBe('string');
    });

    it('should reject non-Stedi URLs', async () => {
      // Execute and verify
      const invalidUrl = 'https://example.com/files/test.txt';
      await expect(client.downloadFile(invalidUrl)).rejects.toThrow(
        'Invalid URL: The URL must be from the Stedi API (stedi.com or its subdomains)',
      );

      // Verify axios was not called
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should handle axios errors correctly', async () => {
      const mockError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        { headers: {} } as unknown as InternalAxiosRequestConfig,
        {},
        {
          config: { headers: {} } as unknown as InternalAxiosRequestConfig,
          data: {
            message: 'File not found',
          },
          headers: {},
          status: 404,
          statusText: 'Not Found',
        },
      );
      mockError.isAxiosError = true;
      mockError.response = {
        config: { headers: {} } as unknown as InternalAxiosRequestConfig,
        data: {
          message: 'File not found',
        },
        headers: {},
        status: 404,
        statusText: 'Not Found',
      };

      (axios.get as jest.Mock).mockRejectedValue(mockError);

      // Execute and verify
      const validUrl = 'https://api.stedi.com/files/2023/test.txt';
      await expect(client.downloadFile(validUrl)).rejects.toThrow(
        'Request to Stedi API failed: File not found',
      );
    });
  });
});
