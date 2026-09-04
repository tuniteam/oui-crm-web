import { AGENDA_UI } from '../constants/agenda.constants';
import { AGENDA_KINDS, type AgendaKind } from '../types/agenda';

const UI = AGENDA_UI;

type Props = {
  counts: Record<AgendaKind, number> | null;
  /** Combien de créneaux les filtres laissent voir, toutes sources confondues. */
  shown: number;
};

/**
 * Les quatre sources de l'agenda, avec leur compte — L1 · US-01-09.
 *
 * `counts` est calculé **avant** le filtre `kinds` : un compte qui tomberait à
 * zéro quand on éteint son calque ne dirait plus rien de ce qu'il y a
 * derrière.
 *
 * Trois sources sont à zéro jusqu'aux lots L2 à L4. On les affiche quand même,
 * en le disant : c'est un zéro **vrai**, comme les quatre barres des
 * campagnes — pas un filtre inerte.
 */
export function AgendaSources({ counts, shown }: Props) {
  if (!counts) return null;

  return (
    <ul
      data-testid="agenda-sources"
      className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground"
    >
      {AGENDA_KINDS.map((kind) => (
        <li
          key={kind}
          data-testid={`agenda-source-${kind}`}
          className="flex items-center gap-1.5"
        >
          {/* Seule `ACTIVITY` porte des données au L1 : les trois autres n'ont
              rien à filtrer, leur zéro se suffit. */}
          <span className="font-mono tabular-nums">
            {kind === 'ACTIVITY'
              ? UI.SOURCE_COUNT(shown, counts[kind] ?? 0)
              : (counts[kind] ?? 0)}
          </span>
          <span>{UI.SOURCES[kind]}</span>
          {/* Dire pourquoi le zéro est un zéro, plutôt que de laisser croire à
              une période creuse. */}
          {kind !== 'ACTIVITY' ? (
            <span className="opacity-70">— {UI.SOURCE_PENDING}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
