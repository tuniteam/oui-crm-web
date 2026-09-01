import type { FEATURE_CODE_VALUES } from '../constants/constants';
import type { PaginationMeta } from '@/features/user/types/userList';
import type { ProjectStatus } from './project';

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

export type { PaginationMeta };
