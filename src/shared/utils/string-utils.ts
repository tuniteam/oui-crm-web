/**
 * Returns the uppercase initials from first and last name (e.g. "ED" for "Emma Dupont").
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

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

/**
 * Formats a French phone number into readable pairs (e.g. "0102030405" → "01 02 03 04 05",
 * "+33102030405" → "+33 1 02 03 04 05"). Returns the input untouched if it doesn't match.
 */
export function formatPhoneFR(phone: string): string {
  const digits = phone.replace(/\s/g, '');
  if (digits.startsWith('+33')) {
    return digits.replace(
      /(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/,
      '$1 $2 $3 $4 $5 $6',
    );
  }
  return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}
