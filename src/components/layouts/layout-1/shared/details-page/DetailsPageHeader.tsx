// src/components/layouts/layout-1/shared/details-page/DetailsPageHeader.tsx
'use client';
import { useMeStore } from '@/contexts/useMeStore';
import { ArrowLeft, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useContent } from '@/hooks/useContent';

interface DetailsPageHeaderProps{
    title: string;
    backRoute:string;
    targetId:string;
    onEditClick?:() => void;
    editPermission:string;
    hideEdit?:boolean;
    breadcrumb?: React.ReactNode;
}

export function DetailsPageHeader({
  title,
  backRoute,
  targetId,
  onEditClick,
  editPermission,
  hideEdit = false,
  breadcrumb,
}: DetailsPageHeaderProps) {
  const navigate = useNavigate();
  const meStore = useMeStore();
  const hasPermission = meStore.hasPermission;
  const {common} = useContent()

  return (
    <>
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 py-4">
          {breadcrumb}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight">
                {title ?? ''}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              data-testid="details-back-btn"
              variant="outline"
              /* `relative: 'path'` remonte des segments d'URL et non des
                 routes : c'est ce qui permet a une fiche de revenir a sa liste
                 sans savoir si elle vit sous `/users` ou sous
                 `/:projectId/users`. Sans effet sur un chemin absolu. */
              onClick={() => navigate(backRoute, { relative: 'path' })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {common.ACTIONS.BACK}
            </Button>

            {hasPermission(editPermission) && (
              <Button
                data-testid="details-edit-btn"
                onClick={onEditClick ?? (() => {})}
                disabled={!targetId}
                hidden={hideEdit}
              >
                <SquarePen />
                {common.ACTIONS.EDIT}
              </Button>
            )}
          </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
