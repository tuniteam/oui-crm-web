// src/features/users/components/UserInformationsTab.tsx
import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { COMMON } from '@/constants/common';
import {
  RELATIONSHIP_STATUS_LABELS,
  USER_STATUS_LABELS,
} from '../../constants/userList.constants';
import { USER_INFORMATION_UI } from '../../constants/users.constants';
import type { UserDetailsResponse } from '../../types/userDetails';

export function UserInformationsTab({ user }: { user: UserDetailsResponse }) {
  const { SECTIONS, FIELDS, FALLBACK } = USER_INFORMATION_UI;

  const statusLabel =
    USER_STATUS_LABELS.find((s) => s.value === user.status)?.label ?? FALLBACK;

  const relationshipStatusLabel =
    RELATIONSHIP_STATUS_LABELS.find(
      (r) => r.value === user.relationShip?.status,
    )?.label ?? FALLBACK;

  return (
    <div className="space-y-6">
      {/* Identity */}
      <DetailsSection title={SECTIONS.IDENTITY}>
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

      {/* Access */}
      <DetailsSection title={SECTIONS.ACCESS}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsField label={FIELDS.STATUS} value={statusLabel} />
          <DetailsField
            label={FIELDS.ROLE}
            value={user.relationShip?.roleLabel ?? FALLBACK}
          />
          <DetailsField
            label={FIELDS.RELATION_STATUS}
            value={relationshipStatusLabel}
          />
        </div>
      </DetailsSection>

      {/* Security */}
      <DetailsSection title={SECTIONS.SECURITY}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsField
            label={FIELDS.LAST_LOGIN}
            value={
              user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : FALLBACK
            }
          />
          <DetailsField
            label={FIELDS.FAILED_ATTEMPTS}
            value={String(user.failedLoginAttempts ?? 0)}
          />
        </div>
      </DetailsSection>

      {/* Metadata */}
      <DetailsSection title={SECTIONS.METADATA}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsField
            label={FIELDS.CREATED_AT}
            value={new Date(user.createdAt).toLocaleString()}
          />
          <DetailsField
            label={FIELDS.UPDATED_AT}
            value={new Date(user.updatedAt).toLocaleString()}
          />
        </div>
      </DetailsSection>
    </div>
  );
}
