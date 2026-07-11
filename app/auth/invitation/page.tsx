import InvitationConfirmation from "@/components/certilys-ui/authentication/invitation-confirmation";

type InvitationPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function InvitationPage({
  searchParams,
}: InvitationPageProps) {
  const params = await searchParams;
  const rawToken = params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  return <InvitationConfirmation token={token ?? ""} />;
}
