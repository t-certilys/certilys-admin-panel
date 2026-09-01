// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type InstructorApplicationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED";

export interface IdentityDocument {
  type?: "ID_CARD" | "PASSPORT" | "DRIVING_LICENSE";
  fileUrl: string;
  fileName: string;
  fileMimeType: "application/pdf" | "image/jpeg" | "image/png";
  fileSize: number;
  uploadedAt?: string;
}

export interface VerificationPayload {
  schemaVersion?: 2;
  legalStatus: "INDIVIDUAL" | "ORGANIZATION" | "COMPANY";
  legalLastName?: string;
  legalFirstNames?: string;
  companyLegalName?: string;
  nationality: string;
  addressLine: string;
  postalCode: string;
  city: string;
  residenceCountry: string;
  birthDate?: string;
  identityDocument?: IdentityDocument;
  companyDocuments?: {
    establishmentDeclaration?: IdentityDocument;
    companyIfu?: IdentityDocument;
    tradeRegister?: IdentityDocument;
  };
  honorDeclarationAccepted: boolean;
  honorDeclarationAcceptedAt: string;
}

export interface VerificationCompleteness {
  hasLegalIdentity: boolean;
  hasAddress: boolean;
  hasIdentityDocument: boolean;
  hasCompanyDocuments?: boolean;
  hasHonorDeclaration: boolean;
}

export interface InstructorApplication {
  id: string;
  userId?: string;
  /** Nom complet du formateur */
  fullName: string;
  email: string;
  /** Initiales pour l'avatar (max 2 caractères) */
  initials: string;
  /** Couleur de fond de l'avatar (CSS variable) */
  avatarColor: string;
  /** Spécialité principale déclarée */
  specialty: string;
  country: string;
  status: InstructorApplicationStatus;
  /** ISO date string : date de soumission du dossier */
  submittedAt: string | null;
  /** Nombre de formations soumises dans le dossier */
  coursesSubmitted: number;
  /** Dossier complet (tous les documents fournis) */
  isComplete: boolean;
  /** Motif de la dernière décision (rejet ou corrections) */
  lastDecisionReason?: string;
  /** Date de la dernière décision */
  lastDecisionAt?: string;
  /** Payload de vérification (données sensibles de second niveau) */
  verificationPayload?: VerificationPayload;
  /** Checklist administrative de complétude */
  verificationCompleteness?: VerificationCompleteness;
}

export interface InstructorKpi {
  id: string;
  label: string;
  value: number;
  status: InstructorApplicationStatus;
  colorClass: string;
  iconBg: string;
}

export interface InstructorFilters {
  status: string;
  specialty: string;
  country: string;
  submittedFrom: string;
  submittedTo: string;
  isComplete: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Config
// ─────────────────────────────────────────────────────────────────────────────

export const instructorStatusConfig: Record<
  InstructorApplicationStatus,
  {
    label: string;
    colorClass: string;
    dotClass: string;
  }
> = {
  NOT_SUBMITTED: {
    label: "Non soumis",
    colorClass:
      "text-muted-foreground border-border bg-muted/50",
    dotClass: "bg-muted-foreground",
  },
  PENDING: {
    label: "En attente",
    colorClass:
      "text-amber-600 border-amber-500/40 bg-amber-500/10",
    dotClass: "bg-amber-500",
  },
  APPROVED: {
    label: "Approuvé",
    colorClass:
      "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    dotClass: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejeté",
    colorClass:
      "text-red-600 border-red-500/40 bg-red-500/10",
    dotClass: "bg-red-500",
  },
  CHANGES_REQUESTED: {
    label: "Corrections demandées",
    colorClass:
      "text-orange-600 border-orange-500/40 bg-orange-500/10",
    dotClass: "bg-orange-500",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI Mock
// ─────────────────────────────────────────────────────────────────────────────

export const instructorKpis: InstructorKpi[] = [
  {
    id: "pending",
    label: "En attente",
    value: 7,
    status: "PENDING",
    colorClass: "text-amber-600 border-amber-500/40 bg-amber-500/10",
    iconBg: "bg-amber-500/15",
  },
  {
    id: "approved",
    label: "Approuvés",
    value: 34,
    status: "APPROVED",
    colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    iconBg: "bg-emerald-500/15",
  },
  {
    id: "changes_requested",
    label: "Corrections demandées",
    value: 5,
    status: "CHANGES_REQUESTED",
    colorClass: "text-orange-600 border-orange-500/40 bg-orange-500/10",
    iconBg: "bg-orange-500/15",
  },
  {
    id: "rejected",
    label: "Rejetés",
    value: 9,
    status: "REJECTED",
    colorClass: "text-red-600 border-red-500/40 bg-red-500/10",
    iconBg: "bg-red-500/15",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Spécialités disponibles
// ─────────────────────────────────────────────────────────────────────────────

export const INSTRUCTOR_SPECIALTIES = [
  "Gestion de projet",
  "Marketing Digital",
  "Comptabilité & Finance",
  "Développement Web",
  "Leadership & Management",
  "Excel & Data",
  "Ressources Humaines",
  "Droit des affaires",
  "Communication",
  "Entrepreneuriat",
] as const;

export const INSTRUCTOR_COUNTRIES = [
  "Côte d'Ivoire",
  "Sénégal",
  "Cameroun",
  "Mali",
  "Burkina Faso",
  "Guinea",
  "Togo",
  "Bénin",
  "Niger",
  "France",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Mock Applications
// ─────────────────────────────────────────────────────────────────────────────

export const mockInstructorApplications: InstructorApplication[] = [
  {
    id: "inst-001",
    fullName: "Amadou Koné",
    email: "amadou.kone@mail.ci",
    initials: "AK",
    avatarColor: "bg-primary/15 text-primary",
    specialty: "Gestion de projet",
    country: "Côte d'Ivoire",
    status: "PENDING",
    submittedAt: "2026-05-26T10:30:00Z",
    coursesSubmitted: 3,
    isComplete: true,
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Koné",
      legalFirstNames: "Amadou Kouassi",
      nationality: "Ivoirienne",
      addressLine: "Cocody Deux Plateaux, Rue des Jardins",
      postalCode: "00225",
      city: "Abidjan",
      residenceCountry: "Côte d'Ivoire",
      birthDate: "1988-04-12",
      identityDocument: {
        type: "ID_CARD",
        fileUrl: "/mock-documents/cni_amadou_kone.pdf",
        fileName: "cni_amadou_kone.pdf",
        fileMimeType: "application/pdf",
        fileSize: 1542000,
        uploadedAt: "2026-05-26T10:15:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-26T10:28:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-002",
    fullName: "Fatou Diallo",
    email: "fatou.diallo@certilys.sn",
    initials: "FD",
    avatarColor: "bg-chart-2/15 text-chart-2",
    specialty: "Marketing Digital",
    country: "Sénégal",
    status: "APPROVED",
    submittedAt: "2026-05-10T09:15:00Z",
    coursesSubmitted: 5,
    isComplete: true,
    lastDecisionAt: "2026-05-14T14:00:00Z",
    verificationPayload: {
      legalStatus: "COMPANY",
      legalLastName: "Diallo",
      legalFirstNames: "Fatou Bineta",
      nationality: "Sénégalaise",
      addressLine: "Mermoz Extension, Villa 45B",
      postalCode: "16000",
      city: "Dakar",
      residenceCountry: "Sénégal",
      birthDate: "1983-09-24",
      identityDocument: {
        type: "PASSPORT",
        fileUrl: "/mock-documents/passeport_fatou_diallo.png",
        fileName: "passeport_fatou_diallo.png",
        fileMimeType: "image/png",
        fileSize: 2450000,
        uploadedAt: "2026-05-10T08:50:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-10T09:12:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-003",
    fullName: "Koffi Mensah",
    email: "k.mensah@formateur.cm",
    initials: "KM",
    avatarColor: "bg-chart-3/15 text-chart-3",
    specialty: "Comptabilité & Finance",
    country: "Cameroun",
    status: "CHANGES_REQUESTED",
    submittedAt: "2026-05-18T14:00:00Z",
    coursesSubmitted: 2,
    isComplete: false,
    lastDecisionReason: "Pièce d'identité officielle absente du dossier.",
    lastDecisionAt: "2026-05-20T11:00:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Mensah",
      legalFirstNames: "Koffi",
      nationality: "Camerounaise",
      addressLine: "Bonapriso, Rue de l'Hôpital",
      postalCode: "00237",
      city: "Douala",
      residenceCountry: "Cameroun",
      birthDate: "1990-11-05",
      identityDocument: undefined, // DOCUMENT MANQUANT
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-18T13:55:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: false, // BLOQUANT
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-004",
    fullName: "Awa Traoré",
    email: "awa.traore@formations.ml",
    initials: "AT",
    avatarColor: "bg-chart-4/15 text-chart-4",
    specialty: "Leadership & Management",
    country: "Mali",
    status: "REJECTED",
    submittedAt: "2026-05-05T08:45:00Z",
    coursesSubmitted: 1,
    isComplete: false,
    lastDecisionReason: "Profil ne correspond pas aux exigences minimales de Certilys (5 ans d'expérience requis).",
    lastDecisionAt: "2026-05-08T16:30:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Traoré",
      legalFirstNames: "Awa",
      nationality: "Malienne",
      addressLine: "", // ADRESSE MANQUANTE
      postalCode: "",
      city: "",
      residenceCountry: "Mali",
      birthDate: "1992-01-30",
      identityDocument: {
        type: "DRIVING_LICENSE",
        fileUrl: "/mock-documents/permis_awa_traore.jpeg",
        fileName: "permis_awa_traore.jpeg",
        fileMimeType: "image/jpeg",
        fileSize: 850000,
        uploadedAt: "2026-05-05T08:30:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-05T08:44:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: false, // BLOQUANT
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-005",
    fullName: "Ibrahim Coulibaly",
    email: "ibrahim.c@devweb.bf",
    initials: "IC",
    avatarColor: "bg-primary/20 text-primary",
    specialty: "Développement Web",
    country: "Burkina Faso",
    status: "PENDING",
    submittedAt: "2026-05-25T16:00:00Z",
    coursesSubmitted: 4,
    isComplete: true,
    verificationPayload: {
      legalStatus: "COMPANY",
      legalLastName: "Coulibaly",
      legalFirstNames: "Ibrahim",
      nationality: "Burkinabée",
      addressLine: "Secteur 15, Quartier Ouaga 2000",
      postalCode: "01 BP 455",
      city: "Ouagadougou",
      residenceCountry: "Burkina Faso",
      birthDate: "1986-07-19",
      identityDocument: {
        type: "DRIVING_LICENSE",
        fileUrl: "/mock-documents/permis_ibrahim_c.pdf",
        fileName: "permis_ibrahim_c.pdf",
        fileMimeType: "application/pdf",
        fileSize: 1890000,
        uploadedAt: "2026-05-25T15:40:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-25T15:58:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-006",
    fullName: "Mariama Barry",
    email: "mariama.barry@rh-afrique.gn",
    initials: "MB",
    avatarColor: "bg-chart-5/15 text-chart-5",
    specialty: "Ressources Humaines",
    country: "Guinea",
    status: "PENDING",
    submittedAt: "2026-05-27T07:30:00Z",
    coursesSubmitted: 2,
    isComplete: false,
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Barry",
      legalFirstNames: "Mariama",
      nationality: "Guinéenne",
      addressLine: "Quartier Kipé, Axe Principal",
      postalCode: "00224",
      city: "Conakry",
      residenceCountry: "Guinea",
      birthDate: "1991-03-15",
      identityDocument: {
        type: "ID_CARD",
        fileUrl: "/mock-documents/cni_mariama_barry.png",
        fileName: "cni_mariama_barry.png",
        fileMimeType: "image/png",
        fileSize: 980000,
        uploadedAt: "2026-05-27T07:15:00Z",
      },
      honorDeclarationAccepted: false, // DÉCLARATION NON ACCEPTÉE
      honorDeclarationAcceptedAt: "",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: false, // BLOQUANT
    },
  },
  {
    id: "inst-007",
    fullName: "Kwame Asante",
    email: "kwame.asante@finance.tg",
    initials: "KA",
    avatarColor: "bg-chart-2/20 text-chart-2",
    specialty: "Comptabilité & Finance",
    country: "Togo",
    status: "APPROVED",
    submittedAt: "2026-04-30T10:00:00Z",
    coursesSubmitted: 6,
    isComplete: true,
    lastDecisionAt: "2026-05-03T09:00:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Asante",
      legalFirstNames: "Kwame",
      nationality: "Togolaise",
      addressLine: "Boulevard du 13 Janvier, Nyékonakpoé",
      postalCode: "BP 1250",
      city: "Lomé",
      residenceCountry: "Togo",
      birthDate: "1980-05-30",
      identityDocument: {
        type: "PASSPORT",
        fileUrl: "/mock-documents/passport_kwame_asante.pdf",
        fileName: "passport_kwame_asante.pdf",
        fileMimeType: "application/pdf",
        fileSize: 2210000,
        uploadedAt: "2026-04-30T09:40:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-04-30T09:59:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-008",
    fullName: "Céline Adjovi",
    email: "c.adjovi@communication.bj",
    initials: "CA",
    avatarColor: "bg-primary/10 text-primary",
    specialty: "Communication",
    country: "Bénin",
    status: "APPROVED",
    submittedAt: "2026-04-22T11:20:00Z",
    coursesSubmitted: 3,
    isComplete: true,
    lastDecisionAt: "2026-04-25T15:00:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Adjovi",
      legalFirstNames: "Céline",
      nationality: "Béninoise",
      addressLine: "Quartier Haie Vive, Rue 2500",
      postalCode: "03 BP 110",
      city: "Cotonou",
      residenceCountry: "Bénin",
      birthDate: "1987-12-11",
      identityDocument: {
        type: "ID_CARD",
        fileUrl: "/mock-documents/cni_celine_adjovi.pdf",
        fileName: "cni_celine_adjovi.pdf",
        fileMimeType: "application/pdf",
        fileSize: 1320000,
        uploadedAt: "2026-04-22T11:00:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-04-22T11:18:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-009",
    fullName: "Moussa Ouédraogo",
    email: "m.ouedraogo@data.bf",
    initials: "MO",
    avatarColor: "bg-chart-3/20 text-chart-3",
    specialty: "Excel & Data",
    country: "Burkina Faso",
    status: "PENDING",
    submittedAt: "2026-05-28T06:00:00Z",
    coursesSubmitted: 1,
    isComplete: false,
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Ouédraogo",
      legalFirstNames: "Moussa",
      nationality: "Burkinabée",
      addressLine: "Secteur 28, Koulouba",
      postalCode: "01 BP 98",
      city: "Ouagadougou",
      residenceCountry: "Burkina Faso",
      birthDate: "1993-02-14",
      identityDocument: undefined, // DOCUMENT ABSENT
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-28T05:58:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: false, // BLOQUANT
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-010",
    fullName: "Nathalie Dupont",
    email: "n.dupont@management.fr",
    initials: "ND",
    avatarColor: "bg-chart-4/20 text-chart-4",
    specialty: "Leadership & Management",
    country: "France",
    status: "CHANGES_REQUESTED",
    submittedAt: "2026-05-15T13:00:00Z",
    coursesSubmitted: 7,
    isComplete: true,
    lastDecisionReason: "Les contenus de formation ne respectent pas le format pédagogique Certilys.",
    lastDecisionAt: "2026-05-19T10:00:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Dupont",
      legalFirstNames: "Nathalie Jeanne",
      nationality: "Française",
      addressLine: "12 Rue de Rivoli",
      postalCode: "75004",
      city: "Paris",
      residenceCountry: "France",
      birthDate: "1978-08-05",
      identityDocument: {
        type: "PASSPORT",
        fileUrl: "/mock-documents/passport_nathalie_dupont.pdf",
        fileName: "passport_nathalie_dupont.pdf",
        fileMimeType: "application/pdf",
        fileSize: 3100000,
        uploadedAt: "2026-05-15T12:30:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-15T12:55:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-011",
    fullName: "Seydou Bah",
    email: "seydou.bah@entrepreneur.gn",
    initials: "SB",
    avatarColor: "bg-chart-5/20 text-chart-5",
    specialty: "Entrepreneuriat",
    country: "Guinea",
    status: "REJECTED",
    submittedAt: "2026-05-02T09:00:00Z",
    coursesSubmitted: 0,
    isComplete: false,
    lastDecisionReason: "Aucune formation valide soumise dans le dossier.",
    lastDecisionAt: "2026-05-06T14:00:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Bah",
      legalFirstNames: "Seydou",
      nationality: "Guinéenne",
      addressLine: "Dixinn Terrace, Face Mer",
      postalCode: "00224",
      city: "Conakry",
      residenceCountry: "Guinea",
      birthDate: "1989-10-10",
      identityDocument: {
        type: "ID_CARD",
        fileUrl: "/mock-documents/cni_seydou_bah.pdf",
        fileName: "cni_seydou_bah.pdf",
        fileMimeType: "application/pdf",
        fileSize: 1100000,
        uploadedAt: "2026-05-02T08:30:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-02T08:55:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-012",
    fullName: "Aïssatou Ndiaye",
    email: "aissatou.n@droit.sn",
    initials: "AN",
    avatarColor: "bg-primary/15 text-primary",
    specialty: "Droit des affaires",
    country: "Sénégal",
    status: "APPROVED",
    submittedAt: "2026-04-10T10:30:00Z",
    coursesSubmitted: 4,
    isComplete: true,
    lastDecisionAt: "2026-04-14T11:00:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Ndiaye",
      legalFirstNames: "Aïssatou",
      nationality: "Sénégalaise",
      addressLine: "Fann Résidence, Allée des Alizés",
      postalCode: "11000",
      city: "Dakar",
      residenceCountry: "Sénégal",
      birthDate: "1985-03-25",
      identityDocument: {
        type: "ID_CARD",
        fileUrl: "/mock-documents/cni_aissatou_ndiaye.pdf",
        fileName: "cni_aissatou_ndiaye.pdf",
        fileMimeType: "application/pdf",
        fileSize: 1450000,
        uploadedAt: "2026-04-10T10:00:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-04-10T10:25:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-013",
    fullName: "Daouda Koné",
    email: "d.kone@marketing.ci",
    initials: "DK",
    avatarColor: "bg-chart-2/15 text-chart-2",
    specialty: "Marketing Digital",
    country: "Côte d'Ivoire",
    status: "NOT_SUBMITTED",
    submittedAt: null,
    coursesSubmitted: 0,
    isComplete: false,
    verificationPayload: undefined, // NON SOUMIS
    verificationCompleteness: {
      hasLegalIdentity: false,
      hasAddress: false,
      hasIdentityDocument: false,
      hasHonorDeclaration: false,
    },
  },
  {
    id: "inst-014",
    fullName: "Léa Combari",
    email: "lea.combari@rh.bf",
    initials: "LC",
    avatarColor: "bg-chart-3/15 text-chart-3",
    specialty: "Ressources Humaines",
    country: "Burkina Faso",
    status: "PENDING",
    submittedAt: "2026-05-24T08:00:00Z",
    coursesSubmitted: 2,
    isComplete: true,
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Combari",
      legalFirstNames: "Léa Wend-Kuni",
      nationality: "Burkinabée",
      addressLine: "Quartier Somgandé, Zone Résidentielle",
      postalCode: "10 BP 32",
      city: "Ouagadougou",
      residenceCountry: "Burkina Faso",
      birthDate: "1990-12-02",
      identityDocument: {
        type: "ID_CARD",
        fileUrl: "/mock-documents/cni_lea_combari.pdf",
        fileName: "cni_lea_combari.pdf",
        fileMimeType: "application/pdf",
        fileSize: 1280000,
        uploadedAt: "2026-05-24T07:30:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-05-24T07:55:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
  {
    id: "inst-015",
    fullName: "Yves Agbodjan",
    email: "y.agbodjan@excel.tg",
    initials: "YA",
    avatarColor: "bg-chart-4/15 text-chart-4",
    specialty: "Excel & Data",
    country: "Togo",
    status: "REJECTED",
    submittedAt: "2026-04-28T14:30:00Z",
    coursesSubmitted: 2,
    isComplete: false,
    lastDecisionReason: "Expérience insuffisante dans le domaine déclaré.",
    lastDecisionAt: "2026-05-01T09:00:00Z",
    verificationPayload: {
      legalStatus: "INDIVIDUAL",
      legalLastName: "Agbodjan",
      legalFirstNames: "Yves",
      nationality: "Togolaise",
      addressLine: "Quartier Adidogomé, Allée Royale",
      postalCode: "BP 420",
      city: "Lomé",
      residenceCountry: "Togo",
      birthDate: "1994-06-18",
      identityDocument: {
        type: "ID_CARD",
        fileUrl: "/mock-documents/cni_yves_agbodjan.pdf",
        fileName: "cni_yves_agbodjan.pdf",
        fileMimeType: "application/pdf",
        fileSize: 1350000,
        uploadedAt: "2026-04-28T14:00:00Z",
      },
      honorDeclarationAccepted: true,
      honorDeclarationAcceptedAt: "2026-04-28T14:25:00Z",
    },
    verificationCompleteness: {
      hasLegalIdentity: true,
      hasAddress: true,
      hasIdentityDocument: true,
      hasHonorDeclaration: true,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Non renseigné";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}
