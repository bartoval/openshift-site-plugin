import { MSG_TIMEOUT_ERROR } from '@config/config';
import axios, { AxiosError } from 'axios';

import { FetchWithOptions, HTTPError } from '../interfaces/REST.interfaces';

export function handleStatusError(e: AxiosError<{ message: string }>) {
  const error: HTTPError = { ...e };

  if (!e.response) {
    error.message = e.message || MSG_TIMEOUT_ERROR;
  }

  if (error.response?.status) {
    const {
      response: { status, statusText }
    } = error;

    error.message = `${status}: ${statusText}`;
    error.httpStatus = status.toString();
    error.descriptionMessage = e.response?.data.message;
  }

  return Promise.reject(error);
}

export async function axiosFetch<T = unknown>(url: string, options: FetchWithOptions = {}): Promise<T> {
  const response = await axios(url, {
    // avoid 403 error in openshift console
    xsrfCookieName: 'csrf-token',
    xsrfHeaderName: 'X-Csrftoken',
    validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
    ...options
  });

  return response.data;
}

axios.interceptors.response.use(
  (config) => config,
  (e) => handleStatusError(e)
);
