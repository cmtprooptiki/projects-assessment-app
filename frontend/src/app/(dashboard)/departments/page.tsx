'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Building } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/useDepartments';
import { Department } from '@/types';

type FormMode = null | 'create' | { edit: Department };

export default function DepartmentsPage() {
  const { data, isLoading } = useDepartments();
  const departments = data?.data ?? [];

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const isEditing = formMode && typeof formMode === 'object';

  const handleOpenCreate = () => {
    setName(''); setDescription(''); setError('');
    setFormMode('create');
  };

  const handleOpenEdit = (dept: Department) => {
    setName(dept.name); setDescription(dept.description ?? ''); setError('');
    setFormMode({ edit: dept });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Department name is required.'); return; }
    setSaving(true);
    try {
      if (formMode === 'create') {
        await createDepartment.mutateAsync({ name, description });
      } else if (isEditing) {
        await updateDepartment.mutateAsync({ id: formMode.edit.id, data: { name, description } });
      }
      setFormMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDepartment.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-sm shadow-indigo-200">
            <Building size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Departments</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">Manage your organisation's departments</p>
          </div>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={16} />
          Add Department
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : departments.length === 0 ? (
          <EmptyState title="No departments yet" description="Create your first department to get started." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Building size={15} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dept.name}</p>
                    {dept.description && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{dept.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dept)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(dept)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create / Edit modal */}
      <Modal open={!!formMode} onClose={() => setFormMode(null)} title={isEditing ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Department Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Engineering"
            required
            autoFocus
          />
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this department..."
              rows={2}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
            />
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setFormMode(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>{isEditing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Department">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{deleting?.name}</span>?
          Employees currently in this department will keep their department label.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteDepartment.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
