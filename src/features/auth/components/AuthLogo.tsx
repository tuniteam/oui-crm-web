import { useTheme } from 'next-themes';

export function AuthLogo() {
  const { resolvedTheme } = useTheme();
  const logo =
    resolvedTheme === 'dark'
      ? '/media/app/default-logo-dark.svg'
      : '/media/app/default-logo.svg';

  return (
    <div className="flex justify-center mb-4">
      <img src={logo} alt="SOFT-M" className="h-8 w-auto" />
    </div>
  );
}
