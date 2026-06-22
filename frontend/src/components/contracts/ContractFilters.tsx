'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { ContractFilters } from '@/types';

interface Props {
  filters: ContractFilters;
  onChange: (filters: ContractFilters) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: 'Υπογεγραμμένο', label: 'Υπογεγραμμένο' },
  { value: 'Ολοκληρωμένο', label: 'Ολοκληρωμένο' },
  { value: 'Αποπληρωμένο', label: 'Αποπληρωμένο' },
];

export default function ContractFilters({ filters, onChange, onReset }: Props) {
  const update = (key: keyof ContractFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-56">
        <Input label="Search" placeholder="Name, code, or client..." value={filters.search ?? ''} onChange={(e) => update('search', e.target.value)} />
      </div>
      <div className="w-44">
        <Select label="Status" options={statusOptions} placeholder="All statuses" value={filters.status ?? ''} onChange={(e) => update('status', e.target.value)} />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
    </div>
  );
}
