import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Employee, EmployeeFilters, PaginatedResult, ApiResult } from '@/types';

export const useEmployees = (filters: EmployeeFilters = {}) =>
  useQuery<PaginatedResult<Employee>>({
    queryKey: ['employees', filters],
    queryFn: () => api.get('/employees', { params: filters }).then((r) => r.data),
  });

export const useEmployee = (id: number | null) =>
  useQuery<ApiResult<Employee>>({
    queryKey: ['employees', id],
    queryFn: () => api.get(`/employees/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post('/employees', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put(`/employees/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/employees/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};
