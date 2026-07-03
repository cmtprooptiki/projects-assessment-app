import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ProjectParticipation,
  ParticipationFilters,
  PaginatedResult,
  ApiResult,
  BulkPreviewResult,
  BulkPreviewSuccessRow,
} from '@/types';

export const useParticipations = (filters: ParticipationFilters = {}) =>
  useQuery<PaginatedResult<ProjectParticipation>>({
    queryKey: ['participations', filters],
    queryFn: () =>
      api.get('/participations', { params: filters }).then((r) => r.data),
  });

export const useParticipation = (id: number | null) =>
  useQuery<ApiResult<ProjectParticipation>>({
    queryKey: ['participations', id],
    queryFn: () => api.get(`/participations/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateParticipation = () => {
  const qc = useQueryClient();
  return useMutation<
    { success: boolean; data: ProjectParticipation[] },
    Error,
    { employeeId: number; projectId: number; roleId: number; notes?: string | null; startDate?: string; endDate?: string | null }
  >({
    mutationFn: (data) => api.post('/participations', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participations'] }),
  });
};

export const useUpdateParticipation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProjectParticipation>;
    }) => api.put(`/participations/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participations'] }),
  });
};

export const useDeleteParticipation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/participations/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participations'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkPreviewParticipations = () =>
  useMutation<ApiResult<BulkPreviewResult>, Error, FormData>({
    mutationFn: (formData) =>
      api.post('/participations/bulk-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
  });

export const useBulkConfirmParticipations = () => {
  const qc = useQueryClient();
  return useMutation<
    { success: boolean; imported: number; participationsCreated: number },
    Error,
    { rows: Array<{ employeeId: number; projectId: number; roleId: number; periods: Array<{ startDate: string; endDate: string }> }> }
  >({
    mutationFn: (body) => api.post('/participations/bulk-confirm', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participations'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useRecalculateParticipations = () => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; updated: number; skipped: number }, Error>({
    mutationFn: () => api.post('/participations/recalculate').then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participations'] }),
  });
};
