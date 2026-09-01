import api from '@/config/axiosInstance';
import { API_ERROR_CODE } from '@/shared/constants/api-errors';
import {
  getApiErrorCode,
  getApiErrorDetails,
  getApiErrorMessage,
} from '@/shared/utils/api-error';
import { SETTINGS_API } from '../constants/routes.constants';
import { TemplateInvalidError } from '../errors/TemplateInvalidError';
import type {
  SettingsDocumentsResponse,
  TemplateType,
  UploadSignatureResponse,
  UploadTemplateResponse,
} from '../types/documents';
import type { FileDownloadUrl } from '../types/documents';

/** Le serveur n'accepte qu'un champ multipart nomme `file`. */
const FILE_FIELD = 'file';

function toFormData(file: File): FormData {
  const form = new FormData();
  form.append(FILE_FIELD, file);
  return form;
}

export const documentsService = {
  get: async (): Promise<SettingsDocumentsResponse> => {
    try {
      const res = await api.get<SettingsDocumentsResponse>(
        SETTINGS_API.DOCUMENTS,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  uploadTemplate: async (
    type: TemplateType,
    file: File,
  ): Promise<UploadTemplateResponse> => {
    try {
      const res = await api.post<UploadTemplateResponse>(
        `${SETTINGS_API.DOCUMENTS}/${type}`,
        toFormData(file),
      );
      return res.data;
    } catch (err) {
      // TEMPLATE_INVALID porte la liste des balises manquantes : on la
      // remonte telle quelle, c'est la seule information actionnable.
      if (getApiErrorCode(err) === API_ERROR_CODE.TEMPLATE_INVALID) {
        throw new TemplateInvalidError(
          getApiErrorMessage(err),
          getApiErrorDetails(err) ?? [],
        );
      }
      throw new Error(getApiErrorMessage(err));
    }
  },

  /** Une seule image par projet : le depot remplace la precedente. */
  uploadSignature: async (file: File): Promise<UploadSignatureResponse> => {
    try {
      const res = await api.post<UploadSignatureResponse>(
        SETTINGS_API.SIGNATURE_IMAGE,
        toFormData(file),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /**
   * Resout l'URL presignee d'un fichier stocke.
   *
   * La route renvoie `{ url, expiresAt }` en JSON, pas le fichier : on ne peut
   * donc pas pointer un `href` ou un `src` dessus. Elle exige de surcroit le
   * jeton et l'en-tete de projet, que seul l'intercepteur pose.
   */
  getDownloadUrl: async (fileId: string): Promise<FileDownloadUrl> => {
    try {
      const res = await api.get<FileDownloadUrl>(
        SETTINGS_API.FILE_DOWNLOAD(fileId),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
