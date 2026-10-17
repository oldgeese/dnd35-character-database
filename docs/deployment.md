# Deployment

## Environments

| Alias | Firebase project | URL | Deployed when |
|---|---|---|---|
| `dev` | `dnd35-character-database-dev` | https://dnd35-character-database-dev.web.app | A commit is pushed to `main` ([deploy-dev.yml](../.github/workflows/deploy-dev.yml)) |
| `prod` | `dnd35-character-database` | https://dnd35-character-database.web.app | A GitHub Release is published ([deploy-prod.yml](../.github/workflows/deploy-prod.yml)) |

Both deploy Hosting, Firestore (rules and indexes) and Cloud Functions (`functions/`, callable `createCharacter`, `updateCharacter` and `duplicateCharacter` in `asia-northeast1`, runtime `nodejs24`) with `firebase deploy --only hosting,firestore,functions`. Functions are built by the `predeploy` hook in `firebase.json`. Realtime Database is not used by the app and is not deployed.

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

## One-time setup before the first Functions deploy

Do this once per Firebase project (dev and prod) before its first Functions deploy. CI deploys are non-interactive, so if the Artifact Registry cleanup policy is missing, firebase-tools fails with "Functions successfully deployed but could not set up cleanup policy". Releases run firestore, functions, then hosting, so Hosting would never be released.

The deploy service account cannot enable APIs, but firebase-tools checks several of them during a Functions deploy (it fails with "Permissions denied enabling …"). Enable them first:

```
gcloud services enable cloudfunctions.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com eventarc.googleapis.com pubsub.googleapis.com storage.googleapis.com firebaseextensions.googleapis.com cloudbilling.googleapis.com --project <project-id>
```

Then set up the Artifact Registry cleanup policy:

```
gcloud artifacts repositories create gcf-artifacts --repository-format=docker --location=asia-northeast1 --project <project-id>
pnpm exec firebase functions:artifacts:setpolicy --project <alias> --location asia-northeast1 --force
```

`--force` only skips the command's own confirmation prompt; it is not added to the workflows. If the repository already exists, `gcloud` reports `ALREADY_EXISTS` and you can continue.

## Manual deploy (dev only)

```
pnpm run build:dev
pnpm exec firebase deploy --project dev --only hosting,firestore,functions
```

Production is deployed only from GitHub Actions.

## How CI authenticates

GitHub Actions uses Workload Identity Federation, so no key files are stored. Each Firebase project has:

- Workload Identity pool `github` with OIDC provider `github-actions`, accepting only tokens from `oldgeese/dnd35-character-database`
- Service account `github-deployer` with `roles/firebasehosting.admin`, `roles/firebaserules.admin`, `roles/datastore.indexAdmin` and `roles/serviceusage.serviceUsageConsumer`
- For deploying Functions, additionally: `roles/cloudfunctions.admin`, `roles/run.admin` and `roles/artifactregistry.admin` on the project, and `roles/iam.serviceAccountUser` on both the default compute service account (`<project-number>-compute@developer.gserviceaccount.com`) and the App Engine default service account (`<project-id>@appspot.gserviceaccount.com`). firebase-tools checks `iam.serviceAccounts.actAs` on the App Engine one before deploying.

Who may use each service account:

- dev: jobs running on `refs/heads/main`
- prod: jobs running in the GitHub environment `production`, which only accepts tags matching `v*`

GitHub Actions variables:

| Variable | Scope |
|---|---|
| `DEV_WIF_PROVIDER`, `DEV_DEPLOY_SA` | Repository |
| `PROD_WIF_PROVIDER`, `PROD_DEPLOY_SA` | Environment `production` |

## Tests

`pnpm test` runs the functions unit tests, builds functions, then runs the Firestore and Functions emulators (`firebase emulators:exec`). It needs Java, which `mise install` provides (temurin-21). The Firestore emulator jar (~136MB) is downloaded to `~/.cache/firebase/emulators` on first run. [test.yml](../.github/workflows/test.yml) runs it on pull requests and on pushes to `main`, caching that directory.

## Password migration

Order: deploy Functions, rules and client first, then run the migration immediately (until then, editing existing characters fails because the secrets do not exist yet). Do dev first, then prod.

Passwords moved from client-readable character documents to server-side storage. Existing data is migrated once per environment with a script that uses gcloud application default credentials against the real project (`gcloud auth application-default login`). Run it from the repo root; the script's working directory is `functions/`, so the backup path is relative to that. Keep backups under the git-ignored `tmp/` directory.

```
# Preview without writing
pnpm --filter dnd35-functions migrate -- --project <project-id> --backup ../tmp/<env>-passwords-backup.json --dry-run

# Migrate
pnpm --filter dnd35-functions migrate -- --project <project-id> --backup ../tmp/<env>-passwords-backup.json
```

The script refuses to overwrite an existing backup file. Keep the backup until rollback is no longer needed. Before starting the rollback, record the current time (UTC) as the rollback start time. To roll back the data:

```
pnpm --filter dnd35-functions restore -- --project <project-id> --backup ../tmp/<env>-passwords-backup.json
```

Characters created by the new function have no `password` field, so after a rollback the old client cannot edit them.

While rolled back to the pre-fix release, the old rules let clients read and write `characterSecrets` and `characters`. Before rolling forward again:

- Delete the `characterSecrets` documents of the characters whose `password` the restore wrote back (the IDs with a non-null `password` in the backup passed to restore). Their secrets may have been changed while rolled back.
- Re-run the migration from the restored hashes, with a new backup path (the script refuses to overwrite an existing backup). This recreates the deleted secrets.
- Keep the `characterSecrets` documents of the other characters (those created by the new function). Delete any whose `updatedAt` is later than the start of the rollback, since they may have been tampered with. Such a character cannot be edited until an operator resets it. This check is best-effort: while rolled back, clients can write `characterSecrets` with any `updatedAt` value, so a deliberate attacker can pass it. If tampering is suspected, also delete the `characterSecrets` of all characters created after the fix release (they then need an operator reset).
- Review `characters` for tampering.
