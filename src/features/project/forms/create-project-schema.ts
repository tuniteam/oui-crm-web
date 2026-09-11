import { z } from 'zod';
import { CREATE_PROJECT_UI, PROJECT_RULES } from '../constants/constants';

const E = CREATE_PROJECT_UI.ERRORS;

/**
 * `POST /projects` — les règles de `CreateProjectDto`, contrôlées avant
 * l'envoi.
 *
 * `trim()` d'abord : le serveur valide `IsNotEmpty`, qui laisse passer un nom
 * fait d'espaces. Un projet nommé « ␣␣ » n'a rien de valide, même si l'API
 * l'accepte.
 */
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, E.REQUIRED).max(PROJECT_RULES.NAME_MAX, E.TOO_LONG(PROJECT_RULES.NAME_MAX)),
  slug: z
    .string()
    .trim()
    .min(PROJECT_RULES.SLUG_MIN, E.SLUG_LENGTH)
    .max(PROJECT_RULES.SLUG_MAX, E.SLUG_LENGTH)
    .regex(PROJECT_RULES.SLUG_PATTERN, E.SLUG_FORMAT),
  productName: z
    .string()
    .trim()
    .min(1, E.REQUIRED)
    .max(PROJECT_RULES.NAME_MAX, E.TOO_LONG(PROJECT_RULES.NAME_MAX)),
  description: z
    .string()
    .trim()
    .max(PROJECT_RULES.DESCRIPTION_MAX, E.TOO_LONG(PROJECT_RULES.DESCRIPTION_MAX)),
  /** `NO_SOURCE` quand on part de la configuration par défaut. */
  copyFromProjectId: z.string(),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
