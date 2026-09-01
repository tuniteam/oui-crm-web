import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AVATAR_EDIT_WINDOW } from '../constants/avatar-edit.constants';
import { profileService } from '../services/profile-service';
import type { AvatarEditErrors, DraftAvatarFile } from '../types/avatar';
import type { MyProfileResponse } from '../types/profile';

type UseAvatarEditOptions = {
  initialAvatarUrl: string | null;
  onClose: () => void;
};

export function useAvatarEdit({ initialAvatarUrl, onClose }: UseAvatarEditOptions) {
  const queryClient = useQueryClient();

  const [draftAvatarFile, setDraftAvatarFile] = useState<DraftAvatarFile | null>(null);
  const [draftDelete, setDraftDelete] = useState(false);
  const [errors, setErrors] = useState<AvatarEditErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Pending crop step (between file selection and draft acceptance)
  const [pendingCropSrc, setPendingCropSrc] = useState<string | null>(null);
  const [pendingCropFileName, setPendingCropFileName] = useState<string>('');

  const hasPendingChanges = draftAvatarFile !== null || draftDelete;
  const canSave =
    !isSaving &&
    (draftAvatarFile !== null ||
      (draftDelete && initialAvatarUrl !== null));

  const previewAvatarPath: string | null = draftDelete
    ? null
    : draftAvatarFile
      ? draftAvatarFile.previewUrl
      : initialAvatarUrl;

  const isPreviewBlob = draftAvatarFile !== null && !draftDelete;

  const validateAndSetFile = useCallback(
    (file: File) => {
      if (!AVATAR_EDIT_WINDOW.ACCEPTED_MIME_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          type: AVATAR_EDIT_WINDOW.ERRORS.INVALID_TYPE,
          size: undefined,
        }));
        return;
      }
      if (file.size > AVATAR_EDIT_WINDOW.MAX_FILE_SIZE_BYTES) {
        setErrors((prev) => ({
          ...prev,
          size: AVATAR_EDIT_WINDOW.ERRORS.FILE_TOO_LARGE,
          type: undefined,
        }));
        return;
      }

      // Revoke any previous pending crop blob URL
      if (pendingCropSrc) {
        URL.revokeObjectURL(pendingCropSrc);
      }

      setPendingCropSrc(URL.createObjectURL(file));
      setPendingCropFileName(file.name);
      setErrors({});
    },
    [pendingCropSrc],
  );

  const confirmCrop = useCallback(
    (croppedFile: File) => {
      // Revoke previous draft preview to avoid leaks (latent bug fix)
      if (draftAvatarFile) {
        URL.revokeObjectURL(draftAvatarFile.previewUrl);
      }

      const previewUrl = URL.createObjectURL(croppedFile);
      setDraftAvatarFile({ file: croppedFile, previewUrl });
      setDraftDelete(false);

      if (pendingCropSrc) {
        URL.revokeObjectURL(pendingCropSrc);
      }
      setPendingCropSrc(null);
      setPendingCropFileName('');
    },
    [draftAvatarFile, pendingCropSrc],
  );

  const cancelCrop = useCallback(() => {
    if (pendingCropSrc) {
      URL.revokeObjectURL(pendingCropSrc);
    }
    setPendingCropSrc(null);
    setPendingCropFileName('');
  }, [pendingCropSrc]);

  const handleDelete = useCallback(() => {
    if (draftAvatarFile) {
      URL.revokeObjectURL(draftAvatarFile.previewUrl);
    }
    setDraftAvatarFile(null);
    setDraftDelete(true);
    setErrors({});
  }, [draftAvatarFile]);

  const handleCancel = useCallback(() => {
    if (draftAvatarFile) {
      URL.revokeObjectURL(draftAvatarFile.previewUrl);
    }
    if (pendingCropSrc) {
      URL.revokeObjectURL(pendingCropSrc);
    }
    setDraftAvatarFile(null);
    setDraftDelete(false);
    setPendingCropSrc(null);
    setPendingCropFileName('');
    setErrors({});
    setIsSaving(false);
    onClose();
  }, [draftAvatarFile, pendingCropSrc, onClose]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;

    setIsSaving(true);
    setErrors((prev) => ({ ...prev, save: undefined }));

    try {
      let nextAvatarUrl: string | null = null;
      if (draftAvatarFile) {
        const response = await profileService.uploadAvatar(draftAvatarFile.file);
        nextAvatarUrl = response.avatarUrl;
        toast.success(AVATAR_EDIT_WINDOW.TOASTS.UPLOAD_SUCCESS);
      } else if (draftDelete && initialAvatarUrl) {
        await profileService.deleteAvatar();
        toast.success(AVATAR_EDIT_WINDOW.TOASTS.DELETE_SUCCESS);
      }

      queryClient.setQueryData<MyProfileResponse>(['my-profile'], (old) =>
        old ? { ...old, avatarUrl: nextAvatarUrl } : old,
      );

      if (draftAvatarFile) {
        URL.revokeObjectURL(draftAvatarFile.previewUrl);
      }
      setDraftAvatarFile(null);
      setDraftDelete(false);
      setErrors({});
      onClose();
    } catch {
      setErrors((prev) => ({ ...prev, save: AVATAR_EDIT_WINDOW.ERRORS.SAVE_FAILED }));
    } finally {
      setIsSaving(false);
    }
  }, [canSave, draftAvatarFile, draftDelete, initialAvatarUrl, queryClient, onClose]);

  const resetState = useCallback(() => {
    if (draftAvatarFile) {
      URL.revokeObjectURL(draftAvatarFile.previewUrl);
    }
    if (pendingCropSrc) {
      URL.revokeObjectURL(pendingCropSrc);
    }
    setDraftAvatarFile(null);
    setDraftDelete(false);
    setPendingCropSrc(null);
    setPendingCropFileName('');
    setErrors({});
    setIsSaving(false);
  }, [draftAvatarFile, pendingCropSrc]);

  return {
    draftAvatarFile,
    draftDelete,
    errors,
    isSaving,
    hasPendingChanges,
    canSave,
    previewAvatarPath,
    isPreviewBlob,
    pendingCropSrc,
    pendingCropFileName,
    validateAndSetFile,
    confirmCrop,
    cancelCrop,
    handleDelete,
    handleCancel,
    handleSave,
    resetState,
  };
}

export type AvatarEditHooks = ReturnType<typeof useAvatarEdit>;
