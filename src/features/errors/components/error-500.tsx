import { Fragment } from 'react/jsx-runtime';
import { RotateCw } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ERROR_500 } from '../constants';

export function Error500() {
  const handleClick = () => {
    window.location.reload();
  };
  return (
    <Fragment>
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <img
          src={toAbsoluteUrl(ERROR_500.IMAGES.LIGHT)}
          className="dark:hidden max-h-[160px]"
          alt={ERROR_500.IMAGE_ALT}
        />
        <img
          src={toAbsoluteUrl(ERROR_500.IMAGES.DARK)}
          className="light:hidden max-h-[160px]"
          alt={ERROR_500.IMAGE_ALT}
        />
        <Badge
          variant="destructive"
          appearance="outline"
          className="mb-3 w-fit"
        >
          {ERROR_500.TITLE}
        </Badge>

        <h3 className="text-2xl font-semibold text-mono text-center mb-2">
          {ERROR_500.SUBTITLE}
        </h3>

        <div className="text-base text-center text-secondary-foreground mb-10">
          {ERROR_500.DESCRIPTION}
        </div>

        <Button className="w-fit" onClick={handleClick}>
          <RotateCw className="size-4 mr-2" />
          <span>{ERROR_500.BUTTONS.RETRY_LABEL}</span>
        </Button>
      </div>
    </Fragment>
  );
}
