'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import ProjectTable from '@/components/projects/ProjectTable';
import ProjectFilters from '@/components/projects/ProjectFilters';
import { useProjects } from '@/hooks/useProjects';
import { useContracts } from '@/hooks/useContracts';
import { ProjectFilters as IProjectFilters } from '@/types';

const defaultFilters: IProjectFilters = { page: 1, limit: 15 };

export default function ProjectsPage() {
  const [filters, setFilters] = useState<IProjectFilters>(defaultFilters);
  const { data, isLoading, error } = useProjects(filters);
  const { data: unlinkedData } = useContracts({ unlinked: 'true', limit: 1 });

  const projects = data?.data ?? [];
  const meta = data?.meta;
  const unlinkedCount = unlinkedData?.meta.total ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ProjectFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
        <div className="flex items-center gap-3">
          {unlinkedCount > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {unlinkedCount} unassigned contract{unlinkedCount !== 1 ? 's' : ''}
            </span>
          )}
          <Link href="/projects/new">
            <Button><Plus size={16} />New Project</Button>
          </Link>
        </div>
      </div>
      <Card>
        {isLoading ? <PageSpinner />
          : error ? <div className="p-8 text-center text-sm text-red-500">Failed to load projects. Please try again.</div>
          : (
            <>
              <ProjectTable projects={projects} />
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
