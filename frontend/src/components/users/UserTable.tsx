'use client';

import { Pencil, Trash2, Shield, User as UserIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import SortableTh from '@/components/ui/SortableTh';
import { User } from '@/types';

type SortDir = 'asc' | 'desc';

interface Props {
  users: User[];
  sortBy?: string;
  sortOrder?: SortDir;
  onSort?: (field: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({ users, sortBy = 'name', sortOrder = 'asc', onSort, onEdit, onDelete }: Props) {
  if (users.length === 0) {
    return <EmptyState title="No users found" description="Create your first user to get started." />;
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
            <Th field="email" label="Email" />
            <Th field="role" label="Role" />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{user.firstName} {user.lastName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                  {user.role === 'admin' ? <Shield size={11} className="inline mr-1" /> : <UserIcon size={11} className="inline mr-1" />}
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(user)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(user)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
