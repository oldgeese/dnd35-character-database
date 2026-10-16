# 開発環境の追加と GitHub Releases 経由の本番デプロイ 設計書

- 日付: 2026-10-16
- ステータス: レビュー待ち

## 背景と目的

現在は手元で `pnpm run deploy`（`firebase deploy`）を実行すると、そのまま本番の Firebase プロジェクト `dnd35-character-database` に反映される。確認用の環境がなく、誤操作でも本番に出てしまう。

これを次のように変える。

- 開発環境を追加し、`main` ブランチへの push で自動デプロイして `main` と同期させる。
- 本番へのデプロイは、GitHub Release の公開をきっかけに GitHub Actions からのみ行う。

## 決定事項

| 項目 | 決定 |
|---|---|
| 開発環境 | 別の Firebase プロジェクト `dnd35-character-database-dev` を作る（データとルールを本番から分離） |
| 開発環境の利用者 | 自分の確認用のみ |
| リリースの作り方 | 手動（GitHub の画面か `gh release create vX.Y.Z`） |
| CI の認証 | Workload Identity Federation（鍵ファイルを使わない） |
| 接続先の切り替え | ビルド時に環境ごとの設定を埋め込む（webpack `DefinePlugin`） |
| デプロイ対象 | Hosting と Firestore（ルール、インデックス）。Realtime Database はアプリで使っていないため対象外 |

## 1. 環境と接続設定

### Firebase プロジェクト

| 別名 | プロジェクト ID | 用途 |
|---|---|---|
| `dev` | `dnd35-character-database-dev`（新規） | 開発環境。`main` と同期 |
| `prod` | `dnd35-character-database`（既存） | 本番環境。リリースのみ |

- dev プロジェクトでは Firestore と Hosting を、本番と同じリージョンで有効にする。
- dev プロジェクトでは Google Analytics を有効にしない。

### `.firebaserc`

```json
{
  "projects": {
    "default": "dnd35-character-database-dev",
    "dev": "dnd35-character-database-dev",
    "prod": "dnd35-character-database"
  }
}
```

デフォルトを `dev` にして、手元で `firebase deploy` を実行しても本番に出ないようにする。

### `src/firebaseConfig.ts`（新規）

- dev 用と prod 用の Firebase Web 設定をそれぞれ持つ。
  - Web 用の設定はブラウザに配られる公開情報なので、リポジトリに置いてよい。
- ビルド時に埋め込まれる `process.env.FIREBASE_ENV`（`'dev'` または `'prod'`）で、どちらを使うか選んで export する。
- `src/index.tsx` に直接書かれている `firebaseConfig` は、このファイルを読む形に置き換える。
- `firebase.analytics()` は `prod` のときだけ呼ぶ（dev プロジェクトには Analytics の設定がないため）。
- エミュレータへの接続（`localhost` のとき Firestore を 8081 番に向ける処理）は今のまま残す。

### `webpack.config.js`

- `DefinePlugin` で `process.env.FIREBASE_ENV` を埋め込む。
- 値は環境変数 `FIREBASE_ENV` から取る。
  - `NODE_ENV=production` のときに `FIREBASE_ENV` が `dev` でも `prod` でもなければ、エラーを投げてビルドを失敗させる。
  - `NODE_ENV=development`（`pnpm start`）で未指定のときは `dev` にする。

### `package.json` のスクリプト

| スクリプト | 内容 |
|---|---|
| `build:dev` | `env NODE_ENV=production FIREBASE_ENV=dev webpack` |
| `build:prod` | `env NODE_ENV=production FIREBASE_ENV=prod webpack` |
| `build` | 削除（`build:dev` と `build:prod` に置き換える） |
| `deploy` | 削除（本番へのデプロイは CI からのみ） |
| `start`, `lint`, `emu` | 変更なし |

今の `build` は先頭で `pnpm install` を実行しているが、CI では別の手順でインストールするので、新しいスクリプトには含めない。

## 2. GitHub Actions のワークフロー

### 共通の手順

1. `actions/checkout`
2. `jdx/mise-action`：`mise.toml` に書いた Node と pnpm を入れる
3. `pnpm install --frozen-lockfile`
4. ビルド（`pnpm run build:dev` または `pnpm run build:prod`）
5. `google-github-actions/auth`：Workload Identity Federation で認証する
6. `pnpm exec firebase deploy --project <別名> --only hosting,firestore --non-interactive`

ジョブには `permissions: { contents: read, id-token: write }` を付ける。`id-token: write` は、Workload Identity Federation 用の一時的な証明書（OIDC トークン）を発行するのに必要。

### `.github/workflows/deploy-dev.yml`

- きっかけ：`push`（`branches: [main]`）と `workflow_dispatch`
- ビルド：`build:dev`、デプロイ先：`dev`
- `concurrency: { group: deploy-dev, cancel-in-progress: false }`
- 認証に使う値：Variables の `DEV_WIF_PROVIDER`、`DEV_DEPLOY_SA`

### `.github/workflows/deploy-prod.yml`

- きっかけ：
  - `release: { types: [published] }`
  - `workflow_dispatch`（入力 `tag`：デプロイするタグ。切り戻しや再デプロイに使う）
- `release` のときは、プレリリースならジョブを飛ばす（`if: github.event_name == 'workflow_dispatch' || !github.event.release.prerelease`）。
- チェックアウトするのは、`release` のときは `github.event.release.tag_name`、`workflow_dispatch` のときは入力した `tag`。
- ビルド：`build:prod`、デプロイ先：`prod`
- `environment: production`
- `concurrency: { group: deploy-prod, cancel-in-progress: false }`
- 認証に使う値：`production` 環境の Variables の `PROD_WIF_PROVIDER`、`PROD_DEPLOY_SA`

### 品質チェック

lint は既存のエラーが141件あるため、CI には入れない。ビルドが通ることを最低限のチェックとする。

## 3. GCP と GitHub の設定

### それぞれのプロジェクト（dev と prod）で作るもの

- **Workload Identity プール**：`github`
- **OIDC プロバイダ**：`github-actions`
  - 発行元：`https://token.actions.githubusercontent.com`
  - 属性の対応：`google.subject=assertion.sub`、`attribute.repository=assertion.repository`、`attribute.ref=assertion.ref`、`attribute.environment=assertion.environment`
  - 受け付ける条件：`assertion.repository == 'oldgeese/dnd35-character-database'`
- **サービスアカウント**：`github-deployer@<プロジェクトID>.iam.gserviceaccount.com`
  - 付ける権限：
    - `roles/firebasehosting.admin`
    - `roles/firebaserules.admin`
    - `roles/datastore.indexAdmin`
    - `roles/serviceusage.serviceUsageConsumer`
  - 権限が足りない場合は、dev で試して追加し、この設計書に反映する。
- **サービスアカウントを使えるジョブ**（`roles/iam.workloadIdentityUser` を付ける対象）：
  - dev：`principal://iam.googleapis.com/projects/<プロジェクト番号>/locations/global/workloadIdentityPools/github/subject/repo:oldgeese/dnd35-character-database:ref:refs/heads/main`
  - prod：`principal://iam.googleapis.com/projects/<プロジェクト番号>/locations/global/workloadIdentityPools/github/subject/repo:oldgeese/dnd35-character-database:environment:production`
  - `<プロジェクト番号>` は数字の ID で、セットアップ時に `gcloud projects describe` で取得する。

prod は `production` 環境で動くジョブにしか権限を与えない。そのため、dev 用のワークフローを書き換えても本番には出せない。

### GitHub 側で作るもの

- Environment `production`
  - デプロイできる参照を、タグ `v*` だけに制限する。
  - Variables：`PROD_WIF_PROVIDER`、`PROD_DEPLOY_SA`
- リポジトリの Variables：`DEV_WIF_PROVIDER`、`DEV_DEPLOY_SA`

プロバイダ名とサービスアカウントのメールアドレスは秘密情報ではないので、Secrets ではなく Variables に置く。

### セットアップの進め方

dev プロジェクトの作成、`gcloud` での設定、GitHub の設定は、どれもリポジトリの持ち主の認証が必要になる。順番に実行していく対話式のスクリプトを用意し、持ち主が実行する。このスクリプトは一度きりのものなので、リポジトリには入れない。

構成とリリース手順は `docs/deployment.md` にまとめ、リポジトリに残す。README からもリンクする。

## 4. 導入の手順と検証

### 導入の順番

1. **セットアップ**：対話式スクリプトで、dev プロジェクトの作成、Workload Identity Federation の設定、GitHub の Environment と Variables の登録を行う。
2. **PR**：コード、ワークフロー、`docs/deployment.md` を1本の PR にまとめる。マージ後に `deploy-dev` が動き、開発環境のサイトが表示されることを確認する。
3. **最初のリリース**：`v1.0.0` を作り（`package.json` のバージョンに合わせる）、`deploy-prod` が本番に反映されることを確認する。

### 失敗したとき

- ワークフローが失敗すると、GitHub からメールで通知が届く。
- Hosting は新しいバージョンへの切り替えが一度に行われるので、中途半端な状態で公開されることはない。
- 本番の切り戻しは、`deploy-prod` を手動で実行し、前のバージョンのタグを指定して行う。

### PR を出す前に確かめること

- `build:dev` と `build:prod` で、それぞれ正しい `projectId` がビルド結果に埋め込まれていること。
- `NODE_ENV=production` で `FIREBASE_ENV` を指定しなかったとき、ビルドが失敗すること。
- `pnpm start` が今までどおり動くこと（`dev` の設定とエミュレータを使う）。
- ワークフローのファイルが `actionlint` の検査を通ること。

## 今回はやらないこと

- 開発環境に初期データを入れること（Firestore は空の状態から始める）
- lint を CI で実行すること（既存のエラーを先に直す必要がある）
- Firestore のルールを厳しくすること（今のルールは `request.path != null` で、ほぼ誰でも読み書きできる。別の課題として扱う）
- Firebase SDK を v10 以降に上げること（別の課題として扱う）
