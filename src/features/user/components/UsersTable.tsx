import { PERMISSIONS } from '@/constants';
import { useCallback, useMemo, useState } from 'react';
import { useMeStore } from '@/contexts/useMeStore';
import { CirclePlus } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Button } from '@/components/ui/button';
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
  ACTIONS,
  SEARCH,
  SEARCH_TOOLTIP_TEXT,
  USER_STATUS_LABELS,
  USERS_TABLE_UI,
} from '../constants/userList.constants';
import { useUsers } from '../hooks/useUsers';
import type {
  UserListItem,
  UserListParams,
  UserStatus,
} from '../types/userList';
import { CreateUserWindow } from './CreateUserWindow';
import { userColumns } from './userColumns';
import type { ColumnDef } from '@tanstack/react-table';
import type { CreateUserHooks } from './CreateUserBody';

type UsersTableProps = {
  useData?: (params: UserListParams) => ReturnType<typeof useUsers>;
  columns?: ColumnDef<UserListItem>[];
  createPermission?: string;
  createButtonText?: string;
  createSheetTitle?: string;
  createHooksFactory?: () => CreateUserHooks;
  rolesFilter?: 'true' | 'false';
  emptyStateConfig?: {
    title: string;
    description: string[];
    illustration?: string;
  };
};

export default function UsersTable({
  useData,
  columns,
  createPermission,
  createButtonText,
  createSheetTitle,
  createHooksFactory,
  rolesFilter,
  emptyStateConfig,
}: UsersTableProps = {}) {
  const meStore = useMeStore();
  const hasPermission = meStore.hasPermission;

  const effectiveCreatePermission = createPermission ?? PERMISSIONS.USERS.CREATE;
  const effectiveColumns = columns ?? userColumns;
  const effectiveCreateButtonText = createButtonText ?? ACTIONS.NEW_USER;

  // local filters
  const [status, setStatus] = useState<UserStatus | 'ALL'>('ALL');

  const debouncedStatus = useDebouncedValue(status, 500);
  const [openCreate, setOpenCreate] = useState(false);
  const hasActiveFilters = debouncedStatus !== 'ALL';

  const toolbarActions = useMemo(() => {
    if (!hasPermission(effectiveCreatePermission)) return null;

    return (
      <Button
        data-testid="user-create-btn"
        onClick={() => {
          setOpenCreate(true);
        }}
      >
        <CirclePlus />
        {effectiveCreateButtonText}
      </Button>
    );
  }, [hasPermission, effectiveCreatePermission, effectiveCreateButtonText]);

  const getData = useCallback((r: ReturnType<typeof useUsers>) => r.users, []);
  const getMeta = useCallback((r: ReturnType<typeof useUsers>) => r.meta, []);

  // Options
  const STATUS_OPTIONS: { value: UserStatus; label: string }[] = useMemo(
    () => USER_STATUS_LABELS,
    [],
  );

  const headerFilters = useMemo(() => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {/* Status */}
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as UserStatus)}
        >
          <SelectTrigger data-testid="user-filter-status" className="w-60">
            <SelectValue placeholder={SEARCH.STATUS_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {SEARCH.ALL_STATUSES_SELECT_OPTION}
            </SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }, [STATUS_OPTIONS, status]);

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) => {
      return {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        status:
          debouncedStatus === 'ALL'
            ? undefined
            : (debouncedStatus as UserStatus),
      } satisfies UserListParams;
    },
    [debouncedStatus],
  );

  return (
    <>
      <CreateUserWindow
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={() => {}}
        hooksFactory={createHooksFactory}
        rolesFilter={rolesFilter}
        title={createSheetTitle}
      />
      <ReusableTable<UserListItem, UserListParams, ReturnType<typeof useUsers>>
        emptyTableMessage={
          <EmptyTableComponent
            hasPermission={hasPermission(effectiveCreatePermission)}
            illustration={emptyStateConfig?.illustration ?? '/media/illustrations/users.svg'}
            title={emptyStateConfig?.title ?? USERS_TABLE_UI.EMPTY_STATE.TITLE}
            description={emptyStateConfig?.description ?? USERS_TABLE_UI.EMPTY_STATE.DESCRIPTION}
            onClick={() => {setOpenCreate(true);}}
            buttonIcon={<CirclePlus />}
            buttonText={effectiveCreateButtonText}
            buttonId="user-create-btn"
            tip={emptyStateConfig ? undefined : {
              title: USERS_TABLE_UI.EMPTY_STATE.TIP.TITLE,
              content: USERS_TABLE_UI.EMPTY_STATE.TIP.CONTENT,
            }}
          />
        }
        searchToolTipText={SEARCH_TOOLTIP_TEXT}
        hasActiveFilters={hasActiveFilters}
        columns={effectiveColumns}
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useData={useData ? (params) => (useData as typeof useUsers)(params) : (params) => useUsers(params)}
        getData={getData}
        getMeta={getMeta}
        buildParams={buildParams}
        searchPlaceholder={SEARCH.PLACEHOLDER}
        enableSearch={true}
        defaultPageSize={10}
        initialSorting={[{ id: 'user', desc: false }]}
        headerFilters={headerFilters}
        toolbarActions={toolbarActions}
        tableLayout={{
          columnsPinnable: true,
          columnsResizable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
      />
    </>
  );
}
