# Certilys Admin Panel

Panneau d'administration Next.js 16 pour la plateforme Certilys (e-learning / formation professionnelle).

## Dashboard Certilys (`/dashboard`)

### Composants Dashboard (Mai 2026)

| Composant | Fichier | Description |
|---|---|---|
| Header | `components/certilys-ui/dashboard/admin-dashboard-header.tsx` | Titre, sous-titre, actions (Export CSV, Voir validations) |
| KPI Cards | `components/certilys-ui/dashboard/kpi-cards.tsx` | 4 cartes avec sparklines Bklit Area (CA brut, Formateurs, Formations, Taux de validation) |
| Revenue Chart | `components/certilys-ui/dashboard/revenue-chart.tsx` | Area chart dual-série (CA brut + Commission) sur 30 jours |
| Validation Chart | `components/certilys-ui/dashboard/validation-chart.tsx` | Bar chart recharts (4 séries) hebdomadaire |
| Priority Actions | `components/certilys-ui/dashboard/priority-actions.tsx` | Bloc 5 actions prioritaires avec niveaux d'urgence |
| Recent Orders | `components/certilys-ui/dashboard/recent-orders.tsx` | Tableau des 5 dernières commandes avec statuts |

### Données Mock Dashboard
- `lib/mock/admin-dashboard-data.ts` — Types TypeScript, données mock, formatage `F CFA` (UI) / `XOF` (API)
- **Priority Action "Formateurs en attente"** redirige désormais vers `/dashboard/instructors?status=PENDING`

---

## Page Formateurs (`/dashboard/instructors`) — Ajout Mai 2026

### Routes
| Route | Fichier | Description |
|---|---|---|
| `/dashboard/instructors` | `app/dashboard/instructors/page.tsx` | Liste admin des candidatures formateurs Certilys |
| `/dashboard/instructors/[id]` | `app/dashboard/instructors/[id]/page.tsx` | Dossier complet d'un formateur |

### Architecture
- **Données Mock** : `lib/mock/admin-instructors-data.ts`
  - Types : `InstructorApplication`, `InstructorApplicationStatus`, `InstructorKpi`, `InstructorFilters`
  - Statuts : `NOT_SUBMITTED | PENDING | APPROVED | REJECTED | CHANGES_REQUESTED`
  - 15 candidatures mock avec données réalistes (pays africains + France, spécialités variées)
- **Gestion URL** : `nuqs` (v2.8.9) — paramètre `?status=` synchronisé avec les filtres
- **NuqsAdapter** ajouté dans `app/layout.tsx` (wrapping racine)

### Fonctionnalités Implémentées
- ✅ **Header** : Titre, sous-titre, Export CSV fonctionnel, bouton "Dossiers en attente" (→ `?status=PENDING`)
- ✅ **KPI compacts** (4 cartes) : En attente, Approuvés, Corrections demandées, Rejetés — cliquables pour filtrer
- ✅ **Recherche + filtres** : Composant `SearchFilter` réutilisé (input + entonnoir + Sheet)
  - Filtres : Statut, Spécialité principale, Pays, Période de soumission (date from/to), Dossier complet
- ✅ **Table responsive** : Avatar/initiales, nom, email, badge statut, spécialité, pays, date soumission, formations soumises, actions
- ✅ **Actions avec confirmation** : Approuver, Demander corrections, Rejeter via `DropdownMenu` + `Dialog`
  - Motif obligatoire pour Rejet et Corrections (min. 10 caractères)
  - Audit log simulé : `INSTRUCTOR_APPROVED`, `INSTRUCTOR_CHANGES_REQUESTED`, `INSTRUCTOR_REJECTED`
- ✅ **États UI** : Loading (Skeleton), table vide, aucun résultat, erreur action, loading action, succès optimiste
- ✅ **Accès ADMIN/MODERATOR** : Protégé par le layout dashboard existant
- ✅ **Navigation** : Lien sidebar "Formateurs" mis à jour vers `/dashboard/instructors` avec badge `7`

### Actions Backend (simulées)
```
POST /admin/instructor-applications/:id/approve
POST /admin/instructor-applications/:id/request-changes
POST /admin/instructor-applications/:id/reject
```

### Règles Métier
- Formateur non approuvé = publication interdite (mention dans la page détail)
- Liste = résumé uniquement ; dossier complet dans `/dashboard/instructors/[id]`
- Données sensibles non exposées inutilement

### Dépendances Ajoutées
```
nuqs 2.8.9 — Gestion de l'état URL (query params synchronisés côté client)
```

### Conventions Métier
- **Devise UI** : `1 250 000 F CFA` (formatage `fr-FR`)
- **Devise données/API** : `{ currency: "XOF" }`
- **Routes métier** : `/dashboard/instructors`, `/dashboard/courses`, `/dashboard/orders`, `/dashboard/users`, `/dashboard/audit-logs`

### Librairies Charts
- **Bklit UI** : `@bklit/stat-card-area-01` + `@bklit/stat-card-line-01` (composants `AreaChart`, `Area`, `LineChart`, `Line` basés sur `@visx`)
- **Recharts** : Utilisé pour le Validation Chart (bar chart simple)

### Dépendances Ajoutées
```
@types/d3-array         — Types pour d3-array (requis par Bklit)
@bklit/stat-card-area-01 — Sparkline area cards
@bklit/stat-card-line-01 — Sparkline line cards
```
---

## Page Validation des Formations (`/dashboard/courses`) — Ajout Mai 2026

### Routes
| Route | Fichier | Description |
|---|---|---|
| `/dashboard/courses` | `app/dashboard/courses/page.tsx` | Tableau de bord de validation des formations soumises |
| `/dashboard/courses/[id]` | `app/dashboard/courses/[id]/page.tsx` | Dossier d'évaluation détaillé de la formation |

### Architecture & Données Mock
- **Fichier de Données** : `lib/mock/admin-courses-data.ts`
  - Types : `AdminCourseSubmission`, `CourseSubmissionStatus`, `CourseReviewKpi`, `CourseReviewFilters`, `CourseModule`, `CourseLesson`, `CourseAsset`
  - Statuts : `DRAFT | SUBMITTED | APPROVED | REJECTED | ARCHIVED`
  - 12 formations mock réalistes couvrant diverses disciplines (Design, Développement, Marketing, etc.).
- **Gestion URL** : Synchronisation du paramètre de filtre de statut `?status=` avec `nuqs` (v2.8.9) pour une réactivité optimale et des liens partageables.

### Fonctionnalités Implémentées
- ✅ **Header & Métriques** : Titre explicite, Export CSV fluide et filtré, bouton direct "Formations soumises" (→ `?status=SUBMITTED`).
- ✅ **KPI compacts** (4 cartes interactives) : Soumises, Approuvées, Rejetées/Corrections, Archivées — cliquables pour filtrer instantanément la table.
- ✅ **Recherche + Filtres avancés** : Réutilisation du composant centralisé `SearchFilter` (Sheet).
  - Critères : Statut, Catégorie, Niveau, Formateur, Période de soumission, Prix minimum / maximum.
- ✅ **Table de Soumissions complète** : Titre/Slug/Date de soumission, Formateur, Catégorie, Niveau, Prix, Badge de statut, Actions rapides.
- ✅ **Dossier de Formation Détaillé** :
  - *Résumé* : Titre, sous-titre, slug SEO, formateur (avec état d'approbation), catégorie, niveau, langue, prix/prix promo, date de soumission.
  - *Contenu commercial* : Description complète (alerte de longueur < 50 chars), objectifs/bénéfices, prérequis, public cible.
  - *Médias* : Miniature de la formation, vidéo promotionnelle (avec lecteur natif ou alerte d'absence).
  - *Programme pédagogique* : Accordéon des modules, leçons, statuts d'encodage vidéo, durée, aperçus gratuits, ressources téléchargeables.
  - *Checklist d'évaluation* (9 critères) : Évaluation automatisée de la qualité (titre, description >= 50 chars, prix > 0, catégorie/niveau, modules/leçons existantes, vidéos prêtes, formateur approuvé).
- ✅ **Décisions Administratives avec Audit** :
  - Boutons d'actions contextuels : Approuver (désactivé si critères bloquants manquants), Demander des corrections, Rejeter.
  - Saisie de motif obligatoire (min. 10 caractères) pour rejet ou demande de corrections.
  - Historique de la décision précédente affiché en alerte si existant.
  - Journalisation simulée de l'audit log : `COURSE_APPROVED`, `COURSE_CHANGES_REQUESTED`, `COURSE_REJECTED`.
- ✅ **États d'interface complets** : Squelettes de chargement (Skeletons), table vide, aucun résultat, traitement de l'action avec spinner et messages d'erreur.

### Règles Métier Majeures
- **Blocage de l'approbation** : Si des critères bloquants (ex. formateur non approuvé, pas de leçons dans la formation) ne sont pas satisfaits, le bouton "Approuver" est désactivé et un bandeau d'alerte rouge explicite est affiché.

---

# DIGISAM — Site Web d'Agence Digitale

Projet Next.js 16 avec Tailwind CSS v4 et composants coss UI.

## Stack Technique

| Outil | Version / Détail |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Package Manager | pnpm |
| Styling | Tailwind CSS v4 |
| UI Components | coss UI (basé sur shadcn/ui) |
| Base UI | @base-ui-components/react |
| Fonts | Clash Grotesk (titres) + Satoshi (corps) via Fontshare |
| Animations | framer-motion |

## Composants coss UI

**Installés (31)** — accordion, alert, avatar, badge, breadcrumb, button, card, checkbox, collapsible, combobox, command, dialog, input, input-group, label, meter, pagination, popover, progress, scroll-area, select, separator, sheet, skeleton, slider, switch, table, tabs, textarea, toggle, toggle-group, tooltip, autocomplete

**Non disponibles** — radio, date-picker, file-upload, drawer, sonner, dropdown-menu, navigation-menu, context-menu

## Architecture

> **Note pour les Agents IA** : Consultez le fichier `agents.md` à la racine du projet pour un guide détaillé de la structure et des conventions à suivre. Ce document explique pourquoi chaque choix architectural a été fait et comment travailler efficacement sur ce projet.

### Centralisation des Données
- **Types** : `lib/types/index.ts` — Interfaces TypeScript partagées (Project, Service, TeamMember, etc.)
- **Constantes** : `lib/constants/index.ts` — Données centralisées (NAV_ITEMS, SERVICES, SKILLS, STATS, TEAM_MEMBERS, FOOTER_NAV_LINKS, FOOTER_SERVICES, CONTACT_INFO)
- **Données statiques** : `data/` — Fichiers de données séparés (projects.ts, team.ts, services.ts)

### Hooks Personnalisés
- **useMobileMenu** : Gestion de l'état du menu mobile, lock du body scroll, restauration du focus
- **useReducedMotion** : Détection de la préférence utilisateur pour les animations réduites

### Utilitaires
- **sticker-utils** : Fonctions utilitaires pour les calculs de position des stickers mobiles
- **cn** : Fusion de classes Tailwind (tailwind-merge + clsx)

### Constantes d'Animation
- `lib/constants/animations.ts` : Constantes nommées pour toutes les animations (STICKER_ANIMATION, HERO_ANIMATION, MOBILE_MENU_ANIMATION)

## Accessibilité (WCAG 2.2)

### Implémentations
- **Skip Link** : Lien pour sauter au contenu principal (visible au focus)
- **Landmarks sémantiques** : `role="banner"`, `role="main"`, `role="contentinfo"`, `role="navigation"`
- **Gestion du focus** : Hook `useMobileMenu` avec restauration du focus après fermeture
- **Labels ARIA** : `aria-label` descriptifs pour les boutons et liens
- **Formulaires** : `aria-required`, `aria-invalid`, `aria-describedby`, `noValidate`
- **Live regions** : `role="alert"` et `aria-live="polite"` pour les messages de succès
- **Préférences utilisateur** : Support de `prefers-reduced-motion` dans globals.css et framer-motion
- **Icônes décoratives** : `aria-hidden="true"` sur les icônes non informatives

## Changements Récents

### Améliorations & Corrections du Dashboard Certilys (Mai 2026)
- **Design & Performance CSS (`globals.css`)** :
  - Suppression de la règle `@custom-variant dark` et de tout le bloc `.dark {}` (le panel d'administration étant exclusivement clair pour le moment).
  - Correction des variables de couleurs Bklit mal générées (remplacement de `var(----chart-*)` par `var(--chart-*)`).
- **Visibilité et Rendu des Graphiques** :
  - **Migration Recharts pour Revenue Chart** : Remplacement complet des composants Bklit `AreaChart`/`Area` (qui souffraient d'un bug interne `@visx` tronquant et masquant les courbes) par une implémentation native et robuste en **Recharts pur** (`ResponsiveContainer`, `AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`).
  - **Robustesse Mobile & Resize** : Désactivation des animations internes Recharts (`isAnimationActive={false}`) pour les deux tracés, empêchant tout bug de rendu de tracé et de `clipPath` SVG au redimensionnement ou sur smartphone.
  - **Styles & Visibilité premium** :
    - Tracés nets avec un `strokeWidth` de `2.5` (CA brut) et `2.0` (Commission).
    - Gradients linéaires personnalisés (`caBrutGradient` et `commissionGradient`) avec opacités parfaitement dosées (`0.22` à `0.02` et `0.16` à `0.02`) pour un effet haut de gamme sur fond blanc.
    - Conteneur mesurable fluide de hauteur fixe (`h-[320px] sm:h-[360px]`).
  - **Custom Tooltip haut de gamme** : Développement d'un tooltip Recharts personnalisé assorti au design premium de l'administration (fond sombre `#2a2b2d` via classes `bg-neutral-800`, bordures fines, typographies soignées, points colorés de repères et valeurs monétaires tabulaires alignées formatées en `F CFA`).
- **KPI Cards** :
  - Remplacement de l'effet d'ombre générique `hover:shadow-sm` par un effet discret et haut de gamme : `transition-[border-color,background-color,transform] hover:border-primary/25 hover:bg-primary/[0.015] hover:-translate-y-px`.
  - Intégration de `min-w-0` et `overflow-hidden` sur chaque carte KPI pour prévenir la compression.
  - Utilisation de la police responsive `clamp` (`text-[clamp(1.25rem,2vw,1.75rem)]`) pour la valeur principale.
- **Responsivité Globale** :
  - Remplacement de la grille rigide à 4 colonnes par une grille adaptative auto-fit (`[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]`) offrant une responsivité fluide sur tablette.
- **Optimisation des Images (Warnings Next/Image)** :
  - Correction du logo `/images/logos/cty-lvw.svg` en ajoutant des classes `w-auto h-auto` et un style inline `style={{ width: "auto", height: "auto" }}` afin de supprimer définitivement le warning Next/Image relatif au redimensionnement asymétrique.

### Suppression des Sélecteurs de Test (Mai 2026)
- ✅ **Nettoyage de l'interface** : Retrait de tous les éléments de contrôle de test et de simulation visibles dans l'interface utilisateur pour la mise en production.
- ✅ **Authentification & Invitation** : Suppression définitive du sélecteur de jetons de test sur l'écran d'invitation invalide (`invitation-confirmation.tsx`), garantissant un écran d'erreur propre, sobre et parfaitement centré.
- ✅ **Notifications** : Suppression des boutons de simulation d'états dans la page de notifications (`/dashboard/notifications`).
- ✅ **Sécurité préservée** : Les mocks internes dans les fichiers d'actions (`auth-actions.ts` et `invitation-actions.ts`) sont conservés pour le développement sans être exposés dans l'interface finale.

### Refondu du Layout Dashboard Admin — Finalisation & Corrections UI (Mai 2026)
- ✅ **Renommage des styles** : Passage de `auth-pattern.css` à `patterns.css` pour supporter d'autres motifs et centraliser la gestion des designs de fond.
- ✅ **Sidebar sombre texturée** : Application de la classe `.sidebar-pattern` avec un arrière-plan sombre (`--secondary`) et la texture de fond `black-orchid.png` téléchargée localement. Surcharge complète de tous les éléments internes de la sidebar (textes, boutons actifs, boutons de survol, bordures) pour un rendu premium.
- ✅ **Suppression du double radius / double ombre** : Surcharge des classes par défaut de `Sidebar` et `Sidebar-inner` pour les rendre transparentes sans bordure ni ombre. Le panneau `.sidebar-pattern` enveloppe maintenant l'ensemble de la sidebar avec un `rounded-2xl` et `overflow-hidden` unique et propre.
- ✅ **Axe central parfait en mode collapsed** : Restructuration complète des paddings, largeurs et alignements. Le logo, la recherche (transformée en bouton circulaire simple), les icônes de navigation et le bouton de bascule de footer s'alignent tous parfaitement sur une seule ligne verticale imaginaire.
- ✅ **Suppression du header sur desktop** : Retrait complet du header sur les grands écrans afin de libérer de l'espace et optimiser la zone utile du dashboard d'administration.
- ✅ **Recherche intégrée dans la sidebar** : Déplacement de la recherche desktop dans la sidebar d'administration sous forme de bouton d'appel interactif ouvrant la palette de recherche (`SearchDialog` via raccourci ou clic).
- ✅ **Header mobile allégé** : Conservation uniquement du bouton de recherche sur mobile, offrant une interface mobile extrêmement claire et performante, sans régression.
- ✅ **Nouvelle page de notifications** : Création d'une page de notifications dédiée à `/dashboard/notifications` avec gestion d'états, d'interactions (marquer comme lu, effacer tout) et support de badge de notifications non lues visible directement dans la sidebar.
- ✅ **Nettoyage du template** : Suppression du dossier template obsolète `recipes-db` et restructuration complète de la configuration de navigation dans `dashboard-nav-config.ts` pour refléter les vraies rubriques de Certilys (Tableau de bord, Formations, Formateurs, Utilisateurs, Commandes/Paiements, Notifications, Logs/Audit, Paramètres, Aide).

### Refactorisation Architecture (Phase 1)
- ✅ Création de `lib/types/index.ts` pour les types TypeScript centralisés
- ✅ Création de `lib/constants/index.ts` pour les constantes centralisées (NAV_ITEMS, SERVICES, SKILLS, STATS, TEAM_MEMBERS, FOOTER_NAV_LINKS, FOOTER_SERVICES, CONTACT_INFO)
- ✅ Création de `lib/constants/animations.ts` pour les constantes d'animation nommées
- ✅ Migration des données de `app/_data/` vers `data/` (projects.ts, team.ts, services.ts)
- ✅ Suppression du dossier `app/_data/`
- ✅ Création de `lib/hooks/use-mobile-menu.ts` pour la gestion du menu mobile
- ✅ Création de `lib/hooks/use-reduced-motion.ts` pour la détection des préférences d'animation
- ✅ Création de `lib/utils/sticker-utils.ts` pour les calculs de position mobile

### Code Cleanup (Phase 2)
- ✅ Refactorisation de `navbar.tsx` pour utiliser `useMobileMenu` et `NAV_ITEMS`
- ✅ Refactorisation de `footer.tsx` pour utiliser les constantes centralisées
- ✅ Refactorisation de `about.tsx` pour utiliser `SKILLS`, `STATS`, `SERVICES`, `TEAM_MEMBERS`
- ✅ Refactorisation de `projects-grid.tsx` pour utiliser `data/projects`
- ✅ Refactorisation de `hero.tsx` pour utiliser `STICKER_ANIMATION`, `HERO_ANIMATION`, `getMobileOrigin`, et `useReducedMotion`
- ✅ Élimination des magic numbers dans les animations

### Accessibilité (Phase 3)
- ✅ Ajout du composant `SkipLink` dans `components/ui/skip-link.tsx`
- ✅ Ajout des landmarks sémantiques dans `layout.tsx` (role="banner", role="main", role="contentinfo")
- ✅ Amélioration de `navbar.tsx` avec `aria-label`, `aria-expanded`, `aria-hidden`, et navigation aria-label
- ✅ Amélioration de `footer.tsx` avec `aria-label` sur les navigations
- ✅ Amélioration de `about.tsx` avec `aria-label` descriptifs pour les liens sociaux
- ✅ Ajout du support `prefers-reduced-motion` dans `app/styles/accessibility.css`
- ✅ Implémentation de `useReducedMotion` dans `hero.tsx` pour désactiver les animations selon les préférences
- ✅ Amélioration de `devis-form.tsx` avec `aria-labelledby`, `aria-required`, `aria-invalid`, `aria-describedby`, `noValidate` et `aria-label` descriptifs

### Intégration des Données Réelles du Client (Mai 2026)
- ✅ **Réseaux sociaux** : Ajout de la constante centralisée `SOCIAL_LINKS` pour l'agence DIGISAM (Facebook, LinkedIn, TikTok).
- ✅ **Footer** : Intégration d'icônes de réseaux sociaux premium et accessibles pour Facebook, LinkedIn et TikTok dans le `Footer`.
- ✅ **Projets du Portfolio** : Remplacement des projets fictifs par les projets réels de l'agence dans `data/projects.ts` et `case-studies-list.tsx` :
  - *Gestion & Structuration des réseaux sociaux de GirlsDay237*
  - *Création d’identité visuelle (Logo)*
- ✅ **Témoignages** : Intégration du témoignage client authentique pour le projet de création de logo.

### Refonte de la Navbar et du Hero (Mai 2026)
- ✅ **Nouveaux Composants de Navigation** : Création de `Logo`, `NavMenu` (basé sur le composant `@/components/ui/navigation-menu` existant) et `NavigationSheet` (menu mobile accessible sans dépendance Radix externe).
- ✅ **Barre de Navigation Principale** : Refonte de `navbar.tsx` en utilisant les nouveaux composants de navigation et des actions adaptées en français (boutons "Nos services" et "Demander un devis").
- ✅ **Section Hero** : Refonte de la page d'accueil avec une structure moderne de grille à deux colonnes :
  - Texte percutant en français : *Accompagner, structurer & rendre autonome*
  - Badge cliquable valorisant les réalisations de DIGISAM.
  - Boutons d'actions principaux ("Demander un devis" et "Nos services").
  - Visuel de droite premium avec un effet aurora/glassmorphism (dégradés animés doux et texte de réassurance) pour un rendu haut de gamme exceptionnel ("WOW effect").

### Documentation et Organisation
- ✅ Déplacement des styles additionnels vers `app/styles/` (accessibility.css)
- ✅ Import des styles additionnels dans `globals.css`
- ✅ Création du fichier `agents.md` pour guider les agents IA sur la structure du projet
- ✅ Ajout d'une note dans le README pointant vers `agents.md`

### Fonctionnalités

### Identité Visuelle
- **Typographie** : Clash Grotesk (titres) + Satoshi (corps) — polices Fontshare exclusives
- **Couleurs** : Palette OKLCH complète via variables CSS (`--primary`, `--background`, etc.)
- **Thème** : Mode clair/sombre supporté via CSS variables

### Navbar
- Flottante, centrée, `backdrop-blur`, `border`
- État actif via `usePathname` — fond léger + dot indicateur sous le lien
- Menu mobile plein écran : overlay blur, liens échelonnés, scroll body bloqué
- Items : Accueil · Services · Portfolio · Blog *(en attente de contenu)*
- CTA "Contactez-nous" → `/devis` (point d'entrée unique)

### Hero (Page d'accueil)
- 5 stickers SVG avec **animation de dispersion** au chargement (translations `x/y` via framer-motion, délais échelonnés)
- **Flottement organique** continu sur chaque sticker (motion.div imbriqué, durées différentes)
- **Responsive mobile** : 5 stickers repositionnés (2 haut, 2 bas, 1 bas-centre), tailles réduites à ~44–50px, opacité 0.65, décalés à `top: 18%` pour ne pas être masqués par la navbar

### Pages
| Page | Sections clés |
|---|---|
| `/` | Hero, About, Services preview, Portfolio preview, Process, Testimonials, CTAFinal |
| `/services` | Hero + breadcrumb, Intro philosophie, Liste services (1 featured + 3 cards), Process, CTAFinal |
| `/portfolio` | Hero + breadcrumb, Grille 9 projets, Études de cas (Problème/Solution/Résultat), CTAFinal |
| `/devis` | Hero + breadcrumb, 3 cards réassurance, Formulaire + sidebar sticky, Testimonials |

### Formulaire de Devis (`/devis`)
- Champs : nom, email, téléphone, projet, type de service, budget, description
- `useState` pour confirmation post-soumission (pas de backend — simulation visuelle)
- Sidebar sticky (`lg:sticky lg:top-28`) avec coordonnées de contact et indicateur de disponibilité
- `CTAFinal` remplacé par `Testimonials` pour renforcer la confiance après soumission

### Footer
- Arrondi supérieur `rounded-t-[2.5rem]` — effet "carte posée"
- 4 colonnes : Identité + contact · Navigation · Services · CTA
- Items navigation : Accueil · Services · Portfolio · Blog
- CTA "Demander un devis" → `/devis`
- Copyright dynamique (`new Date().getFullYear()`)
- Indicateur de disponibilité pulsé

### ScrollToTop
- Bouton fixe (`fixed bottom-6 right-6`) apparaissant uniquement après un scroll de 300px.
- Animation fluide d'apparition et de disparition (opacité et translation sur l'axe Y).
- Remontée en douceur (`smooth scroll`) vers le haut de la page au clic.
- Design cohérent avec l'identité DIGISAM : `bg-primary`, `rounded-xl`, icône `ArrowUp`.

## Démarrage

```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

## Ajouter un composant coss UI

```bash
pnpm dlx shadcn@latest add https://coss.com/ui/r/[nom-du-composant].json
```

## Architecture des Données

- **Centralisation** : Les données sont maintenant centralisées dans le dossier `data/` à la racine du projet :
  - `data/projects.ts` — Projets du portfolio
  - `data/team.ts` — Membres de l'équipe
  - `data/services.ts` — Services proposés
- **Types centralisés** : `lib/types/index.ts` contient toutes les interfaces TypeScript partagées
- **Constantes centralisées** : `lib/constants/index.ts` contient toutes les constantes réutilisables (NAV_ITEMS, SERVICES, SKILLS, STATS, TEAM_MEMBERS, etc.)
- **Composant Réutilisable** : `ProjectsGrid` (dans `components/dgsComponents/`) gère l'affichage flexible des projets avec une prop `limit` optionnelle. Il est utilisé à la fois sur la page d'accueil (`limit={6}`) et sur la page portfolio (affichage complet).

## Déploiement

Compatible Vercel et toute plateforme Next.js standard.  
Les erreurs d'installation des composants sont loguées dans `coss-install-errors.log`.