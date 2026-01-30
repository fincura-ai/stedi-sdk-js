import axios, { AxiosError, type AxiosRequestConfig, type Method } from 'axios';

import { getLogger } from './logger.js';

/**
 * Create a client for the Stedi API.
 *
 * @returns The Stedi client.
 */
export const stediClient = (apiKey: string) => {
  const defaultHeaders = {
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
  };

  /**
   * Download a file from the Stedi API.
   *
   * @param url - The URL to download the file from.
   * @returns The file content.
   */
  const downloadFile = async (url: string): Promise<string> => {
    // Validate that the URL is from stedi.com or its subdomains
    const stediUrlRegex = /^https:\/\/(?:[\dA-Za-z-]+\.)*stedi\.com\/.*/u;
    if (!stediUrlRegex.test(url)) {
      throw new Error(
        'Invalid URL: The URL must be from the Stedi API (stedi.com or its subdomains)',
      );
    }

    try {
      const response = await axios.get(url, {
        ...defaultHeaders,
        responseType: 'arraybuffer',
      });
      // Convert buffer to string if it's a buffer
      if (Buffer.isBuffer(response.data)) {
        return response.data.toString('utf8');
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        delete error.config;
        delete error.request;
        delete error.response?.request;

        throw new Error(
          `Request to Stedi API failed: ${
            error.response?.data.message ||
            error.response?.data.detail ||
            error.message
          }`,
          { cause: error },
        );
      } else {
        throw error;
      }
    }
  };

  /**
   * Execute a request to the Stedi API.
   *
   * @param baseUrl - The base URL to use.
   * @param method - The HTTP method to use.
   * @param path - The path to request.
   * @param [config] - custom configuration for the request.
   * @returns The result of the request.
   */
  const request = async <T>(
    baseUrl: string,
    method: Method,
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const log = getLogger();

    try {
      log.debug('Stedi API request', { config, method, path });

      const response = await axios.request<T>({
        ...config,
        headers: {
          ...defaultHeaders.headers,
          ...config?.headers,
        },
        method,
        // Serialize arrays without brackets
        paramsSerializer: {
          indexes: null,
        },
        url: `${baseUrl}/${path.replace(/^\//u, '')}`,
      });

      log.debug('Stedi API response', {
        data: response.data,
        status: response.status,
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        delete error.config;
        delete error.request;
        delete error.response?.request;

        throw new Error(
          `Request to Stedi API failed: ${
            error.response?.data.message ||
            error.response?.data.detail ||
            error.message
          }`,
          { cause: error },
        );
      } else {
        throw error;
      }
    }
  };

  return {
    downloadFile,
    request,
  };
};

export type StediClient = ReturnType<typeof stediClient>;
