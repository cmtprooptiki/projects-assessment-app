import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Education } from '@/types';

export const useEducation = (employeeId: number) =>
  useQuery<{ success: boolean; data: Education[] }>({
    queryKey: ['education', employeeId],
    queryFn: () => api.get(`/employees/${employeeId}/education`).then((r) => r.data),
    enabled: !!employeeId,
  });

export const useCreateEducation = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { institutionName: string; schoolName?: string; departmentName?: string; degreeTitle: string; degreeType?: string; specialization?: string; dateAwarded?: string }) =>
      api.post(`/employees/${employeeId}/education`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['education', employeeId] }),
  });
};

export const useUpdateEducation = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Education> }) =>
      api.put(`/employees/${employeeId}/education/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['education', employeeId] }),
  });
};

export const useDeleteEducation = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/employees/${employeeId}/education/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['education', employeeId] }),
  });
};
