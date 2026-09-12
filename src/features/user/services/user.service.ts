import api from '@/config/axiosInstance';
import { ME_ROUTES, USER_ROUTES } from '../constants/user.routes';
import type {
  CorrectEmailPayload,
  CorrectEmailResponse,
} from '../types/correctEmail';
import { CreateUserPayload, CreateUserResponse } from '../types/createUser';
import type { MeResponse } from '../types/me';
import { UpdateUserPayload, UpdateUserResponse } from '../types/updateUser';
import { UserDetailsResponse } from '../types/userDetails';
import { UserListParams, UserListResponse } from '../types/userList';


/**
 * Les utilisateurs d'un projet — US-00-05. Routes scopees projet
 * (`x-project-id`, pose par l'intercepteur).
 *
 * **Aucune erreur n'est enveloppee dans un `Error` nu.** Elle l'etait, et ca
 * coutait deux choses a chaque appelant : le `code`, qui dit sur quel champ
 * poser le refus, et le `meta`, qui porte les compteurs de
 * `409 USER_HAS_REFERENCES`. Un message francais deja resolu ne laisse plus
 * rien a decider. Les appelants lisent donc `getApiErrorCode` /
 * `getApiErrorMeta`, et `getApiErrorMessage` quand un simple message suffit.
 */
export const userService = {
  me: async (): Promise<MeResponse> => {
    // /profile/me repond a plat, sans enveloppe { data } (verifie en reel).
    const res = await api.get<MeResponse>(ME_ROUTES.ME_API);
    return res.data;
  },
  getAll: async (params: UserListParams): Promise<UserListResponse> => {
    const res = await api.get<UserListResponse>(USER_ROUTES.USERS_API, {
      params,
    });
    return res.data;
  },
  create: async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
    const res = await api.post<CreateUserResponse>(
      USER_ROUTES.USERS_API,
      payload,
    );
    return res.data;
  },
  getOne: async (userId: string): Promise<UserDetailsResponse> => {
    const res = await api.get<UserDetailsResponse>(
      USER_ROUTES.USER_DETAIL_API(userId),
    );
    return res.data;
  },
  update: async (
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<UpdateUserResponse> => {
    const res = await api.patch<UpdateUserResponse>(
      USER_ROUTES.USER_UPDATE_API(userId),
      payload,
    );
    return res.data;
  },
  // Volontairement non wrappé par getApiErrorMessage : le hook a besoin du
  // code d'erreur brut (EMAIL_UNCHANGED, EMAIL_ALREADY_TAKEN, ...).
  correctEmail: async (
    userId: string,
    payload: CorrectEmailPayload,
  ): Promise<CorrectEmailResponse> => {
    const res = await api.patch<CorrectEmailResponse>(
      USER_ROUTES.USER_CORRECT_EMAIL_API(userId),
      payload,
    );
    return res.data;
  },
  /**
   * Retire du projet — **reversible**. Le rattachement passe a `SUSPENDED` :
   * le compte, l'historique et les initiales sont conserves. Pour rouvrir
   * l'acces, on renvoie une invitation (`create`) avec la meme adresse.
   */
  delete: async (userId: string): Promise<void> => {
    await api.delete(USER_ROUTES.USER_DELETE_API(userId));
  },
  /**
   * Supprime definitivement — **irreversible**, pour un compte cree par
   * erreur. Le rattachement est retire, et le compte avec lui quand c'etait le
   * dernier. Ce qui porte le nom de la personne dans ce projet le retient :
   * `409 USER_HAS_REFERENCES`, dont le `meta` dit quoi et combien.
   */
  deleteAccount: async (userId: string): Promise<void> => {
    await api.delete(USER_ROUTES.USER_ACCOUNT_API(userId));
  },
  /**
   * Remplace **tout** l'ensemble des exceptions de cette personne sur ce
   * projet. Les deux tableaux sont obligatoires, meme vides : le serveur lit
   * un remplacement, pas un delta. Regle d'application cote serveur :
   * retrait > ajout > role.
   */
  setOverrides: async (
    userId: string,
    payload: { added: string[]; removed: string[] },
  ): Promise<UserDetailsResponse> => {
    const res = await api.patch<UserDetailsResponse>(
      USER_ROUTES.USER_OVERRIDES_API(userId),
      payload,
    );
    return res.data;
  },
  /** Renvoie l'e-mail d'activation d'un compte encore PENDING. */
  resendActivation: async (userId: string): Promise<{ sent: boolean }> => {
    const res = await api.post<{ sent: boolean }>(
      USER_ROUTES.USER_RESEND_ACTIVATION_API(userId),
    );
    return res.data;
  },
};
