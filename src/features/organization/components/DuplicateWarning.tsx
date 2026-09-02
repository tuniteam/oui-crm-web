import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CREATE_ORGANIZATION_UI } from '../constants/organizationCreate.constants';
import type { DuplicateCandidate } from '../types/organizationCreate';

const { DUPLICATE } = CREATE_ORGANIZATION_UI;

/**
 * Doublon probable — `409 ORGANIZATION_POSSIBLE_DUPLICATE`.
 *
 * Le serveur ne refuse pas la creation, il demande une confirmation : meme nom
 * au meme code postal. On montre les fiches qu'il a trouvees, avec un lien
 * pour les ouvrir, et la meme requete se rejoue avec `force` si l'utilisateur
 * confirme. Les candidats viennent de `messages.meta.duplicates` — jamais du
 * texte du message, qui est ecrit pour un humain et peut changer.
 */
export function DuplicateWarning({
  candidates,
  projectId,
  onConfirm,
  onCancel,
  loading,
}: {
  candidates: DuplicateCandidate[];
  projectId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      data-testid="organization-duplicate-warning"
      className="space-y-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4"
    >
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <TriangleAlert className="size-4" />
          {DUPLICATE.TITLE}
        </p>
        <p className="text-sm text-muted-foreground">{DUPLICATE.DESCRIPTION}</p>
      </div>

      <ul className="space-y-2">
        {candidates.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2"
          >
            <span className="min-w-0 truncate text-sm">
              {c.name}
              {c.city ? (
                <span className="text-muted-foreground"> · {c.city}</span>
              ) : null}
            </span>
            {/* Ouverture dans un onglet : la saisie en cours ne doit pas etre
                perdue pour aller verifier une fiche. */}
            {projectId && (
              <Link
                to={`/${projectId}/organizations?fiche=${c.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm text-primary underline-offset-4 hover:underline"
              >
                {DUPLICATE.OPEN}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {DUPLICATE.CANCEL}
        </Button>
        <Button
          type="button"
          size="sm"
          data-testid="organization-duplicate-confirm"
          onClick={onConfirm}
          disabled={loading}
        >
          {DUPLICATE.CONFIRM}
        </Button>
      </div>
    </div>
  );
}
