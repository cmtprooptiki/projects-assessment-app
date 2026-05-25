'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { ProjectParticipation } from '@/types';
import { formatDate, fullName, calcMonths, statusLabel, statusVariant } from '@/lib/utils';
import { useDeleteParticipation } from '@/hooks/useParticipations';

interface Props {
  participations: ProjectParticipation[];
  onDeleted?: () => void;
}

export default function ParticipationTable({
  participations,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState<ProjectParticipation | null>(null);
  const deleteParticipation = useDeleteParticipation();

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteParticipation.mutateAsync(deleting.id);
    setDeleting(null);
    onDeleted?.();
  };

  if (participations.length === 0) {
    return (
      <EmptyState
        title="No participations found"
        description="Try adjusting your filters or add a new participation."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Employee
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Project
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Period
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Months
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {participations.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {p.employee ? fullName(p.employee) : `Employee #${p.employeeId}`}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {p.project?.name ?? `Project #${p.projectId}`}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {p.role?.name ?? `Role #${p.roleId}`}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  <div>
                    <span>{formatDate(p.startDate)}</span>
                    {p.endDate ? (
                      <>
                        <br />
                        <span className="text-gray-400">–</span>
                        <br />
                        <span>{formatDate(p.endDate)}</span>
                      </>
                    ) : (
                      <div className="text-emerald-600 text-xs font-medium mt-0.5">
                        ongoing
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-900 font-semibold">
                  {calcMonths(p.startDate, p.endDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/participations/${p.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(p)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Participation"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this participation record? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteParticipation.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
