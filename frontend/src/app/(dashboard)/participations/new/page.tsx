'use client';

import { useRouter } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import ParticipationForm from '@/components/participations/ParticipationForm';
import { useEmployees } from '@/hooks/useEmployees';
import { useContracts } from '@/hooks/useContracts';
import { useRoles } from '@/hooks/useRoles';
import { useCreateParticipation } from '@/hooks/useParticipations';

export default function NewParticipationPage() {
  const router = useRouter();
  const { data: employeesData, isLoading: loadingEmployees } = useEmployees({
    limit: 999,
  });
  const { data: projectsData, isLoading: loadingProjects } = useContracts({
    limit: 999,
  });
  const { data: rolesData, isLoading: loadingRoles } = useRoles();
  const createParticipation = useCreateParticipation();

  if (loadingEmployees || loadingProjects || loadingRoles) {
    return <PageSpinner />;
  }

  return (
    <ParticipationForm
      employees={employeesData?.data ?? []}
      projects={projectsData?.data ?? []}
      roles={rolesData?.data ?? []}
      onSubmit={async (data) => {
        await createParticipation.mutateAsync(data);
        router.push('/participations');
      }}
      submitLabel="Create Participation"
    />
  );
}
