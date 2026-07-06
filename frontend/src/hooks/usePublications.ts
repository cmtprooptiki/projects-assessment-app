import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { EmployeePublication, ApiResult } from '@/types';

const key = (employeeId: number) => ['publications', employeeId];

export const usePublications = (employeeId: number) =>
  useQuery<ApiResult<EmployeePublication[]>>({
    queryKey: key(employeeId),
    queryFn: () => api.get(`/employees/${employeeId}/publications`).then((r) => r.data),
    enabled: !!employeeId,
  });

export const useCreatePublication = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      api.post(`/employees/${employeeId}/publications`, { text }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};

export const useUpdatePublication = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      api.put(`/employees/${employeeId}/publications/${id}`, { text }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};

export const useDeletePublication = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/employees/${employeeId}/publications/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};
