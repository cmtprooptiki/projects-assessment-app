'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import ContractTable from '@/components/contracts/ContractTable';
import ContractFilters from '@/components/contracts/ContractFilters';
import { useContracts } from '@/hooks/useContracts';
import { ContractFilters as IContractFilters } from '@/types';

const defaultFilters: IContractFilters = { page: 1, limit: 15 };

export default function ContractsPage() {
  const [filters, setFilters] = useState<IContractFilters>(defaultFilters);
  const { data, isLoading, error } = useContracts(filters);

  const contracts = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ContractFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
        <Link href="/contracts/new">
          <Button><Plus size={16} />Add Contract</Button>
        </Link>
      </div>
      <Card>
        {isLoading ? <PageSpinner />
          : error ? <div className="p-8 text-center text-sm text-red-500">Failed to load contracts. Please try again.</div>
          : (
            <>
              <ContractTable contracts={contracts} />
              {meta && (
                <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit}
                  onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
              )}
            </>
          )}
      </Card>
    </div>
  );
}
