import { redirect } from 'next/navigation';

export default async function CreatorCampaignRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/creator/assignments/${id}`);
}
