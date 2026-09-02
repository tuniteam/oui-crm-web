import { Info } from 'lucide-react';
import {
  CUSTOMER_STATUS_LABELS,
  ORGANIZATIONS_UI,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import type { OrganizationDetail } from '../types/organizationDetail';

const { RESTRICTED, LABELS, EMPTY_VALUE, UNASSIGNED } = ORGANIZATION_DETAIL_UI;

type Props = {
  organization: OrganizationDetail;
  /** Libelle du type, resolu par l'appelant depuis les referentiels. */
  typeLabel: string | null;
};

/**
 * Fiche hors perimetre — `access: "RESTRICTED"`.
 *
 * Le serveur ne rend que neuf champs : on n'affiche donc que ceux-la, sans
 * onglets ni formulaire. C'est le `openDrawerRestreint` de la maquette V8, y
 * compris son explication — elle repond a la question que se pose
 * l'utilisateur (« pourquoi je vois cette fiche sans pouvoir l'ouvrir ? »).
 */
export function OrganizationRestrictedPane({ organization, typeLabel }: Props) {
  const rows = [
    [LABELS.TYPE, typeLabel ?? organization.type],
    [LABELS.CITY, organization.city ?? EMPTY_VALUE],
    [LABELS.DEPARTMENT, organization.department],
    [LABELS.SALES_STATUS, SALES_STATUS_LABELS[organization.salesStatus]],
    [LABELS.CUSTOMER_STATUS, CUSTOMER_STATUS_LABELS[organization.customerStatus]],
    [LABELS.SALES_REP, organization.salesRep?.fullName ?? UNASSIGNED],
  ];

  return (
    <div className="space-y-5">
      <div
        data-testid="organization-restricted-notice"
        className="flex gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">{RESTRICTED.TITLE}</p>
          <p className="text-sm text-muted-foreground">{RESTRICTED.BODY}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="space-y-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-muted-foreground">
        {ORGANIZATIONS_UI.RESTRICTED.HINT}
      </p>
    </div>
  );
}
