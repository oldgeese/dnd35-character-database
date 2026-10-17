import { readFileSync } from 'node:fs'
import { after, before, beforeEach, test } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, setLogLevel, updateDoc } from 'firebase/firestore'
import { FIRESTORE_HOST, FIRESTORE_PORT, PROJECT_ID, clearFirestore } from './helpers.ts'

// Denied writes are expected here; keep the SDK's PERMISSION_DENIED logs out of the output.
setLogLevel('silent')

let env: RulesTestEnvironment

before(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: FIRESTORE_HOST,
      port: FIRESTORE_PORT,
      rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'),
    },
  })
})

after(async () => {
  await env.cleanup()
})

beforeEach(async () => {
  await clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'characters/seeded'), { pcName: 'seeded' })
    await setDoc(doc(ctx.firestore(), 'characterSecrets/seeded'), { hash: 'h' })
  })
})

test('anyone can read characters', async () => {
  const anon = env.unauthenticatedContext().firestore()
  await assertSucceeds(getDoc(doc(anon, 'characters/c1')))
})

test('nobody can write characters', async () => {
  const anon = env.unauthenticatedContext().firestore()
  await assertFails(setDoc(doc(anon, 'characters/c1'), { pcName: 'x' }))
  await assertFails(updateDoc(doc(anon, 'characters/seeded'), { pcName: 'x' }))
  await assertFails(deleteDoc(doc(anon, 'characters/seeded')))
})

test('nobody can read or write characterSecrets', async () => {
  const anon = env.unauthenticatedContext().firestore()
  await assertFails(getDoc(doc(anon, 'characterSecrets/seeded')))
  await assertFails(setDoc(doc(anon, 'characterSecrets/c1'), { hash: 'x' }))
})

test('other collections are denied', async () => {
  const anon = env.unauthenticatedContext().firestore()
  await assertFails(getDoc(doc(anon, 'other/x')))
})
