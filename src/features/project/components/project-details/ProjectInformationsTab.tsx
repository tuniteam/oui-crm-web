import { Check, X } from 'lucide-react';
import { DetailsField } from '@/components/layouts/layout-1/shared/details-page/DetailsField';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { COMMON } from '@/constants/common';
import { FEATURE_LABELS, PROJECT_INFORMATION_UI } from '../../constants/constants';
import { formatShortDateFr } from '@/shared/utils/date-utils';
import type { ProjectDetailsResponse } from '../../types/projectDetails';

const { SECTIONS, FIELDS, FEATURES, FALLBACK } = PROJECT_INFORMATION_UI;

const formatDate = (value: string | null): string =>
  formatShortDateFr(value) || FALLBACK;

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
          l'ecran ou l'on constate ce qui est ouvert sur le projet. L'etat est
          porte par la couleur et l'icone ; le repeter en toutes lettres sur
          chaque badge n'ajoute rien. Le titre accessible reste explicite. */}
      <DetailsSection title={SECTIONS.FEATURES}>
        {project.features?.length ? (
          <div className="flex flex-wrap gap-2">
            {project.features.map((feature) => {
              const label = FEATURE_LABELS[feature.code] ?? feature.code;
              const state = feature.enabled
                ? FEATURES.ENABLED
                : FEATURES.DISABLED;

              return (
                <Badge
                  key={feature.code}
                  variant={feature.enabled ? 'success' : 'secondary'}
                  appearance="light"
                  title={`${label} — ${state}`}
                  className={feature.enabled ? undefined : 'opacity-60'}
                >
                  {feature.enabled ? (
                    <Check size={12} aria-hidden="true" />
                  ) : (
                    <X size={12} aria-hidden="true" />
                  )}
                  {label}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{FEATURES.EMPTY}</p>
        )}
      </DetailsSection>
    </div>
  );
}
