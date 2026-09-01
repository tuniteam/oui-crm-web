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
} as const