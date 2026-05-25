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
import { EmployeeFilters as IEmployeeFilters } from '@/types';

const defaultFilters: IEmployeeFilters = { page: 1, limit: 15 };

export default function EmployeesPage() {
  const [filters, setFilters] = useState<IEmployeeFilters>(defaultFilters);
  const { data, isLoading, error } = useEmployees(filters);

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
        <Link href="/employees/new">
          <Button>
            <Plus size={16} />
            Add Employee
          </Button>
        </Link>
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
            <EmployeeTable employees={employees} />
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
