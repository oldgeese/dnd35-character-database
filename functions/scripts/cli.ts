import { getApps, applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

// FIRESTORE_EMULATOR_HOST set: emulator. Otherwise real project via application default credentials.
export const connect = (projectId: string): Firestore => {
  const app =
    getApps()[0] ??
    (process.env.FIRESTORE_EMULATOR_HOST
      ? initializeApp({ projectId })
      : initializeApp({ projectId, credential: applicationDefault() }))
  return getFirestore(app)
}

export const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export const BATCH_SIZE = 200

// pnpm forwards a literal leading `--` to the script; drop it so parseArgs sees the options.
export const cliArgs = (): string[] => {
  const args = process.argv.slice(2)
  return args[0] === '--' ? args.slice(1) : args
}
