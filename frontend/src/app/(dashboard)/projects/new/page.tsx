'use client';

import { useRouter } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import ProjectForm from '@/components/projects/ProjectForm';
import { useCreateProject } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const { data: clientsData, isLoading } = useClients({ limit: 200 });

  if (isLoading) return <PageSpinner />;

  return (
    <ProjectForm
      clients={clientsData?.data ?? []}
      onSubmit={async (data) => {
        await createProject.mutateAsync(data);
        router.push('/projects');
      }}
      submitLabel="Create Project"
    />
  );
}
