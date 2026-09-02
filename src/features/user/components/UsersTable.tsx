import { FILTER_ALL, FILTER_DEBOUNCE_MS, PERMISSIONS } from '@/constants';
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
import { useRoles } from '../hooks/useRoles';
import { useUsers } from '../hooks/useUsers';
import type {
  UserListItem,
  UserListParams,
  UserStatus,
} from '../types/userList';
import { CreateUserWindow } from './CreateUserWindow';
import { userColumns } from './userColumns';

/**
 * Utilisateurs d'un projet — US-00-05.
 *
 * Ce composant a longtemps porte huit props de generalisation (`useData`,
 * `columns`, `createHooksFactory`...) prevues pour qu'il serve aussi aux
 * comptes back-office. Ce partage n'a jamais eu lieu : `BackofficeUsersTable`
 * est un composant distinct, et les deux seuls appelants ecrivent
 * `<UsersTable />` sans rien passer. Les props ont ete retirees — l'une
 * d'elles imposait en prime un appel de hook conditionnel, masque par un
 * `eslint-disable` sur les regles des hooks.
 */
export default function UsersTable() {
  const meStore = useMeStore();
  const hasPermission = meStore.hasPermission;


  // local filters
  const [status, setStatus] = useState<UserStatus | typeof FILTER_ALL>(FILTER_ALL);
  const [roleCode, setRoleCode] = useState<string>(FILTER_ALL);

  const debouncedStatus = useDebouncedValue(status, FILTER_DEBOUNCE_MS);
  const debouncedRoleCode = useDebouncedValue(roleCode, FILTER_DEBOUNCE_MS);
  const [openCreate, setOpenCreate] = useState(false);
  const hasActiveFilters =
    debouncedStatus !== FILTER_ALL || debouncedRoleCode !== FILTER_ALL;

  const toolbarActions = useMemo(() => {
    if (!hasPermission(PERMISSIONS.USERS.CREATE)) return null;

    return (
      <Button
        data-testid="user-create-btn"
        onClick={() => {
          setOpenCreate(true);
        }}
      >
        <CirclePlus />
        {ACTIONS.NEW_USER}
      </Button>
    );
  }, [hasPermission]);

  const getData = useCallback((r: ReturnType<typeof useUsers>) => r.users, []);
  const getMeta = useCallback((r: ReturnType<typeof useUsers>) => r.meta, []);

  // Options
  const roles = useRoles({ isBackoffice: 'false' });

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
            <SelectItem value={FILTER_ALL}>
              {SEARCH.ALL_STATUSES_SELECT_OPTION}
            </SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role : filtre supporte par GET /users (`roleCode`). Les roles
            viennent de l'API, jamais d'une liste en dur — un projet peut
            dupliquer un role et lui donner son propre code. */}
        <Select value={roleCode} onValueChange={setRoleCode}>
          <SelectTrigger data-testid="user-filter-role" className="w-60">
            <SelectValue placeholder={SEARCH.ROLE_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>{SEARCH.ALL_ROLES_SELECT_OPTION}</SelectItem>
            {roles.data.map((r) => (
              <SelectItem key={r.id} value={r.code}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }, [STATUS_OPTIONS, status, roleCode, roles.data]);

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) => {
      return {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        status:
          debouncedStatus === FILTER_ALL
            ? undefined
            : (debouncedStatus as UserStatus),
        roleCode: debouncedRoleCode === FILTER_ALL ? undefined : debouncedRoleCode,
      } satisfies UserListParams;
    },
    [debouncedStatus, debouncedRoleCode],
  );

  return (
    <>
      <CreateUserWindow
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={() => {}}
      />
      <ReusableTable<UserListItem, UserListParams, ReturnType<typeof useUsers>>
        emptyTableMessage={
          <EmptyTableComponent
            hasPermission={hasPermission(PERMISSIONS.USERS.CREATE)}
            illustration={USERS_TABLE_UI.EMPTY_STATE.ILLUSTRATION}
            title={USERS_TABLE_UI.EMPTY_STATE.TITLE}
            description={USERS_TABLE_UI.EMPTY_STATE.DESCRIPTION}
            onClick={() => {setOpenCreate(true);}}
            buttonIcon={<CirclePlus />}
            buttonText={ACTIONS.NEW_USER}
            buttonId="user-create-btn"
            tip={{
              title: USERS_TABLE_UI.EMPTY_STATE.TIP.TITLE,
              content: USERS_TABLE_UI.EMPTY_STATE.TIP.CONTENT,
            }}
          />
        }
        searchToolTipText={SEARCH_TOOLTIP_TEXT}
        hasActiveFilters={hasActiveFilters}
        columns={userColumns}
        useData={useUsers}
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
