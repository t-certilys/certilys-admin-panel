export type AuditAction =
  | "INSTRUCTOR_APPROVED"
  | "INSTRUCTOR_REJECTED"
  | "INSTRUCTOR_CHANGES_REQUESTED"
  | "COURSE_APPROVED"
  | "COURSE_REJECTED"
  | "COURSE_CHANGES_REQUESTED"
  | "ACCESS_REVOKED"
  | "USER_SUSPENDED"
  | "USER_REACTIVATED"
  | "TWO_FACTOR_DISABLED_BY_ADMIN"
  | "ORDER_MARKED_FOR_REVIEW"
  | "PAYMENT_SYNC_REQUESTED";

export type AuditTargetType = "INSTRUCTOR" | "COURSE" | "USER" | "ORDER" | "SYSTEM";

export interface AdminAuditLog {
  id: string;
  action: AuditAction;
  adminId: string;
  adminName: string;
  adminRole: "ADMIN" | "MODERATOR";
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  reason?: string;
  metadata: Record<string, any>;
  createdAt: string; // Date stable préformatée pour éviter tout décalage d'hydratation
  ipAddress: string;
  userAgent: string;
  severity: "info" | "warning" | "critical";
}

export interface AuditKpis {
  totalCount: number;
  todayCount: number;
  criticalCount: number;
  revocationsCount: number;
}

export const mockAuditLogs: AdminAuditLog[] = [
  {
    id: "log_1",
    action: "COURSE_APPROVED",
    adminId: "tm_1",
    adminName: "Alexandre Dupuis",
    adminRole: "ADMIN",
    targetType: "COURSE",
    targetId: "crs_102",
    targetLabel: "Introduction à la Cybersécurité Avancée",
    reason: "La formation remplit l'ensemble des critères pédagogiques et techniques Certilys.",
    metadata: {
      courseId: "crs_102",
      title: "Introduction à la Cybersécurité Avancée",
      instructorId: "inst_15",
      instructorName: "Thomas Dubois",
      modulesCount: 8,
      totalHours: 42,
      price: 1490,
      approvedAt: "2026-05-29T09:30:00Z"
    },
    createdAt: "29/05/2026, 09:30",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    severity: "info"
  },
  {
    id: "log_2",
    action: "USER_SUSPENDED",
    adminId: "tm_2",
    adminName: "Sophie Laurent",
    adminRole: "ADMIN",
    targetType: "USER",
    targetId: "usr_408",
    targetLabel: "Lucas Martin (lucas.martin@gmail.com)",
    reason: "Comportement suspect détecté : tentatives répétées de téléchargement massif de ressources protégées.",
    metadata: {
      userId: "usr_408",
      email: "lucas.martin@gmail.com",
      statusBefore: "ACTIVE",
      statusAfter: "SUSPENDED",
      violationType: "RESOURCE_SCRAPING",
      suspensionDuration: "INDEFINITE",
      triggeredAlertsCount: 4
    },
    createdAt: "29/05/2026, 08:45",
    ipAddress: "192.168.1.12",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    severity: "critical"
  },
  {
    id: "log_3",
    action: "PAYMENT_SYNC_REQUESTED",
    adminId: "tm_3",
    adminName: "Thomas Dubois",
    adminRole: "MODERATOR",
    targetType: "SYSTEM",
    targetId: "sys_stripe",
    targetLabel: "Synchronisation API Stripe",
    metadata: {
      gateway: "STRIPE",
      syncType: "MANUAL_BATCH",
      recordsRequested: 150,
      startedAt: "2026-05-29T08:12:00Z",
      initiatedBy: "tm_3"
    },
    createdAt: "29/05/2026, 08:12",
    ipAddress: "192.168.2.89",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    severity: "info"
  },
  {
    id: "log_4",
    action: "ORDER_MARKED_FOR_REVIEW",
    adminId: "tm_3",
    adminName: "Thomas Dubois",
    adminRole: "MODERATOR",
    targetType: "ORDER",
    targetId: "ord_9501",
    targetLabel: "Commande CMD-2026-9501",
    reason: "Écarts de géolocalisation suspects détectés entre l'IP d'achat et le pays d'émission de la carte bancaire.",
    metadata: {
      orderId: "ord_9501",
      amount: 2490,
      customerEmail: "fraude.test@tempmail.com",
      cardIssuerCountry: "BR",
      purchaseIpCountry: "RU",
      riskScore: 92,
      flaggedRules: ["IP_CARD_COUNTRY_MISMATCH", "TEMP_EMAIL_PROVIDER"]
    },
    createdAt: "29/05/2026, 07:15",
    ipAddress: "192.168.2.89",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    severity: "warning"
  },
  {
    id: "log_5",
    action: "TWO_FACTOR_DISABLED_BY_ADMIN",
    adminId: "tm_1",
    adminName: "Alexandre Dupuis",
    adminRole: "ADMIN",
    targetType: "USER",
    targetId: "usr_102",
    targetLabel: "Sarah Lecomte (sarah.lecomte@certilys.fr)",
    reason: "Perte définitive de l'appareil 2FA de l'utilisatrice. Identité vérifiée par appel vidéo.",
    metadata: {
      userId: "usr_102",
      email: "sarah.lecomte@certilys.fr",
      verificationMethod: "VIDEO_CALL",
      operatorId: "tm_1",
      backupCodesInvalidated: true
    },
    createdAt: "28/05/2026, 17:30",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    severity: "critical"
  },
  {
    id: "log_6",
    action: "INSTRUCTOR_APPROVED",
    adminId: "tm_2",
    adminName: "Sophie Laurent",
    adminRole: "ADMIN",
    targetType: "INSTRUCTOR",
    targetId: "inst_22",
    targetLabel: "Marc Alibert (marc.alibert@cybersec.io)",
    reason: "Vérification des diplômes et attestations d'expérience positive.",
    metadata: {
      instructorId: "inst_22",
      fullName: "Marc Alibert",
      email: "marc.alibert@cybersec.io",
      specialties: ["Forensics", "Reverse Engineering"],
      verifiedDocuments: ["DIPLOMA_MASTER_2", "PROFESSIONAL_CERTIFICATION_CEH"],
      assignedCommissions: "15%"
    },
    createdAt: "28/05/2026, 14:15",
    ipAddress: "192.168.1.12",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    severity: "info"
  },
  {
    id: "log_7",
    action: "COURSE_CHANGES_REQUESTED",
    adminId: "tm_4",
    adminName: "Clara Martinez",
    adminRole: "MODERATOR",
    targetType: "COURSE",
    targetId: "crs_204",
    targetLabel: "Les Fondations du Cloud Computing",
    reason: "La qualité audio du module 3 est insuffisante et nécessite un réenregistrement. Les slides du module 1 contiennent des fautes.",
    metadata: {
      courseId: "crs_204",
      title: "Les Fondations du Cloud Computing",
      instructorId: "inst_09",
      requestedChanges: [
        { section: "Module 3", comment: "Bruit de fond important et volume trop faible" },
        { section: "Module 1 - Diapositives", comment: "Plusieurs fautes d'orthographe détectées sur les slides 4, 12 et 15" }
      ],
      reviewDurationMinutes: 120
    },
    createdAt: "28/05/2026, 11:10",
    ipAddress: "192.168.3.102",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
    severity: "warning"
  },
  {
    id: "log_8",
    action: "INSTRUCTOR_REJECTED",
    adminId: "tm_2",
    adminName: "Sophie Laurent",
    adminRole: "ADMIN",
    targetType: "INSTRUCTOR",
    targetId: "inst_99",
    targetLabel: "Paul Moreau (paul.moreau@fake-academy.com)",
    reason: "Tentative d'usurpation d'identité. Les justificatifs d'expérience professionnelle fournis sont falsifiés.",
    metadata: {
      candidateId: "inst_99",
      fullName: "Paul Moreau",
      email: "paul.moreau@fake-academy.com",
      detectedAnomalies: [
        { field: "Certificat de travail", type: "PHOTOSHOPPED_PDF" },
        { field: "Identifiant SIRET", type: "INEXISTANT" }
      ],
      blacklistedEmail: true,
      blacklistedIP: "198.51.100.4"
    },
    createdAt: "27/05/2026, 16:40",
    ipAddress: "192.168.1.12",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    severity: "critical"
  },
  {
    id: "log_9",
    action: "USER_REACTIVATED",
    adminId: "tm_4",
    adminName: "Clara Martinez",
    adminRole: "MODERATOR",
    targetType: "USER",
    targetId: "usr_215",
    targetLabel: "Julie Delorme (julie.delorme@hotmail.fr)",
    reason: "Suspension levée après vérification. Les connexions suspectes étaient dues à l'utilisation d'un VPN professionnel.",
    metadata: {
      userId: "usr_215",
      email: "julie.delorme@hotmail.fr",
      previousStatus: "SUSPENDED",
      currentStatus: "ACTIVE",
      ticketReference: "SUP-84092",
      verificationNote: "L'utilisatrice a confirmé son emplacement physique et son adresse IP résidentielle."
    },
    createdAt: "27/05/2026, 09:20",
    ipAddress: "192.168.3.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    severity: "info"
  },
  {
    id: "log_10",
    action: "ACCESS_REVOKED",
    adminId: "tm_1",
    adminName: "Alexandre Dupuis",
    adminRole: "ADMIN",
    targetType: "USER",
    targetId: "usr_882",
    targetLabel: "Mathieu Valette (mathieu.valette@guest.certilys.fr)",
    reason: "Fin de la période d'accès temporaire octroyée pour l'audit externe de la plateforme.",
    metadata: {
      userId: "usr_882",
      email: "mathieu.valette@guest.certilys.fr",
      revocationType: "TEMPORARY_ACCESS_EXPIRED",
      assignedRoles: ["AUDITOR"],
      revokedAccessesCount: 8,
      durationDaysActive: 14
    },
    createdAt: "26/05/2026, 18:00",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    severity: "warning"
  },
  {
    id: "log_11",
    action: "COURSE_REJECTED",
    adminId: "tm_2",
    adminName: "Sophie Laurent",
    adminRole: "ADMIN",
    targetType: "COURSE",
    targetId: "crs_902",
    targetLabel: "Techniques de Hacking BlackHat 101",
    reason: "Contenu non conforme aux conditions générales d'utilisation. Incitation à des actions illégales sans cadre défensif / éthique.",
    metadata: {
      courseId: "crs_902",
      title: "Techniques de Hacking BlackHat 101",
      instructorId: "inst_45",
      violationCategory: "ILLEGAL_CONTENT",
      reviewerNotes: "Le cours présente comment créer et distribuer des ransomwares sans aucune mention de la défense ou de la remédiation. Contraire à la politique de Certilys.",
      blacklistedCourse: true
    },
    createdAt: "25/05/2026, 11:30",
    ipAddress: "192.168.1.12",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    severity: "critical"
  },
  {
    id: "log_12",
    action: "INSTRUCTOR_CHANGES_REQUESTED",
    adminId: "tm_4",
    adminName: "Clara Martinez",
    adminRole: "MODERATOR",
    targetType: "INSTRUCTOR",
    targetId: "inst_30",
    targetLabel: "Hélène Dubois (helene.dubois@educ-cyber.org)",
    reason: "Manque le justificatif d'enregistrement micro-entrepreneur ou de société valide.",
    metadata: {
      candidateId: "inst_30",
      fullName: "Hélène Dubois",
      email: "helene.dubois@educ-cyber.org",
      missingDocuments: ["KBIS_OR_SIRET_PROOF"],
      statusBefore: "PENDING_REVIEW",
      statusAfter: "CHANGES_REQUESTED"
    },
    createdAt: "24/05/2026, 15:45",
    ipAddress: "192.168.3.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    severity: "info"
  }
];

export const getAuditKpis = (logs: AdminAuditLog[]): AuditKpis => {
  return {
    totalCount: logs.length,
    // Aujourd'hui = contient "29/05/2026"
    todayCount: logs.filter((log) => log.createdAt.includes("29/05/2026")).length,
    criticalCount: logs.filter((log) => log.severity === "critical").length,
    revocationsCount: logs.filter(
      (log) => log.action === "ACCESS_REVOKED" || log.action === "USER_SUSPENDED"
    ).length
  };
};
