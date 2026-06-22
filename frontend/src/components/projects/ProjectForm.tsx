'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Client, Project } from '@/types';

interface FormValues {
  name: string;
  acronym: string;
  description: string;
  clientId: number | null;
}

interface Props {
  defaultValues?: Partial<Project>;
  clients: Client[];
  onSubmit: (data: FormValues) => Promise<void>;
  submitLabel?: string;
}

export default function ProjectForm({ defaultValues, clients, onSubmit, submitLabel = 'Save Project' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormValues>({
    name: defaultValues?.name ?? '',
    acronym: defaultValues?.acronym ?? '',
    description: defaultValues?.description ?? '',
    clientId: defaultValues?.clientId ?? null,
  });

  const set = (key: keyof FormValues, value: string | number | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.acronym.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        description: form.description || null as any,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const clientOptions = clients.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-5 max-w-3xl">
        {defaultValues?.projectCode && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Project Code</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{defaultValues.projectCode}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Project Name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Highway Construction" required />
          <Input label="Acronym" value={form.acronym} onChange={(e) => set('acronym', e.target.value)} placeholder="HWY" required />
        </div>

        <Select
          label="Client"
          options={clientOptions}
          placeholder="Select client..."
          value={form.clientId != null ? String(form.clientId) : ''}
          onChange={(e) => set('clientId', e.target.value ? parseInt(e.target.value, 10) : null)}
        />

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Project description..."
            rows={3}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={loading}>{submitLabel}</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </Card>
    </form>
  );
}
