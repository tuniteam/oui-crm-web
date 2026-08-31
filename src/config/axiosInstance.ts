import { useMeStore } from '@/contexts/useMeStore';
import { useServerErrorStore } from '@/contexts/useServerErrorStore';
import { AUTH } from '@/features/auth/constants/auth.constants';
import { AUTH_ROUTES } from '@/features/auth/constants/routes.constants';
import { authService } from '@/features/auth/services/auth.service';
import { tokenService } from '@/features/auth/services/token.service';
import { API_ERROR, API_ERROR_CODE } from '@/shared/constants/api-errors';
import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // <-- injection directe depuis .env
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


/**
 * En-tete de portee multi-tenant. Le projet ne transite jamais par l'URL :
 * l'API le lit uniquement ici. Les routes non scopees l'ignorent, on peut donc
 * l'envoyer systematiquement des qu'un projet est actif.
 */
const PROJECT_HEADER = 'x-project-id';

// Intercepteur REQUEST - Injection du Bearer token et du projet actif
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const projectId = useMeStore.getState().getActiveProjectId();
    if (projectId) {
      config.headers[PROJECT_HEADER] = projectId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
let refreshPromise: Promise<void> | null = null;

// Déconnexion unique : une fois déclenchée, on ne relance ni refresh ni
// redirection. Sans ce garde-fou, plusieurs 401 simultanés provoquent autant de
// redirections vers le login (boucle login -> 429 -> bannissement IP).
let loggingOut = false;

function forceLogout(redirectSuffix = ''): void {
  if (loggingOut) return;
  loggingOut = true;
  tokenService.clearTokens();
  window.location.href = `${AUTH_ROUTES.LOGIN}${redirectSuffix}`;
}
// Intercepteur RESPONSE - Gestion des erreurs
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const code = error?.response?.data?.messages?.code;

    if (status === 403 && code === API_ERROR_CODE.ACCOUNT_NOT_ACTIVE) {
      toast.error(API_ERROR.AUTH_ACCOUNT_NOT_ACTIVE);
      forceLogout('?reason=account_disabled');
      return new Promise(() => {});
    }
    // Le garde de projet renvoie des 403 qui ne sont PAS des problemes de
    // session : projet indisponible ou non affecte. On les laisse remonter a
    // l'appelant, surtout pas de deconnexion.
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
      // Déconnexion déjà en cours : on laisse la requête échouer sans
      // redéclencher un refresh ni une seconde redirection.
      if (loggingOut) return Promise.reject(error);

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
        // Refresh échoué -> déconnexion unique. On retourne une promesse qui ne
        // se résout jamais : sinon l'intercepteur renverrait `undefined` au
        // code appelant, qui planterait avant que la redirection n'aboutisse.
        forceLogout();
        return new Promise(() => {});
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
