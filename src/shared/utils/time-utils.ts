import { Time } from '@internationalized/date';

export function parseTime(value: string): Time | null {
  const [h, m] = value.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return new Time(h, m);
}

export function formatTime(value: Time | null): string {
  if (!value) return '';
  return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
}

export function nowHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
