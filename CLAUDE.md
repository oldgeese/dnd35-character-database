## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for oldgeese/dnd35-character-database, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root, both created when first needed. See `docs/agents/domain.md`.

## Pull requests

エージェントが作成した PR に適用する。

- PR を作成したら、続けて `/code-review high <PR番号>` でその PR をレビューし、指摘をユーザーに報告する。
- 各指摘の扱いはユーザーが「直す」「直さない」「先送り」から決める。「直す」と言われた指摘だけを直し、PR に反映する。「先送り」と言われた指摘は Issue を作成する。
- レビューのたびに、レビューしたコミットの SHA と各指摘の判断結果を PR コメントに記録する。判断が出たら同じコメントを更新する。PR の作業を始めるときは、まずこのコメントを読む。
- PR に push されたら、同じコマンドで再度レビューして指摘を報告する。ループの終了後の push や、ユーザーが手元から行った push も対象にする。
- PR の作業を依頼されたら、`git range-diff origin/main..<記録した SHA> origin/main..HEAD` で未レビューの変更を調べ、あれば先にレビューする。出力の全コミットが `=` の push は内容が同じなので、再レビューしない。
- 再レビューが 3 回に達したら、次のレビューの前に続けるかどうかをユーザーに確認する。
- 再レビューの指摘は 3 つに分けて報告する。
  - **判断済み**: 「直さない」「先送り」と決まった指摘と同じもの。
  - **未修正**: 「直す」と言われたのに再度報告された指摘。
  - **新規**: それ以外。
- このループは、新規と未修正の指摘が 0 件になるか、そのすべてをユーザーが「直さない」「先送り」と決めた時点、またはユーザーが打ち切ると決めた時点で終える。
- マージは、ループが終わり、未レビューの変更がない状態（打ち切った場合はこの限りでない）で、ユーザーの明示的な了承を得てから行う。
