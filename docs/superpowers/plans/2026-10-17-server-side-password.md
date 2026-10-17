# キャラクター編集パスワードのサーバー側照合 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** キャラクターの作成・編集を Cloud Functions 経由にしてパスワードをサーバーで照合し、ハッシュを非公開の scrypt に移す。既存のパスワードはそのまま使えるようにする。

**Architecture:** `functions/`(pnpm ワークスペースのパッケージ)に callable Functions `createCharacter` / `updateCharacter` を置き、照合用データは `characterSecrets/{id}` に Admin SDK だけで読み書きする。Firestore ルールでクライアントの書き込みと `characterSecrets` の読み取りを禁止する。既存の SHA-256 は移行スクリプトで `scrypt(sha256Hex)` に包み直す。

**Tech Stack:** Cloud Functions for Firebase(第2世代、`firebase-functions` 7、`firebase-admin` 14)、Node.js 24、TypeScript 5(functions のみ)、`node:test`、`@firebase/rules-unit-testing` 6、Firebase エミュレータ(Java 21)、Firebase JS SDK 13(compat)、pnpm 12、mise、GitHub Actions

**Spec:** `docs/superpowers/specs/2026-10-17-server-side-password-design.md`

> この計画と設計書は、advisory を公開するときに修正と一緒に公開する。それまでは advisory の一時的な非公開フォークにだけ置く。作業はフォークのクローン `/home/hiro/ghq/github.com/oldgeese/dnd35-character-database-ghsa-mmf6-9j7q-rhh3` で行い、`origin` が非公開フォークであることを push の前に毎回確かめる。公開リポジトリには push しない。

## Global Constraints

- Firebase プロジェクト:dev `dnd35-character-database-dev`、prod `dnd35-character-database`。エミュレータでは `demo-dnd35` を使う(`demo-` で始まる ID は実プロジェクトにつながらない)
- Functions:リージョン `asia-northeast1`、ランタイム `nodejs24`、名前 `createCharacter` と `updateCharacter`
- コレクション:`characters/{id}`(公開、読み取りのみ)、`characterSecrets/{id}`(クライアントは読み書き不可)
- ハッシュ:`scrypt(sha256Hex(password), salt)`。salt 16 バイト、`N=32768, r=8, p=1, keylen=32`、`maxmem` 64MB(`64 * 1024 * 1024`)。salt と hash は base64 で保存
- `characters` に保存しない項目:`password`、`passwordConfirm`、`passwordForUpdate`
- `id` はドキュメント ID、`updateTime` はサーバー時刻の ISO 文字列(`new Date().toISOString()`)。既存データの `updateTime` は全件 ISO 文字列で、型を変えると `orderBy('updateTime')` の並びが崩れる
- `character` の JSON サイズ上限:1,000,000 バイト未満
- エラーコードと文言:パスワード違い `permission-denied`「パスワードが誤っています。」、照合用データなし `failed-precondition`「このキャラクターは編集できません。」、入力不正 `invalid-argument`
- 空のパスワードは作成でも編集でも有効なパスワードとして扱う
- エミュレータのポート:Firestore 8081(既存)、Functions 5001
- 課金・API・IAM を変える操作(Task 0、Task 8、Task 9)は、実行の直前にユーザーの確認を取る

## Review Focus

1. **`updateTime` の型**:サーバーが Firestore の Timestamp で保存すると、既存の文字列と混ざって一覧の並びが崩れる。ISO 文字列で保存されること(Task 4 で検証)
2. **フォームの値に入っているパスワード項目**:クライアントはフォームの値をまるごと送るので、`password`、`passwordConfirm`、`passwordForUpdate` が `characters` に保存されてはいけない(Task 2、Task 4 で検証)
3. **`character.id` のすり替え**:`updateCharacter` の `character.id` に別のキャラクターの ID を入れても、書き込み先と保存される `id` はリクエストの `id` でなければならない(Task 4 で検証)
4. **パスワードが文字列でない**:`password` が `undefined` や数値なら `invalid-argument`。空文字は有効(Task 2 で検証)
5. **`id` 項目とドキュメント ID が食い違う既存データ**(prod に1件):移行もサーバーもドキュメント ID を正とする(Task 5 で検証)

---

### Task 0: クラウド側の準備(dev のみ)

コードの変更はない。課金と権限を変えるので、各手順の前にユーザーの確認を取る。prod の API と権限は Task 9 で行う。

**Files:** なし

- [ ] **Step 1: dev を Blaze にする**

請求先アカウント ID は `gcloud billing accounts list` で調べ、`<billing-account>` に入れる。

Run: `gcloud billing projects link dnd35-character-database-dev --billing-account=<billing-account>`
Expected: `billingEnabled: true`

- [ ] **Step 2: 予算アラートを作る**

`billingbudgets.googleapis.com` を prod プロジェクトで有効にし、quota project を prod にして作る。

Run: `gcloud services enable billingbudgets.googleapis.com --project dnd35-character-database && gcloud billing budgets create --billing-account=<billing-account> --display-name="dnd35 monthly" --budget-amount=5000JPY --filter-projects=projects/dnd35-character-database,projects/dnd35-character-database-dev --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 --threshold-rule=percent=1.0 --billing-project=dnd35-character-database`
Expected: 作成された予算が `gcloud billing budgets list --billing-account=<billing-account> --billing-project=dnd35-character-database` に出る

- [ ] **Step 3: dev で Functions 用の API を有効にする**

Run: `gcloud services enable cloudfunctions.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com eventarc.googleapis.com --project dnd35-character-database-dev`
Expected: 成功する

- [ ] **Step 4: dev のデプロイ用サービスアカウントに権限を足す**

`github-deployer@dnd35-character-database-dev.iam.gserviceaccount.com` に `roles/cloudfunctions.admin`、`roles/run.admin`、`roles/artifactregistry.admin` を付け、既定のコンピュート用サービスアカウント(`<プロジェクト番号>-compute@developer.gserviceaccount.com`)への `roles/iam.serviceAccountUser` を付ける。足りない権限は Task 8 の初回デプロイのエラーで分かるので、そこで足す。

Expected: `gcloud projects get-iam-policy dnd35-character-database-dev` に上の役割が出る

---

### Task 1: functions パッケージとハッシュ処理

**Files:**
- Create: `functions/package.json`、`functions/tsconfig.json`、`functions/.gitignore`(`lib/`)
- Create: `functions/src/password.ts`
- Test: `functions/src/password.test.ts`
- Modify: `pnpm-workspace.yaml`(`packages: ['.', 'functions']`)、`mise.toml`(`java = "temurin-21"`)、`package.json`(`test` スクリプト)

**Interfaces:**
- Produces:
  - `type ScryptParams = { N: number; r: number; p: number; keylen: number }`
  - `type PasswordHash = { salt: string; hash: string; scryptParams: ScryptParams }`
  - `const SCRYPT_PARAMS: ScryptParams`
  - `sha256Hex(text: string): string`
  - `hashSha256Hex(sha256HexValue: string): Promise<PasswordHash>`(既存ハッシュの包み直しに使う)
  - `hashPassword(password: string): Promise<PasswordHash>`(= `hashSha256Hex(sha256Hex(password))`)
  - `verifyPassword(password: string, stored: PasswordHash): Promise<boolean>`(`stored.scryptParams` で計算し、`crypto.timingSafeEqual` で比べる)

パッケージ名は `dnd35-functions`、`"type": "module"`、`"engines": { "node": "24" }`、`"main": "lib/index.js"`。依存は `firebase-functions@7`、`firebase-admin@14`。開発依存は `typescript@5`、`@firebase/rules-unit-testing@6`、`firebase@13`。Cloud Build は lockfile なしで `npm install` するので、依存は完全なバージョンで固定する。`tsconfig.json` は `module`/`moduleResolution: nodenext`、`rewriteRelativeImportExtensions: true`、`erasableSyntaxOnly: true`、`outDir: lib`、`rootDir: src`、`exclude` にテストファイル。テストは Node 24 の型除去で `.ts` を直接動かす。スクリプト:`build` = `tsc`、`test:unit` = `node --test src/**/*.test.ts`、`test:emu` = `node --test test/*.test.ts`。

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('SHA-256 of a known password', () => {
  assert.equal(sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
})
test('a wrapped legacy SHA-256 verifies with the original password', async () => {
  const stored = await hashSha256Hex(sha256Hex('secret'))
  assert.equal(await verifyPassword('secret', stored), true)
  assert.equal(await verifyPassword('Secret', stored), false)
})
test('empty password is a valid password', async () => {
  const stored = await hashPassword('')
  assert.equal(await verifyPassword('', stored), true)
  assert.equal(await verifyPassword(' ', stored), false)
})
test('non-ASCII password round-trips', async () => {
  assert.equal(await verifyPassword('パスワード🐉', await hashPassword('パスワード🐉')), true)
})
test('salt is random and params are stored', async () => {
  const a = await hashPassword('x'); const b = await hashPassword('x')
  assert.notEqual(a.salt, b.salt)
  assert.deepEqual(a.scryptParams, { N: 32768, r: 8, p: 1, keylen: 32 })
  assert.equal(Buffer.from(a.salt, 'base64').length, 16)
  assert.equal(Buffer.from(a.hash, 'base64').length, 32)
})
```

- [ ] **Step 2: 失敗を確かめる**

Run: `mise install && pnpm install && pnpm --filter dnd35-functions test:unit`
Expected: FAIL(`password.ts` がない)

- [ ] **Step 3: `functions/src/password.ts` を実装する**

`crypto.scrypt` を promisify し、`maxmem: 64 * 1024 * 1024` を渡す。

- [ ] **Step 4: 通ることを確かめる**

Run: `pnpm --filter dnd35-functions test:unit && pnpm --filter dnd35-functions build`
Expected: PASS、`functions/lib/password.js` ができる

- [ ] **Step 5: コミットする**

```bash
git add functions pnpm-workspace.yaml pnpm-lock.yaml mise.toml package.json
git commit -m "Add functions package with scrypt password hashing"
```

---

### Task 2: 入力の検証と保存用の整形

**Files:**
- Create: `functions/src/character.ts`
- Test: `functions/src/character.test.ts`

**Interfaces:**
- Consumes: なし
- Produces:
  - `type CharacterData = Record<string, unknown>`
  - `parseCreateRequest(data: unknown): { character: CharacterData; password: string }`
  - `parseUpdateRequest(data: unknown): { id: string; character: CharacterData; password: string }`
  - `toStoredCharacter(character: CharacterData, id: string, now: Date): CharacterData`(パスワード3項目を除き、`id` と `updateTime: now.toISOString()` を設定した新しいオブジェクトを返す)
  - 不正な入力では `HttpsError('invalid-argument', ...)` を投げる(`firebase-functions/https` の `HttpsError`)

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('toStoredCharacter drops password fields and sets id and updateTime', () => {
  const out = toStoredCharacter(
    { pcName: 'A', id: 'other', updateTime: 'x', password: 'h', passwordConfirm: 'p', passwordForUpdate: 'q' },
    'doc1', new Date('2026-10-17T00:00:00.000Z'))
  assert.deepEqual(out, { pcName: 'A', id: 'doc1', updateTime: '2026-10-17T00:00:00.000Z' })
})
test('parseCreateRequest accepts an empty password', () => {
  assert.equal(parseCreateRequest({ character: {}, password: '' }).password, '')
})
test('parseCreateRequest rejects a non-string password', () => {
  for (const password of [undefined, 1, null]) {
    assert.throws(() => parseCreateRequest({ character: {}, password }), { code: 'invalid-argument' })
  }
})
test('parse rejects a non-object or array character', () => {
  for (const character of [null, 'x', [], undefined]) {
    assert.throws(() => parseCreateRequest({ character, password: '' }), { code: 'invalid-argument' })
  }
})
test('parse rejects a character of 1,000,000 bytes or more', () => {
  const character = { notes: 'あ'.repeat(340_000) } // UTF-8 で約 1,020,000 バイト
  assert.throws(() => parseCreateRequest({ character, password: '' }), { code: 'invalid-argument' })
})
test('parseUpdateRequest requires a non-empty string id', () => {
  for (const id of ['', undefined, 3]) {
    assert.throws(() => parseUpdateRequest({ id, character: {}, password: '' }), { code: 'invalid-argument' })
  }
})
```

- [ ] **Step 2: 失敗を確かめる**

Run: `pnpm --filter dnd35-functions test:unit`
Expected: FAIL(`character.ts` がない)

- [ ] **Step 3: `functions/src/character.ts` を実装する**

サイズは `Buffer.byteLength(JSON.stringify(character))` で測る。

- [ ] **Step 4: 通ることを確かめる**

Run: `pnpm --filter dnd35-functions test:unit`
Expected: PASS

- [ ] **Step 5: コミットする**

```bash
git add functions/src/character.ts functions/src/character.test.ts
git commit -m "Validate and sanitize character save requests"
```

---

### Task 3: Firestore ルールとエミュレータでのテスト環境

**Files:**
- Modify: `firestore.rules`(設計書 3 章の全文に置き換える)
- Modify: `firebase.json`(`functions: { source: "functions", runtime: "nodejs24", predeploy: ["pnpm --filter dnd35-functions build"] }`、`emulators.functions.port: 5001`)
- Modify: `package.json`(`test` = `pnpm --filter dnd35-functions test:unit && pnpm --filter dnd35-functions build && firebase emulators:exec --only firestore,functions --project demo-dnd35 'pnpm --filter dnd35-functions test:emu'`)
- Create: `functions/test/helpers.ts`(エミュレータの接続先 `127.0.0.1:8081` / `:5001`、プロジェクト ID `demo-dnd35`、各テストの前に Firestore を空にする関数)
- Test: `functions/test/rules.test.ts`

**Interfaces:**
- Produces: `functions/test/helpers.ts` の `PROJECT_ID = 'demo-dnd35'`、`clearFirestore(): Promise<void>`(`@firebase/rules-unit-testing` の `clearFirestore` を使う)、`adminDb(): Firestore`(`firebase-admin` を `FIRESTORE_EMULATOR_HOST` 経由で使う)

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('anyone can read characters', async () => assertSucceeds(getDoc(doc(anon, 'characters/c1'))))
test('nobody can write characters', async () => {
  await assertFails(setDoc(doc(anon, 'characters/c1'), { pcName: 'x' }))
  await assertFails(updateDoc(doc(anon, 'characters/seeded'), { pcName: 'x' }))
  await assertFails(deleteDoc(doc(anon, 'characters/seeded')))
})
test('nobody can read or write characterSecrets', async () => {
  await assertFails(getDoc(doc(anon, 'characterSecrets/seeded')))
  await assertFails(setDoc(doc(anon, 'characterSecrets/c1'), { hash: 'x' }))
})
test('other collections are denied', async () => assertFails(getDoc(doc(anon, 'other/x'))))
```

`anon` は `initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules: readFileSync('../firestore.rules') } })` の `unauthenticatedContext().firestore()`。`seeded` は `withSecurityRulesDisabled` で事前に作る。

- [ ] **Step 2: 失敗を確かめる**

Run: `pnpm test`
Expected: FAIL(書き込みと `characterSecrets` の読み取りが今のルールで通ってしまう)

- [ ] **Step 3: `firestore.rules` を設計書の全文に置き換える**

- [ ] **Step 4: 通ることを確かめる**

Run: `pnpm test`
Expected: PASS(Functions のエミュレータは関数なしで起動する)

- [ ] **Step 5: コミットする**

```bash
git add firestore.rules firebase.json package.json functions/test
git commit -m "Deny client writes and secret reads in Firestore rules"
```

---

### Task 4: `createCharacter` と `updateCharacter`

**Files:**
- Create: `functions/src/index.ts`
- Test: `functions/test/functions.test.ts`

**Interfaces:**
- Consumes: Task 1 の `hashPassword`、`verifyPassword`、`PasswordHash`。Task 2 の `parseCreateRequest`、`parseUpdateRequest`、`toStoredCharacter`。Task 3 の `helpers.ts`
- Produces:
  - `createCharacter`:`onCall({ region: 'asia-northeast1' })`、入力 `{ character, password }`、出力 `{ id: string }`
  - `updateCharacter`:`onCall({ region: 'asia-northeast1' })`、入力 `{ id, character, password }`、出力 `{ id: string }`
  - `characterSecrets/{id}` のドキュメント:`PasswordHash` に `updatedAt`(Firestore の Timestamp)を加えたもの

`createCharacter` は `characters` の新しい ID を `db.collection('characters').doc()` で決め、キャラクターと照合用データを1つのバッチで書く。`updateCharacter` は照合用データがなければ `failed-precondition`、パスワードが違えば `permission-denied`(文言は Global Constraints の通り)を投げ、一致したら `characters/{id}` を `set` で上書きする。照合用データは書き換えない。

- [ ] **Step 1: 失敗するテストを書く**

クライアント SDK(`firebase/functions` の `httpsCallable`、`connectFunctionsEmulator(functions, '127.0.0.1', 5001)`、リージョン `asia-northeast1`)から呼ぶ。

```ts
test('create stores the character without password fields and a secret', async () => {
  const { data } = await create({ character: { pcName: 'A', password: 'x', passwordConfirm: 'x', id: 'spoof' }, password: 'pw' })
  const stored = (await adminDb().doc(`characters/${data.id}`).get()).data()!
  assert.equal(stored.id, data.id)
  assert.equal(typeof stored.updateTime, 'string')
  assert.ok(!('password' in stored) && !('passwordConfirm' in stored) && !('passwordForUpdate' in stored))
  assert.ok((await adminDb().doc(`characterSecrets/${data.id}`).get()).exists)
})
test('update succeeds with the right password and keeps the request id', async () => {
  const { data } = await create({ character: { pcName: 'A' }, password: 'pw' })
  await update({ id: data.id, character: { pcName: 'B', id: 'someone-else' }, password: 'pw' })
  const stored = (await adminDb().doc(`characters/${data.id}`).get()).data()!
  assert.equal(stored.pcName, 'B'); assert.equal(stored.id, data.id)
  assert.ok(!(await adminDb().doc('characters/someone-else').get()).exists)
})
test('update with a wrong password is permission-denied and changes nothing', async () => {
  const { data } = await create({ character: { pcName: 'A' }, password: 'pw' })
  await assert.rejects(update({ id: data.id, character: { pcName: 'B' }, password: 'nope' }),
    { code: 'functions/permission-denied', message: 'パスワードが誤っています。' })
  assert.equal((await adminDb().doc(`characters/${data.id}`).get()).data()!.pcName, 'A')
})
test('empty password works for create and update', async () => {
  const { data } = await create({ character: { pcName: 'A' }, password: '' })
  await update({ id: data.id, character: { pcName: 'B' }, password: '' })
})
test('update of a character without a secret is failed-precondition', async () => {
  await adminDb().doc('characters/legacy').set({ pcName: 'old', id: 'legacy' })
  await assert.rejects(update({ id: 'legacy', character: { pcName: 'B' }, password: '' }),
    { code: 'functions/failed-precondition', message: 'このキャラクターは編集できません。' })
})
test('invalid input is invalid-argument', async () => {
  await assert.rejects(create({ character: 'x', password: 'pw' }), { code: 'functions/invalid-argument' })
})
```

- [ ] **Step 2: 失敗を確かめる**

Run: `pnpm test`
Expected: FAIL(関数がない)

- [ ] **Step 3: `functions/src/index.ts` を実装する**

`initializeApp()` と `getFirestore()` は `firebase-admin` のモジュール形式で使う。現在時刻は `new Date()` を `toStoredCharacter` に渡す。

- [ ] **Step 4: 通ることを確かめる**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: コミットする**

```bash
git add functions/src/index.ts functions/test/functions.test.ts
git commit -m "Add createCharacter and updateCharacter callable functions"
```

---

### Task 5: 移行スクリプトと戻すスクリプト

**Files:**
- Create: `functions/scripts/migrate-passwords.ts`、`functions/scripts/restore-passwords.ts`
- Test: `functions/test/migrate.test.ts`
- Modify: `functions/package.json`(`migrate` = `node scripts/migrate-passwords.ts`、`restore` = `node scripts/restore-passwords.ts`)

**Interfaces:**
- Consumes: Task 1 の `hashSha256Hex`
- Produces:
  - `migratePasswords(db: Firestore, options: { dryRun: boolean; backupPath: string }): Promise<MigrateSummary>`
  - `type MigrateSummary = { total: number; secretsCreated: number; secretsExisting: number; withoutPassword: number; fieldsRemoved: number }`(`fieldsRemoved` は、パスワード3項目のどれかを持っていて削除したキャラクターの数)
  - `restorePasswords(db: Firestore, backupPath: string): Promise<{ restored: number }>`
  - バックアップの形式:`{ id: string; password: string | null }[]` の JSON(`id` はドキュメント ID)
  - CLI:`pnpm --filter dnd35-functions migrate -- --project <id> --backup <path> [--dry-run]`、`pnpm --filter dnd35-functions restore -- --project <id> --backup <path>`。`FIRESTORE_EMULATOR_HOST` があればエミュレータに、なければ gcloud のユーザー認証(ADC)で実プロジェクトにつなぐ

`password` が `/^[0-9a-f]{64}$/` に合うものだけ照合用データを作る。照合用データがすでにあれば作らない。パスワード3項目の削除は `FieldValue.delete()`。バックアップは書き込みの前に書く。`--dry-run` ではバックアップも書き込みもせず、件数だけ返す。

- [ ] **Step 1: 失敗するテストを書く**

事前データ:`normal`(`password: sha256Hex('pw')`)、`empty`(`password: sha256Hex('')`)、`none`(`password` なし)、`blank`(`password: ''`)、`mismatch`(ドキュメント ID `mismatch`、`id: 'other'`、`password: sha256Hex('m')`)。

```ts
test('migrate wraps hashes, removes fields and writes a backup', async () => {
  const s = await migratePasswords(adminDb(), { dryRun: false, backupPath })
  assert.deepEqual(s, { total: 5, secretsCreated: 3, secretsExisting: 0, withoutPassword: 2, fieldsRemoved: 4 })
  assert.equal(await verifyPassword('pw', secretOf('normal')), true)
  assert.equal(await verifyPassword('', secretOf('empty')), true)
  assert.equal(await verifyPassword('m', secretOf('mismatch')), true)
  assert.ok(!(await exists('characterSecrets/none')) && !(await exists('characterSecrets/blank')))
  assert.ok(!('password' in (await data('characters/normal'))))
  assert.deepEqual(JSON.parse(readFileSync(backupPath, 'utf8')).find((r) => r.id === 'normal'), { id: 'normal', password: sha256Hex('pw') })
})
test('migrate is idempotent', async () => {
  await migratePasswords(adminDb(), { dryRun: false, backupPath })
  const before = await data('characterSecrets/normal')
  const s = await migratePasswords(adminDb(), { dryRun: false, backupPath: backupPath2 })
  assert.equal(s.secretsCreated, 0)
  assert.deepEqual(await data('characterSecrets/normal'), before)
})
test('dry run writes nothing', async () => {
  const s = await migratePasswords(adminDb(), { dryRun: true, backupPath })
  assert.equal(s.secretsCreated, 3)
  assert.ok(!(await exists('characterSecrets/normal')) && !existsSync(backupPath))
})
test('restore puts passwords back', async () => {
  await migratePasswords(adminDb(), { dryRun: false, backupPath })
  assert.deepEqual(await restorePasswords(adminDb(), backupPath), { restored: 4 })
  assert.equal((await data('characters/normal')).password, sha256Hex('pw'))
})
```

`restored` は `password` が `null` でない行の数(`none` 以外の4件。`blank` は空文字を書き戻す)。`secretOf(id)`、`data(path)`、`exists(path)` は `adminDb()` を使う小さな関数としてテストファイル内に書く。

- [ ] **Step 2: 失敗を確かめる**

Run: `pnpm test`
Expected: FAIL

- [ ] **Step 3: 2つのスクリプトを実装する**

- [ ] **Step 4: 通ることを確かめる**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: コミットする**

```bash
git add functions/scripts functions/test/migrate.test.ts functions/package.json
git commit -m "Add password migration and restore scripts"
```

---

### Task 6: クライアントを Functions 経由に切り替える

**Files:**
- Create: `src/api/characters.ts`
- Modify: `src/index.tsx:123-132`(`localhost` のとき `firebase.app().functions('asia-northeast1').useEmulator('localhost', 5001)` も呼ぶ)
- Modify: `src/forms/NewCharForm.tsx`、`src/forms/EditCharForm.tsx`
- Modify: `package.json`(`jssha` を削除)

**Interfaces:**
- Consumes: Task 4 の関数名、入出力、エラーコード
- Produces:
  - `createCharacter(character: Character, password: string): Promise<string>`(新しい ID を返す)
  - `updateCharacter(id: string, character: Character, password: string): Promise<void>`
  - `class SaveError extends Error { kind: 'wrong-password' | 'not-editable' | 'other' }`(`functions/permission-denied` → `wrong-password`、`functions/failed-precondition` → `not-editable`、それ以外 → `other`)

`firebase/compat/functions` を import し、`firebase.app().functions('asia-northeast1').httpsCallable(name)` を使う。

フォーム:
- `NewCharForm`:`onSubmit` で `createCharacter(values, values.password)`。入力欄2つ、yup スキーマ、注意書きは変えない。
- `EditCharForm`:`validatePassword` を削除。`onSubmit` で `updateCharacter(id, values, values.passwordForUpdate)`。`wrong-password` は `setError('passwordForUpdate', { type: 'manual', message: 'パスワードが誤っています。' })`、`not-editable` は同じ欄に「このキャラクターは編集できません。」。
- 両方:`other` のとき、保存ボタンの上に `<Alert severity="error">保存に失敗しました。時間をおいてもう一度お試しください。</Alert>` を出す。成功時は今と同じく `document.location.href = '/'`。

このリポジトリのクライアントにはテストがないので、検証はビルドとエミュレータでの手動確認で行う。

- [ ] **Step 1: `src/api/characters.ts` を実装し、2つのフォームを書き換える**

- [ ] **Step 2: ビルドが通ることを確かめる**

Run: `pnpm install && npx tsc --noEmit -p . && pnpm build:dev && ! grep -q jssha public/bundle.js`
Expected: すべて成功

- [ ] **Step 3: エミュレータで動作を確かめる**

Run: `pnpm --filter dnd35-functions build && firebase emulators:start --only firestore,functions --project dnd35-character-database-dev` と `pnpm start` を並べて起動し、`http://localhost:8080` で次を確かめる。`pnpm start` のクライアントは dev のプロジェクト ID でエミュレータにつなぐので、エミュレータも dev の ID で起動する(`demo-dnd35` だと食い違って関数が見つからない)。
Expected:
- パスワード `pw` で新規作成 → 一覧に出る
- `pw` で編集・保存 → 反映される
- `xx` で保存 → パスワード欄に「パスワードが誤っています。」
- 空のパスワードで新規作成 → 空のパスワードで編集できる
- Functions のエミュレータを止めて保存 → 「保存に失敗しました。…」が出る

- [ ] **Step 4: コミットする**

```bash
git add src package.json pnpm-lock.yaml
git commit -m "Save characters through Cloud Functions"
```

---

### Task 7: CI とドキュメント

**Files:**
- Modify: `.github/workflows/deploy-dev.yml`、`.github/workflows/deploy-prod.yml`(`--only hosting,firestore,functions`)
- Create: `.github/workflows/test.yml`(`pull_request` と `main` への `push` で、`jdx/mise-action@v5` → `pnpm install --frozen-lockfile` → `pnpm test`)
- Modify: `docs/deployment.md`(Functions もデプロイすること、デプロイ用サービスアカウントの追加権限、移行・戻すスクリプトの使い方、`pnpm test` にエミュレータと Java が必要なこと)

- [ ] **Step 1: ワークフローとドキュメントを変更する**

- [ ] **Step 2: ワークフローの文法を確かめる**

Run: `pnpm dlx @action-validator/cli .github/workflows/test.yml && pnpm dlx @action-validator/cli .github/workflows/deploy-dev.yml && pnpm dlx @action-validator/cli .github/workflows/deploy-prod.yml`
Expected: エラーなし。実際の動作は main に取り込んだ後(Task 9)に確かめる

- [ ] **Step 3: コミットする**

```bash
git add .github docs/deployment.md
git commit -m "Deploy and test Cloud Functions in CI"
```

---

### Task 8: dev での確認(手動デプロイと移行)

Task 0 が終わっていること。dev の Firestore を書き換えるので、実行前に確認を取る。

**Files:** なし(`tmp/` にバックアップを出す)

- [ ] **Step 0: Artifact Registry のクリーンアップポリシーを設定する**

Functions の初回デプロイの前に、Artifact Registry のリポジトリとクリーンアップポリシーを用意する(プロジェクトごとに1回)。CI のデプロイは非対話なので、ポリシーがないと firebase-tools が "Functions successfully deployed but could not set up cleanup policy" で失敗し、後続の Hosting がリリースされない。`--force` はワークフローに足さず、ここで先に設定する。

Run: `gcloud artifacts repositories create gcf-artifacts --repository-format=docker --location=asia-northeast1 --project dnd35-character-database-dev`(すでにあれば `ALREADY_EXISTS` で、そのまま次へ)、続けて `pnpm exec firebase functions:artifacts:setpolicy --project dev --location asia-northeast1 --force`(`--force` はこのコマンド自身の確認を省くだけ)
Expected: 成功し、以降の非対話デプロイでクリーンアップポリシーのエラーが出ない

- [ ] **Step 1: dev にデプロイする**

Run: `pnpm build:dev && pnpm exec firebase deploy --project dev --only hosting,firestore,functions`、続けて CI と同じ `pnpm exec firebase deploy --project dev --only hosting,firestore,functions --non-interactive`
Expected: どちらも成功(`--non-interactive` で成功すれば、CI でクリーンアップポリシーのエラーが出ない証拠になる)。権限不足で失敗したら、エラーに出た役割をデプロイしたユーザーではなく Task 0 Step 4 のサービスアカウントにも足し、記録しておく(Task 9 で prod に同じものを付ける)

- [ ] **Step 2: dev のデータを移行する**

Run: `pnpm --filter dnd35-functions migrate -- --project dnd35-character-database-dev --backup ../tmp/dev-passwords-backup.json --dry-run`、続けて `--dry-run` なしで実行
Expected: `total: 2`、`secretsCreated: 2`、`withoutPassword: 0`、`fieldsRemoved: 2`

- [ ] **Step 3: 画面で確かめる**

https://dnd35-character-database-dev.web.app で次を確かめる。
- 既存の2件を、元のパスワードで編集できる
- 違うパスワードで「パスワードが誤っています。」
- 新規作成(パスワードあり、空のパスワード)
- ブラウザの開発者ツールで、一覧と表示の通信に `password` が含まれない
- Firestore REST API から `characters` への書き込みと `characterSecrets` の読み取りが拒否される(`curl` に `Authorization` なしで PATCH / GET)

---

### Task 9: 公開と prod への反映

ここからは公開の操作になる。各手順の前に確認を取る。手順 3〜5 は間を空けずに行う。

- [ ] **Step 1: prod の API と権限を準備する**

Task 0 Step 3、Step 4(と Task 8 Step 1 で足した役割)を `dnd35-character-database` に対して行う。さらに、初回の Functions デプロイの前に Task 8 Step 0 と同じ設定を prod に対して行う。

Run: `gcloud services enable cloudfunctions.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com eventarc.googleapis.com firebaseextensions.googleapis.com --project dnd35-character-database`
Expected: 成功する。`firebaseextensions.googleapis.com` は、初回の Functions デプロイで自動的に有効になるが、CI のデプロイ用サービスアカウントは API を有効にできない(Task 8 の dev デプロイで確認済み)ため、ここで先に有効にする。

Run: `gcloud artifacts repositories create gcf-artifacts --repository-format=docker --location=asia-northeast1 --project dnd35-character-database`(すでにあれば `ALREADY_EXISTS` で、そのまま次へ)、続けて `pnpm exec firebase functions:artifacts:setpolicy --project prod --location asia-northeast1 --force`
Expected: 成功。これがないと、Step 4 の CI(非対話)の初回デプロイがクリーンアップポリシーのエラーで失敗し、Hosting が出ない

- [ ] **Step 2: prod のデータを dry run で確かめる**

Run: `pnpm --filter dnd35-functions migrate -- --project dnd35-character-database --backup ../tmp/prod-passwords-backup.json --dry-run`
Expected: `total: 93`、`secretsCreated: 83`、`withoutPassword: 10`(2026-10-17 時点。増えていれば差を確認する)。`fieldsRemoved` の値を控えておく

- [ ] **Step 3: main に取り込む**

非公開フォークから GitHub の advisory 画面の「Merge pull request」で main に取り込む。dev のデプロイと `test.yml` が成功することを確かめる。

- [ ] **Step 4: prod にリリースする**

Run: `gh release create v1.1.0 --generate-notes`(修正前の最後のリリースタグを控えておく)
Expected: 「Deploy to prod」が成功する

- [ ] **Step 5: prod のデータを移行する**

Run: Step 2 のコマンドを `--dry-run` なしで実行
Expected: Step 2 の dry run と同じ件数(`secretsCreated: 83`、`withoutPassword: 10`、`fieldsRemoved` は控えた値)。バックアップ `tmp/prod-passwords-backup.json` ができる

- [ ] **Step 6: prod で確かめる**

Task 8 Step 3 と同じ確認を https://dnd35-character-database.web.app で行う(既存キャラクターの編集はユーザーが自分のパスワードで確かめる)。

- [ ] **Step 7: advisory を公開する**

確認が取れたら、advisory の「Publish advisory」で公開する。バックアップ `tmp/*-passwords-backup.json` は、戻す必要がなくなった時点で削除する。
