// src/features/auth/constants/constants.ts

/**
 * L'illustration de la page de connexion.
 *
 * Dessinee pour OUI CRM, a la charte : une carte de France semee de pastilles,
 * les organismes gagnes coches en azur, les autres encore a prospecter. Elle
 * dit le metier, la ou un bouclier et un cadenas ne disaient rien.
 *
 * **Deux fichiers, et pas un seul.** Une image de fond est un document a
 * part : `currentColor` n'y arrive pas, et le mode sombre du projet est porte
 * par la classe `.dark`, pas par la preference du systeme — une media query
 * dans le SVG suivrait l'OS et non l'application.
 */
export const AUTH_ILLUSTRATIONS = {
  LOGIN_LIGHT: '/media/illustrations/login.svg',
  LOGIN_DARK: '/media/illustrations/login-dark.svg',
} as const;
