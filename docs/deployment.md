# Deployment

## Environments

| Alias | Firebase project | URL | Deployed when |
|---|---|---|---|
| `dev` | `dnd35-character-database-dev` | https://dnd35-character-database-dev.web.app | A commit is pushed to `main` ([deploy-dev.yml](../.github/workflows/deploy-dev.yml)) |
| `prod` | `dnd35-character-database` | https://dnd35-character-database.web.app | A GitHub Release is published ([deploy-prod.yml](../.github/workflows/deploy-prod.yml)) |

Both deploy Hosting and Firestore (rules and indexes) with `firebase deploy --only hosting,firestore`. Realtime Database is not used by the app and is not deployed.

The app picks its Firebase project at build time: `pnpm run build:dev` or `pnpm run build:prod` sets `FIREBASE_ENV`, and `webpack.config.js` embeds it. A production build without a valid `FIREBASE_ENV` fails. The configs live in `src/firebaseConfig.ts`.

## Releasing to production

```
gh release create vX.Y.Z --generate-notes
```

Pre-releases are not deployed. Promoting a pre-release to a full release deploys it.

## Rolling back

Re-deploy an earlier release tag by running the workflow on that tag:

```
gh workflow run deploy-prod.yml --ref vX.Y.Z
```

The run uses the workflow file as it exists at that tag, so only tags created after this workflow was added can be re-deployed this way. Runs started on a branch (such as `main`) are rejected by the `production` environment.

## Manual deploy (dev only)

```
pnpm run build:dev
pnpm exec firebase deploy --project dev --only hosting,firestore
```

Production is deployed only from GitHub Actions.

## How CI authenticates

GitHub Actions uses Workload Identity Federation, so no key files are stored. Each Firebase project has:

- Workload Identity pool `github` with OIDC provider `github-actions`, accepting only tokens from `oldgeese/dnd35-character-database`
- Service account `github-deployer` with `roles/firebasehosting.admin`, `roles/firebaserules.admin`, `roles/datastore.indexAdmin` and `roles/serviceusage.serviceUsageConsumer`

Who may use each service account:

- dev: jobs running on `refs/heads/main`
- prod: jobs running in the GitHub environment `production`, which only accepts tags matching `v*`

GitHub Actions variables:

| Variable | Scope |
|---|---|
| `DEV_WIF_PROVIDER`, `DEV_DEPLOY_SA` | Repository |
| `PROD_WIF_PROVIDER`, `PROD_DEPLOY_SA` | Environment `production` |
