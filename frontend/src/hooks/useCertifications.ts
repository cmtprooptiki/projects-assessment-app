import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { EmployeeCertification, ApiResult } from '@/types';

const key = (employeeId: number) => ['certifications', employeeId];

export const useCertifications = (employeeId: number) =>
  useQuery<ApiResult<EmployeeCertification[]>>({
    queryKey: key(employeeId),
    queryFn: () => api.get(`/employees/${employeeId}/certifications`).then((r) => r.data),
    enabled: !!employeeId,
  });

export const useCreateCertification = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      api.post(`/employees/${employeeId}/certifications`, { text }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};

export const useUpdateCertification = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      api.put(`/employees/${employeeId}/certifications/${id}`, { text }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};

export const useDeleteCertification = (employeeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/employees/${employeeId}/certifications/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(employeeId) }),
  });
};
