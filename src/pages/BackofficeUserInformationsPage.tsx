import { PERMISSIONS } from '@/constants';
import { useState } from 'react';
import { MailCheck, ShieldOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMeStore } from '@/contexts/useMeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DetailsPageHeader } from '@/components/layouts/layout-1/shared/details-page/DetailsPageHeader';
import { DetailsPageHeaderSkeleton } from '@/components/layouts/layout-1/shared/details-page/skeletons/DetailsPageHeaderSkeleton';
import { BackofficeUserInformationsTab } from '@/features/backoffice-user/components/backofficeUserDetails/BackofficeUserInformationsTab';
import { EditBackofficeUserWindow } from '@/features/backoffice-user/components/EditBackofficeUserWindow';
import {
  ACTIONS,
  NOT_FOUND,
  SUSPEND_WINDOW,
} from '@/features/backoffice-user/constants/constants';
import { NotFoundState } from '@/components/shared/NotFoundState';
import { BACKOFFICE_USER_ROUTES } from '@/features/backoffice-user/constants/routes.constants';
import { useBackofficeUser } from '@/features/backoffice-user/hooks/useBackofficeUser';
import { useResendBackofficeActivation } from '@/features/backoffice-user/hooks/useResendBackofficeActivation';
import { useSuspendBackofficeUser } from '@/features/backoffice-user/hooks/useSuspendBackofficeUser';
import { BACKOFFICE_USER_STATUS } from '@/features/backoffice-user/types/backofficeUser';

export function BackofficeUserInformationsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [openEdit, setOpenEdit] = useState(false);

  const { data, isLoading, isFetching, isError } = useBackofficeUser(userId);
  const { resend, loading: resending } = useResendBackofficeActivation();
  const { suspend, loading: suspending } = useSuspendBackofficeUser();

  const me = useMeStore((s) => s.me);
  const hasPermission = useMeStore((s) => s.hasPermission);

  if (isLoading || (isFetching && !openEdit)) {
    return <DetailsPageHeaderSkeleton />;
  }

  // Sans cet etat, un 404 ou un 500 rendait une page entierement blanche.
  if (isError || !data) {
    return (
      <NotFoundState
        title={NOT_FOUND.TITLE}
        description={NOT_FOUND.DESCRIPTION}
        backRoute={BACKOFFICE_USER_ROUTES.LIST}
        backLabel={NOT_FOUND.BACK}
      />
    );
  }

  const isSelf = me?.email === data.email;
  const canUpdate = hasPermission(PERMISSIONS.USER_BACKOFFICE.UPDATE);
  // On ne peut pas suspendre son propre acces (400 CANNOT_DELETE_SELF).
  const canSuspend =
    hasPermission(PERMISSIONS.USER_BACKOFFICE.DELETE) &&
    !isSelf &&
    data.status !== BACKOFFICE_USER_STATUS.SUSPENDED;
  const canResend = canUpdate && data.status === BACKOFFICE_USER_STATUS.PENDING;

  return (
    <>
      <DetailsPageHeader
        title={`${data.firstName} ${data.lastName}`.trim()}
        backRoute={BACKOFFICE_USER_ROUTES.LIST}
        targetId={data.id}
        onEditClick={canUpdate ? () => setOpenEdit(true) : undefined}
        editPermission={PERMISSIONS.USER_BACKOFFICE.UPDATE}
      />

      <Card className="mb-4">
        <CardContent className="p-5">
          <BackofficeUserInformationsTab user={data} />
        </CardContent>
      </Card>

      {(canResend || canSuspend) && (
        <Card className="mb-4">
          <CardContent className="flex flex-wrap items-center gap-3 p-5">
            {canResend && (
              <Button
                variant="outline"
                disabled={resending}
                onClick={() => resend(data.id)}
              >
                <MailCheck className="h-4 w-4" aria-hidden="true" />
                {ACTIONS.RESEND_ACTIVATION}
              </Button>
            )}

            {canSuspend && (
              <div className="flex flex-col gap-1">
                <Button
                  variant="destructive"
                  disabled={suspending}
                  onClick={async () => {
                    await suspend(data.id);
                    navigate(BACKOFFICE_USER_ROUTES.LIST);
                  }}
                >
                  <ShieldOff className="h-4 w-4" aria-hidden="true" />
                  {SUSPEND_WINDOW.CONFIRM}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {SUSPEND_WINDOW.DESCRIPTION}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <EditBackofficeUserWindow
        open={openEdit}
        onOpenChange={setOpenEdit}
        user={data}
      />
    </>
  );
}
