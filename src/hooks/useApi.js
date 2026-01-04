import { useCallback, useMemo } from 'react';
import { useLoading } from '../LoadingContext';
import { createIPhoneSafeRequest, handleIPhoneError } from '../utils/iphoneFix';

export const useApi = () => {
  const { startLoading, stopLoading } = useLoading();

  const apiCall = useCallback(async (url, options = {}, loadingMessage = 'Loading...') => {
    try {
      startLoading(loadingMessage);

      const isLoginEndpoint =
        url.includes('/login') || url.includes('/instructor-login');

      // ✅ Get token(s) from storage (whatever you save after login)
      const fallbackToken =
        localStorage.getItem('fallbackToken') || localStorage.getItem('token');

      // ✅ Always build base headers
      const baseHeaders = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      // ✅ Attach Authorization if we have a token and caller didn't override it
      if (!isLoginEndpoint && fallbackToken && !baseHeaders.Authorization) {
        baseHeaders.Authorization = `Bearer ${fallbackToken}`;
      }

      // ✅ Always include cookies (important for Safari / iPhone)
      const baseOptions = {
        credentials: 'include',
        ...options,
        headers: baseHeaders,
      };

      // Use iphone-safe request for non-login endpoints
      const requestOptions = isLoginEndpoint
        ? baseOptions
        : (() => {
            const { options: iphoneOptions } = createIPhoneSafeRequest(url, baseOptions);
            // ensure our headers/credentials remain
            return {
              ...iphoneOptions,
              credentials: 'include',
              headers: baseHeaders,
            };
          })();

      const response = await fetch(url, requestOptions);

      // ✅ handle endpoints that might return empty body
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);

      const isLoginEndpoint =
        url.includes('/login') || url.includes('/instructor-login');

      // Retry logic (still OK)
      if (!isLoginEndpoint && handleIPhoneError(error)) {
        try {
          const fallbackToken =
            localStorage.getItem('fallbackToken') || localStorage.getItem('token');

          if (fallbackToken) {
            const retryOptions = {
              ...options,
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                Authorization: `Bearer ${fallbackToken}`,
              },
            };

            const retryResponse = await fetch(url, retryOptions);

            const retryText = await retryResponse.text();
            const retryData = retryText ? JSON.parse(retryText) : {};

            if (!retryResponse.ok) {
              throw new Error(retryData.message || 'Something went wrong');
            }

            return retryData;
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }

      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const get = useCallback((url, loadingMessage = 'Loading...') => {
    return apiCall(url, { method: 'GET' }, loadingMessage);
  }, [apiCall]);

  const post = useCallback((url, body, loadingMessage = 'Saving...') => {
    return apiCall(url, {
      method: 'POST',
      body: JSON.stringify(body),
    }, loadingMessage);
  }, [apiCall]);

  const put = useCallback((url, body, loadingMessage = 'Updating...') => {
    return apiCall(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    }, loadingMessage);
  }, [apiCall]);

  const patch = useCallback((url, body, loadingMessage = 'Updating...') => {
    return apiCall(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, loadingMessage);
  }, [apiCall]);

  const del = useCallback((url, loadingMessage = 'Deleting...') => {
    return apiCall(url, { method: 'DELETE' }, loadingMessage);
  }, [apiCall]);

  return useMemo(() => ({
    apiCall,
    get,
    post,
    put,
    patch,
    del,
  }), [apiCall, get, post, put, patch, del]);
};
