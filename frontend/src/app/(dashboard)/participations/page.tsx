'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, FileUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import ParticipationTable from '@/components/participations/ParticipationTable';
import ParticipationFilters from '@/components/participations/ParticipationFilters';
import BulkImportModal from '@/components/participations/BulkImportModal';
import { useParticipations, useRecalculateParticipations } from '@/hooks/useParticipations';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
import { useRoles } from '@/hooks/useRoles';
import { ParticipationFilters as IParticipationFilters } from '@/types';

const defaultFilters: IParticipationFilters = { page: 1, limit: 15 };

export default function ParticipationsPage() {
  const [filters, setFilters] = useState<IParticipationFilters>(defaultFilters);
  const [bulkOpen, setBulkOpen] = useState(false);
  const { data, isLoading, error } = useParticipations(filters);
  const { data: employeesData } = useEmployees({ limit: 999 });
  const { data: projectsData } = useProjects({ limit: 999 });
  const { data: rolesData } = useRoles();
  const recalculate = useRecalculateParticipations();

  const participations = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ParticipationFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
          employees={employeesData?.data ?? []}
          projects={projectsData?.data ?? []}
          roles={rolesData?.data ?? []}
        />
        <div className="flex items-center gap-2">
          {recalculate.data && !recalculate.isPending && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {recalculate.data.updated} updated, {recalculate.data.skipped} skipped
            </span>
          )}
          <Button
            variant="secondary"
            loading={recalculate.isPending}
            onClick={() => recalculate.mutate()}
            title="Re-run full availability × contract overlap for internal employees"
          >
            <RefreshCw size={16} />
            Recalculate Dates
          </Button>
          <Button variant="secondary" onClick={() => setBulkOpen(true)}>
            <FileUp size={16} />
            Bulk Import
          </Button>
          <Link href="/participations/new">
            <Button>
              <Plus size={16} />
              Add Participation
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Failed to load participations. Please try again.
          </div>
        ) : (
          <>
            <ParticipationTable participations={participations} />
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
      <BulkImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}
