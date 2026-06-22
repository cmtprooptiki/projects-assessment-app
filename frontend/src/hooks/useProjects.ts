import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Project, ProjectFilters, PaginatedResult, ApiResult } from '@/types';

export const useProjects = (filters: ProjectFilters = {}) =>
  useQuery<PaginatedResult<Project>>({
    queryKey: ['projects', filters],
    queryFn: () => api.get('/projects', { params: filters }).then((r) => r.data),
  });

export const useProject = (id: number | null) =>
  useQuery<ApiResult<Project>>({
    queryKey: ['projects', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
    enabled: !!id,
  });

type ProjectPayload = {
  name: string;
  acronym: string;
  description?: string | null;
  clientId?: number | null;
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectPayload) => api.post('/projects', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProjectPayload> }) =>
      api.put(`/projects/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useLinkContracts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contractIds }: { id: number; contractIds: number[] }) =>
      api.patch(`/projects/${id}/contracts`, { contractIds }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};
