import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { initializeApp } from 'firebase/app'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { FUNCTIONS_HOST, FUNCTIONS_PORT, PROJECT_ID, adminDb, clearFirestore } from './helpers.ts'

const app = initializeApp({ projectId: PROJECT_ID, apiKey: 'fake-api-key' })
const functions = getFunctions(app, 'asia-northeast1')
connectFunctionsEmulator(functions, FUNCTIONS_HOST, FUNCTIONS_PORT)

const create = (data: unknown) =>
  httpsCallable<unknown, { id: string }>(functions, 'createCharacter')(data)
const update = (data: unknown) =>
  httpsCallable<unknown, { id: string }>(functions, 'updateCharacter')(data)

beforeEach(async () => {
  await clearFirestore()
})

test('create stores the character without password fields and a secret', async () => {
  const { data } = await create({ character: { pcName: 'A', password: 'x', passwordConfirm: 'x', id: 'spoof' }, password: 'pw' })
  const stored = (await adminDb().doc(`characters/${data.id}`).get()).data()!
  assert.equal(stored.id, data.id)
  assert.notEqual(data.id, 'spoof')
  assert.equal(typeof stored.updateTime, 'string')
  assert.ok(!('password' in stored) && !('passwordConfirm' in stored) && !('passwordForUpdate' in stored))
  assert.ok((await adminDb().doc(`characterSecrets/${data.id}`).get()).exists)
})

test('update succeeds with the right password and keeps the request id', async () => {
  const { data } = await create({ character: { pcName: 'A' }, password: 'pw' })
  await update({ id: data.id, character: { pcName: 'B', id: 'someone-else' }, password: 'pw' })
  const stored = (await adminDb().doc(`characters/${data.id}`).get()).data()!
  assert.equal(stored.pcName, 'B')
  assert.equal(stored.id, data.id)
  assert.ok(!(await adminDb().doc('characters/someone-else').get()).exists)
})

test('update with a wrong password is permission-denied and changes nothing', async () => {
  const { data } = await create({ character: { pcName: 'A' }, password: 'pw' })
  await assert.rejects(update({ id: data.id, character: { pcName: 'B' }, password: 'nope' }),
    { code: 'functions/permission-denied', message: /^パスワードが誤っています。/ })
  assert.equal((await adminDb().doc(`characters/${data.id}`).get()).data()!.pcName, 'A')
})

test('empty password works for create and update', async () => {
  const { data } = await create({ character: { pcName: 'A' }, password: '' })
  await update({ id: data.id, character: { pcName: 'B' }, password: '' })
})

test('update of a character without a secret is failed-precondition', async () => {
  await adminDb().doc('characters/legacy').set({ pcName: 'old', id: 'legacy' })
  await assert.rejects(update({ id: 'legacy', character: { pcName: 'B' }, password: '' }),
    { code: 'functions/failed-precondition', message: /^このキャラクターは編集できません。/ })
  assert.equal((await adminDb().doc('characters/legacy').get()).data()!.pcName, 'old')
})

test('invalid input is invalid-argument', async () => {
  await assert.rejects(create({ character: 'x', password: 'pw' }), { code: 'functions/invalid-argument' })
})
