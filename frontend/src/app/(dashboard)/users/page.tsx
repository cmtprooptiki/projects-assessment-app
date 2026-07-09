'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import UserTable from '@/components/users/UserTable';
import UserFilters from '@/components/users/UserFilters';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import type { User, UserFilters as IUserFilters } from '@/types';

type FormMode = null | 'create' | { edit: User };

const emptyForm = { email: '', firstName: '', lastName: '', role: 'user', password: '' };

const defaultFilters: IUserFilters = { page: 1, limit: 15, sortBy: 'name', sortOrder: 'asc' };

export default function UsersPage() {
  const [filters, setFilters] = useState<IUserFilters>(defaultFilters);
  const { data, isLoading, error: loadError } = useUsers(filters);
  const users = data?.data ?? [];
  const meta = data?.meta;

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

  const handleSort = (field: string) => {
    setFilters((f) => ({
      ...f,
      page: 1,
      sortBy: field,
      sortOrder: f.sortBy === field && f.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

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
      <div className="flex items-center justify-between">
        <UserFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
        <Button onClick={handleOpenCreate}>
          <Plus size={16} />
          Add User
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : loadError ? (
          <div className="p-8 text-center text-sm text-red-500">Failed to load users. Please try again.</div>
        ) : (
          <>
            <UserTable
              users={users}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={handleSort}
              onEdit={handleOpenEdit}
              onDelete={setDeleting}
            />
            {meta && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            )}
          </>
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
