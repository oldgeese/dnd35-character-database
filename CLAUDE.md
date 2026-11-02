## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for oldgeese/dnd35-character-database, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root, both created when first needed. See `docs/agents/domain.md`.

## Pull requests

- PR を作成したら、続けて `/code-review high <PR番号>` でその PR をレビューし、指摘をユーザーに報告する。
- 各指摘の扱いはユーザーが「直す」「直さない」「先送り」から決める。「直す」と言われた指摘だけを直し、PR に反映する。「先送り」と言われた指摘は Issue を作成する。
- PR に内容の変更が push されたら、同じコマンドで再度レビューして指摘を報告する。ループの終了後の push や、ユーザーが手元から行った push も対象にする。PR の作業を依頼されたら、最後にレビューしたコミットと PR の HEAD を比べ、未レビューの変更があれば先にレビューする。rebase、競合のない main の取り込み、typo やコメントだけの修正では再レビューしない。
- 再レビューの指摘は 3 つに分けて報告する。
  - **判断済み**: 「直さない」「先送り」と決まった指摘と同じもの。
  - **未修正**: 「直す」と言われたのに再度報告された指摘。
  - **新規**: それ以外。
- このループは、新規と未修正の指摘が 0 件になるか、そのすべてをユーザーが「直さない」「先送り」と決めた時点で終える。
- マージは、ループが終わり、未レビューの変更がない状態で、ユーザーの明示的な了承を得てから行う。
