import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PRICING_ISSUE_TEXT,
  PRICING_UI,
} from '../constants/pricing.constants';
import { readDetails, unknownCount } from '../utils/grid-issues';
import type { GridIssue } from '../utils/grid-issues';
import type { PricingGridContent } from '../types/pricingGrid';

const UI = PRICING_UI.ERRORS;

/**
 * Ce que le serveur reproche à une grille, en français — SPEC-19.
 *
 * `messages.details[]` est une **clé de correspondance**, pas une phrase :
 * l'anglais et les chemins techniques sont délibérés côté API. Ce panneau les
 * traduit ; l'écran ne les affiche jamais bruts.
 *
 * **Le repli est la partie qui compte.** Un chemin non prévu — une règle
 * ajoutée côté serveur, une version préparée avant un durcissement, un contenu
 * venu d'un import — reste compté et reste lisible dans le détail dépliable.
 * Sans lui, la première règle nouvelle produirait un écran muet, ce qui est
 * pire qu'un message technique.
 */
export function PricingIssuesPane({
  details,
  content,
}: {
  details: string[];
  content: PricingGridContent | null;
}) {
  const [open, setOpen] = useState(false);
  if (details.length === 0) return null;

  const issues = readDetails(details, content);
  /* La cause devient une phrase ici : l'utilitaire n'en porte aucune. */
  const named = issues.filter((i: GridIssue) => i.code !== 'UNKNOWN');
  const unknown = unknownCount(issues);

  return (
    <div
      data-testid="pricing-issues"
      className="rounded-lg border border-destructive bg-destructive-soft p-3 text-sm"
    >
      <p className="flex items-start gap-2 font-medium">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        {UI.INVALID_SUMMARY(issues.length)}
      </p>

      {named.length > 0 ? (
        <ul className="mt-2 ms-6 list-disc space-y-1">
          {named.map((i: GridIssue) => (
            <li key={i.raw}>{PRICING_ISSUE_TEXT[i.code](i.params)}</li>
          ))}
        </ul>
      ) : null}

      {/* Le détail technique existe pour le support et pour les chemins que la
          table ne connaît pas encore. Replié : il ne s'adresse pas au
          commercial qui lit la ligne du dessus. */}
      {unknown > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 ms-4"
          data-testid="pricing-issues-toggle"
          onClick={() => setOpen((v) => !v)}
        >
          {UI.INVALID_DETAIL}
        </Button>
      ) : null}

      {open ? (
        <div className="mt-2 ms-6">
          <p className="text-xs font-medium text-muted-foreground">
            {UI.INVALID_RAW}
          </p>
          <ul className="mt-1 space-y-0.5 font-mono text-xs text-muted-foreground">
            {issues.map((i: GridIssue) => (
              <li key={`raw-${i.raw}`}>{i.raw}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
