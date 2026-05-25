'use client';

import { useRouter, useParams } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import ProjectForm from '@/components/projects/ProjectForm';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const { data, isLoading: projectLoading } = useProject(id);
  const { data: clientsData, isLoading: clientsLoading } = useClients({ limit: 200 });
  const updateProject = useUpdateProject();

  if (projectLoading || clientsLoading) return <PageSpinner />;

  return (
    <ProjectForm
      defaultValues={data?.data}
      clients={clientsData?.data ?? []}
      onSubmit={async (formData) => {
        await updateProject.mutateAsync({ id, data: formData });
        router.push('/projects');
      }}
      submitLabel="Update Project"
    />
  );
}
