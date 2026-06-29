import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { EmployeeHistoryProject, ApiResult } from '@/types';

const key = (employeeId: number) => ['history-projects', employeeId];

export const useHistoryProjects = (employeeId: number) =>
  useQuery<ApiResult<EmployeeHistoryProject[]>>({
    queryKey: key(employeeId),
    queryFn: () => api.get(`/employees/${employeeId}/history-projects`).then((r) => r.data),
    enabled: !!employeeId,
  });

export const useCreateHistoryProject = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployeeHistoryProject>) =>
      api.post(`/employees/${employeeId}/history-projects`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};

export const useUpdateHistoryProject = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmployeeHistoryProject> }) =>
      api.put(`/employees/${employeeId}/history-projects/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};

export const useDeleteHistoryProject = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/employees/${employeeId}/history-projects/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};
