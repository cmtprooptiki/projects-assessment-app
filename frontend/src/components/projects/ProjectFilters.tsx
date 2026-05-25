'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ProjectFilters } from '@/types';

interface Props {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function ProjectFilters({ filters, onChange, onReset }: Props) {
  const update = (key: keyof ProjectFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-56">
        <Input
          label="Search"
          placeholder="Name, code, or client..."
          value={filters.search ?? ''}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>
      <div className="w-44">
        <Select
          label="Status"
          options={statusOptions}
          placeholder="All statuses"
          value={filters.status ?? ''}
          onChange={(e) => update('status', e.target.value)}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
