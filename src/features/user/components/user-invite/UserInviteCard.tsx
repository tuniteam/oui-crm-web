import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { INVITE_USER_CARD } from '../../constants/invite-user.constants';
import type { UserStatus } from '../../types/userList';

type Props = {
  status: UserStatus;
  onInviteClick: () => void;
  isLoading: boolean;
};

export function UserInviteCard({ status, onInviteClick, isLoading }: Props) {
  const isDraft = status === 'DRAFT';

  const description = isDraft
    ? INVITE_USER_CARD.DESCRIPTION_DRAFT
    : INVITE_USER_CARD.DESCRIPTION_PENDING;

  const buttonLabel = isDraft
    ? INVITE_USER_CARD.BUTTON_DRAFT
    : INVITE_USER_CARD.BUTTON_PENDING;

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
