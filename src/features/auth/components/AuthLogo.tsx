import { useTheme } from 'next-themes';
import { AUTH } from '../constants/auth.constants';

export function AuthLogo() {
  const { resolvedTheme } = useTheme();
  const logo =
    resolvedTheme === 'dark'
      ? '/media/app/default-logo-dark.svg'
      : '/media/app/default-logo.svg';

  return (
    <div className="flex justify-center mb-4">
      <img src={logo} alt={AUTH.UI.LOGO_ALT} className="h-8 w-auto" />
    </div>
  );
}
