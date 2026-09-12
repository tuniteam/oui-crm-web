import { useState } from 'react';
import { CopyPlus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { ROLES_UI } from '../constants/roles.constants';
import { usePermissionCatalogue, useRoles } from '../hooks/useRoles';
import { useRoleDraft } from '../hooks/useRoleDraft';
import { useDeleteRole, useUpdateRole } from '../hooks/useRoleMutations';
import { OUT_OF_SCOPE_VALUES, type Role } from '../types/role';
import { DuplicateRoleWindow } from './DuplicateRoleWindow';
import { RoleMatrix } from './RoleMatrix';

const UI = ROLES_UI;

/**
 * Rôles et permissions d'un projet — L0 · US-00-06.
 *
 * Un utilisateur porte **un rôle par projet** : cet écran décide donc ce que
 * chacun peut faire. Les sept rôles système sont en lecture seule ; on en
 * duplique un pour l'adapter, ce qui garantit qu'un rôle part toujours d'un
 * ensemble cohérent plutôt que d'une page blanche.
 *
 * La liste s'ouvre par sa colonne Actions, comme partout — voir
 * `docs/REGLE-OUVRIR-UNE-LIGNE.md`.
 */
export function RolesScreen() {
  const canUpdate = useMeStore((s) => s.hasPermission(PERMISSIONS.ROLES.UPDATE));
  const { roles, loading } = useRoles();
  const { modules, loading: catalogueLoading } = usePermissionCatalogue();

  const [openedId, setOpenedId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const opened = roles.find((r) => r.id === openedId) ?? null;
  const draft = useRoleDraft(opened);
  const { update, pending: saving } = useUpdateRole();
  const { remove, pending: removing } = useDeleteRole();

  const close = () => {
    draft.stop();
    setOpenedId(null);
  };

  if (loading || catalogueLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="roles-screen">
      <div>
        <h1 className="text-xl font-semibold">{UI.TITLE}</h1>
        {/* Le modèle mental, dit avant la liste : un rôle système ne se
            modifie pas, il se duplique. */}
        <p className="text-sm text-muted-foreground">{UI.SUBTITLE}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{UI.COLUMNS.LABEL}</TableHead>
              <TableHead>{UI.COLUMNS.CODE}</TableHead>
              <TableHead>{UI.COLUMNS.KIND}</TableHead>
              <TableHead>{UI.COLUMNS.OUT_OF_SCOPE}</TableHead>
              <TableHead className="text-end">{UI.COLUMNS.USERS}</TableHead>
              <TableHead className="text-center">{UI.COLUMNS.ACTIONS}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.label}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {role.code}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={role.isSystem ? 'secondary' : 'primary'}
                    appearance="outline"
                    size="sm"
                  >
                    {role.isSystem ? UI.KIND.SYSTEM : UI.KIND.CUSTOM}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {UI.OUT_OF_SCOPE[role.outOfScopeAccess].LABEL}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {role.usersCount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          mode="icon"
                          variant="ghost"
                          aria-label={UI.ACTIONS.VIEW}
                          data-testid={`role-view-${role.code}`}
                          onClick={() => setOpenedId(role.id)}
                        >
                          <Eye />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{UI.ACTIONS.VIEW}</TooltipContent>
                    </Tooltip>

                    {canUpdate ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              mode="icon"
                              variant="ghost"
                              aria-label={UI.ACTIONS.DUPLICATE}
                              data-testid={`role-duplicate-${role.code}`}
                              onClick={() => setDuplicating(role)}
                            >
                              <CopyPlus />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{UI.ACTIONS.DUPLICATE}</TooltipContent>
                        </Tooltip>

                        {/* Un rôle système ne se supprime pas : le serveur
                            répondrait 403. On ne propose pas le geste. */}
                        {role.isSystem ? null : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                mode="icon"
                                variant="ghost"
                                aria-label={UI.ACTIONS.DELETE}
                                data-testid={`role-delete-${role.code}`}
                                onClick={() => setDeleting(role)}
                              >
                                <Trash2 />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{UI.ACTIONS.DELETE}</TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReusableSheet<Record<string, never>>
        open={openedId !== null}
        onOpenChange={(open) => !open && close()}
        title={opened?.label ?? ''}
        description={opened ? `${opened.code} · ${UI.DRAWER.GRANTED(draft.grantedCount())}` : ''}
        useHooks={noWindowHooks}
        /* Une matrice en cours de saisie ne doit pas partir sur un clic à
           côté : seules la croix et « Annuler » ferment. */
        preventClose
        className="sm:max-w-3xl"
        renderBody={() =>
          opened ? (
            <div className="space-y-4">
              {opened.isSystem ? (
                <p
                  data-testid="role-system-notice"
                  className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
                >
                  {UI.DRAWER.SYSTEM_NOTICE}
                </p>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-semibold">{UI.DRAWER.OUT_OF_SCOPE_TITLE}</p>
                {draft.editing ? (
                  <div className="flex flex-wrap gap-2">
                    {OUT_OF_SCOPE_VALUES.map((value) => (
                      <Tooltip key={value}>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant={draft.outOfScope === value ? 'primary' : 'outline'}
                            data-testid={`role-scope-${value}`}
                            onClick={() => draft.setOutOfScope(value)}
                          >
                            {UI.OUT_OF_SCOPE[value].LABEL}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{UI.OUT_OF_SCOPE[value].HINT}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {UI.OUT_OF_SCOPE[draft.outOfScope].LABEL} —{' '}
                    {UI.OUT_OF_SCOPE[draft.outOfScope].HINT}
                  </p>
                )}
              </div>

              <RoleMatrix
                modules={modules}
                valueOf={draft.valueOf}
                setCell={draft.setCell}
                grantedCount={draft.grantedCount}
                editing={draft.editing}
              />
            </div>
          ) : null
        }
        renderFooter={() =>
          opened && canUpdate && !opened.isSystem ? (
            <>
              {draft.dirtyCount > 0 ? (
                <span
                  data-testid="role-dirty"
                  className="me-auto text-xs font-medium text-warning"
                >
                  {UI.DRAWER.DIRTY(draft.dirtyCount)}
                </span>
              ) : null}

              {draft.editing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="role-edit-cancel"
                    onClick={draft.stop}
                  >
                    {UI.ACTIONS.CANCEL}
                  </Button>
                  {/* Désactivé sans modification : le serveur refuserait un
                      corps vide par `400 EMPTY_UPDATE_PAYLOAD`. */}
                  <Button
                    type="button"
                    disabled={draft.dirtyCount === 0 || saving}
                    data-testid="role-edit-save"
                    onClick={async () => {
                      const result = await update(opened.id, draft.payload());
                      if (typeof result === 'object') close();
                    }}
                  >
                    {UI.ACTIONS.SAVE}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  data-testid="role-edit-start"
                  onClick={draft.start}
                >
                  <Pencil />
                  {UI.ACTIONS.EDIT}
                </Button>
              )}
            </>
          ) : null
        }
      />

      <DuplicateRoleWindow
        open={duplicating !== null}
        onOpenChange={(open) => !open && setDuplicating(null)}
        source={duplicating}
      />

      <ReusableWindow<Record<string, never>>
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? UI.DELETE_WINDOW.TITLE(deleting.label) : ''}
        useHooks={noWindowHooks}
        className="max-w-lg"
        renderBody={() => (
          <div className="space-y-2 text-sm" data-testid="role-delete-window">
            <p>{UI.DELETE_WINDOW.LEAD}</p>
            {/* Le refus est prévisible : on le dit avant le clic plutôt que de
                laisser le serveur répondre 409. */}
            {deleting && deleting.usersCount > 0 ? (
              <p data-testid="role-delete-in-use" className="text-destructive">
                {UI.ERRORS.IN_USE(deleting.usersCount)}
              </p>
            ) : null}
          </div>
        )}
        renderFooter={() => (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={removing}
              data-testid="role-delete-cancel"
              onClick={() => setDeleting(null)}
            >
              {UI.DELETE_WINDOW.CANCEL}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removing || (deleting?.usersCount ?? 0) > 0}
              data-testid="role-delete-confirm"
              onClick={async () => {
                if (!deleting) return;
                await remove(deleting.id);
                setDeleting(null);
              }}
            >
              {UI.DELETE_WINDOW.CONFIRM}
            </Button>
          </>
        )}
      />
    </div>
  );
}
