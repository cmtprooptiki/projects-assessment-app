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
import { ProjectFilters as IProjectFilters } from '@/types';

const defaultFilters: IProjectFilters = { page: 1, limit: 15 };

export default function ProjectsPage() {
  const [filters, setFilters] = useState<IProjectFilters>(defaultFilters);
  const { data, isLoading, error } = useProjects(filters);

  const projects = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ProjectFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
        />
        <Link href="/projects/new">
          <Button>
            <Plus size={16} />
            Add Project
          </Button>
        </Link>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Failed to load projects. Please try again.
          </div>
        ) : (
          <>
            <ProjectTable projects={projects} />
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
