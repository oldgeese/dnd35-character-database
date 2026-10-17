# キャラクター編集パスワードのサーバー側照合 設計書

- 日付: 2026-10-17
- ステータス: レビュー待ち
- 対応する advisory: GHSA-mmf6-9j7q-rhh3(非公開)

> この設計書は、advisory を公開するときに修正と一緒に公開する。それまでは advisory の一時的な非公開フォークにだけ置く。

## 背景と目的

キャラクターごとの編集パスワードが、保護として機能していない。

1. **照合がブラウザ側だけ**: `firestore.rules` は実質全許可(`request.path != null`)で、照合は `src/forms/EditCharForm.tsx` の `validatePassword` がクライアントで行うだけ。Firestore SDK や REST API から直接書けば、パスワードなしで任意のキャラクターを書き換え・削除できる。
2. **ハッシュを誰でも読める**: `password` が `characters` ドキュメントにあり、一覧(`ListChars.tsx`)と表示(`ViewCharForm.tsx`)がドキュメント全体を取得する。
3. **弱いハッシュ**: `NewCharForm.tsx` がソルトなしの SHA-256(HEX)を保存している。

次の状態にする。

- 書き込み(作成・編集)の可否をサーバーで判定する。
- パスワードのハッシュをクライアントから読めないようにする。
- 保存するハッシュをソルト付きの遅いハッシュにする。
- **既存キャラクターのパスワードがそのまま使える**(利用者に再設定を求めない)。

### 完了の条件

- クライアントから Firestore の `characters` へ直接書き込むと拒否される。
- クライアントが受け取るデータに、パスワードのハッシュが含まれない。
- 既存のキャラクターを、元のパスワードで編集できる。

## 決定事項

| 項目 | 決定 |
|---|---|
| 照合の場所 | Cloud Functions(callable)。Firestore ルールでクライアントの書き込みを禁止 |
| パスワードの仕組み | キャラクターごとのパスワードを維持する。ログイン機能は入れない |
| 閲覧 | 一覧と表示は今まで通り誰でも見られる |
| ハッシュ方式 | `scrypt(SHA-256(パスワード)のHEX, ソルト)` の1種類だけ |
| 空のパスワード | 新規作成でも今まで通り許す。空文字も同じ方式でハッシュにする |
| パスワードの項目がない既存キャラクター | 照合用データを作らない。今と同じく画面から編集できない |
| Functions の構成 | `functions/` ディレクトリ、TypeScript、Node.js 24、リージョン `asia-northeast1` |
| 課金 | dev と prod を Blaze プランにし、月 5,000 円の予算アラートを設定する |
| 作業場所 | advisory の一時的な非公開フォーク。公開と prod 反映は短時間でまとめて行う |
| テスト環境 | Firebase エミュレータ。Java を `mise.toml` に追加する |

## 現状のデータ(2026-10-17 時点、読み取りのみで確認)

| | prod | dev |
|---|---|---|
| キャラクター総数 | 93 | 2 |
| 通常のパスワード(SHA-256、64文字の HEX) | 66 | 2 |
| 空のパスワード(空文字の SHA-256 `e3b0c442…b855`) | 17 | 0 |
| `password` がない、または空文字 | 10 | 0 |

`password` がない、または空文字のキャラクターは、どんな入力のハッシュとも一致しないため、今は画面から編集できない。

## 1. データ

### `characters/{id}`(既存)

- キャラクターの中身だけを持つ。
- `password`、`passwordConfirm`、`passwordForUpdate` は持たない(移行で削除する)。
- 一覧と表示は、今まで通りクライアントが直接読む。

### `characterSecrets/{id}`(新設)

キャラクターと同じ ID を使う。

```ts
type CharacterSecret = {
  salt: string          // base64、16 バイトのランダム値
  hash: string          // base64、scrypt の出力 32 バイト
  scryptParams: { N: number; r: number; p: number; keylen: number }
  updatedAt: Timestamp
}
```

- クライアントからの読み書きは、Firestore ルールで全面的に禁止する。Functions(Admin SDK)だけが扱う。
- `scryptParams` を保存しておき、将来パラメータを変えても既存のハッシュを照合できるようにする。初期値は `N=32768, r=8, p=1, keylen=32`(1回 0.1 秒程度)。この設定では scrypt が約 32MB(`128 * N * r` バイト)使い、Node の既定の上限 `maxmem`(32MB)と同じになって失敗するおそれがあるので、`maxmem` に 64MB を指定する。

### ハッシュ方式

```
hash = scrypt(sha256Hex(password), salt, keylen, { N, r, p })
```

- 既存の SHA-256(HEX)は `sha256Hex(password)` そのものなので、そのまま scrypt に通せば移行できる。元のパスワードは要らない。
- 新規作成でも同じ計算をする。方式が1種類なので照合処理が分岐しない。
- 先に SHA-256 をかけても、総当たりへの強さは scrypt で決まる。
- 比較は `crypto.timingSafeEqual` を使う。

## 2. Functions

`functions/` に置く。TypeScript、Node.js 24、`firebase-functions` と `firebase-admin` を使う。リージョンは `asia-northeast1`。

### `createCharacter`

- 入力: `{ character: object, password: string }`
- 処理:
  1. 入力を検証する(後述)。
  2. `characters` の新しいドキュメント ID を決める。
  3. `character` から `id`、`updateTime`、`password`、`passwordConfirm`、`passwordForUpdate` を取り除き、`id` と `updateTime`(サーバー時刻)を設定する。
  4. `characters/{id}` と `characterSecrets/{id}` を1つのバッチで書く。
- 出力: `{ id }`

### `updateCharacter`

- 入力: `{ id: string, character: object, password: string }`
- 処理:
  1. 入力を検証する。
  2. `characterSecrets/{id}` を読む。なければ `failed-precondition`(このキャラクターは編集できない)。
  3. パスワードを照合する。違えば `permission-denied`。
  4. `createCharacter` の 3 と同じ整形をして、`characters/{id}` を上書きする(今の `set` と同じ挙動)。
- 出力: `{ id }`

### 入力の検証

- `character` がオブジェクトであること。`password` が文字列であること。`id` が空でない文字列であること。
- `character` を JSON にしたサイズが 1MB(Firestore のドキュメント上限)未満であること。
- 違反は `invalid-argument`。
- キャラクターの各項目は、今と同じくそのまま保存する。シートの項目が多く、細かく検証する手間に見合わないため。

### 総当たり対策

scrypt の計算コスト(1回 0.1 秒程度)で抑える。試行回数の制限と App Check は今回は入れない。

## 3. Firestore ルール

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /characters/{id} {
      allow read: if true;
      allow write: if false;
    }
    match /characterSecrets/{id} {
      allow read, write: if false;
    }
  }
}
```

- `characters` 以外のコレクションは、どこにもマッチしないので拒否される。
- Functions は Admin SDK を使うので、ルールの影響を受けない。

## 4. クライアント

- `NewCharForm.tsx`: 保存処理を `createCharacter` の呼び出しに変える。
  - 「パスワード」と「パスワード(確認用)」の2つの入力欄、一致を確かめる yup スキーマ、パスワード使い回しの注意書きは、今のまま変えない。
  - サーバーには「パスワード」の入力値をそのまま送る(ハッシュ化はサーバーで行う)。「パスワード(確認用)」は画面での一致確認にだけ使い、送らない。
- `EditCharForm.tsx` のパスワード入力欄(1つ)も今のまま変えない。
- `EditCharForm.tsx`: `validatePassword` を削除し、保存処理を `updateCharacter` の呼び出しに変える。
  - `permission-denied` は、今と同じくパスワード欄に「パスワードが誤っています。」と出す。
  - `failed-precondition` は、パスワード欄に「このキャラクターは編集できません。」と出す。
- それ以外の失敗は、保存ボタンの近くにエラーメッセージを出す(今は `console.error` だけで、画面に何も出ない)。
- Functions の呼び出しには `firebase/compat/functions` を使い、リージョン `asia-northeast1` を指定する。`localhost` ではエミュレータに接続する(Firestore と同じ条件)。
- `firebase.json` の `emulators` に Functions を追加し、`functions` のビルド設定(`source: functions`)を加える。
- jssha はクライアントで使わなくなるので、依存から外す。
- `Character` モデルの `password` などの項目は、フォームの入力用として残す。

## 5. 移行スクリプト

`functions/scripts/` に置き、手元から Admin SDK(gcloud のユーザー認証)で実行する。

### `migrate-passwords`

各キャラクターについて:

1. `password` が 64 文字の HEX なら、`characterSecrets/{id}` を作る。すでにあれば作らない。空のパスワード(空文字の SHA-256)もここに含まれ、空のパスワードで引き続き編集できる。
2. `characters/{id}` から `password`、`passwordConfirm`、`passwordForUpdate` を削除する。
3. `password` がない、または空文字なら、照合用データは作らず、2 だけ行う。

- 何度実行しても同じ結果になる。
- 実行前に、全キャラクターの `id` と `password` を JSON でローカルに保存する(バックアップ)。保存先は `tmp/`(git の対象外)。
- `--dry-run` で、書き込まずに件数だけ表示できるようにする。

### `restore-passwords`

バックアップの JSON から、`characters/{id}.password` を書き戻す。修正前の最後のリリースに戻すときに使う。`characterSecrets` は消さない(残っていても古いクライアントには影響しない)。

## 6. 手順

### 準備

1. dev を請求先アカウント `<billing-account>`(ID は `gcloud billing accounts list` で調べる)につなぎ、Blaze プランにする。
2. 予算 API を有効にし、dev と prod を対象に、月 5,000 円の予算アラート(しきい値 50%、90%、100%)を作る。予算アラートは通知だけで、課金は止まらない。
3. 両プロジェクトで、Functions に必要な API(Cloud Functions、Cloud Build、Artifact Registry、Cloud Run、Eventarc)を有効にする。
4. デプロイ用のサービスアカウント(dev と prod の両方)に、Functions のデプロイに必要な権限を足す。
5. `mise.toml` に Java を追加する。

1〜4 は課金と権限を変えるので、実行の直前にもう一度確認を取る。

### 非公開フォークでの開発

6. Functions、ルール、クライアント、移行スクリプト、テストを実装する。エミュレータでテストを通す。
7. デプロイ用ワークフローの `--only` に `functions` を加える。テスト用ワークフローを追加する。
8. dev へ手元から手動でデプロイし、dev のデータで移行スクリプトを実行する。画面で動作を確かめる。

### 公開と prod 反映(短時間でまとめて行う)

9. 非公開フォークの変更を main に取り込む。dev に自動でデプロイされる。
10. すぐにリリースを作り、prod に Functions、クライアント、ルールを同時にデプロイする。
11. デプロイ直後に、prod で移行スクリプトを実行する。
12. prod で動作を確かめてから、advisory を公開する。

### 移行中に起きること

- 10 と 11 の間(1〜2分)は、照合用データがまだないので、既存キャラクターの編集が失敗する。
- 古い画面を開いたままの利用者は、保存が拒否される。再読み込みすれば直る。
- 9 から 10 までの数分間は、修正の中身が公開された状態で、まだ直っていない。

### 元に戻す

1. ロールバックの開始時刻を UTC で記録する。
2. `gh workflow run deploy-prod.yml --ref <修正前の最後のリリースタグ>` で、ルールとクライアントを戻す。
3. `restore-passwords` で、`characters` の `password` を書き戻す。

Functions は残るが、古いクライアントは呼ばないので影響しない。

注意: 修正前のリリースに戻している間は、古いルールが有効なので、クライアントから `characterSecrets` と `characters` を読み書きできる。もう一度修正後のリリースに進める前に、次を行う。

- `restore-passwords` で `password` を書き戻したキャラクター(復元に使ったバックアップで `password` が null でない ID)の `characterSecrets` ドキュメントだけを削除する(戻している間に書き換えられた可能性があるため)。
- 復元したハッシュから、新しいバックアップパスを指定して移行を再実行し、削除した `characterSecrets` を作り直す。
- それ以外のキャラクター(新しい Functions で作ったもの。バックアップに `password` がない)の `characterSecrets` は残す。ただし `updatedAt` がロールバックの開始時刻より後のものは、改ざんされたおそれがあるとみなして削除する。削除したキャラクターは、運用者がリセットするまで編集できない。この判定はベストエフォートである。戻している間はクライアントが任意の `updatedAt` の値で `characterSecrets` を書けるため、意図的な攻撃者はこの値を偽装できる。改ざんが疑われる場合は、修正リリース後に作成されたキャラクターの `characterSecrets` もすべて削除する(運用者のリセットが必要になる)。
- `characters` が改ざんされていないか確かめる。

また、新しい Functions で作ったキャラクターには `password` 項目がないので、戻したあとは古いクライアントでは編集できない。

## 7. テスト

エミュレータ上で動かす。`firebase emulators:exec` で起動から終了までをまとめる。

| 対象 | 確かめること | 使うもの |
|---|---|---|
| ハッシュ処理 | 既存の SHA-256 を包み直したものが元のパスワードで通る。空のパスワード。違うパスワードは通らない | Node 標準のテスト機能(`node:test`) |
| Firestore ルール | `characters` は読めるが書けない。`characterSecrets` は読み書きできない | `@firebase/rules-unit-testing` |
| Functions | 作成と編集の成功と失敗。照合用データがない場合。`id` と `updateTime` がサーバーで決まる。`characters` にパスワードの項目が残らない | エミュレータ上の Functions をクライアント SDK から呼ぶ |
| 移行スクリプト | 3種類のデータ(通常、空のパスワード、項目がない)。2回実行しても同じ結果。バックアップの出力。`restore-passwords` で戻る | エミュレータの Firestore |

- main に取り込んだあとは、PR ごとにこれらを GitHub Actions で流す。非公開フォークでは Actions が動かないので、それまでは手元で流す。
- dev にデプロイしたあと、手で次を確かめる。
  - 新規作成(パスワードあり、空のパスワード)
  - 既存キャラクターの編集(移行したデータ)
  - 違うパスワードでのエラー表示

## 対象外

- ログイン機能(Firebase Authentication)
- 試行回数の制限、App Check
- パスワードの変更機能、キャラクターの削除機能
- `@mui/styles` の置き換え、MUI のメジャー更新
