/**
 * Pure utility to crop and resize an image into a square JPEG File.
 * Honors EXIF orientation (mobile photos rotation).
 */

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize: number,
  quality: number,
  fileName: string,
): Promise<File> {
  const response = await fetch(imageSrc);
  const blob = await response.blob();

  // Honor EXIF orientation (iPhone/Android portrait photos)
  const bitmap = await createImageBitmap(blob, {
    imageOrientation: 'from-image',
  });

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.drawImage(
    bitmap,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  bitmap.close();

  const outBlob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
  );

  if (!outBlob) {
    throw new Error('Canvas toBlob failed');
  }

  const baseName = fileName.replace(/\.[^.]+$/, '') || 'image';
  return new File([outBlob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
