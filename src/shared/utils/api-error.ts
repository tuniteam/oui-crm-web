import { AxiosError } from "axios";
import { API_ERROR, ApiErrorCode } from "../constants/api-errors";

/**
 * Enveloppe d'erreur de l'API (contrat SPEC-07 §0). Definition unique : les
 * features doivent l'importer, jamais la redeclarer.
 *
 * Attention aux deux pieges du contrat :
 *  - le texte est dans `text`, PAS dans `message` ;
 *  - `statusCode` est une chaine, et vit dans `messages`, pas a la racine.
 *
 * `meta` transporte les valeurs structurees accompagnant l'erreur (ex.
 * `lockedUntil` sur un 423). Il est absent quand il n'y a rien a transporter :
 * toujours le lire en optionnel.
 */
export type ApiErrorEnvelope = {
  messages?: {
    statusCode?: string;
    code?: string;
    text?: string;
    level?: string;
    details?: string[];
    meta?: {
      /** Fin du verrouillage, ISO 8601 UTC (423 AUTH_ACCOUNT_LOCKED). */
      lockedUntil?: string;
      /**
       * Fiches candidates sur `409 ORGANIZATION_POSSIBLE_DUPLICATE`.
       * Le contrat les place ici et non dans `details` : ce sont des donnees,
       * pas des phrases.
       */
      duplicates?: { id: string; name: string; city: string | null }[];
      [key: string]: unknown;
    };
  };
};

export function getApiErrorCode(err: unknown): string | null {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const ax = err as AxiosError<ApiErrorEnvelope>;
    return ax.response?.data?.messages?.code ?? null;
  }
  return null;
}

export function getApiErrorDetails(err: unknown): string[] | null {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const ax = err as AxiosError<ApiErrorEnvelope>;
    const details = ax.response?.data?.messages?.details;
    return details && details.length > 0 ? details : null;
  }
  return null;
}

/**
 * Valeurs structurees accompagnant l'erreur.
 *
 * `messages.text` est humain et peut changer ; `messages.details` est une liste
 * de lignes lisibles. Tout ce qui doit etre *exploite* passe par `meta` :
 * `lockedUntil` sur un compte verrouille, `duplicates` sur un doublon
 * d'organisme. Les lire ici plutot que de parser un message.
 */
export function getApiErrorMeta(err: unknown): Record<string, unknown> | null {
  if (err && typeof err === 'object' && 'isAxiosError' in err) {
    const ax = err as AxiosError<ApiErrorEnvelope>;
    return ax.response?.data?.messages?.meta ?? null;
  }
  return null;
}

export function getApiErrorMessage(err: unknown): string {
  // Axios error
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const ax = err as AxiosError<ApiErrorEnvelope>;
    const m = ax.response?.data?.messages;

    const code = m?.code;
    if (code && code in API_ERROR) {
      const base = API_ERROR[code as ApiErrorCode];
      const details = m?.details;
      if (details && details.length > 0) {
        const trimmed = base.endsWith('.') ? base.slice(0, -1) : base;
        return `${trimmed} : ${details.join(', ')}`;
      }
      return base;
    }
    // fallback
    return API_ERROR.UNKNOWN_ERROR;
  }

  // Error classique
  if (err instanceof Error) return err.message;
  return API_ERROR.UNKNOWN_ERROR;

}

/**
 * Variante pour les requêtes `responseType: 'blob'` : en cas d'erreur, le corps
 * 4xx arrive sous forme de Blob JSON. On le lit, on en extrait le code et on
 * mappe le message FR. Fallback sur getApiErrorMessage.
 */
export async function getBlobApiErrorMessage(err: unknown): Promise<string> {
  if (err && typeof err === 'object' && 'isAxiosError' in err) {
    const data = (err as AxiosError).response?.data;
    if (data instanceof Blob) {
      try {
        const parsed = JSON.parse(await data.text()) as ApiErrorEnvelope;
        const code = parsed?.messages?.code;
        if (code && code in API_ERROR) return API_ERROR[code as ApiErrorCode];
      } catch {
        // corps non-JSON : on retombe sur le message générique
      }
      return API_ERROR.UNKNOWN_ERROR;
    }
  }
  return getApiErrorMessage(err);
}

/**
 * Variante « riche » pour les requêtes `responseType: 'blob'` : renvoie le code
 * d'erreur + le message FR mappé + les détails éventuels. Utile quand l'UI doit
 * réagir au code (ex. bandeau spécifique) et pas seulement afficher un message.
 */
export async function getBlobApiError(
  err: unknown,
): Promise<{ code: string | null; message: string; details: string[] | null }> {
  if (err && typeof err === 'object' && 'isAxiosError' in err) {
    const data = (err as AxiosError).response?.data;
    if (data instanceof Blob) {
      try {
        const parsed = JSON.parse(await data.text()) as ApiErrorEnvelope;
        const code = parsed?.messages?.code ?? null;
        const rawDetails = parsed?.messages?.details;
        const details = rawDetails && rawDetails.length > 0 ? rawDetails : null;
        const message =
          code && code in API_ERROR
            ? API_ERROR[code as ApiErrorCode]
            : API_ERROR.UNKNOWN_ERROR;
        return { code, message, details };
      } catch {
        return { code: null, message: API_ERROR.UNKNOWN_ERROR, details: null };
      }
    }
  }
  return {
    code: getApiErrorCode(err),
    message: getApiErrorMessage(err),
    details: getApiErrorDetails(err),
  };
}
