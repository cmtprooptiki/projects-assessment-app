'use client';

import { Pencil, Trash2, Building } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SortableTh from '@/components/ui/SortableTh';
import { Department } from '@/types';

type SortDir = 'asc' | 'desc';

interface Props {
  departments: Department[];
  sortBy?: string;
  sortOrder?: SortDir;
  onSort?: (field: string) => void;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}

export default function DepartmentTable({ departments, sortBy = 'name', sortOrder = 'asc', onSort, onEdit, onDelete }: Props) {
  if (departments.length === 0) {
    return <EmptyState title="No departments yet" description="Create your first department to get started." />;
  }

  const Th = ({ field, label }: { field: string; label: string }) => (
    <SortableTh field={field} label={label} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700">
            <Th field="name" label="Name" />
            <Th field="description" label="Description" />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
          {departments.map((dept) => (
            <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Building size={15} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{dept.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                {dept.description ?? <span className="text-slate-300 dark:text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(dept)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(dept)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"><Trash2 size={14} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
