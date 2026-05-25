'use client';

import { useRouter } from 'next/navigation';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { useCreateEmployee } from '@/hooks/useEmployees';

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = useCreateEmployee();

  return (
    <EmployeeForm
      onSubmit={async (data) => {
        await createEmployee.mutateAsync(data);
        router.push('/employees');
      }}
      submitLabel="Create Employee"
    />
  );
}
