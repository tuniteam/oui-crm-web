import { z } from 'zod';
import { TIME_SLOT } from '../constants/activity.constants';
import { ACTIVITY_LIMITS, type Activity } from '../types/activity';

const ZOD = {
  REQUIRED: 'Champ requis',
  SLOT: `Entre ${TIME_SLOT.MIN} et ${TIME_SLOT.MAX}, par tranches de ${TIME_SLOT.STEP_MINUTES} minutes`,
  MAX: 'Longueur maximale dépassée',
  DATE: 'Date invalide (AAAA-MM-JJ)',
  TIME: 'Heure invalide (HH:MM)',
  DURATION: 'Durée entre 1 et 1440 minutes',
  REPORT: 'Le compte rendu est obligatoire',
  ORGANIZATION: 'Choisissez un organisme',
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;
/** `HH:MM` strict, `00:00` à `23:59` — le motif exact du validateur serveur. */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Saisie d'une action — L1 · US-01-08.
 *
 * Longueurs relevées dans `activities.constants.ts` de l'API, pas devinées.
 * Le formulaire ne porte **ni statut ni compte rendu de réalisation** : toute
 * action naît planifiée, et la réaliser est un geste distinct.
 */
export const getActivitySchema = () =>
  z.object({
    /**
     * Toujours obligatoire, quel que soit l'ecran.
     *
     * L'onglet Actions le pre-remplit — il connait sa fiche — donc la regle ne
     * s'y voit jamais ; depuis l'agenda, ou aucune fiche n'est en contexte,
     * elle s'applique. Une seule regle vaut mieux qu'un garde pose dans le
     * bouton : `handleSubmit` valide le schema **avant** d'appeler son
     * callback, si bien qu'un garde n'etait jamais atteint des qu'un autre
     * champ manquait aussi — le formulaire refusait sans dire qu'il manquait
     * l'organisme.
     */
    organizationId: z.string().trim().min(1, ZOD.ORGANIZATION),
    type: z.string().trim().min(1, ZOD.REQUIRED).max(ACTIVITY_LIMITS.TYPE, ZOD.MAX),
    date: z.string().trim().regex(DAY, ZOD.DATE),
    /*
     * `min`, `max` et `step` cadrent le selecteur natif ; ils ne valident
     * rien cote formulaire. Une heure tapee au clavier, ou collee, passerait
     * sans cette verification.
     */
    time: z
      .string()
      .trim()
      .regex(TIME, ZOD.TIME)
      .refine(
        (v) =>
          v >= TIME_SLOT.MIN &&
          v <= TIME_SLOT.MAX &&
          Number(v.slice(3)) % TIME_SLOT.STEP_MINUTES === 0,
        ZOD.SLOT,
      )
      .or(z.literal('')),
    durationMin: z
      .string()
      .trim()
      .refine(
        (v) =>
          v === '' ||
          (/^\d+$/.test(v) &&
            Number(v) >= ACTIVITY_LIMITS.DURATION_MIN &&
            Number(v) <= ACTIVITY_LIMITS.DURATION_MAX),
        ZOD.DURATION,
      ),
    location: z.string().trim().max(ACTIVITY_LIMITS.LOCATION, ZOD.MAX),
    contactId: z.string().trim(),
    report: z.string().trim().max(ACTIVITY_LIMITS.REPORT, ZOD.MAX),
  });

export type ActivitySchemaType = z.infer<ReturnType<typeof getActivitySchema>>;

/** Le compte rendu est ce qui rend l'action réelle : jamais vide. */
export const getCompleteSchema = () =>
  z.object({
    report: z
      .string()
      .trim()
      .min(1, ZOD.REPORT)
      .max(ACTIVITY_LIMITS.REPORT, ZOD.MAX),
    result: z.string().trim().max(ACTIVITY_LIMITS.RESULT, ZOD.MAX),
  });

export type CompleteSchemaType = z.infer<ReturnType<typeof getCompleteSchema>>;

/** Aujourd'hui en `YYYY-MM-DD`, sans passer par un fuseau. */
export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Aucun type par defaut : le choix est explicite, et le champ obligatoire. */
export const emptyActivityValues = (
  organizationId = '',
): ActivitySchemaType => ({
  organizationId,
  type: '',
  date: todayIso(),
  time: '',
  durationMin: '',
  location: '',
  contactId: '',
  report: '',
});

export const activityToValues = (a: Activity): ActivitySchemaType => ({
  organizationId: a.organization.id,
  type: a.type.key,
  date: a.date,
  // L'heure se transporte telle quelle, jamais reconstruite en `Date`.
  time: a.time ?? '',
  durationMin: a.durationMin != null ? String(a.durationMin) : '',
  location: a.location ?? '',
  contactId: a.contact?.id ?? '',
  report: a.report ?? '',
});
