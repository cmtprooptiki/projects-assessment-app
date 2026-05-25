'use client';

import { useRouter, useParams } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const { data, isLoading } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();

  if (isLoading) return <PageSpinner />;

  return (
    <EmployeeForm
      defaultValues={data?.data}
      onSubmit={async (formData) => {
        await updateEmployee.mutateAsync({ id, data: formData });
        router.push('/employees');
      }}
      submitLabel="Update Employee"
    />
  );
}
