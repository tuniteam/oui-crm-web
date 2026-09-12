import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { ROLE_RULES, ROLES_UI } from '../constants/roles.constants';
import { useDuplicateRole } from '../hooks/useRoleMutations';
import type { Role } from '../types/role';

const UI = ROLES_UI.DUPLICATE_WINDOW;
const E = ROLES_UI.ERRORS;

/** Le code proposé depuis le libellé : majuscules, sans accents, tirets bas. */
export function codeFromLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    /* Le motif du serveur exige une lettre en tête : un code commençant par
       un chiffre serait refusé par un `400` après la saisie. */
    .replace(/^[0-9_]+/, '')
    .slice(0, ROLE_RULES.CODE_MAX);
}

/**
 * Dupliquer un rôle — la seule façon d'en créer un.
 *
 * Il n'existe pas de création à partir de rien : on part d'un rôle proche,
 * système ou non, et le nouveau hérite de ses droits. C'est aussi ce qui rend
 * les rôles système utiles sans être modifiables.
 *
 * Le code est **définitif** : proposé depuis le libellé, modifiable tant qu'on
 * n'a pas validé, plus jamais ensuite.
 */
export function DuplicateRoleWindow({
  open,
  onOpenChange,
  source,
  onDuplicated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: Role | null;
  onDuplicated?: () => void;
}) {
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [codeEdited, setCodeEdited] = useState(false);
  const [taken, setTaken] = useState(false);
  const { duplicate, pending } = useDuplicateRole();

  useEffect(() => {
    if (!open || !source) return;
    setLabel('');
    setCode('');
    setCodeEdited(false);
    setTaken(false);
  }, [open, source]);

  /* Le code suit le libellé **tant qu'on ne l'a pas touché** : le recalculer
     ensuite effacerait ce que l'utilisateur vient de choisir. */
  const onLabelChange = (value: string) => {
    setLabel(value);
    setTaken(false);
    if (!codeEdited) setCode(codeFromLabel(value));
  };

  const labelIssue =
    label.trim() === ''
      ? E.REQUIRED
      : label.trim().length > ROLE_RULES.LABEL_MAX
        ? E.TOO_LONG(ROLE_RULES.LABEL_MAX)
        : null;
  const codeIssue = taken
    ? E.CODE_EXISTS
    : code.trim() === ''
      ? E.REQUIRED
      : !ROLE_RULES.CODE_PATTERN.test(code.trim())
        ? E.CODE_FORMAT
        : code.trim().length > ROLE_RULES.CODE_MAX
          ? E.TOO_LONG(ROLE_RULES.CODE_MAX)
          : null;

  if (!source) return null;

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE(source.label)}
      description={UI.LEAD}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-4" data-testid="role-duplicate-window">
          <div className="space-y-1.5">
            <Label htmlFor="role-duplicate-label">{UI.LABEL} *</Label>
            <Input
              id="role-duplicate-label"
              data-testid="role-duplicate-label"
              value={label}
              maxLength={ROLE_RULES.LABEL_MAX}
              onChange={(e) => onLabelChange(e.target.value)}
            />
            {label !== '' && labelIssue ? (
              <p className="text-sm text-destructive">{labelIssue}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-duplicate-code">{UI.CODE} *</Label>
            <Input
              id="role-duplicate-code"
              data-testid="role-duplicate-code"
              value={code}
              maxLength={ROLE_RULES.CODE_MAX}
              className="font-mono"
              onChange={(e) => {
                setCodeEdited(e.target.value.trim() !== '');
                setTaken(false);
                setCode(e.target.value.toUpperCase());
              }}
            />
            {code !== '' && codeIssue ? (
              <p data-testid="role-duplicate-code-issue" className="text-sm text-destructive">
                {codeIssue}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{UI.CODE_HINT}</p>
            )}
          </div>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            data-testid="role-duplicate-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={pending || labelIssue !== null || codeIssue !== null}
            data-testid="role-duplicate-confirm"
            onClick={async () => {
              const result = await duplicate(source.id, {
                code: code.trim(),
                label: label.trim(),
              });
              /* Le code pris se dit **sous son champ** : un toast dirait le
                 problème sans dire où agir. */
              if (result === 'CODE_EXISTS') {
                setTaken(true);
                return;
              }
              onOpenChange(false);
              if (typeof result === 'object') onDuplicated?.();
            }}
          >
            {UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
