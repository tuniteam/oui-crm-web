import { useMeStore } from '@/contexts/useMeStore';
import { useProject } from './useProject';

/**
 * Le nom du projet ouvert, pour le rail et le fil d'Ariane.
 *
 * Il vient du **rattachement du contact**, déjà présent dans `/profile/me`.
 * L'API n'est interrogée que sinon — le cas d'un opérateur back-office, qui
 * n'est rattaché à aucun projet et en ouvre pourtant depuis la liste.
 *
 * Le piège est dans le « sinon » : tant que `/profile/me` n'a pas répondu, on
 * ne sait pas encore si un rattachement porte le nom. Conclure qu'il n'y en a
 * pas fait partir un `GET /projects/:id` qu'un contact de projet n'a pas le
 * droit d'appeler — `projects:read` est une permission de plateforme. D'où
 * l'attente de `me` : sans elle, chaque chargement d'un écran de projet
 * produisait un 403 inutile avant de s'apercevoir que le nom était là.
 *
 * Le choix **du** projet reste à l'appelant : le rail et le fil d'Ariane ne
 * retiennent pas le même en mode back-office.
 */
export function useActiveProjectName(
  projectId: string | null | undefined,
): string | null {
  const me = useMeStore((s) => s.me);
  const fromRelationship = useMeStore((s) => s.getActiveProjectName());

  const askTheApi = !!me && !!projectId && !fromRelationship;
  const { data } = useProject(askTheApi ? projectId : undefined);

  if (!projectId) return null;
  return fromRelationship ?? data?.name ?? null;
}
