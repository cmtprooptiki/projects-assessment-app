import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Language } from '@/types';

export const useLanguages = (employeeId: number) =>
  useQuery<{ success: boolean; data: Language[] }>({
    queryKey: ['languages', employeeId],
    queryFn: () => api.get(`/employees/${employeeId}/languages`).then((r) => r.data),
    enabled: !!employeeId,
  });

export const useCreateLanguage = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { language: string; degreeTitle?: string; level?: string }) =>
      api.post(`/employees/${employeeId}/languages`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['languages', employeeId] }),
  });
};

export const useUpdateLanguage = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Language> }) =>
      api.put(`/employees/${employeeId}/languages/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['languages', employeeId] }),
  });
};

export const useDeleteLanguage = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/employees/${employeeId}/languages/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['languages', employeeId] }),
  });
};
