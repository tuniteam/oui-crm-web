import api from '@/config/axiosInstance';
import { AUTH_ROUTES } from '../constants/routes.constants';
import type {
  EmailChangeRequestPayload,
  EmailChangeRequestResponse,
  EmailChangeConfirmPayload,
  EmailChangeConfirmResponse,
} from '../types/email-change';

export const emailChangeService = {
  /** Authenticated request to change the account email. JWT required. */
  requestChange: async (
    payload: EmailChangeRequestPayload,
  ): Promise<EmailChangeRequestResponse> => {
    const res = await api.post<EmailChangeRequestResponse>(
      AUTH_ROUTES.EMAIL_CHANGE_REQUEST,
      payload,
    );
    return res.data;
  },

  /** Public confirmation of the email change via the token from the email link. */
  confirmChange: async (
    payload: EmailChangeConfirmPayload,
  ): Promise<EmailChangeConfirmResponse> => {
    const res = await api.post<EmailChangeConfirmResponse>(
      AUTH_ROUTES.EMAIL_CHANGE_CONFIRM,
      payload,
    );
    return res.data;
  },
};
