import { AUTH } from '../constants/auth.constants';

/**
 * 423 AUTH_ACCOUNT_LOCKED — verrouillage temporaire apres 5 echecs.
 * Porte la date de deverrouillage quand le back la fournit, pour permettre
 * un compte a rebours. `lockedUntil` vaut null si elle n'a pas pu etre lue :
 * l'UI affiche alors le message generique, sans decompte.
 */
export class AuthLockedError extends Error {
  readonly lockedUntil: Date | null;

  constructor(lockedUntil: Date | null) {
    super(AUTH.ERRORS.ACCOUNT_LOCKED);
    this.name = 'AuthLockedError';
    this.lockedUntil = lockedUntil;
  }
}
