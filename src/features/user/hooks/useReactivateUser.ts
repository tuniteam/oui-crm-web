import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessageOr } from '@/shared/utils/api-error';
import { REACTIVATE_USER_UI } from '../constants/reactivate-user.constants';
import { userService } from '../services/user.service';
import type { CreateUserPayload } from '../types/createUser';
import type { UserDetailsResponse } from '../types/userDetails';

/**
 * Rétablir l'accès d'un utilisateur suspendu — US-00-05 §2.
 *
 * **Il n'y a pas de route de réactivation.** C'est le même `POST /users` que
 * l'invitation : sur un rattachement suspendu, il le réactive avec le rôle et
 * le périmètre envoyés. On renvoie donc ce que la fiche porte déjà, sans rien
 * redemander — un clic, pas un formulaire.
 *
 * `initials` et `isExternal` sont obligatoires côté API, et un accès externe
 * exige son échéance (`400 EXPIRATION_REQUIRED_FOR_EXTERNAL`) : les trois
 * repartent tels qu'ils sont enregistrés.
 */
export function useReactivateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, unknown, CreateUserPayload>({
    mutationFn: (payload) => userService.create(payload),
    onSuccess: (_data, payload) => {
      toast.success(REACTIVATE_USER_UI.DONE(payload.firstName));
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      toast.error(apiMessageOr(err, REACTIVATE_USER_UI.ERROR));
    },
  });

  /* Rien à rendre : le succès comme le refus se disent en bandeau, et la
     liste comme la fiche se rechargent d'elles-mêmes. */
  const reactivate = async (user: UserDetailsResponse): Promise<void> => {
    try {
      await mutation.mutateAsync({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: user.initials,
        roleCode: user.roleCode,
        isExternal: user.isExternal,
        ...(user.scope ? { scopeId: user.scope.id } : {}),
        /* Le jour calendaire seul : l'API refuse une date-heure ISO. */
        ...(user.expiresAt ? { expiresAt: user.expiresAt.slice(0, 10) } : {}),
      });
    } catch {
      /* Le bandeau d'erreur a deja parle. */
    }
  };

  return { reactivate, pending: mutation.isPending };
}
