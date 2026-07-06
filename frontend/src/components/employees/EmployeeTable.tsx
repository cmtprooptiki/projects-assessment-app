'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import EmployeeAvatar from '@/components/ui/EmployeeAvatar';
import { Employee } from '@/types';
import { fullName } from '@/lib/utils';
import { useDeleteEmployee } from '@/hooks/useEmployees';

interface Props {
  employees: Employee[];
  onDeleted?: () => void;
  isAdmin?: boolean;
}

export default function EmployeeTable({ employees, onDeleted, isAdmin = false }: Props) {
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteEmployee.mutateAsync(deleting.id);
    setDeleting(null);
    onDeleted?.();
  };

  if (employees.length === 0) {
    return <EmptyState title="No employees found" description="Try adjusting your filters or add a new employee." />;
  }

  const th = 'text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Department</th>
              <th className={th}>Type</th>
              <th className={th}>Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar employee={emp} size="sm" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{fullName(emp)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{emp.email}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                <td className="px-4 py-3">
                  <Badge variant={emp.isExternal ? 'warning' : 'info'}>
                    {emp.isExternal ? 'External' : 'Internal'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={emp.isActive ? 'success' : 'default'}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/employees/${emp.id}/edit`}>
                      <Button variant="ghost" size="sm"><Pencil size={14} /></Button>
                    </Link>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(emp)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Employee">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{deleting ? fullName(deleting) : ''}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteEmployee.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}
