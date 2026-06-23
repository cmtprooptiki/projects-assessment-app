'use client';

import { useRouter, useParams } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import ParticipationForm from '@/components/participations/ParticipationForm';
import { useParticipation, useUpdateParticipation } from '@/hooks/useParticipations';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
import { useRoles } from '@/hooks/useRoles';

export default function EditParticipationPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const { data, isLoading } = useParticipation(id);
  const { data: employeesData, isLoading: loadingEmployees } = useEmployees({ limit: 999 });
  const { data: projectsData, isLoading: loadingProjects } = useProjects({ limit: 999 });
  const { data: rolesData, isLoading: loadingRoles } = useRoles();
  const updateParticipation = useUpdateParticipation();

  if (isLoading || loadingEmployees || loadingProjects || loadingRoles) {
    return <PageSpinner />;
  }

  return (
    <ParticipationForm
      employees={employeesData?.data ?? []}
      projects={projectsData?.data ?? []}
      roles={rolesData?.data ?? []}
      defaultValues={data?.data}
      onSubmit={async (formData) => {
        await updateParticipation.mutateAsync({ id, data: formData });
        router.push('/participations');
      }}
      submitLabel="Update Participation"
    />
  );
}
