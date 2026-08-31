import { PERMISSIONS } from '@/constants';
import { useMemo, useState } from 'react';
import { useMeStore } from '@/contexts/useMeStore';
import { CorrectEmailCard } from '@/features/user/components/correctEmail/CorrectEmailCard';
import { CorrectEmailDialog } from '@/features/user/components/correctEmail/CorrectEmailDialog';
import { DeleteUserSheet } from '@/features/user/components/user-delete/DeleteUserSheet';
import { UserDeleteCardSkeleton } from '@/features/user/components/user-delete/skeleton/UserDeleteCardSkeleton';
import { UserDeleteCard } from '@/features/user/components/user-delete/UserDeleteCard';
import { UserDetailsBodySkeleton } from '@/features/user/components/user-details/skeleton/UserDetailsBodySkeleton';
import { UserDetailsTabsNav } from '@/features/user/components/user-details/UserDetailsTabsNav';
import { UserInformationsTab } from '@/features/user/components/user-details/UserInformationsTab';
import { UserInviteCard } from '@/features/user/components/user-invite/UserInviteCard';
import { EditUserSheet } from '@/features/user/components/user-update/EditUserSheet';
import { INVITABLE_STATUSES } from '@/features/user/constants/invite-user.constants';
import { USER_ROUTES } from '@/features/user/constants/user.routes';
import { useInviteUser } from '@/features/user/hooks/useInviteUser';
import { useUser } from '@/features/user/hooks/useUser';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { DetailsPageHeader } from '@/components/layouts/layout-1/shared/details-page/DetailsPageHeader';
import { DetailsPageHeaderSkeleton } from '@/components/layouts/layout-1/shared/details-page/skeletons/DetailsPageHeaderSkeleton';

export function UserInformationsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{
    userId: string;
  }>();

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCorrectEmail, setOpenCorrectEmail] = useState(false);

  const { data, isLoading, isFetching } = useUser(userId);
  const { inviteUser, loading: inviteLoading } = useInviteUser();

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
        backRoute={USER_ROUTES.USERS_LIST()}
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

      {data?.id &&
        hasPermission(PERMISSIONS.USERS.UPDATE) &&
        INVITABLE_STATUSES.includes(data.status) && (
          <UserInviteCard
            status={data.status}
            onInviteClick={() => inviteUser(data.id)}
            isLoading={inviteLoading}
          />
        )}

      {data?.id && hasPermission(PERMISSIONS.USERS.UPDATE) && (
        <CorrectEmailCard
          status={data.status}
          onCorrectClick={() => setOpenCorrectEmail(true)}
        />
      )}

      {data?.id &&
        hasPermission(PERMISSIONS.USERS.DELETE) &&
        meStore.me?.email !== data.email && (
          <UserDeleteCard
            user={{ id: data.id }}
            onDeleteClick={() => setOpenDelete(true)}
          />
        )}

      {data?.id && expectedName ? (
        <DeleteUserSheet
          open={openDelete}
          onOpenChange={setOpenDelete}
          userId={data.id}
          onDeleted={() => navigate(USER_ROUTES.USERS_LIST())}
        />
      ) : null}

      {data?.id ? (
        <EditUserSheet
          open={openEdit}
          onOpenChange={setOpenEdit}
          userId={data.id}
        />
      ) : null}

      {data?.id ? (
        <CorrectEmailDialog
          open={openCorrectEmail}
          onOpenChange={setOpenCorrectEmail}
          userId={data.id}
          status={data.status}
        />
      ) : null}
    </>
  );
}
