'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Mail, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Client } from '@/types';
import { useDeleteClient } from '@/hooks/useClients';

interface Props {
  clients: Client[];
  onDeleted?: () => void;
  isAdmin?: boolean;
}

export default function ClientTable({ clients, onDeleted, isAdmin = false }: Props) {
  const [deleting, setDeleting] = useState<Client | null>(null);
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteClient.mutateAsync(deleting.id);
    setDeleting(null);
    onDeleted?.();
  };

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients found"
        description="Try adjusting your filters or add a new client."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Industry</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-200">{client.name}</td>
                <td className="px-4 py-3">
                  {client.code
                    ? <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded">{client.code}</span>
                    : <span className="text-gray-300 dark:text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{client.industry ?? <span className="text-gray-300 dark:text-slate-600">—</span>}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                  <div className="space-y-0.5">
                    {client.contactEmail && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail size={11} className="text-gray-400 dark:text-slate-500" />
                        {client.contactEmail}
                      </div>
                    )}
                    {client.contactPhone && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone size={11} className="text-gray-400 dark:text-slate-500" />
                        {client.contactPhone}
                      </div>
                    )}
                    {!client.contactEmail && !client.contactPhone && (
                      <span className="text-gray-300 dark:text-slate-600">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs max-w-xs truncate">
                  {client.notes ?? <span className="text-gray-300 dark:text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/clients/${client.id}/edit`}>
                        <Button variant="ghost" size="sm"><Pencil size={14} /></Button>
                      </Link>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => setDeleting(client)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Client">
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-slate-200">{deleting?.name}</span>?
          This will fail if the client has projects assigned to it.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteClient.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}
