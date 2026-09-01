/**
 * Politique de mot de passe — SPEC-11 §0.
 * Le serveur refuse tout mot de passe non conforme avec `400 PASSWORD_TOO_WEAK`.
 * Source unique : schemas Zod et affichage des criteres lisent d'ici, pour que
 * le formulaire n'accepte jamais ce que l'API refusera, ni l'inverse.
 */
export const PASSWORD_POLICY = {
  MIN_LENGTH: 10,
  /** Au moins une lettre, quelle que soit la casse. */
  LETTER: /\p{L}/u,
  /** Au moins un chiffre. */
  DIGIT: /\d/,
} as const;

export const PASSWORD_POLICY_MESSAGES = {
  MIN_LENGTH: `Minimum ${PASSWORD_POLICY.MIN_LENGTH} caractères`,
  LETTER: 'Au moins 1 lettre',
  DIGIT: 'Au moins 1 chiffre (0-9)',
} as const;

/** Criteres affiches a l'utilisateur, dans l'ordre. */
export const PASSWORD_RULES = [
  {
    id: 'min',
    label: PASSWORD_POLICY_MESSAGES.MIN_LENGTH,
    test: (value: string) => value.length >= PASSWORD_POLICY.MIN_LENGTH,
  },
  {
    id: 'letter',
    label: PASSWORD_POLICY_MESSAGES.LETTER,
    test: (value: string) => PASSWORD_POLICY.LETTER.test(value),
  },
  {
    id: 'digit',
    label: PASSWORD_POLICY_MESSAGES.DIGIT,
    test: (value: string) => PASSWORD_POLICY.DIGIT.test(value),
  },
] as const;

/** Vrai si le mot de passe satisfait toute la politique. */
export function isPasswordStrongEnough(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}
