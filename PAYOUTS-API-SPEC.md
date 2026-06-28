# Spec API — Reversements formateurs

Contrat backend à implémenter pour rendre fonctionnelle la page admin
`/dashboard/payouts` (côté formateur : la demande de versement depuis le
dashboard affiliation de `certilys-webapp`).

> **État actuel** : l'UI admin est terminée et tourne sur des données mock
> (`lib/mock/admin-payouts-data.ts`), comme les autres domaines. Pour la rendre
> réelle : (1) ces endpoints, puis (2) remplacer les imports mock par des appels
> via `lib/admin-api.ts` (`adminGet` / `adminMutation`).

---

## 1. Modèle de données

Table `payouts` (s'appuie sur le `InstructorLedgerEntries` déjà présent en base) :

| Champ            | Type        | Notes                                                   |
|------------------|-------------|---------------------------------------------------------|
| `id`             | uuid (PK)   |                                                         |
| `instructor_id`  | uuid (FK)   | → Instructors                                           |
| `amount`         | int         | montant demandé, en XOF (≤ solde disponible)            |
| `method`         | enum        | `MOBILE_MONEY` \| `BANK_TRANSFER`                        |
| `account`        | text        | numéro Mobile Money / RIB (stocké masqué à l'affichage) |
| `status`         | enum        | `PENDING` \| `PAID` \| `REJECTED`                        |
| `requested_at`   | timestamptz |                                                         |
| `processed_at`   | timestamptz NULL | date de validation / rejet                         |
| `processed_by`   | uuid NULL   | admin ayant traité                                      |
| `reject_reason`  | text NULL   |                                                         |

### Coordonnées de versement (selon `method`)

Les coordonnées doivent être stockées (idéalement dans le profil formateur, posées
une fois) et renvoyées avec chaque demande pour que l'admin sache où payer :

- **`MOBILE_MONEY`** : `network` (MTN / Moov / Orange / Wave / Free Money…) +
  `phone` (numéro au format international, ex. `+229 …`).
- **`BANK_TRANSFER`** (zone UEMOA) : `holder` (titulaire exact) + `bankName` +
  `iban` (27–28 caractères, commence par le code pays : BJ, CI, SN, TG, BF, ML…)
  + `bic` (BIC/SWIFT, 8 ou 11 caractères). L'IBAN seul ne suffit pas : valider le
  format IBAN (clé de contrôle) et exiger le BIC avant tout décaissement.

Règle clé : `amount` doit être **≥ seuil minimum** (ex. 5 000 XOF) et **≤ solde
disponible** du formateur. Le **solde disponible exclut les gains encore en
période de blocage** (14 j après la vente, `availableAt > now()`) : voir le
calcul des soldes et le garde-fou dans `REFUNDS-API-SPEC.md` §2. On ne verse
jamais un gain tant que la fenêtre de remboursement apprenant (14 j) n'est pas
écoulée.

---

## 2. Endpoints FORMATEUR (auth formateur)

### `GET /me/affiliate/balance`
Renvoie le solde disponible et l'historique court.
```json
{ "available": 312000, "currency": "XOF", "minPayout": 5000, "paidThisMonth": 678000 }
```

### `POST /me/payouts`
Crée une demande de versement (statut `PENDING`).
```json
// req
{ "amount": 100000, "method": "MOBILE_MONEY" }
// res
{ "payout": Payout }   // 400 si amount < min ou > solde disponible
```

### `GET /me/payouts`
Historique des demandes du formateur connecté.

---

## 3. Endpoints ADMIN (auth ADMIN/MODERATOR + CSRF, comme le reste du panneau)

### `GET /admin/payouts`
Liste toutes les demandes (filtrable `?status=PENDING|PAID|REJECTED`).
```json
{ "payouts": [ AdminPayout, ... ] }
```

### `POST /admin/payouts/:id/approve`
Valide la demande : passe en `PAID`, renseigne `processed_at` / `processed_by`,
**et déclenche le décaissement réel** (voir §4).
```json
{ "payout": AdminPayout }   // 409 si déjà traité
```

### `POST /admin/payouts/:id/reject`
Rejette la demande (`REJECTED` + `reject_reason`), et **recrédite** le solde du
formateur.
```json
// req
{ "reason": "Coordonnées Mobile Money invalides" }
// res
{ "payout": AdminPayout }
```

---

## 3bis. Versement automatique mensuel (run planifié)

En plus du retrait à la demande (§2), un job planifié verse automatiquement
**une fois par mois à date fixe** (`PAYOUT_RUN_DAY`, ex. le 1er).

Pour chaque formateur, le run :
1. calcule le **solde disponible** (gains hors blocage 14 j, voir
   `REFUNDS-API-SPEC.md` §2) ;
2. si disponible **≥ `MIN_PAYOUT`** et qu'un **moyen de versement valide** existe,
   crée un `payout` (`status = PENDING`) puis suit le flux de décaissement (§4) ;
   sinon, **reporte au mois suivant** (et notifie si moyen manquant) ;
3. n'inclut **jamais** les gains encore « en attente » : ils basculent au run
   suivant une fois leurs 14 j écoulés.

Garde-fous : **idempotence** (un seul run par formateur et par période, reprise
sûre), transaction par formateur, et journalisation (montant, période, écriture
ledger `PAYOUT`).

---

## 4. Décaissement Mobile Money

Le `approve` doit déclencher le **payout sortant** vers le numéro du formateur.
À confirmer selon le provider : Paygride gère-t-il les *payouts* (disbursements)
sortants, ou faut-il un autre service ? Prévoir l'idempotence + un webhook de
confirmation de décaissement qui repasse le statut à `PAID` seulement une fois le
transfert réellement effectué (ou `PENDING_DISBURSEMENT` entre les deux).

---

## 5. Côté front : bascule mock → API (TODO une fois le backend prêt)

Panneau admin : remplacer dans `payouts-page.tsx` les imports depuis
`lib/mock/admin-payouts-data.ts` par un service `lib/payouts-actions.ts` :
```ts
"use server";
import { adminGet, adminMutation } from "@/lib/admin-api";

export const listPayouts    = (q = "")        => adminGet(`/admin/payouts${q}`);
export const approvePayout  = (id: string)    => adminMutation(`/admin/payouts/${id}/approve`, {});
export const rejectPayout   = (id, reason)    => adminMutation(`/admin/payouts/${id}/reject`, { reason });
```
Webapp (dashboard affiliation) : `POST /me/payouts` à brancher sur le bouton
« Demander un versement » (le montant saisi par le formateur).
