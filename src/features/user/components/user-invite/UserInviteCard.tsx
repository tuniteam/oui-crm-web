import { Send } from 'lucide-react';
import { ActionCard } from '@/components/shared/ActionCard';
import { Button } from '@/components/ui/button';
import { INVITE_USER_CARD } from '../../constants/invite-user.constants';

type Props = {
  onInviteClick: () => void;
  isLoading: boolean;
};

/**
 * Renvoi du lien d'activation. Il n'y a plus d'etat DRAFT au contrat : un
 * compte cree part deja avec son e-mail, la carte ne fait que relancer.
 *
 * Elle reprenait la disposition d'`ActionCard` a l'identique — troisieme copie
 * sur le meme ecran — et s'en distinguait par ses marges et la taille de son
 * icone. Elle la partage desormais.
 */
export function UserInviteCard({ onInviteClick, isLoading }: Props) {
  return (
    <ActionCard
      testId="user-invite-card"
      label={INVITE_USER_CARD.TITLE}
      description={INVITE_USER_CARD.DESCRIPTION_PENDING}
    >
      <Button
        variant="primary"
        onClick={onInviteClick}
        disabled={isLoading}
        data-testid="user-invite"
      >
        <Send />
        {INVITE_USER_CARD.BUTTON_PENDING}
      </Button>
    </ActionCard>
  );
}
