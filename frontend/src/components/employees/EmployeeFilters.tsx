'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useDepartments } from '@/hooks/useDepartments';
import type { EmployeeFilters } from '@/types';

interface Props {
  filters: EmployeeFilters;
  onChange: (filters: EmployeeFilters) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function EmployeeFilters({ filters, onChange, onReset }: Props) {
  const { data } = useDepartments();
  const departments = data?.data ?? [];

  const update = (key: keyof EmployeeFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-56">
        <Input
          label="Search"
          placeholder="Name or email..."
          value={filters.search ?? ''}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>
      <div className="w-44">
        <Select
          label="Department"
          options={departments.map((d) => ({ value: d.name, label: d.name }))}
          placeholder="All departments"
          value={filters.department ?? ''}
          onChange={(e) => update('department', e.target.value)}
        />
      </div>
      <div className="w-36">
        <Select
          label="Status"
          options={statusOptions}
          placeholder="All statuses"
          value={filters.isActive ?? ''}
          onChange={(e) => update('isActive', e.target.value)}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
    </div>
  );
}
