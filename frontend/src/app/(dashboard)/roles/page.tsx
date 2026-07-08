'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useRoles';
import { Role } from '@/types';

type FormMode = null | 'create' | { edit: Role };

export default function RolesPage() {
  const { data, isLoading } = useRoles();
  const roles = data?.data ?? [];
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const isEditing = formMode && typeof formMode === 'object';

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setError('');
    setFormMode('create');
  };

  const handleOpenEdit = (role: Role) => {
    setName(role.name);
    setDescription(role.description ?? '');
    setError('');
    setFormMode({ edit: role });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }

    setSaving(true);
    try {
      if (formMode === 'create') {
        await createRole.mutateAsync({ name, description });
      } else if (isEditing) {
        await updateRole.mutateAsync({
          id: formMode.edit.id,
          data: { name, description },
        });
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
      await deleteRole.mutateAsync(deleting.id);
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
          Add Role
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : roles.length === 0 ? (
          <EmptyState
            title="No roles found"
            description="Create your first role to get started."
          />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {roles.map((role) => (
              <div
                key={role.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                    {role.name}
                  </h3>
                  {role.description && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">
                      {role.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(role)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleting(role)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!formMode}
        onClose={() => setFormMode(null)}
        title={isEditing ? 'Edit Role' : 'Create Role'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Role Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Senior Developer"
            required
            autoFocus
          />

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the role..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormMode(null)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isEditing ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Role"
      >
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-slate-200">{deleting?.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteRole.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
