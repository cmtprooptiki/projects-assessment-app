'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Project } from '@/types';
import { formatDate, statusLabel, statusVariant } from '@/lib/utils';
import { useDeleteProject } from '@/hooks/useProjects';

interface Props {
  projects: Project[];
  onDeleted?: () => void;
}

export default function ProjectTable({ projects, onDeleted }: Props) {
  const [deleting, setDeleting] = useState<Project | null>(null);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteProject.mutateAsync(deleting.id);
    setDeleting(null);
    onDeleted?.();
  };

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Try adjusting your filters or add a new project."
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
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Code
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Client
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Start Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                End Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Budget
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map((proj) => (
              <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {proj.name}
                </td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                  {proj.code}
                </td>
                <td className="px-4 py-3 text-gray-600">{proj.client?.name ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(proj.startDate)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(proj.endDate)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(proj.status)}>
                    {statusLabel(proj.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600 text-sm">
                  {proj.budget != null
                    ? `€ ${Number(proj.budget).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/projects/${proj.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(proj)}
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
        title="Delete Project"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            {deleting?.name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteProject.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
