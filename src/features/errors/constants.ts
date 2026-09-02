export const ERROR_500={
    TITLE: 'Erreur 500',
    SUBTITLE: 'Erreur interne du serveur',
    DESCRIPTION: 'Une erreur serveur est survenue. Veuillez réessayer ultérieurement',
    BUTTONS: {
        RETRY_LABEL: 'Relancer',
    },
    IMAGES: {
        LIGHT: '/media/illustrations/error_500.svg',
        DARK: '/media/illustrations/error_500.svg',
    },
    IMAGE_ALT: 'Illustration erreur serveur',
} as const;

export const NO_PERMISSIONS={
    TITLE: 'Accès restreint',
    SUBTITLE: 'Vous ne disposez pas de permissions.',
    DESCRIPTION: 'Veuillez contacter votre administrateur',
    BUTTONS: {
        RETRY_LABEL: 'Se déconnecter',
    },
    IMAGES: {
        LIGHT: '/media/illustrations/no-permission.svg',
        DARK: '/media/illustrations/no-permission.svg',
    },
    IMAGE_ALT: 'Illustration accès restreint',
} as const;

/**
 * Accueil d'un compte dont les droits portent sur des ecrans a venir.
 *
 * A ne pas confondre avec NO_PERMISSIONS : ici rien n'est casse et il n'y a
 * personne a prevenir. Ni badge d'alerte, ni bouton de deconnexion — les deux
 * feraient croire a une anomalie de compte.
 */
export const WELCOME_PENDING = {
    TITLE: 'Bienvenue',
    SUBTITLE: 'Vos écrans arrivent',
    DESCRIPTION:
        "Votre compte est bien configuré. Les écrans qui correspondent à votre rôle sont en cours de développement et apparaîtront ici au fur et à mesure des livraisons.",
    SCOPE_LABEL: 'Votre périmètre',
    IMAGES: {
        LIGHT: '/media/illustrations/coming-soon.svg',
        DARK: '/media/illustrations/coming-soon.svg',
    },
    IMAGE_ALT: 'Illustration écrans à venir',
} as const;
