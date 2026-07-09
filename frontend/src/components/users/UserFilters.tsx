'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { UserFilters } from '@/types';

interface Props {
  filters: UserFilters;
  onChange: (filters: UserFilters) => void;
  onReset: () => void;
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

export default function UserFilters({ filters, onChange, onReset }: Props) {
  const update = (key: keyof UserFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-56">
        <Input label="Search" placeholder="Name or email..." value={filters.search ?? ''} onChange={(e) => update('search', e.target.value)} />
      </div>
      <div className="w-36">
        <Select label="Role" options={roleOptions} placeholder="All roles" value={filters.role ?? ''} onChange={(e) => update('role', e.target.value)} />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
    </div>
  );
}
