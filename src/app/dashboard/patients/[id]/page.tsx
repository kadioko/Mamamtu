import { redirect } from 'next/navigation';

export default async function DashboardPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/patients/${id}`);
}
