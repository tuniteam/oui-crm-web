import { useServerErrorStore } from '@/contexts/useServerErrorStore';
import { AUTH } from '@/features/auth/constants/auth.constants';
import { AUTH_ROUTES } from '@/features/auth/constants/routes.constants';
import { authService } from '@/features/auth/services/auth.service';
import { tokenService } from '@/features/auth/services/token.service';
import { API_ERROR } from '@/shared/constants/api-errors';
import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // <-- injection directe depuis .env
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Intercepteur REQUEST - Injection du Bearer token
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
let refreshPromise: Promise<void> | null = null;
// Intercepteur RESPONSE - Gestion des erreurs
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const code = error?.response?.data?.messages?.code;

    if (status === 403 && code === 'USER_SHOULD_BE_ACTIVE') {
      tokenService.clearTokens();
      toast.error(API_ERROR.USER_SHOULD_BE_ACTIVE);
      window.location.href = `${AUTH_ROUTES.LOGIN}?reason=account_disabled`;
      return new Promise(() => {});
    }
    // The original request that failed
    const prevRequest = error.config;
    // Check if the request was a login call
    const isLogin = prevRequest?.url?.includes(AUTH_ROUTES.LOGIN);
    // Check if the request was a refresh token call
    const isRefresh = prevRequest?.url?.includes(AUTH_ROUTES.REFRESH);
    // If the access token is invalid/expired (401)
    // and we are NOT already retrying
    // and this is NOT a login or refresh request

    const isActivationValidate = prevRequest?.url?.includes(
      AUTH_ROUTES.ACTIVATION_VALIDATE,
    );
    const isActivationComplete = prevRequest?.url?.includes(
      AUTH_ROUTES.ACTIVATION_COMPLETE,
    );
    const isResetPasswordFlow = prevRequest?.url?.includes(
      '/password-reset',
    );
    const isEmailChangeFlow = prevRequest?.url?.includes(
      '/auth/email-change',
    );
    const isActivationFlow = isActivationValidate || isActivationComplete;

    if (
      status === 401 &&
      !prevRequest?.sent &&
      !isLogin &&
      !isRefresh &&
      !isActivationFlow &&
      !isResetPasswordFlow &&
      !isEmailChangeFlow

    ) {
      // Mark the request as already retried
      prevRequest.sent = true;
      try {
        // If no refresh is running, start one
        // Otherwise, wait for the existing refresh
        refreshPromise ??= authService.refresh().finally(() => {
          refreshPromise = null;
        });
        // Wait until the token is refreshed
        await refreshPromise;
        // Get the new access token
        const newToken = tokenService.getAccessToken();
        if (!newToken) {
          throw new Error(AUTH.ERRORS.NO_ACCESS_TOKEN);
        }
        // Attach the new token to the original request
        prevRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request with the new token
        return api(prevRequest);
      } catch {
        // If refresh fails, log the user out
        tokenService.clearTokens();
        window.location.href = AUTH_ROUTES.LOGIN;
      }
    }
    // If the server returns an error (500+),
    // show a global server error state
    if (status >= 500) {
      useServerErrorStore.getState().setServerError(true);
    }

    // Reject the error if it was not handled above
    return Promise.reject(error);
  },
);

export default api;
