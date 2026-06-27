import { TeamPage } from "@/components/certilys-ui/team";
import { getAdminTeamAction } from "@/lib/admin-team-actions";

export default async function Page() {
  const team = await getAdminTeamAction();
  return <TeamPage initialMembers={team.members} initialKpis={team.kpis} />;
}
