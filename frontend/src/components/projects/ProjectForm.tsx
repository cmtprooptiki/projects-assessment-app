'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Client, Project, Contract } from '@/types';
import { useContracts } from '@/hooks/useContracts';
import { useLinkContracts } from '@/hooks/useProjects';
import { statusLabel, statusVariant } from '@/lib/utils';

interface FormValues {
  name: string;
  acronym: string;
  description: string;
  clientId: number | null;
}

interface Props {
  defaultValues?: Partial<Project>;
  clients: Client[];
  onSubmit: (data: FormValues) => Promise<number>;
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

  const [linkedContractIds, setLinkedContractIds] = useState<number[]>(
    defaultValues?.contracts?.map((c) => c.id) ?? []
  );

  const linkContracts = useLinkContracts();

  // Fetch all unlinked contracts upfront to know which clients have available ones
  const { data: unlinkedContractsData } = useContracts({ unlinked: 'true', limit: 999 });
  const unlinkedClientIds = new Set(
    (unlinkedContractsData?.data ?? []).map((c) => c.clientId).filter((id): id is number => id != null)
  );

  // Contracts for the currently selected client (includes already-linked ones for this project)
  const { data: contractsData, isLoading: contractsLoading } = useContracts(
    form.clientId ? { clientId: String(form.clientId), limit: 999 } : { limit: 0 },
    { enabled: form.clientId != null }
  );
  const availableContracts: Contract[] = form.clientId
    ? (contractsData?.data ?? []).filter(
        (c) => c.projectId == null || c.projectId === defaultValues?.id
      )
    : [];

  // When client changes, clear linked contracts
  const handleClientChange = (clientId: number | null) => {
    setForm((f) => ({ ...f, clientId }));
    setLinkedContractIds([]);
  };

  const toggleContract = (id: number) => {
    setLinkedContractIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
      const projectId = await onSubmit({
        ...form,
        description: form.description || null as any,
      });
      await linkContracts.mutateAsync({ id: projectId, contractIds: linkedContractIds });
      router.push('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Only show clients that have at least one unlinked contract, plus the current project's client in edit mode
  const clientOptions = clients
    .filter((c) => unlinkedClientIds.has(c.id) || c.id === defaultValues?.clientId)
    .map((c) => ({ value: String(c.id), label: c.name }));

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
          onChange={(e) => handleClientChange(e.target.value ? parseInt(e.target.value, 10) : null)}
        />

        {form.clientId != null && (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Linked Contracts
              {linkedContractIds.length > 0 && (
                <span className="ml-2 text-xs font-normal text-indigo-600 dark:text-indigo-400">
                  {linkedContractIds.length} selected
                </span>
              )}
            </label>
            {contractsLoading ? (
              <div className="h-24 rounded-xl bg-slate-50 dark:bg-slate-800 animate-pulse" />
            ) : availableContracts.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-3">No contracts found for this client.</p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                {availableContracts.map((c) => {
                  const checked = linkedContractIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        checked
                          ? 'bg-indigo-50 dark:bg-indigo-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleContract(c.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {c.code}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{c.name}</span>
                      <Badge variant={statusVariant(c.status)}>{statusLabel(c.status)}</Badge>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
