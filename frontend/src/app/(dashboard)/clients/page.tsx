'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import ClientTable from '@/components/clients/ClientTable';
import ClientImportModal from '@/components/clients/ClientImportModal';
import { useClients } from '@/hooks/useClients';
import { ClientFilters } from '@/types';

const defaultFilters: ClientFilters = { page: 1, limit: 15 };

export default function ClientsPage() {
  const [filters, setFilters] = useState<ClientFilters>(defaultFilters);
  const [importOpen, setImportOpen] = useState(false);
  const { data, isLoading, error } = useClients(filters);

  const clients = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-64">
          <Input
            label=""
            placeholder="Search clients..."
            value={filters.search ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined, page: 1 }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
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
            <ClientTable clients={clients} />
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
