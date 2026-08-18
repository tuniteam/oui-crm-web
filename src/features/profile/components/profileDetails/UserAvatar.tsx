import { Camera, ImageIcon, Info } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { ProfileAvatar } from '../ProfileAvatar';
import { getAuthentictedUserInitials } from '../../utils/profile.utils';

type AvatarProps = {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  onEditAvatar?: () => void;
};

export function UserAvatar({ firstName, lastName, avatarUrl, onEditAvatar }: AvatarProps) {
  const { profile: profileContent } = useContent();
  const { SECTIONS, BUTTONS, TEXTS, AVATAR_CARD } = profileContent;

  const initials = getAuthentictedUserInitials(
    firstName,
    lastName,
    TEXTS.AVATAR_FALLBACK_INITIAL,
  );

  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || initials;

  return (
    <DetailsSection
      title={SECTIONS.AVATAR}
      action={
        <Button type="button" variant="outline" size="sm" onClick={onEditAvatar}>
          <Camera className="mr-2 h-4 w-4" />
          {BUTTONS.EDIT}
        </Button>
      }
    >
      <div className="flex min-h-[220px] flex-col justify-center">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
          <div className="relative flex justify-center lg:justify-start">
            <ProfileAvatar
              avatarUrl={avatarUrl}
              initials={initials}
              fullName={fullName}
              className="h-36 w-36 rounded-full border border-border shadow-sm"
              fallbackClassName="text-4xl font-semibold text-muted-foreground"
            />

            <button
              type="button"
              onClick={onEditAvatar}
              aria-label="Modifier la photo de profil"
              className="absolute bottom-1 right-[calc(50%-72px)] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted lg:right-1"
            >
              <Camera className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-muted-foreground" />
              {AVATAR_CARD.TITLE}
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ImageIcon className="h-4 w-4 shrink-0" />
                {TEXTS.AVATAR_FORMAT}
              </div>

              <div className="flex items-start gap-2">
                <ImageIcon className="h-4 w-4 shrink-0" />
                {TEXTS.AVATAR_MAX_SIZE}
              </div>

              <div className="flex items-start gap-2">
                <ImageIcon className="h-4 w-4 shrink-0" />
                {TEXTS.AVATAR_SQUARE}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailsSection>
  );
}
