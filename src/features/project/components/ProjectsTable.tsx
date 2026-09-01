// src/features/project/components/ProjectsTable.tsx
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
  PROJECT_STATUS_OPTIONS,
  PROJECTS_TABLE_UI,
  SEARCH,
} from '../constants/constants';
import { useProjects } from '../hooks/useProjects';
import type { ProjectStatus } from '../types/project';
import type {
  ProjectListItem,
  ProjectListParams,
} from '../types/projectList';
import { projectColumns } from './projectColumns';

const ALL = 'ALL';

/**
 * Liste des projets de la plateforme. Ecran d'atterrissage du back-office :
 * c'est ici qu'il choisit le projet sur lequel travailler.
 */
export default function ProjectsTable() {
  // local filters (controlled by selects)
  const [status, setStatus] = useState<ProjectStatus | typeof ALL>(ALL);

  const debouncedStatus = useDebouncedValue(status, 500);
  const hasActiveFilters = debouncedStatus !== ALL;

  const getData = useCallback(
    (r: ReturnType<typeof useProjects>) => r.projects,
    [],
  );
  const getMeta = useCallback((r: ReturnType<typeof useProjects>) => r.meta, []);

  const STATUS_OPTIONS = useMemo(() => PROJECT_STATUS_OPTIONS, []);

  const headerFilters = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as ProjectStatus)}
        >
          <SelectTrigger data-testid="project-filter-status" className="w-60">
            <SelectValue placeholder={SEARCH.STATUS_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>
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
    ),
    [status, STATUS_OPTIONS],
  );

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) =>
      ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        status:
          debouncedStatus === ALL ? undefined : (debouncedStatus as ProjectStatus),
      }) satisfies ProjectListParams,
    [debouncedStatus],
  );

  return (
    <ReusableTable<
      ProjectListItem,
      ProjectListParams,
      ReturnType<typeof useProjects>
    >
      emptyTableMessage={
        <EmptyTableComponent
          illustration="/media/illustrations/projects.svg"
          title={PROJECTS_TABLE_UI.EMPTY_STATE.TITLE}
          description={PROJECTS_TABLE_UI.EMPTY_STATE.DESCRIPTION}
          tip={{
            title: PROJECTS_TABLE_UI.EMPTY_STATE.TIP.TITLE,
            content: PROJECTS_TABLE_UI.EMPTY_STATE.TIP.CONTENT,
          }}
        />
      }
      hasActiveFilters={hasActiveFilters}
      columns={projectColumns}
      useData={useProjects}
      getData={getData}
      getMeta={getMeta}
      buildParams={buildParams}
      searchPlaceholder={SEARCH.PLACEHOLDER}
      searchToolTipText={SEARCH.TOOLTIP_TEXT}
      enableSearch={true}
      defaultPageSize={10}
      initialSorting={[{ id: 'name', desc: false }]}
      headerFilters={headerFilters}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    />
  );
}
