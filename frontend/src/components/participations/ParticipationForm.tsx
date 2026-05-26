'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Employee, Project, Role, ProjectParticipation } from '@/types';

interface FormValues {
  employeeId: number;
  projectId: number;
  roleId: number;
  startDate: string;
  endDate: string;
  notes: string;
}

interface Props {
  employees: Employee[];
  projects: Project[];
  roles: Role[];
  defaultValues?: Partial<ProjectParticipation>;
  onSubmit: (data: FormValues) => Promise<void>;
  submitLabel?: string;
}

export default function ParticipationForm({
  employees,
  projects,
  roles,
  defaultValues,
  onSubmit,
  submitLabel = 'Save Participation',
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormValues>({
    employeeId: defaultValues?.employeeId ?? employees[0]?.id ?? 0,
    projectId: defaultValues?.projectId ?? projects[0]?.id ?? 0,
    roleId: defaultValues?.roleId ?? roles[0]?.id ?? 0,
    startDate: defaultValues?.startDate ? defaultValues.startDate.slice(0, 10) : '',
    endDate: defaultValues?.endDate ? defaultValues.endDate.slice(0, 10) : '',
    notes: defaultValues?.notes ?? '',
  });

  const set = (key: keyof FormValues, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !form.employeeId ||
      !form.projectId ||
      !form.roleId ||
      !form.startDate
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.endDate && form.endDate < form.startDate) {
      setError('End date must be after start date.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-5 max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Employee"
            options={employees.map((e) => ({
              value: e.id.toString(),
              label: `${e.firstName} ${e.lastName}`,
            }))}
            value={form.employeeId.toString()}
            onChange={(e) => set('employeeId', parseInt(e.target.value, 10))}
            required
          />
          <Select
            label="Project"
            options={projects.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            value={form.projectId.toString()}
            onChange={(e) => set('projectId', parseInt(e.target.value, 10))}
            required
          />
        </div>

        <Select
          label="Role"
          options={roles.map((r) => ({
            value: r.id.toString(),
            label: r.name,
          }))}
          value={form.roleId.toString()}
          onChange={(e) => set('roleId', parseInt(e.target.value, 10))}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate ?? ''}
            onChange={(e) => set('endDate', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Add any notes about this participation..."
            rows={2}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={loading}>
            {submitLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Card>
    </form>
  );
}
