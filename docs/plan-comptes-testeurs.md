# Comptes testeurs et formateurs masques

## Objectif

Permettre a l'administration de creer un espace de test sans exposer ses formations au catalogue public. Un apprenant designe comme testeur peut voir les formations des formateurs masques et recevoir un acces offert sans creer de commande financiere.

## Decisions de conception

- Le statut testeur est un attribut de `Users`, pas une nouvelle valeur de `Role`.
- Le masquage est porte par `Instructors` et s'applique a toutes ses formations.
- Les visiteurs anonymes et les apprenants ordinaires ne voient pas les formations masquees.
- Un apprenant testeur voit les formations masquees qui restent dans un statut catalogue (`APPROVED` ou `PUBLISHED`).
- Une formation offerte est un acces `LearnerCourseAccesses` actif, sans `Order`, avec l'administrateur a l'origine du grant conserve pour l'audit.

## Implementation realisee

### Backend

- Ajout de `Users.isTester`, `testerDesignatedAt` et `testerDesignatedById`.
- Ajout de `Instructors.isHiddenFromCatalog`, `hiddenFromCatalogAt` et `hiddenFromCatalogById`.
- Ajout de `LearnerCourseAccesses.grantedByAdminId`.
- Ajout des routes admin pour designer ou retirer le statut testeur.
- Ajout des routes admin pour offrir ou retirer une formation.
- Ajout de la route admin de visibilite catalogue d'un formateur.
- Toutes les mutations sont controlees par la session admin et journalisees.
- Ajout d'une authentification optionnelle sur le catalogue public.
- Filtrage des formateurs masques pour les visiteurs et les apprenants ordinaires.
- Exposition de `isTester` dans `/me` et les reponses admin.

### Admin panel

- Ajout des server actions pour le statut testeur, les grants et la visibilite catalogue.
- Ajout du badge `Testeur` dans la liste des utilisateurs.

### Webapp

- Ajout de `isTester` au type de session utilisateur.

## Travail restant

1. Ajouter dans la fiche utilisateur les controles UI de designation, de retrait et de gestion des formations offertes.
2. Ajouter dans la fiche formateur le controle de masquage et de republication catalogue.
3. Ajouter les tests d'integration HTTP couvrant les roles, le catalogue, les grants et les revocations.
4. Ajouter un seed de comptes de test reproductible.
5. Regulariser la migration manquante `20260911102217_harden_user_delete_rules` dans l'historique local avant une prochaine migration Prisma automatique.

## Verification effectuee

- `pnpm prisma validate`
- `pnpm check-types` backend
- `pnpm exec tsc --noEmit` admin panel
- 9 suites backend ciblees, 88 tests reussis
- Migration additive appliquee sur PostgreSQL local sans reset
