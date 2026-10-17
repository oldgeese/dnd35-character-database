import firebase from 'firebase/compat/app'
import 'firebase/compat/functions'
import { Character } from '../models'

export type SaveErrorKind = 'wrong-password' | 'not-editable' | 'other'

export class SaveError extends Error {
  kind: SaveErrorKind

  constructor(kind: SaveErrorKind) {
    super(kind)
    this.name = 'SaveError'
    this.kind = kind
    Object.setPrototypeOf(this, SaveError.prototype)
  }
}

// The Functions SDK reports codes as `functions/<code>`.
// Only the code is inspected; the server's message text is never used.
const toSaveError = (error: unknown): SaveError => {
  const code = (error as { code?: unknown } | null)?.code
  if (code === 'functions/permission-denied') return new SaveError('wrong-password')
  if (code === 'functions/failed-precondition') return new SaveError('not-editable')
  return new SaveError('other')
}

const callable = (name: string) =>
  firebase.app().functions('asia-northeast1').httpsCallable(name)

// The server strips the password fields and sets id/updateTime itself.
const toPayload = (character: Character) => JSON.parse(JSON.stringify(character))

export const createCharacter = async (character: Character, password: string): Promise<string> => {
  try {
    const result = await callable('createCharacter')({ character: toPayload(character), password })
    return (result.data as { id: string }).id
  } catch (error) {
    throw toSaveError(error)
  }
}

export const updateCharacter = async (id: string, character: Character, password: string): Promise<void> => {
  try {
    await callable('updateCharacter')({ id, character: toPayload(character), password })
  } catch (error) {
    throw toSaveError(error)
  }
}

export const duplicateCharacter = async (id: string, password: string): Promise<string> => {
  try {
    const result = await callable('duplicateCharacter')({ id, password })
    return (result.data as { id: string }).id
  } catch (error) {
    throw toSaveError(error)
  }
}
