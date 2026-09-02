import { useCallback, useState } from 'react';
import { getApiErrorCode } from '@/shared/utils/api-error';
import { REGISTRY_DEGRADED_CODES } from '../constants/organizationCreate.constants';
import { organizationService } from '../services/organization.service';
import type { RegistryMatch } from '../types/organizationCreate';

type RegistryState = {
  /** `null` tant qu'aucune recherche n'a abouti — a distinguer du tableau
   *  vide, qui signifie « cherche, rien trouve ». */
  matches: RegistryMatch[] | null;
  loading: boolean;
  /** Le registre n'a pas repondu. Ce n'est pas un echec du parcours : la
   *  saisie manuelle reste ouverte, et c'est ce qu'on propose. */
  degraded: boolean;
  error: string | null;
};

const INITIAL: RegistryState = {
  matches: null,
  loading: false,
  degraded: false,
  error: null,
};

/**
 * Recherche au registre officiel — `GET /organizations/search-registry`.
 *
 * Hors TanStack Query a dessein : ce n'est pas une donnee du projet a mettre
 * en cache, mais une consultation externe declenchee a la demande, dont le
 * resultat n'a de sens que dans la fenetre ouverte.
 */
export function useRegistrySearch() {
  const [state, setState] = useState<RegistryState>(INITIAL);

  const search = useCallback(async (q: string) => {
    setState({ ...INITIAL, loading: true });
    try {
      const res = await organizationService.searchRegistry(q);
      setState({ ...INITIAL, matches: res.data ?? [] });
    } catch (err) {
      const code = getApiErrorCode(err);
      const degraded = (REGISTRY_DEGRADED_CODES as readonly string[]).includes(
        code ?? '',
      );
      setState({ ...INITIAL, degraded, error: degraded ? null : code });
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, search, reset };
}
