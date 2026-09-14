// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "LEARNER" | "INSTRUCTOR" | "ADMIN" | "MODERATOR";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type AuthProvider = "EMAIL" | "GOOGLE" | "GITHUB";

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserSecurity {
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  authProvider: AuthProvider;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  lastLoginLocation: string | null;
  activeSessions: UserSession[];
}

export interface UserOnboarding {
  completed: boolean;
  currentStep: number;
  totalSteps: number;
  completedAt: string | null;
}

export interface UserLinkedOrder {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  courseTitle: string;
  createdAt: string;
}

export interface UserLinkedEnrollment {
  id: string;
  courseTitle: string;
  instructorName: string;
  progress: number;
  enrolledAt: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
}

export interface UserLinkedCourse {
  id: string;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED";
  submittedAt: string | null;
  studentsCount: number;
}

export interface UserLinkedAdminAction {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  performedAt: string;
}

export interface UserLinkedActivity {
  recentOrders: UserLinkedOrder[];
  enrollments: UserLinkedEnrollment[];
  courses?: UserLinkedCourse[];
  adminActions?: UserLinkedAdminAction[];
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  avatarUrl?: string | null;
  avatarColor: string;
  role: UserRole;
  isTester?: boolean;
  status: AccountStatus;
  country: string;
  timezone: string;
  createdAt: string;
  security: UserSecurity;
  onboarding: UserOnboarding;
  linkedActivity: UserLinkedActivity;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  deletedAt?: string;
}

export interface UserKpi {
  id: string;
  label: string;
  value: number;
  colorClass: string;
  iconBg: string;
  filterStatus?: AccountStatus;
  filterKey?: string;
}

export interface UserFilters {
  role: string;
  status: string;
  emailVerified: string;
  twoFactor: string;
  onboarding: string;
  lastLoginFrom: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export const USER_ROLE_CONFIG: Record<
  UserRole,
  { label: string; colorClass: string; dotClass: string }
> = {
  LEARNER: {
    label: "Apprenant",
    colorClass: "text-chart-5 border-chart-5/40 bg-chart-5/10",
    dotClass: "bg-chart-5",
  },
  INSTRUCTOR: {
    label: "Formateur",
    colorClass: "text-primary border-primary/40 bg-primary/10",
    dotClass: "bg-primary",
  },
  ADMIN: {
    label: "Administrateur",
    colorClass: "text-chart-4 border-chart-4/40 bg-chart-4/10",
    dotClass: "bg-chart-4",
  },
  MODERATOR: {
    label: "Modérateur",
    colorClass:
      "text-amber-600 border-amber-500/40 bg-amber-500/10",
    dotClass: "bg-amber-500",
  },
};

export const ACCOUNT_STATUS_CONFIG: Record<
  AccountStatus,
  { label: string; colorClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: "Actif",
    colorClass:
      "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    dotClass: "bg-emerald-500",
  },
  SUSPENDED: {
    label: "Suspendu",
    colorClass: "text-chart-4 border-chart-4/40 bg-chart-4/10",
    dotClass: "bg-chart-4",
  },
  DELETED: {
    label: "Supprimé",
    colorClass:
      "text-muted-foreground border-border bg-muted/50",
    dotClass: "bg-muted-foreground",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI Mock
// ─────────────────────────────────────────────────────────────────────────────

export const userKpis: UserKpi[] = [
  {
    id: "total",
    label: "Total utilisateurs",
    value: 1284,
    colorClass: "text-primary border-primary/40 bg-primary/10",
    iconBg: "bg-primary/15",
  },
  {
    id: "active",
    label: "Comptes actifs",
    value: 1197,
    colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    iconBg: "bg-emerald-500/15",
    filterStatus: "ACTIVE",
  },
  {
    id: "suspended",
    label: "Comptes suspendus",
    value: 71,
    colorClass: "text-chart-4 border-chart-4/40 bg-chart-4/10",
    iconBg: "bg-chart-4/15",
    filterStatus: "SUSPENDED",
  },
  {
    id: "2fa",
    label: "2FA activée",
    value: 834,
    colorClass: "text-chart-5 border-chart-5/40 bg-chart-5/10",
    iconBg: "bg-chart-5/15",
    filterKey: "twoFactor",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Users
// ─────────────────────────────────────────────────────────────────────────────

export const mockAdminUsers: AdminUser[] = [
  // ── 1. Apprenant actif, 2FA
  {
    id: "usr-001",
    fullName: "Kofi Mensah",
    email: "kofi.mensah@mail.ci",
    initials: "KM",
    avatarColor: "bg-primary/15 text-primary",
    role: "LEARNER",
    status: "ACTIVE",
    country: "Côte d'Ivoire",
    timezone: "Africa/Abidjan",
    createdAt: "2025-09-14T09:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2025-09-14T09:05:00Z",
      authProvider: "EMAIL",
      twoFactorEnabled: true,
      lastLoginAt: "2026-05-28T08:20:00Z",
      lastLoginIp: "154.68.4.12",
      lastLoginLocation: "Abidjan, CI",
      activeSessions: [
        {
          id: "sess-001-a",
          device: "Chrome 124 / Windows 11",
          ip: "154.68.4.12",
          location: "Abidjan, CI",
          lastActive: "2026-05-28T08:20:00Z",
          isCurrent: true,
        },
      ],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2025-09-14T09:30:00Z",
    },
    linkedActivity: {
      recentOrders: [
        {
          id: "ord-k001",
          reference: "CRT-2026-00412",
          amount: 25000,
          currency: "XOF",
          status: "COMPLETED",
          courseTitle: "Gestion de projet avancée",
          createdAt: "2026-04-10T10:00:00Z",
        },
        {
          id: "ord-k002",
          reference: "CRT-2026-00518",
          amount: 15000,
          currency: "XOF",
          status: "COMPLETED",
          courseTitle: "Excel & Data Analyse",
          createdAt: "2026-05-05T14:30:00Z",
        },
      ],
      enrollments: [
        {
          id: "enr-k001",
          courseTitle: "Gestion de projet avancée",
          instructorName: "Amadou Koné",
          progress: 72,
          enrolledAt: "2026-04-10T10:05:00Z",
          status: "ACTIVE",
        },
        {
          id: "enr-k002",
          courseTitle: "Excel & Data Analyse",
          instructorName: "Moussa Ouédraogo",
          progress: 100,
          enrolledAt: "2026-05-05T14:35:00Z",
          status: "COMPLETED",
        },
      ],
    },
  },

  // ── 2. Formateur actif, sans 2FA
  {
    id: "usr-002",
    fullName: "Fatou Diallo",
    email: "fatou.diallo@certilys.sn",
    initials: "FD",
    avatarColor: "bg-chart-2/15 text-chart-2",
    role: "INSTRUCTOR",
    status: "ACTIVE",
    country: "Sénégal",
    timezone: "Africa/Dakar",
    createdAt: "2025-08-02T11:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2025-08-02T11:10:00Z",
      authProvider: "GOOGLE",
      twoFactorEnabled: false,
      lastLoginAt: "2026-05-27T15:45:00Z",
      lastLoginIp: "41.82.20.5",
      lastLoginLocation: "Dakar, SN",
      activeSessions: [
        {
          id: "sess-002-a",
          device: "Firefox 125 / macOS",
          ip: "41.82.20.5",
          location: "Dakar, SN",
          lastActive: "2026-05-27T15:45:00Z",
          isCurrent: true,
        },
        {
          id: "sess-002-b",
          device: "Safari / iPhone 15",
          ip: "41.82.20.9",
          location: "Dakar, SN",
          lastActive: "2026-05-26T09:00:00Z",
          isCurrent: false,
        },
      ],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2025-08-03T09:00:00Z",
    },
    linkedActivity: {
      recentOrders: [],
      enrollments: [],
      courses: [
        {
          id: "crs-f001",
          title: "Marketing Digital Fondamentaux",
          status: "APPROVED",
          submittedAt: "2025-12-10T08:00:00Z",
          studentsCount: 142,
        },
        {
          id: "crs-f002",
          title: "SEO & Référencement Naturel",
          status: "SUBMITTED",
          submittedAt: "2026-05-15T10:00:00Z",
          studentsCount: 0,
        },
      ],
    },
  },

  // ── 3. Compte suspendu récemment
  {
    id: "usr-003",
    fullName: "Ibrahima Sow",
    email: "ibrahima.sow@dev.ci",
    initials: "IS",
    avatarColor: "bg-chart-3/15 text-chart-3",
    role: "LEARNER",
    status: "SUSPENDED",
    country: "Côte d'Ivoire",
    timezone: "Africa/Abidjan",
    createdAt: "2025-11-20T14:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2025-11-20T14:10:00Z",
      authProvider: "EMAIL",
      twoFactorEnabled: false,
      lastLoginAt: "2026-05-20T11:30:00Z",
      lastLoginIp: "154.68.7.44",
      lastLoginLocation: "Abidjan, CI",
      activeSessions: [],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2025-11-20T15:00:00Z",
    },
    suspensionReason:
      "Tentatives répétées de fraude au paiement détectées par le système anti-fraude.",
    suspendedAt: "2026-05-23T09:00:00Z",
    suspendedBy: "admin@certilys.com",
    linkedActivity: {
      recentOrders: [
        {
          id: "ord-i001",
          reference: "CRT-2026-00390",
          amount: 30000,
          currency: "XOF",
          status: "FAILED",
          courseTitle: "Développement Web Full Stack",
          createdAt: "2026-05-20T11:00:00Z",
        },
      ],
      enrollments: [
        {
          id: "enr-i001",
          courseTitle: "Développement Web Full Stack",
          instructorName: "Ibrahim Coulibaly",
          progress: 15,
          enrolledAt: "2025-12-01T10:00:00Z",
          status: "EXPIRED",
        },
      ],
    },
  },

  // ── 4. Admin actif, 2FA
  {
    id: "usr-004",
    fullName: "Nathalie Dupont",
    email: "n.dupont@certilys.com",
    initials: "ND",
    avatarColor: "bg-chart-4/15 text-chart-4",
    role: "ADMIN",
    status: "ACTIVE",
    country: "France",
    timezone: "Europe/Paris",
    createdAt: "2024-01-15T08:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2024-01-15T08:05:00Z",
      authProvider: "EMAIL",
      twoFactorEnabled: true,
      lastLoginAt: "2026-05-29T07:00:00Z",
      lastLoginIp: "81.220.14.5",
      lastLoginLocation: "Paris, FR",
      activeSessions: [
        {
          id: "sess-004-a",
          device: "Chrome 124 / Windows 11",
          ip: "81.220.14.5",
          location: "Paris, FR",
          lastActive: "2026-05-29T07:00:00Z",
          isCurrent: true,
        },
      ],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2024-01-15T09:00:00Z",
    },
    linkedActivity: {
      recentOrders: [],
      enrollments: [],
      adminActions: [
        {
          id: "act-n001",
          action: "INSTRUCTOR_APPROVED",
          targetType: "Formateur",
          targetId: "inst-002",
          targetLabel: "Fatou Diallo",
          performedAt: "2026-05-14T14:00:00Z",
        },
        {
          id: "act-n002",
          action: "COURSE_REJECTED",
          targetType: "Formation",
          targetId: "crs-001",
          targetLabel: "Introduction au ML (brouillon)",
          performedAt: "2026-05-10T11:30:00Z",
        },
        {
          id: "act-n003",
          action: "USER_SUSPENDED",
          targetType: "Utilisateur",
          targetId: "usr-003",
          targetLabel: "Ibrahima Sow",
          performedAt: "2026-05-23T09:00:00Z",
        },
      ],
    },
  },

  // ── 5. Modérateur actif, email non vérifié
  {
    id: "usr-005",
    fullName: "Oumar Cissé",
    email: "oumar.cisse@certilys.sn",
    initials: "OC",
    avatarColor: "bg-chart-5/15 text-chart-5",
    role: "MODERATOR",
    status: "ACTIVE",
    country: "Sénégal",
    timezone: "Africa/Dakar",
    createdAt: "2025-06-01T10:00:00Z",
    security: {
      emailVerified: false,
      emailVerifiedAt: null,
      authProvider: "EMAIL",
      twoFactorEnabled: true,
      lastLoginAt: "2026-05-28T14:00:00Z",
      lastLoginIp: "41.82.21.88",
      lastLoginLocation: "Dakar, SN",
      activeSessions: [
        {
          id: "sess-005-a",
          device: "Chrome 123 / Ubuntu",
          ip: "41.82.21.88",
          location: "Dakar, SN",
          lastActive: "2026-05-28T14:00:00Z",
          isCurrent: true,
        },
      ],
    },
    onboarding: {
      completed: false,
      currentStep: 3,
      totalSteps: 5,
      completedAt: null,
    },
    linkedActivity: {
      recentOrders: [],
      enrollments: [],
      adminActions: [
        {
          id: "act-o001",
          action: "COURSE_CHANGES_REQUESTED",
          targetType: "Formation",
          targetId: "crs-f002",
          targetLabel: "SEO & Référencement Naturel",
          performedAt: "2026-05-27T10:00:00Z",
        },
      ],
    },
  },

  // ── 6. Apprenant onboarding incomplet
  {
    id: "usr-006",
    fullName: "Aminata Kouyaté",
    email: "aminata.k@student.ml",
    initials: "AK",
    avatarColor: "bg-primary/20 text-primary",
    role: "LEARNER",
    status: "ACTIVE",
    country: "Mali",
    timezone: "Africa/Bamako",
    createdAt: "2026-04-30T16:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2026-04-30T16:15:00Z",
      authProvider: "GOOGLE",
      twoFactorEnabled: false,
      lastLoginAt: "2026-05-01T08:00:00Z",
      lastLoginIp: "196.207.8.33",
      lastLoginLocation: "Bamako, ML",
      activeSessions: [],
    },
    onboarding: {
      completed: false,
      currentStep: 2,
      totalSteps: 5,
      completedAt: null,
    },
    linkedActivity: {
      recentOrders: [],
      enrollments: [],
    },
  },

  // ── 7. Formateur suspendu
  {
    id: "usr-007",
    fullName: "Koffi Atsu",
    email: "k.atsu@formations.tg",
    initials: "KA",
    avatarColor: "bg-chart-2/20 text-chart-2",
    role: "INSTRUCTOR",
    status: "SUSPENDED",
    country: "Togo",
    timezone: "Africa/Lome",
    createdAt: "2025-03-12T09:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2025-03-12T09:10:00Z",
      authProvider: "EMAIL",
      twoFactorEnabled: false,
      lastLoginAt: "2026-05-10T12:00:00Z",
      lastLoginIp: "197.159.2.44",
      lastLoginLocation: "Lomé, TG",
      activeSessions: [],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2025-03-13T10:00:00Z",
    },
    suspensionReason:
      "Contenu de formation non conforme aux CGU Certilys malgré deux avertissements préalables.",
    suspendedAt: "2026-05-12T14:00:00Z",
    suspendedBy: "oumar.cisse@certilys.sn",
    linkedActivity: {
      recentOrders: [],
      enrollments: [],
      courses: [
        {
          id: "crs-ka001",
          title: "Leadership en Afrique de l'Ouest",
          status: "ARCHIVED",
          submittedAt: "2025-06-01T08:00:00Z",
          studentsCount: 45,
        },
      ],
    },
  },

  // ── 8. Compte supprimé (lecture seule)
  {
    id: "usr-008",
    fullName: "Jean Duplessis",
    email: "j.duplessis@old.fr",
    initials: "JD",
    avatarColor: "bg-muted text-muted-foreground",
    role: "LEARNER",
    status: "DELETED",
    country: "France",
    timezone: "Europe/Paris",
    createdAt: "2024-11-05T10:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2024-11-05T10:10:00Z",
      authProvider: "EMAIL",
      twoFactorEnabled: false,
      lastLoginAt: "2026-02-14T09:00:00Z",
      lastLoginIp: "80.14.22.10",
      lastLoginLocation: "Lyon, FR",
      activeSessions: [],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2024-11-05T11:00:00Z",
    },
    deletedAt: "2026-04-01T00:00:00Z",
    linkedActivity: {
      recentOrders: [
        {
          id: "ord-j001",
          reference: "CRT-2026-00101",
          amount: 0,
          currency: "EUR",
          status: "REFUNDED",
          courseTitle: "Communication Professionnelle",
          createdAt: "2026-01-10T09:00:00Z",
        },
      ],
      enrollments: [],
    },
  },

  // ── 9. Apprenant actif, 2FA, onboarding complet
  {
    id: "usr-009",
    fullName: "Mariama Balde",
    email: "mariama.balde@student.gn",
    initials: "MB",
    avatarColor: "bg-chart-3/20 text-chart-3",
    role: "LEARNER",
    status: "ACTIVE",
    country: "Guinée",
    timezone: "Africa/Conakry",
    createdAt: "2026-01-10T08:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2026-01-10T08:10:00Z",
      authProvider: "EMAIL",
      twoFactorEnabled: true,
      lastLoginAt: "2026-05-29T06:30:00Z",
      lastLoginIp: "196.14.8.55",
      lastLoginLocation: "Conakry, GN",
      activeSessions: [
        {
          id: "sess-009-a",
          device: "Chrome 124 / Android",
          ip: "196.14.8.55",
          location: "Conakry, GN",
          lastActive: "2026-05-29T06:30:00Z",
          isCurrent: true,
        },
      ],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2026-01-11T09:00:00Z",
    },
    linkedActivity: {
      recentOrders: [
        {
          id: "ord-mb001",
          reference: "CRT-2026-00480",
          amount: 20000,
          currency: "GNF",
          status: "COMPLETED",
          courseTitle: "Comptabilité de Base",
          createdAt: "2026-03-15T10:00:00Z",
        },
      ],
      enrollments: [
        {
          id: "enr-mb001",
          courseTitle: "Comptabilité de Base",
          instructorName: "Kwame Asante",
          progress: 45,
          enrolledAt: "2026-03-15T10:10:00Z",
          status: "ACTIVE",
        },
      ],
    },
  },

  // ── 10. Formateur actif, 2FA, plusieurs formations
  {
    id: "usr-010",
    fullName: "Léa Combari",
    email: "lea.combari@rh.bf",
    initials: "LC",
    avatarColor: "bg-chart-4/20 text-chart-4",
    role: "INSTRUCTOR",
    status: "ACTIVE",
    country: "Burkina Faso",
    timezone: "Africa/Ouagadougou",
    createdAt: "2025-05-20T09:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2025-05-20T09:15:00Z",
      authProvider: "GITHUB",
      twoFactorEnabled: true,
      lastLoginAt: "2026-05-28T07:45:00Z",
      lastLoginIp: "154.122.4.18",
      lastLoginLocation: "Ouagadougou, BF",
      activeSessions: [
        {
          id: "sess-010-a",
          device: "VS Code Extension",
          ip: "154.122.4.18",
          location: "Ouagadougou, BF",
          lastActive: "2026-05-28T07:45:00Z",
          isCurrent: false,
        },
      ],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2025-05-21T10:00:00Z",
    },
    linkedActivity: {
      recentOrders: [],
      enrollments: [],
      courses: [
        {
          id: "crs-lc001",
          title: "Ressources Humaines & Droit Social",
          status: "APPROVED",
          submittedAt: "2025-08-10T09:00:00Z",
          studentsCount: 88,
        },
        {
          id: "crs-lc002",
          title: "Recrutement & Talent Acquisition",
          status: "APPROVED",
          submittedAt: "2026-01-20T10:00:00Z",
          studentsCount: 54,
        },
        {
          id: "crs-lc003",
          title: "Management RH Stratégique",
          status: "SUBMITTED",
          submittedAt: "2026-05-25T08:00:00Z",
          studentsCount: 0,
        },
      ],
    },
  },

  // ── 11. Apprenant suspendu récemment
  {
    id: "usr-011",
    fullName: "Seydou Bah",
    email: "seydou.bah@entreprise.gn",
    initials: "SB",
    avatarColor: "bg-chart-5/20 text-chart-5",
    role: "LEARNER",
    status: "SUSPENDED",
    country: "Guinée",
    timezone: "Africa/Conakry",
    createdAt: "2025-10-05T14:00:00Z",
    security: {
      emailVerified: true,
      emailVerifiedAt: "2025-10-05T14:10:00Z",
      authProvider: "EMAIL",
      twoFactorEnabled: false,
      lastLoginAt: "2026-05-24T10:00:00Z",
      lastLoginIp: "196.14.9.20",
      lastLoginLocation: "Conakry, GN",
      activeSessions: [],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2025-10-06T09:00:00Z",
    },
    suspensionReason:
      "Comportement abusif signalé à plusieurs reprises dans les espaces de discussion des formations.",
    suspendedAt: "2026-05-25T16:00:00Z",
    suspendedBy: "oumar.cisse@certilys.sn",
    linkedActivity: {
      recentOrders: [
        {
          id: "ord-sb001",
          reference: "CRT-2026-00320",
          amount: 18000,
          currency: "GNF",
          status: "COMPLETED",
          courseTitle: "Entrepreneuriat Pratique",
          createdAt: "2026-02-20T09:00:00Z",
        },
      ],
      enrollments: [
        {
          id: "enr-sb001",
          courseTitle: "Entrepreneuriat Pratique",
          instructorName: "Seydou Bah (formateur)",
          progress: 30,
          enrolledAt: "2026-02-20T09:05:00Z",
          status: "ACTIVE",
        },
      ],
    },
  },

  // ── 12. Formateur actif, email non vérifié, 2FA
  {
    id: "usr-012",
    fullName: "Aïssatou Ndiaye",
    email: "aissatou.n@droit.sn",
    initials: "AN",
    avatarColor: "bg-primary/10 text-primary",
    role: "INSTRUCTOR",
    status: "ACTIVE",
    country: "Sénégal",
    timezone: "Africa/Dakar",
    createdAt: "2024-09-01T10:00:00Z",
    security: {
      emailVerified: false,
      emailVerifiedAt: null,
      authProvider: "EMAIL",
      twoFactorEnabled: true,
      lastLoginAt: "2026-05-27T16:00:00Z",
      lastLoginIp: "41.82.22.10",
      lastLoginLocation: "Dakar, SN",
      activeSessions: [
        {
          id: "sess-012-a",
          device: "Safari / macOS",
          ip: "41.82.22.10",
          location: "Dakar, SN",
          lastActive: "2026-05-27T16:00:00Z",
          isCurrent: true,
        },
      ],
    },
    onboarding: {
      completed: true,
      currentStep: 5,
      totalSteps: 5,
      completedAt: "2024-09-02T09:00:00Z",
    },
    linkedActivity: {
      recentOrders: [],
      enrollments: [],
      courses: [
        {
          id: "crs-an001",
          title: "Droit des affaires OHADA",
          status: "APPROVED",
          submittedAt: "2024-11-10T08:00:00Z",
          studentsCount: 110,
        },
        {
          id: "crs-an002",
          title: "Contrats Commerciaux",
          status: "DRAFT",
          submittedAt: null,
          studentsCount: 0,
        },
      ],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRoleLabel(role: UserRole): string {
  return USER_ROLE_CONFIG[role].label;
}
