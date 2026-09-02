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

/**
 * Le projectId est un CUID (25 caracteres, commence par 'c'). En mode projet,
 * c'est le 1er segment de l'URL front.
 */
const PROJECT_ID_RE = /^c[a-z0-9]{24}$/;

function projectIdFromPath(): string | null {
  const segment = window.location.pathname.split('/')[1];
  return segment && PROJECT_ID_RE.test(segment) ? segment : null;
}



// Intercepteur REQUEST - Injection du Bearer token et du projet actif
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Le store est la source normale ; on retombe sur l'URL quand il est
    // momentanement vide — au remontage en StrictMode, le nettoyage du
    // ProjectScopeBinder l'efface juste avant qu'une requete reparte, et
    // l'appel partirait alors sans en-tete (400 PROJECT_IS_REQUIRED).
    const projectId =
      useMeStore.getState().getActiveProjectId() ?? projectIdFromPath();
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

    // Le garde de projet renvoie des 403 qui ne sont PAS des problemes de
    // session : projet indisponible ou non affecte. On les laisse remonter a
    // l'appelant, surtout pas de deconnexion.
    const prevRequest = error.config;
    const url: string = prevRequest?.url ?? '';

    /**
     * Routes d'authentification ou un 401 est une reponse metier, pas une
     * session morte : identifiants faux, jeton de lien invalide, mot de passe
     * re-saisi errone sur la demande de changement d'e-mail. Elles ne doivent
     * ni declencher de refresh, ni deconnecter.
     */
    const isAuthFlow =
      url.includes(AUTH_ROUTES.LOGIN) ||
      url.includes(AUTH_ROUTES.REFRESH) ||
      url.includes(AUTH_ROUTES.ACTIVATION_VALIDATE) ||
      url.includes(AUTH_ROUTES.ACTIVATION_COMPLETE) ||
      url.includes(AUTH_ROUTES.RESET_PASSWORD_REQUEST) ||
      url.includes(AUTH_ROUTES.RESET_PASSWORD_VALIDATE) ||
      url.includes(AUTH_ROUTES.RESET_PASSWORD_COMPLETE) ||
      url.includes(AUTH_ROUTES.EMAIL_CHANGE_REQUEST) ||
      url.includes(AUTH_ROUTES.EMAIL_CHANGE_CONFIRM);

    // Compte desactive en cours de session : on deconnecte. Mais PAS sur le
    // login : la, un 403 est la reponse metier « compte non actif », que le
    // formulaire doit afficher. Deconnecter y viderait la saisie et annoncerait
    // a tort une desactivation a un compte simplement pas encore active.
    if (
      status === 403 &&
      code === API_ERROR_CODE.ACCOUNT_NOT_ACTIVE &&
      !isAuthFlow
    ) {
      toast.error(API_ERROR.AUTH_ACCOUNT_NOT_ACTIVE);
      forceLogout('?reason=account_disabled');
      return new Promise(() => {});
    }

    if (status === 401 && !isAuthFlow) {
      // Deconnexion deja en cours : on laisse echouer sans rien redeclencher.
      if (loggingOut) return Promise.reject(error);

      // Contrat : seul TOKEN_EXPIRED se rejoue apres refresh. Tout autre 401
      // sur une route authentifiee est une session morte -> deconnexion.
      // Rafraichir sur n'importe quel 401 consommerait un refresh token pour
      // rien, et la rotation est a usage unique.
      const isExpired = code === API_ERROR_CODE.TOKEN_EXPIRED;

      if (!isExpired || prevRequest?.sent) {
        forceLogout();
        return new Promise(() => {});
      }

      // Ne rejoue cette requete qu'une seule fois.
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
    /**
     * 5xx : ecran d'erreur global — sauf si l'appelant a declare que le sien
     * est attendu.
     *
     * La consultation du registre officiel est le cas type : son `503`
     * (source indisponible) et son `504` (delai depasse) sont documentes
     * comme nominaux, et la reponse est de basculer en saisie manuelle. Sans
     * cette derogation, une panne d'une API publique tierce emmenait toute
     * l'application sur « Erreur interne du serveur », saisie perdue.
     */
    if (status >= 500 && !error.config?.expectedServerError) {
      useServerErrorStore.getState().setServerError(true);
    }

    // Reject the error if it was not handled above
    return Promise.reject(error);
  },
);

export default api;

declare module 'axios' {
  interface AxiosRequestConfig {
    /** L'appelant traite lui-meme les 5xx de cette requete : pas d'ecran
     *  d'erreur global. A reserver aux 5xx prevus par le contrat. */
    expectedServerError?: boolean;
  }
}
