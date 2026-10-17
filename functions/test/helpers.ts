import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

export const PROJECT_ID = 'demo-dnd35'
export const FIRESTORE_HOST = '127.0.0.1'
export const FIRESTORE_PORT = 8081
export const FUNCTIONS_HOST = '127.0.0.1'
export const FUNCTIONS_PORT = 5001

// Same endpoint as RulesTestEnvironment.clearFirestore(), usable without a test environment.
export const clearFirestore = async (): Promise<void> => {
  const url = `http://${FIRESTORE_HOST}:${FIRESTORE_PORT}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) throw new Error(`clearFirestore failed: ${res.status}`)
}

// Relies on FIRESTORE_EMULATOR_HOST, which `firebase emulators:exec` sets.
export const adminDb = (): Firestore => {
  const app = getApps()[0] ?? initializeApp({ projectId: PROJECT_ID })
  return getFirestore(app)
}
