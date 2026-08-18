/**
 * Hook centralisé pour accéder à tout le contenu de l'application
 * Facilite la migration future vers i18n si nécessaire
 *
 * Usage:
 * const content = useContent();
 * <Button>{content.ui.TABLE.SEARCH_PLACEHOLDER}</Button>
 */
import { COMMON, MENU, UI } from '@/constants';
import { ACTIVATION } from '@/features/auth/constants/activation.constants';
import { AUTH } from '@/features/auth/constants/auth.constants';
import { RESET_PASSWORD } from '@/features/auth/constants/reset-password.constants';
import { CHANGE_PASSWORD_SHEET } from '@/features/profile/constants/change-password.constants';
import { PROFILE_UI } from '@/features/profile/constants/profile.constants';
import { UPDATE_PROFILE_SHEET } from '@/features/profile/constants/update-profile.constants';

import {
  DELETE_USER_SHEET,
  USER_DELETE_CARD,
  ERRORS as USER_ERRORS,
  TOASTS as USER_TOASTS,
} from '@/features/user/constants/delete-user.constants';

export const useContent = () => {
  return {
    // Constantes partagées
    common: COMMON,
    ui: UI,
    menu: MENU,

    // Constantes de features
    auth: AUTH,
    activation: ACTIVATION,
    resetPassword: RESET_PASSWORD,
    profile: PROFILE_UI,
    updateProfile: UPDATE_PROFILE_SHEET,
    changePassword: CHANGE_PASSWORD_SHEET,
 
    user: {
      delete: {
        card: USER_DELETE_CARD,
        sheet: DELETE_USER_SHEET,
        toasts: USER_TOASTS,
        errors: USER_ERRORS,
      },
    },
  
  };
};

// Export de type pour autocomplétion
export type Content = ReturnType<typeof useContent>;
