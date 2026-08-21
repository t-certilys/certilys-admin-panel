# Déploiement Dokploy DEV / PROD — Admin Panel

## Contrat de déploiement

| Champ | Valeur |
|---|---|
| Fichier | `docker-compose.yml` |
| Type Dokploy | Docker Compose |
| Service | `app` |
| Port interne | `3000` |
| Port hôte | aucun |
| Healthcheck | `GET /api/health` |
| Runtime | Next.js standalone, `node server.js` |

Le probe `/api/health` est autonome : contrairement à `/`, il ne vérifie pas
la session admin et ne dépend pas de la disponibilité immédiate du backend.

## Variables

```text
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
CERTILYS_BACKEND_URL
```

`CERTILYS_BACKEND_URL` est serveur uniquement et reste configurable au runtime.
Il doit viser l’API du même environnement. Aucune variable publique ni aucun
secret backend ne sont intégrés au bundle navigateur.

## DEV

1. Dans `CERTILYS DEV`, créer une application Docker Compose `admin`.
2. Sélectionner la branche DEV et `./docker-compose.yml`.
3. Activer **Isolated Deployments**.
4. Définir `CERTILYS_BACKEND_URL` vers l’API DEV.
5. Ajouter le domaine Admin DEV réel, service `app`, port `3000`.
6. Déployer et vérifier `/api/health`, la connexion et une requête admin.

## PROD

Créer la même application dans `CERTILYS PROD` avec la révision, le domaine et
l’API PROD. Les variables et cookies du backend doivent autoriser le domaine
Admin PROD, sans reprendre ceux de DEV.

## Build et validation

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
docker compose -p certilys-dev-admin config
docker compose -p certilys-dev-admin build
```

Le build multi-stage est défini directement dans `docker-compose.yml` avec
`dockerfile_inline`. Il conserve `output: "standalone"`, un runtime non-root
et `dumb-init`. Cette propriété requiert Docker Compose 2.17 ou une version
ultérieure ; aucun fichier `Dockerfile` séparé n’est nécessaire.

## Coexistence et test local

```bash
docker compose -p certilys-dev-admin up -d
docker compose -p certilys-prod-admin up -d
```

Le fichier `docker-compose.override.example.yml` publie localement
`3001:3000`. Le copier en `docker-compose.override.yml`, fichier ignoré par
Git et absent du VPS.

## Rollback

Redéployer le commit ou tag précédent depuis Dokploy, ou faire un revert Git.
Vérifier ensuite `/api/health`, la page de connexion, les cookies admin et un
appel au backend du même environnement.
