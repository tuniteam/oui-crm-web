import type { MeResponse } from '@/features/user/types/me';

// Definition canonique dans user/types/me : BACKOFFICE | PROJECT.
export type { ContactType } from '@/features/user/types/me';


/**
 * GET /profile/me est la source unique du profil et des droits. On alias
 * MeResponse plutot que de redeclarer une forme divergente : c'est
 * exactement la meme reponse.
 */
export type MyProfileResponse = MeResponse;