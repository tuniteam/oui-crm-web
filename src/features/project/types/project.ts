import type {
  FEATURE_CODE_VALUES,
  PROJECT_STATUS_VALUES,
} from '../constants/project.constants';

export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];
export type FeatureCode = (typeof FEATURE_CODE_VALUES)[number];

/** Element de GET /projects — `features` ne liste que les codes actives. */
export type ProjectListItem = {
  id: string;
  slug: string;
  name: string;
  productName: string;
  status: ProjectStatus;
  features: FeatureCode[];
  userCount: number;
  createdAt: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProjectListResponse = {
  data: ProjectListItem[];
  meta: PaginationMeta;
};

export type ProjectListParams = {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
};
