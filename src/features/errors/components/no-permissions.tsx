import { Fragment } from 'react/jsx-runtime';
import { authService } from '@/features/auth/services/auth.service';
import { LogOut } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NO_PERMISSIONS } from '../constants';

export function NoPermissions() {
  const handleClick = () => {
    authService.logout();
  };
  return (
    <Fragment>
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <img
          src={toAbsoluteUrl(NO_PERMISSIONS.IMAGES.LIGHT)}
          className="dark:hidden max-h-[160px]"
          alt={NO_PERMISSIONS.IMAGE_ALT}
        />
        <img
          src={toAbsoluteUrl(NO_PERMISSIONS.IMAGES.DARK)}
          className="light:hidden max-h-[160px]"
          alt={NO_PERMISSIONS.IMAGE_ALT}
        />
        <Badge
          variant="destructive"
          appearance="outline"
          className="mb-3 w-fit"
        >
          {NO_PERMISSIONS.TITLE}
        </Badge>

        <h3 className="text-2xl font-semibold text-mono text-center mb-2">
          {NO_PERMISSIONS.SUBTITLE}
        </h3>

        <div className="text-base text-center text-secondary-foreground mb-10">
          {NO_PERMISSIONS.DESCRIPTION}
        </div>

        <Button className="w-fit" onClick={handleClick}>
          <LogOut className="size-4 mr-2" />
          <span>{NO_PERMISSIONS.BUTTONS.RETRY_LABEL}</span>
        </Button>
      </div>
    </Fragment>
  );
}
