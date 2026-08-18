import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CORRECT_EMAIL } from '../../constants/correct-email.constants';
import { INVITABLE_STATUSES } from '../../constants/invite-user.constants';
import type { UserStatus } from '../../types/userList';

type Props = {
  status: UserStatus;
  onCorrectClick: () => void;
};

const C = CORRECT_EMAIL.CARD;

/** Carte "Corriger l'email" — action active uniquement pour un compte non activé. */
export function CorrectEmailCard({ status, onCorrectClick }: Props) {
  // Comptes non activés (DRAFT / PENDING) = mêmes statuts qu'invitables.
  const enabled = INVITABLE_STATUSES.includes(status);

  const button = (
    <Button variant="outline" onClick={onCorrectClick} disabled={!enabled}>
      <Mail className="mr-2 h-4 w-4" />
      {C.BUTTON}
    </Button>
  );

  return (
    <Card className="my-4">
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div>
          <div className="text-sm font-semibold">{C.TITLE}</div>
          <div className="text-xs text-muted-foreground">{C.DESCRIPTION}</div>
        </div>

        {enabled ? (
          button
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>{button}</span>
            </TooltipTrigger>
            <TooltipContent>{CORRECT_EMAIL.DISABLED_TOOLTIP}</TooltipContent>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
}
