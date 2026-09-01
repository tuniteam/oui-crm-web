import { Badge } from '@/components/ui/badge';
import { FEATURE_LABELS, PROJECTS_TABLE_UI } from '../constants/constants';
import type { FeatureCode } from '../types/projectList';

type Props = {
  features: FeatureCode[];
};

/** Fonctionnalites activees d'un projet. Pendant de ClientServiceIcons. */
export function ProjectFeatureBadges({ features }: Props) {
  if (!features?.length) {
    return (
      <span className="text-muted-foreground">
        {PROJECTS_TABLE_UI.NO_FEATURE}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {features.map((code) => (
        <Badge key={code} variant="secondary" appearance="outline" size="sm">
          {FEATURE_LABELS[code] ?? code}
        </Badge>
      ))}
    </div>
  );
}
