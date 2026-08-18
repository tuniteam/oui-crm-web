import { cn } from '@/lib/utils';
import { useState } from 'react';

type Props = {
  avatarUrl?: string | null;
  initials: string;
  fullName: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function ProfileAvatar({
  avatarUrl,
  initials,
  fullName,
  className,
  imageClassName,
  fallbackClassName,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (avatarUrl && !failed) {
    return (
      <div
        className={cn(
          'relative aspect-square shrink-0 overflow-hidden rounded-full',
          className,
        )}
      >
        <img
          src={avatarUrl}
          alt={fullName}
          className={cn('h-full w-full object-cover', imageClassName)}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-semibold text-muted-foreground',
        className,
        fallbackClassName,
      )}
      aria-label={fullName}
      role="img"
    >
      {initials}
    </div>
  );
}
