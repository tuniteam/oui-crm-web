// src/features/user/components/user-details/UserInformationsTab.tsx
import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { COMMON } from '@/constants/common';
import { USER_STATUS_LABELS } from '../../constants/userList.constants';
import { USER_INFORMATION_UI } from '../../constants/users.constants';
import type { UserDetailsResponse } from '../../types/userDetails';

export function UserInformationsTab({ user }: { user: UserDetailsResponse }) {
  const {
    SECTIONS,
    FIELDS,
    FALLBACK,
    SCOPE_ALL,
    NO_EXPIRATION,
    OVERRIDES_FORMAT,
  } = USER_INFORMATION_UI;

  // Statut composite : etat du compte ou affectation suspendue sur ce projet.
  const statusLabel =
    USER_STATUS_LABELS.find((s) => s.value === user.status)?.label ?? FALLBACK;

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
            label={FIELDS.INITIALS}
            value={user.initials ?? FALLBACK}
          />
          <DetailsField
            label={FIELDS.EMAIL}
            value={user.email ?? FALLBACK}
            copyable
            copyTooltipCopy={COMMON.ACTIONS.COPY_EMAIL}
            copyTooltipCopied={COMMON.ACTIONS.EMAIL_COPIED}
          />
          <DetailsField label={FIELDS.PHONE} value={user.phone ?? FALLBACK} />
        </div>
      </DetailsSection>

      {/* Access */}
      <DetailsSection title={SECTIONS.ACCESS}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsField label={FIELDS.STATUS} value={statusLabel} />
          <DetailsField label={FIELDS.ROLE} value={user.roleLabel ?? FALLBACK} />
          {/* Pas de perimetre = acces a tout le projet, dans la limite des
              permissions du role. */}
          <DetailsField
            label={FIELDS.SCOPE}
            value={user.scope?.name ?? SCOPE_ALL}
          />
          <DetailsField
            label={FIELDS.EXPIRES_AT}
            value={
              user.expiresAt
                ? new Date(user.expiresAt).toLocaleDateString()
                : NO_EXPIRATION
            }
          />
          <DetailsField
            label={FIELDS.OVERRIDES}
            value={OVERRIDES_FORMAT(
              user.overridesCount?.added ?? 0,
              user.overridesCount?.removed ?? 0,
            )}
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
        </div>
      </DetailsSection>
    </div>
  );
}
