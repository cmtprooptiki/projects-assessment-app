'use client';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { DepartmentFilters } from '@/types';

interface Props {
  filters: DepartmentFilters;
  onChange: (filters: DepartmentFilters) => void;
  onReset: () => void;
}

export default function DepartmentFilters({ filters, onChange, onReset }: Props) {
  const update = (key: keyof DepartmentFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-64">
        <Input label="Search" placeholder="Name or description..." value={filters.search ?? ''} onChange={(e) => update('search', e.target.value)} />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
    </div>
  );
}
