import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/https'
import { parseCreateRequest, parseUpdateRequest, toStoredCharacter } from './character.ts'
import { hashPassword, verifyPassword, type PasswordHash } from './password.ts'

initializeApp()
const db = getFirestore()

const options = { region: 'asia-northeast1', maxInstances: 5 }

export const createCharacter = onCall(options, async (request) => {
  const { character, password } = parseCreateRequest(request.data)
  const characterRef = db.collection('characters').doc()
  const secret = await hashPassword(password)
  const batch = db.batch()
  batch.set(characterRef, toStoredCharacter(character, characterRef.id, new Date()))
  batch.set(db.collection('characterSecrets').doc(characterRef.id), {
    ...secret,
    updatedAt: FieldValue.serverTimestamp(),
  })
  await batch.commit()
  return { id: characterRef.id }
})

export const updateCharacter = onCall(options, async (request) => {
  const { id, character, password } = parseUpdateRequest(request.data)
  const secretSnap = await db.collection('characterSecrets').doc(id).get()
  if (!secretSnap.exists) throw new HttpsError('failed-precondition', 'このキャラクターは編集できません。')
  const { salt, hash, scryptParams } = secretSnap.data() as PasswordHash
  if (!(await verifyPassword(password, { salt, hash, scryptParams }))) {
    throw new HttpsError('permission-denied', 'パスワードが誤っています。')
  }
  await db.collection('characters').doc(id).set(toStoredCharacter(character, id, new Date()))
  return { id }
})
