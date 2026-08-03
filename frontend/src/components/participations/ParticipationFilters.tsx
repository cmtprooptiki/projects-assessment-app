'use client';

import Select from '@/components/ui/Select';
import Combobox from '@/components/ui/Combobox';
import Button from '@/components/ui/Button';

import type { ParticipationFilters, Project } from '@/types';

interface Props {
  filters: ParticipationFilters;
  onChange: (filters: ParticipationFilters) => void;
  onReset: () => void;
  employees: Array<{ id: number; firstName: string; lastName: string; department: string }>;
  projects: Project[];
  roles: Array<{ id: number; name: string }>;
}

const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'Product', label: 'Product' },
  { value: 'Marketing', label: 'Marketing' },
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
      <div className="w-48">
        <Combobox
          label="Employee"
          placeholder="All employees"
          options={employees.map((e) => ({
            value: e.id.toString(),
            label: `${e.lastName} ${e.firstName}`,
          }))}
          value={filters.employeeId ?? ''}
          onChange={(val) => update('employeeId', val)}
        />
      </div>
      <div className="w-64">
        <Combobox
          label="Project"
          placeholder="All projects"
          options={projects.map((p) => ({
            value: p.id.toString(),
            label: `${p.projectCode} – ${p.name}`,
          }))}
          value={filters.projectId ?? ''}
          onChange={(val) => update('projectId', val)}
        />
      </div>
      <div className="w-40">
        <Combobox
          label="Role"
          placeholder="All roles"
          options={roles.map((r) => ({
            value: r.id.toString(),
            label: r.name,
          }))}
          value={filters.roleId ?? ''}
          onChange={(val) => update('roleId', val)}
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
