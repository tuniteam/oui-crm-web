import { PERMISSIONS } from '@/constants';
import { useCallback, useMemo, useState } from 'react';
import { CirclePlus } from 'lucide-react';
import { useMeStore } from '@/contexts/useMeStore';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_CONFIG } from '@/components/shared/status-config';
import EmptyTableComponent from '@/components/table/reusable-empty-table-component';
import { ReusableTable } from '@/components/table/reusable-table';
import { ACTIONS, EMPTY_STATE, SEARCH } from '../constants/constants';
import { useBackofficeUsers } from '../hooks/useBackofficeUsers';
import {
  BACKOFFICE_USER_STATUS_VALUES,
  type BackofficeUserListItem,
  type BackofficeUserListParams,
  type BackofficeUserStatus,
} from '../types/backofficeUser';
import { backofficeUserColumns } from './backofficeUserList/backofficeUserColumns';
import { CreateBackofficeUserWindow } from './CreateBackofficeUserWindow';

const ALL = 'ALL';

/**
 * Comptes back-office. Route plateforme : accessible sans projet selectionne,
 * contrairement aux utilisateurs de projet.
 */
export default function BackofficeUsersTable() {
  const hasPermission = useMeStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.USER_BACKOFFICE.CREATE);

  const [openCreate, setOpenCreate] = useState(false);
  const [status, setStatus] = useState<BackofficeUserStatus | typeof ALL>(ALL);

  const debouncedStatus = useDebouncedValue(status, 500);
  const hasActiveFilters = debouncedStatus !== ALL;

  const getData = useCallback(
    (r: ReturnType<typeof useBackofficeUsers>) => r.users,
    [],
  );
  const getMeta = useCallback(
    (r: ReturnType<typeof useBackofficeUsers>) => r.meta,
    [],
  );

  const statusOptions = useMemo(
    () =>
      BACKOFFICE_USER_STATUS_VALUES.map((value) => ({
        value,
        label: STATUS_CONFIG[value]?.label ?? value,
      })),
    [],
  );

  const toolbarActions = useMemo(() => {
    if (!canCreate) return null;
    return (
      <Button
        data-testid="backoffice-user-create-btn"
        onClick={() => setOpenCreate(true)}
      >
        <CirclePlus />
        {ACTIONS.NEW_OPERATOR}
      </Button>
    );
  }, [canCreate]);

  const headerFilters = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as BackofficeUserStatus)}
        >
          <SelectTrigger
            data-testid="backoffice-user-filter-status"
            className="w-60"
          >
            <SelectValue placeholder={SEARCH.STATUS_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>
              {SEARCH.ALL_STATUSES_SELECT_OPTION}
            </SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
    [status, statusOptions],
  );

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) =>
      ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        status:
          debouncedStatus === ALL
            ? undefined
            : (debouncedStatus as BackofficeUserStatus),
      }) satisfies BackofficeUserListParams,
    [debouncedStatus],
  );

  return (
    <>
      <CreateBackofficeUserWindow
        open={openCreate}
        onOpenChange={setOpenCreate}
      />

      <ReusableTable<
        BackofficeUserListItem,
        BackofficeUserListParams,
        ReturnType<typeof useBackofficeUsers>
      >
        emptyTableMessage={
          <EmptyTableComponent
            hasPermission={canCreate}
            illustration="/media/illustrations/users.svg"
            title={EMPTY_STATE.TITLE}
            description={[...EMPTY_STATE.DESCRIPTION]}
            onClick={() => setOpenCreate(true)}
            buttonIcon={<CirclePlus />}
            buttonText={ACTIONS.NEW_OPERATOR}
            buttonId="backoffice-user-create-btn"
          />
        }
        hasActiveFilters={hasActiveFilters}
        columns={backofficeUserColumns}
        useData={useBackofficeUsers}
        getData={getData}
        getMeta={getMeta}
        buildParams={buildParams}
        searchPlaceholder={SEARCH.PLACEHOLDER}
        searchToolTipText={SEARCH.TOOLTIP_TEXT}
        enableSearch={true}
        defaultPageSize={10}
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
