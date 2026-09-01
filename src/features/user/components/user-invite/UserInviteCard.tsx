import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { INVITE_USER_CARD } from '../../constants/invite-user.constants';

type Props = {
  onInviteClick: () => void;
  isLoading: boolean;
};

/**
 * Renvoi du lien d'activation. Il n'y a plus d'etat DRAFT au contrat : un
 * compte cree part deja avec son e-mail, la carte ne fait que relancer.
 */
export function UserInviteCard({ onInviteClick, isLoading }: Props) {
  const description = INVITE_USER_CARD.DESCRIPTION_PENDING;
  const buttonLabel = INVITE_USER_CARD.BUTTON_PENDING;

  return (
    <Card className="my-4">
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div>
          <div className="text-sm font-semibold">
            {INVITE_USER_CARD.TITLE}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>

        <Button variant="primary" onClick={onInviteClick} disabled={isLoading}>
          <Send className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
