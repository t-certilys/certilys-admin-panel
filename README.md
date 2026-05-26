This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Dernières Mises à Jour

- **Alignement de la Charte Graphique (Thème oklch & Fontes Inter/Sora)** :
  - Intégration de la palette de couleurs moderne définie sous format `oklch` dans le fichier `globals.css` (Background, Primary, Secondary, Accent, Muted, Destructive et Sidebar).
  - Chargement et configuration des Google Fonts **Inter** (pour le texte général) et **Sora** (pour tous les titres h1-h6) via `next/font/google` et injectées dans la balise `<html>`.
  - Préservation intégrale du contexte fonctionnel de l'administration (dialogues de raccourcis, commandes et recherche).

- **Renommage Officiel en Certilys & Résolution du Build** :
  - Remplacement global de l'ancienne marque `Adun`/`ADUN` par **Certilys** à travers toute la base de code, y compris les textes visibles, la configuration de marque, et le composant Logo.
  - Renommage du dossier de composants de `components/adun-ui` vers `components/certilys-ui` et mise à jour dynamique de tous les imports associés dans le projet.
  - Intégration des logos officiels : utilisation du logo complet `/images/logos/cty-lvb.svg` (et sa version blanche `/images/logos/cty-lvw.svg`) pour la sidebar ouverte, et de l'icône de logo officielle `/images/icons/cty-i.svg` pour le format rétracté de la sidebar.
  - Correction de l'erreur d'importation dans `settings-bottom-drawer.tsx` : exportation propre de `settingsNavMain` (configuration des items de paramètres) et `backToDashboard` (lien retour dashboard) depuis `lib/settings-nav-config.ts`, permettant une compilation parfaite sans erreur de type TypeScript.
  - Renommé le package global en `certilys-admin-panel` dans `package.json`.

- **Correction de la Largeur de la Modal de Recherche** : Résolution du problème de plafonnement de la largeur de la modal dû aux classes `max-w-*` internes de Shadcn. Utilisation du modificateur `!` (important) pour fixer une largeur optimale de **720px**, offrant un compromis idéal entre lisibilité et encombrement sur tous types d'écrans.

- **Accessibilité et Icônes de Recherche** : Finalisation de la modal de recherche. Unification des icônes avec `HugeIcons` pour une cohérence totale avec le reste de l'interface. Ajout de titres et descriptions invisibles (`sr-only`) pour garantir une accessibilité parfaite (conformité Radix UI) sans impacter le design visuel.
- **Refonte de la Modal de Recherche (SearchDialog)** : Refonte complète de l'interface de recherche. Nouvelle structure en trois zones (en-tête fixe, zone de résultats défilante, pied de page avec raccourcis). Ajout de la navigation au clavier (flèches + Entrée), des recherches récentes et d'une organisation des résultats par catégories (Pages, Documents). Le design est optimisé pour être "pixel-parfait" sur tous les terminaux.
- **Réactivité Mobile Avancée pour les Raccourcis** : Optimisation finale du composant `ShortcutsList`. Les items passent désormais en mode colonne (`flex-col`) sur mobile pour éviter tout débordement des touches `Kbd`. Ajout d'un alignement visuel sous le texte (`pl-11`) et de `flex-wrap` pour une lisibilité parfaite sur tous les terminaux.
- **Informations Système sur la Page d'Aide** : Remplacement de la carte "Besoin d'assistance ?" par une carte "À propos du système" plus adaptée à un panel d'administration. Elle affiche la version de l'app, l'environnement (`Développement`/`Production`), la date d'adhésion et un lien direct vers le dépôt GitHub.
- **Raffinement du Design des Raccourcis** : Refonte visuelle des composants de raccourcis. Suppression systématique des ombres (`shadow-sm`) pour un look plus "flat" et moderne. Le composant `ShortcutsList` est désormais plus compact (`py-2.5`, icônes réduites) et utilise un fond `bg-muted/30`. La page d'aide a été simplifiée avec des titres plus sobres (`font-semibold`) et l'utilisation standard du composant `Button`.
- **Page d'Aide et Liste des Raccourcis** : Création de la page d'aide (`/dashboard/help`) contenant le nouveau composant `ShortcutsList`. Ce composant affiche de manière élégante tous les raccourcis clavier disponibles dans l'application.
- **Modal de Raccourcis (Maintenir Ctrl+Alt+O)** : Implémentation d'une fonctionnalité permettant d'afficher la liste des raccourcis à tout moment via une modal (`ShortcutsDialog`). Cette modal s'ouvre lorsqu'on appuie sur `Ctrl+Alt+O` et reste visible tant que les touches `Ctrl` et `Alt` sont maintenues enfoncées. Elle se ferme automatiquement dès le relâchement d'une de ces touches.
- **Raccourcis Clavier pour le Thème (Ctrl+Shift+L / Ctrl+Shift+D)** : Ajout de raccourcis clavier globaux pour basculer rapidement entre les modes clair et sombre. `Ctrl+Shift+L` force le mode clair, tandis que `Ctrl+Shift+D` force le mode sombre. La détection des touches a été implémentée dans `components/providers/command-provider.tsx` et est indépendante de la casse.
- **Correction du Contexte de la Modal de Recherche (CommandDialog)** : Résolution de l'erreur d'exécution (`TypeError: can't access property "subscribe", o is undefined`) qui survenait à l'ouverture de la modal de recherche. Le composant `CommandDialog` dans `components/ui/command.tsx` a été corrigé pour encapsuler correctement ses enfants avec le composant `<Command>`, fournissant ainsi le contexte nécessaire à `CommandInput` et `cmdk`.
- **Activation du Raccourci de Recherche (Ctrl+K)** : Correction de l'impossibilité d'ouvrir la modal de recherche via le raccourci clavier. Le `SearchDialog` et le `QuickCreateDialog` ont été ajoutés au layout racine (`app/layout.tsx`) pour être rendus globalement. La logique de détection dans `command-provider.tsx` a été améliorée pour supporter à la fois les touches 'k' minuscule et 'K' majuscule avec `Ctrl` ou `Cmd`.

- **Centralisation de la Navigation** : Restructuration complète de la configuration de navigation dans `lib/dashboard-nav-config.ts`. Toutes les options de navigation sont désormais regroupées dans un unique tableau `dashboardNavConfig` contenant les groupes (`Home`, `Support`). Le bloc `Documents`, qui était superflu, a été supprimé. Chaque élément supporte un label long (`title`) utilisé dans la sidebar desktop et le drawer mobile, ainsi qu'un label court optionnel (`shortTitle`) utilisé exclusivement dans la bottom navigation pour éviter les débordements de texte. La bottom navigation tire désormais dynamiquement ses 4 premières icônes de tous les groupes confondus, afin de remplir parfaitement la grille de 5 colonnes avec le bouton "Menu". `AppSidebar`, `BottomNav`, et `BottomDrawer` parcourent dynamiquement cette unique source de vérité pour garantir une synchronisation et une cohérence totales sur toutes les tailles d'écran.
- **Centrage de l'Icône Sidebar Rétractée** : Correction du décalage sur l'axe X de l'icône de la barre latérale dans `components/layout/app-sidebar.tsx`. Ajustement du composant `SidebarFooter` avec `group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center` pour supprimer le padding horizontal lorsque la barre latérale est rétractée, permettant à l'icône de se centrer parfaitement comme les autres éléments de navigation.
- **Refonte de la Popover Profil Utilisateur** : Modification complète du composant NavUser dans `components/layout/nav-user.tsx`. La popover s'ouvre désormais au-dessus du composant utilisateur à l'intérieur de la sidebar (side="top", align="start") avec des dimensions ajustées pour éviter tout débordement. Retrait de l'affichage du nom et de l'email dans la popover. Conservation de "Paramètres du profil", de la version de l'application, de la date d'ajout de l'utilisateur à l'équipe, et des liens externes vers les conditions d'usage et la documentation de l'API. L'option de déconnexion utilise désormais la couleur d'accent du thème pour le survol (hover:bg-accent hover:text-accent-foreground) au lieu de la couleur verte.
- **Réorganisation des Pages Dashboard** : Réorganisation de la structure des pages du dashboard. La page Lifecycle précédente est devenue la page de gestion des équipes (Equipes) avec un tableau adapté pour gérer les équipes (nom, rôle, status, nombre de membres, responsable). La page Base des recettes a été créée avec le tableau de données précédemment situé sur le dashboard principal. Le dashboard principal ne contient plus que les statistiques (SectionCards) et le graphique interactif (ChartAreaInteractive). Le dossier `app/dashboard/lifecycle` a été renommé en `app/dashboard/team`, et le dossier `app/dashboard/recipes-db` a été créé pour la Base des recettes (route `/dashboard/recipes-db`).
- **Correction des Paddings DataTable** : Retrait des paddings internes (px-4 lg:px-6) du composant DataTable dans `components/certilys-ui/dashboard/data-table.tsx` pour aligner correctement le tableau avec le titre et la description de la page, éliminant le décalage visuel.
- **Correction de l'Erreur d'Hydration (ThemeToggle)** : Correction de l'erreur d'hydration dans `components/providers/theme-provider.tsx` en rendant l'attribut `disabled` explicite avec `disabled={true}` au lieu de `disabled` seul, garantissant la cohérence entre le rendu serveur et client.
- **Agrandissement du Logo Sidebar Rétractée** : Augmentation de la taille du logo dans la sidebar rétractée de 38x38 à 52x52 pixels dans `components/layout/app-sidebar.tsx`, et modification du viewBox des fichiers SVG (`anl-vw.svg` et `anl-vb.svg`) de `0 0 1024 1024` à `230 190 580 620` pour supprimer le vide autour du logo et le faire remplir l'espace disponible.
- **Renommage du CommandPaletteProvider** : Renommage du fichier `components/providers/use-command-palette.tsx` vers `components/providers/command-provider.tsx` pour une meilleure cohérence de nommage. Le `CommandPaletteProvider` gère l'état global des dialogues de recherche et de création rapide, ainsi que le raccourci clavier `Ctrl/Cmd+K` pour ouvrir la recherche globale.
- **Suppression des Transitions de Thème** : Suppression de l'animation de ripple et de toutes les transitions CSS lors du changement entre mode clair et mode sombre dans `components/layout/theme-toggle.tsx`. Le changement de thème est maintenant immédiat sans effet de transition.
- **Composant Logo et Branding** : Correction de la logique thématique dans `components/certilys-ui/logo.tsx` (Sombre -> VW/Blanc, Clair -> VB/Noir). Optimisation de la variante `collapsed` (28x28) pour la barre latérale rétractée. Remplacement de l'icône de caméra générique par ce nouveau logo sur toutes les interfaces (Auth, Sidebar, Drawer).
- **Navigation Mobile et Visibilité** : Déplacement de `BottomNav` et `BottomDrawer` en dehors du `SidebarProvider` dans `DashboardLayout` pour garantir leur visibilité sur mobile. Extension du point d'arrêt de visibilité de la navigation inférieure jusqu'à `lg` pour un support tablette amélioré.
- **Traduction de l'Interface Utilisateur** : Traduction complète de l'interface utilisateur de l'anglais vers le français. Mise à jour des composants d'authentification (forms de login, forgot password), du dashboard (chart-area-interactive, dashboard-nav-config, section-cards), et de la sidebar (app-sidebar). Adaptation des labels, descriptions, messages et tooltips. Suppression des pages et composants de signup non utilisés. Renommage de la marque "Murgo Dash." vers "Certilys Dash.". Réorganisation des assets d'images (avatars déplacés de public/avatars vers public/images/avatars).
- **Page de Confirmation d'Invitation** : Création d'une page de confirmation sur la page d'accueil pour accepter ou rejeter une invitation à rejoindre l'équipe Certilys. Suppression de la redirection automatique vers `/auth/login` dans `app/page.tsx`. Création du composant `InvitationConfirmation` dans `components/invitation/invitation-confirmation.tsx` avec layout split-screen moderne (illustration SVG Invite-cuate.svg à gauche centrée sur les axes X et Y, contenu sur fond noir à droite), sans ombres ni dégradés. Le design inclut un titre accrocheur, un message d'introduction, une liste des avantages d'administrateur (gestion des recettes et des utilisateurs), et des boutons d'action stylisés. Création des actions serveur dans `lib/invitation-actions.ts` pour gérer les opérations d'invitation (récupération, acceptation, rejet). Les endpoints API sont à implémenter (actuellement mockés). Redirection automatique désactivée pour le développement front-end afin de permettre l'accès à la page d'accueil.
- **Correction de l'État Actif de la Sidebar** : Correction du composant `SidebarMenuButton` dans `components/ui/sidebar.tsx`. Le problème était que l'attribut `data-active={false}` était rendu comme `data-active="false"` dans le DOM, et le sélecteur Tailwind `data-active:` s'applique dès que l'attribut existe (quelle que soit sa valeur). Correction : utiliser `data-active={isActive || undefined}` pour ne mettre l'attribut que quand `isActive` est `true`.
- **Correction d'Erreur de Script Tag** : Création d'un composant `ThemeProvider` client-side dans `components/providers/theme-provider.tsx` avec la configuration correcte de next-themes (disableTransitionOnChange) pour résoudre l'erreur de script tag.
- **Correction d'Erreur d'Hydration (Chart)** : Séparation du contenu du graphique dans `chart-area-content.tsx` et utilisation de dynamic import avec `ssr: false` dans `chart-area-interactive.tsx` pour éviter les erreurs d'hydration causées par recharts.
- **Correction d'Erreur d'Export (DialogBody)** : Ajout et exportation du composant `DialogBody` dans `components/ui/dialog.tsx`, requis par le Dashboard et les dialogues de création rapide.
- **Correction d'Erreur de Build (Form)** : Résolution de l'erreur `Module not found: Can't resolve '@/components/ui/form'`. Le composant `form.tsx` a été recréé avec un support complet de TypeScript (forwardRef).
- **Correction d'Erreur de Build (Form)** : Résolution de l'erreur `Module not found: Can't resolve '@/components/ui/form'`. Le composant `form.tsx` a été recréé avec un support complet de TypeScript (forwardRef).
- **Stabilisation des Graphiques (Chart)** : Correction d'une erreur de type `TooltipValueType` dans `components/ui/chart.tsx` pour assurer la compatibilité avec recharts v2.x.
- **Nettoyage CSS** : Suppression d'un import invalide `shadcn/tailwind.css` in `globals.css` qui bloquait le build Tailwind CSS v4.
- **Installation du Template d'Authentification** : Installation du template d'authentification depuis le registry shadcn personnalisé. Les pages de login et signup sont maintenant dans `app/auth/login` et `app/auth/signup`.
- **Installation de Murgodash Full** : Installation réussie du template complet incluant Dashboard et Settings.
- **Stabilisation des Dépendances** : Correction finale des versions erronées dans `package.json` générées par le CLI shadcn (notamment `recharts`, `@tanstack/react-table`, `@types/react` et `react-phone-number-input`).
- **Correction des Polices (Font Fix)** : Résolution du problème d'affichage Serif. La police **Geist Sans** est désormais correctement appliquée via Tailwind v4.
- **Optimisation des Avatars** : Suppression de l'effet grayscale et implémentation de fallbacks dynamiques basés sur le nom de l'utilisateur.
- **Providers Système** : Configuration de `ThemeProvider`, `TooltipProvider` et `CommandPaletteProvider`.
- **Correction des Composants Manquants** : Création des composants `PaymentMethods`, `AddonInput` et `CharacterCounter` manquants.

## Installation Complémentaire

Si ce n'est pas déjà fait :

```bash
pnpm add next-themes @hugeicons/core-free-icons
```
