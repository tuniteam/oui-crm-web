import type { FeatureCode } from './projectList';
import type { ProjectStatus } from './project';

/** Etat d'une fonctionnalite. Le detail les liste TOUTES, avec leur drapeau. */
export type ProjectFeature = {
  code: FeatureCode;
  enabled: boolean;
};

/** GET /projects/:id */
export type ProjectDetailsResponse = {
  id: string;
  slug: string;
  name: string;
  productName: string;
  description: string | null;
  status: ProjectStatus;
  activatedAt: string | null;
  features: ProjectFeature[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
};
