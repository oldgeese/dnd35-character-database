import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import type { Firestore } from 'firebase-admin/firestore'
import { BATCH_SIZE, chunk, cliArgs, connect } from './cli.ts'

export async function restorePasswords(db: Firestore, backupPath: string): Promise<{ restored: number }> {
  const rows = JSON.parse(readFileSync(resolve(backupPath), 'utf8')) as { id: string; password: string | null }[]
  const targets = rows.filter((r): r is { id: string; password: string } => r.password !== null)
  let restored = 0
  for (const part of chunk(targets, BATCH_SIZE)) {
    const batch = db.batch()
    for (const { id, password } of part) {
      batch.update(db.collection('characters').doc(id), { password })
    }
    await batch.commit()
    restored += part.length
  }
  return { restored }
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { project: { type: 'string' }, backup: { type: 'string' } },
    args: cliArgs(),
  })
  if (!values.project || !values.backup) {
    console.error('usage: restore --project <id> --backup <path>')
    process.exit(2)
  }
  console.log(JSON.stringify(await restorePasswords(connect(values.project), values.backup), null, 2))
}
