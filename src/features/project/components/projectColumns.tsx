import type { ColumnDef } from '@tanstack/react-table';
import { ACTIONS_COLUMN_ID } from '@/constants';
import { ExternalLink, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ACTIONS, TABLE_HEADERS } from '../constants/constants';
import { PROJECT_ROUTES } from '../constants/routes.constants';
import type { ProjectListItem } from '../types/projectList';
import { ProjectFeatureBadges } from './ProjectFeatureBadges';

export const projectColumns: ColumnDef<ProjectListItem>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.NAME}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="space-y-px">
        <div
          data-testid={`project-name-${row.original.id}`}
          className="font-medium text-foreground"
        >
          {row.original.name}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.slug}
        </div>
      </div>
    ),
    size: 260,
    enableSorting: true,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'productName',
    id: 'productName',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.PRODUCT}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => row.original.productName,
    size: 220,
    meta: { headerTitle: TABLE_HEADERS.PRODUCT },
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
    accessorKey: 'features',
    id: 'features',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.FEATURES}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <ProjectFeatureBadges features={row.original.features} />
    ),
    size: 240,
    meta: { headerTitle: TABLE_HEADERS.FEATURES },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'userCount',
    id: 'userCount',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.USER_COUNT}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.userCount}</span>
    ),
    size: 120,
    meta: { headerTitle: TABLE_HEADERS.USER_COUNT, cellClassName: 'text-start' },
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: ({ column }) => (
      <DataGridColumnHeader
        title={TABLE_HEADERS.CREATED_AT}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString('fr-FR'),
    size: 140,
    meta: { headerTitle: TABLE_HEADERS.CREATED_AT },
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'actions',
    id: ACTIONS_COLUMN_ID,
    header: () => (
      <span className="flex justify-center w-full">
        {TABLE_HEADERS.ACTIONS}
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-3">
        {/* Ouvrir le projet dans un onglet dedie : l'administration reste
            disponible dans l'onglet courant, les deux contextes coexistent. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              data-testid={`project-open-${row.original.id}`}
              to={PROJECT_ROUTES.PROJECT_WORKSPACE(row.original.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:opacity-80"
            >
              <ExternalLink size={18} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>{ACTIONS.OPEN_PROJECT}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              data-testid={`project-view-${row.original.id}`}
              to={PROJECT_ROUTES.PROJECT_DETAILS(row.original.id)}
              className="text-brand-primary hover:opacity-80"
            >
              <Eye size={18} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>{ACTIONS.VIEW_PROJECT}</TooltipContent>
        </Tooltip>
      </div>
    ),
    size: 100,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
];
