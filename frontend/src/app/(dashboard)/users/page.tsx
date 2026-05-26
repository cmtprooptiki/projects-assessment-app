'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Shield, User as UserIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import type { User } from '@/types';

type FormMode = null | 'create' | { edit: User };

const emptyForm = { email: '', firstName: '', lastName: '', role: 'user', password: '' };

export default function UsersPage() {
  const { data, isLoading } = useUsers({ limit: 100 });
  const users = data?.data ?? [];

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const isEditing = formMode && typeof formMode === 'object';

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setError('');
    setFormMode('create');
  };

  const handleOpenEdit = (user: User) => {
    setForm({ email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, password: '' });
    setError('');
    setFormMode({ edit: user });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (formMode === 'create') {
        await createUser.mutateAsync({ ...form });
      } else if (isEditing) {
        const payload: Record<string, string> = { email: form.email, firstName: form.firstName, lastName: form.lastName, role: form.role };
        if (form.password) payload.password = form.password;
        await updateUser.mutateAsync({ id: formMode.edit.id, data: payload });
      }
      setFormMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteUser.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={handleOpenCreate}>
          <Plus size={16} />
          Add User
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Create your first user to get started." />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {users.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Badge variant={user.role === 'admin' ? 'blue' : 'gray'}>
                    {user.role === 'admin' ? <Shield size={11} className="inline mr-1" /> : <UserIcon size={11} className="inline mr-1" />}
                    {user.role}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(user)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!formMode} onClose={() => setFormMode(null)} title={isEditing ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required autoFocus />
            <Input label="Last Name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Input
            label={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required={!isEditing}
          />
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setFormMode(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>{isEditing ? 'Update User' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete User">
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{deleting?.firstName} {deleting?.lastName}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteUser.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
