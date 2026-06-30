import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AvailabilityPeriod } from '@/types';

export const useAvailability = (employeeId: number) =>
  useQuery<{ success: boolean; data: AvailabilityPeriod[] }>({
    queryKey: ['availability', employeeId],
    queryFn: () => api.get(`/employees/${employeeId}/availability`).then((r) => r.data),
    enabled: !!employeeId,
  });

export const useCreateAvailability = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { startDate: string; endDate?: string | null; notes?: string }) =>
      api.post(`/employees/${employeeId}/availability`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability', employeeId] });
      qc.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
  });
};

export const useUpdateAvailability = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AvailabilityPeriod> }) =>
      api.put(`/employees/${employeeId}/availability/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability', employeeId] });
      qc.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
  });
};

export const useDeleteAvailability = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/employees/${employeeId}/availability/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability', employeeId] });
      qc.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
  });
};
