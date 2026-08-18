import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { AuthStatusCard } from '../AuthStatusCard';

type Props = {
  variant: 'expired' | 'invalid';
  onBackToLogin: () => void;
};

export function InvalidToken({ variant, onBackToLogin }: Props) {
  const content = useContent();
  const ui = content.activation.INVALID_TOKEN;

  const title = variant === 'expired' ? ui.EXPIRED.TITLE : ui.INVALID.TITLE;

  const description =
    variant === 'expired' ? ui.EXPIRED.DESCRIPTION : ui.INVALID.DESCRIPTION;

  const helper = variant === 'expired' ? ui.EXPIRED.HELPER : ui.INVALID.HELPER;

  return (
    <AuthStatusCard
      variant="destructive"
      icon={<AlertCircle className="h-8 w-8" aria-hidden="true" />}
      title={title}
      description={description}
      actions={
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBackToLogin}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {ui.BUTTON_BACK}
        </Button>
      }
    >
      {helper ? (
        <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          {helper}
        </div>
      ) : null}
    </AuthStatusCard>
  );
}
