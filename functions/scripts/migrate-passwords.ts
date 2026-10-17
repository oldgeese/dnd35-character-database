import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { hashSha256Hex } from '../src/password.ts'
import { BATCH_SIZE, chunk, cliArgs, connect } from './cli.ts'

export type MigrateSummary = {
  total: number
  secretsCreated: number
  secretsExisting: number
  withoutPassword: number
  fieldsRemoved: number
}

const SHA256_HEX = /^[0-9a-f]{64}$/
const PASSWORD_FIELDS = ['password', 'passwordConfirm', 'passwordForUpdate']

export async function migratePasswords(
  db: Firestore,
  options: { dryRun: boolean; backupPath: string },
): Promise<MigrateSummary> {
  const characters = await db.collection('characters').get()
  const secretRefs = characters.docs.map((d) => db.collection('characterSecrets').doc(d.id))
  const secretSnaps = secretRefs.length > 0 ? await db.getAll(...secretRefs) : []
  const hasSecret = new Set(secretSnaps.filter((s) => s.exists).map((s) => s.id))

  const summary: MigrateSummary = { total: characters.size, secretsCreated: 0, secretsExisting: 0, withoutPassword: 0, fieldsRemoved: 0 }
  const toCreate: { id: string; sha: string }[] = []
  const toStrip: string[] = []
  const backup: { id: string; password: string | null }[] = []

  for (const doc of characters.docs) {
    const d = doc.data()
    const password = typeof d.password === 'string' ? d.password : null
    backup.push({ id: doc.id, password })
    if (password !== null && SHA256_HEX.test(password)) {
      if (hasSecret.has(doc.id)) summary.secretsExisting++
      else {
        summary.secretsCreated++
        toCreate.push({ id: doc.id, sha: password })
      }
    } else if (password === null && hasSecret.has(doc.id)) {
      // Created by the new function after deploy, before migration: no public password, secret already present.
      summary.secretsExisting++
    } else {
      summary.withoutPassword++
    }
    if (PASSWORD_FIELDS.some((f) => f in d)) {
      summary.fieldsRemoved++
      toStrip.push(doc.id)
    }
  }

  if (options.dryRun) return summary

  // Backup first, before any Firestore write.
  const backupPath = resolve(options.backupPath)
  mkdirSync(dirname(backupPath), { recursive: true })
  // 'wx': fail if the file exists, so a rerun can never replace the only copy of the legacy hashes.
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), { flag: 'wx', mode: 0o600 })

  // Secrets must exist before the public hash is removed.
  const secrets = await Promise.all(toCreate.map(async ({ id, sha }) => ({ id, secret: await hashSha256Hex(sha) })))
  for (const part of chunk(secrets, BATCH_SIZE)) {
    const batch = db.batch()
    for (const { id, secret } of part) {
      batch.create(db.collection('characterSecrets').doc(id), { ...secret, updatedAt: FieldValue.serverTimestamp() })
    }
    await batch.commit()
  }
  for (const part of chunk(toStrip, BATCH_SIZE)) {
    const batch = db.batch()
    for (const id of part) {
      batch.update(db.collection('characters').doc(id), Object.fromEntries(PASSWORD_FIELDS.map((f) => [f, FieldValue.delete()])))
    }
    await batch.commit()
  }
  return summary
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      project: { type: 'string' },
      backup: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
    args: cliArgs(),
  })
  if (!values.project || !values.backup) {
    console.error('usage: migrate --project <id> --backup <path> [--dry-run]')
    process.exit(2)
  }
  const summary = await migratePasswords(connect(values.project), { dryRun: values['dry-run'], backupPath: values.backup })
  console.log(JSON.stringify(summary, null, 2))
}
