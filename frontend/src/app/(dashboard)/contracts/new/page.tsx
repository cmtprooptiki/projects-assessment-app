'use client';

import { useRouter } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import ContractForm from '@/components/contracts/ContractForm';
import { useCreateContract } from '@/hooks/useContracts';
import { useClients } from '@/hooks/useClients';

export default function NewContractPage() {
  const router = useRouter();
  const createContract = useCreateContract();
  const { data: clientsData, isLoading } = useClients({ limit: 200 });

  if (isLoading) return <PageSpinner />;

  return (
    <ContractForm
      clients={clientsData?.data ?? []}
      onSubmit={async (data) => {
        await createContract.mutateAsync(data as any);
        router.push('/contracts');
      }}
      submitLabel="Create Contract"
    />
  );
}
