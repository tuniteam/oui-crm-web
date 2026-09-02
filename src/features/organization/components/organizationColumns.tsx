import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { COMMON } from '@/constants/common';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { cn } from '@/lib/utils';
import type { ReferenceCategory } from '@/features/settings/types/reference-items';
import {
  CUSTOMER_STATUS_LABELS,
  ORGANIZATIONS_UI,
  PRIORITY_LABELS,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import type { OrganizationListItem } from '../types/organizationList';

const { TABLE_HEADERS: H, EMPTY_VALUE, RESTRICTED, UNASSIGNED } =
  ORGANIZATIONS_UI;

/** Signature de `useReferenceLabels().labelOf`, passee plutot que le hook :
 *  une definition de colonnes reste une donnee, pas un composant. */
type LabelOf = (
  category: ReferenceCategory,
  key?: string | null,
) => string | null;

const isRestricted = (o: OrganizationListItem) => o.access === 'RESTRICTED';

/** Un tiret pour tout ce qu'une fiche restreinte ne rend pas : la V8 vide ces
 *  cellules plutot que de laisser croire a une donnee absente. */
const dash = () => <span className="text-muted-foreground">{EMPTY_VALUE}</span>;

const number = new Intl.NumberFormat('fr-FR');

const dateFr = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR') : null;

/**
 * Colonnes de la liste des organismes, reprises de la V8 (`RENDER.organismes`).
 *
 * Deux colonnes de la maquette ne sont pas triables cote API — `type` et
 * `solution` : leurs en-tetes ne sont donc pas cliquables, plutot que d'offrir
 * un tri qui echouerait.
 */
export const organizationColumns = (
  labelOf: LabelOf,
  onOpen: (id: string) => void,
): ColumnDef<OrganizationListItem>[] => [
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => (
      <DataGridColumnHeader title={H.NAME} visibility={true} column={column} />
    ),
    cell: ({ row }) => {
      const o = row.original;
      // Les etiquettes sont des cles de referentiel : les afficher telles
      // quelles donnait « HOT · PUBLIC_TENDER » a l'utilisateur.
      const tagLabels = (o.tags ?? []).map((t) => labelOf('TAG', t) ?? t);
      const subtitle = isRestricted(o)
        ? [o.city, RESTRICTED.HINT].filter(Boolean).join(' · ')
        : [o.city, ...tagLabels].filter(Boolean).join(' · ');

      return (
        <div className="space-y-px">
          <div
            data-testid={`organization-name-${o.id}`}
            className={cn(
              'font-medium text-foreground',
              isRestricted(o) && 'text-muted-foreground',
            )}
          >
            {o.name}
          </div>
          {subtitle ? (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
      );
    },
    size: 280,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: () => <span className="text-sm">{H.TYPE}</span>,
    cell: ({ row }) => labelOf('STRUCTURE_TYPE', row.original.type) ?? EMPTY_VALUE,
    size: 150,
    enableSorting: false,
  },
  {
    accessorKey: 'department',
    id: 'department',
    header: ({ column }) => (
      <DataGridColumnHeader title={H.DEPARTMENT} visibility={true} column={column} />
    ),
    cell: ({ row }) => row.original.department,
    size: 80,
    enableSorting: true,
  },
  {
    accessorKey: 'population',
    id: 'population',
    header: ({ column }) => (
      <DataGridColumnHeader title={H.POPULATION} visibility={true} column={column} />
    ),
    cell: ({ row }) =>
      row.original.population != null
        ? number.format(row.original.population)
        : dash(),
    size: 110,
    enableSorting: true,
  },
  {
    id: 'bracket',
    header: () => <span className="text-sm">{H.BRACKET}</span>,
    // Calculee par l'API d'apres la grille active du projet. Jamais recalculee
    // ici : les grilles sont par projet et versionnees.
    cell: ({ row }) =>
      row.original.bracketLabel ? (
        <span className="text-xs text-muted-foreground">
          {row.original.bracketLabel}
        </span>
      ) : (
        dash()
      ),
    size: 150,
    enableSorting: false,
  },
  {
    id: 'solution',
    header: () => <span className="text-sm">{H.SOLUTION}</span>,
    cell: ({ row }) =>
      labelOf('SOLUTION', row.original.solution?.key) ?? dash(),
    size: 160,
    enableSorting: false,
  },
  {
    accessorKey: 'salesStatus',
    id: 'salesStatus',
    header: ({ column }) => (
      <DataGridColumnHeader title={H.SALES_STATUS} visibility={true} column={column} />
    ),
    cell: ({ row }) => SALES_STATUS_LABELS[row.original.salesStatus],
    size: 170,
    enableSorting: true,
  },
  {
    accessorKey: 'customerStatus',
    id: 'customerStatus',
    header: ({ column }) => (
      <DataGridColumnHeader title={H.CUSTOMER_STATUS} visibility={true} column={column} />
    ),
    cell: ({ row }) => CUSTOMER_STATUS_LABELS[row.original.customerStatus],
    size: 170,
    enableSorting: true,
  },
  {
    accessorKey: 'priority',
    id: 'priority',
    header: ({ column }) => (
      <DataGridColumnHeader title={H.PRIORITY} visibility={true} column={column} />
    ),
    cell: ({ row }) =>
      row.original.priority ? PRIORITY_LABELS[row.original.priority] : dash(),
    size: 110,
    enableSorting: true,
  },
  {
    accessorKey: 'nextActivityAt',
    id: 'nextActivityAt',
    header: ({ column }) => (
      <DataGridColumnHeader title={H.NEXT_ACTIVITY} visibility={true} column={column} />
    ),
    // La V8 affiche aussi le type de l'action ; il arrivera avec US-01-08.
    cell: ({ row }) => dateFr(row.original.nextActivityAt) ?? dash(),
    size: 140,
    enableSorting: true,
  },
  {
    id: 'actions',
    header: () => (
      <span className="flex w-full justify-center text-sm">{H.ACTIONS}</span>
    ),
    // Colonne d'actions plutot qu'une ligne cliquable : c'est le patron des
    // ecrans Projets et Utilisateurs, et `ReusableTable` n'expose pas de
    // `onRowClick`.
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-testid={`organization-view-${row.original.id}`}
              onClick={() => onOpen(row.original.id)}
              className="text-brand-secondary hover:opacity-80"
            >
              <Eye size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{COMMON.ACTIONS.VIEW}</TooltipContent>
        </Tooltip>
      </div>
    ),
    size: 90,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    id: 'salesRep',
    header: () => <span className="text-sm">{H.SALES_REP}</span>,
    cell: ({ row }) => (
      <span className={cn(!row.original.salesRep && 'text-muted-foreground')}>
        {row.original.salesRep?.fullName ?? UNASSIGNED}
      </span>
    ),
    size: 160,
    enableSorting: false,
  },
];
