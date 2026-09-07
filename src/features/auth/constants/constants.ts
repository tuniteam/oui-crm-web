// src/features/auth/constants/constants.ts

/**
 * L'illustration de la page de connexion.
 *
 * unDraw « morning-plans » — licence libre, aucune attribution due. Une liste
 * dont la premiere ligne est cochee, et un cafe : la journee de prospection
 * qui commence, la ou un bouclier et un cadenas ne disaient rien.
 *
 * L'accent unDraw (#6c63ff) est remplace par l'azur de la charte, et la
 * variante sombre remappe chaque teinte sur son equivalent de
 * `theme.oui-crm.css` — jamais sur une valeur eclaircie a la main.
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
