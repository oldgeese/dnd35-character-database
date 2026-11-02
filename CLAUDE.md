## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for oldgeese/dnd35-character-database, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root, both created when first needed. See `docs/agents/domain.md`.

## Pull requests

- PR を作成したら、続けて `/code-review high <PR番号>` でその PR をレビューし、指摘をユーザーに報告する。
- 指摘のうちどれを直すかはユーザーが決める。直すよう言われた指摘だけを直し、PR に反映する。
- PR に変更を push したら、同じコマンドで再度レビューして指摘を報告する。ユーザーが過去の回に直さないと決めた指摘と同じものは、却下済みとして新規の指摘と分けて報告する。このループは、新規の指摘が 0 件になるか、新規の指摘すべてをユーザーが直さないと決めた時点で終える。
