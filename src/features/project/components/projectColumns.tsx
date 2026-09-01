import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import {
  FEATURE_LABELS,
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  PROJECTS_TABLE_UI,
} from '../constants/project.constants';
import type { ProjectListItem, ProjectStatus } from '../types/project';

const COLUMNS = PROJECTS_TABLE_UI.COLUMNS;

/** Le statut porte une couleur : un projet archivé ou brouillon doit se voir. */
function statusAppearance(status: ProjectStatus) {
  if (status === PROJECT_STATUS.ACTIVE) return 'success' as const;
  if (status === PROJECT_STATUS.DRAFT) return 'warning' as const;
  return 'secondary' as const;
}

export const projectColumns: ColumnDef<ProjectListItem>[] = [
  {
    accessorKey: 'name',
    header: COLUMNS.NAME,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.slug}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'productName',
    header: COLUMNS.PRODUCT,
    cell: ({ row }) => row.original.productName,
  },
  {
    accessorKey: 'status',
    header: COLUMNS.STATUS,
    cell: ({ row }) => (
      <Badge variant={statusAppearance(row.original.status)} appearance="light">
        {PROJECT_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: 'features',
    header: COLUMNS.FEATURES,
    enableSorting: false,
    cell: ({ row }) => {
      const features = row.original.features ?? [];
      if (!features.length) {
        return (
          <span className="text-muted-foreground">
            {PROJECTS_TABLE_UI.NO_FEATURE}
          </span>
        );
      }
      return (
        <div className="flex flex-wrap gap-1">
          {features.map((f) => (
            <Badge key={f} variant="secondary" appearance="outline">
              {FEATURE_LABELS[f] ?? f}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'userCount',
    header: COLUMNS.USER_COUNT,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.userCount}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: COLUMNS.CREATED_AT,
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString('fr-FR'),
  },
];
