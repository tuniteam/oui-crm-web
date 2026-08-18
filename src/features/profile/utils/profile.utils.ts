export function getAuthentictedUserInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = 'U',
) {
  const first = firstName?.trim()?.[0] ?? '';
  const last = lastName?.trim()?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || fallback;
}