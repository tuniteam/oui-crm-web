import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FILTER_ALL, FILTER_DEBOUNCE_MS, PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { CirclePlus, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { CREATE_ORGANIZATION_UI } from '../constants/organizationCreate.constants';
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
import { CreateOrganizationWindow } from './CreateOrganizationWindow';
import { OrganizationPanel } from './OrganizationPanel';
import { OrganizationsBulkBar } from './OrganizationsBulkBar';
import type { BulkFilters } from '../types/bulk';

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
/**
 * Les filtres d'une liste, moins ce qui ne designe qu'une page.
 *
 * `selectAll` porte sur un **ensemble**, pas sur un ecran : le contrat refuse
 * `page`, `limit`, `sort` et `order`.
 */
/** Ce que `filters` ne doit pas porter : le contrat agit sur tout l'ensemble. */
const PAGINATION_KEYS = ['page', 'limit', 'sort', 'order'] as const;

function stripPagination(params: OrganizationListParams | null): BulkFilters {
  if (!params) return {};
  const filters: OrganizationListParams = { ...params };
  for (const key of PAGINATION_KEYS) delete filters[key];
  return filters;
}

export default function OrganizationsTable() {
  const hasPermission = useMeStore((s) => s.hasPermission);
  const { labelOf, optionsOf } = useReferenceLabels();

  const [type, setType] = useState<string>(FILTER_ALL);
  const [salesStatus, setSalesStatus] = useState<string>(FILTER_ALL);
  const [customerStatus, setCustomerStatus] = useState<string>(FILTER_ALL);
  const [priority, setPriority] = useState<string>(FILTER_ALL);
  const [department, setDepartment] = useState('');
  const [solution, setSolution] = useState<string>(FILTER_ALL);
  const [tag, setTag] = useState<string>(FILTER_ALL);
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const canCreate = hasPermission(PERMISSIONS.ORGANIZATIONS.CREATE);
  /** Fiche ouverte dans le panneau lateral, ou `null`. */
  // La fiche ouverte vit dans l'URL : elle survit au rafraichissement, et une
  // fiche peut etre proposee depuis ailleurs — un doublon signale a la
  // creation, par exemple.
  const [params, setParams] = useSearchParams();
  const openedId = params.get(ORGANIZATIONS_UI.PANEL_PARAM);
  // Mise a jour fonctionnelle : sans elle le callback dependrait de `params`,
  // et les colonnes memorisees garderaient une version perimee qui effacerait
  // les autres parametres de l'URL.
  const setOpenedId = useCallback(
    (id: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set(ORGANIZATIONS_UI.PANEL_PARAM, id);
          else next.delete(ORGANIZATIONS_UI.PANEL_PARAM);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const debouncedType = useDebouncedValue(type, FILTER_DEBOUNCE_MS);
  const debouncedSalesStatus = useDebouncedValue(salesStatus, FILTER_DEBOUNCE_MS);
  const debouncedCustomerStatus = useDebouncedValue(customerStatus, FILTER_DEBOUNCE_MS);
  const debouncedPriority = useDebouncedValue(priority, FILTER_DEBOUNCE_MS);
  const debouncedDepartment = useDebouncedValue(department, FILTER_DEBOUNCE_MS);
  const debouncedSolution = useDebouncedValue(solution, FILTER_DEBOUNCE_MS);
  const debouncedTag = useDebouncedValue(tag, FILTER_DEBOUNCE_MS);
  const debouncedIncompleteOnly = useDebouncedValue(incompleteOnly, FILTER_DEBOUNCE_MS);

  const hasActiveFilters =
    debouncedType !== FILTER_ALL ||
    debouncedSalesStatus !== FILTER_ALL ||
    debouncedCustomerStatus !== FILTER_ALL ||
    debouncedPriority !== FILTER_ALL ||
    debouncedDepartment.trim() !== '' ||
    debouncedSolution !== FILTER_ALL ||
    debouncedTag !== FILTER_ALL ||
    debouncedIncompleteOnly;

  const resetFilters = useCallback(() => {
    setType(FILTER_ALL);
    setSalesStatus(FILTER_ALL);
    setCustomerStatus(FILTER_ALL);
    setPriority(FILTER_ALL);
    setDepartment('');
    setSolution(FILTER_ALL);
    setTag(FILTER_ALL);
    setIncompleteOnly(false);
  }, []);

  const typeOptions = useMemo(() => optionsOf('STRUCTURE_TYPE'), [optionsOf]);
  const solutionOptions = useMemo(() => optionsOf('SOLUTION'), [optionsOf]);
  const tagOptions = useMemo(() => optionsOf('TAG'), [optionsOf]);

  const columns = useMemo(
    () => organizationColumns(labelOf, setOpenedId),
    [labelOf, setOpenedId],
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
            <SelectItem value={FILTER_ALL}>{SEARCH.ALL_TYPES}</SelectItem>
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
            <SelectItem value={FILTER_ALL}>{SEARCH.ALL_SALES_STATUSES}</SelectItem>
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
            <SelectItem value={FILTER_ALL}>{SEARCH.ALL_CUSTOMER_STATUSES}</SelectItem>
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
            <SelectItem value={FILTER_ALL}>{SEARCH.ALL_PRIORITIES}</SelectItem>
            {PRIORITY_VALUES.map((v) => (
              <SelectItem key={v} value={v}>
                {PRIORITY_LABELS[v]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Departement : saisie libre plutot qu'un selecteur. La V8 construit
            sa liste depuis les fiches affichees ; ici la liste est paginee, et
            les departements de la page courante ne sont pas ceux de la base. */}
        <Input
          data-testid="organization-filter-department"
          value={department}
          onChange={(e) => setDepartment(e.target.value.toUpperCase())}
          placeholder={SEARCH.DEPARTMENT_PLACEHOLDER}
          className="w-36"
          maxLength={3}
        />

        <Select value={solution} onValueChange={setSolution}>
          <SelectTrigger
            data-testid="organization-filter-solution"
            className="w-52"
          >
            <SelectValue placeholder={SEARCH.ALL_SOLUTIONS} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>{SEARCH.ALL_SOLUTIONS}</SelectItem>
            {solutionOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger data-testid="organization-filter-tag" className="w-48">
            <SelectValue placeholder={SEARCH.ALL_TAGS} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>{SEARCH.ALL_TAGS}</SelectItem>
            {tagOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
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

        {/* En bout de barre, comme la V8, et seulement s'il y a quelque chose
            a remettre a zero. */}
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            data-testid="organization-filters-reset"
            onClick={resetFilters}
            className="gap-1.5 text-muted-foreground"
          >
            <RotateCcw className="size-3.5" />
            {SEARCH.RESET}
          </Button>
        ) : null}
      </div>
    ),
    [
      type,
      salesStatus,
      customerStatus,
      priority,
      department,
      solution,
      tag,
      incompleteOnly,
      typeOptions,
      solutionOptions,
      tagOptions,
      hasActiveFilters,
      resetFilters,
    ],
  );

  /**
   * Les filtres **effectivement envoyés** par la liste, mémorisés au vol.
   *
   * `selectAll` les rejoue côté serveur : les reconstruire ailleurs les ferait
   * diverger tôt ou tard, et l'action porterait alors sur un autre ensemble
   * que celui qu'on regarde — sur une suppression, ce serait grave.
   */
  const lastParams = useRef<OrganizationListParams | null>(null);
  // Le formateur ne l'a pas : ni cases à cocher, ni barre.
  const canBulk = useMeStore((s) => s.hasPermission(PERMISSIONS.ORGANIZATIONS.BULK));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionKey, setSelectionKey] = useState(0);
  const [total, setTotal] = useState(0);

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) => {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        type: debouncedType === FILTER_ALL ? undefined : debouncedType,
        salesStatus:
          debouncedSalesStatus === FILTER_ALL
            ? undefined
            : (debouncedSalesStatus as SalesStatus),
        customerStatus:
          debouncedCustomerStatus === FILTER_ALL
            ? undefined
            : (debouncedCustomerStatus as CustomerStatus),
        priority:
          debouncedPriority === FILTER_ALL
            ? undefined
            : (debouncedPriority as Priority),
        department: debouncedDepartment.trim() || undefined,
        solution: debouncedSolution === FILTER_ALL ? undefined : debouncedSolution,
        tag: debouncedTag === FILTER_ALL ? undefined : debouncedTag,
        // 99 et non 100 : le contrat est inclusif, 100 ramenerait toute la base.
        completenessMax: debouncedIncompleteOnly ? 99 : undefined,
      } satisfies OrganizationListParams;
      lastParams.current = params;
      return params;
    },
    [
      debouncedType,
      debouncedSalesStatus,
      debouncedCustomerStatus,
      debouncedPriority,
      debouncedDepartment,
      debouncedSolution,
      debouncedTag,
      debouncedIncompleteOnly,
    ],
  );

  return (
    <>
      <CreateOrganizationWindow
        open={openCreate}
        onOpenChange={setOpenCreate}
        // On enchaine sur la fiche creee : c'est la ou l'utilisateur va
        // completer ce que la creation ne demande pas.
        onCreated={(id) => setOpenedId(id)}
      />
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
       
      useData={useOrganizations}
      getData={getData}
      getMeta={getMeta}
      buildParams={buildParams}
      /* `key` : vider la sélection après une action groupée demande de
         remonter la table, qui garde son état de cases cochées. */
      key={selectionKey}
      enableRowSelection={canBulk}
      onSelectedIdsChange={setSelectedIds}
      onDataChange={(result) => setTotal(result.meta?.total ?? 0)}
      subHeader={
        canBulk && selectedIds.length > 0 ? (
          <OrganizationsBulkBar
            ids={selectedIds}
            total={total}
            /* Les filtres tels que la liste les a envoyés — jamais une copie
               reconstruite, qui divergerait. */
            filters={stripPagination(lastParams.current)}
            onClear={() => setSelectionKey((k) => k + 1)}
            onDone={(done) => {
              setSelectionKey((k) => k + 1);
              /*
               * La fiche ouverte vit dans l'URL : une suppression groupee qui
               * l'emporte laisserait le panneau ouvert sur une fiche disparue,
               * que le rechargement ferait echouer en 404. En `selectAll` on
               * ne sait pas ce qui a ete pris — la fermer est le seul choix
               * sur.
               */
              if (
                done.action === 'DELETE' &&
                openedId &&
                (done.allMatching || done.ids.includes(openedId))
              ) {
                setOpenedId(null);
              }
            }}
          />
        ) : null
      }
      enableSearch
      searchPlaceholder={SEARCH.PLACEHOLDER}
      searchToolTipText={SEARCH.TOOLTIP}
      headerFilters={headerFilters}
      hasActiveFilters={hasActiveFilters}
      defaultPageSize={10}
      toolbarActions={
        canCreate ? (
          <Button
            data-testid="organization-create-btn"
            onClick={() => setOpenCreate(true)}
          >
            <CirclePlus />
            {CREATE_ORGANIZATION_UI.TITLE}
          </Button>
        ) : null
      }
      emptyTableMessage={
        <EmptyTableComponent
          hasPermission={canCreate}
          illustration={EMPTY_STATE.ILLUSTRATION}
          title={EMPTY_STATE.TITLE}
          description={[...EMPTY_STATE.DESCRIPTION]}
          tip={{
            title: EMPTY_STATE.TIP.TITLE,
            content: EMPTY_STATE.TIP.CONTENT,
          }}
          onClick={() => setOpenCreate(true)}
          buttonIcon={<CirclePlus />}
          buttonText={CREATE_ORGANIZATION_UI.TITLE}
          buttonId="organization-create-btn"
          />
        }
      />
    </>
  );
}
