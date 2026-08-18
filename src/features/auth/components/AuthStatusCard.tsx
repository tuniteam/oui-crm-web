import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AuthLogo } from './AuthLogo';

type AuthStatusVariant = 'neutral' | 'destructive';

type Props = {
  /** Icon element (e.g. a lucide icon sized h-8 w-8). Rendered in a circle. */
  icon?: ReactNode;
  variant?: AuthStatusVariant;
  title: string;
  description?: ReactNode;
  /** Optional extra content (info box, etc.) shown between description and actions. */
  children?: ReactNode;
  /** Action button(s). */
  actions?: ReactNode;
};

/**
 * Common layout for standalone auth status screens (token confirmation,
 * activation, errors): logo + circled icon + title + description + actions,
 * inside a consistent card. Used by pages rendered outside BrandedLayout.
 */
export function AuthStatusCard({
  icon,
  variant = 'neutral',
  title,
  description,
  children,
  actions,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm sm:p-8">
      <AuthLogo />

      {icon && (
        <div className="mb-4 flex justify-center">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full',
              variant === 'destructive'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-foreground',
            )}
          >
            {icon}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-semibold">{title}</h1>

      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}

      {children && <div className="mt-5">{children}</div>}

      {actions && <div className="mt-6 space-y-3">{actions}</div>}
    </div>
  );
}
