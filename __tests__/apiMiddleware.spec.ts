import axios, { AxiosError, AxiosResponse } from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { axiosFetch, handleStatusError } from '../src/console/API/apiMiddleware';
import { MSG_TIMEOUT_ERROR } from '../src/console/config/config';
import { HTTPError } from '../src/console/interfaces/REST.interfaces';

vi.mock('axios');
const mockAxios = vi.mocked(axios);

describe('apiMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('axiosFetch', () => {
    it('makes request with default options', async () => {
      mockAxios.mockResolvedValue({ data: { test: true } });

      await axiosFetch('test-url');

      expect(mockAxios).toHaveBeenCalledWith('test-url', {
        xsrfCookieName: 'csrf-token',
        xsrfHeaderName: 'X-Csrftoken',
        validateStatus: expect.any(Function)
      });
    });

    it('handles network errors', async () => {
      const error = new Error('Network Error');
      mockAxios.mockRejectedValue(error);

      await expect(axiosFetch('test-url')).rejects.toEqual(
        expect.objectContaining({
          message: 'Network Error'
        })
      );
    });

    it('handles exception errors', async () => {
      const error = new Error();
      mockAxios.mockRejectedValue(error);

      await expect(axiosFetch('test-url')).rejects.toEqual(
        expect.objectContaining({
          message: ''
        })
      );
    });

    it('handles HTTP errors', async () => {
      const error = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: { message: 'Access denied' }
        }
      };
      mockAxios.mockRejectedValue(error);

      await expect(axiosFetch('test-url')).rejects.toEqual(
        expect.objectContaining({
          response: {
            data: {
              message: 'Access denied'
            },
            status: 403,
            statusText: 'Forbidden'
          }
        })
      );
    });
  });

  describe('handleStatusError', () => {
    it('handles error without response', async () => {
      const error = new AxiosError() as AxiosError<{ message: string }>;
      error.message = 'Network Error';
      error.response = undefined;

      try {
        await handleStatusError(error);
      } catch (err) {
        const typedError = err as AxiosError<{ message: string }>;
        expect(typedError.message).toBe('Network Error');
      }
    });

    it('uses timeout message when no error message', async () => {
      const error = new AxiosError() as AxiosError<{ message: string }>;
      error.response = undefined;
      error.message = '';

      try {
        await handleStatusError(error);
      } catch (err) {
        const typedError = err as AxiosError<{ message: string }>;
        expect(typedError.message).toBe(MSG_TIMEOUT_ERROR);
      }
    });

    it('handles error with HTTP status', async () => {
      const error = new AxiosError() as AxiosError<{ message: string }>;
      error.response = {
        status: 403,
        statusText: 'Forbidden',
        data: {
          message: 'Access denied'
        },
        headers: {},
        config: {}
      } as AxiosResponse;

      try {
        await handleStatusError(error);
      } catch (err) {
        const typedError = err as HTTPError;
        expect(typedError.message).toBe('403: Forbidden');
        expect(typedError.httpStatus).toBe('403');
        expect(typedError.descriptionMessage).toBe('Access denied');
      }
    });
  });
});
