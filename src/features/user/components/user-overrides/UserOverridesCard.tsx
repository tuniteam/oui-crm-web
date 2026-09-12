import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ActionCard } from '@/components/shared/ActionCard';
import {
  PermissionMatrix,
  type MatrixChoice,
} from '@/components/shared/PermissionMatrix';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { noWindowHooks } from '@/components/window/ReusableWindow';
import {
  usePermissionCatalogue,
  useRoles,
} from '@/features/role/hooks/useRoles';
import {
  OVERRIDES_UI,
  type OverrideState,
} from '../../constants/overrides.constants';
import { useOverrideDraft } from '../../hooks/useOverrideDraft';
import { useSetOverrides } from '../../hooks/useSetOverrides';
import type { UserDetailsResponse } from '../../types/userDetails';

const UI = OVERRIDES_UI;

/**
 * Les états proposés dépendent de ce que le rôle accorde.
 *
 * Sur un droit que le rôle accorde, « Accordé » ne veut rien dire — il est
 * déjà là. Sur un droit qu'il n'accorde pas, « Retiré » ne veut rien dire non
 * plus : il n'y a rien à retirer. Deux boutons par ligne, jamais trois, et
 * chacun dit quelque chose.
 */
const INHERITED: MatrixChoice<OverrideState> = {
  value: 'INHERITED',
  label: UI.STATE.INHERITED.LABEL,
  hint: UI.STATE.INHERITED.HINT,
};
const GRANTED: MatrixChoice<OverrideState> = {
  value: 'GRANTED',
  label: UI.STATE.GRANTED.LABEL,
  hint: UI.STATE.GRANTED.HINT,
};
const REMOVED: MatrixChoice<OverrideState> = {
  value: 'REMOVED',
  label: UI.STATE.REMOVED.LABEL,
  hint: UI.STATE.REMOVED.HINT,
};

/**
 * Les exceptions de droits d'un utilisateur — US-00-05 §4.
 *
 * **Trois lectures pour un écran** : le catalogue des droits et les droits du
 * rôle viennent de `/permissions` et `/roles`, tous deux derrière
 * `roles:read` ; les droits effectifs de la personne viennent de sa fiche.
 * C'est l'appelant qui garde la carte fermée quand la permission manque : ce
 * composant suppose qu'elle est là.
 */
export function UserOverridesCard({ user }: { user: UserDetailsResponse }) {
  const [open, setOpen] = useState(false);
  const { roles, loading: rolesLoading } = useRoles();
  const { modules, loading: catalogueLoading } = usePermissionCatalogue();
  const { save, pending: saving } = useSetOverrides();

  /* Les droits du rôle : le second ingrédient sans lequel un retrait est
     indistinguable d'un droit jamais accordé. */
  const roleCodes = useMemo(
    () =>
      roles.find((r) => r.code === user.roleCode)?.permissions.map((p) => p.code) ??
      [],
    [roles, user.roleCode],
  );

  const draft = useOverrideDraft(user, roleCodes);
  const loading = rolesLoading || catalogueLoading;

  const close = () => {
    draft.stop();
    setOpen(false);
  };

  const { added, removed } = draft.counts;
  const description =
    added + removed === 0 ? UI.CARD.NONE : UI.CARD.SOME(added, removed);

  return (
    <>
      <ActionCard
        testId="user-overrides-card"
        label={UI.CARD.TITLE}
        description={description}
      >
        <Button
          variant="outline"
          data-testid="user-overrides-open"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal />
          {UI.CARD.ACTION}
        </Button>
      </ActionCard>

      <ReusableSheet<Record<string, never>>
        open={open}
        onOpenChange={(next) => !next && close()}
        title={UI.DRAWER.TITLE(`${user.firstName} ${user.lastName}`.trim())}
        description={user.roleLabel}
        useHooks={noWindowHooks}
        /* Une matrice en cours de saisie ne doit pas partir sur un clic à
           côté : seules la croix et « Annuler » ferment. */
        preventClose
        className="sm:max-w-3xl"
        renderBody={() =>
          loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* La règle avant la matrice : elle décide de tout le reste. */}
              <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                {UI.DRAWER.LEAD}
              </p>

              <PermissionMatrix<OverrideState>
                testId="user-overrides-matrix"
                cellTestId="override"
                modules={modules}
                choicesFor={(code) =>
                  roleCodes.includes(code)
                    ? [INHERITED, REMOVED]
                    : [INHERITED, GRANTED]
                }
                valueOf={draft.valueOf}
                setCell={draft.setCell}
                countOf={(codes) =>
                  UI.DRAWER.MODULE_COUNT(draft.adjustedCount(codes), codes.length)
                }
                readLabelOf={(value) =>
                  value === 'INHERITED' ? null : UI.STATE[value].LABEL
                }
                editing={draft.editing}
              />
            </div>
          )
        }
        renderFooter={() =>
          draft.editing ? (
            <>
              {draft.dirtyCount > 0 ? (
                <span
                  data-testid="user-overrides-dirty"
                  className="me-auto text-xs font-medium text-warning"
                >
                  {UI.DRAWER.DIRTY(draft.dirtyCount)}
                </span>
              ) : null}
              <Button
                type="button"
                variant="outline"
                data-testid="user-overrides-cancel"
                onClick={draft.stop}
              >
                {UI.DRAWER.CANCEL}
              </Button>
              <Button
                type="button"
                disabled={draft.dirtyCount === 0 || saving}
                data-testid="user-overrides-save"
                onClick={async () => {
                  const { added: a, removed: r } = draft.payload();
                  const ok = await save({ userId: user.id, added: a, removed: r });
                  if (ok) close();
                }}
              >
                {UI.DRAWER.SAVE}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              data-testid="user-overrides-edit"
              onClick={draft.start}
            >
              {UI.DRAWER.EDIT}
            </Button>
          )
        }
      />
    </>
  );
}
