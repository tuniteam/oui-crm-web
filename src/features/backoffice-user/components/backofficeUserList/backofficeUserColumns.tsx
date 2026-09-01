import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ACTIONS, FALLBACK, TABLE_HEADERS } from '../../constants/constants';
import { BACKOFFICE_USER_ROUTES } from '../../constants/routes.constants';
import type { BackofficeUserListItem } from '../../types/backofficeUser';

function formatDateTime(value: string | null): string {
  if (!value) return FALLBACK;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? FALLBACK
    : date.toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

export const backofficeUserColumns: ColumnDef<BackofficeUserListItem>[] = [
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
    cell: ({ row }) => (
      <span
        data-testid={`backoffice-user-name-${row.original.id}`}
        className="font-medium text-foreground"
      >
        {`${row.original.firstName} ${row.original.lastName}`.trim() ||
          FALLBACK}
      </span>
    ),
    size: 220,
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
    cell: ({ row }) => row.original.email,
    size: 280,
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
      <Badge variant="secondary" appearance="outline">
        {row.original.roleLabel}
      </Badge>
    ),
    size: 200,
    meta: { headerTitle: TABLE_HEADERS.ROLE },
    enableSorting: true,
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
    size: 120,
    meta: { headerTitle: TABLE_HEADERS.STATUS },
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'lastLoginAt',
    id: 'lastLoginAt',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.LAST_LOGIN}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => formatDateTime(row.original.lastLoginAt),
    size: 170,
    meta: { headerTitle: TABLE_HEADERS.LAST_LOGIN },
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
      <div className="flex items-center justify-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              data-testid={`backoffice-user-view-${row.original.id}`}
              to={BACKOFFICE_USER_ROUTES.DETAIL(row.original.id)}
              className="text-brand-primary hover:opacity-80"
            >
              <Eye size={18} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>{ACTIONS.VIEW}</TooltipContent>
        </Tooltip>
      </div>
    ),
    size: 100,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
];
