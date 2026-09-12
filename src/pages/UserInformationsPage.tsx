import { PERMISSIONS } from '@/constants';
import { useMemo, useState } from 'react';
import { Trash2, UserCheck, UserMinus } from 'lucide-react';
import { useMeStore } from '@/contexts/useMeStore';
import { ActionCard } from '@/components/shared/ActionCard';
import { Button } from '@/components/ui/button';
import { DeleteAccountWindow } from '@/features/user/components/user-delete/DeleteAccountWindow';
import { UserOverridesCard } from '@/features/user/components/user-overrides/UserOverridesCard';
import { DELETE_ACCOUNT_UI } from '@/features/user/constants/delete-account.constants';
import {
  DELETE_USER_WINDOW,
  USER_DELETE_CARD,
} from '@/features/user/constants/delete-user.constants';
import { REACTIVATE_USER_UI } from '@/features/user/constants/reactivate-user.constants';
import { USER_STATUS } from '@/features/user/constants/userList.constants';
import { useReactivateUser } from '@/features/user/hooks/useReactivateUser';
import { DeleteUserWindow } from '@/features/user/components/user-delete/DeleteUserWindow';
import { UserDeleteCardSkeleton } from '@/features/user/components/user-delete/skeleton/UserDeleteCardSkeleton';
import { UserDetailsBodySkeleton } from '@/features/user/components/user-details/skeleton/UserDetailsBodySkeleton';
import { UserDetailsTabsNav } from '@/features/user/components/user-details/UserDetailsTabsNav';
import { UserInformationsTab } from '@/features/user/components/user-details/UserInformationsTab';
import { UserInviteCard } from '@/features/user/components/user-invite/UserInviteCard';
import { EditUserWindow } from '@/features/user/components/user-update/EditUserWindow';
import { INVITABLE_STATUSES } from '@/features/user/constants/invite-user.constants';
import { useInviteUser } from '@/features/user/hooks/useInviteUser';
import { useUser } from '@/features/user/hooks/useUser';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { DetailsPageHeader } from '@/components/layouts/layout-1/shared/details-page/DetailsPageHeader';
import { DetailsPageHeaderSkeleton } from '@/components/layouts/layout-1/shared/details-page/skeletons/DetailsPageHeaderSkeleton';

/**
 * Retour a la liste, en relatif.
 *
 * `USER_ROUTES.USERS_LIST()` rend `/users` en absolu : depuis
 * `/:projectId/users/:userId/informations`, cela sortait de l'espace projet et
 * atterrissait sur la liste plateforme, qui appelle une route scopee sans
 * `x-project-id` — d'ou « Aucun projet selectionne » apres un retrait.
 *
 * Deux segments d'URL en arriere ramenent a la liste, aussi bien depuis
 * `/users/:id/informations` que depuis `/:projectId/users/:id/informations`.
 * `relative: 'path'` est indispensable : par defaut React Router remonte d'un
 * *route* et non d'un segment.
 */
const USERS_LIST_RELATIVE = '../..';

export function UserInformationsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{
    userId: string;
  }>();

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);

  const { data, isLoading, isFetching } = useUser(userId);
  const { inviteUser, loading: inviteLoading } = useInviteUser();
  const { reactivate, pending: reactivating } = useReactivateUser();

  const meStore = useMeStore();
  const hasPermission = meStore.hasPermission;
  
  const expectedName = useMemo(() => {
    if (!data) return '';
    return `${data.firstName} ${data.lastName}`.trim();
  }, [data]);

  if (isLoading || (isFetching && !openEdit)) {
    return (
      <>
        <DetailsPageHeaderSkeleton />
        <UserDetailsBodySkeleton />
        {hasPermission(PERMISSIONS.USERS.DELETE) && meStore.me?.email !== data?.email && (
          <UserDeleteCardSkeleton />
        )}
      </>
    );
  }

  const title = expectedName;

  return (
    <>
      <DetailsPageHeader
        title={title}
        backRoute={USERS_LIST_RELATIVE}
        targetId={data?.id ?? ''}
        onEditClick={() => setOpenEdit(true)}
        editPermission={PERMISSIONS.USERS.UPDATE}
      />

      <Card className="mb-4">
        <CardContent className="p-5">
          <UserDetailsTabsNav  />
          {data ? <UserInformationsTab user={data} /> : null}
        </CardContent>
      </Card>

      {/* Les cartes d'action sous la fiche, espacées une seule fois ici :
          `ActionCard` ne porte pas de marge, c'est à leur conteneur de le
          faire — sinon chaque carte réinvente la sienne et elles finissent
          par ne plus s'accorder. */}
      <div className="space-y-4">
        {/* L'ajustement des droits lit aussi `/roles` et `/permissions`, tous
            deux derriere `roles:read` : sans cette permission la carte ne
            pourrait ni afficher le catalogue ni distinguer un droit retire
            d'un droit jamais accorde. On ne la propose donc pas. */}
        {data &&
          hasPermission(PERMISSIONS.USERS.UPDATE) &&
          hasPermission(PERMISSIONS.ROLES.READ) && (
            <UserOverridesCard user={data} />
          )}

        {data?.id &&
          hasPermission(PERMISSIONS.USERS.UPDATE) &&
          INVITABLE_STATUSES.includes(data.status) && (
            <UserInviteCard
              onInviteClick={() => inviteUser(data.id)}
              isLoading={inviteLoading}
            />
          )}

      {/*
        La correction d'e-mail est retiree de l'ecran : elle appelle
        `PATCH /users/:id/email`, qui n'existe pas cote API — l'inventaire des
        routes le confirme, et l'appel repond 404. Les composants
        `correctEmail/` et `userService.correctEmail` sont conserves : le jour
        ou la route est ouverte, il suffit de remonter la carte et sa fenetre.
      */}

      {data?.id &&
        hasPermission(PERMISSIONS.USERS.DELETE) &&
        meStore.me?.email !== data.email && (
          <>
            {/* Un seul endroit, deux visages selon l'état. Un accès déjà
                suspendu ne se retire pas une seconde fois : `suspend()` ne
                verifie pas le statut de depart et repondrait 204 sans rien
                changer, en journalisant un retrait qui n'a rien retire. */}
            {data.status === USER_STATUS.SUSPENDED ? (
              <ActionCard
                testId="user-reactivate-card"
                label={REACTIVATE_USER_UI.CARD.TITLE}
                description={REACTIVATE_USER_UI.CARD.DESCRIPTION}
              >
                {/* Rétablir n'est pas un geste destructeur : pas d'aplat rouge. */}
                <Button
                  disabled={reactivating}
                  data-testid="user-reactivate"
                  onClick={() => reactivate(data)}
                >
                  <UserCheck />
                  {REACTIVATE_USER_UI.CARD.ACTION}
                </Button>
              </ActionCard>
            ) : (
              <ActionCard
                testId="user-remove-card"
                label={USER_DELETE_CARD.TITLE}
                description={USER_DELETE_CARD.DESCRIPTION}
              >
                <Button
                  variant="destructive"
                  data-testid="user-remove"
                  onClick={() => setOpenDelete(true)}
                >
                  <UserMinus />
                  {DELETE_USER_WINDOW.ACTIONS.CONFIRM}
                </Button>
              </ActionCard>
            )}

            {/* La suppression définitive **sous** le retrait, jamais à sa
                place : le retrait est le geste courant, celui-ci ne sert
                qu'à un compte créé par erreur. L'ordre dit la préférence. */}
            <ActionCard
              testId="user-delete-account-card"
              label={DELETE_ACCOUNT_UI.CARD.TITLE}
              description={DELETE_ACCOUNT_UI.CARD.DESCRIPTION}
            >
              <Button
                variant="destructive"
                data-testid="user-delete-account"
                onClick={() => setOpenDeleteAccount(true)}
              >
                <Trash2 />
                {DELETE_ACCOUNT_UI.CARD.ACTION}
              </Button>
            </ActionCard>
          </>
        )}
      </div>

      {data?.id && expectedName ? (
        <DeleteUserWindow
          open={openDelete}
          onOpenChange={setOpenDelete}
          userId={data.id}
          onDeleted={() =>
            navigate(USERS_LIST_RELATIVE, { relative: 'path', replace: true })
          }
        />
      ) : null}

      {data?.id && expectedName ? (
        <DeleteAccountWindow
          open={openDeleteAccount}
          onOpenChange={setOpenDeleteAccount}
          userId={data.id}
          userName={expectedName}
          onDeleted={() =>
            navigate(USERS_LIST_RELATIVE, { relative: 'path', replace: true })
          }
          /* Le refus renvoie vers le retrait : on enchaîne sur sa fenêtre
             plutôt que de laisser l'utilisateur la retrouver seul. */
          onRemoveInstead={() => setOpenDelete(true)}
        />
      ) : null}

      {data?.id ? (
        <EditUserWindow
          open={openEdit}
          onOpenChange={setOpenEdit}
          userId={data.id}
        />
      ) : null}
    </>
  );
}
