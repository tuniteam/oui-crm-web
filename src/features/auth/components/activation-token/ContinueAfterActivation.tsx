import { useState } from 'react';
import { useMeStore } from '@/contexts/useMeStore';
import { getAfterLoginRedirect } from '@/features/auth/utils/getAfterLoginRedirect';
import { useGetMe } from '@/features/user/hooks/useGetMe';
import { LoaderCircleIcon, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { AuthStatusCard } from '../AuthStatusCard';
import { AUTH_ROUTES } from '../../constants/routes.constants';

export function ContinueAfterActivation() {
  const content = useContent();
  const ui = content.activation.CONTINUE;

  const navigate = useNavigate();
  const meStore = useMeStore();

  const { refetch: fetchMe } = useGetMe();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setError(null);
      setLoading(true);

      // La session est deja ouverte par POST /auth/activation/complete : il
      // reste seulement a charger le profil pour connaitre la destination.
      await fetchMe();

      const redirectTo = getAfterLoginRedirect(meStore);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.ERROR_FALLBACK);
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthStatusCard
      title={ui.TITLE}
      description={ui.SUBTITLE}
      actions={
        <Button
          type="button"
          className="w-full"
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircleIcon
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              {ui.BUTTON_LOADING}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {ui.BUTTON}
            </span>
          )}
        </Button>
      }
    >
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </AuthStatusCard>
  );
}
