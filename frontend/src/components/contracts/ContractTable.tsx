'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Contract } from '@/types';
import { formatDate, statusLabel, statusVariant } from '@/lib/utils';
import { useDeleteContract } from '@/hooks/useContracts';

interface Props { contracts: Contract[]; onDeleted?: () => void; isAdmin?: boolean; }

export default function ContractTable({ contracts, onDeleted, isAdmin = false }: Props) {
  const [deleting, setDeleting] = useState<Contract | null>(null);
  const deleteContract = useDeleteContract();

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteContract.mutateAsync(deleting.id);
    setDeleting(null);
    onDeleted?.();
  };

  if (contracts.length === 0)
    return <EmptyState title="No contracts found" description="Try adjusting your filters or add a new contract." />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmation</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-3 text-gray-600">{c.client?.name ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(c.startDate)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(c.endDate)}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(c.status)}>{statusLabel(c.status)}</Badge></td>
                <td className="px-4 py-3 text-gray-600 text-sm">
                  {c.budget != null ? `€ ${Number(c.budget).toLocaleString('el-GR', { minimumFractionDigits: 2 })}` : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {c.confirmationOfGoodPerformance
                    ? <span title={c.confirmationOfGoodPerformance} className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={13} className="text-emerald-500" />Yes</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/contracts/${c.id}/edit`}><Button variant="ghost" size="sm"><Pencil size={14} /></Button></Link>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(c)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Contract">
        <p className="text-sm text-gray-600 mb-6">Delete <span className="font-semibold text-gray-900">{deleting?.name}</span>? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteContract.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}
