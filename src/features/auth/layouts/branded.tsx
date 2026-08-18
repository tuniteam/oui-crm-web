import { Outlet } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { AUTH } from '../constants/auth.constants';
import { AUTH_ILLUSTRATIONS } from '../constants/constants';

export function BrandedLayout() {
  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl(AUTH_ILLUSTRATIONS.LOGIN_LIGHT)}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl(AUTH_ILLUSTRATIONS.LOGIN_DARK)}');
          }
        `}
      </style>

      <div className="grid lg:grid-cols-2 grow">
        {/* Auth Card */}
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Card className="w-full max-w-[400px]">
            <CardContent className="p-6">
              <Outlet />
              <p className="text-center text-xs text-muted-foreground pt-6">
                {AUTH.UI.COPYRIGHT(new Date().getFullYear())}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Illustration (lg+) */}
        <div
          className="
            hidden lg:block
            lg:rounded-xl lg:border lg:border-border lg:m-5
            order-1 lg:order-2
            bg-top xxl:bg-center xl:bg-cover bg-no-repeat
            branded-bg
          "
        />
      </div>
    </>
  );
}
