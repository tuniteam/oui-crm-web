const FILE_SIZE_UNITS = ['o', 'Ko', 'Mo', 'Go'] as const;

/**
 * Formats a file size in bytes to a human-readable string (e.g. 254321 → "248 Ko").
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return `0 ${FILE_SIZE_UNITS[0]}`;
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  const formatted = unitIndex === 0 ? size.toString() : size.toFixed(1).replace(/\.0$/, '');
  return `${formatted} ${FILE_SIZE_UNITS[unitIndex]}`;
}
