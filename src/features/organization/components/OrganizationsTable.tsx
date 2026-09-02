import { useCallback, useMemo, useState } from 'react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyTableComponent from '@/components/table/reusable-empty-table-component';
import { ReusableTable } from '@/components/table/reusable-table';
import {
  CUSTOMER_STATUS_LABELS,
  ORGANIZATIONS_UI,
  PRIORITY_LABELS,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import { useOrganizations } from '../hooks/useOrganizations';
import { useReferenceLabels } from '@/features/settings/hooks/useReferenceLabels';
import {
  CUSTOMER_STATUS_VALUES,
  PRIORITY_VALUES,
  SALES_STATUS_VALUES,
  type CustomerStatus,
  type OrganizationListItem,
  type OrganizationListParams,
  type Priority,
  type SalesStatus,
} from '../types/organizationList';
import { organizationColumns } from './organizationColumns';
import { OrganizationPanel } from './OrganizationPanel';

const ALL = 'ALL';
/** Un seul delai pour tous les filtres : cinq valeurs identiques disseminees
 *  finissent par diverger a la premiere retouche. */
const FILTER_DEBOUNCE_MS = 400;
const { SEARCH, EMPTY_STATE } = ORGANIZATIONS_UI;

/**
 * Liste des organismes — US-01-01, ecran Organismes de la maquette V8.
 *
 * La maquette propose dix filtres ; on cable ceux que l'API sert directement,
 * plus le compteur « fiches incompletes » (`completenessMax=99`), qui n'est pas
 * un filtre de sa barre mais son raccourci de tete de page.
 *
 * Deux filtres de la V8 restent de cote : la strate, que l'API ne filtre pas,
 * et le commercial, qui demande la liste des membres du projet.
 */
export default function OrganizationsTable() {
  const hasPermission = useMeStore((s) => s.hasPermission);
  const { labelOf, optionsOf } = useReferenceLabels();

  const [type, setType] = useState<string>(ALL);
  const [salesStatus, setSalesStatus] = useState<string>(ALL);
  const [customerStatus, setCustomerStatus] = useState<string>(ALL);
  const [priority, setPriority] = useState<string>(ALL);
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  /** Fiche ouverte dans le panneau lateral, ou `null`. */
  const [openedId, setOpenedId] = useState<string | null>(null);

  const debouncedType = useDebouncedValue(type, FILTER_DEBOUNCE_MS);
  const debouncedSalesStatus = useDebouncedValue(salesStatus, FILTER_DEBOUNCE_MS);
  const debouncedCustomerStatus = useDebouncedValue(customerStatus, FILTER_DEBOUNCE_MS);
  const debouncedPriority = useDebouncedValue(priority, FILTER_DEBOUNCE_MS);
  const debouncedIncompleteOnly = useDebouncedValue(incompleteOnly, FILTER_DEBOUNCE_MS);

  const hasActiveFilters =
    debouncedType !== ALL ||
    debouncedSalesStatus !== ALL ||
    debouncedCustomerStatus !== ALL ||
    debouncedPriority !== ALL ||
    debouncedIncompleteOnly;

  const typeOptions = useMemo(() => optionsOf('STRUCTURE_TYPE'), [optionsOf]);

  const columns = useMemo(
    () => organizationColumns(labelOf, setOpenedId),
    [labelOf],
  );

  const getData = useCallback(
    (r: ReturnType<typeof useOrganizations>) => r.organizations,
    [],
  );
  const getMeta = useCallback(
    (r: ReturnType<typeof useOrganizations>) => r.meta,
    [],
  );

  const headerFilters = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger data-testid="organization-filter-type" className="w-52">
            <SelectValue placeholder={SEARCH.TYPE_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{SEARCH.ALL_TYPES}</SelectItem>
            {typeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={salesStatus} onValueChange={setSalesStatus}>
          <SelectTrigger
            data-testid="organization-filter-sales-status"
            className="w-56"
          >
            <SelectValue placeholder={SEARCH.ALL_SALES_STATUSES} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{SEARCH.ALL_SALES_STATUSES}</SelectItem>
            {SALES_STATUS_VALUES.map((v) => (
              <SelectItem key={v} value={v}>
                {SALES_STATUS_LABELS[v]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={customerStatus} onValueChange={setCustomerStatus}>
          <SelectTrigger
            data-testid="organization-filter-customer-status"
            className="w-56"
          >
            <SelectValue placeholder={SEARCH.ALL_CUSTOMER_STATUSES} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{SEARCH.ALL_CUSTOMER_STATUSES}</SelectItem>
            {CUSTOMER_STATUS_VALUES.map((v) => (
              <SelectItem key={v} value={v}>
                {CUSTOMER_STATUS_LABELS[v]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger
            data-testid="organization-filter-priority"
            className="w-44"
          >
            <SelectValue placeholder={SEARCH.ALL_PRIORITIES} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{SEARCH.ALL_PRIORITIES}</SelectItem>
            {PRIORITY_VALUES.map((v) => (
              <SelectItem key={v} value={v}>
                {PRIORITY_LABELS[v]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            data-testid="organization-filter-incomplete"
            checked={incompleteOnly}
            onCheckedChange={setIncompleteOnly}
          />
          {SEARCH.INCOMPLETE_ONLY}
        </Label>
      </div>
    ),
    [type, salesStatus, customerStatus, priority, incompleteOnly, typeOptions],
  );

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) =>
      ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        type: debouncedType === ALL ? undefined : debouncedType,
        salesStatus:
          debouncedSalesStatus === ALL
            ? undefined
            : (debouncedSalesStatus as SalesStatus),
        customerStatus:
          debouncedCustomerStatus === ALL
            ? undefined
            : (debouncedCustomerStatus as CustomerStatus),
        priority:
          debouncedPriority === ALL
            ? undefined
            : (debouncedPriority as Priority),
        // 99 et non 100 : le contrat est inclusif, 100 ramenerait toute la base.
        completenessMax: debouncedIncompleteOnly ? 99 : undefined,
      }) satisfies OrganizationListParams,
    [
      debouncedType,
      debouncedSalesStatus,
      debouncedCustomerStatus,
      debouncedPriority,
      debouncedIncompleteOnly,
    ],
  );

  return (
    <>
      <OrganizationPanel
        organizationId={openedId}
        onOpenChange={(next) => !next && setOpenedId(null)}
      />
      <ReusableTable<
      OrganizationListItem,
      OrganizationListParams,
      ReturnType<typeof useOrganizations>
    >
      columns={columns}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useData={(params) => useOrganizations(params)}
      getData={getData}
      getMeta={getMeta}
      buildParams={buildParams}
      enableSearch
      searchPlaceholder={SEARCH.PLACEHOLDER}
      searchToolTipText={SEARCH.TOOLTIP}
      headerFilters={headerFilters}
      hasActiveFilters={hasActiveFilters}
      defaultPageSize={10}
      emptyTableMessage={
        <EmptyTableComponent
          hasPermission={hasPermission(PERMISSIONS.ORGANIZATIONS.CREATE)}
          illustration={EMPTY_STATE.ILLUSTRATION}
          title={EMPTY_STATE.TITLE}
          description={[...EMPTY_STATE.DESCRIPTION]}
          tip={{
            title: EMPTY_STATE.TIP.TITLE,
            content: EMPTY_STATE.TIP.CONTENT,
          }}
          />
        }
      />
    </>
  );
}
