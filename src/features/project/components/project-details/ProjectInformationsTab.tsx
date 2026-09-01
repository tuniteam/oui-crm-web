import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { COMMON } from '@/constants/common';
import { FEATURE_LABELS, PROJECT_INFORMATION_UI } from '../../constants/constants';
import type { ProjectDetailsResponse } from '../../types/projectDetails';

const { SECTIONS, FIELDS, FEATURES, FALLBACK } = PROJECT_INFORMATION_UI;

function formatDate(value: string | null): string {
  if (!value) return FALLBACK;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? FALLBACK
    : date.toLocaleDateString('fr-FR');
}

export function ProjectInformationsTab({
  project,
}: {
  project: ProjectDetailsResponse;
}) {
  return (
    <div className="space-y-6">
      <DetailsSection title={SECTIONS.IDENTITY}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsField label={FIELDS.NAME} value={project.name ?? FALLBACK} />
          <DetailsField
            label={FIELDS.SLUG}
            value={project.slug ?? FALLBACK}
            copyable
            copyTooltipCopy={COMMON.ACTIONS.COPY}
            copyTooltipCopied={COMMON.ACTIONS.COPIED}
          />
          <DetailsField
            label={FIELDS.PRODUCT}
            value={project.productName ?? FALLBACK}
          />
          <DetailsField
            label={FIELDS.DESCRIPTION}
            value={project.description ?? FALLBACK}
            className="md:col-span-3"
            multiline
          />
        </div>
      </DetailsSection>

      <DetailsSection title={SECTIONS.ACTIVITY}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{FIELDS.STATUS}</p>
            <StatusBadge status={project.status} />
          </div>
          <DetailsField
            label={FIELDS.USER_COUNT}
            value={String(project.userCount ?? 0)}
          />
          <DetailsField
            label={FIELDS.ACTIVATED_AT}
            value={formatDate(project.activatedAt)}
          />
          <DetailsField
            label={FIELDS.CREATED_AT}
            value={formatDate(project.createdAt)}
          />
          <DetailsField
            label={FIELDS.UPDATED_AT}
            value={formatDate(project.updatedAt)}
          />
        </div>
      </DetailsSection>

      {/* Le detail liste TOUTES les fonctionnalites, activees ou non : c'est
          l'ecran ou l'on constate ce qui est ouvert sur le projet. */}
      <DetailsSection title={SECTIONS.FEATURES}>
        {project.features?.length ? (
          <div className="flex flex-wrap gap-2">
            {project.features.map((feature) => (
              <Badge
                key={feature.code}
                variant={feature.enabled ? 'success' : 'secondary'}
                appearance="light"
              >
                {FEATURE_LABELS[feature.code] ?? feature.code}
                <span className="ms-1 opacity-70">
                  {feature.enabled ? FEATURES.ENABLED : FEATURES.DISABLED}
                </span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{FEATURES.EMPTY}</p>
        )}
      </DetailsSection>
    </div>
  );
}
