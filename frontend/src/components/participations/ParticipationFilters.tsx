'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { ParticipationFilters } from '@/types';

interface Props {
  filters: ParticipationFilters;
  onChange: (filters: ParticipationFilters) => void;
  onReset: () => void;
  employees: Array<{ id: number; firstName: string; lastName: string; department: string }>;
  projects: Array<{ id: number; name: string }>;
  roles: Array<{ id: number; name: string }>;
}

const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'Product', label: 'Product' },
  { value: 'Marketing', label: 'Marketing' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function ParticipationFilters({
  filters,
  onChange,
  onReset,
  employees,
  projects,
  roles,
}: Props) {
  const update = (key: keyof ParticipationFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-40">
        <Select
          label="Employee"
          placeholder="All employees"
          options={employees.map((e) => ({
            value: e.id.toString(),
            label: `${e.firstName} ${e.lastName}`,
          }))}
          value={filters.employeeId ?? ''}
          onChange={(e) => update('employeeId', e.target.value)}
        />
      </div>
      <div className="w-40">
        <Select
          label="Project"
          placeholder="All projects"
          options={projects.map((p) => ({
            value: p.id.toString(),
            label: p.name,
          }))}
          value={filters.projectId ?? ''}
          onChange={(e) => update('projectId', e.target.value)}
        />
      </div>
      <div className="w-40">
        <Select
          label="Role"
          placeholder="All roles"
          options={roles.map((r) => ({
            value: r.id.toString(),
            label: r.name,
          }))}
          value={filters.roleId ?? ''}
          onChange={(e) => update('roleId', e.target.value)}
        />
      </div>
      <div className="w-40">
        <Select
          label="Department"
          placeholder="All departments"
          options={departmentOptions}
          value={filters.department ?? ''}
          onChange={(e) => update('department', e.target.value)}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
