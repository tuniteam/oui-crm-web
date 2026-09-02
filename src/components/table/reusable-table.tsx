// src/components/table/reusable-table.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ACTIONS_COLUMN_ID, COMMON, UI } from '@/constants';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, ListFilter, RotateCcw, Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ReusableTableSkeleton } from './ReusableTableSkeleton';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DataHookResult<TData> {
  data: TData[];
  meta?: PaginationMeta;
  loading?: boolean;
}

export interface ReusableTableProps<
  TData,
  TParams,
  THookResult = DataHookResult<TData>,
> {
  getLoading?: (result: THookResult) => boolean;
  columns: ColumnDef<TData>[];
  useData: (params: TParams) => THookResult;
  getData: (result: THookResult) => TData[];
  getMeta?: (result: THookResult) => PaginationMeta | undefined;
  buildParams: (
    pagination: PaginationState,
    search: string,
    sorting: SortingState,
  ) => TParams;
  onDataChange?: (data: THookResult) => void;
  emptyTableMessage?: React.ReactNode;
  showHeader?: boolean;
  searchPlaceholder?: string;
  initialSorting?: SortingState;
  defaultPageSize?: number;
  enableSearch?: boolean;
  hasActiveFilters?: boolean;
  headerFilters?: React.ReactNode;
  collapsibleFilters?: React.ReactNode;
  collapsibleFiltersCount?: number;
  onResetCollapsibleFilters?: () => void;
  activeFilterChips?: Array<{ label: string; onRemove: () => void }>;
  toolbarActions?: React.ReactNode;
  searchToolTipText?: string;

  tableLayout?: {
    columnsPinnable?: boolean;
    columnsResizable?: boolean;
    columnsMovable?: boolean;
    columnsVisibility?: boolean;
  };

  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  /**
   * Notifie l'ensemble des ids sélectionnés, toutes pages confondues (la
   * sélection interne persiste par id). À préférer à `onRowSelectionChange`
   * pour une sélection cross-page : pas de réconciliation côté parent.
   */
  onSelectedIdsChange?: (ids: string[]) => void;
  subHeader?: React.ReactNode;
}

export function ReusableTable<
  TData extends { id: string },
  TParams,
  THookResult = DataHookResult<TData>,
>({
  getLoading = (result: THookResult) =>
    (result as DataHookResult<TData>).loading ?? false,
  columns,
  useData,
  getData,
  getMeta = (result: THookResult) => (result as DataHookResult<TData>).meta,
  buildParams,
  onDataChange,
  searchToolTipText,
  emptyTableMessage,
  showHeader = true,
  searchPlaceholder = UI.TABLE.SEARCH_PLACEHOLDER,
  initialSorting = [],
  defaultPageSize = 10,
  enableSearch = true,
  headerFilters,
  collapsibleFilters,
  collapsibleFiltersCount = 0,
  onResetCollapsibleFilters,
  toolbarActions,
  hasActiveFilters = false,
  activeFilterChips,
  tableLayout = {
    columnsPinnable: true,
    columnsResizable: true,
    columnsMovable: true,
    columnsVisibility: true,
  },
  enableRowSelection = false,
  onRowSelectionChange,
  onSelectedIdsChange,
  subHeader,
}: ReusableTableProps<TData, TParams, THookResult>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const apiParams: TParams = useMemo(() => {
    return buildParams(pagination, debouncedSearch, sorting);
  }, [pagination, debouncedSearch, sorting, buildParams]);

  const hookResult = useData(apiParams);
  const data = getData(hookResult);
  const meta = getMeta(hookResult);
  const loading = getLoading(hookResult);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showCollapsibleFilters, setShowCollapsibleFilters] = useState(false);

  const prevFiltersCount = useRef(collapsibleFiltersCount);
  useEffect(() => {
    if (collapsibleFiltersCount > prevFiltersCount.current) {
      setShowCollapsibleFilters(false);
    }
    prevFiltersCount.current = collapsibleFiltersCount;
  }, [collapsibleFiltersCount]);

  const checkboxColumn = useMemo<ColumnDef<TData>[]>(
    () =>
      enableRowSelection
        ? [
            {
              id: 'select',
              header: ({ table: t }) => (
                <Checkbox
                  checked={
                    t.getIsAllPageRowsSelected() ||
                    (t.getIsSomePageRowsSelected() && 'indeterminate')
                  }
                  onCheckedChange={(v) => t.toggleAllPageRowsSelected(!!v)}
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(v) => row.toggleSelected(!!v)}
                />
              ),
              size: 40,
              enableSorting: false,
              enableHiding: false,
              enableResizing: false,
            },
          ]
        : [],
    [enableRowSelection],
  );

  const memoizedColumns = useMemo(
    () => [...checkboxColumn, ...columns],
    [checkboxColumn, columns],
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(
    memoizedColumns.map((c) => c.id as string).filter(Boolean),
  );

  /**
   * La colonne d'actions reste collee a droite.
   *
   * Sans cela elle sort de l'ecran des que la somme des largeurs depasse la
   * carte — sur Organismes, 1770 px de colonnes pour ~1180 px utiles : l'oeil
   * d'ouverture du panneau devenait inatteignable sans defilement horizontal,
   * dont la barre Radix ne se montre qu'au survol. L'epinglage est pose ici
   * plutot que dans chaque tableau : les quatre listes nomment leur colonne
   * `actions`, et la grille sait deja la rendre sticky (`data-pinned`).
   */
  const columnPinning = useMemo(
    () => ({
      right: memoizedColumns.some((c) => c.id === ACTIONS_COLUMN_ID)
        ? [ACTIONS_COLUMN_ID]
        : [],
    }),
    [memoizedColumns],
  );

  const table = useReactTable({
    columns: memoizedColumns,
    data,
    pageCount: meta?.totalPages,

    manualPagination: true,
    onPaginationChange: setPagination,

    manualSorting: true,
    onSortingChange: setSorting,

    enableRowSelection,
    onRowSelectionChange: setRowSelection,

    enableColumnPinning: true,

    getRowId: (row) => row.id,
    state: { pagination, sorting, columnOrder, rowSelection, columnPinning },
    onColumnOrderChange: setColumnOrder,

    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // `data` lu via ref : la notification ne doit se déclencher que sur un vrai
  // changement de sélection. Mettre `data` en deps provoque une boucle infinie
  // quand il change d'identité à chaque render (ex. `[]` vide non mémoïsé du
  // hook) → onRowSelectionChange(nouveau tableau) → setState parent → re-render
  // → nouveau `data` → l'effet re-tire → … (Maximum update depth exceeded).
  const dataRef = useRef(data);
  dataRef.current = data;

  // Notify parent of selection changes
  useEffect(() => {
    if (!enableRowSelection || !onRowSelectionChange) return;
    const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
    const selectedRows = dataRef.current.filter((row) =>
      selectedIds.includes(row.id),
    );
    onRowSelectionChange(selectedRows);
  }, [rowSelection, enableRowSelection, onRowSelectionChange]);

  // Notifie tous les ids sélectionnés (cross-page). Dépend uniquement de
  // `rowSelection` (qui persiste par id) → pas de fausse notif au changement
  // de page, pas de réconciliation fragile côté parent.
  useEffect(() => {
    if (!enableRowSelection || !onSelectedIdsChange) return;
    onSelectedIdsChange(
      Object.keys(rowSelection).filter((k) => rowSelection[k]),
    );
  }, [rowSelection, enableRowSelection, onSelectedIdsChange]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [hasActiveFilters]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const responseOrData =
    (hookResult as unknown as Record<string, unknown>)?.response ??
    (hookResult as unknown as Record<string, unknown>)?.data;
  useEffect(() => {
    if (onDataChange) {
      onDataChange(hookResult);
    }
  }, [responseOrData, loading, onDataChange]);

  const isSearchEmpty = debouncedSearch.trim().length === 0;

  const showCreateEmptyState =
    !loading && data.length === 0 && isSearchEmpty && !hasActiveFilters;

  if (loading && data.length === 0) {
    return (
      <ReusableTableSkeleton
        columns={memoizedColumns.length || 6}
        rows={defaultPageSize}
        headerControls={enableSearch ? 2 : 1}
        showFooter
      />
    );
  }

  return showCreateEmptyState ? (
    emptyTableMessage
  ) : (
    <DataGrid
      table={table}
      recordCount={meta?.total ?? 0}
      tableLayout={tableLayout}
      emptyMessage={COMMON.NO_DATA_AVAILABLE}
    >
      <Card>
        {showHeader && (
          <CardHeader className="py-4">
            <CardHeading className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  {enableSearch && (
                    <div className="relative">
                      {searchToolTipText ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{searchToolTipText}</span>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                      )}
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="ps-9 w-60"
                      />
                      {searchQuery.length > 0 && (
                        <Button
                          mode="icon"
                          variant="ghost"
                          className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={handleClearSearch}
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  )}

                  {headerFilters}

                  {activeFilterChips && activeFilterChips.length > 0 && (
                    <>
                      {activeFilterChips.map((chip, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 h-9 pl-2.5 pr-1.5 rounded-lg border border-primary/30 bg-primary/5 text-xs text-primary font-medium"
                        >
                          {chip.label}
                          <button
                            onClick={chip.onRemove}
                            className="ml-0.5 p-0.5 rounded hover:bg-primary/20 transition-colors"
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                    </>
                  )}

                  {collapsibleFilters && (
                    <>
                      <div className="h-6 w-px bg-border mx-1" />
                      <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => setShowCollapsibleFilters((v) => !v)}
                          className={cn(
                            'gap-1.5',
                            (collapsibleFiltersCount > 0 || showCollapsibleFilters) &&
                              'border-primary bg-primary/5 text-primary',
                          )}
                        >
                          <ListFilter className="size-3.5" />
                          {UI.TABLE.FILTERS_BUTTON}
                          {showCollapsibleFilters ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )}
                        </Button>
                        {!activeFilterChips && collapsibleFiltersCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-background">
                            {collapsibleFiltersCount}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {collapsibleFilters && showCollapsibleFilters && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    {collapsibleFilters}
                    {onResetCollapsibleFilters && collapsibleFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        onClick={onResetCollapsibleFilters}
                        className="text-muted-foreground gap-1.5"
                      >
                        <RotateCcw className="size-3.5" />
                        {UI.TABLE.RESET_FILTERS}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeading>

            {toolbarActions && (
              <CardToolbar className="shrink-0">
                {toolbarActions}
              </CardToolbar>
            )}
          </CardHeader>
        )}

        {subHeader}

        <CardTable>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>

        <CardFooter>
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
