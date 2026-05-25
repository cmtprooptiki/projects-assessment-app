'use client';

import { useRouter, useParams } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import ClientForm from '@/components/clients/ClientForm';
import { useClient, useUpdateClient } from '@/hooks/useClients';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const { data, isLoading } = useClient(id);
  const updateClient = useUpdateClient();

  if (isLoading) return <PageSpinner />;

  return (
    <ClientForm
      defaultValues={data?.data}
      onSubmit={async (formData) => {
        await updateClient.mutateAsync({ id, data: formData });
        router.push('/clients');
      }}
      submitLabel="Update Client"
    />
  );
}
