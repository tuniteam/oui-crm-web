import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ORGANIZATION_DELETE_CARD } from '../constants/organizationDelete.constants';
import type { OrganizationDetail } from '../types/organizationDetail';
import { DeleteOrganizationWindow } from './DeleteOrganizationWindow';

type Props = {
  organization: OrganizationDetail;
  /** Ferme le panneau : la fiche supprimée n'a plus rien à montrer. */
  onClose: () => void;
};

/**
 * Ce qui touche à la fiche elle-même, et non à ce qu'elle contient.
 *
 * **La suppression quittait le pied de la Synthèse.** Elle y était atteignable
 * en faisant défiler un formulaire long, juste sous les champs qu'on venait de
 * remplir — un aplat rouge au bout du geste d'édition. La sortir dans son
 * propre onglet demande un choix délibéré : on ne tombe pas dessus, on y va.
 *
 * L'onglet accueillera l'archivage, la fusion de doublons et l'export ; il
 * n'est rendu qu'à qui a le droit de supprimer, donc jamais vide.
 */
export function OrganizationSettingsTab({ organization, onClose }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canDelete = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.DELETE),
  );

  if (!canDelete) return null;

  return (
    <div className="space-y-4" data-testid="organization-settings-tab">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <div className="text-sm font-semibold">
              {ORGANIZATION_DELETE_CARD.TITLE}
            </div>
            <div className="text-xs text-muted-foreground">
              {ORGANIZATION_DELETE_CARD.DESCRIPTION}
            </div>
          </div>
          {/* L'aplat rouge plein n'existe que là où l'action destructrice
              s'engage. Voir `docs/REGLE-BADGE-VS-BOUTON.md`. */}
          <Button
            type="button"
            variant="destructive"
            data-testid="organization-delete"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 />
            {ORGANIZATION_DELETE_CARD.TITLE}
          </Button>
        </CardContent>
      </Card>

      <DeleteOrganizationWindow
        counts={organization.counts}
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        organizationId={organization.id}
        organizationName={organization.name}
        onDeleted={onClose}
      />
    </div>
  );
}
