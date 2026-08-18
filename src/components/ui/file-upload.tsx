import { useCallback, useRef, useState } from 'react';
import { formatFileSize } from '@/shared/utils/string-utils';
import { FileIcon, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ── Constants ──

const FILE_UPLOAD_LABELS = {
  DROP_AREA: 'Glisser-déposer',
  DROP_AREA_OR: 'ou',
  BROWSE: 'Parcourir...',
  DROP_AREA_ARIA: 'Zone de dépôt de fichier',
} as const;

// ── Types ──

type FileUploadProps = {
  /** Accepted file extensions, e.g. ".pdf,.jpg,.jpeg,.png" */
  accept: string;
  /** Accepted MIME types for validation, e.g. ["application/pdf", "image/jpeg", "image/png"] */
  acceptedMimeTypes: readonly string[];
  /** Max file size in bytes */
  maxSizeBytes: number;
  /** Called when a valid file is selected */
  onFileSelected: (file: File) => void;
  /** Called when the selected file is removed */
  onFileRemoved?: () => void;
  /** Currently selected file info (controlled) */
  currentFile?: { name: string; size: number } | null;
  /** Disable the component */
  disabled?: boolean;
  /** External error message (e.g. from server) */
  error?: string | null;
  /** Hint text below the drop zone (e.g. "Formats acceptés : PDF, JPG, PNG") */
  hint?: string;
  /** Error message for invalid MIME type */
  errorInvalidType?: string;
  /** Error message for file too large */
  errorTooLarge?: string;
};

// ── Component ──

export function FileUpload({
  accept,
  acceptedMimeTypes,
  maxSizeBytes,
  onFileSelected,
  onFileRemoved,
  currentFile,
  disabled = false,
  error: externalError,
  hint,
  errorInvalidType,
  errorTooLarge,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const displayError = externalError ?? validationError;

  const validateAndSelect = useCallback(
    (file: File) => {
      if (!acceptedMimeTypes.includes(file.type)) {
        setValidationError(errorInvalidType ?? null);
        return;
      }
      if (file.size > maxSizeBytes) {
        setValidationError(errorTooLarge ?? null);
        return;
      }
      setValidationError(null);
      onFileSelected(file);
    },
    [
      acceptedMimeTypes,
      maxSizeBytes,
      errorInvalidType,
      errorTooLarge,
      onFileSelected,
    ],
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
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
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  const handleRemove = () => {
    setValidationError(null);
    onFileRemoved?.();
  };

  // ── File selected → show file row ──

  if (currentFile) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(currentFile.size)}
            </p>
          </div>
          {!disabled && onFileRemoved && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {displayError && (
          <p className="text-sm text-destructive">{displayError}</p>
        )}
      </div>
    );
  }

  // ── No file → show drop zone ──

  return (
    <div className="space-y-1">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-3 transition-colors',
          disabled && 'pointer-events-none opacity-50',
          isDragOver
            ? 'border-primary bg-primary/5'
            : displayError
              ? 'border-destructive bg-destructive/5'
              : 'border-border bg-muted/30 hover:bg-muted/50',
        )}
        onClick={handleBrowseClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={FILE_UPLOAD_LABELS.DROP_AREA_ARIA}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleBrowseClick();
        }}
      >
        <UploadCloud
          className={cn(
            'h-5 w-5',
            isDragOver ? 'text-primary' : 'text-muted-foreground',
          )}
        />
        <span className="text-xs text-muted-foreground">
          {FILE_UPLOAD_LABELS.DROP_AREA}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
        >
          <UploadCloud className="h-4 w-4" />
          {FILE_UPLOAD_LABELS.BROWSE}
        </Button>
      </div>

      {hint && !displayError && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
