import { Button } from '@/components/ui/button';
import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { useContent } from '@/hooks/useContent';
import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';

type Props = {
  onChangePassword?: () => void;
};

export function SecuritySection({ onChangePassword }: Props) {
  const { profile: profileContent } = useContent();
  const { FIELDS, TEXTS, SECTIONS, BUTTONS, SECURITY_CARD } = profileContent;

  return (
    <DetailsSection
      title={SECTIONS.SECURITY}
      action={
        <Button type="button" onClick={onChangePassword}>
          <KeyRound className="mr-2 h-4 w-4" />
          {BUTTONS.CHANGE_PASSWORD}
        </Button>
      }
    >
      <div className="space-y-6">
        <DetailsField label={FIELDS.PASSWORD} value={TEXTS.PASSWORD_MASK} />

        <div className="rounded-2xl border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            {SECURITY_CARD.TITLE}
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <LockKeyhole className="h-4 w-4 shrink-0" />
              {SECURITY_CARD.ITEMS.STRONG_PASSWORD}
            </div>

            <div className="flex items-start gap-2">
              <KeyRound className="h-4 w-4 shrink-0" />
              {SECURITY_CARD.ITEMS.CHANGE_REGULARLY}
            </div>
          </div>
        </div>
      </div>
    </DetailsSection>
  );
}