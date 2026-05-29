// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CourseSubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type CourseAssetType = "PDF" | "FILE" | "LINK";

export interface CourseAsset {
  id: string;
  type: CourseAssetType;
  title: string;
  url?: string;
  fileName?: string;
  fileSizeBytes?: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  isFreePreview: boolean;
  /** URL de la vidéo (null = manquante) */
  videoUrl: string | null;
  videoStatus: "READY" | "PROCESSING" | "MISSING";
  assets: CourseAsset[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface AdminCourseSubmission {
  id: string;
  /** Titre principal de la formation */
  title: string;
  /** Sous-titre ou accroche */
  subtitle: string | null;
  /** Slug SEO */
  slug: string;
  status: CourseSubmissionStatus;

  /** Formateur */
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  instructorApproved: boolean;
  instructorInitials: string;
  instructorAvatarColor: string;

  /** Catégorie */
  category: string;
  /** Niveau */
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  /** Langue */
  language: string;
  /** Prix public en XOF ou EUR */
  price: number;
  currency: "XOF" | "EUR" | "USD";
  /** Prix promotionnel (optionnel) */
  promoPrice: number | null;

  // ── Contenu commercial ──────────────────────────────────────────
  description: string;
  /** Objectifs pédagogiques / bénéfices */
  learningOutcomes: string[];
  prerequisites: string[];
  targetAudience: string[];

  // ── Médias ──────────────────────────────────────────────────────
  /** URL miniature de couverture */
  thumbnailUrl: string | null;
  /** URL vidéo de présentation */
  promoVideoUrl: string | null;

  // ── Programme ───────────────────────────────────────────────────
  modules: CourseModule[];

  // ── Meta ────────────────────────────────────────────────────────
  submittedAt: string | null;
  lastDecisionAt: string | null;
  lastDecisionReason: string | null;
  /** Nombre total de leçons calculé */
  totalLessons: number;
  /** Durée totale estimée en minutes */
  totalDurationMinutes: number;
}

export interface CourseReviewKpi {
  id: string;
  label: string;
  value: number;
  status: CourseSubmissionStatus;
  colorClass: string;
  iconBg: string;
}

export interface CourseReviewFilters {
  status: string;
  category: string;
  level: string;
  instructor: string;
  submittedFrom: string;
  submittedTo: string;
  priceMin: string;
  priceMax: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Config
// ─────────────────────────────────────────────────────────────────────────────

export const courseStatusConfig: Record<
  CourseSubmissionStatus,
  {
    label: string;
    colorClass: string;
    dotClass: string;
  }
> = {
  DRAFT: {
    label: "Brouillon",
    colorClass: "text-muted-foreground border-border bg-muted/50",
    dotClass: "bg-muted-foreground",
  },
  SUBMITTED: {
    label: "Soumise",
    colorClass: "text-amber-600 border-amber-500/40 bg-amber-500/10",
    dotClass: "bg-amber-500",
  },
  APPROVED: {
    label: "Approuvée",
    colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    dotClass: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejetée",
    colorClass: "text-red-600 border-red-500/40 bg-red-500/10",
    dotClass: "bg-red-500",
  },
  ARCHIVED: {
    label: "Archivée",
    colorClass: "text-slate-500 border-slate-400/40 bg-slate-400/10",
    dotClass: "bg-slate-400",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI Mock
// ─────────────────────────────────────────────────────────────────────────────

export const courseKpis: CourseReviewKpi[] = [
  {
    id: "submitted",
    label: "Soumises",
    value: 8,
    status: "SUBMITTED",
    colorClass: "text-amber-600 border-amber-500/40 bg-amber-500/10",
    iconBg: "bg-amber-500/15",
  },
  {
    id: "approved",
    label: "Approuvées",
    value: 24,
    status: "APPROVED",
    colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    iconBg: "bg-emerald-500/15",
  },
  {
    id: "rejected",
    label: "Rejetées / Corrections",
    value: 6,
    status: "REJECTED",
    colorClass: "text-red-600 border-red-500/40 bg-red-500/10",
    iconBg: "bg-red-500/15",
  },
  {
    id: "archived",
    label: "Archivées",
    value: 11,
    status: "ARCHIVED",
    colorClass: "text-slate-500 border-slate-400/40 bg-slate-400/10",
    iconBg: "bg-slate-400/15",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Listes de référence
// ─────────────────────────────────────────────────────────────────────────────

export const COURSE_CATEGORIES = [
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
  "Design",
  "Cybersécurité",
] as const;

export const COURSE_LEVELS: Record<
  AdminCourseSubmission["level"],
  string
> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  ALL_LEVELS: "Tous niveaux",
};

export const COURSE_LANGUAGES = [
  "Français",
  "Anglais",
  "Arabe",
  "Wolof",
  "Dioula",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatPrice(
  price: number,
  currency: AdminCourseSubmission["currency"],
): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const mockCourseSubmissions: AdminCourseSubmission[] = [
  // ─── Formation 1 : complète et bien soumise ─────────────────────────────
  {
    id: "course-001",
    title: "Gestion de Projet Agile — De la théorie à la pratique",
    subtitle: "Maîtrisez Scrum, Kanban et les outils essentiels en 6 semaines",
    slug: "gestion-projet-agile-scrum-kanban",
    status: "SUBMITTED",
    instructorId: "inst-001",
    instructorName: "Amadou Koné",
    instructorEmail: "amadou.kone@mail.ci",
    instructorApproved: true,
    instructorInitials: "AK",
    instructorAvatarColor: "bg-primary/15 text-primary",
    category: "Gestion de projet",
    level: "INTERMEDIATE",
    language: "Français",
    price: 45000,
    currency: "XOF",
    promoPrice: 35000,
    description:
      "Cette formation complète vous guide pas à pas dans la maîtrise des méthodologies agiles. Vous apprendrez à planifier des sprints, gérer un backlog produit et animer des rétrospectives. Idéale pour les chefs de projet souhaitant moderniser leur pratique.",
    learningOutcomes: [
      "Comprendre les fondements du Manifeste Agile",
      "Planifier et exécuter des sprints Scrum",
      "Utiliser Jira, Trello et Notion efficacement",
      "Gérer des équipes distribuées à distance",
      "Animer des cérémonies Scrum (daily, rétro, review)",
    ],
    prerequisites: [
      "Notions de base en gestion de projet",
      "Expérience professionnelle d'au moins 1 an",
    ],
    targetAudience: [
      "Chefs de projet souhaitant adopter l'agilité",
      "Product Managers en reconversion",
      "Équipes tech cherchant à s'organiser",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modules: [
      {
        id: "mod-001-1",
        title: "Introduction à l'Agilité",
        lessons: [
          {
            id: "les-001-1-1",
            title: "Qu'est-ce que l'Agile ?",
            durationMinutes: 18,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/001-1-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-001-1-2",
            title: "Le Manifeste Agile décrypté",
            durationMinutes: 22,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/001-1-2.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-001-1",
                type: "PDF",
                title: "Manifeste Agile — Résumé",
                fileName: "manifeste-agile.pdf",
                fileSizeBytes: 540000,
              },
            ],
          },
        ],
      },
      {
        id: "mod-001-2",
        title: "Framework Scrum",
        lessons: [
          {
            id: "les-001-2-1",
            title: "Rôles Scrum : Product Owner, Scrum Master, Dev Team",
            durationMinutes: 35,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/001-2-1.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-001-2",
                type: "PDF",
                title: "Fiche récapitulatif Scrum",
                fileName: "scrum-roles.pdf",
                fileSizeBytes: 820000,
              },
            ],
          },
          {
            id: "les-001-2-2",
            title: "Planification de sprint",
            durationMinutes: 45,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/001-2-2.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-001-2-3",
            title: "Outils : Jira et Trello",
            durationMinutes: 40,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/001-2-3.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-001-3",
                type: "LINK",
                title: "Template Trello Scrum",
                url: "https://trello.com/templates/agile-scrum",
              },
            ],
          },
        ],
      },
    ],
    submittedAt: "2026-05-27T09:30:00Z",
    lastDecisionAt: null,
    lastDecisionReason: null,
    totalLessons: 5,
    totalDurationMinutes: 160,
  },

  // ─── Formation 2 : approuvée ─────────────────────────────────────────────
  {
    id: "course-002",
    title: "Marketing Digital — Facebook & Instagram Ads",
    subtitle: "Créez et optimisez vos campagnes publicitaires depuis zéro",
    slug: "marketing-digital-facebook-instagram-ads",
    status: "APPROVED",
    instructorId: "inst-002",
    instructorName: "Fatou Diallo",
    instructorEmail: "fatou.diallo@certilys.sn",
    instructorApproved: true,
    instructorInitials: "FD",
    instructorAvatarColor: "bg-chart-2/15 text-chart-2",
    category: "Marketing Digital",
    level: "BEGINNER",
    language: "Français",
    price: 29000,
    currency: "XOF",
    promoPrice: null,
    description:
      "Apprenez à créer des publicités performantes sur Facebook et Instagram. De la définition du budget au ciblage avancé des audiences, cette formation vous donne toutes les clés pour générer des résultats concrets.",
    learningOutcomes: [
      "Configurer le Business Manager Facebook",
      "Créer des audiences personnalisées et similaires",
      "Optimiser le ROI de vos campagnes",
      "Analyser les métriques publicitaires",
    ],
    prerequisites: ["Avoir un compte Facebook personnel", "Notions de base en marketing"],
    targetAudience: [
      "Entrepreneurs et indépendants",
      "Community managers",
      "PME cherchant à se digitaliser",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800",
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modules: [
      {
        id: "mod-002-1",
        title: "Fondamentaux de la publicité digitale",
        lessons: [
          {
            id: "les-002-1-1",
            title: "Introduction au Méta Business Suite",
            durationMinutes: 20,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/002-1-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-002-1-2",
            title: "Créer sa première campagne",
            durationMinutes: 30,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/002-1-2.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-002-1",
                type: "PDF",
                title: "Guide Facebook Ads",
                fileName: "guide-fb-ads.pdf",
                fileSizeBytes: 1200000,
              },
            ],
          },
        ],
      },
    ],
    submittedAt: "2026-05-10T10:00:00Z",
    lastDecisionAt: "2026-05-14T15:30:00Z",
    lastDecisionReason: null,
    totalLessons: 2,
    totalDurationMinutes: 50,
  },

  // ─── Formation 3 : rejetée (contenu insuffisant) ─────────────────────────
  {
    id: "course-003",
    title: "Bases de la Comptabilité Générale",
    subtitle: null,
    slug: "bases-comptabilite-generale",
    status: "REJECTED",
    instructorId: "inst-003",
    instructorName: "Koffi Mensah",
    instructorEmail: "k.mensah@formateur.cm",
    instructorApproved: false,
    instructorInitials: "KM",
    instructorAvatarColor: "bg-chart-3/15 text-chart-3",
    category: "Comptabilité & Finance",
    level: "BEGINNER",
    language: "Français",
    price: 20000,
    currency: "XOF",
    promoPrice: null,
    description: "Une introduction à la comptabilité.",
    learningOutcomes: ["Comprendre les bases de la comptabilité"],
    prerequisites: [],
    targetAudience: ["Débutants"],
    thumbnailUrl: null,
    promoVideoUrl: null,
    modules: [
      {
        id: "mod-003-1",
        title: "Introduction",
        lessons: [
          {
            id: "les-003-1-1",
            title: "Les bases",
            durationMinutes: 10,
            isFreePreview: false,
            videoUrl: null,
            videoStatus: "MISSING",
            assets: [],
          },
        ],
      },
    ],
    submittedAt: "2026-05-18T11:00:00Z",
    lastDecisionAt: "2026-05-21T14:00:00Z",
    lastDecisionReason:
      "Description trop courte, aucune vidéo associée, miniature absente. La formation ne respecte pas les standards de qualité Certilys. Veuillez enrichir significativement le contenu.",
    totalLessons: 1,
    totalDurationMinutes: 10,
  },

  // ─── Formation 4 : soumise, formateur non approuvé ────────────────────────
  {
    id: "course-004",
    title: "Leadership & Management d'équipe en Afrique",
    subtitle: "Construire et motiver des équipes performantes dans le contexte africain",
    slug: "leadership-management-equipe-afrique",
    status: "SUBMITTED",
    instructorId: "inst-004",
    instructorName: "Awa Traoré",
    instructorEmail: "awa.traore@formations.ml",
    instructorApproved: false,
    instructorInitials: "AT",
    instructorAvatarColor: "bg-chart-4/15 text-chart-4",
    category: "Leadership & Management",
    level: "INTERMEDIATE",
    language: "Français",
    price: 55000,
    currency: "XOF",
    promoPrice: 42000,
    description:
      "Une formation axée sur les spécificités du management en contexte africain. Vous découvrirez des méthodes adaptées aux cultures locales, aux défis d'équipes intergénérationnelles et aux contraintes des PME du continent.",
    learningOutcomes: [
      "Comprendre les dynamiques d'équipes africaines",
      "Développer son style de leadership situationnel",
      "Résoudre les conflits interculturels",
      "Motiver sans budget illimité",
    ],
    prerequisites: [
      "Expérience en gestion d'équipe de 2 ans minimum",
      "Maîtrise du français professionnel",
    ],
    targetAudience: [
      "Managers de PME africaines",
      "Cadres en entreprise",
      "Entrepreneurs ayant des équipes",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    promoVideoUrl: null,
    modules: [
      {
        id: "mod-004-1",
        title: "Comprendre le leadership africain",
        lessons: [
          {
            id: "les-004-1-1",
            title: "Contexte culturel et management",
            durationMinutes: 28,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/004-1-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-004-1-2",
            title: "Les styles de leadership",
            durationMinutes: 35,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/004-1-2.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-004-1",
                type: "PDF",
                title: "Les 4 styles de leadership",
                fileName: "styles-leadership.pdf",
                fileSizeBytes: 950000,
              },
            ],
          },
        ],
      },
      {
        id: "mod-004-2",
        title: "Gestion des conflits",
        lessons: [
          {
            id: "les-004-2-1",
            title: "Identifier les sources de conflits",
            durationMinutes: 32,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/004-2-1.mp4",
            videoStatus: "PROCESSING",
            assets: [],
          },
        ],
      },
    ],
    submittedAt: "2026-05-25T14:00:00Z",
    lastDecisionAt: null,
    lastDecisionReason: null,
    totalLessons: 3,
    totalDurationMinutes: 95,
  },

  // ─── Formation 5 : corrections demandées ─────────────────────────────────
  {
    id: "course-005",
    title: "Excel Avancé — Tableaux Croisés et Power Query",
    subtitle: "Maîtrisez les fonctionnalités avancées d'Excel pour l'analyse de données",
    slug: "excel-avance-tcd-power-query",
    status: "REJECTED",
    instructorId: "inst-005",
    instructorName: "Ibrahim Coulibaly",
    instructorEmail: "ibrahim.c@devweb.bf",
    instructorApproved: true,
    instructorInitials: "IC",
    instructorAvatarColor: "bg-primary/20 text-primary",
    category: "Excel & Data",
    level: "ADVANCED",
    language: "Français",
    price: 38000,
    currency: "XOF",
    promoPrice: null,
    description:
      "Cette formation vous plonge dans les fonctionnalités avancées d'Excel : TCD dynamiques, Power Query pour l'ETL, et DAX basique. Idéal pour les analystes et contrôleurs de gestion.",
    learningOutcomes: [
      "Maîtriser les Tableaux Croisés Dynamiques",
      "Automatiser les imports avec Power Query",
      "Créer des tableaux de bord interactifs",
    ],
    prerequisites: ["Maîtrise d'Excel niveau intermédiaire", "Connaissance des formules de base"],
    targetAudience: [
      "Contrôleurs de gestion",
      "Analystes financiers",
      "Responsables RH et opérations",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modules: [
      {
        id: "mod-005-1",
        title: "Tableaux Croisés Dynamiques",
        lessons: [
          {
            id: "les-005-1-1",
            title: "Créer son premier TCD",
            durationMinutes: 25,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/005-1-1.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-005-1",
                type: "FILE",
                title: "Fichier Excel d'exercice",
                fileName: "exercice-tcd.xlsx",
                fileSizeBytes: 340000,
              },
            ],
          },
          {
            id: "les-005-1-2",
            title: "TCD avancés et segments",
            durationMinutes: 38,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/005-1-2.mp4",
            videoStatus: "READY",
            assets: [],
          },
        ],
      },
      {
        id: "mod-005-2",
        title: "Power Query",
        lessons: [
          {
            id: "les-005-2-1",
            title: "Introduction à Power Query",
            durationMinutes: 30,
            isFreePreview: false,
            videoUrl: null,
            videoStatus: "MISSING",
            assets: [],
          },
          {
            id: "les-005-2-2",
            title: "Transformations et ETL",
            durationMinutes: 45,
            isFreePreview: false,
            videoUrl: null,
            videoStatus: "MISSING",
            assets: [],
          },
        ],
      },
    ],
    submittedAt: "2026-05-20T08:00:00Z",
    lastDecisionAt: "2026-05-23T10:00:00Z",
    lastDecisionReason:
      "2 vidéos manquantes dans le module Power Query. Veuillez compléter le contenu vidéo avant de soumettre à nouveau.",
    totalLessons: 4,
    totalDurationMinutes: 138,
  },

  // ─── Formation 6 : approuvée ─────────────────────────────────────────────
  {
    id: "course-006",
    title: "Ressources Humaines — Recrutement & Onboarding",
    subtitle: "Construisez un processus de recrutement efficace et inclusif",
    slug: "rh-recrutement-onboarding",
    status: "APPROVED",
    instructorId: "inst-006",
    instructorName: "Mariama Barry",
    instructorEmail: "mariama.barry@rh-afrique.gn",
    instructorApproved: true,
    instructorInitials: "MB",
    instructorAvatarColor: "bg-chart-5/15 text-chart-5",
    category: "Ressources Humaines",
    level: "INTERMEDIATE",
    language: "Français",
    price: 42000,
    currency: "XOF",
    promoPrice: 32000,
    description:
      "Maîtrisez toutes les étapes du recrutement, de la définition du poste à l'intégration réussie du nouveau collaborateur. Une formation opérationnelle avec des outils concrets.",
    learningOutcomes: [
      "Rédiger des fiches de poste attractives",
      "Mener des entretiens structurés",
      "Mettre en place un processus d'onboarding",
      "Éviter les biais de recrutement",
    ],
    prerequisites: ["Exercer un rôle RH ou managérial"],
    targetAudience: [
      "Responsables RH",
      "Managers recruteurs",
      "Dirigeants de PME",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modules: [
      {
        id: "mod-006-1",
        title: "Processus de Recrutement",
        lessons: [
          {
            id: "les-006-1-1",
            title: "Définir le besoin et rédiger l'offre",
            durationMinutes: 22,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/006-1-1.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-006-1",
                type: "PDF",
                title: "Template fiche de poste",
                fileName: "template-fiche-poste.pdf",
                fileSizeBytes: 620000,
              },
            ],
          },
          {
            id: "les-006-1-2",
            title: "Sélection des candidatures",
            durationMinutes: 28,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/006-1-2.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-006-1-3",
            title: "Mener un entretien structuré",
            durationMinutes: 40,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/006-1-3.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-006-2",
                type: "PDF",
                title: "Guide entretien STAR",
                fileName: "guide-entretien-star.pdf",
                fileSizeBytes: 780000,
              },
            ],
          },
        ],
      },
    ],
    submittedAt: "2026-05-12T09:00:00Z",
    lastDecisionAt: "2026-05-15T11:00:00Z",
    lastDecisionReason: null,
    totalLessons: 3,
    totalDurationMinutes: 90,
  },

  // ─── Formation 7 : soumise ─────────────────────────────────────────────────
  {
    id: "course-007",
    title: "Développement Web React — De Zéro à Développeur",
    subtitle: "Construisez des applications web modernes avec React et Next.js",
    slug: "developpement-web-react-nextjs",
    status: "SUBMITTED",
    instructorId: "inst-007",
    instructorName: "Kwame Asante",
    instructorEmail: "kwame.asante@finance.tg",
    instructorApproved: true,
    instructorInitials: "KA",
    instructorAvatarColor: "bg-chart-2/20 text-chart-2",
    category: "Développement Web",
    level: "BEGINNER",
    language: "Français",
    price: 75000,
    currency: "XOF",
    promoPrice: 55000,
    description:
      "Une formation complète pour devenir développeur React. Vous partirez des bases de JavaScript moderne (ES6+) et progresserez jusqu'à la création d'applications fullstack avec Next.js et une API REST.",
    learningOutcomes: [
      "Maîtriser JavaScript ES6+ (arrow functions, destructuring, async/await)",
      "Créer des composants React réutilisables",
      "Gérer l'état avec useState, useContext et Zustand",
      "Construire des routes avec Next.js App Router",
      "Consommer des API REST et gérer l'authentification",
    ],
    prerequisites: [
      "Connaître les bases de HTML et CSS",
      "Avoir un ordinateur avec accès à internet",
    ],
    targetAudience: [
      "Personnes souhaitant apprendre le développement web",
      "Développeurs backend voulant évoluer vers le fullstack",
      "Étudiants en informatique",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800",
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modules: [
      {
        id: "mod-007-1",
        title: "JavaScript Moderne",
        lessons: [
          {
            id: "les-007-1-1",
            title: "ES6+ — Les fondamentaux",
            durationMinutes: 45,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/007-1-1.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-007-1",
                type: "LINK",
                title: "MDN - ES6",
                url: "https://developer.mozilla.org/fr/docs/Web/JavaScript",
              },
            ],
          },
          {
            id: "les-007-1-2",
            title: "Async/Await et Promises",
            durationMinutes: 38,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/007-1-2.mp4",
            videoStatus: "READY",
            assets: [],
          },
        ],
      },
      {
        id: "mod-007-2",
        title: "Introduction à React",
        lessons: [
          {
            id: "les-007-2-1",
            title: "Premier composant React",
            durationMinutes: 30,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/007-2-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-007-2-2",
            title: "Props et State",
            durationMinutes: 42,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/007-2-2.mp4",
            videoStatus: "PROCESSING",
            assets: [],
          },
        ],
      },
    ],
    submittedAt: "2026-05-26T16:30:00Z",
    lastDecisionAt: null,
    lastDecisionReason: null,
    totalLessons: 4,
    totalDurationMinutes: 155,
  },

  // ─── Formation 8 : archivée ───────────────────────────────────────────────
  {
    id: "course-008",
    title: "Droit des Affaires OHADA — Fondamentaux",
    subtitle: "Comprendre le cadre juridique des entreprises en Afrique subsaharienne",
    slug: "droit-affaires-ohada-fondamentaux",
    status: "ARCHIVED",
    instructorId: "inst-012",
    instructorName: "Aïssatou Ndiaye",
    instructorEmail: "aissatou.n@droit.sn",
    instructorApproved: true,
    instructorInitials: "AN",
    instructorAvatarColor: "bg-primary/15 text-primary",
    category: "Droit des affaires",
    level: "INTERMEDIATE",
    language: "Français",
    price: 65000,
    currency: "XOF",
    promoPrice: null,
    description:
      "Maîtrisez les principales dispositions du droit OHADA applicables aux entreprises africaines. De la création de société à la résolution des litiges commerciaux.",
    learningOutcomes: [
      "Comprendre l'OHADA et ses actes uniformes",
      "Choisir la bonne forme juridique d'entreprise",
      "Maîtriser le droit des contrats commerciaux",
    ],
    prerequisites: ["Niveau Bac minimum"],
    targetAudience: ["Juristes d'entreprise", "Entrepreneurs", "Étudiants en droit"],
    thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    promoVideoUrl: null,
    modules: [
      {
        id: "mod-008-1",
        title: "Introduction à l'OHADA",
        lessons: [
          {
            id: "les-008-1-1",
            title: "Histoire et objectifs de l'OHADA",
            durationMinutes: 35,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/008-1-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
        ],
      },
    ],
    submittedAt: "2026-04-01T09:00:00Z",
    lastDecisionAt: "2026-05-01T10:00:00Z",
    lastDecisionReason: null,
    totalLessons: 1,
    totalDurationMinutes: 35,
  },

  // ─── Formation 9 : soumise avec vidéo promo manquante ────────────────────
  {
    id: "course-009",
    title: "Communication Professionnelle — Prise de Parole en Public",
    subtitle: "Vaincre le trac et captiver votre audience en toute situation",
    slug: "communication-prise-parole-public",
    status: "SUBMITTED",
    instructorId: "inst-008",
    instructorName: "Céline Adjovi",
    instructorEmail: "c.adjovi@communication.bj",
    instructorApproved: true,
    instructorInitials: "CA",
    instructorAvatarColor: "bg-primary/10 text-primary",
    category: "Communication",
    level: "ALL_LEVELS",
    language: "Français",
    price: 35000,
    currency: "XOF",
    promoPrice: 28000,
    description:
      "Que vous ayez à animer une réunion d'équipe ou à présenter devant 500 personnes, cette formation vous donnera les outils concrets pour parler avec confiance et impact.",
    learningOutcomes: [
      "Structurer un discours percutant",
      "Gérer le stress et l'anxiété scénique",
      "Maîtriser la communication non verbale",
      "Créer des présentations visuelles engageantes",
    ],
    prerequisites: [],
    targetAudience: [
      "Managers et cadres",
      "Commerciaux et entrepreneurs",
      "Toute personne amenée à parler en public",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    promoVideoUrl: null,
    modules: [
      {
        id: "mod-009-1",
        title: "Vaincre le trac",
        lessons: [
          {
            id: "les-009-1-1",
            title: "Comprendre la peur de parler",
            durationMinutes: 20,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/009-1-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-009-1-2",
            title: "Techniques de respiration et ancrage",
            durationMinutes: 25,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/009-1-2.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-009-1",
                type: "PDF",
                title: "Exercices de respiration",
                fileName: "exercices-respiration.pdf",
                fileSizeBytes: 380000,
              },
            ],
          },
        ],
      },
      {
        id: "mod-009-2",
        title: "Structure et Impact",
        lessons: [
          {
            id: "les-009-2-1",
            title: "La règle des 3 pour structurer",
            durationMinutes: 18,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/009-2-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-009-2-2",
            title: "Storytelling et narration",
            durationMinutes: 35,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/009-2-2.mp4",
            videoStatus: "READY",
            assets: [],
          },
        ],
      },
    ],
    submittedAt: "2026-05-28T07:00:00Z",
    lastDecisionAt: null,
    lastDecisionReason: null,
    totalLessons: 4,
    totalDurationMinutes: 98,
  },

  // ─── Formation 10 : brouillon ─────────────────────────────────────────────
  {
    id: "course-010",
    title: "Entrepreneuriat — De l'idée au Business Plan",
    subtitle: null,
    slug: "entrepreneuriat-idee-business-plan",
    status: "DRAFT",
    instructorId: "inst-011",
    instructorName: "Seydou Bah",
    instructorEmail: "seydou.bah@entrepreneur.gn",
    instructorApproved: false,
    instructorInitials: "SB",
    instructorAvatarColor: "bg-chart-5/20 text-chart-5",
    category: "Entrepreneuriat",
    level: "BEGINNER",
    language: "Français",
    price: 0,
    currency: "XOF",
    promoPrice: null,
    description: "",
    learningOutcomes: [],
    prerequisites: [],
    targetAudience: [],
    thumbnailUrl: null,
    promoVideoUrl: null,
    modules: [],
    submittedAt: null,
    lastDecisionAt: null,
    lastDecisionReason: null,
    totalLessons: 0,
    totalDurationMinutes: 0,
  },

  // ─── Formation 11 : approuvée, EUR ────────────────────────────────────────
  {
    id: "course-011",
    title: "Design Graphique — Maîtriser Figma de A à Z",
    subtitle: "Créez des interfaces et prototypes professionnels avec Figma",
    slug: "design-graphique-figma",
    status: "APPROVED",
    instructorId: "inst-014",
    instructorName: "Léa Combari",
    instructorEmail: "lea.combari@rh.bf",
    instructorApproved: true,
    instructorInitials: "LC",
    instructorAvatarColor: "bg-chart-3/15 text-chart-3",
    category: "Design",
    level: "BEGINNER",
    language: "Français",
    price: 49,
    currency: "EUR",
    promoPrice: 29,
    description:
      "De la découverte de l'interface Figma aux prototypes interactifs avancés, cette formation vous rendra autonome dans la création d'interfaces UI/UX professionnelles.",
    learningOutcomes: [
      "Naviguer dans Figma avec aisance",
      "Créer des composants et design systems",
      "Prototyper des interactions utilisateur",
      "Collaborer avec des développeurs",
    ],
    prerequisites: ["Aucun prérequis technique"],
    targetAudience: [
      "Designers en reconversion",
      "Product managers",
      "Développeurs souhaitant apprendre le design",
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800",
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modules: [
      {
        id: "mod-011-1",
        title: "Prise en main de Figma",
        lessons: [
          {
            id: "les-011-1-1",
            title: "Interface et navigation",
            durationMinutes: 20,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/011-1-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-011-1-2",
            title: "Formes, textes et couleurs",
            durationMinutes: 35,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/011-1-2.mp4",
            videoStatus: "READY",
            assets: [],
          },
        ],
      },
    ],
    submittedAt: "2026-04-20T10:00:00Z",
    lastDecisionAt: "2026-04-24T09:00:00Z",
    lastDecisionReason: null,
    totalLessons: 2,
    totalDurationMinutes: 55,
  },

  // ─── Formation 12 : soumise avec miniature manquante ─────────────────────
  {
    id: "course-012",
    title: "Cybersécurité pour non-techniciens",
    subtitle: "Protégez votre entreprise des cybermenaces sans être expert",
    slug: "cybersecurite-non-techniciens",
    status: "SUBMITTED",
    instructorId: "inst-007",
    instructorName: "Kwame Asante",
    instructorEmail: "kwame.asante@finance.tg",
    instructorApproved: true,
    instructorInitials: "KA",
    instructorAvatarColor: "bg-chart-2/20 text-chart-2",
    category: "Cybersécurité",
    level: "BEGINNER",
    language: "Français",
    price: 48000,
    currency: "XOF",
    promoPrice: null,
    description:
      "Cette formation s'adresse aux dirigeants, managers et collaborateurs non techniques qui souhaitent comprendre les risques cyber et mettre en place des bonnes pratiques concrètes.",
    learningOutcomes: [
      "Identifier les principales cybermenaces",
      "Créer et gérer des mots de passe sécurisés",
      "Reconnaître les tentatives de phishing",
      "Sécuriser ses données en entreprise",
    ],
    prerequisites: ["Utilisation basique d'un ordinateur et d'internet"],
    targetAudience: [
      "Dirigeants de PME",
      "Managers et cadres non-techniques",
      "Assistants et secrétaires",
    ],
    thumbnailUrl: null,
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modules: [
      {
        id: "mod-012-1",
        title: "Les cybermenaces en 2026",
        lessons: [
          {
            id: "les-012-1-1",
            title: "Panorama des menaces actuelles",
            durationMinutes: 22,
            isFreePreview: true,
            videoUrl: "https://cdn.certilys.com/videos/012-1-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-012-1-2",
            title: "Phishing, ransomware et ingénierie sociale",
            durationMinutes: 30,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/012-1-2.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-012-1",
                type: "PDF",
                title: "Guide anti-phishing",
                fileName: "guide-anti-phishing.pdf",
                fileSizeBytes: 720000,
              },
            ],
          },
        ],
      },
      {
        id: "mod-012-2",
        title: "Bonnes pratiques de sécurité",
        lessons: [
          {
            id: "les-012-2-1",
            title: "Mots de passe et authentification",
            durationMinutes: 25,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/012-2-1.mp4",
            videoStatus: "READY",
            assets: [],
          },
          {
            id: "les-012-2-2",
            title: "Sauvegardes et plan de continuité",
            durationMinutes: 28,
            isFreePreview: false,
            videoUrl: "https://cdn.certilys.com/videos/012-2-2.mp4",
            videoStatus: "READY",
            assets: [
              {
                id: "ast-012-2",
                type: "LINK",
                title: "Ressources ANSSI",
                url: "https://www.ssi.gouv.fr/",
              },
            ],
          },
        ],
      },
    ],
    submittedAt: "2026-05-28T06:00:00Z",
    lastDecisionAt: null,
    lastDecisionReason: null,
    totalLessons: 4,
    totalDurationMinutes: 105,
  },
];
