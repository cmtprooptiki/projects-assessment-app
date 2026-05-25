import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardSummary, ApiResult, ProjectParticipation, ParticipationFilters } from '@/types';

export const useDashboardSummary = () =>
  useQuery<ApiResult<DashboardSummary>>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get('/dashboard/summary').then((r) => r.data),
  });

export const useProjectDashboard = (projectId: number | null) =>
  useQuery({
    queryKey: ['dashboard', 'project', projectId],
    queryFn: () =>
      api.get(`/dashboard/project/${projectId}`).then((r) => r.data),
    enabled: !!projectId,
  });

export const useEmployeeDashboard = (employeeId: number | null) =>
  useQuery({
    queryKey: ['dashboard', 'employee', employeeId],
    queryFn: () =>
      api.get(`/dashboard/employee/${employeeId}`).then((r) => r.data),
    enabled: !!employeeId,
  });

export const useClientDashboard = (clientId: number | null) =>
  useQuery({
    queryKey: ['dashboard', 'client', clientId],
    queryFn: () =>
      api.get(`/dashboard/client/${clientId}`).then((r) => r.data),
    enabled: !!clientId,
  });

export const useDashboardParticipations = (filters: ParticipationFilters = {}) =>
  useQuery<{ success: boolean; data: ProjectParticipation[]; total: number }>({
    queryKey: ['dashboard', 'participations', filters],
    queryFn: () =>
      api.get('/dashboard/participations', { params: filters }).then((r) => r.data),
  });
