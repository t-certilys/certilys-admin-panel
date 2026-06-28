# Spec API — Remboursements & période de blocage

Contrat backend pour gérer les remboursements **enregistrés à la main** par
l'équipe finance, et protéger les versements aux formateurs.

> **Principe** : le remboursement de l'argent est fait **manuellement** par
> l'équipe finance sur la passerelle (Paygride / Moneroo). Certilys n'automatise
> PAS le mouvement d'argent. L'admin **enregistre** ensuite le remboursement dans
> le système → c'est ce qui déclenche la comptabilité (écriture inverse, accès
> révoqué, dashboard formateur à jour). Complète `PAYOUTS-API-SPEC.md`.

---

## 1. Ce qui existe déjà (vérifié dans le backend déployé)

Le modèle de données est **prêt**, il manque la logique :
- `OrderStatus` / `PaymentStatus` / `LearnerCoursePaymentStatus` ont **`REFUNDED`**
- `LearnerCourseAccessStatus` a **`REVOKED`**
- `LedgerEntryType` a **`REFUND`** (l'écriture inverse) + `INSTRUCTOR_EARNING`,
  `CERTILYS_COMMISSION`, `COURSE_SALE`, `PAYOUT`, `ADJUSTMENT`
- `Orders.refundedAt` existe
- `InstructorLedgerEntries` : `instructorId`, `orderId`, `paymentId`, `type`,
  `amount` (BigInt), `currency`, `metadata`, `createdAt`

**Manque** : aucune route de remboursement, aucune logique d'écriture inverse,
**et surtout aucun champ de période de blocage** sur le ledger.

---

## 2. La période de blocage (le garde-fou — À AJOUTER)

C'est le point le plus important. Sans ça, un formateur peut retirer l'argent
**avant** que l'équipe finance n'ait traité un remboursement → argent perdu.

### Pourquoi 14 jours (base retenue, vérifiée juin 2026)

Le délai n'est **pas imposé par la BCEAO**. Les textes UEMOA
(Instruction n°001-01-2024 sur les services de paiement) encadrent l'agrément
des prestataires (Paygride, etc.), **pas** une durée de blocage des fonds d'une
marketplace. C'est donc une **décision business** de Certilys, calée sur trois
horloges :

| Horloge | Durée | Source |
|---|---|---|
| Politique « satisfait ou remboursé » apprenant | **14 j** (notre choix) | Certilys (norme marché : Coursera 14 j, Udemy 30 j) |
| Fenêtre de reversal Mobile Money | 30 j | MTN MoMo (annulation possible jusqu'à 30 j) |
| Chargeback carte Visa/Mastercard | jusqu'à 120 j | Réseaux internationaux |

**Règle d'or : on ne verse jamais au formateur avant la fin du délai de
remboursement apprenant.** D'où `REFUND_HOLD_DAYS = 14` : c'est exactement la
durée de la promesse « remboursé sous 14 jours », et c'est bien à l'intérieur de
la fenêtre Mobile Money (30 j), qui sera le gros du volume.

> **Angle mort cartes** : un chargeback carte peut tomber jusqu'à 120 j après.
> On ne bloque PAS 120 j (ça tuerait la trésorerie formateur). Le risque
> résiduel au-delà de 14 j se gère par une **réserve roulante** ou un
> **clawback sur gains futurs** (`needsClawback`, §3), pas par un blocage long.

### Migration
Ajouter à `InstructorLedgerEntries` :
```prisma
availableAt  DateTime?   // pour les INSTRUCTOR_EARNING : createdAt + délai de blocage
```
À la création d'une écriture `INSTRUCTOR_EARNING` (lors d'une vente), poser
`availableAt = createdAt + REFUND_HOLD_DAYS` (ex. **14 jours**, configurable via
env `REFUND_HOLD_DAYS`). Les écritures `REFUND` / `PAYOUT` / `ADJUSTMENT`
s'appliquent immédiatement (`availableAt = null` = effet immédiat).

### Calcul des soldes (pour `GET /me/affiliate/balance` & la page reversements)
Pour un formateur (toutes ses écritures, signe : EARNING +, REFUND −, PAYOUT −) :
- **Solde en attente** = Σ `INSTRUCTOR_EARNING` non remboursés dont `availableAt > now()`
- **Solde disponible** = (Σ `INSTRUCTOR_EARNING` dont `availableAt <= now()`)
  − Σ `PAYOUT` − Σ `REFUND` appliqués
- **Un versement (`POST /me/payouts`) ne peut puiser que dans le solde disponible.**

> Effet : pendant la fenêtre de remboursement, les gains sont « en attente » et
> NON retirables. Quand la finance enregistre un remboursement, l'argent du
> formateur est encore bloqué → la déduction se fait sans clawback.

---

## 2bis. Versement automatique mensuel (à date fixe)

En plus du retrait à la demande, Certilys verse automatiquement **une fois par
mois, à date fixe** (ex. le **1er**, configurable via `PAYOUT_RUN_DAY`).

**Règle** : le run mensuel ne paie que le **solde disponible** de chaque
formateur, c'est-à-dire uniquement les gains dont le blocage de 14 j est écoulé
(`availableAt <= now()`) et non remboursés. Les gains encore « en attente »
**ne partent pas** ce mois-ci, ils basculent au run suivant.

> Conséquence normale : une vente du 25 du mois n'a pas fini ses 14 j au 1er
> suivant → elle attend le run d'après. Le découpage « en attente / disponible »
> (§2) gère ça tout seul, aucune logique de date en plus n'est nécessaire.

**Garde-fous du run** :
- Ne créer un `PAYOUT` que si le disponible ≥ `MIN_PAYOUT` (ex. 5 000 XOF),
  sinon reporter au mois suivant.
- Un moyen de versement valide doit être enregistré (Mobile Money ou virement) ;
  sinon, mettre le formateur en attente et notifier.
- Idempotence : un seul run par (formateur, période) ; reprise sûre en cas
  d'échec partiel (transaction par formateur).
- Détail de cadence/décaissement à porter aussi dans `PAYOUTS-API-SPEC.md`.

---

## 3. Endpoint ADMIN — enregistrer un remboursement

> ⚠️ N'effectue AUCUN mouvement d'argent (déjà fait à la main sur la passerelle).
> Cet endpoint ne fait que **synchroniser la comptabilité**.

### `POST /admin/orders/:id/refund`
Auth ADMIN + CSRF. Body :
```json
{ "reason": "Demande client sous 24h", "amount": 120000 }
```
`amount` optionnel (défaut = total de la commande ; permet le remboursement
partiel plus tard).

**Garde-fous** :
- La commande doit être `PAID`. `409` si déjà `REFUNDED` (idempotent).
- Si la part formateur a **déjà été versée** (`PAYOUT` réglé sur cette vente) →
  ne pas bloquer mais **signaler** dans la réponse (`needsClawback: true`) pour
  traitement manuel. La période de blocage doit rendre ce cas rare.

**Effets (dans une transaction)** :
1. `Orders.status = REFUNDED`, `Orders.refundedAt = now()`
2. `Payments.status = REFUNDED`
3. Accès apprenant : `LearnerCourseAccesses.status = REVOKED`,
   `LearnerCoursePaymentStatus = REFUNDED`
4. Écriture ledger **`REFUND`** liée à `orderId` : `amount = −(part nette formateur)`
   (annule l'`INSTRUCTOR_EARNING` de cette vente). Idéalement aussi une écriture
   qui annule la `CERTILYS_COMMISSION` pour la compta plateforme.
5. Entrée dans `AdminAuditLogs` (qui, quand, motif).

Réponse :
```json
{ "order": AdminOrder, "needsClawback": false }
```

---

## 4. Côté front (ce que je prototype dans le B)

- **Admin** (`/dashboard/orders/[id]`) : bouton **« Marquer comme remboursé »**
  (confirmation + champ motif) → `POST /admin/orders/:id/refund`. La commande
  passe en « Remboursée », la part formateur affichée comme déduite.
- **Formateur** (`/dashboard/instructor/affiliate` & ventes) :
  - solde **« En attente »** vs **« Disponible »** (au lieu d'un solde à plat)
  - les ventes remboursées affichées **« Remboursée »** avec le montant déduit
  - le bouton « Demander un versement » plafonné au **solde disponible** seulement

---

## 5. Rappels
- Le remboursement monétaire reste **100 % manuel** (passerelle). Cet endpoint =
  enregistrement comptable uniquement.
- La **période de blocage** est le vrai garde-fou : sans elle, le reste ne
  protège pas contre le versement d'une vente remboursée.
- Tout est transactionnel : statut + accès + ledger doivent réussir ensemble.
