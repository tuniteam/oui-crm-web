import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { useReferenceLabels } from '@/features/settings/hooks/useReferenceLabels';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CUSTOMER_STATUS_LABELS,
  PRIORITY_LABELS,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import { useOrganization } from '../hooks/useOrganization';
import type { OrganizationDetail } from '../types/organizationDetail';
import { OrganizationRestrictedPane } from './OrganizationRestrictedPane';
import { OrganizationSummaryTab } from './OrganizationSummaryTab';

type Props = {
  organizationId: string | null;
  onOpenChange: (open: boolean) => void;
};

type PanelHooks = {
  organization: OrganizationDetail | null;
  loading: boolean;
  typeLabel: string | null;
  labelOf: ReturnType<typeof useReferenceLabels>['labelOf'];
};

/**
 * Panneau lateral d'un organisme — US-01-03.
 *
 * Panneau et non fenetre modale : c'est le `openDrawer` de la maquette V8, et
 * il laisse la liste visible derriere, ce qui compte quand on parcourt des
 * fiches a la suite.
 *
 * Les onglets Actions, Commercial, Client et Support de la maquette ne sont
 * pas rendus : leurs routes appartiennent a l'US-01-08 et aux lots L2/L4.
 * Mieux vaut deux onglets qui fonctionnent que six dont quatre sont vides.
 */
/**
 * Donnees du panneau.
 *
 * Hook nomme plutot qu'une fonction inline dans `useHooks` : les regles des
 * hooks s'y appliquent normalement, et le slot ne porte plus qu'un seul appel.
 */
function usePanelData(organizationId: string | null, open: boolean): PanelHooks {
  const { organization, loading } = useOrganization(
    organizationId ?? undefined,
    open,
  );
  const { labelOf } = useReferenceLabels();

  return {
    organization,
    loading,
    labelOf,
    typeLabel: organization
      ? labelOf('STRUCTURE_TYPE', organization.type)
      : null,
  };
}

export function OrganizationPanel({ organizationId, onOpenChange }: Props) {
  const open = !!organizationId;

  return (
    <ReusableSheet<PanelHooks>
      open={open}
      onOpenChange={onOpenChange}
      preventClose={false}
       
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={() => usePanelData(organizationId, open)}
      title={
        organizationId ? <PanelTitle organizationId={organizationId} /> : ''
      }
      renderHeaderExtra={({ organization, typeLabel, labelOf }) =>
        organization ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {[
                typeLabel ?? organization.type,
                organization.city,
                `Dépt. ${organization.department}`,
                organization.bracketLabel,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" appearance="outline">
                {SALES_STATUS_LABELS[organization.salesStatus]}
              </Badge>
              <Badge variant="secondary" appearance="outline">
                {CUSTOMER_STATUS_LABELS[organization.customerStatus]}
              </Badge>
              {organization.priority ? (
                <Badge variant="primary" appearance="outline">
                  {PRIORITY_LABELS[organization.priority]}
                </Badge>
              ) : null}
              {(organization.tags ?? []).map((t) => (
                <Badge key={t} variant="secondary" appearance="outline">
                  {labelOf('TAG', t) ?? t}
                </Badge>
              ))}
            </div>
          </div>
        ) : null
      }
      renderBody={({ organization, loading, typeLabel }) => {
        if (loading || !organization) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          );
        }

        if (organization.access === 'RESTRICTED') {
          return (
            <OrganizationRestrictedPane
              organization={organization}
              typeLabel={typeLabel}
            />
          );
        }

        // `key` : changer de fiche recree le formulaire avec les bonnes
        // valeurs initiales, plutot que de reinitialiser l'existant.
        return (
          <OrganizationSummaryTab
            key={organization.id}
            organization={organization}
          />
        );
      }}
    />
  );
}

/** Titre du panneau : le nom de la fiche, ou un squelette pendant le chargement. */
function PanelTitle({ organizationId }: { organizationId: string }) {
  const { organization } = useOrganization(organizationId);
  return organization ? (
    <span data-testid="organization-panel-title">{organization.name}</span>
  ) : (
    <Skeleton className="h-6 w-64" />
  );
}
