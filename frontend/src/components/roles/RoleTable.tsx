'use client';

import { Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SortableTh from '@/components/ui/SortableTh';
import { Role } from '@/types';

type SortDir = 'asc' | 'desc';

interface Props {
  roles: Role[];
  sortBy?: string;
  sortOrder?: SortDir;
  onSort?: (field: string) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export default function RoleTable({ roles, sortBy = 'name', sortOrder = 'asc', onSort, onEdit, onDelete }: Props) {
  if (roles.length === 0) {
    return <EmptyState title="No roles found" description="Try adjusting your filters or create a new role." />;
  }

  const Th = ({ field, label }: { field: string; label: string }) => (
    <SortableTh field={field} label={label} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-700">
            <Th field="name" label="Name" />
            <Th field="description" label="Description" />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-200">{role.name}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                {role.description ?? <span className="text-gray-300 dark:text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(role)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(role)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"><Trash2 size={14} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
