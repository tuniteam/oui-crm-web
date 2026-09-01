import { useCallback, useRef, useState } from 'react';
import { ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImageCropDialog } from '@/components/shared/ImageCropDialog';
import { AVATAR_EDIT_WINDOW } from '../../constants/avatar-edit.constants';
import type { AvatarEditHooks } from '../../hooks/useAvatarEdit';
import { getAuthentictedUserInitials } from '../../utils/profile.utils';
import { ProfileAvatar } from '../ProfileAvatar';

type Props = {
  hooks: AvatarEditHooks;
  firstName?: string | null;
  lastName?: string | null;
};

export function AvatarEditBody({ hooks, firstName, lastName }: Props) {
  const {
    previewAvatarPath,
    isPreviewBlob,
    errors,
    isSaving,
    handleDelete,
    validateAndSetFile,
    draftDelete,
    hasPendingChanges,
    pendingCropSrc,
    pendingCropFileName,
    confirmCrop,
    cancelCrop,
  } = hooks;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const initials = getAuthentictedUserInitials(firstName, lastName);
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || initials;

  const currentAvatarUrl =
    !draftDelete && previewAvatarPath !== null && !isPreviewBlob
      ? previewAvatarPath
      : null;

  const hasCurrentAvatar = !draftDelete && previewAvatarPath !== null;

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        validateAndSetFile(file);
      }
    },
    [validateAndSetFile],
  );

  const hasValidationError = !!(errors.type || errors.size);

  return (
    <div className="space-y-6 ">
      {/* Current photo + upload area row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        {/* Left: current photo preview */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {AVATAR_EDIT_WINDOW.LABELS.CURRENT_PHOTO}
          </span>
          {isPreviewBlob && previewAvatarPath ? (
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-border shadow-sm">
              <img
                src={previewAvatarPath}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <ProfileAvatar
              avatarUrl={currentAvatarUrl}
              initials={initials}
              fullName={fullName}
              className="h-32 w-32 rounded-full border border-border shadow-sm"
              fallbackClassName="text-3xl font-semibold text-muted-foreground"
            />
          )}
          {/* Hints */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 shrink-0" />
              {AVATAR_EDIT_WINDOW.HINTS.FORMATS}
            </div>
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 shrink-0" />
              {AVATAR_EDIT_WINDOW.HINTS.MAX_SIZE}
            </div>
          </div>
          {hasPendingChanges && (
            <span className="text-xs text-muted-foreground italic">
              {AVATAR_EDIT_WINDOW.LABELS.PREVIEW}
            </span>
          )}
        </div>

        {/* Right: drag & drop upload zone */}
        <div className="flex flex-col gap-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors',
              isDragOver
                ? 'border-primary bg-primary/5'
                : hasValidationError
                  ? 'border-destructive bg-destructive/5'
                  : 'border-border bg-muted/30 hover:bg-muted/50',
            )}
            onClick={handleBrowseClick}
            role="button"
            tabIndex={0}
            aria-label="Zone de dépôt de fichier"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleBrowseClick();
            }}
          >
            <UploadCloud
              className={cn(
                'h-8 w-8',
                isDragOver ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <span className="text-sm text-muted-foreground">
              {AVATAR_EDIT_WINDOW.LABELS.DROP_AREA}
            </span>
            <span className="text-xs text-muted-foreground">
              {AVATAR_EDIT_WINDOW.LABELS.DROP_AREA_OR}
            </span>
            <Button
              type="button"
              variant="mono"
              size="sm"
              disabled={isSaving}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              {AVATAR_EDIT_WINDOW.BUTTONS.BROWSE}
            </Button>
          </div>

          {/* Validation errors */}
          {hasValidationError && (
            <p className="text-sm text-destructive">
              {errors.type ?? errors.size}
            </p>
          )}
        </div>
      </div>

      {/* Delete section — only show when there is an avatar to delete */}
      {hasCurrentAvatar && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">
            {AVATAR_EDIT_WINDOW.LABELS.DELETE_SECTION}
          </p>
          <p className="text-sm text-muted-foreground">
            {AVATAR_EDIT_WINDOW.LABELS.DELETE_DESCRIPTION}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={handleDelete}
            aria-label="Supprimer la photo de profil"
            className="border-destructive text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {AVATAR_EDIT_WINDOW.BUTTONS.DELETE}
          </Button>
        </div>
      )}

      {/* Save error */}
      {errors.save && <p className="text-sm text-destructive">{errors.save}</p>}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={AVATAR_EDIT_WINDOW.ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleFileChange}
        disabled={isSaving}
      />

      {/* Crop dialog */}
      <ImageCropDialog
        open={!!pendingCropSrc}
        imageSrc={pendingCropSrc}
        fileName={pendingCropFileName}
        outputSize={AVATAR_EDIT_WINDOW.OUTPUT_SIZE_PX}
        quality={AVATAR_EDIT_WINDOW.OUTPUT_QUALITY}
        title={AVATAR_EDIT_WINDOW.CROP.TITLE}
        description={AVATAR_EDIT_WINDOW.CROP.DESCRIPTION}
        onConfirm={confirmCrop}
        onCancel={cancelCrop}
      />
    </div>
  );
}
