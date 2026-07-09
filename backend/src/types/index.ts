export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ParticipationFilterQuery {
  projectId?: string;
  employeeId?: string;
  roleId?: string;
  department?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
  month?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ParticipationMonthStats {
  totalMonths: number;
  periods: Array<{
    startDate: string;
    endDate: string | null;
    months: number;
  }>;
}
