// src/features/project/components/ProjectsTable.tsx
import { useCallback, useMemo, useState } from 'react';
import { FILTER_ALL, FILTER_DEBOUNCE_MS, PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { CirclePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  PROJECT_STATUS_OPTIONS,
  PROJECTS_TABLE_UI,
  SEARCH,
} from '../constants/constants';
import { PROJECT_ROUTES } from '../constants/routes.constants';
import { useProjects } from '../hooks/useProjects';
import type { ProjectStatus } from '../types/project';
import type { ProjectListItem, ProjectListParams } from '../types/projectList';
import { CreateProjectWindow } from './create-project/CreateProjectWindow';
import { projectColumns } from './projectColumns';

/**
 * Liste des projets de la plateforme. Ecran d'atterrissage du back-office :
 * c'est ici qu'il choisit le projet sur lequel travailler.
 */
export default function ProjectsTable() {
  const navigate = useNavigate();
  /* Le bouton est masqué sans le droit ; le serveur, lui, décide. */
  const canCreate = useMeStore((st) =>
    st.hasPermission(PERMISSIONS.PROJECTS.CREATE),
  );
  const [openCreate, setOpenCreate] = useState(false);

  // local filters (controlled by selects)
  const [status, setStatus] = useState<ProjectStatus | typeof FILTER_ALL>(
    FILTER_ALL,
  );

  const debouncedStatus = useDebouncedValue(status, FILTER_DEBOUNCE_MS);
  const hasActiveFilters = debouncedStatus !== FILTER_ALL;

  const getData = useCallback(
    (r: ReturnType<typeof useProjects>) => r.projects,
    [],
  );
  const getMeta = useCallback(
    (r: ReturnType<typeof useProjects>) => r.meta,
    [],
  );

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
      </div>
    ),
    [status, STATUS_OPTIONS],
  );

  const toolbarActions = useMemo(() => {
    if (!canCreate) return null;
    return (
      <Button
        data-testid="project-create-btn"
        onClick={() => setOpenCreate(true)}
      >
        <CirclePlus />
        {ACTIONS.NEW_PROJECT}
      </Button>
    );
  }, [canCreate]);

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) =>
      ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        status:
          debouncedStatus === FILTER_ALL
            ? undefined
            : (debouncedStatus as ProjectStatus),
      }) satisfies ProjectListParams,
    [debouncedStatus],
  );

  return (
    <>
      {/*
       * Après la création, on ouvre la fiche du projet : c'est là qu'on
       * l'active et qu'on vérifie ce qui a été copié. Recharger la liste
       * laisserait chercher ce qu'on vient de créer.
       */}
      <CreateProjectWindow
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={(created) =>
          navigate(PROJECT_ROUTES.PROJECT_DETAILS(created.id))
        }
      />

      <ReusableTable<
        ProjectListItem,
        ProjectListParams,
        ReturnType<typeof useProjects>
      >
        emptyTableMessage={
          <EmptyTableComponent
            hasPermission={canCreate}
            onClick={() => setOpenCreate(true)}
            buttonIcon={<CirclePlus />}
            buttonText={ACTIONS.NEW_PROJECT}
            buttonId="project-create-btn"
            illustration="/media/illustrations/projects.svg"
            title={PROJECTS_TABLE_UI.EMPTY_STATE.TITLE}
            description={[...PROJECTS_TABLE_UI.EMPTY_STATE.DESCRIPTION]}
            tip={{
              title: PROJECTS_TABLE_UI.EMPTY_STATE.TIP.TITLE,
              content: [...PROJECTS_TABLE_UI.EMPTY_STATE.TIP.CONTENT],
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
