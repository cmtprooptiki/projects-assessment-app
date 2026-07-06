'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import EmployeeTable from '@/components/employees/EmployeeTable';
import EmployeeFilters from '@/components/employees/EmployeeFilters';
import { useEmployees } from '@/hooks/useEmployees';
import { useIsAdmin } from '@/hooks/useRole';
import { EmployeeFilters as IEmployeeFilters } from '@/types';

function AzureBadge() {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#0078d4]/10 text-[#0078d4] dark:bg-[#0078d4]/20 dark:text-[#5ba8f5] border border-[#0078d4]/20 select-none">
      <svg viewBox="0 0 23 23" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5 0.5L22 5.5V17.5L11.5 22.5L1 17.5V5.5L11.5 0.5Z" fill="#0078d4" opacity="0.8"/>
        <path d="M6 12L9.5 7L13 12L9.5 17L6 12Z" fill="white" opacity="0.9"/>
        <path d="M12 10L15 7L18 10L15 13L12 10Z" fill="white" opacity="0.7"/>
      </svg>
      Synced from Microsoft Azure
    </div>
  );
}

const defaultFilters: IEmployeeFilters = { page: 1, limit: 15 };

export default function EmployeesPage() {
  const [filters, setFilters] = useState<IEmployeeFilters>(defaultFilters);
  const { data, isLoading, error } = useEmployees(filters);
  const isAdmin = useIsAdmin();

  const employees = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <EmployeeFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
        />
        <div className="flex items-center gap-3">
          <AzureBadge />
          <Link href="/employees/new">
            <Button>
              <Plus size={16} />
              Add Employee
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Failed to load employees. Please try again.
          </div>
        ) : (
          <>
            <EmployeeTable employees={employees} isAdmin={isAdmin} />
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
