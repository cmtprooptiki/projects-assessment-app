'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import ProjectTable from '@/components/projects/ProjectTable';
import ProjectFilters from '@/components/projects/ProjectFilters';
import { useProjects } from '@/hooks/useProjects';
import { useContracts } from '@/hooks/useContracts';
import { useIsAdmin } from '@/hooks/useRole';
import { ProjectFilters as IProjectFilters } from '@/types';
import api from '@/lib/api';
import { exportProjectsToXlsx } from '@/lib/exportProjects';

const defaultFilters: IProjectFilters = { page: 1, limit: 50, sortBy: 'projectCode', sortOrder: 'asc' };

export default function ProjectsPage() {
  const [filters, setFilters] = useState<IProjectFilters>(defaultFilters);
  const [exporting, setExporting] = useState(false);
  const isAdmin = useIsAdmin();
  const { data, isLoading, error } = useProjects(filters);

  const handleSort = (field: string) => {
    setFilters((f) => ({
      ...f,
      page: 1,
      sortBy: field,
      sortOrder: f.sortBy === field && f.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all projects (ignore current pagination) with active filters applied
      const { search, clientId } = filters;
      const res = await api.get('/projects', { params: { page: 1, limit: 9999, sortBy: filters.sortBy, sortOrder: filters.sortOrder, search, clientId } });
      exportProjectsToXlsx(res.data.data, 'projects.xlsx');
    } finally {
      setExporting(false);
    }
  };

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
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">
              {unlinkedCount} unassigned contract{unlinkedCount !== 1 ? 's' : ''}
            </span>
          )}
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            <Download size={16} />Export XLSX
          </Button>
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
              <ProjectTable
                projects={projects}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onSort={handleSort}
                isAdmin={isAdmin}
              />
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
