import type { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { COMMON } from '@/constants/common';
import { CopyButton } from '@/components/shared/CopyButton';
import { EXTERNAL_BADGE, TABLE_HEADERS } from '../constants/userList.constants';
import type { UserListItem } from '../types/userList';
import { UserDetailsLink } from './UserDetailsLink';
import { UserRoleBadge } from './UserRoleBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const userColumns: ColumnDef<UserListItem>[] = [
  {
    accessorKey: 'lastName',
    id: 'user',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.USER}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => {
      const fullName =
        `${row.original.firstName} ${row.original.lastName}`.trim();

      return (
        <div className="flex items-center gap-3">
          <div className="space-y-px">
            <div
              data-testid={`user-name-${row.original.id}`}
              className="flex items-center gap-2 font-medium text-foreground"
            >
              {fullName || '-'}
              {row.original.initials ? (
                <span className="text-xs text-muted-foreground">
                  {row.original.initials}
                </span>
              ) : null}
              {row.original.isExternal ? (
                <span className="rounded border px-1 text-[10px] uppercase text-muted-foreground">
                  {EXTERNAL_BADGE}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );
    },
    size: 260,
    enableSorting: true,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'email',
    id: 'email',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.EMAIL}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div
        data-testid={`user-email-${row.original.id}`}
        className="flex items-center gap-2"
      >
        <span>{row.original.email}</span>
        <CopyButton
          text={row.original.email}
          tooltipCopy={COMMON.ACTIONS.COPY_EMAIL}
          tooltipCopied={COMMON.ACTIONS.EMAIL_COPIED}
        />
      </div>
    ),
    size: 260,
    meta: { headerTitle: TABLE_HEADERS.EMAIL },
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'roleLabel',
    id: 'role',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.ROLE}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <UserRoleBadge roleLabel={row.original.roleLabel} />
    ),
    size: 180,
    meta: { headerTitle: TABLE_HEADERS.ROLE },
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'scope',
    id: 'scope',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.SCOPE}
        visibility={true}
        column={column}
      />
    ),
    // `scope: null` = aucun perimetre restreint, l'utilisateur voit tout le
    // projet dans la limite de ses permissions.
    cell: ({ row }) => <span>{row.original.scope?.name ?? '-'}</span>,
    size: 160,
    meta: { headerTitle: TABLE_HEADERS.SCOPE },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'status',
    id: 'status',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.STATUS}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    size: 140,
    meta: { headerTitle: TABLE_HEADERS.STATUS },
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'actions',
    id: 'actions',
    header: () => (
      <span className="flex justify-center w-full">
        {TABLE_HEADERS.ACTIONS}
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <UserDetailsLink userId={row.original.id} />
      </div>
    ),
    size: 90,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
];
