# 開発環境の追加と GitHub Releases 経由の本番デプロイ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 開発用 Firebase プロジェクトを追加し、`main` への push で開発環境へ、GitHub Release の公開で本番へ、GitHub Actions から自動デプロイする。

**Architecture:** ビルド時に `FIREBASE_ENV`（`dev` / `prod`）で Firebase の接続設定を選び、webpack の `DefinePlugin` で埋め込む。デプロイは2本のワークフローで行い、Workload Identity Federation で認証する。本番用のサービスアカウントは GitHub の `production` 環境のジョブにだけ使わせる。

**Tech Stack:** webpack 5、TypeScript 4.9、Firebase JS SDK v8、firebase-tools 15、pnpm 12、mise、GitHub Actions、`gcloud`

**Spec:** `docs/superpowers/specs/2026-10-16-dev-prod-deploy-design.md`

## Global Constraints

- 開発用プロジェクト ID：`dnd35-character-database-dev`。本番用プロジェクト ID：`dnd35-character-database`
- Firebase の別名：`dev`、`prod`。`.firebaserc` の `default` は `dnd35-character-database-dev`
- 環境変数：`FIREBASE_ENV` は `dev` か `prod` のどちらかだけ。大文字や前後の空白は受け付けない
- デプロイ対象：`--only hosting,firestore`（Realtime Database は対象外）
- Workload Identity：プール `github`、プロバイダ `github-actions`、サービスアカウント `github-deployer`
- サービスアカウントの権限：`roles/firebasehosting.admin`、`roles/firebaserules.admin`、`roles/datastore.indexAdmin`、`roles/serviceusage.serviceUsageConsumer`
- GitHub Variables：リポジトリに `DEV_WIF_PROVIDER`、`DEV_DEPLOY_SA`。`production` 環境に `PROD_WIF_PROVIDER`、`PROD_DEPLOY_SA`
- GitHub Environment：`production`。デプロイできる参照はタグ `v*` だけ
- Node と pnpm は `mise.toml` で固定（Node `24.21.0`、pnpm `12.13.0`）。CI も `jdx/mise-action` で同じバージョンを使う
- このリポジトリにはテストフレームワークがない。検証はビルド結果への `grep` とコマンドの終了コードで行う

## Review Focus

1. **`FIREBASE_ENV=PROD` のような大文字や打ち間違い**：本番用ビルドは失敗するべき。黙って `dev` 扱いにしてはいけない（Task 2 で検証）
2. **`NODE_ENV` 未指定で `webpack` を直接実行した場合**：`webpack.config.js` は `NODE_ENV` 未指定を `production` 扱いにしているので、`FIREBASE_ENV` がなければ失敗するべき（Task 2 で検証）
3. **`pnpm start` で何も指定しない場合**：今までどおり `dev` の設定とエミュレータで動くべき（Task 2 で検証）
4. **存在しないタグを指定して `deploy-prod` を手動実行した場合**：チェックアウトの段階で失敗し、デプロイまで進まないべき（Task 3 で、ステップの順番として確認）
5. **プレリリースを公開した場合**：本番にデプロイされないべき（Task 3 で、`if` 条件を確認）

---

### Task 1: GCP と GitHub のセットアップ（リポジトリの持ち主が実行）

**このタスクはエージェントが実行できない。** `mattpocock-skills:wizard` スキルで対話式の bash スクリプトを作り、持ち主に実行してもらう。スクリプトはスクラッチ領域に置き、リポジトリには入れない。

**Files:**
- Create（スクラッチ領域）：`setup-deploy.sh`

**Interfaces:**
- Produces（Task 2 と Task 3 が使う値。スクリプトの最後に表示させる）：
  - 開発用プロジェクトの Firebase Web 設定（`apiKey`、`authDomain`、`projectId`、`storageBucket`、`messagingSenderId`、`appId`）
  - 両プロジェクトのプロジェクト番号
  - `DEV_WIF_PROVIDER` / `PROD_WIF_PROVIDER`：`projects/<番号>/locations/global/workloadIdentityPools/github/providers/github-actions`
  - `DEV_DEPLOY_SA` / `PROD_DEPLOY_SA`：`github-deployer@<プロジェクトID>.iam.gserviceaccount.com`

- [ ] **Step 1: スクリプトを作る**

スクリプトが案内する手順：
1. `gcloud auth login`、`firebase login`、`gh auth status` で、各ツールにログインしているか確認する
2. `firebase projects:create dnd35-character-database-dev`。Analytics は有効にしない
3. 本番の Firestore のリージョンを `gcloud firestore databases describe --project dnd35-character-database` で調べ、同じリージョンで `gcloud firestore databases create --project dnd35-character-database-dev --location <リージョン>` を実行する
4. `firebase apps:create web dnd35-dev --project dnd35-character-database-dev` を実行し、続けて `firebase apps:sdkconfig web <appId>` で Web 設定を表示する
5. dev と prod それぞれで、Spec の「3. GCP と GitHub の設定」にある内容を作る：
   - 必要な API の有効化：`iam.googleapis.com`、`iamcredentials.googleapis.com`、`sts.googleapis.com`、`firebasehosting.googleapis.com`、`firebaserules.googleapis.com`、`firestore.googleapis.com`
   - Workload Identity プールとプロバイダ
   - サービスアカウントと権限
   - `roles/iam.workloadIdentityUser` の付与：dev は `ref:refs/heads/main`、prod は `environment:production` に対して
6. `gh api -X PUT repos/oldgeese/dnd35-character-database/environments/production` で `production` 環境を作る。デプロイできる参照は、`deployment_branch_policy: {protected_branches: false, custom_branch_policies: true}` にしてから、タグ `v*` のポリシーを追加して制限する
7. `gh variable set` で Variables を4つ登録する（`PROD_*` の2つは `--env production` を付ける）
8. Interfaces に書いた値を、まとめて表示する

- [ ] **Step 2: 持ち主がスクリプトを実行し、表示された値をエージェントに渡す**

確認：`gh variable list` で `DEV_*` の2つが出ること。`gh variable list --env production` で `PROD_*` の2つが出ること。

---

### Task 2: 環境ごとの Firebase 接続設定

**Files:**
- Create: `src/firebaseConfig.ts`
- Modify: `src/index.tsx:122-140`（`firebaseConfig` の定義と初期化の部分）
- Modify: `webpack.config.js`（`DefinePlugin` と `FIREBASE_ENV` の検査を追加）
- Modify: `package.json`（`scripts`）
- Modify: `.firebaserc`

**Interfaces:**
- Consumes: Task 1 で得た、開発用プロジェクトの Web 設定
- Produces:
  - `src/firebaseConfig.ts` の `export const firebaseEnv: 'dev' | 'prod'` と `export const firebaseConfig: { apiKey: string; authDomain: string; projectId: string; storageBucket: string; messagingSenderId: string; appId: string; databaseURL?: string; measurementId?: string }`
  - スクリプト `build:dev`、`build:prod`（Task 3 のワークフローが使う）

- [ ] **Step 1: 今の状態で、検証がまだ通らないことを確かめる**

Run: `env NODE_ENV=production webpack; echo "exit=$?"`（`mise exec -- pnpm exec` を付けて実行）
Expected: `exit=0`。つまり今は `FIREBASE_ENV` なしでもビルドが通ってしまう。Step 4 の後でこれが失敗するようになればよい。

- [ ] **Step 2: `webpack.config.js` に `FIREBASE_ENV` の検査と `DefinePlugin` を足す**

- 既存の `const env = process.env.NODE_ENV || 'production'` の後で、`FIREBASE_ENV` の値を決める：
  - 環境変数がそのまま `dev` か `prod` なら、その値を使う
  - 未指定で、`env === 'development'` なら `dev` にする
  - それ以外（未指定の本番用ビルド、`PROD` のような打ち間違いなど）なら、`FIREBASE_ENV must be "dev" or "prod" (got: <値>)` を含むエラーを投げる
- `plugins` に `new webpack.DefinePlugin({ 'process.env.FIREBASE_ENV': JSON.stringify(firebaseEnv) })` を足す

- [ ] **Step 3: `src/firebaseConfig.ts` を作り、`src/index.tsx` をそれに切り替える**

- `src/firebaseConfig.ts`：
  - 本番の設定は、今の `src/index.tsx:122-131` の値をそのまま移す
  - 開発用の設定は Task 1 の値を使う
  - `firebaseEnv` は `process.env.FIREBASE_ENV as 'dev' | 'prod'`
  - `firebaseConfig` は `process.env.FIREBASE_ENV === 'prod' ? <本番の設定> : <開発用の設定>` のように、`process.env.FIREBASE_ENV` と直接比べる三項演算子で選ぶ。`DefinePlugin` で比較が定数になるので、本番用ビルドの圧縮時に使わない方の設定が消える。オブジェクトのキーで引く書き方（`configs[firebaseEnv]`）だと両方の設定がバンドルに残り、Step 5 の `grep` による検証が通らない
- `src/index.tsx`：
  - `firebaseConfig` の定義を削除し、`import { firebaseConfig, firebaseEnv } from './firebaseConfig'` に置き換える
  - `firebase.analytics()` は `if (firebaseEnv === 'prod')` の中で呼ぶ
  - エミュレータへの接続処理はそのまま残す
- `process` の型が見つからずに TypeScript のエラーになる場合は、`src/` に `declare const process: { env: { FIREBASE_ENV: string } }` を書いた `.d.ts` を置く（`@types/node` を tsconfig に追加しない）

- [ ] **Step 4: `package.json` と `.firebaserc` を変える**

- `scripts`：
  - `build` を削除し、`build:dev`（`env NODE_ENV=production FIREBASE_ENV=dev webpack`）と `build:prod`（`env NODE_ENV=production FIREBASE_ENV=prod webpack`）を追加する
  - `deploy` を削除する
- `.firebaserc`：Spec の「`.firebaserc`」に書いた JSON にする

- [ ] **Step 5: 検証する**

すべて `mise exec -- pnpm ...` で実行する。

| コマンド | 期待する結果 |
|---|---|
| `pnpm run build:dev` | 終了コード 0。`grep -l dnd35-character-database-dev public/bundle.js public/*.vendor.js` で1件以上ヒットする。`grep -c "projectId:\"dnd35-character-database\"" public/bundle.js` が 0 |
| `pnpm run build:prod` | 終了コード 0。`grep -c "dnd35-character-database-dev" public/bundle.js` が 0 |
| `pnpm exec webpack` | 終了コードが 0 以外。出力に `FIREBASE_ENV must be "dev" or "prod"` を含む（Review Focus 2） |
| `env NODE_ENV=production FIREBASE_ENV=PROD pnpm exec webpack` | 終了コードが 0 以外。同じエラーを含む（Review Focus 1） |
| `pnpm start` を起動し、`curl -s localhost:8080/bundle.js` | 中身に `dnd35-character-database-dev` を含む。確認後、起動したプロセスを確実に止める。8080 番が空いていることを `ss -ltn` で確かめてから始める（Review Focus 3） |
| `pnpm lint` | エラー件数が 141 件のまま（増えていない） |

- [ ] **Step 6: Commit**

```bash
git add src/firebaseConfig.ts src/index.tsx webpack.config.js package.json .firebaserc
git commit -m "Select Firebase project per environment at build time"
```

---

### Task 3: デプロイ用ワークフロー

**Files:**
- Create: `.github/workflows/deploy-dev.yml`
- Create: `.github/workflows/deploy-prod.yml`

**Interfaces:**
- Consumes: Task 2 の `build:dev`、`build:prod`。Task 1 で登録した Variables と `production` 環境

- [ ] **Step 1: `deploy-dev.yml` を書く**

Spec の「2. GitHub Actions のワークフロー」の「共通の手順」と「`deploy-dev.yml`」のとおりに書く。
- `google-github-actions/auth` には `workload_identity_provider: ${{ vars.DEV_WIF_PROVIDER }}` と `service_account: ${{ vars.DEV_DEPLOY_SA }}` を渡す
- アクションはメジャーバージョンで指定する（例：`actions/checkout@v5`）。各アクションの最新メジャーバージョンを `gh release list -R <owner/repo> -L 1` で確認してから書く

- [ ] **Step 2: `deploy-prod.yml` を書く**

Spec の「`deploy-prod.yml`」のとおりに書く。
- `workflow_dispatch` の入力は `tag`（`required: true`、`type: string`）
- チェックアウトする参照は `${{ github.event_name == 'release' && github.event.release.tag_name || inputs.tag }}`
- ジョブの `if` は Spec に書いた条件をそのまま使う（Review Focus 5）
- チェックアウトを、インストール・ビルド・認証・デプロイより前に置く。存在しないタグならそこで失敗し、デプロイまで進まない（Review Focus 4）

- [ ] **Step 3: 検証する**

Run: `mise exec aqua:rhysd/actionlint -- actionlint .github/workflows/deploy-dev.yml .github/workflows/deploy-prod.yml`
Expected: 何も表示されず、終了コード 0

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy-dev.yml .github/workflows/deploy-prod.yml
git commit -m "Add GitHub Actions workflows for dev and prod deploys"
```

---

### Task 4: ドキュメント

**Files:**
- Create: `docs/deployment.md`
- Modify: `README.md`（`## Deploy` の節）

- [ ] **Step 1: `docs/deployment.md` を書く**

次の内容を書く：
- 2つの環境（表：別名、プロジェクト ID、URL、デプロイのきっかけ）
- リリースの手順：`gh release create vX.Y.Z --generate-notes`
- 切り戻しの手順：`gh workflow run deploy-prod.yml -f tag=vX.Y.Z`
- GCP と GitHub の構成の要点（Workload Identity のプール名、サービスアカウント、Variables、`production` 環境の制限）
- 手元からの手動デプロイは、`dev` に対してだけ行う（`pnpm run build:dev && pnpm exec firebase deploy --project dev --only hosting,firestore`）

- [ ] **Step 2: `README.md` の `## Deploy` の節を書き換える**

`pnpm run deploy` を削除する。代わりに「`main` に push すると開発環境へ、GitHub Release を公開すると本番へデプロイされる。詳しくは `docs/deployment.md`」と書いてリンクする。

- [ ] **Step 3: Commit**

```bash
git add docs/deployment.md README.md
git commit -m "Document dev/prod deployment flow"
```

---

### Task 5: 導入と動作確認（持ち主の承認が必要）

- [ ] **Step 1: PR を作る**：`feature/dev-prod-deploy` から `main` へ
- [ ] **Step 2: 持ち主がマージした後、`deploy-dev` の実行を見守る**

Run: `gh run watch $(gh run list --workflow deploy-dev.yml -L 1 --json databaseId -q '.[0].databaseId')`
Expected: 成功する。`curl -s https://dnd35-character-database-dev.web.app/` が 200 を返し、`bundle.js` に `dnd35-character-database-dev` を含む。

権限が足りずに失敗した場合は、エラーにあるロールをサービスアカウントに足して再実行する。足したロールは Spec と `docs/deployment.md` にも反映する。

- [ ] **Step 3: 持ち主の承認を得てから `v1.0.0` を作る**

Run: `gh release create v1.0.0 --generate-notes`
Expected: `deploy-prod` が成功する。`https://dnd35-character-database.web.app/` の `bundle.js` に `projectId:"dnd35-character-database"` を含み、`-dev` を含まない。
