import { Building2, Mail } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { COMMON } from '@/constants/common';
import type { MyProfileResponse } from '../../types/profile';

type Props = {
  profile: MyProfileResponse;
  onChangeEmail?: () => void;
};

function getStatusDisplay(
  status: string,
  statusLabels: Record<string, string>,
) {
  return statusLabels[status] ?? status;
}

export function AccessSection({ profile, onChangeEmail }: Props) {
  const { profile: profileContent } = useContent();
  const { FIELDS, TEXTS, SECTIONS, BUTTONS, STATUS_LABELS } = profileContent;

  return (
    <DetailsSection
      title={SECTIONS.ACCESS}
      action={
        <Button type="button" onClick={onChangeEmail}>
          <Mail className="mr-2 h-4 w-4" />
          {BUTTONS.CHANGE_EMAIL}
        </Button>
      }
    >
      <div className="space-y-5">
        <DetailsField
          label={FIELDS.EMAIL}
          value={profile.email ?? TEXTS.FALLBACK}
          copyable
          copyTooltipCopy={COMMON.ACTIONS.COPY_EMAIL}
          copyTooltipCopied={COMMON.ACTIONS.EMAIL_COPIED}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{FIELDS.ROLE}</p>

            {profile.roleRelationships?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.roleRelationships.map((role, index) => (
                  <div
                    key={`${role.roleCode}-${role.clientName ?? 'no-client'}-${index}`}
                    className="rounded-2xl border bg-muted/40 px-3 py-2 shadow-sm transition hover:bg-muted/60"
                  >
                    <div className="text-sm font-medium leading-none">
                      {role.roleLabel}
                    </div>

                    {profile.contactType !== 'BACKOFFICE' &&
                      role.clientName && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{role.clientName}</span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 px-3 py-2 text-sm">
                {TEXTS.FALLBACK}
              </div>
            )}
          </div>

          <DetailsField
            label={FIELDS.STATUS}
            value={getStatusDisplay(profile.status, STATUS_LABELS)}
          />
        </div>

        <p className="text-sm text-muted-foreground">{TEXTS.CONTACT_ADMIN}</p>
      </div>
    </DetailsSection>
  );
}
