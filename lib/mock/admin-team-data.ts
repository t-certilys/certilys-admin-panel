export type TeamRole = "ADMIN" | "MODERATOR";
export type TeamMemberStatus = "ACTIVE" | "SUSPENDED" | "INVITED";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  avatarUrl?: string;
  invitedAt?: string | null;
  expiresAt?: string | null;
}

export interface TeamKpis {
  adminsCount: number;
  moderatorsCount: number;
  pendingInvitations: number;
  suspendedCount: number;
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: "tm_1",
    name: "Alexandre Dupuis",
    email: "alexandre.dupuis@certilys.fr",
    role: "ADMIN",
    status: "ACTIVE",
    twoFactorEnabled: true,
    lastLoginAt: "2026-05-29T09:30:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    id: "tm_2",
    name: "Sophie Laurent",
    email: "sophie.laurent@certilys.fr",
    role: "ADMIN",
    status: "ACTIVE",
    twoFactorEnabled: true,
    lastLoginAt: "2026-05-28T18:15:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    id: "tm_3",
    name: "Thomas Dubois",
    email: "thomas.dubois@certilys.fr",
    role: "MODERATOR",
    status: "ACTIVE",
    twoFactorEnabled: true,
    lastLoginAt: "2026-05-29T08:45:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    id: "tm_4",
    name: "Clara Martinez",
    email: "clara.martinez@certilys.fr",
    role: "MODERATOR",
    status: "ACTIVE",
    twoFactorEnabled: false,
    lastLoginAt: "2026-05-27T14:20:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    id: "tm_5",
    name: "Julien Moreau",
    email: "julien.moreau@certilys.fr",
    role: "MODERATOR",
    status: "SUSPENDED",
    twoFactorEnabled: true,
    lastLoginAt: "2026-05-20T10:05:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    id: "tm_6",
    name: "Émilie Roux",
    email: "emilie.roux@certilys.fr",
    role: "MODERATOR",
    status: "INVITED",
    twoFactorEnabled: false,
    lastLoginAt: null,
  },
  {
    id: "tm_7",
    name: "Marc Bernard",
    email: "marc.bernard@certilys.fr",
    role: "ADMIN",
    status: "INVITED",
    twoFactorEnabled: false,
    lastLoginAt: null,
  },
];

export const getTeamKpis = (members: TeamMember[]): TeamKpis => {
  return {
    adminsCount: members.filter((m) => m.role === "ADMIN" && m.status !== "SUSPENDED").length,
    moderatorsCount: members.filter((m) => m.role === "MODERATOR" && m.status !== "SUSPENDED").length,
    pendingInvitations: members.filter((m) => m.status === "INVITED").length,
    suspendedCount: members.filter((m) => m.status === "SUSPENDED").length,
  };
};
