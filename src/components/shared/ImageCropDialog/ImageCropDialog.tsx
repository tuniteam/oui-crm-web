import { useCallback, useState } from 'react';
import { Check, X } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider, SliderThumb } from '@/components/ui/slider';
import { IMAGE_CROP } from '@/constants';
import { getCroppedImg } from '@/shared/utils/crop-image';

type Props = {
  open: boolean;
  imageSrc: string | null;
  fileName: string;
  /** Crop aspect ratio. 1 = square (default). */
  aspect?: number;
  /** Visual cropper shape — final crop is always rectangular. */
  cropShape?: 'rect' | 'round';
  /** Square output size in px. */
  outputSize?: number;
  /** JPEG quality (0–1). */
  quality?: number;
  /** Max zoom level. */
  maxZoom?: number;
  /** Texts — fall back to generic IMAGE_CROP labels if omitted. */
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  zoomLabel?: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
};

export function ImageCropDialog({
  open,
  imageSrc,
  fileName,
  aspect = 1,
  cropShape = 'round',
  outputSize = IMAGE_CROP.DEFAULT_OUTPUT_SIZE_PX,
  quality = IMAGE_CROP.DEFAULT_OUTPUT_QUALITY,
  maxZoom = IMAGE_CROP.DEFAULT_MAX_ZOOM,
  title = IMAGE_CROP.TITLE,
  description = IMAGE_CROP.DESCRIPTION,
  confirmLabel = IMAGE_CROP.CONFIRM,
  cancelLabel = IMAGE_CROP.CANCEL,
  zoomLabel = IMAGE_CROP.ZOOM_LABEL,
  onConfirm,
  onCancel,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const resetLocalState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const file = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        outputSize,
        quality,
        fileName,
      );
      onConfirm(file);
      resetLocalState();
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    resetLocalState();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) handleCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {imageSrc && (
          <div className="relative h-72 w-full overflow-hidden rounded-md bg-muted">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={false}
              maxZoom={maxZoom}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">{zoomLabel}</label>
          <Slider
            value={[zoom]}
            min={1}
            max={maxZoom}
            step={0.05}
            onValueChange={([v]) => setZoom(v)}
            aria-label={zoomLabel}
          >
            <SliderThumb />
          </Slider>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={busy}>
            <X className="h-4 w-4" />
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={!croppedAreaPixels || busy}>
            <Check className="h-4 w-4" />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
