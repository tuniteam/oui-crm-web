import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { COMMON } from '@/constants/common';
import { FALLBACK, FIELDS, TABLE_HEADERS } from '../../constants/constants';
import type { BackofficeUserDetails } from '../../types/backofficeUser';

function formatDateTime(value: string | null): string {
  if (!value) return FALLBACK;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? FALLBACK
    : date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

export function BackofficeUserInformationsTab({
  user,
}: {
  user: BackofficeUserDetails;
}) {
  return (
    <div className="space-y-6">
      <DetailsSection title={FIELDS.FIRST_NAME + ' / ' + FIELDS.LAST_NAME}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsField
            label={FIELDS.FIRST_NAME}
            value={user.firstName ?? FALLBACK}
          />
          <DetailsField
            label={FIELDS.LAST_NAME}
            value={user.lastName ?? FALLBACK}
          />
          <DetailsField
            label={FIELDS.EMAIL}
            value={user.email ?? FALLBACK}
            copyable
            copyTooltipCopy={COMMON.ACTIONS.COPY_EMAIL}
            copyTooltipCopied={COMMON.ACTIONS.EMAIL_COPIED}
          />
        </div>
      </DetailsSection>

      <DetailsSection title={TABLE_HEADERS.ROLE}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsField
            label={FIELDS.ROLE}
            value={user.roleLabel ?? FALLBACK}
          />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {TABLE_HEADERS.STATUS}
            </p>
            <StatusBadge status={user.status} />
          </div>
          <DetailsField
            label={TABLE_HEADERS.LAST_LOGIN}
            value={formatDateTime(user.lastLoginAt)}
          />
        </div>
      </DetailsSection>
    </div>
  );
}
