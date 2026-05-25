'use client';

import { useRouter } from 'next/navigation';
import ClientForm from '@/components/clients/ClientForm';
import { useCreateClient } from '@/hooks/useClients';

export default function NewClientPage() {
  const router = useRouter();
  const createClient = useCreateClient();

  return (
    <ClientForm
      onSubmit={async (data) => {
        await createClient.mutateAsync(data);
        router.push('/clients');
      }}
      submitLabel="Create Client"
    />
  );
}
