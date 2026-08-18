// src/features/users/components/UserDetailsLink.tsx
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { COMMON } from '@/constants/common';
import { USER_ROUTES } from '../constants/user.routes';

type Props = {
  userId: string;
  getPath?: (userId: string) => string;
};

export function UserDetailsLink({ userId, getPath }: Props) {
 

  if (!getPath) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          data-testid={`user-view-${userId}`}
          to={getPath ? getPath(userId) : USER_ROUTES.USER_DETAILS(userId)}
          className="text-brand-secondary hover:opacity-80"
        >
          <Eye size={18} />
        </Link>
      </TooltipTrigger>
      <TooltipContent>{COMMON.ACTIONS.VIEW}</TooltipContent>
    </Tooltip>
  );
}
