import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Contract, ContractFilters, PaginatedResult, ApiResult } from '@/types';

export const useContracts = (filters: ContractFilters = {}) =>
  useQuery<PaginatedResult<Contract>>({
    queryKey: ['contracts', filters],
    queryFn: () => api.get('/contracts', { params: filters }).then((r) => r.data),
  });

export const useContract = (id: number | null) =>
  useQuery<ApiResult<Contract>>({
    queryKey: ['contracts', id],
    queryFn: () => api.get(`/contracts/${id}`).then((r) => r.data),
    enabled: !!id,
  });

type ContractPayload = {
  name: string;
  code: string;
  description?: string | null;
  clientId?: number | null;
  projectId?: number | null;
  startDate: string;
  endDate?: string | null;
  budget?: number | null;
  confirmationOfGoodPerformance?: string | null;
};

export const useCreateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContractPayload) => api.post('/contracts', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

export const useUpdateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContractPayload> }) =>
      api.put(`/contracts/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

export const useDeleteContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/contracts/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
};
