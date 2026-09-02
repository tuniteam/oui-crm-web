// src/features/users/components/UserDetailsLink.tsx
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { COMMON } from '@/constants/common';

type Props = {
  userId: string;
  getPath?: (userId: string) => string;
};

export function UserDetailsLink({ userId, getPath }: Props) {
 

  /*
   * Chemin relatif par defaut : depuis `/users` comme depuis
   * `/:projectId/users`, `<id>/informations` resout vers la bonne route sans
   * que le composant ait a connaitre le projet.
   *
   * L'ancien garde `if (!getPath) return null` vidait la colonne Actions
   * partout ou la prop n'etait pas passee — c'est-a-dire dans la liste des
   * utilisateurs du projet, ou plus rien ne permettait d'ouvrir une fiche.
   */
  const to = getPath ? getPath(userId) : `${userId}/informations`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          data-testid={`user-view-${userId}`}
          to={to}
          className="text-brand-secondary hover:opacity-80"
        >
          <Eye size={18} />
        </Link>
      </TooltipTrigger>
      <TooltipContent>{COMMON.ACTIONS.VIEW}</TooltipContent>
    </Tooltip>
  );
}
