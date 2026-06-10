import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Client, ClientFilters, PaginatedResult, ApiResult } from '@/types';

export const useClients = (filters: ClientFilters = {}) =>
  useQuery<PaginatedResult<Client>>({
    queryKey: ['clients', filters],
    queryFn: () => api.get('/clients', { params: filters }).then((r) => r.data),
  });

export const useClient = (id: number | null) =>
  useQuery<ApiResult<Client>>({
    queryKey: ['clients', id],
    queryFn: () => api.get(`/clients/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'projects'>) =>
      api.post('/clients', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useUpdateClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) =>
      api.put(`/clients/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useDeleteClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/clients/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useImportClients = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post('/clients/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
};
