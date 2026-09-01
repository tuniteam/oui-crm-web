import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
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
  PROJECT_SEARCH,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VALUES,
  PROJECTS_TABLE_UI,
} from '../constants/project.constants';
import { useProjects } from '../hooks/useProjects';
import type { ProjectListItem, ProjectListParams, ProjectStatus } from '../types/project';
import { projectColumns } from './projectColumns';

const ALL_STATUSES = 'ALL';

/**
 * Liste des projets de la plateforme. Ecran d'atterrissage du back-office :
 * c'est ici qu'il choisit le projet sur lequel travailler.
 */
export default function ProjectsTable() {
  const [status, setStatus] = useState<ProjectStatus | typeof ALL_STATUSES>(
    ALL_STATUSES,
  );
  const debouncedStatus = useDebouncedValue(status, 500);
  const hasActiveFilters = debouncedStatus !== ALL_STATUSES;

  const getData = useCallback(
    (r: ReturnType<typeof useProjects>) => r.projects,
    [],
  );
  const getMeta = useCallback((r: ReturnType<typeof useProjects>) => r.meta, []);

  const headerFilters = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as ProjectStatus)}
        >
          <SelectTrigger data-testid="project-filter-status" className="w-60">
            <SelectValue placeholder={PROJECT_SEARCH.STATUS_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>
              {PROJECT_SEARCH.ALL_STATUSES}
            </SelectItem>
            {PROJECT_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
    [status],
  );

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) =>
      ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        status:
          debouncedStatus === ALL_STATUSES
            ? undefined
            : (debouncedStatus as ProjectStatus),
      }) satisfies ProjectListParams,
    [debouncedStatus],
  );

  return (
    <ReusableTable<
      ProjectListItem,
      ProjectListParams,
      ReturnType<typeof useProjects>
    >
      columns={projectColumns}
      useData={useProjects}
      getData={getData}
      getMeta={getMeta}
      buildParams={buildParams}
      enableSearch
      searchPlaceholder={PROJECT_SEARCH.PLACEHOLDER}
      searchToolTipText={PROJECT_SEARCH.TOOLTIP}
      hasActiveFilters={hasActiveFilters}
      headerFilters={headerFilters}
      emptyTableMessage={
        <EmptyTableComponent
          title={PROJECTS_TABLE_UI.EMPTY_STATE.TITLE}
          description={PROJECTS_TABLE_UI.EMPTY_STATE.DESCRIPTION}
        />
      }
    />
  );
}
