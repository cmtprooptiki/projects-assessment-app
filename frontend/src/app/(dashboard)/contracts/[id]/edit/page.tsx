'use client';

import { useRouter, useParams } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import ContractForm from '@/components/contracts/ContractForm';
import { useContract, useUpdateContract } from '@/hooks/useContracts';
import { useClients } from '@/hooks/useClients';

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const { data, isLoading: contractLoading } = useContract(id);
  const { data: clientsData, isLoading: clientsLoading } = useClients({ limit: 200 });
  const updateContract = useUpdateContract();

  if (contractLoading || clientsLoading) return <PageSpinner />;

  return (
    <ContractForm
      defaultValues={data?.data}
      clients={clientsData?.data ?? []}
      onSubmit={async (formData) => {
        await updateContract.mutateAsync({ id, data: formData as any });
        router.push('/contracts');
      }}
      submitLabel="Update Contract"
    />
  );
}
