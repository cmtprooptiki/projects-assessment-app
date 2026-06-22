'use client';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { ProjectFilters } from '@/types';

interface Props {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
  onReset: () => void;
}

export default function ProjectFilters({ filters, onChange, onReset }: Props) {
  const update = (key: keyof ProjectFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-56">
        <Input label="Search" placeholder="Name, acronym, or client..." value={filters.search ?? ''} onChange={(e) => update('search', e.target.value)} />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
    </div>
  );
}
