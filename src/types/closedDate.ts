export const CLOSED_DATE_TYPE = {
  PUBLIC_HOLIDAY: 'PUBLIC_HOLIDAY',
  SCHOOL_VACATION: 'SCHOOL_VACATION',
  CLOSURE: 'CLOSURE',
} as const;

export type ClosedDateType = keyof typeof CLOSED_DATE_TYPE;

export type ClosedDate = {
  date: string;
  type: ClosedDateType;
  label: string;
};

export const CLOSED_DATE_LABELS: Record<string, string> = {
  PUBLIC_HOLIDAY: 'Jour férié',
  SCHOOL_VACATION: 'Vacances scolaires',
  CLOSURE: 'Fermeture',
};
