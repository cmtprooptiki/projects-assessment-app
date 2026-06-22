'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import ParticipationTable from '@/components/participations/ParticipationTable';
import ParticipationFilters from '@/components/participations/ParticipationFilters';
import { useParticipations } from '@/hooks/useParticipations';
import { useEmployees } from '@/hooks/useEmployees';
import { useContracts } from '@/hooks/useContracts';
import { useRoles } from '@/hooks/useRoles';
import { ParticipationFilters as IParticipationFilters } from '@/types';

const defaultFilters: IParticipationFilters = { page: 1, limit: 15 };

export default function ParticipationsPage() {
  const [filters, setFilters] = useState<IParticipationFilters>(defaultFilters);
  const { data, isLoading, error } = useParticipations(filters);
  const { data: employeesData } = useEmployees({ limit: 999 });
  const { data: projectsData } = useContracts({ limit: 999 });
  const { data: rolesData } = useRoles();

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
        <Link href="/participations/new">
          <Button>
            <Plus size={16} />
            Add Participation
          </Button>
        </Link>
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
    </div>
  );
}
