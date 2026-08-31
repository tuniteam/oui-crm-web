import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import type { MyProfileResponse } from '../../types/profile';

type Props = {
  profile: MyProfileResponse;
  onEdit: () => void;
};

export function PersonalInformations({ profile, onEdit }: Props) {
  const { profile: profileContent } = useContent();
  const { FIELDS, TEXTS, SECTIONS, BUTTONS } = profileContent;

  return (
    <DetailsSection
      title={SECTIONS.PERSONAL_INFORMATION}
      action={
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          {BUTTONS.EDIT}
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailsField
          label={FIELDS.FIRST_NAME}
          value={profile.firstName ?? TEXTS.FALLBACK}
        />

        <DetailsField
          label={FIELDS.LAST_NAME}
          value={profile.lastName ?? TEXTS.FALLBACK}
        />

        <DetailsField
          label={FIELDS.PHONE}
          value={profile.phone ?? TEXTS.FALLBACK}
          className="md:col-span-2"
        />
      </div>
    </DetailsSection>
  );
}
