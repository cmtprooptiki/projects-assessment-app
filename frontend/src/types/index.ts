export interface Department {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Language {
  id: number;
  employeeId: number;
  language: string;
  degreeTitle?: string | null;
  level?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: number;
  employeeId: number;
  institutionName: string;
  degreeTitle: string;
  specialization?: string | null;
  dateAwarded?: string | null;
  recognized?: 'yes' | 'no' | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityPeriod {
  id: number;
  employeeId: number;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  isActive: boolean;
  photo?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  phone?: string | null;
  homeAddress?: string | null;
  yearsOfService?: number | null;
  availabilityPeriods?: AvailabilityPeriod[];
  createdAt: string;
  updatedAt: string;
  participations?: ProjectParticipation[];
  education?: Education[];
}

export type ContractStatus = 'Υπογεγραμμένο' | 'Ολοκληρωμένο' | 'Αποπληρωμένο';

export interface Contract {
  id: number;
  cashflowId?: number | null;
  projectId?: number | null;
  name: string;
  code: string;
  description?: string | null;
  clientId?: number | null;
  client?: Client | null;
  startDate: string;
  endDate?: string | null;
  status: ContractStatus;
  budget?: number | null;
  confirmationOfGoodPerformance?: string | null;
  createdAt: string;
  updatedAt: string;
  participations?: ProjectParticipation[];
}

export interface Project {
  id: number;
  projectCode: string;
  name: string;
  acronym: string;
  description?: string | null;
  clientId?: number | null;
  client?: Client | null;
  contracts?: Contract[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  name: string;
  code?: string | null;
  industry?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectParticipation {
  id: number;
  employeeId: number;
  projectId: number;
  roleId: number;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  totalMonths?: number;
  employee?: Employee;
  project?: Contract;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResult<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardSummary {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    totalProjects: number;
    activeProjects: number;
    totalRoles: number;
    totalParticipations: number;
  };
  projectsByStatus: Array<{ status: string; count: string }>;
  employeesByDepartment: Array<{ department: string; count: string }>;
  recentParticipations: ProjectParticipation[];
}

export interface EmployeeFilters {
  department?: string;
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClientFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContractFilters {
  status?: string;
  clientId?: string;
  projectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProjectFilters {
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ParticipationFilters {
  projectId?: string;
  employeeId?: string;
  roleId?: string;
  department?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
  month?: string;
  page?: number;
  limit?: number;
}
