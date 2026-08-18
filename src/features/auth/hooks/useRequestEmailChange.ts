import { useMutation } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/utils/api-error';
import { emailChangeService } from '../services/email-change.service';
import type {
  EmailChangeRequestPayload,
  EmailChangeRequestResponse,
} from '../types/email-change';

type RequestResult =
  | { ok: true }
  | { ok: false; code: string | null };

export function useRequestEmailChange() {
  const mutation = useMutation<
    EmailChangeRequestResponse,
    unknown,
    EmailChangeRequestPayload
  >({
    mutationFn: (payload) => emailChangeService.requestChange(payload),
  });

  return {
    loading: mutation.isPending,
    request: async (
      payload: EmailChangeRequestPayload,
    ): Promise<RequestResult> => {
      try {
        await mutation.mutateAsync(payload);
        return { ok: true };
      } catch (err) {
        return { ok: false, code: getApiErrorCode(err) };
      }
    },
  };
}
