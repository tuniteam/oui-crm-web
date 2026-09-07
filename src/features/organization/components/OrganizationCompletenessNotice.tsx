import { CircleCheck, TriangleAlert } from 'lucide-react';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import type { OrganizationCompleteness } from '../types/organizationList';

const { COMPLETENESS, MISSING_LABELS } = ORGANIZATION_DETAIL_UI;

type Props = {
  completeness?: OrganizationCompleteness;
  /**
   * L'action qui repond au constat, rendue a droite du bandeau.
   *
   * « Completer depuis le registre » occupait une ligne entiere sous le
   * bandeau : soixante pixels pour un bouton, dans un panneau ou la place
   * manque. Le remede tient a cote du diagnostic — c'est aussi la ou on le
   * cherche.
   */
  action?: React.ReactNode;
};

/**
 * Bandeau de completude, comme en tete du panneau de la V8.
 *
 * Les six criteres sont nommes par l'API (`SIRET`, `ADDRESS`, `POSTAL_CODE`,
 * `POPULATION`, `PRIMARY_CONTACT`, `EMAIL`) ; on traduit sans jamais les
 * recalculer — `PRIMARY_CONTACT` vit dans une autre table, le front ne peut
 * pas en juger.
 *
 * `blocks.quote` peut valoir `null` et non `false` : il se lit comme
 * « inconnu ou bloque », jamais comme un booleen strict.
 */
export function OrganizationCompletenessNotice({
  completeness,
  action,
}: Props) {
  // Sans donnee de completude, le bandeau n'a rien a dire — l'action, si.
  if (!completeness) return action ? <div>{action}</div> : null;

  const missing = completeness.missing ?? [];
  const quoteBlocked = completeness.blocks?.quote !== false;

  if (missing.length === 0) {
    return (
      <div
        data-testid="organization-completeness"
        className="flex flex-wrap items-center gap-3 rounded-lg border border-success/40 bg-success-soft p-3 text-sm"
      >
        <CircleCheck className="size-4 shrink-0 text-success" />
        <span>{COMPLETENESS.COMPLETE}</span>
        {action ? <div className="ms-auto">{action}</div> : null}
      </div>
    );
  }

  const labels = missing.map((m) => MISSING_LABELS[m] ?? m).join(', ');

  return (
    <div
      data-testid="organization-completeness"
      className="space-y-1 rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm"
    >
      <div className="flex flex-wrap items-start gap-3">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
        <span className="min-w-0 flex-1">
          {missing.length > 1
            ? COMPLETENESS.INCOMPLETE_PLURAL(labels)
            : COMPLETENESS.INCOMPLETE(labels)}
        </span>
        {/* Le remede a cote du constat, sur la meme ligne quand la place le
            permet, dessous quand elle manque. */}
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {quoteBlocked ? (
        <p className="ps-7 text-xs text-muted-foreground">
          {COMPLETENESS.QUOTE_BLOCKED}
        </p>
      ) : null}
    </div>
  );
}
