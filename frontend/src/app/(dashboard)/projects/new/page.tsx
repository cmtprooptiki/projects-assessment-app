'use client';

import { PageSpinner } from '@/components/ui/Spinner';
import ProjectForm from '@/components/projects/ProjectForm';
import { useCreateProject } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';

export default function NewProjectPage() {
  const createProject = useCreateProject();
  const { data: clientsData, isLoading } = useClients({ limit: 200 });

  if (isLoading) return <PageSpinner />;

  return (
    <ProjectForm
      clients={clientsData?.data ?? []}
      onSubmit={async (data) => {
        const result = await createProject.mutateAsync(data as any);
        return result.data.id;
      }}
      submitLabel="Create Project"
    />
  );
}
