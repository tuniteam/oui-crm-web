// src/pages/ProfilePage.tsx
import { useState } from 'react';
import { ChangeEmailWindow } from '@/features/auth/components/email-change/ChangeEmailWindow';
import { ChangePasswordWindow } from '@/features/profile/components/changePassword/ChangePasswordWindow';
import { AccessSection } from '@/features/profile/components/profileDetails/AccessSection';
import { PersonalInformations } from '@/features/profile/components/profileDetails/PersonalInformations';
import { SecuritySection } from '@/features/profile/components/profileDetails/SecuritySection';
import { ProfilePageSkeleton } from '@/features/profile/components/profileDetails/skeleton/ProfilePageSkeleton';
import { UserAvatar } from '@/features/profile/components/profileDetails/UserAvatar';
import { AvatarEditWindow } from '@/features/profile/components/avatarEdit/AvatarEditWindow';
import { UpdateProfileWindow } from '@/features/profile/components/updateProfile/UpdateProfileWindow';
import { useGetMyProfile } from '@/features/profile/hooks/useGetMyProfile';
import { useContent } from '@/hooks/useContent';

export default function ProfilePage() {
  const { profile: profileContent } = useContent();
  const { data: profile, isLoading } = useGetMyProfile();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false);
  const [avatarEditOpen, setAvatarEditOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">
            {profileContent.PAGE_TITLE}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:auto-rows-fr">
          <div className="flex h-full flex-col rounded-xl border bg-card p-4">
            <div className="flex-1">
              <PersonalInformations
                profile={profile}
                onEdit={() => setUpdateProfileOpen(true)}
              />
            </div>
          </div>

          <div className="flex h-full flex-col rounded-xl border bg-card p-4">
            <div className="flex-1">
              <UserAvatar
                firstName={profile.firstName}
                lastName={profile.lastName}
                avatarUrl={profile.avatarUrl}
                onEditAvatar={() => setAvatarEditOpen(true)}
              />
            </div>
          </div>

          <div className="flex h-full flex-col rounded-xl border bg-card p-4">
            <div className="flex-1">
              <AccessSection
                profile={profile}
                onChangeEmail={() => setChangeEmailOpen(true)}
              />
            </div>
          </div>

          <div className="flex h-full flex-col rounded-xl border bg-card p-4">
            <div className="flex-1">
              <SecuritySection
                onChangePassword={() => setChangePasswordOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordWindow
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      <ChangeEmailWindow
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
      />

      <UpdateProfileWindow
        open={updateProfileOpen}
        onOpenChange={setUpdateProfileOpen}
      />

      <AvatarEditWindow
        open={avatarEditOpen}
        onOpenChange={setAvatarEditOpen}
        initialAvatarUrl={profile.avatarUrl}
        firstName={profile.firstName}
        lastName={profile.lastName}
      />
    </>
  );
}
