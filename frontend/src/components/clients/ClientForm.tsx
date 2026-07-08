'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Client } from '@/types';

interface FormValues {
  name: string;
  code: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}

interface Props {
  defaultValues?: Partial<Client>;
  onSubmit: (data: FormValues) => Promise<void>;
  submitLabel?: string;
}

export default function ClientForm({ defaultValues, onSubmit, submitLabel = 'Save Client' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormValues>({
    name: defaultValues?.name ?? '',
    code: defaultValues?.code ?? '',
    industry: defaultValues?.industry ?? '',
    contactEmail: defaultValues?.contactEmail ?? '',
    contactPhone: defaultValues?.contactPhone ?? '',
    notes: defaultValues?.notes ?? '',
  });

  const set = (key: keyof FormValues, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Client name is required.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        code: form.code || null as any,
        industry: form.industry || null as any,
        contactEmail: form.contactEmail || null as any,
        contactPhone: form.contactPhone || null as any,
        notes: form.notes || null as any,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-5 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Client Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Acme Corporation"
            required
          />
          <Input
            label="Code"
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            placeholder="ACME-001"
          />
        </div>

        <Input
          label="Industry"
          value={form.industry}
          onChange={(e) => set('industry', e.target.value)}
          placeholder="Technology, Finance, Healthcare..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => set('contactEmail', e.target.value)}
            placeholder="contact@client.com"
          />
          <Input
            label="Contact Phone"
            value={form.contactPhone}
            onChange={(e) => set('contactPhone', e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any additional notes about this client..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={loading}>{submitLabel}</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </Card>
    </form>
  );
}
