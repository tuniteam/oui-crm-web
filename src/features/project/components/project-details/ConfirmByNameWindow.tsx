import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PROJECT_DANGER_UI } from '../../constants/constants';

const UI = PROJECT_DANGER_UI.CONFIRM_NAME;

/**
 * Confirmer en ressaisissant le nom exact du projet.
 *
 * Commune à l'archivage et à la suppression : deux gestes lourds, une même
 * garde. Le bouton reste désactivé tant que la saisie diffère du nom **au
 * caractère près** — l'API compare par `!==`, casse, accents et espaces
 * compris. Ne pas nettoyer la saisie ici : on activerait un bouton que le
 * serveur refuserait ensuite.
 *
 * Le serveur refait la comparaison : son `400 PROJECT_NAME_MISMATCH` s'affiche
 * sous le champ, via `mismatch`.
 */
export function ConfirmByNameWindow({
  open,
  onOpenChange,
  title,
  lead,
  projectName,
  confirmLabel,
  pending,
  mismatch,
  onConfirm,
  testId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  lead: readonly string[];
  projectName: string;
  confirmLabel: string;
  pending: boolean;
  /** Le serveur a refusé le nom : le dire sous le champ. */
  mismatch: boolean;
  onConfirm: (typedName: string) => void;
  testId: string;
}) {
  const [typed, setTyped] = useState('');

  // Rouvrir la fenêtre repart d'un champ vide : une confirmation ne se garde pas.
  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  const matches = typed === projectName;

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-4" data-testid={`${testId}-window`}>
          <div className="space-y-2 text-sm">
            {lead.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${testId}-name`}>
              {UI.LABEL} <span className="font-semibold">{projectName}</span>
            </Label>
            <Input
              id={`${testId}-name`}
              data-testid={`${testId}-name`}
              value={typed}
              autoComplete="off"
              onChange={(e) => setTyped(e.target.value)}
            />
            {mismatch ? (
              <p data-testid={`${testId}-mismatch`} className="text-sm text-destructive">
                {UI.MISMATCH}
              </p>
            ) : null}
          </div>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            data-testid={`${testId}-cancel`}
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!matches || pending}
            data-testid={`${testId}-confirm`}
            onClick={() => onConfirm(typed)}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    />
  );
}
