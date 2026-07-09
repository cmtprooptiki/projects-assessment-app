'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EmployeeForm from '@/components/employees/EmployeeForm';
import Button from '@/components/ui/Button';
import { useCreateEmployee } from '@/hooks/useEmployees';

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = useCreateEmployee();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
            <ArrowLeft size={16} />
            Back to Employees
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">New Employee</h1>
      </div>

      <EmployeeForm
        onSubmit={async (data) => {
          await createEmployee.mutateAsync(data);
          router.push('/employees');
        }}
        submitLabel="Create Employee"
      />
    </div>
  );
}
