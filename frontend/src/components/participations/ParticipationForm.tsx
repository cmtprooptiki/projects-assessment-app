'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Employee, Project, Role, ProjectParticipation } from '@/types';
import { fullName, formatDate } from '@/lib/utils';

interface Props {
  employees: Employee[];
  projects: Project[];
  roles: Role[];
  defaultValues?: Partial<ProjectParticipation>;
  onSubmit: (data: any) => Promise<void>;
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
  const isEdit = !!defaultValues?.id;

  const [roleId, setRoleId] = useState<number>(defaultValues?.roleId ?? roles[0]?.id ?? 0);
  const [notes, setNotes] = useState(defaultValues?.notes ?? '');
  const [employeeId, setEmployeeId] = useState<number>(defaultValues?.employeeId ?? employees[0]?.id ?? 0);
  const [projectId, setProjectId] = useState<number>(defaultValues?.projectId ?? projects[0]?.id ?? 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roleId) {
      setError('Please select a role.');
      return;
    }
    if (!isEdit && (!employeeId || !projectId)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await onSubmit({ roleId, notes: notes || null });
      } else {
        await onSubmit({ employeeId, projectId, roleId, notes: notes || null });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-5 max-w-3xl">
        {isEdit && defaultValues && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Employee</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {defaultValues.employee ? fullName(defaultValues.employee) : `#${defaultValues.employeeId}`}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Project</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {defaultValues.project
                  ? `${defaultValues.project.projectCode} – ${defaultValues.project.name}`
                  : `#${defaultValues.projectId}`}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Period</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {defaultValues.startDate ? formatDate(defaultValues.startDate) : '—'}
                <span className="text-slate-400 mx-1">–</span>
                {defaultValues.endDate
                  ? formatDate(defaultValues.endDate)
                  : <span className="text-emerald-600">ongoing</span>}
              </p>
            </div>
          </div>
        )}

        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Employee"
              options={employees.map((e) => ({
                value: e.id.toString(),
                label: fullName(e),
              }))}
              value={employeeId.toString()}
              onChange={(e) => setEmployeeId(parseInt(e.target.value, 10))}
              required
            />
            <Select
              label="Project"
              options={projects.map((p) => ({
                value: p.id.toString(),
                label: `${p.projectCode} – ${p.name}`,
              }))}
              value={projectId.toString()}
              onChange={(e) => setProjectId(parseInt(e.target.value, 10))}
              required
            />
          </div>
        )}

        <Select
          label="Role"
          options={roles.map((r) => ({
            value: r.id.toString(),
            label: r.name,
          }))}
          value={roleId.toString()}
          onChange={(e) => setRoleId(parseInt(e.target.value, 10))}
          required
        />

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this participation..."
            rows={2}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
          />
        </div>

        {!isEdit && (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Participation periods will be computed automatically from the employee's availability periods and the project's contract dates.
          </p>
        )}

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
