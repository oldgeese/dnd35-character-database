import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, test } from 'node:test'
import { sha256Hex, verifyPassword, type PasswordHash } from '../src/password.ts'
import { migratePasswords } from '../scripts/migrate-passwords.ts'
import { restorePasswords } from '../scripts/restore-passwords.ts'
import { adminDb, clearFirestore } from './helpers.ts'

const dir = mkdtempSync(join(tmpdir(), 'migrate-'))
const backupPath = join(dir, 'nested', 'backup.json')
const backupPath2 = join(dir, 'backup2.json')

const data = async (path: string) => (await adminDb().doc(path).get()).data()!
const exists = async (path: string) => (await adminDb().doc(path).get()).exists
const secretOf = async (id: string) => (await data(`characterSecrets/${id}`)) as PasswordHash

beforeEach(async () => {
  rmSync(dir, { recursive: true, force: true })
  await clearFirestore()
  const db = adminDb()
  await db.doc('characters/normal').set({ id: 'normal', pcName: 'n', password: sha256Hex('pw'), passwordConfirm: 'x' })
  await db.doc('characters/empty').set({ id: 'empty', password: sha256Hex('') })
  await db.doc('characters/none').set({ id: 'none', pcName: 'none' })
  await db.doc('characters/blank').set({ id: 'blank', password: '' })
  await db.doc('characters/mismatch').set({ id: 'other', password: sha256Hex('m') })
})

test('migrate wraps hashes, removes fields and writes a backup', async () => {
  const s = await migratePasswords(adminDb(), { dryRun: false, backupPath })
  assert.deepEqual(s, { total: 5, secretsCreated: 3, secretsExisting: 0, withoutPassword: 2, fieldsRemoved: 4 })
  assert.equal(await verifyPassword('pw', await secretOf('normal')), true)
  assert.equal(await verifyPassword('', await secretOf('empty')), true)
  assert.equal(await verifyPassword('m', await secretOf('mismatch')), true)
  assert.ok(!(await exists('characterSecrets/none')) && !(await exists('characterSecrets/blank')))
  const normal = await data('characters/normal')
  assert.ok(!('password' in normal) && !('passwordConfirm' in normal))
  assert.equal(normal.pcName, 'n')
  assert.deepEqual(
    JSON.parse(readFileSync(backupPath, 'utf8')).find((r: { id: string }) => r.id === 'normal'),
    { id: 'normal', password: sha256Hex('pw') },
  )
  assert.equal(statSync(backupPath).mode & 0o777, 0o600)
})

test('a document with a secret but no password counts as secretsExisting and keeps its secret', async () => {
  const db = adminDb()
  await clearFirestore()
  await db.doc('characters/normal').set({ id: 'normal', password: sha256Hex('pw') })
  await db.doc('characters/fresh').set({ id: 'fresh', pcName: 'f' })
  await db.doc('characterSecrets/fresh').set({ salt: 's', hash: 'h', scryptParams: { N: 1 }, marker: 'keep' })
  const before = await data('characterSecrets/fresh')
  const s = await migratePasswords(db, { dryRun: false, backupPath })
  assert.deepEqual(s, { total: 2, secretsCreated: 1, secretsExisting: 1, withoutPassword: 0, fieldsRemoved: 1 })
  assert.deepEqual(await data('characterSecrets/fresh'), before)
})

test('migrate is idempotent', async () => {
  await migratePasswords(adminDb(), { dryRun: false, backupPath })
  const before = await data('characterSecrets/normal')
  const s = await migratePasswords(adminDb(), { dryRun: false, backupPath: backupPath2 })
  assert.equal(s.secretsCreated, 0)
  assert.deepEqual(await data('characterSecrets/normal'), before)
})

test('migrate refuses to overwrite an existing backup and leaves it unchanged', async () => {
  await migratePasswords(adminDb(), { dryRun: false, backupPath })
  const before = readFileSync(backupPath, 'utf8')
  await assert.rejects(migratePasswords(adminDb(), { dryRun: false, backupPath }), { code: 'EEXIST' })
  assert.equal(readFileSync(backupPath, 'utf8'), before)
})

test('dry run writes nothing', async () => {
  const missing = join(dir, 'dry.json')
  const s = await migratePasswords(adminDb(), { dryRun: true, backupPath: missing })
  assert.equal(s.secretsCreated, 3)
  assert.ok(!(await exists('characterSecrets/normal')) && !existsSync(missing))
  assert.equal((await data('characters/normal')).password, sha256Hex('pw'))
})

test('restore puts passwords back', async () => {
  await migratePasswords(adminDb(), { dryRun: false, backupPath })
  assert.deepEqual(await restorePasswords(adminDb(), backupPath), { restored: 4 })
  assert.equal((await data('characters/normal')).password, sha256Hex('pw'))
  assert.equal((await data('characters/mismatch')).password, sha256Hex('m'))
  assert.equal((await data('characters/blank')).password, '')
  assert.ok(!('password' in (await data('characters/none'))))
})
