'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import ClientTable from '@/components/clients/ClientTable';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientImportModal from '@/components/clients/ClientImportModal';
import { useClients } from '@/hooks/useClients';
import { useIsAdmin } from '@/hooks/useRole';
import { ClientFilters as IClientFilters } from '@/types';

function CashFlowBadge() {
  return (
    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900 dark:bg-slate-950 text-white border border-slate-700 select-none">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#1a1a2e" stroke="#444" strokeWidth="0.5"/>
        <path d="M8 9.5C8 7.567 9.567 6 11.5 6h1C14.433 6 16 7.567 16 9.5V10h-2V9.5C14 8.672 13.328 8 12.5 8h-1C10.672 8 10 8.672 10 9.5v5c0 .828.672 1.5 1.5 1.5h1c.828 0 1.5-.672 1.5-1.5V14h2v.5c0 1.933-1.567 3.5-3.5 3.5h-1C9.567 18 8 16.433 8 14.5v-5Z" fill="white" opacity="0.9"/>
        <path d="M7 12h10" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      </svg>
      <span>Synced from <span className="font-semibold">CashFlow</span></span>
    </div>
  );
}

const defaultFilters: IClientFilters = { page: 1, limit: 15, sortBy: 'name', sortOrder: 'asc' };

export default function ClientsPage() {
  const [filters, setFilters] = useState<IClientFilters>(defaultFilters);
  const [importOpen, setImportOpen] = useState(false);
  const { data, isLoading, error } = useClients(filters);
  const isAdmin = useIsAdmin();

  const handleSort = (field: string) => {
    setFilters((f) => ({
      ...f,
      page: 1,
      sortBy: field,
      sortOrder: f.sortBy === field && f.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const clients = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ClientFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
        <div className="flex items-center gap-2">
          <CashFlowBadge />
          {isAdmin && (
            <>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <Upload size={16} />
                Import CSV
              </Button>
              <Link href="/clients/new">
                <Button>
                  <Plus size={16} />
                  Add Client
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Failed to load clients. Please try again.
          </div>
        ) : (
          <>
            <ClientTable
              clients={clients}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={handleSort}
              isAdmin={isAdmin}
            />
            {meta && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            )}
          </>
        )}
      </Card>

      <ClientImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
